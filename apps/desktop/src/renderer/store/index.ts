import { create } from 'zustand'
import type { Business } from '@orca-blitz/shared'

interface AppStore {
  activeBusinessId: string | null
  businesses: Business[]
  rightSidebarOpen: boolean
  snippetsDrawerOpen: boolean
  setActiveBusinessId: (id: string | null) => void
  setBusinesses: (businesses: Business[]) => void
  toggleRightSidebar: () => void
  setRightSidebarOpen: (open: boolean) => void
  toggleSnippetsDrawer: () => void
  setSnippetsDrawerOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  activeBusinessId: null,
  businesses: [],
  rightSidebarOpen: false,
  snippetsDrawerOpen: false,
  setActiveBusinessId: (id) => set({ activeBusinessId: id }),
  setBusinesses: (businesses) => set({ businesses }),
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  toggleSnippetsDrawer: () => set((s) => ({ snippetsDrawerOpen: !s.snippetsDrawerOpen })),
  setSnippetsDrawerOpen: (open) => set({ snippetsDrawerOpen: open }),
}))
