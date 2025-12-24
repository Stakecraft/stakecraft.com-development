import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers'
import { ERC20_ABI } from '../constants/abis/ERC20ABI'
import { STAKE_MANAGE_ABI, VALIDATOR_SHARE_ABI } from '../constants/abis/PolygonStakingABI'

const POL_ADDRESS = '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' // POL Token
const STAKE_MANAGE_ADDRESS = '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908'

async function validateNetwork(provider) {
  const network = await provider.getNetwork()
  if (network.chainId !== 1n) {
    throw new Error('Please connect to Ethereum Mainnet to stake POL tokens')
  }
}

async function switchToEthereumMainnet() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }]
    })
  } catch (switchError) {
    if (switchError.code === 4902) {
      throw new Error('Please add Ethereum Mainnet to your MetaMask')
    }
    throw switchError
  }
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not found')
  const provider = new BrowserProvider(window.ethereum)
  await provider.send('eth_requestAccounts', [])

  try {
    await validateNetwork(provider)
  } catch (error) {
    await switchToEthereumMainnet()
    const newProvider = new BrowserProvider(window.ethereum)
    await validateNetwork(newProvider)
  }

  const signer = await provider.getSigner()
  const signerAddress = await signer.getAddress()
  console.log('signerAddress', signerAddress)
  return { provider, signer, address: signerAddress }
}

export const WalletDisconnect = async () => {
  console.log('Disconnecting wallet')

  try {
    console.log('Disconnecting wallet')
    if (window.ethereum && window.ethereum.connected) {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      })
    }
    return true
  } catch (error) {
    console.error('Error disconnecting wallet:', error)
    return false
  }
}

export async function getPolygonBalance(address) {
  const provider = new BrowserProvider(window.ethereum)
  const pol = new Contract(POL_ADDRESS, ERC20_ABI, provider)
  try {
    const raw = await pol.balanceOf(address)
    return raw
  } catch (err) {
    console.error('balanceOf error:', err)
    throw new Error('Failed to get POL balance')
  }
}

export async function getTotalStakedAmount(address) {
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

export async function delegateTokens(delegatorAddress, validatoraddress, amountPol) {
  try {
    const provider = new BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    await validateNetwork(provider)

    const signer = await provider.getSigner()
    const polContract = new Contract(POL_ADDRESS, ERC20_ABI, signer)
    const amountWei = parseEther(amountPol.toString())
    const balance = await polContract.balanceOf(delegatorAddress)

    if (balance < amountWei) {
      throw new Error(
        `Insufficient POL balance. You have ${formatEther(balance)} POL but need ${formatEther(amountWei)} POL`
      )
    }

    const ethBalance = await provider.getBalance(delegatorAddress)
    const minimumEthForGas = parseEther('0.01')

    if (ethBalance < minimumEthForGas) {
      console.warn('Low ETH balance for gas fees. You have:', formatEther(ethBalance))
    }

    const stakeManager = new Contract(STAKE_MANAGE_ADDRESS, STAKE_MANAGE_ABI, signer)
    const validatorId = 155
    const vInfo = await stakeManager.validators(validatorId)
    const validatorShare = vInfo[6]
    const status = vInfo[7]

    if (validatorShare === '0x0000000000000000000000000000000000000000') {
      throw new Error('Validator contract address not found')
    }
    if (status !== 1n) {
      throw new Error(`Validator not active. Status: ${status}`)
    }

    const allowance = await polContract.allowance(delegatorAddress, validatorShare)

    if (allowance < amountWei) {
      const approveTx = await polContract.approve(validatorShare, amountWei, {
        gasLimit: 100000
      })
      await approveTx.wait()
    } else {
      console.log('✅ Allowance is sufficient for validator share')
    }

    const validatorShareContract = new Contract(validatorShare, VALIDATOR_SHARE_ABI, signer)
    const tx = await validatorShareContract.buyVoucherPOL(amountWei, 0n, {
      gasLimit: 500000
    })

    await tx.wait()
    return tx.hash
  } catch (error) {
    console.error('Error delegating tokens:', error)

    if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient ETH for gas fees. Please add ETH to your wallet.')
    } else if (error.message.includes('User rejected')) {
      throw new Error('Transaction was rejected. Please approve the transaction in MetaMask.')
    } else if (error.message.includes('execution reverted')) {
      throw new Error(
        'Transaction failed. This could be due to insufficient balance, wrong network, or contract requirements not met.'
      )
    }

    throw error
  }
}

export async function undelegateStake(delegatorAddress, validatoraddress, amountPol) {
  try {
    const provider = new BrowserProvider(window.ethereum)
    await validateNetwork(provider)
    const signer = await provider.getSigner()
    const amountWei = parseEther(amountPol.toString())
    const stakeManager = new Contract(STAKE_MANAGE_ADDRESS, STAKE_MANAGE_ABI, signer)
    const validatorId = 155
    const vInfo = await stakeManager.validators(validatorId)
    const validatorShare = vInfo[6]
    const validatorShareContract = new Contract(validatorShare, VALIDATOR_SHARE_ABI, signer)
    const userShares = await validatorShareContract.balanceOf(delegatorAddress)
    if (userShares === 0n) {
      throw new Error('No staked tokens found for this address')
    }

    const undelegateTx = await validatorShareContract.sellVoucher_newPOL(amountWei, amountWei, {
      gasLimit: 300000
    })

    await undelegateTx.wait()
    return undelegateTx.hash
  } catch (error) {
    console.error('Error undelegating stake:', error)
    if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient ETH for gas fees. Please add ETH to your wallet.')
    } else if (error.message.includes('User rejected')) {
      throw new Error('Transaction was rejected. Please approve the transaction in MetaMask.')
    }
    throw error
  }
}

export async function getRewardsEarned(delegatorAddress) {
  try {
    const stakingInfo = await fetch(
      `https://staking-api.polygon.technology/api/v3/delegators/${delegatorAddress}`
    )
    const data = await stakingInfo.json()
    let rewards = 0
    data.result.map((item) => {
      rewards += Number(item.claimedReward)
    })
    return rewards / 10 ** 18
  } catch (error) {
    console.error('Error getting rewards earned:', error)
    throw error
  }
}
