import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import api from '../lib/axios'
import router from '../lib/router'
import * as token from '../lib/token'
import { toast } from '../hooks/useToast'
import Spinner from '../components/ui/Spinner'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleSessionEnd = useCallback(({ silent } = {}) => {
    if (!silent) toast.error('Session expired — please log in again')
    setUser(null)
    router.navigate('/login')
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

    return token.listenForCrossTabLogout(() => handleSessionEnd({ silent: true }))
  }, [handleSessionEnd])

  const login = async (email, password) => {
    const body = await api.post('/auth/login', { email, password })
    const { token: jwt, user: nextUser } = body.data
    token.setToken(jwt)
    token.setUser(nextUser)
    setUser(nextUser)
    token.scheduleAutoLogout(handleSessionEnd)
    return nextUser.roleName
  }

  const logout = () => {
    token.clearAutoLogoutTimer()
    token.clearSession()
    setUser(null)
    router.navigate('/login')
  }

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading])

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
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
