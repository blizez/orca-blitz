import { app, shell, BrowserWindow, Menu, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { registerBrowserHandlers } from "./ipc/browser-handlers";
import { registerCoreHandlers } from "./ipc/core-handlers";
import { registerOpenAIAuthHandlers } from "./ipc/openai-auth";
import { registerChatGPTHandlers } from "./ipc/chatgpt-handlers";
import { registerMessagingHandlers } from "./ipc/messaging-handlers";
import { registerMetaAuthHandlers } from "./ipc/meta-auth";
import { registerGmailAuthHandlers } from "./ipc/gmail-auth";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("maximize", () => {
    mainWindow?.webContents.send("window:maximized", true);
  });

  mainWindow.on("unmaximize", () => {
    mainWindow?.webContents.send("window:maximized", false);
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  mainWindow.webContents.session.setPermissionRequestHandler((_, permission, callback) => {
    const allowedPermissions = [
      "media",
      "geolocation",
      "notifications",
      "clipboard-read",
      "clipboard-sanitized-write",
    ];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.orcablitz.desktop");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  Menu.setApplicationMenu(null);

  registerCoreHandlers();
  registerMessagingHandlers();
  registerMetaAuthHandlers();
  registerGmailAuthHandlers();

  ipcMain.on("window:minimize", () => mainWindow?.minimize());
  ipcMain.on("window:maximize", () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on("window:close", () => mainWindow?.close());
  ipcMain.handle("window:isMaximized", () => mainWindow?.isMaximized() ?? false);

  createWindow();

  if (mainWindow) {
    registerBrowserHandlers(mainWindow);
    registerOpenAIAuthHandlers(mainWindow);
    registerChatGPTHandlers(mainWindow);
  }

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
