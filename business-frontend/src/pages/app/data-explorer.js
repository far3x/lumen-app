import api from '../../lib/api.js';
import { stateService } from '../../lib/state.js';

let company = stateService.getState().company;
let availableLanguages = [];
let activeFilters = {
    keywords: '',
    languages: [],
    min_tokens: null,
    max_tokens: null,
    quality: { active: false, value: 7.0 },
    clarity: { active: false, value: 7.0 },
    arch: { active: false, value: 7.0 },
};

function renderSkeletonLoader() {
    return Array(5).fill('').map(() => `
        <div class="skeleton-loader p-4 rounded-lg">
            <div class="skeleton-line h-4 w-3/4 mb-3"></div>
            <div class="skeleton-line h-3 w-1/2"></div>
        </div>
    `).join('');
}

export async function attachDataExplorerListeners() {
    company = stateService.getState().company;
    if (company && company.plan === 'free') {
        return;
    }
    await fetchLanguages();
    renderFilterPanel();
    document.getElementById('apply-filters-btn')?.addEventListener('click', handleSearch);
    document.getElementById('reset-filters-btn')?.addEventListener('click', handleResetFilters);
    handleSearch();
}

function handleResultItemClick(e) {
    const itemElement = e.currentTarget;
    const itemData = JSON.parse(itemElement.dataset.item);
    document.querySelectorAll('.result-item').forEach(el => el.classList.remove('border-primary', 'bg-app-accent-hover'));
    itemElement.classList.add('border-primary', 'bg-app-accent-hover');
    renderDetailView(itemData);
}

async function fetchLanguages() {
    try {
        const response = await api.get('/business/data/languages');
        availableLanguages = response.data;
    } catch (error) {
        console.error("Failed to fetch languages:", error);
        availableLanguages = [];
    }
}

