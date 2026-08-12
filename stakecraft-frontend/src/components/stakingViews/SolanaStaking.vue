<template>
  <transition name="modal-fade">
    <div
      v-if="network"
      :class="embedded ? 'stake-embed' : 'modal-overlay'"
      @click.self="embedded ? undefined : close()"
    >
      <div :class="embedded ? 'embed-container' : 'modal-container'" @click.stop>
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header" :class="{ 'header-compact': embedded && walletConnected }">
            <h2 class="modal-title">{{ embedded ? 'Stake SOL' : network.title }}</h2>
            <div v-if="embedded && walletConnected" class="header-wallet">
              <span
                class="wallet-pill tooltip-container"
                :title="walletAddress"
              >
                {{ connectedWalletType }} · {{ truncateAddress(walletAddress) }}
                <span class="tooltip">{{ walletAddress }}</span>
              </span>
              <button type="button" class="disconnect-link" @click="disconnectWallet">
                Disconnect
              </button>
            </div>
            <button v-else-if="!embedded" type="button" @click="close" class="close-button">
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
                To use Solana staking, you need to install either the Phantom or Solflare wallet
                extension.
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
              {{ isConnecting ? 'Connecting...' : 'Connect Wallet' }}
            </button>

            <!-- Network Links -->
            <div class="network-links">
              <a
                v-if="network.explorer"
                :href="network.explorer"
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

          <!-- Connected Wallet Info (modal / non-compact) -->
          <div v-if="walletConnected">
            <template v-if="!embedded">
              <div class="wallet-info-card">
                <div class="wallet-info-row">
                  <span class="info-label">Connected Wallet:</span>
                  <span class="info-value tooltip-container">
                    {{ truncateAddress(walletAddress) }}
                    <span class="tooltip">{{ walletAddress }}</span>
                  </span>
                </div>
                <div class="wallet-info-row">
                  <span class="info-label">Wallet Type:</span>
                  <span class="info-value">{{ connectedWalletType }}</span>
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

              <div class="disconnect-section">
                <button @click="disconnectWallet" class="disconnect-button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M16 17l5-5-5-5M21 12H9M10 3H6a2 2 0 00-2 2v14a2 2 0 002 2h4" />
                  </svg>
                  Disconnect Wallet
                </button>
              </div>
            </template>
            <div v-else-if="transactionSignature" class="compact-tx">
              <a
                :href="`https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`"
                target="_blank"
                rel="noopener noreferrer"
                class="transaction-link"
              >
                Last tx · View on Explorer
              </a>
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
              <div class="staking-form" :class="{ 'staking-form-compact': embedded }">
                <div v-if="embedded" class="stats-inline">
                  <span>
                    <span class="info-label">Available</span>
                    {{ availableBalance }} SOL
                  </span>
                  <span class="stats-sep">·</span>
                  <span>
                    <span class="info-label">Staked</span>
                    {{ stakedAmount.toFixed(3) }} SOL
                  </span>
                </div>

                <div class="form-group">
                  <label class="form-label">Amount to Stake (SOL)</label>
                  <div class="input-container">
                    <input
                      v-model.number="stakeAmount"
                      type="number"
                      step="1"
                      :min="minimumStake"
                      class="form-input"
                      placeholder="Enter amount"
                    />
                    <div class="input-suffix">
                      <span>SOL</span>
                    </div>
                  </div>
                  <div class="input-hint">
                    <span>Minimum: {{ minimumStake }} SOL</span>
                    <button
                      @click="stakeAmount = Number(totalSolBalance)"
                      class="max-button"
                      :disabled="Number(totalSolBalance) <= 0"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div v-if="embedded" class="validator-inline">
                  <span class="info-label">Validator</span>
                  <span class="info-value">StakeCraft</span>
                  <code class="validator-short" :title="network.validator">{{
                    truncateAddress(network.validator)
                  }}</code>
                  <button type="button" class="copy-inline" @click="copyValidator">
                    {{ validatorCopied ? 'Copied' : 'Copy' }}
                  </button>
                </div>
                <div v-else class="form-group">
                  <label class="form-label">Validator Address</label>
                  <input
                    :value="network.validator"
                    type="text"
                    class="form-input"
                    placeholder="Enter validator address"
                    readonly
                  />
                </div>

                <div v-if="!embedded" class="info-card">
                  <h3 class="info-card-title">Current Staking Status</h3>
                  <div class="info-card-content">
                    <div class="info-row">
                      <span class="info-label">Available Balance:</span>
                      <span class="info-value">{{ availableBalance }} SOL</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Currently Staked:</span>
                      <span class="info-value">{{ stakedAmount.toFixed(3) }} SOL</span>
                    </div>
                  </div>
                </div>

                <div v-if="!embedded" class="warning-card">
                  <div class="warning-icon-small">⚠️</div>
                  <div class="warning-text">
                    <strong>Important:</strong> Staked tokens will become active next epoch.
                  </div>
                </div>
                <p v-else class="compact-note">
                  Activates next epoch · ~2-day unstake cooldown
                </p>

                <div v-if="stakingSuccess" class="success-message">Successfully delegated !</div>
                <div v-if="stakingError" class="error-message">
                  {{ stakingError }}
                </div>

                <button
                  @click="delegateStake"
                  :disabled="!isValidStake || isProcessing"
                  class="primary-button full-width delegate-button"
                  :class="{ 'button-disabled': !isValidStake || isProcessing }"
                >
                  {{ isProcessing ? 'Processing...' : 'Delegate SOL' }}
                </button>
              </div>
            </div>

            <!-- Unstaking Tab Content -->
            <div v-if="activeTab === 'unstake'" class="tab-content">
              <div class="staking-form">
                <!-- My Staking Accounts Section -->
                <div class="staking-accounts-section">
                  <h3 class="section-title">My Staking Accounts</h3>

                  <!-- Loading State -->
                  <div v-if="isLoadingAccounts" class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading staking accounts...</p>
                  </div>

                  <!-- No Accounts State -->
                  <div v-else-if="stakingAccounts.length === 0" class="no-accounts">
                    <div class="no-accounts-icon">📭</div>
                    <p>No active staking accounts found</p>
                    <p class="no-accounts-hint">Stake some SOL to see your accounts here</p>
                  </div>

                  <!-- Accounts List -->
                  <div v-else class="accounts-list">
                    <div
                      v-for="account in stakingAccounts"
                      :key="account.address"
                      class="account-card"
                      :class="{ expanded: account.expanded }"
                    >
                      <!-- Compact Header (always visible) -->
                      <div class="account-header" @click="toggleAccount(account)">
                        <div class="account-basic-info">
                          <div class="account-id">
                            <span class="account-label">Account:</span>
                            <span class="account-value">{{
                              truncateAddress(account.address)
                            }}</span>
                          </div>
                          <div class="account-status">
                            <span :class="['status-badge', getStatusClass(account)]">
                              {{ getStatusText(account) }}
                            </span>
                          </div>
                        </div>
                        <div class="expand-indicator">
                          <svg
                            :class="['expand-icon', { rotated: account.expanded }]"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                      </div>

                      <!-- Expanded Details (conditionally visible) -->
                      <div v-if="account.expanded" class="account-expanded-content">
                        <div class="account-full-info">
                          <div class="account-validator">
                            <span class="label">Validator:</span>
                            <span class="value">{{ truncateAddress(account.voterAddress) }}</span>
                            <span class="tooltip-container">
                              <span class="tooltip">{{ account.voterAddress }}</span>
                            </span>
                          </div>
                        </div>

                        <div class="account-details">
                          <div class="detail-row">
                            <span class="detail-label">Delegated Amount:</span>
                            <span class="detail-value"
                              >{{ account.delegatedAmount.toFixed(4) }} SOL</span
                            >
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Active Amount:</span>
                            <span class="detail-value"
                              >{{ account.activeAmount.toFixed(4) }} SOL</span
                            >
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Inactive Amount:</span>
                            <span class="detail-value"
                              >{{ account.inactiveAmount.toFixed(4) }} SOL</span
                            >
                          </div>
                        </div>

                        <div class="account-actions">
                          <button
                            v-if="account.isActive"
                            @click="deactivateAccount(account.address)"
                            :disabled="isDeactivating"
                            class="action-button deactivate-button"
                            :class="{ 'button-disabled': isDeactivating }"
                          >
                            <span v-if="isDeactivating && deactivatingAccount === account.address">
                              Deactivating...
                            </span>
                            <span v-else>Deactivate</span>
                          </button>

                          <button
                            v-else-if="account.isInactive"
                            @click="withdrawFromAccount(account.address)"
                            :disabled="isWithdrawing"
                            class="action-button withdraw-button"
                            :class="{ 'button-disabled': isWithdrawing }"
                          >
                            <span v-if="isWithdrawing && withdrawingAccount === account.address">
                              Withdrawing...
                            </span>
                            <span v-else>Withdraw</span>
                          </button>

                          <div v-else-if="account.isDeactivating" class="status-info">
                            <span class="status-text">⏳ Deactivation in progress...</span>
                            <small class="status-hint"
                              >Will be available for withdrawal next epoch</small
                            >
                          </div>

                          <div v-else-if="account.isActivating" class="status-info">
                            <span class="status-text">⏳ Activation in progress...</span>
                            <small class="status-hint">Will become active next epoch</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Unstaking Warning -->
                <div class="warning-card">
                  <div class="warning-icon-small">⚠️</div>
                  <div class="warning-text">
                    <strong>Important:</strong> Unstaked tokens will become available next epoch.
                  </div>
                </div>

                <!-- Success/Error Messages for Unstaking -->
                <div v-if="unstakingSuccess" class="success-message">
                  Successfully Undelegated !
                </div>
                <div v-if="unstakingError" class="error-message">
                  {{ unstakingError }}
                </div>
              </div>
            </div>

            <!-- Network Links -->
            <div class="network-links-bottom">
              <a
                v-if="network.explorer"
                :href="network.explorer"
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
  WalletDisconnect,
  createAndDelegateStake,
  getTotalStakedAmount,
  undelegateStake,
  withdrawStake,
  getSolBalance,
  getAllStakingAccounts,
  getStakeRewards
} from '../../utils/SolanaStaking'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { resolveValidatorAddress } from '../../utils/resolveValidator.js'

