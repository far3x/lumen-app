import { isAuthenticated, getUser, logout, getAccount, api as authApi, fetchAndStoreUser } from '../lib/auth.js';
import { walletService } from '../lib/wallet.js';
import { navigate } from '../router.js';
import { renderWalletSelectionModal, renderModal } from '../pages/app/dashboard/utils.js';

function renderWalletAreaInDropdown() {
    if (walletService.isWalletConnected()) {
        const address = walletService.publicKey.toBase58();
        const truncatedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
        return `
            <div class="px-4 py-2">
                <p class="text-xs text-text-secondary">Connected Wallet</p>
                <p class="text-sm font-mono text-text-main">${truncatedAddress}</p>
            </div>
            <button id="navbar-wallet-disconnect-btn" class="w-full text-left block px-4 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-main">Disconnect Wallet</button>
        `;
    } else {
        return `<button id="wallet-connect-btn" class="w-full text-left block px-4 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-main">Connect Wallet</button>`;
    }
}

async function handleNavbarWalletDisconnect() {
    const user = getUser();

    if (user && user.solana_address && walletService.isWalletConnected() && user.solana_address === walletService.publicKey.toBase58()) {
        const confirmationContent = `
            <div class="text-center">
                <p class="text-text-secondary mb-6">This wallet is linked to your Lumen account. Do you want to unlink it from your account as well, or just disconnect from the site?</p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button id="navbar-disconnect-only-btn" class="px-6 py-2 bg-primary hover:bg-subtle/80 text-text-main font-medium rounded-md transition-colors">Disconnect Only</button>
                    <button id="navbar-unlink-and-disconnect-btn" class="px-6 py-2 bg-red-900/80 hover:bg-red-900 text-red-300 font-medium rounded-md transition-colors">Unlink & Disconnect</button>
                </div>
                 <button id="navbar-unlink-cancel-btn" class="mt-4 text-sm text-text-secondary hover:underline">Cancel</button>
            </div>
        `;
        const { modalId, closeModal } = renderModal('Confirm Wallet Action', confirmationContent);
        
        document.getElementById('navbar-unlink-cancel-btn')?.addEventListener('click', closeModal);

        document.getElementById('navbar-disconnect-only-btn')?.addEventListener('click', () => {
            walletService.disconnect();
            closeModal();
        });

        document.getElementById('navbar-unlink-and-disconnect-btn')?.addEventListener('click', async (e) => {
            const confirmBtn = e.currentTarget;
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Processing...`;
            try {
                await authApi.post('/users/me/unlink-wallet');
                await fetchAndStoreUser(); 
                walletService.disconnect(); 
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } catch (error) {
                console.error("Navbar unlink failed:", error);
                const modalBody = document.getElementById(`modal-body-${modalId}`);
                if (modalBody) {
                    modalBody.innerHTML = `<p class="text-red-400 text-center">Failed to unlink wallet. Please try again later or from the settings page.</p>`;
                }
                setTimeout(() => {
                    closeModal();
                    if(confirmBtn){
                        confirmBtn.disabled = false;
                        confirmBtn.innerHTML = 'Unlink & Disconnect';
                    }
                }, 3000);
            }
        });
    } else {
        walletService.disconnect(); 
    }
}

export function updateNavbarWalletState() {
    const dropdownContainer = document.getElementById('wallet-dropdown-container');
    if (dropdownContainer) {
        dropdownContainer.innerHTML = renderWalletAreaInDropdown();
        document.getElementById('wallet-connect-btn')?.addEventListener('click', renderWalletSelectionModal);
        
        const disconnectBtn = document.getElementById('navbar-wallet-disconnect-btn'); 
        if (disconnectBtn) {
            disconnectBtn.removeEventListener('click', handleNavbarWalletDisconnect); 
            disconnectBtn.addEventListener('click', handleNavbarWalletDisconnect);
        }
    }
}

export function setupNavbarEventListeners() {
    const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    const toggleMenu = () => {
        mobileMenuPanel?.classList.toggle('translate-x-full');
        mobileMenuOverlay?.classList.toggle('hidden');
    };

    mobileMenuTrigger?.addEventListener('click', toggleMenu);
    mobileMenuClose?.addEventListener('click', toggleMenu);
    mobileMenuOverlay?.addEventListener('click', toggleMenu);

    mobileMenuPanel?.querySelectorAll('a, button').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenuPanel && !mobileMenuPanel.classList.contains('translate-x-full')) {
                setTimeout(toggleMenu, 100);
            }
        });
    });

    const userMenuButton = document.getElementById('user-menu-button');
    const userMenuDropdown = document.getElementById('user-menu-dropdown');

    const toggleUserMenu = (e) => {
        e.stopPropagation();
        userMenuDropdown?.classList.toggle('hidden');
    }

    const closeUserMenuOnClickOutside = (e) => {
        if (userMenuDropdown && !userMenuButton?.contains(e.target) && !userMenuDropdown.contains(e.target)) {
            userMenuDropdown.classList.add('hidden');
        }
    }

    if (userMenuButton) {
        userMenuButton.removeEventListener('click', toggleUserMenu);
        userMenuButton.addEventListener('click', toggleUserMenu);
    }

    document.removeEventListener('click', closeUserMenuOnClickOutside);
    document.addEventListener('click', closeUserMenuOnClickOutside);

    document.getElementById('logout-button-desktop')?.addEventListener('click', logout);
    document.getElementById('logout-button-mobile')?.addEventListener('click', logout);

    updateNavbarWalletState();
}

export function renderNavbar(currentPath) {
    const authed = isAuthenticated();
    const user = getUser();
    const account = getAccount();
    const balance = account?.lum_balance ?? 0;
    const externalLinkIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block h-4 w-4 ml-1.5 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>`;

    const getNavLinkClasses = (path) => {
        const baseClasses = 'group px-4 py-2 text-text-secondary hover:text-text-main transition-colors duration-200 flex items-center';
        const isActive = currentPath === path;
        return isActive ? `${baseClasses} text-text-main` : baseClasses;
    };

    const getMobileNavLinkClasses = (path) => {
        const baseClasses = `group block w-full text-left py-3 px-4 rounded-md text-sm text-text-secondary hover:bg-primary hover:text-text-main transition-colors flex items-center`;
        const isActive = currentPath === path;
        return isActive ? `${baseClasses} bg-primary text-text-main` : baseClasses;
    };

    const leaderboardLink = '/leaderboard';

    const mobileNavHTML = `
        <div id="mobile-menu-overlay" class="fixed inset-0 bg-black/60 z-40 hidden lg:hidden" aria-hidden="true"></div>
        <div id="mobile-menu-panel" class="fixed top-0 right-0 h-full w-72 bg-background z-50 transform translate-x-full transition-transform duration-300 ease-in-out lg:hidden">
            <div class="p-6 flex flex-col h-full">
                <div class="flex justify-between items-center mb-8">
                    <span class="font-bold text-lg">Menu</span>
                    <button id="mobile-menu-close" type="button" class="p-2 text-text-secondary hover:text-text-main"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
                <nav class="flex flex-col space-y-2">
                    <a href="/docs/introduction" class="${getMobileNavLinkClasses('/docs/introduction')}">Docs</a>
                    <a href="${leaderboardLink}" class="${getMobileNavLinkClasses('/leaderboard')}">Leaderboard</a>
                    <a href="/docs/tokenomics" class="${getMobileNavLinkClasses('/docs/tokenomics')}">Tokenomics</a>
                    <a href="/docs/roadmap" class="${getMobileNavLinkClasses('/docs/roadmap')}">Roadmap</a>
                    <a href="https://github.com/Far3000-YT/lumen" target="_blank" rel="noopener" data-external="true" class="${getMobileNavLinkClasses('')}">GitHub ${externalLinkIcon}</a>
                </nav>
                <div class="mt-auto">
                    ${authed ? `
                        <div class="border-t border-primary pt-4 space-y-4">
                            <div class="p-3 rounded-lg bg-primary/50">
                                <p class="text-xs text-text-secondary">Your Balance</p>
                                <p class="font-mono text-lg gradient-text navbar-user-balance">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $LUM</p>
                            </div>
                            <a href="/app/dashboard" class="${getMobileNavLinkClasses('/app/dashboard')}">Dashboard</a>
                            <button id="logout-button-mobile" class="w-full text-left ${getMobileNavLinkClasses('')} text-red-400 hover:text-red-300">Log Out</button>
                        </div>` : `
                        <div class="space-y-3">
                             <a href="/login" class="block w-full text-center h-11 flex items-center justify-center px-6 bg-primary rounded-full text-sm font-medium text-text-secondary hover:bg-subtle transition-colors">Log In</a>
                            <a href="/signup" class="block w-full text-center h-11 flex items-center justify-center px-6 text-sm font-bold text-white rounded-full bg-gradient-to-r from-accent-purple to-accent-pink">Sign Up</a>
                        </div>`}
                </div>
            </div>
        </div>`;

    const userAreaHTML = authed ? `
        <div class="hidden lg:block relative">
            <button id="user-menu-button" class="flex items-center gap-x-3 h-11 pl-4 pr-2 bg-primary/50 hover:bg-primary/80 transition-colors border border-subtle/50 rounded-full">
                <span class="text-sm font-medium text-text-main navbar-user-display-name">${user?.display_name ?? 'User'}</span>
                <div class="w-px h-5 bg-subtle/50"></div>
                <span class="text-sm font-bold gradient-text navbar-user-balance">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $LUM</span>
                <svg class="w-5 h-5 text-text-secondary ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div id="user-menu-dropdown" class="absolute hidden top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 origin-top bg-primary border border-subtle rounded-lg shadow-lg py-1 z-[60]">
                <a href="/app/dashboard" class="w-full text-left block px-4 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-main">Dashboard</a>
                <div class="my-1 h-px bg-subtle/50"></div>
                <div id="wallet-dropdown-container"></div>
                <div class="my-1 h-px bg-subtle/50"></div>
                <button id="logout-button-desktop" class="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-surface hover:text-red-300">Log Out</button>
            </div>
        </div>
        <div class="flex lg:hidden items-center gap-x-4">
            <span class="font-mono text-sm gradient-text navbar-user-balance">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $LUM</span>
            <button id="mobile-menu-trigger" type="button" class="p-2 text-text-secondary hover:text-text-main"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>
        </div>` : `
        <div class="hidden lg:flex items-center h-11 p-1 bg-primary/50 border border-subtle/50 rounded-full">
            <a href="/login" class="h-full flex items-center px-6 rounded-full text-sm font-medium text-text-secondary hover:bg-subtle/50 transition-colors">Log In</a>
            <a href="/signup" class="h-full flex items-center px-6 text-sm font-bold text-white rounded-full bg-gradient-to-r from-accent-purple to-accent-pink">Sign Up</a>
        </div>
        <button id="mobile-menu-trigger" type="button" class="p-2 text-text-secondary hover:text-text-main lg:hidden"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>`;

    return `
    <header class="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
        <div class="relative w-full h-14 bg-surface/10 border border-white/10 backdrop-blur-xl rounded-full flex items-center justify-between px-4 sm:px-6">
            <div class="flex-1 flex justify-start">
                <a href="/" class="flex items-center gap-x-2" title="Lumen Home">
                    <img src="/logo.svg" alt="Lumen Logo" class="h-8 w-8">
                    <span class="hidden sm:block text-xl font-bold text-text-main">Lumen</span>
                </a>
            </div>
            <nav class="hidden lg:flex items-center justify-center text-sm font-medium">
                <a href="/docs/introduction" class="${getNavLinkClasses('/docs/introduction')}">Docs</a>
                <a href="${leaderboardLink}" class="${getNavLinkClasses('/leaderboard')}">Leaderboard</a>
                <a href="/docs/tokenomics" class="${getNavLinkClasses('/docs/tokenomics')}">Tokenomics</a>
                <a href="https://github.com/Far3000-YT/lumen" target="_blank" rel="noopener noreferrer" data-external="true" class="${getNavLinkClasses('')}">GitHub ${externalLinkIcon}</a>
            </nav>
            <div class="flex-1 flex justify-end">
                ${userAreaHTML}
            </div>
        </div>
    </header>
    ${mobileNavHTML}
    `;
}