function renderFilterPanel() {
    const container = document.getElementById('filter-panel-container');
    if (!container) return;

    const scoreFilter = (id, label) => `
        <div>
            <div class="flex items-center justify-between">
                <label for="${id}-toggle" class="form-label">${label}</label>
                <label class="toggle-switch">
                    <input type="checkbox" id="${id}-toggle" class="toggle-switch-input peer">
                    <div class="toggle-switch-bg peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-primary"></div>
                </label>
            </div>
            <input type="number" id="${id}-input" min="0" max="10" step="0.1" placeholder="Min Score (0.0-10.0)" class="form-input mt-2" disabled>
        </div>
    `;

    container.innerHTML = `
        <h2 class="text-lg font-semibold text-text-headings">Filters</h2>
        <div class="space-y-6 mt-4">
            <div>
                <label for="keywords-input" class="form-label">Keywords in Summary</label>
                <input type="search" id="keywords-input" placeholder="e.g., 'async rust http'" class="form-input">
            </div>
            <div id="language-filter-container">
                <label class="form-label">Languages</label>
                <div class="mt-2 space-y-2 max-h-40 overflow-y-auto text-sm pr-2">
                    ${availableLanguages.map(lang => `
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" value="${lang}" class="custom-checkbox language-checkbox">
                            <span>${lang}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div>
                <label class="form-label">Token Count</label>
                <div class="flex items-center gap-2 mt-2">
                    <input type="number" id="min-tokens" placeholder="Min" min="0" class="form-input text-center">
                    <span class="text-text-muted">-</span>
                    <input type="number" id="max-tokens" placeholder="Max" min="0" class="form-input text-center">
                </div>
            </div>
            ${scoreFilter('quality', 'Min Code Quality')}
            ${scoreFilter('clarity', 'Min Clarity')}
            ${scoreFilter('arch', 'Min Architecture')}
            <div class="flex items-center gap-2 pt-2">
                <button id="reset-filters-btn" class="btn btn-secondary w-1/3">Reset</button>
                <button id="apply-filters-btn" class="btn btn-primary w-2/3">Apply Filters</button>
            </div>
        </div>
    `;

    document.querySelectorAll('.toggle-switch-input').forEach(toggle => {
        const input = document.getElementById(`${toggle.id.replace('-toggle', '')}-input`);
        toggle.addEventListener('change', () => {
            input.disabled = !toggle.checked;
        });
    });
}

function handleResetFilters() {
    document.getElementById('keywords-input').value = '';
    document.querySelectorAll('.language-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('min-tokens').value = '';
    document.getElementById('max-tokens').value = '';
    document.querySelectorAll('.toggle-switch-input').forEach(toggle => {
        toggle.checked = false;
        const input = document.getElementById(`${toggle.id.replace('-toggle', '')}-input`);
        input.value = '';
        input.disabled = true;
    });
    handleSearch();
}

async function handleSearch() {
    const resultsList = document.getElementById('results-list');
    const applyBtn = document.getElementById('apply-filters-btn');
    if (!resultsList || !applyBtn) return;
    
    applyBtn.disabled = true;
    applyBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Applying...`;

    resultsList.innerHTML = `<h2 class="text-lg font-semibold text-text-headings mb-4">Searching...</h2><div class="space-y-3">${renderSkeletonLoader()}</div>`;
    document.getElementById('detail-view').innerHTML = `<div class="p-8 text-center text-text-muted flex flex-col items-center justify-center h-full"><svg class="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7" /></svg><p class="mt-4 font-semibold">Select a result to see details</p></div>`;
    
    try {
        const searchParams = {
            limit: 20,
            keywords: document.getElementById('keywords-input').value || null,
            languages: Array.from(document.querySelectorAll('.language-checkbox:checked')).map(cb => cb.value),
            min_tokens: document.getElementById('min-tokens').value ? parseInt(document.getElementById('min-tokens').value) : null,
            max_tokens: document.getElementById('max-tokens').value ? parseInt(document.getElementById('max-tokens').value) : null,
            min_clarity: document.getElementById('clarity-toggle').checked ? parseFloat(document.getElementById('clarity-input').value) : null,
            min_arch: document.getElementById('arch-toggle').checked ? parseFloat(document.getElementById('arch-input').value) : null,
            min_quality: document.getElementById('quality-toggle').checked ? parseFloat(document.getElementById('quality-input').value) : null,
        };
        if(searchParams.languages.length === 0) searchParams.languages = null;

        const response = await api.post('/business/data/search', searchParams);
        const results = response.data;

        if(results.length === 0) {
            resultsList.innerHTML = `<div class="p-8 text-center text-text-muted">No results found for your criteria.</div>`;
        } else {
             resultsList.innerHTML = `
                <h2 class="text-lg font-semibold text-text-headings mb-4">Results (${results.length})</h2>
                <div class="space-y-3">
                    ${results.map(item => `
                        <div class="result-item p-4 rounded-lg border border-app-border cursor-pointer hover:border-primary/50 transition-colors" data-item='${JSON.stringify(item)}'>
                            <div class="flex justify-between items-start">
                                 <p class="font-semibold text-text-headings">Contribution #${item.id}</p>
                                 <span class="px-2 py-0.5 text-xs font-semibold ${item.is_unlocked ? 'text-green-800 bg-green-100' : 'text-gray-800 bg-gray-100'} rounded-full">${item.is_unlocked ? 'Unlocked' : 'Locked'}</span>
                            </div>
                            <p class="text-xs text-text-muted mt-1">Language: <span class="font-mono">${item.language}</span> | Tokens: <span class="font-mono">${item.tokens.toLocaleString()}</span></p>
                            <p class="text-xs text-text-muted mt-1">Quality Score: <span class="font-semibold text-primary">${item.quality_score.toFixed(1)}/10</span></p>
                        </div>
                    `).join('')}
                </div>`;
            
            resultsList.querySelectorAll('.result-item').forEach(item => {
                item.addEventListener('click', handleResultItemClick);
            });
        }
    } catch (error) {
        resultsList.innerHTML = `<div class="p-8 text-center text-red-600">Failed to load data. Please try again.</div>`;
    } finally {
        applyBtn.disabled = false;
        applyBtn.innerHTML = `Apply Filters`;
    }
}

async function renderDetailView(item) {
    const detailView = document.getElementById('detail-view');
    if (!detailView) return;

    let fullCode = item.code_preview;
    if (item.is_unlocked && item.raw_content) {
        fullCode = item.raw_content;
    } else if (item.is_unlocked && !item.raw_content) {
        try {
            const response = await api.get(`/business/data/contributions/${item.id}`);
            fullCode = response.data.raw_content;
            item.raw_content = fullCode; 
        } catch (e) {
            fullCode = "Could not load full source code.";
        }
    }
    
    const actionButtonHtml = item.is_unlocked ? `
        <button id="download-btn" class="btn btn-secondary w-full mt-4">Download Source</button>
    ` : `
        <button id="unlock-btn" class="btn btn-primary w-full mt-4">Unlock Full Source Code (-${item.tokens.toLocaleString()} Tokens)</button>
    `;
    
    detailView.innerHTML = `
        <h2 class="text-lg font-semibold text-text-headings">Contribution #${item.id}</h2>
        <div class="mt-4 space-y-2 text-sm border-t border-b border-app-border py-4">
            <div class="flex justify-between"><span>Language:</span><strong class="font-mono">${item.language}</strong></div>
            <div class="flex justify-between"><span>Tokens:</span><strong class="font-mono">${item.tokens.toLocaleString()}</strong></div>
            <div class="flex justify-between"><span>Clarity:</span><strong class="font-mono">${item.clarity_score.toFixed(1)} / 10</strong></div>
            <div class="flex justify-between"><span>Architecture:</span><strong class="font-mono">${item.arch_score.toFixed(1)} / 10</strong></div>
            <div class="flex justify-between"><span>Code Quality:</span><strong class="font-mono">${item.quality_score.toFixed(1)} / 10</strong></div>
        </div>
        <div class="mt-4 p-4 bg-gray-900 text-gray-300 rounded-lg border border-app-border text-xs font-mono relative h-96 overflow-y-auto code-preview-block ${!item.is_unlocked ? 'locked' : ''}">
            <pre><code>${fullCode}</code></pre>
        </div>
        ${actionButtonHtml}
    `;
    
    document.getElementById('unlock-btn')?.addEventListener('click', () => handleUnlock(item));
    document.getElementById('download-btn')?.addEventListener('click', () => handleDownload(item.id));
}

