export const patchNotes = {
    '2025_08_14': { 
        title: 'The Pre-Launch & Beta Refinement Update', 
        date: 'August 14, 2025',
        content: () => import('./content/2025_08_14.js').then(m => m.renderContent()) 
    },
    '2025_08_07': { 
        title: 'The Genesis Update: A New Vision & A Wave of Enhancements', 
        date: 'August 7, 2025',
        content: () => import('./content/2025_08_07.js').then(m => m.renderContent()) 
    },
    '2025_07_24': { 
        title: 'The Visibility Update: Major SEO & Social Sharing Enhancements', 
        date: 'July 24, 2025',
        content: () => import('./content/2025_07_24.js').then(m => m.renderContent()) 
    },
    '2025_07_23': { 
        title: 'The Legal Framework & Docs Reorganization Update', 
        date: 'July 23, 2025',
        content: () => import('./content/2025_07_23.js').then(m => m.renderContent()) 
    },
    '2025_07_15': { 
        title: 'The Story of Lumen: A Complete Landing Page Redesign', 
        date: 'July 15, 2025',
        content: () => import('./content/2025_07_15.js').then(m => m.renderContent()) 
    },
    '2025_07_10': { 
        title: 'The Clarity Update: A Full Docs Redesign & UI Polish', 
        date: 'July 10, 2025',
        content: () => import('./content/2025_07_10.js').then(m => m.renderContent()) 
    },
    '2025_07_08': { 
        title: 'The Velocity Update: 15x Faster, Smarter & More Efficient', 
        date: 'July 8, 2025',
        content: () => import('./content/2025_07_08.js').then(m => m.renderContent()) 
    },
    '2025_07_05': { 
        title: 'Announcing @lumencli on X & Brand Refresh', 
        date: 'July 5, 2025',
        content: () => import('./content/2025_07_05.js').then(m => m.renderContent()) 
    },
    '2025_07_03': { 
        title: 'Protocol Upgrade: Beta Program, Priority Queues & UX Polish', 
        date: 'July 3, 2025',
        content: () => import('./content/2025_07_03.js').then(m => m.renderContent()) 
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

function renderMobileNav(activeNoteId) {
    return `
        <div id="patch-notes-mobile-overlay" class="fixed inset-0 bg-black/50 z-40 hidden lg:hidden" aria-hidden="true"></div>
        <div id="patch-notes-mobile-panel" class="fixed top-0 left-0 w-72 h-full bg-background z-50 transform -translate-x-full transition-transform duration-300 ease-in-out lg:hidden">
            <div class="h-full overflow-y-auto p-6">
                <div class="flex justify-between items-center mb-6">
                    <span class="font-bold text-lg">Releases</span>
                    <button id="patch-notes-mobile-close" type="button" class="p-2 text-text-secondary hover:text-text-main">
                        <span class="sr-only">Close menu</span>
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                ${renderSidebar(activeNoteId)}
            </div>
        </div>
    `;
}

function attachMobileNavListeners() {
    const trigger = document.getElementById('patch-notes-mobile-trigger');
    const panel = document.getElementById('patch-notes-mobile-panel');
    const overlay = document.getElementById('patch-notes-mobile-overlay');
    const closeBtn = document.getElementById('patch-notes-mobile-close');

    const toggleMenu = () => {
        if (panel && overlay) {
            panel.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        }
    };
    
    trigger?.addEventListener('click', toggleMenu);
    closeBtn?.addEventListener('click', toggleMenu);
    overlay?.addEventListener('click', toggleMenu);

    panel?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (panel && !panel.classList.contains('-translate-x-full')) {
                toggleMenu();
            }
        });
    });
}

export async function renderPatchNotesLayout(noteId) {
    const noteKey = patchNotes[noteId] ? noteId : Object.keys(patchNotes)[0];
    const page = patchNotes[noteKey];
    
    const contentHtml = await page.content();

    requestAnimationFrame(attachMobileNavListeners);

    return `
        <main class="flex-grow bg-docs-gradient pt-28">
            <div class="container mx-auto px-6">
                <div class="text-center mb-12">
                    <h1 class="text-5xl font-bold tracking-tighter pulse-text">Release Notes</h1>
                    <p class="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">See what's new, what's fixed, and what's next for the Lumen Protocol.</p>
                </div>
                <div class="relative flex lg:gap-8">
                    <aside class="hidden lg:block w-72 flex-shrink-0 pr-8">
                        <div class="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-10 independent-scroll">
                            ${renderSidebar(noteKey)}
                        </div>
                    </aside>

                    <article class="flex-1 min-w-0 prose-custom py-10 border-t border-l-0 lg:border-l lg:border-t-0 border-primary lg:pl-10">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-4 gap-2 sm:gap-4">
                            <h1 class="mt-0 mb-0" id="main-title">${page.title}</h1>
                            <span class="text-sm font-mono text-subtle shrink-0">${page.date}</span>
                        </div>
                        <div class="w-full h-px bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan opacity-40 mb-8"></div>
                        ${contentHtml}
                    </article>
                </div>
            </div>
            ${renderMobileNav(noteKey)}
            <div class="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
                <button id="patch-notes-mobile-trigger" type="button" class="flex items-center gap-x-2 bg-surface text-text-main font-bold px-5 py-3 rounded-full border border-primary shadow-2xl shadow-black">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    Menu
                </button>
            </div>
        </main>
    `;
}