export function renderFooter() {
    const year = new Date().getFullYear();
    const socialIconClasses = "w-6 h-6 text-text-secondary hover:text-text-main transition-colors";
    const externalLinkIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block h-4 w-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>`;
    
    return `
    <footer class="relative bg-abyss-dark border-t border-primary footer-gradient-border">
        <div class="container mx-auto px-6 py-20">
            <!-- CTA Section -->
            <div class="text-center mb-20">
                <h2 class="text-3xl md:text-4xl font-bold">Ready to Join the Data Economy?</h2>
                <p class="text-text-secondary mt-4 max-w-xl mx-auto">Start contributing your anonymized code in minutes and get rewarded with $LUM tokens.</p>
                <a href="/login" class="mt-8 inline-block px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110">
                    Get Started Now
                </a>
            </div>

            <!-- Links Grid -->
            <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
                <div class="col-span-1 lg:col-span-2">
                    <a href="/" class="flex items-center space-x-2">
                        <img src="/logo.svg" alt="Lumen Logo" class="h-8 w-8">
                        <span class="text-xl font-bold text-text-main">Lumen Protocol</span>
                    </a>
                    <p class="text-text-secondary mt-4 max-w-xs">The decentralized data exchange powering the next generation of artificial intelligence.</p>
                </div>
                <div>
                    <h3 class="font-bold text-text-main tracking-wider uppercase">Protocol</h3>
                    <ul class="mt-4 space-y-3">
                        <li><a href="/docs/introduction" class="text-text-secondary hover:text-text-main transition-colors">Introduction</a></li>
                        <li><a href="/docs/tokenomics" class="text-text-secondary hover:text-text-main transition-colors">$LUM Token</a></li>
                        <li><a href="/docs/contributing" class="text-text-secondary hover:text-text-main transition-colors">Contribute Data</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-text-main tracking-wider uppercase">Developers</h3>
                    <ul class="mt-4 space-y-3">
                        <li><a href="/docs/installation" class="text-text-secondary hover:text-text-main transition-colors">CLI Guide</a></li>
                         <li><a href="/docs/faq" class="text-text-secondary hover:text-text-main transition-colors">FAQ</a></li>
                         <li><a href="/docs/security" class="text-text-secondary hover:text-text-main transition-colors">Security</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-text-main tracking-wider uppercase">Community</h3>
                    <ul class="mt-4 space-y-3">
                       <li><a href="https://github.com/Far3000-YT/lumen" target="_blank" rel="noopener" data-external="true" class="group flex items-center text-text-secondary hover:text-text-main transition-colors">GitHub ${externalLinkIcon}</a></li>
                       <li><a href="https://twitter.com/0xFar3000" target="_blank" rel="noopener" data-external="true" class="group flex items-center text-text-secondary hover:text-text-main transition-colors">X / Twitter ${externalLinkIcon}</a></li>
                       <li><a href="#" target="_blank" rel="noopener" data-external="true" class="group flex items-center text-text-secondary hover:text-text-main transition-colors">Discord ${externalLinkIcon}</a></li>
                    </ul>
                </div>
            </div>

            <!-- Bottom Bar -->
            <div class="mt-16 pt-8 border-t border-primary flex flex-col sm:flex-row justify-between items-center text-sm">
                <p class="text-subtle order-2 sm:order-1 mt-4 sm:mt-0">© ${year} Lumen Protocol. All rights reserved.</p>
                <div class="flex space-x-6 order-1 sm:order-2">
                    <a href="https://github.com/Far3000-YT/lumen" target="_blank" rel="noopener" data-external="true" aria-label="GitHub">
                        <svg class="${socialIconClasses}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    </a>
                    <a href="https://twitter.com/0xFar3000" target="_blank" rel="noopener" data-external="true" aria-label="X / Twitter">
                        <svg class="${socialIconClasses}" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                </div>
            </div>
        </div>
    </footer>
    `;
}