<template>
  <div class="whychooseus mainAreas">
    <div class="titleHeader">Why Choose Us?</div>
    <div class="description">
      Stakecraft is a team of geeks with vast experience in programming, developing, and managing
      digital assets. We use top-notch infrastructure/hardware to run our nodes. Our team, with the
      highest degree of responsibility, approaches management, timely installation of updates, and
      monitoring safety of user funds. Join us and enjoy earnings from staking your digital assets.
    </div>
    <div class="statsArea">
      <!-- Animated SVG element -->
      <div class="rotatingSvgWrapper">
        <img :src="vector2" alt="Rotating decoration" />
      </div>

      <div v-for="stat in stats" class="statWrapper" :key="stat.title">
        <div class="statsImg">
          <img :src="stat.image" :alt="stat.title" />
        </div>
        <div class="statsDetails">
          <div class="statsNumber">
            {{ stat.number }}
          </div>
          <div class="statsDescription">
            {{ stat.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue'
import coinImg from '../assets/coin_image.svg'
import statsImg from '../assets/stats_image.svg'
import userImg from '../assets/user icon.svg'
import vector2 from '../assets/Vector 2.svg'

export default {
  name: 'WhyChooseUs',
  setup() {
    const stats = ref([
      {
        title: 'Total Staked Assets in $',
        number: '33.7M',
        image: coinImg
      },
      {
        title: 'Projects Supported',
        number: '27',
        image: statsImg
      },
      {
        title: 'Total Delegators',
        number: '3586',
        image: userImg
      }
    ])

    // Static fallback data
    const staticStats = [
      {
        title: 'Total Staked Assets in $',
        number: '33.7M',
        image: coinImg
      },
      {
        title: 'Projects Supported',
        number: '27',
        image: statsImg
      },
      {
        title: 'Total Delegators',
        number: '3586',
        image: userImg
      }
    ]

    // Format number to readable format (e.g., 32305809.26 -> "32.3M")
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    }

    // Fetch data from API
    const fetchStatsData = async () => {
      try {
        const response = await fetch('https://aum.stakecraft.com')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Update stats with dynamic data
        stats.value = [
          {
            title: 'Total Staked Assets in $',
            number: formatNumber(data.balanceUsd || 0),
            image: coinImg
          },
          {
            title: 'Projects Supported',
            number: data.supportedAssets ? data.supportedAssets.length.toString() : '0',
            image: statsImg
          },
          {
            title: 'Total Delegators',
            number: formatNumber(data.users || 0),
            image: userImg
          }
        ]
      } catch (error) {
        console.warn('Failed to fetch stats data from API, using static data:', error)
        // Fallback to static data if API fails
        stats.value = staticStats
      }
    }

    // Load data when component mounts
    onMounted(() => {
      fetchStatsData()
    })

    return { stats, vector2 }
  }
}
</script>

<style scoped>
.whychooseus {
  padding-top: 96px;
  padding-bottom: 86px;
}

.description {
  font-family: poppins;
  font-size: 16px;
  max-width: 740px;
}

.statsArea {
  position: relative;
  overflow: hidden;
  display: flex;
  margin-top: 38px;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
  /* border-radius: 50px; */
}

/* Position and animate the SVG */
.rotatingSvgWrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none; /* allows clicks through the SVG */
  z-index: 10;
  width: 100%;
  height: 1200px;
}

.rotatingSvgWrapper img {
  width: 100%;
  height: 100%;
  animation: rotate360 10s linear infinite;
  transform-origin: center;
  scale: 1.5;
}

@keyframes rotate360 {
  from {
    transform: translate(0%, 0%) rotate(0deg);
  }
  to {
    transform: translate(0%, 0%) rotate(360deg);
  }
}

.statWrapper {
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  justify-content: space-between;
  position: relative;
  border-radius: 22px;
  background: #00dcd2;
}

.statWrapper:first-child {
  margin-left: 0;
}

.statsImg {
  display: flex;
  justify-content: center;
}

.statsDetails {
  margin-left: 35px;
}

.statsNumber {
  font-size: 52px;
  font-family: generalSans;
  font-weight: 600;
  color: #111217;
  line-height: 40px;
}

.statsDescription {
  font-size: 16px;
  font-family: poppins;
  font-weight: 400;
  color: #111217;
  line-height: 24px;
  margin-top: 6px;
}

@media only screen and (max-width: 900px) {
  .statsArea {
    flex-direction: column;
    gap: 28px;
  }

  .statWrapper {
    max-width: 100%;
    max-height: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: stretch;
    gap: 40px;
    /* justify-content: space-between; */
    padding: 0 14px;
  }

  .statsImg img {
    width: 100px !important;
    height: 100px !important;
  }

  .statsNumber {
    font-size: 36px;
  }

  .statsDescription {
    font-size: 16px;
  }

  .statsDetails {
    margin-left: 0;
  }
  .whychooseus {
    padding-top: 56px;
  }
}
</style>
