import { api, fetchContributions, fetchPayouts } from '../../../lib/auth.js';
import { getStatusClasses, getStatusText, renderModal, escapeHtml, icons, renderFeedbackModal } from './utils.js';

export let contributionsState = {
    currentPage: 1,
    isLoading: false,
    isLastPage: false,
    totalContributions: 0,
};

export function resetContributionsState() {
    document.removeEventListener('contributionUpdate', handleContributionUpdate);
    const total = contributionsState.totalContributions;
    contributionsState = { currentPage: 1, isLoading: false, isLastPage: false, totalContributions: total };
}

function handleContributionUpdate(event) {
    const updatedContrib = event.detail;
    if (!window.dashboardState || !window.dashboardState.allUserContributions) return;

    const allContributions = window.dashboardState.allUserContributions;

    const index = allContributions.findIndex(c => c.id === updatedContrib.id);
    if (index !== -1) {
        allContributions[index] = updatedContrib;
    } else {
        allContributions.unshift(updatedContrib);
    }
    
    if (contributionsState.currentPage === 1) {
        const paginatedIndex = window.dashboardState.paginatedContributions.findIndex(c => c.id === updatedContrib.id);
        if (paginatedIndex !== -1) {
            window.dashboardState.paginatedContributions[paginatedIndex] = updatedContrib;
        } else {
            window.dashboardState.paginatedContributions.unshift(updatedContrib);
        }
    }

    const row = document.querySelector(`.contribution-row[data-id='${updatedContrib.id}']`);
    if (row) {
        row.outerHTML = renderSingleContributionRow(updatedContrib);
        attachDetailModalListeners();
    } else {
        if (contributionsState.currentPage === 1) {
            const tableBody = document.querySelector('#contributions-table-container tbody');
            if (tableBody) {
                const emptyRow = tableBody.querySelector('td[colspan="4"]');
                if (emptyRow) {
                    tableBody.innerHTML = '';
                }
                tableBody.insertAdjacentHTML('afterbegin', renderSingleContributionRow(updatedContrib));
                attachDetailModalListeners();
            }
        }
    }
}

function triggerContextualFeedback() {
    const key = 'lumen_feedback_prompt_contributions';
    const lastPrompted = localStorage.getItem(key);
    
    if (lastPrompted) {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (parseInt(lastPrompted) > oneWeekAgo) {
            return;
        }
    }

    if (contributionsState.totalContributions >= 3) {
        setTimeout(() => {
            renderFeedbackModal();
            localStorage.setItem(key, Date.now().toString());
        }, 1500);
    }
}

