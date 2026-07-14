<template>
  <div class="mainAreas" id="mainnet">
    <div class="titleHeader">Mainnet</div>
    <LoadingSpinner :loading="loading.mainnet" message="Loading mainnet networks..." />
    <div v-if="error.mainnet && !loading.mainnet" class="error-message">
      <p>Failed to load mainnet networks. Please try again later.</p>
    </div>
    <div v-if="!loading.mainnet && !error.mainnet" class="buttonsArea">
      <div
        class="networks"
        v-for="network in networks"
        :key="network.id || network._id || network.title"
      >
        <div class="networkImg">
          <img v-if="network.image" :src="network.image" :alt="network.title" />
        </div>
        <div class="networkName">{{ network.title }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue'
import { onMounted } from 'vue'
import { useContent } from '../composables/useContent.js'

export default {
  name: 'MainnetStatic',
  components: { LoadingSpinner },
  setup() {
    const { fetchMainnet, getMainnetNetworks, loading, error } = useContent()
    onMounted(async () => {
      if (!getMainnetNetworks.value.length) {
        await fetchMainnet()
      }
    })
    return {
      networks: getMainnetNetworks,
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
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  border-radius: 20px;
  margin-bottom: 28px;
  flex: 0 1 auto;
  color: var(--van-mainnet-network-color);
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
</style>
