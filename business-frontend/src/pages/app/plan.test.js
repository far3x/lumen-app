import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies before any imports
vi.mock('@solana/web3.js', () => ({
  Connection: vi.fn().mockImplementation(() => ({
    getLatestBlockhash: vi.fn().mockResolvedValue({
      blockhash: 'mock-blockhash',
      lastValidBlockHeight: 12345
    }),
    sendRawTransaction: vi.fn().mockResolvedValue('mock-signature'),
    confirmTransaction: vi.fn().mockResolvedValue({})
  })),
  PublicKey: vi.fn().mockImplementation((key) => ({ key })),
  Transaction: vi.fn().mockImplementation(() => ({
    add: vi.fn().mockReturnThis(),
    feePayer: null,
    recentBlockhash: null,
    lastValidBlockHeight: null
  })),
  clusterApiUrl: vi.fn().mockReturnValue('https://mock-rpc-url.com')
}));

vi.mock('@solana/spl-token', () => ({
  TOKEN_PROGRAM_ID: 'mock-token-program-id',
  createTransferInstruction: vi.fn().mockReturnValue('mock-transfer-instruction'),
  getAssociatedTokenAddress: vi.fn().mockResolvedValue('mock-ata-address')
}));

vi.mock('../../lib/api.js', () => ({
  default: {
    post: vi.fn().mockResolvedValue({})
  }
}));

vi.mock('../../lib/auth.js', () => ({
  getCompany: vi.fn().mockReturnValue({ plan: 'free', token_balance: 1000 }),
  getUser: vi.fn().mockReturnValue({ id: 1, email: 'test@example.com' })
}));

vi.mock('../../lib/wallet.js', () => ({
  walletService: {
    wallets: [{ name: 'Phantom', icon: 'phantom-icon.svg' }]
  }
}));

vi.mock('../../lib/state.js', () => ({
  stateService: {
    fetchDashboardStats: vi.fn().mockResolvedValue()
  }
}));

// Now import the function to test
import { processSolanaPayment } from './plans.js';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import api from '../../lib/api.js';

describe('processSolanaPayment', () => {
  let mockProvider;
  let mockConnection;
  let mockTransaction;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup window.solana mock
    mockProvider = {
      isPhantom: true,
      connect: vi.fn().mockResolvedValue(),
      signTransaction: vi.fn().mockResolvedValue({
        serialize: vi.fn().mockReturnValue('serialized-tx')
      }),
      publicKey: 'mock-public-key'
    };

    Object.defineProperty(window, 'solana', {
      writable: true,
      value: mockProvider
    });

    // Setup connection mock
    mockConnection = new Connection();
    Connection.mockReturnValue(mockConnection);

    // Setup transaction mock
    mockTransaction = new Transaction();
    Transaction.mockReturnValue(mockTransaction);
  });

  it('should process a valid Solana payment successfully', async () => {
    const mockPayment = {
      payTo: 'recipient-public-key',
      asset: 'asset-mint',
      maxAmountRequired: '1000000'
    };

    const result = await processSolanaPayment(mockPayment);

    // Verify wallet connection
    expect(mockProvider.connect).toHaveBeenCalled();

    // Verify transaction setup
    expect(createTransferInstruction).toHaveBeenCalledWith(
      'mock-ata-address', // senderATA
      'mock-ata-address', // recipientATA
      'mock-public-key',  // sender
      1000000n,           // amount
      [],                  // multiSigners
      'mock-token-program-id' // TOKEN_PROGRAM_ID
    );

    expect(mockTransaction.add).toHaveBeenCalledWith('mock-transfer-instruction');
    expect(mockTransaction.feePayer).toBe('mock-public-key');
    expect(mockTransaction.recentBlockhash).toBe('mock-blockhash');
    expect(mockTransaction.lastValidBlockHeight).toBe(12345);

    // Verify transaction signing and sending
    expect(mockProvider.signTransaction).toHaveBeenCalledWith(mockTransaction);
    expect(mockConnection.sendRawTransaction).toHaveBeenCalledWith('serialized-tx');
    expect(mockConnection.confirmTransaction).toHaveBeenCalledWith('mock-signature', 'confirmed');

    // Verify backend verification
    expect(api.post).toHaveBeenCalledWith('/business/billing/charge', {
      tx_signature: 'mock-signature'
    });

    expect(result).toBe('mock-signature');
  });

  it('should use mainnet by default', async () => {
    const mockPayment = {
      payTo: 'recipient-public-key',
      asset: 'asset-mint',
      maxAmountRequired: '1000000'
    };

    await processSolanaPayment(mockPayment);

    expect(Connection).toHaveBeenCalledWith('https://api.mainnet-beta.solana.com');
  });

  it('should use provided connection URL', async () => {
    const mockPayment = {
      payTo: 'recipient-public-key',
      asset: 'asset-mint',
      maxAmountRequired: '1000000'
    };

    await processSolanaPayment(mockPayment, 'https://api.devnet.solana.com');

    expect(Connection).toHaveBeenCalledWith('https://api.devnet.solana.com');
  });

  it('should throw error if Phantom wallet is not available', async () => {
    Object.defineProperty(window, 'solana', {
      writable: true,
      value: null
    });

    const mockPayment = {
      payTo: 'recipient-public-key',
      asset: 'asset-mint',
      maxAmountRequired: '1000000'
    };

    await expect(processSolanaPayment(mockPayment)).rejects.toThrow('Phantom not found');
  });

  it('should throw error if wallet is not Phantom', async () => {
    Object.defineProperty(window, 'solana', {
      writable: true,
      value: { isPhantom: false }
    });

    const mockPayment = {
      payTo: 'recipient-public-key',
      asset: 'asset-mint',
      maxAmountRequired: '1000000'
    };

    await expect(processSolanaPayment(mockPayment)).rejects.toThrow('Phantom not found');
  });

  it('should convert maxAmountRequired to BigInt', async () => {
    const mockPayment = {
      payTo: 'recipient-public-key',
      asset: 'asset-mint',
      maxAmountRequired: '5000000'
    };

    await processSolanaPayment(mockPayment);

    expect(createTransferInstruction).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(String),
      5000000n, // Should be converted to BigInt
      [],
      'mock-token-program-id'
    );
  });
});
