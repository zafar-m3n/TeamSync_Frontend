import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import * as token from '@/lib/token'
import { onUnauthorized } from '@/lib/sessionEvents'
import { hasPermission } from '@/lib/permissions'
import { toast } from '@/hooks/useToast'
import Spinner from '@/components/ui/Spinner'

const AuthContext = createContext(null)

const meQueryKey = (userId) => ['me', userId]

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [storedUser, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleSessionEnd = useCallback(({ silent } = {}) => {
    if (!silent) toast.error('Session expired — please log in again')
    setUser(null)
  }, [])

  useEffect(() => {
    if (!token.isAuthenticated()) {
      setIsLoading(false)
    } else {
      const expiryMs = token.getExpiryMs()
      if (!expiryMs || expiryMs <= Date.now()) {
        // Stale token found on load — not a live interruption, so no toast.
        token.clearSession()
        setUser(null)
        setIsLoading(false)
      } else {
        setUser(token.getUser())
        token.scheduleAutoLogout(handleSessionEnd)
        setIsLoading(false)
      }
    }

    const stopCrossTab = token.listenForCrossTabLogout(() => handleSessionEnd({ silent: true }))
    const stopUnauthorized = onUnauthorized(() => handleSessionEnd())
    return () => {
      stopCrossTab()
      stopUnauthorized()
    }
  }, [handleSessionEnd])

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

  const login = async (email, password) => {
    const body = await api.post('/auth/login', { email, password })
    const { token: jwt, user: nextUser } = body.data
    token.setToken(jwt)
    token.setUser(nextUser)
    queryClient.setQueryData(meQueryKey(nextUser.id), nextUser)
    setUser(nextUser)
    token.scheduleAutoLogout(handleSessionEnd)
  }

  const logout = () => {
    const jwt = token.getToken()
    token.clearAutoLogoutTimer()
    token.clearSession()
    setUser(null)
    // Best effort: revokes the token server-side. Sent after the local session is
    // cleared, so a failure here can't trigger the session-expired handling.
    if (jwt) {
      api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${jwt}` } }).catch(() => {})
    }
  }

  // A password change revokes every session and returns a fresh token for this one.
  const replaceToken = (jwt) => {
    token.setToken(jwt)
    token.scheduleAutoLogout(handleSessionEnd)
  }

  const can = useCallback((module, action) => hasPermission(user, module, action), [user])

  // A user stored before permissions were part of the session waits for /auth/me.
  const awaitingPermissions = Boolean(user) && !user.permissions && !me.isError

  const value = useMemo(
    () => ({ user, isLoading, login, logout, replaceToken, can }),
    [user, isLoading, can],
  )

  return (
    <AuthContext.Provider value={value}>
      {isLoading || awaitingPermissions ? (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Spinner size="lg" className="text-accent" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
