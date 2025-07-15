export function renderLandingPage() {
    
    const initializeCarousel = () => {
        const carousel = document.getElementById('logo-carousel');
        if (carousel) {
            carousel.innerHTML += carousel.innerHTML;
            carousel.classList.add('animate-marquee-slow');
        }
    };

    const logos = ['javascript.png', 'vite.png', 'docker.png', 'solana.png', 'python.png', 'golang.png', 'nodejs.png', 'fastapi.png', 'postgresql.png', 'gemini.png', 'aws.png', 'gcp.png'];
    
    const logoItems = logos.map(logo => `
        <li class="flex-shrink-0">
            <img src="/technologies/${logo}" alt="${logo.split('.')[0]} logo" class="h-20 object-contain mx-8" />
        </li>
    `).join('');

    const techLogosSection = `
    <div class="py-16 bg-abyss-dark">
        <div class="container mx-auto px-8">
            <p class="text-center text-sm font-bold text-subtle uppercase tracking-widest">
                Built on a Foundation of World-Class Technology
            </p>
            <div class="mt-12 w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
                <ul id="logo-carousel" class="flex w-max">
                    ${logoItems}
                </ul>
            </div>
        </div>
    </div>
    `;

    const problemPromiseSection = `
    <section class="py-20 md:py-32 bg-abyss-dark">
        <div class="container mx-auto px-8">
            <div class="grid md:grid-cols-2 gap-16 items-center">
                <div class="scroll-animate animate-fade-in-left">
                    <h2 class="text-4xl font-bold"><span class="trapped-text">Your Code is Trapped.</span></h2>
                    <p class="mt-4 text-lg text-text-secondary">For too long, the most valuable data on the planet, your proprietary source code, has been locked away. Its potential untapped, its value unrecognized.</p>
                    <ul class="mt-8 space-y-4 text-text-secondary">
                        <li class="flex items-start gap-3"><svg class="w-6 h-6 text-red-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span><strong class="text-text-main">Locked in private repos,</strong> creating zero value for you.</span></li>
                        <li class="flex items-start gap-3"><svg class="w-6 h-6 text-red-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span><strong class="text-text-main">At risk of being scraped</strong> without credit or compensation.</span></li>
                        <li class="flex items-start gap-3"><svg class="w-6 h-6 text-red-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span><strong class="text-text-main">Fundamentally undervalued</strong> by the entire AI market.</span></li>
                    </ul>
                </div>
                <div class="scroll-animate animate-fade-in-right">
                    <h2 class="text-4xl font-bold gradient-text">Lumen Sets It <span class="animate-pulse-glow">Free.</span></h2>
                    <p class="mt-4 text-lg text-text-secondary">We've built the system to fix this. Lumen provides the tools and the network to transform your code into a secure, high-value, and reward-generating asset.</p>
                     <ul class="mt-8 space-y-4 text-text-secondary">
                        <li class="flex items-start gap-3"><svg class="w-6 h-6 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span><strong class="text-text-main">Anonymized on your machine,</strong> never leaving in its raw form.</span></li>
                        <li class="flex items-start gap-3"><svg class="w-6 h-6 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span><strong class="text-text-main">Valued by a transparent engine,</strong> ensuring fair rewards.</span></li>
                        <li class="flex items-start gap-3"><svg class="w-6 h-6 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span><strong class="text-text-main">Rewarded on an open network,</strong> giving you full ownership.</span></li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
    `;

    const howItWorksSection = `
    <section class="relative bg-abyss-dark bg-grid-pattern bg-grid-size animate-grid-pan overflow-hidden py-20 md:py-32" style="z-index: 5;">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#08080A)]"></div>
        <div class="container mx-auto px-6 max-w-7xl relative z-10">
            <div class="text-center max-w-3xl mx-auto scroll-animate animate-fade-in-up">
                <h2 class="text-3xl md:text-4xl font-bold md:whitespace-nowrap">Effortless Contribution. Tangible Rewards.</h2>
                <p class="mt-4 text-text-secondary">We designed the process to be as simple as possible. Three steps. That's it.</p>
            </div>
            <div class="mt-16 grid md:grid-cols-3 gap-8">
                <div class="glow-card-hover border border-subtle/50 p-8 rounded-xl bg-surface/80 flex flex-col items-center text-center scroll-animate animate-fade-in-up" style="transition-delay: 100ms;">
                    <div class="mx-auto w-16 h-16 p-[1px] rounded-lg bg-hero-gradient"><div class="w-full h-full bg-primary rounded-[7px] flex items-center justify-center"><p class="text-2xl font-bold">1</p></div></div>
                    <h3 class="text-xl font-bold mt-6">Install & Login</h3>
                    <p class="text-text-secondary mt-2 flex-grow">One command to install the CLI. A secure, browser-based login to link your account.</p>
                </div>
                <div class="glow-card-hover border border-subtle/50 p-8 rounded-xl bg-surface/80 flex flex-col items-center text-center scroll-animate animate-fade-in-up" style="transition-delay: 200ms;">
                    <div class="mx-auto w-16 h-16 p-[1px] rounded-lg bg-hero-gradient"><div class="w-full h-full bg-primary rounded-[7px] flex items-center justify-center"><p class="text-2xl font-bold">2</p></div></div>
                    <h3 class="text-xl font-bold mt-6">Contribute Your Code</h3>
                    <p class="text-text-secondary mt-2 flex-grow">Run one command from your project's root. Our CLI anonymizes and submits your work locally.</p>
                </div>
                <div class="glow-card-hover border border-subtle/50 p-8 rounded-xl bg-surface/80 flex flex-col items-center text-center scroll-animate animate-fade-in-up" style="transition-delay: 300ms;">
                    <div class="mx-auto w-16 h-16 p-[1px] rounded-lg bg-hero-gradient"><div class="w-full h-full bg-primary rounded-[7px] flex items-center justify-center"><p class="text-2xl font-bold">3</p></div></div>
                    <h3 class="text-xl font-bold mt-6">Get Rewarded</h3>
                    <p class="text-text-secondary mt-2 flex-grow">Track your contribution's value and your total earnings in real-time on your dashboard.</p>
                </div>
            </div>
        </div>
    </section>
    `;
    
    const geminiSection = `
    <section class="bg-abyss-dark pt-0 pb-20 md:pb-32">
        <div class="container mx-auto px-6">
            <div class="max-w-5xl mx-auto scroll-animate animate-zoom-in">
                <div class="glow-card-hover bg-surface rounded-2xl p-8 md:p-12 grid md:grid-cols-2 gap-8 md:gap-12 items-center border border-primary">
                    <div class="text-center md:text-left">
                        <h3 class="text-3xl font-bold">State-of-the-Art Valuation</h3>
                        <p class="text-text-secondary mt-4">Our valuation engine leverages Google's Gemini models for fair and accurate rewards based on code quality, complexity, and architectural design.</p>
                        <a href="/docs/valuation" class="inline-block mt-6 font-semibold text-accent-cyan hover:underline">Learn about our Valuation Engine →</a>
                    </div>
                    <div class="flex justify-center items-center bg-abyss-dark rounded-xl overflow-hidden h-40">
                        <img src="/gemini.png" alt="Google Gemini Logo" class="w-full h-auto object-contain transform scale-125" />
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;

    const featureShowcaseSection = `
    <section class="bg-transparent py-20 md:py-32 z-10 relative overflow-x-hidden space-y-24 md:space-y-32">
        <div class="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
            <div class="md:col-span-3 scroll-animate animate-fade-in-left">
                <img src="/dashboard.png" alt="Lumen Dashboard" class="w-full md:rounded-r-2xl shadow-2xl shadow-black/30 border-y-2 border-r-2 border-primary" />
            </div>
            <div class="md:col-span-2 scroll-animate animate-fade-in-right px-8" style="transition-delay: 150ms;">
                <h2 class="text-3xl font-bold">Your Mission Control</h2>
                <p class="mt-4 text-text-secondary text-lg">The dashboard provides a complete overview of your journey with Lumen. Track your lifetime earnings, global rank, and total contributions at a glance.</p>
            </div>
        </div>
        <div class="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
            <div class="md:col-span-3 md:order-2 scroll-animate animate-fade-in-right">
                <img src="/dashboard2.png" alt="Contribution Detail Modal" class="w-full md:rounded-l-2xl shadow-2xl shadow-black/30 border-y-2 border-l-2 border-primary" />
            </div>
            <div class="md:col-span-2 md:order-1 scroll-animate animate-fade-in-left px-8" style="transition-delay: 150ms;">
                <h2 class="text-3xl font-bold">Transparent Valuation</h2>
                <p class="mt-4 text-text-secondary text-lg">We believe in radical transparency. Drill down into any contribution to see exactly how its value was calculated by our hybrid AI and metric-based engine.</p>
            </div>
        </div>
    </section>
    `;

    const genesisCTASection = `
    <section class="pt-20 pb-20 bg-abyss-dark scroll-animate animate-reveal-in" style="transition-delay: 300ms;">
        <div class="container mx-auto px-6 max-w-4xl text-center">
            <h2 class="text-3xl md:text-4xl font-bold">Become a <span class="gradient-text">Genesis Contributor</span></h2>
            <p class="mt-4 max-w-2xl mx-auto text-lg leading-relaxed text-text-secondary">The Lumen beta is live. Be one of the first 500 to contribute successfully and get an exclusive reward.</p>
            <p class="mt-6 text-5xl font-bold text-white">1,000 <span class="gradient-text">$LUM</span> Bonus</p>
            <p class="text-sm text-text-secondary mt-1">Awarded on top of your standard contribution reward.</p>
            <div class="mt-8">
                <a href="/signup" class="animate-claim-spot-button px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg">
                    Claim Your Spot
                </a>
            </div>
        </div>
    </section>
    `;

    const faqSection = `
    <section class="py-20 md:pt-16 md:pb-32 bg-abyss-dark">
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
    `;

    requestAnimationFrame(initializeCarousel);

    return `
    <main id="content-root" class="flex-grow">
        <style>
            @keyframes pulse-glow {
                0%, 100% { text-shadow: 0 0 10px rgba(255, 105, 180, 0.5), 0 0 20px rgba(138, 43, 226, 0.3); }
                50% { text-shadow: 0 0 20px rgba(255, 105, 180, 0.8), 0 0 40px rgba(138, 43, 226, 0.5); }
            }
            .animate-pulse-glow { animation: pulse-glow 2.5s ease-in-out infinite; }
            @keyframes reveal-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            .animate-reveal-in.scrolled-in { animation: reveal-in 0.8s ease-out forwards; }
        </style>
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
                    The code in your private repos is the most valuable dataset on the planet. Stop letting it sit there. Start earning what it's worth.
                </p>
                <div class="mt-10 flex justify-center items-center gap-4 scroll-animate animate-fade-in-up" style="transition-delay: 500ms;">
                    <a href="/signup" class="px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110">Start Earning Now</a>
                    <a href="/docs/introduction" class="px-8 py-3 font-bold bg-primary text-text-main rounded-lg transition-all duration-300 hover:bg-subtle/80 hover:-translate-y-1">Read the Docs</a>
                </div>
            </div>
        </section>

        ${techLogosSection}
        ${problemPromiseSection}
        ${howItWorksSection}
        ${geminiSection}
        ${featureShowcaseSection}
        ${genesisCTASection}
        ${faqSection}

    </main>
    `;
}