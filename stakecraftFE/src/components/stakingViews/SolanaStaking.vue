<template>
  <transition name="modal-fade">
    <div class="modal-overlay" @click.self="close">
      <div v-if="network" class="modal-container" @click.stop>
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ network.title }}</h2>
            <button @click="close" class="close-button">
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
            >
              Connect Wallet
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
                <label class="form-label">
                  Amount to Stake (SOL)
                </label>
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
                  <span>
                    Minimum: {{ minimumStake }} SOL
                  </span>
                </div>
              </div>
              
              <!-- Validator Address -->
              <div class="form-group">
                <label class="form-label">
                  Validator Address
                </label>
                <input
                  :value="network.validator"
                  type="text"
                  class="form-input"
                  placeholder="Enter validator address"
                  readonly
                />
              </div>
              
              <!-- Stake Account Info -->
              <div v-if="stakeAccountInfo" class="info-card">
                <h3 class="info-card-title">Stake Account Information</h3>
                <div class="info-card-content">
                  <div class="info-row">
                    <span class="info-label">Balance:</span>
                    <span class="info-value">{{ stakeAccountInfo.balance }} SOL</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">State:</span>
                    <span class="info-value">{{ stakeAccountInfo.state }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Active Stake:</span>
                    <span class="info-value">{{ stakeAccountInfo.active }} SOL</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Inactive Stake:</span>
                    <span class="info-value">{{ stakeAccountInfo.inactive }} SOL</span>
                  </div>
                  <div v-if="stakeAccountInfo.delegatedVoteAccountAddress" class="info-row">
                    <span class="info-label">Delegated to:</span>
                    <span class="info-value">{{ truncateAddress(stakeAccountInfo.delegatedVoteAccountAddress) }}</span>
                  </div>
                </div>
                
                <!-- Activation Progress -->
                <div v-if="stakeAccountInfo.state === 'activating'" class="progress-section">
                  <div class="progress-label">Activation Progress:</div>
                  <div class="progress-bar-container">
                    <div
                      class="progress-bar-fill"
                      :style="{
                        width:
                          (stakeAccountInfo.active /
                            (stakeAccountInfo.active + stakeAccountInfo.inactive)) *
                            100 +
                          '%'
                      }"
                    ></div>
                  </div>
                  <div class="progress-percentage">
                    {{
                      (
                        (stakeAccountInfo.active /
                          (stakeAccountInfo.active + stakeAccountInfo.inactive)) *
                        100
                      ).toFixed(2)
                    }}%
                  </div>
                </div>
              </div>
              
              <!-- Rewards Info -->
              <div v-if="rewards" class="info-card">
                <h3 class="info-card-title">Staking Rewards</h3>
                <div class="info-card-content">
                  <div class="info-row">
                    <span class="info-label">Epoch Rewards:</span>
                    <span class="info-value">{{ rewards.amount / LAMPORTS_PER_SOL }} SOL</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Epoch:</span>
                    <span class="info-value">{{ rewards.epoch }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Action Button -->
            <button
              @click="delegateStake"
              :disabled="!isValidStake"
              class="primary-button full-width delegate-button"
              :class="{ 'button-disabled': !isValidStake }"
            >
              Delegate Stake
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
import { ref, computed, onMounted, watch } from 'vue'
import {
  connectWallet,
  delegateStake,
  getStakeAccountInfo,
  getStakeRewards,
  createAndInitializeStakeAccount
} from '../../utils/SolanaStaking'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export default {
  name: 'SolanaStaking',
  props: ['network'],
  // emits: ['close'],
  setup( props, context ) {
    const walletConnected = ref(false)
    const walletAddress = ref('')
    const stakeAmount = ref(0)
    const validatorAddress = ref('')
    const stakeAccountInfo = ref(null)
    const rewards = ref(null)
    const minimumStake = 0.01
    const stakeAccountPublickey = ref(null)
    const transactionSignature = ref(null)

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
        const publicKey = await connectWallet()
        walletAddress.value = publicKey.toString()
        walletConnected.value = true
      } catch (error) {
        console.error('Failed to connect wallet:', error)
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

        // Get validator address from props or input
        const validator = props.network?.validator?.[0] || validatorAddress.value
        if (!validator) {
          throw new Error('Validator address is required')
        }

        const signature = await delegateStake(stakeAccount, validator)
        transactionSignature.value = signature
        stakeAccountInfo.value = await getStakeAccountInfo(stakeAccount)
        rewards.value = await getStakeRewards(stakeAccount)
        console.log('-------success-------')
      } catch (error) {
        console.error('Failed to delegate stake:', error)
      }
    }
    
    const truncateAddress = (address) => {
      if (!address) return '';
      if (address.length <= 12) return address;
      return address.substring(0, 6) + '...' + address.substring(address.length - 4);
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
      LAMPORTS_PER_SOL,
      transactionSignature,
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
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>