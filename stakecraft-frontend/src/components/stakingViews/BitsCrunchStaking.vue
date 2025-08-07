<template>
  <transition name="modal-fade">
    <div v-if="network" class="modal-overlay" @click.self="close">
      <div class="modal-container" @click.stop>
        <div class="modal-content">
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

          <div v-if="!walletConnected" class="network-description">
            <p>{{ network.description }}</p>
          </div>

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
                To use BitsCrunch staking, you need to install the MetaMask wallet extension.
              </p>
            </div>
          </div>

          <div v-if="!walletConnected" class="wallet-connection">
            <button
              @click="connectWallet"
              class="primary-button full-width"
              :disabled="isConnecting"
            >
              {{ isConnecting ? 'Connecting...' : 'Connect MetaMask Wallet' }}
            </button>
            <div class="network-links">
              <a
                v-if="network.explorer"
                :href="network.explorer"
                target="_blank"
                class="link-primary"
                >View on Explorer</a
              >
            </div>
          </div>

          <div v-if="walletConnected">
            <div class="wallet-info-card">
              <div class="wallet-info-row">
                <span class="info-label">Connected Wallet:</span>
                <span class="info-value tooltip-container"
                  >{{ truncateAddress(walletAddress)
                  }}<span class="tooltip">{{ walletAddress }}</span></span
                >
              </div>
              <div v-if="transactionHash" class="transaction-info">
                <div class="wallet-info-row">
                  <span class="info-label">Last Transaction:</span>
                  <a
                    :href="`https://etherscan.io/tx/${transactionHash}`"
                    target="_blank"
                    class="transaction-link"
                    >View on Etherscan</a
                  >
                </div>
              </div>
            </div>

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

            <div v-if="activeTab === 'stake'" class="tab-content">
              <div class="staking-form">
                <div class="form-group">
                  <label class="form-label">Amount to Stake (BCUT)</label>
                  <div class="input-container">
                    <input
                      v-model.number="stakeAmount"
                      type="number"
                      :min="minimumStake"
                      step="0.01"
                      class="form-input"
                      placeholder="Enter amount"
                    />
                    <div class="input-suffix"><span>BCUT</span></div>
                  </div>
                  <div class="input-hint">
                    <span>Minimum: {{ minimumStake }} BCUT</span>
                    <button
                      @click="stakeAmount = Number(bcutBalance)"
                      class="max-button"
                      :disabled="Number(bcutBalance) <= 0"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Validator Address</label>
                  <input :value="network.validator[0]" type="text" class="form-input" readonly />
                </div>

                <div v-if="!hasApproval && stakeAmount > 0" class="approval-section">
                  <div class="approval-info">
                    <p>First, approve BCUT tokens for staking:</p>
                    <button
                      @click="handleApproval"
                      :disabled="isProcessing"
                      class="primary-button full-width approval-button"
                    >
                      {{ isProcessing ? 'Approving...' : `Approve ${stakeAmount} BCUT` }}
                    </button>
                  </div>
                </div>

                <div class="info-card">
                  <h3 class="info-card-title">Current Staking Status</h3>
                  <div class="info-card-content">
                    <div class="info-row">
                      <span class="info-label">Available Balance:</span
                      ><span class="info-value">{{ bcutBalance }} BCUT</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Currently Staked:</span
                      ><span class="info-value">{{ stakedAmount }} BCUT</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Staking Rewards:</span
                      ><span class="info-value">{{ stakingRewards }} BCUT</span>
                    </div>
                  </div>
                </div>

                <div v-if="stakingSuccess" class="success-message">
                  Successfully staked {{ stakeAmount }} BCUT!
                </div>
                <div v-if="stakingError" class="error-message">{{ stakingError }}</div>

                <button
                  @click="handleStake"
                  :disabled="!isValidStake || isProcessing || (!hasApproval && stakeAmount > 0)"
                  class="primary-button full-width stake-button"
                  :class="{
                    'button-disabled':
                      !isValidStake || isProcessing || (!hasApproval && stakeAmount > 0)
                  }"
                >
                  {{ isProcessing ? 'Processing...' : 'Stake BCUT Tokens' }}
                </button>
              </div>
            </div>

            <div v-if="activeTab === 'unstake'" class="tab-content">
              <div class="staking-form">
                <div class="form-group">
                  <label class="form-label">Amount to Unstake (BCUT)</label>
                  <div class="input-container">
                    <input
                      v-model.number="unstakeAmount"
                      type="number"
                      :min="0"
                      :max="stakedAmount"
                      step="0.01"
                      class="form-input"
                      placeholder="Enter amount to unstake"
                    />
                    <div class="input-suffix"><span>BCUT</span></div>
                  </div>
                  <div class="input-hint">
                    <span>Available to unstake: {{ stakedAmount }} BCUT</span>
                    <button
                      @click="unstakeAmount = stakedAmount"
                      class="max-button"
                      :disabled="stakedAmount <= 0"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div class="info-card">
                  <h3 class="info-card-title">Unstaking Information</h3>
                  <div class="info-card-content">
                    <div class="info-row">
                      <span class="info-label">Currently Staked:</span
                      ><span class="info-value">{{ stakedAmount }} BCUT</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Staking Rewards:</span
                      ><span class="info-value">{{ stakingRewards }} BCUT</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Unbonding Period:</span
                      ><span class="info-value">14 days</span>
                    </div>
                  </div>
                </div>

                <div class="warning-card">
                  <div class="warning-icon-small">⚠️</div>
                  <div class="warning-text">
                    <strong>Important:</strong> Unstaked BCUT tokens will be locked for 14 days
                    before becoming available for withdrawal.
                  </div>
                </div>

                <div v-if="unstakingSuccess" class="success-message">
                  Successfully unstaked {{ unstakeAmount }} BCUT!
                </div>
                <div v-if="unstakingError" class="error-message">{{ unstakingError }}</div>

                <button
                  @click="handleUnstake"
                  :disabled="!isValidUnstake || isProcessing"
                  class="primary-button full-width unstake-button"
                  :class="{ 'button-disabled': !isValidUnstake || isProcessing }"
                >
                  {{ isProcessing ? 'Processing...' : 'Unstake BCUT Tokens' }}
                </button>
              </div>
            </div>

            <div class="network-links-bottom">
              <a
                v-if="network.explorer"
                :href="network.explorer"
                target="_blank"
                class="link-primary"
                >View on Explorer</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, watch } from 'vue'
