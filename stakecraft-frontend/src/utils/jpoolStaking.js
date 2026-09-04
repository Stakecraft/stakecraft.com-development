/**
 * Client-only JPool Direct Stake helpers.
 * @jpool/sdk is imported dynamically so it never enters the SSR/SSG graph.
 * Wallet helpers are inlined (not imported from SolanaStaking.js) so this
 * module does not pull the full native-stake util graph into the JPool chunk.
 */
import {
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'

let currentWallet = null

export const getProvider = () => {
  if (typeof window === 'undefined') throw new Error('No wallet in SSR')
  if (window.solana?.isPhantom) return window.solana
  if (window.solflare) return window.solflare
  throw new Error('No supported wallet found')
}

export const connectWallet = async () => {
  const provider = getProvider()
  await provider.connect()
  currentWallet = provider
  return provider.publicKey
}

export const getCurrentWallet = () => {
  if (!currentWallet) currentWallet = getProvider()
  return currentWallet
}

export const WalletDisconnect = async () => {
  try {
    const wallet = currentWallet || (typeof window !== 'undefined' && (window.solana || window.solflare))
    if (wallet?.disconnect) await wallet.disconnect()
  } finally {
    currentWallet = null
  }
}

export const getSolBalance = async (walletAddress) => {
  if (!walletAddress) throw new Error('Wallet address is required')
  const walletPubkey = new PublicKey(walletAddress)
  const balance = await withRpcFallback((conn) => conn.getBalance(walletPubkey))
  return balance / LAMPORTS_PER_SOL
}

const STAKECRAFT_VOTE = 'BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g'

const SOLANA_RPC_ENDPOINTS = [
  import.meta.env.VITE_HELIUS_RPC_URL,
  'https://solana-rpc.publicnode.com',
  'https://api.mainnet-beta.solana.com'
].filter(Boolean)

const endpoint = SOLANA_RPC_ENDPOINTS[0]
const connection = new Connection(endpoint, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
  wsEndpoint: import.meta.env.VITE_HELIUS_WS_URL || undefined
})

let jpoolModulePromise = null

function loadJpoolSdk() {
  if (!jpoolModulePromise) {
    jpoolModulePromise = import('@jpool/sdk')
  }
  return jpoolModulePromise
}

async function withRpcFallback(fn) {
  let lastError = null
  for (const rpcUrl of SOLANA_RPC_ENDPOINTS) {
    try {
      const conn =
        rpcUrl === endpoint
          ? connection
          : new Connection(rpcUrl, {
              commitment: 'confirmed',
              confirmTransactionInitialTimeout: 60000
            })
      return await fn(conn)
    } catch (error) {
      lastError = error
      console.warn(`JPool RPC failed (${rpcUrl}):`, error?.message || error)
    }
  }
  throw lastError || new Error('All Solana RPC endpoints failed')
}

async function getClient(conn) {
  const { JPoolClient } = await loadJpoolSdk()
  return new JPoolClient(conn)
}

async function sendWithEphemeralSigners(wallet, transaction, signers) {
  return withRpcFallback(async (conn) => {
    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash('confirmed')
    transaction.feePayer = wallet.publicKey
    transaction.recentBlockhash = blockhash

    if (signers?.length) {
      transaction.partialSign(...signers)
    }

    const signed = await wallet.signTransaction(transaction)
    const signature = await conn.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    })

    const confirmation = await conn.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      'confirmed'
    )

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
    }

    return signature
  })
}

export { STAKECRAFT_VOTE, LAMPORTS_PER_SOL }

export async function getPoolQuote() {
  return withRpcFallback(async (conn) => {
    const client = await getClient(conn)
    const poolInfo = await client.poolInfo()
    const rate = client.poolTokenRate(poolInfo)
    return {
      rate,
      depositFee: poolInfo.solDepositFee,
      withdrawFee: poolInfo.solWithdrawalFee,
      totalLamports: Number(poolInfo.totalLamports)
    }
  })
}

export async function getJsolBalance(walletAddress) {
  if (!walletAddress) return 0
  return withRpcFallback(async (conn) => {
    const { POOL_MINT_ADDRESS } = await loadJpoolSdk()
    const owner = new PublicKey(walletAddress)
    const accounts = await conn.getParsedTokenAccountsByOwner(owner, {
      mint: POOL_MINT_ADDRESS
    })
    let total = 0
    for (const { account } of accounts.value) {
      const amount = account.data?.parsed?.info?.tokenAmount?.uiAmount
      if (typeof amount === 'number') total += amount
    }
    return total
  })
}

/**
 * Deposit SOL into JPool directed at StakeCraft (or another vote account).
 * @param {number} solAmount — SOL to deposit
 * @param {string} [voteAddress] — validator vote account
 */
export async function depositSolDirect(solAmount, voteAddress = STAKECRAFT_VOTE) {
  const wallet = getCurrentWallet()
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected')
  }

  const lamports = Math.floor(Number(solAmount) * LAMPORTS_PER_SOL)
  if (!Number.isFinite(lamports) || lamports <= 0) {
    throw new Error('Enter a valid SOL amount')
  }

  const vote = new PublicKey(voteAddress || STAKECRAFT_VOTE)

  return withRpcFallback(async (conn) => {
    const client = await getClient(conn)
    const { instructions, signers } = await client.depositSol({
      from: wallet.publicKey,
      lamports,
      directVote: vote
    })

    const transaction = new Transaction().add(...instructions)
    return sendWithEphemeralSigners(wallet, transaction, signers)
  })
}

/**
 * Burn JSOL for SOL from the pool reserve.
 * @param {number} jsolAmount — pool tokens to burn (UI amount, 9 decimals)
 */
export async function withdrawSol(jsolAmount) {
  const wallet = getCurrentWallet()
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected')
  }

  const amount = Math.floor(Number(jsolAmount) * LAMPORTS_PER_SOL)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Enter a valid JSOL amount')
  }

  return withRpcFallback(async (conn) => {
    const client = await getClient(conn)
    const { instructions, signers } = await client.withdrawSol({
      from: wallet.publicKey,
      amount
    })

    const transaction = new Transaction().add(...instructions)
    return sendWithEphemeralSigners(wallet, transaction, signers)
  })
}

export function estimateJsolFromSol(solAmount, rateLamportsPerToken) {
  const lamports = Number(solAmount) * LAMPORTS_PER_SOL
  if (!rateLamportsPerToken || rateLamportsPerToken <= 0 || !Number.isFinite(lamports)) {
    return null
  }
  return lamports / rateLamportsPerToken / LAMPORTS_PER_SOL
}

export function estimateSolFromJsol(jsolAmount, rateLamportsPerToken) {
  const tokens = Number(jsolAmount)
  if (!rateLamportsPerToken || rateLamportsPerToken <= 0 || !Number.isFinite(tokens)) {
    return null
  }
  return (tokens * rateLamportsPerToken) / LAMPORTS_PER_SOL
}
