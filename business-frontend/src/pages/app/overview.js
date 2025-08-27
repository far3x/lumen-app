import { getUser, getCompany } from '../../lib/auth.js';
import api from '../../lib/api.js';
import Chart from 'chart.js/auto';

let chartInstance = null;

async function initializeOverview() {
    const user = getUser();
    const headerContent = document.getElementById('header-content');
    if (headerContent) {
        headerContent.innerHTML = `
            <div class="flex-1">
                <h1 class="page-headline">Welcome, ${user.full_name.split(' ')[0]}</h1>
            </div>
            <div>
                <a href="/app/data-explorer" class="btn btn-primary">Explore Data</a>
            </div>
        `;
    }

    const [stats, usage, apiKeyUsage, unlocked] = await Promise.allSettled([
        api.get('/business/dashboard-stats'),
        api.get('/business/usage-stats'),
        api.get('/business/api-key-usage'),
        api.get('/business/data/unlocked')
    ]);

    const statTokenBalanceContainer = document.getElementById('stat-token-balance-container');
    const statCurrentPlanContainer = document.getElementById('stat-current-plan-container');
    const statTeamMembersContainer = document.getElementById('stat-team-members-container');
    const statApiKeysContainer = document.getElementById('stat-api-keys-container');

    if (stats.status === 'fulfilled') {
        const data = stats.value.data;
        if(statTokenBalanceContainer) statTokenBalanceContainer.innerHTML = `<p class="text-sm font-medium text-text-muted">Token Balance</p><p id="stat-token-balance" class="text-3xl font-bold text-text-headings mt-1">${data.token_balance.toLocaleString()}</p>`;
        if(statCurrentPlanContainer) statCurrentPlanContainer.innerHTML = `<p class="text-sm font-medium text-text-muted">Current Plan</p><p id="stat-current-plan" class="text-3xl font-bold text-text-headings mt-1 capitalize">${data.current_plan}</p>`;
        if(statTeamMembersContainer) statTeamMembersContainer.innerHTML = `<p class="text-sm font-medium text-text-muted">Team Members</p><p id="stat-team-members" class="text-3xl font-bold text-text-headings mt-1">${data.team_member_count}</p>`;
        if(statApiKeysContainer) statApiKeysContainer.innerHTML = `<p class="text-sm font-medium text-text-muted">Active API Keys</p><p id="stat-api-keys" class="text-3xl font-bold text-text-headings mt-1">${data.active_api_key_count}</p>`;
    } else {
        // Handle failed stats fetch
        if(statTokenBalanceContainer) statTokenBalanceContainer.innerHTML = `<p class="text-sm text-text-muted">Token Balance</p><p class="text-3xl font-bold text-text-headings mt-1">Error</p>`;
    }

    const chartContainer = document.getElementById('chart-container');
    if (usage.status === 'fulfilled') {
        initializeChart(usage.value.data);
    } else if(chartContainer) {
        chartContainer.innerHTML = `<div class="p-8 text-center text-text-muted">Could not load usage data.</div>`;
    }

    const apiKeyUsageContainer = document.getElementById('api-key-usage-container');
    if (apiKeyUsage.status === 'fulfilled') {
        if(apiKeyUsageContainer) apiKeyUsageContainer.innerHTML = renderApiKeyUsage(apiKeyUsage.value.data);
    } else if(apiKeyUsageContainer) {
        apiKeyUsageContainer.innerHTML = `<div class="p-8 text-center text-text-muted">Could not load API key usage.</div>`;
    }

    const recentlyUnlockedContainer = document.getElementById('recently-unlocked-container');
    if (unlocked.status === 'fulfilled') {
        if(recentlyUnlockedContainer) recentlyUnlockedContainer.innerHTML = renderRecentlyUnlocked(unlocked.value.data);
    } else if(recentlyUnlockedContainer) {
        recentlyUnlockedContainer.innerHTML = `<div class="p-8 text-center text-text-muted">Could not load recent unlocks.</div>`;
    }
}

