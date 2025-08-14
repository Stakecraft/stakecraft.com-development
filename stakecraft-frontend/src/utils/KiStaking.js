import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const KI_CHAIN_ID = 'kichain-2'

const RPC_ENDPOINTS = [
  'https://rpc-mainnet.kichain.net',
  'https://rpc-kichain.blockapsis.com',
  'https://kichain-rpc.polkachu.com'
]

// Connect wallet
export const connectWallet = async () => {
  if (!window.keplr) {
    throw new Error('Please install Keplr extension')
  }
  await window.keplr.enable(KI_CHAIN_ID)
  const offlineSigner = window.getOfflineSigner(KI_CHAIN_ID)
  const accounts = await offlineSigner.getAccounts()
  return accounts[0].address
}

// Helper function to try different RPC endpoints
const tryRpcEndpoints = async (offlineSigner) => {
  let lastError = null
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const client = await SigningStargateClient.connectWithSigner(endpoint, offlineSigner, {
        gasPrice: GasPrice.fromString('0.025uxki')
      })
      return client
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error)
      lastError = error
    }
  }
  throw new Error(`Failed to connect to any RPC endpoint. Last error: ${lastError?.message}`)
}

export const getTotalStakedAmount = async (delegatorAddress, validatorAddress) => {
  try {
    await window.keplr.enable(KI_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KI_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    console.log('client', client)
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
    await window.keplr.enable(KI_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KI_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    console.log('client', client)
    const result = await client.delegateTokens(
      delegatorAddress,
      validatorAddress,
      {
        denom: 'uxki',
        amount: (amount * 1_000_000).toString()
      },
      'auto',
      'Delegate XKI tokens'
    )
    return result.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}

export const undelegateStake = async (delegatorAddress, validatorAddress) => {
  try {
    await window.keplr.enable(KI_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KI_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)

    const delegation = await client.getDelegation(delegatorAddress, validatorAddress)
    console.log('delegation', delegation)
    
    if (!delegation) {
      throw new Error('No delegation found')
    }

    // Get the delegation amount from the correct path in the object
    const delegationAmount = delegation?.amount
    console.log('delegationAmount', delegationAmount)

    if (!delegationAmount) {
      throw new Error('Could not find delegation amount')
    }

    // Format the amount properly for undelegation
    const amount = {
      denom: 'uxki',
      amount: delegationAmount.toString()
    }
    console.log('formatted amount', amount)

    const result = await client.undelegateTokens(
      delegatorAddress,
      validatorAddress,
      amount,
      'auto',
      'Undelegate XKI tokens'
    )
    console.log('result', result)
    return result.transactionHash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw new Error(`Failed to undelegate stake: ${error.message}`)
  }
} 