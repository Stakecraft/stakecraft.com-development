import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const KAVA_CHAIN_ID = 'kava_2222-10'

const RPC_ENDPOINTS = [
  'https://kava-rpc.polkachu.com',
  'https://kava-rpc.publicnode.com',
  'https://rpc-kava-ia.cosmosia.notional.ventures'
]

// Connect wallet
export const connectWallet = async () => {
  if (!window.keplr) {
    throw new Error('Please install Keplr extension')
  }
  await window.keplr.enable(KAVA_CHAIN_ID)
  const offlineSigner = window.getOfflineSigner(KAVA_CHAIN_ID)
  const accounts = await offlineSigner.getAccounts()
  return accounts[0].address
}

// Helper function to try different RPC endpoints
export const tryRpcEndpoints = async (offlineSigner) => {
  let lastError = null
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const client = await SigningStargateClient.connectWithSigner(endpoint, offlineSigner, {
        gasPrice: GasPrice.fromString('0.025ukava')
      })
      return client
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error)
      lastError = error
    }
  }
  throw new Error(`Failed to connect to any RPC endpoint. Last error: ${lastError?.message}`)
}

// Get KAVA balance for a wallet address
export const getKavaBalance = async (walletAddress) => {
  try {
    await window.keplr.enable(KAVA_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KAVA_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    const balances = await client.getAllBalances(walletAddress)
    // Find the KAVA balance (denom: 'ukava')
    const kavaBalance = balances.find((b) => b.denom === 'ukava')
    return kavaBalance ? Number(kavaBalance.amount) / 1_000_000 : 0
  } catch (error) {
    console.error('Error getting KAVA balance:', error)
    throw new Error(`Failed to get KAVA balance: ${error.message}`)
  }
}

export const getTotalStakedAmount = async (delegatorAddress, validatorAddress) => {
  try {
    // Validate addresses
    if (!delegatorAddress || !validatorAddress) {
      throw new Error('Both delegator and validator addresses are required')
    }

    // Validate bech32 addresses
    if (delegatorAddress.length < 10 || validatorAddress.length < 10) {
      throw new Error('Invalid address format')
    }

    await window.keplr.enable(KAVA_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KAVA_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)

    console.log('Getting delegation for:', { delegatorAddress, validatorAddress })
    const stakingInfo = await client.getDelegation(delegatorAddress, validatorAddress)

    if (!stakingInfo) {
      return { amount: '0' }
    }

    return stakingInfo
  } catch (error) {
    console.error('Error getting total staked amount:', error)
    throw new Error(`Failed to get total staked amount: ${error.message}`)
  }
}

// Delegate tokens
export const delegateTokens = async (delegatorAddress, validatorAddress, amount) => {
  try {
    await window.keplr.enable(KAVA_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KAVA_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    const result = await client.delegateTokens(
      delegatorAddress,
      validatorAddress,
      {
        denom: 'ukava',
        amount: (amount * 1_000_000).toString()
      },
      'auto',
      'Delegate KAVA tokens'
    )
    return result.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}

export const undelegateStake = async (delegatorAddress, validatorAddress, unstakeAmount) => {
  try {
    // Validate addresses and amount
    if (!delegatorAddress || !validatorAddress) {
      throw new Error('Both delegator and validator addresses are required')
    }

    if (!unstakeAmount || unstakeAmount <= 0) {
      throw new Error('Valid unstake amount is required')
    }

    await window.keplr.enable(KAVA_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KAVA_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)

    const delegation = await client.getDelegation(delegatorAddress, validatorAddress)
    console.log('delegation', delegation)

    if (!delegation || !delegation.amount) {
      throw new Error('No delegation found for this validator')
    }

    // Get the delegation amount
    const currentDelegation = Number(delegation.amount) / 1_000_000
    console.log('currentDelegation', currentDelegation)
    console.log('unstakeAmount', unstakeAmount)

    if (unstakeAmount > currentDelegation) {
      throw new Error(`Cannot unstake more than currently delegated (${currentDelegation} KAVA)`)
    }

    // Format the amount properly for undelegation
    const amount = {
      denom: 'ukava',
      amount: (unstakeAmount * 1_000_000).toString()
    }
    console.log('formatted amount', amount)

    const result = await client.undelegateTokens(
      delegatorAddress,
      validatorAddress,
      amount,
      'auto',
      'Undelegate KAVA tokens'
    )
    console.log('result', result)
    return result.transactionHash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw new Error(`Failed to undelegate stake: ${error.message}`)
  }
}

// Get staking rewards for a delegator/validator pair
export const getKavaRewards = async (delegatorAddress, validatorAddress) => {
  try {
    console.log('validatorAddress', validatorAddress)

    const earnedRewards = await fetch(
      `https://api.data.kava.io/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`
    ).then((r) => r.json())
    console.log('earnedRewards', earnedRewards)
    return earnedRewards
  } catch (error) {
    console.error('Error getting KAVA rewards:', error)
    return 0
  }
}

// Get unbonding delegations for a delegator/validator pair
export const getKavaUnbonding = async (delegatorAddress, validatorAddress) => {
  try {
    console.log('validatorAddress', validatorAddress)
    const unbonding_responses = await fetch(
      `https://api.data.kava.io/cosmos/staking/v1beta1/delegators/${delegatorAddress}/unbonding_delegations`
    ).then((r) => r.json())
    console.log('unbonding_responses', unbonding_responses)
    return unbonding_responses
  } catch (error) {
    console.error('Error getting KAVA unbonding:', error)
    return []
  }
}
