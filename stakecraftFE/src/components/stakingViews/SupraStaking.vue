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
                <button
                  class="connect-wallet"
                  @click="connectWallet"
                  v-if="!walletConnected"
                  :disabled="isConnecting"
                >
                  {{ isConnecting ? 'Connecting...' : 'Connect Starkey Wallet' }}
                </button>
                <div class="wallet-info" v-if="walletConnected">
                  <p>Connected: {{ walletAddress }}</p>
                  <p v-if="transactionHash" class="transaction-link">
                    Last Transaction:
                    <a
                      :href="`https://suprascan.io/tx/${transactionHash}`"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Explorer
                    </a>
                  </p>
                </div>
              </div>

              <div v-if="stakingSuccess" class="success-message">
                Successfully staked Supra tokens!
              </div>
              <div v-if="stakingError" class="error-message">
                {{ stakingError }}
                <div v-if="stakingError.includes('not installed')" class="install-guide">
                  <p>To use Supra staking, you need to:</p>
                  <ol>
                    <li>
                      Install the Starkey wallet extension from
                      <a href="https://starkey.com/" target="_blank"
                        >https://starkey.com/</a
                      >
                    </li>
                    <li>Create an account in the Starkey wallet</li>
                    <li>Refresh this page after installation</li>
                  </ol>
                </div>
              </div>

              <div class="staking-form" v-if="walletConnected">
                <div class="form-group">
                  <label>Amount to Stake (SUPRA)</label>
                  <input
                    type="number"
                    v-model.number="stakeAmount"
                    :min="minimumStake"
                    step="0.1"
                  />
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
import { walletConnect, delegateTokens } from '../../utils/SupraStaking'

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
    const attentionScore = ref(0)
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
        const connectedId = await walletConnect()
        walletAddress.value = connectedId
        walletConnected.value = true
        return walletAddress.value
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        stakingError.value = error.message
      } finally {
        isConnecting.value = false
      }
    }

    const handleDelegateTokens = async () => {
      if (!isValidStake.value) {
        stakingError.value = "Please enter a valid stake amount and validator address";
        return;
      }

      try {
        stakingSuccess.value = false;
        stakingError.value = null;
        
        const stakeButton = document.querySelector('.stake-button');
        if (stakeButton) {
          stakeButton.disabled = true;
          stakeButton.textContent = 'Processing...';
        }

        console.log('Delegating tokens:', {
          wallet: walletAddress.value,
          validator: validatorAddress.value,
          amount: stakeAmount.value
        });

        const hash = await delegateTokens(
          walletAddress.value,
          validatorAddress.value,
          stakeAmount.value
        );

        if (hash) {
          transactionHash.value = hash;
          stakingSuccess.value = true;
          stakeAmount.value = 0;
          console.log('Delegation successful, transaction hash:', hash);
        }
      } catch (error) {
        console.error('Failed to stake tokens:', error);
        stakingError.value = error.message || 'Failed to delegate tokens. Please try again.';
      } finally {
        const stakeButton = document.querySelector('.stake-button');
        if (stakeButton) {
          stakeButton.disabled = false;
          stakeButton.textContent = 'Delegate';
        }
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
      attentionScore,
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
