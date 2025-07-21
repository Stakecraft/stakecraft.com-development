import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers'
import { ERC20_ABI } from '../constants/abis/ERC20ABI'
import { LAST_ABI } from '../constants/abis/PolygonStakingABI'
import { STAKE_MANAGE_ABI } from '../constants/abis/PolygonStakingABI'

// Polygon POL staking contracts on Ethereum Mainnet
const POL_ADDRESS = '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' // POL Token
const LAST_ADDRESS = '0x7e94d6cAbb20114b22a088d828772645f68CC67B'
const STAKE_MANAGE_ADDRESS = '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908'

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

export async function undelegateTokens(signer, validatorId, amountEth) {
  console.log('signer', signer)
  console.log('validatorId', validatorId)
  console.log('amountEth', amountEth)
}

export async function delegateTokens(delegatorAddress, validatoraddress, amountPol) {
  try {
    const provider = new BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])

    // Validate network
    await validateNetwork(provider)

    const signer = await provider.getSigner()

    const stakeManager = new Contract(STAKE_MANAGE_ADDRESS, STAKE_MANAGE_ABI, signer)
    const validatorId = 155

    const vInfo = await stakeManager.validators(validatorId)
    console.log('vInfo', vInfo)

    const validatorShare = vInfo[6]
    console.log('validatorShare', validatorShare)

    const status = vInfo[7] // 0=Inactive,1=Active,2=Locked,3=Unstaked
    console.log('status', status)

    if (validatorShare === '0x0000000000000000000000000000000000000000') {
      throw new Error('Validator ID does not exist')
    }
    if (status !== 1n) {
      throw new Error('Validator not active or not accepting delegations')
    }

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
    console.log('ethBalance', ethBalance)
    const minimumEthForGas = parseEther('0.01') // Minimum 0.01 ETH for gas

    // if (ethBalance < minimumEthForGas) {
    //   throw new Error('Insufficient ETH balance for gas fees. Please add ETH to your wallet.')
    // }

    // Check and approve allowance
    const allowance = await polContract.allowance(delegatorAddress, LAST_ADDRESS)
    console.log('Current allowance:', formatEther(allowance))

    if (allowance < amountWei) {
      console.log('Approving POL tokens...')
      const approveTx = await polContract.approve(LAST_ADDRESS, amountWei, {
        gasLimit: 100000
      })
      console.log('Approval transaction submitted:', approveTx.hash)
      await approveTx.wait()
      console.log('✅ Approval confirmed')
    } else {
      console.log('✅ Allowance is sufficient')
    }

    // Delegate tokens using LAST contract
    const vs = new Contract(LAST_ADDRESS, LAST_ABI, signer)
    console.log('Delegating POL tokens...')

    // Fixed: Changed 0n to 1n for minimum shares to mint
    const tx = await vs.buyVoucherPOL(amountWei, 1n, {
      gasLimit: 300000
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
    const voucherManager = new Contract(LAST_ADDRESS, LAST_ABI, signer)
    const amountWei = parseEther(amountPol.toString())

    // Check if user has enough staked tokens
    const userShares = await voucherManager.balanceOf(delegatorAddress)
    if (userShares === 0n) {
      throw new Error('No staked tokens found for this address')
    }

    console.log('Undelegating POL tokens...')
    // Use sellVoucherPOL with proper parameters
    const undelegateTx = await voucherManager.sellVoucherPOL(amountWei, amountWei, {
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
