import { BrowserProvider, parseEther, formatEther } from 'ethers'

const MOONRIVER_CHAIN_ID = '0x505' // 1285 in hex
const MOONRIVER_RPC_URLS = [
  'https://rpc.api.moonriver.moonbeam.network',
  'https://moonriver.public.blastapi.io',
  'https://moonriver-rpc.dwellir.com'
]

async function getProviderAndSigner() {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask extension')
  }
  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  return { provider, signer }
}

// Connect MetaMask wallet
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask extension')
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })

    await switchToMoonriver()

    return accounts[0]
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw new Error(`Failed to connect wallet: ${error.message}`)
  }
}

// Switch to Moonriver network
const switchToMoonriver = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MOONRIVER_CHAIN_ID }]
    })
  } catch (switchError) {
    // If network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: MOONRIVER_CHAIN_ID,
              chainName: 'Moonriver',
              nativeCurrency: {
                name: 'Moonriver',
                symbol: 'MOVR',
                decimals: 18
              },
              rpcUrls: MOONRIVER_RPC_URLS,
              blockExplorerUrls: ['https://moonriver.subscan.io/']
            }
          ]
        })
      } catch {
        throw new Error('Failed to add Moonriver network')
      }
    } else {
      throw new Error('Failed to switch to Moonriver network')
    }
  }
}

// Get MOVR balance for a wallet address
export const getMovrBalance = async (walletAddress) => {
  try {
    const { provider } = await getProviderAndSigner()
    const balance = await provider.getBalance(walletAddress)
    return parseFloat(formatEther(balance))
  } catch (error) {
    console.error('Error getting MOVR balance:', error)
    throw new Error(`Failed to get MOVR balance: ${error.message}`)
  }
}

// Get total nominated amount (simplified for demo)
export const getTotalNominatedAmount = async (walletAddress, validatorAddress) => {
  try {
    console.log('Getting nomination info for:', walletAddress, validatorAddress)
    return 0
  } catch (error) {
    console.error('Error getting nominated amount:', error)
    throw new Error(`Failed to get nominated amount: ${error.message}`)
  }
}

// Nominate validator (simplified for demo)
export const nominateValidator = async (walletAddress, validatorAddress, amount) => {
  try {
    if (!validatorAddress) {
      throw new Error('Validator address is not configured for Moonriver')
    }

    const { signer } = await getProviderAndSigner()

    console.log('Nominating validator:', validatorAddress, 'with amount:', amount)

    // Simplified demo transfer — real Moonriver staking uses Substrate APIs
    const tx = await signer.sendTransaction({
      to: validatorAddress,
      value: parseEther(amount.toString()),
      gasLimit: 21000
    })

    await tx.wait()
    return tx.hash
  } catch (error) {
    console.error('Error nominating validator:', error)
    throw new Error(`Failed to nominate validator: ${error.message}`)
  }
}

// Unnominate validator (simplified for demo)
export const unnominateValidator = async (walletAddress, validatorAddress, amount) => {
  try {
    const { signer } = await getProviderAndSigner()

    console.log('Unnominating validator:', validatorAddress, 'with amount:', amount)

    const tx = await signer.sendTransaction({
      to: walletAddress,
      value: parseEther('0'),
      gasLimit: 21000
    })

    await tx.wait()
    return tx.hash
  } catch (error) {
    console.error('Error unnominating validator:', error)
    throw new Error(`Failed to unnominate validator: ${error.message}`)
  }
}

// Get staking rewards (simplified for demo)
export const getStakingRewards = async (walletAddress) => {
  try {
    console.log('Getting staking rewards for:', walletAddress)
    return 0
  } catch (error) {
    console.error('Error getting staking rewards:', error)
    return 0
  }
}

export const WalletDisconnect = async () => {
  return true
}
