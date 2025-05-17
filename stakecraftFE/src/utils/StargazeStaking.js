import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const STARGAZE_CHAIN_ID = 'stargaze-1' // Stargaze mainnet chain ID

const RPC_ENDPOINTS = [
  'https://stargaze-rpc.polkachu.com',
  'https://rpc.stargaze-apis.com',
  'https://rpc.stargaze.publicawesome.dev'
]

// Connect wallet
export const connectWallet = async () => {
  if (!window.keplr) {
    throw new Error('Please install Keplr extension')
  }
  await window.keplr.enable(STARGAZE_CHAIN_ID)
  const offlineSigner = window.getOfflineSigner(STARGAZE_CHAIN_ID)
  const accounts = await offlineSigner.getAccounts()
  return accounts[0].address
}

// Helper function to try different RPC endpoints
const tryRpcEndpoints = async (offlineSigner) => {
  let lastError = null
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const client = await SigningStargateClient.connectWithSigner(
        endpoint,
        offlineSigner,
        { 
          gasPrice: GasPrice.fromString('0.025ustars'),
          timeout: 10000
        }
      )
      return client
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error)
      lastError = error
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  throw new Error(`Failed to connect to any RPC endpoint. Last error: ${lastError?.message}`)
}

// Get total staked amount
export const getTotalStakedAmount = async (delegatorAddress, validatorAddress) => {
  try {
    await window.keplr.enable(STARGAZE_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(STARGAZE_CHAIN_ID)
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
    await window.keplr.enable(STARGAZE_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(STARGAZE_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)

    const msg = {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      value: {
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: {
          denom: 'ustars',
          amount: String(amount * 1_000_000) // Convert to micro-STARS
        }
      }
    }

    const result = await client.signAndBroadcast(delegatorAddress, [msg], {
      amount: [{ denom: 'ustars', amount: String(amount * 1_000_000) }],
      gas: '300000'
    })

    return result.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}

export const undelegateStake = async (delegatorAddress, validatorAddress) => {
  try {
    await window.keplr.enable(STARGAZE_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(STARGAZE_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)

    const delegation = await client.getDelegation(delegatorAddress, validatorAddress)
    console.log('delegation', delegation)
    
    if (!delegation) {
      throw new Error('No delegation found')
    }

    // Get the delegation amount
    const delegationAmount = delegation?.amount
    console.log('delegationAmount', delegationAmount)

    if (!delegationAmount) {
      throw new Error('Could not find delegation amount')
    }

    // Format the amount properly for undelegation
    const amount = {
      denom: 'ustars',
      amount: delegationAmount.toString()
    }
    console.log('formatted amount', amount)

    const result = await client.undelegateTokens(
      delegatorAddress,
      validatorAddress,
      amount,
      'auto',
      'Undelegate STARS tokens'
    )
    console.log('result', result)
    return result.transactionHash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw new Error(`Failed to undelegate stake: ${error.message}`)
  }
}
