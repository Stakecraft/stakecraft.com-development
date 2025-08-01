import { ethers } from 'ethers'

const Q_CHAIN_ID = '35441'
const Q_RPC_URLS = ['https://rpc.q.org', 'https://q-mainnet-rpc.avalaxy.com']

const Q_STAKING_CONTRACT = '0x0000000000000000000000000000000000001001' // Q Protocol staking contract

// Connect wallet
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask')
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' })

    // Switch to Q Protocol network
    await switchToQNetwork()

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()

    return address
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  }
}

// Switch to Q Protocol network
const switchToQNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${parseInt(Q_CHAIN_ID).toString(16)}` }]
    })
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${parseInt(Q_CHAIN_ID).toString(16)}`,
            chainName: 'Q Protocol Mainnet',
            nativeCurrency: {
              name: 'Q',
              symbol: 'Q',
              decimals: 18
            },
            rpcUrls: Q_RPC_URLS,
            blockExplorerUrls: ['https://hq.q.org/']
          }
        ]
      })
    } else {
      throw switchError
    }
  }
}

// Get Q balance
export const getQBalance = async (address) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const balance = await provider.getBalance(address)
    return parseFloat(ethers.formatEther(balance))
  } catch (error) {
    console.error('Error getting Q balance:', error)
    throw new Error(`Failed to get Q balance: ${error.message}`)
  }
}

// Get staking information
export const getStakingInfo = async (address, validatorAddress) => {
  try {
    // For Q Protocol, we would need to interact with the staking contract
    // This is a simplified version - actual implementation would depend on Q Protocol's staking contract
    const provider = new ethers.BrowserProvider(window.ethereum)

    // Simplified staking contract ABI (actual ABI would be more complex)
    const stakingABI = [
      'function getStake(address staker, address validator) view returns (uint256)',
      'function getRewards(address staker, address validator) view returns (uint256)'
    ]

    try {
      const stakingContract = new ethers.Contract(Q_STAKING_CONTRACT, stakingABI, provider)

      const stakedAmount = await stakingContract.getStake(address, validatorAddress)
      const rewards = await stakingContract.getRewards(address, validatorAddress)

      return {
        stakedAmount: parseFloat(ethers.formatEther(stakedAmount)),
        stakingRewards: parseFloat(ethers.formatEther(rewards))
      }
    } catch (contractError) {
      console.log('Staking contract not available, returning default values')
      return {
        stakedAmount: 0,
        stakingRewards: 0
      }
    }
  } catch (error) {
    console.error('Error getting staking info:', error)
    return {
      stakedAmount: 0,
      stakingRewards: 0
    }
  }
}

// Stake tokens
export const stakeTokens = async (address, validatorAddress, amount) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    // Simplified staking contract ABI
    const stakingABI = ['function stake(address validator) payable']

    const stakingContract = new ethers.Contract(Q_STAKING_CONTRACT, stakingABI, signer)

    // Stake tokens by sending Q directly to the contract
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

// Unstake tokens
export const unstakeTokens = async (address, validatorAddress, amount) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    // Simplified staking contract ABI
    const stakingABI = ['function unstake(address validator, uint256 amount)']

    const stakingContract = new ethers.Contract(Q_STAKING_CONTRACT, stakingABI, signer)

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

// Get validator information
export const getValidatorInfo = async (validatorAddress) => {
  try {
    // This would typically call a validator registry contract
    // For now, return basic information
    return {
      address: validatorAddress,
      commission: '5%',
      status: 'active'
    }
  } catch (error) {
    console.error('Error getting validator info:', error)
    return null
  }
}
