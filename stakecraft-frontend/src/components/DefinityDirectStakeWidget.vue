<template>
  <div
    ref="host"
    class="definityHost"
    data-definity-direct-stake
    :data-vote="vote"
    :data-name="name"
    :data-image="image || undefined"
    :data-ref="refCode || undefined"
  />
</template>

<script>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const SCRIPT_SRC = 'https://definity.finance/embed/v1/widget.js'
const SCRIPT_ID = 'definity-direct-stake-widget'
const THEME_STYLE_ID = 'stakecraft-definity-theme'

/**
 * Definity ships a hardcoded dark/blue palette inside an open shadow root
 * and exposes no theme API — override their .dfy-* classes to match the
 * StakeCraft native stake card on the light Solana stake section.
 */
const STAKECRAFT_THEME_CSS = `
  .dfy-card {
    background: #ffffff;
    color: #111217;
    border: 1px solid #ebedf0;
    border-radius: 20px;
    padding: 22px;
    font-family: poppins, Helvetica, sans-serif;
    box-sizing: border-box;
    height: 100%;
  }
  .dfy-eyebrow,
  .dfy-label,
  .dfy-mono,
  .dfy-note,
  .dfy-foot,
  .dfy-out {
    color: #111217;
    opacity: 0.7;
  }
  .dfy-val {
    border-bottom-color: #ebedf0;
  }
  .dfy-ava {
    background: #f0f0f0;
  }
  .dfy-name {
    color: #111217;
  }
  .dfy-amt {
    background: #f0f0f0;
    border: 1px solid #ebedf0;
    border-radius: 14px;
  }
  .dfy-amt input {
    color: #111217;
  }
  .dfy-amt input::placeholder {
    color: #111217;
    opacity: 0.35;
  }
  .dfy-amt span {
    color: #111217;
    opacity: 0.7;
  }
  .dfy-btn {
    background: #35f6df;
    color: #111217;
    border-radius: 20px;
    font-weight: 700;
  }
  .dfy-btn:hover {
    opacity: 0.95;
    filter: brightness(0.97);
  }
  .dfy-wbtn {
    background: #ffffff;
    border: 1px solid #ebedf0;
    border-radius: 14px;
    color: #111217;
  }
  .dfy-wbtn:hover {
    border-color: #35f6df;
  }
  .dfy-link,
  .dfy-max {
    color: #00beb5;
  }
  .dfy-x {
    color: #111217;
    opacity: 0.65;
  }
  .dfy-x:hover {
    color: #111217;
    opacity: 1;
  }
  .dfy-tabs {
    background: #f0f0f0;
    border: 1px solid #ebedf0;
    border-radius: 14px;
  }
  .dfy-tab {
    color: #111217;
    opacity: 0.7;
    border-radius: 12px;
  }
  .dfy-tab-on {
    background: #35f6df;
    color: #111217;
    opacity: 1;
  }
  .dfy-dot {
    background: #35f6df;
  }
  .dfy-oki {
    background: rgba(53, 246, 223, 0.18);
    color: #00beb5;
  }
  .dfy-err {
    color: #dc2626;
  }
`

function loadDefinityScript() {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.DefinityDirectStake?.mount) return Promise.resolve()

  const existing = document.getElementById(SCRIPT_ID)
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.DefinityDirectStake?.mount) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Definity widget failed to load')), {
        once: true
      })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Definity widget failed to load')), {
      once: true
    })
    document.body.appendChild(script)
  })
}

function applyStakeCraftTheme(hostEl) {
  const root = hostEl?.shadowRoot
  if (!root) return false
  let style = root.getElementById(THEME_STYLE_ID)
  if (!style) {
    style = document.createElement('style')
    style.id = THEME_STYLE_ID
    root.appendChild(style)
  }
  style.textContent = STAKECRAFT_THEME_CSS
  return true
}

export default {
  name: 'DefinityDirectStakeWidget',
  props: {
    vote: { type: String, required: true },
    name: { type: String, default: 'StakeCraft' },
    image: { type: String, default: '' },
    refCode: { type: String, default: '' }
  },
  setup() {
    const host = ref(null)
    let cancelled = false
    let observer = null
    let tries = 0

    const tryTheme = () => {
      if (cancelled || !host.value) return
      if (applyStakeCraftTheme(host.value)) {
        const root = host.value.shadowRoot
        if (root && !observer) {
          // Keep our overrides last if Definity rewrites its style node.
          observer = new MutationObserver(() => applyStakeCraftTheme(host.value))
          observer.observe(root, { childList: true })
        }
        return
      }
      if (tries++ < 40) {
        requestAnimationFrame(tryTheme)
      }
    }

    onMounted(async () => {
      try {
        await loadDefinityScript()
        if (cancelled) return
        // SPA-safe remount entry exposed by the Definity embed.
        window.DefinityDirectStake?.mount?.()
        tryTheme()
      } catch (error) {
        console.error(error)
      }
    })

    onBeforeUnmount(() => {
      cancelled = true
      observer?.disconnect()
    })

    return { host }
  }
}
</script>

<style scoped>
.definityHost {
  width: 100%;
  max-width: 480px;
  height: 100%;
  min-height: 220px;
}
</style>
