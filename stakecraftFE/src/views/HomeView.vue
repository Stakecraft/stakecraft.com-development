<script setup>
</script>

<template>
  <main class="homeView">
    <div class="presentation">
      <div class="titleArea">
        <div class="titleLvl1">Trustworthy</div>
        <div class="titleLvl2">Validator</div>
      </div>
      <div class="websiteDescription">
        Stakecraft validator offers services to make profit to users from staking their digital
        assets, providing high reliability, security of user funds, transparent monitoring, and
        advanced technical support.
      </div>
    </div>
    <img class="imageArea" src="../assets/mainImage.png" />
  </main>
</template>

<style scoped>
.homeView {
  margin-top: 95px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: url('../assets/frame.svg');
  background-size: contain;
}

.presentation {
  display: flex;
  flex-direction: column;
  width: 608px;
  margin-right: 40px;
  padding-left: 72px;
}

.titleArea {
  margin-bottom: 35px;
}

.titleArea div {
  font-size: 90px;
  font-weight: 600;
  line-height: 100px;
  font-family: generalSans;
}

.websiteDescription {
  font-size: 20px;
  line-height: 30px;
}

.imageArea {
  width: 630px;
  padding-right: 72px;
}
</style>
