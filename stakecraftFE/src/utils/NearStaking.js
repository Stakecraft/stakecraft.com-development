import { utils } from 'near-api-js'
import { setupWalletSelector } from '@near-wallet-selector/core'
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet'
import { Near } from 'near-api-js'

const config = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  walletUrl: 'https://wallet.mainnet.near.org',
  helperUrl: 'https://helper.mainnet.near.org',
  explorerUrl: 'https://explorer.mainnet.near.org',
  contractName: 'stakecraft.near',
  appKeyPrefix: 'stakecraft-app'
}

let selector = null

export const walletConnect = async () => {
  try {
    const meteorWallet = setupMeteorWallet()

    if (!meteorWallet) {
      throw new Error('Meteor Wallet not found. Please install the Meteor Wallet extension.')
    }

    selector = await setupWalletSelector({
      network: 'mainnet',
      modules: [meteorWallet]
    })

    const wallet = await selector.wallet('meteor-wallet')
    const state = selector.store.getState()
    const hasAccount = state.accounts.some((account) => account.active)

    if (!hasAccount) {
      await wallet.signIn({
        contractId: config.contractName,
        methodNames: []
      })
      return
    }
    return wallet
  } catch (error) {
    console.error('Error connecting wallet:', error)
    if (error.message.includes('not found')) {
      throw new Error(
        'Meteor Wallet not found. Please install the Meteor Wallet extension from https://meteorwallet.io/'
      )
    }
    throw error
  }
}

export const getAccountId = async () => {
  if (!selector) {
    await walletConnect()
  }
  const state = selector.store.getState()
  const accountId = state.accounts.find((a) => a.active)?.accountId
  if (!accountId) {
    throw new Error('No account connected')
  }
  return accountId
}

export const delegateTokens = async (walletAddress, validatorAccountId, amountNEAR) => {
  try {
    if (!selector) {
      await walletConnect()
    }

    const wallet = await selector.wallet('meteor-wallet')
    const amountYocto = utils.format.parseNearAmount(amountNEAR.toString())
    const result = await wallet.signAndSendTransaction({
      signerId: walletAddress,
      receiverId: validatorAccountId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'deposit_and_stake',
            args: {},
            gas: '100000000000000',
            deposit: amountYocto
          }
        }
      ]
    })
    return result.transaction?.hash || result.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw new Error(`Staking failed: ${error.message || 'Unknown error'}`)
  }
}

export const getTotalStakedAmount = async (walletAddress, validatorAccountId) => {
  try {
    if (!selector) {
      await walletConnect()
    }

    // Create a NEAR connection
    const near = new Near({
      networkId: config.networkId,
      nodeUrl: config.nodeUrl,
      walletUrl: config.walletUrl,
      helperUrl: config.helperUrl,
      explorerUrl: config.explorerUrl
    })

    const account = await near.account(validatorAccountId)
    const result = await account.viewFunction({
      contractId: validatorAccountId,
      methodName: 'get_account_staked_balance',
      args: {
        account_id: walletAddress
      }
    })

    return {
      amount: result || '0',
      validator: validatorAccountId
    }
  } catch (error) {
    console.error('Error getting total staked amount:', error)
    throw new Error(`Failed to get staked amount: ${error.message || 'Unknown error'}`)
  }
}

export const undelegateTokens = async (walletAddress, validatorAccountId, amountNEAR) => {
  try {
    if (!selector) {
      await walletConnect()
    }

    const wallet = await selector.wallet('meteor-wallet')
    const amountYocto = utils.format.parseNearAmount(amountNEAR.toString())
    
    const result = await wallet.signAndSendTransaction({
      signerId: walletAddress,
      receiverId: validatorAccountId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'unstake',
            args: {
              amount: amountYocto
            },
            gas: '100000000000000',
            deposit: '0'
          }
        }
      ]
    })
    return result.transaction?.hash || result.transactionHash
  } catch (error) {
    console.error('Error undelegating tokens:', error)
    throw new Error(`Undelegation failed: ${error.message || 'Unknown error'}`)
  }
}
