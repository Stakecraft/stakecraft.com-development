import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  StakeProgram
} from '@solana/web3.js'
<<<<<<< HEAD
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'

const network = WalletAdapterNetwork.Mainnet
=======

>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
const endpoint = 'https://mainnet.helius-rpc.com/?api-key=36e30b3c-0a15-4037-b670-005e3845fcd8'
const connection = new Connection(endpoint, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
  wsEndpoint: 'https://mainnet.helius-rpc.com/?api-key=36e30b3c-0a15-4037-b670-005e3845fcd8'
})

// Global wallet reference
let currentWallet = null

<<<<<<< HEAD
export const connectPhantomWallet = async () => {
  try {
    const { solana } = window

    if (solana?.isPhantom) {
      const response = await solana.connect({ onlyIfTrusted: false })
      return response.publicKey
    } else {
      throw new Error('Phantom wallet not found')
    }
  } catch (error) {
    console.error('Error connecting to Phantom wallet:', error)
    throw error
  }
}

export const connectSolflareWallet = async () => {
  try {
    const { solflare } = window
    console.log('solflare', solflare)

    if (solflare) {
      await solflare.connect()
      return solflare.publicKey
    } else {
      throw new Error('Solflare wallet not found')
    }
  } catch (error) {
    console.error('Error connecting to Solflare wallet:', error)
    throw error
  }
}

export const getProvider = () => {
  if (window.solana?.isPhantom) {
    console.log('phantom wallet detected')
    return window.solana
  } else if (window.solflare) {
    console.log('Solflare wallet detected')
=======
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
>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
    return window.solflare
  }
  throw new Error('No supported wallet found')
}

export const connectWallet = async () => {
  try {
<<<<<<< HEAD
    console.log('start connect wallet part')

    const provider = getProvider()
    console.log('provider', provider)

=======
    const provider = getProvider()
>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
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

<<<<<<< HEAD
=======
// Core staking functions
>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
export const createAndInitializeStakeAccount = async (stakeLamports) => {
  try {
    const wallet = getCurrentWallet()
    if (!wallet.connected) {
      await connectWallet()
    }

    const stakeAccountKeypair = Keypair.generate()

    // Calculate rent exemption
    const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(
      StakeProgram.space
    )

    const totalLamports = stakeLamports + rentExemptionAmount

    const walletBalance = await connection.getBalance(wallet.publicKey)
    if (walletBalance < totalLamports) {
      throw new Error(
        `Insufficient balance. Need ${totalLamports / LAMPORTS_PER_SOL} SOL but wallet has ${walletBalance / LAMPORTS_PER_SOL} SOL`
      )
    }

    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: stakeAccountKeypair.publicKey,
      lamports: totalLamports,
      space: StakeProgram.space,
      programId: StakeProgram.programId
    })

    const initializeInstruction = StakeProgram.initialize({
      stakePubkey: stakeAccountKeypair.publicKey,
      authorized: {
        staker: wallet.publicKey,
        withdrawer: wallet.publicKey
      }
    })

    const transaction = new Transaction().add(createAccountInstruction).add(initializeInstruction)
    transaction.feePayer = wallet.publicKey

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight

    // Sign with stake account first, then wallet/provider
    transaction.partialSign(stakeAccountKeypair)
    const signedTransaction = await wallet.signTransaction(transaction)

    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    })

    const confirmation = await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      'confirmed'
    )

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`)
    }

    // Give the network a brief moment to register the account
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return {
      stakeAccount: stakeAccountKeypair.publicKey.toBase58()
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
<<<<<<< HEAD
    
    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const validatorPubkey = new PublicKey(validatorAddress)
    
=======

    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const validatorPubkey = new PublicKey(validatorAddress)

>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
    // Verify stake account exists and is initialized
    const stakeAccount = await connection.getAccountInfo(stakeAccountPubkey)
    if (!stakeAccount) {
      throw new Error('Stake account not found')
    }
<<<<<<< HEAD
    
=======

>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
    // Verify validator account exists
    const validatorAccount = await connection.getAccountInfo(validatorPubkey)
    if (!validatorAccount) {
      throw new Error('Validator account not found')
    }
<<<<<<< HEAD
    
    // Check if stake account is already delegated
    try {
      const stakeAccountInfo = await connection.getStakeActivation(stakeAccountPubkey)
      if (stakeAccountInfo.active > 0) {
        throw new Error('Stake account is already delegated')
      }
    } catch (error) {
      console.log('Stake account not yet delegated, proceeding...')
    }
    
=======

>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
    const delegateInstruction = StakeProgram.delegate({
      stakePubkey: stakeAccountPubkey,
      authorizedPubkey: wallet.publicKey,
      votePubkey: validatorPubkey
    })
<<<<<<< HEAD
    
    const transaction = new Transaction()
    transaction.add(delegateInstruction)
    transaction.feePayer = wallet.publicKey
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight
    
=======

    const transaction = new Transaction().add(delegateInstruction)
    transaction.feePayer = wallet.publicKey

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight

>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
    const signedTransaction = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    })
<<<<<<< HEAD
    
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, 'confirmed')
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`)
    }
    
