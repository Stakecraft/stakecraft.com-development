<template>
  <div class="mainnet">
    <div title="title">Mainnet</div>
    <button @click="openModal" v-for="network in networks" :key="network.title">
      <div class="networkImg">
        <img :src="network.image" :alt="network.title" />
      </div>
      <div class="networkName">
        {{ network.title }}
      </div>
    </button>
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
.mainnet {
  padding: 0 72px;
}
</style>