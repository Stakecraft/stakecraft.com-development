<script>
import { RouterView } from 'vue-router'
<<<<<<< HEAD
import Header from './components/Header.vue'
import { ref, provide } from 'vue'

export default {
  components: { RouterView, Header },
  setup() {
    const theme = ref('light')

    provide('theme', theme)
    provide('setTheme', (newTheme) => (theme.value = newTheme))

    return { theme }
=======
import AppHeader from './components/Header.vue'
import { ref, provide, onMounted, watch } from 'vue'

export default {
  components: { RouterView, AppHeader },
  setup() {
    // Initialize theme from localStorage or default to 'light'
    const theme = ref(localStorage.getItem('theme') || 'light')
    const isModalOpen = ref(false)

    // Apply theme class to document body on mount and when theme changes
    const applyThemeToBody = (themeValue) => {
      // Remove existing theme classes
      document.body.classList.remove('van-theme-light', 'van-theme-dark')
      // Add new theme class
      document.body.classList.add(`van-theme-${themeValue}`)
    }

    // Apply theme on mount
    onMounted(() => {
      applyThemeToBody(theme.value)
    })

    // Watch for theme changes and apply to body + save to localStorage
    watch(theme, (newTheme) => {
      applyThemeToBody(newTheme)
      localStorage.setItem('theme', newTheme)
    })

    // Enhanced setTheme function that updates both reactive state and localStorage
    const setTheme = (newTheme) => {
      theme.value = newTheme
      // The watch handler will take care of applying to body and localStorage
    }

    provide('theme', theme)
    provide('setTheme', setTheme)
    provide('isModalOpen', isModalOpen)
    provide('setModalOpen', (isOpen) => (isModalOpen.value = isOpen))

    return { theme, isModalOpen }
>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
  }
}
</script>

<<<<<<< HEAD



<template>
  <van-config-provider :theme="theme">
    <Header></Header>
=======
<template>
  <van-config-provider :theme="theme">
    <AppHeader></AppHeader>
>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
    <RouterView />
  </van-config-provider>
</template>

<<<<<<< HEAD

=======
>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
<style>
@import './main.scss';
</style>
