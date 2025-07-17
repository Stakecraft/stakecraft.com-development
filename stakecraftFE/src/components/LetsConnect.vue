<template>
  <!-- <div>connect</div> -->
  <div class="testNet mainAreas" id="contacts">
    <div class="titleHeader">Let's Connect</div>
    <div class="contactsContent">
      <div class="email">
        <img src="../assets/email.svg" alt="email" />
        <span>support@stakecraft.com</span>
      </div>
      <div class="socialMedia">
        <a href="tg://resolve?domain=stakecraft"><img src="../assets/telegram.svg" /></a>
        <a href="https://twitter.com/stakecraft"><img src="../assets/twitter.svg" /></a>
        <a href="https://discord.gg/xkYnNYV4qH"><img src="../assets/discord.svg" /></a>
        <a href="https://stakecraft.medium.com/"><img src="../assets/medium.svg" /></a>
      </div>
    </div>
    <div class="lastInfo">
      <div class="stakecraftLogo">
        <img class="footerLogo" src="../assets/footerLogo.svg" />
        <div class="rewards">
          <img class="branded" src="../assets/branded-V.svg" />
          <img class="verified" src="../assets/verified.svg" />
        </div>
      </div>
      <div class="terms">
        <a href="/terms">Terms and conditions</a>
        <a href="/policy">Privacy policy</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  setup() {}
}
</script>

<style scoped>
.testNet {
  color: #fff;
  padding-top: 96px;
  padding-bottom: 86px;
  background: linear-gradient(#252723, #1d1e27);
}

.contactsContent {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 28px;
}

.socialMedia {
  display: flex;
}

.socialMedia a {
  display: flex;
  width: 60px;
  height: 60px;
  border-radius: 50px;
  background: #383a44;
  justify-content: center;
  align-content: center;
  margin-left: 25px;
}

.socialMedia a:first-child {
  margin-left: 0;
}

.socialMedia a img {
  width: 24px;
}

.email {
  display: flex;
  align-items: center;
  justify-content: center;
}

.email img {
  width: 24px;
}

.email span {
  color: #35f6df;
  font-size: 26px;
  font-family: generalSans;
  font-weight: 600;
  margin-left: 12px;
  align-self: center;
}

.lastInfo {
  padding-top: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stakecraftLogo {
  display: flex;
}

.footerLogo {
  width: 71.5px;
  margin-right: 48px;
}

.rewards {
  display: flex;
  align-items: center;
}

.rewards .branded {
  margin-right: 6px;
  width: 64.28px;
}

.rewards .verified {
  width: 246.5px;
  margin-left: -68px;
}

.terms a {
  font-family: poppins;
  font-size: 16px;
  color: #d9d9d9;
}

.terms a:first-child {
  margin-right: 59px;
}

@media only screen and (max-width: 900px) {
  .testNet {
    padding-top: 58px;
  }

  .contactsContent {
    flex-direction: column;
  }

  .email span {
    font-size: 22px;
  }

  .email img {
    width: 20px;
  }

  .email {
    justify-content: flex-start;
    margin-bottom: 28px;
  }

  .lastInfo {
    padding-top: 28px;
    display: block;
  }

  .terms {
    margin-top: 36px;
  }
}
</style>
