import { fetchLeaderboard, fetchRecentContributions, isAuthenticated } from '../lib/auth.js';
import { icons } from './app/dashboard/utils.js';
import { DateTime } from 'luxon';

function getRankBadge(rank) {
    const baseClass = "w-10 h-10 flex items-center justify-center rounded-lg text-base font-bold shrink-0";
    if (rank === 1) return `<div class="${baseClass} bg-amber-400 text-amber-900 shadow-lg shadow-amber-500/30 ring-1 ring-amber-300">1</div>`;
    if (rank === 2) return `<div class="${baseClass} bg-slate-300 text-slate-800 shadow-lg shadow-slate-400/30 ring-1 ring-slate-200">2</div>`;
    if (rank === 3) return `<div class="${baseClass} bg-yellow-600 text-yellow-100 shadow-lg shadow-yellow-700/30 ring-1 ring-yellow-500">3</div>`;
    return `<div class="w-10 h-10 flex items-center justify-center text-sm font-mono text-subtle">${rank}</div>`;
}

function renderLeaderboardRow(entry) {
    return `
        <div class="bg-primary/30 hover:bg-primary/60 transition-colors rounded-lg">
            <div class="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-3">
                <div class="w-10 text-center">${getRankBadge(entry.rank)}</div>
                <div class="font-medium text-text-main truncate text-sm md:text-base">${entry.display_name}</div>
                <p class="font-semibold text-sm md:text-base gradient-text font-mono text-right">$${entry.total_usd_earned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
        </div>
    `;
}

function renderEmptyRow(rank) {
    return `
        <div class="bg-transparent">
            <div class="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-3 opacity-40">
                <div class="w-10 h-10 flex items-center justify-center text-sm font-mono text-subtle">${rank}</div>
                <div class="font-medium text-subtle italic truncate text-sm">Waiting for contributor...</div>
                <p class="font-semibold text-sm text-subtle font-mono text-right">-</p>
            </div>
        </div>
    `;
}

function renderRecentActivityFeed(contributions) {
    if (!contributions || contributions.length === 0) {
        return `
        <div class="text-center p-8 text-text-secondary">
            <div class="flex flex-col items-center">
                <div class="w-12 h-12 text-accent-cyan mb-4">${icons.feed}</div>
                <p>No network activity yet. Be the first to contribute!</p>
            </div>
        </div>
        `;
    }

    return `
        <ul class="space-y-4">
            ${contributions.map(item => `
                <li class="animate-fade-in-up">
                    <div class="flex items-start justify-between space-x-4">
                        <div class="flex-grow text-sm">
                            <p class="text-text-main">
                                <strong class="font-bold">${item.user_display_name}</strong> contributed new code to the network.
                            </p>
                            <p class="text-text-secondary mt-1">
                                Reward: <strong class="font-medium text-green-400">+$${item.reward_amount.toFixed(4)} USD</strong>
                            </p>
                        </div>
                        <span class="text-xs text-subtle font-mono whitespace-nowrap pt-1 shrink-0">${DateTime.fromISO(item.created_at).toRelative()}</span>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
}

function renderPageLayout(leaderboard, userRank, recentContributions) {
    const yourRankCard = (isAuthenticated() && userRank) ? `
        <div class="max-w-7xl mx-auto animate-fade-in-up" style="animation-delay: 200ms;">
            <div class="bg-surface/30 backdrop-blur-md rounded-xl p-4 flex items-center justify-between gap-4 border border-primary">
                <div class="flex items-center gap-4">
                    <span class="text-lg font-bold">Your Rank</span>
                    <div class="w-px h-8 bg-primary"></div>
                    <span class="text-3xl font-bold text-text-main">#${userRank.rank.toLocaleString()}</span>
                </div>
                <span class="font-mono text-lg gradient-text font-bold">$${userRank.total_usd_earned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
        </div>
    ` : '';
    
    const leaderboardItems = Array.from({ length: 5 }, (_, i) => {
        const entry = leaderboard[i];
        return entry ? renderLeaderboardRow(entry) : renderEmptyRow(i + 1);
    }).join('');

    return `
        <div class="container mx-auto px-6 py-20 min-h-screen">
            <div class="text-center max-w-3xl mx-auto animate-fade-in-up mb-16">
                <h1 class="text-5xl md:text-6xl font-bold mb-4 pulse-text">Network Hub</h1>
                <p class="mt-4 text-lg text-text-secondary">
                    The architects of the future of AI. Track top contributors and see the latest network activity live.
                </p>
            </div>
            
            ${yourRankCard}

            <div class="max-w-7xl mx-auto mt-8 grid lg:grid-cols-5 gap-12 items-start">
                <div class="lg:col-span-3 animate-fade-in-up" style="animation-delay: 400ms;">
                    <div class="bg-surface/30 backdrop-blur-md p-4 rounded-xl border border-primary">
                         <div class="flex items-center text-xs text-subtle uppercase px-3 py-2 mb-2">
                            <div class="w-10 text-center">Rank</div>
                            <div class="flex-grow pl-4">Contributor</div>
                            <div class="text-right">Lifetime Earnings</div>
                        </div>
                        <div class="space-y-2">
                            ${leaderboardItems}
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2 animate-fade-in-up" style="animation-delay: 600ms;">
                    <div class="bg-surface/30 backdrop-blur-md p-6 rounded-xl border border-primary">
                        ${renderRecentActivityFeed(recentContributions)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

export async function renderPublicDashboard() {
    let leaderboardData = [];
    let userRank = null;
    let recentContributions = [];

    try {
        const [leaderboardResponse, recentContribResponse] = await Promise.all([
            fetchLeaderboard(),
            fetchRecentContributions(5)
        ]);
        
        leaderboardData = leaderboardResponse.top_users || [];
        userRank = leaderboardResponse.current_user_rank || null;
        recentContributions = recentContribResponse || [];

    } catch (error) {
        console.error("Could not load public dashboard data:", error);
    }

    return `
        <main class="flex-grow pt-20 relative isolate overflow-hidden">
            <video
                autoplay
                loop
                muted
                playsinline
                class="absolute top-0 left-0 w-full h-full object-cover -z-20"
                src="/plexus-bg.mp4"
            ></video>
            <div class="absolute top-0 left-0 w-full h-full bg-black/70 -z-10"></div>
            <div class="relative z-10">
                 ${renderPageLayout(leaderboardData, userRank, recentContributions)}
            </div>
        </main>
    `;
}