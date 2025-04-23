<template>
  <Transition name="modal-fade">
    <div v-if="network" class="modal-backdrop" @click.self="closeModal">
      <div class="koii-staking">
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
                  Connect Finnie Wallet
                </button>
                <div class="wallet-info" v-if="walletConnected">
                  <p>Connected: {{ walletAddress }}</p>
                </div>
              </div>

              <div class="staking-form" v-if="walletConnected">
                <div class="form-group">
                  <label>Amount to Stake (KOII)</label>
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
                  Delegate
                </button>

                <div v-if="stakingSuccess" class="success-message">
                  Successfully staked KOII tokens!
                </div>
                <div v-if="stakingError" class="error-message">
                  {{ stakingError }}
                </div>
              </div>

              <div class="attention-mining-info" v-if="walletConnected">
                <h3>Attention Mining Status</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Staked Amount:</span>
                    <span class="value">{{ stakedAmount }} KOII</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Rewards Earned:</span>
                    <span class="value">{{ rewardsEarned }} KOII</span>
                  </div>
                </div>
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
import { connectWallet, delegateTokens, getStakingInfo } from '../../utils/KoiiStaking'

export default {
  name: 'KoiiStaking',
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
    const stakingSuccess = ref(false)
    const stakingError = ref(null)
    const minimumStake = 100 // Minimum KOII to stake

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
        const address = await connectWallet()
        walletAddress.value = address
        walletConnected.value = true
        await refreshStakingInfo()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        stakingError.value = error.message
      }
    }

    const refreshStakingInfo = async () => {
      if (!walletAddress.value) return

      try {
        const info = await getStakingInfo(walletAddress.value)
        stakedAmount.value = info.stakedAmount
        rewardsEarned.value = info.rewardsEarned
      } catch (error) {
        console.error('Failed to refresh staking info:', error)
      }
    }

    const handleDelegateTokens = async () => {
      if (!isValidStake.value) return

      try {
        stakingSuccess.value = false
        stakingError.value = null

        const transactionHash = await delegateTokens(
          walletAddress.value,
          validatorAddress.value,
          stakeAmount.value
        )

        console.log('transactionHash', transactionHash)
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
      minimumStake,
      isValidStake,
      stakingSuccess,
      stakingError,
      connectWallet: handleConnectWallet,
      delegateTokens: handleDelegateTokens
    }
  }
}
</script>

<style>
/* Reuse styles from KavaStaking.vue */
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

.koii-staking {
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

.attention-mining-info {
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
</style>
