import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers'
import { ERC20_ABI } from '../constants/abis/ERC20ABI'
import { STAKE_ABI } from '../constants/abis/PolygonStakingABI'
import { STAKE_MANNAGE_ABI } from '../constants/abis/PolygonStakingABI'
import { VOUCHER_MANAGER_ABI } from '../constants/abis/PolygonStakingABI'

import Web3 from 'web3'

const POL_ADDRESS = '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' // ERC-20 POL  :contentReference[oaicite:0]{index=0}
const STAKE_MANAGER_PROXY = '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908' // StakeManagerProxy :contentReference[oaicite:1]{index=1}
const INFURA_ID = '866561e7397b4de796a87f7e2050afc5' // 32-char hex
const STAKE_MANNAGE = '0xd6F5c46d4E1a02f9D145cEe41d2F8AF30D8d2d76'
const VOUCHER_MANAGER = '0xf3c8D0c689fDf69B3c05b18F8a3E0B31F328fF7A'

export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not found')
  const provider = new BrowserProvider(window.ethereum)
  await provider.send('eth_requestAccounts', [])
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
    return raw
  } catch (err) {
    console.error('balanceOf error:', err)
  }
}

export async function getTotalStakedAmount(address, validatorId) {
  try {
    const stakingInfo = await fetch(
      `https://staking-api.polygon.technology/api/v3/delegators/${address}`
    )
    const data = await stakingInfo.json()
    let totalStakedAmount = 0
    data.result.map((item) => {
      totalStakedAmount += Number(item.stake) - Number(item.claimedReward)
    })
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

    const tx1 = await pol.methods
      .approve(STAKE_MANAGER_PROXY, parseEther(amountEth.toString()))
      .send({
        from: signer
      })
    console.log('tx1', tx1)
    console.log('✅ POL approved')

    const tx2 = await stake.methods
      .validatorStake(validatorId, parseEther(amountEth.toString()))
      .send({
        from: signer
      })
    console.log('tx2', tx2)
    console.log(`✅ Staked ${amountEth} POL to validator ${validatorId}`)
    console.log('tx2.transactionHash', tx2.transactionHash)
    return tx2.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw error
  }
}

export async function undelegateStake({ signer, validatorId, amountEth }) {
  try {
    const stake = new Contract(STAKE_MANAGER_PROXY, STAKE_ABI, signer)
    const tx1 = await stake.unstake(validatorId, parseEther(amountEth))
    const receipt = await tx1.wait()
    console.log('✅ Unstake requested (now wait the 80-checkpoint delay)')
    return receipt.transactionHash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    throw error
  }
}
