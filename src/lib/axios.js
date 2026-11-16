import axios from 'axios'
import * as token from '@/lib/token'
import { emitUnauthorized } from '@/lib/sessionEvents'
import { API_BASE_URL } from '@/lib/config'

const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use((config) => {
  // FormData must set its own multipart Content-Type (with boundary) — forcing
  // application/json here would break document uploads.
  if (!(config.data instanceof FormData)) {
    config.headers.set('Content-Type', 'application/json')
  }
  config.headers.set('Accept', 'application/json')
  config.headers.set('X-Request-Id', crypto.randomUUID())

  const jwt = token.getToken()
  if (jwt) {
    config.headers.set('Authorization', `Bearer ${jwt}`)
  }

  return config
})

// A blob request's error body is a Blob, so read the JSON envelope out of it.
async function errorEnvelope(data) {
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text())?.error
    } catch {
      return undefined
    }
  }
  return data?.error
}

api.interceptors.response.use(
  // File downloads need the headers (Content-Disposition), so keep the full response.
  (response) => (response.config.responseType === 'blob' ? response : response.data),
  async (error) => {
    const envelope = await errorEnvelope(error.response?.data)
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
      emitUnauthorized()
    }

    return Promise.reject(normalized)
  },
)

export default api
