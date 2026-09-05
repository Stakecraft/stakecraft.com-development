/**
 * Public Pinata retrieval URLs.
 *
 * Dedicated *.mypinata.cloud hosts 403 CIDs that are not pinned to that
 * account (ERR_ID:00006). Site images are public IPFS content, so uploads
 * return gateway.pinata.cloud URLs. ipfs.io is avoided because Cloudflare
 * challenges send CORP: same-origin.
 */

const PUBLIC_GATEWAY_HOST = "gateway.pinata.cloud";

export const extractIpfsCid = (value) => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const ipfsPath = trimmed.match(/(?:ipfs\/|ipfs:\/\/)([a-zA-Z0-9]+)/);
  if (ipfsPath) return ipfsPath[1];

  if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]+|bafk[a-z0-9]+)$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
};

export const toPinataGatewayUrl = (value) => {
  if (!value) return null;
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;

  const cid = extractIpfsCid(value);
  if (!cid) return value.startsWith("http") ? value : null;

  return `https://${PUBLIC_GATEWAY_HOST}/ipfs/${cid}`;
};
