import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const AGORIC_CHAIN_ID = 'agoric-3'

const RPC_ENDPOINTS = ['https://agoric-rpc.polkachu.com', 'https://rpc.agoric.nodestake.top']

// Global state to track connection
let connectedAccount = null
let cachedSigner = null
let cachedClient = null

// Helper function to clear cached connection data
const clearConnectionCache = () => {
  connectedAccount = null
  cachedSigner = null
  cachedClient = null
}

// Connect wallet
export const connectWallet = async () => {
  if (!window.keplr) {
    throw new Error('Please install Keplr extension')
  }

  try {
    await window.keplr.enable(AGORIC_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(AGORIC_CHAIN_ID)
    const accounts = await offlineSigner.getAccounts()
    const walletAddress = accounts[0].address

    // Cache the connection data
    connectedAccount = walletAddress
    cachedSigner = offlineSigner

    // Store in browser storage for persistence
    localStorage.setItem('agoric-connected-account', walletAddress)
    localStorage.setItem('agoric-last-connection-time', Date.now().toString())

    console.log('Agoric wallet connected successfully:', walletAddress)
    return walletAddress
  } catch (error) {
    console.error('Failed to connect Agoric wallet:', error)
    clearConnectionCache()
    throw error
  }
}

// Enhanced disconnect wallet function for Keplr
export const WalletDisconnect = async () => {
  try {
    console.log('Disconnecting Keplr wallet for Agoric...')

    // Clear internal connection state
    clearConnectionCache()

    // Clear browser storage
    localStorage.removeItem('agoric-connected-account')
    localStorage.removeItem('agoric-last-connection-time')
    sessionStorage.removeItem('agoric-session-data')

    // Clear any Keplr-specific cache if it exists
    try {
      if (window.keplr && window.keplr.clearOrigin) {
        await window.keplr.clearOrigin()
      }
    } catch (clearError) {
      console.warn('Could not clear Keplr origin cache:', clearError)
    }

    console.log('Agoric wallet disconnected successfully')
    return {
      success: true,
      message:
        'Wallet disconnected successfully. To completely remove site permissions, please disconnect manually from Keplr extension.'
    }
  } catch (error) {
    console.error('Error disconnecting Agoric wallet:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Helper function to check if wallet was previously connected
export const isWalletPreviouslyConnected = () => {
  return localStorage.getItem('agoric-connected-account') !== null
}

// Helper function to get cached account
export const getCachedAccount = () => {
  return localStorage.getItem('agoric-connected-account')
}

// Legacy function for backward compatibility
export const disconnectWallet = WalletDisconnect

// Helper function to try different RPC endpoints
const tryRpcEndpoints = async (offlineSigner) => {
  let lastError = null
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const client = await SigningStargateClient.connectWithSigner(endpoint, offlineSigner, {
        gasPrice: GasPrice.fromString('0.025ubld'),
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

// Get BLD balance for a wallet address
export const getBldBalance = async (walletAddress) => {
  try {
    await window.keplr.enable(AGORIC_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(AGORIC_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    const balances = await client.getAllBalances(walletAddress)
    // Find the BLD balance (denom: 'ubld')
    const bldBalance = balances.find((b) => b.denom === 'ubld')
    // Convert from micro-BLD to BLD
    return bldBalance ? Number(bldBalance.amount) / 1_000_000 : 0
  } catch (error) {
    console.error('Error getting BLD balance:', error)
    throw new Error(`Failed to get BLD balance: ${error.message}`)
  }
}

// Get total staked amount
export const getTotalStakedAmount = async (delegatorAddress, validatorAddress) => {
  try {
    await window.keplr.enable(AGORIC_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(AGORIC_CHAIN_ID)
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
    await window.keplr.enable(AGORIC_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(AGORIC_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)

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
      gas: '300000',
      memo: 'Delegate BLD tokens'
    })

    return result.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}

export const undelegateStake = async (delegatorAddress, validatorAddress, unstakeAmount) => {
  try {
    await window.keplr.enable(AGORIC_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(AGORIC_CHAIN_ID)
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
      denom: 'ubld',
      amount: (unstakeAmount * 1_000_000).toString()
    }
    console.log('formatted amount', amount)

    const result = await client.undelegateTokens(
      delegatorAddress,
      validatorAddress,
      amount,
      'auto',
      'Undelegate BLD tokens'
    )
    console.log('result', result)
    return result.transactionHash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw new Error(`Failed to undelegate stake: ${error.message}`)
  }
}
