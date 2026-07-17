import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  StakeProgram
} from '@solana/web3.js'

const SOLANA_RPC_ENDPOINTS = [
  import.meta.env.VITE_HELIUS_RPC_URL,
  'https://solana-rpc.publicnode.com',
  'https://api.mainnet-beta.solana.com'
].filter(Boolean)

const endpoint = SOLANA_RPC_ENDPOINTS[0]
const connection = new Connection(endpoint, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
  wsEndpoint: import.meta.env.VITE_HELIUS_WS_URL || undefined
})

async function withSolanaRpcFallback(fn) {
  let lastError = null
  for (const rpcUrl of SOLANA_RPC_ENDPOINTS) {
    try {
      const conn =
        rpcUrl === endpoint
          ? connection
          : new Connection(rpcUrl, {
              commitment: 'confirmed',
              confirmTransactionInitialTimeout: 60000
            })
      return await fn(conn)
    } catch (error) {
      lastError = error
      console.warn(`Solana RPC failed (${rpcUrl}):`, error?.message || error)
    }
  }
  throw lastError || new Error('All Solana RPC endpoints failed')
}

// Global wallet reference
let currentWallet = null

// Disconnect wallet function
export const WalletDisconnect = async () => {
  console.log('Disconnecting wallet')

  try {
    console.log('Disconnecting wallet')
    if (currentWallet && currentWallet.connected) {
      await currentWallet.disconnect()
    }
    currentWallet = null
    return true
  } catch (error) {
    console.error('Error disconnecting wallet:', error)
    currentWallet = null
    return false
  }
}

// Helper function to determine stake activation status from parsed account data
const getStakeActivationFromParsedData = async (parsedAccountData) => {
  try {
    if (!parsedAccountData?.parsed?.info) {
      return { state: 'inactive', active: 0, inactive: 0 }
    }

    const info = parsedAccountData.parsed.info
    const type = parsedAccountData.parsed.type

    // Default values
    let state = 'inactive'
    let activeStake = 0
    let inactiveStake = 0

    if (type === 'delegated' && info.stake?.delegation) {
      const delegation = info.stake.delegation
      const delegatedAmount = parseInt(delegation.stake || 0) / LAMPORTS_PER_SOL

      // Get current epoch to compare with activation/deactivation epochs
      const epochInfo = await connection.getEpochInfo()
      const currentEpoch = epochInfo.epoch

      // Parse activation and deactivation epochs
      const activationEpoch = parseInt(delegation.activationEpoch || 0)
      const deactivationEpochStr = delegation.deactivationEpoch?.toString()

      // Handle the max value case (18446744073709551615 means not deactivated)
      let deactivationEpoch = Number.MAX_SAFE_INTEGER
      if (deactivationEpochStr && deactivationEpochStr !== '18446744073709551615') {
        deactivationEpoch = parseInt(deactivationEpochStr)
      }

      // Determine the actual state based on epochs
      if (currentEpoch < activationEpoch) {
        // Still activating
        state = 'activating'
        activeStake = 0
        inactiveStake = delegatedAmount
      } else if (deactivationEpoch !== Number.MAX_SAFE_INTEGER) {
        // Deactivation has been initiated
        if (currentEpoch >= deactivationEpoch) {
          // Deactivation is complete - account is inactive
          state = 'inactive'
          activeStake = 0
          inactiveStake = delegatedAmount
        } else {
          // Deactivation in progress - still active until deactivation completes
          state = 'deactivating'
          activeStake = delegatedAmount
          inactiveStake = 0
        }
      } else {
        // No deactivation epoch set - account is fully active
        state = 'active'
        activeStake = delegatedAmount
        inactiveStake = 0
      }
    } else if (type === 'initialized') {
      // Account exists but is not delegated
      state = 'initialized'
      activeStake = 0
      inactiveStake = 0
    }

    return {
      state,
      active: activeStake,
      inactive: inactiveStake
    }
  } catch (error) {
    console.error('Error getting stake activation from parsed data:', error)
    return { state: 'error', active: 0, inactive: 0 }
  }
}

