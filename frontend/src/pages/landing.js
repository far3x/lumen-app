export function renderLandingPage() {
    const externalLinkIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>`;

    return `
    <main id="content-root" class="flex-grow">
        
        <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;">
          <defs>
            <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: #8A2BE2;" />
              <stop offset="50%" style="stop-color: #FF69B4;" />
              <stop offset="100%" style="stop-color: #00D9D9;" />
            </linearGradient>
          </defs>
        </svg>

        <section class="relative flex flex-col justify-center min-h-screen text-center overflow-hidden isolate gradient-border-bottom">
            <video
                autoplay
                loop
                muted
                playsinline
                class="absolute top-0 left-0 w-full h-full object-cover -z-20"
                src="/plexus-bg.mp4"
            ></video>
            <div class="absolute top-0 left-0 w-full h-full bg-black/50 -z-10"></div>

            <div class="container mx-auto px-6 relative z-10">
                <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter animate-fade-in-up" style="animation-delay: 100ms;">
                    Monetize Your Code.
                    <br>
                    <span class="pulse-text block">Power the Future of AI.</span>
                </h1>
                
                <p class="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-text-secondary animate-fade-in-up" style="animation-delay: 300ms;">
                    Your code is the most valuable dataset on the planet. Anonymously contribute to the future of AI and get rewarded for its true worth.
                </p>
                
                <div class="mt-10 flex justify-center items-center gap-4 animate-fade-in-up" style="animation-delay: 500ms;">
                    <a href="/login" class="px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110">Start Earning Now</a>
                    <a href="/docs/introduction" class="px-8 py-3 font-bold bg-primary text-text-main rounded-lg transition-all duration-300 hover:bg-subtle/80 hover:-translate-y-1">Read the Docs</a>
                </div>
            </div>
        </section>

        <section class="relative py-20 md:py-32 bg-abyss-dark bg-grid-pattern bg-grid-size animate-grid-pan overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#08080A)]"></div>
            <div class="container mx-auto px-6 max-w-7xl relative z-10">
                
                <div class="text-center max-w-2xl mx-auto scroll-animate">
                    <h2 class="text-3xl md:text-4xl font-bold">A Frictionless Contributor Experience</h2>
                    <p class="mt-4 text-text-secondary">Go from code to crypto in minutes. Our open-source CLI is designed to integrate seamlessly into your workflow without compromising your privacy.</p>
                </div>

                <div class="mt-16 grid md:grid-cols-3 gap-8">
                    <div class="border border-subtle/50 p-8 rounded-xl bg-surface/80 flex flex-col scroll-animate transition-all duration-300 hover:transform hover:-translate-y-2 hover:border-accent-purple hover:shadow-xl hover:shadow-accent-purple/10" style="transition-delay: 100ms;">
                        <div class="mx-auto w-16 h-16 p-[1px] rounded-lg bg-hero-gradient">
                            <div class="w-full h-full bg-primary rounded-[7px] flex items-center justify-center">
                                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            </div>
                        </div>
                        <h3 class="text-xl font-bold mt-6">Install & Authenticate</h3>
                        <p class="text-text-secondary mt-2 flex-grow">Install the <code>pylumen</code> CLI and link it to your account with a single command.</p>
                        <div class="mt-4">
                            <pre class="text-left bg-primary p-3 rounded-md text-sm text-accent-cyan overflow-x-auto w-full"><code>pip install pylumen
lum login</code></pre>
                        </div>
                    </div>
                    
                    <div class="border border-subtle/50 p-8 rounded-xl bg-surface/80 flex flex-col scroll-animate transition-all duration-300 hover:transform hover:-translate-y-2 hover:border-accent-pink hover:shadow-xl hover:shadow-accent-pink/10" style="transition-delay: 200ms;">
                         <div class="mx-auto w-16 h-16 p-[1px] rounded-lg bg-hero-gradient">
                            <div class="w-full h-full bg-primary rounded-[7px] flex items-center justify-center">
                                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            </div>
                         </div>
                        <h3 class="text-xl font-bold mt-6">Contribute Your Project</h3>
                        <p class="text-text-secondary mt-2 flex-grow">Run <code>lum contribute</code> in your project's root. The CLI analyzes, anonymizes, and packages your code locally.</p>
                        <div class="mt-4">
                            <pre class="text-left bg-primary p-3 rounded-md text-sm text-accent-cyan overflow-x-auto w-full"><code>cd /path/to/my-project
lum contribute</code></pre>
                        </div>
                    </div>
                    
                    <div class="border border-subtle/50 p-8 rounded-xl bg-surface/80 flex flex-col scroll-animate transition-all duration-300 hover:transform hover:-translate-y-2 hover:border-accent-cyan hover:shadow-xl hover:shadow-accent-cyan/10" style="transition-delay: 300ms;">
                        <div class="mx-auto w-16 h-16 p-[1px] rounded-lg bg-hero-gradient">
                            <div class="w-full h-full bg-primary rounded-[7px] flex items-center justify-center">
                               <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                            </div>
                        </div>
                        <h3 class="text-xl font-bold mt-6">Get Rewarded</h3>
                        <p class="text-text-secondary mt-2 flex-grow">The protocol values your contribution and adds it to the processing queue. Track your rewards on your dashboard.</p>
                        <div class="mt-4">
                            <div class="text-left bg-primary p-4 rounded-md text-sm w-full">
                                <p class="text-green-400">✔ Contribution successful!</p>
                                <p class="text-text-secondary">+ Your submission is now in the processing queue.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-16 text-center scroll-animate" style="transition-delay: 400ms;">
                    <p class="text-text-secondary">Ready to get started? Dive into the documentation or explore the code.</p>
                    <div class="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <a href="/docs/installation" class="w-full sm:w-auto px-6 py-3 font-bold bg-primary text-text-main rounded-lg transition-all duration-300 hover:bg-subtle/80 hover:-translate-y-1">Installation Guide</a>
                        <a href="https://github.com/Far3000-YT/lumen" target="_blank" rel="noopener" data-external="true" class="group w-full sm:w-auto px-6 py-3 font-bold bg-transparent border border-subtle text-text-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-subtle/40 hover:text-text-main hover:-translate-y-1">
                            View on GitHub ${externalLinkIcon}
                        </a>
                    </div>
                </div>
            </div>
        </section>
        
        <section class="py-20 md:py-32 bg-background">
            <div class="container mx-auto px-6 max-w-7xl grid md:grid-cols-2 gap-16 items-center">
                <div class="scroll-animate">
                    <h2 class="text-3xl md:text-4xl font-bold">The AI Data Crisis is Here. <br><span class="gradient-text">Lumen is the Solution.</span></h2>
                    <p class="mt-6 text-text-secondary text-lg">
                        Large Language Models are hitting a wall. The public internet has been scraped, and <strong class="text-text-main">high-quality, human-written code is locked away</strong> in private repositories. This data scarcity threatens the future of AI innovation.
                    </p>
                    <p class="mt-4 text-text-secondary text-lg">
                        Lumen creates a <strong class="text-text-main">transparent and fair data sourcing protocol</strong>. We empower developers to become the primary data source for the next wave of AI, ensuring they are compensated for the value they create. <a href="/docs/why-lumen" class="text-accent-cyan hover:underline font-semibold">Learn why Lumen is different →</a>
                    </p>
                </div>
                <div class="space-y-8">
                    <div class="flex items-start space-x-4 scroll-animate" style="transition-delay: 100ms;">
                        <div class="p-[1px] rounded-lg bg-hero-gradient">
                            <div class="p-3 bg-primary rounded-[7px]"> <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> </div>
                        </div>
                        <div>
                            <h4 class="font-bold">Developer Contribution</h4>
                            <p class="text-text-secondary text-sm">Developers submit anonymized code via the secure Lumen CLI.</p>
                        </div>
                    </div>
                    <div class="flex items-start space-x-4 scroll-animate" style="transition-delay: 200ms;">
                         <div class="p-[1px] rounded-lg bg-hero-gradient">
                            <div class="p-3 bg-primary rounded-[7px]"> <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M12 20V10M18 20V4M6 20V16"></path></svg> </div>
                        </div>
                        <div>
                            <h4 class="font-bold">Protocol Valuation & Processing</h4>
                            <p class="text-text-secondary text-sm">The protocol analyzes, values, and adds the data to specialized training sets, rewarding the developer with $LUM.</p>
                        </div>
                    </div>
                    <div class="flex items-start space-x-4 scroll-animate" style="transition-delay: 300ms;">
                        <div class="p-[1px] rounded-lg bg-hero-gradient">
                            <div class="p-3 bg-primary rounded-[7px]"> <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8H4V6zm-2 8h20v2H2v-2z"></path></svg> </div>
                        </div>
                        <div>
                            <h4 class="font-bold">AI Company Access</h4>
                            <p class="text-text-secondary text-sm">AI companies purchase access to these high-quality, ethically-sourced datasets using $LUM tokens.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-20 md:py-32 bg-abyss-dark bg-starfield-pattern bg-starfield-size">
            <div class="container mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto scroll-animate">
                    <h2 class="text-4xl md:text-5xl font-bold"><span class="gradient-text">$LUM</span>: The Token Fueling the Data Economy</h2>
                    <p class="mt-4 text-lg text-text-secondary">The native token of the Lumen Protocol, designed for utility, governance, and long-term value accrual.</p>
                </div>
                <div class="mt-20 max-w-6xl mx-auto grid lg:grid-cols-5 gap-16 items-center">
                    <div class="lg:col-span-3 scroll-animate" style="transition-delay: 100ms;">
                        <h3 class="text-2xl font-bold mb-8">Token Allocation</h3>
                        <div class="space-y-8">
                            <div>
                                <div class="flex justify-between mb-2 text-base"><span class="font-medium text-text-main">Community & Ecosystem</span><span class="text-text-secondary">50%</span></div>
                                <div class="w-full bg-subtle/50 rounded-full h-3"><div class="bg-accent-purple h-3 rounded-full" style="width: 50%"></div></div>
                            </div>
                            <div>
                                <div class="flex justify-between mb-2 text-base"><span class="font-medium text-text-main">Core Team & Advisors</span><span class="text-text-secondary">20%</span></div>
                                <div class="w-full bg-subtle/50 rounded-full h-3"><div class="bg-accent-pink h-3 rounded-full" style="width: 20%"></div></div>
                            </div>
                            <div>
                                <div class="flex justify-between mb-2 text-base"><span class="font-medium text-text-main">Treasury & Foundation</span><span class="text-text-secondary">15%</span></div>
                                <div class="w-full bg-subtle/50 rounded-full h-3"><div class="bg-accent-cyan h-3 rounded-full" style="width: 15%"></div></div>
                            </div>
                            <div>
                                <div class="flex justify-between mb-2 text-base"><span class="font-medium text-text-main">Investors & Partners</span><span class="text-text-secondary">10%</span></div>
                                <div class="w-full bg-subtle/50 rounded-full h-3"><div class="bg-yellow-500 h-3 rounded-full" style="width: 10%"></div></div>
                            </div>
                            <div>
                                <div class="flex justify-between mb-2 text-base"><span class="font-medium text-text-main">Public Sale & Liquidity</span><span class="text-text-secondary">5%</span></div>
                                <div class="w-full bg-subtle/50 rounded-full h-3"><div class="bg-green-500 h-3 rounded-full" style="width: 5%"></div></div>
                            </div>
                        </div>
                    </div>
                    <div class="lg:col-span-2 space-y-8 scroll-animate" style="transition-delay: 200ms;">
                        <div class="p-[1px] bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan rounded-xl">
                            <div class="bg-surface rounded-[11px] p-8">
                                <h4 class="font-bold text-lg">Total Supply</h4>
                                <p class="text-3xl font-mono gradient-text mt-2">1,000,000,000 $LUM</p>
                                <p class="text-sm text-text-secondary mt-1">Fixed, non-inflationary supply.</p>
                            </div>
                        </div>
                         <div class="p-[1px] bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan rounded-xl h-full">
                            <div class="bg-surface rounded-[11px] p-8 h-full">
                                <h4 class="font-bold text-lg">Core Utility</h4>
                                <p class="text-base text-text-secondary mt-2">Used for contribution rewards, data access payments, and governance voting. <a href="/docs/tokenomics" class="text-accent-cyan hover:underline">Read more</a>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-20 md:py-32 bg-background">
            <div class="container mx-auto px-6 max-w-4xl scroll-animate">
                 <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
                </div>
                <div class="space-y-4">
                    <details class="faq-item group">
                        <summary class="flex items-center justify-between font-bold p-6 list-none cursor-pointer">
                            Is contributing my code safe?
                            <svg class="w-5 h-5 text-text-secondary transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </summary>
                        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                            <div class="overflow-hidden">
                                <p class="text-text-secondary px-6 pb-6">
                                    Yes. Security is our paramount concern. The entire anonymization process runs locally on your machine via our open-source CLI. Sensitive data like secrets, PII, and API keys are scrubbed *before* anything is ever uploaded. You can audit the code yourself for full transparency.
                                </p>
                            </div>
                        </div>
                    </details>
                    <details class="faq-item group">
                        <summary class="flex items-center justify-between font-bold p-6 list-none cursor-pointer">
                            What kind of code is most valuable?
                             <svg class="w-5 h-5 text-text-secondary transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </summary>
                        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                            <div class="overflow-hidden">
                                <p class="text-text-secondary px-6 pb-6">
                                   Value is determined by uniqueness, complexity, and market demand for the language. Novel algorithms, well-structured proprietary code, and projects in modern languages like Rust, Go, and TypeScript tend to earn higher rewards. The protocol values quality over sheer quantity.
                                </p>
                            </div>
                        </div>
                    </details>
                     <details class="faq-item group">
                        <summary class="flex items-center justify-between font-bold p-6 list-none cursor-pointer">
                            Do I lose ownership of my code?
                             <svg class="w-5 h-5 text-text-secondary transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </summary>
                        <div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                            <div class="overflow-hidden">
                                <p class="text-text-secondary px-6 pb-6">
                                   Absolutely not. You retain 100% ownership and all rights to your original work. By contributing, you grant a license for the *anonymized version* of your code to be used in Lumen's datasets. You are free to develop, license, or sell your original project as you see fit.
                                </p>
                            </div>
                        </div>
                    </details>
                </div>
                <div class="text-center mt-12">
                     <a href="/docs/faq" class="text-accent-cyan hover:underline">See all FAQs →</a>
                </div>
            </div>
        </section>
    </main>
    `;
}