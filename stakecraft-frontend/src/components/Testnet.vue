<template>
  <div id="testnet">
    <div class="mainAreas">
      <div class="titleHeader">TestNet</div>

      <!-- Loading State -->
      <LoadingSpinner :loading="loading.testnet" message="Loading testnet networks..." />

      <!-- Error State -->
      <div v-if="error.testnet && !loading.testnet" class="error-message">
        <p>Failed to load testnet networks. Please try again later.</p>
        <button @click="fetchTestnet()" class="retry-btn">Retry</button>
      </div>

      <!-- Content -->
      <div v-if="!loading.testnet && !error.testnet" class="buttonsWrapper">
        <button
          class="networks"
          @click="openNetworkDescription(index)"
          v-for="(network, index) in networks"
          :key="network.id || network.title"
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
import LoadingSpinner from './LoadingSpinner.vue'
import { ref, onMounted } from 'vue'
import { useContent } from '../composables/useContent.js'

export default {
  name: 'TestnetSection',
  components: { Partnerships, LoadingSpinner },
  setup() {
    const { fetchTestnet, getTestnetNetworks, loading, error } = useContent()
    const showNetworkDescription = ref([])

    // Fetch testnet content on component mount
    onMounted(async () => {
      await fetchTestnet()
    })

    const openNetworkDescription = (index) => {
      const networks = getTestnetNetworks.value
      if (!networks[index]?.description) return false
      if (!showNetworkDescription.value[index]) {
        showNetworkDescription.value[index] = true
      } else {
        showNetworkDescription.value[index] = !showNetworkDescription.value[index]
      }
    }

    return {
      networks: getTestnetNetworks,
      openNetworkDescription,
      showNetworkDescription,
      loading,
      error
    }
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
