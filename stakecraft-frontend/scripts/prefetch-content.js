#!/usr/bin/env node
/**
 * Prefetches CMS content from the API at build time for SSG prerendering.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_API_BASE = 'https://backend.stakecraft.com/api'

function resolveApiBase() {
  const raw = (process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || '').trim()

  if (!raw) {
    return DEFAULT_API_BASE
  }

  const normalized = raw.replace(/\/$/, '')

  // Cloudflare env is sometimes set to the Pages frontend URL by mistake.
  if (/pages\.dev$/i.test(normalized) || /^https:\/\/(www\.)?stakecraft\.com$/i.test(normalized)) {
    console.warn(
      `Ignoring frontend URL "${normalized}" for prefetch; using ${DEFAULT_API_BASE}`
    )
    return DEFAULT_API_BASE
  }

  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
}

const API_BASE = resolveApiBase()
const endpoints = ['mainnet', 'testnet', 'partnership', 'about', 'team', 'content/menu']
const outPath = join(__dirname, '../src/data/prefetched.json')

function loadExistingData() {
  if (!existsSync(outPath)) {
    return {}
  }

  try {
    return JSON.parse(readFileSync(outPath, 'utf8'))
  } catch (err) {
    console.warn('Could not read existing prefetched.json:', err.message)
    return {}
  }
}

async function fetchEndpoint(path) {
  const url = `${API_BASE}/${path}`

  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`Prefetch failed for ${path}: HTTP ${res.status}`)
      return null
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      console.warn(
        `Prefetch failed for ${path}: expected JSON from ${url}, got ${contentType || 'unknown'}`
      )
      return null
    }

    const json = await res.json()
    return json?.data ?? json
  } catch (err) {
    console.warn(`Prefetch failed for ${path}:`, err.message)
    return null
  }
}

console.log(`Prefetching CMS content from ${API_BASE}`)

const existing = loadExistingData()
const data = { ...existing }
let successCount = 0

for (const ep of endpoints) {
  const key = ep.replace('content/', '')
  const result = await fetchEndpoint(ep)

  if (result != null) {
    data[key] = result
    successCount += 1
  } else if (!(key in data)) {
    data[key] = null
  }

  console.log(
    `Prefetched ${ep}: ${Array.isArray(data[key]) ? data[key].length : data[key] ? 'ok' : 'empty'} items`
  )
}

if (successCount === 0 && Object.keys(existing).length > 0) {
  console.warn('All prefetch requests failed; keeping committed prefetched.json unchanged')
} else {
  writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8')
  console.log(`Wrote ${outPath}`)
}
