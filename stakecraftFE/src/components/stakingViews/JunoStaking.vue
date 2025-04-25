<template>
  <Transition name="modal-fade">
    <div v-if="network" class="modal-backdrop" @click.self="closeModal">
      <div class="juno-staking">
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
                <button 
                  class="connect-wallet" 
                  @click="connectWallet" 
                  v-if="!walletConnected"
                  :disabled="isConnecting"
                >
                  {{ isConnecting ? 'Connecting...' : 'Connect Keplr Wallet' }}
                </button>
                <div class="wallet-info" v-if="walletConnected">
                  <p>Connected: {{ walletAddress }}</p>
                  <p v-if="transactionHash" class="transaction-link">
                    Last Transaction:
                    <a
                      :href="`https://atomscan.com/juno/transactions/${transactionHash}`"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Explorer
                    </a>
                  </p>
                </div>
              </div>

              <div v-if="stakingSuccess" class="success-message">
                Successfully staked JUNO tokens!
              </div>
              <div v-if="stakingError" class="error-message">
                {{ stakingError }}
                <div v-if="stakingError.includes('not installed')" class="install-guide">
                  <p>To use Juno staking, you need to:</p>
                  <ol>
                    <li>Install the Keplr wallet extension from <a href="https://www.keplr.app/" target="_blank">https://www.keplr.app/</a></li>
                    <li>Create an account in the Keplr wallet</li>
                    <li>Add the Juno network to your Keplr wallet</li>
                    <li>Refresh this page after installation</li>
                  </ol>
                </div>
              </div>

              <div class="staking-form" v-if="walletConnected">
                <div class="form-group">
                  <label>Amount to Stake (JUNO)</label>
                  <input type="number" v-model.number="stakeAmount" :min="minimumStake" step="0.1" />
                </div>

                <div class="form-group">
                  <label>Validator Address</label>
                  <input
                    type="text"
                    v-model="validatorAddress"
                    placeholder="Enter validator address"
                  />
                </div>

                <button @click="delegateTokens" :disabled="!isValidStake" class="stake-button">
                  Delegate
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
import { connectWallet, delegateTokens, getStakingInfo } from '../../utils/JunoStaking'

export default {
  name: 'JunoStaking',
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

.juno-staking {
  background: var(--van-background-2);
  border-radius: 20px;
  position: relative;
  cursor: default;
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

.staking-info {
  margin-top: 20px;
  padding: 15px;
  background: var(--van-background);
  border-radius: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.9em;
  color: var(--van-text-color-2);
}

.value {
  font-weight: 500;
  margin-top: 5px;
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

.install-guide {
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.install-guide ol {
  margin: 10px 0;
  padding-left: 20px;
}

.install-guide a {
  color: var(--van-primary-color);
  text-decoration: none;
}

.install-guide a:hover {
  text-decoration: underline;
}

.connect-wallet:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.transaction-link {
  font-size: 0.9em;
  margin-top: 5px;
}

.transaction-link a {
  color: var(--van-primary-color);
  text-decoration: none;
}

.transaction-link a:hover {
  text-decoration: underline;
}
</style> 