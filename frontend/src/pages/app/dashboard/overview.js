import Chart from 'chart.js/auto';
import { icons } from './utils.js';

let chartInstance = null;
let activeTimeRange = 'all';

function renderWalletSection(account) {
    const claimableBalance = account?.lum_balance || 0;
    
    return `
    <div class="mt-8 relative bg-surface p-8 rounded-xl border border-primary overflow-hidden shadow-2xl shadow-black/30">
        <div class="absolute -right-10 -top-10 text-primary/10">
            <svg class="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m15-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        </div>
        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex-grow text-center md:text-left">
                <h3 class="text-2xl font-bold text-text-main">Claim Your Rewards</h3>
                <p class="text-text-secondary mt-1">Connect your wallet to transfer your earned $LUM off-platform.</p>
            </div>
            <div class="text-center md:text-right">
                <p class="text-sm text-text-secondary">Claimable Balance</p>
                <p class="text-3xl font-bold pulse-text font-mono">${claimableBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</p>
            </div>
            <button class="w-full md:w-auto px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110 opacity-60 cursor-not-allowed shrink-0">
                Connect Wallet
            </button>
        </div>
    </div>
    `;
}

function renderProTipsSection() {
    const tips = [
        { icon: '💡', title: 'Uniqueness is King', text: 'Code from private, proprietary projects is far more valuable than public, open-source code.' },
        { icon: '💎', title: 'Complexity is Rewarded', text: 'Projects with intricate logic and novel algorithms are valued more highly than simple scripts.' },
        { icon: '🎯', title: 'Code with Intent', text: 'Well-structured, documented, and high-signal code provides the best data for training next-gen AI.' },
    ];

    return `
    <div class="mt-8">
        <h3 class="font-bold text-lg text-text-main mb-4">Pro Tips for Maximizing Rewards</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${tips.map(tip => `
            <div class="bg-surface p-5 rounded-xl border border-primary hover:border-accent-purple/50 transition-colors">
                <p class="text-xl mb-2">${tip.icon}</p>
                <h4 class="font-bold text-text-main">${tip.title}</h4>
                <p class="text-sm text-text-secondary mt-1">${tip.text}</p>
            </div>
        `).join('')}
        </div>
    </div>
    `;
}

function renderStatCard(label, value) {
    const displayValue = label === 'Global Rank' && value !== 'N/A' ? `#${value}` : value;
    
    return `
    <div class="bg-surface p-6 rounded-xl border border-primary">
        <p class="text-sm font-medium text-text-secondary">${label}</p>
        <p class="text-5xl font-bold mt-2 gradient-text">${displayValue}</p>
    </div>
    `;
}

function initializeChart(contributions, timeRange) {
    const canvas = document.getElementById('earningsChartCanvas');
    const chartContainer = canvas.parentElement;
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
    } else { // 'all'
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
    gradient.addColorStop(0, 'rgba(138, 43, 226, 0.5)');
    gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');

    chartInstance = new Chart(canvas, {
        type: 'line', data: { labels, datasets: [{
            label: '$LUM Earned', data: dataPoints, borderColor: '#8A2BE2', backgroundColor: gradient,
            fill: true, tension: 0.4, pointBackgroundColor: '#E5E5E5', pointBorderColor: '#8A2BE2',
            pointRadius: 4, pointBorderWidth: 2, pointHoverRadius: 7, pointHoverBorderWidth: 2, pointHoverBackgroundColor: '#fff',
        }]},
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: {
                enabled: true, backgroundColor: '#13131A', titleColor: '#E5E5E5', bodyColor: '#A3A3B2',
                padding: 12, cornerRadius: 8, borderColor: '#3F3F4D', borderWidth: 1, boxPadding: 6,
                titleFont: { family: 'Satoshi', weight: 'bold' }, bodyFont: { family: 'Satoshi' },
                displayColors: false,
                callbacks: { label: (c) => `+ ${c.parsed.y.toFixed(4)} $LUM` }
            }},
            scales: {
                x: { grid: { color: 'rgba(63, 63, 77, 0.2)' }, ticks: { color: '#A3A3B2', font: { family: 'Satoshi' } } },
                y: { grid: { color: 'rgba(63, 63, 77, 0.2)' }, ticks: { color: '#A3A3B2', font: { family: 'Satoshi' }, padding: 10 }, beginAtZero: true }
            }
        }
    });
}

function attachChartButtonListeners(contributions) {
    const buttonGroup = document.getElementById('chart-time-buttons');
    if (!buttonGroup) return;

    buttonGroup.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const newRange = button.dataset.range;
        if (newRange === activeTimeRange) return;

        activeTimeRange = newRange;

        buttonGroup.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-text-main');
            btn.classList.add('text-text-secondary');
        });

        button.classList.add('bg-primary', 'text-text-main');
        button.classList.remove('text-text-secondary');

        initializeChart(contributions, newRange);
    });
}

export function renderDashboardOverview(user, account, rank, allContributions) {
    const totalContributions = allContributions?.length || 0; 
    
    setTimeout(() => {
        initializeChart(allContributions, activeTimeRange);
        attachChartButtonListeners(allContributions);
    }, 50);

    return `
        <header class="animate-fade-in-up">
            <h1 class="text-3xl font-bold">Welcome, <span class="pulse-text">${user?.display_name ?? 'Contributor'}</span></h1>
            <p class="text-text-secondary">Here's your performance snapshot today.</p>
        </header>

        <div class="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style="animation-delay: 100ms;">
            
            <div class="col-span-2 bg-gradient-to-br from-accent-purple/80 to-accent-pink/80 p-6 rounded-xl text-white shadow-lg shadow-accent-purple/20">
                <p class="text-sm font-medium text-purple-200">Total Balance</p>
                <p id="overview-total-balance" class="text-5xl font-bold mt-2">${account?.lum_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? '0.00'} $LUM</p>
            </div>

            ${renderStatCard('Global Rank', rank ? rank.toLocaleString() : 'N/A')}
            ${renderStatCard('Contributions', totalContributions.toLocaleString())}
        </div>

        <div class="animate-fade-in-up bg-surface p-6 rounded-xl border border-primary mt-6" style="animation-delay: 200ms;">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h3 class="font-bold text-lg text-text-main">Earnings History</h3>
                <div id="chart-time-buttons" class="flex items-center bg-abyss-dark p-1 rounded-lg border border-primary">
                    <button data-range="7d" class="time-range-btn px-3 py-1 text-sm font-medium rounded-md transition-colors text-text-secondary">7D</button>
                    <button data-range="30d" class="time-range-btn px-3 py-1 text-sm font-medium rounded-md transition-colors text-text-secondary">30D</button>
                    <button data-range="all" class="time-range-btn px-3 py-1 text-sm font-medium rounded-md transition-colors bg-primary text-text-main">All</button>
                </div>
            </div>
            <div class="relative h-64 md:h-80">
                <canvas id="earningsChartCanvas"></canvas>
                <div id="chart-message" class="hidden absolute inset-0 flex items-center justify-center text-text-secondary"></div>
            </div>
        </div>

        <div class="animate-fade-in-up" style="animation-delay: 300ms;">
             ${renderWalletSection(account)}
        </div>

        <div class="animate-fade-in-up" style="animation-delay: 400ms;">
            ${renderProTipsSection()}
        </div>
    `;
}