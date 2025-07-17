<template>
  <div class="mainAreas" id="mainnet">
    <div class="titleHeader">Mainnet</div>
    <div class="buttonsArea">
      <button
        class="networks"
        @click="showModal(network)"
        v-for="network in networks"
        :key="network.title"
      >
        <div class="networkImg">
          <img :src="network.image" :alt="network.title" />
        </div>
        <div class="networkName">
          {{ network.title }}
        </div>
      </button>
    </div>
    <!-- <modal v-show="isModalVisible" @close="closeModal" :network="{ selectedNetwork }" /> -->
    <solana-staking
      v-if="selectedNetwork?.title === 'Solana'"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <kava-staking
      v-if="selectedNetwork?.title === 'Kava'"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <!-- <koii-staking
      v-if="selectedNetwork?.title === 'Koii'"
      :network="selectedNetwork"
      @close="closeModal"
    /> -->
    <!-- <agoric-staking
      v-if="selectedNetwork?.title === 'Agoric'"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <band-staking
      v-if="selectedNetwork?.title === 'Band Protocol'"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <stargaze-staking
      v-if="selectedNetwork?.title === 'Stargaze'"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <bitsong-staking
      v-if="selectedNetwork?.title === 'Bitsong'"
      :network="selectedNetwork"
      @close="closeModal"
    /> -->
    <!-- <aura-staking
      v-if="selectedNetwork?.title === 'Aura Network'"
      :network="selectedNetwork"
      @close="closeModal"
    /> -->
    <!-- <juno-staking
      v-if="selectedNetwork?.title === 'Juno'"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <zeta-staking
      v-if="selectedNetwork?.title === 'Zetachain'"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <ki-staking
      v-if="selectedNetwork?.title === 'Ki Foundation'"
      :network="selectedNetwork"
      @close="closeModal"
    /> -->
    <supra-staking
      v-if="selectedNetwork?.title === 'Supra Oracles'"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <near-staking
      v-if="selectedNetwork?.title === 'Near Protocol'"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <!-- <zeta-staking
      v-if="selectedNetwork?.title === 'Zachain'"
      :network="selectedNetwork"
      @close="closeModal"
    /> -->
    <!-- <polygon-staking
      v-if="selectedNetwork?.title === 'Polygon'"
      :network="selectedNetwork"
      @close="closeModal"
    /> -->
    <modal
      v-if="
        ![
          'Solana',
          'Kava',
          'Koii',
          'Agoric',
          'Band Protocol',
          'Stargaze',
          'Bitsong',
          'Juno',
          'Zetachain',
          'Ki Foundation',
          'Supra Oracles',
          'Near Protocol'
        ].includes(selectedNetwork?.title)
      "
      v-show="isModalVisible"
      @close="closeModal"
      :network="selectedNetwork"
    />
  </div>
</template>

<script>
import solanaImg from '../assets/solana.png'
import kavaImg from '../assets/kava.png'
import bandprotocolImg from '../assets/bandprotocol.png'
import moonriverImg from '../assets/moonriver.png'
import qprotocolImg from '../assets/qprotocol.png'
import graphImg from '../assets/graph.png'
import polygonImg from '../assets/polygon.png'
import centrifugeImg from '../assets/centrifuge.png'
import altairImg from '../assets/altair.png'
import kifoundationImg from '../assets/kifoundation.png'
import agoricImg from '../assets/agoric.png'
import auraImg from '../assets/aura.png'
import stafiImg from '../assets/stafi.png'
import junoImg from '../assets/juno.png'
import stargazeImg from '../assets/stargaze.png'
import bitsongImg from '../assets/bitsong.png'
import bitscrunchImg from '../assets/bitscrunch.png'
import redbellyImg from '../assets/redbelly.png'
import nearImg from '../assets/near.png'
import zetachainImg from '../assets/zetachain.png'
import covalentImg from '../assets/covalent.png'
import subqueryImg from '../assets/subquery.png'
import koiiImg from '../assets/koii.png'
import supraoraclesImg from '../assets/supraoracles.png'
import walrusImg from '../assets/walrus.png'

