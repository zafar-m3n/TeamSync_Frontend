// Read once at startup; main.jsx refuses to start the app when a value is missing.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const CONFIG_ERROR = API_BASE_URL
  ? null
  : 'VITE_API_BASE_URL is not set. Add it to TeamSync_Frontend/.env (see .env.example) and restart the dev server, or set it in the build environment.'
