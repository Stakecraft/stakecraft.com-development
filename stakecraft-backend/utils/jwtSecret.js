export function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production')
  }
  if (!secret) {
    console.warn('WARNING: JWT_SECRET not set — using development fallback')
    return 'dev-only-secret-do-not-use-in-production'
  }
  return secret
}