export default {
  name: 'SolanaStaking',
  props: {
    network: {
      type: Object,
      required: true
    },
    /** Inline card on /solana-staking — no overlay or close control. */
    embedded: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const walletConnected = ref(false)
    const walletAddress = ref('')
    const stakeAmount = ref(0)
    const unstakeAmount = ref(0)
    const validatorAddress = ref('')
    const stakeAccountInfo = ref(null)
    const rewards = ref(null)
    const minimumStake = 0.01
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
    const connectedWalletType = ref('')
    const isConnecting = ref(false)
    const isProcessing = ref(false)
    const stakingSuccess = ref(false)
    const unstakingSuccess = ref(false)
    const stakingError = ref(null)
    const unstakingError = ref(null)
    const availableBalance = ref(0)
    const validatorCopied = ref(false)
    const activeTab = ref('stake')
    const totalSolBalance = ref(0)
    const stakingAccounts = ref([])
    const isDeactivating = ref(false)
    const deactivatingAccount = ref('')
    const isLoadingAccounts = ref(false)
    const isWithdrawing = ref(false)
    const withdrawingAccount = ref('')

    onMounted(() => {
      if (resolveValidatorAddress(props.network?.validator)) {
        validatorAddress.value = resolveValidatorAddress(props.network.validator)
      }
    })

    // Add watch on activeTab to clear messages
    watch(activeTab, () => {
      stakingSuccess.value = false
      stakingError.value = null
      unstakingSuccess.value = false
      unstakingError.value = null
      transactionSignature.value = ''
    })

    const isValidStake = computed(() => {
      const amount = parseFloat(stakeAmount.value)
      // Reserve rent (~0.0023 SOL) + tx fees so full-balance stakes don't fail
      const maxStakeable = Math.max(0, Number(totalSolBalance.value) - 0.003)
      return (
        !isNaN(amount) &&
        amount >= minimumStake &&
        validatorAddress.value &&
        amount <= maxStakeable
      )
    })

    const isValidUnstake = computed(() => {
      const amount = parseFloat(unstakeAmount.value)
      return !isNaN(amount) && amount > 0 && amount <= stakedAmount.value
    })

    const close = () => {
      emit('close')
    }

    const handleConnectWallet = async () => {
      try {
        isConnecting.value = true
        walletError.value = null

        const hasPhantom = window.solana?.isPhantom
        const hasSolflare = window.solflare

        if (!hasPhantom && !hasSolflare) {
          walletError.value =
            'No supported wallet found. Please install Phantom or Solflare wallet.'
          return
        }

        const publicKey = await connectWallet()
        walletAddress.value = publicKey.toString()
        walletConnected.value = true

        if (window.solana?.isPhantom) {
          connectedWalletType.value = 'Phantom'
        } else if (window.solflare) {
          connectedWalletType.value = 'Solflare'
        }
        await refreshStakingInfo()
        await loadStakingAccounts()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        if (error.message.includes('not installed') || error.message.includes('not found')) {
          walletError.value =
            'No supported wallet found. Please install Phantom or Solflare wallet.'
        } else {
          walletError.value = error.message
        }
      } finally {
        isConnecting.value = false
      }
    }

    const refreshStakingInfo = async () => {
      if (!walletAddress.value) return

      try {
        const solBalance = await getSolBalance(walletAddress.value)
        totalSolBalance.value = solBalance
        availableBalance.value = Number(solBalance).toFixed(4)
      } catch (error) {
        console.error('Failed to refresh SOL balance:', error)
        stakingError.value = error.message
        return
      }

      if (!validatorAddress.value) return

      try {
        const stakingInfo = await getTotalStakedAmount(walletAddress.value, validatorAddress.value)
        stakedAmount.value = stakingInfo.totalStaked
        delegatedStakeAccounts.value = stakingInfo.delegatedAccounts || []

        if (stakingInfo.stakeAccounts > 0 && delegatedStakeAccounts.value.length > 0) {
          try {
            const rewards = await getStakeRewards(delegatedStakeAccounts.value[0])
            rewardsEarned.value = rewards ? rewards.amount : 0
            lastRewardTime.value = rewards ? rewards.epoch : null
          } catch (error) {
            console.error('Failed to get rewards:', error)
            rewardsEarned.value = 0
            lastRewardTime.value = null
          }
        } else {
          rewardsEarned.value = 0
          lastRewardTime.value = null
        }
      } catch (error) {
        console.error('Failed to refresh staking info:', error)
      }
    }

    const loadStakingAccounts = async () => {
      if (!walletAddress.value) return

      try {
        isLoadingAccounts.value = true
        const accounts = await getAllStakingAccounts(walletAddress.value, validatorAddress.value)
        stakingAccounts.value = accounts.map((account) => ({
          ...account,
          expanded: false,
          isActive: account.state === 'active',
          isInactive: account.state === 'inactive',
          isDeactivating: account.state === 'deactivating',
          isActivating: account.state === 'activating'
        }))
      } catch (error) {
        console.error('Failed to load staking accounts:', error)
        stakingAccounts.value = []
      } finally {
        isLoadingAccounts.value = false
      }
    }

    const toggleAccount = (account) => {
      account.expanded = !account.expanded
    }

    const deactivateAccount = async (accountAddress) => {
      try {
        isDeactivating.value = true
        deactivatingAccount.value = accountAddress

        // Clear previous messages
        unstakingSuccess.value = false
        unstakingError.value = null

        console.log('Starting deactivation for account:', accountAddress)
        const signature = await undelegateStake(accountAddress)
        console.log('Deactivation successful:', signature)

        transactionSignature.value = signature

        // Reload accounts and refresh info
        await loadStakingAccounts()
        await refreshStakingInfo()

        unstakingSuccess.value = true
        unstakingError.value = null
      } catch (error) {
        console.error('Failed to deactivate account:', error)
        unstakingError.value = error.message || 'Failed to deactivate account'
        unstakingSuccess.value = false
        transactionSignature.value = null
      } finally {
        isDeactivating.value = false
        deactivatingAccount.value = ''
      }
    }

    const withdrawFromAccount = async (accountAddress) => {
      try {
        isWithdrawing.value = true
        withdrawingAccount.value = accountAddress

        // Clear previous messages
        unstakingSuccess.value = false
        unstakingError.value = null

        console.log('Starting withdrawal for account:', accountAddress)

        try {
          // Use the consolidated withdrawal function
          const result = await withdrawStake(accountAddress)
          console.log('Withdrawal successful:', result)

          transactionSignature.value = result.signature
          unstakingSuccess.value = true
          unstakingError.value = null
        } catch (error) {
          console.error('Withdrawal failed:', error)
          unstakingError.value = error.message || 'Failed to withdraw from account'
          unstakingSuccess.value = false
          transactionSignature.value = null
        }

        // Reload accounts and refresh info
        await loadStakingAccounts()
        await refreshStakingInfo()
      } catch (error) {
        console.error('Failed to withdraw from account:', error)
        unstakingError.value = error.message || 'Failed to withdraw from account'
        unstakingSuccess.value = false
        transactionSignature.value = null
      } finally {
        isWithdrawing.value = false
        withdrawingAccount.value = ''
      }
    }

    const handleDelegateStake = async () => {
      if (!isValidStake.value) return

      try {
        isProcessing.value = true
        stakingSuccess.value = false
        stakingError.value = null
        unstakingSuccess.value = false
        unstakingError.value = null

        const validator = resolveValidatorAddress(props.network?.validator) || validatorAddress.value
        if (!validator) {
          throw new Error('Validator address is required')
        }

        const { signature, stakeAccount } = await createAndDelegateStake(
          stakeAmount.value * LAMPORTS_PER_SOL,
          validator
        )

        if (!signature || !stakeAccount) {
          throw new Error('Failed to create and delegate stake account')
        }

        transactionSignature.value = signature

        rewards.value = await getStakeRewards(stakeAccount)
        await refreshStakingInfo()
        await loadStakingAccounts()

        stakingSuccess.value = true
        stakeAmount.value = 0
      } catch (error) {
        console.error('Failed to delegate stake:', error)
        const msg = error?.message || String(error) || ''
        let errorMessage = 'Failed to delegate stake'
        if (/user rejected|User rejected|cancelled|denied/i.test(msg)) {
          errorMessage = 'Transaction rejected in wallet'
        } else if (msg.includes('Insufficient balance') || /insufficient/i.test(msg)) {
          errorMessage = 'Insufficient SOL balance in your wallet (need stake amount + rent + fees)'
        } else if (msg.includes('already delegated')) {
          errorMessage = 'This stake account is already delegated'
        } else if (msg.includes('Validator account not found')) {
          errorMessage = 'Invalid validator address'
        } else if (msg.includes('0x1902')) {
          errorMessage = 'Stake account is not properly initialized. Please try again.'
        } else if (msg) {
          errorMessage = msg.length > 160 ? `${msg.slice(0, 160)}…` : msg
        }

        stakingError.value = errorMessage
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

        if (!delegatedStakeAccounts.value.length) {
          throw new Error('No delegated stake accounts found')
        }
        const activeStakeAccounts = delegatedStakeAccounts.value.filter(
          (account) => !completedStakeAccounts.value.includes(account)
        )
        if (!activeStakeAccounts.length) {
          throw new Error('No active stake accounts found')
        }
        const stakeAccountAddress = activeStakeAccounts[0]
        if (!stakeAccountAddress) {
          throw new Error('Stake account address is undefined')
        }
        const signature = await undelegateStake(stakeAccountAddress)
        transactionSignature.value = signature

        if (signature) {
          completedStakeAccounts.value.push(stakeAccountAddress)
        }

        await refreshStakingInfo()

        unstakingSuccess.value = true
        unstakeAmount.value = 0
      } catch (error) {
        console.error('Failed to undelegate stake:', error)
        unstakingError.value = error.message || 'Failed to undelegate stake'
      } finally {
        isProcessing.value = false
      }
    }

    const truncateAddress = (address) => {
      if (!address) return ''
      if (address.length <= 12) return address
      return address.substring(0, 6) + '...' + address.substring(address.length - 4)
    }

    const copyValidator = async () => {
      const value = props.network?.validator
      if (!value || !navigator?.clipboard) return
      try {
        await navigator.clipboard.writeText(value)
        validatorCopied.value = true
        setTimeout(() => {
          validatorCopied.value = false
        }, 1500)
      } catch {
        /* ignore */
      }
    }

    const handleDisconnectWallet = async () => {
      console.log('Disconnecting wallet')
      try {
        await WalletDisconnect()
        walletConnected.value = false
        walletAddress.value = ''
        connectedWalletType.value = ''
        stakeAmount.value = 0
        unstakeAmount.value = 0
        stakingSuccess.value = false
        unstakingSuccess.value = false
        stakingError.value = null
        unstakingError.value = null
        transactionSignature.value = ''
        totalSolBalance.value = 0
        stakingAccounts.value = []
        availableBalance.value = 0
        stakedAmount.value = 0
      } catch (error) {
        console.error('Failed to disconnect wallet:', error)
      }
    }

    const getStatusClass = (account) => {
      if (account.isActive) {
        return 'active'
      } else if (account.isInactive) {
        return 'inactive'
      } else if (account.isDeactivating) {
        return 'deactivating'
      } else if (account.isActivating) {
        return 'activating'
      }
      return ''
    }

    const getStatusText = (account) => {
      if (account.isActive) {
        return 'Active'
      } else if (account.isInactive) {
        return 'Inactive'
      } else if (account.isDeactivating) {
        return 'Deactivating...'
      } else if (account.isActivating) {
        return 'Activating...'
      }
      return 'Unknown'
    }

    return {
      close,
      walletConnected,
      walletAddress,
      stakeAmount,
      unstakeAmount,
      validatorAddress,
      stakeAccountInfo,
      rewards,
      minimumStake,
      isValidStake,
      isValidUnstake,
      connectWallet: handleConnectWallet,
      disconnectWallet: handleDisconnectWallet,
      delegateStake: handleDelegateStake,
      undelegateStake: handleUndelegateStake,
      LAMPORTS_PER_SOL,
      transactionSignature,
      truncateAddress,
      copyValidator,
      validatorCopied,
      walletError,
      stakedAmount,
      rewardsEarned,
      lastRewardTime,
      delegatedStakeAccounts,
      connectedWalletType,
      isConnecting,
      isProcessing,
      stakingSuccess,
      unstakingSuccess,
      stakingError,
      unstakingError,
      availableBalance,
      activeTab,
      totalSolBalance,
      stakingAccounts,
      isLoadingAccounts,
      isDeactivating,
      deactivatingAccount,
      deactivateAccount,
      loadStakingAccounts,
      toggleAccount,
      isWithdrawing,
      withdrawingAccount,
      withdrawFromAccount,
      getStatusClass,
      getStatusText
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
  z-index: 10001; /* Higher than header (9999) and mobile header (10000) */
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

/* Tab Navigation */
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

/* Tab Content */
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
  align-items: center;
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

/* Warning Card */
.warning-card {
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin: 0.2rem 0;
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

/* Staking Accounts Section */
.staking-accounts-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-accounts {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.no-accounts-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-accounts-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.account-card {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
}

.account-card:hover {
  border-color: #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.account-card.expanded {
  background-color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 0.25rem 0;
}

.account-basic-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.account-id .account-label {
  color: #6b7280;
  font-weight: 500;
  min-width: 60px;
}

.account-id .account-value {
  color: #1f2937;
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 500;
}

.account-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.deactivating {
  background-color: #fffbeb;
  color: #92400e;
}

.status-badge.activating {
  background-color: #e0f2fe;
  color: #155e75;
}

.expand-indicator {
  flex-shrink: 0;
  margin-left: 0.5rem;
  color: #6b7280;
}

.expand-icon {
  transition: transform 0.3s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.account-expanded-content {
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1rem;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.account-full-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.account-full-info .label {
  color: #6b7280;
  font-weight: 500;
  min-width: 60px;
}

.account-full-info .value {
  color: #1f2937;
  font-family: monospace;
  font-size: 0.75rem;
}

.account-details {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
  color: #1f2937;
  font-family: monospace;
}

.account-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-button {
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.deactivate-button {
  background-color: #dc2626;
  color: white;
}

.deactivate-button:hover:not(:disabled) {
  background-color: #b91c1c;
}

.withdraw-button {
  background-color: #059669;
  color: white;
}

.withdraw-button:hover:not(:disabled) {
  background-color: #047857;
}

.button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #92400e;
}

.status-text {
  font-weight: 600;
}

.status-hint {
  opacity: 0.7;
}

/* Disconnect Button Styles */
.disconnect-section {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}

.disconnect-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.disconnect-button:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
}

.disconnect-button:active {
  transform: translateY(0);
}

.disconnect-button svg {
  width: 16px;
  height: 16px;
}

/* Inline embed on /solana-staking — match page tokens (Definity-sized card) */
.stake-embed {
  position: relative;
  display: block;
  background: transparent;
  z-index: auto;
}

.embed-container {
  background: var(--van-mainnet-network-background);
  color: var(--van-mainnet-color);
  border: 1px solid var(--van-border-color);
  border-radius: 20px;
  box-shadow: none;
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  max-height: none;
}

.stake-embed .modal-content {
  padding: 22px;
}

.stake-embed .modal-title {
  font-family: poppins;
  font-size: 20px;
  font-weight: 700;
  color: var(--van-text-color);
}

.stake-embed .network-description p,
.stake-embed .info-label,
.stake-embed .form-label,
.stake-embed .input-hint,
.stake-embed .warning-message {
  color: var(--van-mainnet-color);
  opacity: 0.8;
}

.stake-embed .wallet-info-card,
.stake-embed .info-card,
.stake-embed .wallet-warning {
  background: var(--van-ourCapabilities-wrapper);
  color: var(--van-ourCapabilities-text);
  border: 1px solid var(--van-border-color);
  border-radius: 14px;
}

.stake-embed .info-value,
.stake-embed .form-input {
  color: var(--van-text-color);
}

.stake-embed .form-input {
  background: var(--van-mainnet-network-background);
  border: 1px solid var(--van-border-color);
  border-radius: 12px;
}

.stake-embed .form-input:focus {
  border-color: var(--van-seconday-color);
  box-shadow: none;
  outline: none;
}

.stake-embed .tab-container {
  background: var(--van-ourCapabilities-wrapper);
  border-radius: 14px;
}

.stake-embed .tab-button {
  color: var(--van-mainnet-color);
  font-family: poppins;
}

.stake-embed .tab-button.tab-active {
  background: var(--van-seconday-color);
  color: #111217;
  box-shadow: none;
}

.stake-embed .tab-button:hover:not(.tab-active) {
  background: transparent;
  color: var(--van-text-color);
}

.stake-embed .primary-button {
  background: var(--van-seconday-color);
  color: #111217;
  border-radius: 20px;
  font-family: poppins;
  font-weight: 700;
}

.stake-embed .primary-button:hover:not(:disabled) {
  background: var(--van-seconday-color);
  filter: brightness(0.95);
}

.stake-embed .link-primary {
  color: var(--van-seconday-color);
}

.stake-embed .disconnect-button {
  border-radius: 14px;
}

.stake-embed .modal-header.header-compact {
  margin-bottom: 12px;
  gap: 10px;
  flex-wrap: wrap;
}

.stake-embed .header-wallet {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-left: auto;
}

.stake-embed .wallet-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 14px;
  border: 1px solid var(--van-border-color);
  background: var(--van-ourCapabilities-wrapper);
  color: var(--van-text-color);
  font-family: poppins;
  font-size: 12px;
  font-weight: 600;
  position: relative;
}

.stake-embed .disconnect-link {
  border: none;
  background: none;
  padding: 0;
  font-family: poppins;
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.stake-embed .compact-tx {
  margin: 0 0 10px;
}

.stake-embed .tab-container {
  margin-bottom: 12px;
}

.stake-embed .staking-form-compact {
  gap: 10px;
}

.stake-embed .staking-form-compact .form-group {
  margin-bottom: 0;
}

.stake-embed .stats-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-family: poppins;
  font-size: 13px;
  font-weight: 600;
  color: var(--van-text-color);
}

.stake-embed .stats-inline .info-label {
  margin-right: 4px;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.7;
}

.stake-embed .stats-sep {
  opacity: 0.45;
}

.stake-embed .validator-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 14px;
  border: 1px solid var(--van-border-color);
  background: var(--van-ourCapabilities-wrapper);
  font-family: poppins;
  font-size: 13px;
}

.stake-embed .validator-inline .info-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.7;
}

.stake-embed .validator-short {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--van-seconday-color);
}

.stake-embed .copy-inline {
  margin-left: auto;
  border: none;
  background: none;
  padding: 0;
  font-family: poppins;
  font-size: 12px;
  font-weight: 600;
  color: var(--van-seconday-color);
  cursor: pointer;
}

.stake-embed .compact-note {
  margin: 0;
  font-family: poppins;
  font-size: 12px;
  line-height: 18px;
  color: var(--van-mainnet-color);
  opacity: 0.7;
}

.stake-embed .success-message,
.stake-embed .error-message {
  margin-top: 0;
}

.stake-embed .max-button {
  color: var(--van-seconday-color);
}

.stake-embed .max-button:hover:not(:disabled) {
  color: var(--van-seconday-color);
  filter: brightness(0.9);
}
</style>
