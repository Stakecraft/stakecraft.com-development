#!/usr/bin/env node
/**
 * Fallback: if vite-ssg did not emit HTML for a client-only route, copy index.html.
 * Prefer the SSG-built notadmin.html/health.html when present — those are real
 * admin/health shells. Overwriting them with the homepage caused the SPA to
 * hydrate as `/` and redirect away from /notadmin.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const indexHtml = join(distDir, 'index.html')

// Paths relative to dist/, without .html — nested paths get directories created.
const clientRoutes = ['notadmin', 'notadmin/login', 'health']

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
  mkdirSync(dirname(target), { recursive: true })
  // Prefer the dedicated notadmin shell when seeding the login path.
  const source =
    route.startsWith('notadmin') && existsSync(join(distDir, 'notadmin.html'))
      ? join(distDir, 'notadmin.html')
      : indexHtml
  copyFileSync(source, target)
  console.log(`copy-client-routes: wrote ${route}.html from ${source === indexHtml ? 'index.html' : 'notadmin.html'}`)
}
