<template>
  <transition name="modal-fade">
    <div class="modal-overlay" @click.self="closeModal">
      <div v-if="network" class="modal-container" @click.stop>
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ network.title }}</h2>
            <button @click="closeModal" class="close-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          
          <!-- Network Description -->
          <div v-if="!walletConnected" class="network-description">
            <p>{{ network.description }}</p>
          </div>
          
          <!-- Wallet Connection -->
          <div v-if="!walletConnected" class="wallet-connection">
            <button
              @click="connectWallet"
              class="primary-button full-width"
              :disabled="isConnecting"
            >
              {{ isConnecting ? 'Connecting...' : 'Connect Keplr Wallet' }}
            </button>
            
            <!-- Network Links -->
            <div class="network-links">
              <a
                v-if="network.explorer"
                :href="network.explorer[0]"
                target="_blank"
                class="link-primary"
              >
                View on Explorer
              </a>
              <a
                v-if="network.howToStake"
                :href="network.howToStake"
                target="_blank"
                class="link-primary"
              >
                How to Stake
              </a>
            </div>
          </div>
          
          <!-- Connected Wallet Info -->
          <div v-if="walletConnected">
            <div class="wallet-info-card">
              <div class="wallet-info-row">
                <span class="info-label">Connected Wallet:</span>
                <span class="info-value">{{ truncateAddress(walletAddress) }}</span>
              </div>
              <div v-if="transactionHash" class="transaction-info">
                <div class="wallet-info-row">
                  <span class="info-label">Last Transaction:</span>
                  <a
                    :href="`https://www.mintscan.io/bitsong/txs/${transactionHash}`"
                    target="_blank"
                    class="transaction-link"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            </div>
            
            <!-- Staking Form -->
            <div class="staking-form">
              <!-- Staking Amount Input -->
              <div class="form-group">
                <label class="form-label">
                  Amount to Stake (BTSG)
                </label>
                <div class="input-container">
                  <input
                    v-model.number="stakeAmount"
                    type="number"
                    :min="minimumStake"
                    step="0.1"
                    class="form-input"
                    placeholder="Enter amount"
                  />
                  <div class="input-suffix">
                    <span>BTSG</span>
                  </div>
                </div>
                <div class="input-hint">
                  <span>
                    Minimum: {{ minimumStake }} BTSG
                  </span>
                </div>
              </div>
              
              <!-- Validator Address -->
              <div class="form-group">
                <label class="form-label">
                  Validator Address
                </label>
                <input
                  v-model="validatorAddress"
                  type="text"
                  class="form-input"
                  placeholder="Enter validator address"
                />
              </div>
            </div>
            
            <!-- Staking Info -->
            <div class="info-card">
              <h3 class="info-card-title">Staking Status</h3>
              <div class="info-card-content">
                <div class="info-row">
                  <span class="info-label">Staked Amount:</span>
                  <span class="info-value">{{ stakedAmount }} BTSG</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Rewards Earned:</span>
                  <span class="info-value">{{ rewardsEarned }} BTSG</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Last Reward:</span>
                  <span class="info-value">{{
                    lastRewardTime ? new Date(lastRewardTime).toLocaleString() : 'Never'
                  }}</span>
                </div>
              </div>
            </div>
            
            <!-- Success/Error Messages -->
            <div v-if="stakingSuccess" class="success-message">
              Successfully staked BTSG tokens!
            </div>
            <div v-if="stakingError" class="error-message">
              {{ stakingError }}
              <div v-if="stakingError.includes('not installed')" class="install-guide">
                <p>To use Bitsong staking, you need to:</p>
                <ol>
                  <li>
                    Install the Keplr wallet extension from
                    <a href="https://www.keplr.app/" target="_blank">https://www.keplr.app/</a>
                  </li>
                  <li>Create an account in the Keplr wallet</li>
                  <li>Add the Bitsong network to your Keplr wallet</li>
                  <li>Refresh this page after installation</li>
                </ol>
              </div>
            </div>
            
            <!-- Action Button -->
            <button
              @click="delegateTokens"
              :disabled="!isValidStake"
              class="primary-button full-width delegate-button"
              :class="{ 'button-disabled': !isValidStake }"
            >
              Delegate BTSG
            </button>
            
            <!-- Network Links -->
            <div class="network-links-bottom">
              <a
                v-if="network.explorer"
                :href="network.explorer[0]"
                target="_blank"
                class="link-primary"
              >
                View on Explorer
              </a>
              <a
                v-if="network.howToStake"
                :href="network.howToStake"
                target="_blank"
                class="link-primary"
              >
                How to Stake
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { connectWallet, delegateTokens, getStakingInfo } from '../../utils/BitsongStaking'

