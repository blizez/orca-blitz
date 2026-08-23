import type { AppData } from "../schema";

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

// Migraciones por versión: clave = versión del dato, valor = paso hacia versión + 1
export const appDataMigrations: Record<number, Migration> = {
  // v1 -> v2: los businesses se mueven de businesses/<slug>/business.json al archivo único
  1: (data) => ({ ...data, businesses: Array.isArray(data.businesses) ? data.businesses : [] }),
};

export function runMigrations(
  raw: Record<string, unknown>,
  targetVersion: number,
): Record<string, unknown> {
  const savedVersion = typeof raw.schemaVersion === "number" ? raw.schemaVersion : 0;
  if (savedVersion >= targetVersion) return { ...raw };

  let data = raw;
  let version = savedVersion;
  while (version < targetVersion) {
    const migrate = appDataMigrations[version];
    if (!migrate) break;
    data = migrate(data);
    version += 1;
  }
  return { ...data, schemaVersion: version };
}

export function isAppDataShape(value: unknown): value is Partial<AppData> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if ("settings" in record && (typeof record.settings !== "object" || record.settings === null))
    return false;
  return true;
}
