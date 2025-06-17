// import { ethers } from 'ethers'
// import { StakingContractABI } from '../constants/abis/PolygonStakingABI'
// import { ERC20_ABI } from '../constants/abis/ERC20ABI'

// const STAKING_CONTRACT_ADDRESS = '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908' // Polygon Staking Contract
// export const POL_ADDRESS = '0x455e53cbb86018ac2b8092fdcd39d8444affc3f6'
// export const POL_Contract_ADDRESS = '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6'
// export const POLYGON_CHAIN_ID_HEX = '0x89'
// export const POL_GAS_ALIAS = '0x0000000000000000000000000000000000001010' // pseudo address

// export const isMetaMaskInstalled = async () => {
//   return window.ethereum && window.ethereum.isMetaMask
// }

// export async function ensurePolygon() {
//   await window.ethereum.request({
//     method: 'wallet_switchEthereumChain',
//     params: [{ chainId: POLYGON_CHAIN_ID_HEX }]
//   })
// }

// export const connectWallet = async () => {
//   try {
//     const walletProvider = await isMetaMaskInstalled()
//     if (!walletProvider) {
//       throw new Error('Please install MetaMask to use this feature')
//     }
//     const provider = new ethers.BrowserProvider(window.ethereum)
//     const signer = await provider.getSigner()
//     const address = await signer.getAddress()
//     return { address, provider }
//   } catch (error) {
//     console.error('Error connecting wallet:', error)
//     throw error
//   }
// }

// export const getPolygonBalance = async (address) => {
//   await ensurePolygon() // 1️⃣ network

//   const { provider } = await connectWallet()

//   const code = await provider.getCode(POL_ADDRESS)
//   const useNative = POL_ADDRESS === POL_GAS_ALIAS || code === '0x'
//   console.log('useNative', useNative)
//   if (useNative) {
//     const raw = await provider.getBalance(address) // native coin
//     console.log('raw', raw)
//     return Number(ethers.formatEther(raw)) // e.g. 10
//   }
//   const pol = new ethers.Contract(POL_ADDRESS, ERC20_ABI, provider)
//   try {
//     const raw = await pol.balanceOf(address)
//     return Number(ethers.formatEther(raw))
//   } catch (error) {
//     console.error('Error getting polygon balance:', error)
//     throw error
//   }
// }

// export const getTotalStakedAmount = async (walletAddress, validatorAddress) => {
//   try {
//     if (!isMetaMaskInstalled()) {
//       throw new Error('Please install MetaMask to use this feature')
//     }

//     return 1
//     // const provider = new ethers.BrowserProvider(window.ethereum)
//     // const contract = new ethers.Contract(
//     //   STAKING_CONTRACT_ADDRESS,
//     //   StakingContractABI,
//     //   await provider.getSigner()
//     // )

//     // const delegation = await contract.delegations(walletAddress, validatorAddress)
//     // return {
//     //   amount: delegation.amount.toString(),
//     //   reward: delegation.reward.toString()
//     // }
//   } catch (error) {
//     console.error('Error getting staked amount:', error)
//     throw error
//   }
// }

// export const delegateTokens = async (walletAddress, validatorAddress, amount) => {
//   try {
//     if (!isMetaMaskInstalled()) {
//       throw new Error('Please install MetaMask to use this feature')
//     }

//     const provider = new ethers.BrowserProvider(window.ethereum)
//     const signer = await provider.getSigner()
//     console.log('signer', signer)
//     const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContractABI, signer)

//     console.log('contract', contract)
//     // Convert amount to wei
//     const amountInWei = ethers.parseEther(amount.toString())
//     console.log('amountInWei', amountInWei)
//     // Approve MATIC token spending
//     const maticContract = new ethers.Contract(
//       MATIC_TOKEN_ADDRESS,
//       ['function approve(address spender, uint256 amount) public returns (bool)'],
//       signer
//     )
//     console.log('maticContract', maticContract)
//     const approveTx = await maticContract.approve(STAKING_CONTRACT_ADDRESS, amountInWei)
//     await approveTx.wait()
//     console.log('approveTx', approveTx)
//     // Delegate tokens
//     const tx = await contract.delegate(validatorAddress, amountInWei)
//     const receipt = await tx.wait()
//     return receipt.transactionHash
//   } catch (error) {
//     console.error('Error delegating tokens:', error)
//     throw error
//   }
// }

// export const undelegateStake = async (walletAddress, validatorAddress) => {
//   try {
//     if (!isMetaMaskInstalled()) {
//       throw new Error('Please install MetaMask to use this feature')
//     }

//     const provider = new ethers.BrowserProvider(window.ethereum)
//     const signer = await provider.getSigner()
//     const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContractABI, signer)

