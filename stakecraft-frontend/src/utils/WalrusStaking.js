// Sui SDK imports
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { getWallets } from '@mysten/wallet-standard'

// Walrus operates on Sui blockchain
const SUI_NETWORK = 'mainnet' // or 'testnet' for testing
const SUI_CLIENT = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) })

// Walrus-specific constants on Sui
// Note: These addresses need to be updated with the actual deployed contract addresses
// Check https://docs.wal.app/ for the latest mainnet contract addresses
const WAL_COIN_TYPE = '0x2::sui::SUI' // Placeholder - Replace with actual WAL token type
const WALRUS_STAKING_PACKAGE = '0x2::walrus_staking' // Placeholder - Replace with actual Walrus staking package
const WALRUS_STORAGE_PACKAGE = '0x2::walrus_storage' // Placeholder - Replace with actual storage package

// Walrus mainnet configuration
const WALRUS_CONFIG = {
  // These values should be obtained from the official Walrus documentation
  epochDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  unbondingPeriodEpochs: 1, // 1 epoch
  minStakeAmount: 1000000000, // 1 WAL in MIST
  storageRatePerWalPerGb: 10 // 10 GB storage per 1 WAL staked
}

// Global wallet reference for connected wallet
let connectedWallet = null

// Get available wallets
export const getAvailableWallets = () => {
  try {
    return getWallets().get()
  } catch (error) {
    console.error('Error getting available wallets:', error)
    return []
  }
}

// Connect wallet using Sui Wallet Standard
export const connectWallet = async (walletName = null) => {
  try {
    const availableWallets = getAvailableWallets()

    if (availableWallets.length === 0) {
      throw new Error(
        'No Sui wallets found. Please install a Sui wallet like Sui Wallet, Suiet, or Martian Wallet.'
      )
    }

    // Find the specific wallet or use the first available one
    let wallet
    if (walletName) {
      wallet = availableWallets.find((w) => w.name.toLowerCase().includes(walletName.toLowerCase()))
      if (!wallet) {
        throw new Error(
          `Wallet "${walletName}" not found. Available wallets: ${availableWallets.map((w) => w.name).join(', ')}`
        )
      }
    } else {
      wallet = availableWallets[0]
    }

    if (!wallet.features['standard:connect']) {
      throw new Error(`Wallet "${wallet.name}" does not support connection`)
    }

    const connectResult = await wallet.features['standard:connect'].connect()

    if (!connectResult || connectResult.accounts.length === 0) {
      throw new Error('No accounts found or connection was rejected')
    }

    connectedWallet = wallet
    console.log('Connected wallet:', wallet.name, connectResult)

    // Return connection info
    return {
      address: connectResult.accounts[0].address,
      walletName: wallet.name,
      accounts: connectResult.accounts
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw new Error(`Failed to connect wallet: ${error.message}`)
  }
}

// Disconnect wallet
export const disconnectWallet = async () => {
  try {
    if (connectedWallet && connectedWallet.features['standard:disconnect']) {
      await connectedWallet.features['standard:disconnect'].disconnect()
    }
    connectedWallet = null
    return true
  } catch (error) {
    console.error('Error disconnecting wallet:', error)
    connectedWallet = null // Reset anyway
    return false
  }
}

// Check if wallet is connected
export const isWalletConnected = () => {
  return connectedWallet !== null
}

// Get WAL balance for a wallet address on Sui
export const getWalBalance = async (walletAddress) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }

    // Get all coin objects owned by the address
    const coinObjects = await SUI_CLIENT.getCoins({
      owner: walletAddress,
      coinType: WAL_COIN_TYPE
    })

    // Calculate total WAL balance
    let totalBalance = 0
    for (const coin of coinObjects.data) {
      totalBalance += parseInt(coin.balance)
    }

    // Convert from MIST to WAL (1 WAL = 1,000,000,000 MIST)
    return totalBalance / 1_000_000_000
  } catch (error) {
    console.error('Error getting WAL balance:', error)
    throw new Error(`Failed to get WAL balance: ${error.message}`)
  }
}

// Get staked amount from Walrus storage pool on Sui
export const getTotalStakedAmount = async (delegatorAddress, validatorAddress) => {
  try {
    if (!delegatorAddress || !validatorAddress) {
      return { amount: 0 }
    }

    // Get staking objects for the delegator
    const stakingObjects = await SUI_CLIENT.getOwnedObjects({
      owner: delegatorAddress,
      filter: {
        Package: WALRUS_STAKING_PACKAGE
      }
    })

    // Find staking records for the specific validator
    let totalStaked = 0
    for (const obj of stakingObjects.data) {
      const objData = await SUI_CLIENT.getObject({
        id: obj.data.objectId,
        options: { showContent: true }
      })

      // Check if this staking object is for our validator
      if (objData.data?.content?.fields?.validator === validatorAddress) {
        totalStaked += parseInt(objData.data.content.fields.amount || 0)
      }
    }

    return { amount: totalStaked }
  } catch (error) {
    console.error('Error getting total staked amount:', error)
    return { amount: 0 }
  }
}

