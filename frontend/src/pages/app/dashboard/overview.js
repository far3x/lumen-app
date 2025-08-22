import Chart from 'chart.js/auto';
import { icons, renderModal, updateBalancesInUI, LUMEN_TO_USD_RATE } from './utils.js';
import { api as authApi, fetchAndStoreAccount, getAccount } from '../../../lib/auth.js';
import { DateTime } from 'luxon';

let chartInstance = null;

function renderWalletSection(user, account) {
    const claimableBalance = account?.lum_balance || 0;
    const claimableBalanceUSD = claimableBalance * LUMEN_TO_USD_RATE;
    const isWalletLinked = !!user?.solana_address;
    
    let isClaimDisabled = !isWalletLinked || claimableBalance <= 0;
    let cooldownMessage = '';

    if (user && user.cooldown_until) {
        const now = DateTime.utc();
        const cooldownEnd = DateTime.fromISO(user.cooldown_until);
        if (now < cooldownEnd) {
            isClaimDisabled = true;
            cooldownMessage = `Reward claims are disabled during the pre-launch beta phase.`;
        }
    }

    const claimButtonHTML = `
        <button id="claim-rewards-btn"
                class="w-full md:w-auto px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110 shrink-0
                       ${isClaimDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
                ${isClaimDisabled ? 'disabled' : ''}>
            Claim Rewards
        </button>
    `;

    return `
    <div id="claim-button-area" class="mt-8 relative bg-surface p-8 rounded-xl border border-primary overflow-hidden shadow-2xl shadow-black/30">
        <div class="absolute -right-10 -top-10 text-primary/10">
            <svg class="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25-2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m15-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        </div>
        <div class="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
            <div class="flex-grow text-center md:text-left">
                <h3 class="text-2xl font-bold text-text-main">Claim Your Rewards</h3>
                <p class="text-text-secondary mt-1">
                    ${isWalletLinked ? 'Your rewards are ready to be claimed.' : 'Link your wallet in Settings to enable claims.'}
                </p>
                <p id="claim-rewards-btn-subtext" class="text-xs text-yellow-400 mt-2 h-4">${cooldownMessage}</p>
            </div>
            <div class="w-full md:w-auto flex flex-col items-center md:items-end">
                <div class="text-center md:text-right">
                    <p class="text-sm text-text-secondary">Claimable Balance</p>
                    <p class="text-3xl font-bold pulse-text font-mono">${claimableBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</p>
                    <p id="overview-claimable-balance-usd" class="text-base font-medium text-text-secondary font-sans mt-1">≈ $${(claimableBalanceUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
                    <p class="text-xs text-subtle italic mt-1">*Simulated value for beta phase.</p>
                </div>
                <div class="mt-4 w-full md:w-auto">
                    ${claimButtonHTML}
                </div>
            </div>
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
    gradient.addColorStop(0, 'rgba(138, 43, 226, 0.5)');
    gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');

    chartInstance = new Chart(canvas, {
        type: 'line', data: { labels, datasets: [{
            label: '$LUMEN Earned', data: dataPoints, borderColor: '#8A2BE2', backgroundColor: gradient,
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
                callbacks: { label: (c) => `+ ${c.parsed.y.toFixed(4)} $LUMEN` }
            }},
            scales: {
                x: { grid: { color: 'rgba(63, 63, 77, 0.2)' }, ticks: { color: '#A3A3B2', font: { family: 'Satoshi' } } },
                y: { grid: { color: 'rgba(63, 63, 77, 0.2)' }, ticks: { color: '#A3A3B2', font: { family: 'Satoshi' }, padding: 10 }, beginAtZero: true }
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
            btn.classList.remove('bg-primary', 'text-text-main');
            btn.classList.add('text-text-secondary');
        });
        button.classList.add('bg-primary', 'text-text-main');
        button.classList.remove('text-text-secondary');
    }
    
    const banner = document.getElementById('prelaunch-banner');
    const closeBtn = document.getElementById('close-banner-btn');
    if (closeBtn && banner) {
        closeBtn.addEventListener('click', () => {
            banner.style.display = 'none';
            localStorage.setItem('lumen_prelaunch_banner_dismissed', 'true');
        });
    }
}

export function renderDashboardOverview(user, account, rank, totalContributions) {
    const isBannerDismissed = localStorage.getItem('lumen_prelaunch_banner_dismissed') === 'true';
    const totalEarned = account?.total_lum_earned ?? 0;
    const totalEarnedUSD = totalEarned * LUMEN_TO_USD_RATE;

    return `
        <div id="prelaunch-banner" class="relative bg-yellow-900/30 border border-yellow-500/30 text-yellow-200 px-6 py-4 rounded-lg mb-6 flex items-start gap-4 ${isBannerDismissed ? 'hidden' : ''}">
            <div class="flex-shrink-0 mt-0.5">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div class="flex-grow">
                <h4 class="font-bold">Welcome to the Genesis Phase!</h4>
                <p class="text-sm text-yellow-300/80 mt-1">
                    Rewards are currently accruing and will be claimable once the protocol is revenue-positive. Early contributions receive a x2 bonus multiplier. <a href="/docs/roadmap" class="font-semibold text-yellow-100 hover:underline">Learn More</a>
                </p>
            </div>
            <button id="close-banner-btn" class="p-1 -mr-2 text-yellow-300/70 hover:text-yellow-200">&times;</button>
        </div>

        <header class="animate-fade-in-up">
            <h1 class="text-3xl font-bold">Welcome, <span class="pulse-text">${user?.display_name ?? 'Contributor'}</span></h1>
            <p class="text-text-secondary">Here's your performance snapshot today.</p>
        </header>

        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style="animation-delay: 100ms;">
            <div class="md:col-span-3 bg-gradient-to-br from-accent-purple/80 to-accent-pink/80 p-6 rounded-xl text-white shadow-lg shadow-accent-purple/20">
                <p class="text-sm font-medium text-purple-200">Total Earned (Lifetime)</p>
                <p id="overview-total-balance" class="text-5xl font-bold mt-2">${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $LUMEN</p>
                <p id="overview-total-balance-usd" class="text-lg font-medium text-purple-200/80 mt-1">≈ $${(totalEarnedUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
                <p class="text-xs text-purple-300/70 italic mt-1">*USD value is simulated for the beta phase. All earnings will be recalculated at the official token launch price when claims are enabled.</p>
            </div>

            ${renderStatCard('Global Rank', rank ? rank.toLocaleString() : 'N/A')}
            ${renderStatCard('Contributions', totalContributions.toLocaleString())}
            ${renderStatCard('Reward Multiplier', `${user?.reward_multiplier?.toFixed(1) ?? '1.0'}x`)}
        </div>

        <div class="animate-fade-in-up" style="animation-delay: 300ms;">
             ${renderWalletSection(user, account)}
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
    `;
}