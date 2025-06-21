import Chart from 'chart.js/auto';
import { icons } from './utils.js';

let chartInstance = null;

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

function initializeChart(contributions) {
    const ctx = document.getElementById('earningsChartCanvas');
    if (!ctx) return;
    if (chartInstance) chartInstance.destroy();

    const dailyEarnings = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(thirtyDaysAgo.getDate() + i);
        dailyEarnings[d.toISOString().split('T')[0]] = 0;
    }

    if (contributions && contributions.length > 0) {
        contributions.forEach(contrib => {
            if (contrib.status === 'PROCESSED' && contrib.reward_amount > 0) {
                const dateString = new Date(contrib.created_at).toISOString().split('T')[0];
                if (dailyEarnings.hasOwnProperty(dateString)) {
                    dailyEarnings[dateString] += contrib.reward_amount;
                }
            }
        });
    }

    const labels = Object.keys(dailyEarnings).sort().map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const dataPoints = Object.keys(dailyEarnings).sort().map(d => dailyEarnings[d]);

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(138, 43, 226, 0.5)');
    gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');

    chartInstance = new Chart(ctx, {
        type: 'line', data: { labels, datasets: [{
            label: '$LUM Earned', data: dataPoints, borderColor: '#8A2BE2', backgroundColor: gradient,
            fill: true, tension: 0.4, pointBackgroundColor: '#8A2BE2', pointBorderColor: '#fff',
            pointHoverRadius: 6, pointHoverBorderWidth: 2,
        }]},
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: {
                backgroundColor: '#13131A', titleColor: '#E5E5E5', bodyColor: '#A3A3B2',
                padding: 10, borderColor: '#3F3F4D', borderWidth: 1, boxPadding: 4,
                callbacks: { label: (c) => `+ ${c.parsed.y.toFixed(4)} $LUM` }
            }},
            scales: {
                x: { grid: { color: 'rgba(63, 63, 77, 0.2)' }, ticks: { color: '#A3A3B2', font: { family: 'Satoshi' } } },
                y: { grid: { color: 'rgba(63, 63, 77, 0.2)' }, ticks: { color: '#A3A3B2', font: { family: 'Satoshi' } }, beginAtZero: true }
            }
        }
    });
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

export function renderDashboardOverview(user, account, rank, allContributions) {
    const totalContributions = allContributions?.length || 0; 
    
    setTimeout(() => initializeChart(allContributions), 50);

    return `
        <header class="animate-fade-in-up">
            <h1 class="text-3xl font-bold">Welcome, <span class="pulse-text">${user?.display_name ?? 'Contributor'}</span></h1>
            <p class="text-text-secondary">Here's your performance snapshot today.</p>
        </header>

        <div class="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style="animation-delay: 100ms;">
            
            <div class="col-span-2 bg-gradient-to-br from-accent-purple/80 to-accent-pink/80 p-6 rounded-xl text-white shadow-lg shadow-accent-purple/20">
                <p class="text-sm font-medium text-purple-200">Total Balance</p>
                <p class="text-5xl font-bold mt-2">${account?.lum_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? '0.00'} $LUM</p>
            </div>

            ${renderStatCard('Global Rank', rank ? rank.toLocaleString() : 'N/A')}
            ${renderStatCard('Contributions', totalContributions.toLocaleString())}
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6 items-start">
            <div class="xl:col-span-3 animate-fade-in-up bg-surface p-6 rounded-xl border border-primary h-full flex flex-col" style="animation-delay: 200ms;">
                <h3 class="font-bold text-lg mb-4 text-text-main">Earnings (Last 30 Days)</h3>
                <div class="relative flex-grow h-64 md:h-80"><canvas id="earningsChartCanvas"></canvas></div>
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