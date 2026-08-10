/**
 * Content for prerendered network staking SEO landing pages.
 * Validator / explorer data mirrors src/data/prefetched.json mainnet entries.
 */

export const networkStakingPages = {
  solana: {
    slug: 'solana',
    path: '/solana-staking',
    seoKey: 'solanaStaking',
    networkName: 'Solana',
    /** Must match the CMS mainnet item title that StakingModals.vue switches on. */
    mainnetTitle: 'Solana',
    h1: 'Solana Staking',
    brandLine: 'StakeCraft',
    intro:
      'Delegate SOL to the StakeCraft Solana validator. Non-custodial Solana staking — your tokens stay in your wallet while our staking infrastructure earns rewards.',
    token: 'SOL',
    wallet: 'Phantom',
    validator: 'BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g',
    explorer:
      'https://stakewiz.com/validator/BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g',
    howToStake:
      'https://stakecraft.medium.com/stakecraft-launches-direct-staking-support-for-solana-near-kava-and-supra-df9f4987f406',
    stakingOptions: [
      {
        id: 'native',
        title: 'Native staking',
        tabLabel: 'Native staking',
        description:
          'Delegate SOL straight to the StakeCraft validator through the Solana protocol. Your stake stays in a native stake account you own — no pool token, no smart-contract layer. Unstaking follows the normal ~2-day deactivation.',
        steps: [
          'Open Phantom (or another Solana wallet) and fund it with SOL.',
          'Go to staking in your wallet, or open StakeCraft and choose Solana on the mainnet section.',
          'Search for StakeCraft or paste our Solana validator vote account.',
          'Enter the amount to delegate and confirm. Your SOL remains under your custody.'
        ],
        action: 'modal',
        ctaLabel: 'Stake natively'
      },
      {
        id: 'jpool',
        title: 'JPool direct staking',
        tabLabel: 'JPool · JSOL',
        description:
          'Stake through the JPool pool directed at our validator and receive JSOL, a liquid token you can use in DeFi. JPool matches direct delegations, so your stake also boosts the validator beyond your own deposit.',
        steps: [
          'Open the JPool direct staking page — the StakeCraft validator is preselected.',
          'Connect your Solana wallet and enter the amount of SOL on the Direct tab.',
          'Confirm the transaction. Your SOL is delegated to StakeCraft and you receive JSOL.',
          'Use JSOL in DeFi or unstake anytime — your delegation keeps earning while you hold it.'
        ],
        action: 'external',
        url: 'https://app.jpool.one/validators/BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g?activeTab=direct',
        ctaLabel: 'Stake via JPool'
      },
      {
        id: 'solblaze',
        title: 'SolBlaze custom liquid staking',
        tabLabel: 'SolBlaze · bSOL',
        description:
          'BlazeStake Custom Liquid Staking delegates your SOL 1:1 to the StakeCraft validator while you hold bSOL. Keep liquidity for DeFi while supporting our node directly.',
        steps: [
          'Open the SolBlaze staking page with the StakeCraft validator preselected.',
          'Connect your Solana wallet and choose how much SOL to stake.',
          'Confirm to receive bSOL while your SOL is delegated 1:1 to StakeCraft.',
          'Keep the bSOL in your wallet or supported DeFi to maintain the delegation.'
        ],
        action: 'external',
        url: 'https://stake.solblaze.org/app/?validator=BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g',
        ctaLabel: 'Stake via SolBlaze'
      },
      {
        id: 'jagpool',
        title: 'JagPool direct staking',
        tabLabel: 'JagPool · jagSOL',
        description:
          'JagPool is a non-custodial stake pool built on the audited Solana stake pool program. Direct-stake to the StakeCraft validator and receive jagSOL, a liquid token that grows in value as rewards accrue and can be redeemed for SOL anytime.',
        steps: [
          'Open the JagPool direct staking page — the StakeCraft validator is preselected.',
          'Connect your Solana wallet and enter the amount of SOL to stake.',
          'Confirm the transaction. Your SOL is directed to StakeCraft and you receive jagSOL.',
          'Hold or use jagSOL in DeFi; redeem it for SOL plus accrued rewards whenever you like.'
        ],
        action: 'external',
        url: 'https://www.jagpool.xyz/direct-stake?validator=BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g',
        ctaLabel: 'Stake via JagPool'
      }
    ],
    why: [
      'Purpose-built Solana staking infrastructure with monitoring and uptime focus.',
      'Non-custodial: StakeCraft never takes possession of your SOL.',
      'Same staking provider you can use across NEAR, Monad, and other networks.'
    ],
    faqItems: [
      {
        question: 'How do I stake Solana with StakeCraft?',
        answer:
          'Use Phantom or another Solana wallet, open staking, search for StakeCraft or paste validator BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g, then confirm the delegation. Your SOL stays in your wallet.'
      },
      {
        question: 'Is StakeCraft a custodial Solana staking provider?',
        answer:
          'No. StakeCraft is a non-custodial staking provider. Delegated SOL remains in your wallet; we operate the validator staking infrastructure.'
      },
      {
        question: 'Where can I verify the StakeCraft Solana validator?',
        answer:
          'Use the StakeWiz explorer link on this page for live validator stats, or start from the Solana network button on stakecraft.com.'
      },
      {
        question: 'Can I stake SOL to StakeCraft through a liquid staking pool?',
        answer:
          'Yes. JPool direct staking, SolBlaze custom liquid staking, and JagPool direct staking all let you point pool stake at the StakeCraft validator while you receive a liquid token (JSOL, bSOL, or jagSOL) to use in DeFi. Native protocol staking remains available if you prefer a plain stake account.'
      }
    ],
    service: {
      name: 'Solana Staking',
      serviceType: 'Solana proof-of-stake validator delegation',
      description:
        'Non-custodial Solana staking with the StakeCraft validator. Delegate SOL, retain custody, and earn staking rewards.'
    },
    related: [
      { path: '/near-staking', label: 'NEAR staking' },
      { path: '/monad-staking', label: 'Monad staking' }
    ]
  },
  near: {
    slug: 'near',
    path: '/near-staking',
    seoKey: 'nearStaking',
    networkName: 'NEAR',
    mainnetTitle: 'Near Protocol',
    h1: 'NEAR Staking',
    brandLine: 'StakeCraft',
    intro:
      'Delegate NEAR to stakecraft.poolv1.near. Non-custodial NEAR staking — keep custody of your tokens while StakeCraft runs the staking infrastructure.',
    token: 'NEAR',
    wallet: 'NEAR Wallet',
    validator: 'stakecraft.poolv1.near',
    explorer: 'https://nearscope.net/validator/stakecraft.poolv1.near/tab/dashboard',
    howToStake:
      'https://stakecraft.medium.com/stakecraft-launches-direct-staking-support-for-solana-near-kava-and-supra-df9f4987f406',
    steps: [
      'Open NEAR Wallet (or another NEAR-compatible wallet) with NEAR to stake.',
      'Open StakeCraft and choose Near Protocol on the mainnet section, or stake from your wallet.',
      'Select the StakeCraft pool: stakecraft.poolv1.near.',
      'Confirm the stake transaction. Your NEAR remains under your custody.'
    ],
    why: [
      'Reliable NEAR staking infrastructure from an established multi-chain provider.',
      'Non-custodial pool staking — you control your keys and tokens.',
      'One staking provider for NEAR, Solana, Monad, and more.'
    ],
    faqItems: [
      {
        question: 'What is the StakeCraft NEAR validator pool?',
        answer:
          'StakeCraft’s NEAR staking pool is stakecraft.poolv1.near. Delegate NEAR to that pool through your wallet or the StakeCraft site.'
      },
      {
        question: 'Does StakeCraft custody my NEAR?',
        answer:
          'No. StakeCraft is a non-custodial staking provider. You stake from your own wallet; we operate the validator infrastructure.'
      },
      {
        question: 'How do I undelegate NEAR from StakeCraft?',
        answer:
          'Use your NEAR wallet staking UI to unstake from stakecraft.poolv1.near and follow NEAR’s unbonding period before withdrawing.'
      }
    ],
    service: {
      name: 'NEAR Staking',
      serviceType: 'NEAR proof-of-stake validator delegation',
      description:
        'Non-custodial NEAR staking with StakeCraft pool stakecraft.poolv1.near. Delegate NEAR, retain custody, and earn staking rewards.'
    },
    related: [
      { path: '/solana-staking', label: 'Solana staking' },
      { path: '/monad-staking', label: 'Monad staking' }
    ]
  },
  monad: {
    slug: 'monad',
    path: '/monad-staking',
    seoKey: 'monadStaking',
    networkName: 'Monad',
    mainnetTitle: 'Monad',
    h1: 'Monad Staking',
    brandLine: 'StakeCraft',
    intro:
      'Delegate to the StakeCraft Monad validator. Non-custodial Monad staking on high-performance EVM infrastructure — keep custody of your tokens while you earn rewards.',
    token: 'MON',
    wallet: 'a Monad-compatible EVM wallet',
    validator: '0xadbe62e7c9e0b4902b1aae233a774386892e36bc',
    explorer:
      'https://monadvision.com/address/0xAdBe62e7C9E0B4902B1AAe233a774386892E36bc',
    howToStake: 'https://docs.monad.xyz/',
    steps: [
      'Connect a Monad-compatible wallet with tokens ready to stake.',
      'Open StakeCraft and choose Monad on the mainnet section.',
      'Confirm the StakeCraft Monad validator address before delegating.',
      'Complete the stake transaction. Your tokens remain in your wallet.'
    ],
    why: [
      'Early Monad staking infrastructure from a multi-chain staking provider.',
      'Non-custodial delegation — StakeCraft does not take custody of your assets.',
      'Same operator reliability used for Solana staking and NEAR staking.'
    ],
    faqItems: [
      {
        question: 'How do I stake on Monad with StakeCraft?',
        answer:
          'Open the Monad network on stakecraft.com, connect a compatible wallet, and delegate to validator 0xadbe62e7c9e0b4902b1aae233a774386892e36bc. Keep custody of your tokens throughout.'
      },
      {
        question: 'Is Monad staking with StakeCraft custodial?',
        answer:
          'No. StakeCraft provides staking infrastructure as a non-custodial staking provider. Delegated tokens stay in your wallet.'
      },
      {
        question: 'Where can I see the StakeCraft Monad validator?',
        answer:
          'Use the MonadVision explorer link on this page, or start from the Monad button in the StakeCraft mainnet section.'
      }
    ],
    service: {
      name: 'Monad Staking',
      serviceType: 'Monad proof-of-stake validator delegation',
      description:
        'Non-custodial Monad staking with the StakeCraft validator. Delegate, retain custody, and earn staking rewards on Monad.'
    },
    related: [
      { path: '/solana-staking', label: 'Solana staking' },
      { path: '/near-staking', label: 'NEAR staking' }
    ]
  }
}

export function getNetworkStakingPage(slug) {
  return networkStakingPages[slug] || null
}

export const networkStakingSlugs = Object.keys(networkStakingPages)
