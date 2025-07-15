import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  StakeProgram
} from '@solana/web3.js'

const endpoint = 'https://mainnet.helius-rpc.com/?api-key=36e30b3c-0a15-4037-b670-005e3845fcd8'
const connection = new Connection(endpoint, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
  wsEndpoint: 'https://mainnet.helius-rpc.com/?api-key=36e30b3c-0a15-4037-b670-005e3845fcd8'
})

// Global wallet reference
let currentWallet = null

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

      // Check if the delegation is actually active by looking at the delegation state
      // In Solana, if a stake account has been deactivated, it will have a deactivationEpoch set
      const deactivationEpochStr = delegation.deactivationEpoch?.toString()
      const isDeactivated = deactivationEpochStr && deactivationEpochStr !== '18446744073709551615'

      if (isDeactivated) {
        // Account has been deactivated
        state = 'inactive'
        activeStake = 0
        inactiveStake = delegatedAmount
      } else {
        // Account appears to be active
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

// Updated helper function for backward compatibility
const getStakeActivationFromAccountData = async (stakeAccountPubkey) => {
  try {
    // Get parsed account data
    const accounts = await connection.getParsedProgramAccounts(StakeProgram.programId, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: stakeAccountPubkey.toBase58()
          }
        }
      ]
    })

    if (accounts.length === 0) {
      return { state: 'inactive', active: 0, inactive: 0 }
    }

    const account = accounts.find((acc) => acc.pubkey.equals(stakeAccountPubkey))
    if (!account) {
      return { state: 'inactive', active: 0, inactive: 0 }
    }

    return await getStakeActivationFromParsedData(account.account.data)
  } catch (error) {
    console.error('Error getting stake activation from account data:', error)
    return { state: 'error', active: 0, inactive: 0 }
  }
}

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

    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const validatorPubkey = new PublicKey(validatorAddress)

    // Verify stake account exists and is initialized
    const stakeAccount = await connection.getAccountInfo(stakeAccountPubkey)
    if (!stakeAccount) {
      throw new Error('Stake account not found')
    }

    // Verify validator account exists
    const validatorAccount = await connection.getAccountInfo(validatorPubkey)
    if (!validatorAccount) {
      throw new Error('Validator account not found')
    }

    // Check if stake account is already delegated
    try {
      const stakeAccountInfo = await connection.getStakeActivation(stakeAccountPubkey)
      if (stakeAccountInfo.active > 0) {
        throw new Error('Stake account is already delegated')
      }
    } catch (error) {
      console.log('Stake account not yet delegated, proceeding...')
    }

    const delegateInstruction = StakeProgram.delegate({
      stakePubkey: stakeAccountPubkey,
      authorizedPubkey: wallet.publicKey,
      votePubkey: validatorPubkey
    })

    const transaction = new Transaction()
    transaction.add(delegateInstruction)
    transaction.feePayer = wallet.publicKey

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight

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
      throw new Error(`Transaction failed: ${confirmation.value.err}`)
    }

    return signature
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
    const deactivateInstruction = StakeProgram.deactivate({
      stakePubkey: stakeAccountPubkey,
      authorizedPubkey: wallet.publicKey
    })
    const transaction = new Transaction().add(deactivateInstruction)
    transaction.feePayer = wallet.publicKey
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    const signedTransaction = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    })
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    })
    return signature
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw error
  }
}

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
    if (!stakeAccountAddress) {
      throw new Error('Stake account address is required')
    }

    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const epochInfo = await connection.getEpochInfo()
    const currentEpoch = epochInfo.epoch
    const epochs = [currentEpoch, currentEpoch - 1, currentEpoch - 2]
    const rewards = await connection.getInflationReward([stakeAccountPubkey], epochs)

    let totalRewards = 0
    let lastRewardEpoch = null

    if (rewards && rewards.length > 0) {
      for (let i = 0; i < rewards.length; i++) {
        const rewardArray = rewards[i] // This is an array for each epoch
        if (rewardArray && rewardArray[0] && rewardArray[0].amount) {
          totalRewards += rewardArray[0].amount / LAMPORTS_PER_SOL
          lastRewardEpoch = epochs[i]
        }
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

// Helper function to get rewards for multiple stake accounts
export const getMultipleStakeRewards = async (stakeAccountAddresses) => {
  try {
    if (!Array.isArray(stakeAccountAddresses) || stakeAccountAddresses.length === 0) {
      return []
    }

    const results = await Promise.all(
      stakeAccountAddresses.map((address) => getStakeRewards(address))
    )

    return results
  } catch (error) {
    console.error('Error getting multiple stake rewards:', error)
    return stakeAccountAddresses.map(() => ({
      amount: 0,
      epoch: null,
      currentEpoch: null
    }))
  }
}

export const calculateStakingRewards = async (stakeAccountAddress) => {
  try {
    if (!stakeAccountAddress) {
      throw new Error('Stake account address is required')
    }

    const stakeAccountInfo = await getStakeAccountInfo(stakeAccountAddress)
    const currentBalance = stakeAccountInfo.balance
    const delegatedAmount = stakeAccountInfo.stake
    const estimatedRewards = Math.max(0, currentBalance - delegatedAmount)

    return {
      amount: estimatedRewards,
      delegatedAmount: delegatedAmount,
      currentBalance: currentBalance
    }
  } catch (error) {
    console.error('Error calculating staking rewards:', error)
    return {
      amount: 0,
      delegatedAmount: 0,
      currentBalance: 0
    }
  }
}

export const getStakeActivationStatus = async (stakeAccountAddress) => {
  try {
    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    return await getStakeActivationFromAccountData(stakeAccountPubkey)
  } catch (error) {
    console.error('Error getting stake activation status:', error)
    throw error
  }
}

export const getSolBalance = async (walletAddress) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }
    const walletPubkey = new PublicKey(walletAddress)
    const balance = await connection.getBalance(walletPubkey)
    const solBalance = balance / LAMPORTS_PER_SOL
    return solBalance
  } catch (error) {
    console.error('Error getting SOL balance:', error)
    throw new Error(`Failed to get SOL balance: ${error.message}`)
  }
}

