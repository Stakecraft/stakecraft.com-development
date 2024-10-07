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
import kusanaImg from '../assets/kusana.png'
import polkadotImg from '../assets/polkadot.png'
import bandProtocolImg from '../assets/bandProtocol.png'
import astarImg from '../assets/Astar.png'
import moonriverImg from '../assets/moonriver.png'
import qprotocolImg from '../assets/QProtocol.png'
import graphImg from '../assets/graph.png'
import poligonMaticImg from '../assets/poligonMatic.png'
import centrifugeImg from '../assets/centrifuge.png'
import altairImg from '../assets/altair.png'
import kifoundationImg from '../assets/kifoundation.png'
import agoricImg from '../assets/agoric.png'
import velasImg from '../assets/velas.png'
import auraImg from '../assets/aura.png'
import tgradeImg from '../assets/tgrade.png'
import dockioImg from '../assets/dockio.png'
import stafiImg from '../assets/stafi.png'
import ixoImg from '../assets/ixo.png'
import xxImg from '../assets/xx.png'
import junoImg from '../assets/juno.png'
import stargazeImg from '../assets/stargaze.png'
import bitsongImg from '../assets/bitsong.png'
import qwoynImg from '../assets/qwoyn.png'
import krestImg from '../assets/krest.png'
import dydxImg from '../assets/dydx.png'
import bitscrunchImg from '../assets/bitscrunch.png'
import nearImg from '../assets/near.png'

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
      },
      {
        image: kusanaImg,
        title: 'Kusana'
      },
      {
        image: polkadotImg,
        title: 'Polkadot'
      },
      {
        image: bandProtocolImg,
        title: 'Band Protocol'
      },
      {
        image: astarImg,
        title: 'Astar'
      },
      {
        image: moonriverImg,
        title: 'Moonriver'
      },
      {
        image: qprotocolImg,
        title: 'Q Protocol'
      },
      {
        image: graphImg,
        title: 'The Graph'
      },
      {
        image: poligonMaticImg,
        title: 'Poligon (MATIC)'
      },
      {
        image: altairImg,
        title: 'Altair'
      },
      {
        image: centrifugeImg,
        title: 'Centrifuge'
      },
      {
        image: kifoundationImg,
        title: 'Ki Foundation'
      },
      {
        image: agoricImg,
        title: 'Agoric'
      },
      {
        image: velasImg,
        title: 'Velas'
      },
      {
        image: auraImg,
        title: 'Aura Network'
      },
      {
        image: tgradeImg,
        title: 'Tgrade'
      },
      {
        image: dockioImg,
        title: 'Dock.io'
      },
      {
        image: stafiImg,
        title: 'Stafi'
      },
      {
        image: ixoImg,
        title: 'iXO'
      },
      {
        image: xxImg,
        title: 'XX network'
      },
      {
        image: junoImg,
        title: 'Juno'
      },
      {
        image: stargazeImg,
        title: 'Stargaze'
      },
      {
        image: bitsongImg,
        title: 'Bitsong'
      },
      {
        image: qwoynImg,
        title: 'Qwoyn'
      },
      {
        image: krestImg,
        title: 'Krest'
      },
      {
        image: dydxImg,
        title: 'dYdX'
      },
      {
        image: bitscrunchImg,
        title: 'BitsCrunch'
      },
      {
        image: nearImg,
        title: 'Near'
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
  border-radius: 20px;
  margin-bottom: 28px;
  flex: 0 1 auto;
}

.buttonsArea {
  display: flex;
  flex-direction: row;
  padding-bottom: 71px;
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
  width: 142px;
  font-family: poppins;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  margin-left: 16px;
}

.networkImg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>