import { icons } from './utils.js';

function renderActivityItem(item) {
    if (item.type === 'CONTRIBUTION') {
        const rewardText = item.reward_amount > 0 
            ? `<strong class="font-medium text-green-400">+$${item.reward_amount.toFixed(4)}</strong>`
            : `<strong class="font-medium text-text-secondary">No reward granted</strong>`;

        return `
            <li class="flex items-start space-x-4 animate-fade-in-up">
                <div class="p-3 bg-primary rounded-full mt-1 text-accent-purple">${icons.contributions}</div>
                <div class="flex-grow text-sm">
                    <p class="text-text-main">
                        <strong class="font-bold">You</strong> contributed new code to the network.
                    </p>
                    <p class="text-text-secondary mt-1">
                        Valuation: ${rewardText}
                    </p>
                </div>
                <span class="text-xs text-subtle font-mono whitespace-nowrap">${new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </li>
        `;
    }

    if (item.type === 'PAYOUT') {
        return `
            <li class="flex items-start space-x-4 animate-fade-in-up">
                <div class="p-3 bg-primary rounded-full mt-1 text-green-400">${icons.dashboard}</div>
                <div class="flex-grow text-sm">
                    <p class="text-text-main">
                        <strong class="font-bold">A payout</strong> was processed to your wallet.
                    </p>
                    <p class="text-text-secondary mt-1">
                        Amount: <strong class="font-medium text-accent-cyan">$${item.amount_usd.toFixed(4)} USDC</strong>
                    </p>
                     <a href="https://solscan.io/tx/${item.transaction_hash}?cluster=devnet" target="_blank" rel="noopener noreferrer" class="text-xs text-accent-cyan hover:underline">View on Solscan</a>
                </div>
                <span class="text-xs text-subtle font-mono whitespace-nowrap">${new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </li>
        `;
    }

    return '';
}

function renderFeed(events) {
    return `
        <ul class="space-y-6">
            ${events.length > 0 ? events.map(renderActivityItem).join('') : `
                <li class="text-text-secondary text-center p-8">
                    <div class="flex flex-col items-center">
                        <div class="text-accent-purple mb-4">${icons.feed}</div>
                        <p>No personal activity found yet.</p>
                        <a href="/docs/contributing" class="mt-2 text-sm text-accent-cyan hover:underline">Learn how to contribute</a>
                    </div>
                </li>`}
        </ul>
    `;
}

export function renderRecentActivityPage(contributions, payouts) {
    const contributionsWithType = (contributions || []).map(item => ({ ...item, type: 'CONTRIBUTION' }));
    const payoutsWithType = (payouts || []).map(item => ({ ...item, type: 'PAYOUT' }));

    const combinedActivity = [...contributionsWithType, ...payoutsWithType];

    combinedActivity.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return `
        <header>
            <h1 class="text-3xl font-bold">My Activity</h1>
            <p class="text-text-secondary mt-1">A timeline of your personal contributions and payouts.</p>
        </header>
        <div id="live-feed-container" class="bg-surface p-6 rounded-lg border border-primary mt-8">
            ${renderFeed(combinedActivity)}
        </div>
    `;
}