import { api, fetchContributions } from '../../../lib/auth.js';
import { getStatusClasses, getStatusText, renderModal, escapeHtml, icons } from './utils.js';

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
    const allContributions = window.dashboardState?.allContributions || [];

    const index = allContributions.findIndex(c => c.id === updatedContrib.id);
    if (index !== -1) {
        allContributions[index] = updatedContrib;
    } else {
        allContributions.unshift(updatedContrib);
    }
    
    const row = document.querySelector(`.contribution-row[data-id='${updatedContrib.id}']`);
    if (row) {
        row.outerHTML = renderSingleContributionRow(updatedContrib);
        attachDetailModalListeners(allContributions);
    } else {
        const tableBody = document.querySelector('#contributions-table-container tbody');
        if (tableBody) {
            const emptyRow = tableBody.querySelector('td[colspan="5"]');
            if (emptyRow) {
                tableBody.innerHTML = '';
            }
            tableBody.insertAdjacentHTML('afterbegin', renderSingleContributionRow(updatedContrib));
            attachDetailModalListeners(allContributions);
        }
    }
}

function renderProTipsSection() {
    const tips = [
        { icon: '💡', title: 'Uniqueness is King', text: 'Code from private, proprietary projects is far more valuable than public, open-source code.' },
        { icon: '💎', title: 'Complexity is Rewarded', text: 'Projects with intricate logic and novel algorithms are valued more highly than simple scripts.' },
        { icon: '🎯', title: 'Code with Intent', text: 'Well-structured, documented, and high-signal code provides the best data for training next-gen AI.' },
    ];

    return `
    <div class="mt-12">
        <h3 class="font-bold text-lg text-text-main mb-4">Pro Tips for Maximizing Rewards</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${tips.map(tip => `
            <div class="bg-surface p-5 rounded-xl border border-primary hover:border-accent-purple/50 transition-colors">
                <p class="text-xl mb-2">${tip.icon}</p>
                <h4 class="font-bold text-text-main">${tip.title}</h4>
                <p class="text-sm text-text-secondary mt-1">${tip.text}</p>
            </div>
        `).join('')}
        </div>
    </div>
    `;
}

