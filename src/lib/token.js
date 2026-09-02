import { decodeToken } from '../utils/jwt'

const TOKEN_KEY = 'teamsync.token'
const USER_KEY = 'teamsync.user'
const LOGOUT_KEY = 'teamsync.logout_at'

let autoLogoutTimerId = null

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function isAuthenticated() {
  return !!getToken()
}

export function getExpiryMs() {
  const token = getToken()
  if (!token) return null
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return null
  return decoded.exp * 1000
}

export function clearAutoLogoutTimer() {
  if (autoLogoutTimerId !== null) {
    clearTimeout(autoLogoutTimerId)
    autoLogoutTimerId = null
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  // Writing this key is purely a cross-tab broadcast; the value is irrelevant,
  // only that a `storage` event fires in other tabs.
  localStorage.setItem(LOGOUT_KEY, String(Date.now()))
}

export function scheduleAutoLogout(onExpire) {
  clearAutoLogoutTimer()
  const expiryMs = getExpiryMs()
  if (!expiryMs) return
  const remaining = expiryMs - Date.now()
  if (remaining <= 0) return
  autoLogoutTimerId = setTimeout(() => {
    clearAutoLogoutTimer()
    clearSession()
    onExpire()
  }, remaining)
}

export function listenForCrossTabLogout(onCrossTabLogout) {
  const handler = (event) => {
    if (event.key === LOGOUT_KEY) onCrossTabLogout()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
