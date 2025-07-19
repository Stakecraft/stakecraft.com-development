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
            We use the latest infrastructure/hardware and our network is located within state of the
            art data centre facilities.
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
            Anyone can follow all our operations. Our activity is open to users. We believe this is
            the way it should be done.
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
            We focus on providing our clients with support to solve problems and keep their business
            running smoothly.
          </div>
        </button>
      </div>
    </div>
    <div class="team">
      <div class="firstRow">
        <div class="vasily">
          <div class="memberTitle">Vasily Istomin</div>
          <div class="memberTextArea">
            <div class="memberDescription">
              Project manager, business analysis, business planning, and customer relations. Crypto
              enthusiast.
            </div>
          </div>
        </div>
      </div>
      <div class="secondRow">
        <div class="alexander">
          <div class="memberTitle">Alexander Lysenko</div>
          <div class="memberTextArea">
            <div class="memberDescription">
              CEO at Hubcap SRL. Over 15 years of UNIX software system administration and DevOps
              experience.
            </div>
          </div>
        </div>
      </div>
      <div class="thirdRow">
        <div class="stanislav">
          <div class="memberTitle">Stanislav Culcitchi</div>
          <div class="memberTextArea">
            <div class="memberDescription">
              Network engineer with 6 years of experience, automatization and scripting specialist.
            </div>
          </div>
        </div>
      </div>
      <div class="fourthRow">
        <div class="alex">
          <div class="memberTitle">Alex Novacovschi</div>
          <div class="memberTextArea">
            <div class="memberDescription">
              DevOps engineer, blockchain expert, crypto enthusiast
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
  gap: 10%;
}

.about {
  width: 100%;
}

.shortDescription {
  line-height: 24px;
  font-family: poppins;
  font-size: 16px;
  font-weight: 400;
}

.team {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
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
  width: 100%;
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

.vasily {
  width: 270px;
  aspect-ratio: 1/1.1;
  transition: 0.3s linear background-image;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: url('../assets/vasily.svg');
  position: relative;
  cursor: pointer;
}

.alexander {
  width: 270px;
  aspect-ratio: 1/1.1;
  transition: 0.3s linear background-image;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: url('../assets/alexl.svg');
  position: relative;
  cursor: pointer;
}

.stanislav {
  width: 270px;
  aspect-ratio: 1/1.1;
  transition: 0.3s linear background-image;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: url('../assets/stanislav.svg');
  position: relative;
  cursor: pointer;
}

.alex {
  width: 270px;
  aspect-ratio: 1/1.1;
  transition: 0.3s linear background-image;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: url('../assets/alexN.svg');
  position: relative;
  cursor: pointer;
}

.vasily::before,
.alexander::before,
.stanislav::before,
.alex::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  transition: 0.4s ease-in-out background-color;
  pointer-events: none;
}

.firstRow:hover .vasily::before,
.secondRow:hover .alexander::before,
.thirdRow:hover .stanislav::before,
.fourthRow:hover .alex::before {
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 0.8;
}

.memberTextArea {
  height: 0;
  overflow: hidden;
  transition: 0.4s ease-in-out height;
}

.memberTitle {
  font-family: poppins;
  font-weight: 700;
  font-size: 18px;
  line-height: 26px;
  color: #fff;
  padding: 20px;
}

.memberDescription {
  font-family: poppins;
  font-weight: 400;
  font-size: 12px;
  line-height: 24px;
  color: #fff;
  padding: 0 20px 20px 20px;
  margin: 0;
  transform: translateY(20px);
  opacity: 0;
  transition:
    0.4s ease-in-out transform,
    0.4s ease-in-out opacity;
  transition-delay: 0.1s;
}

.firstRow:hover .memberTitle,
.secondRow:hover .memberTitle,
.thirdRow:hover .memberTitle,
.fourthRow:hover .memberTitle {
  transform: translateY(0);
  opacity: 1;
}

.firstRow:hover .memberTextArea,
.secondRow:hover .memberTextArea,
.thirdRow:hover .memberTextArea,
.fourthRow:hover .memberTextArea {
  height: auto;
  min-height: 80px;
}

.firstRow:hover .memberDescription,
.secondRow:hover .memberDescription,
.thirdRow:hover .memberDescription,
.fourthRow:hover .memberDescription {
  transform: translateY(0);
  opacity: 1;
}

@media only screen and (max-width: 1208px) {
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
    display: grid;
  }

  .alex,
  .vasily,
  .alexander,
  .stanislav {
    width: 100%;
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

  .memberTextArea {
    height: auto !important;
    opacity: 1 !important;
    box-sizing: border-box;
    /* margin-left: 23px; */
    margin-bottom: 15px;
  }
}
@media screen and (max-width: 425px) {
  .team {
    grid-template-columns: repeat(1, 1fr);
  }
  .memberDescription {
    height: 0px;
  }
}
</style>
