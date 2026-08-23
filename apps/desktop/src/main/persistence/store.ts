import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import { dirname } from "path";
import type { AppSettings, Business } from "@orca-blitz/shared";
import { SCHEMA_VERSION, defaultAppData, type AppData } from "./schema";
import { isAppDataShape, runMigrations } from "./migrations/app-data-migrations";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : override) as T;
  }
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    result[key] = key in base ? deepMerge((base as Record<string, unknown>)[key], value) : value;
  }
  return result as T;
}

// Persistencia atómica del estado de la app: write-then-rename + merge con defaults + migraciones
export class AppDataStore {
  private cache: AppData | null = null;

  constructor(private readonly filePath: string) {}

  load(): AppData {
    if (this.cache) return this.cache;
    let raw: unknown = null;
    try {
      raw = JSON.parse(readFileSync(this.filePath, "utf-8"));
    } catch {
      // archivo ausente o corrupto: partir de defaults
    }
    const saved = isAppDataShape(raw) ? runMigrations(raw, SCHEMA_VERSION) : {};
    this.cache = this.sanitize(deepMerge(defaultAppData(), saved));
    return this.cache;
  }

  update(patch: Partial<AppData>): AppData {
    const next = this.sanitize({ ...this.load(), ...patch });
    this.save(next);
    return next;
  }

  save(data: AppData): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    renameSync(tempPath, this.filePath);
    this.cache = data;
  }

  private sanitize(data: AppData): AppData {
    const settings = data.settings as Partial<AppSettings> | undefined;
    return {
      schemaVersion: SCHEMA_VERSION,
      settings: {
        theme: typeof settings?.theme === "string" ? settings.theme : "system",
      },
      businesses: Array.isArray(data.businesses) ? data.businesses.filter(isValidBusiness) : [],
    };
  }
}

function isValidBusiness(value: unknown): value is Business {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.name === "string";
}
