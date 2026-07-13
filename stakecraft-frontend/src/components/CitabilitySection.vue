<template>
  <section class="citability mainAreas" id="faq" aria-labelledby="faq-heading">
    <h2 id="faq-heading" class="titleHeader">Staking FAQ</h2>
    <p class="citability-intro">
      Answers to common questions about delegating to StakeCraft validators. StakeCraft is a
      non-custodial infrastructure operator — your tokens always remain in your wallet.
    </p>
    <dl class="faq-list">
      <div v-for="item in faqItems" :key="item.question" class="faq-item">
        <dt>{{ item.question }}</dt>
        <dd>{{ item.answer }}</dd>
      </div>
    </dl>
    <div class="delegation-guide">
      <h3>How to delegate</h3>
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
import { faqItems } from '../config/seo.js'

export default {
  name: 'CitabilitySection',
  setup() {
    return { faqItems }
  }
}
</script>

<style scoped>
.citability {
  padding: 80px 72px;
  background: var(--van-background, #fff);
  color: var(--van-text-color, #14191d);
}

.citability-intro {
  font-size: 18px;
  line-height: 1.6;
  max-width: 720px;
  margin-bottom: 2rem;
  color: var(--van-text-color-2, #5b666f);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.faq-item dt {
  font-family: generalSans, system-ui, sans-serif;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.faq-item dd {
  font-size: 16px;
  line-height: 1.65;
  color: var(--van-text-color-2, #5b666f);
  margin: 0;
}

.delegation-guide h3 {
  font-family: generalSans, system-ui, sans-serif;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 1rem;
}

.delegation-guide ol {
  padding-left: 1.25rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.delegation-guide li {
  margin-bottom: 0.5rem;
}

.contact-line a {
  color: #0e7c86;
}

@media only screen and (max-width: 900px) {
  .citability {
    padding: 48px 19px;
  }
}
</style>
