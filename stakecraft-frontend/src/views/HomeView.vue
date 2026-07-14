<template>
  <div>
    <div class="homeView">
      <div class="presentation">
        <div class="titleArea">
          <h1 class="titleLvl1">Trustworthy</h1>
          <div class="titleLvl2" aria-hidden="true">Validator</div>
        </div>
        <div class="websiteDescription">
          Stakecraft validator offers services to make profit to users from staking their digital
          assets, providing high reliability, security of user funds, transparent monitoring, and
          advanced technical support.
        </div>
      </div>
      <div class="imageArea" />
    </div>
    <MainnetStatic v-if="isSSR" />
    <MainnetInteractive v-else />
    <Testnet />
    <Whychooseus />
    <About />
    <CitabilitySection />
    <LetsConnect />
  </div>
</template>

<script>
import MainnetStatic from '../components/MainnetStatic.vue'
import Testnet from '../components/Testnet.vue'
import Whychooseus from '../components/Whychooseus.vue'
import About from '../components/About.vue'
import CitabilitySection from '../components/CitabilitySection.vue'
import LetsConnect from '../components/LetsConnect.vue'
import { defineAsyncComponent } from 'vue'
import { useSeo } from '../composables/useSeo.js'
import { routeSeo } from '../config/seo.js'

const isSSR = import.meta.env.SSR
const MainnetInteractive = isSSR
  ? null
  : defineAsyncComponent(() => import('../components/Mainnet.vue'))

export default {
  components: {
    MainnetStatic,
    MainnetInteractive,
    Testnet,
    Whychooseus,
    About,
    CitabilitySection,
    LetsConnect
  },
  setup() {
    useSeo(routeSeo.home)
    return { isSSR, MainnetInteractive }
  }
}
</script>

<style scoped>
.homeView {
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

@media only screen and (max-width: 900px) {
  .homeView {
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

  .websiteDescription {
    font-size: 20px;
    line-height: 30px;
  }
}
</style>
