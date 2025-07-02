export function renderDataHubPage() {
    const checkmarkIcon = `<svg class="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`;
    const contactEmail = 'contact@lumen.onl';

    const sampleData = [
        { lang: 'Rust', tokens: 850, quality: 0.92, code: `fn find_path(start: Point, goal: Point, grid: &Grid) -> Option<Vec<Point>> {\n    let mut open_set = BinaryHeap::new();\n    open_set.push(State { cost: 0, position: start });\n\n    let mut came_from = HashMap::new();\n    let mut cost_so_far = HashMap::new();\n    cost_so_far.insert(start, 0);\n\n    while let Some(State { cost, position }) = open_set.pop() {\n        if position == goal {\n            return Some(reconstruct_path(came_from, position));\n        }\n    }\n    None\n}` },
        { lang: 'Python', tokens: 620, quality: 0.95, code: `class TransformerBlock(nn.Module):\n    def __init__(self, embed_dim, num_heads, ff_dim, rate=0.1):\n        super().__init__()\n        self.attn = nn.MultiheadAttention(embed_dim, num_heads, dropout=rate)\n        self.ffn = nn.Sequential(\n            nn.Linear(embed_dim, ff_dim),\n            nn.GELU(),\n            nn.Linear(ff_dim, embed_dim),\n        )\n\n    def forward(self, x):\n        attn_output, _ = self.attn(x, x, x)\n        x = self.norm1(x + self.dropout1(attn_output))\n        return self.norm2(x + self.dropout2(self.ffn(x)))` },
        { lang: 'TypeScript', tokens: 450, quality: 0.89, code: `function createCRDTStore<T>(siteId: string) {\n  const state = new Map<string, T>();\n  const oplog: Operation<T>[] = [];\n\n  const apply = (op: Operation<T>) => {\n    oplog.push(op);\n    // ... apply logic to state\n  };\n\n  return { state, apply };\n}` },
    ];

    const renderDataExplorer = () => `
        <div id="data-explorer" class="bg-surface/50 backdrop-blur-md border border-primary rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
            <div class="p-6 border-b border-primary">
                <h3 class="text-xl font-bold">Live Data Sandbox</h3>
                <p class="text-sm text-text-secondary mt-1">Test the quality and structure of our proprietary data supply. Run a sample query against our live index. (Fake data for now)</p>
            </div>
            <div class="grid lg:grid-cols-12">
                <div class="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-primary">
                    <div class="space-y-6">
                        <div>
                            <label class="text-sm font-bold text-text-main">Language</label>
                            <select id="explorer-lang-filter" class="w-full mt-2 bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                                <option>All High-Quality</option>
                                <option>Python</option>
                                <option>Rust</option>
                                <option>TypeScript</option>
                                <option>Go</option>
                            </select>
                        </div>
                        <div>
                            <label for="explorer-quality-range" class="text-sm font-bold text-text-main">Minimum Quality Score</label>
                            <div class="flex items-center gap-4 mt-2">
                                <input type="range" id="explorer-quality-range" min="70" max="98" value="70" class="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-accent-purple [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-accent-purple [&::-webkit-slider-thumb]:to-accent-pink [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-accent-pink/30 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-accent-purple [&::-moz-range-thumb]:to-accent-pink [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none">
                                <span id="explorer-quality-value" class="font-mono text-accent-pink w-12 text-center">0.70</span>
                            </div>
                        </div>
                        <button id="explorer-run-query-btn" class="w-full py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:brightness-110">
                            Fetch Data Sample
                        </button>
                    </div>
                     <div class="text-center mt-6">
                        <p class="text-xs text-text-secondary">Available for sample query:</p>
                        <p id="explorer-token-usage" class="font-mono text-lg gradient-text">10,000 Tokens</p>
                    </div>
                </div>
                <div id="explorer-results-panel" class="lg:col-span-8 p-6 min-h-[400px] flex items-center justify-center font-mono text-sm bg-abyss-dark/50">
                    <div id="explorer-placeholder" class="text-center text-text-secondary font-sans">
                        <svg class="w-16 h-16 mx-auto text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <p class="mt-4 font-semibold">Your query results will appear here</p>
                        <p class="text-sm">Adjust the filters and run a query to see a sample of our data.</p>
                    </div>
                    <div id="explorer-results-content" class="hidden w-full h-[500px] overflow-y-auto"></div>
                </div>
            </div>
        </div>
    `;
    
    const renderFeatureListItem = (text) => `
        <li class="flex items-start gap-3">${checkmarkIcon}<span class="text-text-secondary">${text}</span></li>
    `;

    const renderPageContent = () => `
    <main class="bg-abyss-dark">
        <section class="relative flex flex-col justify-center min-h-screen text-center overflow-hidden isolate gradient-border-bottom">
            <div class="absolute inset-0">
                <video autoplay loop muted playsinline class="w-full h-full object-cover" src="/plexus-bg.mp4"></video>
                <div class="absolute inset-0 bg-black/50"></div>
            </div>
            
            <div class="container mx-auto px-6 relative z-10">
                <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter animate-fade-in-up">
                    Acquire the <span class="pulse-text">Unfair Data Advantage</span>
                </h1>
                <p class="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-text-secondary animate-fade-in-up" style="animation-delay: 200ms;">
                    Stop training on noisy, scraped data. Access the proprietary datasets needed to build truly intelligent models and outperform the competition.
                </p>
                <div class="mt-10 animate-fade-in-up" style="animation-delay: 400ms;">
                    <a href="#plans" class="px-10 py-4 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent-purple/30 hover:brightness-110">
                        View Data Plans
                    </a>
                </div>
            </div>
        </section>

        <section class="py-20 md:py-32 relative bg-abyss-dark bg-grid-pattern bg-grid-size animate-grid-pan">
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#08080A)]"></div>
            <div class="container mx-auto px-6 max-w-7xl relative z-10">
                <div class="grid lg:grid-cols-2 gap-16 items-center scroll-animate">
                    <div>
                        <h2 class="text-3xl md:text-4xl font-bold tracking-tight">Move Beyond Scraping. <br/><span class="gradient-text">Embrace Verifiable Quality.</span></h2>
                        <p class="text-text-secondary mt-6 text-lg">The public internet is noisy, unreliable, and fraught with legal risks. Lumen offers a clear, ethical, and high-quality alternative, directly connecting you with the world's most valuable, untapped data source.</p>
                        <a href="/docs/security" class="mt-8 inline-block px-8 py-3 font-bold bg-primary text-text-main rounded-lg transition-all duration-300 hover:bg-subtle/80 hover:-translate-y-1">Our Security & Anonymization Promise</a>
                    </div>
                    <div class="space-y-8">
                        <div class="flex items-start space-x-4"><div class="p-0.5 rounded-lg bg-hero-gradient w-12 h-12 flex items-center justify-center shrink-0"><div class="w-full h-full bg-primary rounded-[5px] flex items-center justify-center text-lg font-bold">1</div></div><div><h4 class="font-bold">Human-Generated Code</h4><p class="text-text-secondary text-sm">Every line of code is human-written, offering authentic logic, structure, and intent that is impossible to synthesize.</p></div></div>
                        <div class="flex items-start space-x-4"><div class="p-0.5 rounded-lg bg-hero-gradient w-12 h-12 flex items-center justify-center shrink-0"><div class="w-full h-full bg-primary rounded-[5px] flex items-center justify-center text-lg font-bold">2</div></div><div><h4 class="font-bold">Proprietary & Unique</h4><p class="text-text-secondary text-sm">Contributions are vetted for novelty, providing access to datasets that are not available on public platforms like GitHub.</p></div></div>
                        <div class="flex items-start space-x-4"><div class="p-0.5 rounded-lg bg-hero-gradient w-12 h-12 flex items-center justify-center shrink-0"><div class="w-full h-full bg-primary rounded-[5px] flex items-center justify-center text-lg font-bold">3</div></div><div><h4 class="font-bold">Ethical & Compliant</h4><p class="text-text-secondary text-sm">All data is sourced with explicit contributor consent and anonymized locally, mitigating copyright and privacy risks.</p></div></div>
                    </div>
                </div>
            </div>
        </section>

        <section id="plans" class="py-20 md:py-32 relative">
            <div class="container mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto scroll-animate">
                    <h2 class="text-3xl md:text-4xl font-bold">A Data Plan for Every Ambition</h2>
                    <p class="mt-4 text-text-secondary">From initial exploration to enterprise-grade foundation models. Unlock your AI's true potential.</p>
                </div>
                <div class="mt-16 max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 items-stretch">
                    
                    <div class="flex flex-col bg-surface border border-primary rounded-xl p-8 transition-all duration-300 hover:border-subtle hover:shadow-2xl hover:shadow-black/20 scroll-animate" style="animation-delay: 100ms;">
                        <h3 class="text-2xl font-bold">Researcher</h3>
                        <p class="text-text-secondary mt-1">For individuals, academics, and fine-tuning projects.</p>
                        <p class="my-6"><span class="text-5xl font-bold">$249</span><span class="text-text-secondary">/mo</span></p>
                        <ul class="space-y-4 mb-8 text-sm flex-grow">
                            ${renderFeatureListItem('<strong>10 Million</strong> Tokens/month')}
                            ${renderFeatureListItem('API Access with Standard Rate Limit')}
                            ${renderFeatureListItem('Filter by Language & Token Count')}
                            ${renderFeatureListItem('Access to public data samples')}
                            ${renderFeatureListItem('Usage Analytics Dashboard')}
                            ${renderFeatureListItem('Standard Community Support')}
                        </ul>
                        <a href="mailto:${contactEmail}?subject=Inquiry: Researcher Plan" class="plan-button-secondary mt-auto">Choose Plan</a>
                    </div>
                    
                    <div class="relative p-px bg-gradient-to-b from-accent-purple to-accent-pink rounded-xl scroll-animate" style="animation-delay: 200ms;">
                        <div class="relative flex flex-col h-full bg-surface rounded-[11px] p-8">
                            <div class="absolute top-0 right-8 -mt-4">
                                <div class="bg-accent-pink text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">Most Popular</div>
                            </div>
                            <h3 class="text-2xl font-bold">Startup</h3>
                            <p class="text-text-secondary mt-1">For professional teams building and scaling AI products.</p>
                            <p class="my-6"><span class="text-5xl font-bold">$1,499</span><span class="text-text-secondary">/mo</span></p>
                            <ul class="space-y-4 mb-8 text-sm flex-grow">
                                ${renderFeatureListItem('<strong>75 Million</strong> Tokens/month')}
                                ${renderFeatureListItem('Python & TypeScript SDKs')}
                                ${renderFeatureListItem('Advanced filtering by all quality scores')}
                                ${renderFeatureListItem('Access to <strong>90-day</strong> historical data')}
                                ${renderFeatureListItem('Advanced Analytics & Reporting')}
                                ${renderFeatureListItem('Priority Email & Community Support')}
                            </ul>
                            <a href="mailto:${contactEmail}?subject=Inquiry: Startup Plan" class="plan-button-primary mt-auto">Choose Plan</a>
                        </div>
                    </div>
                    
                    <div class="flex flex-col bg-surface border border-primary rounded-xl p-8 transition-all duration-300 hover:border-subtle hover:shadow-2xl hover:shadow-black/20 scroll-animate" style="animation-delay: 300ms;">
                        <h3 class="text-2xl font-bold">Enterprise</h3>
                        <p class="text-text-secondary mt-1">For foundation models and custom training needs.</p>
                        <p class="my-6"><span class="text-5xl font-bold">$25,000+</span><span class="text-text-secondary">/mo</span></p>
                        <ul class="space-y-4 mb-8 text-sm flex-grow">
                            ${renderFeatureListItem('<strong>Unlimited</strong> / Custom Volume')}
                            ${renderFeatureListItem('Dedicated API endpoints & high-throughput')}
                            ${renderFeatureListItem('Full historical data access')}
                            ${renderFeatureListItem('Custom dataset curation & labeling')}
                            ${renderFeatureListItem('Enterprise SLA & Dedicated Solutions Architect')}
                            ${renderFeatureListItem('Bespoke Security & Compliance Reviews')}
                        </ul>
                        <a href="mailto:${contactEmail}?subject=Inquiry: Enterprise Plan" class="plan-button-secondary mt-auto">Contact Sales</a>
                    </div>
                </div>
                 <div class="mt-8 text-center text-text-secondary text-sm scroll-animate">
                    <p>All plans include immediate API key generation and access to a secure data portal with detailed usage analytics.</p>
                    <p>Contact us for custom data requirements or alternative payment options.</p>
                </div>
            </div>
        </section>

        <section class="py-20 md:py-32 relative bg-surface/30">
            <div class="container mx-auto px-6 max-w-7xl scroll-animate">
                ${renderDataExplorer()}
            </div>
        </section>
    </main>
    `;

    const attachEventListeners = () => {
        const qualityRange = document.getElementById('explorer-quality-range');
        const qualityValue = document.getElementById('explorer-quality-value');
        const runQueryBtn = document.getElementById('explorer-run-query-btn');
        const placeholder = document.getElementById('explorer-placeholder');
        const resultsContent = document.getElementById('explorer-results-content');
        const langFilter = document.getElementById('explorer-lang-filter');

        if (qualityRange && qualityValue) {
            qualityRange.addEventListener('input', () => { qualityValue.textContent = (qualityRange.value / 100).toFixed(2); });
        }

        if (runQueryBtn) {
            runQueryBtn.addEventListener('click', () => {
                runQueryBtn.disabled = true;
                runQueryBtn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Fetching...`;
                if (placeholder) placeholder.style.display = 'none';
                if (resultsContent) {
                    resultsContent.style.display = 'flex';
                    resultsContent.innerHTML = `<div class="m-auto text-center"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span><p class="mt-4 text-text-secondary font-sans">Querying live index...</p></div>`;
                }

                setTimeout(() => {
                    const selectedLang = langFilter.value;
                    const minQuality = qualityRange.value / 100;
                    const filteredData = sampleData.filter(item => (selectedLang === 'All High-Quality' || item.lang === selectedLang) && item.quality >= minQuality);
                    
                    if (resultsContent) {
                        resultsContent.style.display = 'block';
                        resultsContent.innerHTML = filteredData.length > 0 ? filteredData.map(item => `
                            <div class="bg-primary/50 border border-subtle/50 rounded-lg mb-4 overflow-hidden animate-fade-in-up">
                                <div class="px-4 py-2 bg-surface/50 flex justify-between items-center text-xs font-sans">
                                    <span class="font-bold text-accent-cyan">${item.lang}</span>
                                    <span class="text-text-secondary">Quality: <strong class="text-text-main font-mono">${item.quality.toFixed(2)}</strong></span>
                                    <span class="text-text-secondary">Tokens: <strong class="text-text-main font-mono">${item.tokens}</strong></span>
                                </div>
                                <pre class="p-4 text-xs text-text-secondary overflow-x-auto"><code>${item.code.trim()}</code></pre>
                            </div>`).join('') : `<div class="text-center text-text-secondary p-8 font-sans">No samples match your criteria. Try adjusting the filters.</div>`;
                    }
                    runQueryBtn.disabled = false;
                    runQueryBtn.innerHTML = 'Fetch Data Sample';
                    const usageEl = document.getElementById('explorer-token-usage');
                    if (usageEl) {
                        const tokensUsed = filteredData.reduce((acc, item) => acc + item.tokens, 0);
                        usageEl.textContent = `${Math.max(0, 10000 - tokensUsed).toLocaleString()} Tokens`;
                    }
                }, 1200);
            });
        }
        
        const animatedElements = document.querySelectorAll('.scroll-animate');
        if (animatedElements.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('scrolled-in');
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
            animatedElements.forEach(el => { observer.observe(el); });
        }
    };
    
    requestAnimationFrame(attachEventListeners);
    return renderPageContent();
}