=======

    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight
      },
      'confirmed'
    )

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`)
    }

>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
    return signature
  } catch (error) {
    console.error('Error delegating stake:', error)
    throw error
  }
}

<<<<<<< HEAD
export const getStakeAccountInfo = async (stakeAccountAddress) => {
  try {
    if (!stakeAccountAddress) {
      throw new Error('Stake account address is required')
    }
    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const accountInfo = await connection.getAccountInfo(stakeAccountPubkey)
    if (!accountInfo) {
      throw new Error('Stake account not found')
    }
    const stakeInfo = {
      address: stakeAccountAddress,
      balance: accountInfo.lamports / LAMPORTS_PER_SOL,
      delegatedVoteAccountAddress: null,
      stake: 0,
      state: '',
      active: 0,
      inactive: 0
    }
    if (accountInfo.data.length > 0) {
      try {
        const stakeAccount = StakeProgram.decode(accountInfo.data)
        if (stakeAccount?.stake?.delegation) {
          stakeInfo.delegatedVoteAccountAddress =
            stakeAccount.stake.delegation.voterPubkey?.toBase58()
          stakeInfo.stake = stakeAccount.stake.delegation.stake / LAMPORTS_PER_SOL
          stakeInfo.state = stakeAccount.stake.delegation.voterPubkey ? 'active' : 'inactive'
          stakeInfo.active = stakeAccount.stake.delegation.stake / LAMPORTS_PER_SOL
        }
      } catch (error) {
        console.warn('Could not decode stake account data:', error.message)
      }
    }

    return stakeInfo
  } catch (error) {
    console.error('Error getting stake account info:', error)
    throw error
  }
}

export const getStakingInfo = async (stakeAccountAddress) => {
  const stakeAccountInfo = await getStakeAccountInfo(stakeAccountAddress)
  const stakeRewards = await getStakeRewards(stakeAccountAddress)
  return {
    ...stakeAccountInfo,
    rewardsEarned: stakeRewards
  }
}

export const getStakeRewards = async (stakeAccountAddress) => {
  try {
    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const rewards = await connection.getInflationReward([stakeAccountPubkey])
    return rewards[0]
  } catch (error) {
    console.error('Error getting stake rewards:', error)
    throw error
  }
}

export const getStakeActivationStatus = async (stakeAccountAddress) => {
  try {
    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const stakeActivation = await connection.getStakeActivation(stakeAccountPubkey)
    return {
      state: stakeActivation.state,
      active: stakeActivation.active / LAMPORTS_PER_SOL,
      inactive: stakeActivation.inactive / LAMPORTS_PER_SOL
    }
  } catch (error) {
    console.error('Error getting stake activation status:', error)
    throw error
  }
}

export const getTotalStakedAmount = async (walletAddress, validatorAddress) => {
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
            offset: 44, // Offset to the authorized staker field
            bytes: walletPubkey.toBase58()
          }
        }
      ]
    })
    let totalStaked = 0
    let delegatedAccounts = []
    for (const account of stakeAccounts) {
      const parsed = account.account.data.parsed
      const info = parsed?.info
      if (
        parsed?.type === 'delegated' &&
        info?.stake?.delegation?.voter === validatorPubkey.toBase58()
      ) {
        const delegatedLamports = parseInt(info?.stake?.delegation?.stake || 0)
        totalStaked += delegatedLamports / LAMPORTS_PER_SOL
        delegatedAccounts.push(account.pubkey.toBase58())
      }
    }

    return {
      totalStaked,
      stakeAccounts: stakeAccounts.length,
      delegatedAccounts
    }
  } catch (error) {
    console.error('Error getting total staked amount:', error)
    throw error
  }
}

=======
>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
export const undelegateStake = async (stakeAccountAddress) => {
  try {
    const wallet = getCurrentWallet()
    if (!wallet.connected) {
      await connectWallet()
    }

    if (!stakeAccountAddress) {
      throw new Error('Stake account address is required')
    }
<<<<<<< HEAD
    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
=======

    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)

>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
    const deactivateInstruction = StakeProgram.deactivate({
      stakePubkey: stakeAccountPubkey,
      authorizedPubkey: wallet.publicKey
    })
<<<<<<< HEAD
    const transaction = new Transaction().add(deactivateInstruction)
    transaction.feePayer = wallet.publicKey
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
=======

    const transaction = new Transaction().add(deactivateInstruction)
    transaction.feePayer = wallet.publicKey

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight

>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
    const signedTransaction = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    })
<<<<<<< HEAD
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    })
=======

    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight
      },
      'confirmed'
    )

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`)
    }

>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
    return signature
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw error
  }
}
<<<<<<< HEAD
=======

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
    const balance = await connection.getBalance(walletPubkey)
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
>>>>>>> b083905059a8bae0e16c7015d2c510c1126c098e
