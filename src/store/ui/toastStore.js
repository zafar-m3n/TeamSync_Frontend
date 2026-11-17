import { create } from 'zustand'

const MAX_VISIBLE = 5
let nextId = 0

// App-wide toast queue. Components read it with a selector; non-React code
// (axios 401 handler, mutation hooks) calls the actions via getState().
export const useToastStore = create((set) => ({
  toasts: [],
  push: (tone, message) => {
    const id = ++nextId
    set((s) => ({ toasts: [{ id, tone, message }, ...s.toasts].slice(0, MAX_VISIBLE) }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const selectToasts = (s) => s.toasts
export const selectDismiss = (s) => s.dismiss
