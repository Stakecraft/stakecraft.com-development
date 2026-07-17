#!/usr/bin/env node
/**
 * Emit real HTML files for client-only SPA routes.
 *
 * Cloudflare Pages: if a project has 404.html, unknown paths are NOT served as
 * the SPA. Rewriting /notadmin → /index.html via _redirects then 308s to /
 * because Pages redirects /index.html to /. Serving notadmin.html fixes that
 * (Pages maps /notadmin.html → /notadmin).
 */
import { copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const indexHtml = join(distDir, 'index.html')

const clientRoutes = ['notadmin', 'health']

if (!existsSync(indexHtml)) {
  console.error('copy-client-routes: dist/index.html not found — run vite-ssg build first')
  process.exit(1)
}

for (const route of clientRoutes) {
  const target = join(distDir, `${route}.html`)
  copyFileSync(indexHtml, target)
  console.log(`copy-client-routes: wrote ${route}.html`)
}
