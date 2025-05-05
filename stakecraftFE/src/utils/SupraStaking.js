export const getProvider = () => {
  if ('starkey' in window) {
    const provider = window.starkey?.supra

    if (provider) {
      return provider
    }
  }
}

export const walletConnect = async () => {
  const provider = getProvider()
  console.log('provider :: ', provider)
  
  const accounts = await provider.connect()
  console.log('accounts :: ', accounts)
  
  return accounts[0]
}

export const delegateTokens = async (walletAddress, validatorAddress, amount) => {
  const transaction = {
    data: '',
    from: walletAddress,
    to: validatorAddress,
    value: amount
  }

  const txHash = await provider.sendTransaction(transaction)
  console.log('txHash :: ', txHash)
  return txHash
}
