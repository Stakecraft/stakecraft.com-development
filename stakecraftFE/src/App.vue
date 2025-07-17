<script>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import { ref, provide } from 'vue'

export default {
  components: { RouterView, Header },
  setup() {
    const theme = ref('light')

    provide('theme', theme)
    provide('setTheme', (newTheme) => (theme.value = newTheme))

    return { theme }
  }
}
</script>




<template>
  <van-config-provider :theme="theme">
    <Header></Header>
    <RouterView />
  </van-config-provider>
</template>


<style>
@import './main.scss';
</style>
