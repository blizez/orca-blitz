import type { StateCreator } from "zustand";
import type { AppStore } from "../types";

export interface UiSlice {
  rightSidebarOpen: boolean;
  snippetsDrawerOpen: boolean;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  toggleSnippetsDrawer: () => void;
  setSnippetsDrawerOpen: (open: boolean) => void;
}

export const createUiSlice: StateCreator<AppStore, [], [], UiSlice> = (set) => ({
  rightSidebarOpen: false,
  snippetsDrawerOpen: false,
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  toggleSnippetsDrawer: () => set((s) => ({ snippetsDrawerOpen: !s.snippetsDrawerOpen })),
  setSnippetsDrawerOpen: (open) => set({ snippetsDrawerOpen: open }),
});
