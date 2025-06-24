import { fetchLeaderboard, isAuthenticated } from '../lib/auth.js';

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

function renderLeaderboard(leaderboard, userRank) {
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
    
    const listItems = Array.from({ length: 10 }, (_, i) => {
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
                <h1 class="text-5xl md:text-6xl font-bold mb-4 pulse-text">Global Leaderboard</h1>
                <p class="mt-4 text-lg text-text-secondary">
                    The architects of the future of AI. Top contributors earn prestige and bonus rewards.
                </p>
            </div>

            <div class="max-w-3xl mx-auto mt-16">
                ${yourRankCard}
                
                <div class="animate-fade-in-up" style="animation-delay: 400ms;">
                    <div class="flex items-center text-xs text-subtle uppercase px-4 py-2">
                        <div class="w-10 text-center">Rank</div>
                        <div class="flex-grow pl-4">Contributor</div>
                        <div class="text-right">Earnings</div>
                    </div>
                    <div class="space-y-1">
                        ${listItems}
                    </div>
                </div>
            </div>

            <div class="text-center mt-20 animate-fade-in-up" style="animation-delay: 600ms;">
                <h3 class="font-bold text-2xl">How to Climb the Ranks</h3>
                <p class="text-text-secondary mt-2 max-w-xl mx-auto">Your rank is determined by your total lifetime $LUM earnings. Contribute high-quality, unique code to maximize your rewards and secure your spot on the podium.</p>
                <a href="/docs/contributing" class="mt-6 inline-block px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110">
                    Learn How to Contribute
                </a>
            </div>
        </div>
    `;
}

export async function renderPublicDashboard() {
    let leaderboardData = [];
    let userRank = null;

    try {
        const leaderboardResponse = await fetchLeaderboard();
        leaderboardData = leaderboardResponse.top_users || [];
        userRank = leaderboardResponse.current_user_rank || null;
    } catch (error) {
        console.error("Could not load leaderboard data:", error);
        leaderboardData = [];
        userRank = null;
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
                 ${renderLeaderboard(leaderboardData, userRank)}
            </div>
        </main>
    `;
}