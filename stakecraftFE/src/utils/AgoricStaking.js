import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const AGORIC_CHAIN_ID = 'agoric-3' // Mainnet chain ID

const RPC_ENDPOINTS = [
  'https://agoric-rpc.polkachu.com',
  'https://rpc.agoric.nodestake.top',
  'https://agoric-rpc.publicnode.com'
]

// Connect wallet
export const connectWallet = async () => {
  if (!window.keplr) {
    throw new Error('Please install Keplr extension')
  }
  await window.keplr.enable(AGORIC_CHAIN_ID)
  const offlineSigner = window.getOfflineSigner(AGORIC_CHAIN_ID)
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
        { gasPrice: GasPrice.fromString('0.025ubld') } // Agoric's native token
      )
      return client
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error)
      lastError = error
    }
  }
  throw new Error(`Failed to connect to any RPC endpoint. Last error: ${lastError?.message}`)
}

// Delegate tokens
export const delegateTokens = async (delegatorAddress, validatorAddress, amount) => {
  try {
    await window.keplr.enable(AGORIC_CHAIN_ID)
    // const offlineSigner = window.getOfflineSigner(AGORIC_CHAIN_ID)
    // const client = await tryRpcEndpoints(offlineSigner);
    // const result = await client.delegateTokens(
    //   delegatorAddress,
    //   validatorAddress,
    //   {
    //     denom: 'ubld',
    //     amount: (amount * 1_000_000).toString() // Convert to micro-BLD
    //   },
    //   'auto',
    //   'Delegate BLD tokens'
    // )
    // return result.transactionHash

    const msg = {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      value: {
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: {
          denom: 'ubld',
          amount: String(amount * 1_000_000)
        }
      }
    }

    const result = await client.signAndBroadcast(delegatorAddress, [msg], {
      amount: [{ denom: 'ubld', amount: String(amount * 1_000_000) }],
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

    // TODO: Implement actual API calls to get staking info
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

// Get available balance
export const getBalance = async (address) => {
  try {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    // TODO: Implement actual API calls to get balance
    return 0
  } catch (error) {
    console.error('Error getting balance:', error)
    throw new Error(`Failed to get balance: ${error.message}`)
  }
}
