/**
 * Aggregates Stakewiz + GDIndex + ValidBlocks + JPool
 * (+ optional validators.app / SVT TVC / Vault Elite) for the Solana
 * staking trust strip. Cached in-process so clients avoid downloading
 * the full GDIndex index.
 */

import config from "../config/env.js";

const STAKEWIZ_URL = "https://api.stakewiz.com/validator";
const GDINDEX_VALIDATOR_INDEX = "https://gdindex.app/gdi/validator-index.json";
const GDINDEX_POOL_LATEST = (address) =>
  `https://gdindex.app/gdi/pools/${address}/latest.json`;
const VALIDBLOCKS_LIVE_URL = "https://dashboards.validblocks.com/api/validator-live";
const VALIDATORS_APP_URL = (identity) =>
  `https://www.validators.app/api/v1/validators/mainnet/${identity}.json`;
const MARINADE_SELECT_BONDS_URL =
  "https://validator-bonds-api.marinade.finance/bonds/institutional";
const JPOOL_PUBLIC_URL = (vote) =>
  `https://api.jpool.one/validators/${encodeURIComponent(vote)}`;
const SVT_VALIDATOR_URL = (vote) =>
  `https://api.svt.one/validators/${encodeURIComponent(vote)}?network=mainnet&select=voteId,tvcRank,tvCredits,name`;

const CACHE_TTL_MS = 15 * 60 * 1000;
const VALIDATORS_APP_MAX_SCORE = 13;

/** Only StakeCraft vote accounts — keeps this from becoming an open proxy. */
export const ALLOWED_VOTE_ACCOUNTS = new Set([
  "BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g",
]);

const TRACKED_POOLS = [
  {
    id: "jsol",
    symbol: "JSOL",
    name: "JPool",
    tabId: "jpool",
    poolAddress: "CtMyWsrUtAwXWiGr9WjHT5fC3p3fgV8cyGpLTo2LJzG1",
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn/logo.svg",
    url: "https://app.jpool.one/validators/BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g?activeTab=direct",
  },
  {
    id: "definsol",
    symbol: "definSOL",
    name: "Definity",
    tabId: "definity",
    poolAddress: "Bvbu55B991evqqhLtKcyTZjzQ4EQzRUwtf9T4CcpMmPL",
    logo: "https://hv4gxzchk24cqfezebn3ujjz6oy2kbtztv5vghn6kpbkjc3vg4rq.arweave.net/n3W2lUNPCJpX9WXjXEl0Tx0hB57BvioKUG8pixx1A4o",
    url: "https://definity.finance/",
  },
  {
    id: "marinade-select",
    symbol: "Select",
    name: "Marinade Select",
    tabId: "marinade-select",
    poolAddress: null,
    membership: "marinade-select",
    logo: "/marinade-select-chip.png",
    url: "https://app.marinade.finance/?type=select",
  },
  {
    id: "vsol",
    symbol: "vSOL",
    name: "The Vault",
    tabId: "vault",
    poolAddress: "Fu9BYC6tWBo1KMKaP3CFoKfRhqv9akmy3DuYwnCyWiyC",
    logo: "https://bafkreig55mf3lazzbgndiqyqvdmchdsykvvebww7cqlws6ywgog5xfdzta.ipfs.nftstorage.link/",
    url: "https://thevault.finance/dapp/direct/",
  },
  {
    id: "stkesol",
    symbol: "STKESOL",
    name: "Sol Strategies",
    tabId: null,
    poolAddress: "StKeDUdSu7jMSnPJ1MPqDnk3RdEwD2QbJaisHMebGhw",
    logo: "",
    url: "https://gdindex.app/pools/StKeDUdSu7jMSnPJ1MPqDnk3RdEwD2QbJaisHMebGhw",
  },
  {
    id: "bsol",
    symbol: "bSOL",
    name: "SolBlaze",
    tabId: "solblaze",
    poolAddress: "stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi",
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1/logo.png",
    url: "https://stake.solblaze.org/app/?validator=BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g",
  },
  {
    id: "jagsol",
    symbol: "jagSOL",
    name: "JagPool",
    tabId: "jagpool",
    poolAddress: "jagEdDepWUgexiu4jxojcRWcVKKwFqgZBBuAoGu2BxM",
    logo: "https://arweave.net/hsBrk--wCnuMc5fCu6ckQCotTPQy6JJqqzwXa2Euefw",
    url: "https://www.jagpool.xyz/direct-stake?validator=BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g",
  },
  {
    id: "dzsol",
    symbol: "dzSOL",
    name: "DoubleZero",
    tabId: null,
    poolAddress: "3fV1sdGeXaNEZj6EPDTpub82pYxcRXwt2oie6jkSzeWi",
    logo: "https://fn474du36qdxqh6szvejo72imufs4tcnskea73kg4jx53e5rarba.arweave.net/K3n-Dpv0B3gf0s1Il39IZQsuTE2SiA_tRuJv3ZOxBEI",
    url: "https://gdindex.app/pools/3fV1sdGeXaNEZj6EPDTpub82pYxcRXwt2oie6jkSzeWi",
  },
];

