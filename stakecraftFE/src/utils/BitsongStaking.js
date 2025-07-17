import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const BITSONG_CHAIN_ID = 'bitsong-2b' // Bitsong mainnet chain ID

const RPC_ENDPOINTS = [
  'https://bitsong-rpc.polkachu.com',
  'https://rpc-bitsong-ia.cosmosia.notional.ventures',
  'https://bitsong-rpc.publicnode.com'
]

// Connect wallet
export const connectWallet = async () => {
  if (!window.keplr) {
    throw new Error('Please install Keplr extension')
  }
  await window.keplr.enable(BITSONG_CHAIN_ID)
  const offlineSigner = window.getOfflineSigner(BITSONG_CHAIN_ID)
  const accounts = await offlineSigner.getAccounts()
  return accounts[0].address
}

// Helper function to try different RPC endpoints
const tryRpcEndpoints = async (offlineSigner) => {
  let lastError = null
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const client = await SigningStargateClient.connectWithSigner(endpoint, offlineSigner, {
        gasPrice: GasPrice.fromString('0.025ubtsg')
      })
      return client
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error)
      lastError = error
    }
  }
  throw new Error(`Failed to connect to any RPC endpoint. Last error: ${lastError?.message}`)
}

// Get BTSG balance for a wallet address
export const getBtsgBalance = async (walletAddress) => {
  try {
    await window.keplr.enable(BITSONG_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(BITSONG_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    const balances = await client.getAllBalances(walletAddress)
    // Find the BTSG balance (denom: 'ubtsg')
    const btsgBalance = balances.find(b => b.denom === 'ubtsg')
    // Convert from micro-BTSG to BTSG
    return btsgBalance ? Number(btsgBalance.amount) / 1_000_000 : 0
  } catch (error) {
    console.error('Error getting BTSG balance:', error)
    throw new Error(`Failed to get BTSG balance: ${error.message}`)
  }
}

export const getTotalStakedAmount = async (delegatorAddress, validatorAddress) => {
  try {
    await window.keplr.enable(BITSONG_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(BITSONG_CHAIN_ID)
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
    await window.keplr.enable(BITSONG_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(BITSONG_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    const result = await client.delegateTokens(
      delegatorAddress,
      validatorAddress,
      {
        denom: 'ubtsg',
        amount: (amount * 1_000_000).toString()
      },
      'auto',
      'Delegate BTSG tokens'
    )
    return result.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}

export const undelegateStake = async (delegatorAddress, validatorAddress, unstakeAmount) => {
  try {
    await window.keplr.enable(BITSONG_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(BITSONG_CHAIN_ID)
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
      denom: 'ubtsg',
      amount: (unstakeAmount * 1_000_000).toString()
    }
    console.log('formatted amount', amount)

    const result = await client.undelegateTokens(
      delegatorAddress,
      validatorAddress,
      amount,
      'auto',
      'Undelegate BTSG tokens'
    )
    console.log('result', result)
    return result.transactionHash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw new Error(`Failed to undelegate stake: ${error.message}`)
  }
}
