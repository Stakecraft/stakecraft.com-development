/**
 * Pinata retrieval URLs (https://docs.pinata.cloud/quickstart §4).
 *
 * Uploads stay on the server; the browser only ever sees a gateway URL of the
 * form https://<gateway-host>/ipfs/<cid>. The public ipfs.io gateway sits
 * behind Cloudflare bot checks that return Cross-Origin-Resource-Policy:
 * same-origin, which Chrome logs as ERR_BLOCKED_BY_RESPONSE.NotSameOrigin.
 */

const DEFAULT_GATEWAY_HOST = "gateway.pinata.cloud";

export const normalizeGatewayHost = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return DEFAULT_GATEWAY_HOST;
  return raw
    .replace(/^https?:\/\//i, "")
    .replace(/\/ipfs\/?$/i, "")
    .replace(/\/+$/, "");
};

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

export const toPinataGatewayUrl = (value, gatewayHost = DEFAULT_GATEWAY_HOST) => {
  if (!value) return null;
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;

  const cid = extractIpfsCid(value);
  if (!cid) return value.startsWith("http") ? value : null;

  return `https://${normalizeGatewayHost(gatewayHost)}/ipfs/${cid}`;
};
