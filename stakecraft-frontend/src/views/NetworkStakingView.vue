<template>
  <div v-if="page" :class="{ solanaStakingPage: page.slug === 'solana' }">
    <div class="networkHero" :class="{ isSolana: page.slug === 'solana' }">
      <div class="presentation">
        <h1 class="titleArea">
          <span class="titleLvl1">{{ page.networkName }}</span>
          <span class="titleLvl2">Staking</span>
        </h1>
        <div class="websiteDescription">
          {{ page.intro }}
        </div>
        <div v-if="page.slug !== 'solana'" class="ctaGroup">
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
        <SolanaValidatorTrust
          v-if="page.slug === 'solana' && page.validator"
          :vote="page.validator"
          :identity="page.identity || ''"
          @select-pool="openPoolTab"
        />
      </div>
      <div v-if="page.slug !== 'solana'" class="imageArea" />
    </div>

    <div class="mainAreas stakeSection" :id="`how-to-stake-${page.slug}`">
      <div class="titleHeader">
        {{ page.slug === 'solana' ? `Stake ${page.token} now` : `How to stake ${page.token}` }}
      </div>

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
          <img v-if="tab.logo" class="tabLogo" :src="tab.logo" :alt="''" loading="lazy" />
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

        <!-- Native Solana: stake widget left, how-to steps right -->
        <div v-if="tab.action === 'embed' && tab.embed === 'native'" class="tabSplit">
          <div class="tabSplitWidget">
            <div id="native-solana-stake-embed" class="nativeStakeHost" />
          </div>
          <div class="tabSplitSteps">
            <div v-for="(step, index) in tab.steps" :key="index" class="stepCard">
              <div class="stepNumber">{{ index + 1 }}</div>
              <div class="stepText">{{ step }}</div>
            </div>
          </div>
        </div>

        <template v-else>
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
        </template>
      </div>

      <div v-if="page.slug !== 'solana'" class="validatorCard">
        <div class="validatorLabel">Validator address</div>
        <code class="validatorValue">{{ page.validator }}</code>
      </div>
      <p v-if="page.slug !== 'solana' && page.howToStake" class="guideLink">
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import LetsConnect from '../components/LetsConnect.vue'
import DefinityDirectStakeWidget from '../components/DefinityDirectStakeWidget.vue'
import SolanaValidatorTrust from '../components/SolanaValidatorTrust.vue'
import { useSeo } from '../composables/useSeo.js'
import { routeSeo } from '../config/seo.js'
import { getNetworkStakingPage } from '../constants/networkStakingPages.js'
import { useContent } from '../composables/useContent.js'
import { useStakingModal } from '../composables/useStakingModal.js'

export default {
  name: 'NetworkStakingView',
  components: {
    LetsConnect,
    DefinityDirectStakeWidget,
    SolanaValidatorTrust
  },
  setup() {
    const route = useRoute()
    const pageData = getNetworkStakingPage(route.meta.networkSlug)
    const page = computed(() => pageData)
    const seoBase = routeSeo[route.meta.seoKey] || routeSeo.home
    const openItems = ref({})

    const { fetchMainnet, getMainnetNetworks } = useContent()
    const { openModal, setEmbedNetwork } = useStakingModal()

    const stakingNetwork = computed(
      () =>
        getMainnetNetworks.value.find((network) => network.title === pageData?.mainnetTitle) ||
        null
    )

    const stakeNow = () => {
      if (stakingNetwork.value) openModal(stakingNetwork.value)
    }

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

    const openPoolTab = (tabId) => {
      if (!tabId || !stakingTabs.value.some((tab) => tab.id === tabId)) return
      activeTab.value = tabId
      const section = document.getElementById(`how-to-stake-${pageData?.slug}`)
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    onMounted(() => {
      fetchMainnet()

      if (pageData?.slug === 'solana') {
        watch(
          stakingNetwork,
          (network) => {
            setEmbedNetwork(network)
          },
          { immediate: true }
        )
      }

      if (route.query.stake && pageData?.slug === 'solana') {
        activeTab.value = 'native'
        const section = document.getElementById(`how-to-stake-${pageData.slug}`)
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (route.query.stake) {
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

      if (route.query.tab && stakingTabs.value.some((tab) => tab.id === route.query.tab)) {
        activeTab.value = route.query.tab
      }
    })

    onBeforeUnmount(() => {
      if (pageData?.slug === 'solana') setEmbedNetwork(null)
    })

    useSeo({
      ...seoBase,
      faqItems: pageData?.faqItems,
      service: pageData?.service
    })

    const toggle = (index) => {
      openItems.value[index] = !openItems.value[index]
    }

    return {
      page,
      openItems,
      toggle,
      stakingNetwork,
      stakeNow,
      stakingTabs,
      activeTab,
      openPoolTab
    }
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
  align-items: flex-start;
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
  width: 473px;
  height: 472px;
  flex-shrink: 0;
  margin-top: 8px;
}

/* Solana: no hero cube — trust strip uses full content width */
.networkHero.isSolana {
  display: block;
  background-position: right top;
}

.networkHero.isSolana .presentation {
  width: 100%;
  max-width: none;
}

/*
  Solana page contrast lock (ignores site theme toggle):
  hero/trust strip always dark; stake UI + below always light.
*/
.solanaStakingPage .networkHero.isSolana {
  --van-text-color: #ffffff;
  --van-mainnet-color: #ffffff;
  --van-mainnet-network-background: #1b1d25;
  --van-border-color: rgba(255, 255, 255, 0.14);
  --van-seconday-color: #35f6df;
  color: #ffffff;
  background-color: #111216;
  background-image: url('../assets/bg img.svg');
  background-repeat: no-repeat;
  background-position: right top;
  padding-bottom: 56px;
}

.solanaStakingPage .stakeSection,
.solanaStakingPage .whySection,
.solanaStakingPage .faqSection {
  --van-text-color: #111217;
  --van-mainnet-color: #111217;
  --van-mainnet-network-background: #ffffff;
  --van-border-color: #ebedf0;
  --van-seconday-color: #35f6df;
  --van-ourCapabilities-wrapper: #ffffff;
  --van-ourCapabilities-text: #111217;
  --van-about-us-background: #f0f0f0;
  color: #111217;
  background-color: #f0f0f0;
}

.solanaStakingPage .whySection {
  background: #f0f0f0;
}

.solanaStakingPage .stakeSection {
  padding-top: 72px;
  padding-bottom: 80px;
}

.solanaStakingPage .stakeSection .titleHeader {
  margin-bottom: 28px;
}

.solanaStakingPage .stakeSection .titleHeader,
.solanaStakingPage .faqSection .titleHeader,
.solanaStakingPage .whySection .titleHeader {
  color: #111217;
}

.tabSplit {
  display: grid;
  grid-template-columns: minmax(280px, 480px) minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.tabSplitWidget {
  min-width: 0;
}

.nativeStakeHost {
  min-height: 220px;
}

.tabSplitSteps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

.tabLogo {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  background: #111217;
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
    width: 315px;
    height: 315px;
    margin: 0 auto;
  }

  .tabSplit {
    grid-template-columns: 1fr;
  }

  .solanaStakingPage .stakeSection {
    padding-top: 48px;
    padding-bottom: 56px;
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
