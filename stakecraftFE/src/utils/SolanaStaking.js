import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import { StakeProgram } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'

const network = WalletAdapterNetwork.Mainnet
const endpoint = 'https://mainnet.helius-rpc.com/?api-key=36e30b3c-0a15-4037-b670-005e3845fcd8'
const connection = new Connection(endpoint, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
  wsEndpoint: 'https://mainnet.helius-rpc.com/?api-key=36e30b3c-0a15-4037-b670-005e3845fcd8'
})

const wallet = new PhantomWalletAdapter()

export const connectWallet = async () => {
  try {
    await wallet.connect()
    return wallet.publicKey
  } catch (error) {
    console.error('Error connecting wallet:', error)
    throw error
  }
}

export const getStakeAccountInfo = async (stakeAccountAddress) => {
  try {
    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const stakeAccountInfo = await connection.getAccountInfo(stakeAccountPubkey)
    return stakeAccountInfo
  } catch (error) {
    console.error('Error getting stake account info:', error)
    throw error
  }
}

export const delegateStake = async (stakeAccountAddress, validatorAddress, amount) => {
  try {
    if (!wallet.connected) {
      await connectWallet()
    }

    const stakeAccountPubkey = new PublicKey(stakeAccountAddress)
    const validatorPubkey = new PublicKey(validatorAddress)

    const delegateInstruction = StakeProgram.delegate({
      stakePubkey: stakeAccountPubkey,
      authorizedPubkey: wallet.publicKey,
      votePubkey: validatorPubkey
    })

    const transaction = new Transaction().add(delegateInstruction)
    transaction.feePayer = wallet.publicKey

    let retries = 3
    let blockhash
    while (retries > 0) {
      try {
        blockhash = await connection.getLatestBlockhash({ commitment: 'confirmed' })
        break
      } catch (error) {
        retries--
        if (retries === 0) throw error
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
    transaction.recentBlockhash = blockhash.blockhash
    transaction.lastValidBlockHeight = blockhash.lastValidBlockHeight
    
    const signedTransaction = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())

    return signature
  } catch (error) {
    console.error('Error delegating stake:', error)
    throw error
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
