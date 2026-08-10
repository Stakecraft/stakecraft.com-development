<template>
  <div>
    <div class="homeView">
      <div class="presentation">
        <h1 class="titleArea">
          <span class="titleLvl1">StakeCraft</span>
          <span class="titleLvl2">Staking</span>
        </h1>
        <div class="websiteDescription">
          StakeCraft is a non-custodial staking provider building staking infrastructure across
          Solana, NEAR, Monad, Cosmos, Polkadot, and more. Delegate to our validators, keep custody
          of your tokens, and earn rewards on infrastructure built for uptime.
        </div>
      </div>
      <div class="imageArea" />
    </div>
    <MainnetStatic />
    <Testnet />
    <Products />
    <CitabilitySection />
    <Whychooseus />
    <About />
    <LetsConnect />
  </div>
</template>

<script>
import MainnetStatic from '../components/MainnetStatic.vue'
import Testnet from '../components/Testnet.vue'
import Products from '../components/Products.vue'
import Whychooseus from '../components/Whychooseus.vue'
import About from '../components/About.vue'
import CitabilitySection from '../components/CitabilitySection.vue'
import LetsConnect from '../components/LetsConnect.vue'
import { useSeo } from '../composables/useSeo.js'
import { routeSeo } from '../config/seo.js'

export default {
  components: {
    MainnetStatic,
    Testnet,
    Products,
    Whychooseus,
    About,
    CitabilitySection,
    LetsConnect
  },
  setup() {
    useSeo(routeSeo.home)
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
