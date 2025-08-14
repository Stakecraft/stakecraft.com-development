<template>
  <div class="swap-container">
    <!-- Caution Disclaimer -->
    <div class="caution-disclaimer">
      <div class="caution-content">
        <h3>⚠️ Important Notice</h3>
        <p>
          The crypto swap functionality provided on this website is operated by a third-party
          service. StakeCraft does not operate, control, or take responsibility for the performance,
          security, accuracy, or availability of the swap service. Users interact with it at their
          own risk. Please verify all transaction details before proceeding.
        </p>
      </div>
    </div>

    <link rel="stylesheet" type="text/css" href="https://letsexchange.io/widget_lets.css" />
    <div
      class="lets-widget"
      id="lets_widget_ugOBzESJhm3ITbbQ"
      style="max-width: 600px; height: 600px"
    >
      <iframe
        src="https://letsexchange.io/v2/widget?affiliate_id=ugOBzESJhm3ITbbQ&is_iframe=true"
        width="100%"
        height="100%"
        frameBorder="0"
        allow="clipboard-read; clipboard-write"
      ></iframe>
    </div>
    <!-- <script src="https://letsexchange.io/init_widget.js"></script> -->

    <!-- LetsExchange Widget Integration -->
    <!-- <link rel="stylesheet" type="text/css" href="https://letsexchange.io/widget_lets.css" />
    <div
      class="lets-widget"
      id="lets_widget_ugOBzESJhm3ITbbQ"
      style="max-width: 510px; height: 600px; margin: 40px auto"
    >
      <iframe
        src="https://letsexchange.io/v2/widget?affiliate_id=ugOBzESJhm3ITbbQ&is_iframe=true"
        width="100%"
        height="100%"
        frameBorder="0"
        allow="clipboard-read; clipboard-write"
      ></iframe> -->
    <!-- </div> -->
  </div>
</template>

<script setup>
// Component name for Vue DevTools
defineOptions({
  name: 'SwapPage'
})

// No additional script logic needed for static widget
</script>

<style scoped>
.swap-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 80vh;
  padding-top: 100px;
  background: var(--van-background, #fff);
}

.caution-disclaimer {
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: var(--van-caution-background, #fff3cd);
  border: 1px solid var(--van-caution-border, #ffeaa7);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.caution-content h3 {
  color: var(--van-caution-text, #856404);
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
}

.caution-content p {
  color: var(--van-caution-text, #856404);
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  text-align: justify;
}

/* Dark theme adjustments */
.van-theme-dark .caution-disclaimer {
  background: var(--van-caution-background-dark, #2d3748);
  border-color: var(--van-caution-border-dark, #4a5568);
}

.van-theme-dark .caution-content h3,
.van-theme-dark .caution-content p {
  color: var(--van-caution-text-dark, #e2e8f0);
}
</style>
<!-- Widget JS loaded globally in index.html or main app entry -->
