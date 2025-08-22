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
             <button class="flex items-center gap-2">
                <img src="https://i.pravatar.cc/40?img=1" alt="User Avatar" class="w-8 h-8 rounded-full">
                <svg class="w-4 h-4 text-app-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
             </button>
        </div>
    `;

    const pageHtml = `
        <div class="dashboard-container">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="widget-card p-6">
                    <p class="text-sm font-medium text-app-text-secondary">Tokens Consumed (This Month)</p>
                    <p class="text-3xl font-bold text-app-text-primary mt-2">12.7M / 75M</p>
                </div>
                <div class="widget-card p-6">
                    <p class="text-sm font-medium text-app-text-secondary">Active API Keys</p>
                    <p class="text-3xl font-bold text-app-text-primary mt-2">3</p>
                </div>
                <div class="widget-card p-6">
                    <p class="text-sm font-medium text-app-text-secondary">Team Members</p>
                    <p class="text-3xl font-bold text-app-text-primary mt-2">5</p>
                </div>
                <div class="widget-card p-6">
                    <p class="text-sm font-medium text-app-text-secondary">Current Plan</p>
                    <p class="text-3xl font-bold text-app-text-primary mt-2">Startup Plan</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div class="lg:col-span-2 widget-card">
                    <div class="p-6">
                        <h2 class="text-lg font-semibold text-app-text-primary">Token Usage: Last 30 Days</h2>
                        <div class="h-80 mt-4 rounded-lg">
                            ${renderFakeLineChart()}
                        </div>
                    </div>
                </div>
                <div class="widget-card">
                     <div class="p-6">
                        <h2 class="text-lg font-semibold text-app-text-primary">Usage by Language</h2>
                        <div class="h-80 mt-4 rounded-lg">
                            ${renderFakeBarChart()}
                        </div>
                    </div>
                </div>
            </div>

            <div class="widget-card mt-6">
                <div class="p-6">
                    <h2 class="text-lg font-semibold text-app-text-primary">Recent API Activity</h2>
                </div>
                <table class="data-table">
                     <thead>
                        <tr>
                            <th>Request</th>
                            <th>API Key</th>
                            <th>Tokens</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td><span class="font-mono text-green-600">POST</span> /v1/datasets/query</td><td>Production V2</td><td>-1.2M</td><td>2 min ago</td></tr>
                        <tr><td><span class="font-mono text-green-600">POST</span> /v1/datasets/query</td><td>Staging Env</td><td>-450k</td><td>15 min ago</td></tr>
                        <tr><td><span class="font-mono text-blue-600">GET</span> /v1/datasets/stats</td><td>Production V2</td><td>-100</td><td>1 hour ago</td></tr>
                        <tr><td><span class="font-mono text-green-600">POST</span> /v1/datasets/query</td><td>Production V2</td><td>-2.1M</td><td>3 hours ago</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return { pageHtml, headerHtml };
}