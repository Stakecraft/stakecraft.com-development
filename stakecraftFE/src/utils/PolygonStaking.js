import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers'
import { ERC20_ABI } from '../constants/abis/ERC20ABI'
import { STAKE_MANAGE_ABI, VALIDATOR_SHARE_ABI } from '../constants/abis/PolygonStakingABI'

// Polygon POL staking contracts on Ethereum Mainnet
const POL_ADDRESS = '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' // POL Token
const STAKE_MANAGE_ADDRESS = '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908'
const VALIDATOR_SHARE_ADDRESS = '0xf3c8d0c689fdf69b3c05b18f8a3e0b31f328ff7a'

// Network validation
async function validateNetwork(provider) {
  const network = await provider.getNetwork()
  if (network.chainId !== 1n) {
    throw new Error('Please connect to Ethereum Mainnet to stake POL tokens')
  }
}

// Switch to Ethereum Mainnet
async function switchToEthereumMainnet() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }] // Ethereum Mainnet
    })
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
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

  // Validate or switch to Ethereum Mainnet
  try {
    await validateNetwork(provider)
  } catch (error) {
    await switchToEthereumMainnet()
    // Re-create provider after network switch
    const newProvider = new BrowserProvider(window.ethereum)
    await validateNetwork(newProvider)
  }

  const signer = await provider.getSigner()
  const signerAddress = await signer.getAddress()
  return { provider, signer, address: signerAddress }
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

    // Validate network
    await validateNetwork(provider)

    const signer = await provider.getSigner()

    const polContract = new Contract(POL_ADDRESS, ERC20_ABI, signer)
    const amountWei = parseEther(amountPol.toString())

    // Check user's POL balance
    const balance = await polContract.balanceOf(delegatorAddress)
    console.log('User POL balance:', formatEther(balance))

    if (balance < amountWei) {
      throw new Error(
        `Insufficient POL balance. You have ${formatEther(balance)} POL but need ${formatEther(amountWei)} POL`
      )
    }

    // Check user's ETH balance for gas
    const ethBalance = await provider.getBalance(delegatorAddress)
    console.log('ETH balance:', formatEther(ethBalance))
    const minimumEthForGas = parseEther('0.01') // Minimum 0.01 ETH for gas

    if (ethBalance < minimumEthForGas) {
      console.warn('Low ETH balance for gas fees. You have:', formatEther(ethBalance))
    }

    console.log('🔄 Switching to traditional Polygon staking via StakeManager...')

    // Use StakeManager to get active validator
    const stakeManager = new Contract(STAKE_MANAGE_ADDRESS, STAKE_MANAGE_ABI, signer)

    // Try validator ID 1 (Binance) - usually stable
    const validatorId = 155
    console.log('Getting validator info for ID:', validatorId)

    const vInfo = await stakeManager.validators(validatorId)
    console.log('Validator info:', vInfo)

    const validatorShare = vInfo[6] // contractAddress
    const status = vInfo[7] // status: 0=Inactive,1=Active,2=Locked,3=Unstaked
    console.log('Validator share contract:', validatorShare)
    console.log('Validator share address:', VALIDATOR_SHARE_ADDRESS)
    console.log('Validator status:', status)

    if (validatorShare === '0x0000000000000000000000000000000000000000') {
      throw new Error('Validator contract address not found')
    }
    if (status !== 1n) {
      throw new Error(`Validator not active. Status: ${status}`)
    }

    // Check and approve allowance to validator share contract
    const allowance = await polContract.allowance(delegatorAddress, validatorShare)
    console.log('Current allowance to validator share:', formatEther(allowance))

    if (allowance < amountWei) {
      console.log('Approving POL tokens to validator share contract...')
      const approveTx = await polContract.approve(validatorShare, amountWei, {
        gasLimit: 100000
      })
      console.log('Approval transaction submitted:', approveTx.hash)
      await approveTx.wait()
      console.log('✅ Approval confirmed')
    } else {
      console.log('✅ Allowance is sufficient for validator share')
    }

    // Delegate tokens using ValidatorShare contract
    const validatorShareContract = new Contract(validatorShare, VALIDATOR_SHARE_ABI, signer)
    console.log('Delegating POL tokens to validator share contract...')
    console.log('validatorShareContract', validatorShareContract)
    console.log('amountWei', amountWei)
    // Call buyVoucherPOL on validator share contract (for POL tokens)

    // 100000000000000000n
    // 10000000000000000n

    const tx = await validatorShareContract.buyVoucherPOL(amountWei, 0n, {
      gasLimit: 500000
    })

    console.log('Delegation transaction submitted:', tx.hash)
    await tx.wait()
    console.log('✅ Delegation confirmed')

    return tx.hash
  } catch (error) {
    console.error('Error delegating tokens:', error)

    // Provide specific error messages
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
    console.log('---undelegateStake---')
    console.log('delegatorAddress:', delegatorAddress)
    console.log('validatoraddress:', validatoraddress)
    console.log('amountPol:', amountPol)

    const provider = new BrowserProvider(window.ethereum)

    // Validate network
    await validateNetwork(provider)

    const signer = await provider.getSigner()
    const amountWei = parseEther(amountPol.toString())

    // Use StakeManager to get validator info
    const stakeManager = new Contract(STAKE_MANAGE_ADDRESS, STAKE_MANAGE_ABI, signer)
    const validatorId = 155 // Same validator as delegation

    const vInfo = await stakeManager.validators(validatorId)
    const validatorShare = vInfo[6]

    const validatorShareContract = new Contract(validatorShare, VALIDATOR_SHARE_ABI, signer)

    // Check if user has enough staked tokens
    const userShares = await validatorShareContract.balanceOf(delegatorAddress)
    if (userShares === 0n) {
      throw new Error('No staked tokens found for this address')
    }

    console.log('Undelegating POL tokens...')
    // Use sellVoucher_newPOL for POL tokens with proper parameters
    const undelegateTx = await validatorShareContract.sellVoucher_newPOL(amountWei, amountWei, {
      gasLimit: 300000
    })
    console.log('Undelegation transaction submitted:', undelegateTx.hash)
    await undelegateTx.wait()
    console.log(`✅ Unstaked ${amountPol} POL`)
    console.log('Note: Unstaked tokens will be available after 21 days waiting period')

    return undelegateTx.hash
  } catch (error) {
    console.error('Error undelegating stake:', error)

    // Provide specific error messages
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
    console.log('---getRewardsEarned---')
    const stakingInfo = await fetch(
      `https://staking-api.polygon.technology/api/v3/delegators/${delegatorAddress}`
    )
    const data = await stakingInfo.json()
    let rewards = 0
    data.result.map((item) => {
      rewards += Number(item.claimedReward)
    })
    console.log('rewards', rewards)
    return rewards / 10 ** 18
  } catch (error) {
    console.error('Error getting rewards earned:', error)
    throw error
  }
}
