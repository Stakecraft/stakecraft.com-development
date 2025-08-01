import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const BAND_CHAIN_ID = 'laozi-mainnet'

const RPC_ENDPOINTS = [
  'http://rpc.laozi1.bandchain.org',
  'https://rpc-bandchain.cosmostation.io',
  'https://band-protocol-rpc.publicnode.com'
]

// Connect wallet
export const connectWallet = async () => {
  if (!window.keplr) {
    throw new Error('Please install Keplr extension')
  }
  await window.keplr.enable(BAND_CHAIN_ID)
  const offlineSigner = window.getOfflineSigner(BAND_CHAIN_ID)
  const accounts = await offlineSigner.getAccounts()
  return accounts[0].address
}

// Helper function to try different RPC endpoints
const tryRpcEndpoints = async (offlineSigner) => {
  let lastError = null
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const client = await SigningStargateClient.connectWithSigner(endpoint, offlineSigner, {
        gasPrice: GasPrice.fromString('0.0025uband'),
        timeout: 10000
      })
      return client
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error)
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  throw new Error(`Failed to connect to any RPC endpoint. Last error: ${lastError?.message}`)
}

// Get BAND balance for a wallet address
export const getBandBalance = async (walletAddress) => {
  try {
    await window.keplr.enable(BAND_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(BAND_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    const balances = await client.getAllBalances(walletAddress)
    // Find the BAND balance (denom: 'uband')
    const bandBalance = balances.find((b) => b.denom === 'uband')
    // Convert from micro-BAND to BAND
    return bandBalance ? Number(bandBalance.amount) / 1_000_000 : 0
  } catch (error) {
    console.error('Error getting BAND balance:', error)
    throw new Error(`Failed to get BAND balance: ${error.message}`)
  }
}

// Get total staked amount
export const getTotalStakedAmount = async (delegatorAddress, validatorAddress) => {
  try {
    await window.keplr.enable(BAND_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(BAND_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    const stakingInfo = await client.getDelegation(delegatorAddress, validatorAddress)
    return stakingInfo
  } catch (error) {
    console.error('Error getting total staked amount:', error)
    throw new Error(`Failed to get total staked amount: ${error.message}`)
  }
}

// Delegate tokens
export const delegateTokens = async (delegatorAddress, validatorAddress, amount) => {
  try {
    await window.keplr.enable(BAND_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(BAND_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)

    const msg = {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      value: {
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: {
          denom: 'uband',
          amount: String(amount * 1_000_000)
        }
      }
    }

    const result = await client.signAndBroadcast(delegatorAddress, [msg], {
      amount: [{ denom: 'uband', amount: String(amount * 1_000_000) }],
      gas: '200000',
      memo: 'Delegate BAND tokens'
    })

    return result.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}

export const undelegateStake = async (delegatorAddress, validatorAddress, unstakeAmount) => {
  try {
    await window.keplr.enable(BAND_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(BAND_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)

    const delegation = await client.getDelegation(delegatorAddress, validatorAddress)
    console.log('delegation', delegation)

    if (!delegation) {
      throw new Error('No delegation found')
    }

    if (!unstakeAmount) {
      throw new Error('Could not find delegation amount')
    }

    // Format the amount properly for undelegation
    const amount = {
      denom: 'uband',
      amount: (unstakeAmount * 1_000_000).toString()
    }
    console.log('formatted amount', amount)

    const result = await client.undelegateTokens(
      delegatorAddress,
      validatorAddress,
      amount,
      'auto',
      'Undelegate BAND tokens'
    )
    console.log('result', result)
    return result.transactionHash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw new Error(`Failed to undelegate stake: ${error.message}`)
  }
}
