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
    <component
      v-if="StakingModalsHost"
      :is="StakingModalsHost"
      :selected-network="selectedNetwork"
      :is-modal-visible="isModalVisible"
      @close="closeModal"
    />
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue'
import { ref, onMounted, shallowRef } from 'vue'
import { useContent } from '../composables/useContent.js'

export default {
  name: 'MainnetComponent',
  components: {
    LoadingSpinner
  },
  setup() {
    const { fetchMainnet, getMainnetNetworks, loading, error } = useContent()

    const isModalVisible = ref(false)
    const selectedNetwork = ref(null)
    const StakingModalsHost = shallowRef(null)

    onMounted(async () => {
      await fetchMainnet()
      const mod = await import(/* @vite-ignore */ './StakingModals.vue')
      StakingModalsHost.value = mod.default
    })

    const showModal = (network) => {
      selectedNetwork.value = network
      isModalVisible.value = true
    }

    const closeModal = () => {
      isModalVisible.value = false
      selectedNetwork.value = null
    }

    return {
      networks: getMainnetNetworks,
      selectedNetwork,
      showModal,
      isModalVisible,
      closeModal,
      loading,
      error,
      StakingModalsHost
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
