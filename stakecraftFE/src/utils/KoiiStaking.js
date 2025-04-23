// Koii staking utilities
import { KoiiSDK } from '@koii-network/sdk'

// Initialize Koii SDK
const koii = new KoiiSDK({
  network: 'mainnet' // or 'testnet' for testing
})

// Connect wallet
export const connectWallet = async () => {
  try {
    const wallet = await koii.connectWallet()
    return wallet.address
  } catch (error) {
    console.error('Error connecting wallet:', error)
    throw error
  }
}

// Stake KOII tokens
export const delegateTokens = async (walletAddress, validatorAddress, amount) => {
  try {
    // Create staking transaction
    const transaction = await koii.createStakeTransaction({
      from: walletAddress,
      to: validatorAddress,
      amount: amount,
      type: 'stake'
    })

    // Sign and send transaction
    const result = await koii.signAndSendTransaction(transaction)
    return result.transactionId
  } catch (error) {
    console.error('Error staking tokens:', error)
    throw error
  }
}

// Get staking information
export const getStakingInfo = async (address) => {
  try {
    const info = await koii.getStakingInfo(address)
    return {
      stakedAmount: info.stakedAmount || 0,
      rewardsEarned: info.rewardsEarned || 0,
      attentionScore: info.attentionScore || 0,
      lastRewardTime: info.lastRewardTime || null
    }
  } catch (error) {
    console.error('Error getting staking info:', error)
    throw error
  }
}

// Get available balance
export const getBalance = async (address) => {
  try {
    const balance = await koii.getBalance(address)
    return balance
  } catch (error) {
    console.error('Error getting balance:', error)
    throw error
  }
} 