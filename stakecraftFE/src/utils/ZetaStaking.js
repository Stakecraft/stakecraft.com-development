import { AminoMsg, makeCosmoshubPath, makeSignDoc, serializeSignDoc, StdFee } from '@cosmjs/amino'
import { BroadcastMode, SigningStargateClient } from '@cosmjs/stargate'
import { Bech32 } from '@cosmjs/encoding'

const ZETA_CONFIG = {
  chainId: 'zetachain_7000-1',
  rpc: 'https://zetachain-rpc.polkachu.com',
  // rpc: 'https://zetachain-archive.allthatnode.com:1317',
  rest: 'https://zetachain-api.polkachu.com',
  denom: 'azeta',
  prefix: 'zeta',
  decimals: 18,
  displayDecimals: 6,
  explorer: 'https://explorer.zetachain.com/tx/'
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

    const offlineSigner = window.keplr.getOfflineSigner(ZETA_CONFIG.chainId)
    console.log('offlineSigner', offlineSigner)

    const accounts = await offlineSigner.getAccounts()
    console.log('accounts', accounts)

    if (accounts.length === 0) {
      throw new Error('No accounts found in Keplr')
    }
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
    await window.keplr.enable(ZETA_CONFIG.chainId)
    const response = await fetch(
      `${ZETA_CONFIG.rest}/cosmos/staking/v1beta1/validators/${validatorAddress}/delegations/${delegatorAddress}`
    )
    const data = await response.json()

    if (data.delegation_response) {
      const amount = data.delegation_response.balance.amount
      return {
        amount,
        denom: data.delegation_response.balance.denom,
        displayAmount: Number(amount) / Math.pow(10, ZETA_CONFIG.displayDecimals)
      }
    }
    return { amount: '0', denom: ZETA_CONFIG.denom, displayAmount: 0 }
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
    const offlineSigner = window.keplr.getOfflineSigner(ZETA_CONFIG.chainId)
    
    // Create client with Ethermint account parser
    const client = await SigningStargateClient.connectWithSigner(
      ZETA_CONFIG.rpc,
      offlineSigner,
      {
        accountParser: ethAccountParser
      }
    )

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
    
    const zetaBalance = balanceData.balances.find(b => b.denom === ZETA_CONFIG.denom)
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

    const { signed, signature } = await window.keplr.signAmino(
      ZETA_CONFIG.chainId,
      address,
      signDoc
    )

    // Broadcast the transaction using REST API
    const broadcastResponse = await fetch(
      `${ZETA_CONFIG.rest}/cosmos/tx/v1beta1/txs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tx_bytes: signed,
          mode: 'BROADCAST_MODE_SYNC'
        })
      }
    )

    const broadcastResult = await broadcastResponse.json()
    if (broadcastResult.tx_response?.txhash) {
      console.log('Account initialized:', broadcastResult.tx_response.txhash)
      // Wait for the transaction to be included in a block
      await new Promise(resolve => setTimeout(resolve, 5000))
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
    const amountInAzeta = Math.floor(amount * Math.pow(10, ZETA_CONFIG.displayDecimals)).toString()

    // Convert Ethereum address to ZetaChain address if needed
    const zetaAddress = delegatorAddress.startsWith('0x') 
      ? ethToZetaAddress(delegatorAddress)
      : delegatorAddress

    // Initialize account if needed
    await initializeAccount(zetaAddress)

    // Wait for account initialization to be processed
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Initialize client after account is ready
    const offlineSigner = window.keplr.getOfflineSigner(ZETA_CONFIG.chainId)
    const client = await SigningStargateClient.connectWithSigner(
      ZETA_CONFIG.rpc,
      offlineSigner,
      {
        accountParser: ethAccountParser
      }
    )

    // Get account info after initialization
    const accountInfo = await getAccountInfo(zetaAddress)
    if (!accountInfo || !accountInfo.accountNumber) {
      throw new Error('Account not properly initialized. Please try again.')
    }

    const msg = {
      type: 'cosmos-sdk/MsgDelegate',
      value: {
        delegator_address: zetaAddress,
        validator_address: validatorAddress,
        amount: {
          denom: ZETA_CONFIG.denom,
          amount: amountInAzeta
        }
      }
    }

    const fee = {
      amount: [
        {
          denom: ZETA_CONFIG.denom,
          amount: '10000'
        }
      ],
      gas: '500000'
    }

    const signDoc = {
      chain_id: ZETA_CONFIG.chainId,
      account_number: accountInfo.accountNumber,
      sequence: accountInfo.sequence,
      fee,
      msgs: [msg],
      memo: ''
    }

    const { signed, signature } = await window.keplr.signAmino(
      ZETA_CONFIG.chainId,
      zetaAddress,
      signDoc
    )

    // Encode the signed transaction
    const signedTx = {
      msg: signed.msgs,
      fee: signed.fee,
      signatures: [{
        pub_key: {
          type: 'tendermint/PubKeySecp256k1',
          value: signature.pub_key.value
        },
        signature: signature.signature
      }],
      memo: signed.memo
    }

    const signedTxBase64 = btoa(JSON.stringify(signedTx))

    console.log('signedTxBase64', signedTxBase64)

    const broadcastResponse = await fetch(
      `${ZETA_CONFIG.rest}/cosmos/tx/v1beta1/txs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tx_bytes: signedTxBase64,
          mode: 'BROADCAST_MODE_SYNC'
        })
      }
    )

    const broadcastResult = await broadcastResponse.json()

    console.log('broadcastResult', broadcastResult)

    if (broadcastResult.tx_response?.txhash) {
      return {
        txHash: broadcastResult.tx_response.txhash,
        explorerLink: `${ZETA_CONFIG.explorer}${broadcastResult.tx_response.txhash}`
      }
    } else {
      console.error('Broadcast error:', broadcastResult)
      throw new Error('Failed to broadcast delegation transaction: ' + (broadcastResult.error || 'Unknown error'))
    }
  } catch (error) {
    console.error('Delegation error:', error)
    throw new Error('Failed to delegate tokens: ' + error.message)
  }
}

