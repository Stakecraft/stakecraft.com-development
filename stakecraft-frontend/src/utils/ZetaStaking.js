import { SigningStargateClient } from '@cosmjs/stargate'
import { Bech32 } from '@cosmjs/encoding'

const ZETA_CONFIG = {
  chainId: 'zetachain_7000-1',
  rpc: 'https://zetachain-rpc.polkachu.com',
  rest: 'https://zetachain-api.polkachu.com',
  denom: 'azeta',
  prefix: 'zeta',
  decimals: 18,
  displayDecimals: 6,
  explorer: 'https://explorer.zetachain.com/tx/'
}

const RPC_ENDPOINTS = [
  'https://zetachain-rpc.polkachu.com',
  'https://zetachain-mainnet-archive.allthatnode.com:26657',
  'https://rpc.zetachain.nodestake.top'
]

// Helper function to try different RPC endpoints
export const tryRpcEndpoints = async (offlineSigner) => {
  let lastError = null
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const client = await SigningStargateClient.connectWithSigner(endpoint, offlineSigner, {
        accountParser: ethAccountParser
      })
      return client
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error)
      lastError = error
    }
  }
  throw new Error(`Failed to connect to any RPC endpoint. Last error: ${lastError?.message}`)
}

// Add custom account parser for Ethermint
function ethAccountParser(any) {
  try {
    if (any.type === '/ethermint.types.v1.EthAccount') {
      return {
        address: any.value.base_account.address,
        pubkey: any.value.base_account.pub_key || null,
        accountNumber: Number(any.value.base_account.account_number) || 0,
        sequence: Number(any.value.base_account.sequence) || 0
      }
    }
    return null
  } catch (error) {
    console.warn('Account parsing error:', error)
    return null
  }
}

// Add function to convert Ethereum address to ZetaChain address
function ethToZetaAddress(ethAddress) {
  try {
    // Remove '0x' prefix if present
    const cleanAddress = ethAddress.replace('0x', '')
    // Convert to bytes
    const addressBytes = new Uint8Array(
      cleanAddress.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    )
    // Convert to bech32
    return Bech32.encode(ZETA_CONFIG.prefix, addressBytes)
  } catch (error) {
    console.error('Error converting address:', error)
    throw new Error('Invalid Ethereum address format')
  }
}

export async function connectWallet() {
  if (!window.keplr) {
    throw new Error('Keplr wallet is not installed')
  }

  try {
    await suggestChain()
    await window.keplr.enable(ZETA_CONFIG.chainId)

    const offlineSigner = window.getOfflineSigner(ZETA_CONFIG.chainId)
    console.log('offlineSigner', offlineSigner)

    const accounts = await offlineSigner.getAccounts()
    console.log('accounts', accounts)

    return accounts[0].address
  } catch (error) {
    console.error('Connection error:', error)
    throw new Error('Failed to connect wallet: ' + error.message)
  }
}

async function suggestChain() {
  try {
    await window.keplr.experimentalSuggestChain({
      chainId: ZETA_CONFIG.chainId,
      chainName: 'ZetaChain',
      rpc: ZETA_CONFIG.rpc,
      rest: ZETA_CONFIG.rest,
      bip44: {
        coinType: 60 // Ethereum coin type for Ethermint
      },
      bech32Config: {
        bech32PrefixAccAddr: ZETA_CONFIG.prefix,
        bech32PrefixAccPub: `${ZETA_CONFIG.prefix}pub`,
        bech32PrefixValAddr: `${ZETA_CONFIG.prefix}valoper`,
        bech32PrefixValPub: `${ZETA_CONFIG.prefix}valoperpub`,
        bech32PrefixConsAddr: `${ZETA_CONFIG.prefix}valcons`,
        bech32PrefixConsPub: `${ZETA_CONFIG.prefix}valconspub`
      },
      currencies: [
        {
          coinDenom: 'ZETA',
          coinMinimalDenom: ZETA_CONFIG.denom,
          coinDecimals: ZETA_CONFIG.decimals,
          coinGeckoId: 'zetachain'
        }
      ],
      feeCurrencies: [
        {
          coinDenom: 'ZETA',
          coinMinimalDenom: ZETA_CONFIG.denom,
          coinDecimals: ZETA_CONFIG.decimals,
          coinGeckoId: 'zetachain',
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.04
          }
        }
      ],
      stakeCurrency: {
        coinDenom: 'ZETA',
        coinMinimalDenom: ZETA_CONFIG.denom,
        coinDecimals: ZETA_CONFIG.decimals,
        coinGeckoId: 'zetachain'
      },
      features: ['ibc-transfer', 'ibc-go', 'eth-address-gen', 'eth-key-sign']
    })
    console.log('Chain suggested successfully')
  } catch (error) {
    console.error('Error suggesting chain:', error)
  }
}

