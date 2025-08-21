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
                <div class="mt-20 grid md:grid-cols-3 gap-12 text-center">
                    <div class="bg-background p-8 rounded-lg border border-border">
                        <h3 class="font-bold text-xl text-text-headings">The Poisoned Well of Model Collapse</h3>
                        <p class="mt-2 text-text-muted">Public data is saturated with low-quality tutorials, insecure code, and synthetic output from other AIs. Training on this noise fundamentally limits your model's reasoning capabilities.</p>
                    </div>
                     <div class="bg-background p-8 rounded-lg border border-border">
                        <h3 class="font-bold text-xl text-text-headings">The Ticking Clock of Legal Risk</h3>
                        <p class="mt-2 text-text-muted">Using code without explicit consent is a legal and ethical minefield. Copyright infringement and license violations pose an existential threat to models built on scraped data.</p>
                    </div>
                     <div class="bg-background p-8 rounded-lg border border-border">
                        <h3 class="font-bold text-xl text-text-headings">The Innovation Bottleneck</h3>
                        <p class="mt-2 text-text-muted">The most valuable code—novel algorithms, complex architectures, and proprietary business logic—is locked away in private repositories, completely inaccessible to your models.</p>
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
                        <div class="w-full h-96 bg-white rounded-lg border border-border flex items-center justify-center">
                           <!-- 
                                IMAGE 1 GOES HERE
                                Suggested: A clean, abstract visual representing security. 
                                Think about a shield, a lock, or a simple diagram showing data flowing from a local machine through a "secure filter" before going to the cloud.
                                Filename: /public/security.jpg
                           -->
                           <p class="text-text-muted">Image Placeholder: Security (e.g., /public/security.jpg)</p>
                        </div>
                        <div>
                             <h3 class="text-3xl font-bold text-text-headings">Operate with Unshakeable Confidence</h3>
                             <p class="mt-4 text-lg text-text-body">Lumen de-risks your entire data pipeline. Our security model is built on a "local-first" principle, where all code is anonymized on the contributor's machine before upload. By sourcing data with explicit consent via our Contributor License Agreement, we provide a fully-auditable, legally-defensible asset that protects you from the copyright and privacy liabilities of web scraping.</p>
                        </div>
                    </div>
                    <!-- Pillar 2: Quality -->
                     <div class="grid lg:grid-cols-2 gap-16 items-center">
                        <div class="lg:order-2 w-full h-96 bg-white rounded-lg border border-border flex items-center justify-center">
                           <!-- 
                                IMAGE 2 GOES HERE
                                Suggested: A visual representing precision or filtering.
                                Think about a simple diagram of a funnel refining messy data points into clean, pure signal, or an abstract representation of data sorting.
                                Filename: /public/quality.jpg
                           -->
                           <p class="text-text-muted">Image Placeholder: Quality (e.g., /public/quality.jpg)</p>
                        </div>
                        <div class="lg:order-1">
                             <h3 class="text-3xl font-bold text-text-headings">Build with Unprecedented Precision</h3>
                             <p class="mt-4 text-lg text-text-body">Stop training on noise. Our hybrid valuation engine acts as a rigorous quality gate, analyzing every contribution for complexity, architectural quality, and semantic uniqueness. This allows you to move beyond simple keyword filtering and curate bespoke datasets based on deep, structural attributes of the code, resulting in higher-performance models.</p>
                        </div>
                    </div>
                     <!-- Pillar 3: Exclusivity -->
                    <div class="grid lg:grid-cols-2 gap-16 items-center">
                        <div class="w-full h-96 bg-white rounded-lg border border-border flex items-center justify-center">
                           <!-- 
                                IMAGE 3 GOES HERE
                                Suggested: A visual representing a unique source or a competitive "moat".
                                Think about an abstract image of a single unique element (e.g., a gold cube) standing out from a crowd of gray cubes, or a simple, elegant "key" icon.
                                Filename: /public/exclusivity.jpg
                           -->
                           <p class="text-text-muted">Image Placeholder: Exclusivity (e.g., /public/exclusivity.jpg)</p>
                        </div>
                        <div>
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
                                <th class="p-4 border-b-2 border-border font-bold text-text-headings bg-background rounded-t-lg">Lumen Protocol</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-border"><td class="p-4 font-semibold text-text-body">Data Source</td><td class="p-4 text-text-muted">Public, noisy, often AI-generated</td><td class="p-4 text-text-headings bg-background">Proprietary, human-written, high-signal</td></tr>
                            <tr class="border-b border-border"><td class="p-4 font-semibold text-text-body">Legal Risk</td><td class="p-4 text-text-muted">High (Copyright & License Violations)</td><td class="p-4 text-text-headings bg-background">Mitigated (Explicit Contributor Consent via CLA)</td></tr>
                            <tr class="border-b border-border"><td class="p-4 font-semibold text-text-body">Quality Control</td><td class="p-4 text-text-muted">None (Unfiltered, inconsistent)</td><td class="p-4 text-text-headings bg-background">Rigorous (AI-driven scoring on every contribution)</td></tr>
                            <tr class="border-b border-border"><td class="p-4 font-semibold text-text-body">Novelty</td><td class="p-4 text-text-muted">Low (Repetitive, tutorial-heavy)</td><td class="p-4 text-text-headings bg-background">High (Focus on unique, non-public code)</td></tr>
                            <tr><td class="p-4 font-semibold text-text-body">Anonymization</td><td class="p-4 text-text-muted">N/A (PII and secrets often exposed)</td><td class="p-4 text-text-headings bg-background rounded-b-lg">Built-in (Secure, local-first sanitization)</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- FINAL CTA -->
        <section class="py-24 md:py-32 bg-dark-surface text-white text-center">
            <div class="container mx-auto px-6">
                <h2 class="text-4xl md:text-5xl font-bold">Ready to Build the Future?</h2>
                <p class="mt-6 max-w-2xl mx-auto text-lg text-text-muted">See for yourself how Lumen's strategic data can transform your AI development pipeline. Book a demo with our team today.</p>
                <div class="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6">
                    <a href="/contact" class="px-8 py-3 font-semibold text-white bg-accent-gradient rounded-md transition-all duration-300 hover:scale-105 hover:brightness-110">Book a Demo</a>
                    <a href="/product" class="font-semibold text-white hover:opacity-80 transition-opacity">Explore our Product &rarr;</a>
                </div>
            </div>
        </section>
    </div>
    `;
}