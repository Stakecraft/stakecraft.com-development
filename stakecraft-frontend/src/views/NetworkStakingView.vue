<template>
  <div v-if="page">
    <div class="networkHero">
      <div class="presentation">
        <h1 class="titleArea">
          <span class="titleLvl1">{{ page.networkName }}</span>
          <span class="titleLvl2">Staking</span>
        </h1>
        <div class="websiteDescription">
          {{ page.intro }}
        </div>
        <div class="ctaGroup">
          <button v-if="stakingNetwork" class="ctaPrimary" type="button" @click="stakeNow">
            Stake {{ page.token }} now
          </button>
          <router-link v-else class="ctaPrimary" to="/#mainnet">
            Stake with StakeCraft
          </router-link>
          <a
            v-if="page.explorer"
            class="ctaSecondary"
            :href="page.explorer"
            target="_blank"
            rel="noopener noreferrer"
          >
            View validator
          </a>
        </div>
      </div>
      <div class="imageArea" />
    </div>

    <div v-if="page.stakingOptions" class="mainAreas optionsSection">
      <div class="titleHeader">Ways to stake {{ page.token }}</div>
      <div class="optionsGrid">
        <div v-for="option in page.stakingOptions" :key="option.id" class="optionCard">
          <div class="optionTag">{{ option.tag }}</div>
          <h3 class="optionTitle">{{ option.title }}</h3>
          <p class="optionDescription">{{ option.description }}</p>
          <button
            v-if="option.action === 'modal' && stakingNetwork"
            class="ctaPrimary optionCta"
            type="button"
            @click="stakeNow"
          >
            {{ option.ctaLabel }}
          </button>
          <router-link
            v-else-if="option.action === 'modal'"
            class="ctaPrimary optionCta"
            to="/#mainnet"
          >
            {{ option.ctaLabel }}
          </router-link>
          <a
            v-else
            class="ctaSecondary optionCta"
            :href="option.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ option.ctaLabel }}
          </a>
        </div>
      </div>
    </div>

    <div class="mainAreas stakeSection" :id="`how-to-stake-${page.slug}`">
      <div class="titleHeader">How to stake {{ page.token }}</div>
      <div class="stepsArea">
        <div v-for="(step, index) in page.steps" :key="index" class="stepCard">
          <div class="stepNumber">{{ index + 1 }}</div>
          <div class="stepText">{{ step }}</div>
        </div>
      </div>
      <div class="validatorCard">
        <div class="validatorLabel">Validator address</div>
        <code class="validatorValue">{{ page.validator }}</code>
      </div>
      <p v-if="page.howToStake" class="guideLink">
        <a :href="page.howToStake" target="_blank" rel="noopener noreferrer">
          Read the full {{ page.networkName }} staking guide
        </a>
      </p>
    </div>

    <div class="whySection">
      <div class="mainAreas">
        <div class="titleHeader">Why StakeCraft for {{ page.networkName }}?</div>
        <div class="whyGrid">
          <div v-for="(item, index) in page.why" :key="index" class="whyCard">
            {{ item }}
          </div>
        </div>
      </div>
    </div>

    <section class="faqSection mainAreas" :aria-labelledby="`faq-heading-${page.slug}`">
      <h2 :id="`faq-heading-${page.slug}`" class="titleHeader">
        {{ page.networkName }} staking FAQ
      </h2>
      <div class="faq-panels">
        <div
          v-for="(item, index) in page.faqItems"
          :key="item.question"
          class="wrapper"
          :class="{ withHeight: openItems[index] }"
          role="button"
          tabindex="0"
          :aria-expanded="openItems[index] ? 'true' : 'false'"
          @click="toggle(index)"
          @keydown.enter.prevent="toggle(index)"
          @keydown.space.prevent="toggle(index)"
        >
          <div class="presentationRow">
            <div class="panel-title">{{ item.question }}</div>
            <span class="add" :class="{ around: openItems[index] }">+</span>
          </div>
          <div class="panel-description">{{ item.answer }}</div>
        </div>
      </div>
      <p class="relatedLinks">
        More staking networks:
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LetsConnect from '../components/LetsConnect.vue'
import { useSeo } from '../composables/useSeo.js'
import { routeSeo } from '../config/seo.js'
import { getNetworkStakingPage } from '../constants/networkStakingPages.js'
import { useContent } from '../composables/useContent.js'
import { useStakingModal } from '../composables/useStakingModal.js'

