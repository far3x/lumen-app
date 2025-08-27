export function renderWhyLumenPage() {
    return `
    <div>
        <!-- HERO SECTION -->
        <section class="py-24 md:py-32 bg-background text-center">
            <div class="container mx-auto px-6">
                <h1 class="text-5xl md:text-7xl font-bold text-text-headings tracking-tighter leading-tight">
                    The End of Scraping.<br>The Beginning of Intelligence.
                </h1>
                <p class="mt-8 max-w-3xl mx-auto text-lg md:text-xl text-text-body">
                    The quality of your AI is limited by the quality of your data. We provide the one data source you can't find anywhere else: a secure, ethically-sourced stream of proprietary, human-written code.
                </p>
            </div>
        </section>

        <!-- PROBLEM SECTION -->
        <section class="py-24 md:py-32 bg-white">
            <div class="container mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto">
                    <p class="section-label">THE CHALLENGE</p>
                    <h2 class="text-4xl md:text-5xl font-bold text-text-headings">The Public Internet is a Compromised Asset</h2>
                    <p class="mt-6 text-lg text-text-body">Training on publicly scraped data is no longer a viable strategy. It's a race to the bottom, exposing your models and your business to systemic risks.</p>
                </div>
                <div class="mt-20 grid md:grid-cols-3 gap-12 text-left">
                    <div class="bg-background p-8 rounded-lg">
                        <h3 class="font-bold text-xl text-text-headings">The Poisoned Well of Model Collapse</h3>
                        <p class="mt-2 text-text-muted">Public data is saturated with low-quality tutorials, insecure code, and synthetic output from other AIs. Training on this noise fundamentally limits your model's reasoning capabilities.</p>
                    </div>
                     <div class="bg-background p-8 rounded-lg">
                        <h3 class="font-bold text-xl text-text-headings">The Ticking Clock of Legal Risk</h3>
                        <p class="mt-2 text-text-muted">Using code without explicit consent is a legal and ethical minefield. Copyright infringement and license violations pose an existential threat to models built on scraped data.</p>
                    </div>
                     <div class="bg-background p-8 rounded-lg">
                        <h3 class="font-bold text-xl text-text-headings">The Innovation Bottleneck</h3>
                        <p class="mt-2 text-text-muted">The most valuable code, novel algorithms, complex architectures, and proprietary business logic is locked away in private repositories, completely inaccessible to your models.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- SOLUTION SECTION -->
        <section class="py-24 md:py-32 bg-background">
             <div class="container mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto">
                    <p class="section-label">THE SOLUTION</p>
                    <h2 class="text-4xl md:text-5xl font-bold text-text-headings">A Foundation of Security, Quality, and Exclusivity</h2>
                    <p class="mt-6 text-lg text-text-body">Lumen was engineered from the ground up to solve these fundamental problems. Our platform is built on three pillars that provide an unshakeable foundation for building world-class AI.</p>
                </div>
                
                <div class="mt-20 space-y-24">
                    <!-- Pillar 1: Security -->
                    <div class="grid lg:grid-cols-2 gap-16 items-center">
                        <div class="w-full h-[28rem] bg-white rounded-lg border border-border flex items-center justify-center p-8">
                           <img src="/shield.png" alt="A shield icon representing security and confidence" class="w-full h-full object-contain">
                        </div>
                        <div class="flex flex-col justify-center">
                             <h3 class="text-3xl font-bold text-text-headings">Operate with Unshakeable Confidence</h3>
                             <p class="mt-4 text-lg text-text-body">Lumen de-risks your entire data pipeline. Our security model is built on a "local-first" principle, where all code is anonymized on the contributor's machine before upload. By sourcing data with explicit consent via our Contributor License Agreement, we provide a fully-auditable, legally-defensible asset that protects you from the copyright and privacy liabilities of web scraping.</p>
                        </div>
                    </div>
                    <!-- Pillar 2: Quality -->
                     <div class="grid lg:grid-cols-2 gap-16 items-center">
                        <div class="lg:order-2 w-full h-[28rem] bg-white rounded-lg border border-border flex items-center justify-center p-8">
                           <img src="/gear.png" alt="A gear icon representing precision and quality control" class="w-full h-full object-contain">
                        </div>
                        <div class="lg:order-1 flex flex-col justify-center">
                             <h3 class="text-3xl font-bold text-text-headings">Build with Unprecedented Precision</h3>
                             <p class="mt-4 text-lg text-text-body">Stop training on noise. Our hybrid valuation engine acts as a rigorous quality gate, analyzing every contribution for complexity, architectural quality, and semantic uniqueness. This allows you to move beyond simple keyword filtering and curate bespoke datasets based on deep, structural attributes of the code, resulting in higher-performance models.</p>
                        </div>
                    </div>
                     <!-- Pillar 3: Exclusivity -->
                    <div class="grid lg:grid-cols-2 gap-16 items-center">
                        <div class="w-full h-[28rem] bg-white rounded-lg border border-border flex items-center justify-center p-8">
                           <img src="/diamond.png" alt="A diamond icon representing exclusivity and unique value" class="w-full h-full object-contain">
                        </div>
                        <div class="flex flex-col justify-center">
                             <h3 class="text-3xl font-bold text-text-headings">Secure a Definitive Advantage</h3>
                             <p class="mt-4 text-lg text-text-body">Lumen provides access to the data your competitors cannot find. Our network is a continuously growing reservoir of proprietary, human-written code that does not exist on GitHub or the public internet. By training on this unique ground-truth data, you escape the echo chamber of public models and unlock novel capabilities.</p>
                        </div>
                    </div>
                </div>
             </div>
        </section>

        <!-- COMPARISON SECTION -->
        <section class="py-24 md:py-32 bg-white">
            <div class="container mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto">
                    <h2 class="text-4xl md:text-5xl font-bold text-text-headings">The Lumen Difference</h2>
                    <p class="mt-6 text-lg text-text-body">A clear choice for data intelligence.</p>
                </div>
                <div class="mt-16 overflow-x-auto">
                    <table class="w-full min-w-[700px] text-left border-collapse">
                        <thead>
                            <tr>
                                <th class="p-4 border-b-2 border-border font-bold text-text-headings">Feature</th>
                                <th class="p-4 border-b-2 border-border font-bold text-text-headings">Web Scraping / Public Data</th>
                                <th class="p-4 border-b-2 border-border font-bold text-text-headings">Lumen Protocol</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="even:bg-gray-50/50"><td class="p-4 font-semibold text-text-body">Data Source</td><td class="p-4 text-text-muted"><span class="flex items-center gap-2"><svg class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>Public, noisy, often AI-generated</span></td><td class="p-4 text-text-headings"><span class="flex items-center gap-2"><svg class="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Proprietary, human-written, high-signal</span></td></tr>
                            <tr class="even:bg-gray-50/50"><td class="p-4 font-semibold text-text-body">Legal Risk</td><td class="p-4 text-text-muted"><span class="flex items-center gap-2"><svg class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>High (Copyright & License Violations)</span></td><td class="p-4 text-text-headings"><span class="flex items-center gap-2"><svg class="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Mitigated (Explicit Contributor Consent via CLA)</span></td></tr>
                            <tr class="even:bg-gray-50/50"><td class="p-4 font-semibold text-text-body">Quality Control</td><td class="p-4 text-text-muted"><span class="flex items-center gap-2"><svg class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>None (Unfiltered, inconsistent)</span></td><td class="p-4 text-text-headings"><span class="flex items-center gap-2"><svg class="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Rigorous (AI-driven scoring on every contribution)</span></td></tr>
                            <tr class="even:bg-gray-50/50"><td class="p-4 font-semibold text-text-body">Novelty</td><td class="p-4 text-text-muted"><span class="flex items-center gap-2"><svg class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>Low (Repetitive, tutorial-heavy)</span></td><td class="p-4 text-text-headings"><span class="flex items-center gap-2"><svg class="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>High (Focus on unique, non-public code)</span></td></tr>
                            <tr><td class="p-4 font-semibold text-text-body">Anonymization</td><td class="p-4 text-text-muted"><span class="flex items-center gap-2"><svg class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>N/A (PII and secrets often exposed)</span></td><td class="p-4 text-text-headings"><span class="flex items-center gap-2"><svg class="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Built-in (Secure, local-first sanitization)</span></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- FINAL CTA -->
        <section class="py-24 md:py-32 bg-white text-center">
            <div class="container mx-auto px-6">
                <h2 class="text-4xl md:text-5xl font-bold text-text-headings">Ready to Build the Future?</h2>
                <p class="mt-6 max-w-2xl mx-auto text-lg text-text-body">See for yourself how Lumen's strategic data can transform your AI development pipeline. Book a demo with our team today.</p>
                <div class="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6">
                    <a href="/contact" class="px-8 py-3 font-semibold text-white bg-accent-gradient rounded-md transition-all duration-300 hover:scale-105 hover:brightness-110">Book a Demo</a>
                    <a href="/product" class="font-semibold text-text-headings hover:text-primary transition-colors">Explore our Product &rarr;</a>
                </div>
            </div>
        </section>
    </div>
    `;
}