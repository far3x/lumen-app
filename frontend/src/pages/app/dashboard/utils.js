import { getAccount, getUser } from "../../../lib/auth.js";
import api from "../../../lib/api.js";
import { walletService } from "../../../lib/wallet.js";
import { DateTime } from "luxon";

export function renderFeedbackModal() {
    const modalId = 'feedback-modal';
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.querySelector('textarea')?.focus();
        return;
    }
    
    let currentRating = 0;

    const content = `
        <div id="feedback-form-container">
            <p class="text-center text-text-secondary mb-4">We value your input. What can we do better?</p>
            <form id="feedback-form" novalidate>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-text-secondary mb-2 text-center">How would you rate your experience?</label>
                    <div id="star-rating" class="flex justify-center items-center gap-2 text-3xl text-subtle cursor-pointer">
                        ${[1, 2, 3, 4, 5].map(i => `<span class="star" data-value="${i}">☆</span>`).join('')}
                    </div>
                </div>
                <div class="mb-4">
                     <label for="feedback-content" class="block text-sm font-medium text-text-secondary mb-2">Your Feedback</label>
                    <textarea id="feedback-content" rows="4" minlength="10" maxlength="2000" required class="w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none" placeholder="Tell us about your experience, or suggest an improvement..."></textarea>
                    <div id="char-counter" class="text-right text-xs text-subtle mt-1">0 / 2000</div>
                </div>
                <div id="feedback-message" class="hidden text-sm p-3 rounded-md my-4 text-center"></div>
                <button type="submit" id="submit-feedback-btn" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity">
                    Submit Feedback
                </button>
            </form>
        </div>
    `;

    const { closeModal } = renderModal('Provide Feedback', content, { size: 'md' });
    const formContainer = document.getElementById('feedback-form-container');
    const form = document.getElementById('feedback-form');
    const messageEl = document.getElementById('feedback-message');
    const submitBtn = document.getElementById('submit-feedback-btn');

    const stars = document.querySelectorAll('#star-rating .star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.value);
            stars.forEach(s => {
                s.innerHTML = s.dataset.value <= currentRating ? '★' : '☆';
                s.classList.toggle('text-yellow-400', s.dataset.value <= currentRating);
            });
        });
    });
    
    const textarea = document.getElementById('feedback-content');
    const charCounter = document.getElementById('char-counter');
    textarea.addEventListener('input', () => {
        const count = textarea.value.length;
        charCounter.textContent = `${count} / 2000`;
        charCounter.classList.toggle('text-red-400', count > 2000);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('feedback-content').value;
        messageEl.classList.add('hidden');

        if (content.length < 10) {
            messageEl.textContent = 'Please provide at least 10 characters of feedback.';
            messageEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300 mt-2 text-center';
            messageEl.classList.remove('hidden');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Submitting...`;
        
        try {
            await api.post('/feedback', {
                page: window.location.pathname,
                rating: currentRating || null,
                content: content
            });
            
            formContainer.innerHTML = `
                <div class="text-center transition-all animate-fade-in-up">
                    <div class="w-16 h-16 mx-auto mb-4 bg-green-900/50 text-green-300 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 class="font-bold text-lg text-text-main">Feedback Submitted!</h3>
                    <p class="text-text-secondary mt-2">Thank you for helping us improve Lumen.</p>
                </div>
            `;
            setTimeout(closeModal, 2500);

        } catch (error) {
            messageEl.textContent = error.response?.data?.detail || 'An error occurred. Please try again.';
            messageEl.className = 'block text-sm p-3 rounded-md bg-red-900/50 text-red-300 mt-2 text-center';
            messageEl.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Feedback';
        }
    });
}

export function renderWalletSelectionModal() {
    const modalId = 'wallet-selection-modal';
    const modalExists = document.getElementById(modalId);
    if (modalExists) return;

    const phantomWallet = walletService.supportedWallets.find(w => w.name === 'Phantom');

    let modalContentHTML;

    if (phantomWallet) {
        const isInstalled = phantomWallet.readyState === walletService.WalletReadyState.Installed;
        modalContentHTML = `
            ${isInstalled ? `
                <button data-wallet-name="${phantomWallet.name}" class="wallet-option-btn w-full flex items-center gap-4 p-3 rounded-lg bg-primary hover:bg-subtle transition-colors">
                    <img src="${phantomWallet.icon}" alt="${phantomWallet.name} logo" class="w-8 h-8 rounded-full">
                    <span class="font-bold text-text-main">${phantomWallet.name}</span>
                </button>
            ` : `
                <a href="${phantomWallet.url}" target="_blank" rel="noopener noreferrer" data-external="true" class="w-full flex items-center gap-4 p-3 rounded-lg bg-primary hover:bg-subtle transition-colors opacity-50">
                    <img src="${phantomWallet.icon}" alt="${phantomWallet.name} logo" class="w-8 h-8 rounded-full">
                    <span class="font-bold text-text-main">Install ${phantomWallet.name}</span>
                    <svg class="w-4 h-4 text-text-secondary ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            `}
            <p class="text-xs text-center text-subtle mt-4">Only Phantom wallet is currently supported for direct connection. You can set any Solana address manually in Settings.</p>
        `;
    } else {
        modalContentHTML = `<p class="text-text-secondary text-center">No supported wallets found. Please install Phantom or set your address manually in Settings.</p>`;
    }

    const modalHTML = `
        <div id="${modalId}" class="modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up" style="animation-duration: 0.2s;">
            <div class="modal-content bg-surface w-full max-w-xs rounded-xl border border-primary shadow-2xl shadow-black/50">
                <header class="p-4 border-b border-primary flex justify-between items-center">
                    <h2 class="text-lg font-bold">Connect Phantom Wallet</h2>
                    <button class="modal-close-btn p-2 text-text-secondary hover:text-text-main rounded-full hover:bg-primary">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>
                <div class="p-4 space-y-3">
                    ${modalContentHTML}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('modal-open');

    const modal = document.getElementById(modalId);
    
    const closeModal = () => {
        if (modal) {
            modal.classList.remove('animate-fade-in-up');
            modal.classList.add('animate-fade-out-down');
            setTimeout(() => {
                modal.remove();
                if (document.querySelectorAll('.modal-overlay').length === 0) {
                    document.body.classList.remove('modal-open');
                }
            }, 200);
        }
    };

    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target.id === modalId) closeModal();
    });

    document.querySelectorAll('.wallet-option-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const walletName = button.dataset.walletName;
            try {
                await walletService.connect(walletName);
                closeModal();
            } catch (error) {
                console.error(error);
                alert(`Failed to connect to ${walletName}. Make sure it's installed and unlocked.`);
            }
        });
    });
}

