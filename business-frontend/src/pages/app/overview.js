import { getUser, getCompany } from '../../lib/auth.js';
import Chart from 'chart.js/auto';

let chartInstance = null;

function initializeChart() {
    const canvas = document.getElementById('usageChart');
    if (!canvas) return;

    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Fake data for the last 7 months
    const now = new Date();
    const labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
        return d.toLocaleString('default', { month: 'short' });
    });
    const dataPoints = [1280450, 1532980, 2056110, 1894320, 2567890, 3102340, 4210870]; // In tokens

    const ctx = canvas.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tokens Unlocked',
                data: dataPoints,
                backgroundColor: '#4f46e5',
                borderColor: '#4338ca',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#111827',
                    titleColor: '#F9FAFB',
                    bodyColor: '#D1D5DB',
                    padding: 10,
                    cornerRadius: 6,
                    callbacks: {
                        label: (context) => `${context.parsed.y.toLocaleString()} Tokens`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#E5E7EB' },
                    ticks: { 
                        color: '#6B7280',
                        callback: function(value) {
                            if (value >= 1e6) return (value / 1e6) + 'M';
                            if (value >= 1e3) return (value / 1e3) + 'K';
                            return value;
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#6B7280' }
                }
            }
        }
    });
}

function renderApiKeyUsage() {
    const fakeApiKeys = [
        { name: 'Production Model v4', status: 'Active', usage: 18201482, total: 30000000 },
        { name: 'Research - Anomaly Detection', status: 'Active', usage: 5912830, total: 30000000 },
        { name: 'Staging Environment', status: 'Active', usage: 873115, total: 30000000 },
        { name: 'Legacy Model v3', status: 'Revoked', usage: 21450912, total: 30000000 }
    ];

    return `
        <div class="widget-card h-full">
            <div class="p-6 border-b border-app-border">
                <h2 class="text-lg font-semibold text-text-headings">API Key Usage</h2>
                <p class="text-sm text-text-muted">Token consumption by key for the current cycle.</p>
            </div>
            <div class="p-6 space-y-5">
                ${fakeApiKeys.map(key => `
                    <div>
                        <div class="flex justify-between items-baseline mb-1">
                            <p class="font-semibold text-sm text-text-headings">${key.name}</p>
                            <span class="px-2 py-0.5 text-xs font-semibold ${key.status === 'Active' ? 'text-green-800 bg-green-100' : 'text-gray-800 bg-gray-100'} rounded-full">${key.status}</span>
                        </div>
                        <div class="w-full bg-app-bg rounded-full h-2.5">
                            <div class="bg-primary h-2.5 rounded-full" style="width: ${Math.min(100, (key.usage / key.total) * 100)}%"></div>
                        </div>
                        <p class="text-right text-xs text-text-muted font-mono mt-1">${(key.usage / 1e6).toFixed(2)}M Tokens</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderRecentlyUnlocked() {
    const fakeContributions = [
        { id: 84921, lang: 'Rust', quality: 9.5, tokens: 15230, unlocked: '2 hours ago' },
        { id: 79104, lang: 'Python', quality: 9.2, tokens: 8910, unlocked: '1 day ago' },
        { id: 82441, lang: 'Go', quality: 8.8, tokens: 11500, unlocked: '1 day ago' },
        { id: 75003, lang: 'TypeScript', quality: 9.1, tokens: 21800, unlocked: '3 days ago' },
    ];

    return `
        <div class="widget-card h-full">
            <div class="p-6 border-b border-app-border flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-semibold text-text-headings">Recently Unlocked</h2>
                    <p class="text-sm text-text-muted">Your latest acquired data assets.</p>
                </div>
                <a href="/app/data-explorer" class="text-primary font-semibold text-sm hover:underline">View All</a>
            </div>
            <div class="p-2">
                 <table class="data-table">
                    <thead>
                        <tr><th>Contribution ID</th><th>Language</th><th>Quality</th><th>Tokens</th></tr>
                    </thead>
                     <tbody>
                        ${fakeContributions.map(c => `
                            <tr class="hover:bg-app-accent-hover">
                                <td class="font-mono text-sm">#${c.id}</td>
                                <td>${c.lang}</td>
                                <td><span class="font-semibold text-primary">${c.quality.toFixed(1)}</span><span class="text-xs text-text-tertiary">/10</span></td>
                                <td class="font-mono text-sm">${c.tokens.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

export function renderOverviewPage() {
    const user = getUser() || { full_name: 'Alex' };
    const company = getCompany() || { name: 'QuantumLeap AI' };

    const headerHtml = `
        <div class="flex-1">
            <h1 class="page-headline">Welcome, ${user.full_name.split(' ')[0]}</h1>
        </div>
        <div>
            <a href="/app/data-explorer" class="btn btn-primary">Explore Data</a>
        </div>
    `;

    const pageHtml = `
        <div class="dashboard-container">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="widget-card p-5">
                    <p class="text-sm font-medium text-text-muted">Token Balance</p>
                    <p id="company-token-balance" class="text-3xl font-bold text-text-headings mt-1">24,712,389</p>
                </div>
                <div class="widget-card p-5">
                    <p class="text-sm font-medium text-text-muted">Current Plan</p>
                    <p class="text-3xl font-bold text-text-headings mt-1 capitalize">Startup</p>
                </div>
                <div class="widget-card p-5">
                    <p class="text-sm font-medium text-text-muted">Team Members</p>
                    <p class="text-3xl font-bold text-text-headings mt-1">5</p>
                </div>
                <div class="widget-card p-5">
                    <p class="text-sm font-medium text-text-muted">Active API Keys</p>
                    <p class="text-3xl font-bold text-text-headings mt-1">3</p>
                </div>
            </div>
            
            <div class="widget-card mt-6">
                <div class="p-6">
                    <h2 class="text-lg font-semibold text-text-headings">Token Usage Overview</h2>
                    <p class="text-sm text-text-muted">Tokens unlocked in the last 7 months.</p>
                </div>
                <div class="p-6 h-80 relative">
                    <canvas id="usageChart"></canvas>
                    <div id="chart-empty-state" class="absolute inset-0 flex flex-col items-center justify-center text-center hidden"></div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                ${renderApiKeyUsage()}
                ${renderRecentlyUnlocked()}
            </div>
        </div>
    `;

    setTimeout(initializeChart, 0);

    return { pageHtml, headerHtml };
}