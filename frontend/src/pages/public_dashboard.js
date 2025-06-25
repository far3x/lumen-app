import { fetchLeaderboard, fetchRecentContributions, isAuthenticated } from '../lib/auth.js';
import { icons } from './app/dashboard/utils.js';

function getRankBadge(rank) {
    const baseClass = "w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold shrink-0";
    if (rank === 1) return `<div class="${baseClass} bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/20">1</div>`;
    if (rank === 2) return `<div class="${baseClass} bg-slate-300 text-slate-800 shadow-lg shadow-slate-300/20">2</div>`;
    if (rank === 3) return `<div class="${baseClass} bg-yellow-600 text-yellow-100 shadow-lg shadow-yellow-600/20">3</div>`;
    return `<div class="w-8 text-center text-sm font-mono text-subtle">${rank}</div>`;
}

function renderLeaderboardRow(entry) {
    const isTop3 = entry.rank <= 3;
    const bottomLineClass = isTop3 
        ? 'h-px bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan'
        : 'h-px bg-primary';

    return `
        <div>
            <div class="flex items-center space-x-4 p-4">
                <div class="w-10 text-center">${getRankBadge(entry.rank)}</div>
                <div class="flex-grow font-medium text-text-main truncate text-base">${entry.display_name}</div>
                <p class="font-medium text-sm gradient-text font-mono">${entry.total_lum_earned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $LUM</p>
            </div>
            <div class="${bottomLineClass}"></div>
        </div>
    `;
}

function renderEmptyRow(rank) {
    return `
        <div>
            <div class="flex items-center space-x-4 p-4 opacity-40">
                <div class="w-10 text-center text-sm font-mono text-subtle">${rank}</div>
                <div class="flex-grow font-medium text-subtle italic truncate">Waiting for contributor...</div>
                <p class="font-medium text-sm text-subtle font-mono">-</p>
            </div>
            <div class="h-px bg-primary/50 border-t border-dashed border-primary/20"></div>
        </div>
    `;
}

// --- MODIFIED FUNCTION ---
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
                <li class="flex items-center justify-between animate-fade-in-up py-1">
                    <div class="text-sm">
                        <p class="text-text-main">
                            <strong class="font-bold">${item.user_display_name}</strong> contributed new code to the network.
                        </p>
                        <p class="text-text-secondary mt-1">
                            Reward: <strong class="font-medium text-green-400">+${item.reward_amount.toFixed(4)} $LUM</strong>
                        </p>
                    </div>
                    <span class="text-xs text-subtle font-mono whitespace-nowrap pl-4">${new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </li>
            `).join('')}
        </ul>
    `;
}

function renderPageLayout(leaderboard, userRank, recentContributions) {
    const yourRankCard = (isAuthenticated() && userRank) ? `
        <div class="bg-surface rounded-lg p-4 flex items-center justify-between gap-4 animate-fade-in-up" style="animation-delay: 200ms;">
            <div class="flex items-center gap-4">
                <span class="text-lg font-bold">Your Rank</span>
                <div class="w-px h-8 bg-primary"></div>
                <span class="text-3xl font-bold text-text-main">#${userRank.rank.toLocaleString()}</span>
            </div>
            <span class="font-mono text-lg gradient-text font-bold">${userRank.total_lum_earned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $LUM</span>
        </div>
        <div class="h-px bg-gradient-to-r from-accent-purple to-accent-cyan my-4 animate-fade-in-up" style="animation-delay: 200ms;"></div>
    ` : '';
    
    const leaderboardItems = Array.from({ length: 10 }, (_, i) => {
        const entry = leaderboard[i];
        if (entry) {
            return renderLeaderboardRow(entry);
        } else {
            return renderEmptyRow(i + 1);
        }
    }).join('');

    return `
        <div class="container mx-auto px-6 py-20 min-h-screen">
            <div class="text-center max-w-3xl mx-auto animate-fade-in-up">
                <h1 class="text-5xl md:text-6xl font-bold mb-4 pulse-text">Network Hub</h1>
                <p class="mt-4 text-lg text-text-secondary">
                    The architects of the future of AI. Track top contributors and see the latest network activity live.
                </p>
            </div>

            <div class="max-w-6xl mx-auto mt-16 grid lg:grid-cols-3 gap-12">
                <div class="lg:col-span-2">
                    ${yourRankCard}
                    <div class="animate-fade-in-up" style="animation-delay: 400ms;">
                        <div class="flex items-center text-xs text-subtle uppercase px-4 py-2">
                            <div class="w-10 text-center">Rank</div>
                            <div class="flex-grow pl-4">Contributor</div>
                            <div class="text-right">Earnings</div>
                        </div>
                        <div class="space-y-1">
                            ${leaderboardItems}
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-1 animate-fade-in-up" style="animation-delay: 600ms;">
                    <h3 class="font-bold text-xl mb-4 text-text-main">Recent Network Activity</h3>
                    <div class="bg-surface p-4 rounded-lg border border-primary">
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
            fetchRecentContributions(5) // Fetch the 5 most recent
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