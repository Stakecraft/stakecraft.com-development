<template>
  <component
    v-if="!hasError"
    :is="stakingComponent"
    :network="network"
    @close="handleClose"
  />
  <div v-else class="error-fallback">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h3>Error Loading Staking Component</h3>
      <p>There was an error loading the staking interface for this network.</p>
      <button @click="handleClose" class="close-btn">Close</button>
    </div>
  </div>
</template>

<script>
import { ref, onErrorCaptured, h } from 'vue'

export default {
  name: 'StakingComponentWrapper',
  props: {
    stakingComponent: {
      type: Object,
      required: true
    },
    network: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const hasError = ref(false)

    // Capture errors from child components
    onErrorCaptured((err, instance, info) => {
      console.error('Error in staking component:', err, info)
      hasError.value = true
      // Return false to prevent the error from propagating
      return false
    })

    const handleClose = () => {
      emit('close')
    }

    return {
      hasError,
      handleClose
    }
  }
}
</script>

<style scoped>
.error-fallback {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
}

.error-content {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 1rem;
}

.error-content h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #282a36;
  margin: 0 0 1rem 0;
}

.error-content p {
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  color: #666;
  margin: 0 0 1.5rem 0;
}

.close-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #5a6fd8;
}
</style>