import {
  connectWallet,
  approveTokens,
  stakeTokens,
  unstakeTokens,
  getBCUTBalance,
  getStakingInfo,
  getAllowance
} from '../../utils/BitsCrunchStaking'

export default {
  name: 'BitsCrunchStaking',
  props: { network: { type: Object, required: true } },
  emits: ['close'],
  setup(props, { emit }) {
    const walletConnected = ref(false),
      walletAddress = ref(''),
      stakeAmount = ref(0),
      unstakeAmount = ref(0)
    const minimumStake = 50,
      stakingSuccess = ref(false),
      unstakingSuccess = ref(false),
      stakingError = ref(null),
      unstakingError = ref(null)
    const transactionHash = ref(''),
      walletError = ref(false),
      isConnecting = ref(false),
      isProcessing = ref(false)
    const bcutBalance = ref('0.0000'),
      stakedAmount = ref(0),
      stakingRewards = ref(0),
      activeTab = ref('stake'),
      hasApproval = ref(false)

    watch(activeTab, () => {
      stakingSuccess.value = false
      stakingError.value = null
      unstakingSuccess.value = false
      unstakingError.value = null
      transactionHash.value = ''
    })
    watch(stakeAmount, async () => {
      if (walletConnected.value && stakeAmount.value > 0) await checkApproval()
    })

    const isValidStake = computed(() => {
      const amount = parseFloat(stakeAmount.value)
      return !isNaN(amount) && amount >= minimumStake && amount <= Number(bcutBalance.value)
    })
    const isValidUnstake = computed(() => {
      const amount = parseFloat(unstakeAmount.value)
      return !isNaN(amount) && amount > 0 && amount <= stakedAmount.value
    })

    const handleConnectWallet = async () => {
      try {
        isConnecting.value = true
        walletError.value = false
        const address = await connectWallet()
        walletAddress.value = address
        walletConnected.value = true
        await refreshStakingInfo()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        walletError.value = true
      } finally {
        isConnecting.value = false
      }
    }

    const refreshStakingInfo = async () => {
      if (!walletAddress.value) return
      try {
        const balance = await getBCUTBalance(walletAddress.value)
        bcutBalance.value = balance.toFixed(4)
        const stakingInfo = await getStakingInfo(walletAddress.value, props.network.validator[0])
        stakedAmount.value = stakingInfo.stakedAmount
        stakingRewards.value = stakingInfo.stakingRewards
        await checkApproval()
      } catch (error) {
        console.error('Failed to refresh staking info:', error)
      }
    }

    const checkApproval = async () => {
      if (!walletAddress.value || !stakeAmount.value) return
      try {
        const allowance = await getAllowance(walletAddress.value)
        hasApproval.value = allowance >= stakeAmount.value
      } catch (error) {
        console.error('Failed to check approval:', error)
        hasApproval.value = false
      }
    }

    const handleApproval = async () => {
      try {
        isProcessing.value = true
        stakingError.value = null
        const hash = await approveTokens(walletAddress.value, stakeAmount.value)
        transactionHash.value = hash
        setTimeout(async () => {
          await checkApproval()
        }, 2000)
      } catch (error) {
        console.error('Failed to approve tokens:', error)
        stakingError.value = error.message || 'Failed to approve tokens'
      } finally {
        isProcessing.value = false
      }
    }

    const handleStake = async () => {
      if (!isValidStake.value || !hasApproval.value) return
      try {
        isProcessing.value = true
        stakingSuccess.value = false
        stakingError.value = null
        const hash = await stakeTokens(
          walletAddress.value,
          props.network.validator[0],
          stakeAmount.value
        )
        transactionHash.value = hash
        stakingSuccess.value = true
        stakeAmount.value = 0
        hasApproval.value = false
        await refreshStakingInfo()
      } catch (error) {
        console.error('Failed to stake tokens:', error)
        stakingError.value = error.message || 'Failed to stake tokens'
      } finally {
        isProcessing.value = false
      }
    }

    const handleUnstake = async () => {
      if (!isValidUnstake.value) return
      try {
        isProcessing.value = true
        unstakingSuccess.value = false
        unstakingError.value = null
        const hash = await unstakeTokens(
          walletAddress.value,
          props.network.validator[0],
          unstakeAmount.value
        )
        transactionHash.value = hash
        unstakingSuccess.value = true
        unstakeAmount.value = 0
        await refreshStakingInfo()
      } catch (error) {
        console.error('Failed to unstake tokens:', error)
        unstakingError.value = error.message || 'Failed to unstake tokens'
      } finally {
        isProcessing.value = false
      }
    }

    const close = () => {
      emit('close')
    }
    const truncateAddress = (address) => {
      if (!address) return ''
      if (address.length <= 12) return address
      return address.substring(0, 6) + '...' + address.substring(address.length - 4)
    }

    return {
      walletConnected,
      walletAddress,
      stakeAmount,
      unstakeAmount,
      minimumStake,
      isValidStake,
      isValidUnstake,
      stakingSuccess,
      unstakingSuccess,
      stakingError,
      unstakingError,
      transactionHash,
      connectWallet: handleConnectWallet,
      handleStake,
      handleUnstake,
      handleApproval,
      truncateAddress,
      walletError,
      isConnecting,
      isProcessing,
      bcutBalance,
      stakedAmount,
      stakingRewards,
      activeTab,
      hasApproval,
      close
    }
  }
}
</script>

<style scoped>
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
  z-index: 10001;
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
  max-height: 90vh;
  overflow-y: auto;
}
.modal-content {
  padding: 1.5rem;
}
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
.network-description {
  text-align: center;
  margin-bottom: 1.5rem;
}
.network-description p {
  color: #4b5563;
  margin: 0;
}
.wallet-connection {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
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
.approval-button {
  background-color: #059669;
}
.approval-button:hover:not(:disabled) {
  background-color: #047857;
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
.approval-section {
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
}
.approval-info p {
  margin: 0 0 1rem 0;
  color: #0c4a6e;
  font-size: 0.875rem;
}
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
  align-items: center;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}
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
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
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
