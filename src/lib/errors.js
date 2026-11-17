// Maps an API error (see lib/axios.js: { message, code, status }) to ErrorState props.
// No status means the request never got a response (backend down, offline).
export function describeError(error, fallback) {
  if (!error) return null
  if (typeof error === 'string') return { message: error }
  if (error.status === 403) return { kind: 'forbidden', message: error.message || undefined }
  if (error.status == null && !error.code) return { kind: 'offline' }
  return { message: error.message || fallback }
}
