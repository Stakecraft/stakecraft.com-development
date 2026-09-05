/**
 * Public Pinata retrieval URLs.
 *
 * Dedicated *.mypinata.cloud gateways are restricted by default: they 403 any
 * CID not pinned to that Pinata account (ERR_ID:00006). Existing site images
 * live on public IPFS but are not on the current account, so browser <img>
 * tags use gateway.pinata.cloud.
 *
 * ipfs.io is avoided: Cloudflare challenges there send CORP: same-origin
 * and Chrome logs ERR_BLOCKED_BY_RESPONSE.NotSameOrigin.
 */

const PUBLIC_GATEWAY_HOST = 'gateway.pinata.cloud'

export const PINATA_GATEWAY_HOST = PUBLIC_GATEWAY_HOST

export const extractIpfsCid = (value) => {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const ipfsPath = trimmed.match(/(?:ipfs\/|ipfs:\/\/)([a-zA-Z0-9]+)/)
  if (ipfsPath) return ipfsPath[1]

  if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]+|bafk[a-z0-9]+)$/i.test(trimmed)) {
    return trimmed
  }

  return null
}

export const toPinataGatewayUrl = (value) => {
  if (!value) return null
  if (value.startsWith('blob:') || value.startsWith('data:')) return value

  const cid = extractIpfsCid(value)
  if (!cid) return value.startsWith('http') ? value : null

  return `https://${PUBLIC_GATEWAY_HOST}/ipfs/${cid}`
}

export const isIpfsUrl = (url) => Boolean(extractIpfsCid(url))
