import { ethers } from 'ethers'
import { StakingContractABI } from '../constants/abis/PolygonStakingABI'

const STAKING_CONTRACT_ADDRESS = '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908' // Polygon Staking Contract
const MATIC_TOKEN_ADDRESS = '0x0000000000000000000000000000000000001010' // Polygon MATIC token

export const isMetaMaskInstalled = async () => {
  console.log('window.ethereum', window.ethereum)
  console.log('window.ethereum.isMetaMask', window.ethereum.isMetaMask)
  return window.ethereum && window.ethereum.isMetaMask
}

export const connectWallet = async () => {
  try {
    console.log('Starting wallet connection process...')
    
    // Check if MetaMask is installed
    const walletProvider = await isMetaMaskInstalled()
    console.log('MetaMask installation status:', walletProvider)
    
    if (!walletProvider) {
      throw new Error('Please install MetaMask to use this feature')
    }

    console.log('Requesting account access...')
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts'
    })
    console.log('Connected accounts:', accounts)

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found')
    }

    console.log('Creating Web3Provider...')
    // Create Web3Provider instance
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    console.log('Connected wallet address:', address)

    // Check if we're on Polygon network
    const network = await provider.getNetwork()
    console.log('Current network:', network)
    
    // if (network.chainId !== 137n) { // Polygon Mainnet
    //   console.log('Switching to Polygon network...')
    //   try {
    //     // Try to switch to Polygon
    //     await window.ethereum.request({
    //       method: 'wallet_switchEthereumChain',
    //       params: [{ chainId: '0x89' }], // 137 in hex
    //     })
    //     console.log('Successfully switched to Polygon network')
    //   } catch (switchError) {
    //     console.log('Switch error:', switchError)
    //     // If Polygon is not added to MetaMask, add it
    //     if (switchError.code === 4902) {
    //       console.log('Adding Polygon network to MetaMask...')
    //       await window.ethereum.request({
    //         method: 'wallet_addEthereumChain',
    //         params: [{
    //           chainId: '0x89',
    //           chainName: 'Polygon Mainnet',
    //           nativeCurrency: {
    //             name: 'MATIC',
    //             symbol: 'MATIC',
    //             decimals: 18
    //           },
    //           rpcUrls: ['https://polygon-rpc.com'],
    //           blockExplorerUrls: ['https://polygonscan.com']
    //         }]
    //       })
    //       console.log('Successfully added Polygon network')
    //     } else {
    //       throw switchError
    //     }
    //   }
    // }

    return address
  } catch (error) {
    console.error('Error connecting wallet:', error)
    throw error
  }
}

export const getTotalStakedAmount = async (walletAddress, validatorAddress) => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('Please install MetaMask to use this feature')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      StakingContractABI,
      await provider.getSigner()
    )

    const delegation = await contract.delegations(walletAddress, validatorAddress)
    return {
      amount: delegation.amount.toString(),
      reward: delegation.reward.toString()
    }
  } catch (error) {
    console.error('Error getting staked amount:', error)
    throw error
  }
}

export const delegateTokens = async (walletAddress, validatorAddress, amount) => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('Please install MetaMask to use this feature')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    console.log('signer', signer)
    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      StakingContractABI,
      signer
    )

    console.log('contract', contract)
    // Convert amount to wei
    const amountInWei = ethers.parseEther(amount.toString())
    console.log('amountInWei', amountInWei)
    // Approve MATIC token spending
    const maticContract = new ethers.Contract(
      MATIC_TOKEN_ADDRESS,
      ['function approve(address spender, uint256 amount) public returns (bool)'],
      signer
    )
    console.log('maticContract', maticContract)
    const approveTx = await maticContract.approve(STAKING_CONTRACT_ADDRESS, amountInWei)
    await approveTx.wait()
    console.log('approveTx', approveTx)
    // Delegate tokens
    const tx = await contract.delegate(validatorAddress, amountInWei)
    const receipt = await tx.wait()
    return receipt.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw error
  }
}

export const undelegateStake = async (walletAddress, validatorAddress) => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('Please install MetaMask to use this feature')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      StakingContractABI,
      signer
    )

    const tx = await contract.undelegate(validatorAddress)
    const receipt = await tx.wait()
    return receipt.transactionHash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw error
  }
}

export const claimRewards = async (walletAddress, validatorAddress) => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('Please install MetaMask to use this feature')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      StakingContractABI,
      signer
    )

    const tx = await contract.claimRewards(validatorAddress)
    const receipt = await tx.wait()
    return receipt.transactionHash
  } catch (error) {
    console.error('Error claiming rewards:', error)
    throw error
  }
} 