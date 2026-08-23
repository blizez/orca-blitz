import { BrowserWindow, ipcMain } from "electron";
import { ChannelManager } from "../messaging/channel-manager";

function broadcast(channel: string, payload: unknown): void {
  for (const window of BrowserWindow.getAllWindows()) window.webContents.send(channel, payload);
}

const manager = new ChannelManager({
  onQR: (businessId, qr) => broadcast("integrations:qr", { businessId, qr }),
  onStatus: (session) => broadcast("integrations:status", session),
  onMessage: (message) => broadcast("integrations:message", message),
  onConversationsChanged: (businessId) =>
    broadcast("integrations:conversations-changed", { businessId }),
});

export function registerMessagingHandlers(): void {
  ipcMain.handle("integrations:connect", (_event, businessId: string) =>
    manager.connect(businessId),
  );
  ipcMain.handle(
    "integrations:instagram:login",
    (_event, businessId: string, username: string, password: string) =>
      manager.loginInstagram(businessId, username, password),
  );
  ipcMain.handle("integrations:instagram:disconnect", (_event, businessId: string) =>
    manager.disconnectInstagram(businessId),
  );
  ipcMain.handle(
    "integrations:messenger:login",
    (_event, businessId: string, email: string, password: string) =>
      manager.loginMessenger(businessId, email, password),
  );
  ipcMain.handle("integrations:messenger:disconnect", (_event, businessId: string) =>
    manager.disconnectMessenger(businessId),
  );
  ipcMain.handle("integrations:telegram:connect", (_event, businessId: string) =>
    manager.connectTelegram(businessId),
  );
  ipcMain.handle("integrations:telegram:start-login", (_event, businessId: string, phone: string) =>
    manager.startTelegramLogin(businessId, phone),
  );
  ipcMain.handle("integrations:telegram:submit-code", (_event, businessId: string, code: string) =>
    manager.submitTelegramCode(businessId, code),
  );
  ipcMain.handle(
    "integrations:telegram:submit-password",
    (_event, businessId: string, password: string) =>
      manager.submitTelegramPassword(businessId, password),
  );
  ipcMain.handle("integrations:telegram:disconnect", (_event, businessId: string) =>
    manager.disconnectTelegram(businessId),
  );
  ipcMain.handle("integrations:disconnect", (_event, businessId: string) =>
    manager.disconnect(businessId),
  );
  ipcMain.handle(
    "integrations:getStatus",
    (_event, businessId: string, channel: "whatsapp" | "telegram" = "whatsapp") =>
      manager.status(businessId, channel),
  );
  ipcMain.handle(
    "integrations:listConversations",
    (_event, businessId: string, channel: "whatsapp" | "telegram" = "whatsapp") =>
      manager.conversations(businessId, channel),
  );
  ipcMain.handle(
    "integrations:listMessages",
    (_event, businessId: string, jid: string, channel: "whatsapp" | "telegram" = "whatsapp") =>
      manager.messages(businessId, jid, channel),
  );
  ipcMain.handle(
    "integrations:markRead",
    (_event, businessId: string, jid: string, channel: "whatsapp" | "telegram" = "whatsapp") =>
      manager.markRead(businessId, jid, channel),
  );
  ipcMain.handle(
    "integrations:sendMessage",
    (
      _event,
      businessId: string,
      jid: string,
      text: string,
      channel: "whatsapp" | "telegram" = "whatsapp",
    ) => manager.sendText(businessId, jid, text, channel),
  );
}