// Stake WAL tokens on Walrus storage network via Sui
export const delegateTokens = async (delegatorAddress, validatorAddress, amount) => {
  try {
    if (!connectedWallet) {
      throw new Error('Wallet not connected')
    }

    // Convert WAL amount to MIST (smallest unit)
    const amountInMist = Math.floor(amount * 1_000_000_000)

    // Validate minimum stake amount
    if (amountInMist < WALRUS_CONFIG.minStakeAmount) {
      throw new Error(`Minimum stake amount is ${WALRUS_CONFIG.minStakeAmount / 1_000_000_000} WAL`)
    }

    // Create transaction block
    const tx = new Transaction()

    // Get WAL coins to stake
    const walCoins = await SUI_CLIENT.getCoins({
      owner: delegatorAddress,
      coinType: WAL_COIN_TYPE
    })

    if (walCoins.data.length === 0) {
      throw new Error('No WAL tokens found in wallet')
    }

    // Merge coins if necessary and select coins for staking
    let coinIds = []
    let totalAmount = 0

    for (const coin of walCoins.data) {
      coinIds.push(coin.coinObjectId)
      totalAmount += parseInt(coin.balance)
      if (totalAmount >= amountInMist) break
    }

    if (totalAmount < amountInMist) {
      throw new Error('Insufficient WAL balance for staking')
    }

    // Merge coins if we have multiple
    let coinToStake
    if (coinIds.length > 1) {
      coinToStake = tx.mergeCoins(
        tx.object(coinIds[0]),
        coinIds.slice(1).map((id) => tx.object(id))
      )
    } else {
      coinToStake = tx.object(coinIds[0])
    }

    // Split the exact amount needed
    const [stakingCoin] = tx.splitCoins(coinToStake, [tx.pure(amountInMist)])

    // Call Walrus staking function
    tx.moveCall({
      target: `${WALRUS_STAKING_PACKAGE}::staking::stake_wal`,
      arguments: [stakingCoin, tx.pure(validatorAddress)]
    })

    // Find the connected account
    const account = connectedWallet.accounts.find((acc) => acc.address === delegatorAddress)
    if (!account) {
      throw new Error('Account not found in connected wallet')
    }

    // Sign and execute transaction using Wallet Standard
    const result = await connectedWallet.features[
      'sui:signAndExecuteTransaction'
    ].signAndExecuteTransaction({
      transaction: tx,
      account: account,
      options: {
        showEffects: true,
        showEvents: true
      }
    })

    if (result.effects?.status?.status !== 'success') {
      throw new Error(`Transaction failed: ${result.effects?.status?.error}`)
    }

    return result.digest
  } catch (error) {
    console.error('Error staking WAL tokens:', error)
    throw new Error(`Failed to stake WAL tokens: ${error.message}`)
  }
}

// Unstake WAL tokens from Walrus storage network
export const undelegateStake = async (delegatorAddress, validatorAddress, unstakeAmount) => {
  try {
    if (!connectedWallet) {
      throw new Error('Wallet not connected')
    }

    // Convert WAL amount to MIST (smallest unit)
    const amountInMist = Math.floor(unstakeAmount * 1_000_000_000)

    // Find staking objects for this validator
    const stakingObjects = await SUI_CLIENT.getOwnedObjects({
      owner: delegatorAddress,
      filter: {
        Package: WALRUS_STAKING_PACKAGE
      }
    })

    let stakingObjectId = null
    for (const obj of stakingObjects.data) {
      const objData = await SUI_CLIENT.getObject({
        id: obj.data.objectId,
        options: { showContent: true }
      })

      if (objData.data?.content?.fields?.validator === validatorAddress) {
        const stakedAmount = parseInt(objData.data.content.fields.amount || 0)
        if (stakedAmount >= amountInMist) {
          stakingObjectId = obj.data.objectId
          break
        }
      }
    }

    if (!stakingObjectId) {
      throw new Error('No suitable staking object found for unstaking')
    }

    // Create transaction block
    const tx = new Transaction()

    // Call Walrus unstaking function
    tx.moveCall({
      target: `${WALRUS_STAKING_PACKAGE}::staking::unstake_wal`,
      arguments: [tx.object(stakingObjectId), tx.pure(amountInMist)]
    })

    // Find the connected account
    const account = connectedWallet.accounts.find((acc) => acc.address === delegatorAddress)
    if (!account) {
      throw new Error('Account not found in connected wallet')
    }

    // Sign and execute transaction using Wallet Standard
    const result = await connectedWallet.features[
      'sui:signAndExecuteTransaction'
    ].signAndExecuteTransaction({
      transaction: tx,
      account: account,
      options: {
        showEffects: true,
        showEvents: true
      }
    })

    if (result.effects?.status?.status !== 'success') {
      throw new Error(`Transaction failed: ${result.effects?.status?.error}`)
    }

    return result.digest
  } catch (error) {
    console.error('Error unstaking WAL tokens:', error)
    throw new Error(`Failed to unstake WAL tokens: ${error.message}`)
  }
}

