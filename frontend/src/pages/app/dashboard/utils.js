import { getAccount } from "../../../lib/auth.js";
import { walletService } from "../../../lib/wallet.js";

export function renderWalletSelectionModal() {
    const modalExists = document.getElementById('wallet-selection-modal');
    if (modalExists) return;

    const wallets = [
        { name: 'Phantom', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjUwIDExMS44NDNjMC01MS44NDctNDQuODU1LTkzLjg1OS0xMDAtOTMuODU5UzUwIDE3Ljk5NiA1MCA2MC4xNTNjMC0yMy4xMzYgMjEuMzc2LTQxLjk3MSA0Ny43NS00MS45NzFTMTQ1LjUgMzcuMDE3IDE0NS41IDYwLjE1M2MwIDIwLjE4NC0xNS44ODQgMzYuNTg4LTM1LjUgMzYuNTg4Yy0xOS4zMyAwLTM1LjAxLTE2LjE5Mi0zNS4wMS0zNi4wNzMgMC0xMS4zNDggNC43NzUtMjEuNTQ3IDEyLjQ2OS0yOC4zNzQgMS41MjgtMS4zNzIgMy42OTYtMS4xNjggNS4wNjQgLjM2MSAxLjM3IDEuNTI5IDEuMTY3IDMuNzAxLS4zNiA1LjA2NC01LjYxMyA1LjAzLTkuMTcxIDEyLjI4My05LjE3MSAyMC4yOSAwIDE0LjM0OCAxMi40MzMgMjYuMDIzIDI3LjczMiAyNi4wMjNzMjcuNzMyLTExLjY3NSAyNy43MzItMjYuMDIzYzAtMTMuNDY0LTExLjI0NS0yNC42MjMtMjUuNDY4LTI1Ljg3IFY2MC4xNTNjMCAxMS4yMTItMTAuMTM4IDIwLjMwMi0yMi42NSA4LjE3NmwtMTUuNjY3LTguMjAxYy0zLjQ4Ny0xLjgyMy03LjU5My0xLjgyMy0xMS4wOCAwTDUuODQzIDU4LjE1Yy0zLjQ4OCAxLjgyMy0zLjQ4OCA2LjA5NSAwIDcuOTE4bDE1LjY2OCA4LjIwMWMxMi41MTIgNi41NTggMjIuNjUgMi43MjMgMjIuNjUtOC4xNzZWNTIuNTY4YzEzLjE4MyAxLjI3IDEzLjQ5IDIuODEgMTMuNDkgMi44MSAxNC4yMjMgMS4yNDYgMjUuNDY3IDEyLjQwOCAyNS40NjcgMjUuODcgMCAxNC4zNDctMTIuNDMzIDI2LjAyMi0yNy43MzIgMjYuMDIycy0yNy43MzItMTEuNjczLTI3LjczMi0yNi4wMjJjMC0xMS4yNyAxMC4wNjItMjAuNDYgMjIuNDI1LTIwLjQ2aC4yMjVjMS45ODggMCAzLjYtMS42MTIgMy42LTMuNnMtMS42MTItMy42LTMuNi0zLjZoLS4yMjVDNzMuMzggNDguNTMyIDUwIDcyLjM5NyA1MCAxMTEuODQzYzAgMjUuODIgMjIuOTYgNDYuNzYgNTEuMjUgNDYuNzZoMTAwYy4zMyAwIC42Ni0uMDEyLjk5LS4wMjZDOTguNTk3IDE1Ny40NjIgNTAgMTYyLjI0MiA1MCAxNzQuNzdjMCA5LjcxMiA2LjU0MiAxNy44MzcgMTUuNTE1IDIwLjk0NCAxLjcyMy41ODYgMy42My4xNSA0LjgwMy0xLjA3MSAxLjE3Mi0xLjIyNiAxLjM2My0zLjEyNC40NzItNC41NTgtNi4yNjUtMTAuMDc3LTUuNjQtMjIuOTkgMS41OTQtMzEuNzg3IDguMTEzLTkuOTkyIDIxLjgxMy0xMS4xMjcgMzEuMzgtMy41MmwxMi4yNzYgOS44NjRjMy4zOTIgMi43MjUgOC4yMyAyLjcyNSAxMS42MjEgMGwxMi4yNzYtOS44NjRjOS41NjctNy42MDcgMjMuMjY3LTYuNDY5IDMxLjM4MSAzLjUyIDcuMjMzIDguNzk3IDcuODU4IDIxLjcxMiAxLjU5MyAzMS43ODctLjg5IDEuNDM0LS43IDIuMzMyLjQ3MiA0LjU1OCAxLjE3MiAxLjIyNiAzLjA4IDEuNjU2IDQuODAzIDEuMDcxQzE5My40NTggMTkyLjYwOCAyMDAgMTgzLjQ4MiAyMDAgMTc0Ljc3YzAtMTIuODMtNTAuNzY0LTE3LjY1LTk4Ljc2LTMyLjI5NyAxLjM0Mi4wMTIgMi42ODguMDI3IDQuMDEuMDI3aDEwMGMyNy42MTQgMCA1MC0yMS40NjQgNTAtNDguMTE4Wm0tOTIuNTE0Ljc0OGMtMi41MS45NS0zLjcxNSAyLjEyNC0zLjcxNSAzLjM3MiAwIDEuNzM4IDEuOTIzIDIuNzM2IDQuMzY1IDEuOTU0bDIxLjY1My03LjEyNGMyLjQ0Mi0uOCAyLjQ0Mi0zLjM4IDAtNC4xOGwtMjEuNjUzLTcuMTI0Yy0yLjQ0Mi0uNzgyLTQuMzY1LjIxNi00LjM2NSAxLjk1NHY2LjEyNFoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=' },
        { name: 'Solflare', icon: 'https://solflare.com/favicon.ico' }
    ];

    const modalHTML = `
        <div id="wallet-selection-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up" style="animation-duration: 0.2s;">
            <div id="modal-content" class="bg-surface w-full max-w-xs rounded-xl border border-primary shadow-2xl shadow-black/50">
                <header class="p-4 border-b border-primary flex justify-between items-center">
                    <h2 class="text-lg font-bold">Connect a Wallet</h2>
                    <button id="modal-close-btn" class="p-2 text-text-secondary hover:text-text-main rounded-full hover:bg-primary">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>
                <div class="p-4 space-y-3">
                    ${wallets.map(wallet => `
                        <button data-wallet-name="${wallet.name}" class="wallet-option-btn w-full flex items-center gap-4 p-3 rounded-lg bg-primary hover:bg-subtle transition-colors">
                            <img src="${wallet.icon}" alt="${wallet.name} logo" class="w-8 h-8 rounded-full">
                            <span class="font-bold text-text-main">${wallet.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const closeModal = () => {
        const modal = document.getElementById('wallet-selection-modal');
        if (modal) modal.remove();
    };

    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('wallet-selection-modal').addEventListener('click', (e) => {
        if (e.target.id === 'wallet-selection-modal') closeModal();
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
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&")
         .replace(/</g, "<")
         .replace(/>/g, ">")
         .replace(/"/g, "\"")
         .replace(/'/g, "'");
}

const iconDefs = `<defs><linearGradient id="icon-gradient-dashboard" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color: #8A2BE2;" /><stop offset="50%" style="stop-color: #FF69B4;" /><stop offset="100%" style="stop-color: #00D9D9;" /></linearGradient></defs>`;

export const icons = {
    dashboard: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`,
    contributions: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
    feed: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`,
    referral: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>`,
    settings: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
    rank: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24">${iconDefs}<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="url(#icon-gradient-dashboard)" /></svg>`,
    total: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24">${iconDefs}<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="url(#icon-gradient-dashboard)" /></svg>`,
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
    if (!account) return;

    const balanceDisplay = `${(account.lum_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $LUM`;

    document.querySelectorAll('.navbar-user-balance').forEach(el => el.textContent = balanceDisplay);
    
    const overviewBalanceEl = document.getElementById('overview-total-balance');
    if (overviewBalanceEl) {
        overviewBalanceEl.textContent = balanceDisplay;
    }
}

export function renderModal(title, content) {
    const modalId = `modal-${Date.now()}`;
    const modalHtml = `
        <div id="${modalId}" class="modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up" style="animation-duration: 0.2s;">
            <div class="modal-content bg-surface w-full max-w-md rounded-xl border border-primary shadow-2xl shadow-black/50 overflow-hidden">
                <header class="p-4 border-b border-primary flex justify-between items-center">
                    <h2 class="text-lg font-bold">${title}</h2>
                    <button class="modal-close-btn p-2 text-text-secondary hover:text-text-main rounded-full hover:bg-primary">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>
                <div id="modal-body-${modalId}" class="p-6 max-h-[70vh] overflow-y-auto">
                    ${content}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById(modalId);
    
    const closeModal = () => {
        if (modal) {
            modal.classList.remove('animate-fade-in-up');
            modal.classList.add('animate-fade-out-down');
            setTimeout(() => modal.remove(), 200);
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