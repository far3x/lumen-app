import api from '../../lib/api.js';
import { stateService } from '../../lib/state.js';

let company = stateService.getState().company;

export function attachDataExplorerListeners() {
    document.querySelectorAll('.filter-slider').forEach(slider => {
        const valueDisplay = document.getElementById(`${slider.id}-value`);
        if (valueDisplay) {
            valueDisplay.textContent = (slider.value / 10).toFixed(1);
            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = (e.target.value / 10).toFixed(1);
            });
        }
    });

    const resultsContainer = document.getElementById('results-list');
    resultsContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.result-item');
        if (item) {
            document.querySelectorAll('.result-item').forEach(el => el.classList.remove('border-primary', 'bg-app-accent-hover'));
            item.classList.add('border-primary', 'bg-app-accent-hover');
            renderDetailView(JSON.parse(item.dataset.item));
        }
    });

    document.getElementById('apply-filters-btn')?.addEventListener('click', handleSearch);
    
    handleSearch();
}

async function handleSearch() {
    const resultsList = document.getElementById('results-list');
    const applyBtn = document.getElementById('apply-filters-btn');
    if (!resultsList || !applyBtn) return;
    
    applyBtn.disabled = true;
    applyBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Applying...`;

    resultsList.innerHTML = `<div class="p-8 text-center text-text-muted">Searching for contributions...</div>`;
    
    try {
        const searchParams = {
            limit: 20,
            keywords: document.getElementById('keywords-input').value,
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
                            <p class="font-semibold text-text-headings">Contribution #${item.id}</p>
                            <p class="text-xs text-text-muted mt-1">Language: ${item.language} | Tokens: ${item.tokens.toLocaleString()} | Quality: ${item.quality_score.toFixed(1)}/10</p>
                        </div>
                    `).join('')}
                </div>`;
        }
    } catch (error) {
        resultsList.innerHTML = `<div class="p-8 text-center text-red-600">Failed to load data. Please try again.</div>`;
    } finally {
        applyBtn.disabled = false;
        applyBtn.innerHTML = `Apply Filters`;
    }
}

function renderDetailView(item) {
    const detailView = document.getElementById('detail-view');
    if (!detailView) return;
    
    const unlockButtonHtml = item.is_unlocked ? `
        <button class="btn btn-secondary w-full mt-4" disabled>Source Code Unlocked</button>
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
        <div class="mt-4 p-4 bg-app-bg rounded-lg border border-app-border text-xs font-mono relative h-96 overflow-y-auto">
            <pre class="text-gray-600"><code>${item.code_preview}</code></pre>
        </div>
        ${unlockButtonHtml}
    `;
    
    detailView.classList.remove('hidden');
    document.getElementById('unlock-btn')?.addEventListener('click', () => handleUnlock(item));
}

async function handleUnlock(item) {
    const unlockBtn = document.getElementById('unlock-btn');
    if (!unlockBtn) return;
    
    unlockBtn.disabled = true;
    unlockBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Unlocking...`;

    try {
        const response = await api.post(`/business/data/unlock/${item.id}`);
        const fullContribution = response.data;
        
        const updatedItem = { ...item, is_unlocked: true, code_preview: fullContribution.raw_content };
        renderDetailView(updatedItem);

        // Fetch latest stats to update global token balance
        await stateService.fetchDashboardStats();

    } catch (error) {
        alert(error.response?.data?.detail || 'Failed to unlock contribution.');
        unlockBtn.disabled = false;
        unlockBtn.innerHTML = `Unlock Full Source Code (-${item.tokens.toLocaleString()} Tokens)`;
    }
}

export function renderDataExplorerPage() {
    company = stateService.getState().company;
    const headerHtml = `<h1 class="page-headline">Data Explorer</h1>`;
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
                    <div id="detail-view" class="w-full lg:w-2/5 flex-shrink-0 p-6 flex-col hidden">
                        <!-- Detail content is rendered dynamically -->
                    </div>
                </div>
            </div>
        </div>
    `;
    return { pageHtml, headerHtml };
}