export function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string' || !unsafe) return '';
    return unsafe
         .replace(/&/g, "&")
         .replace(/</g, "<")
         .replace(/>/g, ">")
         .replace(/"/g, '"')
         .replace(/'/g, "'");
}

export const icons = {
    dashboard: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="url(#dashboard-icon-gradient)" /></svg>`,
    contributions: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="url(#dashboard-icon-gradient)" /></svg>`,
    feed: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" stroke="url(#dashboard-icon-gradient)" /></svg>`,
    referral: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" stroke="url(#dashboard-icon-gradient)" /></svg>`,
    settings: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="url(#dashboard-icon-gradient)" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="url(#dashboard-icon-gradient)" /></svg>`,
    view: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="url(#dashboard-icon-gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="url(#dashboard-icon-gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

export function getStatusClasses(status) {
    const statuses = {
        PROCESSED: 'bg-green-900/50 text-green-300',
        PENDING: 'bg-yellow-900/50 text-yellow-300 animate-pulse',
        PROCESSING: 'bg-blue-900/50 text-blue-300 animate-pulse',
        REJECTED_EMPTY: 'bg-red-900/50 text-red-300',
        REJECTED_NO_REWARD: 'bg-orange-900/50 text-orange-300',
        DUPLICATE_HIGH_SIMILARITY: 'bg-red-900/50 text-red-300',
        DUPLICATE_CROSS_USER: 'bg-red-900/50 text-red-300',
        REJECTED_NO_NEW_CODE: 'bg-orange-900/50 text-orange-300',
        FAILED: 'bg-red-900/50 text-red-300',
        FAILED_EMBEDDING: 'bg-red-900/50 text-red-300',
        FAILED_DIFF_PROCESSING: 'bg-red-900/50 text-red-300',
    };
    return statuses[status] || 'bg-gray-700/50 text-gray-300';
}

export function getStatusText(status) {
    const statusTexts = {
        PROCESSED: 'Complete', PENDING: 'Pending', PROCESSING: 'Processing',
        REJECTED_EMPTY: 'Rejected: Empty', REJECTED_NO_REWARD: 'Rejected: No Reward',
        DUPLICATE_HIGH_SIMILARITY: 'Rejected: Duplicate', DUPLICATE_CROSS_USER: 'Rejected: Plagiarism',
        REJECTED_NO_NEW_CODE: 'Rejected: No Changes', FAILED: 'Failed',
        FAILED_EMBEDDING: 'Failed: Embedding', FAILED_DIFF_PROCESSING: 'Failed: Diff',
    };
    return statusTexts[status] || status;
}

export function updateBalancesInUI() {
    const account = getAccount();
    const user = getUser();
    if (!account || !user) return;

    const claimableBalance = account.lum_balance ?? 0;
    const lifetimeBalance = account.total_lum_earned ?? 0;

    document.querySelectorAll('.navbar-user-balance').forEach(el => {
        el.textContent = `${claimableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $LUM`;
    });
    
    const overviewLifetimeEl = document.getElementById('overview-total-balance');
    if (overviewLifetimeEl) {
        overviewLifetimeEl.textContent = `${lifetimeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $LUM`;
    }

    const overviewClaimableEl = document.querySelector('#claim-button-area .pulse-text');
    if (overviewClaimableEl) {
        overviewClaimableEl.textContent = claimableBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4});
    }
    
    const claimButton = document.getElementById('claim-rewards-btn');
    if(claimButton) {
        const subtextEl = document.getElementById('claim-rewards-btn-subtext');
        

        if (user.cooldown_until) {
            const now = DateTime.utc();
            const cooldownEnd = DateTime.fromISO(user.cooldown_until);
            if (now < cooldownEnd) {
                claimButton.disabled = true;
                claimButton.classList.add('opacity-50', 'cursor-not-allowed');
                const remaining = cooldownEnd.diff(now, ['days', 'hours']).normalize();
                if (subtextEl) subtextEl.textContent = `New account cooldown. You can claim in ${remaining.toFormat("d 'days,' h 'hours'")}.`;
                return;
            }
        }
        
        const isWalletLinked = !!user.solana_address;
        if (!isWalletLinked || claimableBalance <= 0) {
            claimButton.disabled = true;
            claimButton.classList.add('opacity-50', 'cursor-not-allowed');
            if (subtextEl) subtextEl.textContent = '';
            return;
        }

        const lastClaimTimestamp = account.last_claim_at ? new Date(account.last_claim_at).getTime() : 0;
        const cooldown = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const timeSinceLastClaim = now - lastClaimTimestamp;

        if (lastClaimTimestamp !== 0 && timeSinceLastClaim < cooldown) {
            claimButton.disabled = true;
            claimButton.classList.add('opacity-50', 'cursor-not-allowed');
            const remainingTime = cooldown - timeSinceLastClaim;
            const hours = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            if (subtextEl) subtextEl.textContent = `You can claim again in ${hours}h ${minutes}m.`;
        } else {
            claimButton.disabled = false;
            claimButton.classList.remove('opacity-50', 'cursor-not-allowed');
            if (subtextEl) subtextEl.textContent = '';
        }

    }
}

export function renderModal(title, content, options = {}) {
    const modalId = `modal-${Date.now()}`;
    const size = options.size || 'md';
    const sizeClasses = {
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-5xl',
        '3xl': 'max-w-6xl'
    };

    const modalHtml = `
        <div id="${modalId}" class="modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up" style="animation-duration: 0.2s;">
            <div class="modal-content bg-surface w-full ${sizeClasses[size]} rounded-xl border border-primary shadow-2xl shadow-black/50 flex flex-col max-h-full">
                <header class="p-4 border-b border-primary flex justify-between items-center flex-shrink-0">
                    <h2 class="text-lg font-bold">${title}</h2>
                    <button class="modal-close-btn p-2 text-text-secondary hover:text-text-main rounded-full hover:bg-primary">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>
                <div id="modal-body-${modalId}" class="p-6 overflow-y-auto min-h-0 flex-1">
                    ${content}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.classList.add('modal-open');

    const modal = document.getElementById(modalId);
    
    const closeModal = () => {
        if (modal) {
            modal.classList.remove('animate-fade-in-up');
            modal.classList.add('animate-fade-out-down');
            setTimeout(() => {
                modal.remove();
                if (document.querySelectorAll('.modal-overlay').length === 0) {
                    document.body.classList.remove('modal-open');
                }
            }, 200);
        }
    };

    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });

    return { modalId, closeModal };
}