import { Transaction, Keypair, Connection, PublicKey, SystemProgram, Message } from '@_koii/web3.js'

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

    // const transaction = new Transaction()

    // transaction.add(
    //   SystemProgram.transfer({
    //     fromPubkey: new PublicKey(walletAddress),
    //     toPubkey: new PublicKey(validatorAddress),
    //     lamports: amount * 10 ** 9,
    //   })
    // )

    const fromPubkey = new PublicKey(walletAddress)
    const toPubkey = new PublicKey(validatorAddress)

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: amount * 10 ** 9 // Convert KOII to lamports
      })
    )

    const { blockhash } = await connection.getRecentBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromPubkey

    const message = transaction.compileMessage()
    const serializedTx = Message.from(message)
    const signature = await window.k2.signAndSendTransaction(serializedTx)

    // const signature = await window.k2.signAndSendTransaction(transaction)

    if (!signature || !signature.transactionHash) {
      throw new Error('Failed to send transaction')
    }
    console.log('signature', signature)

    return signature.transactionHash
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

    // In a real implementation, you would fetch this data from the Koii network
    // For now, returning mock data
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

    // In a real implementation, you would fetch the balance from the wallet
    // For now, returning mock data
    return 0
  } catch (error) {
    console.error('Error getting balance:', error)
    throw new Error(`Failed to get balance: ${error.message}`)
  }
}
