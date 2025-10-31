import { Connection, SystemProgram, Transaction, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletAdapterNetwork, WalletReadyState } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { EventEmitter } from 'events';

const LAST_USED_WALLET_KEY = 'lumen_business_last_wallet';

class WalletService extends EventEmitter {
    constructor() {
        super();
        this.adapter = null;
        this.publicKey = null;
        this.network = WalletAdapterNetwork.Devnet;
        const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(this.network);
        this.connection = new Connection(rpcUrl, 'confirmed');
        
        this.wallets = [
            new PhantomWalletAdapter(),
        ];
        this.WalletReadyState = WalletReadyState;

        this.adapter?.on('connect', (publicKey) => {
            this.publicKey = publicKey;
            this.emit('connect', publicKey);
        });

        this.adapter?.on('disconnect', () => {
            this.publicKey = null;
            this.emit('disconnect');
        });
    }

    getAdapter() {
        return this.adapter;
    }

    isWalletConnected() {
        return this.adapter && this.adapter.connected && this.publicKey;
    }

    setupAdapterListeners() {
        if (!this.adapter) return;

        this.adapter.on('connect', (publicKey) => {
            this.publicKey = publicKey;
            localStorage.setItem(LAST_USED_WALLET_KEY, this.adapter.name);
            this.emit('connect', publicKey);
        });

        this.adapter.on('disconnect', () => {
            this.publicKey = null;
            this.adapter = null;
            localStorage.removeItem(LAST_USED_WALLET_KEY);
            this.emit('disconnect');
        });
    }
    
    async connect(walletName) {
        if (this.isWalletConnected()) return;

        const adapter = this.wallets.find(w => w.name === walletName);
        if (!adapter) {
            throw new Error(`Wallet ${walletName} not supported.`);
        }

        this.adapter = adapter;
        this.setupAdapterListeners();

        await adapter.connect();
    }
    
    async createAndSendTransaction(toPublicKey, solAmount) {
        if (!this.isWalletConnected() || !this.adapter) {
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