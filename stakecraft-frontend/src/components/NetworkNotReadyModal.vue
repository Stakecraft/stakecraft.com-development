<template>
  <transition name="modal-fade">
    <div class="modal-overlay" @click.self="close">
      <div class="modal-container" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">{{ network?.title || 'Network' }}</h2>
            <button @click="close" class="close-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div class="not-ready-content">
            <div class="warning-icon-large">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                ></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3 class="not-ready-title">This network is not ready for staking</h3>
            <p class="not-ready-message">
              The staking functionality for this network is currently being set up. 
              Please check back later or contact support for more information.
            </p>
            <button @click="close" class="close-button-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'NetworkNotReadyModal',
  props: {
    network: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const close = () => {
      emit('close')
    }

    return {
      close
    }
  }
}
</script>

<style scoped>
.modal-overlay {
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

.modal-container {
  background: var(--van-modal-background, #ffffff);
  border-radius: 20px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content {
  padding: 2rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-title {
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--van-modal-header-title, #282a36);
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--van-modal-btn-close, #666);
  transition: color 0.2s;
}

.close-button:hover {
  color: var(--van-modal-btn-close-hover, #000);
}

.not-ready-content {
  text-align: center;
  padding: 1rem 0;
}

.warning-icon-large {
  color: #f59e0b;
  margin: 0 auto 1.5rem;
  display: flex;
  justify-content: center;
}

.not-ready-title {
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: var(--van-modal-header-title, #282a36);
  margin: 0 0 1rem 0;
}

.not-ready-message {
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.close-button-primary {
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

.close-button-primary:hover {
  background: #5a6fd8;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media only screen and (max-width: 600px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 20px;
  }

  .not-ready-title {
    font-size: 18px;
  }

  .not-ready-message {
    font-size: 14px;
  }
}
</style>

