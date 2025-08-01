import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp'

const CENTRIFUGE_RPC_URLS = [
  'wss://centrifuge-rpc.dwellir.com',
  'wss://rpc.centrifuge.io',
  'wss://centrifuge.api.onfinality.io/public-ws'
]

let api = null

// Connect Polkadot.js wallet
export const connectWallet = async () => {
  try {
    // Enable the extension
    const extensions = await web3Enable('Stakecraft')

    if (extensions.length === 0) {
      throw new Error('Please install Polkadot.js extension')
    }

    // Get all accounts
    const accounts = await web3Accounts()

    if (accounts.length === 0) {
      throw new Error('No accounts found in Polkadot.js extension')
    }

    // Return the first account address
    return accounts[0].address
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw new Error(`Failed to connect wallet: ${error.message}`)
  }
}

// Initialize API connection
const initApi = async () => {
  if (api) return api

  for (const rpcUrl of CENTRIFUGE_RPC_URLS) {
    try {
      console.log(`Connecting to ${rpcUrl}...`)
      const provider = new WsProvider(rpcUrl)
      api = await ApiPromise.create({ provider })
      await api.isReady
      console.log(`Connected to Centrifuge via ${rpcUrl}`)
      return api
    } catch (error) {
      console.warn(`Failed to connect to ${rpcUrl}:`, error)
    }
  }

  throw new Error('Failed to connect to any Centrifuge RPC endpoint')
}

// Get CFG balance for a wallet address
export const getCfgBalance = async (walletAddress) => {
  try {
    await initApi()

    const { data: balance } = await api.query.system.account(walletAddress)

    // Convert from planck to CFG (18 decimals)
    const freeBalance = balance.free.toString()
    return parseFloat(freeBalance) / Math.pow(10, 18)
  } catch (error) {
    console.error('Error getting CFG balance:', error)
    throw new Error(`Failed to get CFG balance: ${error.message}`)
  }
}

// Get nominated amount (simplified for demo)
export const getNominatedAmount = async (walletAddress, validatorAddress) => {
  try {
    await initApi()

    // In a real implementation, this would query the staking pallet
    // to get the actual nominated amount for this validator
    console.log('Getting nominations for:', walletAddress, 'validator:', validatorAddress)
    const nominations = await api.query.staking.nominators(walletAddress)

    if (nominations.isSome) {
      const nominatorInfo = nominations.unwrap()
      // Simplified calculation - in reality would check if validatorAddress is in targets
      return parseFloat(nominatorInfo.stake.toString()) / Math.pow(10, 18)
    }

    return 0
  } catch (error) {
    console.error('Error getting nominated amount:', error)
    return 0
  }
}

// Nominate validator
export const nominateValidator = async (walletAddress, validatorAddress, amount) => {
  try {
    await initApi()

    // Get the signer
    const injector = await web3FromAddress(walletAddress)

    // Convert amount to planck (smallest unit)
    const amountInPlanck = (amount * Math.pow(10, 18)).toString()

    console.log('Nominating validator:', validatorAddress, 'with amount:', amount, 'CFG')

    // Create the nomination transaction
    // In Substrate, nomination typically involves bond + nominate transactions
    const bondTx = api.tx.staking.bond(walletAddress, amountInPlanck, 'Staked')
    const nominateTx = api.tx.staking.nominate([validatorAddress])

    // Execute bond transaction first
    const bondResult = await bondTx.signAndSend(walletAddress, { signer: injector.signer })

    console.log('Bond transaction hash:', bondResult.toHex())

    // Then nominate
    const nominateResult = await nominateTx.signAndSend(walletAddress, { signer: injector.signer })

    console.log('Nominate transaction hash:', nominateResult.toHex())

    return nominateResult.toHex()
  } catch (error) {
    console.error('Error nominating validator:', error)
    throw new Error(`Failed to nominate validator: ${error.message}`)
  }
}

// Unnominate validator (chill)
export const unnominateValidator = async (walletAddress, validatorAddress, amount) => {
  try {
    await initApi()

    // Get the signer
    const injector = await web3FromAddress(walletAddress)

    console.log('Unnominating validator:', validatorAddress, 'amount:', amount, 'CFG')

    // Convert amount to planck
    const amountInPlanck = (amount * Math.pow(10, 18)).toString()

    // Create the unbond transaction
    const unbondTx = api.tx.staking.unbond(amountInPlanck)

    // Execute the transaction
    const result = await unbondTx.signAndSend(walletAddress, { signer: injector.signer })

    console.log('Unbond transaction hash:', result.toHex())

    return result.toHex()
  } catch (error) {
    console.error('Error unnominating validator:', error)
    throw new Error(`Failed to unnominate validator: ${error.message}`)
  }
}

// Get staking rewards (simplified for demo)
export const getStakingRewards = async (walletAddress) => {
  try {
    await initApi()

    // In a real implementation, this would query the staking rewards
    // from the staking pallet and calculate accumulated rewards
    console.log('Getting staking rewards for:', walletAddress)

    // Return mock data for demo
    return 0
  } catch (error) {
    console.error('Error getting staking rewards:', error)
    return 0
  }
}

// Get validator information
export const getValidatorInfo = async (validatorAddress) => {
  try {
    await initApi()

    const validatorInfo = await api.query.staking.validators(validatorAddress)

    if (validatorInfo.isSome) {
      const validator = validatorInfo.unwrap()
      return {
        commission: validator.commission.toString(),
        blocked: validator.blocked.toString(),
        preferences: validator
      }
    }

    return null
  } catch (error) {
    console.error('Error getting validator info:', error)
    return null
  }
}

// Get era information
export const getCurrentEra = async () => {
  try {
    await initApi()

    const currentEra = await api.query.staking.currentEra()
    return currentEra.isSome ? currentEra.unwrap().toNumber() : 0
  } catch (error) {
    console.error('Error getting current era:', error)
    return 0
  }
}
