import { HexString, TxnBuilderTypes, BCS } from 'supra-l1-sdk'

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
    console.log('StarKey Wallet:', starKeyWallet)
    console.log('---------------------------------Provider initialized:', provider)

    const txExpiryTime = Math.ceil(Date.now() / 1000) + 30
    const optionalTransactionPayloadArgs = {
      txExpiryTime
    }

    const rawTxPayload = [
      walletAddress,
      0,
      '0000000000000000000000000000000000000000000000000000000000000001',
      'supra_account',
      'transfer',
      [],
      [new HexString(validatorAddress).toUint8Array(), BCS.bcsSerializeUint64(100000000)],
      optionalTransactionPayloadArgs
    ]

    const data = await provider.createRawTransactionData(rawTxPayload)
    console.log('data :: ', data)

    const params = {
      data: data,
      from: walletAddress,
      to: validatorAddress,
      chainId: 8,
      value: amount * 10 ** 8
    }
    const txHash = await provider.sendTransaction(params)
    console.log('txHash :: ', txHash)
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
