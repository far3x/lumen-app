import { getUser, getCompany, logout } from '../lib/auth.js';

const sidebarItems = [
    { name: 'Overview', href: '/app/overview', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>` },
    { name: 'Data Explorer', href: '/app/data-explorer', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>` },
    { name: 'API Keys', href: '/app/api-keys', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7h3a5 5 0 015 5 5 5 0 01-5 5h-3m-6 0H6a5 5 0 01-5-5 5 5 0 015-5h3.172a2 2 0 011.414.586l.828.828a2 2 0 001.414.586H15M9 12h6" /></svg>` },
    { name: 'Plans & Billing', href: '/app/plans', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>` },
    { name: 'Team', href: '/app/team', icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>` }
];

export function renderSidebar() {
    const user = getUser();
    const company = getCompany();

    setTimeout(() => {
        document.getElementById('logout-btn')?.addEventListener('click', logout);
    }, 0);

    return `
        <div class="flex flex-col h-full p-3">
            <div class="flex-shrink-0">
                 <a href="/" class="flex items-center gap-2 mb-6 px-2">
                    <img src="/logo.png" alt="Lumen Logo" class="h-8 w-8">
                    <span class="font-bold text-xl text-text-headings">Lumen</span>
                </a>
                <button class="w-full flex items-center justify-between text-left p-2 rounded-lg bg-app-bg border border-app-border hover:border-gray-300 transition-colors">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-md bg-primary text-white flex items-center justify-center font-bold text-sm">
                            ${company.name.charAt(0).toUpperCase()}
                        </div>
                        <span class="font-semibold text-text-headings text-sm">${company.name}</span>
                    </div>
                </button>
            </div>
            
            <nav class="flex-1 mt-6">
                <ul class="space-y-1">
                    ${sidebarItems.map(item => `
                        <li>
                            <a href="${item.href}" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md text-text-body hover:bg-app-accent-hover hover:text-text-headings font-medium transition-colors text-sm">
                                <span class="text-text-muted">${item.icon}</span>
                                <span>${item.name}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </nav>

            <div class="flex-shrink-0 mt-auto">
                 <div class="border-t border-app-border pt-3 mt-3">
                    <a href="/app/settings" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md text-text-body hover:bg-app-accent-hover hover:text-text-headings font-medium transition-colors text-sm">
                        <div class="w-7 h-7 rounded-full bg-accent-gradient text-white flex items-center justify-center font-bold text-xs">${user.full_name.charAt(0).toUpperCase()}</div>
                        <div class="flex-1 truncate">
                            <p class="font-semibold text-text-headings text-sm truncate">${user.full_name}</p>
                            <p class="text-text-muted text-xs truncate">${user.email}</p>
                        </div>
                    </a>
                    <button id="logout-btn" class="w-full mt-2 sidebar-link flex items-center gap-3 px-3 py-2 rounded-md text-text-body hover:bg-app-accent-hover hover:text-text-headings font-medium transition-colors text-sm">
                        <span class="text-text-muted"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></span>
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}