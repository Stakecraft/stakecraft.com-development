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
    <partnerships />
  </div>
</template>

<script>
import supraOrkasImg from '../assets/supraOrkas.png'
import ssvImg from '../assets/ssv.png'
import Partnerships from './Partnerships.vue'
import obolImg from '../assets/obol.png'
import autonityImg from '../assets/autonity.png'
import berachainImg from '../assets/berachain.png'
import redbellyImg from '../assets/redbelly.png'
import koiiImg from '../assets/koii.png'
import availImg from '../assets/avail.png'
import subsquidImg from '../assets/subsquid.png'

export default {
  components: { Partnerships },
  setup() {
    const networks = [
      {
        image: supraOrkasImg,
        title: 'Supra Orkas'
      },
      {
        image: ssvImg,
        title: 'SSV'
      },
      {
        image: obolImg,
        title: 'Obol Network'
      },
      {
        image: autonityImg,
        title: 'Autonity'
      },
      {
        image: berachainImg,
        title: 'Berachain'
      },
      {
        image: redbellyImg,
        title: 'Redbelly'
      },
      {
        image: koiiImg,
        title: 'Koii'
      },
      {
        image: availImg,
        title: 'Avail'
      },
      {
        image: subsquidImg,
        title: 'Subsquid'
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
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
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