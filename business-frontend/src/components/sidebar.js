const sidebarItems = [
    { name: 'Dashboard', href: '/app/overview', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>` },
    { name: 'Data Explorer', href: '/app/data-explorer', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>` },
    { name: 'API Keys', href: '/app/api-keys', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7h3a5 5 0 015 5 5 5 0 01-5 5h-3m-6 0H6a5 5 0 01-5-5 5 5 0 015-5h3.172a2 2 0 011.414.586l.828.828a2 2 0 001.414.586H15M9 12h6" /></svg>` },
    { name: 'Usage & Billing', href: '/app/usage', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>` },
    { name: 'Team', href: '/app/team', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>` }
];

const accountItems = [
    { name: 'Settings', href: '/app/settings', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`}
];

const resourceItems = [
     { name: 'Documentation', href: '/docs', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`},
     { name: 'Support', href: '/contact', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`}
]

export function renderSidebar() {
    return `
        <div class="flex flex-col h-full p-4">
            <div class="flex-shrink-0">
                 <a href="/" class="flex items-center gap-2 mb-8 px-2">
                    <img src="/logo.png" alt="Lumen Logo" class="h-8 w-8">
                    <span class="font-bold text-xl text-app-text-primary">Lumen</span>
                </a>
                <button class="w-full flex items-center justify-between text-left p-2 rounded-lg bg-app-bg border border-app-border hover:border-gray-300 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-accent-gradient text-white flex items-center justify-center font-bold text-sm">AC</div>
                        <span class="font-semibold text-app-text-primary text-sm">Acme Corp.</span>
                    </div>
                    <svg class="w-4 h-4 text-app-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                </button>
            </div>
            
            <nav class="flex-1 mt-6">
                <p class="px-2 text-xs font-semibold text-app-text-tertiary uppercase tracking-wider mb-2">Main</p>
                <ul class="space-y-1">
                    ${sidebarItems.map(item => `
                        <li>
                            <a href="${item.href}" class="sidebar-link flex items-center gap-3 p-2 rounded-lg text-app-text-secondary hover:bg-app-accent-hover hover:text-app-text-primary font-medium transition-colors">
                                ${item.icon}
                                <span>${item.name}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>

                <p class="px-2 text-xs font-semibold text-app-text-tertiary uppercase tracking-wider mt-6 mb-2">Account</p>
                <ul class="space-y-1">
                    ${accountItems.map(item => `
                        <li>
                            <a href="${item.href}" class="sidebar-link flex items-center gap-3 p-2 rounded-lg text-app-text-secondary hover:bg-app-accent-hover hover:text-app-text-primary font-medium transition-colors">
                                ${item.icon}
                                <span>${item.name}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </nav>

            <div class="flex-shrink-0 mt-auto">
                <ul class="space-y-1 border-t border-app-border pt-4">
                     ${resourceItems.map(item => `
                        <li>
                            <a href="${item.href}" class="sidebar-link flex items-center gap-3 p-2 rounded-lg text-app-text-secondary hover:bg-app-accent-hover hover:text-app-text-primary font-medium transition-colors">
                                ${item.icon}
                                <span>${item.name}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;
}