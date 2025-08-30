export function renderFooter() {
    const linkClasses = "text-text-muted hover:text-text-body transition-colors group inline-flex items-center";
    const externalLinkIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block h-3.5 w-3.5 ml-1 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>`;

    return `
        <div class="bg-white border-t border-border">
            <div class="container mx-auto px-6 py-16">
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div class="col-span-2 lg:col-span-2">
                         <a href="/" class="flex items-center gap-2">
                            <img src="/logo.png?v=2" alt="Lumen Logo" class="h-8 w-8">
                            <span class="font-bold text-xl text-text-headings">Lumen</span>
                        </a>
                        <p class="mt-4 text-text-muted max-w-xs">The strategic data advantage for world-class AI.</p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-text-headings tracking-wider uppercase text-sm">Product</h3>
                        <ul class="mt-4 space-y-3">
                            <li><a href="/product" class="${linkClasses}">Data Explorer</a></li>
                            <li><a href="/pricing" class="${linkClasses}">Pricing</a></li>
                            <li><a href="/docs" class="${linkClasses}">API Docs</a></li>
                            <li><a href="/contact" class="${linkClasses}">Contact Us</a></li>
                        </ul>
                    </div>
                     <div>
                        <h3 class="font-semibold text-text-headings tracking-wider uppercase text-sm">Company</h3>
                        <ul class="mt-4 space-y-3">
                            <li><a href="/about" class="${linkClasses}">About Us</a></li>
                            <li><a href="https://x.com/lumencli" class="${linkClasses}" data-external="true" target="_blank" rel="noopener">X / Twitter ${externalLinkIcon}</a></li>
                            <li><a href="https://github.com/Far3000-YT/lumen" class="${linkClasses}" data-external="true" target="_blank" rel="noopener">GitHub ${externalLinkIcon}</a></li>
                            <li><a href="https://www.linkedin.com/company/pylumen/" class="${linkClasses}" data-external="true" target="_blank" rel="noopener">LinkedIn ${externalLinkIcon}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold text-text-headings tracking-wider uppercase text-sm">Legal</h3>
                        <ul class="mt-4 space-y-3">
                            <li><a href="https://docs.lumen.onl/terms" class="${linkClasses}" data-external="true" target="_blank" rel="noopener">Terms of Service ${externalLinkIcon}</a></li>
                            <li><a href="https://docs.lumen.onl/privacy-policy" class="${linkClasses}" data-external="true" target="_blank" rel="noopener">Privacy Policy ${externalLinkIcon}</a></li>
                        </ul>
                    </div>
                </div>
                <div class="mt-16 pt-8 border-t border-border text-sm text-text-muted text-center">
                    <p>&copy; ${new Date().getFullYear()} Lumen Protocol. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;
}