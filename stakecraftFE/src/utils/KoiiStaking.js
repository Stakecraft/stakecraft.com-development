// Koii staking utilities

// Connect wallet
export const connectWallet = async () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called in a browser environment')
    }

    // Wait for the window object to be fully loaded
    if (document.readyState !== 'complete') {
      await new Promise((resolve) => window.addEventListener('load', resolve))
    }

    // Wait for Finnie to be available
    let attempts = 0
    const maxAttempts = 10
    const checkInterval = 1000 // 1 second

    while (!window.finnie && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, checkInterval))
      attempts++
    }

    // Check if Finnie is available
    if (!window.finnie) {
      console.log('keplr', window.keplr)
      console.log('finnie', window.finnie)
      console.warn(
        'Finnie wallet not found. Make sure you have the extension installed and enabled.'
      )
      const error = new Error(
        'Finnie wallet is not installed or not properly initialized. Please make sure the extension is installed and enabled.'
      )
      error.code = 'WALLET_NOT_INSTALLED'
      throw error
    }

    // Try to connect to the wallet
    const accounts = await window.finnie.requestAccounts()
    if (!accounts || !accounts[0]) {
      throw new Error('No accounts found. Please make sure you have an account in Finnie wallet.')
    }
    return accounts[0]
  } catch (error) {
    console.error('Error connecting wallet:', error)
    if (error.code === 'WALLET_NOT_INSTALLED') {
      throw error
    }
    throw new Error(`Failed to connect wallet: ${error.message}`)
  }
}

// Stake KOII tokens
export const delegateTokens = async (walletAddress, validatorAddress, amount) => {
  try {
    if (!walletAddress || !validatorAddress || !amount) {
      throw new Error('Missing required parameters')
    }

    if (amount < 0.2) {
      throw new Error('Minimum stake amount is 0.2 KOII')
    }

    // Create staking transaction
    const transaction = {
      from: walletAddress,
      to: validatorAddress,
      value: amount,
      data: '0x' // Empty data for basic transfer
    }

    // Sign and send transaction
    const result = await window.finnie.sendTransaction(transaction)
    if (!result || !result.transactionHash) {
      throw new Error('Failed to send transaction')
    }

    return result.transactionHash
  } catch (error) {
    console.error('Error staking tokens:', error)
    throw new Error(`Failed to stake tokens: ${error.message}`)
  }
}

// Get staking information
export const getStakingInfo = async (address) => {
  try {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    // Mock data for now - replace with actual API calls
    return {
      stakedAmount: 0,
      rewardsEarned: 0,
      attentionScore: 0,
      lastRewardTime: null
    }
  } catch (error) {
    console.error('Error getting staking info:', error)
    throw new Error(`Failed to get staking information: ${error.message}`)
  }
}

// Get available balance
export const getBalance = async (address) => {
  try {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    // Mock data for now - replace with actual API calls
    return 0
  } catch (error) {
    console.error('Error getting balance:', error)
    throw new Error(`Failed to get balance: ${error.message}`)
  }
}
