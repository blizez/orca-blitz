import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { SCHEMA_VERSION } from "./schema";
import { appDataMigrations } from "./migrations/app-data-migrations";
import { AppDataStore } from "./store";

let dataDirectory: string;
let filePath: string;

beforeEach(() => {
  dataDirectory = mkdtempSync(join(tmpdir(), "orca-store-test-"));
  filePath = join(dataDirectory, "orca-data.json");
});

afterEach(() => {
  rmSync(dataDirectory, { recursive: true, force: true });
});

describe("AppDataStore", () => {
  it("crea defaults si no existe archivo", () => {
    const store = new AppDataStore(filePath);
    expect(store.load()).toEqual({
      schemaVersion: SCHEMA_VERSION,
      settings: { theme: "system" },
      businesses: [],
    });
    expect(existsSync(filePath)).toBe(false);
  });

  it("update persiste inmediatamente y sobrevive una nueva instancia", () => {
    new AppDataStore(filePath).update({ settings: { theme: "dark" } });

    const reloaded = new AppDataStore(filePath).load();
    expect(reloaded.settings.theme).toBe("dark");
  });

  it("merge profundo: conserva claves no incluidas en el patch", () => {
    const store = new AppDataStore(filePath);
    store.update({ settings: { theme: "light" } });

    expect(store.load().schemaVersion).toBe(SCHEMA_VERSION);
    expect(store.load().settings.theme).toBe("light");
  });

  it("archivo corrupto cae a defaults sin lanzar error", () => {
    writeFileSync(filePath, "{not json", "utf-8");

    const store = new AppDataStore(filePath);
    expect(store.load()).toEqual({
      schemaVersion: SCHEMA_VERSION,
      settings: { theme: "system" },
      businesses: [],
    });
  });

  it("datos con forma inválida se descartan y vuelven a defaults", () => {
    writeFileSync(filePath, JSON.stringify({ schemaVersion: 1, settings: "oops" }), "utf-8");

    expect(new AppDataStore(filePath).load().settings.theme).toBe("system");
  });

  it("migra datos de versión anterior aplicando migraciones registradas", () => {
    appDataMigrations[0] = (data) => ({ ...data, settings: { theme: data.theme } });
    try {
      writeFileSync(filePath, JSON.stringify({ schemaVersion: 0, theme: "dark" }), "utf-8");
      const data = new AppDataStore(filePath).load();
      expect(data.settings.theme).toBe("dark");
      expect(data.schemaVersion).toBe(SCHEMA_VERSION);
    } finally {
      delete appDataMigrations[0];
    }
  });

  it("save escribe sin dejar archivos temporales residuales", () => {
    const store = new AppDataStore(filePath);
    store.save({ schemaVersion: SCHEMA_VERSION, settings: { theme: "dark" }, businesses: [] });
    store.update({ settings: { theme: "light" } });

    expect(existsSync(`${filePath}.tmp`)).toBe(false);
  });

  it("persiste businesses y descarta entradas inválidas al cargar", () => {
    const valid = { id: "b1", name: "Tienda", channels: [] };
    const store = new AppDataStore(filePath);
    store.update({
      businesses: [valid, { name: "sin id" }, "basura"] as never,
    });

    const reloaded = new AppDataStore(filePath).load();
    expect(reloaded.businesses).toHaveLength(1);
    expect(reloaded.businesses[0].id).toBe("b1");
  });
});
