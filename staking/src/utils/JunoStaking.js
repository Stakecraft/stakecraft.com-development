import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const JUNO_CHAIN_ID = 'juno-1'

const RPC_ENDPOINTS = [
  'https://rpc-juno.itastakers.com',
  'https://juno-rpc.polkachu.com'
]

// Connect wallet
export const connectWallet = async () => {
  if (!window.keplr) {
    throw new Error('Please install Keplr extension')
  }
  await window.keplr.enable(JUNO_CHAIN_ID)
  const offlineSigner = window.getOfflineSigner(JUNO_CHAIN_ID)
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
          gasPrice: GasPrice.fromString('0.0025ujuno'),
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

// Get JUNO balance for a wallet address
export const getJunoBalance = async (walletAddress) => {
  try {
    await window.keplr.enable(JUNO_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(JUNO_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    const balances = await client.getAllBalances(walletAddress)
    // Find the JUNO balance (denom: 'ujuno')
    const junoBalance = balances.find(b => b.denom === 'ujuno')
    // Convert from micro-JUNO to JUNO
    return junoBalance ? Number(junoBalance.amount) / 1_000_000 : 0
  } catch (error) {
    console.error('Error getting JUNO balance:', error)
    throw new Error(`Failed to get JUNO balance: ${error.message}`)
  }
}

// Get total staked amount
export const getTotalStakedAmount = async (delegatorAddress, validatorAddress) => {
  try {
    await window.keplr.enable(JUNO_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(JUNO_CHAIN_ID)
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
    await window.keplr.enable(JUNO_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(JUNO_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)

    const msg = {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      value: {
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: {
          denom: 'ujuno',
          amount: String(amount * 1_000_000)
        }
      }
    }

    const result = await client.signAndBroadcast(delegatorAddress, [msg], {
      amount: [{ denom: 'ujuno', amount: String(amount * 1_000_000) }],
      gas: '300000'
    })

    return result.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}

export const undelegateStake = async (delegatorAddress, validatorAddress, unstakeAmount) => {
  try {
    await window.keplr.enable(JUNO_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(JUNO_CHAIN_ID)
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
      denom: 'ujuno',
      amount: (unstakeAmount * 1_000_000).toString()
    }
    console.log('formatted amount', amount)

    const result = await client.undelegateTokens(
      delegatorAddress,
      validatorAddress,
      amount,
      'auto',
      'Undelegate JUNO tokens'
    )
    console.log('result', result)
    return result.transactionHash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw new Error(`Failed to undelegate stake: ${error.message}`)
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