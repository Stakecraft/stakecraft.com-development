<template>
  <div class="header" :class="[theme, { blurred: isScrolled }]">
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
      <li class="externalLink">
        <a href="" target="_blank">Services <img src="../assets/externalLink.png" /></a>
      </li>
      <li class="externalLink">
        <a href="" target="_blank">Blog <img src="../assets/externalLink.png" /></a>
      </li>
      <li class="changeTheme">
        <ToggleTheme />
      </li>
    </ul>
  </div>
</template>

<script>
import { inject, onMounted, onBeforeUnmount, ref } from 'vue'
import ToggleTheme from './ToggleTheme.vue'

export default {
  components: { ToggleTheme },
  setup() {
    const theme = inject('theme')
    const isScrolled = ref(false)

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 0
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return { theme, isScrolled }
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

.blurred {
  backdrop-filter: blur(10px);
  background: var(--van-header-background);
  padding: 0 28px;
  border-radius: 20px;
  top: 8px !important;
}

.header,
.header a {
  font-family: Poppins, Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: var(--van-text-color);
}

.header {
  justify-content: space-between;
  /* background-image: url('../assets/frame.svg');
  background-size: cover;*/
  height: 80px;
  align-items: center;
  position: fixed;
  left: 70px;
  width: calc(100% - 140px);
  transition: backdrop-filter 0.3s ease, background-color 0.3s ease;
  top: 0;
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

.externalLink {
  display: flex;
  align-items: center;
}
.externalLink img {
  margin-left: 3px;
}
</style>