// Get Walrus staking information
export const getStakingInfo = async (address) => {
  try {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    // Get all staking objects for this address
    const stakingObjects = await SUI_CLIENT.getOwnedObjects({
      owner: address,
      filter: {
        Package: WALRUS_STAKING_PACKAGE
      }
    })

    let totalStaked = 0
    let rewardsEarned = 0
    let lastRewardTime = null

    for (const obj of stakingObjects.data) {
      const objData = await SUI_CLIENT.getObject({
        id: obj.data.objectId,
        options: { showContent: true }
      })

      if (objData.data?.content?.fields) {
        totalStaked += parseInt(objData.data.content.fields.amount || 0)
        rewardsEarned += parseInt(objData.data.content.fields.rewards || 0)

        if (objData.data.content.fields.lastRewardTime) {
          lastRewardTime = new Date(parseInt(objData.data.content.fields.lastRewardTime))
        }
      }
    }

    // Calculate storage capacity based on staked amount
    const walAmount = totalStaked / 1_000_000_000
    const storageCapacity = Math.round(walAmount * WALRUS_CONFIG.storageRatePerWalPerGb)

    return {
      stakedAmount: totalStaked / 1_000_000_000, // Convert MIST to WAL
      rewardsEarned: rewardsEarned / 1_000_000_000, // Convert MIST to WAL
      lastRewardTime,
      storageCapacity, // GB
      storedData: Math.floor(Math.random() * storageCapacity), // Placeholder
      networkParticipation: Math.floor(Math.random() * 100) // Placeholder percentage
    }
  } catch (error) {
    console.error('Error getting staking info:', error)
    return {
      stakedAmount: 0,
      rewardsEarned: 0,
      lastRewardTime: null,
      storageCapacity: 0,
      storedData: 0,
      networkParticipation: 0
    }
  }
}

// Get Walrus storage node status
export const getStorageNodeStatus = async (address) => {
  try {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    // Query storage node information from Sui
    const nodeObjects = await SUI_CLIENT.getOwnedObjects({
      owner: address,
      filter: {
        Package: WALRUS_STAKING_PACKAGE
      }
    })

    // Check if this address operates a storage node
    let isActiveNode = false
    let storageCapacity = 0
    let uptime = 99.8 // Default high uptime

    for (const obj of nodeObjects.data) {
      const objData = await SUI_CLIENT.getObject({
        id: obj.data.objectId,
        options: { showContent: true }
      })

      if (objData.data?.content?.fields?.nodeType === 'storage') {
        isActiveNode = true
        storageCapacity += parseInt(objData.data.content.fields.capacity || 0)
      }
    }

    return {
      isActiveNode,
      storageCapacity,
      replicationFactor: 3, // Walrus uses 3x replication by default
      uptime,
      commission: 5 // Example commission rate
    }
  } catch (error) {
    console.error('Error getting storage node status:', error)
    return {
      isActiveNode: false,
      storageCapacity: 0,
      replicationFactor: 0,
      uptime: 0,
      commission: 0
    }
  }
}

// Purchase Walrus storage space
export const purchaseStorageSpace = async (walletAddress, spaceAmount, duration) => {
  try {
    if (!connectedWallet) {
      throw new Error('Wallet not connected')
    }

    // Create transaction block
    const tx = new Transaction()

    // Get WAL coins for payment
    const walCoins = await SUI_CLIENT.getCoins({
      owner: walletAddress,
      coinType: WAL_COIN_TYPE
    })

    if (walCoins.data.length === 0) {
      throw new Error('No WAL tokens found for storage purchase')
    }

    // Calculate storage cost (example: 0.1 WAL per GB per month)
    const storageCost = Math.floor(spaceAmount * duration * 0.1 * 1_000_000_000)

    // Merge and split coins for payment
    let paymentCoin
    if (walCoins.data.length > 1) {
      const coinIds = walCoins.data.map((coin) => coin.coinObjectId)
      paymentCoin = tx.mergeCoins(
        tx.object(coinIds[0]),
        coinIds.slice(1).map((id) => tx.object(id))
      )
    } else {
      paymentCoin = tx.object(walCoins.data[0].coinObjectId)
    }

    const [payment] = tx.splitCoins(paymentCoin, [tx.pure(storageCost)])

    // Call Walrus storage purchase function
    tx.moveCall({
      target: `${WALRUS_STORAGE_PACKAGE}::storage::purchase_space`,
      arguments: [payment, tx.pure(spaceAmount), tx.pure(duration)]
    })

    // Find the connected account
    const account = connectedWallet.accounts.find((acc) => acc.address === walletAddress)
    if (!account) {
      throw new Error('Account not found in connected wallet')
    }

    // Sign and execute transaction using Wallet Standard
    const result = await connectedWallet.features[
      'sui:signAndExecuteTransaction'
    ].signAndExecuteTransaction({
      transaction: tx,
      account: account,
      options: {
        showEffects: true,
        showEvents: true
      }
    })

    if (result.effects?.status?.status !== 'success') {
      throw new Error(`Transaction failed: ${result.effects?.status?.error}`)
    }

    return result.digest
  } catch (error) {
    console.error('Error purchasing storage space:', error)
    throw new Error(`Failed to purchase storage space: ${error.message}`)
  }
}
