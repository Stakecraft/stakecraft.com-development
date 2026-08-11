import { SOLANA_TRACKED_POOLS } from '../constants/solanaValidatorPools.js'
import { API_BASE_URL } from '../config/api.js'

const STAKEWIZ_URL = 'https://api.stakewiz.com/validator'
const GDINDEX_VALIDATOR_INDEX = 'https://gdindex.app/gdi/validator-index.json'
const GDINDEX_POOL_LATEST = (address) => `https://gdindex.app/gdi/pools/${address}/latest.json`
const VALIDBLOCKS_LIVE_URL = 'https://dashboards.validblocks.com/api/validator-live'

const CACHE_TTL_MS = 15 * 60 * 1000
const cache = new Map()

function cacheGet(key) {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return hit.value
}

function cacheSet(key, value) {
  cache.set(key, { at: Date.now(), value })
}

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  return response.json()
}

function truncateKey(key, head = 4, tail = 4) {
  if (!key || key.length <= head + tail + 1) return key || ''
  return `${key.slice(0, head)}…${key.slice(-tail)}`
}

function formatSol(amount) {
  if (amount == null || Number.isNaN(amount)) return '—'
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M SOL`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(amount >= 10_000 ? 0 : 1)}k SOL`
  return `${amount.toFixed(0)} SOL`
}

function formatPct(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Number(value).toFixed(digits)}%`
}

function formatNum(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return '—'
  return Number(value).toFixed(digits)
}

async function loadStakewiz(vote) {
  return fetchJson(`${STAKEWIZ_URL}/${vote}`)
}

async function loadGdindexEntry(vote) {
  const index = await fetchJson(GDINDEX_VALIDATOR_INDEX)
  const entry = index?.validators?.find(
    (v) => v.vote_pubkey === vote || v.identity_pubkey === vote
  )
  return {
    entry: entry || null,
    rankableCount: index?.rankable_count ?? null,
    medianRarity: index?.median_composite_rarity ?? null,
    epoch: index?.epoch ?? null
  }
}

async function loadTrackedPools(vote) {
  const results = await Promise.all(
    SOLANA_TRACKED_POOLS.map(async (pool) => {
      try {
        const detail = await fetchJson(GDINDEX_POOL_LATEST(pool.poolAddress))
        const hit = detail?.validators?.find((v) => v.pubkey === vote)
        const stakeSol = hit?.stake_sol ?? 0
        if (!hit || stakeSol <= 0) return null
        return {
          ...pool,
          stakeSol,
          stakeLabel: formatSol(stakeSol)
        }
      } catch {
        return null
      }
    })
  )
  return results.filter(Boolean).sort((a, b) => b.stakeSol - a.stakeSol)
}

async function loadValidBlocks(vote) {
  return fetchJson(
    `${VALIDBLOCKS_LIVE_URL}?voteAccount=${encodeURIComponent(vote)}`
  )
}

function assembleStats(voteAccount, stakewiz, gdindex, pools, validBlocks = null) {
  const identity =
    stakewiz?.identity || gdindex?.entry?.identity_pubkey || validBlocks?.nodePubkey || ''
  const vote = stakewiz?.vote_identity || gdindex?.entry?.vote_pubkey || voteAccount
  const locationCity = stakewiz?.ip_city || gdindex?.entry?.city || ''
  const locationCountry = stakewiz?.ip_country || gdindex?.entry?.country || ''
  const location =
    locationCity && locationCountry && locationCity !== locationCountry
      ? `${locationCity}, ${locationCountry}`
      : locationCity || locationCountry || '—'

  const mevBps = stakewiz?.jito_commission_bps
  return {
    identity,
    vote,
    identityShort: truncateKey(identity),
    voteShort: truncateKey(vote),
    totalStake:
      stakewiz?.activated_stake ??
      gdindex?.entry?.activated_stake_sol ??
      validBlocks?.activatedStake ??
      null,
    totalStakeLabel: formatSol(
      stakewiz?.activated_stake ??
        gdindex?.entry?.activated_stake_sol ??
        validBlocks?.activatedStake
    ),
    commission: stakewiz?.commission ?? validBlocks?.commission ?? null,
    commissionLabel: formatPct(stakewiz?.commission ?? validBlocks?.commission, 0),
    mevCommission: mevBps == null ? null : mevBps / 100,
    mevCommissionLabel: mevBps == null ? '—' : formatPct(mevBps / 100, 0),
    apy: stakewiz?.total_apy ?? null,
    apyLabel: formatPct(stakewiz?.total_apy),
    uptime: stakewiz?.uptime ?? null,
    uptimeLabel: formatPct(stakewiz?.uptime),
    location,
    ibrl: gdindex?.entry?.ibrl_score ?? null,
    ibrlLabel: formatNum(gdindex?.entry?.ibrl_score, 1),
    isDz: Boolean(gdindex?.entry?.is_dz),
    isJito: Boolean(stakewiz?.is_jito ?? gdindex?.entry?.is_jito),
    pools,
    ranks: [
      {
        id: 'stakewiz',
        label: 'Stakewiz',
        value:
          stakewiz?.wiz_score != null
            ? `${formatNum(stakewiz.wiz_score)} · #${stakewiz.rank}`
            : null,
        href: `https://stakewiz.com/validator/${vote}`
      },
      {
        id: 'validblocks',
        label: 'ValidBlocks',
        value:
          validBlocks?.creditsRank != null
            ? `#${validBlocks.creditsRank}${
                validBlocks.totalValidators != null
                  ? ` / ${validBlocks.totalValidators}`
                  : ''
              }`
            : null,
        href: `https://dashboards.validblocks.com/validator?pubkey=${vote}`
      },
      {
        id: 'gdi-rank',
        label: 'Active-set',
        value:
          gdindex?.entry?.rank != null
            ? `#${gdindex.entry.rank}${
                gdindex.rankableCount != null ? ` / ${gdindex.rankableCount}` : ''
              }`
            : null,
        href: `https://gdindex.app/validator/${vote}`
      },
      {
        id: 'gdi-rarity',
        label: 'Composite rarity',
        value:
          gdindex?.entry?.composite_rarity != null
            ? formatNum(gdindex.entry.composite_rarity)
            : null,
        href: `https://gdindex.app/validator/${vote}`
      }
    ].filter((rank) => rank.value),
    sources: {
      stakewiz: Boolean(stakewiz),
      gdindex: Boolean(gdindex?.entry),
      validBlocks: Boolean(validBlocks)
    },
    updatedAt: Date.now()
  }
}

