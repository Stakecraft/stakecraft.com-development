import { ethers } from 'ethers'

const REDBELLY_CHAIN_ID = '151'
const REDBELLY_RPC_URLS = [
  'https://governors.testnet.redbelly.network',
  'https://rbn-govertest-02.redbelly.network'
]
const STAKING_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000001001'

const STAKING_ABI = [
  'function stake(address validator) payable',
  'function unstake(address validator, uint256 amount)',
  'function getStakedAmount(address staker, address validator) view returns (uint256)',
  'function getRewards(address staker, address validator) view returns (uint256)'
]

export const connectWallet = async () => {
  if (!window.ethereum) throw new Error('Please install MetaMask')
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    await switchToRedbelly()
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return await signer.getAddress()
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  }
}

const switchToRedbelly = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${parseInt(REDBELLY_CHAIN_ID).toString(16)}` }]
    })
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${parseInt(REDBELLY_CHAIN_ID).toString(16)}`,
            chainName: 'Redbelly Network Testnet',
            nativeCurrency: { name: 'RBNT', symbol: 'RBNT', decimals: 18 },
            rpcUrls: REDBELLY_RPC_URLS,
            blockExplorerUrls: ['https://explorer.redbelly.network/']
          }
        ]
      })
    } else {
      throw switchError
    }
  }
}

export const getRBNTBalance = async (address) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const balance = await provider.getBalance(address)
    return parseFloat(ethers.formatEther(balance))
  } catch (error) {
    console.error('Error getting RBNT balance:', error)
    throw new Error(`Failed to get RBNT balance: ${error.message}`)
  }
}

export const getStakingInfo = async (address, validatorAddress) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider)
    let stakedAmount = 0,
      stakingRewards = 0
    try {
      const staked = await stakingContract.getStakedAmount(address, validatorAddress)
      stakedAmount = parseFloat(ethers.formatEther(staked))
      const rewards = await stakingContract.getRewards(address, validatorAddress)
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

export const stakeTokens = async (address, validatorAddress, amount) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer)
    const tx = await stakingContract.stake(validatorAddress, {
      value: ethers.parseEther(amount.toString()),
      gasLimit: 300000
    })
    await tx.wait()
    return tx.hash
  } catch (error) {
    console.error('Error staking tokens:', error)
    throw new Error(`Failed to stake tokens: ${error.message}`)
  }
}

export const unstakeTokens = async (address, validatorAddress, amount) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer)
    const tx = await stakingContract.unstake(
      validatorAddress,
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