// Wallet connection functions
export const getProvider = () => {
  if (window.solana?.isPhantom) {
    return window.solana
  } else if (window.solflare) {
    return window.solflare
  }
  throw new Error('No supported wallet found')
}

export const connectWallet = async () => {
  try {
    const provider = getProvider()
    await provider.connect()
    currentWallet = provider
    return provider.publicKey
  } catch (error) {
    console.error('Error connecting wallet:', error)
    throw error
  }
}

export const getCurrentWallet = () => {
  if (!currentWallet) {
    currentWallet = getProvider()
  }
  return currentWallet
}

// Core staking functions

const FEE_BUFFER_LAMPORTS = 10_000 // leave room for tx fees

async function sendWalletTransaction(wallet, transaction) {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = blockhash

  let signature
  if (typeof wallet.signAndSendTransaction === 'function') {
    const result = await wallet.signAndSendTransaction(transaction)
    signature = typeof result === 'string' ? result : result.signature
  } else {
    const signedTransaction = await wallet.signTransaction(transaction)
    signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    })
  }

  const confirmation = await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'confirmed'
  )

  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
  }

  return signature
}

/**
 * Create, initialize, and delegate a stake account in a single transaction.
 * Uses createAccountWithSeed so only the wallet needs to sign (one Phantom popup).
 */
export const createAndDelegateStake = async (stakeLamports, validatorAddress) => {
  try {
    const wallet = getCurrentWallet()
    if (!wallet.connected) {
      await connectWallet()
    }

    if (!validatorAddress) {
      throw new Error('Validator address is required')
    }

    const validatorPubkey = new PublicKey(validatorAddress)
    const validatorAccount = await connection.getAccountInfo(validatorPubkey)
    if (!validatorAccount) {
      throw new Error('Validator account not found')
    }

    const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(
      StakeProgram.space
    )
    const totalLamports = stakeLamports + rentExemptionAmount
    const requiredBalance = totalLamports + FEE_BUFFER_LAMPORTS

    const walletBalance = await connection.getBalance(wallet.publicKey)
    if (walletBalance < requiredBalance) {
      throw new Error(
        `Insufficient balance. Need ${(requiredBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL but wallet has ${(walletBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`
      )
    }

    // Seed must be ≤ 32 bytes; wallet-derived address needs no extra keypair signature
    const seed = `stake${Date.now()}`
    const stakeAccountPubkey = await PublicKey.createWithSeed(
      wallet.publicKey,
      seed,
      StakeProgram.programId
    )

    const transaction = new Transaction()
      .add(
        SystemProgram.createAccountWithSeed({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: stakeAccountPubkey,
          basePubkey: wallet.publicKey,
          seed,
          lamports: totalLamports,
          space: StakeProgram.space,
          programId: StakeProgram.programId
        })
      )
      .add(
        StakeProgram.initialize({
          stakePubkey: stakeAccountPubkey,
          authorized: {
            staker: wallet.publicKey,
            withdrawer: wallet.publicKey
          }
        })
      )
      .add(
        StakeProgram.delegate({
          stakePubkey: stakeAccountPubkey,
          authorizedPubkey: wallet.publicKey,
          votePubkey: validatorPubkey
        })
      )

    const signature = await sendWalletTransaction(wallet, transaction)

    return {
      signature,
      stakeAccount: stakeAccountPubkey.toBase58()
    }
  } catch (error) {
    console.error('Error creating and delegating stake:', error)
    throw error
  }
}

