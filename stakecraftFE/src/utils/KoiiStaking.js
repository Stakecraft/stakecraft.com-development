import {
  StakeProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  Connection,
  PublicKey,
  SystemProgram
} from '@_koii/web3.js'

const KOII_RPC_URL = 'https://mainnet.koii.network'
const connection = new Connection(KOII_RPC_URL)

export const connectWallet = async () => {
  try {
    if (document.readyState !== 'complete') {
      await new Promise((resolve) => window.addEventListener('load', resolve))
    }
    const connectedPublickey = await window.k2.connect()
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

export const undelegateTokens = async (walletAddress, validatorAddress, amount) => {
  try {
    if (!walletAddress || !validatorAddress || !amount) {
      throw new Error('Missing required parameters')
    }
    const fromPubkey = new PublicKey(validatorAddress)
    const toPubkey = new PublicKey(walletAddress)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: amount * 10 ** 9
      })
    )
    const { blockhash } = await connection.getRecentBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromPubkey
    const signature = await window.k2.signAndSendTransaction(transaction)
    await connection.confirmTransaction(signature)
    return signature
  } catch (error) {
    console.error('Error undelegating tokens:', error)
    throw new Error(`Failed to undelegate tokens: ${error.message}`)
  }
}

export const getTotalStakedAmount = async (walletAddress) => {
  const publicKey = new PublicKey(walletAddress)
  const stakeAccounts = await connection.getAccountInfo(publicKey)
  console.log('stakeAccounts', stakeAccounts)
  return stakeAccounts
}
