import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// App-shell UI state. Only `sidebarCollapsed` is remembered (per browser); the
// mobile drawer always starts closed.
export const useLayoutStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    }),
    {
      name: 'teamsync.layout',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
)

export const selectSidebarCollapsed = (s) => s.sidebarCollapsed
export const selectToggleSidebar = (s) => s.toggleSidebar
export const selectMobileNavOpen = (s) => s.mobileNavOpen
export const selectSetMobileNavOpen = (s) => s.setMobileNavOpen
