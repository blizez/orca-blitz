import type { AppSettings, Business } from "@orca-blitz/shared";

export const SCHEMA_VERSION = 2;

export interface AppData {
  schemaVersion: number;
  settings: AppSettings;
  businesses: Business[];
}

export function defaultAppData(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: { theme: "system" },
    businesses: [],
  };
}
