const docPages = {
    'introduction': { 
        title: 'Introduction', 
        content: () => import('./content/getting-started/introduction.js').then(m => m.renderIntroduction()), 
        toc: [ { id: 'introduction', title: 'Introduction' }, { id: 'the-data-imperative', title: 'The Data Imperative' }, { id: 'the-lumen-solution', title: 'The Lumen Solution' } ]
    },
    'why-lumen': { 
        title: 'Why Lumen?', 
        content: () => import('./content/getting-started/why-lumen.js').then(m => m.renderWhyLumen()), 
        toc: [ { id: 'why-lumen', title: 'The Lumen Advantage' }, { id: 'for-developers', title: 'For Developers' }, { id: 'for-the-ai-ecosystem', title: 'For the AI Ecosystem' } ]
    },
    'installation': { 
        title: 'Installation', 
        content: () => import('./content/cli-guide/installation.js').then(m => m.renderInstallation()), 
        toc: [ { id: 'installation', title: 'Installation' }, { id: 'prerequisites', title: 'Prerequisites' }, { id: 'install-with-pip', title: 'Standard Installation' }, { id: 'verifying', title: 'Verifying' }, { id: 'troubleshooting', title: 'Troubleshooting' } ]
    },
    'authentication': { 
        title: 'Authentication', 
        content: () => import('./content/cli-guide/authentication.js').then(m => m.renderAuthentication()), 
        toc: [ { id: 'authentication', title: 'CLI Authentication' }, { id: 'the-process', title: 'The Device Authorization Flow' }, { id: 'token-security', title: 'Token Security' } ]
    },
    'core-commands': { 
        title: 'Core Commands', 
        content: () => import('./content/cli-guide/core-commands.js').then(m => m.renderCoreCommands()), 
        toc: [ { id: 'core-commands', title: 'Core Commands' }, { id: 'network-commands', title: 'Network Commands' }, { id: 'local-generation', title: 'Local Generation' }, { id: 'configuration', title: 'Configuration' } ]
    },
    'configuration': {
        title: 'Configuration',
        content: () => import('./content/cli-guide/configuration.js').then(m => m.renderConfiguration()),
        toc: [ { id: 'configuration', title: 'Customizing the CLI' }, { id: 'config-file-location', title: 'Config File Location' }, { id: 'default-configuration', title: 'Default Configuration' }, { id: 'key-settings', title: 'Customization Options' } ]
    },
    'contributing': { 
        title: 'Contributing Data', 
        content: () => import('./content/protocol/contributing.js').then(m => m.renderContributing()), 
        toc: [ { id: 'contributing-data', title: 'Contributing Data' }, { id: 'the-contribution-process', title: 'The Contribution Process' }, { id: 'what-to-contribute', title: 'What to Contribute' } ]
    },
    'valuation': { 
        title: 'The Valuation Engine', 
        content: () => import('./content/protocol/valuation.js').then(m => m.renderValuation()), 
        toc: [ { id: 'valuation-engine', title: 'The Valuation Engine' }, { id: 'phase-one-uniqueness', title: 'Phase 1: Uniqueness' }, { id: 'phase-two-quantitative-analysis', title: 'Phase 2: Quantitative Analysis' }, { id: 'phase-three-qualitative-analysis', title: 'Phase 3: Qualitative Analysis' }, { id: 'phase-four-reward-calculation', title: 'Phase 4: Reward Calculation' } ]
    },
    'security': { 
        title: 'Security', 
        content: () => import('./content/protocol/security.js').then(m => m.renderSecurity()), 
        toc: [ { id: 'security-by-design', title: 'Security by Design' }, { id: 'cli-security', title: 'CLI & Local-First Processing' }, { id: 'platform-security', title: 'Platform Security' }, { id: 'api-security', title: 'API Security' }, { id: 'on-chain-security', title: 'On-Chain Security' } ]
    },
    'tokenomics': { 
        title: 'Tokenomics', 
        content: () => import('./content/protocol/tokenomics.js').then(m => m.renderTokenomics()), 
        toc: [ { id: 'tokenomics', title: '$LUM Tokenomics' }, { id: 'core-utility', title: 'Core Utility' }, { id: 'deployment-on-solana', title: 'Deployment on Solana' }, { id: 'supply-and-emission', 'title': 'Supply & Emission' } ]
    },
    'governance': { 
        title: 'Governance', 
        content: () => import('./content/protocol/governance.js').then(m => m.renderGovernance()), 
        toc: [ { id: 'governance', title: 'Protocol Governance' }, { id: 'lumen-improvement-proposals', title: 'LIPs' }, { id: 'progressive-decentralization', title: 'Decentralization' } ]
    },
    'roadmap': { 
        title: 'Roadmap', 
        content: () => import('./content/community/roadmap.js').then(m => m.renderRoadmap()), 
        toc: [ { id: 'roadmap', title: 'Roadmap' } ]
    },
    'faq': { 
        title: 'FAQ', 
        content: () => import('./content/community/faq.js').then(m => m.renderFaq()), 
        toc: [ { id: 'faq', title: 'FAQ' }, { id: 'faq-security', title: 'Security & Privacy' }, { id: 'faq-rewards', title: 'Rewards & Value' } ]
    },
    'terms': {
        title: 'Terms and Conditions',
        content: () => import('./content/legal/terms.js').then(m => m.renderTermsAndConditions()),
        toc: [ { id: 'terms-and-conditions', title: 'Terms and Conditions' } ]
    },
    'privacy-policy': {
        title: 'Privacy Policy',
        content: () => import('./content/legal/privacy-policy.js').then(m => m.renderPrivacyPolicy()),
        toc: [ { id: 'privacy-policy', title: 'Privacy Policy' } ]
    },
    'contributor-agreement': {
        title: 'Contributor License Agreement',
        content: () => import('./content/legal/contributor-agreement.js').then(m => m.renderContributorAgreement()),
        toc: [ { id: 'contributor-license-agreement', title: 'Contributor License Agreement' } ]
    },
    'disclaimer': {
        title: 'Disclaimer',
        content: () => import('./content/legal/disclaimer.js').then(m => m.renderDisclaimer()),
        toc: [ { id: 'disclaimer', title: 'Disclaimer' } ]
    }
};