//     const tx = await contract.undelegate(validatorAddress)
//     const receipt = await tx.wait()
//     return receipt.transactionHash
//   } catch (error) {
//     console.error('Error undelegating stake:', error)
//     throw error
//   }
// }

/*********************************************************************
 * Polygon (POL) staking / unstaking template – ethers v6 – 2025-06-11
 * 1️⃣  npm i ethers@^6       (or load the CDN bundle in <script>)
 * 2️⃣  copy-paste into a front-end JS file or a Vite / Next project
 *********************************************************************/

import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers'
import { ERC20_ABI } from '../constants/abis/ERC20ABI'
import { STAKE_ABI } from '../constants/abis/PolygonStakingABI'
import { STAKE_MANNAGE_ABI } from '../constants/abis/PolygonStakingABI'

import Web3 from 'web3'
// -------------------------------------------------------------------
// 🔗  1.  On-chain constants  (verified main-net addresses)
// -------------------------------------------------------------------
const POL_ADDRESS = '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' // ERC-20 POL  :contentReference[oaicite:0]{index=0}
const STAKE_MANAGER_PROXY = '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908' // StakeManagerProxy :contentReference[oaicite:1]{index=1}
const INFURA_ID = '866561e7397b4de796a87f7e2050afc5' // 32-char hex
const STAKE_MANNAGE = "0xd6F5c46d4E1a02f9D145cEe41d2F8AF30D8d2d76"

export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not found')
  const provider = new BrowserProvider(window.ethereum)
  await provider.send('eth_requestAccounts', [])

  const network = await provider.getNetwork()
  console.log('network', network)
  const code = await provider.getCode(POL_ADDRESS)
  const signer = await provider.getSigner()
  const signerAddress = await signer.getAddress()
  return { provider, signer, address: signerAddress }
}

// 0x1a5f7190bD9691bbBeC4B879B58D4119d52633BF

// 0xd55d962a9af1b001a147a90288a99d725da96f1cf51571eb71c2b98ac69e3f9d

// 0xe1ed7f04db117f5d889976fb51b86bd87fbc6d5bcb7dba5365f7e5e72712245d

export async function getPolygonBalance(address, signer) {
  const we3Instance = new Web3(window.ethereum)
  const contract = await new we3Instance.eth.Contract(ERC20_ABI, POL_ADDRESS)
  try {
    const raw = await contract.methods.balanceOf(address).call()
    console.log('raw', raw)
    return raw
  } catch (err) {
    console.error('balanceOf error:', err)
  }
}

export async function getTotalStakedAmount(address, validatorId) {
  console.log('---getTotalStakedAmount---')
  try {
    const stakingInfo = await fetch(
      `https://staking-api.polygon.technology/api/v3/delegators/${address}`
    )
    const data = await stakingInfo.json()
    console.log('stakingInfo', data.result)
    let totalStakedAmount = 0
    data.result.map((item) => {
      totalStakedAmount += Number(item.stake) - Number(item.claimedReward)
    })
    console.log('totalStakedAmount', totalStakedAmount)
    return totalStakedAmount
  } catch (error) {
    console.error('Error getting staked amount:', error)
    throw error
  }
}

export async function delegateTokens(signer, validatorId, amountEth) {
  try {
    console.log('---delegateTokens---')

    const we3Instance = new Web3(window.ethereum)
    const pol = await new we3Instance.eth.Contract(ERC20_ABI, POL_ADDRESS)
    // const stake = await new we3Instance.eth.Contract(STAKE_MANNAGE_ABI, STAKE_MANNAGE)
    const stake = await new we3Instance.eth.Contract(STAKE_ABI, STAKE_MANAGER_PROXY)

    const allowance = await pol.methods.allowance(signer, STAKE_MANAGER_PROXY).call()
    console.log('allowance', allowance)

    // if (allowance < parseEther(amountEth)) {
    const tx1 = await pol.methods.approve(STAKE_MANAGER_PROXY, parseEther(amountEth.toString())).send({
      from: signer
    })
    console.log('tx1', tx1)
    console.log('✅ POL approved')
    // }

    const tx2 = await stake.methods.validatorStake(validatorId, parseEther(amountEth.toString())).send({
      from: signer
    })
    console.log('tx2', tx2)
    console.log(`✅ Staked ${amountEth} POL to validator ${validatorId}`)
    return tx2.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw error
  }
}

// -------------------------------------------------------------------
// 🔓  6.  Unstake + Withdraw
// -------------------------------------------------------------------
export async function undelegateStake({ signer, validatorId, amountEth }) {
  try {
    const stake = new Contract(STAKE_MANAGER_PROXY, STAKE_ABI, signer)

    // 6-A  Begin unbonding
    const tx1 = await stake.unstake(validatorId, parseEther(amountEth))
    const receipt = await tx1.wait()
    console.log('✅ Unstake requested (now wait the 80-checkpoint delay)')
    return receipt.transactionHash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw error
  }
}
