import { beforeEach, describe, expect, it } from "vitest";
import type { Business } from "@orca-blitz/shared";
import { useAppStore } from "./index";

function business(id: string): Business {
  return {
    id,
    name: id,
    type: "",
    industry: "",
    description: "",
    website: "",
    products: "",
    audience: "",
    competitors: "",
    usp: "",
    painPoints: "",
    monthlyRevenue: "",
    yearEstablished: "",
    channels: [],
    goals: [],
    teamSize: "",
  };
}

describe("useAppStore", () => {
  beforeEach(() => {
    const store = useAppStore.getState();
    store.setActiveBusinessId(null);
    store.setBusinesses([]);
    store.setRightSidebarOpen(false);
    store.setSnippetsDrawerOpen(false);
  });

  it("compone los slices de ui y businesses en un solo store", () => {
    useAppStore.getState().setBusinesses([business("a")]);
    useAppStore.getState().toggleRightSidebar();

    const state = useAppStore.getState();
    expect(state.businesses).toHaveLength(1);
    expect(state.rightSidebarOpen).toBe(true);
    expect(state.snippetsDrawerOpen).toBe(false);
  });

  it("reorderBusiness mueve un negocio sin duplicar ni perder otros", () => {
    useAppStore.getState().setBusinesses([business("a"), business("b"), business("c")]);

    useAppStore.getState().reorderBusiness(2, 0);

    expect(useAppStore.getState().businesses.map((b) => b.id)).toEqual(["c", "a", "b"]);
  });

  it("reorderBusiness con índice de origen inválido deja el estado intacto", () => {
    const before = [business("a"), business("b")];
    useAppStore.getState().setBusinesses(before);

    useAppStore.getState().reorderBusiness(5, 0);

    expect(useAppStore.getState().businesses.map((b) => b.id)).toEqual(["a", "b"]);
  });
});
