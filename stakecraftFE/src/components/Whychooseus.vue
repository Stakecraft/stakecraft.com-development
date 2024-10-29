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
      <div v-for="stat in stats" class="statWrapper" :key="stat.title">
        <div class="statsCover" />
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
import coinImg from '../assets/coin_image.svg'
import statsImg from '../assets/stats_image.svg'
import userImg from '../assets/user icon.svg'

export default {
  setup() {
    const stats = [
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

    return { stats }
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

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.statsArea {
  display: flex;
  justify-content: space-between;
  margin-top: 38px;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: url('../assets/stats_img.svg');
  z-index: 4;
}

.statsArea:after {
  content: '';
  top: 0;
  right: 0;
  position: absolute;
  background: url('../assets/moving_vector.svg') center no-repeat;
  background-size: cover;
  /*animation: rotate 100s infinite linear;*/
  width: 100%;
  height: 100%;
  z-index: 3;
}

.statWrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  justify-content: space-between;
  background: transparent;
  position: relative;
  margin-left: 22px;
  border-radius: 22px;
}

.statWrapper:first-child {
  margin-left: 0;
}

.statWrapper:after {
  content: '';
  z-index: 100;
  background: var(--van-background);
  width: 22px;
  height: 100%;
  position: absolute;
  top: 0;
  right: -22px;
}

.statsCover {
  top: 0;
  right: 0px;
  width: 100%;
  height: 100%;
  position: absolute;
  border: 10px solid var(--van-background); /* Outer square border */
  display: flex;
  align-items: center;
  justify-content: center;
}

.statsCover:after {
  content: '';
  top: 0;
  right: 0px;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0); /* Transparent background */
  border-radius: 22px;
  overflow: hidden;
  border: 10px solid var(--van-background);
}

/*.statWrapper:before {
  content: '';
  top: 0;
  right: 0px;
  width: 100%;
  height: 100%;
  position: absolute;
  border: 2px solid #000;
  background-color: rgba(255, 255, 255, 0);
  border-radius: 22px;
  overflow: hidden;
}*/

/* .statWrapper:after {
  content: '';
  z-index: 100;
  background: var(--van-background);
  background: #00dcd2;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  width: 22px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0px;
  z-index: 3;
}

.statWrapper:before {
  content: '';
  top: 0;
  right: -22px;
  width: 40px;
  height: 100%;
  background: var(--van-background);
  position: absolute;
  z-index: 2;
} */

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
}
</style>
