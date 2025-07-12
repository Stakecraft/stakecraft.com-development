<template>
  <div>
    <div class="header" :class="[theme, { blurred: isScrolled }]">
      <div class="leftItems">
        <img src="../assets/headerLogo.svg" class="headerLogo" />
      </div>
      <ul class="centerItems" :class="!dropdownVisible ? '' : 'hideMenu'">
        <li><a href="/#mainnet">Mainnet</a></li>
        <li><a href="/#testnet">Testnet</a></li>
        <li><a href="/#partnership">Partnership</a></li>
        <li><a href="/swap">Swap</a></li>
        <li><a href="/#aboutUs">About Us</a></li>
        <li><a href="/#contacts">Contacts</a></li>
      </ul>
      <ul class="rightItems" :class="!dropdownVisible ? '' : 'hideMenu'">
        <li class="externalLink">
          <a href="https://services.stakecraft.com/" target="_blank"
            >Services <img src="../assets/externalLink.png"
          /></a>
        </li>
        <li class="externalLink">
          <a href="https://stakecraft.medium.com/" target="_blank"
            >Blog <img src="../assets/externalLink.png"
          /></a>
        </li>
        <li class="changeTheme">
          <ToggleTheme />
        </li>
      </ul>
      <div class="dropdownHeaderActions" :class="dropdownVisible ? '' : 'hideMenu'">
        <li class="changeTheme">
          <ToggleTheme />
        </li>
        <button class="dropdown-button" @click="toggleDropdown" />
      </div>
    </div>
    <transition name="slide">
      <div class="mobileHeader" v-if="isOpen">
        <div class="dropdownWrapper">
          <img src="../assets/headerLogo.svg" class="headerLogo" />
          <div class="dropdownHeaderActions">
            <li class="changeTheme" :class="dropdownVisible ? '' : 'hideMenu'">
              <ToggleTheme />
            </li>
            <button class="x-button" @click="toggleDropdown" />
          </div>
        </div>
        <ul class="dropdown-menu">
          <li><a href="/#mainnet">Mainnet</a></li>
          <li><a href="/#testnet">Testnet</a></li>
          <li><a href="/#partnership">Partnership</a></li>
          <li><a href="/swap">Swap</a></li>
          <li><a href="/#aboutUs">About Us</a></li>
          <li><a href="/#contacts">Contacts</a></li>
          <li class="externalLink">
            <a href="https://services.stakecraft.com/" target="_blank"
              >Services <img src="../assets/externalLink.png"
            /></a>
          </li>
          <li class="externalLink">
            <a href="https://stakecraft.medium.com/" target="_blank"
              >Blog <img src="../assets/externalLink.png"
            /></a>
          </li>
        </ul>
      </div>
    </transition>
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
    const dropdownVisible = ref(false)
    const isOpen = ref(false)
    const selectedItem = ref(null)

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 0
    }

    const handleResize = () => {
      dropdownVisible.value = window.innerWidth <= 945
      // console.log('handleResize', dropdownVisible.value, window.innerWidth)
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleResize)
      handleResize()
    })

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleResize)
    })

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value
    }

    const selectItem = (option) => {
      selectedItem.value = option
      isOpen.value = false
    }

    return {
      theme,
      selectItem,
      toggleDropdown,
      isScrolled,
      dropdownVisible,
      isOpen,
      selectedItem
    }
  }
}
</script>

<style scoped>
.hideMenu {
  display: none !important;
}

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
  z-index: 9999;
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
  font-size: 16px;
  font-weight: bold;
  color: var(--van-text-color);
}

.header {
  justify-content: space-between;
  height: 80px;
  align-items: center;
  position: fixed;
  left: 70px;
  width: calc(100% - 140px);
  transition:
    backdrop-filter 0.3s ease,
    background-color 0.3s ease;
  top: 0;
}

@media only screen and (max-width: 900px) {
  .header {
    width: 100vw;
    flex-wrap: wrap;
    padding: 0 19px;
    left: 0;
    box-sizing: border-box;
  }

  .headerLogo {
    width: 126.5px;
    height: 35px;
  }
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

.dropdown-button {
  padding: 10px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  background: var(--van-dropdownMenu) no-repeat;
}

.dropdown-menu {
  background-color: var(--van-background);
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  margin-top: 5px;
  list-style: none;
  padding: 0;
}

.dropdown-menu li {
  padding: 10px;
  cursor: pointer;
  border: 1px solid var(--van-dropdown-menu);
}

.dropdown-menu li a {
  color: var(--van-dropdown-text-color);
  font-family: poppins;
  font-size: 20px;
}

.dropdownWrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 19px;
}

.dropdownWrapper .headerLogo {
  width: 126.57px;
  height: 35.02px;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.5s ease,
    opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-enter-to {
  transform: translateX(0);
}

.slide-leave-to,
.slide-leave-from {
  opacity: 0;
}

.mobileHeader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  background-color: var(--van-background);
  z-index: 10000;
}

.dropdownHeaderActions {
  display: flex;
  gap: 27px;
  align-items: center;
}

.x-button {
  background: var(--van-dropdownMenu-x-btn) no-repeat;
  border: none;
  width: 24px;
  height: 18px;
}
</style>
