<template>
  <transition name="modal-fade">
    <div class="modal-overlay" @click.self="closeModal">
      <div v-if="network" class="modal-container" @click.stop>
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ network.title }}</h2>
            <button @click="closeModal" class="close-button">
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

          <!-- Network Description -->
          <div v-if="!walletConnected" class="network-description">
            <p>{{ network.description }}</p>
          </div>

          <!-- Wallet Warning -->
          <div v-if="walletError" class="wallet-warning">
            <div class="warning-icon">
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
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                ></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="warning-content">
              <h3 class="warning-title">Wallet Not Found</h3>
              <p class="warning-message">
                To use Agoric staking, you need to install the Keplr wallet extension.
              </p>
            </div>
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
                <span class="info-value tooltip-container">
                  {{ truncateAddress(walletAddress) }}
                  <span class="tooltip">{{ walletAddress }}</span>
                </span>
              </div>
              <div v-if="transactionHash" class="transaction-info">
                <div class="wallet-info-row">
                  <span class="info-label">Last Transaction:</span>
                  <a
                    :href="`https://atomscan.com/agoric/transactions/${transactionHash}`"
                    target="_blank"
                    class="transaction-link"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            </div>

            <!-- Tab Navigation -->
            <div class="tab-container">
              <button 
                class="tab-button"
                :class="{ 'tab-active': activeTab === 'stake' }"
                @click="activeTab = 'stake'"
              >
                Stake
              </button>
              <button 
                class="tab-button"
                :class="{ 'tab-active': activeTab === 'unstake' }"
                @click="activeTab = 'unstake'"
              >
                Unstake
              </button>
            </div>

            <!-- Staking Tab Content -->
            <div v-if="activeTab === 'stake'" class="tab-content">
              <div class="staking-form">
                <!-- Staking Amount Input -->
                <div class="form-group">
                  <label class="form-label">Amount to Stake (BLD)</label>
                  <div class="input-container">
                    <input
                      v-model.number="stakeAmount"
                      type="number"
                      :min="minimumStake"
                      step="1"
                      class="form-input"
                      placeholder="Enter amount"
                    />
                    <div class="input-suffix">
                      <span>BLD</span>
                    </div>
                  </div>
                  <div class="input-hint">
                    <span>Minimum: {{ minimumStake }} BLD</span>
                    <button 
                      @click="stakeAmount = Number(totalBldBalance)"
                      class="max-button"
                      :disabled="Number(totalBldBalance) <= 0"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <!-- Validator Address -->
                <div class="form-group">
                  <label class="form-label">Validator Address</label>
                  <input
                    :value="network.validator"
                    type="text"
                    class="form-input"
                    placeholder="Enter validator address"
                    readonly
                  />
                </div>

                <!-- Staking Info -->
                <div class="info-card">
                  <h3 class="info-card-title">Current Staking Status</h3>
                  <div class="info-card-content">
                    <div class="info-row">
                      <span class="info-label">Available Balance:</span>
                      <span class="info-value">{{ availableBalance }} BLD</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Currently Staked:</span>
                      <span class="info-value">{{ stakedAmount }} BLD</span>
                    </div>
                  </div>
                </div>

                <!-- Success/Error Messages for Staking -->
                <div v-if="stakingSuccess" class="success-message">
                  Successfully delegated !
                </div>
                <div v-if="stakingError" class="error-message">
                  {{ stakingError }}
                </div>

                <!-- Stake Action Button -->
                <button
                  @click="delegateTokens"
                  :disabled="!isValidStake || isProcessing"
                  class="primary-button full-width delegate-button"
                  :class="{ 'button-disabled': !isValidStake || isProcessing }"
                >
                  {{ isProcessing ? 'Processing...' : 'Delegate BLD' }}
                </button>
              </div>
            </div>

            <!-- Unstaking Tab Content -->
            <div v-if="activeTab === 'unstake'" class="tab-content">
              <div class="staking-form">
                <!-- Unstaking Amount Input -->
                <div class="form-group">
                  <label class="form-label">Amount to Unstake (BLD)</label>
                  <div class="input-container">
                    <input
                      v-model.number="unstakeAmount"
                      type="number"
                      :min="0"
                      :max="stakedAmount"
                      step="1"
                      class="form-input"
                      placeholder="Enter amount to unstake"
                    />
                    <div class="input-suffix">
                      <span>BLD</span>
                    </div>
                  </div>
                  <div class="input-hint">
                    <span>Available to unstake: {{ stakedAmount }} BLD</span>
                    <button 
                      @click="unstakeAmount = stakedAmount"
                      class="max-button"
                      :disabled="stakedAmount <= 0"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <!-- Unstaking Info -->
                <div class="info-card">
                  <h3 class="info-card-title">Unstaking Information</h3>
                  <div class="info-card-content">
                    <div class="info-row">
                      <span class="info-label">Currently Staked:</span>
                      <span class="info-value">{{ stakedAmount }} BLD</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Rewards Earned:</span>
                      <span class="info-value">{{ rewardsEarned }} BLD</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Unbonding Period:</span>
                      <span class="info-value">21 days</span>
                    </div>
                  </div>
                </div>

                <!-- Unstaking Warning -->
                <div class="warning-card">
                  <div class="warning-icon-small">⚠️</div>
                  <div class="warning-text">
                    <strong>Important:</strong> Unstaked tokens will be locked for 21 days before becoming available for withdrawal.
                  </div>
                </div>

                <!-- Success/Error Messages for Unstaking -->
                <div v-if="unstakingSuccess" class="success-message">
                  Successfully Undelegated !
                </div>
                <div v-if="unstakingError" class="error-message">
                  {{ unstakingError }}
                </div>

                <!-- Unstake Action Button -->
                <button
                  @click="undelegateStake"
                  :disabled="!isValidUnstake || isProcessing"
                  class="primary-button full-width delegate-button unstake-button"
                  :class="{ 'button-disabled': !isValidUnstake || isProcessing }"
                >
                  {{ isProcessing ? 'Processing...' : 'Undelegate BLD' }}
                </button>
              </div>
            </div>

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
import { ref, computed, onMounted, watch } from 'vue'
import {
  connectWallet,
  delegateTokens,
  undelegateStake,
  getTotalStakedAmount,
  getBldBalance
} from '../../utils/AgoricStaking'

