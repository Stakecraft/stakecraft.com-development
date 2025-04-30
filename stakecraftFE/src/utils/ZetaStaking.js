import { AminoMsg, makeCosmoshubPath, makeSignDoc, serializeSignDoc, StdFee } from '@cosmjs/amino'
import { BroadcastMode, SigningStargateClient } from '@cosmjs/stargate'

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

export async function connectWallet() {
  if (!window.keplr) {
    throw new Error('Keplr wallet is not installed')
  }

  try {
    await suggestChain()
    await window.keplr.enable(ZETA_CONFIG.chainId)

    const offlineSigner = window.keplr.getOfflineSigner(ZETA_CONFIG.chainId)
    const accounts = await offlineSigner.getAccounts()

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

export async function delegateTokens(delegatorAddress, validatorAddress, amount) {
  if (!window.keplr) {
    throw new Error('Keplr wallet is not installed')
  }

  try {
    await window.keplr.enable(ZETA_CONFIG.chainId)
    const amountInAzeta = Math.floor(amount * Math.pow(10, ZETA_CONFIG.displayDecimals)).toString()

    console.log(
      `Delegating ${amount} ZETA (${amountInAzeta} azeta) from ${delegatorAddress} to ${validatorAddress}`
    )

    const accountInfo = await getAccountInfo(delegatorAddress)

    const msg = {
      type: 'cosmos-sdk/MsgDelegate',
      value: {
        delegator_address: delegatorAddress,
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
      delegatorAddress,
      signDoc
    )

    let txHash = null
    let broadcastMethod = null

    if (typeof window.keplr.experimentalBroadcastTx === 'function') {
      console.log("Using Keplr's experimentalBroadcastTx method...")
      try {
        const broadcastResult = await window.keplr.experimentalBroadcastTx(
          ZETA_CONFIG.chainId,
          signDoc,
          'BROADCAST_MODE_SYNC'
        )
        console.log('Broadcast result:', broadcastResult)
        txHash = broadcastResult.txhash
        broadcastMethod = 'experimentalBroadcastTx'

        const client = await SigningStargateClient.connectWithSigner(
          rpcUrl,
          window.keplr.getOfflineSigner(ZETA_CONFIG.chainId)
        )

        const result = await client.signAndBroadcast(delegatorAddress, [msg], {
          amount: [{ denom: 'azeta', amount: String(amount * 1_000_000) }],
          gas: '300000'
        })

        console.log('result', result)
        return result
      } catch (broadcastError) {
        console.error('Error with experimentalBroadcastTx:', broadcastError)
      }
    }
    return {
      txHash,
      broadcastMethod,
      explorerLink: `${ZETA_CONFIG.explorer}${txHash}`
    }
  } catch (error) {
    console.error('Delegation error:', error)
    throw new Error('Failed to delegate tokens: ' + error.message)
  }
}
