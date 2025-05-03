import { Transaction, Connection, PublicKey, SystemProgram } from '@_koii/web3.js'

const KOII_RPC_URL = 'https://mainnet.koii.network'
const connection = new Connection(KOII_RPC_URL)
export const connectWallet = async () => {
  try {
    if (document.readyState !== 'complete') {
      await new Promise((resolve) => window.addEventListener('load', resolve))
    }

    const connectedPublickey = await window.k2.connect()
    console.log('connectedPublickey', connectedPublickey)
    return connectedPublickey
  } catch (error) {
    console.error('Error connecting wallet:', error)
    if (error.code === 'WALLET_NOT_INSTALLED') {
      throw error
    }
    throw new Error(`Failed to connect wallet: ${error.message}`)
  }
}

export const delegateTokens = async (walletAddress, validatorAddress, amount) => {
  try {
    if (!walletAddress || !validatorAddress || !amount) {
      throw new Error('Missing required parameters')
    }

    const fromPubkey = new PublicKey(walletAddress)
    const toPubkey = new PublicKey(validatorAddress)

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: amount * 10 ** 9
      })
    )

    // Get recent blockhash
    const { blockhash } = await connection.getRecentBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromPubkey
    const signature = await window.k2.signAndSendTransaction(transaction)
    const result = await connection.confirmTransaction(signature)

    return signature
  } catch (error) {
    console.error('Error staking tokens:', error)
    throw new Error(`Failed to stake tokens: ${error.message}`)
  }
}

export const getStakingInfo = async (address) => {
  try {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    return {
      stakedAmount: 0,
      rewardsEarned: 0,
      attentionScore: 0,
      lastRewardTime: null
    }
  } catch (error) {
    console.error('Error getting staking info:', error)
    throw new Error(`Failed to get staking information: ${error.message}`)
  }
}

export const getBalance = async (address) => {
  try {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    if (!window.finnie) {
      throw new Error('Finnie wallet is not available')
    }
    return 0
  } catch (error) {
    console.error('Error getting balance:', error)
    throw new Error(`Failed to get balance: ${error.message}`)
  }
}
