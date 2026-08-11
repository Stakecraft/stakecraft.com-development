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

    <div class="mainAreas stakeSection" :id="`how-to-stake-${page.slug}`">
      <div class="titleHeader">How to stake {{ page.token }}</div>

      <div v-if="stakingTabs.length > 1" class="tabBar" role="tablist">
        <button
          v-for="tab in stakingTabs"
          :key="tab.id"
          class="tabButton"
          :class="{ active: activeTab === tab.id }"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.id ? 'true' : 'false'"
          @click="activeTab = tab.id"
        >
          {{ tab.tabLabel || tab.title }}
        </button>
      </div>

      <!-- All panels stay in the DOM (v-show) so crawlers index every method. -->
      <div
        v-for="tab in stakingTabs"
        :key="tab.id"
        v-show="activeTab === tab.id"
        class="tabPanel"
        role="tabpanel"
      >
        <h3 v-if="stakingTabs.length > 1" class="tabTitle">{{ tab.title }}</h3>
        <p v-if="tab.description" class="tabDescription">{{ tab.description }}</p>
        <div class="stepsArea">
          <div v-for="(step, index) in tab.steps" :key="index" class="stepCard">
            <div class="stepNumber">{{ index + 1 }}</div>
            <div class="stepText">{{ step }}</div>
          </div>
        </div>
        <div class="tabCtaRow">
          <DefinityDirectStakeWidget
            v-if="tab.action === 'embed' && tab.embed === 'definity' && tab.widget"
            :vote="tab.widget.vote"
            :name="tab.widget.name"
            :image="tab.widget.image"
            :ref-code="tab.widget.ref"
          />
          <button
            v-else-if="tab.action === 'modal' && stakingNetwork"
            class="ctaPrimary"
            type="button"
            @click="stakeNow"
          >
            {{ tab.ctaLabel }}
          </button>
          <router-link v-else-if="tab.action === 'modal'" class="ctaPrimary" to="/#mainnet">
            {{ tab.ctaLabel }}
          </router-link>
          <a
            v-else-if="tab.action === 'external'"
            class="ctaSecondary"
            :href="tab.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ tab.ctaLabel }}
          </a>
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
import DefinityDirectStakeWidget from '../components/DefinityDirectStakeWidget.vue'
import { useSeo } from '../composables/useSeo.js'
import { routeSeo } from '../config/seo.js'
import { getNetworkStakingPage } from '../constants/networkStakingPages.js'
import { useContent } from '../composables/useContent.js'
import { useStakingModal } from '../composables/useStakingModal.js'

export default {
  name: 'NetworkStakingView',
  components: { LetsConnect, DefinityDirectStakeWidget },
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

    // Networks without explicit options get a single native tab from page.steps.
    const stakingTabs = computed(() => {
      if (pageData?.stakingOptions?.length) return pageData.stakingOptions
      return [
        {
          id: 'native',
          title: 'Native staking',
          steps: pageData?.steps || [],
          action: 'modal',
          ctaLabel: `Stake ${pageData?.token || ''} now`
        }
      ]
    })
    const activeTab = ref(stakingTabs.value[0]?.id)

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

    return { page, openItems, toggle, stakingNetwork, stakeNow, stakingTabs, activeTab }
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

/* How to stake — tabbed methods, cards like the mainnet network buttons */
.stakeSection {
  padding-bottom: 70px;
}

.tabBar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
}

.tabButton {
  padding: 12px 24px;
  border: 1px solid var(--van-border-color);
  border-radius: 20px;
  background: var(--van-mainnet-network-background);
  color: var(--van-text-color);
  font-family: poppins;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.tabButton.active {
  background: var(--van-seconday-color);
  border-color: var(--van-seconday-color);
  color: #111217;
}

.tabTitle {
  margin: 0 0 10px;
  font-family: generalSans;
  font-size: 24px;
  font-weight: 600;
}

.tabDescription {
  margin: 0 0 28px;
  max-width: 720px;
  font-family: poppins;
  font-size: 16px;
  line-height: 26px;
}

.tabCtaRow {
  margin-top: 28px;
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
