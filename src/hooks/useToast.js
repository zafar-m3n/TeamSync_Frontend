import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

// Module-level reference to the mounted ToastProvider's queue functions, so
// non-React code (e.g. lib/axios.js's 401 handler) can raise toasts too.
let activeToast = null

export function registerToast(api) {
  activeToast = api
}

export const toast = {
  success: (message) => activeToast?.success(message),
  error: (message) => activeToast?.error(message),
  info: (message) => activeToast?.info(message),
  warning: (message) => activeToast?.warning(message),
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
