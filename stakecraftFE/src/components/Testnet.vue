<template>
  <div id="testnet">
    <div class="mainAreas">
      <div class="titleHeader">TestNet</div>
      <div class="buttonsWrapper">
        <button
          class="networks"
          @click="openNetworkDescription(index)"
          v-for="(network, index) in networks"
          :key="network.title"
          :class="{ withHeight: showNetworkDescription[index] }"
        >
          <div class="networkPresentation">
            <div class="networkImg">
              <img :src="network.image" :alt="network.title" />
            </div>
            <div class="networkName">
              {{ network.title }}
            </div>
            <button
              class="add"
              :class="{ around: showNetworkDescription[index] }"
              v-if="network.description"
            >
              +
            </button>
          </div>
          <div class="description" v-if="network.description">
            {{ network.description }}
          </div>
        </button>
      </div>
    </div>
    <Partnerships />
  </div>
</template>

<script>
import Partnerships from './Partnerships.vue'
import redbellyImg from '../assets/redbelly.png'
import koiiImg from '../assets/koii.png'
import supraoraclesImg from '../assets/supraoracles.png'
import walrusImg from '../assets/walrus.png'
import hyperlImg from '../assets/hyperliquid.png'
import { ref } from 'vue'
export default {
  components: { Partnerships },
  setup() {
    const networks = [
      {
        image: supraoraclesImg,
        title: 'Supra Oracles',
        description:
          'A next-generation cross-chain oracle solution designed to boost up the performance of smart contracts and blockchain apps. Providing a high level of decentralization, scalability, ultrafast and secure transactions'
      },
      {
        image: redbellyImg,
        title: 'Redbelly',
        description:
          'Redbelly - the only fully accountable layer 1 blockchain for Compliant Asset Tokenisation. Native to regulated assets, open, fast, scalable.'
      },
      {
        image: koiiImg,
        title: 'Koii Network',
        description:
          'Koii is a compute-sharing marketplace. Anyone can run a validator node on a personal device, making compute cheaper for everyone.'
      },
      {
        image: walrusImg,
        title: 'Walrus',
        description:
          'A decentralized storage and data availability protocol designed specifically for large binary files, or "blobs".'
      },
      {
        image: hyperlImg,
        title: 'HyperLiquid',
        description:
          'Hyperliquid is a performant L1 optimized from the ground up. The vision is a fully onchain open financial system with user built applications interfacing with performant native components, all without compromising end user experience.'
      }
    ]

    const showNetworkDescription = ref([])

    const openNetworkDescription = (index) => {
      if (!networks[index].description) return false
      if (!showNetworkDescription.value[index]) {
        showNetworkDescription.value[index] = true
      } else {
        showNetworkDescription.value[index] = !showNetworkDescription.value[index]
      }
    }

    return { networks, openNetworkDescription, showNetworkDescription }
  }
}
</script>

<style scoped>
#testnet {
  color: #fff;
  padding-top: 96px;
  padding-bottom: 86px;
  background: var(--van-testnet-background);
}

#testnet .mainAreas {
  padding-top: 0;
  padding-bottom: 0;
}

.networks {
  background: #111217;
  box-sizing: border-box;
  border: none;
  cursor: pointer;
  margin-bottom: 26px;
  border-radius: 20px;
  width: 410px;
  padding: 0;
  max-height: 108px;
  overflow: hidden;
  transition:
    max-height 0.3s ease-in,
    border 0.1s ease-in;
}

.networks.withHeight {
  max-height: 1000px;
}

.networks:hover {
  background-image: linear-gradient(#111217, #111217), linear-gradient(to right, #09bac5, #9747ff);
  background-origin: border-box;
  background-clip: content-box, border-box;
  border: 1px solid transparent;
  border-radius: 20px;
  margin-bottom: 24px;
}

.networkPresentation {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 108px;
}

.description {
  font-family: poppins;
  font-size: 16px;
  color: #eceaec;
  margin: 0px 18px 20px 18px;
}

.buttonsWrapper {
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  align-items: flex-start;
}

.networkImg {
  width: 60px;
  height: 60px;
  margin: 20px 0 20px 18px;
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
  margin-right: 18px;
  transition: 0.3s linear transform;
}

.add.around {
  transform: rotate(45deg);
}

@media only screen and (max-width: 900px) {
  .mainAreas {
    margin: 0;
    padding: 0;
  }

  #testnet {
    box-sizing: border-box;
    width: 100vw;
    padding: 0 19px 48px 19px;
  }

  .networks {
    width: auto;
  }
}
</style>
