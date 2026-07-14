export const PRODUCTION_API_BASE_URL = 'https://backend.stakecraft.com/api'
export const LOCAL_API_BASE_URL = 'http://localhost:5000/api'

function normalizeApiBase(rawUrl) {
  const raw = (rawUrl || '').trim().replace(/\/$/, '')
  if (!raw) return null
  return raw.endsWith('/api') ? raw : `${raw}/api`
}

export function isFrontendApiUrl(url) {
  const normalized = (url || '').replace(/\/$/, '').replace(/\/api$/, '')

  return (
    /pages\.dev$/i.test(normalized) ||
    /^https:\/\/(www\.)?stakecraft\.com$/i.test(normalized) ||
    /^https:\/\/(www\.)?dev\.stakecraft\.com$/i.test(normalized)
  )
}

export function resolveApiBaseUrl(rawUrl) {
  const normalized = normalizeApiBase(rawUrl)
  if (!normalized) return null

  const hostOnly = normalized.replace(/\/api$/, '')
  if (isFrontendApiUrl(hostOnly)) {
    return null
  }

  return normalized
}
