import { getCompany } from '../../lib/auth.js';
import api from '../../lib/api.js';

const PLAN_DATA = {
    free: { name: 'Free', token_limit: 0 },
    researcher: { name: 'Researcher', token_limit: 10000000 },
    startup: { name: 'Startup', token_limit: 75000000 },
    enterprise: { name: 'Enterprise', token_limit: Infinity }
};

let billingHistory = [];
let isLoadingHistory = true;

export function renderPlansPage() {
    const company = getCompany();

    const headerHtml = `<h1 class="page-headline">Plans & Billing</h1>`;
    const pageHtml = `
        <div class="dashboard-container">
            <div id="plan-summary-card" class="widget-card p-6">
                <!-- Plan summary is rendered dynamically -->
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
                        <a href="/contact" class="btn btn-primary w-full mt-auto">Upgrade to Startup</a>
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
                <div id="billing-history-container" class="widget-card">
                    <!-- Billing history table is rendered dynamically -->
                </div>
            </div>
        </div>
    `;
    setTimeout(initializePage, 0);
    return { pageHtml, headerHtml };
}

function renderPlanSummary() {
    const container = document.getElementById('plan-summary-card');
    if (!container) return;
    
    const company = getCompany();
    const planDetails = PLAN_DATA[company.plan] || PLAN_DATA.free;
    const totalTokens = planDetails.token_limit;
    const remainingTokens = company.token_balance;
    const usedTokens = totalTokens > 0 ? totalTokens - remainingTokens : 0;
    const usagePercentage = totalTokens > 0 ? (usedTokens / totalTokens) * 100 : 0;
    
    container.innerHTML = `
        <div class="grid md:grid-cols-3 gap-6 items-center">
            <div>
                <h2 class="text-lg font-semibold text-text-headings">Current Plan</h2>
                <p class="text-5xl font-bold text-primary mt-2 capitalize">${company.plan}</p>
            </div>
            <div class="md:col-span-2">
                <p class="text-sm font-medium text-text-muted">Token Balance</p>
                <div class="flex items-center gap-4 mt-1">
                    <div class="w-full bg-app-bg rounded-full h-2.5">
                        <div class="bg-primary h-2.5 rounded-full" style="width: ${usagePercentage}%"></div>
                    </div>
                    <span class="text-sm font-semibold text-text-headings whitespace-nowrap">${remainingTokens.toLocaleString()} / ${totalTokens > 0 ? totalTokens.toLocaleString() : '∞'}</span>
                </div>
                <p class="text-xs text-text-tertiary mt-2">Your balance resets on the 1st of each month. <a href="/contact" class="text-primary font-medium hover:underline">Contact us</a> to upgrade.</p>
            </div>
        </div>
    `;
}

function renderBillingHistory() {
    const container = document.getElementById('billing-history-container');
    if (!container) return;

    if (isLoadingHistory) {
        container.innerHTML = `<div class="p-8 text-center text-text-muted">Loading billing history...</div>`;
        return;
    }

    const historyContent = billingHistory.length === 0 ? `
        <tbody>
            <tr>
                <td colspan="5" class="text-center p-12 text-text-muted">
                    <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p class="mt-4 font-semibold text-text-headings">No billing history</p>
                    <p class="text-sm">Your invoices will appear here once you subscribe to a plan.</p>
                </td>
            </tr>
        </tbody>
    ` : `
        <tbody>
            ${billingHistory.map(item => `
                <tr class="hover:bg-app-accent-hover">
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${item.description}</td>
                    <td class="font-mono text-right">$${item.amount_usd.toFixed(2)}</td>
                    <td><span class="px-2 py-1 text-xs font-semibold ${item.status === 'paid' ? 'text-green-800 bg-green-100' : 'text-yellow-800 bg-yellow-100'} rounded-full capitalize">${item.status}</span></td>
                    <td class="text-center"><a href="${item.invoice_url}" target="_blank" rel="noopener" class="text-primary font-semibold hover:underline" data-external="true">View</a></td>
                </tr>
            `).join('')}
        </tbody>
    `;

    container.innerHTML = `
        <table class="data-table">
            <thead><tr><th>Date</th><th>Description</th><th class="text-right">Amount</th><th>Status</th><th class="text-center">Invoice</th></tr></thead>
            ${historyContent}
        </table>
    `;
}

async function fetchBillingHistory() {
    isLoadingHistory = true;
    renderBillingHistory();
    try {
        const response = await api.get('/business/billing-history');
        billingHistory = response.data;
    } catch (error) {
        console.error("Failed to fetch billing history:", error);
        billingHistory = [];
    } finally {
        isLoadingHistory = false;
        renderBillingHistory();
    }
}

function initializePage() {
    renderPlanSummary();
    fetchBillingHistory();
}