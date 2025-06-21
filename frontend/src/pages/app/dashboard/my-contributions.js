import { api, fetchContributions, checkContributionStatus, fetchAndStoreAccount } from '../../../lib/auth.js';
import { getStatusClasses, getStatusText, renderModal, escapeHtml, icons, updateBalancesInUI } from './utils.js';

export let contributionsState = {
    currentPage: 1,
    isLoading: false,
    isLastPage: false,
    totalContributions: 0,
    pollerId: null,
};

export function resetContributionsState() {
    if (contributionsState.pollerId) {
        clearInterval(contributionsState.pollerId);
    }
    const total = contributionsState.totalContributions;
    contributionsState = { currentPage: 1, isLoading: false, isLastPage: false, totalContributions: total, pollerId: null };
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
    const content = `
        <div class="space-y-6">
            <div>
                <h3 class="font-bold text-text-main mb-3">Valuation Report</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div class="bg-primary p-3 rounded-lg">
                        <p class="text-xs text-subtle">Tokens</p>
                        <p class="text-lg font-bold font-mono text-text-main">${item.manual_metrics?.total_tokens?.toLocaleString() ?? 'N/A'}</p>
                    </div>
                    <div class="bg-primary p-3 rounded-lg">
                        <p class="text-xs text-subtle">Complexity</p>
                        <p class="text-lg font-bold font-mono text-text-main">${item.manual_metrics?.avg_complexity?.toFixed(2) ?? 'N/A'}</p>
                    </div>
                    <div class="bg-primary p-3 rounded-lg">
                        <p class="text-xs text-subtle">Uniqueness</p>
                        <p class="text-lg font-bold font-mono text-text-main">${item.valuation_details?.rarity_multiplier?.toFixed(2) ?? 'N/A'}x</p>
                    </div>
                    <div class="bg-primary p-3 rounded-lg">
                        <p class="text-xs text-subtle">Halving</p>
                        <p class="text-lg font-bold font-mono text-text-main">${item.valuation_details?.halving_multiplier?.toFixed(2) ?? 'N/A'}x</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 class="font-bold text-text-main mb-3">AI Analysis</h3>
                <div class="bg-primary p-4 rounded-lg space-y-4">
                    ${renderScoreBar('Project Clarity', item.ai_analysis?.project_clarity_score)}
                    ${renderScoreBar('Architectural Quality', item.ai_analysis?.architectural_quality_score)}
                    ${renderScoreBar('Code Quality', item.ai_analysis?.code_quality_score)}
                    ${item.ai_analysis?.analysis_summary ? `
                        <div class="pt-4 border-t border-subtle/50">
                            <p class="text-sm text-text-secondary leading-relaxed">${escapeHtml(item.ai_analysis.analysis_summary)}</p>
                        </div>
                    ` : '<p class="text-sm text-text-secondary">No AI summary available for this contribution.</p>'}
                </div>
            </div>
            
            <div>
                <h3 class="font-bold text-text-main mb-3">Reward Breakdown</h3>
                <div class="bg-primary p-4 rounded-lg text-center">
                    <p class="text-text-secondary text-sm">Final Reward</p>
                    <p class="text-3xl font-bold gradient-text mt-1">+${item.reward_amount.toFixed(4)} $LUM</p>
                </div>
            </div>

        </div>
    `;
    renderModal(`Contribution #${item.id}`, content);
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
                    </tr>
                </thead>
                <tbody class="divide-y divide-primary">
                ${contributions.length > 0 ? contributions.map(item => `
                    <tr class="contribution-row" data-id="${item.id}">
                        <td class="py-4 px-4 text-text-secondary">${new Date(item.created_at).toLocaleDateString()}</td>
                        <td class="py-4 px-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(item.status)}">${getStatusText(item.status)}</span></td>
                        <td class="py-4 px-4 text-right font-mono ${item.reward_amount > 0 ? 'text-green-400' : 'text-text-secondary'}">${item.reward_amount > 0 ? `+${item.reward_amount.toFixed(4)}` : '...'}</td>
                        <td class="py-4 px-4 text-center">
                            <button class="details-btn text-text-secondary hover:text-text-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed" data-id="${item.id}" ${item.status !== 'PROCESSED' ? 'disabled' : ''}>
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                        </td>
                    </tr>
                `).join('') : `<tr><td colspan="4" class="py-12 text-center text-text-secondary">
                    <div class="flex flex-col items-center">
                        <div class="text-accent-purple mb-4">${icons.contributions}</div>
                        <p>No contributions found yet.</p>
                        <a href="/docs/contributing" class="mt-2 text-sm text-accent-cyan hover:underline">Learn how to contribute</a>
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

async function changeContributionsPage(direction, allContributions) {
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
        
        allContributions.length = 0;
        allContributions.push(...result.items);

        document.getElementById('contributions-table-container').innerHTML = renderContributionHistory(result.items);
        attachDetailModalListeners(allContributions);
        startContributionStatusPoller(allContributions);
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

function startContributionStatusPoller(allContributions) {
    const processingContributions = allContributions.filter(c => ['PENDING', 'PROCESSING'].includes(c.status));

    if (processingContributions.length === 0) {
        if (contributionsState.pollerId) {
            clearInterval(contributionsState.pollerId);
            contributionsState.pollerId = null;
        }
        return;
    }

    if (contributionsState.pollerId) return;

    contributionsState.pollerId = setInterval(async () => {
        let needsUIRefresh = false;

        for (const contrib of [...processingContributions]) {
            try {
                const statusResponse = await checkContributionStatus(contrib.id);
                if (statusResponse.data && !['PENDING', 'PROCESSING'].includes(statusResponse.data.status)) {
                    const fullContribResponse = await api.get(`/contributions/${contrib.id}`);
                    const updatedContrib = fullContribResponse.data;

                    const index = allContributions.findIndex(c => c.id === updatedContrib.id);
                    if (index !== -1) {
                        allContributions[index] = updatedContrib;
                    }
                    
                    needsUIRefresh = true;
                }
            } catch (error) {
                console.error(`Failed to check status for contribution ${contrib.id}`, error);
                needsUIRefresh = true;
                break;
            }
        }

        if (needsUIRefresh) {
            clearInterval(contributionsState.pollerId);
            contributionsState.pollerId = null;
            
            document.getElementById('contributions-table-container').innerHTML = renderContributionHistory(allContributions);
            attachDetailModalListeners(allContributions);
            startContributionStatusPoller(allContributions);
        }
    }, 5000);
}


export function attachContributionPageListeners(allContributions) {
    attachDetailModalListeners(allContributions);
    document.getElementById('prev-page-btn')?.addEventListener('click', () => changeContributionsPage(-1, allContributions));
    document.getElementById('next-page-btn')?.addEventListener('click', () => changeContributionsPage(1, allContributions));
    updatePaginationButtons();
    startContributionStatusPoller(allContributions);
}

export function renderMyContributionsPage(initialContributions) {
    const showPagination = contributionsState.totalContributions > 10;

    return `
        <header>
            <h1 class="text-3xl font-bold">My Contributions</h1>
            <p class="text-text-secondary mt-1">A detailed history of your code submissions and their valuation.</p>
        </header>
        <div class="bg-surface p-2 sm:p-6 rounded-lg border border-primary mt-8">
            <div id="contributions-table-container">
                ${renderContributionHistory(initialContributions)}
            </div>
            ${showPagination ? renderContributionsPagination() : ''}
        </div>
        ${renderProTipsSection()}
    `;
}