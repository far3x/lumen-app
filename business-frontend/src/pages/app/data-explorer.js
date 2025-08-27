import api from '../../lib/api.js';
import { stateService } from '../../lib/state.js';

let company = stateService.getState().company;

function renderSkeletonLoader() {
    return Array(5).fill('').map(() => `
        <div class="skeleton-loader p-4 rounded-lg">
            <div class="skeleton-line h-4 w-3/4 mb-3"></div>
            <div class="skeleton-line h-3 w-1/2"></div>
        </div>
    `).join('');
}

export function attachDataExplorerListeners() {
    company = stateService.getState().company;
    if (company && company.plan === 'free') {
        return; 
    }

    document.querySelectorAll('.filter-slider').forEach(slider => {
        const valueDisplay = document.getElementById(`${slider.id}-value`);
        if (valueDisplay) {
            valueDisplay.textContent = (slider.value / 10).toFixed(1);
            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = (e.target.value / 10).toFixed(1);
            });
        }
    });

    document.getElementById('apply-filters-btn')?.addEventListener('click', handleSearch);
    
    handleSearch();
}

function handleResultItemClick(e) {
    const itemElement = e.currentTarget;
    const itemData = JSON.parse(itemElement.dataset.item);
    document.querySelectorAll('.result-item').forEach(el => el.classList.remove('border-primary', 'bg-app-accent-hover'));
    itemElement.classList.add('border-primary', 'bg-app-accent-hover');
    renderDetailView(itemData);
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
            min_clarity: document.getElementById('clarity-slider').value / 100,
            min_arch: document.getElementById('arch-slider').value / 100,
            min_quality: document.getElementById('quality-slider').value / 100,
        };
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
        <div class="dashboard-container h-full">
            <div class="widget-card h-full flex flex-col">
                <div class="flex-1 flex flex-col lg:flex-row min-h-0">
                    <div class="w-full lg:w-80 flex-shrink-0 p-6 border-b lg:border-b-0 lg:border-r border-app-border">
                        <h2 class="text-lg font-semibold text-text-headings">Filters</h2>
                        <div class="space-y-6 mt-4">
                            <div>
                                <label for="keywords-input" class="form-label">Keywords</label>
                                <input type="search" id="keywords-input" placeholder="e.g., 'async rust http'" class="form-input">
                            </div>
                            <div>
                                <div class="flex justify-between items-center"><label for="clarity-slider" class="form-label">Min Clarity</label><span id="clarity-slider-value" class="text-sm font-mono text-text-headings">7.0</span></div>
                                <input type="range" id="clarity-slider" min="0" max="100" value="70" class="w-full h-2 bg-app-bg rounded-lg appearance-none cursor-pointer filter-slider">
                            </div>
                            <div>
                                <div class="flex justify-between items-center"><label for="arch-slider" class="form-label">Min Architecture</label><span id="arch-slider-value" class="text-sm font-mono text-text-headings">7.0</span></div>
                                <input type="range" id="arch-slider" min="0" max="100" value="70" class="w-full h-2 bg-app-bg rounded-lg appearance-none cursor-pointer filter-slider">
                            </div>
                            <div>
                                <div class="flex justify-between items-center"><label for="quality-slider" class="form-label">Min Code Quality</label><span id="quality-slider-value" class="text-sm font-mono text-text-headings">7.0</span></div>
                                <input type="range" id="quality-slider" min="0" max="100" value="70" class="w-full h-2 bg-app-bg rounded-lg appearance-none cursor-pointer filter-slider">
                            </div>
                            <button id="apply-filters-btn" class="btn btn-primary w-full">Apply Filters</button>
                        </div>
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