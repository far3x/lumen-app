import { getUser, getCompany } from '../../lib/auth.js';

function renderFakeLineChart() {
    const points = "0,100 50,80 100,85 150,65 200,70 250,50 300,40 350,20 400,30 450,10";
    return `
        <div class="w-full h-full flex items-end">
            <svg viewBox="0 0 450 100" class="w-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#8A2BE2" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#8A2BE2" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <polyline
                    fill="url(#chartGradient)"
                    stroke="#8A2BE2"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    points="${points}"
                />
                <style>
                    polyline {
                        stroke-dasharray: 1000;
                        stroke-dashoffset: 1000;
                        animation: draw-chart 2s ease-out forwards;
                    }
                </style>
            </svg>
        </div>
    `;
}

function renderFakeBarChart() {
    const bars = [
        { label: 'Python', height: '80%' },
        { label: 'Rust', height: '60%' },
        { label: 'TypeScript', height: '70%' },
        { label: 'Go', height: '45%' },
        { label: 'C++', height: '30%' },
        { label: 'Other', height: '20%' },
    ];
    return `
        <div class="w-full h-full flex justify-around items-end gap-4 px-4">
            ${bars.map(bar => `
                <div class="flex-1 flex flex-col items-center gap-2">
                    <div class="w-full bg-app-bg rounded-t-md" style="height: ${bar.height};">
                         <div class="h-full w-full bg-accent-purple/70 rounded-t-md animate-grow-bar origin-bottom"></div>
                    </div>
                    <span class="text-xs text-app-text-tertiary">${bar.label}</span>
                </div>
            `).join('')}
        </div>
    `;
}

export function renderOverviewPage() {
    const user = getUser();
    const company = getCompany();

    const headerHtml = `
        <div class="flex-1">
            <h1 class="page-headline">Dashboard Overview</h1>
        </div>
        <div class="flex items-center gap-4">
             <div class="relative">
                <input type="search" placeholder="Search anything..." class="form-input !bg-app-bg w-64 pl-10">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                     <svg class="w-5 h-5 text-app-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
            <button class="p-2 rounded-full hover:bg-app-accent-hover text-app-text-tertiary hover:text-app-text-primary transition-colors">
                 <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 00-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
             <div class="h-8 w-px bg-app-border"></div>
             <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-accent-gradient text-white flex items-center justify-center font-bold text-sm">${user.full_name.charAt(0).toUpperCase()}</div>
                <span class="font-semibold text-app-text-primary text-sm">${user.full_name}</span>
             </div>
        </div>
    `;

    const pageHtml = `
        <div class="dashboard-container">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="widget-card p-6 md:col-span-2 lg:col-span-2">
                    <p class="text-sm font-medium text-app-text-secondary">Account Details</p>
                    <div class="mt-2 space-y-2 text-app-text-primary">
                        <p><strong>Name:</strong> ${user.full_name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Company:</strong> ${company.name}</p>
                        <p><strong>Role:</strong> <span class="capitalize">${user.role}</span></p>
                    </div>
                </div>
                <div class="widget-card p-6">
                    <p class="text-sm font-medium text-app-text-secondary">Current Plan</p>
                    <p class="text-3xl font-bold text-app-text-primary mt-2 capitalize">${company.plan || 'Free'}</p>
                </div>
                <div class="widget-card p-6">
                    <p class="text-sm font-medium text-app-text-secondary">Token Balance</p>
                    <p class="text-3xl font-bold text-app-text-primary mt-2">${company.token_balance.toLocaleString()}</p>
                </div>
            </div>
            
            <div class="widget-card mt-6">
                <div class="p-6">
                    <h2 class="text-lg font-semibold text-app-text-primary">Recent API Activity (Placeholder)</h2>
                </div>
                <table class="data-table">
                     <thead>
                        <tr><th>Request</th><th>API Key</th><th>Tokens</th><th>Timestamp</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><span class="font-mono text-green-600">POST</span> /v1/datasets/query</td><td>-</td><td>-</td><td>-</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return { pageHtml, headerHtml };
}