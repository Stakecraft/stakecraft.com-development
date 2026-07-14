export const PRODUCTION_API_BASE_URL = 'https://backend.stakecraft.com/api'
export const DEV_API_BASE_URL = 'https://backend.dev.stakecraft.com/api'
export const LOCAL_API_BASE_URL = 'http://localhost:5000/api'

const BACKEND_HOSTS = new Set(['backend.stakecraft.com', 'backend.dev.stakecraft.com'])

function normalizeApiBase(rawUrl) {
  const raw = (rawUrl || '').trim().replace(/\/$/, '')
  if (!raw) return null
  return raw.endsWith('/api') ? raw : `${raw}/api`
}

function getHostname(url) {
  try {
    return new URL(normalizeApiBase(url) || url).hostname
  } catch {
    return null
  }
}

export function isFrontendApiUrl(url) {
  const host = getHostname(url)
  if (!host) return true
  if (BACKEND_HOSTS.has(host)) return false
  if (host === 'localhost' || host === '127.0.0.1') return false
  if (host.endsWith('.pages.dev')) return true
  if (host === 'stakecraft.com' || host === 'www.stakecraft.com') return true
  if (host === 'dev.stakecraft.com') return true
  return false
}

export function resolveApiBaseUrl(rawUrl) {
  const normalized = normalizeApiBase(rawUrl)
  if (!normalized) return null

  if (isFrontendApiUrl(normalized)) {
    return null
  }

  return normalized
}
