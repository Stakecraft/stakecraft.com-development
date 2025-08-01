import { HexString, BCS, SupraClient } from 'supra-l1-sdk'

export const getProvider = () => {
  if ('starkey' in window) {
    const provider = window.starkey?.supra
    if (provider) {
      provider.changeNetwork({ chainId: 8 })
      return provider
    }
  }
  throw new Error('Supra provider not found. Please install the Starkey wallet extension.')
}

export const walletConnect = async () => {
  try {
    const provider = getProvider()
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

// Get SUPRA balance for a wallet address
export const getSupraBalance = async (walletAddress) => {
  try {
    const provider = getProvider()
    let supraClient = await SupraClient.init('https://rpc-mainnet.supra.com/')
    const balance = await supraClient.getAccountSupraCoinBalance(walletAddress)
    console.log('balance', balance)
    // Convert from smallest unit to SUPRA
    return Number(balance) / 10 ** 8
  } catch (error) {
    console.error('Error getting SUPRA balance:', error)
    throw new Error(`Failed to get SUPRA balance: ${error.message}`)
  }
  // return 100
}

export const getTotalStakedAmount = async (walletAddress, validatorAddress) => {
  try {
    const provider = getProvider()

    let supraClient = await SupraClient.init('https://rpc-mainnet.supra.com/')
    console.log('supraClient', supraClient)

    const viewResult = await supraClient.invokeViewMethod(
      '0x1::pbo_delegation_pool::get_stake',
      [],
      [validatorAddress, walletAddress]
    )
    return viewResult
  } catch (error) {
    console.error('Error getting total staked amount:', error)
    throw new Error(`Failed to get total staked amount: ${error.message}`)
  }
}

export const delegateTokens = async (walletAddress, validatorAddress, amount) => {
  try {
    const provider = getProvider()
    const txExpiryTime = Math.ceil(Date.now() / 1000) + 30
    const optionalTransactionPayloadArgs = {
      txExpiryTime
    }
    const value = amount * 10 ** 8

    const rawTxPayload = [
      walletAddress,
      0,
      '0x1', //module address
      'pbo_delegation_pool',
      'add_stake',
      [],
      [new HexString(validatorAddress).toUint8Array(), BCS.bcsSerializeUint64(value)],
      optionalTransactionPayloadArgs
    ]

    const data = await provider.createRawTransactionData(rawTxPayload)
    const params = {
      data: data,
      from: walletAddress,
      to: validatorAddress,
      chainId: 8
    }
    const txHash = await provider.sendTransaction(params)
    return txHash
  } catch (error) {
    console.error('Delegation error:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}

export const undelegateTokens = async (walletAddress, validatorAddress, unstakeAmount) => {
  try {
    const provider = getProvider()
    const value = unstakeAmount * 10 ** 8
    const raw = [
      walletAddress,
      0,
      '0x1',
      'pbo_delegation_pool',
      'unlock',
      [],
      [new HexString(validatorAddress).toUint8Array(), BCS.bcsSerializeUint64(value)],
      { txExpiryTime: Math.floor(Date.now() / 1000) + 120 }
    ]

    const data = await provider.createRawTransactionData(raw)
    const params = {
      data,
      from: walletAddress,
      to: '0x1',
      chainId: 8
    }
    const txHash = await provider.sendTransaction(params)
    return txHash
  } catch (error) {
    console.error('Error undelegating tokens:', error)
    throw new Error(`Failed to undelegate tokens: ${error.message}`)
  }
}

// Withdraw function (run after the lock cycle clears)
export const withdrawStake = async (walletAddress, validatorAddress, amount) => {
  try {
    const provider = getProvider()
    const value = amount * 10 ** 8
    const seq = (await provider.accountInfo(walletAddress)).sequence_number

    const raw = [
      walletAddress,
      seq,
      '0x1',
      'pbo_delegation_pool',
      'withdraw',
      [],
      [new HexString(validatorAddress).toUint8Array(), BCS.bcsSerializeUint64(value)],
      { txExpiryTime: Math.floor(Date.now() / 1000) + 120 }
    ]

    const data = await provider.createRawTransactionData(raw)
    const params = {
      data,
      from: walletAddress,
      to: '0x1',
      chainId: 8
    }
    const txHash = await provider.sendTransaction(params)
    return txHash
  } catch (error) {
    console.error('Error withdrawing stake:', error)
    throw new Error(`Failed to withdraw stake: ${error.message}`)
  }
}
