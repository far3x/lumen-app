export function renderLandingPage() {
    
    const initializeCarousel = () => {
        const carousel = document.getElementById('logo-carousel');        
        if (carousel) {
            carousel.innerHTML += carousel.innerHTML;
            carousel.classList.add('animate-marquee-slow');
        }
    };

    const logos = ['doppler.png', 'hugging-face.png', 'fastapi.png', 'pytorch.png', 'javascript.png', 'redis.png', 'docker.png', 'vite.png', 'solana.png', 'python.png', 'golang.png', 'nginx.png', 'postgresql.png', 'gemini.png', 'aws.png', 'gcp.png'];
    
    const logoItems = logos.map(logo => `
        <li class="flex-shrink-0">
            <img src="/technologies/${logo}" alt="${logo.split('.')[0]} logo" class="h-20 object-contain mx-8" />
        </li>
    `).join('');

    const techLogosSection = `
    <div class="py-20 md:py-24 bg-abyss-dark">
        <div class="container mx-auto px-8">
            <h2 class="text-center text-2xl md:text-3xl font-bold text-text-main tracking-tight">
                Built on a Foundation of World-Class Technology
            </h2>
            <div class="mt-16 w-full overflow-hidden [mask-image:_linear_gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
                <ul id="logo-carousel" class="flex w-max">
                    ${logoItems}
                </ul>
            </div>
        </div>
    </div>
    `;

    const problemPromiseSection = `
    <section class="py-20 md:py-32 bg-abyss-dark">
        <div class="container mx-auto px-8 text-center max-w-4xl">
            <div class="scroll-animate animate-zoom-in">
                <h2 class="text-4xl md:text-5xl font-bold text-text-main">Your Code is a <span class="trapped-text">Trapped Asset</span></h2>
                <p class="mt-6 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
                    Billions of lines of high-signal, human-written code are locked away in private repositories. This is a vast, untapped reservoir of value. Until now.
                </p>
                <div class="mt-12 grid sm:grid-cols-3 gap-8 text-left">
                    <div class="scroll-animate animate-fade-in-up flex items-start gap-4" style="animation-delay: 100ms;">
                        <svg class="w-8 h-8 text-subtle shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                        <div>
                            <h3 class="font-bold text-xl text-text-main">Sitting Idle</h3>
                            <p class="text-base text-text-secondary">Generating zero value for you or the ecosystem.</p>
                        </div>
                    </div>
                    <div class="scroll-animate animate-fade-in-up flex items-start gap-4" style="animation-delay: 200ms;">
                        <svg class="w-8 h-8 text-subtle shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                        <div>
                            <h3 class="font-bold text-xl text-text-main">At Risk</h3>
                            <p class="text-base text-text-secondary">Exposed to being scraped without credit or compensation.</p>
                        </div>
                    </div>
                    <div class="scroll-animate animate-fade-in-up flex items-start gap-4" style="animation-delay: 300ms;">
                        <svg class="w-8 h-8 text-subtle shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                        <div>
                            <h3 class="font-bold text-xl text-text-main">Undervalued</h3>
                            <p class="text-base text-text-secondary">Fundamentally mispriced by the entire AI market.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="pb-20 md:pb-32 bg-abyss-dark">
        <div class="container mx-auto px-8 text-center max-w-4xl">
            <div class="scroll-animate animate-zoom-in">
                <h2 class="text-4xl md:text-5xl font-bold gradient-text">Lumen Sets It Free.</h2>
                <p class="mt-6 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
                    We provide the bridge between your private work and the new data economy, transforming your code into a secure, high-value, and reward-generating asset.
                </p>
                <div class="mt-12 grid sm:grid-cols-3 gap-8 text-left">
                    <div class="scroll-animate animate-fade-in-up flex items-start gap-4" style="animation-delay: 100ms;">
                        <svg class="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>
                        <div>
                            <h3 class="font-bold text-xl text-text-main">Anonymized Locally</h3>
                            <p class="text-base text-text-secondary">Your raw code and secrets never leave your machine.</p>
                        </div>
                    </div>
                    <div class="scroll-animate animate-fade-in-up flex items-start gap-4" style="animation-delay: 200ms;">
                        <svg class="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                        <div>
                            <h3 class="font-bold text-xl text-text-main">Valued Transparently</h3>
                            <p class="text-base text-text-secondary">Our engine ensures fair rewards based on quality.</p>
                        </div>
                    </div>
                    <div class="scroll-animate animate-fade-in-up flex items-start gap-4" style="animation-delay: 300ms;">
                        <svg class="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>
                        <div>
                            <h3 class="font-bold text-xl text-text-main">Rewarded On-Chain</h3>
                            <p class="text-base text-text-secondary">You own your rewards on a public, decentralized network.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;

    const howItWorksSteps = [
        { number: '01', title: 'Install & Login', text: 'One command to install the CLI. A secure, browser-based login to link your account.' },
        { number: '02', title: 'Contribute Your Code', text: "Run one command from your project's root. Our CLI anonymizes and submits your work locally." },
        { number: '03', title: 'Get Rewarded', text: "Track your contribution's value and your total earnings in real-time on your dashboard." }
    ];
    
    const howItWorksSection = `
    <section class="relative bg-abyss-dark bg-grid-pattern bg-grid-size animate-grid-pan overflow-hidden py-20 md:py-32" style="z-index: 5;">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#08080A)]"></div>
        <div class="container mx-auto px-6 max-w-7xl relative z-10">
            <div class="text-center max-w-3xl mx-auto scroll-animate animate-fade-in-up">
                <h2 class="text-3xl md:text-4xl font-bold md:whitespace-nowrap">Effortless Contribution. Tangible Rewards.</h2>
                <p class="mt-4 text-text-secondary">We designed the process to be as simple as possible. Three steps. That's it.</p>
            </div>
            <div class="mt-16 interactive-card relative bg-surface rounded-xl border border-primary overflow-hidden scroll-animate animate-fade-in-up" style="transition-delay: 200ms;">
                <div class="flex flex-col md:flex-row">
                    ${howItWorksSteps.map((step, index) => `
                        <div class="flex-1 p-8 relative ${index > 0 ? 'md:border-l md:border-primary' : ''}">
                            <span class="absolute top-4 right-6 text-6xl font-bold gradient-text opacity-10">${step.number}</span>
                            <div class="relative">
                                <h3 class="text-xl font-bold text-text-main">${step.title}</h3>
                                <p class="text-text-secondary mt-2">${step.text}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>
    `;
    
    const geminiSection = `
    <section class="bg-abyss-dark pt-0 pb-20 md:pb-32">
        <div class="container mx-auto px-6">
            <div class="max-w-5xl mx-auto scroll-animate animate-zoom-in">
                <div class="gemini-card-container relative group">
                    <div class="bg-surface rounded-2xl p-8 md:p-12 grid md:grid-cols-2 gap-8 md:gap-12 items-center border border-primary relative z-10 overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                        <div class="text-center md:text-left">
                            <span class="text-sm font-bold text-subtle uppercase tracking-wider">Powered By</span>
                            <h3 class="text-3xl font-bold gradient-text">State-of-the-Art Valuation</h3>
                            <p class="text-text-secondary mt-4">Our valuation engine leverages Google's Gemini models for fair and accurate rewards based on code quality, complexity, and architectural design.</p>
                            <a href="/docs/valuation" class="inline-block mt-6 font-semibold text-accent-cyan hover:underline">Learn about our Valuation Engine →</a>
                        </div>
                        <div class="relative flex justify-center items-center bg-abyss-dark rounded-xl overflow-hidden h-40">
                            <div class="gemini-logo-bg absolute inset-0 z-0"></div>
                            <img src="/gemini.png" alt="Google Gemini Logo" class="relative z-10 w-full h-auto object-contain transform scale-125" />
                        </div>
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
                <h2 class="text-2xl md:text-3xl font-bold">Your Mission Control</h2>
                <p class="mt-4 text-text-secondary text-base md:text-lg">The dashboard provides a complete overview of your journey with Lumen. Track your lifetime earnings, global rank, and total contributions at a glance.</p>
            </div>
        </div>
        <div class="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
            <div class="md:col-span-3 md:order-2 scroll-animate animate-fade-in-right">
                <img src="/dashboard2.png" alt="Contribution Detail Modal" class="w-full md:rounded-l-2xl shadow-2xl shadow-black/30 border-y-2 border-l-2 border-primary" />
            </div>
            <div class="md:col-span-2 md:order-1 scroll-animate animate-fade-in-left px-8" style="transition-delay: 150ms;">
                <h2 class="text-2xl md:text-3xl font-bold">Transparent Valuation</h2>
                <p class="mt-4 text-text-secondary text-base md:text-lg">We believe in radical transparency. Drill down into any contribution to see exactly how its value was calculated by our hybrid AI and metric-based engine.</p>
            </div>
        </div>
    </section>
    `;

    const genesisCTASection = `
    <section class="pt-20 pb-20 bg-abyss-dark scroll-animate animate-reveal-in" style="transition-delay: 300ms;">
        <div class="container mx-auto px-6 max-w-4xl text-center">
            <h2 class="text-3xl md:text-4xl font-bold">Become a <span class="gradient-text">Genesis Contributor</span></h2>
            <p class="mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-text-secondary">Contribute during our Genesis Phase to earn your stake in the network and receive a permanent reward multiplier.</p>
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
                <details class="faq-item group scroll-animate animate-fade-in-up" style="transition-delay: 200ms;"><summary class="flex items-center justify-between font-bold p-6 list-none cursor-pointer">What kind of code is most valuable?<svg class="w-5 h-5 text-text-secondary transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></summary><div class="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out"><div class="overflow-hidden"><p class="text-text-secondary px-6 pb-6">Value is determined by <strong>uniqueness, quality, and complexity</strong>, not a specific programming language. The protocol is designed to reward thoughtful engineering. A unique project with novel logic and a well-designed architecture will always be valued more highly than a simple script from a public tutorial. The protocol values quality over sheer quantity.</p></div></div></details>
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
                <h1 class="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter scroll-animate animate-fade-in-up" style="transition-delay: 100ms;">
                    Monetize Your Code.
                    <br>
                    <span class="pulse-text block">Power the Future of AI.</span>
                </h1>
                <p class="max-w-3xl mx-auto mt-6 text-base sm:text-lg md:text-xl text-text-secondary scroll-animate animate-fade-in-up" style="transition-delay: 300ms;">
                    The code on your local machine is one of the most valuable datasets on the planet. Stop letting it sit there. Start earning what it's worth.
                </p>
                <div class="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 scroll-animate animate-fade-in-up" style="transition-delay: 500ms;">
                    <a href="/signup" class="w-full sm:w-auto px-6 sm:px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/30 hover:brightness-110">Start Earning Now</a>
                    <a href="/docs/introduction" class="w-full sm:w-auto px-6 sm:px-8 py-3 font-bold bg-primary text-text-main rounded-lg transition-all duration-300 hover:bg-subtle/80 hover:-translate-y-1">Read the Docs</a>
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