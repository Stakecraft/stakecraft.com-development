#!/usr/bin/env node
/**
 * Generates sitemap.xml at build time from the public route list.
 * Run before vite-ssg build.
 */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE_URL = 'https://stakecraft.com'
const lastmod = new Date().toISOString().split('T')[0]

const routes = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/swap', changefreq: 'monthly', priority: '0.7' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/policy', changefreq: 'yearly', priority: '0.3' }
]

const urls = routes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

const outPath = join(__dirname, '../public/sitemap.xml')
writeFileSync(outPath, xml, 'utf8')
console.log(`Generated ${outPath}`)
