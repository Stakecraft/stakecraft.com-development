import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  StakeProgram
} from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'

const network = WalletAdapterNetwork.Mainnet
const endpoint = 'https://mainnet.helius-rpc.com/?api-key=36e30b3c-0a15-4037-b670-005e3845fcd8'
const connection = new Connection(endpoint, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
  wsEndpoint: 'https://mainnet.helius-rpc.com/?api-key=36e30b3c-0a15-4037-b670-005e3845fcd8'
})

// Global wallet reference
let currentWallet = null

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
    return window.solflare
  }
  throw new Error('No supported wallet found')
}

export const connectWallet = async () => {
  try {
    console.log('start connect wallet part')

    const provider = getProvider()
    console.log('provider', provider)

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
    
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, 'confirmed')
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`)
    }
    
    return signature
  } catch (error) {
    console.error('Error delegating stake:', error)
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
