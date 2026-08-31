import { ipcMain, BrowserWindow, shell } from "electron";
import { randomBytes, createHash } from "crypto";
import http from "http";
import { URL } from "url";

interface OAuthProviderConfig {
  id: string;
  name: string;
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  scopes: string[];
  redirectPort: number;
}

const OAUTH_PROVIDERS: Record<string, OAuthProviderConfig> = {
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    authUrl: "https://console.anthropic.com/oauth/authorize",
    tokenUrl: "https://console.anthropic.com/oauth/token",
    clientId: "orca-blitz-anthropic",
    scopes: ["user:read"],
    redirectPort: 14551,
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    authUrl: "https://auth.openai.com/oauth/authorize",
    tokenUrl: "https://auth.openai.com/oauth/token",
    clientId: "app_EMoamEEZ73f0CkXaXp7hrann",
    scopes: ["openid profile email offline_access"],
    redirectPort: 1455,
  },
  github: {
    id: "github",
    name: "GitHub Copilot",
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    clientId: "Iv1.b507a08c87ecfe98", // GitHub Copilot CLI client ID
    scopes: ["read:user"],
    redirectPort: 14552,
  },
  google: {
    id: "google",
    name: "Google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: "orca-blitz-google",
    scopes: ["openid", "email", "profile"],
    redirectPort: 14553,
  },
  xai: {
    id: "xai",
    name: "xAI",
    authUrl: "https://console.x.ai/oauth/authorize",
    tokenUrl: "https://console.x.ai/oauth/token",
    clientId: "orca-blitz-xai",
    scopes: ["models.read"],
    redirectPort: 14554,
  },
};

function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

function generateState(): string {
  return randomBytes(16).toString("hex");
}

export function registerOAuthHandlers(mainWindow: BrowserWindow) {
  const authServers = new Map<string, http.Server>();

  ipcMain.handle("oauth:start", async (_e, providerId: string) => {
    const config = OAUTH_PROVIDERS[providerId];
    if (!config) {
      throw new Error(`Unknown OAuth provider: ${providerId}`);
    }

    // Close any existing server for this provider
    const existing = authServers.get(providerId);
    if (existing) {
      existing.close();
      authServers.delete(providerId);
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();
    const redirectUri = `http://localhost:${config.redirectPort}/auth/callback`;

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", config.clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", config.scopes.join(" "));
    authUrl.searchParams.set("state", state);

    if (providerId === "openai") {
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
      authUrl.searchParams.set("id_token_add_organizations", "true");
      authUrl.searchParams.set("codex_cli_simplified_flow", "true");
      authUrl.searchParams.set("originator", "orca-blitz");
    }

    return new Promise<void>((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        const url = new URL(req.url!, `http://localhost:${config.redirectPort}`);

        if (url.pathname === "/auth/callback") {
          const code = url.searchParams.get("code");
          const returnedState = url.searchParams.get("state");

          if (returnedState !== state) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end("<h1>Invalid state</h1>");
            return;
          }

          if (code) {
            try {
              const tokenData = await exchangeCode(config, code, codeVerifier, redirectUri);

              mainWindow.webContents.send("oauth:token", {
                providerId,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
              });

              res.writeHead(200, { "Content-Type": "text/html" });
              res.end(
                '<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0a0a0a;color:#fff;"><div style="text-align:center;"><h1>Connected!</h1><p style="color:#888;">You can close this window.</p></div></body></html>',
              );
            } catch (err) {
              mainWindow.webContents.send(
                "oauth:error",
                err instanceof Error ? err.message : "Token exchange failed",
              );
              res.writeHead(500, { "Content-Type": "text/html" });
              res.end("<h1>Authentication failed</h1>");
            } finally {
              server.close();
              authServers.delete(providerId);
            }
          } else {
            const error = url.searchParams.get("error");
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`<h1>Failed: ${error || "No code"}</h1>`);
            mainWindow.webContents.send("oauth:error", error || "No code received");
            server.close();
            authServers.delete(providerId);
          }
        }
      });

      authServers.set(providerId, server);

      server.listen(config.redirectPort, () => {
        shell.openExternal(authUrl.toString());
        resolve();
      });

      server.on("error", (err) => {
        authServers.delete(providerId);
        reject(err);
      });
    });
  });

  ipcMain.handle("oauth:cancel", (_e, providerId: string) => {
    const server = authServers.get(providerId);
    if (server) {
      server.close();
      authServers.delete(providerId);
    }
  });
}

async function exchangeCode(
  config: OAuthProviderConfig,
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<{ access_token: string; refresh_token?: string }> {
  const body: Record<string, string> = {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
  };

  if (config.id === "openai") {
    body.code_verifier = codeVerifier;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (config.id === "github") {
    headers.Accept = "application/json";
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers,
    body: new URLSearchParams(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }

  return data;
}
