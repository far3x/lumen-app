import { getCompany } from '../../lib/auth.js';

export function renderPlansPage() {
    const company = getCompany();

    const headerHtml = `<h1 class="page-headline">Plans & Billing</h1>`;
    const pageHtml = `
        <div class="dashboard-container">
            <div class="widget-card p-6">
                <div class="grid md:grid-cols-3 gap-6 items-center">
                    <div>
                        <h2 class="text-lg font-semibold text-text-headings">Current Plan</h2>
                        <p class="text-5xl font-bold text-primary mt-2 capitalize">${company.plan}</p>
                    </div>
                    <div class="md:col-span-2">
                        <p class="text-sm font-medium text-text-muted">Token Balance</p>
                        <div class="flex items-center gap-4 mt-1">
                            <div class="w-full bg-app-bg rounded-full h-2.5">
                                <div class="bg-primary h-2.5 rounded-full" style="width: 0%"></div>
                            </div>
                            <span class="text-sm font-semibold text-text-headings whitespace-nowrap">0 / 10,000,000</span>
                        </div>
                        <p class="text-xs text-text-tertiary mt-2">Your balance resets on the 1st of each month. <a href="#" class="text-primary font-medium hover:underline">Upgrade</a> to increase your limit.</p>
                    </div>
                </div>
            </div>

            <div class="mt-8">
                <h2 class="text-xl font-bold text-text-headings mb-4">Available Plans</h2>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    <div class="widget-card p-6 flex flex-col hover:border-primary/50 transition-colors">
                        <h3 class="text-xl font-bold">Researcher</h3>
                        <p class="text-text-muted">For individuals & fine-tuning.</p>
                        <p class="my-4"><span class="text-4xl font-bold">$249</span><span class="text-text-muted">/mo</span></p>
                        <ul class="space-y-3 text-sm flex-grow mb-6">
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>10 Million Tokens/month</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>API Access</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Filter by Language & Tokens</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Usage Analytics</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Community Support</li>
                        </ul>
                        <a href="/contact" class="btn btn-secondary w-full mt-auto">Choose Plan</a>
                    </div>
                     <div class="widget-card p-6 border-2 border-primary relative flex flex-col">
                        <div class="absolute top-0 right-4 -mt-3 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">Most Popular</div>
                        <h3 class="text-xl font-bold">Startup</h3>
                        <p class="text-text-muted">For teams building AI products.</p>
                        <p class="my-4"><span class="text-4xl font-bold">$1,499</span><span class="text-text-muted">/mo</span></p>
                        <ul class="space-y-3 text-sm flex-grow mb-6">
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>75 Million Tokens/month</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Python & TypeScript SDKs</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Advanced Quality Filtering</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>90-day Historical Data</li>
                            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Priority Support</li>
                        </ul>
                        <button class="btn btn-primary w-full mt-auto">Upgrade to Startup</button>
                    </div>
                     <div class="widget-card p-6 flex flex-col hover:border-primary/50 transition-colors">
                        <h3 class="text-xl font-bold">Enterprise</h3>
                        <p class="text-text-muted">For foundation models.</p>
                        <p class="my-4"><span class="text-4xl font-bold">Custom</span></p>
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

            <div class="mt-8">
                <h2 class="text-xl font-bold text-text-headings mb-4">Billing History</h2>
                <div class="widget-card">
                    <table class="data-table">
                        <thead><tr><th>Date</th><th>Invoice ID</th><th>Amount</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                            <tr>
                                <td colspan="5" class="text-center p-12 text-text-muted">
                                    <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p class="mt-4 font-semibold text-text-headings">No billing history</p>
                                    <p class="text-sm">Your invoices will appear here once you subscribe to a plan.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    return { pageHtml, headerHtml };
}