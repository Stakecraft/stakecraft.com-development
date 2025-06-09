import { ethers } from 'ethers'
import { StakingContractABI } from '../constants/abis/PolygonStakingABI'
import { ERC20_ABI } from '../constants/abis/ERC20ABI'

const STAKING_CONTRACT_ADDRESS = '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908' // Polygon Staking Contract
// const MATIC_TOKEN_ADDRESS = '0x0000000000000000000000000000000000001010' // Polygon MATIC token
export const MATIC_TOKEN = '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6'
export const ETHEREUM_CHAIN_ID_HEX = '0x1'

export const isMetaMaskInstalled = async () => {
  return window.ethereum && window.ethereum.isMetaMask
}

// Guarantee we’re on Ethereum mainnet (chain-id 1)
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: ETHEREUM_CHAIN_ID_HEX }]
})

export const connectWallet = async () => {
  try {
    const walletProvider = await isMetaMaskInstalled()
    if (!walletProvider) {
      throw new Error('Please install MetaMask to use this feature')
    }
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found')
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const network = await provider.getNetwork()
    return address
  } catch (error) {
    console.error('Error connecting wallet:', error)
    throw error
  }
}

export const getPolygonBalance = async (address) => {
  console.log('-----get polygon balance-----', address)
  const provider = new ethers.BrowserProvider(window.ethereum)
  const { chainId, name } = await provider.getNetwork()
  console.log('provider', provider)
  console.log('provider.network.chainId', provider.network.chainId)
  if (chainId !== 137n) console.log('Not on Polygon mainnet - call switchToPolygon() first')
  if (chainId !== 1n) console.log('Not on Ethereum mainnet - call switchToEthereum() first')

  const erc20 = new ethers.Contract(MATIC_TOKEN, ERC20_ABI, provider)
  console.log('erc20', erc20)
  const raw = await erc20.balanceOf(address)
  console.log('raw', raw)
  return Number(ethers.formatEther(raw))
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
    const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContractABI, signer)

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
    const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContractABI, signer)

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
    const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContractABI, signer)

    const tx = await contract.claimRewards(validatorAddress)
    const receipt = await tx.wait()
    return receipt.transactionHash
  } catch (error) {
    console.error('Error claiming rewards:', error)
    throw error
  }
}
