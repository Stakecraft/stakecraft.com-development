<template>
  <transition name="modal-fade">
    <div class="modal-overlay" @click.self="close">
      <div v-if="network" class="modal-container" @click.stop>
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ network.title }}</h2>
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
                To use Solana staking, you need to install the Phantom wallet extension.
              </p>
            </div>
          </div>

          <!-- Wallet Connection -->
          <div v-if="!walletConnected" class="wallet-connection">
            <button @click="connectWallet" class="primary-button full-width">Connect Wallet</button>

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
              <div v-if="transactionSignature" class="transaction-info">
                <div class="wallet-info-row">
                  <span class="info-label">Last Transaction:</span>
                  <a
                    :href="`https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`"
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
                <label class="form-label"> Amount to Stake (SOL) </label>
                <div class="input-container">
                  <input
                    v-model.number="stakeAmount"
                    type="number"
                    :min="minimumStake"
                    step="0.01"
                    class="form-input"
                    placeholder="Enter amount"
                  />
                  <div class="input-suffix">
                    <span>SOL</span>
                  </div>
                </div>
                <div class="input-hint">
                  <span> Minimum: {{ minimumStake }} SOL </span>
                </div>
              </div>

              <!-- Validator Address -->
              <div class="form-group">
                <label class="form-label"> Validator Address </label>
                <input
                  disabled
                  :value="network.validator"
                  type="text"
                  class="form-input"
                  placeholder="Enter validator address"
                  readonly
                />
              </div>
              <!-- Staking Info -->
              <div class="info-card">
                <h3 class="info-card-title">Staking Status</h3>
                <div class="info-card-content">
                  <div class="info-row">
                    <span class="info-label">Staked Amount:</span>
                    <span class="info-value">{{ stakedAmount }} SOL</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Rewards Earned:</span>
                    <span class="info-value">{{ rewardsEarned }} SOL</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Last Reward:</span>
                    <span class="info-value">{{
                      lastRewardTime ? new Date(lastRewardTime).toLocaleString() : 'Never'
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="action-buttons">
              <button
                @click="delegateStake"
                :disabled="!isValidStake"
                class="primary-button full-width delegate-button"
                :class="{ 'button-disabled': !isValidStake }"
              >
                Delegate Solana
              </button>

              <button
                @click="undelegateStake"
                :disabled="stakedAmount <= 0"
                class="primary-button full-width delegate-button"
                :class="{ 'button-disabled': stakedAmount <= 0 }"
              >
                Undelegate Solana
              </button>
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
  delegateStake,
  getStakeAccountInfo,
  getStakeRewards,
  createAndInitializeStakeAccount,
  getStakingInfo,
  getTotalStakedAmount,
  undelegateStake,
  getStakeActivationStatus
} from '../../utils/SolanaStaking'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export default {
  name: 'SolanaStaking',
  props: ['network'],
  setup(props, context) {
    const walletConnected = ref(false)
    const walletAddress = ref('')
    const stakeAmount = ref(0)
    const validatorAddress = ref('')
    const stakeAccountInfo = ref(null)
    const rewards = ref(null)
    const minimumStake = 0.01
    const stakeAccountPublickey = ref(null)
    const transactionSignature = ref(null)
    const walletError = ref(null)
    const stakedAmount = ref(0)
    const rewardsEarned = ref(0)
    const lastRewardTime = ref(null)
    const delegatedStakeAccounts = ref([])
    const completedStakeAccounts = ref([
      'DqCFeJweWrPHYNuYD8uK7HwxcF7kMEJjAaCSWGPdieAJ',
      '7fXr2zoyFCePcyLD1gnepxBEVyXwVbrgtKmr81GWUiF6',
      '7fvq1pzmtwALR7ShXbBKEbyCKicZSCqGMWkQYmpeiZa5'
    ])
    onMounted(() => {
      if (props.network?.validator?.[0]) {
        validatorAddress.value = props.network.validator[0]
      }
    })

    const close = () => {
      context.emit('close')
    }

    const isValidStake = computed(() => {
      const amount = parseFloat(stakeAmount.value)
      const hasValidAmount = !isNaN(amount) && amount >= minimumStake
      const hasValidAddress = validatorAddress.value && validatorAddress.value.length > 0
      return hasValidAmount && hasValidAddress
    })

    const handleConnectWallet = async () => {
      try {
        walletError.value = null
        if (typeof window.solana === 'undefined' || !window.solana.isPhantom) {
          walletError.value = 'Phantom wallet not found'
          return
        }
        const publicKey = await connectWallet()
        walletAddress.value = publicKey.toString()
        walletConnected.value = true
        await refreshStakingInfo()
        console.log('delegatedStakeAccounts', delegatedStakeAccounts.value)
        console.log('completedStakeAccounts', completedStakeAccounts.value)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        if (error.message.includes('not installed') || error.message.includes('not found')) {
          walletError.value = 'Phantom wallet not found'
        } else {
          stakingError.value = error.message
        }
      }
    }

    const refreshStakingInfo = async () => {
      if (!walletAddress.value) return

      try {
        const stakingInfo = await getTotalStakedAmount(walletAddress.value, validatorAddress.value)
        stakedAmount.value = stakingInfo.totalStaked
        delegatedStakeAccounts.value = stakingInfo.delegatedAccounts || []
        if (stakingInfo.stakeAccounts > 0) {
          const rewards = await getStakeRewards(walletAddress.value)
          rewardsEarned.value = rewards ? rewards.amount / LAMPORTS_PER_SOL : 0
          lastRewardTime.value = rewards ? rewards.epoch : null
        } else {
          rewardsEarned.value = 0
          lastRewardTime.value = null
        }
      } catch (error) {
        console.error('Failed to refresh staking info:', error)
      }
    }

    const handleDelegateStake = async () => {
      if (!isValidStake.value) return
      try {
        const { stakeAccount } = await createAndInitializeStakeAccount(
          stakeAmount.value * LAMPORTS_PER_SOL
        )
        if (!stakeAccount) {
          throw new Error('Failed to create stake account')
        }
        const initialStakeInfo = await getStakeAccountInfo(stakeAccount)
        stakeAccountInfo.value = initialStakeInfo
        const validator = props.network?.validator?.[0] || validatorAddress.value
        if (!validator) {
          throw new Error('Validator address is required')
        }
        const signature = await delegateStake(stakeAccount, validator)
        transactionSignature.value = signature
        stakeAccountInfo.value = await getStakeAccountInfo(stakeAccount)
        rewards.value = await getStakeRewards(stakeAccount)
        await refreshStakingInfo()
      } catch (error) {
        console.error('Failed to delegate stake:', error)
      }
    }

    const handleUndelegateStake = async () => {
      try {
        if (!delegatedStakeAccounts.value.length) {
          throw new Error('No delegated stake accounts found')
        }
        const activeStakeAccounts = delegatedStakeAccounts.value.filter(
          (account) => !completedStakeAccounts.value.includes(account)
        )
        if (!activeStakeAccounts.length) {
          throw new Error('No active stake accounts found')
        }
        const stakeAccountAddress = activeStakeAccounts[1]
        console.log('stakeAccountAddress', stakeAccountAddress)
        const signature = await undelegateStake(stakeAccountAddress)
        transactionSignature.value = signature
        console.log('signature', signature)

        if (signature) {
          completedStakeAccounts.value.push(stakeAccountAddress)
        }

        console.log('delegatedStakeAccounts', delegatedStakeAccounts.value)
        console.log('completedStakeAccounts', completedStakeAccounts.value)
        await refreshStakingInfo()
      } catch (error) {
        console.error('Failed to undelegate stake:', error)
        throw new Error(`Failed to undelegate stake: ${error.message}`)
      }
    }

    const truncateAddress = (address) => {
      if (!address) return ''
      if (address.length <= 12) return address
      return address.substring(0, 6) + '...' + address.substring(address.length - 4)
    }

    return {
      close,
      walletConnected,
      walletAddress,
      stakeAmount,
      validatorAddress,
      stakeAccountInfo,
      rewards,
      minimumStake,
      isValidStake,
      connectWallet: handleConnectWallet,
      delegateStake: handleDelegateStake,
      undelegateStake: handleUndelegateStake,
      LAMPORTS_PER_SOL,
      transactionSignature,
      truncateAddress,
      walletError,
      stakedAmount,
      rewardsEarned,
      lastRewardTime,
      delegatedStakeAccounts
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

/* Progress Bar */
.progress-section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.progress-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.progress-bar-container {
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #6366f1;
}

.progress-percentage {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  margin-top: 0.25rem;
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

.warning-steps {
  background-color: #fff;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.warning-steps ol {
  margin: 0;
  padding-left: 1.5rem;
  color: #9a3412;
  font-size: 0.875rem;
}

.warning-steps li {
  margin-bottom: 0.25rem;
}

.warning-steps li:last-child {
  margin-bottom: 0;
}

.warning-steps a {
  color: #ea580c;
  text-decoration: none;
}

.warning-steps a:hover {
  text-decoration: underline;
}

/* Tooltip Styles */
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
  transition:
    opacity 0.2s,
    visibility 0.2s;
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
