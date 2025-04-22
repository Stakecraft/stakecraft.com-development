<template>
  <Transition name="modal-fade">
    <div v-if="network" class="modal-overlay" @click.self="closeModal">
      <div class="solana-staking">
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
                  Connect Wallet
                </button>
                <div class="wallet-info" v-if="walletConnected">
                  <p>Connected: {{ walletAddress }}</p>
                  <p v-if="transactionSignature" class="transaction-link">
                    Last Transaction:
                    <a
                      :href="`https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Explorer
                    </a>
                  </p>
                </div>
              </div>

              <div class="staking-form" v-if="walletConnected">
                <div class="form-group">
                  <label>Amount to Stake (SOL)</label>
                  <input
                    type="number"
                    v-model.number="stakeAmount"
                    :min="minimumStake"
                    step="0.01"
                  />
                </div>

                <div class="form-group">
                  <label>Validator Address</label>
                  <input
                    type="text"
                    :value="network.validator"
                    placeholder="Enter validator address"
                  />
                </div>

                <button @click="delegateStake" :disabled="!isValidStake" class="stake-button">
                  Delegate Stake
                </button>
              </div>

              <div class="rewards-info" v-if="rewards">
                <h3>Staking Rewards</h3>
                <p>Epoch Rewards: {{ rewards.amount / LAMPORTS_PER_SOL }} SOL</p>
                <p>Epoch: {{ rewards.epoch }}</p>
              </div>

              <div class="stake-info" v-if="stakeAccountInfo">
                <h3>Stake Account Information</h3>
                <p>Balance: {{ stakeAccountInfo.balance }} SOL</p>
                <p>State: {{ stakeAccountInfo.state }}</p>
                <p>Active Stake: {{ stakeAccountInfo.active }} SOL</p>
                <p>Inactive Stake: {{ stakeAccountInfo.inactive }} SOL</p>
                <p v-if="stakeAccountInfo.delegatedVoteAccountAddress">
                  Delegated to: {{ stakeAccountInfo.delegatedVoteAccountAddress }}
                </p>

                <div v-if="stakeAccountInfo.state === 'activating'" class="activation-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{
                        width:
                          (stakeAccountInfo.active /
                            (stakeAccountInfo.active + stakeAccountInfo.inactive)) *
                            100 +
                          '%'
                      }"
                    ></div>
                  </div>
                  <p>
                    Activation Progress:
                    {{
                      (
                        (stakeAccountInfo.active /
                          (stakeAccountInfo.active + stakeAccountInfo.inactive)) *
                        100
                      ).toFixed(2)
                    }}%
                  </p>
                </div>
              </div>

              <div
                class="network-links"
                v-if="network.explorer || network.howToStake || !walletConnected"
              >
                <a
                  v-if="network.explorer"
                  :href="network.explorer[0]"
                  target="_blank"
                  class="explorer-link"
                  >View on Explorer</a
                >
                <a
                  v-if="network.howToStake"
                  :href="network.howToStake"
                  target="_blank"
                  class="stake-guide"
                  >How to Stake</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import {
  connectWallet,
  delegateStake,
  getStakeAccountInfo,
  getStakeRewards,
  createAndInitializeStakeAccount
} from '../utils/SolanaStaking'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export default {
  name: 'SolanaStaking',
  props: ['network'],
  emits: ['close'],
  setup(props, { emit }) {
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

    const closeModal = () => {
      emit('close')
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

    return {
      closeModal,
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
      transactionSignature
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
  z-index: 1000;
  cursor: pointer;
}

.solana-staking {
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

.headerTitle {
  font-family: generalSans;
  font-size: 52px;
  font-weight: 600;
  line-height: 40px;
  text-align: center;
  color: var(--van-text-color);
}

.btn-close {
  position: absolute;
  top: -20px;
  right: -20px;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: var(--van-text-color);
  padding: 5px;
}

.modal-content {
  width: 100%;
}

.network-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.network-image {
  text-align: center;
}

.network-image img {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.network-description {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.network-description p {
  font-size: 16px;
  line-height: 1.6;
  color: var(--van-text-color);
}

.network-details {
  text-align: center;
  width: 100%;
}

.network-details h3 {
  color: var(--van-text-color);
  font-size: 18px;
  margin-bottom: 12px;
}

.network-details p {
  word-break: break-all;
  color: var(--van-text-color);
  font-size: 14px;
  background: rgba(0, 0, 0, 0.1);
  padding: 12px;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.network-links {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.explorer-link,
.stake-guide {
  padding: 12px 24px;
  background-color: var(--van-primary-color);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.explorer-link:hover,
.stake-guide:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.staking-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: var(--van-text-color);
}

.connect-wallet {
  background-color: var(--van-primary-color);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}
.connect-wallet:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.wallet-info {
  text-align: left;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transaction-link {
  font-size: 14px;
}

.transaction-link a {
  color: var(--van-primary-color);
  text-decoration: none;
  font-weight: 500;
}

.transaction-link a:hover {
  text-decoration: underline;
}

.staking-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 50%;
}

.form-group {
  width: 100%;
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--van-text-color);
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--van-border-color);
  border-radius: 4px;
  background-color: var(--van-background);
  color: var(--van-text-color);
  border: 1px solid green;
}

.form-group input:focus {
  outline: none;
  border-color: var(--van-primary-color);
}

.stake-button {
  background-color: var(--van-primary-color);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  transition: all 0.3s ease;
}

.stake-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.stake-button:disabled {
  background-color: var(--van-gray-5);
  cursor: not-allowed;
  opacity: 0.7;
}

.stake-info,
.rewards-info {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--van-background);
  border-radius: 4px;
  border: 1px solid var(--van-border-color);
}
</style>
