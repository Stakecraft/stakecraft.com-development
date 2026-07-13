#!/usr/bin/env node
/**
 * Prefetches CMS content from the API at build time for SSG prerendering.
 */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const API_BASE =
  process.env.VITE_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'https://api.stakecraft.com/api'

const endpoints = ['mainnet', 'testnet', 'partnership', 'about', 'team', 'content/menu']

async function fetchEndpoint(path) {
  try {
    const res = await fetch(`${API_BASE}/${path}`)
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? json
  } catch (err) {
    console.warn(`Prefetch failed for ${path}:`, err.message)
    return null
  }
}

const data = {}
for (const ep of endpoints) {
  const key = ep.replace('content/', '')
  data[key] = await fetchEndpoint(ep)
  console.log(`Prefetched ${ep}: ${Array.isArray(data[key]) ? data[key].length : data[key] ? 'ok' : 'empty'} items`)
}

const outPath = join(__dirname, '../src/data/prefetched.json')
writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8')
console.log(`Wrote ${outPath}`)
