<template>
  <section class="citability mainAreas" id="faq" aria-labelledby="faq-heading">
    <div class="faq-content">
      <h2 id="faq-heading" class="titleHeader">Staking FAQ</h2>
      <p class="faq-intro">
        Answers to common questions about delegating to StakeCraft validators. StakeCraft is a
        non-custodial infrastructure operator — your tokens always remain in your wallet.
      </p>

      <div class="faq-panels">
        <div
          v-for="(item, index) in faqItems"
          :key="item.question"
          class="wrapper"
          :class="{ withHeight: openItems[index] }"
          role="button"
          tabindex="0"
          :aria-expanded="openItems[index] ? 'true' : 'false'"
          @click="toggle(index)"
          @keydown.enter.prevent="toggle(index)"
          @keydown.space.prevent="toggle(index)"
        >
          <div class="presentation">
            <div class="panel-title">{{ item.question }}</div>
            <span class="add" :class="{ around: openItems[index] }">+</span>
          </div>
          <div class="panel-description">{{ item.answer }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'
import { faqItems } from '../config/seo.js'

export default {
  name: 'CitabilitySection',
  setup() {
    const openItems = ref({})

    const toggle = (index) => {
      openItems.value[index] = !openItems.value[index]
    }

    return { faqItems, openItems, toggle }
  }
}
</script>

<style scoped>
.citability {
  background: var(--van-about-us-background);
  padding-top: 100px;
  padding-bottom: 100px;
}

.faq-content {
  width: 100%;
  max-width: none;
}

.faq-intro {
  line-height: 24px;
  font-family: poppins;
  font-size: 16px;
  font-weight: 400;
  margin: 0 0 45px 0;
  color: var(--van-text-color);
}

.faq-panels {
  width: 100%;
}

.wrapper {
  max-height: 62px;
  width: 100%;
  overflow: hidden;
  margin-bottom: 18px;
  transition: 0.3s linear max-height;
  background: var(--van-ourCapabilities-wrapper);
  color: var(--van-ourCapabilities-text);
  cursor: pointer;
  border-radius: 8px;
}

.wrapper.withHeight {
  max-height: 320px;
}

.presentation {
  display: flex;
  padding: 16px 20px 11px 20px;
  font-family: poppins;
  font-size: 20px;
  line-height: 30px;
  justify-content: space-between;
}

.panel-title {
  font-family: poppins;
  font-size: 20px;
  line-height: 30px;
  font-weight: 400;
  margin: 0;
}

.panel-description {
  text-align: left;
  padding: 0 20px 15px 20px;
  font-size: 16px;
  line-height: 24px;
  font-family: poppins;
  margin: 0;
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

@media only screen and (max-width: 1208px) {
  .citability {
    padding-top: 0;
    padding-bottom: 100px;
  }

  .presentation {
    font-size: 16px;
    line-height: 24px;
    padding: 16px 15px;
    align-items: center;
  }

  .panel-title {
    font-size: 16px;
    line-height: 24px;
  }

  .wrapper {
    padding: 0;
    margin: 0 0 15px 0;
    box-sizing: border-box;
  }

  .wrapper.withHeight {
    max-height: 420px;
  }

  .panel-description {
    padding: 0 15px 15px 15px;
  }
}
</style>
