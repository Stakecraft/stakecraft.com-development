<template>
  <div id="partnership">
    <div class="content">
      <div class="titleHeader">Partnerships</div>

      <div class="description">
        A next-generation cross-chain oracle solution designed to boost the performance of smart
        contracts and blockchain apps.
      </div>
    </div>
    <div class="networksWrapper">
      <div class="networks" v-for="network in networks" :key="network.title">
        <div class="networkImg">
          <img :src="network.image" :alt="network.title" />
        </div>
        <div class="networkName">
          {{ network.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import qprotocol from '../assets/qprotocol.png'
import polygon from '../assets/polygon.png'
import astar from '../assets/astar.png'

export default {
  setup() {
    const networks = [
      {
        image: qprotocol,
        title: 'Q Protocol'
      },
      {
        image: polygon,
        title: 'Polygon'
      },
      {
        image: astar,
        title: 'Astar'
      }
    ]

    return { networks }
  }
}
</script>

<style scoped>
.content {
  margin-right: 10%;
}
#partnership {
  padding: 0 !important;
  margin-top: 116px;
  display: flex;
}

.networksWrapper {
  display: flex;
  justify-content: space-evenly;
  flex-grow: 1;
}

.description {
  width: 552px;
}

.networkName {
  font-size: 16px;
  font-family: 'poppins';
  margin-top: 12px;
}

.networkImg {
  width: 80px;
  height: 80px;
}

.networks {
  text-align: center;
}
</style>
