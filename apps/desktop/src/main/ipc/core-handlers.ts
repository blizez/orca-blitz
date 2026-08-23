import { ipcMain, app } from "electron";
import { randomUUID } from "crypto";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { Business } from "@orca-blitz/shared";
import { AppDataStore } from "../persistence/store";

// Importa una sola vez los business.json del formato legacy (carpetas por slug)
function importLegacyBusinesses(appData: AppDataStore): void {
  const legacyDir = join(app.getPath("userData"), "businesses");
  if (!existsSync(legacyDir) || appData.load().businesses.length > 0) return;

  const imported: Business[] = [];
  try {
    const folders = readdirSync(legacyDir, { withFileTypes: true }).filter((d) => d.isDirectory());
    for (const folder of folders) {
      const metaPath = join(legacyDir, folder.name, "business.json");
      if (!existsSync(metaPath)) continue;
      try {
        const data = JSON.parse(readFileSync(metaPath, "utf-8")) as Business;
        if (typeof data.id === "string" && typeof data.name === "string") imported.push(data);
      } catch {
        // archivo corrupto: omitir
      }
    }
  } catch {
    return;
  }
  if (imported.length > 0) appData.update({ businesses: imported });
}

function notifyBusinesses(businesses: Business[]) {
  const { BrowserWindow } = require("electron");
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send("businesses:changed", businesses);
  }
}

export function registerCoreHandlers() {
  const appData = new AppDataStore(join(app.getPath("userData"), "orca-data.json"));
  appData.load();
  importLegacyBusinesses(appData);

  ipcMain.handle("businesses:list", () => appData.load().businesses);

  ipcMain.handle("businesses:create", (_e, data: Partial<Business>) => {
    const biz: Business = {
      id: randomUUID(),
      name: data.name || "New Business",
      type: data.type || "Other",
      industry: data.industry || "",
      description: data.description || "",
      website: data.website || "",
      products: data.products || "",
      audience: data.audience || "",
      competitors: data.competitors || "",
      usp: data.usp || "",
      painPoints: data.painPoints || "",
      monthlyRevenue: data.monthlyRevenue || "",
      yearEstablished: data.yearEstablished || "",
      channels: data.channels || [],
      goals: data.goals || [],
      teamSize: data.teamSize || "Just me",
    };
    const next = appData.update({ businesses: [...appData.load().businesses, biz] });
    notifyBusinesses(next.businesses);
    return biz;
  });

  ipcMain.handle("businesses:update", (_e, id: string, data: Partial<Business>) => {
    const current = appData.load().businesses;
    const biz = current.find((b) => b.id === id);
    if (!biz) return null;
    const updated = { ...biz, ...data };
    const next = appData.update({ businesses: current.map((b) => (b.id === id ? updated : b)) });
    notifyBusinesses(next.businesses);
    return updated;
  });

  ipcMain.handle("businesses:delete", (_e, id: string) => {
    const next = appData.update({
      businesses: appData.load().businesses.filter((b) => b.id !== id),
    });
    notifyBusinesses(next.businesses);
    return true;
  });

  ipcMain.handle("customers:list", () => []);
  ipcMain.handle("customers:get", (_e, _id: string) => null);
  ipcMain.handle("customers:create", (_e, data: unknown) => ({
    id: randomUUID(),
    ...(data as object),
  }));
  ipcMain.handle("customers:update", (_e, _id: string, _data: unknown) => null);
  ipcMain.handle("customers:delete", (_e, _id: string) => true);

  ipcMain.handle("workflows:list", () => []);
  ipcMain.handle("workflows:create", (_e, data: unknown) => ({
    id: randomUUID(),
    ...(data as object),
  }));
  ipcMain.handle("workflows:execute", (_e, _id: string) => ({ success: true }));

  ipcMain.handle("reports:generate", (_e, _config: unknown) => ({ reportId: randomUUID() }));
  ipcMain.handle("reports:export", (_e, _format: string) => ({ path: "" }));

  ipcMain.handle("settings:get", () => appData.load().settings);
  ipcMain.handle("settings:update", (_e, prefs: Partial<{ theme: string }>) => {
    return appData.update({ settings: { ...appData.load().settings, ...prefs } }).settings;
  });

  ipcMain.handle("plugins:list", () => []);
  ipcMain.handle("plugins:install", (_e, _manifest: unknown) => ({ success: true }));
  ipcMain.handle("plugins:enable", (_e, _id: string) => true);
  ipcMain.handle("plugins:disable", (_e, _id: string) => true);
}
