import { isAuthenticated, getUser, logout } from '../lib/auth.js';
import { navigate } from '../router.js';

function setupNavbarEventListeners() {
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
            if (!mobileMenuPanel.classList.contains('translate-x-full')) {
                setTimeout(toggleMenu, 100);
            }
        });
    });

    const userMenuButton = document.getElementById('user-menu-button');
    const userMenuDropdown = document.getElementById('user-menu-dropdown');

    userMenuButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenuDropdown?.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        userMenuDropdown?.classList.add('hidden');
    });

    document.getElementById('logout-button-desktop')?.addEventListener('click', () => {
        logout();
        navigate('/login');
    });

    document.getElementById('logout-button-mobile')?.addEventListener('click', () => {
        logout();
        navigate('/login');
    });
}

export function renderNavbar() {
    const authed = isAuthenticated();
    const user = authed ? getUser() : null;
    const mockBalance = 5432.12;

    const navLinkClasses = `px-4 py-2 text-text-secondary hover:text-text-main transition-colors duration-200`;
    const mobileNavLinkClasses = `block w-full text-left py-3 px-4 rounded-md text-text-secondary hover:bg-primary hover:text-text-main transition-colors`;

    const mobileNavHTML = `
        <div id="mobile-menu-overlay" class="fixed inset-0 bg-black/60 z-40 hidden lg:hidden" aria-hidden="true"></div>
        <div id="mobile-menu-panel" class="fixed top-0 right-0 h-full w-72 bg-background z-50 transform translate-x-full transition-transform duration-300 ease-in-out lg:hidden">
            <div class="p-6 flex flex-col h-full">
                <div class="flex justify-between items-center mb-8">
                    <span class="font-bold text-lg">Menu</span>
                    <button id="mobile-menu-close" type="button" class="p-2 text-text-secondary hover:text-text-main">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <nav class="flex flex-col space-y-2">
                    <a href="/docs/introduction" class="${mobileNavLinkClasses}">Docs</a>
                    <a href="/docs/tokenomics" class="${mobileNavLinkClasses}">Tokenomics</a>
                    <a href="/docs/roadmap" class="${mobileNavLinkClasses}">Roadmap</a>
                    <a href="https://github.com/Far3000-YT/lumen" target="_blank" rel="noopener" data-external="true" class="${mobileNavLinkClasses}">GitHub</a>
                </nav>

                <div class="mt-auto">
                    ${authed ? `
                        <div class="border-t border-primary pt-4 space-y-4">
                            <div class="p-3 rounded-lg bg-primary/50">
                                <p class="text-xs text-text-secondary">Your Balance</p>
                                <p class="font-mono text-lg gradient-text">${mockBalance.toLocaleString()} $LUM</p>
                            </div>
                            <a href="/app/dashboard" class="${mobileNavLinkClasses}">Dashboard</a>
                            <button id="logout-button-mobile" class="w-full text-left ${mobileNavLinkClasses} text-red-400 hover:text-red-300">Log Out</button>
                        </div>
                    ` : `
                        <div class="space-y-3">
                             <a href="/login" class="block w-full text-center h-11 flex items-center justify-center px-6 bg-primary rounded-full text-sm font-medium text-text-secondary hover:bg-subtle transition-colors">
                                Log In
                            </a>
                            <a href="/signup" class="block w-full text-center h-11 flex items-center justify-center px-6 text-sm font-bold text-white rounded-full bg-gradient-to-r from-accent-purple to-accent-pink">
                                Sign Up
                            </a>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;

    const userAreaHTML = authed ? `
        <div class="relative">
            <button id="user-menu-button" class="flex items-center gap-x-3 h-11 px-4 bg-primary/50 hover:bg-primary/80 transition-colors border border-subtle/50 rounded-full">
                <span class="text-sm font-medium text-text-main">${user.display_name}</span>
                <div class="w-px h-5 bg-subtle/50"></div>
                <span class="text-sm font-bold gradient-text">${mockBalance.toLocaleString()} $LUM</span>
                <svg class="w-5 h-5 text-text-secondary ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div id="user-menu-dropdown" class="absolute hidden top-full right-0 mt-2 w-48 bg-primary border border-subtle rounded-lg shadow-lg py-1">
                <a href="/app/dashboard" class="block px-4 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-main">Dashboard</a>
                <button id="logout-button-desktop" class="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-surface hover:text-red-300">Log Out</button>
            </div>
        </div>
    ` : `
        <div class="hidden lg:flex items-center h-11 p-1 bg-primary/50 border border-subtle/50 rounded-full">
            <a href="/login" class="h-full flex items-center px-6 rounded-full text-sm font-medium text-text-secondary hover:bg-subtle/50 transition-colors">
                Log In
            </a>
            <a href="/signup" class="h-full flex items-center px-6 text-sm font-bold text-white rounded-full bg-gradient-to-r from-accent-purple to-accent-pink">
                Sign Up
            </a>
        </div>
    `;

    setTimeout(setupNavbarEventListeners, 0);

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
                <a href="/docs/introduction" class="${navLinkClasses}">Docs</a>
                <a href="/docs/tokenomics" class="${navLinkClasses}">Tokenomics</a>
                <a href="/docs/roadmap" class="${navLinkClasses}">Roadmap</a>
                <a href="https://github.com/Far3000-YT/lumen" target="_blank" rel="noopener noreferrer" data-external="true" class="${navLinkClasses}">GitHub</a>
            </nav>

            <div class="flex-1 flex justify-end">
                ${userAreaHTML}
                <button id="mobile-menu-trigger" type="button" class="p-2 text-text-secondary hover:text-text-main lg:hidden">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>
        </div>
    </header>
    ${mobileNavHTML}
    `;
}