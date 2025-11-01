import Chart from 'chart.js/auto';
import { icons, renderModal } from './utils.js';
import { api as authApi, fetchAndStoreAccount, getAccount, updateAllBalances } from '../../../lib/auth.js';
import { DateTime } from 'luxon';

let chartInstance = null;

function renderNextPayoutCard(account) {
    const pendingBalance = account?.usd_balance || 0;
    
    return `
    <div id="next-payout-card" class="mt-8 bg-surface p-8 rounded-lg border border-primary">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex-grow text-center md:text-left">
                <h3 class="text-2xl font-bold text-text-main">Payout Batches</h3>
                <p class="text-text-secondary mt-1 text-sm max-w-md">Payouts are manually processed in batches every week, to ensure security and accuracy.</p>
            </div>
            <div class="w-full md:w-auto flex flex-col items-center md:items-end bg-primary p-6 rounded-md text-right">
                <p class="text-sm text-text-secondary">Balance for Next Payout</p>
                <p id="next-payout-balance" class="text-3xl font-bold text-text-main font-mono mt-1">$${pendingBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</p>
                <p class="text-xs text-text-secondary italic mt-1">This is your current pending USD balance.</p>
            </div>
        </div>
    </div>
    `;
}

function renderStatCard(label, value) {
    const displayValue = label === 'Global Rank' && value !== 'N/A' ? `#${value}` : value;
    
    return `
    <div class="bg-surface p-6 rounded-lg border border-primary">
        <p class="text-sm font-medium text-text-secondary">${label}</p>
        <p class="text-5xl font-bold mt-2 text-accent-primary">${displayValue}</p>
    </div>
    `;
}

export function initializeChart(contributions, timeRange) {
    const canvas = document.getElementById('earningsChartCanvas');
    const chartContainer = canvas?.parentElement;
    const messageEl = document.getElementById('chart-message');
    if (!canvas || !chartContainer || !messageEl) return;

    if (chartInstance) chartInstance.destroy();
    
    const processedContributions = (contributions || []).filter(c => c.status === 'PROCESSED' && c.reward_amount > 0);

    const aggregatedData = new Map();
    processedContributions.forEach(c => {
        const dateKey = c.created_at.split('T')[0];
        aggregatedData.set(dateKey, (aggregatedData.get(dateKey) || 0) + c.reward_amount);
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    let startDate = new Date(today);
    if (timeRange === '7d') {
        startDate.setUTCDate(today.getUTCDate() - 6);
    } else if (timeRange === '30d') {
        startDate.setUTCDate(today.getUTCDate() - 29);
    } else { 
        if (processedContributions.length > 0) {
            startDate = new Date(processedContributions.reduce((min, c) => new Date(c.created_at) < min ? new Date(c.created_at) : min, new Date()));
            startDate.setUTCHours(0, 0, 0, 0);
            startDate.setUTCDate(startDate.getUTCDate() - 1);
        } else {
            startDate.setUTCDate(today.getUTCDate() - 6);
        }
    }

    const labels = [];
    const dataPoints = [];
    for (let d = new Date(startDate); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' }));
        dataPoints.push(aggregatedData.get(dateKey) || 0);
    }
    
    const hasData = dataPoints.some(v => v > 0);
    if (!hasData) {
        messageEl.textContent = 'No earnings data for this period.';
        messageEl.classList.remove('hidden');
        canvas.classList.add('hidden');
        return;
    }

    messageEl.classList.add('hidden');
    canvas.classList.remove('hidden');

    const gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, chartContainer.clientHeight);
    gradient.addColorStop(0, 'rgba(220, 38, 38, 0.4)');
    gradient.addColorStop(1, 'rgba(220, 38, 38, 0)');

    chartInstance = new Chart(canvas, {
        type: 'line', data: { labels, datasets: [{
            label: 'USD Earned', data: dataPoints, borderColor: '#DC2626', backgroundColor: gradient,
            fill: true, tension: 0.4, pointBackgroundColor: '#EBEBEB', pointBorderColor: '#DC2626',
            pointRadius: 4, pointBorderWidth: 2, pointHoverRadius: 7, pointHoverBorderWidth: 2, pointHoverBackgroundColor: '#fff',
        }]},
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: {
                enabled: true, backgroundColor: '#f0f0f0', titleColor: '#1f2937', bodyColor: '#4b5563',
                padding: 12, cornerRadius: 8, borderColor: '#d1d5db', borderWidth: 1, boxPadding: 6,
                titleFont: { family: 'Satoshi', weight: 'bold' }, bodyFont: { family: 'Satoshi' },
                displayColors: false,
                callbacks: { label: (c) => `+ $${c.parsed.y.toFixed(4)} USD` }
            }},
            scales: {
                x: { grid: { color: 'rgba(31, 41, 55, 0.1)' }, ticks: { color: '#4b5563', font: { family: 'Satoshi' } } },
                y: { grid: { color: 'rgba(31, 41, 55, 0.1)' }, ticks: { color: '#4b5563', font: { family: 'Satoshi' }, padding: 10 }, beginAtZero: true }
            }
        }
    });
}

