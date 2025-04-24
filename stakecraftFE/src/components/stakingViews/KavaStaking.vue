<template>
  <Transition name="modal-fade">
    <div v-if="network" class="modal-backdrop" @click.self="closeModal">
      <div class="kava-staking">
        <div class="modal">
          <header class="modal-header">
            <div class="headerTitle">{{ network.title }}</div>
            <button class="btn-close" @click="closeModal">×</button>
          </header>
          <div class="modal-content">
            <div class="network-info">
              <div class="network-description" v-if="!walletConnected">
                <p>{{ network.description }}</p>
              </div>

              <div class="staking-header">
                <button class="connect-wallet" @click="connectWallet" v-if="!walletConnected">
                  Connect Keplr Wallet
                </button>
                <div class="wallet-info" v-if="walletConnected">
                  <p>Connected: {{ walletAddress }}</p>
                </div>
              </div>

              <div v-if="stakingSuccess" class="success-message">
                Successfully delegated KAVA tokens!
                <div v-if="transactionHash" class="transaction-link">
                  <a :href="`https://www.mintscan.io/kava/txs/${transactionHash}`" target="_blank">
                    View transaction on Kava Explorer
                  </a>
                </div>
              </div>
              <div v-if="stakingError" class="error-message">
                {{ stakingError }}
              </div>

              <div class="staking-form" v-if="walletConnected">
                <div class="form-group">
                  <label>Amount to Stake (KAVA)</label>
                  <input type="number" v-model.number="stakeAmount" :min="minimumStake" step="1" />
                </div>

                <div class="form-group">
                  <label>Validator Address</label>
                  <input
                    type="text"
                    :value="network.validator"
                    placeholder="Enter validator address"
                  />
                </div>
                <button @click="delegateTokens" :disabled="!isValidStake" class="stake-button">
                  Delegate KAVA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import {
  connectWallet,
  delegateTokens
  // getDelegationStatus
} from '../../utils/KavaStaking'

export default {
  name: 'KavaStaking',
  props: {
    network: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const walletConnected = ref(false)
    const walletAddress = ref('')
    const stakeAmount = ref(0)
    const validatorAddress = ref('')
    const delegationInfo = ref(null)
    const minimumStake = 0.02 // Minimum KAVA to stake
    const stakingSuccess = ref(false)
    const stakingError = ref(null)
    const transactionHash = ref('')
    

    onMounted(() => {
      if (props.network?.validator?.[0]) {
        validatorAddress.value = props.network.validator[0]
      }
    })

    const isValidStake = computed(() => {
      const amount = parseFloat(stakeAmount.value)
      return !isNaN(amount) && amount >= minimumStake && validatorAddress.value
    })

    const handleConnectWallet = async () => {
      try {
        const address = await connectWallet()
        walletAddress.value = address
        walletConnected.value = true
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }

    const handleDelegateTokens = async () => {
      if (!isValidStake.value) return

      try {
        stakingSuccess.value = false
        stakingError.value = null
        const hash = await delegateTokens(
          walletAddress.value,
          validatorAddress.value,
          stakeAmount.value
        )
        transactionHash.value = hash
        stakingSuccess.value = true
      } catch (error) {
        console.error('Failed to delegate tokens:', error)
        stakingError.value = error.message || 'Failed to delegate tokens'
      }
    }

    const closeModal = () => {
      emit('close')
    }

    return {
      validatorAddress,
      closeModal,
      walletConnected,
      walletAddress,
      stakeAmount,
      delegationInfo,
      minimumStake,
      isValidStake,
      stakingSuccess,
      stakingError,
      transactionHash,
      connectWallet: handleConnectWallet,
      delegateTokens: handleDelegateTokens
    }
  }
}
</script>

<style>
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.modal {
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.modal-header {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.modal-content {
  width: 100%;
}
.kava-staking {
  background: var(--van-background-2);
  border-radius: 20px;
  position: relative;
  cursor: default;
}

/* Add Kava-specific styles */
.validator-select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--van-border-color);
  border-radius: 4px;
  background-color: var(--van-background);
  color: var(--van-text-color);
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.claim-button,
.undelegate-button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.claim-button {
  background-color: var(--van-success-color);
  color: white;
}

.undelegate-button {
  background-color: var(--van-warning-color);
  color: white;
}

.undelegate-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--van-background-2);
  padding: 20px;
  border-radius: 12px;
  z-index: 1100;
  width: 90%;
  max-width: 400px;
}

.warning {
  color: var(--van-warning-color);
  margin: 10px 0;
  font-size: 0.9em;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button,
.confirm-button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button {
  background-color: var(--van-gray-5);
  color: white;
}

.confirm-button {
  background-color: var(--van-primary-color);
  color: white;
}

.success-message {
  color: var(--van-success-color);
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(0, 255, 0, 0.1);
  border-radius: 4px;
}

.error-message {
  color: var(--van-danger-color);
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(255, 0, 0, 0.1);
  border-radius: 4px;
}

.transaction-link {
  margin-top: 10px;
}

.transaction-link a {
  color: var(--van-primary-color);
  text-decoration: underline;
}

.transaction-link a:hover {
  color: var(--van-primary-color-dark);
}
</style>
