<template>
  <section class="citability mainAreas" id="faq" aria-labelledby="faq-heading">
    <h2 id="faq-heading" class="titleHeader">Staking FAQ</h2>
    <p class="citability-intro">
      Answers to common questions about delegating to StakeCraft validators. StakeCraft is a
      non-custodial infrastructure operator — your tokens always remain in your wallet.
    </p>

    <div class="faq-list">
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
          <h3 class="faq-question">{{ item.question }}</h3>
          <span class="add" :class="{ around: openItems[index] }">+</span>
        </div>
        <p class="faq-answer">{{ item.answer }}</p>
      </div>
    </div>

    <div class="delegation-guide">
      <h3 class="guide-title">How to delegate</h3>
      <ol>
        <li>Choose a network from the mainnet section above.</li>
        <li>
          Open your network wallet (Phantom for Solana, Keplr for Cosmos, NEAR Wallet for
          NEAR, etc.).
        </li>
        <li>Navigate to the staking or delegation section.</li>
        <li>
          Search for <strong>StakeCraft</strong> or paste the validator address shown on our
          network card.
        </li>
        <li>Enter the amount to delegate and confirm the transaction.</li>
      </ol>
      <p class="contact-line">
        Questions? Email
        <a href="mailto:support@stakecraft.com">support@stakecraft.com</a>
        or reach us on
        <a href="https://t.me/stakecraft" rel="noopener noreferrer" target="_blank">Telegram</a>.
      </p>
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
  padding-top: 96px;
  padding-bottom: 100px;
}

.citability-intro {
  font-family: poppins;
  font-size: 16px;
  line-height: 24px;
  max-width: 740px;
  margin-bottom: 45px;
  color: var(--van-text-color);
}

.faq-list {
  margin: 0 0 60px 0;
  max-width: 900px;
}

.wrapper {
  overflow: hidden;
  margin-bottom: 18px;
  max-height: 62px;
  transition: max-height 0.35s ease;
  background: var(--van-ourCapabilities-wrapper);
  color: var(--van-ourCapabilities-text);
  border-radius: 8px;
  cursor: pointer;
}

.wrapper.withHeight {
  max-height: 400px;
}

.presentation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  font-family: poppins;
  font-size: 20px;
  line-height: 30px;
}

.faq-question {
  font-family: poppins;
  font-weight: 600;
  margin: 0;
}

.add {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
  transition: 0.3s linear transform;
  color: var(--van-ourCapabilities-text);
}

.add.around {
  transform: rotate(45deg);
}

.faq-answer {
  margin: 0;
  padding: 0 20px 18px 20px;
  font-family: poppins;
  font-size: 16px;
  line-height: 24px;
  color: var(--van-text-color-2, #5b666f);
}

.delegation-guide {
  max-width: 740px;
}

.guide-title {
  font-family: generalSans;
  font-size: 26px;
  line-height: 34px;
  font-weight: 600;
  color: var(--van-ourCapabilities-title);
  margin-bottom: 20px;
}

.delegation-guide ol {
  padding-left: 1.25rem;
  font-family: poppins;
  font-size: 16px;
  line-height: 28px;
  color: var(--van-text-color);
  margin-bottom: 24px;
}

.delegation-guide li {
  margin-bottom: 8px;
}

.contact-line {
  font-family: poppins;
  font-size: 16px;
  line-height: 24px;
  color: var(--van-text-color);
}

.contact-line a {
  color: var(--van-ourCapabilities-title);
  text-decoration: none;
}

.contact-line a:hover {
  text-decoration: underline;
}

@media only screen and (max-width: 900px) {
  .citability {
    padding-top: 56px;
    padding-bottom: 56px;
  }

  .presentation {
    font-size: 16px;
    line-height: 24px;
    padding: 16px 15px;
  }

  .wrapper {
    max-height: 60px;
  }

  .wrapper.withHeight {
    max-height: 500px;
  }

  .faq-answer {
    padding: 0 15px 16px 15px;
  }
}
</style>