export function attachChartButtonListeners(contributions, onRangeChangeCallback) {
    const buttonGroup = document.getElementById('chart-time-buttons');
    if (!buttonGroup) return;

    buttonGroup.removeEventListener('click', handleRangeChange);
    buttonGroup.addEventListener('click', handleRangeChange);

    function handleRangeChange(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const newRange = button.dataset.range;
        
        if (typeof onRangeChangeCallback === 'function') {
             onRangeChangeCallback(newRange);
        }

        buttonGroup.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-subtle', 'text-text-main');
            btn.classList.add('text-text-secondary', 'hover:bg-primary');
        });
        button.classList.add('bg-subtle', 'text-text-main');
        button.classList.remove('text-text-secondary', 'hover:bg-primary');
    }
}

export function renderDashboardOverview(user, account, rank, totalContributions) {
    const totalEarned = account?.total_usd_earned ?? 0;

    return `
        <header class="animate-fade-in-up">
            <h1 class="text-3xl font-bold text-text-main">Welcome, <span class="text-accent-primary shimmer-text">${user?.display_name ?? 'Contributor'}</span></h1>
            <p class="text-text-secondary">Here's your performance snapshot today.</p>
        </header>

        <div class="mt-8 bg-surface p-6 rounded-lg border border-primary animate-fade-in-up" style="animation-delay: 100ms;">
            <p class="text-sm font-medium text-text-secondary">Total Earned (Lifetime)</p>
            <p id="overview-total-balance-usd" class="text-5xl font-bold mt-2 text-accent-primary shimmer-text">$0.00</p>
            <p id="overview-total-balance-lumen" class="text-lg font-medium text-text-secondary mt-1">≈ 0.00 $LUMEN</p>
            <p class="text-xs text-text-secondary italic mt-1">*LUMEN value is an estimate based on live market price.</p>
        </div>

        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style="animation-delay: 200ms;">
            ${renderStatCard('Global Rank', rank ? rank.toLocaleString() : 'N/A')}
            ${renderStatCard('Contributions', totalContributions.toLocaleString())}
            ${renderStatCard('Reward Multiplier', `${user?.reward_multiplier?.toFixed(1) ?? '1.0'}x`)}
        </div>

        <div class="animate-fade-in-up" style="animation-delay: 300ms;">
             ${renderNextPayoutCard(account)}
        </div>

        <div class="animate-fade-in-up bg-surface p-6 rounded-lg border border-primary mt-8" style="animation-delay: 400ms;">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h3 class="font-bold text-lg text-text-main">Earnings History</h3>
                <div id="chart-time-buttons" class="flex items-center bg-primary p-1 rounded-md border border-subtle">
                    <button data-range="7d" class="time-range-btn px-3 py-1 text-sm font-medium rounded-md transition-colors text-text-secondary hover:bg-primary">7D</button>
                    <button data-range="30d" class="time-range-btn px-3 py-1 text-sm font-medium rounded-md transition-colors text-text-secondary hover:bg-primary">30D</button>
                    <button data-range="all" class="time-range-btn px-3 py-1 text-sm font-medium rounded-md transition-colors bg-subtle text-text-main">All</button>
                </div>
            </div>
            <div class="relative h-64 md:h-80">
                <canvas id="earningsChartCanvas"></canvas>
                <div id="chart-message" class="hidden absolute inset-0 flex items-center justify-center text-text-secondary"></div>
            </div>
        </div>
    `;
}