const cache = new Map();

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function cacheSet(key, value) {
  cache.set(key, { at: Date.now(), value });
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "StakeCraftBackend/1.0" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

function truncateKey(key, head = 4, tail = 4) {
  if (!key || key.length <= head + tail + 1) return key || "";
  return `${key.slice(0, head)}…${key.slice(-tail)}`;
}

function formatSol(amount) {
  if (amount == null || Number.isNaN(amount)) return "—";
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M SOL`;
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(amount >= 10_000 ? 0 : 1)}k SOL`;
  }
  return `${amount.toFixed(0)} SOL`;
}

function formatPct(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Number(value).toFixed(digits)}%`;
}

function formatNum(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(digits);
}

async function loadStakewiz(vote) {
  return fetchJson(`${STAKEWIZ_URL}/${vote}`);
}

async function loadGdindexEntry(vote) {
  const index = await fetchJson(GDINDEX_VALIDATOR_INDEX);
  const entry = index?.validators?.find(
    (v) => v.vote_pubkey === vote || v.identity_pubkey === vote
  );
  return {
    entry: entry || null,
    rankableCount: index?.rankable_count ?? null,
    medianRarity: index?.median_composite_rarity ?? null,
    epoch: index?.epoch ?? null,
  };
}

async function loadMarinadeSelectMembership(vote) {
  const pool = TRACKED_POOLS.find((p) => p.membership === "marinade-select");
  if (!pool) return null;
  const data = await fetchJson(MARINADE_SELECT_BONDS_URL);
  const bond = data?.bonds?.find((b) => b.vote_account === vote);
  if (!bond) return null;
  return {
    ...pool,
    stakeSol: null,
    stakeLabel: "Select set",
  };
}

async function loadTrackedPools(vote) {
  const gdindexPools = TRACKED_POOLS.filter((pool) => pool.poolAddress);
  const results = await Promise.all(
    gdindexPools.map(async (pool) => {
      try {
        const detail = await fetchJson(GDINDEX_POOL_LATEST(pool.poolAddress));
        const hit = detail?.validators?.find((v) => v.pubkey === vote);
        const stakeSol = hit?.stake_sol ?? 0;
        if (!hit || stakeSol <= 0) return null;
        return {
          ...pool,
          stakeSol,
          stakeLabel: formatSol(stakeSol),
        };
      } catch {
        return null;
      }
    })
  );

  const pools = results.filter(Boolean).sort((a, b) => b.stakeSol - a.stakeSol);
  try {
    const select = await loadMarinadeSelectMembership(vote);
    if (select) pools.unshift(select);
  } catch (error) {
    console.warn("Marinade Select membership check failed:", error?.message || error);
  }
  return pools;
}

async function loadValidBlocks(vote) {
  const url = `${VALIDBLOCKS_LIVE_URL}?voteAccount=${encodeURIComponent(vote)}`;
  return fetchJson(url);
}

async function loadValidatorsApp(identity) {
  const token = config.validatorsAppToken;
  if (!token || !identity) return null;

  const response = await fetch(VALIDATORS_APP_URL(identity), {
    headers: {
      Accept: "application/json",
      Token: token,
      "User-Agent": "StakeCraftBackend/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`validators.app HTTP ${response.status}`);
  }
  return response.json();
}

async function loadJpoolPublic(vote) {
  return fetchJson(JPOOL_PUBLIC_URL(vote));
}

async function loadSvtTvc(vote) {
  const token = config.svtApiToken;
  if (!token) return null;

  const response = await fetch(SVT_VALIDATOR_URL(vote), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "StakeCraftBackend/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`SVT API HTTP ${response.status}`);
  }
  const data = await response.json();
  // Response may be a validator object or { data: [...] } / array.
  if (Array.isArray(data)) return data[0] || null;
  if (Array.isArray(data?.data)) return data.data[0] || null;
  return data;
}

function vaultEliteRankEntry(vote) {
  if (!config.vaultEliteEnabled && config.vaultEliteRank == null) return null;
  const value =
    config.vaultEliteRank != null ? `#${config.vaultEliteRank}` : "Elite";
  return {
    id: "vault-elite",
    label: "Vault Elite",
    value,
    href: `https://thevault.finance/dapp/direct/`,
  };
}

