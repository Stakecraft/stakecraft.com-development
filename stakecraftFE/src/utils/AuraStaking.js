import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const AURA_CHAIN_ID = 'xstaxy-1'

const RPC_ENDPOINTS = [
  'https://rpc.aura.network',
  'https://aura-rpc.polkachu.com',
  'https://m-aura.rpc.utsa.tech'
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
export const tryRpcEndpoints = async (offlineSigner) => {
  let lastError = null
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const client = await SigningStargateClient.connectWithSigner(endpoint, offlineSigner, {
        gasPrice: GasPrice.fromString('0.001uaura')
      })
      return client
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error)
      lastError = error
    }
  }
  throw new Error(`Failed to connect to any RPC endpoint. Last error: ${lastError?.message}`)
}

// Get AURA balance for a wallet address
export const getAuraBalance = async (walletAddress) => {
  try {
    await window.keplr.enable(AURA_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(AURA_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    const balances = await client.getAllBalances(walletAddress)
    // Find the AURA balance (denom: 'uaura')
    const auraBalance = balances.find((b) => b.denom === 'uaura')
    // Convert from micro-AURA to AURA
    return auraBalance ? Number(auraBalance.amount) / 1_000_000 : 0
  } catch (error) {
    console.error('Error getting AURA balance:', error)
    throw new Error(`Failed to get AURA balance: ${error.message}`)
  }
}

export const getTotalStakedAmount = async (delegatorAddress, validatorAddress) => {
  try {
    await window.keplr.enable(AURA_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(AURA_CHAIN_ID)
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
    await window.keplr.enable(AURA_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(AURA_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    const result = await client.delegateTokens(
      delegatorAddress,
      validatorAddress,
      {
        denom: 'uaura',
        amount: (amount * 1_000_000).toString()
      },
      'auto',
      'Delegate AURA tokens'
    )
    return result.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}

export const undelegateStake = async (delegatorAddress, validatorAddress, unstakeAmount) => {
  try {
    await window.keplr.enable(AURA_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(AURA_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)

    const delegation = await client.getDelegation(delegatorAddress, validatorAddress)
    console.log('delegation', delegation)

    if (!delegation) {
      throw new Error('No delegation found')
    }

    console.log('unstakeAmount', unstakeAmount)

    if (!unstakeAmount) {
      throw new Error('Could not find delegation amount')
    }

    // Format the amount properly for undelegation
    const amount = {
      denom: 'uaura',
      amount: (unstakeAmount * 1_000_000).toString()
    }
    console.log('formatted amount', amount)

    const result = await client.undelegateTokens(
      delegatorAddress,
      validatorAddress,
      amount,
      'auto',
      'Undelegate AURA tokens'
    )
    console.log('result', result)
    return result.transactionHash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw new Error(`Failed to undelegate stake: ${error.message}`)
  }
}

// Get staking rewards for a delegator/validator pair
export const getAuraRewards = async (delegatorAddress, validatorAddress) => {
  try {
    console.log('validatorAddress', validatorAddress)

    const earnedRewards = await fetch(
      `https://lcd.aura.network/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`
    ).then((r) => r.json())
    console.log('earnedRewards', earnedRewards)
    return earnedRewards
  } catch (error) {
    console.error('Error getting AURA rewards:', error)
    return 0
  }
}

// Get unbonding delegations for a delegator/validator pair
export const getAuraUnbonding = async (delegatorAddress, validatorAddress) => {
  try {
    console.log('validatorAddress', validatorAddress)
    const unbonding_responses = await fetch(
      `https://lcd.aura.network/cosmos/staking/v1beta1/delegators/${delegatorAddress}/unbonding_delegations`
    ).then((r) => r.json())
    console.log('unbonding_responses', unbonding_responses)
    return unbonding_responses
  } catch (error) {
    console.error('Error getting AURA unbonding:', error)
    return []
  }
}
