import { ipcMain } from "electron";
import * as fs from "node:fs";
import * as path from "node:path";
import { getAgentConfig } from "./agent-config";

interface CatalogModel {
  id: string;
  name: string;
  provider: string;
  api: string;
  reasoning: boolean;
  contextWindow: number | null;
  maxTokens: number | null;
  cost: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    total: number;
  };
  input: string[];
}

interface CatalogProvider {
  id: string;
  defaultModel: string;
  envVars?: string[];
}

let cachedModels: CatalogModel[] | null = null;
let cachedProviders: CatalogProvider[] | null = null;

function loadModelsJson(): CatalogModel[] {
  if (cachedModels) return cachedModels;

  const config = getAgentConfig();
  if (!config.ompSourceDir) return [];

  const modelsPath = path.join(config.ompSourceDir, "packages", "catalog", "src", "models.json");

  try {
    if (!fs.existsSync(modelsPath)) return [];
    const raw = fs.readFileSync(modelsPath, "utf-8");
    const data = JSON.parse(raw) as CatalogModel[];
    cachedModels = data;
    return data;
  } catch {
    return [];
  }
}

function loadProviderDescriptors(): CatalogProvider[] {
  if (cachedProviders) return cachedProviders;

  const config = getAgentConfig();
  if (!config.ompSourceDir) return [];

  const descriptorsPath = path.join(
    config.ompSourceDir,
    "packages",
    "catalog",
    "src",
    "provider-models",
    "descriptors.ts",
  );

  try {
    if (!fs.existsSync(descriptorsPath)) return [];
    const raw = fs.readFileSync(descriptorsPath, "utf-8");

    const providers: CatalogProvider[] = [];
    const providerRegex =
      /\{\s*id:\s*["']([^"']+)["'],\s*defaultModel:\s*["']([^"']*)["'](?:,\s*envVars:\s*\[([^\]]*)\])?/g;
    let match = providerRegex.exec(raw);
    while (match) {
      const id = match[1];
      const defaultModel = match[2];
      const envVarsStr = match[3];
      const envVars = envVarsStr
        ? envVarsStr.split(",").map((v) => v.trim().replace(/["']/g, ""))
        : undefined;
      providers.push({ id, defaultModel, envVars });
      match = providerRegex.exec(raw);
    }

    cachedProviders = providers;
    return providers;
  } catch {
    return [];
  }
}

export function registerCatalogHandlers() {
  ipcMain.handle("catalog:getModels", () => {
    return loadModelsJson();
  });

  ipcMain.handle("catalog:getProviders", () => {
    return loadProviderDescriptors();
  });

  ipcMain.handle("catalog:getProviderModels", (_e, providerId: string): CatalogModel[] => {
    const models = loadModelsJson();
    return models.filter((m) => m.provider === providerId);
  });

  ipcMain.handle("catalog:searchModels", (_e, query: string): CatalogModel[] => {
    const models = loadModelsJson();
    const lower = query.toLowerCase();
    return models.filter(
      (m) =>
        m.id.toLowerCase().includes(lower) ||
        m.name.toLowerCase().includes(lower) ||
        m.provider.toLowerCase().includes(lower),
    );
  });
}
