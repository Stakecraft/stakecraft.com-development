<template>
  <div>
    <div class="homeView">
      <div class="presentation">
        <div class="titleArea">
          <div class="titleLvl1">Trustworthy</div>
          <div class="titleLvl2">Validator</div>
        </div>
        <div class="websiteDescription">
          Stakecraft validator offers services to make profit to users from staking their digital
          assets, providing high reliability, security of user funds, transparent monitoring, and
          advanced technical support.
        </div>
      </div>
      <div class="imageArea" />
    </div>
    <Mainnet />
    <Testnet />
    <Whychooseus />
    <About />
    <LetsConnect />
  </div>
</template>

<script>
import Mainnet from '../components/Mainnet.vue'
import Testnet from '../components/Testnet.vue'
import Whychooseus from '../components/Whychooseus.vue'
import About from '../components/About.vue'
import LetsConnect from '../components/LetsConnect.vue'

export default {
  components: { Mainnet, Testnet, Whychooseus, About, LetsConnect },
  setup() {}
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

.titleArea div {
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

  .titleArea div {
    font-size: 56px;
    line-height: 62px;
  }

  .websiteDescription {
    font-size: 20px;
    line-height: 30px;
  }
}
</style>
