<script setup>
</script>

<template>
  <div>
    <main class="homeView">
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
      <img class="imageArea" src="../assets/mainImage.png" />
    </main>
    <Mainnet />
    <Testnet />
    <Whychooseus />
    <About />
  </div>
</template>

<script>
import Mainnet from '../components/Mainnet.vue'
import Testnet from '../components/Testnet.vue'
import Whychooseus from '../components/Whychooseus.vue'
import About from '../components/About.vue'

export default {
  components: { Mainnet, Testnet, Whychooseus, About },
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
  width: 630px;
  height: 629.88px;
}
</style>
