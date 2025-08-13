export const docPages = {
    'introduction': { 
        title: 'Introduction: The Data Layer for Intelligent AI', 
        content: () => import('./content/getting-started/introduction.js').then(m => m.renderIntroduction()), 
        toc: [
            { id: 'introduction', title: 'Introduction' },
            { id: 'the-data-crisis', title: 'The Data Crisis' },
            { id: 'the-untapped-reservoir', title: 'The Untapped Reservoir' },
            { id: 'lumen-the-strategic-solution', title: 'The Strategic Solution' },
            { id: 'the-vision', title: 'The Vision' }
        ]
    },
    'why-lumen': { 
        title: 'The Lumen Advantage', 
        content: () => import('./content/getting-started/why-lumen.js').then(m => m.renderWhyLumen()), 
        toc: [
            { id: 'the-lumen-advantage', title: 'The Lumen Advantage' },
            { id: 'for-developers', title: 'For Developers' },
            { id: 'for-data-consumers', title: 'For Data Consumers' }
        ]
    },
    'installation': { 
        title: 'Installation', 
        content: () => import('./content/cli-guide/installation.js').then(m => m.renderInstallation()), 
        toc: [
            { id: 'installation', title: 'Installation' },
            { id: 'prerequisites', title: 'Prerequisites' },
            { id: 'install-with-pip', title: 'Standard Installation' },
            { id: 'verifying', title: 'Verifying Installation' },
            { id: 'troubleshooting', title: 'Troubleshooting' }
        ]
    },
    'authentication': { 
        title: 'Authentication', 
        content: () => import('./content/cli-guide/authentication.js').then(m => m.renderAuthentication()), 
        toc: [
            { id: 'authentication', title: 'CLI Authentication' },
            { id: 'the-process', title: 'The Device Authorization Flow' },
            { id: 'token-security', title: 'Token Security' }
        ]
    },
    'core-commands': { 
        title: 'Core Commands', 
        content: () => import('./content/cli-guide/core-commands.js').then(m => m.renderCoreCommands()), 
        toc: [
            { id: 'core-commands', title: 'Core Commands' },
            { id: 'network-commands', title: 'Network Commands' },
            { id: 'local-generation', title: 'Local Prompt Generation' },
            { id: 'configuration', title: 'Configuration' }
        ]
    },
    'configuration': {
        title: 'Configuration',
        content: () => import('./content/cli-guide/configuration.js').then(m => m.renderConfiguration()),
        toc: [
            { id: 'configuration', title: 'Customizing the CLI' },
            { id: 'config-file-location', title: 'Config File Location' },
            { id: 'default-configuration', title: 'Default Configuration' },
            { id: 'key-settings', title: 'Customization Options' }
        ]
    },
    'contributing': { 
        title: 'Contributing Data', 
        content: () => import('./content/protocol/contributing.js').then(m => m.renderContributing()), 
        toc: [
            { id: 'contributing-data', title: 'Contributing Data' },
            { id: 'the-contribution-process', title: 'The Contribution Process' },
            { id: 'contribution-guidelines', title: 'Contribution Guidelines' },
            { id: 'what-to-contribute', title: 'What to Contribute' }
        ]
    },
    'valuation': { 
        title: 'The Valuation Engine', 
        content: () => import('./content/protocol/valuation.js').then(m => m.renderValuation()), 
        toc: [
            { id: 'valuation-engine', title: 'The Valuation Engine' },
            { id: 'phase-one-uniqueness', title: 'Phase 1: Uniqueness' },
            { id: 'phase-two-quantitative-analysis', title: 'Phase 2: Quantitative Analysis' },
            { id: 'phase-three-qualitative-analysis', title: 'Phase 3: Qualitative Analysis' },
            { id: 'phase-four-reward-calculation', title: 'Phase 4: Reward Calculation' }
        ]
    },
    'security': { 
        title: 'Security', 
        content: () => import('./content/protocol/security.js').then(m => m.renderSecurity()), 
        toc: [
            { id: 'security-by-design', title: 'Security by Design' },
            { id: 'cli-security', title: 'CLI & Local-First Processing' },
            { id: 'platform-security', title: 'Platform Security' },
            { id: 'api-security', title: 'API Security' },
            { id: 'on-chain-security', title: 'On-Chain Security' }
        ]
    },
    'tokenomics': { 
        title: 'Protocol Economy', 
        content: () => import('./content/protocol/tokenomics.js').then(m => m.renderTokenomics()), 
        toc: [
            { id: 'protocol-economy', title: 'The Protocol Economy' },
            { id: 'rewards-mechanism', title: 'The Rewards Mechanism' },
            { id: 'economic-loop', title: 'The Economic Loop' }
        ]
    },
    'governance': { 
        title: 'Governance', 
        content: () => import('./content/protocol/governance.js').then(m => m.renderGovernance()), 
        toc: [
            { id: 'governance', title: 'Protocol Governance' },
            { id: 'lumen-improvement-proposals', title: 'LIPs' },
            { id: 'areas-of-governance', title: 'Areas of Governance' },
            { id: 'progressive-decentralization', title: 'Progressive Decentralization' }
        ]
    },
    'whitepaper': { 
        title: 'Whitepaper: The Data Layer for the AI Revolution', 
        content: () => import('./content/protocol/whitepaper.js').then(m => m.renderWhitepaper()), 
        toc: [ 
            { id: 'abstract', title: 'Abstract' }, 
            { id: 'chapter-1', title: 'Chapter 1: The Data Quality Crisis' }, 
            { id: 'chapter-2', title: 'Chapter 2: The Lumen Solution' },
            { id: 'chapter-3', title: 'Chapter 3: The Technology Stack' },
            { id: 'chapter-4', title: 'Chapter 4: Business Model' },
            { id: 'chapter-5', title: 'Chapter 5: The Vision' }
        ]
    },
    'roadmap': { 
        title: 'Roadmap & Vision', 
        content: () => import('./content/community/roadmap.js').then(m => m.renderRoadmap()), 
        toc: [
            { id: 'roadmap-and-vision', title: 'Roadmap & Vision' },
            { id: 'phase-one', title: 'Phase 1: Launch & Validation' },
            { id: 'phase-two', title: 'Phase 2: Scale & Ecosystem' },
            { id: 'the-lumen-agent', title: 'Phase 3: The Lumen Agent' }
        ]
    },
    'faq': { 
        title: 'FAQ', 
        content: () => import('./content/community/faq.js').then(m => m.renderFaq()), 
        toc: [
            { id: 'faq', title: 'FAQ' },
            { id: 'faq-general', title: 'Fundamental Questions' },
            { id: 'faq-rewards', title: 'Rewards & Value' },
            { id: 'faq-security', title: 'Security & Privacy' }
        ]
    },
    'terms': {
        title: 'Terms and Conditions',
        content: () => import('./content/legal/terms.js').then(m => m.renderTermsAndConditions()),
        toc: [
            { id: 'agreement', title: '1. Agreement to Terms' },
            { id: 'services', title: '2. Our Services' },
            { id: 'ip', title: '3. Intellectual Property' },
            { id: 'userreps', title: '4. User Representations' },
            { id: 'userreg', title: '5. User Registration' },
            { id: 'prohibited', title: '6. Prohibited Activities' },
            { id: 'contributions', title: '7. Contributions' },
            { id: 'license', title: '8. Contribution License' },
            { id: 'sitemanage', title: '9. Services Management' },
            { id: 'privacy', title: '10. Privacy Policy' },
            { id: 'termination', title: '11. Term and Termination' },
            { id: 'modifications', title: '12. Modifications' },
            { id: 'law', title: '13. Governing Law' },
            { id: 'disputes', title: '14. Dispute Resolution' },
            { id: 'disclaimer', title: '15. Disclaimer' },
            { id: 'liability', title: '16. Liability Limitations' },
            { id: 'indemnification', title: '17. Indemnification' },
            { id: 'userdata', title: '18. User Data' },
            { id: 'protocol-terms', title: '19. Protocol-Specific Terms' },
            { id: 'contact', title: '20. Contact Us' }
        ]
    },
    'privacy-policy': {
        title: 'Privacy Policy',
        content: () => import('./content/legal/privacy-policy.js').then(m => m.renderPrivacyPolicy()),
        toc: [
            { id: 'what-info', title: '1. What We Collect' },
            { id: 'how-info', title: '2. How We Process' },
            { id: 'legal-bases', title: '3. Legal Bases' },
            { id: 'share-info', title: '4. When We Share' },
            { id: 'cookies', title: '5. Cookies' },
            { id: 'keep-info', title: '6. How Long We Keep' },
            { id: 'safe-info', title: '7. How We Keep Safe' },
            { id: 'minors-info', title: '8. Minors' },
            { id: 'rights-info', title: '9. Your Rights' },
            { id: 'dnt', title: '10. DNT Features' },
            { id: 'california-rights', title: '11. California Rights' },
            { id: 'updates-info', title: '12. Updates' },
            { id: 'contact-info', title: '13. Contact Us' }
        ]
    },
    'contributor-agreement': {
        title: 'Contributor License Agreement',
        content: () => import('./content/legal/contributor-agreement.js').then(m => m.renderContributorAgreement()),
        toc: [
            { id: 'definitions', title: '1. Definitions' },
            { id: 'grant-of-copyright-license', title: '2. Copyright License' },
            { id: 'grant-of-patent-license', title: '3. Patent License' },
            { id: 'your-representations-and-warranties', title: '4. Your Representations' },
            { id: 'no-obligation', title: '5. Our Rights' },
            { id: 'no-support-obligation', title: '6. No Support Obligation' }
        ]
    },
    'disclaimer': {
        title: 'Disclaimer',
        content: () => import('./content/legal/disclaimer.js').then(m => m.renderDisclaimer()),
        toc: [
            { id: 'no-financial-advice', title: 'No Financial Advice' },
            { id: 'cryptocurrency-and-token-risks', title: 'Token Risks' },
            { id: 'as-is-service', title: 'As Is Service' },
            { id: 'external-links-disclaimer', title: 'External Links' },
            { id: 'personal-responsibility', title: 'Personal Responsibility' }
        ]
    }
};

