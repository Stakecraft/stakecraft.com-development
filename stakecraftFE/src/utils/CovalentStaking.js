import { ethers } from 'ethers'

const ETHEREUM_CHAIN_ID = '1'
const CXT_TOKEN_ADDRESS = '0xed04915c23f00a313a544955524eb7dbd823143d'
const STAKING_CONTRACT_ADDRESS = '0xAE2f541b129E2597D1a70A206A7e03cB42D4b597'

// ERC-20 ABI for CXT token
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)'
]

// Simplified Covalent staking contract ABI
const STAKING_ABI = [
  'function stake(address operator, uint256 amount)',
  'function unstake(address operator, uint256 amount)',
  'function getStakedAmount(address staker, address operator) view returns (uint256)',
  'function getRewards(address staker, address operator) view returns (uint256)'
]

// Connect wallet and switch to Ethereum mainnet
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask')
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' })

    // Switch to Ethereum mainnet
    await switchToEthereum()

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()

    return address
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  }
}

// Switch to Ethereum mainnet
const switchToEthereum = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${parseInt(ETHEREUM_CHAIN_ID).toString(16)}` }]
    })
  } catch (switchError) {
    // Ethereum mainnet should already be available in MetaMask
    throw new Error('Please switch to Ethereum mainnet')
  }
}

// Get CXT token balance
export const getCXTBalance = async (address) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const tokenContract = new ethers.Contract(CXT_TOKEN_ADDRESS, ERC20_ABI, provider)

    const balance = await tokenContract.balanceOf(address)
    return parseFloat(ethers.formatEther(balance))
  } catch (error) {
    console.error('Error getting CXT balance:', error)
    throw new Error(`Failed to get CXT balance: ${error.message}`)
  }
}

// Check token allowance for staking contract
export const getAllowance = async (address) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const tokenContract = new ethers.Contract(CXT_TOKEN_ADDRESS, ERC20_ABI, provider)

    const allowance = await tokenContract.allowance(address, STAKING_CONTRACT_ADDRESS)
    return parseFloat(ethers.formatEther(allowance))
  } catch (error) {
    console.error('Error getting allowance:', error)
    return 0
  }
}

// Approve tokens for staking
export const approveTokens = async (address, amount) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const tokenContract = new ethers.Contract(CXT_TOKEN_ADDRESS, ERC20_ABI, signer)

    // Approve the staking contract to spend tokens
    const tx = await tokenContract.approve(
      STAKING_CONTRACT_ADDRESS,
      ethers.parseEther(amount.toString()),
      { gasLimit: 100000 }
    )

    await tx.wait()
    return tx.hash
  } catch (error) {
    console.error('Error approving tokens:', error)
    throw new Error(`Failed to approve tokens: ${error.message}`)
  }
}

// Get staking information
export const getStakingInfo = async (address, operatorAddress) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider)

    let stakedAmount = 0
    let stakingRewards = 0

    try {
      const staked = await stakingContract.getStakedAmount(address, operatorAddress)
      stakedAmount = parseFloat(ethers.formatEther(staked))

      const rewards = await stakingContract.getRewards(address, operatorAddress)
      stakingRewards = parseFloat(ethers.formatEther(rewards))
    } catch (contractError) {
      console.log('Staking contract calls not available, using defaults')
    }

    return {
      stakedAmount,
      stakingRewards
    }
  } catch (error) {
    console.error('Error getting staking info:', error)
    return {
      stakedAmount: 0,
      stakingRewards: 0
    }
  }
}

// Stake CXT tokens
export const stakeTokens = async (address, operatorAddress, amount) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer)

    // Stake tokens to the specified operator
    const tx = await stakingContract.stake(operatorAddress, ethers.parseEther(amount.toString()), {
      gasLimit: 300000
    })

    await tx.wait()
    return tx.hash
  } catch (error) {
    console.error('Error staking tokens:', error)
    throw new Error(`Failed to stake tokens: ${error.message}`)
  }
}

// Unstake CXT tokens
export const unstakeTokens = async (address, operatorAddress, amount) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer)

    // Unstake tokens from the specified operator
    const tx = await stakingContract.unstake(
      operatorAddress,
      ethers.parseEther(amount.toString()),
      { gasLimit: 300000 }
    )

    await tx.wait()
    return tx.hash
  } catch (error) {
    console.error('Error unstaking tokens:', error)
    throw new Error(`Failed to unstake tokens: ${error.message}`)
  }
}

// Get operator information
export const getOperatorInfo = async (operatorAddress) => {
  try {
    // This would typically call an operator registry contract
    // For now, return basic information
    return {
      address: operatorAddress,
      commission: '2%',
      status: 'active',
      description: 'Covalent Data Provider'
    }
  } catch (error) {
    console.error('Error getting operator info:', error)
    return null
  }
}
