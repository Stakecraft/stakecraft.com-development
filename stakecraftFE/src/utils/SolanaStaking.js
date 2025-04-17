import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { StakeProgram } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

// Initialize Solana connection
const network = WalletAdapterNetwork.Mainnet;
const endpoint = 'https://api.mainnet-beta.solana.com';
const connection = new Connection(endpoint, 'confirmed');

// Initialize wallet adapter
const wallet = new PhantomWalletAdapter();

// Function to connect wallet
export const connectWallet = async () => {
    try {
        await wallet.connect();
        return wallet.publicKey;
    } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
    }
};

// Function to get stake account info
export const getStakeAccountInfo = async (stakeAccountAddress) => {
    try {
        const stakeAccountPubkey = new PublicKey(stakeAccountAddress);
        const stakeAccountInfo = await connection.getAccountInfo(stakeAccountPubkey);
        return stakeAccountInfo;
    } catch (error) {
        console.error('Error getting stake account info:', error);
        throw error;
    }
};

// Function to delegate stake
export const delegateStake = async (stakeAccountAddress, validatorAddress, amount) => {
    try {
        if (!wallet.connected) {
            await connectWallet();
        }

        const stakeAccountPubkey = new PublicKey(stakeAccountAddress);
        const validatorPubkey = new PublicKey(validatorAddress);
        
        // Create delegate instruction
        const delegateInstruction = StakeProgram.delegate({
            stakePubkey: stakeAccountPubkey,
            authorizedPubkey: wallet.publicKey,
            votePubkey: validatorPubkey,
        });

        // Create and sign transaction
        const transaction = new Transaction().add(delegateInstruction);
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());

        return signature;
    } catch (error) {
        console.error('Error delegating stake:', error);
        throw error;
    }
};

// Function to get stake rewards
export const getStakeRewards = async (stakeAccountAddress) => {
    try {
        const stakeAccountPubkey = new PublicKey(stakeAccountAddress);
        const rewards = await connection.getInflationReward([stakeAccountPubkey]);
        return rewards[0];
    } catch (error) {
        console.error('Error getting stake rewards:', error);
        throw error;
    }
}; 