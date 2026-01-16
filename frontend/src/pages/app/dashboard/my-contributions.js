import { api, fetchContributions, fetchPayouts } from '../../../lib/auth.js';
import { getStatusClasses, getStatusText, escapeHtml, icons, renderFeedbackModal } from './utils.js';

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

function formatAnnotationText(text) {
    if (!text) return '';
    // Escape HTML first, then replace backticked content with styled code tags
    return escapeHtml(text).replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-300">$1</code>');
}

function renderScoreBar(label, score, tooltipText) {
    const normalizedScore = (score === undefined || score === null) ? 0 : Math.max(0, Math.min(1, score));
    const percentage = normalizedScore * 100;
    const scoreText = (normalizedScore * 10).toFixed(1);

    return `
        <div>
            <div class="flex justify-between items-center text-sm mb-1">
                <span class="font-medium text-text-secondary flex items-center">
                    ${label}
                    ${tooltipText ? `<span class="tooltip-trigger ml-1.5 w-4 h-4 flex items-center justify-center bg-subtle text-text-main rounded-full text-xs font-bold cursor-help" data-tooltip="${tooltipText}">?</span>` : ''}
                </span>
                <span class="font-mono font-bold text-text-main">${scoreText}<span class="text-text-secondary font-sans">/10</span></span>
            </div>
            <div class="w-full bg-primary rounded-full h-2.5">
                <div class="bg-accent-primary h-2.5 rounded-full" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

function renderKeyMetric(label, value, tooltipText) {
    return `
        <div class="flex justify-between items-center text-sm py-2 border-b border-primary/50">
            <span class="text-text-secondary flex items-center">
                ${label}
                ${tooltipText ? `<span class="tooltip-trigger ml-1.5 w-4 h-4 flex items-center justify-center bg-subtle text-text-main rounded-full text-xs font-bold cursor-help" data-tooltip="${tooltipText}">?</span>` : ''}
            </span>
            <span class="font-mono text-text-main bg-primary px-2 py-1 rounded-md">${value}</span>
        </div>
    `;
}

function renderAndOpenDetailPanel(item) {
    const panelId = `detail-panel-${item.id}`;
    if (document.getElementById(panelId)) return;

    const details = item.valuation_details || {};
    const languageBreakdown = details.language_breakdown || {};
    const languageEntries = Object.entries(languageBreakdown);
    const rewardUsd = item.reward_amount ?? 0;
    const lumenEquivalent = (details.simulated_lum_price_usd && details.simulated_lum_price_usd > 0) ? (rewardUsd / details.simulated_lum_price_usd) : 0;
    const codeAnnotations = details.code_annotations || [];

    const openSourceWarningHtml = item.is_open_source ? `
        <div class="mb-6 p-4 bg-yellow-400/10 border border-yellow-500/20 text-yellow-700 rounded-md text-sm">
            <strong>Public Code Detected:</strong> Our engine found a high similarity with public code. To prioritize novel data, the reward for this submission has been significantly reduced.
        </div>
    ` : '';
    
    let annotationsHtml = '';
    if (codeAnnotations.length > 0) {
        annotationsHtml = `
            <div class="mt-6 bg-primary/50 p-6 rounded-lg border border-primary">
                <h3 class="font-bold text-lg text-text-main mb-4">AI Code Insights</h3>
                <div class="space-y-4">
                    ${codeAnnotations.map(ann => {
                        let borderColor = 'border-primary';
                        let textColor = 'text-text-secondary';
                        let typeBadgeColor = 'bg-primary text-text-secondary';
                        
                        const typeLower = ann.type.toLowerCase();
                        if (typeLower.includes('security') || typeLower.includes('bug')) {
                            borderColor = 'border-red-500/30';
                            typeBadgeColor = 'bg-red-500/10 text-red-600';
                        } else if (typeLower.includes('optimization') || typeLower.includes('perf')) {
                            borderColor = 'border-yellow-500/30';
                            typeBadgeColor = 'bg-yellow-500/10 text-yellow-600';
                        } else if (typeLower.includes('praise') || typeLower.includes('good')) {
                             borderColor = 'border-green-500/30';
                            typeBadgeColor = 'bg-green-500/10 text-green-600';
                        }

                        return `
                        <div class="p-4 bg-surface rounded-md border ${borderColor}">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-mono font-bold text-text-main bg-primary px-1.5 py-0.5 rounded">${escapeHtml(ann.file)}:${ann.line}</span>
                                    <span class="text-xs font-bold px-2 py-0.5 rounded-full ${typeBadgeColor}">${escapeHtml(ann.type)}</span>
                                </div>
                            </div>
                            <p class="text-sm ${textColor}">${formatAnnotationText(ann.message)}</p>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    const panelHtml = `
        <div id="${panelId}" class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div class="absolute inset-0 overflow-hidden">
                <div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                <div class="fixed inset-y-0 right-0 pl-10 max-w-full flex">
                    <div class="w-screen max-w-4xl transform transition ease-in-out duration-300 translate-x-full">
                        <div class="h-full flex flex-col bg-surface shadow-xl">
                            <header class="p-6 bg-primary/50 border-b border-primary">
                                <div class="flex items-start justify-between">
                                    <div class="flex-grow">
                                        <h2 class="text-lg font-bold text-text-main" id="slide-over-title">Contribution Details</h2>
                                        <p class="text-sm text-text-secondary">Valuation report for submission #${item.id}</p>
                                    </div>
                                    <div class="ml-3 h-7 flex items-center">
                                        <button type="button" class="close-panel-btn bg-surface rounded-md text-text-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-accent-primary">
                                            <span class="sr-only">Close panel</span>
                                            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </header>
                            <div class="relative flex-1 p-6 overflow-y-auto" data-lenis-prevent>
                                ${openSourceWarningHtml}
                                <div class="text-center mb-8 p-6 bg-primary rounded-lg border border-subtle">
                                    <p class="text-sm font-bold text-text-secondary uppercase tracking-widest">Contribution Value</p>
                                    <p class="text-5xl lg:text-6xl font-bold text-accent-primary mt-1">$${rewardUsd.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</p>
                                    <p class="text-lg font-medium text-text-secondary mt-1">≈ ${lumenEquivalent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} $LUMEN</p>
                                </div>

                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div class="bg-primary/50 p-6 rounded-lg border border-primary flex flex-col">
                                        <h3 class="font-bold text-lg text-text-main mb-2 flex-shrink-0">AI Analysis Summary</h3>
                                        <div class="prose prose-sm prose-p:text-text-secondary max-w-none leading-relaxed flex-grow">
                                            ${details.analysis_summary ? `<p>${escapeHtml(details.analysis_summary).replace(/\n/g, '</p><p>')}</p>` : '<p>No summary provided by the AI analysis.</p>'}
                                        </div>
                                    </div>

                                    <div class="space-y-6">
                                        <div class="bg-primary/50 p-6 rounded-lg border border-primary">
                                            <h3 class="font-bold text-lg text-text-main mb-4">Valuation Scores</h3>
                                            <div class="space-y-4">
                                                ${renderScoreBar('Project Clarity', details.project_clarity_score, "The AI's score for how original, clear, and non-generic the project's purpose is. A simple 'to-do app' is low, while a specialized tool is high.")}
                                                ${renderScoreBar('Architecture', details.architectural_quality_score, "The AI's score for how well the code is structured. Well-organized, modular projects score higher than monolithic files.")}
                                                ${renderScoreBar('Code Quality', details.code_quality_score, "The AI's score for the code's cleanliness and maintainability, assessing variable names, potential for bugs, and adherence to best practices.")}
                                            </div>
                                        </div>
                                        <div class="bg-primary/50 p-6 rounded-lg border border-primary">
                                            <h3 class="font-bold text-lg text-text-main mb-3">Key Metrics</h3>
                                            <div class="space-y-1">
                                                ${renderKeyMetric('Tokens Analyzed', details.total_tokens?.toLocaleString() ?? 'N/A', "The number of tokens in the code, measured by a standard tokenizer (tiktoken's cl100k_base). On average, one line of code is 8-12 tokens.")}
                                                ${renderKeyMetric('Avg. Complexity', details.avg_complexity?.toFixed(2) ?? 'N/A', "A measure of the code's structural complexity. Higher values indicate more intricate logic and decision paths.")}
                                                ${details.innovation_multiplier ? renderKeyMetric('Innovation Multiplier', `${details.innovation_multiplier.toFixed(2)}x`, "Applied to updates of your own projects. A higher value indicates more significant changes and new logic were added.") : ''}
                                                ${renderKeyMetric('Uniqueness Multiplier', `${details.rarity_multiplier?.toFixed(2) ?? 'N/A'}x`, "A score based on how unique your code is compared to all other contributions on the network. Highly novel code gets a higher multiplier.")}
                                            </div>
                                        </div>
                                        <div class="bg-primary/50 p-6 rounded-lg border border-primary">
                                            <h3 class="font-bold text-lg text-text-main mb-3">Detailed Valuation Factors</h3>
                                            <div class="space-y-1">
                                                ${details.ai_weighted_multiplier ? renderKeyMetric('AI Weighted Score', details.ai_weighted_multiplier.toFixed(4), "The combined, weighted average of the three AI-driven quality scores (Clarity, Architecture, Quality).") : ''}
                                                ${details.code_ratio ? renderKeyMetric('Code Ratio', details.code_ratio.toFixed(2), "The proportion of the codebase identified as high-value code versus other text types like markdown or configuration files.") : ''}
                                                ${details.code_ratio_multiplier ? renderKeyMetric('Code Ratio Multiplier', `${details.code_ratio_multiplier.toFixed(2)}x`, "A multiplier applied based on the Code Ratio. Projects with a higher concentration of pure code receive a higher multiplier.") : ''}
                                                ${details.working_code_ratio ? renderKeyMetric('Working Code Ratio', `${(details.working_code_ratio * 100).toFixed(0)}%`, "The AI's estimation of how much of the submitted code is coherent and functional versus being boilerplate or non-functional filler.") : ''}
                                                ${details.compression_ratio ? renderKeyMetric('Compression Ratio', details.compression_ratio.toFixed(3), "A measure of the code's entropy. A lower ratio indicates less repetitive code and higher information density, which is more valuable.") : ''}
                                                ${details.total_lloc ? renderKeyMetric('Logical Lines of Code', details.total_lloc.toLocaleString(), "The total number of executable lines of code, ignoring comments and blank lines.") : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                ${annotationsHtml}
                                
                                ${languageEntries.length > 0 ? `
                                    <div class="mt-6 bg-primary/50 p-6 rounded-lg border border-primary">
                                        <h3 class="font-bold text-lg text-text-main mb-3">Language Breakdown</h3>
                                        <div class="space-y-1 text-sm">
                                            ${languageEntries.map(([lang, count]) => `
                                                <div class="flex justify-between items-center py-1 border-b border-primary/50">
                                                    <span class="text-text-secondary">${lang}</span>
                                                    <span class="font-mono text-text-main">${count.toLocaleString()} ${count === 1 ? 'file' : 'files'}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', panelHtml);
    document.body.classList.add('modal-open');
    const panel = document.getElementById(panelId);
    const panelContent = panel.querySelector('.w-screen');
    const overlay = panel.querySelector('.bg-opacity-75');

    const closePanel = () => {
        panelContent.classList.add('translate-x-full');
        overlay.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => {
            panel.remove();
            if (document.querySelectorAll('.fixed.inset-0').length === 0) {
                document.body.classList.remove('modal-open');
            }
        }, 300);
    };

    setTimeout(() => {
        panelContent.classList.remove('translate-x-full');
        overlay.classList.add('opacity-100');
    }, 10);

    panel.querySelector('.close-panel-btn').addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);
}

function renderSingleContributionRow(item) {
    return `
    <tr class="contribution-row" data-id="${item.id}">
        <td class="py-4 px-4 text-text-secondary">${new Date(item.created_at).toLocaleDateString()}</td>
        <td class="py-4 px-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(item.status, item.is_open_source)}">${getStatusText(item.status, item.is_open_source)}</span></td>
        <td class="py-4 px-4 text-right font-mono ${item.reward_amount > 0 ? 'text-green-600' : 'text-text-secondary'}">${item.reward_amount > 0 ? `+$${item.reward_amount.toFixed(4)}` : '...'}</td>
        <td class="py-4 px-4 text-center">
            <button class="details-btn text-text-secondary hover:text-accent-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" data-id="${item.id}" ${item.status !== 'PROCESSED' && item.status !== 'PROCESSED_UPDATE' ? 'disabled' : ''}>
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
                <thead class="text-xs text-text-secondary uppercase border-b border-primary">
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
                        <div class="w-12 h-12 text-subtle mb-4">${icons.contributions}</div>
                        <p>No contributions found yet.</p>
                        <a href="/docs/contributing" class="mt-2 text-sm font-semibold text-accent-primary hover:text-red-700 transition">Learn how to contribute</a>
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
            COMPLETED: 'bg-green-500/10 text-green-600',
            PENDING: 'bg-yellow-500/10 text-yellow-600',
            FAILED: 'bg-red-500/10 text-red-600',
            RECONCILED: 'bg-blue-500/10 text-blue-600'
        };
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status] || 'bg-gray-500/10 text-gray-600'}">${status}</span>`;
    };

    return `
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="text-xs text-text-secondary uppercase border-b border-primary">
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
                        <td class="py-4 px-4 text-right font-mono text-accent-primary">$${payout.amount_usd.toFixed(4)}</td>
                        <td class="py-4 px-4 text-center">
                            ${payout.transaction_hash ? `<a href="https://solscan.io/tx/${payout.transaction_hash}" target="_blank" rel="noopener noreferrer" class="text-accent-primary hover:underline">View</a>` : '<span class="text-subtle">-</span>'}
                        </td>
                    </tr>
                `).join('') : `<tr><td colspan="4" class="py-12 text-center text-text-secondary">
                    <div class="flex flex-col items-center">
                        <div class="w-12 h-12 text-subtle mb-4">${icons.dashboard}</div>
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

        document.getElementById('contributions-table-container').innerHTML = renderContributionHistory(result.items);
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
                renderAndOpenDetailPanel(contributionItem);
            } else {
                 console.warn(`Contribution with id ${id} not found in master list. Trying paginated list as a fallback.`);
                 const fallbackItem = window.dashboardState.paginatedContributions.find(c => c.id === id);
                 if (fallbackItem) {
                    renderAndOpenDetailPanel(fallbackItem);
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
                tab.classList.remove('border-accent-primary', 'text-text-main');
                tab.classList.add('border-transparent', 'text-text-secondary');
            });
            clickedTab.classList.remove('border-transparent', 'text-text-secondary');
            clickedTab.classList.add('border-accent-primary', 'text-text-main');
            
            views.forEach(view => view.classList.add('hidden'));
            const targetView = document.getElementById(clickedTab.dataset.view);
            targetView.classList.remove('hidden');

            if (clickedTab.dataset.view === 'payouts-view' && !targetView.dataset.loaded) {
                targetView.innerHTML = `<div class="text-center p-8"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-primary rounded-full"></span></div>`;
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
                    <button data-view="contributions-view" class="history-tab-btn pb-3 border-b-2 border-accent-primary text-text-main font-semibold">Contributions</button>
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