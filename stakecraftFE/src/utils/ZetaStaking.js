import { SigningStargateClient } from '@cosmjs/stargate'
import { GasPrice } from '@cosmjs/stargate'
import { fromHex } from '@cosmjs/encoding'

const ZETA_RPC_ENDPOINT = 'https://zetachain-rpc.polkachu.com'
const ZETA_CHAIN_ID = 'zetachain_7000-1'
const MINIMUM_GAS_PRICE = '0.025azeta'

export async function connectWallet() {
  if (!window.keplr) {
    throw new Error('Keplr wallet is not installed')
  }

  try {
    await window.keplr.enable(ZETA_CHAIN_ID)
    const offlineSigner = window.keplr.getOfflineSigner(ZETA_CHAIN_ID)
    const accounts = await offlineSigner.getAccounts()
    return accounts[0].address
  } catch (error) {
    throw new Error('Failed to connect wallet: ' + error.message)
  }
}

export async function delegateTokens(walletAddress, validatorAddress, amount) {
  if (!window.keplr) {
    throw new Error('Keplr wallet is not installed')
  }

  try {
    const offlineSigner = window.keplr.getOfflineSigner(ZETA_CHAIN_ID)
    const accounts = await offlineSigner.getAccounts()
    const account = accounts[0]

    console.log('---Account---:', account)

    const key = await window.keplr.getKey(ZETA_CHAIN_ID)

    const client = await SigningStargateClient.connectWithSigner(
      ZETA_RPC_ENDPOINT,
      offlineSigner,
      {
        gasPrice: GasPrice.fromString(MINIMUM_GAS_PRICE),
        accountParser: (account) => {
          console.log('Account data:', account)
          if (account.typeUrl === '/ethermint.types.v1.EthAccount') {
            const parsedAccount = {
              address: account.value?.address || '',
              pubkey: key.pubKey || account.pubkey || account.value?.pubkey || null,
              accountNumber: account.value?.accountNumber ? BigInt(account.value.accountNumber) : BigInt(0),
              sequence: account.value?.sequence ? BigInt(account.value.sequence) : BigInt(0)
            }
            console.log('Parsed account:', parsedAccount)
            return parsedAccount
          }
          return account
        }
      }
    )

    const delegationAmount = {
      denom: 'azeta',
      amount: Math.floor(amount * 1_000_000).toString()
    }

    const result = await client.delegateTokens(
      walletAddress,
      validatorAddress,
      delegationAmount,
      'auto'
    )

    return result.transactionHash
  } catch (error) {
    console.error('Delegation error:', error)
    throw new Error('Failed to delegate tokens: ' + error.message)
  }
}