async function fetchFromBackend(voteAccount) {
  const response = await fetch(
    `${API_BASE_URL}/solana/validator-stats/${encodeURIComponent(voteAccount)}`
  )
  if (!response.ok) throw new Error(`Backend stats HTTP ${response.status}`)
  return response.json()
}

async function fetchFromSources(voteAccount) {
  const [stakewizResult, gdindexResult, poolsResult, validBlocksResult] =
    await Promise.allSettled([
      loadStakewiz(voteAccount),
      loadGdindexEntry(voteAccount),
      loadTrackedPools(voteAccount),
      loadValidBlocks(voteAccount)
    ])

  const stakewiz = stakewizResult.status === 'fulfilled' ? stakewizResult.value : null
  const gdindex = gdindexResult.status === 'fulfilled' ? gdindexResult.value : null
  const pools = poolsResult.status === 'fulfilled' ? poolsResult.value : []
  const validBlocks =
    validBlocksResult.status === 'fulfilled' ? validBlocksResult.value : null

  if (!stakewiz && !gdindex?.entry && !validBlocks) {
    throw new Error('Unable to load validator stats')
  }

  return assembleStats(voteAccount, stakewiz, gdindex, pools, validBlocks)
}

/**
 * Aggregate live StakeCraft Solana validator stats for the staking page trust strip.
 * Prefers the cached backend endpoint; falls back to direct Stakewiz/GDIndex calls.
 */
export async function fetchSolanaValidatorStats(voteAccount) {
  if (!voteAccount) throw new Error('voteAccount is required')

  const cached = cacheGet(voteAccount)
  if (cached) return cached

  let stats
  try {
    stats = await fetchFromBackend(voteAccount)
  } catch (backendError) {
    console.warn('Solana stats backend unavailable, using direct sources:', backendError?.message)
    stats = await fetchFromSources(voteAccount)
  }

  cacheSet(voteAccount, stats)
  return stats
}

export { truncateKey, formatSol }
