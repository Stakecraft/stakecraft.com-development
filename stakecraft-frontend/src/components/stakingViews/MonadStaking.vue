<template>
  <transition name="modal-fade">
    <div v-if="network" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-content">
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
                To use Monad staking, you need to install the MetaMask wallet extension.
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
                    :href="`https://monad.socialscan.io/tx/${transactionHash}`"
                    target="_blank"
                    class="transaction-link"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            </div>

            <!-- Disconnect Button -->
            <div class="disconnect-section">
              <button @click="handleDisconnectWallet" class="disconnect-button">
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
              <button
                class="tab-button"
                :class="{ 'tab-active': activeTab === 'claim' }"
                @click="activeTab = 'claim'"
              >
                Claim
              </button>
              <button
                class="tab-button"
                :class="{ 'tab-active': activeTab === 'compound' }"
                @click="activeTab = 'compound'"
              >
                Compound
              </button>
            </div>

            <!-- Stake Tab -->
            <div v-if="activeTab === 'stake'" class="tab-content">
              <div class="staking-form">
                <div class="form-group">
                  <label class="form-label">Amount to Stake (MON)</label>
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
                      <span>MON</span>
                    </div>
                  </div>
                  <div class="input-hint">
                    <span>Minimum: {{ minimumStake }} MON</span>
                    <button
                      @click="stakeAmount = Number(availableBalance)"
                      class="max-button"
                      :disabled="Number(availableBalance) <= 0"
                    >
                      Max
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Validator Address</label>
                  <input
                    :value="validatorAddress || network?.validator || 'Please set validator address in admin panel'"
                    type="text"
                    class="form-input"
                    readonly
                    placeholder="Stakecraft Validator Address"
                  />
                  <div v-if="isLoadingValidatorId" class="input-hint" style="color: #6366f1; margin-top: 0.5rem;">
                    🔄 Looking up validator ID from address...
                  </div>
                </div>
                <div class="info-card">
                  <h3 class="info-card-title">Staking Status</h3>
                  <div class="info-card-content">
                    <div class="info-row">
                      <span class="info-label">Available Balance:</span>
                      <span class="info-value">{{ availableBalance }} MON</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Currently Staked:</span>
                      <span class="info-value">{{ stakedAmount.toFixed(4) }} MON</span>
                    </div>
                  </div>
                </div>
                <div v-if="stakingSuccess" class="success-message">
                  Successfully delegated MON tokens!
                </div>
                <div v-if="stakingError" class="error-message">{{ stakingError }}</div>
                <div v-if="!validatorId && validatorAddress && !isLoadingValidatorId" class="info-card" style="background-color: #fff7ed; border: 1px solid #fdba74; margin-bottom: 1rem;">
                  <div class="info-card-content">
                    <div style="font-size: 0.875rem; color: #9a3412">
                      <strong>⚠️ Validator Not Found:</strong> Could not find validator ID for address {{ validatorAddress }}. Please verify the address is correct.
                    </div>
                  </div>
                </div>
                <div v-if="isLoadingValidatorId" class="info-card" style="background-color: #eff6ff; border: 1px solid #3b82f6; margin-bottom: 1rem;">
                  <div class="info-card-content">
                    <div style="font-size: 0.875rem; color: #1e40af">
                      <strong>⏳ Please wait:</strong> Looking up validator ID from address. The delegate button will be enabled once the validator is found.
                    </div>
                  </div>
                </div>
                <button
                  @click="delegateTokens"
                  :disabled="!isValidStake || isProcessing || !validatorId || isLoadingValidatorId"
                  class="primary-button full-width delegate-button"
                  :class="{ 'button-disabled': !isValidStake || isProcessing || !validatorId || isLoadingValidatorId }"
                >
                  {{ 
                    isProcessing ? 'Processing...' : 
                    isLoadingValidatorId ? 'Looking up Validator...' : 
                    !validatorId ? 'Validator Not Found' : 
                    'Delegate MON' 
                  }}
                </button>
              </div>
            </div>

            <!-- Unstake Tab -->
            <div v-if="activeTab === 'unstake'" class="tab-content">
              <div class="staking-form">
                <div class="form-group">
                  <label class="form-label">Amount to Unstake (MON)</label>
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
                    <div class="input-suffix">
                      <span>MON</span>
                    </div>
                  </div>
                  <div class="input-hint">
                    <span>Available to unstake: {{ stakedAmount.toFixed(4) }} MON</span>
                    <button
                      @click="unstakeAmount = Number(stakedAmount)"
                      class="max-button"
                      :disabled="Number(stakedAmount) <= 0"
                    >
                      Max
                    </button>
                  </div>
                </div>
                <div class="info-card">
                  <h3 class="info-card-title">Unstaking Information</h3>
                  <div class="info-card-content">
                    <div class="info-row">
                      <span class="info-label">Currently Staked:</span>
                      <span class="info-value">{{ stakedAmount.toFixed(4) }} MON</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Rewards Earned:</span>
                      <span class="info-value">{{ rewardsEarned }} MON</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Unstaking Period:</span>
                      <span class="info-value">2-3 days</span>
                    </div>
                  </div>
                </div>

                <div class="warning-card">
                  <div class="warning-icon-small">⚠️</div>
                  <div class="warning-text">
                    <strong>Important:</strong> Unstaked tokens will be locked for 2-3 days before
                    becoming available for withdrawal.
                  </div>
                </div>

                <div v-if="unstakingSuccess" class="success-message">
                  Successfully undelegated MON tokens!
                </div>
                <div v-if="unstakingError" class="error-message">{{ unstakingError }}</div>
                <button
                  @click="handleUndelegateStake"
                  :disabled="!isValidUnstake || isProcessing"
                  class="primary-button full-width delegate-button unstake-button"
                  :class="{ 'button-disabled': !isValidUnstake || isProcessing }"
                >
                  {{ isProcessing ? 'Processing...' : 'Undelegate MON' }}
                </button>
              </div>
            </div>

            <!-- Claim Tab -->
            <div v-if="activeTab === 'claim'" class="tab-content">
              <div class="staking-form">
                <div class="info-card">
                  <h3 class="info-card-title">Rewards Information</h3>
                  <div class="info-card-content">
                    <div class="info-row">
                      <span class="info-label">Available Rewards:</span>
                      <span class="info-value">{{ rewardsEarned }} MON</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Currently Staked:</span>
                      <span class="info-value">{{ stakedAmount.toFixed(4) }} MON</span>
                    </div>
                  </div>
                </div>

                <div class="info-card" style="background-color: #eff6ff; border: 1px solid #3b82f6">
                  <div class="info-card-content">
                    <div style="font-size: 0.875rem; color: #1e40af">
                      <strong>💡 Claim Rewards:</strong> Withdraw your earned staking rewards directly to your wallet. 
                      Rewards accumulate continuously and can be claimed at any time. No waiting period required.
                    </div>
                  </div>
                </div>

                <div v-if="claimingSuccess" class="success-message">
                  Successfully claimed {{ claimResult?.rewardsClaimed || '0' }} MON rewards!
                </div>
                <div v-if="claimingError" class="error-message">{{ claimingError }}</div>
                <button
                  @click="handleClaimRewards"
                  :disabled="!canClaim || isProcessing"
                  class="primary-button full-width delegate-button"
                  :class="{ 'button-disabled': !canClaim || isProcessing }"
                >
                  {{ isProcessing ? 'Processing...' : 'Claim Rewards' }}
                </button>
              </div>
            </div>

            <!-- Compound Tab -->
            <div v-if="activeTab === 'compound'" class="tab-content">
              <div class="staking-form">
                <div class="info-card">
                  <h3 class="info-card-title">Compound Information</h3>
                  <div class="info-card-content">
                    <div class="info-row">
                      <span class="info-label">Available Rewards:</span>
                      <span class="info-value">{{ rewardsEarned }} MON</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Currently Staked:</span>
                      <span class="info-value">{{ stakedAmount.toFixed(4) }} MON</span>
                    </div>
                  </div>
                </div>

                <div class="info-card" style="background-color: #eff6ff; border: 1px solid #3b82f6">
                  <div class="info-card-content">
                    <div style="font-size: 0.875rem; color: #1e40af">
                      <strong>💡 Compound:</strong> Automatically claim and re-stake your rewards to
                      maximize your staking returns.
                    </div>
                  </div>
                </div>

                <div v-if="compoundingSuccess" class="success-message">
                  Successfully compounded rewards! Your rewards have been re-staked.
                </div>
                <div v-if="compoundingError" class="error-message">{{ compoundingError }}</div>
                <button
                  @click="handleCompoundRewards"
                  :disabled="!canCompound || isProcessing"
                  class="primary-button full-width delegate-button"
                  :class="{ 'button-disabled': !canCompound || isProcessing }"
                >
                  {{ isProcessing ? 'Processing...' : 'Compound Rewards' }}
                </button>
              </div>
            </div>

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
  delegateTokens,
  undelegateStake,
  claimRewards,
  compoundRewards,
  getMonadBalance,
  getDelegationAmount,
  getRewardsEarned,
  getValidatorInfo,
  findValidatorIdByAddress,
  WalletDisconnect
} from '../../utils/MonadStaking'
import { formatEther } from 'ethers'

