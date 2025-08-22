export function attachUsageListeners() {
    const tabs = document.querySelectorAll('.usage-tab-btn');
    const views = document.querySelectorAll('.usage-view');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('border-accent-purple', 'text-app-text-primary'));
            tab.classList.add('border-accent-purple', 'text-app-text-primary');

            views.forEach(view => view.classList.add('hidden'));
            document.getElementById(tab.dataset.view).classList.remove('hidden');
        });
    });
}

export function renderUsagePage() {
    const headerHtml = `<h1 class="page-headline">Usage & Billing</h1>`;
    const pageHtml = `
        <div class="dashboard-container">
            <div class="border-b border-app-border mb-6">
                <nav class="flex space-x-6">
                    <button data-view="usage-view" class="usage-tab-btn pb-3 border-b-2 border-accent-purple text-app-text-primary font-semibold">Current Usage</button>
                    <button data-view="billing-view" class="usage-tab-btn pb-3 border-b-2 border-transparent text-app-text-secondary hover:text-app-text-primary">Billing History</button>
                    <button data-view="plan-view" class="usage-tab-btn pb-3 border-b-2 border-transparent text-app-text-secondary hover:text-app-text-primary">Manage Plan</button>
                </nav>
            </div>
            <div id="usage-view" class="usage-view">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="widget-card p-6">
                        <h2 class="text-lg font-semibold text-app-text-primary">Usage by Day (Last 30 Days)</h2>
                        <div class="h-64 mt-4 bg-app-bg rounded-lg flex items-center justify-center"><p class="text-app-text-tertiary">[Line Chart Placeholder]</p></div>
                    </div>
                     <div class="widget-card p-6">
                        <h2 class="text-lg font-semibold text-app-text-primary">Usage by API Key</h2>
                        <div class="h-64 mt-4 bg-app-bg rounded-lg flex items-center justify-center"><p class="text-app-text-tertiary">[Doughnut Chart Placeholder]</p></div>
                    </div>
                    <div class="widget-card p-6 lg:col-span-2">
                        <h2 class="text-lg font-semibold text-app-text-primary">Usage by Data Type</h2>
                        <div class="h-64 mt-4 bg-app-bg rounded-lg flex items-center justify-center"><p class="text-app-text-tertiary">[Bar Chart Placeholder]</p></div>
                    </div>
                </div>
            </div>
            <div id="billing-view" class="usage-view hidden">
                 <div class="widget-card">
                    <table class="data-table">
                        <thead><tr><th>Date</th><th>Invoice ID</th><th>Amount</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                            <tr><td>Jul 1, 2025</td><td>INV-2025-003</td><td>$1,499.00</td><td><span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Paid</span></td><td><a href="#" class="text-accent-purple font-semibold">Download</a></td></tr>
                            <tr><td>Jun 1, 2025</td><td>INV-2025-002</td><td>$1,499.00</td><td><span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Paid</span></td><td><a href="#" class="text-accent-purple font-semibold">Download</a></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
             <div id="plan-view" class="usage-view hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    <div class="widget-card p-6 flex flex-col">
                        <h3 class="text-xl font-bold">Researcher</h3>
                        <p class="text-app-text-secondary">For individuals & fine-tuning.</p>
                        <p class="my-4"><span class="text-4xl font-bold">$249</span><span class="text-app-text-secondary">/mo</span></p>
                        <ul class="space-y-3 text-sm flex-grow mb-6">
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>10 Million Tokens/month</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>API Access</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Filter by Language & Tokens</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Usage Analytics</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Community Support</li>
                        </ul>
                        <a href="/contact" class="btn btn-secondary w-full mt-auto">Choose Plan</a>
                    </div>
                     <div class="widget-card p-6 border-2 border-accent-purple relative flex flex-col">
                        <div class="absolute top-0 right-4 -mt-3 px-3 py-1 bg-accent-purple text-white text-xs font-bold rounded-full">Current Plan</div>
                        <h3 class="text-xl font-bold">Startup</h3>
                        <p class="text-app-text-secondary">For teams building AI products.</p>
                        <p class="my-4"><span class="text-4xl font-bold">$1,499</span><span class="text-app-text-secondary">/mo</span></p>
                        <ul class="space-y-3 text-sm flex-grow mb-6">
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>75 Million Tokens/month</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Python & TypeScript SDKs</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Advanced Quality Filtering</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>90-day Historical Data</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Priority Support</li>
                        </ul>
                        <button class="btn btn-secondary w-full mt-auto" disabled>Current Plan</button>
                    </div>
                     <div class="widget-card p-6 flex flex-col">
                        <h3 class="text-xl font-bold">Enterprise</h3>
                        <p class="text-app-text-secondary">For foundation models.</p>
                        <p class="my-4"><span class="text-4xl font-bold">$25,000+</span><span class="text-app-text-secondary">/mo</span></p>
                        <ul class="space-y-3 text-sm flex-grow mb-6">
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Unlimited Token Volume</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Dedicated API Endpoints</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Full Historical Data Access</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Bespoke Dataset Curation</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Dedicated Solutions Architect</li>
                        </ul>
                         <a href="/contact" class="btn btn-secondary w-full mt-auto">Contact Sales</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    return { pageHtml, headerHtml };
}