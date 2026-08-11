/**
 * On-page liquid/direct stake helpers for JPool, SolBlaze CLS, and The Vault.
 * Reuses Phantom/Solflare via SolanaStaking wallet helpers.
 *
 * Heavy Solana SDKs (@jpool/sdk, @solana/spl-stake-pool) are loaded lazily so
 * vite-ssg / Node SSR never evaluates their broken buffer-layout graph.
 */
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  VersionedTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import { connectWallet, getCurrentWallet, getProvider } from './SolanaStaking.js'

const SOLANA_RPC_ENDPOINTS = [
  import.meta.env.VITE_HELIUS_RPC_URL,
  'https://solana-rpc.publicnode.com',
  'https://api.mainnet-beta.solana.com'
].filter(Boolean)

const BLAZESTAKE_POOL = new PublicKey('stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi')
const SOLPAY_API_ACTIVATION = new PublicKey('7f18MLpvAp48ifA1B8q8FBdrGQhyt9u5Lku2VBYejzJL')
const MEMO_PROGRAM = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')
const VSOL_MINT = 'vSoLxydx6akxyMD9XEcPvGYNGq6Nn66oqVb3UkGkei7'
const VAULT_STAKE_API = 'https://direct.vaultapi.dev/stake'

const FEE_BUFFER_LAMPORTS = 20_000
const MIN_STAKE_SOL = 0.01

function getConnection() {
  return new Connection(SOLANA_RPC_ENDPOINTS[0], {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60_000
  })
}

async function ensureWallet() {
  if (typeof window === 'undefined') {
    throw new Error('Wallet staking is only available in the browser')
  }
  try {
    getProvider()
  } catch {
    throw new Error('Install Phantom or Solflare to stake on this page')
  }
  const wallet = getCurrentWallet()
  if (!wallet?.publicKey) {
    await connectWallet()
  }
  return getCurrentWallet()
}

async function sendLegacyTransaction(connection, wallet, transaction, signers = []) {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = blockhash
  if (signers.length) transaction.partialSign(...signers)

  let signature
  if (typeof wallet.signAndSendTransaction === 'function') {
    const result = await wallet.signAndSendTransaction(transaction)
    signature = typeof result === 'string' ? result : result.signature
  } else {
    const signed = await wallet.signTransaction(transaction)
    signature = await connection.sendRawTransaction(signed.serialize(), {
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

async function sendSerializedTx(connection, wallet, rawBase64) {
  const bytes = Uint8Array.from(atob(rawBase64), (c) => c.charCodeAt(0))
  try {
    const vtx = VersionedTransaction.deserialize(bytes)
    let signature
    if (typeof wallet.signAndSendTransaction === 'function') {
      const result = await wallet.signAndSendTransaction(vtx)
      signature = typeof result === 'string' ? result : result.signature
    } else {
      const signed = await wallet.signTransaction(vtx)
      signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      })
    }
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
    return signature
  } catch {
    const tx = Transaction.from(bytes)
    return sendLegacyTransaction(connection, wallet, tx)
  }
}

function parseSolAmount(amountSol) {
  const n = Number(amountSol)
  if (!Number.isFinite(n) || n < MIN_STAKE_SOL) {
    throw new Error(`Minimum stake is ${MIN_STAKE_SOL} SOL`)
  }
  return Math.round(n * LAMPORTS_PER_SOL)
}

export async function getWalletSolBalance() {
  const wallet = await ensureWallet()
  const connection = getConnection()
  const lamports = await connection.getBalance(wallet.publicKey)
  return lamports / LAMPORTS_PER_SOL
}

export async function stakeJpoolDirect({ amountSol, voteAccount }) {
  const wallet = await ensureWallet()
  const connection = getConnection()
  const lamports = parseSolAmount(amountSol)
  const balance = await connection.getBalance(wallet.publicKey)
  if (balance < lamports + FEE_BUFFER_LAMPORTS) {
    throw new Error('Insufficient SOL for stake + fees')
  }

  const { JPoolClient } = await import('@jpool/sdk')
  const client = new JPoolClient(connection)
  const { instructions, signers } = await client.depositSol({
    from: wallet.publicKey,
    lamports,
    directVote: new PublicKey(voteAccount)
  })

  const transaction = new Transaction().add(...instructions)
  return sendLegacyTransaction(connection, wallet, transaction, signers || [])
}

export async function stakeSolblazeCls({ amountSol, voteAccount }) {
  const wallet = await ensureWallet()
  const connection = getConnection()
  const lamports = parseSolAmount(amountSol)
  const balance = await connection.getBalance(wallet.publicKey)
  if (balance < lamports + 5_000 + FEE_BUFFER_LAMPORTS) {
    throw new Error('Insufficient SOL for stake + fees')
  }

  try {
    const update = await fetch(
      'https://stake.solblaze.org/api/v1/update_pool?network=mainnet-beta'
    )
    if (!update.ok) throw new Error('update_pool failed')
  } catch {
    /* pool update is best-effort */
  }

  const { depositSol, stakePoolInfo } = await import('@solana/spl-stake-pool')

  const info = await stakePoolInfo(connection, BLAZESTAKE_POOL)
  if (info?.details?.updateRequired) {
    await fetch('https://stake.solblaze.org/api/v1/update_pool?network=mainnet-beta')
  }

  const depositTx = await depositSol(
    connection,
    BLAZESTAKE_POOL,
    wallet.publicKey,
    lamports,
    undefined,
    wallet.publicKey
  )

  const memo = JSON.stringify({
    type: 'cls/validator_stake/lamports',
    value: { validator: voteAccount }
  })
  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM,
    data: new TextEncoder().encode(memo)
  })

  const transaction = new Transaction()
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: SOLPAY_API_ACTIVATION,
      lamports: 5000
    })
  )
  transaction.add(...depositTx.instructions)
  transaction.add(memoInstruction)

  const signature = await sendLegacyTransaction(
    connection,
    wallet,
    transaction,
    depositTx.signers || []
  )

  await fetch(
    `https://stake.solblaze.org/api/v1/cls_stake?validator=${encodeURIComponent(voteAccount)}&txid=${encodeURIComponent(signature)}`
  )

  return signature
}

export async function stakeVaultDirect({ amountSol, voteAccount }) {
  const wallet = await ensureWallet()
  const connection = getConnection()
  const lamports = parseSolAmount(amountSol)
  const balance = await connection.getBalance(wallet.publicKey)
  if (balance < lamports + FEE_BUFFER_LAMPORTS) {
    throw new Error('Insufficient SOL for stake + fees')
  }

  const params = new URLSearchParams({
    address: wallet.publicKey.toBase58(),
    mint: VSOL_MINT,
    amount: String(lamports),
    balance: String(balance),
    target: voteAccount
  })
  const response = await fetch(`${VAULT_STAKE_API}?${params}`)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload?.transaction) {
    throw new Error(payload?.error || `Vault API error (${response.status})`)
  }

  return sendSerializedTx(connection, wallet, payload.transaction)
}

export const POOL_STAKE_HANDLERS = {
  jpool: stakeJpoolDirect,
  solblaze: stakeSolblazeCls,
  vault: stakeVaultDirect
}

export { MIN_STAKE_SOL, connectWallet, getProvider }
