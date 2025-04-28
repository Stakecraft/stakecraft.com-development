import { ref, onMounted } from 'vue'
import { connect, WalletConnection, Contract } from 'near-api-js'

// NEAR contract configuration
const NEAR_CONFIG = {
  networkId: 'mainnet', // or 'testnet' for testing
  nodeUrl: 'https://rpc.mainnet.near.org',
  walletUrl: 'https://wallet.near.org',
  helperUrl: 'https://helper.mainnet.near.org',
  explorerUrl: 'https://explorer.mainnet.near.org',
}

// Staking contract address
const STAKING_CONTRACT = 'staking.poolv1.near' // Replace with actual staking contract

export function useNearStaking() {
  const isConnected = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const nearBalance = ref(0)
  const stakedAmount = ref(0)
  const rewards = ref(0)
  const stakeAmount = ref('')
  const wallet = ref(null)
  const account = ref(null)
  const stakingContract = ref(null)

  const formatBalance = (balance) => {
    return (balance / 1e24).toFixed(4) // NEAR has 24 decimals
  }

  const connectNear = async () => {
    try {
      // Initialize connection to NEAR
      const near = await connect(NEAR_CONFIG)
      wallet.value = new WalletConnection(near, 'stakecraft')
      
      // Request sign in
      if (!wallet.value.isSignedIn()) {
        await wallet.value.requestSignIn()
      }
      
      // Get account
      account.value = wallet.value.account()
      
      // Initialize staking contract
      stakingContract.value = new Contract(account.value, STAKING_CONTRACT, {
        viewMethods: ['get_account_staked_balance', 'get_account_unstaked_balance', 'get_account_total_balance'],
        changeMethods: ['stake', 'unstake', 'withdraw'],
      })
      
      isConnected.value = true
      await updateBalances()
    } catch (err) {
      error.value = 'Failed to connect NEAR wallet: ' + err.message
    }
  }

  const updateBalances = async () => {
    try {
      // Get account balance
      const balance = await account.value.getAccountBalance()
      nearBalance.value = balance.available
      
      // Get staked balance
      const staked = await stakingContract.value.get_account_staked_balance({
        account_id: account.value.accountId
      })
      stakedAmount.value = staked
      
      // Get unstaked balance (rewards)
      const unstaked = await stakingContract.value.get_account_unstaked_balance({
        account_id: account.value.accountId
      })
      rewards.value = unstaked
    } catch (err) {
      error.value = 'Failed to update balances: ' + err.message
    }
  }

  const stake = async () => {
    try {
      loading.value = true
      error.value = null

      const amount = (parseFloat(stakeAmount.value) * 1e24).toString() // Convert to yoctoNEAR
      
      // Stake tokens
      await stakingContract.value.stake({
        amount: amount
      })

      await updateBalances()
      stakeAmount.value = ''
    } catch (err) {
      error.value = 'Failed to stake: ' + err.message
    } finally {
      loading.value = false
    }
  }

  const unstake = async () => {
    try {
      loading.value = true
      error.value = null

      // Unstake all tokens
      await stakingContract.value.unstake({
        amount: stakedAmount.value.toString()
      })

      await updateBalances()
    } catch (err) {
      error.value = 'Failed to unstake: ' + err.message
    } finally {
      loading.value = false
    }
  }

  const claimRewards = async () => {
    try {
      loading.value = true
      error.value = null

      // Withdraw unstaked tokens (rewards)
      await stakingContract.value.withdraw({
        amount: rewards.value.toString()
      })

      await updateBalances()
    } catch (err) {
      error.value = 'Failed to claim rewards: ' + err.message
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    // Check if already connected
    if (window.near) {
      connectNear()
    }
  })

  return {
    isConnected,
    loading,
    error,
    nearBalance,
    stakedAmount,
    rewards,
    stakeAmount,
    connectNear,
    stake,
    unstake,
    claimRewards,
    formatBalance
  }
} 