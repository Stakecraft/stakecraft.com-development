import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { getWallets } from '@mysten/wallet-standard'

const SUI_NETWORK = 'mainnet'
const SUI_CLIENT = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) })
const WAL_COIN_TYPE = '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL' // Actual Walrus token type
const STAKE_POOL_ID = '0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904'
const WALRUS_STAKING_PACKAGE = '0xfa65cb2d62f4d39e60346fb7d501c12538ca2bbc646eaa37ece2aec5f897814e'
const WALRUS_STORAGE_PACKAGE = null

const WALRUS_CONFIG = {
  epochDurationMs: 14 * 24 * 60 * 60 * 1000, // 14 days (2 weeks)
  unbondingPeriodEpochs: 2, // 1-2 epochs
  minStakeAmount: 1000000000, // 1 WAL in MIST
  storageRatePerWalPerGb: 10 // 10 GB storage per 1 WAL staked
}

let connectedWallet = null

export const getAvailableWallets = () => {
  try {
    return getWallets().get()
  } catch (error) {
    console.error('Error getting available wallets:', error)
    return []
  }
}

export const connectWallet = async (walletName = null) => {
  try {
    const availableWallets = getAvailableWallets()

    if (availableWallets.length === 0) {
      throw new Error(
        'No Sui wallets found. Please install a Sui wallet like Sui Wallet, Suiet, or Martian Wallet.'
      )
    }

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

export const disconnectWallet = async () => {
  try {
    if (connectedWallet && connectedWallet.features['standard:disconnect']) {
      await connectedWallet.features['standard:disconnect'].disconnect()
    }
    connectedWallet = null
    return true
  } catch (error) {
    console.error('Error disconnecting wallet:', error)
    connectedWallet = null
    return false
  }
}

export const isWalletConnected = () => {
  return connectedWallet !== null
}

export const getWalBalance = async (walletAddress) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }

    const coinObjects = await SUI_CLIENT.getCoins({
      owner: walletAddress,
      coinType: WAL_COIN_TYPE
    })

    console.log('Coin objects:', coinObjects)
    let totalBalance = 0
    for (const coin of coinObjects.data) {
      totalBalance += parseInt(coin.balance)
    }

    return totalBalance / 1_000_000_000
  } catch (error) {
    console.error('Error getting WAL balance:', error)
    throw new Error(`Failed to get WAL balance: ${error.message}`)
  }
}

export const getTotalStakedAmount = async (delegatorAddress, validatorAddress) => {
  try {
    const stakingObjects = await SUI_CLIENT.getOwnedObjects({
      owner: delegatorAddress,
      filter: {
        StructType: `${WALRUS_STAKING_PACKAGE}::staked_wal::StakedWal`
      }
    })

    let totalStaked = 0

    if (!stakingObjects.data || stakingObjects.data.length === 0) {
      console.log('No objects found with StructType filter, trying alternative approach...')

      try {
        const allObjects = await SUI_CLIENT.getOwnedObjects({
          owner: delegatorAddress,
          options: { showContent: true, showType: true }
        })

        for (const obj of allObjects.data || []) {
          if (
            obj.data?.type &&
            (obj.data.type.includes('StakedWal') || obj.data.type.includes('staked_wal'))
          ) {
            console.log('Found potential staking object:', obj)

            if (obj.data?.content?.fields) {
              const fields = obj.data.content.fields
              const stakeAmount = parseInt(
                fields.principal || fields.amount || fields.stake_amount || 0
              )
              if (stakeAmount > 0) {
                totalStaked += stakeAmount
                console.log(`Found stake via fallback: ${stakeAmount}`)
              }
            }
          }
        }
      } catch (fallbackError) {
        console.log('Fallback query failed:', fallbackError)
      }
    }

    if (stakingObjects.data && stakingObjects.data.length > 0) {
      for (const obj of stakingObjects.data) {
        const objData = await SUI_CLIENT.getObject({
          id: obj.data.objectId,
          options: { showContent: true }
        })

        if (objData.data?.content?.fields) {
          const fields = objData.data.content.fields

          const stakeBelongsToValidator =
            fields.validator === validatorAddress ||
            fields.validator_address === validatorAddress ||
            fields.pool_id === validatorAddress ||
            !validatorAddress // If no validator specified, count all stakes

          if (stakeBelongsToValidator) {
            const stakeAmount = parseInt(
              fields.principal || fields.amount || fields.stake_amount || 0
            )
            totalStaked += stakeAmount
            console.log(`Found stake: ${stakeAmount} for validator ${validatorAddress}`)
          }
        }
      }
    } else {
      console.log('No staking objects found')
    }

    console.log('getTotalStakedAmount - Final total staked:', totalStaked)
    return { amount: totalStaked }
  } catch (error) {
    console.error('Error getting total staked amount:', error)
    return { amount: 0 }
  }
}

