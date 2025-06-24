import { Connection, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork, WalletReadyState } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { EventEmitter } from 'events';

const LAST_USED_WALLET_KEY = 'lumen_last_wallet';

class WalletService extends EventEmitter {
    constructor() {
        super();
        this.adapter = null;
        this.publicKey = null;
        this.network = WalletAdapterNetwork.Devnet;
        this.connection = new Connection(clusterApiUrl(this.network));
        this.supportedWallets = [
            new PhantomWalletAdapter(),
        ];
        this.WalletReadyState = WalletReadyState;
    }

    getAdapter() {
        return this.adapter;
    }
    
    isWalletConnected() {
        return this.adapter && this.adapter.connected && this.publicKey;
    }

    async autoConnect() {
        const lastWalletName = localStorage.getItem(LAST_USED_WALLET_KEY);
        if (!lastWalletName) return;

        const adapter = this.supportedWallets.find(w => w.name === lastWalletName);
        if (!adapter || !adapter.autoConnect) return;

        this.adapter = adapter;
        this.setupAdapterListeners();

        try {
            await adapter.autoConnect();
        } catch (error) {
            console.warn(`Auto-connect to ${lastWalletName} failed:`, error);
            this.adapter = null;
            localStorage.removeItem(LAST_USED_WALLET_KEY);
        }
    }

    setupAdapterListeners() {
        if (!this.adapter) return;

        this.adapter.on('connect', (publicKey) => {
            this.publicKey = publicKey;
            this.emit('connect', publicKey);
        });

        this.adapter.on('disconnect', () => {
            this.publicKey = null;
            this.adapter = null;
            localStorage.removeItem(LAST_USED_WALLET_KEY);
            this.emit('disconnect');
        });

        this.adapter.on('error', (error) => {
            this.emit('error', error);
        });
    }

    async connect(walletName) {
        if (this.isWalletConnected()) return;

        const adapter = this.supportedWallets.find(w => w.name === walletName);
        if (!adapter) {
            throw new Error(`Wallet ${walletName} not supported.`);
        }

        this.adapter = adapter;
        this.setupAdapterListeners();

        try {
            await adapter.connect();
            localStorage.setItem(LAST_USED_WALLET_KEY, walletName);
        } catch (error) {
            console.error(`Failed to connect to ${walletName}:`, error);
            this.adapter = null;
            throw error;
        }
    }

    async disconnect() {
        if (this.adapter) {
            await this.adapter.disconnect();
        }
    }

    async signMessage(message) {
        if (!this.isWalletConnected() || !this.adapter) {
            throw new Error('Wallet not connected or adapter not available');
        }
        return await this.adapter.signMessage(message);
    }
}

export const walletService = new WalletService();