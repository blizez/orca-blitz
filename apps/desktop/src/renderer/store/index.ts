import { create } from 'zustand'
import type { Business } from '@orca-blitz/shared'

export type RightPanelId = 'billing' | 'reports' | 'contacts' | 'notifications' | null

interface AppStore {
  activeBusinessId: string | null
  businesses: Business[]
  rightSidebarOpen: boolean
  rightPanel: RightPanelId
  setActiveBusinessId: (id: string | null) => void
  setBusinesses: (businesses: Business[]) => void
  toggleRightSidebar: () => void
  setRightSidebarOpen: (open: boolean) => void
  setRightPanel: (panel: RightPanelId) => void
}

export const useAppStore = create<AppStore>((set) => ({
  activeBusinessId: null,
  businesses: [],
  rightSidebarOpen: false,
  rightPanel: null,
  setActiveBusinessId: (id) => set({ activeBusinessId: id }),
  setBusinesses: (businesses) => set({ businesses }),
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  setRightPanel: (panel) => set({ rightPanel: panel }),
}))
