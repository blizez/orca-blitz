import { ipcMain, BrowserWindow } from "electron";
import { streamChatGPT, fetchChatGPTUser } from "./chatgpt-client";

const tokens = new Map<string, string>();

export function registerChatGPTHandlers(mainWindow: BrowserWindow) {
  ipcMain.on("chatgpt:set-token", (_event, accessToken: string) => {
    tokens.set("current", accessToken);
  });

  ipcMain.handle(
    "chatgpt:send",
    async (
      _event,
      model: string,
      messages: Array<{ role: "user" | "assistant"; content: string }>,
    ) => {
      const token = tokens.get("current");
      if (!token) throw new Error("Not authenticated with ChatGPT");

      let response = "";
      for await (const chunk of streamChatGPT(token, model, messages)) {
        response += chunk;
        mainWindow.webContents.send("chatgpt:stream", { chunk, done: false });
      }
      mainWindow.webContents.send("chatgpt:stream", { chunk: "", done: true });
      return response;
    },
  );

  ipcMain.handle(
    "chatgpt:stream",
    async (
      _event,
      model: string,
      messages: Array<{ role: "user" | "assistant"; content: string }>,
    ) => {
      const token = tokens.get("current");
      if (!token) throw new Error("Not authenticated with ChatGPT");

      for await (const chunk of streamChatGPT(token, model, messages)) {
        mainWindow.webContents.send("chatgpt:stream-chunk", chunk);
      }
      mainWindow.webContents.send("chatgpt:stream-chunk", null);
    },
  );

  ipcMain.handle("chatgpt:user", async () => {
    const token = tokens.get("current");
    if (!token) return null;
    return fetchChatGPTUser(token);
  });

  ipcMain.handle("chatgpt:has-token", () => {
    return tokens.has("current");
  });
}
