import { connect, keyStores, utils, transactions } from 'near-api-js'

const getConfig = (network = 'testnet') => {
  switch (network) {
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
        stakingContractId: 'staking.near'
      }
    case 'testnet':
    default:
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        stakingContractId: 'staking.testnet'
      }
  }
}

const initNear = async (network = 'mainnet') => {
  const nearConfig = getConfig(network)
  const keyStore = new keyStores.BrowserLocalStorageKeyStore()

  console.log('keystore', keyStore)

  const nearConnection = await connect({
    deps: {
      keyStore,
    },
    ...nearConfig,
  })
  
  return { nearConnection, nearConfig }
}

export const connectWallet = async (network = 'mainnet') => {
  try {
    const { nearConnection, nearConfig } = await initNear(network)
    
    const walletConnection = await nearConnection.wallet()
    if (!walletConnection.isSignedIn()) {
      const successUrl = window.location.href
      const failureUrl = window.location.href
      walletConnection.requestSignIn({
        contractId: nearConfig.stakingContractId,
        methodNames: ['stake', 'unstake', 'withdraw'],
        successUrl,
        failureUrl
      })
      return null
    }
    
    const accountId = walletConnection.getAccountId()
    const account = await nearConnection.account(accountId)
    
    console.log('walletConnection', walletConnection)
    console.log('accountId', accountId)
    console.log('account', account)
    console.log('nearConnection', nearConnection)
    console.log('nearConfig', nearConfig)

    return {
      accountId,
      // account,
      // walletConnection,
      // nearConnection,
      // nearConfig
    }
  } catch (error) {
    console.error('Error connecting to NEAR wallet:', error)
    throw new Error(`Failed to connect to NEAR wallet: ${error.message}`)
  }
}

export const delegateTokens = async (walletAddress, validatorId, amount, network = 'mainnet') => {
  try {
    if (!validatorId || !amount) {
      throw new Error('Validator ID and amount are required')
    }
    
    console.log('walletAddress', walletAddress)
    console.log('validatorId', validatorId)
    console.log('amount', amount)
    console.log('network', network)

    const { nearConnection, nearConfig } = await initNear(network)
    const walletConnection = await nearConnection.wallet()
    
    if (!walletConnection.isSignedIn()) {
      throw new Error('Wallet is not connected')
    }
    
    const accountId = walletConnection.getAccountId()
    const account = await nearConnection.account(accountId)
    const amountInYocto = utils.format.parseNearAmount(amount.toString())
    
    const actions = [
      transactions.functionCall(
        'stake',
        { validator_id: validatorId, amount: amountInYocto },
        300000000000000, // 300 TGas
        amountInYocto // Deposit amount
      )
    ]
    
    const result = await account.signAndSendTransaction({
      receiverId: nearConfig.stakingContractId,
      actions
    })
    
    return {
      transactionHash: result.transaction.hash,
      status: 'success'
    }
  } catch (error) {
    console.error('Error staking tokens:', error)
    throw new Error(`Failed to stake tokens: ${error.message}`)
  }
}