async function handleUnlock(item) {
    const unlockBtn = document.getElementById('unlock-btn');
    if (!unlockBtn) return;
    
    unlockBtn.disabled = true;
    unlockBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Unlocking...`;

    try {
        const response = await api.post(`/business/data/unlock/${item.id}`);
        const fullContribution = response.data;
        
        const updatedItem = { ...item, is_unlocked: true, raw_content: fullContribution.raw_content };
        await renderDetailView(updatedItem);
        
        const resultItemInList = document.querySelector(`.result-item[data-item*='"id":${item.id}']`);
        if (resultItemInList) {
            resultItemInList.dataset.item = JSON.stringify(updatedItem);
            const statusBadge = resultItemInList.querySelector('.px-2');
            if (statusBadge) {
                statusBadge.textContent = 'Unlocked';
                statusBadge.className = 'px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 rounded-full';
            }
        }
        
        await stateService.fetchDashboardStats();
    } catch (error) {
        alert(error.response?.data?.detail || 'Failed to unlock contribution.');
        unlockBtn.disabled = false;
        unlockBtn.innerHTML = `Unlock Full Source Code (-${item.tokens.toLocaleString()} Tokens)`;
    }
}

async function handleDownload(contributionId) {
    try {
        const response = await api.get(`/business/data/download/${contributionId}`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `lumen_contribution_${contributionId}.txt`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        alert('Failed to download file. Please ensure you have an active API key.');
    }
}

export function renderDataExplorerPage() {
    company = stateService.getState().company;
    const headerHtml = `<h1 class="page-headline">Data Explorer</h1>`;
    
    if (company && company.plan === 'free') {
        const pageHtml = `
            <div class="dashboard-container h-full">
                <div class="widget-card h-full flex flex-col items-center justify-center text-center p-8">
                     <div class="w-20 h-20 mb-6 bg-primary text-white flex items-center justify-center rounded-full">
                        <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <h2 class="text-2xl font-bold text-text-headings">Unlock the Data Explorer</h2>
                    <p class="mt-2 max-w-lg text-text-body">Your current Free plan does not include access to the Data Explorer. Upgrade to a paid plan to search, analyze, and unlock proprietary code for your AI models.</p>
                    <a href="/app/plans" class="btn btn-primary mt-6">View Plans & Upgrade</a>
                </div>
            </div>
        `;
        return { pageHtml, headerHtml };
    }

    const pageHtml = `
        <style>
            #language-filter-container div::-webkit-scrollbar { width: 6px; }
            #language-filter-container div::-webkit-scrollbar-track { background: #f1f5f9; }
            #language-filter-container div::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 3px; }
        </style>
        <div class="dashboard-container h-full">
            <div class="widget-card h-full flex flex-col">
                <div class="flex-1 flex flex-col lg:flex-row min-h-0">
                    <div id="filter-panel-container" class="w-full lg:w-80 flex-shrink-0 p-6 border-b lg:border-b-0 lg:border-r border-app-border">
                         <!-- Filter panel is rendered dynamically -->
                    </div>
                    <div id="results-list" class="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-app-border overflow-y-auto">
                         <div class="p-8 text-center text-text-muted">Run a search to see results.</div>
                    </div>
                    <div id="detail-view" class="w-full lg:w-2/5 flex-shrink-0 p-6 flex flex-col">
                        <!-- Detail content is rendered dynamically -->
                    </div>
                </div>
            </div>
        </div>
    `;
    return { pageHtml, headerHtml };
}