export default {
  name: 'BitsongStaking',
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
    const stakedAmount = ref(0)
    const rewardsEarned = ref(0)
    const lastRewardTime = ref(null)
    const stakingSuccess = ref(false)
    const stakingError = ref(null)
    const transactionHash = ref('')
    const minimumStake = 0.01
    const isConnecting = ref(false)

    onMounted(() => {
      if (props.network?.validator) {
        validatorAddress.value = props.network.validator[0]
      }
    })

    const isValidStake = computed(() => {
      const amount = parseFloat(stakeAmount.value)
      return !isNaN(amount) && amount >= minimumStake && validatorAddress.value
    })

    const handleConnectWallet = async () => {
      try {
        isConnecting.value = true
        stakingError.value = null
        const address = await connectWallet()
        walletAddress.value = address
        walletConnected.value = true
        await refreshStakingInfo()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        stakingError.value = error.message
      } finally {
        isConnecting.value = false
      }
    }

    const refreshStakingInfo = async () => {
      if (!walletAddress.value) return

      try {
        const info = await getStakingInfo(walletAddress.value)
        stakedAmount.value = info.stakedAmount
        rewardsEarned.value = info.rewardsEarned
        lastRewardTime.value = info.lastRewardTime
      } catch (error) {
        console.error('Failed to refresh staking info:', error)
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
        stakeAmount.value = 0

        await refreshStakingInfo()
      } catch (error) {
        console.error('Failed to stake tokens:', error)
        stakingError.value = error.message
      }
    }

    const closeModal = () => {
      emit('close')
    }

    const truncateAddress = (address) => {
      if (!address) return '';
      if (address.length <= 12) return address;
      return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }

    return {
      validatorAddress,
      closeModal,
      walletConnected,
      walletAddress,
      stakeAmount,
      stakedAmount,
      rewardsEarned,
      lastRewardTime,
      minimumStake,
      isValidStake,
      stakingSuccess,
      stakingError,
      transactionHash,
      isConnecting,
      connectWallet: handleConnectWallet,
      delegateTokens: handleDelegateTokens,
      truncateAddress
    }
  }
}
</script>

<style scoped>
/* Modal Animation */
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

/* Modal Layout */
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
  z-index: 50;
}

.modal-container {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 28rem;
  width: 100%;
  overflow: hidden;
}

.modal-content {
  padding: 1.5rem;
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.close-button:hover {
  color: #374151;
}

/* Network Description */
.network-description {
  text-align: center;
  margin-bottom: 1.5rem;
}

.network-description p {
  color: #4b5563;
  margin: 0;
}

/* Wallet Connection */
.wallet-connection {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Network Links */
.network-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.network-links-bottom {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.link-primary {
  color: #6366f1;
  text-decoration: none;
  font-size: 0.875rem;
}

.link-primary:hover {
  text-decoration: underline;
}

/* Buttons */
.primary-button {
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.primary-button:hover:not(:disabled) {
  background-color: #4f46e5;
}

.primary-button:active:not(:disabled) {
  transform: translateY(1px);
}

.full-width {
  width: 100%;
}

.button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delegate-button {
  margin-top: 1.5rem;
}

/* Wallet Info Card */
.wallet-info-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.wallet-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-info {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.transaction-link {
  color: #6366f1;
  text-decoration: none;
  font-size: 0.75rem;
}

.transaction-link:hover {
  text-decoration: underline;
}

/* Form Elements */
.staking-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 0.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-suffix {
  position: absolute;
  right: 0.75rem;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: #6b7280;
}

.input-hint {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Info Cards */
.info-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.info-card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.info-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.info-label {
  color: #6b7280;
}

.info-value {
  font-weight: 500;
  color: #1f2937;
}

/* Success/Error Messages */
.success-message {
  color: #059669;
  background-color: #ecfdf5;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.error-message {
  color: #dc2626;
  background-color: #fef2f2;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.install-guide {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.install-guide ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.install-guide a {
  color: #6366f1;
  text-decoration: none;
}

.install-guide a:hover {
  text-decoration: underline;
}

/* Remove number input arrows */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}

input[type=number] {
  -moz-appearance: textfield;
}
</style> 