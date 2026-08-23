import { ipcMain, BrowserWindow } from "electron";
import { randomBytes, createHash } from "crypto";
import http from "http";
import { URL } from "url";

const CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
const REDIRECT_PORT = 1455;

function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

function generateState(): string {
  return randomBytes(16).toString("hex");
}

async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const redirectUri = `http://localhost:${REDIRECT_PORT}/auth/callback`;

  console.log("[OpenAI] Exchanging code for token...");
  const response = await fetch("https://auth.openai.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  });

  const data = await response.json();
  console.log("[OpenAI] Token response:", response.ok ? "OK" : data);

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }

  return data;
}

async function fetchAvailableModels(_accessToken: string) {
  return [];
}

export function registerOpenAIAuthHandlers(mainWindow: BrowserWindow) {
  let authServer: http.Server | null = null;

  ipcMain.handle("openai:start-auth", async () => {
    if (authServer) {
      authServer.close();
      authServer = null;
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    const redirectUri = `http://localhost:${REDIRECT_PORT}/auth/callback`;

    const authUrl = new URL("https://auth.openai.com/oauth/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", "openid profile email offline_access");
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("id_token_add_organizations", "true");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("codex_cli_simplified_flow", "true");
    authUrl.searchParams.set("originator", "opencode");

    return new Promise<void>((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        const url = new URL(req.url!, `http://localhost:${REDIRECT_PORT}`);

        if (url.pathname === "/auth/callback") {
          const code = url.searchParams.get("code");
          const returnedState = url.searchParams.get("state");

          if (returnedState !== state) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end("<h1>Invalid state</h1>");
            return;
          }

          if (code) {
            console.log("[OpenAI] Received auth code, exchanging for token...");
            try {
              const tokenData = await exchangeCodeForToken(code, codeVerifier);
              const accessToken = tokenData.access_token;
              console.log("[OpenAI] Got access token, length:", accessToken?.length);

              const { ipcMain: ipc } = require("electron");
              ipc.emit("chatgpt:set-token", null, accessToken);

              mainWindow.webContents.send("openai:auth-token", {
                accessToken,
                refreshToken: tokenData.refresh_token,
              });

              console.log("[OpenAI] Fetching models...");
              const models = await fetchAvailableModels(accessToken);
              console.log("[OpenAI] Got models:", models.length, models);
              mainWindow.webContents.send("openai:auth-models", models);

              res.writeHead(200, { "Content-Type": "text/html" });
              res.end(
                '<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0a0a0a;color:#fff;"><div style="text-align:center;"><h1>Connected!</h1><p style="color:#888;">You can close this window.</p></div></body></html>',
              );
            } catch (err) {
              mainWindow.webContents.send(
                "openai:auth-error",
                err instanceof Error ? err.message : "Token exchange failed",
              );
              res.writeHead(500, { "Content-Type": "text/html" });
              res.end("<h1>Authentication failed</h1>");
            } finally {
              server.close();
              authServer = null;
            }
          } else {
            const error = url.searchParams.get("error");
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`<h1>Failed: ${error || "No code"}</h1>`);
            mainWindow.webContents.send("openai:auth-error", error || "No code received");
            server.close();
            authServer = null;
          }
        }
      });

      authServer = server;

      server.listen(REDIRECT_PORT, () => {
        mainWindow.webContents.send("openai:auth-url", authUrl.toString());
        resolve();
      });

      server.on("error", (err) => {
        authServer = null;
        reject(err);
      });
    });
  });

  ipcMain.handle("openai:cancel-auth", () => {
    if (authServer) {
      authServer.close();
      authServer = null;
    }
  });
}
