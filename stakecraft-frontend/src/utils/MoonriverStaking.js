import { ethers } from 'ethers'

const MOONRIVER_CHAIN_ID = '0x505' // 1285 in hex
const MOONRIVER_RPC_URLS = [
  'https://rpc.api.moonriver.moonbeam.network',
  'https://moonriver.public.blastapi.io',
  'https://moonriver-rpc.dwellir.com'
]

// Connect MetaMask wallet
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask extension')
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })

    // Switch to Moonriver network
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
      } catch (addError) {
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
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(walletAddress)
    // Convert from Wei to MOVR
    return parseFloat(ethers.utils.formatEther(balance))
  } catch (error) {
    console.error('Error getting MOVR balance:', error)
    throw new Error(`Failed to get MOVR balance: ${error.message}`)
  }
}

// Get total nominated amount (simplified for demo)
export const getTotalNominatedAmount = async (walletAddress, validatorAddress) => {
  try {
    // In a real implementation, this would query the Substrate staking pallet
    // For demo purposes, returning 0
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
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    // In a real implementation, this would interact with the Substrate staking pallet
    // For demo purposes, we'll create a simple transaction

    console.log('Nominating validator:', validatorAddress, 'with amount:', amount)

    // This is a simplified example - real implementation would use Substrate APIs
    const tx = await signer.sendTransaction({
      to: validatorAddress,
      value: ethers.utils.parseEther(amount.toString()),
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
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    console.log('Unnominating validator:', validatorAddress, 'with amount:', amount)

    // In a real implementation, this would interact with the Substrate staking pallet
    // For demo purposes, we'll create a simple transaction

    const tx = await signer.sendTransaction({
      to: walletAddress, // Sending back to self as demo
      value: ethers.utils.parseEther('0'), // No value transfer in unnomination
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
    // In a real implementation, this would query the Substrate rewards pallet
    console.log('Getting staking rewards for:', walletAddress)
    return 0
  } catch (error) {
    console.error('Error getting staking rewards:', error)
    return 0
  }
}
