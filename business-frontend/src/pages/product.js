export function renderProductPage() {
    const featureCard = (icon, title, text) => `
        <div class="bg-white p-8 rounded-lg border border-gray-200">
            <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary text-white rounded-lg">
                ${icon}
            </div>
            <h3 class="mt-5 font-bold text-xl text-text-headings">${title}</h3>
            <p class="mt-2 text-text-body">${text}</p>
        </div>
    `;

    const checkmarkIcon = `<svg class="w-6 h-6 text-primary shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;

    return `
    <div class="bg-background">
        <!-- HERO SECTION -->
        <section class="py-24 md:py-32">
            <div class="container mx-auto px-6 text-center">
                <h1 class="text-5xl md:text-7xl font-bold text-text-headings tracking-tighter leading-tight">
                    The Platform for Precision AI Training
                </h1>
                <p class="mt-8 max-w-3xl mx-auto text-lg md:text-xl text-text-body">
                    Lumen provides the complete toolset to discover, analyze, and integrate the world's most valuable proprietary code data into your AI development pipeline, securely and at scale.
                </p>
                <div class="mt-10">
                    <a href="/contact" class="px-8 py-4 font-semibold text-white bg-accent-gradient rounded-md transition-all duration-300 hover:scale-105 hover:brightness-110">
                        Request a Demo
                    </a>
                </div>
            </div>
        </section>

        <!-- CORE FEATURES SECTION -->
        <section class="py-24 md:py-32 bg-white">
            <div class="container mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto">
                    <p class="section-label">CORE PLATFORM</p>
                    <h2 class="text-4xl md:text-5xl font-bold text-text-headings">A Unified Data Intelligence Suite</h2>
                </div>
                <div class="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${featureCard(
                        `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>`,
                        'Data Explorer',
                        'Navigate our entire dataset with powerful, granular filters. Isolate high-signal code by language, token count, and our proprietary AI-driven scores for quality, clarity, and architecture.'
                    )}
                    ${featureCard(
                        `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>`,
                        'Secure API & SDKs',
                        'Integrate Lumen data directly into your MLOps pipeline. Our secure, RESTful API allows for programmatic access to unlocked contributions, with SDKs for Python and TypeScript coming soon.'
                    )}
                    ${featureCard(
                        `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`,
                        'Analytics Dashboard',
                        'Your central hub for data intelligence. Monitor token consumption, track usage trends over time, manage API key permissions, and see a detailed history of all unlocked data assets.'
                    )}
                </div>
            </div>
        </section>

        <!-- SHOWCASE SECTION -->
        <section class="py-24 md:py-32 bg-background">
             <div class="container mx-auto px-6">
                <div class="grid lg:grid-cols-2 gap-16 items-center">
                    <div class="lg:pr-10">
                        <p class="section-label">PRECISION & CONTROL</p>
                        <h2 class="text-3xl md:text-4xl font-bold text-text-headings mt-4">Curate Datasets, Don't Just Collect Them</h2>
                        <p class="mt-6 text-lg text-text-body">Move beyond the limitations of generic data. Lumen empowers you to build bespoke, high-signal training sets that directly address your model's specific needs, leading to superior performance and novel capabilities.</p>
                        <ul class="mt-8 space-y-4">
                            <li class="flex items-start gap-4">${checkmarkIcon}<span><strong>Isolate Excellence:</strong> Filter for contributions with a 9.0+ architectural quality score to teach your model superior design patterns.</span></li>
                            <li class="flex items-start gap-4">${checkmarkIcon}<span><strong>Target Specific Domains:</strong> Use keyword search combined with language filters to build specialized datasets for niche industries like FinTech or scientific computing.</span></li>
                            <li class="flex items-start gap-4">${checkmarkIcon}<span><strong>Control for Complexity:</strong> Selectively acquire code within specific complexity and token-count ranges to fine tune your model for particular tasks.</span></li>
                        </ul>
                    </div>
                    <div class="bg-white rounded-lg border border-border shadow-2xl overflow-hidden">
                        <img src="/dashboard-search.png" alt="Lumen Business Dashboard showing the powerful data explorer search functionality" class="w-full h-full object-cover">
                    </div>
                </div>
            </div>
        </section>

        <!-- FINAL CTA -->
        <section class="py-24 md:py-32 bg-white">
            <div class="container mx-auto px-6 text-center">
                <h2 class="text-4xl md:text-5xl font-bold text-text-headings">Unlock Your AI's True Potential</h2>
                <p class="mt-6 max-w-2xl mx-auto text-lg text-text-body">Stop competing on the same overused public data. Gain a strategic advantage with Lumen's exclusive, ethically-sourced datasets. Let's build the future, together.</p>
                <div class="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6">
                    <a href="/contact" class="px-8 py-3 font-semibold text-white bg-accent-gradient rounded-md transition-all duration-300 hover:scale-105 hover:brightness-110">Contact Sales</a>
                    <a href="/signup" class="font-semibold text-text-headings hover:text-primary transition-colors">Create a Free Account &rarr;</a>
                </div>
            </div>
        </section>
    </div>
    `;
}