function renderScoreBar(label, score) {
    const normalizedScore = (score === undefined || score === null) ? 0 : Math.max(0, Math.min(1, score));
    const percentage = normalizedScore * 100;
    const scoreText = (normalizedScore * 10).toFixed(1);

    return `
        <div>
            <div class="flex justify-between items-center text-sm mb-1">
                <span class="font-medium text-text-secondary">${label}</span>
                <span class="font-mono font-bold text-text-main">${scoreText}<span class="text-text-secondary font-sans">/10</span></span>
            </div>
            <div class="w-full bg-primary rounded-full h-2.5">
                <div class="bg-gradient-to-r from-accent-purple to-accent-pink h-2.5 rounded-full" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

function renderContributionDetailModal(item) {
    const details = item.valuation_details || {};
    const languageBreakdown = details.language_breakdown || {};
    const languageEntries = Object.entries(languageBreakdown);
    const rewardUsd = item.reward_amount ?? 0;
    const lumenEquivalent = (details.simulated_lum_price_usd && details.simulated_lum_price_usd > 0) ? (rewardUsd / details.simulated_lum_price_usd) : 0;

    const renderKeyMetric = (label, value) => `
        <div class="flex justify-between items-center text-sm py-2 border-b border-primary/50">
            <span class="text-text-secondary">${label}</span>
            <span class="font-mono text-text-main bg-primary px-2 py-1 rounded-md">${value}</span>
        </div>
    `;
    
    const content = `
        <div class="text-text-main">
            <div class="text-center mb-8">
                <p class="text-sm font-bold text-text-secondary uppercase tracking-widest">Contribution Value</p>
                <p class="text-5xl lg:text-6xl font-bold gradient-text mt-1">$${rewardUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</p>
                <p class="text-lg font-medium text-text-secondary mt-1">≈ ${lumenEquivalent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} $LUMEN</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div class="lg:col-span-3 bg-surface p-6 rounded-xl border border-primary flex flex-col">
                    <h3 class="font-bold text-lg text-text-main mb-2 flex-shrink-0">AI Analysis Summary</h3>
                    <div class="prose prose-base prose-invert max-w-none leading-relaxed text-text-secondary flex-grow">
                        ${details.analysis_summary ? `<p>${escapeHtml(details.analysis_summary).replace(/\n/g, '</p><p>')}</p>` : '<p>No summary provided by the AI analysis.</p>'}
                    </div>
                    ${languageEntries.length > 0 ? `
                        <div class="border-t border-primary pt-4 mt-6 flex-shrink-0">
                            <h4 class="font-bold text-text-secondary mb-3">Languages Detected</h4>
                            <div class="flex flex-wrap gap-2">
                                ${languageEntries.map(([lang, count]) => `<span class="lang-tag">${lang}</span>`).join('')}
                            </div>
                        </div>
                    `: ''}
                </div>

                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-surface p-6 rounded-xl border border-primary">
                        <h3 class="font-bold text-lg text-text-main mb-4">Valuation Scores</h3>
                        <div class="space-y-4">
                            ${renderScoreBar('Project Clarity', details.project_clarity_score)}
                            ${renderScoreBar('Architecture', details.architectural_quality_score)}
                            ${renderScoreBar('Code Quality', details.code_quality_score)}
                        </div>
                    </div>
                    <div class="bg-surface p-6 rounded-xl border border-primary">
                        <h3 class="font-bold text-lg text-text-main mb-3">Key Metrics</h3>
                        <div class="space-y-1">
                            ${renderKeyMetric('Tokens Analyzed', details.total_tokens?.toLocaleString() ?? 'N/A')}
                            ${renderKeyMetric('Avg. Complexity', details.avg_complexity?.toFixed(2) ?? 'N/A')}
                            ${renderKeyMetric('Uniqueness Multiplier', `${details.rarity_multiplier?.toFixed(2) ?? 'N/A'}x`)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    renderModal(`Contribution #${item.id} Details`, content, { size: '3xl' });
}

function renderSingleContributionRow(item) {
    return `
    <tr class="contribution-row" data-id="${item.id}">
        <td class="py-4 px-4 text-text-secondary">${new Date(item.created_at).toLocaleDateString()}</td>
        <td class="py-4 px-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(item.status)}">${getStatusText(item.status)}</span></td>
        <td class="py-4 px-4 text-right font-mono ${item.reward_amount > 0 ? 'text-green-400' : 'text-text-secondary'}">${item.reward_amount > 0 ? `+$${item.reward_amount.toFixed(4)}` : '...'}</td>
        <td class="py-4 px-4 text-center">
            <button class="details-btn text-text-secondary hover:brightness-150 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100" data-id="${item.id}" ${item.status !== 'PROCESSED' ? 'disabled' : ''}>
                ${icons.view}
            </button>
        </td>
    </tr>
    `;
}

function renderContributionHistory(contributions) {
    return `
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="text-xs text-subtle uppercase border-b border-primary">
                    <tr>
                        <th class="py-3 px-4">Date</th>
                        <th class="py-3 px-4">Status</th>
                        <th class="py-3 px-4 text-right">Reward (USD)</th>
                        <th class="py-3 px-4 text-center">Details</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-primary">
                ${contributions.length > 0 ? contributions.map(renderSingleContributionRow).join('') : `<tr><td colspan="4" class="py-12 text-center text-text-secondary">
                    <div class="flex flex-col items-center">
                        <div class="w-12 h-12 text-accent-purple mb-4">${icons.contributions}</div>
                        <p>No contributions found yet.</p>
                        <a href="/docs/contributing" class="mt-2 text-sm font-semibold gradient-text hover:brightness-125 transition">Learn how to contribute</a>
                    </div>
                </td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}

function renderPayoutHistory(payouts) {
    const getPayoutStatus = (status) => {
        const classes = {
            COMPLETED: 'bg-green-900/50 text-green-300',
            PENDING: 'bg-yellow-900/50 text-yellow-300',
            FAILED: 'bg-red-900/50 text-red-300',
            RECONCILED: 'bg-blue-900/50 text-blue-300'
        };
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status] || 'bg-gray-700/50 text-gray-300'}">${status}</span>`;
    };

    return `
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="text-xs text-subtle uppercase border-b border-primary">
                    <tr>
                        <th class="py-3 px-4">Date</th>
                        <th class="py-3 px-4">Status</th>
                        <th class="py-3 px-4 text-right">Amount (USDC)</th>
                        <th class="py-3 px-4 text-center">Transaction</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-primary">
                ${payouts.length > 0 ? payouts.map(payout => `
                    <tr>
                        <td class="py-4 px-4 text-text-secondary">${new Date(payout.created_at).toLocaleDateString()}</td>
                        <td class="py-4 px-4">${getPayoutStatus(payout.status)}</td>
                        <td class="py-4 px-4 text-right font-mono text-accent-cyan">$${payout.amount_usd.toFixed(4)}</td>
                        <td class="py-4 px-4 text-center">
                            ${payout.transaction_hash ? `<a href="https://solscan.io/tx/${payout.transaction_hash}" target="_blank" rel="noopener noreferrer" class="text-accent-cyan hover:underline">View</a>` : '<span class="text-subtle">-</span>'}
                        </td>
                    </tr>
                `).join('') : `<tr><td colspan="4" class="py-12 text-center text-text-secondary">
                    <div class="flex flex-col items-center">
                        <div class="w-12 h-12 text-accent-cyan mb-4">${icons.dashboard}</div>
                        <p>No payouts have been processed yet.</p>
                        <p class="text-xs mt-1">Your first payout will appear here after the next batch.</p>
                    </div>
                </td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}

