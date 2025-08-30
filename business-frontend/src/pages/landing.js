export function renderLandingPage() {
    const icons = {
        proprietary: `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/></svg>`,
        security: `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4"></path></svg>`,
        quality: `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.375 12.735L12.735 18.375a6 6 0 01-8.485-8.485l7.07-7.07a4.5 4.5 0 016.364 6.364l-6.363 6.364a3 3 0 01-4.242-4.242l5.656-5.657" /></svg>`,
    };

    const featurePillar = (icon, title, text) => `
        <div class="text-left scroll-animate" style="transform: translateY(2rem);">
            <div class="flex-shrink-0 w-24 h-24 p-7 flex items-center justify-start bg-background rounded-lg text-text-headings border-2 border-gray-200">
                ${icon}
            </div>
            <h3 class="mt-6 text-2xl font-semibold text-text-headings">${title}</h3>
            <p class="mt-2 text-xl text-text-body">${text}</p>
        </div>
    `;

    return `
    <div>
        <!-- HERO SECTION -->
        <section class="py-24 md:py-40">
            <div class="container mx-auto px-6">
                <div class="grid lg:grid-cols-5 gap-16 items-center">
                    <div class="lg:col-span-3 text-center lg:text-left">
                        <h1 class="text-6xl md:text-8xl font-bold text-text-headings tracking-tighter leading-tight">
                            Your Code. Your Value.<br>Our Mission.
                        </h1>
                        <p class="mt-8 max-w-xl mx-auto lg:mx-0 text-lg md:text-xl text-text-body">
                            Unlock the value of your proprietary code. We provide the secure data layer for AI leaders to build world-class models without legal risk.
                        </p>
                        <div class="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                            <a href="/contact" class="w-full sm:w-auto px-8 py-3 font-semibold text-white bg-accent-gradient rounded-md transition-all duration-300 hover:scale-105 hover:brightness-110">Book a Demo</a>
                            <a href="/product" class="w-full sm:w-auto px-8 py-3 font-semibold text-white bg-text-headings hover:bg-opacity-90 rounded-md transition-colors">Explore the Platform</a>
                        </div>
                    </div>
                    <div class="lg:col-span-2 hidden lg:flex items-center justify-end h-96 w-96 bg-background rounded-lg overflow-hidden">
                        <img src="/logo.gif" alt="Abstract data animation" class="w-full h-full object-contain"/>
                    </div>
                </div>
            </div>
        </section>

        <!-- PLATFORM PILLARS -->
        <section class="py-24 md:py-32">
            <div class="container mx-auto px-6">
                <div class="max-w-3xl mx-auto text-center scroll-animate" style="transform: translateY(2rem);">
                    <p class="section-label">The Platform</p>
                    <h2 class="text-4xl md:text-5xl font-bold text-text-headings">A Foundation of Trust & Quality</h2>
                    <p class="mt-6 text-lg text-text-body">Lumen is engineered to solve the core challenges of AI data sourcing, providing a clear path from proprietary code to high-performance models.</p>
                </div>
                <div class="mt-20 grid md:grid-cols-3 gap-16 items-start">
                    ${featurePillar(icons.proprietary, 'Access Proprietary Signal', 'Train on novel, human-written code that doesn’t exist in public repositories, giving your models a true competitive advantage.')}
                    ${featurePillar(icons.security, 'Operate with Confidence', 'Mitigate legal risk with an ethically-sourced data pipeline. All contributions are anonymized locally and provided with explicit consent.')}
                    ${featurePillar(icons.quality, 'Build with Precision', 'Our valuation engine scores every contribution, allowing you to filter by quality, complexity, and architecture to build superior training sets.')}
                </div>
                <div class="mt-20 flex justify-center items-center gap-4 scroll-animate" style="transform: translateY(2rem);">
                    <a href="/product" class="px-6 py-3 font-semibold text-white bg-text-headings hover:bg-opacity-90 rounded-md transition-colors">Explore the Platform</a>
                    <a href="/docs" class="font-semibold text-text-body hover:text-text-headings transition-colors">View Documentation &rarr;</a>
                </div>
            </div>
        </section>
        
        <!-- PRODUCT SHOWCASE -->
        <section class="py-24 md:py-32 bg-white">
            <div class="container mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto scroll-animate" style="transform: translateY(2rem);">
                    <p class="section-label">Use Cases</p>
                    <h2 class="text-4xl md:text-5xl font-bold text-text-headings">Data-Centric Intelligence</h2>
                </div>
                <div class="mt-20 grid lg:grid-cols-2 gap-24 items-center">
                    <div class="scroll-animate" style="transform: translateY(2rem);">
                        <h3 class="text-3xl font-bold text-text-headings">Build better AI with data you can trust</h3>
                        <p class="mt-4 text-lg text-text-body">Great models are built with great data. Lumen provides the tools to create, filter, and deploy high-signal training sets with unparalleled control and privacy.</p>
                        <ul class="mt-6 space-y-3">
                            <li class="flex items-center gap-3 text-lg text-text-body"><svg class="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Acquire ethically-sourced, human-written code.</li>
                            <li class="flex items-center gap-3 text-lg text-text-body"><svg class="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Filter datasets by language and AI-driven quality scores.</li>
                            <li class="flex items-center gap-3 text-lg text-text-body"><svg class="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Integrate seamlessly with your MLOps pipeline via our secure API.</li>
                        </ul>
                        <div class="mt-10 flex items-center gap-6">
                            <a href="/product" class="px-6 py-3 font-semibold text-white bg-text-headings hover:bg-opacity-90 rounded-md transition-colors">Explore the Data</a>
                            <a href="/docs" class="font-semibold text-text-body hover:text-text-headings transition-colors">View Documentation &rarr;</a>
                        </div>
                    </div>
                    <div class="bg-background rounded-lg border border-border shadow-xl overflow-hidden scroll-animate animate-delay-1" style="transform: translateY(2rem);">
                         <img src="/dashboard-preview.png" alt="Lumen Business Dashboard Preview" class="w-full h-full object-cover object-top">
                    </div>
                </div>
            </div>
        </section>

        <!-- CONTACT FORM -->
        <section id="contact" class="py-24 md:py-32">
             <div class="container mx-auto px-6 max-w-lg text-center">
                <div class="scroll-animate" style="transform: translateY(2rem);">
                    <h2 class="text-4xl font-bold text-text-headings">Ready to Get Started?</h2>
                    <p class="mt-4 text-lg text-text-body">Book a demo or contact our team to learn how Lumen can provide your organization with a strategic data advantage.</p>
                </div>
                <div class="mt-12 flex flex-col items-center gap-4 scroll-animate animate-delay-1" style="transform: translateY(2rem);">
                    <a href="/contact" class="w-full sm:w-auto px-8 py-3 font-semibold text-white bg-accent-gradient rounded-md transition-all duration-300 hover:scale-105 hover:brightness-110">
                        Contact Sales
                    </a>
                    <p class="text-sm text-text-muted">or <a href="/product" class="text-text-body font-semibold hover:underline">explore our platform first</a>.</p>
                </div>
            </div>
        </section>
    </div>
    `;
}