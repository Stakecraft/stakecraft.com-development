<template>
  <div class="near-staking">
    <h3>NEAR Staking</h3>
    
    <div v-if="!isConnected" class="connect-wallet">
      <button @click="connectNear" class="connect-btn">Connect NEAR Wallet</button>
    </div>

    <div v-else class="staking-interface">
      <div class="stake-info">
        <div class="balance">
          <span>Your NEAR Balance:</span>
          <span>{{ formatBalance(nearBalance) }} NEAR</span>
        </div>
        <div class="staked">
          <span>Currently Staked:</span>
          <span>{{ formatBalance(stakedAmount) }} NEAR</span>
        </div>
        <div class="rewards">
          <span>Available Rewards:</span>
          <span>{{ formatBalance(rewards) }} NEAR</span>
        </div>
      </div>

      <div class="stake-form">
        <div class="input-group">
          <input 
            v-model="stakeAmount" 
            type="number" 
            placeholder="Amount to stake"
            :disabled="loading"
          />
          <button 
            @click="stake" 
            :disabled="loading || !stakeAmount"
            class="stake-btn"
          >
            {{ loading ? 'Processing...' : 'Stake' }}
          </button>
        </div>

        <div class="unstake-section">
          <button 
            @click="unstake" 
            :disabled="loading || stakedAmount <= 0"
            class="unstake-btn"
          >
            Unstake All
          </button>
          <button 
            @click="claimRewards" 
            :disabled="loading || rewards <= 0"
            class="claim-btn"
          >
            Claim Rewards
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { useNearStaking } from './nearStaking'

export default {
  name: 'NearStaking',
  setup() {
    return useNearStaking()
  }
}
</script>

<style scoped>
.near-staking {
  padding: 20px;
  background: var(--van-background-2);
  border-radius: 12px;
  margin: 20px 0;
}

.connect-wallet {
  text-align: center;
  padding: 20px;
}

.connect-btn {
  padding: 10px 20px;
  background: var(--van-primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.staking-interface {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stake-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 15px;
  background: var(--van-background);
  border-radius: 8px;
}

.stake-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  gap: 10px;
}

.input-group input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--van-border-color);
  border-radius: 8px;
  background: var(--van-background);
  color: var(--van-text-color);
}

.stake-btn, .unstake-btn, .claim-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.stake-btn {
  background: var(--van-primary-color);
  color: white;
}

.unstake-btn {
  background: var(--van-warning-color);
  color: white;
}

.claim-btn {
  background: var(--van-success-color);
  color: white;
}

.error-message {
  color: var(--van-danger-color);
  text-align: center;
  margin-top: 10px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 