function renderContributionsPagination() {
    return `
        <div id="contributions-pagination" class="flex justify-between items-center mt-4 px-4 py-2">
            <button id="prev-page-btn" class="px-4 py-2 text-sm font-medium bg-primary hover:bg-subtle/80 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
            </button>
            <span class="text-sm text-text-secondary">Page ${contributionsState.currentPage}</span>
            <button id="next-page-btn" class="px-4 py-2 text-sm font-medium bg-primary hover:bg-subtle/80 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Next
            </button>
        </div>
    `;
}

async function changeContributionsPage(direction, dashboardState) {
    if (contributionsState.isLoading) return;
    
    const newPage = contributionsState.currentPage + direction;
    if (newPage < 1) return;
    
    contributionsState.isLoading = true;
    updatePaginationButtons();
    
    try {
        const result = await fetchContributions(newPage, 10);
        contributionsState.currentPage = newPage;
        contributionsState.totalContributions = result.total;
        contributionsState.isLastPage = (contributionsState.currentPage * 10) >= result.total;
        
        dashboardState.paginatedContributions = result.items;

        document.getElementById('contributions-view').innerHTML = renderContributionHistory(result.items);
        attachDetailModalListeners();
    } catch (error) {
        console.error("Failed to fetch new page of contributions:", error);
    } finally {
        contributionsState.isLoading = false;
        updatePaginationButtons();
    }
}

