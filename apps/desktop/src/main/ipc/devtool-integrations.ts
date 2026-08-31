import { BrowserWindow, ipcMain } from "electron";
import type { DevToolIntegration, DevToolSession } from "@orca-blitz/shared";

const sessions = new Map<string, DevToolSession>();

function broadcast(channel: string, payload: unknown): void {
  for (const window of BrowserWindow.getAllWindows()) window.webContents.send(channel, payload);
}

function getSession(integrationId: DevToolIntegration): DevToolSession {
  return sessions.get(integrationId) ?? { integrationId, status: "disconnected" };
}

function setSession(
  integrationId: DevToolIntegration,
  patch: Partial<DevToolSession>,
): DevToolSession {
  const next = { ...getSession(integrationId), ...patch, integrationId };
  sessions.set(integrationId, next);
  broadcast("devtools:status", next);
  return next;
}

export function registerDevToolHandlers(): void {
  ipcMain.handle("devtools:getStatus", (_event, integrationId: DevToolIntegration) =>
    getSession(integrationId),
  );

  ipcMain.handle("devtools:connect", async (_event, integrationId: DevToolIntegration) => {
    setSession(integrationId, { status: "connecting" });

    // TODO: Implement real OAuth flow per provider
    // For now, simulate a connection attempt that returns disconnected
    // Each provider will need its own OAuth implementation:
    //   - github: GitHub OAuth App
    //   - gitlab: GitLab OAuth
    //   - linear: Linear OAuth
    //   - jira: Atlassian OAuth
    await new Promise((resolve) => setTimeout(resolve, 500));

    return setSession(integrationId, {
      status: "error",
      error: "not_configured",
    });
  });

  ipcMain.handle("devtools:disconnect", (_event, integrationId: DevToolIntegration) =>
    setSession(integrationId, { status: "disconnected", orgName: undefined, error: undefined }),
  );
}
