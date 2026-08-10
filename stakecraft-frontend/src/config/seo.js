export const SITE_URL = 'https://stakecraft.com'

export const defaultSeo = {
  title: 'StakeCraft — Staking & Validator Infrastructure for Proof-of-Stake Networks',
  description:
    'StakeCraft runs validator nodes across Cosmos, Solana, Polkadot, NEAR, Sui and more. Delegate your stake, keep custody of your tokens, and earn rewards on infrastructure built for uptime.',
  // Cache-bust when replacing public/og-image.png so Telegram/etc. refetch
  ogImage: `${SITE_URL}/og-image.png?v=2`,
  ogType: 'website'
}

export const routeSeo = {
  home: {
    path: '/',
    ...defaultSeo,
    jsonLd: ['organization', 'service', 'faq']
  },
  swap: {
    path: '/swap',
    title: 'Token Swap — StakeCraft',
    description:
      'Swap tokens securely via the StakeCraft swap interface. Exchange assets across supported networks.',
    ogImage: `${SITE_URL}/og-image.png?v=2`,
    ogType: 'website',
    jsonLd: ['organization']
  },
  terms: {
    path: '/terms',
    title: 'Terms and Conditions — StakeCraft',
    description: 'Terms and conditions for using StakeCraft staking and validator services.',
    ogImage: `${SITE_URL}/og-image.png?v=2`,
    ogType: 'website',
    jsonLd: ['organization']
  },
  policy: {
    path: '/policy',
    title: 'Privacy Policy — StakeCraft',
    description: 'Privacy policy describing how StakeCraft collects and uses your information.',
    ogImage: `${SITE_URL}/og-image.png?v=2`,
    ogType: 'website',
    jsonLd: ['organization']
  }
}

/** Fallback FAQ copy when CMS / prefetch has no items yet. */
export const DEFAULT_FAQ_ITEMS = [
  {
    question: 'How do I delegate to StakeCraft?',
    answer:
      'Choose a network on the StakeCraft homepage, open your wallet (Phantom for Solana, Keplr for Cosmos, NEAR Wallet for NEAR), go to staking, search for StakeCraft or paste our validator address, enter the amount, and confirm. Your tokens stay in your wallet.'
  },
  {
    question: 'Which networks does StakeCraft validate?',
    answer:
      'StakeCraft operates validators on Solana, NEAR, Kava, Polygon, and additional Cosmos ecosystem chains including Juno, Stargaze, and Band Protocol, plus Polkadot, Sui, and Walrus storage nodes. See the mainnet section on stakecraft.com for the full live list.'
  },
  {
    question: 'What commission does StakeCraft charge?',
    answer:
      'Commission rates vary by network and are set competitively within each ecosystem. Check the specific network validator page or wallet staking UI for the current commission rate before delegating.'
  },
  {
    question: 'Has StakeCraft ever been slashed?',
    answer:
      'StakeCraft has not been slashed on any network it operates. We prioritize security, monitoring, and redundant infrastructure to minimize slashing risk.'
  },
  {
    question: 'Is my stake safe? Does StakeCraft hold my tokens?',
    answer:
      "Delegated tokens remain in your own wallet at all times. StakeCraft is a non-custodial infrastructure operator and never takes possession of your assets. You retain full control and can undelegate according to each network's unbonding rules."
  }
]

/** @deprecated use resolveFaqItems() — kept for older imports */
export const faqItems = DEFAULT_FAQ_ITEMS

export function normalizeFaqItems(items) {
  if (!Array.isArray(items) || items.length === 0) return []
  return items
    .filter((item) => item && item.isActive !== false && item.question && item.answer)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item) => ({
      question: item.question,
      answer: item.answer,
      _id: item._id,
      order: item.order
    }))
}

export function resolveFaqItems(items) {
  const normalized = normalizeFaqItems(items)
  return normalized.length > 0 ? normalized : DEFAULT_FAQ_ITEMS
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'StakeCraft',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/headerLogo.svg`,
    description:
      'Staking and validator infrastructure provider operating nodes across multiple proof-of-stake networks.',
    email: 'support@stakecraft.com',
    sameAs: [
      'https://x.com/stakecraft',
      'https://stakecraft.medium.com/',
      'https://discord.gg/xkYnNYV4qH'
    ]
  }
}

export function buildServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Staking Delegation',
    serviceType: 'Proof-of-stake validator delegation',
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: 'Worldwide',
    description:
      'Delegate tokens to StakeCraft validator nodes and earn staking rewards while retaining custody of your assets.',
    offers: {
      '@type': 'Offer',
      description: 'Validator delegation with network-specific commission rates.'
    }
  }
}

export function buildFaqSchema(items = DEFAULT_FAQ_ITEMS) {
  const faqList = resolveFaqItems(items)
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
}

export function getJsonLdBlocks(types = [], options = {}) {
  const blocks = []
  if (types.includes('organization')) blocks.push(buildOrganizationSchema())
  if (types.includes('service')) blocks.push(buildServiceSchema())
  if (types.includes('faq')) blocks.push(buildFaqSchema(options.faqItems))
  return blocks
}
