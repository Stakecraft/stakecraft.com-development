import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'

// Contract addresses
const SUPRA_TOKEN_ADDRESS = '0x93b153fe97b6b677b7af943cbb80cc8bbf7a7878e69ffe9a04fc7eebfc1d750f' // SUPRA token address
const STAKING_CONTRACT_ADDRESS = '0x...' // Staking contract address (you'll need to get this from Supra)

// Contract ABIs
const SUPRA_TOKEN_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const STAKING_CONTRACT_ABI = [
  {
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getStakedAmount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getRewards",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

export function useSupraStaking() {
  const isConnected = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const supraBalance = ref(0)
  const stakedAmount = ref(0)
  const rewards = ref(0)
  const stakeAmount = ref('')
  const provider = ref(null)
  const signer = ref(null)
  const supraToken = ref(null)
  const stakingContract = ref(null)

  const formatBalance = (balance) => {
    return ethers.utils.formatUnits(balance, 18) // Assuming 18 decimals
  }

  const connectStarkey = async () => {
    try {
      // Check if Starkey wallet is installed
      if (window.starkey) {
        // Request connection to Starkey wallet
        const accounts = await window.starkey.request({ 
          method: 'eth_requestAccounts' 
        })
        
        if (accounts.length > 0) {
          // Initialize provider with Starkey
          provider.value = new ethers.providers.Web3Provider(window.starkey)
          signer.value = provider.value.getSigner()
          
          // Initialize contracts
          supraToken.value = new ethers.Contract(SUPRA_TOKEN_ADDRESS, SUPRA_TOKEN_ABI, signer.value)
          stakingContract.value = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer.value)
          
          isConnected.value = true
          await updateBalances()
        }
      } else {
        error.value = 'Please install Starkey wallet'
      }
    } catch (err) {
      error.value = 'Failed to connect Starkey wallet: ' + err.message
    }
  }

  const updateBalances = async () => {
    try {
      const address = await signer.value.getAddress()
      
      // Get SUPRA balance
      const balance = await supraToken.value.balanceOf(address)
      supraBalance.value = balance

      // Get staked amount
      const staked = await stakingContract.value.getStakedAmount(address)
      stakedAmount.value = staked

      // Get rewards
      const reward = await stakingContract.value.getRewards(address)
      rewards.value = reward
    } catch (err) {
      error.value = 'Failed to update balances: ' + err.message
    }
  }

  const stake = async () => {
    try {
      loading.value = true
      error.value = null

      const amount = ethers.utils.parseUnits(stakeAmount.value, 18)
      
      // Approve staking contract to spend SUPRA tokens
      const approveTx = await supraToken.value.approve(STAKING_CONTRACT_ADDRESS, amount)
      await approveTx.wait()

      // Stake tokens
      const stakeTx = await stakingContract.value.stake(amount)
      await stakeTx.wait()

      await updateBalances()
      stakeAmount.value = ''
    } catch (err) {
      error.value = 'Failed to stake: ' + err.message
    } finally {
      loading.value = false
    }
  }

  const unstake = async () => {
    try {
      loading.value = true
      error.value = null

      const unstakeTx = await stakingContract.value.unstake()
      await unstakeTx.wait()

      await updateBalances()
    } catch (err) {
      error.value = 'Failed to unstake: ' + err.message
    } finally {
      loading.value = false
    }
  }

  const claimRewards = async () => {
    try {
      loading.value = true
      error.value = null

      const claimTx = await stakingContract.value.claimRewards()
      await claimTx.wait()

      await updateBalances()
    } catch (err) {
      error.value = 'Failed to claim rewards: ' + err.message
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (window.starkey) {
      // Listen for account changes in Starkey wallet
      window.starkey.on('accountsChanged', () => {
        connectStarkey()
      })
    }
  })

  return {
    isConnected,
    loading,
    error,
    supraBalance,
    stakedAmount,
    rewards,
    stakeAmount,
    connectStarkey,
    stake,
    unstake,
    claimRewards,
    formatBalance
  }
} 