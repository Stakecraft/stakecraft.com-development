<template>
  <div class="mainAreas">
    <div class="about">
      <div class="titleHeader">
        <div>About</div>
        <div>StakeCraft</div>
      </div>
      <div class="shortDescription">
        Our team has earned recognition in the crypto community as the reliable team that approaches
        with the highest degree of responsibility to all tasks and monitors security of all data.
      </div>
      <div class="ourCapabilities">
        <div class="title">Our Capabilities</div>
        <button
          class="wrapper"
          @click="openDescription(0)"
          :class="{ withHeight: showDescription[0] }"
        >
          <div class="presentation">
            <div class="capabilityTitle">Quality Environment & Security</div>
            <button class="add" :class="{ around: showDescription[0] }">+</button>
          </div>
          <div class="capabilityDescription">
            A next-generation cross-chain oracle solution designed to boost the performance of smart
            contracts and blockchain apps.
          </div>
        </button>

        <button
          class="wrapper"
          @click="openDescription(1)"
          :class="{ withHeight: showDescription[1] }"
        >
          <div class="presentation">
            <div class="capabilityTitle">Publicity</div>
            <button class="add" :class="{ around: showDescription[1] }">+</button>
          </div>
          <div class="capabilityDescription">
            A next-generation cross-chain oracle solution designed to boost the performance of smart
            contracts and blockchain apps.
          </div>
        </button>

        <button
          class="wrapper"
          @click="openDescription(2)"
          :class="{ withHeight: showDescription[2] }"
        >
          <div class="presentation">
            <div class="capabilityTitle">Technical Support</div>
            <button class="add" :class="{ around: showDescription[index] }">+</button>
          </div>
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
          <div class="memberTextArea">
            <div class="memberTitle">Vasily Istomin</div>
            <div class="memberDescription">
            Project manager, business analysis, business planning, and customer relations. Crypto
            enthusiast.
            </div>
          </div>
        </div>
        <div class="member2">
          <div class="memberTextArea">
            <div class="memberTitle">Stanislav Culcitchi</div>
            <div class="memberDescription">
              Network engineer with 6 years of experience, automatization and scripting specialist.
            </div>
          </div>
        </div>
      </div>
      <div class="teamRow2">
        <div class="member1">
          <div class="memberTextArea">
            <div class="memberTitle">Alex Novacovschi</div>
            <div class="memberDescription">DevOps engineer, blockchain expert, crypto enthusiast</div>
          </div>
        </div>
        <div class="member2">
          <div class="memberTextArea">
            <div class="memberTitle">Alexander Lysenko</div>
            <div class="memberDescription">
              CEO at Hubcap SRL. Over 15 years of UNIX software system administration and DevOps
              experience.
            </div>
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
.titleHeader > * {
  font-weight: 600;
}

.titleHeader > *:last-child {
  margin: 30px 0 31px 0;
}

button {
  background-color: #fff;
  border: none;
}

.mainAreas {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 100px;
}

.about {
  max-width: 581px;
}

.shortDescription {
  line-height: 24px;
  font-family: poppins;
  font-size: 16px;
  font-weight: 400;
}

.team {
  max-width: 575.49px;
  display: flex;
}

.ourCapabilities .title {
  color: #00beb5;
  line-height: 34px;
  font-size: 26px;
  font-family: generalSans;
  font-weight: 600;
  margin: 45px 0 30px 0;
}

.ourCapabilities .wrapper {
  height: 62px;
  overflow: hidden;
  margin-bottom: 18px;
  transition: 0.3s linear height;
}

.ourCapabilities .wrapper.withHeight {
  height: 145px;
}

.capabilityDescription {
  text-align: left;
  padding: 0px 20px 15px 20px;
  font-size: 16px;
  line-height: 24px;
  font-family: poppins;
}

.ourCapabilities .presentation {
  display: flex;
  padding: 16px 20px 11px 20px;
  font-family: poppins;
  font-size: 20px;
  line-height: 30px;
  justify-content: space-between;
}

.add {
  font-size: 24px;
  align-self: flex-end;
  transition: 0.3s linear transform;
}

.add.around {
  transform: rotate(45deg);
}

.teamRow1 > *,
.teamRow2 > * {
  width: 272px;
  height: 299px;
  transition: 0.3s linear background;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 0 15px 23px;
}

.teamRow1 .member1 {
  background-image: url('../assets/vasily.svg');
  margin: 0 25px 25px 0;
}

.teamRow1 .member2 {
  background-image: url('../assets/alexander.svg');
}

.teamRow2 .member1 {
  background-image: url('../assets/stanislav.svg');
  margin: 0 25px 25px 0;
}

.teamRow2 .member2 {
  background-image: url('../assets/alexN.svg');
}

.memberTextArea {
  height: 35px;
  overflow: hidden;
  transition: 0.3s linear height;
}

.teamRow1 .member1:hover {
  background-image: url('../assets/vasilyHover.svg');
}

.teamRow1 .member1:hover .memberTextArea, .teamRow1 .member2:hover .memberTextArea,  .teamRow2 .member1:hover .memberTextArea, .teamRow2 .member2:hover .memberTextArea{
  height: 130px;
}

.teamRow1 .member2:hover {
  background-image: url('../assets/alexanderHover.svg');
}

.teamRow2 .member1:hover {
  background-image: url('../assets/stanislavHover.svg');
}

.teamRow2 .member2:hover {
  background-image: url('../assets/alexNHover.svg');
}

.memberTitle {
  font-family: poppins;
  font-weight: 700;
  font-size: 20px;
  line-height: 26px;
  color: #fff;
  margin-bottom: 4px;
}

.memberDescription {
  font-family: poppins;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #fff;
  width: 221.83px;
}
</style>
