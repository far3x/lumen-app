import api from '../../lib/api.js';
import { stateService } from '../../lib/state.js';

let company = stateService.getState().company;
let availableLanguages = [];
let currentPage = 1;
let totalResults = 0;
const resultsPerPage = 20;

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string' || !unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function parseRawContent(rawContent) {
    const files = [];
    const delimiter = "---lum--new--file--";
    if (!rawContent) return files;

    const parts = rawContent.split(new RegExp(`\\s*${delimiter}\\s*`));

    for (const part of parts) {
        if (!part.trim()) continue;
        const firstNewlineIndex = part.indexOf('\n');
        if (firstNewlineIndex === -1) {
            files.push({ path: part.trim(), content: '' });
        } else {
            const path = part.substring(0, firstNewlineIndex).trim();
            const content = part.substring(firstNewlineIndex + 1);
            files.push({ path, content });
        }
    }
    return files;
}

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
    document.getElementById('apply-filters-btn')?.addEventListener('click', () => handleSearch(1));
    document.getElementById('reset-filters-btn')?.addEventListener('click', handleResetFilters);
    document.getElementById('unlock-all-btn')?.addEventListener('click', showUnlockAllModal);
    
    document.getElementById('results-list')?.addEventListener('click', (e) => {
        if (e.target.closest('#prev-page-btn')) {
            handleSearch(currentPage - 1);
        }
        if (e.target.closest('#next-page-btn')) {
            handleSearch(currentPage + 1);
        }
    });

    handleSearch(1);
}

function handleResultItemClick(e) {
    const itemElement = e.currentTarget;
    try {
        const itemData = JSON.parse(itemElement.dataset.item);
        document.querySelectorAll('.result-item').forEach(el => el.classList.remove('border-primary', 'bg-app-accent-hover'));
        itemElement.classList.add('border-primary', 'bg-app-accent-hover');
        renderDetailView(itemData);
    } catch(err) {
        console.error("Failed to parse contribution data from element:", err);
        alert("Could not display details for this item due to a data error.");
    }
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
    handleSearch(1);
}