function initializeChart(usageData) {
    const canvas = document.getElementById('usageChart');
    if (!canvas) return;

    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const now = new Date();
    const labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
        return d.toLocaleString('default', { month: 'short' });
    });

    const dataMap = new Map();
    usageData.forEach(d => {
        const monthKey = new Date(d.date).toISOString().slice(5, 7); // "MM"
        const yearMonthKey = `${new Date(d.date).getFullYear()}-${monthKey}`;
        dataMap.set(yearMonthKey, (dataMap.get(yearMonthKey) || 0) + d.tokens_used);
    });
    
    const dataPoints = labels.map(label => {
        const monthDate = new Date(Date.parse(label +" 1, " + now.getFullYear()));
        const yearMonthKey = `${monthDate.getFullYear()}-${(monthDate.getMonth() + 1).toString().padStart(2, '0')}`;
        return dataMap.get(yearMonthKey) || 0;
    });

    const hasData = dataPoints.some(p => p > 0);
    const emptyState = document.getElementById('chart-empty-state');
    
    if (!hasData) {
        canvas.classList.add('hidden');
        if(emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    canvas.classList.remove('hidden');
    if(emptyState) emptyState.classList.add('hidden');

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

function renderApiKeyUsage(apiKeys) {
    if (!apiKeys || apiKeys.length === 0) {
        return `<div class="widget-card h-full flex items-center justify-center p-8"><div class="text-center text-text-muted">No API keys have been used yet.</div></div>`;
    }
    const totalUsage = apiKeys.reduce((sum, key) => sum + key.total_tokens, 0);

    return `
        <div class="widget-card h-full">
            <div class="p-6 border-b border-app-border">
                <h2 class="text-lg font-semibold text-text-headings">API Key Usage (Last 30d)</h2>
            </div>
            <div class="p-6 space-y-5">
                ${apiKeys.map(key => `
                    <div>
                        <div class="flex justify-between items-baseline mb-1">
                            <p class="font-semibold text-sm text-text-headings">${key.name}</p>
                            <span class="px-2 py-0.5 text-xs font-semibold ${key.is_active ? 'text-green-800 bg-green-100' : 'text-gray-800 bg-gray-100'} rounded-full">${key.is_active ? 'Active' : 'Revoked'}</span>
                        </div>
                        <div class="w-full bg-app-bg rounded-full h-2.5">
                            <div class="bg-primary h-2.5 rounded-full" style="width: ${totalUsage > 0 ? Math.min(100, (key.total_tokens / totalUsage) * 100) : 0}%"></div>
                        </div>
                        <p class="text-right text-xs text-text-muted font-mono mt-1">${(key.total_tokens / 1e6).toFixed(2)}M Tokens</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderRecentlyUnlocked(contributions) {
     if (!contributions || contributions.length === 0) {
        return `<div class="widget-card h-full flex items-center justify-center p-8"><div class="text-center text-text-muted">No recently unlocked contributions.</div></div>`;
    }
    return `
        <div class="widget-card h-full">
            <div class="p-6 border-b border-app-border flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-semibold text-text-headings">Recently Unlocked</h2>
                </div>
                <a href="/app/data-explorer" class="text-primary font-semibold text-sm hover:underline">View All</a>
            </div>
            <div class="p-2">
                 <table class="data-table">
                    <thead>
                        <tr><th>Contribution ID</th><th>Language</th><th>Quality</th><th>Tokens</th></tr>
                    </thead>
                     <tbody>
                        ${contributions.map(c => `
                            <tr class="hover:bg-app-accent-hover">
                                <td class="font-mono text-sm">#${c.id}</td>
                                <td>${c.language}</td>
                                <td><span class="font-semibold text-primary">${c.quality_score.toFixed(1)}</span><span class="text-xs text-text-tertiary">/10</span></td>
                                <td class="font-mono text-sm">${c.tokens.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

export async function renderOverviewPage() {
    const { pageHtml, headerHtml } = {
        headerHtml: `<div class="flex-1"><div class="skeleton-line h-8 w-64"></div></div>`,
        pageHtml: `
            <div class="dashboard-container">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div id="stat-token-balance-container" class="widget-card p-5 animate-pulse"><div class="skeleton-line h-4 w-2/3 mb-2"></div><div class="skeleton-line h-8 w-1/2"></div></div>
                    <div id="stat-current-plan-container" class="widget-card p-5 animate-pulse"><div class="skeleton-line h-4 w-2/3 mb-2"></div><div class="skeleton-line h-8 w-1/2"></div></div>
                    <div id="stat-team-members-container" class="widget-card p-5 animate-pulse"><div class="skeleton-line h-4 w-2/3 mb-2"></div><div class="skeleton-line h-8 w-1/2"></div></div>
                    <div id="stat-api-keys-container" class="widget-card p-5 animate-pulse"><div class="skeleton-line h-4 w-2/3 mb-2"></div><div class="skeleton-line h-8 w-1/2"></div></div>
                </div>
                
                <div class="widget-card mt-6">
                    <div class="p-6"><h2 class="text-lg font-semibold text-text-headings">Token Usage Overview</h2></div>
                    <div id="chart-container" class="p-6 h-80 relative">
                        <canvas id="usageChart"></canvas>
                        <div id="chart-empty-state" class="absolute inset-0 flex flex-col items-center justify-center text-center hidden">
                             <p class="mt-4 font-semibold text-text-body">No Usage Data Yet</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div id="api-key-usage-container">
                        <div class="widget-card h-full p-6 animate-pulse">
                            <div class="skeleton-line h-6 w-1/2 mb-4"></div>
                            ${Array(3).fill('').map(() => `<div class="skeleton-line h-12 w-full mb-3"></div>`).join('')}
                        </div>
                    </div>
                    <div id="recently-unlocked-container">
                         <div class="widget-card h-full p-6 animate-pulse">
                            <div class="skeleton-line h-6 w-1/2 mb-4"></div>
                            ${Array(3).fill('').map(() => `<div class="skeleton-line h-10 w-full mb-3"></div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `
    };

    requestAnimationFrame(initializeOverview);

    return { pageHtml, headerHtml };
}