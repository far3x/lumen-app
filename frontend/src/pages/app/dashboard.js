import { getUser } from '../../lib/auth.js';
import Chart from 'chart.js/auto';

function renderChartContainer() {
    return `
    <div class="bg-surface p-6 rounded-lg border border-primary h-full flex flex-col">
        <h3 class="font-bold text-lg mb-4 text-text-main">
            Performance Analytics
        </h3>
        <div class="relative flex-grow h-64 md:h-80">
            <canvas id="earningsChartCanvas"></canvas>
        </div>
    </div>
    `;
}

function initializeChart() {
    const ctx = document.getElementById('earningsChartCanvas');
    if (!ctx) return;

    const labels = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const dataPoints = [10, 12, 8, 15, 20, 25, 22, 30, 35, 40, 38, 45, 50, 60, 55, 65, 70, 75, 72, 80, 90, 95, 100, 110, 120, 115, 130, 140, 135, 150].map(v => v + Math.random() * 10);

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(138, 43, 226, 0.4)');
    gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '$LUM Earned',
                data: dataPoints,
                borderColor: '#8A2BE2',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8A2BE2',
                pointBorderColor: '#fff',
                pointHoverRadius: 6,
                pointHoverBorderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#13131A',
                    titleColor: '#E5E5E5',
                    bodyColor: '#A3A3B2',
                    padding: 10,
                    borderColor: '#3F3F4D',
                    borderWidth: 1,
                    boxPadding: 4,
                    callbacks: {
                        label: function(context) {
                            return `+ ${context.parsed.y.toFixed(2)} $LUM`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(63, 63, 77, 0.3)' },
                    ticks: { color: '#A3A3B2', font: { family: 'Satoshi' } }
                },
                y: {
                    grid: { color: 'rgba(63, 63, 77, 0.3)' },
                    ticks: { color: '#A3A3B2', font: { family: 'Satoshi' } },
                    beginAtZero: true
                }
            }
        }
    });
}

