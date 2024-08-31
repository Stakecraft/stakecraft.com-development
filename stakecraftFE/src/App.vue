<script>
import { RouterView } from 'vue-router'
import { ref } from 'vue'
export default {
  components: { RouterView },
  setup() {
    const theme = ref('light')

    setTimeout(() => {
      theme.value = 'dark'
      console.log(theme.value)
    }, 1000)

    return { theme }
  }
}
</script>




<template>
  <van-config-provider :theme="theme">
    <header></header>
    <RouterView />
  </van-config-provider>
</template>


<style>
@import './main.scss';
</style>
