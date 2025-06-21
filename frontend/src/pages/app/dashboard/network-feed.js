import { fetchRecentContributions } from '../../../lib/auth.js';
import { icons } from './utils.js';

function renderFeed(events) {
    return `
        <ul class="space-y-6">
            ${events.length > 0 ? events.map((item, index) => `
                <li class="flex items-start space-x-4 animate-fade-in-up" style="animation-delay: ${index * 70}ms">
                    <div class="p-3 bg-primary rounded-full mt-1 text-accent-cyan">${icons.feed}</div>
                    <div class="flex-grow text-sm">
                        <p class="text-text-main">
                            <strong class="font-bold">${item.user_display_name || 'Anonymous User'}</strong> contributed new code to the network.
                        </p>
                        <p class="text-text-secondary mt-1">
                            Valuation: <strong class="font-medium text-green-400">${item.reward_amount.toFixed(2)} $LUM</strong>
                        </p>
                    </div>
                    <span class="text-xs text-subtle font-mono whitespace-nowrap">${new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </li>
            `).join('') : `<li class="text-text-secondary text-center p-8">No recent network activity yet.</li>`}
        </ul>
    `;
}

export function renderRecentActivityPage(recentContributions) {
    return `
        <header>
            <h1 class="text-3xl font-bold">Recent Activity</h1>
            <p class="text-text-secondary mt-1">The latest contributions from developers across the globe.</p>
        </header>
        <div id="live-feed-container" class="bg-surface p-6 rounded-lg border border-primary mt-8">
            ${renderFeed(recentContributions)}
        </div>
    `;
}