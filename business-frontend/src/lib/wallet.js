import { Connection, SystemProgram, Transaction, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { EventEmitter } from 'events';

class WalletService extends EventEmitter {
    constructor() {
        super();
        this.adapter = new PhantomWalletAdapter();
        this.publicKey = null;
        this.network = WalletAdapterNetwork.Mainnet;
        
        const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(this.network);
        if (!import.meta.env.VITE_SOLANA_RPC_URL) {
            console.warn("VITE_SOLANA_RPC_URL not set, using public endpoint. This is not recommended for production.");
        }
        this.connection = new Connection(rpcUrl, 'confirmed');

        this.adapter.on('connect', (publicKey) => {
            this.publicKey = publicKey;
            this.emit('connect', publicKey);
        });

        this.adapter.on('disconnect', () => {
            this.publicKey = null;
            this.emit('disconnect');
        });
    }

    isWalletConnected() {
        return this.adapter && this.adapter.connected && this.publicKey;
    }

    async connect() {
        if (this.isWalletConnected()) return;
        if (!this.adapter.connected) {
            await this.adapter.connect();
        }
    }

    async createAndSendTransaction(toPublicKey, solAmount) {
        if (!this.isWalletConnected()) {
            throw new Error("Wallet not connected.");
        }

        const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);
        if (lamports <= 0) {
            throw new Error("Calculated amount is too small to transact.");
        }

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: this.publicKey,
                toPubkey: toPublicKey,
                lamports: lamports,
            })
        );

        transaction.feePayer = this.publicKey;
        
        const { blockhash } = await this.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        const signature = await this.adapter.sendTransaction(transaction, this.connection);
        
        await this.connection.confirmTransaction(signature, 'processed');

        return signature;
    }
}

export const walletService = new WalletService();