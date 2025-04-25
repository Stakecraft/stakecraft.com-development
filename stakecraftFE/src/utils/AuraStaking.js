import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const AURA_CHAIN_ID = 'aura_6322-2'

const RPC_ENDPOINTS = [
  'https://rpc-aura-ia.cosmosia.notional.ventures',
  'https://rpc.aura.network',
  'https://rpc.aura.nodestake.top'
]

// Connect wallet
export const connectWallet = async () => {
  if (!window.keplr) {
    throw new Error('Please install Keplr extension')
  }
  await window.keplr.enable(AURA_CHAIN_ID)
  const offlineSigner = window.getOfflineSigner(AURA_CHAIN_ID)
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
          gasPrice: GasPrice.fromString('0.0025uaura'),
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

// Delegate tokens
export const delegateTokens = async (delegatorAddress, validatorAddress, amount) => {
  try {
    await window.keplr.enable(AURA_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(AURA_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)

    const msg = {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      value: {
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: {
          denom: 'uaura',
          amount: String(amount * 1_000_000)
        }
      }
    }

    const result = await client.signAndBroadcast(delegatorAddress, [msg], {
      amount: [{ denom: 'uaura', amount: String(amount * 1_000_000) }],
      gas: '200000'
    })

    return result.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}

// Get staking information
export const getStakingInfo = async (address) => {
  try {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    return {
      stakedAmount: 0,
      rewardsEarned: 0,
      lastRewardTime: null
    }
  } catch (error) {
    console.error('Error getting staking info:', error)
    throw new Error(`Failed to get staking information: ${error.message}`)
  }
} 