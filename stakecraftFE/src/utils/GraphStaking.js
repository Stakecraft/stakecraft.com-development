import { ethers } from 'ethers'

const ETHEREUM_CHAIN_ID = '0x1' // Ethereum mainnet

// The Graph Protocol contract addresses
const GRAPH_TOKEN_ADDRESS = '0xc944e90c64b2c07662a292be6244bdf05cda44a7'
const STAKING_CONTRACT_ADDRESS = '0xf55041e37e12cd407ad00ce2910b8269b01263b9'

// ERC-20 ABI for GRT token
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)'
]

// Simplified staking contract ABI
const STAKING_ABI = [
  'function delegate(address indexer, uint256 tokens) returns (bool)',
  'function undelegate(address indexer, uint256 shares) returns (bool)',
  'function getDelegation(address delegator, address indexer) view returns (uint256)',
  'function withdrawDelegation(address indexer, address newIndexer) returns (bool)'
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

    // Switch to Ethereum mainnet
    await switchToEthereum()

    return accounts[0]
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw new Error(`Failed to connect wallet: ${error.message}`)
  }
}

// Switch to Ethereum mainnet
const switchToEthereum = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ETHEREUM_CHAIN_ID }]
    })
  } catch (switchError) {
    throw new Error('Failed to switch to Ethereum mainnet')
  }
}

// Get GRT balance for a wallet address
export const getGrtBalance = async (walletAddress) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const grtContract = new ethers.Contract(GRAPH_TOKEN_ADDRESS, ERC20_ABI, provider)

    const balance = await grtContract.balanceOf(walletAddress)
    const decimals = await grtContract.decimals()

    // Convert from wei to GRT
    return parseFloat(ethers.utils.formatUnits(balance, decimals))
  } catch (error) {
    console.error('Error getting GRT balance:', error)
    throw new Error(`Failed to get GRT balance: ${error.message}`)
  }
}

// Get delegated amount for a delegator/indexer pair
export const getDelegatedAmount = async (delegatorAddress, indexerAddress) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider)

    const delegatedShares = await stakingContract.getDelegation(delegatorAddress, indexerAddress)

    // Convert shares to GRT amount (simplified calculation)
    return parseFloat(ethers.utils.formatEther(delegatedShares))
  } catch (error) {
    console.error('Error getting delegated amount:', error)
    return 0
  }
}

// Delegate GRT tokens to indexer
export const delegateToIndexer = async (walletAddress, indexerAddress, amount) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const grtContract = new ethers.Contract(GRAPH_TOKEN_ADDRESS, ERC20_ABI, signer)
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer)

    const amountInWei = ethers.utils.parseEther(amount.toString())

    // Check allowance
    const allowance = await grtContract.allowance(walletAddress, STAKING_CONTRACT_ADDRESS)

    // Approve if needed
    if (allowance.lt(amountInWei)) {
      console.log('Approving GRT tokens...')
      const approveTx = await grtContract.approve(STAKING_CONTRACT_ADDRESS, amountInWei)
      await approveTx.wait()
    }

    // Delegate tokens
    console.log('Delegating GRT tokens to indexer:', indexerAddress, 'amount:', amount)
    const delegateTx = await stakingContract.delegate(indexerAddress, amountInWei)
    await delegateTx.wait()

    return delegateTx.hash
  } catch (error) {
    console.error('Error delegating to indexer:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}

// Undelegate GRT tokens from indexer
export const undelegateFromIndexer = async (walletAddress, indexerAddress, amount) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer)

    const sharesInWei = ethers.utils.parseEther(amount.toString())

    console.log('Undelegating GRT tokens from indexer:', indexerAddress, 'amount:', amount)
    const undelegateTx = await stakingContract.undelegate(indexerAddress, sharesInWei)
    await undelegateTx.wait()

    return undelegateTx.hash
  } catch (error) {
    console.error('Error undelegating from indexer:', error)
    throw new Error(`Failed to undelegate tokens: ${error.message}`)
  }
}

// Get query fees earned (simplified for demo)
export const getQueryFeesEarned = async (walletAddress, indexerAddress) => {
  try {
    // In a real implementation, this would query The Graph's subgraph
    // to get the actual query fees earned by the delegator
    console.log('Getting query fees for:', walletAddress, 'from indexer:', indexerAddress)

    // Return mock data for demo
    return 0
  } catch (error) {
    console.error('Error getting query fees:', error)
    return 0
  }
}

// Get indexer information (simplified for demo)
export const getIndexerInfo = async (indexerAddress) => {
  try {
    // In a real implementation, this would query The Graph's subgraph
    // to get indexer stats like stake, delegation capacity, etc.
    console.log('Getting indexer info for:', indexerAddress)

    return {
      stake: 0,
      delegationCapacity: 0,
      queryFeeCut: 0,
      indexingRewardCut: 0
    }
  } catch (error) {
    console.error('Error getting indexer info:', error)
    return null
  }
}