const orderedDocKeys = Object.keys(docPages);

const getDocPath = (id) => {
    if (window.location.hostname.startsWith('docs.')) {
        return `/${id}`;
    }
    return `/docs/${id}`;
};

function renderSidebarContent(activePage) {
    const navLink = (id, name) => {
        const isActive = id === activePage;
        return `
            <a href="${getDocPath(id)}" class="block py-2 px-3 rounded-md text-sm transition-colors 
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
                    ${navLink('tokenomics', 'Protocol Economy')}
                    ${navLink('governance', 'Governance')}
                    ${navLink('whitepaper', 'Whitepaper')}
                </div>
            </div>
            <div>
                <h4 class="px-3 text-xs font-bold uppercase text-subtle tracking-wider mb-2">Community & Ecosystem</h4>
                <div class="space-y-1">
                    ${navLink('roadmap', 'Roadmap & Vision')}
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
        <a href="${getDocPath(prevKey)}" class="group flex items-center gap-4 p-4 rounded-lg bg-surface border border-primary hover:border-subtle/80 transition-colors text-left">
            <svg class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="url(#dashboard-icon-gradient)" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
            <div class="flex-grow min-w-0">
                <p class="truncate text-sm"><span class="text-text-secondary">Previous:</span> <span class="font-semibold text-text-main">${docPages[prevKey].title}</span></p>
            </div>
        </a>` : '<div></div>';

    const nextButton = nextKey ? `
        <a href="${getDocPath(nextKey)}" class="group flex items-center justify-end gap-4 p-4 rounded-lg bg-surface border border-primary hover:border-subtle/80 transition-colors text-right">
             <div class="flex-grow min-w-0">
                <p class="truncate text-sm"><span class="text-text-secondary">Next:</span> <span class="font-semibold text-text-main">${docPages[nextKey].title}</span></p>
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