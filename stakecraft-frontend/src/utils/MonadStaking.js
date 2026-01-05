import { BrowserProvider, Contract, parseEther, formatEther, AbiCoder } from 'ethers'

// Monad Network Configurations (Mainnet)
const MONAD_MAINNET_CONFIG = {
  chainId: '0x8F', // 143 in hex
  chainName: 'Monad Mainnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: [
    import.meta.env.VITE_MONAD_MAINNET_RPC_URL || 'https://rpc.monad.fastlane.xyz/9oANg8u4ShUV2YFkPss2RVGDqt561f4R'
  ],
  blockExplorerUrls: [
    import.meta.env.VITE_MONAD_MAINNET_EXPLORER_URL || 'https://monad.socialscan.io'
  ]
}

// Official Monad Staking Precompile Address
const STAKING_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000001000'

// Function selectors
const FUNCTION_SELECTORS = {
  DELEGATE: '84994fec',
  UNDELEGATE: '5cf41514',
  WITHDRAW: 'aed2ee73',
  CLAIM_REWARDS: 'a76e2ca5',
  COMPOUND: 'b34fea67',
  GET_EPOCH: '757991a8',
  GET_VALIDATOR: '2b6d639a',
  GET_DELEGATOR: '573c1ce0'
}

// Simplified ABI for direct function calls
const STAKING_PRECOMPILE_ABI = [
  {
    type: 'function',
    name: 'getEpoch',
    inputs: [],
    outputs: [
      { name: 'epoch', type: 'uint64' },
      { name: 'inEpochDelayPeriod', type: 'bool' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getValidator',
    inputs: [{ name: 'validatorId', type: 'uint64' }],
    outputs: [
      { name: 'authAddress', type: 'address' },
      { name: 'flags', type: 'uint64' },
      { name: 'stake', type: 'uint256' },
      { name: 'accRewardPerToken', type: 'uint256' },
      { name: 'commission', type: 'uint256' },
      { name: 'unclaimedRewards', type: 'uint256' },
      { name: 'consensusStake', type: 'uint256' },
      { name: 'consensusCommission', type: 'uint256' },
      { name: 'snapshotStake', type: 'uint256' },
      { name: 'snapshotCommission', type: 'uint256' },
      { name: 'secpPubkey', type: 'bytes' },
      { name: 'blsPubkey', type: 'bytes' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getDelegator',
    inputs: [
      { name: 'validatorId', type: 'uint64' },
      { name: 'delegator', type: 'address' }
    ],
    outputs: [
      { name: 'stake', type: 'uint256' },
      { name: 'accRewardPerToken', type: 'uint256' },
      { name: 'unclaimedRewards', type: 'uint256' },
      { name: 'deltaStake', type: 'uint256' },
      { name: 'nextDeltaStake', type: 'uint256' },
      { name: 'deltaEpoch', type: 'uint64' },
      { name: 'nextDeltaEpoch', type: 'uint64' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'delegate',
    inputs: [{ name: 'validatorId', type: 'uint64' }],
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'undelegate',
    inputs: [
      { name: 'validatorId', type: 'uint64' },
      { name: 'amount', type: 'uint256' },
      { name: 'withdrawId', type: 'uint8' }
    ],
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [
      { name: 'validatorId', type: 'uint64' },
      { name: 'withdrawId', type: 'uint8' }
    ],
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'claimRewards',
    inputs: [{ name: 'validatorId', type: 'uint64' }],
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'compound',
    inputs: [{ name: 'validatorId', type: 'uint64' }],
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'payable'
  }
]

// Helper function to encode function call data
function encodeCallData(selector, types, values) {
  if (types.length === 0) {
    return '0x' + selector
  }
  const encoded = AbiCoder.defaultAbiCoder().encode(types, values)
  return '0x' + selector + encoded.slice(2)
}

async function validateNetwork(provider) {
  const network = await provider.getNetwork()
  const expectedChainId = 143n // Monad mainnet
  if (network.chainId !== expectedChainId) {
    throw new Error('Please connect to Monad Mainnet to stake MON tokens')
  }
}

async function switchToMonadNetwork() {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_MAINNET_CONFIG.chainId }]
    })
  } catch (switchError) {
    if (switchError.code === 4902) {
      // Chain not added, try to add it
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [MONAD_MAINNET_CONFIG]
        })
      } catch (addError) {
        if (addError.code === 4001) {
          throw new Error('User rejected adding Monad Mainnet to MetaMask')
        } else {
          throw new Error(`Failed to add Monad Mainnet: ${addError.message}`)
        }
      }
    } else if (switchError.code === 4001) {
      throw new Error('User rejected switching to Monad Mainnet')
    } else {
      throw new Error(`Failed to switch to Monad Mainnet: ${switchError.message}`)
    }
  }
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask to continue.')
  }

  const provider = new BrowserProvider(window.ethereum, 'any')
  await provider.send('eth_requestAccounts', [])

  try {
    await validateNetwork(provider)
  } catch (error) {
    await switchToMonadNetwork()
    const newProvider = new BrowserProvider(window.ethereum, 'any')
    await validateNetwork(newProvider)
  }

  const signer = await provider.getSigner()
  const signerAddress = await signer.getAddress()
  return { provider, signer, address: signerAddress }
}