function renderScoreBar(label, score) {
    if (score === undefined || score === null) return '';
    const percentage = score * 100;
    return `
        <div class="text-sm">
            <div class="flex justify-between mb-1">
                <span class="text-text-secondary">${label}</span>
                <span class="font-medium text-text-main">${(score * 10).toFixed(1)}/10</span>
            </div>
            <div class="w-full bg-primary rounded-full h-2">
                <div class="bg-gradient-to-r from-accent-purple to-accent-cyan h-2 rounded-full" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

function renderContributionDetailModal(item) {
    const details = item.valuation_details || {};
    const languageBreakdown = details.language_breakdown || {};
    const languageEntries = Object.entries(languageBreakdown);

    const content = `
        <div class="space-y-6">
            <div class="text-center border-b border-primary pb-6">
                <p class="text-text-secondary text-sm">Final Reward</p>
                <p class="text-5xl font-bold gradient-text mt-1">+${(item.reward_amount ?? 0).toFixed(4)} $LUM</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div class="space-y-4">
                    <h3 class="font-bold text-text-main">Valuation Metrics</h3>
                    <ul class="space-y-2 text-sm">
                        <li class="flex justify-between">
                            <span class="text-text-secondary">Tokens Analyzed</span>
                            <span class="font-mono text-text-main">${details.total_tokens?.toLocaleString() ?? 'N/A'}</span>
                        </li>
                        <li class="flex justify-between">
                            <span class="text-text-secondary">Avg. Complexity Score</span>
                            <span class="font-mono text-text-main">${details.avg_complexity?.toFixed(2) ?? 'N/A'}</span>
                        </li>
                         <li class="flex justify-between">
                            <span class="text-text-secondary">Uniqueness Multiplier</span>
                            <span class="font-mono text-text-main">${details.rarity_multiplier?.toFixed(2) ?? 'N/A'}x</span>
                        </li>
                        <li class="flex justify-between">
                            <span class="text-text-secondary">Network Growth Multiplier</span>
                            <span class="font-mono text-text-main">${details.network_growth_multiplier?.toFixed(2) ?? 'N/A'}x</span>
                        </li>
                    </ul>
                    ${languageEntries.length > 0 ? `
                        <div>
                            <h4 class="font-medium text-text-main text-sm mb-2">Languages Detected</h4>
                            <div class="flex flex-wrap gap-2">
                                ${languageEntries.map(([lang, count]) => `
                                    <span class="text-xs font-medium bg-primary text-text-secondary px-2 py-1 rounded-full">${lang}</span>
                                `).join('')}
                            </div>
                        </div>
                    `: ''}
                </div>
                
                <div class="space-y-4">
                    <h3 class="font-bold text-text-main">AI Analysis</h3>
                    <div class="bg-primary/50 p-4 rounded-lg space-y-4">
                        ${renderScoreBar('Project Clarity', details.project_clarity_score)}
                        ${renderScoreBar('Architectural Quality', details.architectural_quality_score)}
                        ${renderScoreBar('Code Quality', details.code_quality_score)}
                    </div>
                     ${details.analysis_summary ? `
                        <div>
                             <h4 class="font-medium text-text-main text-sm mb-2">AI Summary</h4>
                            <p class="text-sm text-text-secondary leading-relaxed max-h-24 overflow-y-auto pr-2">${escapeHtml(details.analysis_summary)}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            ${item.transaction_hash ? `
            <div class="text-center pt-6 border-t border-primary">
                 <a href="https://solscan.io/tx/${item.transaction_hash}?cluster=devnet" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-accent-cyan hover:underline text-sm font-medium">
                    View on Solscan
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>` : ''}
        </div>
    `;
    renderModal(`Contribution #${item.id} Details`, content, { size: 'lg' });
}

function renderSingleContributionRow(item) {
    return `
    <tr class="contribution-row" data-id="${item.id}">
        <td class="py-4 px-4 text-text-secondary">${new Date(item.created_at).toLocaleDateString()}</td>
        <td class="py-4 px-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(item.status)}">${getStatusText(item.status)}</span></td>
        <td class="py-4 px-4 text-right font-mono ${item.reward_amount > 0 ? 'text-green-400' : 'text-text-secondary'}">${item.reward_amount > 0 ? `+${item.reward_amount.toFixed(4)}` : '...'}</td>
        <td class="py-4 px-4 text-center">
            <button class="details-btn text-text-secondary hover:brightness-150 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100" data-id="${item.id}" ${item.status !== 'PROCESSED' ? 'disabled' : ''}>
                ${icons.view}
            </button>
        </td>
        <td class="py-4 px-4 text-center">
            ${item.transaction_hash ? `
                <a href="https://solscan.io/tx/${item.transaction_hash}?cluster=devnet" target="_blank" rel="noopener noreferrer" class="inline-block text-text-secondary hover:brightness-150 transition-all" title="View on Solscan">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke="url(#dashboard-icon-gradient)" /></svg>
                </a>
            ` : `
                <span class="text-subtle">-</span>
            `}
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
                        <th class="py-3 px-4 text-right">Reward ($LUM)</th>
                        <th class="py-3 px-4 text-center">Details</th>
                        <th class="py-3 px-4 text-center">Proof</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-primary">
                ${contributions.length > 0 ? contributions.map(renderSingleContributionRow).join('') : `<tr><td colspan="5" class="py-12 text-center text-text-secondary">
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
        
        dashboardState.allContributions.length = 0;
        dashboardState.allContributions.push(...result.items);

        document.getElementById('contributions-table-container').innerHTML = renderContributionHistory(result.items);
        attachDetailModalListeners(dashboardState.allContributions);
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

function attachDetailModalListeners(allContributions) {
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            const contributionItem = allContributions.find(c => c.id === id);
            if (contributionItem) {
                renderContributionDetailModal(contributionItem);
            }
        });
    });
}

export function attachContributionPageListeners(dashboardState) {
    window.dashboardState = dashboardState;
    attachDetailModalListeners(dashboardState.allContributions);
    document.getElementById('prev-page-btn')?.addEventListener('click', () => changeContributionsPage(-1, dashboardState));
    document.getElementById('next-page-btn')?.addEventListener('click', () => changeContributionsPage(1, dashboardState));
    updatePaginationButtons();
    document.addEventListener('contributionUpdate', handleContributionUpdate);
}

export function renderMyContributionsPage(initialContributions) {
    const showPagination = contributionsState.totalContributions > 10;

    return `
        <header>
            <h1 class="text-3xl font-bold">My Contributions</h1>
            <p class="text-text-secondary mt-1">A detailed history of your code submissions and their valuation.</p>
        </header>
        ${renderProTipsSection()}
        <div class="bg-surface p-2 sm:p-6 rounded-lg border border-primary mt-8">
            <div id="contributions-table-container">
                ${renderContributionHistory(initialContributions)}
            </div>
            ${showPagination ? renderContributionsPagination() : ''}
        </div>
    `;
}