export async function getAccountInfo(address) {
  try {
    const accountResponse = await fetch(
      `${ZETA_CONFIG.rest}/cosmos/auth/v1beta1/accounts/${address}`
    )
    const accountData = await accountResponse.json()
    const balanceResponse = await fetch(
      `${ZETA_CONFIG.rest}/cosmos/bank/v1beta1/balances/${address}`
    )
    const balanceData = await balanceResponse.json()

    const zetaBalance = balanceData.balances.find((b) => b.denom === ZETA_CONFIG.denom) || {
      denom: ZETA_CONFIG.denom,
      amount: '0'
    }

    let accountNumber = '0'
    let sequence = '0'

    if (accountData.account && accountData.account.base_account) {
      accountNumber = accountData.account.base_account.account_number || '0'
      sequence = accountData.account.base_account.sequence || '0'
    } else if (accountData.account) {
      accountNumber = accountData.account.account_number || '0'
      sequence = accountData.account.sequence || '0'
    }

    return {
      address,
      accountNumber,
      sequence,
      balance: {
        denom: zetaBalance.denom,
        amount: zetaBalance.amount,
        displayAmount: Number(zetaBalance.amount) / Math.pow(10, ZETA_CONFIG.displayDecimals)
      }
    }
  } catch (error) {
    console.error('Error getting account info:', error)
    throw new Error('Failed to get account information: ' + error.message)
  }
}

export async function getTotalStakedAmount(delegatorAddress, validatorAddress) {
  if (!window.keplr) {
    throw new Error('Keplr wallet is not installed')
  }

  try {
    // Validate addresses
    if (!delegatorAddress || !validatorAddress) {
      throw new Error('Both delegator and validator addresses are required')
    }

    // Validate bech32 addresses
    if (delegatorAddress.length < 10 || validatorAddress.length < 10) {
      throw new Error('Invalid address format')
    }

    await window.keplr.enable(ZETA_CONFIG.chainId)
    const offlineSigner = window.getOfflineSigner(ZETA_CONFIG.chainId)
    const client = await tryRpcEndpoints(offlineSigner)

    console.log('Getting delegation for:', { delegatorAddress, validatorAddress })
    const stakingInfo = await client.getDelegation(delegatorAddress, validatorAddress)

    if (!stakingInfo) {
      return { amount: '0', denom: ZETA_CONFIG.denom, displayAmount: 0 }
    }

    return {
      amount: stakingInfo.amount,
      denom: stakingInfo.denom,
      displayAmount: Number(stakingInfo.amount) / Math.pow(10, ZETA_CONFIG.displayDecimals)
    }
  } catch (error) {
    console.error('Error getting total staked amount:', error)
    throw new Error('Failed to get total staked amount: ' + error.message)
  }
}