function updatePaginationButtons() {
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const pageSpan = document.querySelector('#contributions-pagination span');
    
    if (prevBtn) prevBtn.disabled = contributionsState.currentPage === 1 || contributionsState.isLoading;
    if (nextBtn) nextBtn.disabled = contributionsState.isLastPage || contributionsState.isLoading;
    if (pageSpan) pageSpan.textContent = `Page ${contributionsState.currentPage}`;
}

function attachDetailModalListeners() {
    document.querySelectorAll('.details-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            if (!window.dashboardState || !window.dashboardState.allUserContributions) {
                console.error("Dashboard state not available for finding contribution details.");
                return;
            }
            const contributionItem = window.dashboardState.allUserContributions.find(c => c.id === id);
            if (contributionItem) {
                renderContributionDetailModal(contributionItem);
            } else {
                 console.warn(`Contribution with id ${id} not found in master list. Trying paginated list as a fallback.`);
                 const fallbackItem = window.dashboardState.paginatedContributions.find(c => c.id === id);
                 if (fallbackItem) {
                    renderContributionDetailModal(fallbackItem);
                 } else {
                    console.error(`Contribution with id ${id} not found in any available list.`);
                 }
            }
        });
    });
}

export async function attachContributionPageListeners(dashboardState) {
    window.dashboardState = dashboardState;
    attachDetailModalListeners();

    const tabs = document.querySelectorAll('.history-tab-btn');
    const views = document.querySelectorAll('.history-view');

    tabs.forEach(clickedTab => {
        clickedTab.addEventListener('click', async () => {
            tabs.forEach(tab => {
                tab.classList.remove('border-accent-cyan', 'text-text-main');
                tab.classList.add('border-transparent', 'text-text-secondary');
            });
            clickedTab.classList.remove('border-transparent', 'text-text-secondary');
            clickedTab.classList.add('border-accent-cyan', 'text-text-main');
            
            views.forEach(view => view.classList.add('hidden'));
            const targetView = document.getElementById(clickedTab.dataset.view);
            targetView.classList.remove('hidden');

            if (clickedTab.dataset.view === 'payouts-view' && !targetView.dataset.loaded) {
                targetView.innerHTML = `<div class="text-center p-8"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span></div>`;
                const payouts = await fetchPayouts();
                targetView.innerHTML = renderPayoutHistory(payouts);
                targetView.dataset.loaded = 'true';
            }
        });
    });

    document.getElementById('prev-page-btn')?.addEventListener('click', () => changeContributionsPage(-1, dashboardState));
    document.getElementById('next-page-btn')?.addEventListener('click', () => changeContributionsPage(1, dashboardState));
    updatePaginationButtons();
    document.addEventListener('contributionUpdate', handleContributionUpdate);
    triggerContextualFeedback();
}

export function renderMyContributionsPage(initialContributions) {
    const showPagination = contributionsState.totalContributions > 10;

    return `
        <header>
            <h1 class="text-3xl font-bold">History</h1>
            <p class="text-text-secondary mt-1">A detailed history of your code submissions and payouts.</p>
        </header>

        <div class="mt-8">
            <div class="border-b border-primary mb-6">
                <nav class="flex space-x-6">
                    <button data-view="contributions-view" class="history-tab-btn pb-3 border-b-2 border-accent-cyan text-text-main font-semibold">Contributions</button>
                    <button data-view="payouts-view" class="history-tab-btn pb-3 border-b-2 border-transparent text-text-secondary hover:text-text-main font-semibold">Payouts</button>
                </nav>
            </div>
            
            <div id="contributions-view" class="history-view">
                <div class="bg-surface p-2 sm:p-6 rounded-lg border border-primary">
                    <div id="contributions-table-container">
                        ${renderContributionHistory(initialContributions)}
                    </div>
                    ${showPagination ? renderContributionsPagination() : ''}
                </div>
            </div>

            <div id="payouts-view" class="history-view hidden">
                <div class="bg-surface p-2 sm:p-6 rounded-lg border border-primary">
                    <div id="payouts-table-container">
                        <div class="text-center p-8 text-text-secondary">Click the "Payouts" tab to load your history.</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}