import { isAuthenticated } from '../lib/auth.js';

export function renderNavbar() {
    const authed = isAuthenticated();

    const navLinkClasses = "min-w-24 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-text-secondary bg-surface/60 border border-primary transition-all duration-300 hover:bg-primary hover:border-subtle/50 hover:text-text-main";

    // THE FIX: Define the prominent button style here to reuse it
    const ctaButtonClasses = `px-3 sm:px-6 py-2 text-sm font-bold text-white rounded-md 
                              bg-gradient-to-r from-accent-purple to-accent-pink
                              bg-[length:200%_auto] animate-gradient-pan
                              transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/25`;

    return `
    <header class="sticky top-0 w-full z-50 bg-background/90 backdrop-blur-lg border-b border-subtle/50">
        <nav class="container mx-auto flex h-20 items-center justify-between px-6 relative">
            <a href="/" class="flex items-center space-x-2">
                <img src="/logo.svg" alt="Lumen Logo" class="h-8 w-8">
                <span class="text-xl font-bold text-text-main">Lumen</span>
            </a>
            
            <div class="hidden md:flex items-center space-x-2 absolute left-1/2 -translate-x-1/2">
                <a href="/docs/introduction" class="${navLinkClasses}">Docs</a>
                <a href="/docs/tokenomics" class="${navLinkClasses}">Tokenomics</a>
                <a href="/docs/roadmap" class="${navLinkClasses}">Roadmap</a>
                <a href="https://github.com/Far3000-YT/lumen" target="_blank" rel="noopener noreferrer" data-external="true" class="${navLinkClasses}">GitHub</a>
            </div>

            <div class="flex items-center space-x-2 sm:space-x-4">
                ${authed ? `
                    <a href="/app/dashboard" class="${ctaButtonClasses}">Dashboard</a>
                ` : `
                    <a href="/login" class="px-3 sm:px-6 py-2 text-sm font-medium bg-primary text-text-secondary rounded-md transition-all duration-200 hover:bg-subtle hover:text-text-main hover:scale-105">Log In</a>
                    <a href="/signup" class="${ctaButtonClasses}">
                        Sign Up
                    </a>
                `}
            </div>
        </nav>
    </header>
    `;
}