import modal from './Modal.vue'
import { ref, inject } from 'vue'
import SolanaStaking from './stakingViews/SolanaStaking.vue'
import KavaStaking from './stakingViews/KavaStaking.vue'
import NearStaking from './stakingViews/NearStaking.vue'
import SupraStaking from './stakingViews/SupraStaking.vue'
// import AgoricStaking from './stakingViews/AgoricStaking.vue'
// import BandStaking from './stakingViews/BandStaking.vue'
// import StargazeStaking from './stakingViews/StargazeStaking.vue'
// import BitsongStaking from './stakingViews/BitsongStaking.vue'
// import JunoStaking from './stakingViews/JunoStaking.vue'
// import KiStaking from './stakingViews/KiStaking.vue'
// import PolygonStaking from './stakingViews/PolygonStaking.vue'
// import KoiiStaking from './stakingViews/KoiiStaking.vue' // not complted
// import ZetaStaking from './stakingViews/ZetaStaking.vue' // not complted

export default {
  components: {
    SolanaStaking,
    KavaStaking,
    SupraStaking,
    NearStaking,
    // KoiiStaking,
    // AgoricStaking,
    // BandStaking,
    // StargazeStaking,
    // BitsongStaking,
    // JunoStaking,
    // ZetaStaking,
    // KiStaking,
    modal
    // PolygonStaking
  },
  setup() {
    const networks = [
      {
        image: solanaImg,
        title: 'Solana',
        description:
          'Public base-layer blockchain protocol that optimizes for scalability. Its goal is to provide a platform that enables developers to create decentralized applications (dApps) without needing to design around performance bottlenecks.',
        validator: ['BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g'],
        explorer: ['https://stakewiz.com/validator/BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g'],
        howToStake: [
          'https://medium.com/coinmonks/how-to-stake-sol-with-solflare-wallet-f2b844e8c379'
        ]
      },
      {
        image: nearImg,
        title: 'Near Protocol',
        description:
          'NEAR is the chain abstraction stack, empowering builders to create apps that scale to billions of users and across all blockchains.',
        validator: ['stakecraft.poolv1.near'],
        explorer: ['https://nearscope.net/validator/stakecraft.poolv1.near/tab/dashboard']
      },
      {
        image: kavaImg,
        title: 'Kava',
        description:
          'The most trusted DeFi platform by financial institutions providing securely access a robust suite of DeFi products and services in one safe and seamless integration.',
        validator: ['kavavaloper1k760ypy9tzhp6l2rmg06sq4n74z0d3rejwwaa0'],
        howToStake:
          'https://medium.com/coinmonks/staking-your-kava-tokens-with-keplr-wallet-19f74e384e5a',
        explorer: [
          'https://www.mintscan.io/kava/validators/kavavaloper1k760ypy9tzhp6l2rmg06sq4n74z0d3rejwwaa0'
        ]
      },
      {
        image: supraoraclesImg,
        title: 'Supra Oracles',
        description:
          'A next-generation cross-chain oracle solution designed to boost up the performance of smart contracts and blockchain apps. Providing a high level of decentralization, scalability, ultrafast and secure transactions.',
        validator: ['0x93b153fe97b6b677b7af943cbb80cc8bbf7a7878e69ffe9a04fc7eebfc1d750f'],
        explorer: [
          'https://suprascan.io/address/0x93b153fe97b6b677b7af943cbb80cc8bbf7a7878e69ffe9a04fc7eebfc1d750f'
        ]
      },
      {
        image: koiiImg,
        title: 'Koii',
        description:
          'Koii is a compute-sharing marketplace. Anyone can run a validator node on a personal device, making compute cheaper for everyone.',
        validator: ['DJT1msZdLdN7zzMZo7DaBDjMZW7nPMvjbKNbHKWj9pUA'],
        explorer: [
          'https://explorer.koii.live/address/DJT1msZdLdN7zzMZo7DaBDjMZW7nPMvjbKNbHKWj9pUA'
        ]
      },

      {
        image: bandprotocolImg,
        title: 'Band Protocol',
        description:
          'Сross-chain data oracle platform that aggregates and connects real-world data and APIs to smart contracts.',
        validator: ['bandvaloper1unfg2zhnssl07tql8d85zc6rx7zsfs5qh206av'],
        explorer: [
          'https://www.cosmoscan.io/validator/bandvaloper1unfg2zhnssl07tql8d85zc6rx7zsfs5qh206av#reports'
        ],
        howToStake:
          'https://medium.com/coinmonks/how-to-stake-band-protocol-band-in-cosmostation-wallet-bfd5a2f664bf'
      },
      {
        image: moonriverImg,
        title: 'Moonriver',
        description:
          'Сompanion network to Moonbeam and provides a permanently incentivized canary network. New code ships to Moonriver first, where it can be tested and verified under real economic conditions. Once proven, the same code ships to Moonbeam on Polkadot.',
        explorer: [
          'https://moonriver.subscan.io/validator/0xb7Ab89933d2F16E6d183aAdcc5032bA17d6a5aEC?tab=reward'
        ],
        howToStake: 'https://stakecraft.medium.com/how-to-nominate-moonriver-61e46b26a68a',
        validator: ['0xb7Ab89933d2F16E6d183aAdcc5032bA17d6a5aEC']
      },
      {
        image: qprotocolImg,
        title: 'Q Protocol',
        description:
          'Q COMBINES THE BENEFITS OF A PUBLIC, OPEN AND DECENTRALIZED LEDGER WITH THE TRANSPARENCY OF ENFORCEABLE PRIVATE CONTRACTS. WHETHER YOU WANT TO INTERACT WITH OTHER BUSINESSES, BUILD DECENTRALIZED APPLICATIONS OR SIMPLY SEND AND RECEIVE TOKENS: Q IS FOR YOU.',
        explorer: [
          'https://hq.q.org/staking/validators/0x0C78C28FA19fEB59F370094E883e2C657d4030be'
        ],
        validator: ['0x0C78C28FA19fEB59F370094E883e2C657d4030be']
      },
      {
        image: graphImg,
        title: 'The Graph',
        description:
          'The Graph is an indexing protocol for querying networks like Ethereum and IPFS. Anyone can build and publish open APIs, called subgraphs, making data easily accessible',
        validator: ['0x51637a35f7f054c98ed51904de939b9561d37885'],
        explorer: [
          'https://graphscan.io/profile?id=0x51637a35f7f054c98ed51904de939b9561d37885#indexer-details'
        ],
        howToStake:
          'https://stakecraft.medium.com/how-to-become-a-delegator-on-the-graph-network-by-delegating-your-grt-using-the-graph-dapp-1c645c8bbc78'
      },
      {
        image: polygonImg,
        title: 'Polygon',
        description:
          'Polygon (MATIC) is a layer 2 scaling solution for Ethereum that aims to enhance scalability and improve user experience by providing faster and cheaper transactions. It achieves this by creating a network of sidechains that are interoperable with Ethereum, enabling developers to build decentralized applications (dApps) with increased efficiency and reduced costs.',
        validator: ['0x6215CF116c6a96872486cDC7cb50f52e515cCD15'],
        explorer: ['https://staking.polygon.technology/validators/155']
      },
      {
        image: altairImg,
        title: 'Altair',
        description:
          'Altair is the network for users who want to test the bounds of asset financing. From art NFTs to undiscovered assets — Altair enables users to tokenize their most experimental assets and finance them. It is the next step for anyone looking to unlock financing for their assets.',
        validator: ['kANggnPRwtCMbmHevsBNGwrFMawfgy985W9w8Jmfh32faorcT'],
        explorer: [
          'https://altair.subscan.io/account/kANggnPRwtCMbmHevsBNGwrFMawfgy985W9w8Jmfh32faorcT'
        ]
      },
      {
        image: centrifugeImg,
        title: 'Centrifuge',
        description:
          'Centrifuge bridges real-world assets like invoices, real estate, and royalties to DeFi.',
        validator: ['4fenPSM8fGXRe86ZyCn4za1jQwVUSAk5Z4q1C2c1bEqo16db'],
        explorer: [
          'https://centrifuge.subscan.io/account/4fenPSM8fGXRe86ZyCn4za1jQwVUSAk5Z4q1C2c1bEqo16db'
        ],
        howToStake: 'https://medium.com/coinmonks/how-to-stake-cfg-with-polkadot-js-dc860199950e'
      },
      {
        image: kifoundationImg,
        title: 'Ki Foundation',
        description:
          'Ki Foundations mission is about bridging the gap between CeFi and DeFi. Based on Cosmos-SDK, with a Tendermint core. The bridge is built through an ecosystem of real life businesses, creating value and pouring it back to the Ki ecosystem through one single asset: The $XKI.',
        validator: ['kivaloper1emn7g3wkzdm59ndplscrzsk7hllms6wtwdq47q'],
        explorer: [
          'https://www.mintscan.io/ki-chain/validators/kivaloper1emn7g3wkzdm59ndplscrzsk7hllms6wtwdq47q'
        ],
        howToStake:
          'https://medium.com/coinmonks/how-to-stake-xki-ki-chain-tokens-with-ki-desktop-wallet-eb86e1f80236'
      },
      {
        image: agoricImg,
        title: 'Agoric',
        description:
          'Agoric is an open-source development company launching an interoperable Proof-of-Stake chain and economy. A JavaScript-native smart contract platform offers developers a safe, reusable library of DeFi components to rapidly build and deploy on-chain.',
        explorer: [
          'https://agoric.explorers.guru/validator/agoricvaloper1avjyymefy3wzepse09q3hrgnla3fjr72av43e9'
        ],
        validator: ['agoricvaloper1avjyymefy3wzepse09q3hrgnla3fjr72av43e9'],
        howToStake:
          'https://stakecraft.medium.com/staking-your-agoric-tokens-with-keplr-wallet-8ec2e8e8a9eb'
      },
      {
        image: zetachainImg,
        title: 'Zetachain',
        description:
          'With its Universal EVM, ZetaChain is an L1 blockchain for chain abstraction. Build simple, secure, omnichain apps that span any chain from Ethereum and Cosmos to Bitcoin and beyond.',
        validator: ['zetavaloper1qf8fgz3tf8fpanuyj9h937aq8x5p8f02akncqp'],
        explorer: [
          'https://hub.zetachain.com/staking/zetavaloper1qf8fgz3tf8fpanuyj9h937aq8x5p8f02akncqp'
        ]
      },
      {
        image: auraImg,
        title: 'Aura Network',
        description:
          'Aura Network is a scalable, agile and effortless Layer-1 blockchain with a comprehensive ecosystem built to accelerate global NFTs adoption.',
        validator: ['auravaloper19mr8r5t0p4yruxjj2x5ydey9jyxdqfjc3vgpal'],
        explorer: [
          'https://aurascan.io/validators/auravaloper19mr8r5t0p4yruxjj2x5ydey9jyxdqfjc3vgpal'
        ]
      },
      {
        image: covalentImg,
        title: 'Covalent',
        description: 'Modular Data Infrastructure for AI',
        validator: ['0xAE2f541b129E2597D1a70A206A7e03cB42D4b597'],
        explorer: ['https://www.covalenthq.com/staking/']
      },
      {
        image: stafiImg,
        title: 'Stafi',
        description:
          'The first DeFi protocol unlocking liquidity of staked assets. Users can stake PoS tokens through Stafi and receive rTokens in return, which are available for trading while still earning staking rewards.',
        validator: ['34YZCBSy6UJKmcma1cJvUeEngyWswnQfqcEjaaMF16V7seUk'],
        explorer: [
          'https://stafi.subscan.io/validator/34YZCBSy6UJKmcma1cJvUeEngyWswnQfqcEjaaMF16V7seUk'
        ],
        howToStake: 'https://medium.com/coinmonks/how-to-stake-fis-with-polkadot-js-1b663c4760cd'
      },
      {
        image: subqueryImg,
        title: 'SubQuery',
        description:
          'Pioneering fast, flexible and scalable web3 infrastructure. Powering teams on ethereum, base, iotex_io, Polkadot, cosmos, avax, NEAR Protocol & 200+ more.',
        validator: ['0x38C4ef1f4737B0457A1AD3891adfD44B552ec857'],
        explorer: [
          'https://app.subquery.network/indexer/0x38C4ef1f4737B0457A1AD3891adfD44B552ec857'
        ]
      },
      {
        image: junoImg,
        title: 'Juno',
        description:
          'Interoperable smart contract network and a zone part of the Cosmos Network. Highly scalable, robust, secure and easy to deploy!',
        validator: ['junovaloper1345rra7x6uswe2z708zx3q7wj04e6wsykw2mk6'],
        explorer: [
          'https://www.mintscan.io/juno/validators/junovaloper1345rra7x6uswe2z708zx3q7wj04e6wsykw2mk6'
        ],
        howToStake:
          'https://stakecraft.medium.com/staking-your-juno-tokens-with-keplr-wallet-aa57499ecd25'
      },
      {
        image: stargazeImg,
        title: 'Stargaze',
        description:
          'Stargaze is a decentralized social protocol that integrates universal creator income (UCI), NFTs, and creator coins.',
        validator: ['starsvaloper1wvh8n82r4alqhxs45m8jtf536sqc5nzzgfzs7x'],
        explorer: [
          'https://www.stargaze.zone/stake?validator=starsvaloper1wvh8n82r4alqhxs45m8jtf536sqc5nzzgfzs7x'
        ],
        howToStake:
          'https://stakecraft.medium.com/staking-your-stars-tokens-with-keplr-wallet-47c945570d39'
      },
      {
        image: bitsongImg,
        title: 'Bitsong',
        description:
          'Distributed (open source) blockchain music ecosystem born in December 2017, to create a decentralized and trustless hub that interconnects the various market players.',
        validator: ['bitsongvaloper1rgtyd3uj3m0rr684hy3590y3vjcm9enhamsm6r'],
        explorer: [
          'https://www.mintscan.io/bitsong/validators/bitsongvaloper1rgtyd3uj3m0rr684hy3590y3vjcm9enhamsm6r'
        ],
        howToStake:
          'https://medium.com/coinmonks/staking-your-bitsong-btsg-tokens-with-keplr-wallet-5688b8abbe33'
      },
      {
        image: bitscrunchImg,
        title: 'BitsCrunch',
        description:
          'BITSCRUNCH IS AN AI-POWERED, DECENTRALIZED NFT DATA PLATFORM THAT ENABLES DEVELOPERS TO BUILD RELIABLE NFT APPLICATIONS (DAPPS) QUICK AND EASY.',
        validator: ['0xA358597250d6CE69684960294F0260c66299c2cD'],
        explorer: [
          'https://app.bitscrunch.com/profile/0xa358597250d6ce69684960294f0260c66299c2cd/overview'
        ]
      },
      {
        image: redbellyImg,
        title: 'Redbelly',
        description:
          'Redbelly - the only fully accountable layer 1 blockchain for Compliant Asset Tokenisation. Native to regulated assets, open, fast, scalable.',
        validator: ['0xA'],
        explorer: ['']
      },
      {
        image: walrusImg, // Add the Walrus logo to your assets folder
        title: 'Walrus',
        description:
          'Walrus is a decentralized storage and data availability protocol built on Sui, designed for large binary files. It features delegated proof of stake (dPoS) with the WAL token for governance and staking.',
        validator: ['stakecraft walrus validator address'], // Replace with actual validator address if available
        explorer: ['https://walrus.xyz/explorer'], // Replace with actual explorer link if available
        howToStake: 'https://docs.wal.app/7-staking-and-unstaking.html'
      }
    ]

    const isModalVisible = ref(false)
    const selectedNetwork = ref(null)

    const showModal = (network) => {
      selectedNetwork.value = network
      isModalVisible.value = true
    }

    const closeModal = () => {
      isModalVisible.value = false
      selectedNetwork.value = null
    }

    return {
      networks,
      selectedNetwork,
      showModal,
      isModalVisible,
      closeModal
    }
  }
}
</script>

<style scoped>
.networks {
  background: var(--van-mainnet-network-background);
  padding: 15px 22px;
  box-sizing: border-box;
  width: 300px;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  border-radius: 20px;
  margin-bottom: 28px;
  flex: 0 1 auto;
  transition: padding 0.5s;
  color: var(--van-mainnet-network-color);
}

.networks:hover {
  padding-left: 30px;
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

.networkName {
  font-family: poppins;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  margin-left: 16px;
}

.networkImg img {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

@media only screen and (max-width: 900px) {
  .buttonsArea {
    width: 100vw !important;
  }

  .networks {
    width: 159.5px;
    height: 92px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .networkImg img {
    width: 36px;
    height: 36px;
    object-fit: cover;
  }

  .networkName {
    margin: 0;
    font-size: 16px;
  }
}
</style>
