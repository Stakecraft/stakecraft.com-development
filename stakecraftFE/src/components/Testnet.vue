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
// import hyperlImg from '../assets/hyperliquid.png'
// Import new testnet images
import monadImg from '../assets/monad.png'
import aztecImg from '../assets/aztec.png'
import nexusImg from '../assets/nexus.png'
import taceoImg from '../assets/taceo.png'
import canopyImg from '../assets/canopy.png'
import cantonImg from '../assets/canton.png'
import { ref } from 'vue'
export default {
  name: 'TestnetSection',
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
      // {
      //   image: hyperlImg,
      //   title: 'HyperLiquid',
      //   description:
      //     'Hyperliquid is a performant L1 optimized from the ground up. The vision is a fully onchain open financial system with user built applications interfacing with performant native components, all without compromising end user experience.'
      // },
      {
        image: monadImg,
        title: 'Monad',
        description:
          'Monad is a high-performance Layer 1 blockchain that delivers 10,000 TPS with full EVM compatibility. Built for scalability without compromising decentralization, Monad enables the next generation of DeFi applications.'
      },
      {
        image: aztecImg,
        title: 'Aztec',
        description:
          'Aztec is a privacy-first Layer 2 network built on Ethereum. It enables private DeFi with zero-knowledge proofs, allowing users to transact with complete privacy while maintaining full compatibility with Ethereum.'
      },
      {
        image: nexusImg,
        title: 'Nexus',
        description:
          'Nexus is a decentralized protocol for creating and trading synthetic assets. It provides a comprehensive platform for synthetic asset creation, enabling users to gain exposure to any asset class through blockchain technology.'
      },
      {
        image: taceoImg,
        title: 'Taceo',
        description:
          'Taceo is a next-generation blockchain platform focused on scalability and interoperability. It provides a robust infrastructure for building decentralized applications with enhanced performance and cross-chain capabilities.'
      },
      {
        image: canopyImg,
        title: 'Canopy',
        description:
          'Canopy Network is a decentralized protocol designed for scalable and efficient blockchain infrastructure. It provides innovative solutions for data availability and cross-chain communication, enabling seamless interoperability across different blockchain networks.'
      },
      {
        image: cantonImg,
        title: 'Canton Network',
        description:
          'Canton Network is a privacy-enabled interoperable blockchain network designed for institutional assets. It provides a secure, scalable infrastructure for regulated financial markets with built-in privacy and compliance features.'
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

.titleHeader {
  font-family: poppins;
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 40px;
  color: #fff;
}

.networks {
  background: #111217;
  box-sizing: border-box;
  border: none;
  cursor: pointer;
  border-radius: 20px;
  width: 100%;
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
}

.networkPresentation {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 108px;
  padding: 0;
}

.description {
  font-family: poppins;
  font-size: 16px;
  color: #eceaec;
  margin: 0px 18px 20px 18px;
  line-height: 1.5;
}

.buttonsWrapper {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  justify-content: space-between;
  align-items: flex-start;
}

.networkImg {
  width: 60px;
  height: 60px;
  margin: 20px 0 20px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.networkImg img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.networkName {
  color: #fff;
  width: 142px;
  font-family: poppins;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  margin-left: 14px;
  flex-shrink: 0;
}

.add {
  color: #fff;
  background: transparent;
  border: none;
  font-size: 30px;
  margin-left: auto;
  margin-right: 18px;
  transition: 0.3s linear transform;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.add.around {
  transform: rotate(45deg);
}

.add:hover {
  color: #09bac5;
}

@media only screen and (max-width: 900px) {
  .mainAreas {
    margin: 0;
    padding: 0;
  }

  #testnet {
    box-sizing: border-box;
    width: 100vw;
    padding: 40px 20px;
    gap: 10px;
  }

  .networks {
    width: auto;
  }

  .titleHeader {
    font-size: 36px;
    margin-bottom: 30px;
  }
}

@media only screen and (max-width: 450px) {
  .buttonsWrapper {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .titleHeader {
    font-size: 28px;
    margin-bottom: 20px;
  }

  .networkName {
    font-size: 18px;
    width: 120px;
  }

  .description {
    font-size: 14px;
  }
}
</style>
