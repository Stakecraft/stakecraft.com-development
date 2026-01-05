<template>
  <div class="mainAreas" id="mainnet">
    <div class="titleHeader">Mainnet</div>

    <!-- Loading State -->
    <LoadingSpinner :loading="loading.mainnet" message="Loading mainnet networks..." />

    <!-- Error State -->
    <div v-if="error.mainnet && !loading.mainnet" class="error-message">
      <p>Failed to load mainnet networks. Please try again later.</p>
      <button @click="fetchMainnet()" class="retry-btn">Retry</button>
    </div>

    <!-- Content -->
    <div v-if="!loading.mainnet && !error.mainnet" class="buttonsArea">
      <button
        class="networks"
        @click="showModal(network)"
        v-for="network in networks"
        :key="network.id || network.title"
      >
        <div class="networkImg">
          <img :src="network.image" :alt="network.title" />
        </div>
        <div class="networkName">
          {{ network.title }}
        </div>
      </button>
    </div>
    <solana-staking
      v-if="selectedNetwork?.title === 'Solana' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <kava-staking
      v-if="selectedNetwork?.title === 'Kava' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <koii-staking
      v-if="selectedNetwork?.title === 'Koii' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <agoric-staking
      v-if="selectedNetwork?.title === 'Agoric' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <band-staking
      v-if="selectedNetwork?.title === 'Band Protocol' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <stargaze-staking
      v-if="selectedNetwork?.title === 'Stargaze' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <bitsong-staking
      v-if="selectedNetwork?.title === 'Bitsong' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <aura-staking
      v-if="selectedNetwork?.title === 'Aura Network' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <juno-staking
      v-if="selectedNetwork?.title === 'Juno' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <zeta-staking
      v-if="selectedNetwork?.title === 'Zetachain' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <ki-staking
      v-if="selectedNetwork?.title === 'Ki Foundation' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <supra-staking
      v-if="selectedNetwork?.title === 'Supra Oracles' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <near-staking
      v-if="selectedNetwork?.title === 'Near Protocol' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <zeta-staking
      v-if="selectedNetwork?.title === 'Zachain' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <polygon-staking
      v-if="selectedNetwork?.title === 'Polygon' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <moonriver-staking
      v-if="selectedNetwork?.title === 'Moonriver' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <graph-staking
      v-if="selectedNetwork?.title === 'The Graph' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <centrifuge-staking
      v-if="selectedNetwork?.title === 'Centrifuge' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <altair-staking
      v-if="selectedNetwork?.title === 'Altair' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <stafi-staking
      v-if="selectedNetwork?.title === 'Stafi' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <QProtocolStaking
      v-if="selectedNetwork?.title === 'Q Protocol' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <CovalentStaking
      v-if="selectedNetwork?.title === 'Covalent' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <SubQueryStaking
      v-if="selectedNetwork?.title === 'SubQuery' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <BitsCrunchStaking
      v-if="selectedNetwork?.title === 'BitsCrunch' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <RedbellyStaking
      v-if="selectedNetwork?.title === 'Redbelly' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <WalrusStaking
      v-if="selectedNetwork?.title === 'Walrus' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <MonadStaking
      v-if="selectedNetwork?.title === 'Monad' && isModalVisible && !showNotReadyModal"
      :network="selectedNetwork"
      @close="closeModal"
    />
    <!-- Network Not Ready Modal -->
    <network-not-ready-modal
      v-if="showNotReadyModal"
      :network="selectedNetwork"
      @close="closeNotReadyModal"
    />

    <!-- Generic Modal for networks without dedicated staking components -->
    <modal
      v-if="
        selectedNetwork &&
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
          'Near Protocol',
          'Polygon',
          'Moonriver',
          'The Graph',
          'Centrifuge',
          'Altair',
          'Stafi',
          'Aura Network',
          'Q Protocol',
          'Covalent',
          'SubQuery',
          'BitsCrunch',
          'Redbelly',
          'Walrus',
          'Monad'
        ].includes(selectedNetwork?.title) &&
        !showNotReadyModal
      "
      v-show="isModalVisible"
      @close="closeModal"
      :network="selectedNetwork"
    />
  </div>
</template>

