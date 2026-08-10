<template>
  <div v-if="page" class="network-staking">
    <section class="hero mainAreas">
      <p class="brand">{{ page.brandLine }}</p>
      <h1 class="headline">{{ page.h1 }}</h1>
      <p class="intro">{{ page.intro }}</p>
      <div class="cta-group">
        <router-link class="cta cta-primary" to="/#mainnet">Stake on StakeCraft</router-link>
        <a
          v-if="page.explorer"
          class="cta cta-secondary"
          :href="page.explorer"
          target="_blank"
          rel="noopener noreferrer"
        >
          View validator
        </a>
      </div>
    </section>

    <section class="section mainAreas" aria-labelledby="how-heading">
      <h2 id="how-heading" class="titleHeader">How to stake {{ page.token }}</h2>
      <ol class="steps">
        <li v-for="(step, index) in page.steps" :key="index">{{ step }}</li>
      </ol>
      <p class="validator-line">
        Validator:
        <code>{{ page.validator }}</code>
      </p>
      <p v-if="page.howToStake" class="guide-link">
        <a :href="page.howToStake" target="_blank" rel="noopener noreferrer">
          {{ page.networkName }} staking guide
        </a>
      </p>
    </section>

    <section class="section mainAreas" aria-labelledby="why-heading">
      <h2 id="why-heading" class="titleHeader">Why StakeCraft for {{ page.networkName }}</h2>
      <ul class="why-list">
        <li v-for="(item, index) in page.why" :key="index">{{ item }}</li>
      </ul>
    </section>

    <section class="section mainAreas faq" aria-labelledby="network-faq-heading">
      <h2 id="network-faq-heading" class="titleHeader">{{ page.networkName }} staking FAQ</h2>
      <div v-for="(item, index) in page.faqItems" :key="item.question" class="faq-item">
        <h3 class="faq-q">{{ item.question }}</h3>
        <p class="faq-a">{{ item.answer }}</p>
      </div>
    </section>

    <section class="section mainAreas related" aria-labelledby="related-heading">
      <h2 id="related-heading" class="titleHeader">More staking networks</h2>
      <p class="related-links">
        <router-link to="/">Home</router-link>
        <template v-for="link in page.related" :key="link.path">
          ·
          <router-link :to="link.path">{{ link.label }}</router-link>
        </template>
      </p>
    </section>

    <LetsConnect />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LetsConnect from '../components/LetsConnect.vue'
import { useSeo } from '../composables/useSeo.js'
import { routeSeo } from '../config/seo.js'
import { getNetworkStakingPage } from '../constants/networkStakingPages.js'

export default {
  name: 'NetworkStakingView',
  components: { LetsConnect },
  setup() {
    const route = useRoute()
    const pageData = getNetworkStakingPage(route.meta.networkSlug)
    const page = computed(() => pageData)
    const seoBase = routeSeo[route.meta.seoKey] || routeSeo.home

    useSeo({
      ...seoBase,
      faqItems: pageData?.faqItems,
      service: pageData?.service
    })

    return { page }
  }
}
</script>

<style scoped>
.network-staking {
  margin-top: 80px;
}

.hero {
  padding-top: 48px;
  padding-bottom: 64px;
}

.brand {
  margin: 0 0 12px;
  font-family: generalSans;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.headline {
  margin: 0 0 20px;
  font-family: generalSans;
  font-size: 64px;
  font-weight: 600;
  line-height: 1.1;
}

.intro {
  max-width: 720px;
  margin: 0 0 32px;
  font-size: 20px;
  line-height: 30px;
}

.cta-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 24px;
  font-family: poppins;
  font-size: 16px;
  text-decoration: none;
  border: 1px solid currentColor;
}

.cta-primary {
  background: var(--van-text-color);
  color: var(--van-background);
  border-color: var(--van-text-color);
}

.cta-secondary {
  color: var(--van-text-color);
}

.section {
  padding-top: 72px;
  padding-bottom: 72px;
}

.steps,
.why-list {
  max-width: 720px;
  margin: 0;
  padding-left: 1.25rem;
  font-family: poppins;
  font-size: 16px;
  line-height: 28px;
}

.steps li + li,
.why-list li + li {
  margin-top: 10px;
}

.validator-line {
  margin: 28px 0 0;
  font-family: poppins;
  font-size: 15px;
  line-height: 24px;
  word-break: break-all;
}

.validator-line code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
}

.guide-link {
  margin: 16px 0 0;
  font-family: poppins;
  font-size: 16px;
}

.guide-link a,
.related-links a {
  color: var(--van-text-color);
  text-decoration: underline;
}

.faq-item + .faq-item {
  margin-top: 28px;
}

.faq-q {
  margin: 0 0 8px;
  font-family: generalSans;
  font-size: 22px;
  font-weight: 600;
}

.faq-a {
  margin: 0;
  max-width: 720px;
  font-family: poppins;
  font-size: 16px;
  line-height: 26px;
}

.related-links {
  margin: 0;
  font-family: poppins;
  font-size: 16px;
  line-height: 28px;
}

@media only screen and (max-width: 900px) {
  .headline {
    font-size: 40px;
  }

  .intro {
    font-size: 18px;
    line-height: 28px;
  }

  .section {
    padding-top: 56px;
    padding-bottom: 56px;
  }
}
</style>
