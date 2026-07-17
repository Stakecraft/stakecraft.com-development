#!/usr/bin/env node
/**
 * Fallback: if vite-ssg did not emit HTML for a client-only route, copy index.html.
 * Prefer the SSG-built notadmin.html/health.html when present — those are real
 * admin/health shells. Overwriting them with the homepage caused the SPA to
 * hydrate as `/` and redirect away from /notadmin.
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
  if (existsSync(target)) {
    console.log(`copy-client-routes: kept existing ${route}.html`)
    continue
  }
  copyFileSync(indexHtml, target)
  console.log(`copy-client-routes: wrote ${route}.html from index.html`)
}
