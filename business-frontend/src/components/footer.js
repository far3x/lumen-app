export function renderFooter() {
    const linkClasses = "text-text-muted hover:text-text-body transition-colors";
    return `
        <div class="bg-white border-t border-border">
            <div class="container mx-auto px-6 py-16">
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div class="col-span-2 lg:col-span-2">
                         <a href="/" class="flex items-center gap-2">
                            <img src="/logo.png" alt="Lumen Logo" class="h-8 w-8">
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
                        </ul>
                    </div>
                     <div>
                        <h3 class="font-semibold text-text-headings tracking-wider uppercase text-sm">Company</h3>
                        <ul class="mt-4 space-y-3">
                            <li><a href="/about" class="${linkClasses}">About Us</a></li>
                            <li><a href="https://x.com/lumencli" class="${linkClasses}" data-external="true">X / Twitter</a></li>
                            <li><a href="https://github.com/Far3000-YT/lumen" class="${linkClasses}" data-external="true">GitHub</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold text-text-headings tracking-wider uppercase text-sm">Legal</h3>
                        <ul class="mt-4 space-y-3">
                            <li><a href="/terms" class="${linkClasses}">Terms of Service</a></li>
                            <li><a href="/privacy" class="${linkClasses}">Privacy Policy</a></li>
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