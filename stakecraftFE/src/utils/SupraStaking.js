// Provider utility functions
export const getProvider = () => {
  if ('starkey' in window) {
    const provider = window.starkey?.supra

    if (provider) {
      provider.currentNetwork = 'mainNet'
      return provider
    }
  }
  throw new Error('Supra provider not found. Please install the Starkey wallet extension.')
}

export const walletConnect = async () => {
  try {
    const provider = getProvider()
    console.log('Provider initialized:', provider)
    const accounts = await provider.connect()
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from wallet')
    }
    const address = accounts[0]
    return address
  } catch (error) {
    console.error('Wallet connection error:', error)
    return {
      address: null,
      status: 'error',
      error: error.message || 'Failed to connect wallet'
    }
  }
}

export const delegateTokens = async (walletAddress, validatorAddress, amount) => {
  try {
    const provider = getProvider()
    console.log('---------------------------------Provider initialized:', provider)

    const tx = {
      data: '0x',
      fromAddress: walletAddress,
      toAddress: validatorAddress,
      amount: amount
    }

    const txHash = await provider.sendAutomationTransaction(tx)

    txStatus.txHash = txHash
    console.log('Transaction sent:', txHash)

    return txHash
  } catch (error) {
    console.error('Delegation error:', error)
    return {
      success: false,
      error: error.message || 'Failed to delegate tokens. Please try again.',
      status: 'error'
    }
  }
}
