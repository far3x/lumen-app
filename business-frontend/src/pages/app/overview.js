import { getUser, getCompany } from '../../lib/auth.js';

export function renderOverviewPage() {
    const user = getUser();
    const company = getCompany();

    const headerHtml = `
        <div class="flex-1">
            <h1 class="page-headline">Dashboard Overview</h1>
        </div>
        <div class="flex items-center gap-4">
             <div class="hidden md:block relative">
                <input type="search" placeholder="Search..." class="form-input !bg-app-bg w-64 pl-10">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                     <svg class="w-5 h-5 text-app-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
             <div class="h-8 w-px bg-app-border hidden md:block"></div>
             <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-accent-gradient text-white flex items-center justify-center font-bold text-sm">${user.full_name.charAt(0).toUpperCase()}</div>
                <div class="text-sm">
                    <p class="font-semibold text-app-text-primary">${user.full_name}</p>
                    <p class="text-app-text-tertiary">${company.name}</p>
                </div>
             </div>
        </div>
    `;

    const pageHtml = `
        <div class="dashboard-container">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div class="widget-card p-6">
                    <p class="text-sm font-medium text-app-text-secondary">Current Plan</p>
                    <p class="text-3xl font-bold text-app-text-primary mt-2 capitalize">${company.plan || 'Free'}</p>
                </div>
                <div class="widget-card p-6">
                    <p class="text-sm font-medium text-app-text-secondary">Token Balance</p>
                    <p id="company-token-balance" class="text-3xl font-bold text-app-text-primary mt-2">${company.token_balance.toLocaleString()}</p>
                </div>
                <div class="widget-card p-6">
                    <p class="text-sm font-medium text-app-text-secondary">Team Members</p>
                    <p class="text-3xl font-bold text-app-text-primary mt-2">1</p>
                </div>
                <div class="widget-card p-6">
                    <p class="text-sm font-medium text-app-text-secondary">Active API Keys</p>
                    <p class="text-3xl font-bold text-app-text-primary mt-2">0</p>
                </div>
            </div>
            
            <div class="widget-card mt-6">
                <div class="p-6">
                    <h2 class="text-lg font-semibold text-app-text-primary">Recent Activity</h2>
                </div>
                <div class="p-6 text-center text-app-text-secondary">
                    <p>Activity feed is under construction.</p>
                </div>
            </div>
        </div>
    `;

    return { pageHtml, headerHtml };
}