/**
 * CMS stores Mainnet.validator as a String, but many staking views historically
 * treated it as an array and read validator[0] — which for a string is only the
 * first character (e.g. "B" instead of the full Solana pubkey).
 */
export function resolveValidatorAddress(validator) {
  if (!validator) return ''
  if (Array.isArray(validator)) {
    const first = validator.find((v) => typeof v === 'string' && v.trim())
    return first ? first.trim() : ''
  }
  if (typeof validator === 'string') return validator.trim()
  return ''
}
