import { create } from 'zustand'
import type { Business } from '@orca-blitz/shared'

interface AppStore {
  activeBusinessId: string | null
  businesses: Business[]
  rightSidebarOpen: boolean
  snippetsDrawerOpen: boolean
  setActiveBusinessId: (id: string | null) => void
  setBusinesses: (businesses: Business[]) => void
  reorderBusiness: (fromIndex: number, toIndex: number) => void
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
  reorderBusiness: (from, to) =>
    set((state) => {
      const items = [...state.businesses]
      const [moved] = items.splice(from, 1)
      items.splice(to, 0, moved)
      return { businesses: items }
    }),
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  toggleSnippetsDrawer: () => set((s) => ({ snippetsDrawerOpen: !s.snippetsDrawerOpen })),
  setSnippetsDrawerOpen: (open) => set({ snippetsDrawerOpen: open }),
}))