export async function undelegateStake(delegatorAddress, validatorAddress, amount) {
  if (!window.keplr) {
    throw new Error('Keplr wallet is not installed')
  }

  try {
    await window.keplr.enable(ZETA_CONFIG.chainId)
    const amountInAzeta = Math.floor(amount * Math.pow(10, ZETA_CONFIG.displayDecimals)).toString()

    // Convert Ethereum address to ZetaChain address if needed
    const zetaAddress = delegatorAddress.startsWith('0x')
      ? ethToZetaAddress(delegatorAddress)
      : delegatorAddress

    // Initialize account if needed
    await initializeAccount(zetaAddress)

    // Initialize client after account is ready
    const offlineSigner = window.keplr.getOfflineSigner(ZETA_CONFIG.chainId)
    const client = await SigningStargateClient.connectWithSigner(ZETA_CONFIG.rpc, offlineSigner, {
      accountParser: ethAccountParser
    })

    const accountInfo = await getAccountInfo(zetaAddress)

    const msg = {
      type: 'cosmos-sdk/MsgUndelegate',
      value: {
        delegator_address: zetaAddress,
        validator_address: validatorAddress,
        amount: {
          denom: ZETA_CONFIG.denom,
          amount: amountInAzeta
        }
      }
    }

    const fee = {
      amount: [
        {
          denom: ZETA_CONFIG.denom,
          amount: '10000'
        }
      ],
      gas: '500000'
    }

    const signDoc = {
      chain_id: ZETA_CONFIG.chainId,
      account_number: accountInfo.accountNumber,
      sequence: accountInfo.sequence,
      fee,
      msgs: [msg],
      memo: ''
    }

    const { signed, signature } = await window.keplr.signAmino(
      ZETA_CONFIG.chainId,
      zetaAddress,
      signDoc
    )

    const result = await client.signAndBroadcast(zetaAddress, [msg], {
      amount: [{ denom: ZETA_CONFIG.denom, amount: '10000' }],
      gas: '500000'
    })

    return {
      txHash: result.transactionHash,
      explorerLink: `${ZETA_CONFIG.explorer}${result.transactionHash}`
    }
  } catch (error) {
    console.error('Undelegation error:', error)
    throw new Error('Failed to undelegate tokens: ' + error.message)
  }
}