async function handleSearch(page = 1) {
    const resultsList = document.getElementById('results-list');
    const applyBtn = document.getElementById('apply-filters-btn');
    if (!resultsList || !applyBtn) return;
    
    applyBtn.disabled = true;
    applyBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Applying...`;

    currentPage = page;
    resultsList.innerHTML = `<div id="results-header" class="text-lg font-semibold text-text-headings mb-4">Searching...</div><div id="results-items" class="space-y-3">${renderSkeletonLoader()}</div><div id="results-pagination" class="mt-4"></div>`;
    document.getElementById('detail-view').innerHTML = `<div class="p-8 text-center text-text-muted flex flex-col items-center justify-center h-full"><svg class="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7" /></svg><p class="mt-4 font-semibold">Select a result to see details</p></div>`;
    
    try {
        const searchParams = {
            limit: resultsPerPage,
            skip: (page - 1) * resultsPerPage,
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
        const { items: results, total } = response.data;
        totalResults = total;

        const resultsItemsContainer = document.getElementById('results-items');

        if(results.length === 0) {
            resultsItemsContainer.innerHTML = `<div class="p-8 text-center text-text-muted">No results found for your criteria.</div>`;
        } else {
             resultsItemsContainer.innerHTML = results.map(item => {
                const languageList = Object.keys(item.language_breakdown || {}).join(', ');
                return `
                <div class="result-item p-4 rounded-lg border border-app-border cursor-pointer hover:border-primary/50 transition-colors" data-item='${escapeHtml(JSON.stringify(item))}'>
                    <div class="flex justify-between items-start">
                         <p class="font-semibold text-text-headings">Contribution #${item.id}</p>
                         <span class="px-2 py-0.5 text-xs font-semibold ${item.is_unlocked ? 'text-green-800 bg-green-100' : 'text-gray-800 bg-gray-100'} rounded-full">${item.is_unlocked ? 'Unlocked' : 'Locked'}</span>
                    </div>
                    <p class="text-xs text-text-muted mt-1">Languages: <span class="font-mono">${languageList || item.language}</span> | Tokens: <span class="font-mono">${item.tokens.toLocaleString()}</span></p>
                    <p class="text-xs text-text-muted mt-1">Quality Score: <span class="font-semibold text-primary">${item.quality_score.toFixed(1)}/10</span></p>
                    <p class="text-xs text-text-muted mt-2 pt-2 border-t border-app-border">${escapeHtml(item.analysis_summary || 'No summary available.').substring(0, 150)}...</p>
                </div>
            `}).join('');
            
            resultsItemsContainer.querySelectorAll('.result-item').forEach(item => {
                item.addEventListener('click', handleResultItemClick);
            });
        }
        renderPaginationControls();
    } catch (error) {
        resultsList.innerHTML = `<div class="p-8 text-center text-red-600">Failed to load data. Please try again.</div>`;
    } finally {
        applyBtn.disabled = false;
        applyBtn.innerHTML = `Apply Filters`;
    }
}

function renderPaginationControls() {
    const paginationContainer = document.getElementById('results-pagination');
    const resultsHeader = document.getElementById('results-header');
    if (!paginationContainer || !resultsHeader) return;

    const startItem = totalResults > 0 ? (currentPage - 1) * resultsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * resultsPerPage, totalResults);
    
    if (totalResults > 0) {
        resultsHeader.textContent = `Results (Showing ${startItem}-${endItem} of ${totalResults})`;
    } else {
        resultsHeader.textContent = 'Results (0)';
    }

    const hasPrev = currentPage > 1;
    const hasNext = endItem < totalResults;

    if (!hasPrev && !hasNext) {
        paginationContainer.innerHTML = '';
        return;
    }

    paginationContainer.innerHTML = `
        <div class="flex justify-between items-center">
            <button id="prev-page-btn" class="btn btn-secondary" ${!hasPrev ? 'disabled' : ''}>Previous</button>
            <span class="text-sm text-text-muted">Page ${currentPage}</span>
            <button id="next-page-btn" class="btn btn-secondary" ${!hasNext ? 'disabled' : ''}>Next</button>
        </div>
    `;
}

async function renderDetailView(item) {
    const detailView = document.getElementById('detail-view');
    if (!detailView) return;

    let codeContentHtml = '';

    if (item.is_unlocked) {
        if (!item.raw_content) { 
            try {
                // For unlocked content, we now must use the user's normal auth, not an API key.
                const response = await api.post(`/business/data/unlock/${item.id}`);
                item.raw_content = response.data.raw_content;
            } catch (e) {
                console.error("Error fetching unlocked content:", e);
                item.raw_content = 'Error: Could not load full source code.';
            }
        }
        const codeLines = item.raw_content.split('\n').slice(0, 50).join('\n');
        codeContentHtml = `<pre class="bg-app-surface p-3 rounded-b-md text-xs"><code>${escapeHtml(codeLines)}</code></pre>`;

    } else {
        const firstFile = item.files_preview?.[0];
        if (firstFile) {
            codeContentHtml = `
                <div class="file-preview-item">
                    <p class="text-xs text-text-tertiary font-mono bg-app-bg px-3 py-1 rounded-t-md sticky top-0 border-b border-app-border">${escapeHtml(firstFile.path)}</p>
                    <pre class="bg-app-surface p-3 rounded-b-md text-xs"><code>${escapeHtml(firstFile.content)}</code></pre>
                </div>`;
        }
    }
    
    const languageList = Object.keys(item.language_breakdown || {}).join(', ');

    const actionButtonHtml = item.is_unlocked ? `
        <button id="download-btn" class="btn btn-secondary w-full mt-4">Download Source</button>
    ` : `
        <button id="unlock-btn" class="btn btn-primary w-full mt-4">Unlock Full Source Code (-${item.tokens.toLocaleString()} Tokens)</button>
    `;
    
    detailView.innerHTML = `
        <h2 class="text-lg font-semibold text-text-headings">Contribution #${item.id}</h2>
        <div class="mt-4 space-y-2 text-sm border-t border-b border-app-border py-4">
            <div class="flex justify-between"><span>Languages:</span><strong class="font-mono text-right">${languageList || item.language}</strong></div>
            <div class="flex justify-between"><span>Tokens:</span><strong class="font-mono">${item.tokens.toLocaleString()}</strong></div>
            <div class="flex justify-between"><span>Clarity:</span><strong class="font-mono">${item.clarity_score.toFixed(1)} / 10</strong></div>
            <div class="flex justify-between"><span>Architecture:</span><strong class="font-mono">${item.arch_score.toFixed(1)} / 10</strong></div>
            <div class="flex justify-between"><span>Code Quality:</span><strong class="font-mono">${item.quality_score.toFixed(1)} / 10</strong></div>
        </div>
        <div class="mt-4">
            <h3 class="font-bold text-text-headings mb-2">AI Analysis Summary</h3>
            <p class="text-sm text-text-body bg-app-bg p-3 rounded-md border border-app-border">${escapeHtml(item.analysis_summary || 'No summary available.')}</p>
        </div>
        <div class="mt-4 p-2 bg-app-bg text-text-body rounded-lg border border-app-border h-96 overflow-y-auto code-preview-block ${!item.is_unlocked ? 'locked' : ''}">
            ${codeContentHtml || '<p class="text-center text-text-muted p-4">No code preview available.</p>'}
        </div>
        ${actionButtonHtml}
    `;
    
    document.getElementById('unlock-btn')?.addEventListener('click', () => handleUnlock(item));
    document.getElementById('download-btn')?.addEventListener('click', () => handleDownload(item.id, item.raw_content));
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

function handleDownload(contributionId, rawContent) {
    if (!rawContent) {
        alert('Full content not available for download.');
        return;
    }
    const blob = new Blob([rawContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lumen_contribution_${contributionId}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

function showUnlockAllModal() {
    const modalId = 'unlock-all-modal';
    if(document.getElementById(modalId)) return;

    const modalHtml = `
    <div id="${modalId}" class="modal-overlay">
        <div class="bg-app-surface w-full max-w-lg rounded-xl border border-app-border shadow-2xl">
            <header class="p-4 border-b border-app-border">
                <h2 class="text-lg font-bold text-red-700">Unlock All Available Data</h2>
            </header>
            <div id="unlock-all-content" class="p-6">
                 <p class="text-text-body">This action will unlock <strong>all</strong> available contributions on the Lumen network that your company has not yet unlocked. This may consume a very large number of tokens and the action is irreversible.</p>
                 <p class="text-sm text-text-muted mt-4">A background task will be started. You will be notified when it is complete. To confirm, please type "CONFIRM" in the box below.</p>
                 <input type="text" id="unlock-all-confirm-input" class="form-input mt-2" autocomplete="off">
                 <div class="flex gap-4 mt-6">
                    <button id="cancel-unlock-all-btn" class="btn btn-secondary w-full">Cancel</button>
                    <button id="confirm-unlock-all-btn" class="btn btn-danger w-full" disabled>I understand, unlock everything</button>
                 </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.classList.add('modal-open');

    const modal = document.getElementById(modalId);
    const confirmInput = document.getElementById('unlock-all-confirm-input');
    const confirmBtn = document.getElementById('confirm-unlock-all-btn');

    const closeModal = () => {
        modal.remove();
        if (document.querySelectorAll('.modal-overlay').length === 0) {
            document.body.classList.remove('modal-open');
        }
    };
    
    modal.querySelector('#cancel-unlock-all-btn').addEventListener('click', closeModal);
    confirmInput.addEventListener('input', () => {
        confirmBtn.disabled = confirmInput.value !== 'CONFIRM';
    });
    confirmBtn.addEventListener('click', handleUnlockAll);
}

