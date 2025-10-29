import { checkAirdropEligibility, claimAirdrop } from '../lib/auth.js';
import { walletService } from '../lib/wallet.js';
import { renderWalletSelectionModal } from './app/dashboard/utils.js';

let state = {
    step: 'initial', // initial, verifying, eligible, claiming, success, error, ineligible, claimed
    solanaAddress: null,
    claimableAmount: 0,
    claimToken: null,
    errorMessage: '',
    txHash: '',
};

function setState(newState) {
    Object.assign(state, newState);
    render();
}

function bytesToHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function handleVerifyEligibility() {
    if (walletService.isWalletConnected()) {
        await walletService.disconnect();
    }

    setState({ step: 'verifying' });

    const onWalletConnect = async (publicKey) => {
        try {
            const solanaAddress = publicKey.toBase58();
            const nonce = new Date().getTime();
            const messageToSign = `Sign this message to verify ownership of your wallet for the Lumen airdrop claim.\n\nAddress: ${solanaAddress}\nNonce: ${nonce}`;
            
            const signedMessage = await walletService.signMessage(new TextEncoder().encode(messageToSign));
            
            const signatureBytes = signedMessage.signature || signedMessage;
            const signatureHex = bytesToHex(signatureBytes);

            const response = await checkAirdropEligibility(solanaAddress, messageToSign, signatureHex);
            const data = response.data;

            if (data.is_eligible) {
                if (data.has_claimed) {
                    setState({ step: 'claimed', claimableAmount: data.token_amount });
                } else {
                    setState({ 
                        step: 'eligible', 
                        solanaAddress: solanaAddress, 
                        claimableAmount: data.token_amount, 
                        claimToken: data.claim_token 
                    });
                }
            } else {
                setState({ step: 'ineligible' });
            }
        } catch (error) {
            console.error("Verification Error:", error);
            let message = 'An unexpected error occurred during verification.';
            if (error.response?.data?.detail) {
                message = error.response.data.detail;
            } else if (error.message?.includes('User rejected the request')) {
                message = 'Message signing failed or was rejected by the user.';
            }
            setState({ step: 'error', errorMessage: message });
        } finally {
            walletService.off('connect', onWalletConnect);
        }
    };

    const onModalClose = () => {
        if (state.step === 'verifying' && !walletService.isWalletConnected()) {
            setState({ step: 'initial' });
        }
        walletService.off('connect', onModalClose);
    };

    walletService.once('connect', onWalletConnect);
    renderWalletSelectionModal({ onClose: onModalClose });
}


async function handleClaim() {
    setState({ step: 'claiming' });

    try {
        const response = await claimAirdrop(state.claimToken);
        setState({ step: 'success', txHash: response.data.transaction_hash });
    } catch (error) {
        setState({ step: 'error', errorMessage: error.response?.data?.detail || 'An unexpected error occurred during the claim process.' });
    }
}

function render() {
    const container = document.getElementById('claim-container');
    if (!container) return;

    let content = '';

    switch (state.step) {
        case 'initial':
        case 'verifying':
            const isVerifying = state.step === 'verifying';
            content = `
                <div class="animate-fade-in-up">
                    <h2 class="text-3xl font-bold">Verify Your Eligibility</h2>
                    <p class="text-text-secondary mt-4">Connect your original Solana wallet to check your eligibility for the airdrop claim.</p>
                    <button id="verify-btn" class="mt-8 w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-red-700 transition-colors" ${isVerifying ? 'disabled' : ''}>
                        ${isVerifying ? '<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span><span class="ml-2">Waiting for connection...</span>' : 'Verify with Solana Wallet'}
                    </button>
                </div>
            `;
            break;

        case 'eligible':
            content = `
                <div class="animate-fade-in-up">
                    <h2 class="text-3xl font-bold text-accent-primary">You're Eligible!</h2>
                    <p class="text-text-secondary mt-3">You are eligible to claim your new tokens.</p>
                    <div class="my-6 text-center bg-primary p-6 rounded-lg border border-subtle">
                        <p class="text-sm font-bold text-text-secondary uppercase tracking-wider">Claimable Amount</p>
                        <p class="text-5xl font-bold text-accent-primary font-mono mt-2">${state.claimableAmount.toLocaleString()}</p>
                        <p class="text-sm text-text-secondary mt-1">(70% of original holdings)</p>
                    </div>
                    <form id="claim-form" class="mt-4 space-y-4">
                        <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-red-700 transition-colors">
                            Claim Tokens
                        </button>
                    </form>
                </div>
            `;
            break;

        case 'claiming':
            content = `
                <div class="animate-fade-in-up">
                    <span class="animate-spin inline-block w-12 h-12 border-4 border-transparent border-t-accent-primary rounded-full"></span>
                    <h2 class="text-3xl font-bold text-text-main mt-6">Processing Your Claim...</h2>
                    <p class="text-text-secondary mt-3">Please wait. This may take a moment.</p>
                </div>
            `;
            break;

        case 'success':
            content = `
                <div class="animate-fade-in-up">
                    <div class="w-16 h-16 mx-auto mb-6 bg-red-600/10 text-accent-primary rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 class="text-3xl font-bold text-text-main">Claim Successful!</h2>
                    <p class="text-text-secondary mt-3">Your tokens are on their way to your Solana wallet.</p>
                    <a href="https://solscan.io/tx/${state.txHash}" target="_blank" rel="noopener noreferrer" data-external="true" class="mt-6 inline-block font-medium text-accent-primary hover:underline">View Transaction on Solscan</a>
                </div>
            `;
            break;
            
        case 'ineligible':
            content = `
                <div class="animate-fade-in-up">
                    <h2 class="text-3xl font-bold text-text-main">Not Eligible</h2>
                    <p class="text-text-secondary mt-3">The connected wallet address was not found in the airdrop snapshot.</p>
                    <button id="try-again-btn" class="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-red-700 transition-colors">
                        Try a Different Wallet
                    </button>
                </div>
            `;
            break;

        case 'claimed':
            content = `
                <div class="animate-fade-in-up">
                    <h2 class="text-3xl font-bold text-text-main">Already Claimed</h2>
                    <p class="text-text-secondary mt-3">The airdrop for this address has already been successfully claimed.</p>
                    <button id="try-again-btn" class="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-red-700 transition-colors">
                        Check Another Wallet
                    </button>
                </div>
            `;
            break;

        case 'error':
            content = `
                <div class="animate-fade-in-up">
                    <h2 class="text-3xl font-bold text-accent-primary">An Error Occurred</h2>
                    <p class="text-text-secondary mt-3">${state.errorMessage}</p>
                    <button id="try-again-btn" class="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-red-700 transition-colors">
                        Try Again
                    </button>
                </div>
            `;
            break;
    }
    container.innerHTML = content;
    attachEventListeners();
}

