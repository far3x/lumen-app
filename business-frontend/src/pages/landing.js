export function renderLandingPage() {
    // REVISED: New, bespoke SVG icons for a professional look.
    const icons = {
        proprietary: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.5 14.5L12 18l-3.5-3.5M12 6v12M21 12H3"/></svg>`,
        security: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>`,
        quality: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>`,
    };

    const featurePillar = (icon, title, text) => `
        <div class="text-left scroll-animate" style="transform: translateY(2rem);">
            <!-- REVISED: Icon container is now w-18 h-18 (30% larger) -->
            <div class="flex-shrink-0 w-18 h-18 flex items-center justify-center bg-background rounded-lg text-text-headings border border-border">
                ${icon}
            </div>
            <!-- REVISED: Title font size increased -->
            <h3 class="mt-6 text-2xl font-semibold text-text-headings">${title}</h3>
            <!-- REVISED: Body font size increased -->
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
                        <!-- REVISED: Font weight changed from extrabold to bold -->
                        <h1 class="text-6xl md:text-8xl font-bold text-text-headings tracking-tighter leading-tight">
                            Your Code. Your Value.<br>Our Mission.
                        </h1>
                        <p class="mt-8 max-w-xl mx-auto lg:mx-0 text-lg md:text-xl text-text-body">
                            Unlock the value of your proprietary code. We provide the secure data layer for AI leaders to build world-class models without legal risk.
                        </p>
                        <div class="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                            <a href="#contact" class="w-full sm:w-auto px-8 py-3 font-semibold text-white bg-accent-gradient rounded-md transition-transform hover:scale-105">Book a Demo</a>
                            <a href="/product" class="w-full sm:w-auto px-8 py-3 font-semibold text-white bg-text-headings hover:bg-opacity-90 rounded-md transition-colors">Explore the Platform</a>
                        </div>
                    </div>
                    <div class="lg:col-span-2 hidden lg:flex items-center justify-center h-96 bg-background rounded-lg border border-border overflow-hidden">
                        <!-- REVISED: Changed object-cover to object-contain -->
                        <img src="/jellyfish.gif" alt="Abstract data animation" class="w-full h-full object-contain"/>
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
                <!-- REVISED: Removed max-w-7xl to maximize horizontal space -->
                <div class="mt-20 grid md:grid-cols-3 gap-16">
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
                <!-- REVISED: Removed max-w-7xl to maximize horizontal space -->
                <div class="mt-20 grid lg:grid-cols-2 gap-24 items-center">
                    <div class="scroll-animate" style="transform: translateY(2rem);">
                        <h3 class="text-3xl font-bold text-text-headings">Build better AI with data you can trust</h3>
                        <p class="mt-4 text-lg text-text-body">Great models are built with great data. Lumen provides the tools to create, filter, and deploy high-signal training sets with unparalleled control and privacy.</p>
                        <ul class="mt-6 space-y-3">
                            <li class="flex items-center gap-3 text-lg text-text-body"><svg class="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Acquire ethically-sourced, human-written code.</li>
                            <li class="flex items-center gap-3 text-lg text-text-body"><svg class="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Filter datasets by language and AI-driven quality scores.</li>
                            <li class="flex items-center gap-3 text-lg text-text-body"><svg class="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Integrate seamlessly with your MLOps pipeline via our secure API.</li>
                        </ul>
                    </div>
                    <div class="h-96 bg-background rounded-lg border border-border flex items-center justify-center scroll-animate animate-delay-1" style="transform: translateY(2rem);">
                         <p class="text-text-muted">Product Screenshot Placeholder</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- SOCIAL PROOF (DARK SECTION) -->
        <section class="py-24 md:py-32 bg-dark-surface text-white">
            <div class="container mx-auto px-6 max-w-6xl text-center">
                 <div class="max-w-3xl mx-auto scroll-animate" style="transform: translateY(2rem);">
                    <p class="section-label">Customer Stories</p>
                    <h2 class="text-4xl md:text-5xl font-bold">Industry leaders are data + AI companies</h2>
                    <p class="mt-6 text-lg text-text-muted">Our partners achieve breakthroughs, innovate faster, and drive down costs. See how they do it with Lumen.</p>
                </div>
                <div class="mt-20 h-48 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center scroll-animate animate-delay-1" style="transform: translateY(2rem);">
                     <p class="text-white/30">Customer Logos Placeholder</p>
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
                <div class="mt-12 bg-white p-8 rounded-lg border border-border shadow-xl scroll-animate animate-delay-1" style="transform: translateY(2rem);">
                    <form id="contact-form" class="space-y-4 text-left">
                        <h3 class="text-2xl font-bold text-text-headings mb-4 text-center">Contact Sales</h3>
                        <div class="h-40 bg-background rounded-md border border-border flex items-center justify-center">
                             <p class="text-text-muted">Contact Form Placeholder</p>
                        </div>
                        <div>
                            <button type="submit" class="w-full mt-2 px-8 py-3 font-semibold text-white bg-accent-gradient rounded-md transition-transform hover:scale-105">Submit Request</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    </div>
    `;
}