export const createAndInitializeStakeAccount = async (stakeLamports) => {
  try {
    const wallet = getCurrentWallet()
    if (!wallet.connected) {
      await connectWallet()
    }

    const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(
      StakeProgram.space
    )

    const totalLamports = stakeLamports + rentExemptionAmount
    const requiredBalance = totalLamports + FEE_BUFFER_LAMPORTS

    const walletBalance = await connection.getBalance(wallet.publicKey)
    if (walletBalance < requiredBalance) {
      throw new Error(
        `Insufficient balance. Need ${(requiredBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL but wallet has ${(walletBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`
      )
    }

    const seed = `stake${Date.now()}`
    const stakeAccountPubkey = await PublicKey.createWithSeed(
      wallet.publicKey,
      seed,
      StakeProgram.programId
    )

    const transaction = new Transaction()
      .add(
        SystemProgram.createAccountWithSeed({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: stakeAccountPubkey,
          basePubkey: wallet.publicKey,
          seed,
          lamports: totalLamports,
          space: StakeProgram.space,
          programId: StakeProgram.programId
        })
      )
      .add(
        StakeProgram.initialize({
          stakePubkey: stakeAccountPubkey,
          authorized: {
            staker: wallet.publicKey,
            withdrawer: wallet.publicKey
          }
        })
      )

    await sendWalletTransaction(wallet, transaction)

    return {
      stakeAccount: stakeAccountPubkey.toBase58()
    }
  } catch (error) {
    console.error('Error creating and initializing stake account:', error)
    throw error
  }
}

export const delegateStake = async (stakeAccountAddress, validatorAddress) => {
  try {
    const wallet = getCurrentWallet()
    if (!wallet.connected) {
      await connectWallet()
    }

    if (!stakeAccountAddress || !validatorAddress) {
      throw new Error('Stake account and validator addresses are required')
    }

    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const validatorPubkey = new PublicKey(validatorAddress)

    const stakeAccount = await connection.getAccountInfo(stakeAccountPubkey)
    if (!stakeAccount) {
      throw new Error('Stake account not found')
    }

    const validatorAccount = await connection.getAccountInfo(validatorPubkey)
    if (!validatorAccount) {
      throw new Error('Validator account not found')
    }

    const transaction = new Transaction().add(
      StakeProgram.delegate({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: wallet.publicKey,
        votePubkey: validatorPubkey
      })
    )

    return await sendWalletTransaction(wallet, transaction)
  } catch (error) {
    console.error('Error delegating stake:', error)
    throw error
  }
}

export const undelegateStake = async (stakeAccountAddress) => {
  try {
    const wallet = getCurrentWallet()
    if (!wallet.connected) {
      await connectWallet()
    }

    if (!stakeAccountAddress) {
      throw new Error('Stake account address is required')
    }

    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)

    const transaction = new Transaction().add(
      StakeProgram.deactivate({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: wallet.publicKey
      })
    )

    return await sendWalletTransaction(wallet, transaction)
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw error
  }
}

