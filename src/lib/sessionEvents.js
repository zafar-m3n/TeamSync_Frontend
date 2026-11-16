// Lets low-level code (the axios client) report a dead session without importing the
// router or auth state. The auth provider listens and ends the session.
const listeners = new Set()

export function onUnauthorized(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitUnauthorized() {
  listeners.forEach((listener) => listener())
}
