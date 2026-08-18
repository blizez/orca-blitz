import { create } from 'zustand'
import type { Business } from '@orca-blitz/shared'

interface AppStore {
  activeBusinessId: string | null
  businesses: Business[]
  rightSidebarOpen: boolean
  setActiveBusinessId: (id: string | null) => void
  setBusinesses: (businesses: Business[]) => void
  toggleRightSidebar: () => void
  setRightSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  activeBusinessId: null,
  businesses: [],
  rightSidebarOpen: false,
  setActiveBusinessId: (id) => set({ activeBusinessId: id }),
  setBusinesses: (businesses) => set({ businesses }),
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
}))