// Consolidated withdrawal function (replaces withdrawStake, withdrawStakeMinimal, withdrawStakeDirect)
export const withdrawStake = async (stakeAccountAddress, withdrawAmount = null) => {
  try {
    const wallet = getCurrentWallet()
    if (!wallet.connected) {
      await connectWallet()
    }

    if (!stakeAccountAddress) {
      throw new Error('Stake account address is required')
    }

    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)

    // Check withdrawal readiness
    const readinessCheck = await checkWithdrawalReadiness(stakeAccountAddress)
    if (!readinessCheck.isReady) {
      let errorMessage = readinessCheck.reason
      if (readinessCheck.epochsRemaining && readinessCheck.epochsRemaining > 0) {
        errorMessage += ` (${readinessCheck.epochsRemaining} epochs remaining)`
      }
      throw new Error(errorMessage)
    }

    // Get fresh account info

    const accountInfo = await connection.getAccountInfo(stakeAccountPubkey)
    if (!accountInfo) {
      throw new Error('Stake account not found')
    }
    // Get rent exemption amount
    const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(StakeProgram.space)

    // Calculate safe withdrawal amount
    const safetyBuffer = 5000 // Small safety buffer
    const maxWithdrawable = Math.max(0, accountInfo.lamports - rentExemptAmount - safetyBuffer)

    if (maxWithdrawable <= 0) {
      throw new Error('No withdrawable balance available after rent exemption')
    }

    // Determine withdrawal amount
    let withdrawLamports = withdrawAmount
      ? Math.min(withdrawAmount * LAMPORTS_PER_SOL, maxWithdrawable)
      : maxWithdrawable

    // Create withdrawal instruction
    const withdrawInstruction = StakeProgram.withdraw({
      stakePubkey: stakeAccountPubkey,
      authorizedPubkey: wallet.publicKey,
      toPubkey: wallet.publicKey,
      lamports: withdrawLamports
    })

    const transaction = new Transaction().add(withdrawInstruction)
    transaction.feePayer = wallet.publicKey

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight

    // Simulate transaction
    const simulation = await connection.simulateTransaction(transaction)
    if (simulation.value.err) {
      throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`)
    }

    // Execute transaction
    const signedTransaction = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    })

    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight
      },
      'confirmed'
    )

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
    }

    return {
      signature,
      withdrawnAmount: withdrawLamports / LAMPORTS_PER_SOL,
      remainingBalance: (accountInfo.lamports - withdrawLamports) / LAMPORTS_PER_SOL
    }
  } catch (error) {
    console.error('Error withdrawing stake:', error)

    throw error
  }
}

// Comprehensive function to check if account is ready for withdrawal with detailed epoch info
export const checkWithdrawalReadiness = async (stakeAccountAddress) => {
  try {
    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const epochInfo = await connection.getEpochInfo()
    const currentEpoch = epochInfo.epoch

    // Get parsed account data directly
    const accountInfo = await connection.getParsedAccountInfo(stakeAccountPubkey)

    if (!accountInfo.value) {
      return {
        isReady: false,
        reason: 'Account not found',
        currentEpoch,
        estimatedReadyEpoch: null
      }
    }

    const parsedData = accountInfo.value.data
    if (!parsedData.parsed) {
      return {
        isReady: false,
        reason: 'Account data is not parsed',
        currentEpoch,
        estimatedReadyEpoch: null
      }
    }

    const info = parsedData.parsed.info
    const type = parsedData.parsed.type

    // Handle different account types
    if (type === 'uninitialized') {
      return {
        isReady: false,
        reason: 'Account is uninitialized',
        currentEpoch,
        estimatedReadyEpoch: null
      }
    }

    if (type === 'initialized') {
      // Initialized but not delegated - should be withdrawable
      return {
        isReady: true,
        reason: 'Account is initialized and ready for withdrawal',
        currentEpoch,
        estimatedReadyEpoch: null
      }
    }

    if (type === 'delegated' && info.stake?.delegation) {
      const delegation = info.stake.delegation
      const activationEpoch = parseInt(delegation.activationEpoch || 0)
      const deactivationEpochStr = delegation.deactivationEpoch?.toString()

      let deactivationEpoch = Number.MAX_SAFE_INTEGER
      if (deactivationEpochStr && deactivationEpochStr !== '18446744073709551615') {
        deactivationEpoch = parseInt(deactivationEpochStr)
      }

      if (currentEpoch < activationEpoch) {
        return {
          isReady: false,
          reason: 'Account is still activating',
          currentEpoch,
          activationEpoch,
          estimatedReadyEpoch: activationEpoch,
          epochsRemaining: activationEpoch - currentEpoch
        }
      }

      if (deactivationEpoch === Number.MAX_SAFE_INTEGER) {
        return {
          isReady: false,
          reason: 'Account is active - needs deactivation first',
          currentEpoch,
          activationEpoch,
          estimatedReadyEpoch: null
        }
      }

      if (currentEpoch >= deactivationEpoch) {
        return {
          isReady: true,
          reason: 'Ready for withdrawal (deactivated)',
          currentEpoch,
          activationEpoch,
          deactivationEpoch,
          epochsSinceDeactivation: currentEpoch - deactivationEpoch
        }
      }

      return {
        isReady: false,
        reason: 'Deactivation in progress',
        currentEpoch,
        activationEpoch,
        deactivationEpoch,
        estimatedReadyEpoch: deactivationEpoch,
        epochsRemaining: deactivationEpoch - currentEpoch
      }
    }

    return {
      isReady: false,
      reason: `Unsupported account type: ${type}`,
      currentEpoch,
      estimatedReadyEpoch: null
    }
  } catch (error) {
    console.error('Error checking withdrawal readiness:', error)
    return {
      isReady: false,
      reason: `Error: ${error.message}`,
      currentEpoch: null,
      estimatedReadyEpoch: null
    }
  }
}

// Information and utility functions
export const getSolBalance = async (walletAddress) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }
    const walletPubkey = new PublicKey(walletAddress)
    const balance = await withSolanaRpcFallback((conn) => conn.getBalance(walletPubkey))
    return balance / LAMPORTS_PER_SOL
  } catch (error) {
    console.error('Error getting SOL balance:', error)
    throw new Error(`Failed to get SOL balance: ${error.message}`)
  }
}

export const getAllStakingAccounts = async (walletAddress, validatorAddress) => {
  try {
    if (!walletAddress || !validatorAddress) {
      throw new Error('Wallet address and validator address are required')
    }

    const walletPubkey = new PublicKey(walletAddress)
    const validatorPubkey = new PublicKey(validatorAddress)
    const stakeAccounts = await connection.getParsedProgramAccounts(StakeProgram.programId, {
      filters: [
        {
          memcmp: {
            offset: 44,

            bytes: walletPubkey.toBase58()
          }
        }
      ]
    })

    const stakingAccounts = []

    for (const account of stakeAccounts) {
      try {
        const parsed = account.account.data.parsed
        const info = parsed?.info

        if (
          parsed?.type === 'delegated' &&
          info?.stake?.delegation?.voter === validatorPubkey.toBase58()
        ) {
          const delegatedAmount = parseInt(info?.stake?.delegation?.stake || 0) / LAMPORTS_PER_SOL
          const voterAddress = info?.stake?.delegation?.voter

          // Get activation status using parsed data directly
          const activationStatus = await getStakeActivationFromParsedData(account.account.data)

          stakingAccounts.push({
            address: account.pubkey.toBase58(),
            account: account,
            delegatedAmount: delegatedAmount,
            voterAddress: voterAddress,
            isActive: activationStatus.active > 0,
            activeAmount: activationStatus.active,
            inactiveAmount: activationStatus.inactive,
            state: activationStatus.state
          })
        }
      } catch (error) {
        console.warn('Error processing stake account:', account.pubkey.toBase58(), error)
      }
    }

    return stakingAccounts
  } catch (error) {
    console.error('Error getting all staking accounts:', error)
    throw error
  }
}

export const getTotalStakedAmount = async (walletAddress, validatorAddress) => {
  try {
    if (!walletAddress || !validatorAddress) {
      throw new Error('Wallet address and validator address are required')
    }

    const stakingAccounts = await getAllStakingAccounts(walletAddress, validatorAddress)
    const totalStaked = stakingAccounts.reduce((sum, account) => sum + account.delegatedAmount, 0)
    const delegatedAccounts = stakingAccounts.map((account) => account.address)

    return {
      totalStaked,
      stakeAccounts: stakingAccounts.length,

      delegatedAccounts
    }
  } catch (error) {
    console.error('Error getting total staked amount:', error)
    throw error
  }
}

export const getStakeRewards = async (stakeAccountAddress) => {
  try {
    if (!stakeAccountAddress) {
      throw new Error('Stake account address is required')
    }

    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const epochInfo = await connection.getEpochInfo()
    const currentEpoch = epochInfo.epoch
    const epochs = [currentEpoch - 1, currentEpoch - 2, currentEpoch - 3] // Look at past epochs for rewards

    let totalRewards = 0
    let lastRewardEpoch = null

    // Call getInflationReward for each epoch separately
    for (const epoch of epochs) {
      try {
        const rewards = await connection.getInflationReward([stakeAccountPubkey], epoch)

        if (rewards && rewards.length > 0 && rewards[0] && rewards[0].amount) {
          totalRewards += rewards[0].amount / LAMPORTS_PER_SOL
          if (!lastRewardEpoch) {
            lastRewardEpoch = epoch
          }
        }
      } catch (epochError) {
        // Skip epochs that might not have rewards or cause errors
        console.warn(`Failed to get rewards for epoch ${epoch}:`, epochError.message)
      }
    }

    return {
      amount: totalRewards,
      epoch: lastRewardEpoch,
      currentEpoch: currentEpoch
    }
  } catch (error) {
    console.error('Error getting stake rewards:', error)
    return {
      amount: 0,
      epoch: null,
      currentEpoch: null
    }
  }
}
