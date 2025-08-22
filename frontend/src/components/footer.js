import { isAuthenticated } from '../lib/auth.js';

export function renderFooter(currentPath) {
    const year = new Date().getFullYear();
    const authed = isAuthenticated();
    const onDashboard = currentPath && currentPath.startsWith('/app/dashboard');
    const onAuthPage = currentPath === '/login' || currentPath === '/signup';
    const socialIconClasses = "w-6 h-6 text-text-secondary hover:text-text-main transition-colors";
    const externalLinkIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block h-4 w-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>`;
    
    const isDocsSubdomain = window.location.hostname.startsWith('docs.');
    const mainSiteUrl = isDocsSubdomain ? 'https://lumen.onl' : '';
    const logoUrl = `${mainSiteUrl || ''}/logo.png`;

    const getDocPath = (path) => isDocsSubdomain ? `/${path}` : `/docs/${path}`;
    const getMainPath = (path) => isDocsSubdomain ? `https://lumen.onl${path}` : path;
    
    const ctaSection = authed
        ? (onDashboard
            ? ''
            : `
            <div class="text-center mb-20 scroll-animate">
                <h2 class="text-3xl md:text-4xl font-bold">Ready to Contribute More?</h2>
                <p class="text-text-secondary mt-4 max-w-xl mx-auto">Head back to your dashboard to view your progress and see the latest network activity.</p>
                <a href="${getMainPath('/app/dashboard')}" class="mt-8 inline-block px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110">
                    Go to Dashboard
                </a>
            </div>
        `)
        : (onAuthPage
            ? ''
            : `
            <div class="text-center mb-20 scroll-animate">
                <h2 class="text-3xl md:text-4xl font-bold">Ready to Join the Data Economy?</h2>
                <p class="text-text-secondary mt-4 max-w-xl mx-auto">Start contributing your anonymized code in minutes and get rewarded with $LUMEN tokens.</p>
                <a href="${getMainPath('/signup')}" class="mt-8 inline-block px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110">
                    Get Started Now
                </a>
            </div>
        `);

    return `
    <div class="transition-all duration-200 ease-in-out">
        <footer class="relative bg-abyss-dark border-t border-primary footer-gradient-border">
            <div class="container mx-auto px-6 py-20">
                ${ctaSection}

                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 scroll-animate">
                    <div class="col-span-2">
                        <a href="${getMainPath('/')}" class="flex items-center space-x-2">
                            <img src="${logoUrl}" alt="Lumen Logo" class="h-8 w-8">
                            <span class="text-xl font-bold text-text-main">Lumen Protocol</span>
                        </a>
                        <p class="text-text-secondary mt-4 max-w-xs">The decentralized data exchange powering the next generation of artificial intelligence.</p>
                    </div>
                    <div>
                        <h3 class="font-bold text-text-main tracking-wider uppercase">Developers</h3>
                        <ul class="mt-4 space-y-3">
                            <li><a href="${getDocPath('installation')}" class="text-text-secondary hover:text-text-main transition-colors">CLI Guide</a></li>
                            <li><a href="${getDocPath('faq')}" class="text-text-secondary hover:text-text-main transition-colors">FAQ</a></li>
                            <li><a href="${getDocPath('security')}" class="text-text-secondary hover:text-text-main transition-colors">Security</a></li>
                            <li><a href="${getMainPath('/patch-notes/')}" class="text-text-secondary hover:text-text-main transition-colors">Patch Notes</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-bold text-text-main tracking-wider uppercase">Community</h3>
                        <ul class="mt-4 space-y-3">
                        <li><a href="https://github.com/Far3000-YT/lumen" target="_blank" rel="noopener" data-external="true" class="group flex items-center text-text-secondary hover:text-text-main transition-colors">GitHub ${externalLinkIcon}</a></li>
                        <li><a href="https://x.com/lumencli" target="_blank" rel="noopener" data-external="true" class="group flex items-center text-text-secondary hover:text-text-main transition-colors">X / Twitter ${externalLinkIcon}</a></li>
                        <li><a href="https://www.linkedin.com/company/pylumen/" target="_blank" rel="noopener" data-external="true" class="group flex items-center text-text-secondary hover:text-text-main transition-colors">LinkedIn ${externalLinkIcon}</a></li>
                        <li><a href="https://discord.gg/KHn8FnV99q" target="_blank" rel="noopener" data-external="true" class="group flex items-center text-text-secondary hover:text-text-main transition-colors">Discord ${externalLinkIcon}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-bold text-text-main tracking-wider uppercase">Legal</h3>
                        <ul class="mt-4 space-y-3">
                            <li><a href="${getDocPath('terms')}" class="text-text-secondary hover:text-text-main transition-colors">Terms & Conditions</a></li>
                            <li><a href="${getDocPath('privacy-policy')}" class="text-text-secondary hover:text-text-main transition-colors">Privacy Policy</a></li>
                            <li><a href="${getDocPath('contributor-agreement')}" class="text-text-secondary hover:text-text-main transition-colors">Contributor Agreement</a></li>
                            <li><a href="${getDocPath('disclaimer')}" class="text-text-secondary hover:text-text-main transition-colors">Disclaimer</a></li>
                        </ul>
                    </div>
                </div>

                <div class="mt-16 pt-8 border-t border-primary flex flex-col sm:flex-row justify-between items-center text-sm scroll-animate">
                    <p class="text-subtle order-2 sm:order-1 mt-4 sm:mt-0">© ${year} Lumen Protocol. All rights reserved.</p>
                    <div class="flex space-x-6 order-1 sm:order-2">
                        <a href="https://github.com/Far3000-YT/lumen" target="_blank" rel="noopener" data-external="true" aria-label="GitHub">
                            <svg class="${socialIconClasses}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                        </a>
                        <a href="https://x.com/lumencli" target="_blank" rel="noopener" data-external="true" aria-label="X / Twitter">
                            <svg class="${socialIconClasses}" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                        <a href="https://discord.gg/KHn8FnV99q" target="_blank" rel="noopener" data-external="true" aria-label="Discord">
                            <svg class="${socialIconClasses}" viewBox="0 -28.5 256 256" fill="currentColor"><path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"/></svg>
                        </a>
                        <a href="https://www.linkedin.com/company/pylumen/" target="_blank" rel="noopener" data-external="true" aria-label="LinkedIn">
                            <svg class="${socialIconClasses}" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
    `;
}