export default {
  name: 'MonadStaking',
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
    const validatorId = ref(null)
    const validatorAddress = ref('')
    const isLoadingValidatorId = ref(false)
    const minimumStake = 0.01
    const stakingSuccess = ref(false)
    const unstakingSuccess = ref(false)
    const claimingSuccess = ref(false)
    const compoundingSuccess = ref(false)
    const stakingError = ref(null)
    const unstakingError = ref(null)
    const claimingError = ref(null)
    const compoundingError = ref(null)
    const transactionHash = ref('')
    const walletError = ref(false)
    const isConnecting = ref(false)
    const isProcessing = ref(false)
    const stakedAmount = ref(0)
    const rewardsEarned = ref('0.0')
    const activeTab = ref('stake')
    const availableBalance = ref('0.0000')
    const validatorInfo = ref(null)
    const claimResult = ref(null)

    onMounted(async () => {
      // Known Stakecraft validator mapping
      const STAKECRAFT_VALIDATOR_ID = 39
      const STAKECRAFT_VALIDATOR_ADDRESS = '0xadbe62e7c9e0b4902b1aae233a774386892e36bc'

      // Get validator address from network prop
      // Handle both array format (network.validator[0]) and string format
      let validatorValue = null
      
      if (Array.isArray(props.network?.validator)) {
        // If validator is an array, use first element
        validatorValue = props.network.validator[0]
      } else if (typeof props.network?.validator === 'string') {
        // If validator is a string, split by newlines and use first line
        const validatorLines = props.network.validator.split('\n').filter(line => line.trim())
        validatorValue = validatorLines[0] || props.network.validator.trim()
      } else if (props.network?.validatorId) {
        // Fallback to validatorId field
        validatorValue = props.network.validatorId
      }
      
      if (validatorValue) {
        // Check if it's the known Stakecraft validator address
        const normalizedValue = String(validatorValue).trim().toLowerCase()
        if (normalizedValue === STAKECRAFT_VALIDATOR_ADDRESS.toLowerCase()) {
          // It's the Stakecraft validator - use known ID directly
          validatorId.value = STAKECRAFT_VALIDATOR_ID
          validatorAddress.value = STAKECRAFT_VALIDATOR_ADDRESS
          console.log('Using known Stakecraft validator:', { id: STAKECRAFT_VALIDATOR_ID, address: STAKECRAFT_VALIDATOR_ADDRESS })
          // Try to load validator info if wallet is available
          try {
            await loadValidatorInfo()
          } catch (error) {
            console.log('Could not load validator info yet (wallet may not be connected):', error.message)
          }
          return
        }

        // Check if it's a hex address (starts with 0x)
        if (typeof validatorValue === 'string' && validatorValue.startsWith('0x')) {
          // It's an address - store it and look up the validator ID
          validatorAddress.value = validatorValue.trim()
          // Look up validator ID from address (this will work even without wallet connection)
          await lookupValidatorIdFromAddress(validatorAddress.value)
        } else {
          // Try to parse as integer (validator ID)
          const cleanedValue = String(validatorValue).trim().replace(/[^\d-]/g, '')
          const parsed = parseInt(cleanedValue, 10)
          
          if (!isNaN(parsed) && parsed > 0 && parsed < Number.MAX_SAFE_INTEGER) {
            // It's a validator ID - use it directly
            validatorId.value = parsed
            // If it's the known Stakecraft validator ID, set the address
            if (parsed === STAKECRAFT_VALIDATOR_ID) {
              validatorAddress.value = STAKECRAFT_VALIDATOR_ADDRESS
            }
            // Load validator info to get the address (requires wallet connection)
            // We'll try to load it, but if wallet isn't connected, we'll show the ID
            try {
              await loadValidatorInfo()
              if (validatorInfo.value?.authAddress) {
                validatorAddress.value = validatorInfo.value.authAddress
              }
            } catch (error) {
              // If we can't load validator info (e.g., no wallet), that's okay
              // The address will be shown from the network prop
              console.log('Could not load validator info yet (wallet may not be connected):', error.message)
            }
          } else {
            console.warn('Invalid Monad validator format:', validatorValue)
            validatorId.value = null
            // Still show the value as address if it looks like one
            if (validatorValue && validatorValue.length > 10) {
              validatorAddress.value = validatorValue
            }
          }
        }
      }
    })

    const lookupValidatorIdFromAddress = async (address) => {
      if (!address || !address.startsWith('0x')) {
        return
      }

      try {
        isLoadingValidatorId.value = true
        const id = await findValidatorIdByAddress(address)
        validatorId.value = id
        // Load validator info after finding the ID
        await loadValidatorInfo()
        // Refresh staking info after validator ID is found (if wallet is connected)
        if (walletAddress.value) {
          await refreshStakingInfo()
        }
      } catch (error) {
        console.error('Failed to find validator ID from address:', error)
        validatorId.value = null
      } finally {
        isLoadingValidatorId.value = false
      }
    }

    watch(activeTab, () => {
      stakingSuccess.value = false
      stakingError.value = null
      unstakingSuccess.value = false
      unstakingError.value = null
      claimingSuccess.value = false
      claimingError.value = null
      compoundingSuccess.value = false
      compoundingError.value = null
      transactionHash.value = ''
    })

    // Watch for validatorId changes and refresh staking info if wallet is connected
    watch(validatorId, async (newId, oldId) => {
      // Only refresh if validatorId was just set (not cleared) and wallet is connected
      if (newId && oldId === null && walletAddress.value) {
        await refreshStakingInfo()
      }
    })

    const isValidStake = computed(() => {
      const amount = parseFloat(stakeAmount.value)
      return (
        !isNaN(amount) &&
        amount >= minimumStake &&
        validatorId.value &&
        amount <= Number(availableBalance.value)
      )
    })

    const isValidUnstake = computed(() => {
      const amount = parseFloat(unstakeAmount.value)
      return !isNaN(amount) && amount > 0 && amount <= stakedAmount.value
    })

    const canClaim = computed(() => {
      return parseFloat(rewardsEarned.value || '0') > 0 && !isProcessing.value
    })

    const canCompound = computed(() => {
      return parseFloat(rewardsEarned.value || '0') > 0 && !isProcessing.value
    })

    const loadValidatorInfo = async () => {
      if (!validatorId.value) return
      
      try {
        const info = await getValidatorInfo(validatorId.value)
        if (info) {
          validatorInfo.value = info
          // Update validator address from the info if we don't have it
          if (info.authAddress && !validatorAddress.value) {
            validatorAddress.value = info.authAddress
          }
        }
      } catch (error) {
        console.error('Error loading validator info:', error)
      }
    }

    const handleConnectWallet = async () => {
      try {
        isConnecting.value = true
        const { address } = await connectWallet()
        walletAddress.value = address
        walletConnected.value = true
        isConnecting.value = false
        
        // Refresh staking info immediately (balance will be fetched even without validatorId)
        await refreshStakingInfo()
        
        // If validatorId is not yet available but we have an address, try to look it up
        if (!validatorId.value && validatorAddress.value) {
          await lookupValidatorIdFromAddress(validatorAddress.value)
        }
      } catch (error) {
        walletError.value = true
        isConnecting.value = false
        console.error('Failed to connect wallet:', error)
      }
    }

    const refreshStakingInfo = async () => {
      if (!walletAddress.value) return
      
      try {
        // Always fetch balance (doesn't require validatorId)
        const balance = await getMonadBalance(walletAddress.value)
        availableBalance.value = formatEther(balance)
        
        // Only fetch delegation and rewards if validatorId is available
        if (validatorId.value) {
          const delegation = await getDelegationAmount(walletAddress.value, validatorId.value)
          stakedAmount.value = Number(formatEther(delegation))
          
          const rewards = await getRewardsEarned(walletAddress.value, validatorId.value)
          rewardsEarned.value = rewards
        } else {
          // Reset staking-related values if validatorId is not available
          stakedAmount.value = 0
          rewardsEarned.value = '0.0'
        }
      } catch (error) {
        console.error('Error refreshing staking info:', error)
      }
    }

    const handleDisconnectWallet = async () => {
      try {
        await WalletDisconnect()
        walletAddress.value = ''
        walletConnected.value = false
        stakedAmount.value = 0
        rewardsEarned.value = '0.0'
        availableBalance.value = '0.0000'
        stakeAmount.value = 0
        unstakeAmount.value = 0
        stakingSuccess.value = false
        stakingError.value = null
        unstakingSuccess.value = false
        unstakingError.value = null
        claimingSuccess.value = false
        claimingError.value = null
        compoundingSuccess.value = false
        compoundingError.value = null
        transactionHash.value = ''
        walletError.value = false
      } catch (error) {
        console.error('Error disconnecting wallet:', error)
      }
    }

    const handleDelegateTokens = async () => {
      if (!isValidStake.value) {
        // Show specific error messages
        if (!validatorId.value) {
          stakingError.value = 'Validator ID not found. Please wait for validator lookup to complete or check the validator address.'
          return
        }
        if (!walletAddress.value) {
          stakingError.value = 'Please connect your wallet first.'
          return
        }
        if (!stakeAmount.value || stakeAmount.value < minimumStake) {
          stakingError.value = `Please enter a valid amount (minimum: ${minimumStake} MON).`
          return
        }
        if (stakeAmount.value > Number(availableBalance.value)) {
          stakingError.value = 'Insufficient balance. Please check your available balance.'
          return
        }
        return
      }

      // Double check validatorId before proceeding
      if (!validatorId.value) {
        stakingError.value = 'Validator ID is required. Please wait for validator lookup to complete.'
        return
      }

      try {
        isProcessing.value = true
        stakingSuccess.value = false
        stakingError.value = null

        console.log('Delegating tokens:', {
          walletAddress: walletAddress.value,
          validatorId: validatorId.value,
          amount: stakeAmount.value
        })

        const hash = await delegateTokens(walletAddress.value, validatorId.value, stakeAmount.value)

        transactionHash.value = hash
        stakingSuccess.value = true
        stakeAmount.value = 0
        await refreshStakingInfo()
      } catch (error) {
        console.error('Delegation error:', error)
        stakingError.value = error.message || 'Failed to delegate tokens'
      } finally {
        isProcessing.value = false
      }
    }

    const handleUndelegateStake = async () => {
      if (!isValidUnstake.value) return
      try {
        isProcessing.value = true
        unstakingSuccess.value = false
        unstakingError.value = null

        const hash = await undelegateStake(
          walletAddress.value,
          validatorId.value,
          unstakeAmount.value
        )
        transactionHash.value = hash
        unstakingSuccess.value = true
        unstakeAmount.value = 0
        await refreshStakingInfo()
      } catch (error) {
        unstakingError.value = error.message || 'Failed to undelegate stake'
      } finally {
        isProcessing.value = false
      }
    }

    const handleClaimRewards = async () => {
      if (!canClaim.value) return
      try {
        isProcessing.value = true
        claimingSuccess.value = false
        claimingError.value = null

        const result = await claimRewards(walletAddress.value, validatorId.value)
        claimResult.value = result
        transactionHash.value = result.txHash
        claimingSuccess.value = true
        await refreshStakingInfo()
      } catch (error) {
        claimingError.value = error.message || 'Failed to claim rewards'
      } finally {
        isProcessing.value = false
      }
    }

    const handleCompoundRewards = async () => {
      if (!canCompound.value) return
      try {
        isProcessing.value = true
        compoundingSuccess.value = false
        compoundingError.value = null

        const hash = await compoundRewards(walletAddress.value, validatorId.value)
        transactionHash.value = hash
        compoundingSuccess.value = true
        await refreshStakingInfo()
      } catch (error) {
        compoundingError.value = error.message || 'Failed to compound rewards'
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

    const formatMon = (amount) => {
      if (!amount) return '0.0000'
      try {
        const num = Number(formatEther(amount))
        return num.toFixed(4)
      } catch {
        return '0.0000'
      }
    }

    const formatCommission = (commission) => {
      if (!commission) return '0.00'
      try {
        // Commission is stored as a fraction (e.g., 1000000000000000000 = 100%)
        const num = Number(formatEther(commission))
        return (num * 100).toFixed(2)
      } catch {
        return '0.00'
      }
    }

    return {
      closeModal,
      walletConnected,
      walletAddress,
      stakeAmount,
      unstakeAmount,
      minimumStake,
      isValidStake,
      isValidUnstake,
      canClaim,
      canCompound,
      stakingSuccess,
      unstakingSuccess,
      claimingSuccess,
      compoundingSuccess,
      stakingError,
      unstakingError,
      claimingError,
      compoundingError,
      transactionHash,
      connectWallet: handleConnectWallet,
      delegateTokens: handleDelegateTokens,
      undelegateStake: handleUndelegateStake,
      claimRewards: handleClaimRewards,
      compoundRewards: handleCompoundRewards,
      truncateAddress,
      walletError,
      isConnecting,
      isProcessing,
      stakedAmount,
      rewardsEarned,
      activeTab,
      availableBalance,
      validatorId,
      validatorAddress,
      isLoadingValidatorId,
      validatorInfo,
      claimResult,
      handleDisconnectWallet,
      formatMon,
      formatCommission
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

.delegate-button {
  margin-top: 0.5rem;
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
  color: #8247e5;
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
  border-color: #8247e5;
  box-shadow: 0 0 0 3px rgba(130, 71, 229, 0.1);
}

.form-input.input-error {
  border-color: #dc2626;
  background-color: #fef2f2;
  color: #991b1b;
}

.form-input.input-error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
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
  appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.tab-container {
  display: flex;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.25rem;
  margin-bottom: 1.5rem;
  gap: 0.25rem;
}

.tab-button {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  font-size: 0.875rem;
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
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
</style>

