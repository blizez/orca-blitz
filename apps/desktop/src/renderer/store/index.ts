import { create } from "zustand";
import { createBusinessesSlice } from "./slices/businesses";
import { createUiSlice } from "./slices/ui";
import type { AppStore } from "./types";

export const useAppStore = create<AppStore>()((...args) => ({
  ...createUiSlice(...args),
  ...createBusinessesSlice(...args),
}));
