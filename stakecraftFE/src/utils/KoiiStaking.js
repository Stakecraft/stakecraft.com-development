// import {
//   StakeProgram,
//   LAMPORTS_PER_SOL,
//   Transaction,
//   Connection,
//   PublicKey,
//   SystemProgram
// } from '@_koii/web3.js'

// const KOII_RPC_URL = 'https://mainnet.koii.network'
// const connection = new Connection(KOII_RPC_URL)

// export const connectWallet = async () => {
//   try {
//     if (document.readyState !== 'complete') {
//       await new Promise((resolve) => window.addEventListener('load', resolve))
//     }
//     const connectedPublickey = await window.k2.connect()
//     return connectedPublickey
//   } catch (error) {
//     console.error('Error connecting wallet:', error)
//     if (error.code === 'WALLET_NOT_INSTALLED') {
//       throw error
//     }
//     throw new Error(`Failed to connect wallet: ${error.message}`)
//   }
// }

// export const delegateTokens = async (walletAddress, validatorAddress, amount) => {
//   try {
//     if (!walletAddress || !validatorAddress || !amount) {
//       throw new Error('Missing required parameters')
//     }
//     const fromPubkey = new PublicKey(walletAddress)
//     const toPubkey = new PublicKey(validatorAddress)
//     const transaction = new Transaction().add(
//       SystemProgram.transfer({
//         fromPubkey,
//         toPubkey,
//         lamports: amount * 10 ** 9
//       })
//     )
//     const { blockhash } = await connection.getRecentBlockhash()
//     transaction.recentBlockhash = blockhash
//     transaction.feePayer = fromPubkey
//     const signature = await window.k2.signAndSendTransaction(transaction)
//     const result = await connection.confirmTransaction(signature)
//     return signature
//   } catch (error) {
//     console.error('Error staking tokens:', error)
//     throw new Error(`Failed to stake tokens: ${error.message}`)
//   }
// }

// export const undelegateTokens = async (walletAddress, validatorAddress) => {
//   try {
//     if (!walletAddress || !validatorAddress ) {
//       throw new Error('Missing required parameters')
//     }
//     console.log('start the undelegate');
//     console.log('walletAddress', walletAddress);
//     console.log('validatorAddress', validatorAddress);

//     const authorizedPubkey = new PublicKey(walletAddress)
//     const stakePubkey = new PublicKey(validatorAddress)

//     const transaction = new Transaction().add(StakeProgram.deactivate({
//       stakePubkey,
//       authorizedPubkey
//     }))
//     console.log('transaction', transaction);
//     const { blockhash } = await connection.getRecentBlockhash()
//     transaction.recentBlockhash = blockhash
//     transaction.feePayer = authorizedPubkey
//     const signature = await window.k2.signAndSendTransaction(transaction)
//     await connection.confirmTransaction(signature)
//     return signature
//   } catch (error) {
//     console.error('Error undelegating tokens:', error)
//     throw new Error(`Failed to undelegate tokens: ${error.message}`)
//   }
// }

// export const getTotalStakedAmount = async (walletAddress) => {
//   const publicKey = new PublicKey(walletAddress)
//   const stakeAccounts = await connection.getAccountInfo(publicKey)
//   console.log('stakeAccounts', stakeAccounts)
//   return stakeAccounts
// }

// ================================================================
// ================================================================
// ================================================================
// ================================================================
// ================================================================
// ================================================================

import {
  StakeProgram,
  Transaction,
  Connection,
  PublicKey,
  Keypair, // new
  LAMPORTS_PER_SOL
} from '@_koii/web3.js'

const KOII_RPC_URL = 'https://mainnet.koii.network'
const connection = new Connection(KOII_RPC_URL)

export const connectWallet = async () => {
  const connectedPublickey = await window.k2.connect()
  return connectedPublickey
}

export const delegateTokens = async (walletAddress, validatorVoteAddress, amountSol) => {
  const fromPubkey = new PublicKey(walletAddress)
  const votePubkey = new PublicKey(validatorVoteAddress)
  const stakeAccount = Keypair.generate() 

  const rentExempt = await connection.getMinimumBalanceForRentExemption(StakeProgram.space)

  console.log('amountSol', amountSol)
  console.log('LAMPORTS_PER_SOL', LAMPORTS_PER_SOL)
  console.log('rentExempt', rentExempt)
  const lamports = rentExempt + amountSol * LAMPORTS_PER_SOL

  console.log('lamports', lamports)

  const tx = new Transaction()
    .add(
      StakeProgram.createAccount({
        fromPubkey,
        stakePubkey: stakeAccount.publicKey,
        authorized: { staker: fromPubkey, withdrawer: fromPubkey },
        lamports: lamports * 10 ** 9
      })
    )
    .add(
      StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: fromPubkey,
        votePubkey
      })
    )

  tx.feePayer = fromPubkey
  const { blockhash } = await connection.getRecentBlockhash()
  tx.recentBlockhash = blockhash
  const sig = await window.k2.signAndSendTransaction(tx, [stakeAccount])
  const result = await connection.confirmTransaction(sig, 'finalized')
  console.log('result', result)
  console.log('sig', sig)
  return { sig, stakeAccount: stakeAccount.publicKey.toBase58() }
}

export const undelegateTokens = async (walletAddress, stakeAccountAddress) => {
  const authorizedPubkey = new PublicKey(walletAddress)
  const stakePubkey = new PublicKey(stakeAccountAddress)

  let tx = StakeProgram.deactivate({
    stakePubkey: stakePubkey,
    authorizedPubkey: authorizedPubkey
  })

  console.log('============== tx ==============', tx)

  try {
    const { blockhash } = await connection.getRecentBlockhash()
    tx.recentBlockhash = blockhash
    tx.feePayer = authorizedPubkey
    console.log('============== tx again ==============', tx)
    let txHash = await window.k2?.signAndSendTransaction(tx, [])

    console.log('txHash', txHash)
    return txHash
  } catch (error) {
    console.error(error)
  }
}

export const getTotalStakedAmount = async (walletAddress) => {
  const publicKey = new PublicKey(walletAddress)
  const stakeAccounts = await connection.getAccountInfo(publicKey)
  console.log('stakeAccounts', stakeAccounts)
  return stakeAccounts
}