export const getSuiBalance = async (walletAddress) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }

    const suiCoins = await SUI_CLIENT.getCoins({
      owner: walletAddress,
      coinType: '0x2::sui::SUI'
    })

    let totalBalance = 0
    for (const coin of suiCoins.data) {
      totalBalance += parseInt(coin.balance)
    }

    return totalBalance / 1_000_000_000 // Convert MIST to SUI
  } catch (error) {
    console.error('Error getting SUI balance:', error)
    return 0
  }
}

export const delegateTokens = async (delegatorAddress, validatorAddress, amount) => {
  try {
    const suiBalance = await getSuiBalance(delegatorAddress)
    const requiredGasInSui = 1.0 // 1 SUI should be enough for gas

    if (suiBalance < requiredGasInSui) {
      throw new Error(
        `Insufficient SUI balance for gas fees. You have ${suiBalance.toFixed(4)} SUI but need at least ${requiredGasInSui} SUI. ` +
          `Please add SUI tokens to your wallet to pay for transaction fees.`
      )
    }

    const amountInMist = Math.floor(amount * 1_000_000_000)
    const tx = new Transaction()

    const walCoins = await SUI_CLIENT.getCoins({
      owner: delegatorAddress,
      coinType: WAL_COIN_TYPE
    })

    if (!walCoins.data || walCoins.data.length === 0) {
      throw new Error('No WAL tokens found in wallet')
    }

    const pool = tx.object(STAKE_POOL_ID) // Input 0: SharedObject (mutable)
    const validatorId = tx.pure.id(validatorAddress) // Input 1: Pure ID
    const delegatorAddr = tx.pure.address(delegatorAddress) // Input 2: Pure address
    const coinToStake = tx.object(walCoins.data[0].coinObjectId) // Input 3: Coin object
    const stakeAmount = tx.pure.u64(amountInMist) // Input 4: Pure u64

    const [stakingCoin] = tx.splitCoins(coinToStake, [stakeAmount])

    const stakeResult = tx.moveCall({
      target: `${WALRUS_STAKING_PACKAGE}::staking::stake_with_pool`,
      arguments: [
        pool, // Input 0
        stakingCoin, // NestedResult[0,0]
        validatorId // Input 1
      ]
    })

    tx.transferObjects([stakeResult], delegatorAddr)
    tx.setGasBudget(1_000_000_000n)
    const account = connectedWallet.accounts.find((acc) => acc.address === delegatorAddress)
    const signer = connectedWallet.features['sui:signAndExecuteTransaction']

    const result = await signer.signAndExecuteTransaction({
      account: account,
      chain: 'sui:mainnet',
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true
      }
    })

    return result.digest
  } catch (error) {
    console.error('Error staking WAL tokens:', error)
    throw new Error(`Failed to stake WAL tokens: ${error.message}`)
  }
}

