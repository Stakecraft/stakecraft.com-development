import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'

const KAVA_CHAIN_ID = 'kava_2222-10'

const RPC_ENDPOINTS = [
  'https://kava-rpc.polkachu.com',
  'https://kava-rpc.publicnode.com',
  'https://rpc-kava-ia.cosmosia.notional.ventures'
]

// Connect wallet
export const connectWallet = async () => {
  if (!window.keplr) {
    throw new Error('Please install Keplr extension')
  }
  await window.keplr.enable(KAVA_CHAIN_ID)
  const offlineSigner = window.getOfflineSigner(KAVA_CHAIN_ID)
  const accounts = await offlineSigner.getAccounts()
  return accounts[0].address
}

// Helper function to try different RPC endpoints
const tryRpcEndpoints = async (offlineSigner) => {
  let lastError = null;
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const client = await SigningStargateClient.connectWithSigner(
        endpoint,
        offlineSigner,
        { gasPrice: GasPrice.fromString('0.025ukava') }
      );
      return client;
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error);
      lastError = error;
    }
  }
  throw new Error(`Failed to connect to any RPC endpoint. Last error: ${lastError?.message}`);
};

// Delegate tokens
export const delegateTokens = async (delegatorAddress, validatorAddress, amount) => {
  try {
    await window.keplr.enable(KAVA_CHAIN_ID)
    const offlineSigner = window.getOfflineSigner(KAVA_CHAIN_ID)
    const client = await tryRpcEndpoints(offlineSigner);
    const result = await client.delegateTokens(
      delegatorAddress,
      validatorAddress,
      {
        denom: 'ukava',
        amount: (amount * 1_000_000).toString()
      },
      'auto',
      'Delegate KAVA tokens'
    )
    return result.transactionHash
  } catch (error) {
    console.error('Error delegating tokens:', error)
    throw new Error(`Failed to delegate tokens: ${error.message}`)
  }
}
