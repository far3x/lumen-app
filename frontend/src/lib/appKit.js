import { createAppKit } from '@reown/appkit';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { solana } from '@reown/appkit/networks';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.error("CRITICAL: VITE_WALLETCONNECT_PROJECT_ID is not set. Wallet functionality will fail.");
}

const metadata = {
    name: 'Lumen Protocol Airdrop',
    description: 'Claim your airdropped tokens from the Lumen Protocol migration.',
    url: 'https://lumen.onl',
    icons: ['https://lumen.onl/logo2.png']
};

const solanaAdapter = new SolanaAdapter();

export const appKit = createAppKit({
    projectId,
    metadata,
    networks: [solana],
    adapters: [solanaAdapter],
    features: {
        analytics: false,
        socials: []
    }
});