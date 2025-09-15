import { icons } from './utils.js';

function renderActivityItem(item) {
    if (item.type === 'CONTRIBUTION') {
        const rewardText = item.reward_amount > 0 
            ? `<strong class="font-medium text-green-600">+$${item.reward_amount.toFixed(4)}</strong>`
            : `<strong class="font-medium text-text-secondary">No reward granted</strong>`;

        return `
            <li class="flex items-start space-x-4 animate-fade-in-up">
                <div class="p-3 bg-primary rounded-lg mt-1 text-accent-primary">${icons.contributions}</div>
                <div class="flex-grow text-sm">
                    <p class="text-text-main">
                        <strong class="font-bold">You</strong> contributed new code to the network.
                    </p>
                    <p class="text-text-secondary mt-1">
                        Valuation: ${rewardText}
                    </p>
                </div>
                <span class="text-xs text-text-secondary font-mono whitespace-nowrap">${new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </li>
        `;
    }

    if (item.type === 'PAYOUT') {
        const isSuccess = item.status === 'COMPLETED';
        const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';
        const titleText = isSuccess ? 'A payout was processed to your wallet.' : `A payout of $${item.amount_usd.toFixed(4)} has failed.`;
        
        let detailsHtml = '';
        if (isSuccess) {
            detailsHtml = `
                <p class="text-text-secondary mt-1">
                    Amount: <strong class="font-medium text-accent-primary">$${item.amount_usd.toFixed(4)} USDC</strong>
                </p>
                ${item.transaction_hash ? `<a href="https://solscan.io/tx/${item.transaction_hash}" target="_blank" rel="noopener noreferrer" class="text-xs text-accent-primary hover:underline">View on Solscan</a>` : ''}
            `;
        } else {
            detailsHtml = `
                <p class="text-text-secondary mt-1">
                    Status: <strong class="font-medium text-red-600">${item.status}</strong>
                </p>
                ${item.error_message ? `<p class="text-xs text-red-500/80 mt-1">${item.error_message}</p>` : ''}
            `;
        }

        return `
            <li class="flex items-start space-x-4 animate-fade-in-up">
                <div class="p-3 bg-primary rounded-lg mt-1 ${iconColor}">${icons.dashboard}</div>
                <div class="flex-grow text-sm">
                    <p class="text-text-main">
                        <strong class="font-bold">${titleText}</strong>
                    </p>
                    ${detailsHtml}
                </div>
                <span class="text-xs text-text-secondary font-mono whitespace-nowrap">${new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
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
                        <div class="text-subtle mb-4">${icons.feed}</div>
                        <p>No personal activity found yet.</p>
                        <a href="/docs/contributing" class="mt-2 text-sm text-accent-primary hover:underline">Learn how to contribute</a>
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

    const recentActivity = combinedActivity.slice(0, 15);

    return `
        <header>
            <h1 class="text-3xl font-bold">My Activity</h1>
            <p class="text-text-secondary mt-1">A timeline of your personal contributions and payouts.</p>
        </header>
        <div id="live-feed-container" class="bg-surface p-6 rounded-lg border border-primary mt-8">
            ${renderFeed(recentActivity)}
        </div>
    `;
}