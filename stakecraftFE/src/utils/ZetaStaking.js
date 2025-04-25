import { SigningStargateClient } from '@cosmjs/stargate'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice } from '@cosmjs/stargate'

const ZETA_RPC_ENDPOINT = 'https://zetachain-rpc.publicnode.com'
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
    const client = await SigningStargateClient.connectWithSigner(
      ZETA_RPC_ENDPOINT,
      offlineSigner,
      { gasPrice: GasPrice.fromString(MINIMUM_GAS_PRICE) }
    )

    const delegationAmount = {
      denom: 'azeta',
      amount: Math.floor(amount * 1000000).toString() // Convert to azeta (6 decimals)
    }

    const result = await client.delegateTokens(
      walletAddress,
      validatorAddress,
      delegationAmount,
      'auto'
    )

    return result.transactionHash
  } catch (error) {
    throw new Error('Failed to delegate tokens: ' + error.message)
  }
}

export async function getStakingInfo(walletAddress) {
  try {
    const response = await fetch(`${ZETA_RPC_ENDPOINT}/cosmos/staking/v1beta1/delegations/${walletAddress}`)
    const data = await response.json()

    if (!data.delegation_responses || data.delegation_responses.length === 0) {
      return {
        stakedAmount: 0,
        rewardsEarned: 0,
        lastRewardTime: null
      }
    }

    // Sum up all delegations
    const totalStaked = data.delegation_responses.reduce((sum, delegation) => {
      const amount = parseFloat(delegation.balance.amount) / 1000000 // Convert from azeta to ZETA
      return sum + amount
    }, 0)

    // Get rewards
    const rewardsResponse = await fetch(
      `${ZETA_RPC_ENDPOINT}/cosmos/distribution/v1beta1/delegators/${walletAddress}/rewards`
    )
    const rewardsData = await rewardsResponse.json()

    const totalRewards = rewardsData.total.reduce((sum, reward) => {
      const amount = parseFloat(reward.amount) / 1000000 // Convert from azeta to ZETA
      return sum + amount
    }, 0)

    return {
      stakedAmount: totalStaked,
      rewardsEarned: totalRewards,
      lastRewardTime: new Date().toISOString() // This would need to be fetched from the chain
    }
  } catch (error) {
    console.error('Failed to get staking info:', error)
    throw new Error('Failed to fetch staking information')
  }
} 