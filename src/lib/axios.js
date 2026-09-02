import axios from 'axios'
import * as token from './token'
import router from './router'
import { toast } from '../hooks/useToast'

const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  config.headers.set('Content-Type', 'application/json')
  config.headers.set('Accept', 'application/json')
  config.headers.set('X-Request-Id', crypto.randomUUID())

  const jwt = token.getToken()
  if (jwt) {
    config.headers.set('Authorization', `Bearer ${jwt}`)
  }

  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const envelope = error.response?.data?.error
    const normalized = new Error(
      envelope?.message || 'Something went wrong. Please try again.',
    )
    normalized.code = envelope?.code
    normalized.details = envelope?.details
    normalized.status = error.response?.status

    // Only a 401 against a request that actually carried a session is a
    // session-expiry event. A 401 from the login call itself (bad credentials)
    // has no session and is handled by LoginPage's banner instead.
    if (normalized.status === 401 && token.isAuthenticated()) {
      token.clearAutoLogoutTimer()
      token.clearSession()
      toast.error('Session expired — please log in again')
      router.navigate('/login')
    }

    return Promise.reject(normalized)
  },
)

export default api