function attachEventListeners() {
    document.getElementById('verify-btn')?.addEventListener('click', handleVerifyEligibility);
    document.getElementById('claim-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleClaim();
    });
    
    const tryAgainBtn = document.getElementById('try-again-btn');
    if(tryAgainBtn) {
        tryAgainBtn.addEventListener('click', () => {
            if (walletService.isWalletConnected()) {
                walletService.disconnect();
            }
            setState({ step: 'initial', errorMessage: '' });
        });
    }
}

export function renderClaimPage() {
    state = {
        step: 'initial',
        solanaAddress: null,
        claimableAmount: 0,
        claimToken: null,
        errorMessage: '',
        txHash: '',
    };
    const content = `
    <main class="flex-grow bg-background text-text-main pt-28">
        <section class="container mx-auto px-6 py-20">
            <div class="bg-surface border-2 border-primary rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.01] hover:shadow-2xl">
                <div class="grid lg:grid-cols-2 items-center">
                    <div class="text-left p-8 md:p-12">
                        <h1 class="text-4xl md:text-5xl font-bold tracking-tighter">Protocol Upgrade & Token Claim</h1>
                        <p class="text-text-secondary mt-4 max-w-lg">To ensure the long-term health and growth of our ecosystem, a strategic migration was necessary. We required a launchpad with active support and a reliable technical foundation. Recent inactivity and support challenges on Heaven made it clear a change was necessary. We have now migrated to Pump, a platform renowned for its resilience and on-chain integrity, guaranteeing a path to long-term viability on Solana. This portal allows original Heaven holders to claim their new tokens based on the pre-migration snapshot.</p>
                    </div>
                    <div class="relative p-8 md:p-12 flex items-center justify-center min-h-[300px]">
                         <img src="/img/landing/7.png" alt="Abstract background image" class="absolute inset-0 w-full h-full object-cover opacity-20">
                         <div id="claim-container" class="relative w-full max-w-md bg-surface/80 backdrop-blur-lg p-8 rounded-xl border border-primary shadow-2xl text-center">
                            <!-- Content is rendered dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-12">
            <div class="container mx-auto px-6 text-left">
                <h2 class="text-3xl font-bold text-left mb-12">> How to Claim in <span class="text-accent-primary">3 Simple Steps</span></h2>
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="bg-surface border-2 border-primary rounded-lg p-8 transition-all duration-300 ease-in-out hover:scale-101 hover:shadow-xl hover:border-accent-primary/50">
                        <h3 class="font-bold text-xl flex items-center gap-3"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-accent-primary text-white font-bold">1</span> Verify Wallet</h3>
                        <p class="mt-4 text-text-secondary">Connect the wallet that held your original tokens and sign a free message to confirm ownership.</p>
                    </div>
                    <div class="bg-surface border-2 border-primary rounded-lg p-8 transition-all duration-300 ease-in-out hover:scale-101 hover:shadow-xl hover:border-accent-primary/50">
                        <h3 class="font-bold text-xl flex items-center gap-3"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-accent-primary text-white font-bold">2</span> Check Eligibility</h3>
                        <p class="mt-4 text-text-secondary">Our system will check your address against the pre-migration snapshot to determine your claimable amount.</p>
                    </div>
                    <div class="bg-surface border-2 border-primary rounded-lg p-8 transition-all duration-300 ease-in-out hover:scale-101 hover:shadow-xl hover:border-accent-primary/50">
                        <h3 class="font-bold text-xl flex items-center gap-3"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-accent-primary text-white font-bold">3</span> Claim Tokens</h3>
                        <p class="mt-4 text-text-secondary">If eligible, approve the final transaction to have your new Solana-based tokens sent directly to your wallet.</p>
                    </div>
                </div>
            </div>
        </section>
    </main>
    `;
    setTimeout(render, 0);
    return content;
}