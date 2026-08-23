import { BrowserWindow, ipcMain, safeStorage, shell } from "electron";
import { randomBytes } from "crypto";
import http from "http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { app } from "electron";
import type { ChannelSession } from "@orca-blitz/shared";
import { MessageRepository } from "../messaging/db/message-repository";

const REDIRECT_PORT = 1457;
const GMAIL_SCOPE =
  "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email";
const repository = new MessageRepository();

export function registerGmailAuthHandlers(): void {
  let server: http.Server | null = null;

  ipcMain.handle("integrations:gmail:getStatus", (_event, businessId: string) =>
    repository.getSession(businessId, "gmail"),
  );

  ipcMain.handle("integrations:gmail:start", async (event, businessId: string) => {
    const sender = BrowserWindow.fromWebContents(event.sender);
    const config = getConfig();
    if (!config) {
      const session = saveStatus(businessId, {
        status: "error",
        error: "google_credentials_missing",
      });
      sender?.webContents.send("integrations:status", session);
      return session;
    }
    server?.close();
    const state = randomBytes(24).toString("hex");
    const redirectUri = `http://localhost:${REDIRECT_PORT}/gmail/callback`;
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", config.clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", GMAIL_SCOPE);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    const session = saveStatus(businessId, { status: "connecting", error: undefined });
    sender?.webContents.send("integrations:status", session);

    await new Promise<void>((resolve, reject) => {
      server = http.createServer(async (request, response) => {
        const callback = new URL(request.url ?? "/", `http://localhost:${REDIRECT_PORT}`);
        if (callback.pathname !== "/gmail/callback") return;
        if (callback.searchParams.get("state") !== state) {
          response.writeHead(400);
          response.end("Invalid OAuth state");
          return;
        }
        const code = callback.searchParams.get("code");
        if (!code) {
          const error = callback.searchParams.get("error") ?? "No authorization code";
          const failed = saveStatus(businessId, { status: "error", error });
          sender?.webContents.send("integrations:status", failed);
          response.writeHead(400);
          response.end("Google authorization failed");
          server?.close();
          server = null;
          resolve();
          return;
        }
        try {
          const token = await exchangeCode(code, config, redirectUri);
          saveToken(businessId, token.access_token);
          const connected = saveStatus(businessId, { status: "connected", error: undefined });
          sender?.webContents.send("integrations:status", connected);
          response.writeHead(200, { "Content-Type": "text/html" });
          response.end("<h1>Gmail conectado</h1><p>Puedes cerrar esta ventana.</p>");
        } catch (error) {
          const failed = saveStatus(businessId, {
            status: "error",
            error: error instanceof Error ? error.message : "Google token exchange failed",
          });
          sender?.webContents.send("integrations:status", failed);
          response.writeHead(500);
          response.end("Google authorization failed");
        } finally {
          server?.close();
          server = null;
          resolve();
        }
      });
      server.listen(REDIRECT_PORT, () => {
        void shell.openExternal(authUrl.toString());
        resolve();
      });
      server.on("error", reject);
    });
    return session;
  });

  ipcMain.handle("integrations:gmail:disconnect", (_event, businessId: string) => {
    const path = tokenPath(businessId);
    if (existsSync(path)) writeFileSync(path, "", "utf8");
    return saveStatus(businessId, { status: "disconnected", error: undefined });
  });
}

function getConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.ORCA_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.ORCA_GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

async function exchangeCode(
  code: string,
  config: { clientId: string; clientSecret: string },
  redirectUri: string,
): Promise<{ access_token: string }> {
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await response.json()) as { access_token?: string; error_description?: string };
  if (!response.ok || !data.access_token)
    throw new Error(data.error_description ?? "Google token exchange failed");
  return data as { access_token: string };
}

function tokenPath(businessId: string): string {
  const directory = join(app.getPath("userData"), "messaging", businessId);
  mkdirSync(directory, { recursive: true });
  return join(directory, "gmail.token");
}

function saveToken(businessId: string, token: string): void {
  const value = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(token).toString("base64")
    : token;
  writeFileSync(tokenPath(businessId), value, "utf8");
}

function saveStatus(businessId: string, update: Partial<ChannelSession>): ChannelSession {
  const session: ChannelSession = {
    ...repository.getSession(businessId, "gmail"),
    ...update,
    businessId,
    channel: "gmail",
  };
  repository.saveSession(session);
  return session;
}

export function readGmailToken(businessId: string): string | null {
  const path = tokenPath(businessId);
  if (!existsSync(path)) return null;
  const value = readFileSync(path, "utf8");
  if (!value) return null;
  return safeStorage.isEncryptionAvailable()
    ? safeStorage.decryptString(Buffer.from(value, "base64"))
    : value;
}
