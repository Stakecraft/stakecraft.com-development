<template>
  <div class="mainAreas" id="aboutUs">
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
            We use the latest infrastructure/hardware and our network is located within state of the art data centre facilities. 
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
            Anyone can follow all our operations. Our activity is open to users. We believe this is the way it should be done.
          </div>
        </button>

        <button
          class="wrapper"
          @click="openDescription(1)"
          :class="{ withHeight: showDescription[1] }"
        >
          <div class="presentation">
            <div class="capabilityTitle">Trustworthy team</div>
            <button class="add" :class="{ around: showDescription[2] }">+</button>
          </div>
          <div class="capabilityDescription">
            Through hard work, our team has earned recognition in the crypto community as the reliable team that approaches with the highest degree of responsibility to all tasks and monitors security of all data.
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
            We focus on providing our clients with support to solve problems and keep their business running smoothly.
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
            <div class="memberTitle">Alexander Lysenko</div>
            <div class="memberDescription">
              Over 15 years of UNIX software system administration and DevOps experience.
            </div>
          </div>
        </div>
      </div>
      <div class="teamRow2">
        <div class="member1">
          <div class="memberTextArea">
            <div class="memberTitle">Stanislav Culcitchi</div>
            <div class="memberDescription">
              Network engineer with 6 years of experience, automatization and scripting specialist.
            </div>
          </div>
        </div>
        <div class="member2">
          <div class="memberTextArea">
            <div class="memberTitle">Alex Novacovschi</div>
            <div class="memberDescription">
              DevOps engineer, blockchain expert, crypto enthusiast.
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
#aboutUs {
  background: var(--van-about-us-background);
  padding-top: 100px;
}

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
  color: var(--van-ourCapabilities-title);
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
  background: var(--van-ourCapabilities-wrapper);
  color: var(--van-ourCapabilities-text);
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
  background: var(--van-ourCapabilities-wrapper);
  color: var(--van-ourCapabilities-text);
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
  background-repeat: no-repeat;
}

.teamRow1 .member1 {
  background-image: url('../assets/vasily.svg');
  margin: 0 25px 25px 0;
}

.teamRow1 .member2 {
  background-image: url('../assets/alexl.svg');
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

.teamRow1 .member1:hover .memberTextArea,
.teamRow1 .member2:hover .memberTextArea,
.teamRow2 .member1:hover .memberTextArea,
.teamRow2 .member2:hover .memberTextArea {
  height: 130px;
}

.teamRow1 .member2:hover {
  background-image: url('../assets/alexlHover.svg');
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

@media only screen and (max-width: 900px) {
  #aboutUs {
    padding-top: 0px;
  }

  .titleHeader > *:last-child {
    margin: 0;
  }

  .titleHeader {
    line-height: 52px;
  }

  .about {
    max-width: unset;
  }

  .mainAreas {
    flex-direction: column;
  }

  .team {
    max-width: auto;
    display: block;
  }

  .ourCapabilities .presentation {
    font-size: 16px;
    line-height: 24px;
    padding: 16px 15px;
    align-items: center;
  }

  .ourCapabilities .wrapper {
    padding: 0;
    margin: 0 0 15px 0;
    box-sizing: border-box;
  }

  .ourCapabilities .wrapper.withHeight {
    height: 164px;
  }

  .ourCapabilities .title {
    margin-bottom: 18px;
  }

  .teamRow1 > *,
  .teamRow2 > * {
    width: calc(100vw - 8.5px);
    height: calc(100vw - 8.5px);
    margin: 0 0 25px 0 !important;
    background-size: contain;
    box-sizing: border-box;
    padding: 0;
  }

  .memberTextArea {
    box-sizing: border-box;
    margin-left: 23px;
    margin-bottom: 15px;
  }
}
</style>
