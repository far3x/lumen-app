import api from '../../lib/api.js';
import { stateService } from '../../lib/state.js';

let company = stateService.getState().company;

const fakeSearchResults = [
    { id: 84921, language: 'Rust', tokens: 15230, clarity_score: 9.8, arch_score: 9.5, quality_score: 9.7, is_unlocked: true, code_preview: `// High-performance A* pathfinding algorithm implementation\nfn find_path(start: Point, goal: Point, grid: &Grid) -> Option<Vec<Point>> {\n    let mut open_set = BinaryHeap::new();\n    open_set.push(State { cost: 0, position: start });\n\n    let mut came_from = HashMap::new();\n    let mut cost_so_far = HashMap::new();\n    cost_so_far.insert(start, 0);\n\n    while let Some(State { cost, position }) = open_set.pop() {\n        if position == goal {\n            return Some(reconstruct_path(came_from, position));\n        }\n\n        for neighbor in grid.neighbors(position) {\n            let new_cost = cost + grid.cost(position, neighbor);\n            if !cost_so_far.contains_key(&neighbor) || new_cost < cost_so_far[&neighbor] {\n                cost_so_far.insert(neighbor, new_cost);\n                let priority = new_cost + heuristic(neighbor, goal);\n                open_set.push(State { cost: priority, position: neighbor });\n                came_from.insert(neighbor, position);\n            }\n        }\n    }\n    None\n}` },
    { id: 79104, language: 'Python', tokens: 8910, clarity_score: 9.5, arch_score: 9.2, quality_score: 9.4, is_unlocked: false, code_preview: `# Transformer block for a vision model with self-attention\nclass TransformerBlock(nn.Module):\n    def __init__(self, embed_dim, num_heads, ff_dim, rate=0.1):\n        super().__init__()\n        self.attn = nn.MultiheadAttention(embed_dim, num_heads, dropout=rate)\n        self.ffn = nn.Sequential(\n            nn.Linear(embed_dim, ff_dim),\n            nn.GELU(),\n            nn.Linear(ff_dim, embed_dim),\n        )\n        self.layernorm1 = nn.LayerNorm(embed_dim, eps=1e-6)\n        self.layernorm2 = nn.LayerNorm(embed_dim, eps=1e-6)\n        self.dropout1 = nn.Dropout(rate)\n        self.dropout2 = nn.Dropout(rate)\n\n    def forward(self, x):\n        attn_output, _ = self.attn(x, x, x)\n        x = self.layernorm1(x + self.dropout1(attn_output))\n        ffn_output = self.ffn(x)\n        return self.layernorm2(x + self.dropout2(ffn_output))` },
    { id: 82441, language: 'Go', tokens: 11500, clarity_score: 9.1, arch_score: 8.8, quality_score: 9.0, is_unlocked: false, code_preview: `// Concurrent worker pool for processing jobs from a channel\nfunc NewWorkerPool(numWorkers int, jobQueue chan Job) *WorkerPool {\n\tpool := &WorkerPool{\n\t\tnumWorkers: numWorkers,\n\t\tjobQueue:   jobQueue,\n\t\tquit:       make(chan bool),\n\t}\n\tfor i := 0; i < numWorkers; i++ {\n\t\tgo pool.startWorker(i + 1)\n\t}\n\treturn pool\n}\n\nfunc (p *WorkerPool) startWorker(id int) {\n\tfor {\n\t\tselect {\n\t\tcase job := <-p.jobQueue:\n\t\t\tlog.Printf("Worker %d: processing job %d", id, job.ID)\n\t\t\tjob.Execute()\n\t\tcase <-p.quit:\n\t\t\tlog.Printf("Worker %d: stopping", id)\n\t\t\treturn\n\t\t}\n\t}\n}` },
    { id: 75003, language: 'TypeScript', tokens: 21800, clarity_score: 8.9, arch_score: 9.1, quality_score: 8.8, is_unlocked: false, code_preview: `// Real-time collaborative text editor state using CRDTs\nfunction createCRDTStore<T>(siteId: string): CollaborativeStore<T> {\n  const state = new Map<string, T>();\n  const oplog: Operation<T>[] = [];\n\n  const apply = (op: Operation<T>): void => {\n    if (!isValidOp(op)) return;\n    oplog.push(op);\n    // ... complex merge logic for CRDT state\n    // ... broadcast operation to peers\n  };\n\n  const getValue = (key: string): T | undefined => {\n    return state.get(key);\n  };\n\n  return { state, apply, getValue };\n}` },
];

function renderSkeletonLoader() {
    return Array(5).fill('').map(() => `
        <div class="skeleton-loader p-4 rounded-lg">
            <div class="skeleton-line h-4 w-3/4 mb-3"></div>
            <div class="skeleton-line h-3 w-1/2"></div>
        </div>
    `).join('');
}

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

    document.getElementById('apply-filters-btn')?.addEventListener('click', handleSearch);
    
    // Initial search on load
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
    
    // Simulate API call
    setTimeout(() => {
        const results = fakeSearchResults;
        
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
        
        // Auto-select the first result
        const firstResult = resultsList.querySelector('.result-item');
        if (firstResult) {
            firstResult.classList.add('border-primary', 'bg-app-accent-hover');
            renderDetailView(JSON.parse(firstResult.dataset.item));
        }

        resultsList.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', handleResultItemClick);
        });

        applyBtn.disabled = false;
        applyBtn.innerHTML = `Apply Filters`;
    }, 1200);
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
        <div class="mt-4 p-4 bg-gray-900 text-gray-300 rounded-lg border border-app-border text-xs font-mono relative h-96 overflow-y-auto code-preview-block">
            <pre><code>${item.code_preview}</code></pre>
        </div>
        ${unlockButtonHtml}
    `;
    
    document.getElementById('unlock-btn')?.addEventListener('click', () => handleUnlock(item));
}

async function handleUnlock(item) {
    const unlockBtn = document.getElementById('unlock-btn');
    if (!unlockBtn) return;
    
    unlockBtn.disabled = true;
    unlockBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Unlocking...`;

    // Simulate API call
    setTimeout(() => {
        const updatedItem = { ...item, is_unlocked: true };
        renderDetailView(updatedItem);
        
        const resultItemInList = document.querySelector(`.result-item[data-item*='"id":${item.id}']`);
        if(resultItemInList) {
            resultItemInList.dataset.item = JSON.stringify(updatedItem);
            const statusBadge = resultItemInList.querySelector('.px-2');
            statusBadge.textContent = 'Unlocked';
            statusBadge.className = 'px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 rounded-full';
        }

        // Simulate fetching latest stats to update global token balance
        const currentBalance = parseInt(document.getElementById('company-token-balance').textContent.replace(/,/g, ''));
        document.getElementById('company-token-balance').textContent = (currentBalance - item.tokens).toLocaleString();

    }, 1500);
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
                    <div id="detail-view" class="w-full lg:w-2/5 flex-shrink-0 p-6 flex flex-col">
                        <!-- Detail content is rendered dynamically -->
                    </div>
                </div>
            </div>
        </div>
    `;
    return { pageHtml, headerHtml };
}