export async function getSolanaValidatorStats(voteAccount) {
  if (!voteAccount || !ALLOWED_VOTE_ACCOUNTS.has(voteAccount)) {
    const err = new Error("Unknown or unsupported vote account");
    err.status = 404;
    throw err;
  }

  const cached = cacheGet(voteAccount);
  if (cached) {
    return { ...cached, cache: "hit" };
  }

  const [
    stakewizResult,
    gdindexResult,
    poolsResult,
    validBlocksResult,
    jpoolResult,
    svtResult,
  ] = await Promise.allSettled([
    loadStakewiz(voteAccount),
    loadGdindexEntry(voteAccount),
    loadTrackedPools(voteAccount),
    loadValidBlocks(voteAccount),
    loadJpoolPublic(voteAccount),
    loadSvtTvc(voteAccount),
  ]);

  const stakewiz = stakewizResult.status === "fulfilled" ? stakewizResult.value : null;
  const gdindex = gdindexResult.status === "fulfilled" ? gdindexResult.value : null;
  const pools = poolsResult.status === "fulfilled" ? poolsResult.value : [];
  const validBlocks =
    validBlocksResult.status === "fulfilled" ? validBlocksResult.value : null;
  const jpool = jpoolResult.status === "fulfilled" ? jpoolResult.value : null;
  const svt = svtResult.status === "fulfilled" ? svtResult.value : null;
  if (jpoolResult.status === "rejected") {
    console.warn("JPool public API unavailable:", jpoolResult.reason?.message);
  }
  if (svtResult.status === "rejected") {
    console.warn("SVT TVC unavailable:", svtResult.reason?.message);
  }

  if (!stakewiz && !gdindex?.entry && !validBlocks) {
    const err = new Error("Unable to load validator stats");
    err.status = 502;
    throw err;
  }

  const identity =
    stakewiz?.identity ||
    gdindex?.entry?.identity_pubkey ||
    validBlocks?.nodePubkey ||
    "";
  const vote =
    stakewiz?.vote_identity || gdindex?.entry?.vote_pubkey || voteAccount;

  let validatorsApp = null;
  try {
    validatorsApp = await loadValidatorsApp(identity);
  } catch (error) {
    console.warn("validators.app unavailable:", error?.message || error);
  }

  const locationCity = stakewiz?.ip_city || gdindex?.entry?.city || "";
  const locationCountry = stakewiz?.ip_country || gdindex?.entry?.country || "";
  const location =
    locationCity && locationCountry && locationCity !== locationCountry
      ? `${locationCity}, ${locationCountry}`
      : locationCity || locationCountry || "—";

  const mevBps = stakewiz?.jito_commission_bps;
  const stats = {
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
    mevCommissionLabel: mevBps == null ? "—" : formatPct(mevBps / 100, 0),
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
        id: "stakewiz",
        label: "Stakewiz",
        value:
          stakewiz?.wiz_score != null
            ? `${formatNum(stakewiz.wiz_score)} · #${stakewiz.rank}`
            : null,
        href: `https://stakewiz.com/validator/${vote}`,
      },
      {
        id: "validators-app",
        label: "validators.app",
        value:
          validatorsApp?.total_score != null
            ? `${validatorsApp.total_score}/${VALIDATORS_APP_MAX_SCORE}`
            : null,
        href: identity
          ? `https://www.validators.app/validators/${identity}?locale=en&network=mainnet`
          : "https://www.validators.app/",
      },
      {
        id: "validblocks",
        label: "ValidBlocks",
        value:
          validBlocks?.creditsRank != null
            ? `#${validBlocks.creditsRank}${
                validBlocks.totalValidators != null
                  ? ` / ${validBlocks.totalValidators}`
                  : ""
              }`
            : null,
        href: `https://dashboards.validblocks.com/validator?pubkey=${vote}`,
      },
      {
        id: "jpool-tvc",
        label: "JPool TVC",
        value: svt?.tvcRank != null ? `#${svt.tvcRank}` : null,
        href: `https://app.jpool.one/validators/${vote}?activeTab=tvc`,
      },
      {
        id: "jpool-score",
        label: "JPool score",
        value:
          jpool?.jpool_score != null ? formatNum(jpool.jpool_score, 1) : null,
        href: `https://app.jpool.one/validators/${vote}`,
      },
      vaultEliteRankEntry(vote),
      {
        id: "gdi-rank",
        label: "Active-set",
        value:
          gdindex?.entry?.rank != null
            ? `#${gdindex.entry.rank}${
                gdindex.rankableCount != null ? ` / ${gdindex.rankableCount}` : ""
              }`
            : null,
        href: `https://gdindex.app/validator/${vote}`,
      },
      {
        id: "gdi-rarity",
        label: "Composite rarity",
        value:
          gdindex?.entry?.composite_rarity != null
            ? formatNum(gdindex.entry.composite_rarity)
            : null,
        href: `https://gdindex.app/validator/${vote}`,
      },
    ].filter((rank) => rank?.value),
    sources: {
      stakewiz: Boolean(stakewiz),
      gdindex: Boolean(gdindex?.entry),
      validBlocks: Boolean(validBlocks),
      validatorsApp: Boolean(validatorsApp),
      jpool: Boolean(jpool),
      svt: Boolean(svt),
      vaultElite: Boolean(config.vaultEliteEnabled || config.vaultEliteRank != null),
    },
    updatedAt: Date.now(),
  };

  cacheSet(voteAccount, stats);
  return { ...stats, cache: "miss" };
}
