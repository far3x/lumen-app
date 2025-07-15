export function renderLandingPage() {
    const featureShowcaseSection = `
    <section class="bg-abyss-dark py-20 md:py-32 z-10 relative overflow-x-hidden space-y-24 md:space-y-32">

        <div class="grid md:grid-cols-3 gap-8 md:gap-12 items-center">
            <div class="md:col-span-2 scroll-animate animate-fade-in-left">
                <img src="/dashboard.png" alt="Lumen Dashboard" class="w-full md:rounded-r-2xl shadow-2xl shadow-black/30 border-y border-r border-primary" />
            </div>
            <div class="md:col-span-1 scroll-animate animate-fade-in-right px-6 md:pl-8 md:pr-6 lg:pr-12" style="transition-delay: 150ms;">
                <h2 class="text-3xl font-bold">Your Mission Control</h2>
                <p class="mt-4 text-text-secondary text-lg">The dashboard provides a complete overview of your journey with Lumen. Track your lifetime earnings, global rank, and total contributions at a glance.</p>
                <ul class="mt-6 space-y-3 text-text-secondary">
                    <li class="flex items-center gap-3"><svg class="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg><span>Real-time balance and reward tracking.</span></li>
                    <li class="flex items-center gap-3"><svg class="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg><span>Historical earnings chart with date filtering.</span></li>
                    <li class="flex items-center gap-3"><svg class="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg><span>One-click reward claims to your wallet.</span></li>
                </ul>
            </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8 md:gap-12 items-center">
            <div class="md:col-span-2 md:order-2 scroll-animate animate-fade-in-right">
                <img src="/dashboard2.png" alt="Contribution Detail Modal" class="w-full md:rounded-l-2xl shadow-2xl shadow-black/30 border-y border-l border-primary" />
            </div>
            <div class="md:col-span-1 md:order-1 scroll-animate animate-fade-in-left px-6 md:pr-8 md:pl-6 lg:pl-12" style="transition-delay: 150ms;">
                <h2 class="text-3xl font-bold">Transparent Valuation</h2>
                <p class="mt-4 text-text-secondary text-lg">We believe in radical transparency. Drill down into any contribution to see exactly how its value was calculated by our hybrid AI and metric-based engine.</p>
                <ul class="mt-6 space-y-3 text-text-secondary">
                    <li class="flex items-center gap-3"><svg class="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg><span>Detailed AI analysis summary for your code.</span></li>
                    <li class="flex items-center gap-3"><svg class="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg><span>Breakdown of quality and architecture scores.</span></li>
                    <li class="flex items-center gap-3"><svg class="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg><span>Key metrics like token count and complexity.</span></li>
                </ul>
            </div>
        </div>

    </section>
    `;

    function setupGenericScrollAnimations() {
        const animatedElements = document.querySelectorAll('.scroll-animate');
        if (animatedElements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scrolled-in');
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    }

    requestAnimationFrame(() => {
        setupGenericScrollAnimations();
    });

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

        <section class="relative flex flex-col justify-center min-h-screen text-center overflow-hidden isolate gradient-border-bottom" style="z-index: 10;">
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
                <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter scroll-animate animate-fade-in-up" style="transition-delay: 100ms;">
                    Monetize Your Code.
                    <br>
                    <span class="pulse-text block">Power the Future of AI.</span>
                </h1>
                
                <p class="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-text-secondary scroll-animate animate-fade-in-up" style="transition-delay: 300ms;">
                    Your code is the most valuable dataset on the planet. Anonymously contribute to the future of AI and get rewarded for its true worth.
                </p>
                
                <div class="mt-10 flex justify-center items-center gap-4 scroll-animate animate-fade-in-up" style="transition-delay: 500ms;">
                    <a href="/signup" class="px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110">Start Earning Now</a>
                    <a href="/docs/introduction" class="px-8 py-3 font-bold bg-primary text-text-main rounded-lg transition-all duration-300 hover:bg-subtle/80 hover:-translate-y-1">Read the Docs</a>
                </div>
            </div>
        </section>

        ${featureShowcaseSection}

        <section class="relative bg-abyss-dark bg-grid-pattern bg-grid-size animate-grid-pan overflow-hidden py-20 md:py-32" style="z-index: 5;">
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#08080A)]"></div>
            <div class="container mx-auto px-6 max-w-7xl relative z-10">
                
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="glow-card-hover border border-subtle/50 p-8 rounded-xl bg-surface/80 flex flex-col scroll-animate animate-fade-in-up" style="transition-delay: 100ms;">
                        <div class="mx-auto w-16 h-16 p-[1px] rounded-lg bg-hero-gradient"><div class="w-full h-full bg-primary rounded-[7px] flex items-center justify-center"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div></div>
                        <h3 class="text-xl font-bold mt-6 text-center">Install & Authenticate</h3>
                        <p class="text-text-secondary mt-2 flex-grow text-center">Install the <code>pylumen</code> CLI and link it to your account with a single command.</p>
                        <div class="mt-4"><pre class="text-left bg-primary p-3 rounded-md text-sm text-accent-cyan overflow-x-auto w-full"><code>pip install pylumen\nlum login</code></pre></div>
                    </div>
                    
                    <div class="glow-card-hover border border-subtle/50 p-8 rounded-xl bg-surface/80 flex flex-col scroll-animate animate-fade-in-up" style="transition-delay: 200ms;">
                        <div class="mx-auto w-16 h-16 p-[1px] rounded-lg bg-hero-gradient"><div class="w-full h-full bg-primary rounded-[7px] flex items-center justify-center"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg></div></div>
                        <h3 class="text-xl font-bold mt-6 text-center">Contribute Your Project</h3>
                        <p class="text-text-secondary mt-2 flex-grow text-center">Run <code>lum contribute</code> in your project's root. The CLI analyzes, anonymizes, and packages your code locally.</p>
                        <div class="mt-4"><pre class="text-left bg-primary p-3 rounded-md text-sm text-accent-cyan overflow-x-auto w-full"><code>cd /path/to/my-project\nlum contribute</code></pre></div>
                    </div>
                    
                    <div class="glow-card-hover border border-subtle/50 p-8 rounded-xl bg-surface/80 flex flex-col scroll-animate animate-fade-in-up" style="transition-delay: 300ms;">
                        <div class="mx-auto w-16 h-16 p-[1px] rounded-lg bg-hero-gradient"><div class="w-full h-full bg-primary rounded-[7px] flex items-center justify-center"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg></div></div>
                        <h3 class="text-xl font-bold mt-6 text-center">Get Rewarded</h3>
                        <p class="text-text-secondary mt-2 flex-grow text-center">The protocol values your contribution and adds it to the processing queue. Track your rewards on your dashboard.</p>
                        <div class="mt-4"><div class="text-left bg-primary p-4 rounded-md text-sm w-full"><p class="text-green-400">✔ Contribution successful!</p><p class="text-text-secondary">+ Your submission is now in the processing queue.</p></div></div>
                    </div>
                </div>

                <div class="pt-20 md:pt-32">
                    <div class="max-w-5xl mx-auto scroll-animate animate-zoom-in">
                        <div class="glow-card-hover bg-surface rounded-2xl p-8 md:p-12 grid md:grid-cols-2 gap-8 md:gap-12 items-center border border-primary">
                            <div class="text-center md:text-left">
                                <h3 class="text-3xl font-bold">State-of-the-Art Valuation</h3>
                                <p class="text-text-secondary mt-4">Our valuation engine leverages Google's Gemini models for fair and accurate rewards based on code quality, complexity, and architectural design.</p>
                                <a href="/docs/valuation" class="inline-block mt-6 font-semibold text-accent-cyan hover:underline">Learn about our Valuation Engine →</a>
                            </div>
                            <div class="flex justify-center items-center bg-abyss-dark rounded-xl overflow-hidden h-40">
                                <img src="/gemini.png" alt="Google Gemini Logo" class="w-auto h-auto object-contain transform scale-125" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <section class="py-20 md:py-32 bg-background">
            <div class="container mx-auto px-6 max-w-7xl grid md:grid-cols-2 gap-16 items-center">
                <div class="scroll-animate animate-fade-in-left">
                    <h2 class="text-3xl md:text-4xl font-bold">The AI Data Crisis is Here. <br><span class="gradient-text">Lumen is the Solution.</span></h2>
                    <p class="mt-6 text-text-secondary text-lg">
                        Large Language Models are hitting a wall. The public internet has been scraped, and <strong class="text-text-main">high-quality, human-written code is locked away</strong> in private repositories. This data scarcity threatens the future of AI innovation.
                    </p>
                    <p class="mt-4 text-text-secondary text-lg">
                        Lumen creates a <strong class="text-text-main">transparent and fair data sourcing protocol</strong>. We empower developers to become the primary data source for the next wave of AI, ensuring they are compensated for the value they create. <a href="/docs/why-lumen" class="text-accent-cyan hover:underline font-semibold">Learn why Lumen is different →</a>
                    </p>
                </div>
                <div class="space-y-8 scroll-animate animate-fade-in-right">
                    <div class="flex items-start space-x-4"><div class="p-[1px] rounded-lg bg-hero-gradient"><div class="p-3 bg-primary rounded-[7px]"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div></div><div><h4 class="font-bold">Developer Contribution</h4><p class="text-text-secondary text-sm">Developers submit anonymized code via the secure Lumen CLI.</p></div></div>
                    <div class="flex items-start space-x-4"><div class="p-[1px] rounded-lg bg-hero-gradient"><div class="p-3 bg-primary rounded-[7px]"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M12 20V10M18 20V4M6 20V16"></path></svg></div></div><div><h4 class="font-bold">Protocol Valuation & Processing</h4><p class="text-text-secondary text-sm">The protocol analyzes, values, and adds the data to specialized training sets, rewarding the developer with $LUM.</p></div></div>
                    <div class="flex items-start space-x-4"><div class="p-[1px] rounded-lg bg-hero-gradient"><div class="p-3 bg-primary rounded-[7px]"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="url(#icon-gradient)" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8H4V6zm-2 8h20v2H2v-2z"></path></svg></div></div><div><h4 class="font-bold">AI Company Access</h4><p class="text-text-secondary text-sm">AI companies purchase access to these high-quality, ethically-sourced datasets using $LUM tokens.</p></div></div>
                </div>
            </div>
        </section>

        <section class="pt-20 pb-32 bg-background">
            <div class="container mx-auto px-6 max-w-4xl text-center scroll-animate animate-fade-in-up">
                <h2 class="text-3xl md:text-4xl font-bold">Become a <span class="gradient-text">Genesis Contributor</span></h2>
                <p class="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">The Lumen network is in its genesis phase. Be one of the first 500 developers to make a successful contribution and you'll receive an exclusive, one-time reward.</p>
                <p class="mt-6 text-5xl font-bold text-white">1,000 <span class="gradient-text">$LUM</span> Bonus</p>
                <p class="text-sm text-text-secondary mt-1">Awarded on top of your standard contribution reward.</p>
                <div class="mt-8">
                    <a href="/signup" class="px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110">
                        Claim Your Spot
                    </a>
                </div>
            </div>
        </section>

        <section class="py-20 md:py-32 bg-abyss-dark bg-starfield-pattern bg-starfield-size">
            <div class="container mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto scroll-animate animate-fade-in-up">
                    <h2 class="text-4xl md:text-5xl font-bold"><span class="gradient-text">$LUM</span>: The Token Fueling the Data Economy</h2>
                    <p class="mt-4 text-lg text-text-secondary">The native token of the Lumen Protocol, designed for utility, governance, and long-term value accrual.</p>
                </div>
                <div class="mt-20 max-w-6xl mx-auto grid lg:grid-cols-5 gap-16 items-center">
                    <div class="lg:col-span-3 scroll-animate animate-fade-in-left" style="transition-delay: 100ms;">
                        <h3 class="text-2xl font-bold mb-8">Token Allocation</h3>
                        <div class="space-y-8">
                            <div><div class="flex justify-between mb-2 text-base"><span class="font-medium text-text-main">Community & Ecosystem</span><span class="text-text-secondary">50%</span></div><div class="w-full bg-subtle/50 rounded-full h-3"><div class="bg-accent-purple h-3 rounded-full" style="width: 50%"></div></div></div>
                            <div><div class="flex justify-between mb-2 text-base"><span class="font-medium text-text-main">Core Team & Advisors</span><span class="text-text-secondary">20%</span></div><div class="w-full bg-subtle/50 rounded-full h-3"><div class="bg-accent-pink h-3 rounded-full" style="width: 20%"></div></div></div>
                            <div><div class="flex justify-between mb-2 text-base"><span class="font-medium text-text-main">Treasury & Foundation</span><span class="text-text-secondary">15%</span></div><div class="w-full bg-subtle/50 rounded-full h-3"><div class="bg-accent-cyan h-3 rounded-full" style="width: 15%"></div></div></div>
                            <div><div class="flex justify-between mb-2 text-base"><span class="font-medium text-text-main">Investors & Partners</span><span class="text-text-secondary">10%</span></div><div class="w-full bg-subtle/50 rounded-full h-3"><div class="bg-yellow-500 h-3 rounded-full" style="width: 10%"></div></div></div>
                            <div><div class="flex justify-between mb-2 text-base"><span class="font-medium text-text-main">Public Sale & Liquidity</span><span class="text-text-secondary">5%</span></div><div class="w-full bg-subtle/50 rounded-full h-3"><div class="bg-green-500 h-3 rounded-full" style="width: 5%"></div></div></div>
                        </div>
                    </div>
                    <div class="lg:col-span-2 space-y-8 scroll-animate animate-fade-in-right" style="transition-delay: 200ms;">
                        <div class="p-[1px] bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan rounded-xl"><div class="bg-surface rounded-[11px] p-8"><h4 class="font-bold text-lg">Total Supply</h4><p class="text-3xl font-mono gradient-text mt-2">1,000,000,000 $LUM</p><p class="text-sm text-text-secondary mt-1">Fixed, non-inflationary supply.</p></div></div>
                         <div class="p-[1px] bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan rounded-xl h-full"><div class="bg-surface rounded-[11px] p-8 h-full"><h4 class="font-bold text-lg">Core Utility</h4><p class="text-base text-text-secondary mt-2">Used for contribution rewards, data access payments, and governance voting. <a href="/docs/tokenomics" class="text-accent-cyan hover:underline">Read more</a>.</p></div></div>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-20 md:py-32 bg-abyss-dark">
            <div class="container mx-auto px-6 max-w-4xl scroll-animate animate-fade-in-up">
                <div class="text-center mb-16"><h2 class="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2></div>
                <div class="space-y-4">
                    <details class="faq-item group scroll-animate animate-fade-in-up" style="transition-delay: 100ms;"><summary class="flex items-center justify-between font-bold p-6 list-none cursor-pointer">Is contributing my code safe?<svg class="w-5 h-5 text-text-secondary transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></summary><div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out"><div class="overflow-hidden"><p class="text-text-secondary px-6 pb-6">Yes. Security is our paramount concern. The entire anonymization process runs locally on your machine via our open-source CLI. Sensitive data like secrets, PII, and API keys are scrubbed anything is ever uploaded. You can audit the code yourself for full transparency.</p></div></div></details>
                    <details class="faq-item group scroll-animate animate-fade-in-up" style="transition-delay: 200ms;"><summary class="flex items-center justify-between font-bold p-6 list-none cursor-pointer">What kind of code is most valuable?<svg class="w-5 h-5 text-text-secondary transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></summary><div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out"><div class="overflow-hidden"><p class="text-text-secondary px-6 pb-6">Value is determined by uniqueness, complexity, and market demand for the language. Novel algorithms, well-structured proprietary code, and projects in modern languages like Rust, Go, and TypeScript tend to earn higher rewards. The protocol values quality over sheer quantity.</p></div></div></details>
                     <details class="faq-item group scroll-animate animate-fade-in-up" style="transition-delay: 300ms;"><summary class="flex items-center justify-between font-bold p-6 list-none cursor-pointer">Do I lose ownership of my code?<svg class="w-5 h-5 text-text-secondary transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></summary><div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out"><div class="overflow-hidden"><p class="text-text-secondary px-6 pb-6">Absolutely not. You retain 100% ownership and all rights to your original work. By contributing, you grant a license for the *anonymized version* of your code to be used in Lumen's datasets. You are free to develop, license, or sell your original project as you see fit.</p></div></div></details>
                </div>
                <div class="text-center mt-12"><a href="/docs/faq" class="text-accent-cyan hover:underline">See all FAQs →</a></div>
            </div>
        </section>
    </main>
    `;
}