export default {
  name: 'AgoricStaking',
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
    const unstakeAmount = ref(0)
    const validatorAddress = ref('')
    const delegationInfo = ref(null)
    const minimumStake = 0.02
    const stakingSuccess = ref(false)
    const unstakingSuccess = ref(false)
    const stakingError = ref(null)
    const unstakingError = ref(null)
    const transactionHash = ref('')
    const walletError = ref(false)
    const isConnecting = ref(false)
    const isProcessing = ref(false)
    const stakedAmount = ref(0)
    const rewardsEarned = ref(0)
    const lastRewardTime = ref(null)
    const availableBalance = ref(0)
    const activeTab = ref('stake')
    const totalBldBalance = ref(0)

    onMounted(() => {
      if (props.network?.validator?.[0]) {
        validatorAddress.value = props.network.validator[0]
      }
    })

    // Add watch on activeTab to clear messages
    watch(activeTab, () => {
      stakingSuccess.value = false
      stakingError.value = null
      unstakingSuccess.value = false
      unstakingError.value = null
      transactionHash.value = ''
    })

    const isValidStake = computed(() => {
      const amount = parseFloat(stakeAmount.value)
      return !isNaN(amount) && amount >= minimumStake && validatorAddress.value && amount <= Number(totalBldBalance.value)
    })

    const isValidUnstake = computed(() => {
      const amount = parseFloat(unstakeAmount.value)
      return !isNaN(amount) && amount > 0 && amount <= stakedAmount.value
    })

    const handleConnectWallet = async () => {
      try {
        isConnecting.value = true
        const address = await connectWallet()
        walletAddress.value = address
        walletConnected.value = true
        isConnecting.value = false
        refreshStakingInfo()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        walletError.value = true
        isConnecting.value = false
      }
    }

    const refreshStakingInfo = async () => {
      if (!walletAddress.value) return

      try {
        const bldBalance = await getBldBalance(walletAddress.value)
        totalBldBalance.value = bldBalance
        availableBalance.value = Number(bldBalance).toFixed(4)

        const stakingInfo = await getTotalStakedAmount(walletAddress.value, validatorAddress.value)
        if (stakingInfo.amount) {
          stakedAmount.value = Number(stakingInfo.amount) / 10 ** 6
        } else {
          stakedAmount.value = 0.0
        }

        rewardsEarned.value = 0
        lastRewardTime.value = null
      } catch (error) {
        console.error('Failed to refresh staking info:', error)
      }
    }

    const handleDelegateTokens = async () => {
      if (!isValidStake.value) return

      try {
        isProcessing.value = true
        stakingSuccess.value = false
        stakingError.value = null
        unstakingSuccess.value = false
        unstakingError.value = null
        
        const hash = await delegateTokens(
          walletAddress.value,
          validatorAddress.value,
          stakeAmount.value
        )
        transactionHash.value = hash
        stakingSuccess.value = true
        stakeAmount.value = 0 // Reset form
        refreshStakingInfo()
      } catch (error) {
        console.error('Failed to delegate tokens:', error)
        stakingError.value = error.message || 'Failed to delegate tokens'
      } finally {
        isProcessing.value = false
      }
    }

    const handleUndelegateStake = async () => {
      try {
        isProcessing.value = true
        stakingSuccess.value = false
        stakingError.value = null
        unstakingSuccess.value = false
        unstakingError.value = null
        
        const hash = await undelegateStake(
          walletAddress.value,
          validatorAddress.value,
          unstakeAmount.value
        )
        transactionHash.value = hash
        unstakingSuccess.value = true
        unstakeAmount.value = 0 // Reset form
        await refreshStakingInfo()
      } catch (error) {
        console.error('Failed to undelegate stake:', error)
        unstakingError.value = error.message || 'Failed to undelegate stake'
      } finally {
        isProcessing.value = false
      }
    }

    const closeModal = () => {
      emit('close')
    }

    const truncateAddress = (address) => {
      if (!address) return ''
      if (address.length <= 12) return address
      return address.substring(0, 6) + '...' + address.substring(address.length - 4)
    }

    return {
      validatorAddress,
      closeModal,
      walletConnected,
      walletAddress,
      stakeAmount,
      unstakeAmount,
      delegationInfo,
      minimumStake,
      isValidStake,
      isValidUnstake,
      stakingSuccess,
      unstakingSuccess,
      stakingError,
      unstakingError,
      transactionHash,
      connectWallet: handleConnectWallet,
      delegateTokens: handleDelegateTokens,
      undelegateStake: handleUndelegateStake,
      truncateAddress,
      walletError,
      isConnecting,
      isProcessing,
      stakedAmount,
      rewardsEarned,
      lastRewardTime,
      availableBalance,
      activeTab,
      totalBldBalance
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
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.primary-button {
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
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
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
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
  margin-top: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.2rem;
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

/* Wallet Warning */
.wallet-warning {
  background-color: #fff7ed;
  border: 1px solid #fdba74;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
}

.warning-icon {
  color: #ea580c;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-title {
  color: #ea580c;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.warning-message {
  color: #9a3412;
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
}

/* Remove number input arrows */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

/* Add new styles for tabs and unstaking */
.tab-container {
  display: flex;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.25rem;
  margin-bottom: 1.5rem;
}

.tab-button {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.tab-button.tab-active {
  background-color: #6366f1;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-button:hover:not(.tab-active) {
  color: #374151;
  background-color: #e5e7eb;
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.warning-card {
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin: 1rem 0;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.warning-icon-small {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.warning-text {
  font-size: 0.875rem;
  color: #92400e;
}

.unstake-button {
  background-color: #dc2626;
}

.unstake-button:hover:not(:disabled) {
  background-color: #b91c1c;
}

.max-button {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  font-size: 0.75rem;
  text-decoration: underline;
}

.max-button:hover:not(:disabled) {
  color: #4f46e5;
}

.max-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tooltip-container {
  position: relative;
  cursor: help;
}

.tooltip {
  visibility: hidden;
  position: absolute;
  bottom: 100%;
  left: 10%;
  transform: translateX(-70%);
  padding: 0.5rem;
  background-color: #1f2937;
  color: white;
  text-align: center;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
  margin-bottom: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s, visibility 0.2s;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 80%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #1f2937 transparent transparent transparent;
}

.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
}
</style>