export async function initializeAccount(address) {
  try {
    // Check if account exists using REST API
    const accountCheck = await fetch(`${ZETA_CONFIG.rest}/cosmos/auth/v1beta1/accounts/${address}`)
    const result = await accountCheck.json()
    console.log('Account check result:', result)

    // If account exists, return true
    if (result.account) {
      return true
    }

    // If account doesn't exist, we need to initialize it
    await window.keplr.enable(ZETA_CONFIG.chainId)
    const offlineSigner = window.getOfflineSigner(ZETA_CONFIG.chainId)

    // Create client with Ethermint account parser
    await tryRpcEndpoints(offlineSigner)

    const accounts = await offlineSigner.getAccounts()
    const userAddress = accounts[0].address

    if (userAddress !== address) {
      throw new Error('Wallet address mismatch.')
    }

    // Get account balance
    const balanceResponse = await fetch(
      `${ZETA_CONFIG.rest}/cosmos/bank/v1beta1/balances/${address}`
    )
    const balanceData = await balanceResponse.json()

    const zetaBalance = balanceData.balances.find((b) => b.denom === ZETA_CONFIG.denom)
    if (!zetaBalance || Number(zetaBalance.amount) === 0) {
      throw new Error('No ZETA tokens found in wallet. Please add some ZETA tokens before staking.')
    }

    // Create a self-send transaction to initialize the account
    const msg = {
      type: 'cosmos-sdk/MsgSend',
      value: {
        from_address: address,
        to_address: address,
        amount: [
          {
            denom: ZETA_CONFIG.denom,
            amount: '1' // smallest token to initialize
          }
        ]
      }
    }

    const fee = {
      amount: [
        {
          denom: ZETA_CONFIG.denom,
          amount: '5000'
        }
      ],
      gas: '200000'
    }

    const signDoc = {
      chain_id: ZETA_CONFIG.chainId,
      account_number: '0',
      sequence: '0',
      fee,
      msgs: [msg],
      memo: 'Initialize account'
    }

    const { signed } = await window.keplr.signAmino(ZETA_CONFIG.chainId, address, signDoc)

    // Broadcast the transaction using REST API
    const broadcastResponse = await fetch(`${ZETA_CONFIG.rest}/cosmos/tx/v1beta1/txs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_bytes: signed,
        mode: 'BROADCAST_MODE_SYNC'
      })
    })

    const broadcastResult = await broadcastResponse.json()
    if (broadcastResult.tx_response?.txhash) {
      console.log('Account initialized:', broadcastResult.tx_response.txhash)
      // Wait for the transaction to be included in a block
      await new Promise((resolve) => setTimeout(resolve, 5000))
      return true
    } else {
      throw new Error('Failed to broadcast initialization transaction')
    }
  } catch (error) {
    console.error('Failed to initialize account:', error)
    throw new Error('Failed to initialize account: ' + error.message)
  }
}

export async function delegateTokens(delegatorAddress, validatorAddress, amount) {
  if (!window.keplr) {
    throw new Error('Keplr wallet is not installed')
  }

  try {
    await window.keplr.enable(ZETA_CONFIG.chainId)

    // Convert Ethereum address to ZetaChain address if needed
    const zetaAddress = delegatorAddress.startsWith('0x')
      ? ethToZetaAddress(delegatorAddress)
      : delegatorAddress

    // Initialize account if needed
    await initializeAccount(zetaAddress)

    const offlineSigner = window.getOfflineSigner(ZETA_CONFIG.chainId)
    const client = await tryRpcEndpoints(offlineSigner)

    const result = await client.delegateTokens(
      zetaAddress,
      validatorAddress,
      {
        denom: ZETA_CONFIG.denom,
        amount: Math.floor(amount * Math.pow(10, ZETA_CONFIG.displayDecimals)).toString()
      },
      'auto',
      'Delegate ZETA tokens'
    )

    return {
      txHash: result.transactionHash,
      explorerLink: `${ZETA_CONFIG.explorer}${result.transactionHash}`
    }
  } catch (error) {
    console.error('Delegation error:', error)
    throw new Error('Failed to delegate tokens: ' + error.message)
  }
}

export async function getZetaBalance(walletAddress) {
  try {
    await window.keplr.enable(ZETA_CONFIG.chainId)
    const offlineSigner = window.getOfflineSigner(ZETA_CONFIG.chainId)
    const client = await tryRpcEndpoints(offlineSigner)
    const balances = await client.getAllBalances(walletAddress)
    // Find the ZETA balance (denom: 'azeta')
    const zetaBalance = balances.find((b) => b.denom === ZETA_CONFIG.denom)
    // Convert from micro-ZETA to ZETA
    return zetaBalance ? Number(zetaBalance.amount) / Math.pow(10, ZETA_CONFIG.decimals) : 0
  } catch (error) {
    console.error('Error getting ZETA balance:', error)
    throw new Error(`Failed to get ZETA balance: ${error.message}`)
  }
}

export async function undelegateStake(delegatorAddress, validatorAddress, unstakeAmount) {
  if (!window.keplr) {
    throw new Error('Keplr wallet is not installed')
  }

  try {
    // Validate addresses and amount
    if (!delegatorAddress || !validatorAddress) {
      throw new Error('Both delegator and validator addresses are required')
    }

    if (!unstakeAmount || unstakeAmount <= 0) {
      throw new Error('Valid unstake amount is required')
    }

    await window.keplr.enable(ZETA_CONFIG.chainId)

    // Convert Ethereum address to ZetaChain address if needed
    const zetaAddress = delegatorAddress.startsWith('0x')
      ? ethToZetaAddress(delegatorAddress)
      : delegatorAddress

    const offlineSigner = window.getOfflineSigner(ZETA_CONFIG.chainId)
    const client = await tryRpcEndpoints(offlineSigner)

    const delegation = await client.getDelegation(zetaAddress, validatorAddress)
    console.log('delegation', delegation)

    if (!delegation || !delegation.amount) {
      throw new Error('No delegation found for this validator')
    }

    // Get the delegation amount
    const currentDelegation = Number(delegation.amount) / Math.pow(10, ZETA_CONFIG.displayDecimals)
    console.log('currentDelegation', currentDelegation)
    console.log('unstakeAmount', unstakeAmount)

    if (unstakeAmount > currentDelegation) {
      throw new Error(`Cannot unstake more than currently delegated (${currentDelegation} ZETA)`)
    }

    // Format the amount properly for undelegation
    const amount = {
      denom: ZETA_CONFIG.denom,
      amount: Math.floor(unstakeAmount * Math.pow(10, ZETA_CONFIG.displayDecimals)).toString()
    }
    console.log('formatted amount', amount)

    const result = await client.undelegateTokens(
      zetaAddress,
      validatorAddress,
      amount,
      'auto',
      'Undelegate ZETA tokens'
    )
    console.log('result', result)

    return {
      txHash: result.transactionHash,
      explorerLink: `${ZETA_CONFIG.explorer}${result.transactionHash}`
    }
  } catch (error) {
    console.error('Undelegation error:', error)
    throw new Error('Failed to undelegate tokens: ' + error.message)
  }
}

// Get staking rewards for a delegator/validator pair
export const getZetaRewards = async (delegatorAddress, validatorAddress) => {
  try {
    console.log('validatorAddress', validatorAddress)

    const earnedRewards = await fetch(
      `${ZETA_CONFIG.rest}/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`
    ).then((r) => r.json())
    console.log('earnedRewards', earnedRewards)
    return earnedRewards
  } catch (error) {
    console.error('Error getting ZETA rewards:', error)
    return 0
  }
}

// Get unbonding delegations for a delegator/validator pair
export const getZetaUnbonding = async (delegatorAddress, validatorAddress) => {
  try {
    console.log('validatorAddress', validatorAddress)
    const unbonding_responses = await fetch(
      `${ZETA_CONFIG.rest}/cosmos/staking/v1beta1/delegators/${delegatorAddress}/unbonding_delegations`
    ).then((r) => r.json())
    console.log('unbonding_responses', unbonding_responses)
    return unbonding_responses
  } catch (error) {
    console.error('Error getting ZETA unbonding:', error)
    return []
  }
}
