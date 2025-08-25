import { getUser, getCompany } from '../../lib/auth.js';
import Chart from 'chart.js/auto';

let chartInstance = null;

function initializeChart() {
    const canvas = document.getElementById('usageChart');
    if (!canvas) return;

    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const dataPoints = [0, 0, 0, 0, 0, 0, 0];
    const hasData = dataPoints.some(p => p > 0);

    const emptyState = document.getElementById('chart-empty-state');
    
    if (!hasData) {
        canvas.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        canvas.classList.remove('hidden');
        emptyState.classList.add('hidden');
    }

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
                    ticks: { color: '#6B7280' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#6B7280' }
                }
            }
        }
    });
}

export async function renderOverviewPage() {
    const user = getUser();
    const company = getCompany();

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
                    <p id="company-token-balance" class="text-3xl font-bold text-text-headings mt-1">${company.token_balance.toLocaleString()}</p>
                </div>
                <div class="widget-card p-5">
                    <p class="text-sm font-medium text-text-muted">Current Plan</p>
                    <p class="text-3xl font-bold text-text-headings mt-1 capitalize">${company.plan || 'Free'}</p>
                </div>
                <div class="widget-card p-5">
                    <p class="text-sm font-medium text-text-muted">Team Members</p>
                    <p class="text-3xl font-bold text-text-headings mt-1">1</p>
                </div>
                <div class="widget-card p-5">
                    <p class="text-sm font-medium text-text-muted">Active API Keys</p>
                    <p class="text-3xl font-bold text-text-headings mt-1">0</p>
                </div>
            </div>
            
            <div class="widget-card mt-6">
                <div class="p-6">
                    <h2 class="text-lg font-semibold text-text-headings">Token Usage Overview</h2>
                    <p class="text-sm text-text-muted">Tokens unlocked in the last 7 months.</p>
                </div>
                <div class="p-6 h-80 relative">
                    <canvas id="usageChart"></canvas>
                    <div id="chart-empty-state" class="absolute inset-0 flex flex-col items-center justify-center text-center hidden">
                        <svg class="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p class="mt-4 font-semibold text-text-body">No Usage Data Yet</p>
                        <p class="text-sm text-text-muted">As you unlock contributions in the Data Explorer, your usage will appear here.</p>
                    </div>
                </div>
            </div>

            <div class="widget-card mt-6">
                <div class="p-6 border-b border-app-border">
                    <h2 class="text-lg font-semibold text-text-headings">Recently Unlocked Contributions</h2>
                </div>
                <div class="text-center p-12 text-text-muted">
                    <p>No contributions unlocked yet. <a href="/app/data-explorer" class="text-primary font-semibold hover:underline">Explore data</a> to get started.</p>
                </div>
            </div>
        </div>
    `;

    setTimeout(initializeChart, 0);

    return { pageHtml, headerHtml };
}