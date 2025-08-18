import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const KI_CHAIN_ID = 'kichain-2'

const RPC_ENDPOINTS = [
  'https://rpc-mainnet.kichain.net',
  'https://rpc-kichain.blockapsis.com',
  'https://kichain-rpc.polkachu.com'
]

// Suggest chain to Keplr
async function suggestChain() {
  try {
    await window.keplr.experimentalSuggestChain({
      chainId: KI_CHAIN_ID,
      chainName: 'Ki Chain',
      rpc: 'https://rpc-mainnet.kichain.net',
      rest: 'https://api-mainnet.kichain.net',
      bip44: {
        coinType: 118
      },
      bech32Config: {
        bech32PrefixAccAddr: 'ki',
        bech32PrefixAccPub: 'kipub',
        bech32PrefixValAddr: 'kivaloper',
        bech32PrefixValPub: 'kivaloperpub',
        bech32PrefixConsAddr: 'kivalcons',
        bech32PrefixConsPub: 'kivalconspub'
      },
      currencies: [
        {
          coinDenom: 'XKI',
          coinMinimalDenom: 'uxki',
          coinDecimals: 6,
          coinGeckoId: 'ki'
        }
      ],
      feeCurrencies: [
        {
          coinDenom: 'XKI',
          coinMinimalDenom: 'uxki',
          coinDecimals: 6,
          coinGeckoId: 'ki',
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.04
          }
        }
      ],
      stakeCurrency: {
        coinDenom: 'XKI',
        coinMinimalDenom: 'uxki',
        coinDecimals: 6,
        coinGeckoId: 'ki'
      }
    })
    console.log('Ki chain suggested successfully')
  } catch (error) {
    console.error('Error suggesting Ki chain:', error)
  }
}

// Connect wallet
export const connectWallet = async () => {
  if (!window.keplr) {
    throw new Error('Please install Keplr extension')
  }

  try {
    await suggestChain()
    await window.keplr.enable(KI_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KI_CHAIN_ID)
    const accounts = await offlineSigner.getAccounts()
    return accounts[0].address
  } catch (error) {
    console.error('Connection error:', error)
    throw new Error('Failed to connect wallet: ' + error.message)
  }
}

// Helper function to try different RPC endpoints
export const tryRpcEndpoints = async (offlineSigner) => {
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

// Get XKI balance for a wallet address
export const getKiBalance = async (walletAddress) => {
  try {
    await window.keplr.enable(KI_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KI_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner)
    const balances = await client.getAllBalances(walletAddress)
    // Find the XKI balance (denom: 'uxki')
    const kiBalance = balances.find((b) => b.denom === 'uxki')
    // Convert from micro-XKI to XKI
    return kiBalance ? Number(kiBalance.amount) / 1_000_000 : 0
  } catch (error) {
    console.error('Error getting XKI balance:', error)
    throw new Error(`Failed to get XKI balance: ${error.message}`)
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

    await window.keplr.enable(KI_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KI_CHAIN_ID)
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

export const undelegateStake = async (delegatorAddress, validatorAddress, unstakeAmount) => {
  try {
    // Validate addresses and amount
    if (!delegatorAddress || !validatorAddress) {
      throw new Error('Both delegator and validator addresses are required')
    }

    if (!unstakeAmount || unstakeAmount <= 0) {
      throw new Error('Valid unstake amount is required')
    }

    await window.keplr.enable(KI_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KI_CHAIN_ID)
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
      throw new Error(`Cannot unstake more than currently delegated (${currentDelegation} XKI)`)
    }

    // Format the amount properly for undelegation
    const amount = {
      denom: 'uxki',
      amount: (unstakeAmount * 1_000_000).toString()
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

// Get staking rewards for a delegator/validator pair
export const getKiRewards = async (delegatorAddress, validatorAddress) => {
  try {
    console.log('validatorAddress', validatorAddress)

    const earnedRewards = await fetch(
      `https://api-mainnet.kichain.net/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`
    ).then((r) => r.json())
    console.log('earnedRewards', earnedRewards)
    return earnedRewards
  } catch (error) {
    console.error('Error getting XKI rewards:', error)
    return 0
  }
}

// Get unbonding delegations for a delegator/validator pair
export const getKiUnbonding = async (delegatorAddress, validatorAddress) => {
  try {
    console.log('validatorAddress', validatorAddress)
    const unbonding_responses = await fetch(
      `https://api-mainnet.kichain.net/cosmos/staking/v1beta1/delegators/${delegatorAddress}/unbonding_delegations`
    ).then((r) => r.json())
    console.log('unbonding_responses', unbonding_responses)
    return unbonding_responses
  } catch (error) {
    console.error('Error getting XKI unbonding:', error)
    return []
  }
}
