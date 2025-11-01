export function renderFooter(currentPath) {
    const year = new Date().getFullYear();
    const contractAddress = "BkpaxHhE6snExazrPkVAjxDyZa8Nq3oDEzm5GQm2pump";
    const externalLinkIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block h-4 w-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>`;

    const isDocsSubdomain = window.location.hostname.startsWith('docs.');
    const getDocsLink = (path) => {
        if (isDocsSubdomain) {
            return `/${path}`;
        }
        return `/docs/${path}`;
    };

    return `
    <footer class="bg-transparent py-12">
        <div class="container mx-auto px-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div class="col-span-2 md:col-span-1">
                    <a href="/" class="flex items-center space-x-2">
                        <img src="/img/logo-v2.svg" alt="Lumen Logo" class="h-8 w-auto">
                    </a>
                    <div class="flex space-x-4 mt-4">
                        <a href="https://dexscreener.com/solana/${contractAddress}" target="_blank" rel="noopener noreferrer" aria-label="DexScreener"><img src="/img/footer/dex.svg" class="w-6 h-6 rounded-full" alt="DexScreener"></a>
                        <a href="https://t.me/lumenclient" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><img src="/img/footer/telegram.svg" class="w-6 h-6 rounded-full" alt="Telegram"></a>
                        <a href="https://github.com/far3x/lumen" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><img src="/img/footer/github.svg" class="w-6 h-6 rounded-full" alt="GitHub"></a>
                        <a href="https://x.com/lumencli" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"><img src="/img/footer/twitter.svg" class="w-6 h-6 rounded-full" alt="X / Twitter"></a>
                        <a href="https://discord.gg/KHn8FnV99q" target="_blank" rel="noopener noreferrer" aria-label="Discord"><img src="/img/footer/discord.svg" class="w-6 h-6 rounded-full" alt="Discord"></a>
                        <a href="https://www.linkedin.com/company/pylumen/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><img src="/img/footer/linkedin.svg" class="w-6 h-6 rounded-full" alt="LinkedIn"></a>
                    </div>
                </div>
                <div>
                    <h3 class="font-bold text-gray-800 uppercase tracking-wider">Developers</h3>
                    <ul class="mt-4 space-y-3">
                        <li><a href="${getDocsLink('installation')}" class="text-gray-600 hover:text-gray-800">CLI Guide</a></li>
                        <li><a href="${getDocsLink('faq')}" class="text-gray-600 hover:text-gray-800">FAQ</a></li>
                        <li><a href="${getDocsLink('security')}" class="text-gray-600 hover:text-gray-800">Security</a></li>
                        <li><a href="${getDocsLink('whitepaper')}" class="text-gray-600 hover:text-gray-800">Whitepaper</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-gray-800 uppercase tracking-wider">Community</h3>
                    <ul class="mt-4 space-y-3">
                        <li><a href="https://github.com/far3x/lumen" target="_blank" rel="noopener" data-external="true" class="group flex items-center text-gray-600 hover:text-gray-800">GitHub ${externalLinkIcon}</a></li>
                        <li><a href="https://x.com/lumencli" target="_blank" rel="noopener" data-external="true" class="group flex items-center text-gray-600 hover:text-gray-800">X / Twitter ${externalLinkIcon}</a></li>
                        <li><a href="https://www.linkedin.com/company/pylumen/" target="_blank" rel="noopener" data-external="true" class="group flex items-center text-gray-600 hover:text-gray-800">LinkedIn ${externalLinkIcon}</a></li>
                        <li><a href="https://discord.gg/KHn8FnV99q" target="_blank" rel="noopener" data-external="true" class="group flex items-center text-gray-600 hover:text-gray-800">Discord ${externalLinkIcon}</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-gray-800 uppercase tracking-wider">Legal</h3>
                    <ul class="mt-4 space-y-3">
                        <li><a href="${getDocsLink('terms')}" class="text-gray-600 hover:text-gray-800">Terms & Conditions</a></li>
                        <li><a href="${getDocsLink('privacy-policy')}" class="text-gray-600 hover:text-gray-800">Privacy Policy</a></li>
                        <li><a href="${getDocsLink('contributor-agreement')}" class="text-gray-600 hover:text-gray-800">Contributor Agreement</a></li>
                        <li><a href="${getDocsLink('disclaimer')}" class="text-gray-600 hover:text-gray-800">Disclaimer</a></li>
                    </ul>
                </div>
            </div>
            <div class="mt-12 pt-8 border-t border-primary">
                <div class="bg-surface rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 class="font-bold text-text-main">Lumen for Business</h4>
                        <p class="text-sm text-text-secondary">Acquire strategic, ethically-sourced datasets for your AI models.</p>
                    </div>
                    <a href="https://business.lumen.onl" data-external="true" target="_blank" rel="noopener noreferrer" class="px-6 py-2 text-sm font-bold bg-gray-800 text-white hover:bg-black rounded-lg transition-colors shrink-0">Explore for Business</a>
                </div>
            </div>
            <p class="mt-8 text-sm text-gray-500 text-center">© ${year} Lumen. All rights reserved.</p>
        </div>
    </footer>
    `;
}