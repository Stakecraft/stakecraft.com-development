/**
 * Pinata retrieval URLs (https://docs.pinata.cloud/quickstart §4).
 *
 * The gateway hostname is public (it appears in every <img src>). JWT / API
 * keys stay on the server. Prefer a dedicated gateway from the Pinata
 * dashboard (Gateways tab, e.g. fun-llama-300.mypinata.cloud). The public
 * gateway is the fallback so existing ipfs.io URLs stop hitting Cloudflare
 * CORP blocks before that env is set.
 */

const DEFAULT_GATEWAY_HOST = 'gateway.pinata.cloud'

export const normalizeGatewayHost = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return DEFAULT_GATEWAY_HOST
  return raw
    .replace(/^https?:\/\//i, '')
    .replace(/\/ipfs\/?$/i, '')
    .replace(/\/+$/, '')
}

export const PINATA_GATEWAY_HOST = normalizeGatewayHost(import.meta.env.VITE_PINATA_GATEWAY)

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

export const toPinataGatewayUrl = (value, gatewayHost = PINATA_GATEWAY_HOST) => {
  if (!value) return null
  if (value.startsWith('blob:') || value.startsWith('data:')) return value

  const cid = extractIpfsCid(value)
  if (!cid) return value.startsWith('http') ? value : null

  return `https://${normalizeGatewayHost(gatewayHost)}/ipfs/${cid}`
}

export const isIpfsUrl = (url) => Boolean(extractIpfsCid(url))
