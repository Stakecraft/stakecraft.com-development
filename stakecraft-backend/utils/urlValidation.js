const BLOCKED_SCHEMES = /^(javascript|data|vbscript):/i

export function isSafeUrl(value) {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true
  if (BLOCKED_SCHEMES.test(trimmed)) return false
  if (/^https?:\/\/.+/i.test(trimmed)) return true
  if (/^(tg|mailto):/i.test(trimmed)) return true
  return false
}

export function sanitizeUrl(value) {
  return isSafeUrl(value) ? value.trim() : ''
}

export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
