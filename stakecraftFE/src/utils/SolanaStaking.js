import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  StakeProgram,
  // StakeInstruction,
  // StakeState
} from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'

// const network = WalletAdapterNetwork.Mainnet
// const endpoint = 'https://mainnet.helius-rpc.com/?api-key=36e30b3c-0a15-4037-b670-005e3845fcd8'
// const connection = new Connection(endpoint, {
//   commitment: 'confirmed',
//   confirmTransactionInitialTimeout: 60000,
//   wsEndpoint: 'https://mainnet.helius-rpc.com/?api-key=36e30b3c-0a15-4037-b670-005e3845fcd8'
// })

const network = WalletAdapterNetwork.Testnet
const endpoint = 'https://api.testnet.solana.com'
const connection = new Connection(endpoint, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000
})

const wallet = new PhantomWalletAdapter()

// Connect wallet
export const connectWallet = async () => {
  try {
    await wallet.connect()
    return wallet.publicKey
  } catch (error) {
    console.error('Error connecting wallet:', error)
    throw error
  }
}

// Create and initialize stake account
export const createAndInitializeStakeAccount = async (amount) => {
  try {
    if (!wallet.connected) {
      await connectWallet()
    }

    // Generate new stake account keypair
    const stakeAccountKeypair = Keypair.generate()

    // Get minimum rent exemption
    // const minimumRentExemption = await connection.getMinimumBalanceForRentExemption(
    //   StakeProgram.space
    // )

    // Calculate total amount needed
    // const totalAmount = amount + minimumRentExemption

    // Check wallet balance
    const walletBalance = await connection.getBalance(wallet.publicKey)
    if (walletBalance < amount) {
      throw new Error(`Insufficient balance. Need ${amount / LAMPORTS_PER_SOL} SOL but wallet has ${walletBalance / LAMPORTS_PER_SOL} SOL`)
    }

    // Create account instruction
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: stakeAccountKeypair.publicKey,
      lamports: amount,
      space: StakeProgram.space,
      programId: StakeProgram.programId
    })

    // Initialize stake instruction
    const initializeInstruction = StakeProgram.initialize({
      stakePubkey: stakeAccountKeypair.publicKey,
      authorized: {
        staker: wallet.publicKey,
        withdrawer: wallet.publicKey
      }
    })

    // Create transaction and add instructions
    const transaction = new Transaction()
      .add(createAccountInstruction)
      .add(initializeInstruction)

    transaction.feePayer = wallet.publicKey

    // Get recent blockhash
    const blockhash = await connection.getLatestBlockhash({ commitment: 'confirmed' })
    transaction.recentBlockhash = blockhash.blockhash
    transaction.lastValidBlockHeight = blockhash.lastValidBlockHeight

    // Sign transaction with both wallet and stake account
    const signedTransaction = await wallet.signTransaction(transaction)
    signedTransaction.partialSign(stakeAccountKeypair)

    // Send and confirm transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    })

    await connection.confirmTransaction({
      signature,
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight
    })

    return {
      stakeAccount: stakeAccountKeypair.publicKey.toBase58()
    }
  } catch (error) {
    console.error('Error creating and initializing stake account:', error)
    throw error
  }
}

// Get stake account information
export const getStakeAccountInfo = async (stakeAccountAddress) => {
  try {
    if (!stakeAccountAddress) {
      throw new Error('Stake account address is required')
    }

    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    
    // Get account info
    const accountInfo = await connection.getAccountInfo(stakeAccountPubkey)
    if (!accountInfo) {
      throw new Error('Stake account not found')
    }
    
    // Get basic stake info
    const stakeInfo = {
      address: stakeAccountAddress,
      balance: accountInfo.lamports / LAMPORTS_PER_SOL,
      delegatedVoteAccountAddress: null,
      stake: 0,
      state: 'inactive',
      active: 0,
      inactive: 0
    }

    // Try to decode stake account data if it exists
    if (accountInfo.data.length > 0) {
      try {
        const stakeAccount = StakeProgram.decode(accountInfo.data)
        if (stakeAccount?.stake?.delegation) {
          stakeInfo.delegatedVoteAccountAddress = stakeAccount.stake.delegation.voterPubkey?.toBase58()
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

// Delegate stake
export const delegateStake = async (stakeAccountAddress, validatorAddress) => {
  try {
    if (!wallet.connected) {
      await connectWallet()
    }

    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const validatorPubkey = new PublicKey(validatorAddress)

    // Create delegate instruction
    const delegateInstruction = StakeProgram.delegate({
      stakePubkey: stakeAccountPubkey,
      authorizedPubkey: wallet.publicKey,
      votePubkey: validatorPubkey
    })

    // Create and setup transaction
    const transaction = new Transaction().add(delegateInstruction)
    transaction.feePayer = wallet.publicKey

    // Get recent blockhash
    const blockhash = await connection.getLatestBlockhash({ commitment: 'confirmed' })
    transaction.recentBlockhash = blockhash.blockhash
    transaction.lastValidBlockHeight = blockhash.lastValidBlockHeight

    // Sign and send transaction
    const signedTransaction = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    })

    // Wait for confirmation
    await connection.confirmTransaction({
      signature,
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight
    })

    return signature
  } catch (error) {
    console.error('Error delegating stake:', error)
    throw error
  }
}

// Get stake rewards
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

// Get stake activation status
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