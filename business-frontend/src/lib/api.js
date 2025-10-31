import axios from 'axios';
import { logout } from './auth';
import { withPaymentInterceptor } from '@payai/x402-axios';
import { walletService } from './wallet.js';

const baseAxios = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1',
  withCredentials: true,
});

const TransactionSignerSymbol = Symbol.for('solana:transaction-signer');

const x402WalletAdapter = {
  [TransactionSignerSymbol]: TransactionSignerSymbol,
  
  get address() {
    if (!walletService.isWalletConnected() || !walletService.publicKey) {
      throw new Error('Wallet must be connected before making payments');
    }
    return walletService.publicKey.toBase58();
  },
  
  async signAndSendTransactions(transactions) {
    if (!walletService.isWalletConnected()) {
      throw new Error('Wallet not connected');
    }
    
    const signatures = [];
    for (const tx of transactions) {
      const signature = await walletService.adapter.sendTransaction(tx, walletService.connection);
      await walletService.connection.confirmTransaction(signature, 'confirmed');
      signatures.push(signature);
    }
    return signatures;
  },
  
  async signMessages(messages) {
    if (!walletService.adapter?.signMessage) {
      throw new Error('Wallet does not support message signing');
    }
    return Promise.all(messages.map(msg => walletService.adapter.signMessage(msg)));
  },
  
  async signTransactions(transactions) {
    if (!walletService.adapter?.signAllTransactions) {
      throw new Error('Wallet does not support transaction signing');
    }
    return walletService.adapter.signAllTransactions(transactions);
  }
};

const api = withPaymentInterceptor(
    baseAxios,
    x402WalletAdapter,
    (error) => error?.response?.data?.accepts || [],
    {
        svmConfig: {
            rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL
        }
    }
);

api.interceptors.request.use(config => {
  const token = localStorage.getItem('business_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !error.config.url.includes('/business/login')) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;