import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Enable, web3AccountsSubscribe, web3FromAddress } from '@polkadot/extension-dapp'

const ALTAIR_ENDPOINTS = [
  'wss://altair-rpc.centrifuge.io',
  'wss://altair.api.onfinality.io/public-ws'
]

let api = null
let currentAccount = null

// Connect to Altair network
const connectToAltair = async () => {
  if (api) return api

  let lastError = null
  for (const endpoint of ALTAIR_ENDPOINTS) {
    try {
      const provider = new WsProvider(endpoint)
      api = await ApiPromise.create({ provider })
      await api.isReady
      console.log(`Connected to Altair via ${endpoint}`)
      return api
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error)
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  throw new Error(`Failed to connect to any Altair endpoint. Last error: ${lastError?.message}`)
}

// Connect wallet
export const connectWallet = async () => {
  try {
    // Check if Polkadot.js extension is available
    if (!window.injectedWeb3 || !window.injectedWeb3['polkadot-js']) {
      throw new Error('Please install Polkadot.js extension')
    }

    // Enable web3 and get accounts
    const extensions = await web3Enable('Altair Staking')
    if (extensions.length === 0) {
      throw new Error('No extension found')
    }

    return new Promise((resolve, reject) => {
      web3AccountsSubscribe((accounts) => {
        if (accounts.length > 0) {
          currentAccount = accounts[0]
          resolve(currentAccount.address)
        } else {
          reject(new Error('No accounts found'))
        }
      })
    })
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  }
}

// Get AIR balance
export const getBalance = async (address) => {
  try {
    const api = await connectToAltair()
    const { data: balance } = await api.query.system.account(address)

    // Convert from smallest unit to AIR (assuming 18 decimals)
    return parseFloat(balance.free.toString()) / Math.pow(10, 18)
  } catch (error) {
    console.error('Error getting balance:', error)
    throw new Error(`Failed to get balance: ${error.message}`)
  }
}

// Get staking information
export const getStakingInfo = async (address, validatorAddress) => {
  try {
    const api = await connectToAltair()

    // Get staking ledger
    const stakingLedger = await api.query.staking.ledger(address)
    let stakedAmount = 0

    if (stakingLedger.isSome) {
      const ledger = stakingLedger.unwrap()
      stakedAmount = parseFloat(ledger.active.toString()) / Math.pow(10, 18)
    }

    // Get pending rewards (this might not be available in all Substrate chains)
    let stakingRewards = 0
    try {
      const pendingRewards = await api.query.staking.pendingRewards(address)
      if (pendingRewards) {
        stakingRewards = parseFloat(pendingRewards.toString()) / Math.pow(10, 18)
      }
    } catch (rewardError) {
      console.log('Rewards not available via pendingRewards query')
    }

    // Log validator address for debugging
    console.log('Getting staking info for validator:', validatorAddress)

    return {
      stakedAmount,
      stakingRewards
    }
  } catch (error) {
    console.error('Error getting staking info:', error)
    return {
      stakedAmount: 0,
      stakingRewards: 0
    }
  }
}

// Stake tokens (nominate)
export const stakeTokens = async (address, validatorAddress, amount) => {
  try {
    const api = await connectToAltair()
    const injector = await web3FromAddress(address)

    // Convert amount to smallest unit (assuming 18 decimals)
    const stakeAmount = (amount * Math.pow(10, 18)).toString()

    // Create bond transaction
    const bondTx = api.tx.staking.bond(address, stakeAmount, { Staked: null })

    // Create nominate transaction
    const nominateTx = api.tx.staking.nominate([validatorAddress])

    // Batch the transactions
    const batchTx = api.tx.utility.batchAll([bondTx, nominateTx])

    // Sign and send transaction
    const hash = await batchTx.signAndSend(address, { signer: injector.signer })

    return hash.toHex()
  } catch (error) {
    console.error('Error staking tokens:', error)
    throw new Error(`Failed to stake tokens: ${error.message}`)
  }
}

// Unstake tokens (unbond)
export const unstakeTokens = async (address, validatorAddress, amount) => {
  try {
    const api = await connectToAltair()
    const injector = await web3FromAddress(address)

    // Convert amount to smallest unit (assuming 18 decimals)
    const unstakeAmount = (amount * Math.pow(10, 18)).toString()

    // Create unbond transaction
    const unbondTx = api.tx.staking.unbond(unstakeAmount)

    // Sign and send transaction
    const hash = await unbondTx.signAndSend(address, { signer: injector.signer })

    return hash.toHex()
  } catch (error) {
    console.error('Error unstaking tokens:', error)
    throw new Error(`Failed to unstake tokens: ${error.message}`)
  }
}

// Withdraw unbonded tokens
export const withdrawUnbonded = async (address) => {
  try {
    const api = await connectToAltair()
    const injector = await web3FromAddress(address)

    // Create withdraw unbonded transaction
    const withdrawTx = api.tx.staking.withdrawUnbonded(0)

    // Sign and send transaction
    const hash = await withdrawTx.signAndSend(address, { signer: injector.signer })

    return hash.toHex()
  } catch (error) {
    console.error('Error withdrawing unbonded tokens:', error)
    throw new Error(`Failed to withdraw unbonded tokens: ${error.message}`)
  }
}

// Get unbonding information
export const getUnbondingInfo = async (address) => {
  try {
    const api = await connectToAltair()

    const stakingLedger = await api.query.staking.ledger(address)
    if (stakingLedger.isNone) {
      return []
    }

    const ledger = stakingLedger.unwrap()
    const unbondingChunks = ledger.unlocking || []

    return unbondingChunks.map((chunk) => ({
      amount: parseFloat(chunk.value.toString()) / Math.pow(10, 18),
      era: chunk.era.toNumber()
    }))
  } catch (error) {
    console.error('Error getting unbonding info:', error)
    return []
  }
}
