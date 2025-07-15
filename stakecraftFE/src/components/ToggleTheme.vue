<template>
  <label class="switch">
    <input type="checkbox" :checked="theme === 'dark'" @click="toggleTheme()" />
    <span class="slider round"></span>
    <img :src="sunMoon" class="sunMoon" />
  </label>
</template>

<script>
import { inject, ref, onMounted, watch } from 'vue'
import sunImage from '../assets/sun.png'
import moonImage from '../assets/moon.png'

export default {
  setup() {
    const theme = inject('theme')
    const setTheme = inject('setTheme')
    const sunMoon = ref(sunImage)

    // Initialize icon based on current theme
    const updateIcon = (currentTheme) => {
      if (currentTheme === 'dark') {
        sunMoon.value = moonImage
      } else {
        sunMoon.value = sunImage
      }
    }

    // Set initial icon on mount
    onMounted(() => {
      updateIcon(theme.value)
    })

    // Watch for theme changes and update icon
    watch(theme, (newTheme) => {
      updateIcon(newTheme)
    })

    function toggleTheme() {
      const newTheme = theme.value === 'light' ? 'dark' : 'light'
      setTheme(newTheme)
      // Icon will be updated by the watcher
    }

    return { toggleTheme, theme, sunMoon }
  }
}
</script>

<style>
input ~ .sunMoon {
  transform: translateX(30px);
}

input:checked ~ .sunMoon {
  transform: translateX(0px);
}
</style>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 54.51px;
  height: 23.62px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--van-primary-color);
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.sunMoon {
  position: absolute;
  top: 0;
  bottom: 0;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: '';
  height: 19.99px;
  width: 19.99px;
  left: 4px;
  bottom: 2px;
  background-color: var(--van-toggleBtn-color);
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: var(--van-primary-color);
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(28px);
  -ms-transform: translateX(28px);
  transform: translateX(28px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 19.99px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
