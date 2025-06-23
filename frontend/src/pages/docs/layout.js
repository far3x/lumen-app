const docPages = {
    'introduction': { title: 'Introduction', content: () => import('./content/introduction.js').then(m => m.renderIntroduction()), toc: [ { id: 'introduction', title: 'Introduction' }, { id: 'the-problem', title: 'The Problem' }, { id: 'the-solution', title: 'The Solution' } ]},
    'why-lumen': { title: 'Why Lumen?', content: () => import('./content/why-lumen.js').then(m => m.renderWhyLumen()), toc: [ { id: 'why-lumen', title: 'Why Lumen?' }, { id: 'for-developers', title: 'For Developers' }, { id: 'for-ai-companies', title: 'For AI Companies' } ]},
    'installation': { title: 'Installation', content: () => import('./content/installation.js').then(m => m.renderInstallation()), toc: [ { id: 'installation', title: 'Installation' }, { id: 'prerequisites', title: 'Prerequisites' }, { id: 'install-with-pip', title: 'Standard Installation' }, { id: 'verifying', title: 'Verifying' }, { id: 'troubleshooting', title: 'Troubleshooting' } ]},
    'authentication': { title: 'Authentication', content: () => import('./content/authentication.js').then(m => m.renderAuthentication()), toc: [ { id: 'authentication', title: 'Authentication' }, { id: 'the-process', title: 'The Process' }, { id: 'token-security', title: 'Token Security' } ]},
    'core-commands': { title: 'Core Commands', content: () => import('./content/core-commands.js').then(m => m.renderCoreCommands()), toc: [ { id: 'core-commands', title: 'Core Commands' }, { id: 'primary-commands', title: 'Primary Commands' }, { id: 'utility-commands', title: 'Utility Commands' } ]},
    'contributing': { title: 'Contributing Data', content: () => import('./content/contributing.js').then(m => m.renderContributing()), toc: [ { id: 'contributing-data', title: 'Contributing Data' }, { id: 'how-rewards-are-calculated', title: 'How Rewards Are Calculated' }, { id: 'contributing-updates-rewards-for-innovation', title: 'Contributing Updates' } ]},
    'configuration': { title: 'Configuration', content: () => import('./content/configuration.js').then(m => m.renderConfiguration()), toc: [ { id: 'configuration', title: 'Customizing the CLI' }, { id: 'default-configuration', title: 'Default Configuration' }, { id: 'key-settings', title: 'Customization Options' } ]},
    'security': { title: 'Security', content: () => import('./content/security.js').then(m => m.renderSecurity()), toc: [ { id: 'security', title: 'Security' }, { id: 'the-cardinal-rule', title: 'The Cardinal Rule' }, { id: 'radical-transparency-and-trust', title: 'Transparency and Trust' } ]},
    'tokenomics': { title: 'Tokenomics', content: () => import('./content/tokenomics.js').then(m => m.renderTokenomics()), toc: [ { id: 'tokenomics', title: 'Tokenomics' }, { id: 'core-token-utility', title: 'Core Utility' }, { id: 'supply-and-allocation', 'title': 'Supply & Allocation' }, { id: 'emission-schedule', title: 'Emission Schedule' } ]},
    'roadmap': { title: 'Roadmap', content: () => import('./content/roadmap.js').then(m => m.renderRoadmap()), toc: [ { id: 'roadmap', title: 'Roadmap' } ]},
    'governance': { title: 'Governance', content: () => import('./content/governance.js').then(m => m.renderGovernance()), toc: [ { id: 'governance', title: 'Governance' }, { id: 'lumen-improvement-proposals', title: 'LIPs' }, { id: 'progressive-decentralization', title: 'Decentralization' } ]},
    'faq': { title: 'FAQ', content: () => import('./content/faq.js').then(m => m.renderFaq()), toc: [ { id: 'faq', title: 'FAQ' }, { id: 'faq-security', title: 'Security & Privacy' }, { id: 'faq-rewards', title: 'Rewards & Value' } ]},
};

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
                    ${navLink('contributing', 'Contributing Data')}
                    ${navLink('configuration', 'Configuration')}
                </div>
            </div>
             <div>
                <h4 class="px-3 text-xs font-bold uppercase text-subtle tracking-wider mb-2">Protocol Deep Dive</h4>
                <div class="space-y-1">
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

export async function renderDocsLayout(pageId) {
    const pageKey = docPages[pageId] ? pageId : 'introduction';
    const page = docPages[pageKey];
    
    const contentHtml = await page.content();

    return `
        <main class="flex-grow bg-background pt-28">
            <div class="container mx-auto px-6">
                <div class="relative flex lg:gap-8">
                    <aside class="hidden lg:block w-64 flex-shrink-0 pr-8">
                        <div class="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-10">
                            ${renderSidebarContent(pageKey)}
                        </div>
                    </aside>

                    <article class="flex-1 min-w-0 prose-custom py-10">
                        ${contentHtml}
                    </article>

                    <aside class="hidden xl:block w-64 flex-shrink-0 pl-8">
                        <div class="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-10">
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