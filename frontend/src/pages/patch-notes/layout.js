export const patchNotes = {
    '2025_07_08': { 
        title: 'Backend Overhaul: Preparing for Hyperscale', 
        date: 'July 8, 2025',
        content: () => import('./content/2025_07_08.js').then(m => m.renderContent()) 
    },
    '2025_07_05': { 
        title: 'Announcing @lumencli on X & Brand Refresh', 
        date: 'July 5, 2025',
        content: () => import('./content/2025_07_05.js').then(m => m.renderContent()) 
    },
    '2025_07_02-3': { 
        title: 'Protocol Upgrade: Beta Program, Priority Queues & UX Polish', 
        date: 'July 3, 2025',
        content: () => import('./content/2025_07_02_3.js').then(m => m.renderContent()) 
    },
    '2025_07_02-2': { 
        title: 'Settings Page Redesign & UX Polish', 
        date: 'July 2, 2025',
        content: () => import('./content/2025_07_02_2.js').then(m => m.renderContent()) 
    },
    '2025_07_02-1': { 
        title: 'Security Hardening & Community Features', 
        date: 'July 2, 2025',
        content: () => import('./content/2025_07_02_1.js').then(m => m.renderContent()) 
    },
    '2025_07_01': { 
        title: 'The Data Hub Launch', 
        date: 'July 1, 2025',
        content: () => import('./content/2025_07_01.js').then(m => m.renderContent()) 
    },
};

function renderSidebar(activeNoteId) {
    return `
        <nav class="space-y-4">
            <div>
                <h4 class="px-3 text-xs font-bold uppercase text-subtle tracking-wider mb-2">Release History</h4>
                <div class="space-y-1">
                    ${Object.entries(patchNotes).map(([noteId, { title, date }]) => `
                        <a href="/patch-notes/${noteId}" class="block p-3 rounded-md transition-colors ${activeNoteId === noteId ? 'bg-primary' : 'hover:bg-surface'}">
                            <p class="font-bold ${activeNoteId === noteId ? 'text-accent-cyan' : 'text-text-main'}">${title}</p>
                            <p class="text-xs text-text-secondary">${date}</p>
                        </a>
                    `).join('')}
                </div>
            </div>
        </nav>
    `;
}

export async function renderPatchNotesLayout(noteId) {
    const noteKey = patchNotes[noteId] ? noteId : Object.keys(patchNotes)[0];
    const page = patchNotes[noteKey];
    
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
                            ${renderSidebar(noteKey)}
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