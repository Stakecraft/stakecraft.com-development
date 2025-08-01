import { ethers } from 'ethers'

const ETHEREUM_CHAIN_ID = '1'
const SQT_TOKEN_ADDRESS = '0x09395a2a58db45db0da254c7eaa5ac469d8bdc85'
const STAKING_CONTRACT_ADDRESS = '0x38C4ef1f4737B0457A1AD3891adfD44B552ec857'

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
]

const STAKING_ABI = [
  'function delegate(address indexer, uint256 amount)',
  'function undelegate(address indexer, uint256 amount)',
  'function getDelegatedAmount(address delegator, address indexer) view returns (uint256)',
  'function getRewards(address delegator, address indexer) view returns (uint256)'
]

export const connectWallet = async () => {
  if (!window.ethereum) throw new Error('Please install MetaMask')
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    await switchToEthereum()
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return await signer.getAddress()
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  }
}

const switchToEthereum = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${parseInt(ETHEREUM_CHAIN_ID).toString(16)}` }]
    })
  } catch (switchError) {
    throw new Error('Please switch to Ethereum mainnet')
  }
}

export const getSQTBalance = async (address) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const tokenContract = new ethers.Contract(SQT_TOKEN_ADDRESS, ERC20_ABI, provider)
    const balance = await tokenContract.balanceOf(address)
    return parseFloat(ethers.formatEther(balance))
  } catch (error) {
    console.error('Error getting SQT balance:', error)
    throw new Error(`Failed to get SQT balance: ${error.message}`)
  }
}

export const getAllowance = async (address) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const tokenContract = new ethers.Contract(SQT_TOKEN_ADDRESS, ERC20_ABI, provider)
    const allowance = await tokenContract.allowance(address, STAKING_CONTRACT_ADDRESS)
    return parseFloat(ethers.formatEther(allowance))
  } catch (error) {
    console.error('Error getting allowance:', error)
    return 0
  }
}

export const approveTokens = async (address, amount) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const tokenContract = new ethers.Contract(SQT_TOKEN_ADDRESS, ERC20_ABI, signer)
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

export const getStakingInfo = async (address, indexerAddress) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider)
    let stakedAmount = 0,
      stakingRewards = 0
    try {
      const delegated = await stakingContract.getDelegatedAmount(address, indexerAddress)
      stakedAmount = parseFloat(ethers.formatEther(delegated))
      const rewards = await stakingContract.getRewards(address, indexerAddress)
      stakingRewards = parseFloat(ethers.formatEther(rewards))
    } catch (contractError) {
      console.log('Staking contract calls not available, using defaults')
    }
    return { stakedAmount, stakingRewards }
  } catch (error) {
    console.error('Error getting staking info:', error)
    return { stakedAmount: 0, stakingRewards: 0 }
  }
}

export const stakeTokens = async (address, indexerAddress, amount) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer)
    const tx = await stakingContract.delegate(
      indexerAddress,
      ethers.parseEther(amount.toString()),
      { gasLimit: 300000 }
    )
    await tx.wait()
    return tx.hash
  } catch (error) {
    console.error('Error staking tokens:', error)
    throw new Error(`Failed to stake tokens: ${error.message}`)
  }
}

export const unstakeTokens = async (address, indexerAddress, amount) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer)
    const tx = await stakingContract.undelegate(
      indexerAddress,
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