export const getAllStakingAccounts = async (walletAddress, validatorAddress) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }
    if (!validatorAddress) {
      throw new Error('Validator address is required')
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
    console.log('--------------')
    console.log('stakingaccounts', stakingAccounts)
    console.log('--------------')

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

// Comprehensive function to get all staking information including rewards
export const getCompleteStakingInfo = async (walletAddress, validatorAddress) => {
  try {
    if (!walletAddress || !validatorAddress) {
      throw new Error('Wallet address and validator address are required')
    }

    // Get all staking accounts
    const stakingAccounts = await getAllStakingAccounts(walletAddress, validatorAddress)

    // Get rewards for all accounts
    const accountAddresses = stakingAccounts.map((account) => account.address)
    const rewards = await getMultipleStakeRewards(accountAddresses)

    // Combine account info with rewards
    const completeInfo = stakingAccounts.map((account, index) => ({
      ...account,
      rewards: rewards[index] || { amount: 0, epoch: null, currentEpoch: null }
    }))

    // Calculate totals
    const totalActiveStake = completeInfo.reduce((sum, account) => sum + account.activeAmount, 0)
    const totalInactiveStake = completeInfo.reduce(
      (sum, account) => sum + account.inactiveAmount,
      0
    )
    const totalRewards = completeInfo.reduce((sum, account) => sum + account.rewards.amount, 0)

    return {
      accounts: completeInfo,
      summary: {
        totalAccounts: completeInfo.length,
        activeAccounts: completeInfo.filter((account) => account.isActive).length,
        inactiveAccounts: completeInfo.filter((account) => !account.isActive).length,
        totalActiveStake,
        totalInactiveStake,
        totalStake: totalActiveStake + totalInactiveStake,
        totalRewards
      }
    }
  } catch (error) {
    console.error('Error getting complete staking info:', error)
    throw error
  }
}
