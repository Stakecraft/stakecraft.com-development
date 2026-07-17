import {
  DEV_API_BASE_URL,
  LOCAL_API_BASE_URL,
  PRODUCTION_API_BASE_URL,
  resolveApiBaseUrl
} from './resolveApiBase.js'

export {
  DEV_API_BASE_URL,
  LOCAL_API_BASE_URL,
  PRODUCTION_API_BASE_URL,
  resolveApiBaseUrl
} from './resolveApiBase.js'

export const API_BASE_URL =
  resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL) ||
  (import.meta.env.PROD ? PRODUCTION_API_BASE_URL : LOCAL_API_BASE_URL)

export const DEFAULT_BUILD_API_BASE_URL = PRODUCTION_API_BASE_URL
