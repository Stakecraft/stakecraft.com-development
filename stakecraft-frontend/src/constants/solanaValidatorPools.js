/**
 * Curated stake pools we track for the Solana trust strip.
 * Live stake is filled from GDIndex pool latest.json; logos from Sanctum/token lists.
 */
export const SOLANA_TRACKED_POOLS = [
  {
    id: 'jsol',
    symbol: 'JSOL',
    name: 'JPool',
    tabId: 'jpool',
    poolAddress: 'CtMyWsrUtAwXWiGr9WjHT5fC3p3fgV8cyGpLTo2LJzG1',
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn/logo.svg',
    url: 'https://app.jpool.one/validators/BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g?activeTab=direct'
  },
  {
    id: 'definsol',
    symbol: 'definSOL',
    name: 'Definity',
    tabId: 'definity',
    poolAddress: 'Bvbu55B991evqqhLtKcyTZjzQ4EQzRUwtf9T4CcpMmPL',
    logo: 'https://hv4gxzchk24cqfezebn3ujjz6oy2kbtztv5vghn6kpbkjc3vg4rq.arweave.net/n3W2lUNPCJpX9WXjXEl0Tx0hB57BvioKUG8pixx1A4o',
    url: 'https://definity.finance/'
  },
  {
    id: 'marinade-select',
    symbol: 'Select',
    name: 'Marinade Select',
    tabId: 'marinade-select',
    // Membership comes from Marinade institutional bonds, not GDIndex pool files.
    poolAddress: null,
    membership: 'marinade-select',
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
    url: 'https://app.marinade.finance/?type=select'
  },
  {
    id: 'vsol',
    symbol: 'vSOL',
    name: 'The Vault',
    tabId: 'vault',
    poolAddress: 'Fu9BYC6tWBo1KMKaP3CFoKfRhqv9akmy3DuYwnCyWiyC',
    logo: 'https://bafkreig55mf3lazzbgndiqyqvdmchdsykvvebww7cqlws6ywgog5xfdzta.ipfs.nftstorage.link/',
    url: 'https://thevault.finance/dapp/direct/'
  },
  {
    id: 'stkesol',
    symbol: 'STKESOL',
    name: 'Sol Strategies',
    // Algorithmic pool — no validator-directed stake UI for users.
    tabId: null,
    poolAddress: 'StKeDUdSu7jMSnPJ1MPqDnk3RdEwD2QbJaisHMebGhw',
    logo: '',
    url: 'https://gdindex.app/pools/StKeDUdSu7jMSnPJ1MPqDnk3RdEwD2QbJaisHMebGhw'
  },
  {
    id: 'bsol',
    symbol: 'bSOL',
    name: 'SolBlaze',
    tabId: 'solblaze',
    poolAddress: 'stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi',
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1/logo.png',
    url: 'https://stake.solblaze.org/app/?validator=BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g'
  },
  {
    id: 'jagsol',
    symbol: 'jagSOL',
    name: 'JagPool',
    tabId: 'jagpool',
    poolAddress: 'jagEdDepWUgexiu4jxojcRWcVKKwFqgZBBuAoGu2BxM',
    logo: 'https://arweave.net/hsBrk--wCnuMc5fCu6ckQCotTPQy6JJqqzwXa2Euefw',
    url: 'https://www.jagpool.xyz/direct-stake?validator=BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g'
  },
  {
    id: 'dzsol',
    symbol: 'dzSOL',
    name: 'DoubleZero',
    // Delegation program pool — no validator-directed stake UI for users.
    tabId: null,
    poolAddress: '3fV1sdGeXaNEZj6EPDTpub82pYxcRXwt2oie6jkSzeWi',
    logo: 'https://fn474du36qdxqh6szvejo72imufs4tcnskea73kg4jx53e5rarba.arweave.net/K3n-Dpv0B3gf0s1Il39IZQsuTE2SiA_tRuJv3ZOxBEI',
    url: 'https://gdindex.app/pools/3fV1sdGeXaNEZj6EPDTpub82pYxcRXwt2oie6jkSzeWi'
  }
]
