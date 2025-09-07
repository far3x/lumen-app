import { isAuthenticated } from '../lib/auth.js';

export function renderFooter(currentPath) {
    const year = new Date().getFullYear();
    const contractAddress = "ARxf6vS5wRhfxuWagMDd67T5keaBcdtTCMVV74un6777";
    
    return `
    <footer class="bg-transparent py-12">
        <div class="container mx-auto px-6">
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                <div class="col-span-2 lg:col-span-1">
                    <a href="/" class="flex items-center space-x-2">
                        <img src="/img/logo-v2.svg" alt="Lumen Logo" class="h-8 w-auto">
                    </a>
                    <div class="flex space-x-4 mt-4">
                        <a href="/docs/introduction" aria-label="Book"><img src="/img/footer/book.svg" class="w-6 h-6 rounded-full"></a>
                        <a href="https://dexscreener.com/solana/${contractAddress}" target="_blank" rel="noopener noreferrer" aria-label="Dex"><img src="/img/footer/dex.svg" class="w-6 h-6 rounded-full"></a>
                        <a href="#" aria-label="Telegram"><img src="/img/footer/telegram.svg" class="w-6 h-6 rounded-full"></a>
                        <a href="https://x.com/lumencli" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><img src="/img/footer/twitter.svg" class="w-6 h-6 rounded-full"></a>
                    </div>
                     <p class="mt-4 text-sm text-gray-500">© ${year} Lumen. All rights reserved.</p>
                </div>
                <div>
                    <h3 class="font-bold text-gray-800">About</h3>
                    <ul class="mt-4 space-y-3">
                        <li><a href="/docs/whitepaper" class="text-gray-600 hover:text-gray-800">Whitepaper</a></li>
                        <li><a href="https://solscan.io/token/${contractAddress}" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-gray-800">Contract</a></li>
                        <li><a href="/docs/introduction" class="text-gray-600 hover:text-gray-800">Documentation</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-gray-800">Buy</h3>
                    <ul class="mt-4 space-y-3">
                        <li><a href="https://dexscreener.com/solana/${contractAddress}" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-gray-800">View Chart</a></li>
                        <li><a href="https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${contractAddress}" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-gray-800">Buy on Raydium</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-gray-800">Legal</h3>
                    <ul class="mt-4 space-y-3">
                        <li><a href="/docs/privacy-policy" class="text-gray-600 hover:text-gray-800">Privacy Policy</a></li>
                        <li><a href="/docs/terms" class="text-gray-600 hover:text-gray-800">Terms & conditions</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
    `;
}