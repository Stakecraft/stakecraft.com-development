<template>
  <div id="partnership">
    <div class="mainAreas">
      <div class="partnershipDetails">
        <div class="titleHeader">Partnerships</div>

        <div class="partnershipDescription">
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
.partnershipDetails {
  margin-right: 10%;
}

#partnership {
  padding-top: 120px;
  /* padding-inline: 72px; */
}

#partnership .mainAreas {
  display: flex;
  justify-content: space-between;
  padding-top: 0;
  padding-bottom: 0;
}

.networksWrapper {
  display: flex;
  justify-content: space-evenly;
  flex-grow: 1;
}

.partnershipDescription {
  width: 552px;
}

.networkName {
  font-size: 16px;
  font-family: 'poppins';
  margin-top: 12px;
}

.networkImg img {
  width: 80px;
  height: 80px;
}

.networks {
  text-align: center;
}

@media only screen and (max-width: 900px) {
  .partnershipDescription {
    width: auto;
  }

  .partnershipDetails {
    margin: 0 0 27px 0;
  }

  #partnership {
    padding-top: 60px;
  }

  #partnership .mainAreas {
    flex-direction: column;
  }

  .networkImg,
  .networkImg img {
    width: 60px;
    height: 60px;
  }
}
</style>
