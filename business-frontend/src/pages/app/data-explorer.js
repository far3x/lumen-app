const fakeResults = [
    { id: 1, title: 'Async Web Scraper', lang: 'Rust', tokens: 8500, scores: { clarity: 9.2, arch: 8.8, quality: 9.5 } },
    { id: 2, title: 'Transformer NN Implementation', lang: 'Python', tokens: 6200, scores: { clarity: 9.5, arch: 9.1, quality: 9.7 } },
    { id: 3, title: 'Real-time CRDT Store', lang: 'TypeScript', tokens: 4500, scores: { clarity: 8.9, arch: 9.3, quality: 9.0 } },
    { id: 4, title: 'Distributed Job Queue', lang: 'Go', tokens: 12000, scores: { clarity: 8.5, arch: 9.0, quality: 8.8 } },
    { id: 5, title: 'Procedural Terrain Generator', lang: 'C++', tokens: 25000, scores: { clarity: 9.8, arch: 9.6, quality: 9.4 } },
    { id: 6, title: 'Custom Blockchain Ledger', lang: 'Rust', tokens: 18500, scores: { clarity: 9.0, arch: 9.5, quality: 9.1 } },
    { id: 7, title: 'Vector Similarity Search', lang: 'Python', tokens: 7300, scores: { clarity: 9.3, arch: 8.9, quality: 9.6 } },
];

const fakeCodeSnippet = `
// FILE: src/core/engine.rs

use crate::prelude::*;
use std::collections::BinaryHeap;

/// Implements the A* search algorithm for pathfinding within the grid.
pub fn find_path(start: Point, goal: Point, grid: &Grid) -> Option<Vec<Point>> {
    let mut open_set = BinaryHeap::new();
    open_set.push(State { cost: 0, position: start });

    let mut came_from = HashMap::new();
    let mut cost_so_far = HashMap::new();
    cost_so_far.insert(start, 0);

    // [REDACTED - 250 lines of core logic]
    // ...
    // ...
    // [REDACTED - Showing final section]

    while let Some(State { cost, position }) = open_set.pop() {
        if position == goal {
            return Some(reconstruct_path(came_from, position));
        }

        for neighbor in grid.neighbors(position) {
            let new_cost = cost_so_far[&position] + grid.cost(position, neighbor);
            if !cost_so_far.contains_key(&neighbor) || new_cost < cost_so_far[&neighbor] {
                cost_so_far.insert(neighbor, new_cost);
                let priority = new_cost + heuristic(neighbor, goal);
                open_set.push(State { cost: priority, position: neighbor });
                came_from.insert(neighbor, position);
            }
        }
    }

    None // No path found
}`;

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
    const detailView = document.getElementById('detail-view');
    resultsContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.result-item');
        if (item) {
            document.querySelectorAll('.result-item').forEach(el => el.classList.remove('border-accent-purple', 'bg-accent-purple/5'));
            item.classList.add('border-accent-purple', 'bg-accent-purple/5');
            detailView.classList.remove('hidden');
        }
    });
}

export function renderDataExplorerPage() {
    const headerHtml = `<h1 class="page-headline">Data Explorer</h1>`;
    const pageHtml = `
        <div class="dashboard-container h-full">
            <div class="widget-card h-full flex flex-col">
                <div class="flex-1 flex flex-col lg:flex-row min-h-0">
                    <div class="w-full lg:w-80 flex-shrink-0 p-6 border-b lg:border-b-0 lg:border-r border-app-border">
                        <h2 class="text-lg font-semibold text-app-text-primary">Filters</h2>
                        <div class="space-y-6 mt-4">
                            <div>
                                <label class="form-label">Keywords</label>
                                <input type="search" placeholder="e.g., 'async rust http'" class="form-input">
                            </div>
                            <div>
                                <div class="flex justify-between items-center"><label class="form-label">Project Clarity</label><span id="clarity-slider-value" class="text-sm font-mono text-app-text-primary">7.0</span></div>
                                <input type="range" id="clarity-slider" min="0" max="100" value="70" class="range-slider filter-slider">
                            </div>
                            <div>
                                <div class="flex justify-between items-center"><label class="form-label">Architecture</label><span id="arch-slider-value" class="text-sm font-mono text-app-text-primary">7.0</span></div>
                                <input type="range" id="arch-slider" min="0" max="100" value="70" class="range-slider filter-slider">
                            </div>
                            <div>
                                <div class="flex justify-between items-center"><label class="form-label">Code Quality</label><span id="quality-slider-value" class="text-sm font-mono text-app-text-primary">7.0</span></div>
                                <input type="range" id="quality-slider" min="0" max="100" value="70" class="range-slider filter-slider">
                            </div>
                            <div>
                                <label class="form-label">Languages</label>
                                <div class="space-y-2 mt-2">
                                    <label class="flex items-center"><input type="checkbox" class="custom-checkbox"> <span class="ml-3 text-sm">Python</span></label>
                                    <label class="flex items-center"><input type="checkbox" class="custom-checkbox"> <span class="ml-3 text-sm">Rust</span></label>
                                    <label class="flex items-center"><input type="checkbox" class="custom-checkbox"> <span class="ml-3 text-sm">TypeScript</span></label>
                                </div>
                            </div>
                            <button class="btn btn-accent w-full">Apply Filters</button>
                        </div>
                    </div>
                    <div id="results-list" class="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-app-border overflow-y-auto">
                         <h2 class="text-lg font-semibold text-app-text-primary mb-4">Results (${fakeResults.length})</h2>
                         <div class="space-y-3">
                            ${fakeResults.map(item => `
                                <div class="result-item p-4 rounded-lg border border-app-border cursor-pointer hover:border-accent-purple/50 transition-colors">
                                    <p class="font-semibold text-app-text-primary">${item.title}</p>
                                    <p class="text-xs text-app-text-secondary mt-1">Language: ${item.lang} | Tokens: ${item.tokens.toLocaleString()} | Quality: ${item.scores.quality}/10</p>
                                </div>
                            `).join('')}
                         </div>
                    </div>
                    <div id="detail-view" class="w-full lg:w-2/5 flex-shrink-0 p-6 flex-col hidden">
                        <h2 class="text-lg font-semibold text-app-text-primary">Transformer NN Implementation</h2>
                        <div class="mt-4 space-y-2 text-sm border-t border-b border-app-border py-4">
                            <div class="flex justify-between"><span>Language:</span><strong class="font-mono">Python</strong></div>
                            <div class="flex justify-between"><span>Tokens:</span><strong class="font-mono">6,200</strong></div>
                            <div class="flex justify-between"><span>Clarity:</span><strong class="font-mono">9.5 / 10</strong></div>
                            <div class="flex justify-between"><span>Architecture:</span><strong class="font-mono">9.1 / 10</strong></div>
                            <div class="flex justify-between"><span>Code Quality:</span><strong class="font-mono">9.7 / 10</strong></div>
                        </div>
                        <div class="mt-4 p-4 bg-app-bg rounded-lg border border-app-border text-xs font-mono relative h-96 overflow-hidden">
                            <pre class="text-gray-400"><code>${fakeCodeSnippet}</code></pre>
                            <div class="absolute inset-0 bg-gradient-to-t from-app-surface to-transparent pointer-events-none"></div>
                        </div>
                        <button class="btn btn-accent w-full mt-4">Unlock Full Source Code (-6,200 Tokens)</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    return { pageHtml, headerHtml };
}