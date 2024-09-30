<template>
  <div class="mainnet mainAreas">
    <div class="titleHeader">Mainnet</div>
    <div class="buttonsArea">
      <button class="networks" @click="openModal" v-for="network in networks" :key="network.title">
        <div class="networkImg">
          <img :src="network.image" :alt="network.title" />
        </div>
        <div class="networkName">
          {{ network.title }}
        </div>
      </button>
    </div>
  </div>
</template>


<script>
import solanaImg from '../assets/solana.png'
import kavaImg from '../assets/kava.png'

export default {
  setup() {
    const networks = [
      {
        image: solanaImg,
        title: 'Solana'
      },
      {
        image: kavaImg,
        title: 'Kava'
      }
    ]

    const openModal = () => {}

    return { networks, openModal }
  }
}
</script>

<style scoped>
.networks {
  background: #fff;
  padding: 15px 22px;
  box-sizing: border-box;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-right: 28px;
  margin-bottom: 28px;
  border-radius: 20px;
}

.networks:last-child {
  margin-right: 0;
}

.buttonsArea {
  display: flex;
  flex-direction: row;
  padding-bottom: 71px;
  box-sizing: border-box;
}

.networkImg {
  width: 60px;
  height: 60px;
}

.networkName {
  width: 142px;
  font-family: poppins;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  margin-left: 16px;
}
</style>