function renderActivityTabs() {
    const activity = [
        { id: 'a1b2', project: 'Private ML Pipeline', lang: 'Python', earnings: 128.42, time: '2h ago', status: 'Complete' },
        { id: 'c3d4', project: 'Game Engine Core', lang: 'Rust', earnings: 350.91, time: '8h ago', status: 'Complete' },
        { id: 'e5f6', project: 'DeFi Protocol v2', lang: 'Solidity', earnings: 215.50, time: '1d ago', status: 'Complete' },
        { id: 'g7h8', project: 'Internal Dashboard UI', lang: 'TypeScript', earnings: 88.70, time: '2d ago', status: 'Complete' },
        { id: 'i9j0', project: 'New Trading Algorithm', lang: 'Python', earnings: 0, time: 'Just now', status: 'Processing' },
    ];
    const networkFeed = [
         { type: 'contribution', user: 'User-a4b8', project: 'Project-f91c', value: '112.9 $LUM', time: '12s ago' },
         { type: 'join', user: 'User-c3d4', time: '45s ago' },
         { type: 'contribution', user: 'User-e5f6', project: 'Project-b2a8', value: '34.5 $LUM', time: '1m ago' },
         { type: 'contribution', user: 'User-g7h8', project: 'Project-d6e3', value: '205.1 $LUM', time: '3m ago' },
    ];
    const feedIcons = {
        contribution: `<svg class="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>`,
        join: `<svg class="w-5 h-5 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>`
    };

    return `
        <div class="bg-surface rounded-lg border border-primary">
            <div class="px-6 pt-4 border-b border-primary">
                <nav class="flex space-x-4" aria-label="Tabs">
                    <button id="tab-my-contributions" data-tab-target="panel-my-contributions" class="tab-button bg-primary text-text-main px-4 py-2 text-sm font-bold rounded-t-md">My Contributions</button>
                    <button id="tab-network-feed" data-tab-target="panel-network-feed" class="tab-button text-text-secondary hover:text-text-main px-4 py-2 text-sm font-bold rounded-t-md">Live Network Feed</button>
                </nav>
            </div>
            <div class="p-6">
                <div id="panel-my-contributions" class="tab-panel">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead class="text-xs text-subtle uppercase">
                                <tr>
                                    <th class="py-2 px-4">Project</th>
                                    <th class="py-2 px-4">Language</th>
                                    <th class="py-2 px-4">Status</th>
                                    <th class="py-2 px-4 text-right">Earnings</th>
                                    <th class="py-2 px-4 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-primary">
                            ${activity.map(item => `
                                <tr>
                                    <td class="py-3 px-4 font-medium">${item.project}</td>
                                    <td class="py-3 px-4 text-text-secondary">${item.lang}</td>
                                    <td class="py-3 px-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Complete' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300 animate-pulse'}">${item.status}</span></td>
                                    <td class="py-3 px-4 text-right font-mono ${item.earnings > 0 ? 'text-green-400' : 'text-text-secondary'}">${item.earnings > 0 ? `+${item.earnings.toFixed(2)}` : '...'}</td>
                                    <td class="py-3 px-4 text-right text-text-secondary">${item.time}</td>
                                </tr>
                            `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="panel-network-feed" class="tab-panel hidden">
                    <ul class="space-y-4">
                        ${networkFeed.map(item => `<li class="flex items-center space-x-4"><div class="p-2 bg-primary rounded-full">${feedIcons[item.type]}</div><div class="flex-grow text-sm"><p class="text-text-main">${item.type === 'contribution' ? `<strong>${item.user}</strong> contributed to <strong>${item.project}</strong>` : `<strong>${item.user}</strong> joined the network`}</p><p class="text-text-secondary">${item.type === 'contribution' ? `and earned ${item.value}` : 'Welcome!'}</p></div><span class="text-xs text-subtle font-mono">${item.time}</span></li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function renderCommunityAndGrowth() {
    const topContributors = [
        { rank: 1, name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', earnings: 12842.50 },
        { rank: 2, name: 'Maria', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', earnings: 11230.10 },
        { rank: 3, name: 'Kenji', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', earnings: 9875.00 },
    ];
    return `
        <div class="space-y-8">
            <div class="bg-surface p-6 rounded-lg border border-primary">
                <h3 class="font-bold text-lg mb-4">Top Earners</h3>
                <div class="space-y-4">
                    ${topContributors.map(user => `<div class="flex items-center space-x-4"><span class="font-mono text-sm text-subtle w-6">#${user.rank}</span><img src="${user.avatar}" class="w-10 h-10 rounded-full" alt="${user.name}"><div class="flex-grow"><p class="font-bold text-text-main">${user.name}</p></div><p class="font-bold text-sm text-accent-cyan">${user.earnings.toLocaleString()} $LUM</p></div>`).join('')}
                </div>
            </div>
            <div class="bg-surface p-6 rounded-lg border border-primary">
                <h3 class="font-bold text-lg mb-4">Maximize Your Earnings</h3>
                <ul class="space-y-3 text-sm">
                    <li class="flex items-start space-x-3"><svg class="w-4 h-4 text-accent-purple flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg><span class="text-text-secondary">Contribute code from <strong class="text-text-main">private, proprietary projects</strong> for the highest rewards.</span></li>
                    <li class="flex items-start space-x-3"><svg class="w-4 h-4 text-accent-purple flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg><span class="text-text-secondary">Projects in <strong class="text-text-main">Rust, Go, and TypeScript</strong> are currently in high demand.</span></li>
                </ul>
            </div>
        </div>
    `;
}

function setupDashboardEventListeners() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.replace('bg-primary', 'text-text-secondary'));
            tabPanels.forEach(panel => panel.classList.add('hidden'));
            button.classList.replace('text-text-secondary', 'bg-primary');
            document.getElementById(button.dataset.tabTarget)?.classList.remove('hidden');
        });
    });

    initializeChart();
}

export async function renderDashboard() {
    const user = getUser();
    const stats = { balance: 5432.12, rank: 1337 };

    const content = `
    <main class="flex-grow bg-abyss-dark pt-28">
        <div class="container mx-auto px-6 pb-10 space-y-12">
            
            <header class="animate-fade-in-up">
                <h1 class="text-3xl font-bold">Dashboard</h1>
                <p class="text-text-secondary">An overview of your contributions and network status.</p>
            </header>

            <section class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style="animation-delay: 100ms;">
                <div class="lg:col-span-2 bg-surface p-6 rounded-lg border border-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p class="text-sm font-medium text-text-secondary">Your Total Balance</p>
                        <p class="text-5xl font-bold mt-2 gradient-text">${stats.balance.toLocaleString()} $LUM</p>
                    </div>
                    <a href="/docs/contributing" class="px-6 py-3 font-bold bg-primary text-text-main rounded-lg transition-all duration-300 hover:bg-subtle/80 hover:-translate-y-1 self-start sm:self-center">
                        Contribute Now
                    </a>
                </div>
                <div class="bg-surface p-6 rounded-lg border border-primary">
                    <p class="text-sm font-medium text-text-secondary">Global Rank</p>
                    <p class="text-5xl font-bold mt-2">#${stats.rank.toLocaleString()}</p>
                </div>
            </section>

            <div class="gradient-divider"></div>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <section class="xl:col-span-2 flex flex-col space-y-8 animate-fade-in-up" style="animation-delay: 200ms;">
                    <h2 class="text-2xl font-bold">Performance Analytics</h2>
                    ${renderChartContainer()}
                </section>

                <section class="xl:col-span-1 space-y-8 animate-fade-in-up" style="animation-delay: 300ms;">
                    <h2 class="text-2xl font-bold">Community & Growth</h2>
                    ${renderCommunityAndGrowth()}
                </section>
            </div>
            
            <div class="gradient-divider"></div>

             <section class="animate-fade-in-up" style="animation-delay: 400ms;">
                <h2 class="text-2xl font-bold mb-4">Activity Hub</h2>
                ${renderActivityTabs()}
            </section>
        </div>
    </main>
    `;

    setTimeout(setupDashboardEventListeners, 0);
    return content;
}