<script>
import modal from './Modal.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import NetworkNotReadyModal from './NetworkNotReadyModal.vue'
import { ref, onMounted } from 'vue'
import { useContent } from '../composables/useContent.js'
import { isNetworkReadyForStaking } from '../utils/networkReadiness.js'
import SolanaStaking from './stakingViews/SolanaStaking.vue'
import KavaStaking from './stakingViews/KavaStaking.vue'
import NearStaking from './stakingViews/NearStaking.vue'
import SupraStaking from './stakingViews/SupraStaking.vue'
import AgoricStaking from './stakingViews/AgoricStaking.vue'
import BandStaking from './stakingViews/BandStaking.vue'
import StargazeStaking from './stakingViews/StargazeStaking.vue'
import BitsongStaking from './stakingViews/BitsongStaking.vue'
import JunoStaking from './stakingViews/JunoStaking.vue'
import KiStaking from './stakingViews/KiStaking.vue'
import PolygonStaking from './stakingViews/PolygonStaking.vue'
import KoiiStaking from './stakingViews/KoiiStaking.vue'
import ZetaStaking from './stakingViews/ZetaStaking.vue'
import MoonriverStaking from './stakingViews/MoonriverStaking.vue'
import GraphStaking from './stakingViews/GraphStaking.vue'
import CentrifugeStaking from './stakingViews/CentrifugeStaking.vue'
import AltairStaking from './stakingViews/AltairStaking.vue'
import StafiStaking from './stakingViews/StafiStaking.vue'
import AuraStaking from './stakingViews/AuraStaking.vue'
import QProtocolStaking from './stakingViews/QProtocolStaking.vue'
import CovalentStaking from './stakingViews/CovalentStaking.vue'
import SubQueryStaking from './stakingViews/SubQueryStaking.vue'
import BitsCrunchStaking from './stakingViews/BitsCrunchStaking.vue'
import RedbellyStaking from './stakingViews/RedbellyStaking.vue'
import WalrusStaking from './stakingViews/WalrusStaking.vue'
import MonadStaking from './stakingViews/MonadStaking.vue'

export default {
  name: 'MainnetComponent',
  components: {
    SolanaStaking,
    KavaStaking,
    SupraStaking,
    NearStaking,
    KoiiStaking,
    AgoricStaking,
    BandStaking,
    StargazeStaking,
    BitsongStaking,
    JunoStaking,
    ZetaStaking,
    KiStaking,
    modal,
    LoadingSpinner,
    NetworkNotReadyModal,
    PolygonStaking,
    MoonriverStaking,
    GraphStaking,
    CentrifugeStaking,
    AltairStaking,
    StafiStaking,
    AuraStaking,
    QProtocolStaking,
    CovalentStaking,
    SubQueryStaking,
    BitsCrunchStaking,
    RedbellyStaking,
    WalrusStaking,
    MonadStaking
  },
  setup() {
    const { fetchMainnet, getMainnetNetworks, loading, error } = useContent()

    const isModalVisible = ref(false)
    const selectedNetwork = ref(null)
    const showNotReadyModal = ref(false)

    // Fetch mainnet content on component mount
    onMounted(async () => {
      await fetchMainnet()
    })

    const showModal = (network) => {
      try {
        if (!network) {
          console.error('Network is null or undefined')
          return
        }

        // Check if network is ready for staking
        const readinessCheck = isNetworkReadyForStaking(network)
        
        if (!readinessCheck.isReady) {
          // Show "not ready" message instead of staking modal
          selectedNetwork.value = network
          showNotReadyModal.value = true
          console.warn(`Network ${network.title} is not ready for staking:`, readinessCheck.reason)
          return
        }

        // Network is ready, show staking modal
        selectedNetwork.value = network
        isModalVisible.value = true
        showNotReadyModal.value = false
      } catch (error) {
        console.error('Error in showModal:', error)
        // If there's an error, show the not ready modal as a fallback
        if (network) {
          selectedNetwork.value = network
          showNotReadyModal.value = true
        }
      }
    }

    const closeModal = () => {
      isModalVisible.value = false
      selectedNetwork.value = null
      showNotReadyModal.value = false
    }

    const closeNotReadyModal = () => {
      showNotReadyModal.value = false
      selectedNetwork.value = null
    }

    return {
      networks: getMainnetNetworks,
      selectedNetwork,
      showModal,
      isModalVisible,
      closeModal,
      showNotReadyModal,
      closeNotReadyModal,
      loading,
      error
    }
  }
}
</script>

<style scoped>
.networks {
  background: var(--van-mainnet-network-background);
  padding: 15px 22px;
  box-sizing: border-box;
  width: 100%;
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
  padding-bottom: 70px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

@media only screen and (max-width: 1024px) {
  .buttonsArea {
    width: 100% !important;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    padding-bottom: 40px;
  }

  .networks {
    width: 100%;
    height: 90px;
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

@media only screen and (max-width: 450px) {
  .buttonsArea {
    padding-bottom: 0;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
}

.error-message p {
  margin-bottom: 1rem;
  font-family: 'poppins', sans-serif;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'poppins', sans-serif;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #5a6fd8;
}
</style>
