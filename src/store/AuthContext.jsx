import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import * as token from '@/lib/token'
import { onUnauthorized } from '@/lib/sessionEvents'
import { hasPermission } from '@/lib/permissions'
import { toast } from '@/hooks/useToast'
import Skeleton from '@/components/ui/Skeleton'
import favicon from '@/assets/favicon.png'
import { AuthContext } from '@/store/useAuth'

const meQueryKey = (userId) => ['me', userId]

const SESSION_EXPIRED = 'Session expired — please log in again'

// The signed-in user from storage, or null. A stale token found on load is
// cleared quietly (not a live interruption, so no toast).
function readStoredUser() {
  if (!token.isAuthenticated()) return null
  const expiryMs = token.getExpiryMs()
  if (!expiryMs || expiryMs <= Date.now()) {
    token.clearSession()
    return null
  }
  return token.getUser()
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [storedUser, setUser] = useState(readStoredUser)

  // Every way a session ends comes through here, so the next user never sees this
  // one's cached data. Clearing the user makes AppLayout redirect to /login.
  // `broadcast: false` is for cross-tab logout, where the other tab already cleared storage.
  const endSession = useCallback(
    ({ message, broadcast = true } = {}) => {
      token.clearAutoLogoutTimer()
      if (broadcast) token.clearSession()
      queryClient.clear()
      setUser(null)
      if (message) toast.error(message)
    },
    [queryClient],
  )
  const expireSession = useCallback(() => endSession({ message: SESSION_EXPIRED }), [endSession])

  useEffect(() => {
    // readStoredUser already cleared a stale token, so a remaining one is live.
    if (token.isAuthenticated()) token.scheduleAutoLogout(expireSession)

    const stopCrossTab = token.listenForCrossTabLogout(() => endSession({ broadcast: false }))
    const stopUnauthorized = onUnauthorized(expireSession)
    return () => {
      stopCrossTab()
      stopUnauthorized()
    }
  }, [endSession, expireSession])

  // Refreshes the stored user (and its permissions) from the server on load.
  const me = useQuery({
    queryKey: meQueryKey(storedUser?.id),
    queryFn: () => api.get('/auth/me').then((body) => body.data),
    enabled: Boolean(storedUser),
  })
  const user = (storedUser && me.data) || storedUser

  useEffect(() => {
    if (me.data && token.isAuthenticated()) token.setUser(me.data)
  }, [me.data])

  const login = useCallback(
    async (email, password) => {
      const body = await api.post('/auth/login', { email, password })
      const { token: jwt, user: nextUser } = body.data
      token.setToken(jwt)
      token.setUser(nextUser)
      queryClient.setQueryData(meQueryKey(nextUser.id), nextUser)
      setUser(nextUser)
      token.scheduleAutoLogout(expireSession)
    },
    [queryClient, expireSession],
  )

  const logout = useCallback(() => {
    const jwt = token.getToken()
    endSession()
    // Best effort: revokes the token server-side. Sent after the local session is
    // cleared, so a failure here can't trigger the session-expired handling.
    if (jwt) {
      api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${jwt}` } }).catch(() => {})
    }
  }, [endSession])

  // A password change revokes every session and returns a fresh token for this one.
  const replaceToken = useCallback(
    (jwt) => {
      token.setToken(jwt)
      token.scheduleAutoLogout(expireSession)
    },
    [expireSession],
  )

  const can = useCallback((module, action) => hasPermission(user, module, action), [user])

  // A user stored before permissions were part of the session waits for /auth/me.
  const awaitingPermissions = Boolean(user) && !user.permissions && !me.isError

  const value = useMemo(
    () => ({ user, login, logout, replaceToken, can }),
    [user, login, logout, replaceToken, can],
  )

  return (
    <AuthContext.Provider value={value}>
      {awaitingPermissions ? (
        <div
          role="status"
          aria-label="Loading TeamSync"
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas"
        >
          <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-line motion-reduce:animate-none">
            <img src={favicon} alt="" className="h-full w-full object-contain" />
          </span>
          <Skeleton className="h-2 w-32" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}