export default {
  name: 'NetworkStakingView',
  components: { LetsConnect },
  setup() {
    const route = useRoute()
    const pageData = getNetworkStakingPage(route.meta.networkSlug)
    const page = computed(() => pageData)
    const seoBase = routeSeo[route.meta.seoKey] || routeSeo.home
    const openItems = ref({})

    const { fetchMainnet, getMainnetNetworks } = useContent()
    const { openModal } = useStakingModal()

    // Same wallet staking modal the homepage mainnet cards open.
    const stakingNetwork = computed(
      () =>
        getMainnetNetworks.value.find((network) => network.title === pageData?.mainnetTitle) ||
        null
    )

    const stakeNow = () => {
      if (stakingNetwork.value) openModal(stakingNetwork.value)
    }

    onMounted(() => {
      fetchMainnet()

      // Deep link: /solana-staking?stake=1 opens the wizard on arrival.
      if (route.query.stake) {
        const stop = watch(
          stakingNetwork,
          (network) => {
            if (network) {
              openModal(network)
              stop()
            }
          },
          { immediate: true }
        )
      }
    })

    useSeo({
      ...seoBase,
      faqItems: pageData?.faqItems,
      service: pageData?.service
    })

    const toggle = (index) => {
      openItems.value[index] = !openItems.value[index]
    }

    return { page, openItems, toggle, stakingNetwork, stakeNow }
  }
}
</script>

<style scoped>
/* Hero — mirrors HomeView */
.networkHero {
  margin-top: 80px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: url('../assets/bg img.svg');
  background-repeat: no-repeat;
  background-position: right;
  padding: 28px 72px 94px 72px;
  gap: 20px;
}

.presentation {
  display: flex;
  flex-direction: column;
  width: 608px;
}

.titleArea {
  margin-bottom: 35px;
}

.titleArea .titleLvl1,
.titleArea .titleLvl2 {
  display: block;
  margin: 0;
  font-size: 90px;
  font-weight: 600;
  line-height: 100px;
  font-family: generalSans;
}

.websiteDescription {
  font-size: 20px;
  line-height: 30px;
}

.imageArea {
  background-image: url('../assets/mainImage.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 630px;
  height: 629.88px;
}

.ctaGroup {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 40px;
}

.ctaPrimary,
.ctaSecondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  border: none;
  border-radius: 20px;
  font-family: poppins;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: padding 0.5s;
}

.ctaPrimary {
  background: var(--van-seconday-color);
  color: #111217;
}

.ctaSecondary {
  background: var(--van-mainnet-network-background);
  color: var(--van-text-color);
  border: 1px solid var(--van-border-color);
}

.ctaPrimary:hover,
.ctaSecondary:hover {
  padding-left: 34px;
  padding-right: 34px;
}

/* Ways to stake — cards like the mainnet network buttons */
.optionsSection {
  padding-bottom: 70px;
}

.optionsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.optionCard {
  background: var(--van-mainnet-network-background);
  color: var(--van-mainnet-color);
  border-radius: 20px;
  padding: 26px 22px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.optionTag {
  font-family: poppins;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--van-seconday-color);
  margin-bottom: 12px;
}

.optionTitle {
  margin: 0 0 12px;
  font-family: generalSans;
  font-size: 24px;
  font-weight: 600;
}

.optionDescription {
  margin: 0 0 22px;
  font-family: poppins;
  font-size: 15px;
  line-height: 25px;
  flex-grow: 1;
}

.optionCta {
  font-size: 16px;
  padding: 12px 22px;
}

