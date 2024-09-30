<template>
  <div class="testNet mainAreas">
    <div class="titleHeader">TestNet</div>
    <div class="buttonsArea">
      <button class="networks" @click="openModal" v-for="network in networks" :key="network.title">
        <div class="networkImg">
          <img :src="network.image" :alt="network.title" />
        </div>
        <div class="networkName">
          {{ network.title }}
        </div>
        <button class="add">+</button>
      </button>
    </div>
  </div>
</template>

<script>
import supraOrkas from '../assets/supraOrkas.png'
import ssv from '../assets/ssv.png'

export default {
  setup() {
    const networks = [
      {
        image: supraOrkas,
        title: 'Supra Orkas'
      },
      {
        image: ssv,
        title: 'SSV'
      }
    ]

    const openModal = () => {}

    return { networks, openModal }
  }
}
</script>

<style scoped>
.testNet {
  color: #fff;
  padding-top: 96px;
  padding-bottom: 86px;
  background: linear-gradient(#252723, #1d1e27);
}

.networks {
  background: #111217;
  padding: 20px 18px;
  box-sizing: border-box;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-right: 24px;
  margin-bottom: 26px;
  border-radius: 20px;
  width: 410px;
}

.networks:last-child {
  margin-right: 0;
}

.buttonsArea {
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
}

.networkImg {
  width: 60px;
  height: 60px;
}

.networkName {
  color: #fff;
  width: 142px;
  font-family: poppins;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  margin-left: 14px;
}

.add {
  color: #fff;
  background: #111217;
  border: none;
  font-size: 30px;
  margin-left: auto;
}
</style>