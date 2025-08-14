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
      <!-- Loading State -->
      <div v-if="loading.partnerships" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading partnerships...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error.partnerships" class="error-container">
        <p>Error loading partnerships: {{ error.partnerships }}</p>
      </div>

      <!-- Content -->
      <div v-else class="networksWrapper">
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
import { onMounted } from 'vue'
import { useContent } from '../composables/useContent.js'

export default {
  name: 'PartnershipsSection',
  setup() {
    const { fetchPartnerships, getPartnerships, loading, error } = useContent()

    // Fetch partnerships content on component mount
    onMounted(async () => {
      await fetchPartnerships()
    })

    return {
      networks: getPartnerships,
      loading,
      error
    }
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

/* Loading and Error Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
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
