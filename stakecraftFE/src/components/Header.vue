<template>
  <div class="header" :class="theme">
    <div class="leftItems">
      <img src="../assets/headerLogo.svg" class="headerLogo" />
    </div>
    <ul class="centerItems">
      <li>Mainnet</li>
      <li>Testnet</li>
      <li>Partnership</li>
      <li>About Us</li>
      <li>Contacts</li>
    </ul>
    <ul class="rightItems">
      <li>Services</li>
      <li>Blog</li>
      <li class="changeTheme">
        <ToggleTheme />
      </li>
    </ul>
  </div>
</template>

<script>
import { inject } from 'vue'
import ToggleTheme from './ToggleTheme.vue'

export default {
  components: { ToggleTheme },
  setup() {
    const theme = inject('theme')

    return { theme }
  }
}
</script>

<style scoped>
.headerLogo {
  filter: invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(1) contrast(1);
  height: 55px;
  width: 194px;
}

/* Dark theme - changes the color of the icon */
.dark .headerLogo {
  filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(1) contrast(1);
}

.header,
.header > * {
  display: flex;
  flex-direction: row;
}

.header {
  justify-content: space-between;
  /* background-image: url('../assets/frame.svg');
  background-size: cover;*/
  font-family: Poppins, Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: bold;
  height: 20px;
  align-items: center;
}

.header li {
  font-weight: bold;
}

.centerItems li {
  margin-right: 38px;
}

.centerItems li:last-child {
  margin-right: 0;
}

.rightItems li {
  margin-right: 39px;
}
.rightItems li:last-child {
  margin-right: 0;
}
</style>