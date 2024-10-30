<template>
  <div class="mainAreas">
    <div class="about">
      <div class="title">
        <div class="titleHeader">About</div>
        <div class="titleHeader">StakeCraft</div>
      </div>
      <div class="ourCapabilities">
        <div class="title">Our Capabilities</div>
        <button
          class="capabilitiesWrapper"
          @click="openDescription(index)"
          :class="{ withHeight: showDescription[index] }"
        >
          <div class="capabilityTitle">Quality Environment & Security</div>
          <button class="add" :class="{ around: showDescription[index] }">+</button>
          <div class="capabilityDescription">
            A next-generation cross-chain oracle solution designed to boost the performance of smart
            contracts and blockchain apps.
          </div>
        </button>

        <button
          class="capabilitiesWrapper"
          @click="openDescription(index)"
          :class="{ withHeight: showDescription[index] }"
        >
          <div class="capabilityTitle">Publicity</div>
          <button class="add" :class="{ around: showDescription[index] }">+</button>
          <div class="capabilityDescription">
            A next-generation cross-chain oracle solution designed to boost the performance of smart
            contracts and blockchain apps.
          </div>
        </button>

        <button
          class="capabilitiesWrapper"
          @click="openDescription(index)"
          :class="{ withHeight: showDescription[index] }"
        >
          <div class="capabilityTitle">Technical Support</div>
          <button class="add" :class="{ around: showDescription[index] }">+</button>
          <div class="capabilityDescription">
            A next-generation cross-chain oracle solution designed to boost the performance of smart
            contracts and blockchain apps.
          </div>
        </button>
      </div>
    </div>
    <div class="team">
      <div class="teamRow1">
        <div class="member1">
          <div class="memberTitle">Vasily Istomin</div>
          <div class="memberDescription">
            Project manager, business analysis, business planning, and customer relations. Crypto
            enthusiast.
          </div>
        </div>
        <div class="member2">
          <div class="memberTitle">Stanislav Culcitchi</div>
          <div class="memberDescription">
            Network engineer with 6 years of experience, automatization and scripting specialist.
          </div>
        </div>
      </div>
      <div class="teamRow2">
        <div class="member1">
          <div class="memberTitle">Alex Novacovschi</div>
          <div class="memberDescription">DevOps engineer, blockchain expert, crypto enthusiast</div>
        </div>
        <div class="member2">
          <div class="memberTitle">Alexander Lysenko</div>
          <div class="memberDescription">
            CEO at Hubcap SRL. Over 15 years of UNIX software system administration and DevOps
            experience.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
export default {
  setup() {
    const showDescription = ref([])

    const openDescription = (index) => {
      if (!showDescription.value[index]) {
        showDescription.value[index] = true
      } else {
        showDescription.value[index] = !showDescription.value[index]
      }
    }

    return { showDescription, openDescription }
  }
}
</script>

<style scoped>
.titleHeader {
  margin-bottom: 0;
  line-height: 72px;
}
</style>
