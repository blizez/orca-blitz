import type { StateCreator } from "zustand";
import type { Business } from "@orca-blitz/shared";
import type { AppStore } from "../types";

export interface BusinessesSlice {
  activeBusinessId: string | null;
  businesses: Business[];
  setActiveBusinessId: (id: string | null) => void;
  setBusinesses: (businesses: Business[]) => void;
  reorderBusiness: (fromIndex: number, toIndex: number) => void;
}

export const createBusinessesSlice: StateCreator<AppStore, [], [], BusinessesSlice> = (set) => ({
  activeBusinessId: null,
  businesses: [],
  setActiveBusinessId: (id) => set({ activeBusinessId: id }),
  setBusinesses: (businesses) => set({ businesses }),
  reorderBusiness: (fromIndex, toIndex) =>
    set((state) => {
      const items = [...state.businesses];
      const [moved] = items.splice(fromIndex, 1);
      if (!moved) return state;
      items.splice(toIndex, 0, moved);
      return { businesses: items };
    }),
});
