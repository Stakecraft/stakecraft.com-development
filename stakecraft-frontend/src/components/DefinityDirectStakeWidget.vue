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

    onMounted(async () => {
      try {
        await loadDefinityScript()
        if (cancelled) return
        // SPA-safe remount entry exposed by the Definity embed.
        window.DefinityDirectStake?.mount?.()
      } catch (error) {
        console.error(error)
      }
    })

    onBeforeUnmount(() => {
      cancelled = true
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