export const undelegateStake = async (delegatorAddress, validatorAddress, unstakeAmount) => {
  try {
    if (!connectedWallet) {
      throw new Error('Wallet not connected')
    }

    console.log('undelegateStake - delegatorAddress', delegatorAddress)
    console.log('undelegateStake - validatorAddress', validatorAddress)
    console.log('undelegateStake - unstakeAmount', unstakeAmount)

    const amountInMist = Math.floor(unstakeAmount * 1_000_000_000)
    console.log('undelegateStake - amountInMist', amountInMist)

    // Use the correct struct type filter
    const stakingObjects = await SUI_CLIENT.getOwnedObjects({
      owner: delegatorAddress,
      filter: {
        StructType: `${WALRUS_STAKING_PACKAGE}::staked_wal::StakedWal`
      }
    })

    let stakingObjectId = null
    let foundStakeAmount = 0

    if (stakingObjects.data && stakingObjects.data.length > 0) {
      for (const obj of stakingObjects.data) {
        const objData = await SUI_CLIENT.getObject({
          id: obj.data.objectId,
          options: { showContent: true, showType: true }
        })

        if (objData.data?.content?.fields) {
          const fields = objData.data.content.fields
          const stakedAmount = parseInt(fields.principal || fields.amount || 0)

          if (stakedAmount > 0) {
            stakingObjectId = obj.data.objectId
            foundStakeAmount = stakedAmount
            console.log(
              `undelegateStake - selected object: ${stakingObjectId} (full withdrawal: ${stakedAmount} MIST)`
            )
            break
          }
        }
      }
    }

    if (!stakingObjectId) {
      console.log('undelegateStake - No suitable object found with StructType, trying fallback...')

      try {
        const allObjects = await SUI_CLIENT.getOwnedObjects({
          owner: delegatorAddress,
          options: { showContent: true, showType: true }
        })

        for (const obj of allObjects.data || []) {
          if (
            obj.data?.type &&
            (obj.data.type.includes('StakedWal') || obj.data.type.includes('staked_wal'))
          ) {
            console.log('undelegateStake - Found potential staking object via fallback:', obj)

            if (obj.data?.content?.fields) {
              const fields = obj.data.content.fields
              const stakeAmount = parseInt(
                fields.principal || fields.amount || fields.stake_amount || 0
              )
              if (stakeAmount > 0) {
                stakingObjectId = obj.data.objectId
                foundStakeAmount = stakeAmount
                console.log(
                  `undelegateStake - selected fallback object: ${stakingObjectId} (full withdrawal: ${stakeAmount} MIST)`
                )
                break
              }
            }
          }
        }
      } catch (fallbackError) {
        console.log('undelegateStake - Fallback query failed:', fallbackError)
      }
    }

    if (!stakingObjectId) {
      throw new Error(
        `No staking objects found for withdrawal. You need to have staked WAL tokens to unstake.`
      )
    }

    console.log(
      `undelegateStake - Using staking object: ${stakingObjectId} with ${foundStakeAmount} MIST`
    )

    const tx = new Transaction()
    const pool = tx.object(STAKE_POOL_ID) // Input 0: SharedObject (stake pool)
    const stakingObject = tx.object(stakingObjectId) // Input 1: StakedWal object
    const delegatorAddr = tx.pure.address(delegatorAddress) // Input 2: delegator address

    const withdrawResult = tx.moveCall({
      target: `${WALRUS_STAKING_PACKAGE}::staking::withdraw_stake`,
      arguments: [
        pool, // Input 0
        stakingObject // Input 1
      ]
    })

    tx.transferObjects([withdrawResult], delegatorAddr)

    const account = connectedWallet.accounts.find((acc) => acc.address === delegatorAddress)
    if (!account) {
      throw new Error('Account not found in connected wallet')
    }

    const result = await connectedWallet.features[
      'sui:signAndExecuteTransaction'
    ].signAndExecuteTransaction({
      transaction: tx,
      account: account,
      chain: `sui:${SUI_NETWORK}`,
      options: {
        showEffects: true,
        showEvents: true
      }
    })

    return result.digest
  } catch (error) {
    console.error('Error unstaking WAL tokens:', error)
    throw new Error(`Failed to unstake WAL tokens: ${error.message}`)
  }
}

export const getStakingInfo = async (address) => {
  try {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    if (!WALRUS_STAKING_PACKAGE) {
      console.warn('Walrus staking package not configured - returning default values')
      return {
        stakedAmount: 0,
        rewardsEarned: 0,
        lastRewardTime: null,
        storageCapacity: 0,
        storedData: 0,
        networkParticipation: 0
      }
    }

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

    // Note: Storage node functionality temporarily disabled until proper Walrus SDK integration
    if (!WALRUS_STAKING_PACKAGE) {
      console.warn('Walrus staking package not configured - returning default values')
      return {
        isActiveNode: false,
        storageCapacity: 0,
        replicationFactor: 3,
        uptime: 99.8,
        commission: 5
      }
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

export const purchaseStorageSpace = async (walletAddress, spaceAmount, duration) => {
  try {
    if (!connectedWallet) {
      throw new Error('Wallet not connected')
    }

    if (!WALRUS_STORAGE_PACKAGE) {
      throw new Error(
        'Walrus storage purchase is not yet fully integrated. ' +
          'Please use the official Walrus documentation at https://docs.wal.app/ ' +
          'to learn about storage usage.'
      )
    }

    const tx = new Transaction()

    const walCoins = await SUI_CLIENT.getCoins({
      owner: walletAddress,
      coinType: WAL_COIN_TYPE
    })

    if (walCoins.data.length === 0) {
      throw new Error('No WAL tokens found for storage purchase')
    }

    const storageCost = Math.floor(spaceAmount * duration * 0.1 * 1_000_000_000)

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

    const [payment] = tx.splitCoins(paymentCoin, [tx.pure(storageCost, 'u64')])

    tx.moveCall({
      target: `${WALRUS_STORAGE_PACKAGE}::storage::purchase_space`,
      arguments: [payment, tx.pure(spaceAmount, 'u64'), tx.pure(duration, 'u64')]
    })

    const account = connectedWallet.accounts.find((acc) => acc.address === walletAddress)
    if (!account) {
      throw new Error('Account not found in connected wallet')
    }

    const result = await connectedWallet.features[
      'sui:signAndExecuteTransaction'
    ].signAndExecuteTransaction({
      transaction: tx,
      account: account,
      chain: `sui:${SUI_NETWORK}`, // Add the required chain identifier
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
