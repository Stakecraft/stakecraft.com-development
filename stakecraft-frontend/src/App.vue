<script>
import { RouterView, useRoute } from 'vue-router'
import AppHeader from './components/Header.vue'
import { ref, provide, onMounted, watch, computed } from 'vue'

export default {
  components: { RouterView, AppHeader },
  setup() {
    const route = useRoute()
    const theme = ref(
      typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light'
    )
    const isModalOpen = ref(false)

    // Admin screens have their own chrome; the marketing header breaks the login layout.
    const showMarketingHeader = computed(() => {
      const name = route.name
      if (name === 'admin' || name === 'admin-login') return false
      return !route.path.startsWith('/notadmin')
    })

    // Apply theme class to document body on mount and when theme changes
    const applyThemeToBody = (themeValue) => {
      // Remove existing theme classes
      document.body.classList.remove('van-theme-light', 'van-theme-dark')
      // Add new theme class
      document.body.classList.add(`van-theme-${themeValue}`)
    }

    onMounted(() => {
      applyThemeToBody(theme.value)
    })

    watch(theme, (newTheme) => {
      applyThemeToBody(newTheme)
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme)
      }
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

    return { theme, isModalOpen, showMarketingHeader }
  }
}
</script>

<template>
  <van-config-provider :theme="theme">
    <AppHeader v-if="showMarketingHeader" />
    <RouterView />
  </van-config-provider>
</template>

<style>
@import './main.scss';
</style>
