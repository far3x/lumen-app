import { isAuthenticated, getUser, logout } from '../lib/auth.js';
import { navigate } from '../router.js';

export function renderHeader() {
    const authed = isAuthenticated();
    const user = getUser();

    const navLinkClasses = "text-text-body hover:text-text-headings transition-colors font-medium";
    const buttonPrimaryClasses = "px-5 py-2.5 text-sm font-semibold text-white bg-accent-gradient rounded-md transition-all duration-300 hover:scale-105 hover:brightness-110";
    const buttonSecondaryClasses = "px-5 py-2.5 text-sm font-semibold text-text-headings bg-white border border-border hover:bg-background rounded-md transition-colors";

    const authLinks = authed ? `
        <a href="/app/overview" class="${buttonSecondaryClasses}">Dashboard</a>
        <button id="logout-btn" class="${buttonPrimaryClasses}">Log Out</button>
    ` : `
        <a href="/login" class="${navLinkClasses}">Login</a>
        <a href="/contact" class="${buttonSecondaryClasses}">Contact Us</a>
        <a href="/signup" class="${buttonPrimaryClasses}">Try Lumen</a>
    `;

    setTimeout(() => {
        document.getElementById('logout-btn')?.addEventListener('click', logout);
    }, 0);

    return `
    <div class="bg-white/80 backdrop-blur-lg border-b border-border transition-transform duration-300">
        <div class="container mx-auto px-6">
            <div class="flex justify-between items-center h-24">
                <div class="flex items-center gap-10">
                    <a href="/" class="flex items-center gap-3">
                        <img src="/logo.png" alt="Lumen Logo" class="h-12 w-12">
                        <span class="font-normal text-3xl text-primary tracking-tighter">lumen</span>
                    </a>
                    <nav class="hidden lg:flex items-center gap-8">
                        <a href="/why-lumen" class="${navLinkClasses}">Why Lumen</a>
                        <a href="/product" class="${navLinkClasses}">Product</a>
                        <a href="/docs" class="${navLinkClasses}">Docs</a>
                        <a href="/about" class="${navLinkClasses}">About</a>
                    </nav>
                </div>

                <div class="hidden lg:flex items-center gap-4">
                    ${authLinks}
                </div>

                <div class="lg:hidden">
                    <button class="text-text-headings">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
}