async function handleUnlockAll() {
    const contentArea = document.getElementById('unlock-all-content');
    contentArea.innerHTML = `<div class="text-center p-8"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-primary rounded-full"></span><p class="mt-4">Starting background task...</p></div>`;

    try {
        await api.post('/business/data/unlock-all');
        contentArea.innerHTML = `
            <div class="text-center p-8">
                <h3 class="font-semibold text-text-headings">Task Started</h3>
                <p class="text-sm text-text-muted mt-2">The bulk unlock process has begun. Your token balance will update as data is unlocked. This may take several minutes.</p>
                <button id="unlock-all-close" class="btn btn-secondary mt-4">Close</button>
            </div>
        `;
        document.getElementById('unlock-all-close').addEventListener('click', () => {
            const modal = document.getElementById('unlock-all-modal');
            if (modal) modal.remove();
            document.body.classList.remove('modal-open');
        });
    } catch (error) {
        contentArea.innerHTML = `
            <div class="text-center p-8">
                <h3 class="font-semibold text-red-700">Error</h3>
                <p class="text-sm text-text-muted mt-2">${error.response?.data?.detail || 'Could not start the bulk unlock process.'}</p>
                <button id="unlock-all-close" class="btn btn-secondary mt-4">Close</button>
            </div>
        `;
         document.getElementById('unlock-all-close').addEventListener('click', () => {
            const modal = document.getElementById('unlock-all-modal');
            if (modal) modal.remove();
            document.body.classList.remove('modal-open');
        });
    }
}

export function renderDataExplorerPage() {
    const { user, company } = stateService.getState();
    const isAdmin = user && user.role === 'admin';

    const headerHtml = `
        <div class="flex-1"><h1 class="page-headline">Data Explorer</h1></div>
        ${isAdmin ? '<div><button id="unlock-all-btn" class="btn btn-danger">Unlock All Data</button></div>' : ''}
    `;
    
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
        return { pageHtml, headerHtml: `<h1 class="page-headline">Data Explorer</h1>` };
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
                    <div id="results-list" class="flex-1 flex flex-col p-6 border-b lg:border-b-0 lg:border-r border-app-border overflow-y-auto">
                         <div class="p-8 text-center text-text-muted">Run a search to see results.</div>
                    </div>
                    <div id="detail-view" class="w-full lg:w-2/5 flex-shrink-0 p-6 flex flex-col overflow-y-auto">
                        <!-- Detail content is rendered dynamically -->
                    </div>
                </div>
            </div>
        </div>
    `;
    return { pageHtml, headerHtml };
}