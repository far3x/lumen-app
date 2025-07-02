const patchNotes = {
    'v1.0.2': { 
        title: 'Security Hardening & Community Features', 
        date: 'July 3, 2025',
        content: () => import('./content/v1_0_2.js').then(m => m.renderContent()) 
    },
    'v1.0.1': { 
        title: 'The Data Hub Launch', 
        date: 'July 2, 2025',
        content: () => import('./content/v1_0_1.js').then(m => m.renderContent()) 
    },
};

function renderSidebar(activeVersion) {
    return `
        <nav class="space-y-4">
            <div>
                <h4 class="px-3 text-xs font-bold uppercase text-subtle tracking-wider mb-2">Release History</h4>
                <div class="space-y-1">
                    ${Object.entries(patchNotes).map(([version, { title, date }]) => `
                        <a href="/patch-notes/${version}" class="block p-3 rounded-md transition-colors ${activeVersion === version ? 'bg-primary' : 'hover:bg-surface'}">
                            <p class="font-bold ${activeVersion === version ? 'text-accent-cyan' : 'text-text-main'}">${title}</p>
                            <p class="text-xs text-text-secondary">${version} - ${date}</p>
                        </a>
                    `).join('')}
                </div>
            </div>
        </nav>
    `;
}

export async function renderPatchNotesLayout(version) {
    const versionKey = patchNotes[version] ? version : Object.keys(patchNotes)[0];
    const page = patchNotes[versionKey];
    
    const contentHtml = await page.content();

    return `
        <main class="flex-grow bg-abyss-dark pt-28">
            <div class="container mx-auto px-6">
                <div class="text-center mb-12">
                    <h1 class="text-5xl font-bold tracking-tighter pulse-text">Release Notes</h1>
                    <p class="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">See what's new, what's fixed, and what's next for the Lumen Protocol.</p>
                </div>
                <div class="relative flex lg:gap-8">
                    <aside class="hidden lg:block w-72 flex-shrink-0 pr-8">
                        <div class="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-10">
                            ${renderSidebar(versionKey)}
                        </div>
                    </aside>

                    <article class="flex-1 min-w-0 prose-custom py-10 border-t border-l-0 lg:border-l lg:border-t-0 border-primary lg:pl-10">
                        <div class="flex justify-between items-baseline mb-4">
                            <h1 class="mt-0 mb-0" id="main-title">${page.title}</h1>
                            <span class="text-sm font-mono text-subtle">${page.date}</span>
                        </div>
                        <div class="w-full h-px bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan opacity-40 mb-8"></div>
                        ${contentHtml}
                    </article>
                </div>
            </div>
        </main>
    `;
}