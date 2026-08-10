<template>
  <div class="not-found">
    <h1>404</h1>
    <p>The page you requested does not exist.</p>
    <a href="/">Return to homepage</a>
  </div>
</template>

<script>
import { useSeo } from '../composables/useSeo.js'

export default {
  setup() {
    useSeo({
      title: 'Page Not Found — StakeCraft',
      description: 'The requested page was not found on StakeCraft.',
      path: '/404',
      ogImage: 'https://stakecraft.com/og-image.png?v=2',
      jsonLd: []
    })
  }
}
</script>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}
h1 { font-size: 4rem; color: #35f6df; }
p { margin: 1rem 0 1.5rem; color: #5b666f; }
a { color: #0e7c86; font-weight: 600; }
</style>