const orderedDocKeys = Object.keys(docPages);

function renderSidebarContent(activePage) {
    const navLink = (id, name) => {
        const isActive = id === activePage;
        return `
            <a href="/docs/${id}" class="block py-2 px-3 rounded-md text-sm transition-colors 
                ${isActive ? 'bg-primary font-bold text-accent-cyan' : 'text-text-secondary hover:bg-surface hover:text-text-main'}">
                ${name}
            </a>
        `;
    };

    return `
        <nav class="space-y-6">
            <div>
                <h4 class="px-3 text-xs font-bold uppercase text-subtle tracking-wider mb-2">Getting Started</h4>
                <div class="space-y-1">
                    ${navLink('introduction', 'Introduction')}
                    ${navLink('why-lumen', 'Why Lumen?')}
                </div>
            </div>
            <div>
                <h4 class="px-3 text-xs font-bold uppercase text-subtle tracking-wider mb-2">CLI Guide</h4>
                <div class="space-y-1">
                    ${navLink('installation', 'Installation')}
                    ${navLink('authentication', 'Authentication')}
                    ${navLink('core-commands', 'Core Commands')}
                    ${navLink('configuration', 'Configuration')}
                </div>
            </div>
             <div>
                <h4 class="px-3 text-xs font-bold uppercase text-subtle tracking-wider mb-2">Protocol</h4>
                <div class="space-y-1">
                    ${navLink('contributing', 'Contributing Data')}
                    ${navLink('valuation', 'The Valuation Engine')}
                    ${navLink('security', 'Security')}
                    ${navLink('tokenomics', 'Tokenomics')}
                    ${navLink('governance', 'Governance')}
                </div>
            </div>
            <div>
                <h4 class="px-3 text-xs font-bold uppercase text-subtle tracking-wider mb-2">Community & Ecosystem</h4>
                <div class="space-y-1">
                    ${navLink('roadmap', 'Roadmap')}
                    ${navLink('faq', 'FAQ')}
                </div>
            </div>
            <div>
                <h4 class="px-3 text-xs font-bold uppercase text-subtle tracking-wider mb-2">Legal</h4>
                <div class="space-y-1">
                    ${navLink('terms', 'Terms & Conditions')}
                    ${navLink('privacy-policy', 'Privacy Policy')}
                    ${navLink('contributor-agreement', 'Contributor Agreement')}
                    ${navLink('disclaimer', 'Disclaimer')}
                </div>
            </div>
        </nav>
    `;
}

