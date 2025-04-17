<template>
  <div class="solana-staking">
    <div class="staking-header">
      <h2>Solana Staking</h2>
      <button @click="connectWallet" v-if="!walletConnected">Connect Wallet</button>
      <div class="wallet-info" v-if="walletConnected">
        <p>Connected: {{ walletAddress }}</p>
      </div>
    </div>

    <div class="staking-form" v-if="walletConnected">
      <div class="form-group">
        <label>Amount to Stake (SOL)</label>

        <input type="number" v-model="stakeAmount" :min="minimumStake" step="0.1" />
      </div>

      <div class="form-group">
        <label>Validator Address</label>
        <input type="text" val v-model="validatorAddress" placeholder="Enter validator address" />
      </div>

      <button @click="delegateStake" :disabled="!isValidStake" class="stake-button">
        Delegate Stake
      </button>
    </div>

    <div class="stake-info" v-if="stakeAccountInfo">
      <h3>Stake Account Information</h3>
      <p>Balance: {{ stakeAccountInfo.lamports / LAMPORTS_PER_SOL }} SOL</p>
      <p>Status: {{ stakeAccountInfo.state }}</p>
    </div>

    <div class="rewards-info" v-if="rewards">
      <h3>Staking Rewards</h3>
      <p>Epoch Rewards: {{ rewards.amount / LAMPORTS_PER_SOL }} SOL</p>
      <p>Epoch: {{ rewards.epoch }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import {
  connectWallet,
  delegateStake,
  getStakeAccountInfo,
  getStakeRewards
} from '../utils/SolanaStaking'
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
    const minimumStake = 1 // Minimum 1 SOL to stake

    const network = ref(null)
    watch(
      () => props.network,
      (newValue) => {
        network.value = newValue.selectedNetwork
      }
    )
    const close = () => {
      context.emit('close')
    }
    const isValidStake = computed(() => {
      return stakeAmount.value >= minimumStake && validatorAddress.value.length > 0
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
      try {
        const signature = await delegateStake(
          walletAddress.value,
          validatorAddress.value,
          stakeAmount.value * LAMPORTS_PER_SOL
        )
        console.log('Stake delegated successfully:', signature)

        stakeAccountInfo.value = await getStakeAccountInfo(walletAddress.value)
        rewards.value = await getStakeRewards(walletAddress.value)
      } catch (error) {
        console.error('Failed to delegate stake:', error)
      }
    }

    return {
      close,
      network,
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
      LAMPORTS_PER_SOL
    }
  }
}
</script>

<style scoped>
.solana-staking {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 600px;
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--van-background-2);
  border-radius: 10px;
  border: 1px solid var(--van-border-color);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.staking-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.wallet-info {
  text-align: left;
  margin-top: 10px;
}

.form-group {
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
  transition: background-color 0.2s;
}

.stake-button:disabled {
  background-color: var(--van-gray-5);
  cursor: not-allowed;
}

.stake-info,
.rewards-info {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--van-background);
  border-radius: 4px;
  border: 1px solid var(--van-border-color);
}

/* Add overlay background */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
</style>
