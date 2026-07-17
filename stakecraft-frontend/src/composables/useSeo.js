import { ref, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { SITE_URL, getJsonLdBlocks } from '../config/seo.js'
import prefetchedData from '../data/prefetched.json'

/**
 * Apply per-route SEO meta tags and JSON-LD structured data.
 * @param {object} seo - { title, description, path, ogImage, ogType, jsonLd }
 */
export function useSeo(seo) {
  const canonical = `${SITE_URL}${seo.path || '/'}`
  const jsonLdBlocks = getJsonLdBlocks(seo.jsonLd || [], {
    faqItems: prefetchedData.faq
  })

  useHead({
    title: seo.title,
    meta: [
      { name: 'description', content: seo.description },
      { property: 'og:type', content: seo.ogType || 'website' },
      { property: 'og:site_name', content: 'StakeCraft' },
      { property: 'og:url', content: canonical },
      { property: 'og:title', content: seo.title },
      { property: 'og:description', content: seo.description },
      { property: 'og:image', content: seo.ogImage },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seo.title },
      { name: 'twitter:description', content: seo.description },
      { name: 'twitter:image', content: seo.ogImage }
    ],
    link: [{ rel: 'canonical', href: canonical }],
    script: jsonLdBlocks.map((block, i) => ({
      key: `jsonld-${i}`,
      type: 'application/ld+json',
      innerHTML: JSON.stringify(block)
    }))
  })
}

/**
 * Sanitize URLs for use in href attributes — blocks javascript: and data: schemes.
 */
export function safeHref(url) {
  if (!url || typeof url !== 'string') return '#'
  const trimmed = url.trim()
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('tg://') || trimmed.startsWith('mailto:')) return trimmed
  return '#'
}

/**
 * Returns rel attribute for external links.
 */
export function externalRel(isExternal) {
  return isExternal ? 'noopener noreferrer' : undefined
}

export function useClientOnly(defaultValue) {
  const value = ref(defaultValue)
  onMounted(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored) value.value = stored
    }
  })
  return value
}