function renderOnPageNavContent(pageId) {
    const toc = docPages[pageId]?.toc || [];
    if (toc.length <= 1) return '';

    return `
        <nav>
            <h4 class="text-sm font-bold text-text-main mb-4">On this page</h4>
            <ul class="space-y-2">
                ${toc.map(item => `
                    <li>
                        <a href="#${item.id}" class="block text-sm text-text-secondary hover:text-text-main transition-colors">${item.title}</a>
                    </li>
                `).join('')}
            </ul>
        </nav>
    `;
}

function renderMobileDocsNav(pageId, activePage) {
    const onPageContent = renderOnPageNavContent(pageId);
    const sidebarContent = renderSidebarContent(activePage);

    return `
        <div id="docs-mobile-overlay" class="fixed inset-0 bg-black/50 z-40 hidden lg:hidden" aria-hidden="true"></div>
        <div id="docs-mobile-panel" class="fixed top-0 left-0 w-64 h-full bg-background z-50 transform -translate-x-full transition-transform duration-300 ease-in-out lg:hidden">
            <div class="h-full overflow-y-auto p-6">
                <div class="flex justify-between items-center mb-6">
                    <span class="font-bold text-lg">Menu</span>
                    <button id="docs-mobile-close" type="button" class="p-2 text-text-secondary hover:text-text-main">
                        <span class="sr-only">Close menu</span>
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="space-y-8">
                    ${onPageContent}
                    <div>
                        <h4 class="text-sm font-bold text-text-main mb-4 ${onPageContent ? 'pt-8 border-t border-primary' : ''}">Browse Docs</h4>
                        ${sidebarContent}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDocsNavigationButtons(pageKey) {
    const currentIndex = orderedDocKeys.indexOf(pageKey);
    const prevKey = currentIndex > 0 ? orderedDocKeys[currentIndex - 1] : null;
    const nextKey = currentIndex < orderedDocKeys.length - 1 ? orderedDocKeys[currentIndex + 1] : null;

    const prevButton = prevKey ? `
        <a href="/docs/${prevKey}" class="group flex items-center gap-4 p-4 rounded-lg bg-surface border border-primary hover:border-subtle/80 transition-colors text-left">
            <svg class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="url(#dashboard-icon-gradient)" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
            <div>
                <p class="text-sm text-text-secondary">Previous</p>
                <p class="font-semibold text-text-main">${docPages[prevKey].title}</p>
            </div>
        </a>` : '<div></div>';

    const nextButton = nextKey ? `
        <a href="/docs/${nextKey}" class="group flex items-center justify-end gap-4 p-4 rounded-lg bg-surface border border-primary hover:border-subtle/80 transition-colors text-right">
             <div>
                <p class="text-sm text-text-secondary">Next</p>
                <p class="font-semibold text-text-main">${docPages[nextKey].title}</p>
            </div>
            <svg class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="url(#dashboard-icon-gradient)" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
        </a>` : '<div></div>';

    return `
        <div class="mt-16 pt-8 border-t border-primary/50 grid grid-cols-1 md:grid-cols-2 gap-4">
            ${prevButton}
            ${nextButton}
        </div>
    `;
}

export async function renderDocsLayout(pageId) {
    const pageKey = docPages[pageId] ? pageId : 'introduction';
    const page = docPages[pageKey];
    
    const contentHtml = await page.content();

    return `
        <main class="flex-grow bg-docs-gradient pt-28">
            <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;">
              <defs>
                <linearGradient id="dashboard-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color: #8A2BE2;" />
                  <stop offset="50%" style="stop-color: #FF69B4;" />
                  <stop offset="100%" style="stop-color: #00D9D9;" />
                </linearGradient>
              </defs>
            </svg>
            <div class="container mx-auto px-6">
                <div class="relative flex lg:gap-8">
                    <aside class="hidden lg:block w-64 flex-shrink-0 pr-8">
                        <div class="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-10 independent-scroll">
                            ${renderSidebarContent(pageKey)}
                        </div>
                    </aside>

                    <article class="flex-1 min-w-0 prose-custom py-10">
                        ${contentHtml}
                        ${renderDocsNavigationButtons(pageKey)}
                    </article>

                    <aside class="hidden xl:block w-64 flex-shrink-0 pl-8">
                        <div class="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-10 independent-scroll">
                            ${renderOnPageNavContent(pageKey)}
                        </div>
                    </aside>
                </div>
            </div>

            ${renderMobileDocsNav(pageKey, pageKey)}

            <div class="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
                <button id="docs-mobile-trigger" type="button" class="flex items-center gap-x-2 bg-surface text-text-main font-bold px-5 py-3 rounded-full border border-primary shadow-2xl shadow-black">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    Menu
                </button>
            </div>
        </main>
    `;
}