/* How to stake — cards like the mainnet network buttons */
.stakeSection {
  padding-bottom: 70px;
}

.stepsArea {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.stepCard {
  background: var(--van-mainnet-network-background);
  color: var(--van-mainnet-color);
  padding: 22px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-radius: 20px;
}

.stepNumber {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--van-seconday-color);
  color: #111217;
  font-family: generalSans;
  font-size: 22px;
  font-weight: 600;
}

.stepText {
  font-family: poppins;
  font-size: 16px;
  line-height: 26px;
}

.validatorCard {
  margin-top: 28px;
  background: var(--van-mainnet-network-background);
  color: var(--van-mainnet-color);
  border-radius: 20px;
  padding: 22px;
}

.validatorLabel {
  font-family: poppins;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.validatorValue {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 15px;
  word-break: break-all;
  color: var(--van-seconday-color);
}

.guideLink {
  margin: 24px 0 0;
  font-family: poppins;
  font-size: 16px;
}

.guideLink a {
  color: var(--van-text-color);
  text-decoration: underline;
}

/* Why section — gradient band like Testnet / About Us */
.whySection {
  background: var(--van-about-us-background);
  padding-top: 100px;
  padding-bottom: 100px;
  margin-top: 30px;
}

.whyGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.whyCard {
  background: var(--van-ourCapabilities-wrapper);
  color: var(--van-ourCapabilities-text);
  border-radius: 20px;
  padding: 26px 22px;
  font-family: poppins;
  font-size: 16px;
  line-height: 26px;
}

/* FAQ — same accordion as CitabilitySection */
.faqSection {
  padding-top: 100px;
  padding-bottom: 100px;
}

.faq-panels {
  width: 100%;
}

.wrapper {
  max-height: 62px;
  width: 100%;
  overflow: hidden;
  margin-bottom: 18px;
  transition: 0.3s linear max-height;
  background: var(--van-ourCapabilities-wrapper);
  color: var(--van-ourCapabilities-text);
  cursor: pointer;
  border-radius: 8px;
}

.wrapper.withHeight {
  max-height: 320px;
}

.presentationRow {
  display: flex;
  padding: 16px 20px 11px 20px;
  font-family: poppins;
  font-size: 20px;
  line-height: 30px;
  justify-content: space-between;
}

.panel-title {
  font-family: poppins;
  font-size: 20px;
  line-height: 30px;
  font-weight: 400;
  margin: 0;
}

.panel-description {
  text-align: left;
  padding: 0 20px 15px 20px;
  font-size: 16px;
  line-height: 24px;
  font-family: poppins;
  margin: 0;
}

.add {
  font-size: 24px;
  align-self: flex-end;
  transition: 0.3s linear transform;
}

.add.around {
  transform: rotate(45deg);
}

.relatedLinks {
  margin: 30px 0 0;
  font-family: poppins;
  font-size: 16px;
  line-height: 28px;
}

.relatedLinks a {
  color: var(--van-text-color);
  text-decoration: underline;
}

@media only screen and (max-width: 900px) {
  .networkHero {
    padding: 64px 19px 0 19px;
    box-sizing: border-box;
    display: block;
  }

  .presentation {
    width: 100% !important;
    margin-bottom: 30px;
  }

  .imageArea {
    width: 100%;
    height: 420px;
  }

  .titleArea .titleLvl1,
  .titleArea .titleLvl2 {
    font-size: 56px;
    line-height: 62px;
  }

  .ctaGroup {
    margin-top: 30px;
  }

  .whySection,
  .faqSection {
    padding-top: 40px;
    padding-bottom: 40px;
  }

  .presentationRow {
    font-size: 16px;
    line-height: 24px;
    padding: 16px 15px;
    align-items: center;
  }

  .panel-title {
    font-size: 16px;
    line-height: 24px;
  }

  .wrapper.withHeight {
    max-height: 420px;
  }

  .panel-description {
    padding: 0 15px 15px 15px;
  }
}
</style>
