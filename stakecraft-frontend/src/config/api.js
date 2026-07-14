const PRODUCTION_API_BASE_URL = 'https://backend.stakecraft.com/api'
const LOCAL_API_BASE_URL = 'http://localhost:5000/api'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_BASE_URL : LOCAL_API_BASE_URL)

export const DEFAULT_BUILD_API_BASE_URL = PRODUCTION_API_BASE_URL
