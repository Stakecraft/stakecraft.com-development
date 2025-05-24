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

// export const getTotalStakedAmount = async (walletAddress, validatorAddress) => {
//   try {
//     const provider = getProvider()

//     const [active, inactive, pending] = await provider.invokeViewMethod(
//       '0x1::pbo_delegation_pool::get_stake',
//       [],
//       [validatorAddress, walletAddress]
//     )
//     return { active: BigInt(active), inactive: BigInt(inactive), pending: BigInt(pending) }
//   } catch (error) {
//     console.error('Error getting total staked amount:', error)
//     throw new Error(`Failed to get total staked amount: ${error.message}`)
//   }
// }

export const getTotalStakedAmount = async (walletAddress, validatorAddress) => {
  const provider = getProvider();           // your helper from supra-l1-sdk
  const [activeQ, inactiveQ, pendingQ] =
    await provider.invokeViewMethod(
      "0x1::pbo_delegation_pool::get_stake",  // full function name
      [],                                     // no type-args
      [validatorAddress, walletAddress]                  // function args
    );                                        // ➜ [string, string, string]

  // Convert strings → bigint, then → SUPRA
  const Q = (n) => BigInt(n);
  const SUPRA = (q) => Number(q) / 1e8;

  const active   = Q(activeQ);
  const inactive = Q(inactiveQ);
  const pending  = Q(pendingQ);
  const totalQ   = active + inactive + pending;

  console.log('active', active)
  console.log('inactive', inactive)
  console.log('pending', pending)
  console.log('totalQ', totalQ)
  console.log('totalSupra', SUPRA(totalQ))
  // return {
  //   activeQ:   active,
  //   inactiveQ: inactive,
  //   pendingQ:  pending,
  //   totalQ,
  //   totalSupra: SUPRA(totalQ)       // human-readable
  // };
  return { amount: 1 }
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
      'supra_account',
      'transfer',
      [],
      [new HexString(validatorAddress).toUint8Array(), BCS.bcsSerializeUint64(value)],
      optionalTransactionPayloadArgs
    ]

    const data = await provider.createRawTransactionData(rawTxPayload)
    const params = {
      data: data,
      from: walletAddress,
      to: validatorAddress,
      chainId: 8,
    }
    const txHash = await provider.sendTransaction(params)
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

export const undelegateTokens = async (walletAddress, validatorAddress, amount) => {
  const provider = getProvider()

  // const seq = (await provider.accountInfo(walletAddress)).sequence_number
  const value = amount * 10 ** 8
  const raw = [
    walletAddress,
    0,
    '0x1',
    'pbo_delegation_pool',
    'unlock',
    [],
    [new HexString(validatorAddress).toUint8Array(), BCS.bcsSerializeUint64(value)], //pool address
    { txExpiryTime: Math.floor(Date.now() / 1000) + 120 }
  ]

  const data = await provider.createRawTransactionData(raw)
  console.log('data', data)
  const params = {
    data,
    from: walletAddress,
    to: '0x1',
    chainId: 8,
  }
  console.log('params', params)   
  const txHash = await provider.sendTransaction(params)
  console.log('txHash', txHash)
  return txHash
}

// 4. Withdraw (run **after** the next lock cycle clears)
export const withdrawStake = async (wallet, poolAddr, supra) => {
  const provider = getProvider()
  const amountQ = BigInt(supra) * QUANTS
  const seq = (await provider.accountInfo(wallet)).sequence_number

  const raw = [
    wallet,
    seq,
    '0x1',
    'pbo_delegation_pool',
    'withdraw',
    [],
    [new HexString(poolAddr).toUint8Array(), BCS.bcsSerializeUint64(amountQ)],
    { txExpiryTime: Math.floor(Date.now() / 1000) + 120 }
  ]

  const data = await provider.createRawTransactionData(raw)
  return provider.sendTransaction({ data, from: wallet, to: '0x1', chainId: CHAIN_ID })
}