export const WalletDisconnect = async () => {
  try {
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

export async function getMonadBalance(address) {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  const provider = new BrowserProvider(window.ethereum, 'any')
  try {
    const balance = await provider.getBalance(address)
    return balance
  } catch (err) {
    console.error('getBalance error:', err)
    throw new Error('Failed to get MON balance')
  }
}

export async function getValidatorInfo(validatorId) {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  try {
    const provider = new BrowserProvider(window.ethereum, 'any')
    await validateNetwork(provider)

    const stakingContract = new Contract(
      STAKING_PRECOMPILE_ADDRESS,
      STAKING_PRECOMPILE_ABI,
      provider
    )
    const validatorInfo = await stakingContract.getValidator(validatorId)

    return {
      authAddress: validatorInfo[0],
      flags: validatorInfo[1],
      stake: validatorInfo[2],
      accRewardPerToken: validatorInfo[3],
      commission: validatorInfo[4],
      unclaimedRewards: validatorInfo[5],
      consensusStake: validatorInfo[6],
      consensusCommission: validatorInfo[7],
      snapshotStake: validatorInfo[8],
      snapshotCommission: validatorInfo[9],
      secpPubkey: validatorInfo[10],
      blsPubkey: validatorInfo[11]
    }
  } catch (error) {
    console.error(`Error getting validator info for validator ${validatorId}:`, error)
    return null
  }
}

export async function findValidatorIdByAddress(validatorAddress) {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  if (!validatorAddress || !validatorAddress.startsWith('0x')) {
    throw new Error('Invalid validator address format')
  }

  try {
    const provider = new BrowserProvider(window.ethereum, 'any')
    await validateNetwork(provider)

    const stakingContract = new Contract(
      STAKING_PRECOMPILE_ADDRESS,
      STAKING_PRECOMPILE_ABI,
      provider
    )

    // Normalize address for comparison
    const normalizedAddress = validatorAddress.toLowerCase()

    // Known Stakecraft validator mapping for faster lookup
    const knownValidators = {
      '0xadbe62e7c9e0b4902b1aae233a774386892e36bc': 39
    }

    // Check known validators first
    if (knownValidators[normalizedAddress]) {
      try {
        const validatorInfo = await stakingContract.getValidator(knownValidators[normalizedAddress])
        const authAddress = validatorInfo[0]?.toLowerCase()
        if (authAddress === normalizedAddress) {
          return knownValidators[normalizedAddress]
        }
      } catch (error) {
        console.warn('Known validator ID check failed, continuing search:', error)
      }
    }

    // Try to find validator by searching through validator IDs
    const maxValidatorId = 1000

    for (let id = 1; id <= maxValidatorId; id++) {
      try {
        const validatorInfo = await stakingContract.getValidator(id)
        const authAddress = validatorInfo[0]?.toLowerCase()

        if (authAddress === normalizedAddress) {
          return id
        }
      } catch (error) {
        // Validator doesn't exist, continue searching
        continue
      }
    }

    try {
      const response = await fetch(
        'https://monad-indexer.hoodscan.io/api/validators/rankings?limit=1000'
      )
      if (response.ok) {
        const data = await response.json()
        if (data && Array.isArray(data)) {
          for (const validator of data) {
            if (
              validator.authAddress?.toLowerCase() === normalizedAddress ||
              validator.address?.toLowerCase() === normalizedAddress
            ) {
              return parseInt(validator.validatorId || validator.id)
            }
          }
        }
      }
    } catch (apiError) {
      console.warn('Failed to query Hoodscan API:', apiError)
    }

    throw new Error(`Validator not found for address: ${validatorAddress}`)
  } catch (error) {
    console.error('Error finding validator ID by address:', error)
    throw error
  }
}

export async function getDelegationAmount(delegatorAddress, validatorId) {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  try {
    const provider = new BrowserProvider(window.ethereum, 'any')
    await validateNetwork(provider)

    const stakingContract = new Contract(
      STAKING_PRECOMPILE_ADDRESS,
      STAKING_PRECOMPILE_ABI,
      provider
    )
    const delegatorInfo = await stakingContract.getDelegator(validatorId, delegatorAddress)

    const currentStake = delegatorInfo[0]
    return currentStake
  } catch (error) {
    // If the error is "missing revert data" or "CALL_EXCEPTION", it means no delegation exists
    if (
      error.code === 'CALL_EXCEPTION' ||
      error.message?.includes('missing revert data') ||
      error.message?.includes('revert')
    ) {
      return 0n
    }

    console.error(`Error getting delegation for validator ${validatorId}:`, error.message)
    return 0n
  }
}

export async function getRewardsEarned(delegatorAddress, validatorId) {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  try {
    const provider = new BrowserProvider(window.ethereum, 'any')
    await validateNetwork(provider)

    const stakingContract = new Contract(
      STAKING_PRECOMPILE_ADDRESS,
      STAKING_PRECOMPILE_ABI,
      provider
    )

    const delegatorInfo = await stakingContract.getDelegator(validatorId, delegatorAddress)
    const unclaimedRewards = delegatorInfo[2]

    return formatEther(unclaimedRewards)
  } catch (error) {
    // If the error is "missing revert data" or "CALL_EXCEPTION", it means no delegation/rewards exist
    if (
      error.code === 'CALL_EXCEPTION' ||
      error.message?.includes('missing revert data') ||
      error.message?.includes('revert')
    ) {
      return '0.0'
    }

    console.error(`Error getting rewards for validator ${validatorId}:`, error.message)
    return '0.0'
  }
}

export async function delegateTokens(delegatorAddress, validatorId, amountMon) {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  try {
    const provider = new BrowserProvider(window.ethereum, 'any')
    await provider.send('eth_requestAccounts', [])
    await validateNetwork(provider)
    const signer = await provider.getSigner()
    const amountWei = parseEther(amountMon.toString())
    const balance = await provider.getBalance(delegatorAddress)
    const gasBuffer = parseEther('0.01')
    const requiredBalance = amountWei + gasBuffer

    if (balance < requiredBalance) {
      throw new Error(
        `Insufficient MON balance. You have ${formatEther(
          balance
        )} MON but need ${formatEther(requiredBalance)} MON (including gas fees)`
      )
    }

    const validatorInfo = await getValidatorInfo(validatorId)
    if (!validatorInfo) {
      throw new Error(`Validator ${validatorId} not found on Monad Mainnet`)
    }

    const callData = encodeCallData(FUNCTION_SELECTORS.DELEGATE, ['uint64'], [validatorId])

    const gasPrice = 100000000000n

    const tx = await signer.sendTransaction({
      to: STAKING_PRECOMPILE_ADDRESS,
      data: callData,
      value: amountWei,
      gasLimit: 500000,
      gasPrice: gasPrice
    })

    const receipt = await tx.wait()

    if (!receipt || receipt.status === 0) {
      throw new Error('Transaction failed - check transaction hash on explorer for details')
    }

    return tx.hash
  } catch (error) {
    console.error('❌ Error delegating tokens:', error)

    if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient MON for staking and gas fees. Please add MON to your wallet.')
    } else if (error.message.includes('user rejected') || error.code === 4001) {
      throw new Error('Transaction was rejected. Please approve the transaction in MetaMask.')
    } else if (error.message.includes('execution reverted')) {
      throw new Error(
        'Staking transaction failed. This could be due to insufficient balance, wrong network, or validator not found.'
      )
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network connection error. Please check your RPC connection and try again.')
    }

    throw error
  }
}

export async function undelegateStake(delegatorAddress, validatorId, amountMon) {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  try {
    const provider = new BrowserProvider(window.ethereum, 'any')
    await provider.send('eth_requestAccounts', [])
    await validateNetwork(provider)
    const signer = await provider.getSigner()
    const amountWei = parseEther(amountMon.toString())
    const currentDelegation = await getDelegationAmount(delegatorAddress, validatorId)

    if (currentDelegation < amountWei) {
      throw new Error(
        `Insufficient delegation. You have ${formatEther(
          currentDelegation
        )} MON delegated but trying to undelegate ${formatEther(amountWei)} MON`
      )
    }

    const withdrawalId = 0
    const callData = encodeCallData(
      FUNCTION_SELECTORS.UNDELEGATE,
      ['uint64', 'uint256', 'uint8'],
      [validatorId, amountWei, withdrawalId]
    )

    const gasPrice = 100000000000n

    const tx = await signer.sendTransaction({
      to: STAKING_PRECOMPILE_ADDRESS,
      data: callData,
      value: 0,
      gasLimit: 300000,
      gasPrice: gasPrice
    })

    const receipt = await tx.wait()

    if (!receipt || receipt.status === 0) {
      throw new Error('Undelegation transaction failed - check transaction hash on explorer')
    }
    return tx.hash
  } catch (error) {
    console.error('❌ Error undelegating stake:', error)

    if (error.message.includes('user rejected') || error.code === 4001) {
      throw new Error('Transaction was rejected. Please approve the transaction in MetaMask.')
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network connection error. Please check your RPC connection and try again.')
    }

    throw error
  }
}

export async function claimRewards(delegatorAddress, validatorId) {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  try {
    const provider = new BrowserProvider(window.ethereum, 'any')
    await provider.send('eth_requestAccounts', [])
    await validateNetwork(provider)
    const signer = await provider.getSigner()

    // First, check rewards and estimate gas
    const stakingContractView = new Contract(
      STAKING_PRECOMPILE_ADDRESS,
      STAKING_PRECOMPILE_ABI,
      provider
    )
    const delegatorInfo = await stakingContractView.getDelegator(validatorId, delegatorAddress)
    const unclaimedRewards = delegatorInfo[2]
    const gasPrice = 100000000000n
    const estimatedGasLimit = 200000n
    const estimatedGasCost = estimatedGasLimit * gasPrice

    if (unclaimedRewards < estimatedGasCost) {
      const loss = formatEther(estimatedGasCost - unclaimedRewards)
      throw new Error(
        `⚠️ Gas fees (${formatEther(
          estimatedGasCost
        )} MON) are higher than your rewards (${formatEther(
          unclaimedRewards
        )} MON). You would LOSE ${loss} MON!`
      )
    }

    const balanceBefore = await provider.getBalance(delegatorAddress)

    // Create contract instance with signer for transaction
    const stakingContract = new Contract(
      STAKING_PRECOMPILE_ADDRESS,
      STAKING_PRECOMPILE_ABI,
      signer
    )

    // Call claimRewards function using ABI
    const tx = await stakingContract.claimRewards(validatorId, {
      gasLimit: 200000n,
      gasPrice: gasPrice
    })

    const receipt = await tx.wait()

    if (!receipt || receipt.status === 0) {
      throw new Error('Claim rewards transaction failed')
    }

    const balanceAfter = await provider.getBalance(delegatorAddress)
    const actualGasUsed = receipt.gasUsed * (receipt.gasPrice || 0n)
    const netProfit = balanceAfter - balanceBefore

    return {
      txHash: tx.hash,
      rewardsClaimed: formatEther(unclaimedRewards),
      gasCost: formatEther(actualGasUsed),
      netProfit: formatEther(netProfit)
    }
  } catch (error) {
    console.error('❌ Error claiming rewards:', error)

    if (error.message.includes('user rejected') || error.code === 4001) {
      throw new Error('Transaction was rejected. Please approve the transaction in MetaMask.')
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network connection error. Please check your RPC connection and try again.')
    } else if (error.message && error.message.includes('execution reverted')) {
      throw new Error('Transaction reverted. You may not have any rewards to claim.')
    }

    throw error
  }
}

export async function compoundRewards(delegatorAddress, validatorId) {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  try {
    const provider = new BrowserProvider(window.ethereum, 'any')
    await provider.send('eth_requestAccounts', [])
    await validateNetwork(provider)
    const signer = await provider.getSigner()

    // First, check if there are rewards to compound
    const stakingContractView = new Contract(
      STAKING_PRECOMPILE_ADDRESS,
      STAKING_PRECOMPILE_ABI,
      provider
    )
    const delegatorInfo = await stakingContractView.getDelegator(validatorId, delegatorAddress)
    const unclaimedRewards = delegatorInfo[2]

    if (unclaimedRewards === 0n) {
      throw new Error('No rewards available to compound')
    }

    // Create contract instance with signer for transaction
    const stakingContract = new Contract(
      STAKING_PRECOMPILE_ADDRESS,
      STAKING_PRECOMPILE_ABI,
      signer
    )

    // Call compound function
    const tx = await stakingContract.compound(validatorId, {
      value: 0n,
      gasLimit: 500000n,
      gasPrice: 100000000000n
    })

    const receipt = await tx.wait()

    if (!receipt || receipt.status === 0) {
      throw new Error('Compound transaction failed')
    }

    return tx.hash
  } catch (error) {
    console.error('❌ Error compounding rewards:', error)

    if (error.message.includes('user rejected') || error.code === 4001) {
      throw new Error('Transaction was rejected. Please approve the transaction in MetaMask.')
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network connection error. Please check your RPC connection and try again.')
    } else if (error.message.includes('No rewards available')) {
      throw error
    } else if (error.message && error.message.includes('execution reverted')) {
      throw new Error(
        'Transaction reverted. You may not have enough rewards to compound, or the validator may not be accepting delegations.'
      )
    }

    throw new Error(error.message || 'Failed to compound rewards')
  }
}

