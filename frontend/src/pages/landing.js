import { isAuthenticated } from '../lib/auth.js';

export function renderLandingPage() {

    const startEarningUrl = isAuthenticated() ? '/dashboard' : '/auth/github';

    return `
    <main id="content-root" class="flex-grow bg-background text-text-main pt-28">

        <section class="flex items-center justify-center min-h-[calc(100vh-7rem)] px-4 md:px-8">
            <div class="w-full max-w-[90%] mx-auto" style="min-height: 700px;">
                <div class="bg-surface border-2 border-primary rounded-lg overflow-hidden scroll-animate h-full grid lg:grid-cols-2 items-center" style="transform: translateY(4rem); min-height: 700px;">
                    <div class="p-8 md:p-16 text-center lg:text-left h-full flex flex-col justify-center relative">
                        <img src="/img/landing/logo-big.png?v=1" alt="" class="absolute top-0 left-0 w-full h-full object-cover object-left opacity-10 pointer-events-none" />
                        <div class="relative z-10">
                            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                                <span class="text-accent-primary">&gt; The AI Quality Engine</span> 
                                <br>
                                for Next-Gen Dev Tools.
                            </h1>
                            <p class="mt-6 text-lg text-text-secondary max-w-2xl mx-auto lg:mx-0">
                                We've built an AI that understands great software. Contribute your best work, get rewarded for its quality, and help create the intelligent developer tools you'll use tomorrow.
                            </p>
                            <div class="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <a href="${startEarningUrl}" class="w-full sm:w-auto px-8 py-3 font-bold bg-accent-primary text-white hover:bg-red-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-out">Start Earning Now</a>
                                <a href="/docs/introduction" class="w-full sm:w-auto px-8 py-3 font-bold bg-primary text-text-main hover:bg-subtle/80 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-out">Read docs</a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="p-8 lg:p-12 h-full flex items-center justify-center">
                         <div class="w-full bg-surface border-2 border-primary rounded-lg shadow-2xl overflow-hidden p-2">
                            <video src="/img/landing/motion.mp4" autoplay loop muted playsinline class="w-full h-auto rounded-md"></video>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-12 mt-12">
            <div class="container mx-auto px-6 text-left">
                <div class="scroll-animate" style="transform: translateY(4rem);">
                    <h2 class="text-3xl font-bold mb-4">> <span class="text-accent-primary">The Gold Rush for Signal</span></h2>
                    <p class="text-text-secondary mb-12 max-w-none">
                        AI models are starving for high-quality data. Your code isn't just a file; it's a blueprint of human logic: the most valuable training asset on the planet.
                    </p>
                </div>
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="group shadow-lg overflow-hidden border-2 border-primary relative h-80 rounded-lg transition-all duration-300 ease-in-out hover:shadow-xl scroll-animate" style="transform: translateY(4rem); animation-delay: 200ms;">
                        <div class="absolute inset-0"><img src="/img/landing/1.png" alt="Card 1" class="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">~ Untapped Value</h3>
                            <p>Your work is an asset. We give it a<br/>market price.</p>
                        </div>
                    </div>
                    <div class="group shadow-lg overflow-hidden border-2 border-primary relative h-80 rounded-lg transition-all duration-300 ease-in-out hover:shadow-xl scroll-animate" style="transform: translateY(4rem); animation-delay: 400ms;">
                        <div class="absolute inset-0"><img src="/img/landing/2.png" alt="Card 2" class="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">~ Legally Toxic</h3>
                            <p>Scraping is a dead end. Ethical<br/>sourcing is the future.</p>
                        </div>
                    </div>
                    <div class="group shadow-lg overflow-hidden border-2 border-primary relative h-80 rounded-lg transition-all duration-300 ease-in-out hover:shadow-xl scroll-animate" style="transform: translateY(4rem); animation-delay: 600ms;">
                        <div class="absolute inset-0"><img src="/img/landing/5.png?v=1" alt="Card 5" class="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">~ Polluted Signal</h3>
                            <p>AI can't learn from its own noise.<br/>It needs new logic.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-12">
            <div class="container mx-auto px-6 text-left">
                <div class="scroll-animate" style="transform: translateY(4rem);">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-3xl font-bold">> <span class="text-accent-primary">Lumen's Quality Engine</span></h2>
                        <div class="hidden md:flex" style="gap: 300px;">
                            <span class="block w-2 h-2 bg-accent-primary"></span>
                            <span class="block w-2 h-2 bg-accent-primary"></span>
                            <span class="block w-2 h-2 bg-accent-primary"></span>
                        </div>
                    </div>
                    <p class="text-text-secondary mb-12 max-w-none">
                        We've built the infrastructure to identify and reward high-quality engineering. It's not about how much code you write, but how well you write it.
                    </p>
                </div>
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="group shadow-lg overflow-hidden border-2 border-primary relative h-80 rounded-lg transition-all duration-300 ease-in-out hover:shadow-xl scroll-animate" style="transform: translateY(4rem); animation-delay: 200ms;">
                        <div class="absolute inset-0"><img src="/img/landing/4.png?v=1" alt="Card 4" class="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">~ Your IP is Yours</h3>
                            <p>Our open-source CLI anonymizes code<br/>on your machine. Your raw code<br/>never leaves your device.</p>
                        </div>
                    </div>
                    <div class="group shadow-lg overflow-hidden border-2 border-primary relative h-80 rounded-lg transition-all duration-300 ease-in-out hover:shadow-xl scroll-animate" style="transform: translateY(4rem); animation-delay: 400ms;">
                        <div class="absolute inset-0"><img src="/img/landing/3.png?v=1" alt="Card 3" class="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">~ We Quantify Intelligence</h3>
                            <p>Our hybrid engine analyzes complexity,<br/>architecture, and novelty to determine<br/>the true value of your work.</p>
                        </div>
                    </div>
                     <div class="group shadow-lg overflow-hidden border-2 border-primary relative h-80 rounded-lg transition-all duration-300 ease-in-out hover:shadow-xl scroll-animate" style="transform: translateY(4rem); animation-delay: 600ms;">
                        <div class="absolute inset-0"><img src="/img/landing/6.png?v=1" alt="Card 6" class="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">~ Signal Earns More</h3>
                            <p>Get paid in USDC for the quality and<br/>uniqueness of your engineering, not<br/>just the size of your files.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-12 scroll-animate" style="transform: translateY(4rem);">
            <div class="container mx-auto px-6">
                <div class="shadow-lg border-2 border-primary mx-auto grid md:grid-cols-2 items-center overflow-hidden relative h-96 rounded-lg transition-all duration-300 ease-in-out hover:scale-101 hover:shadow-xl">
                     <div class="absolute inset-0"><img src="/img/landing/7.png" alt="Genesis Contributor" class="w-full h-full object-cover scale-105"></div>
                     <div class="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
                    <div class="text-left p-12 relative">
                        <h2 class="text-3xl font-bold">The Genesis Phase is Live.</h2>
                        <p class="text-text-secondary mt-4">This is your one chance to become a foundational member of the network and secure a permanent reward multiplier.</p>
                        <a href="${startEarningUrl}" class="mt-8 inline-block px-8 py-3 font-bold bg-accent-primary text-white hover:bg-red-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-out">Claim your spot</a>
                </div>
            </div>
        </section>
    
        <section class="py-12 scroll-animate" style="transform: translateY(4rem);">
        <div class="container mx-auto px-6">
                <h2 class="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div class="space-y-2">
                    <details class="group p-6 bg-surface transition-colors hover:bg-primary open:bg-primary rounded-lg"><summary class="flex items-center justify-between font-bold cursor-pointer list-none">Is my code safe?</summary><p class="mt-4 text-text-secondary">Yes. Our open-source CLI anonymizes your code on your machine before it's ever uploaded. Secrets, PII, and sensitive data never leave your device. Security is our absolute priority.</p></details>
                    <details class="group p-6 bg-surface transition-colors hover:bg-primary open:bg-primary rounded-lg"><summary class="flex items-center justify-between font-bold cursor-pointer list-none">What kind of code is most valuable?</summary><p class="mt-4 text-text-secondary">Our engine is origin-agnostic. It rewards complex, unique, and well-architected solutions, whether they were written by a human, an AI, or a combination of both. Quality is the only metric that matters.</p></details>
                    <details class="group p-6 bg-surface transition-colors hover:bg-primary open:bg-primary rounded-lg"><summary class="flex items-center justify-between font-bold cursor-pointer list-none">Do I lose ownership of my IP?</summary><p class="mt-4 text-text-secondary">Absolutely not. You retain 100% ownership of your original work. By contributing, you grant a license for the *anonymized version* of your code to be used in Lumen's datasets. Your IP is always yours.</p></details>
                </div>
                 <div class="text-center mt-12"><a href="/docs/faq" class="text-accent-primary hover:underline">See all FAQs →</a></div>
                        </div>
        </section>

        <section class="py-12 scroll-animate" style="transform: translateY(4rem);">
             <div class="container mx-auto px-6">
                 <div class="shadow-lg border-2 border-primary mx-auto grid md:grid-cols-2 items-center overflow-hidden relative h-96 rounded-lg transition-all duration-300 ease-in-out hover:scale-101 hover:shadow-xl">
                    <div class="absolute inset-0"><img src="/img/landing/8.png" alt="Join the Data Economy" class="w-full h-full object-cover scale-105 animate-subtle-float"></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
                    <div class="text-left p-12 relative flex flex-col h-full">
                        <div>
                            <h2 class="text-3xl font-bold">Your Code Has Value. Our AI Proves It.</h2>
                            <p class="text-text-secondary mt-4">2 clicks, code sent, rewards earned. Use the Lumen CLI to securely contribute your best projects. Our AI Quality Engine appraises your work, and you get paid in USDC for its value. It's that simple.</p>
                            <a href="${startEarningUrl}" class="mt-8 inline-block px-8 py-3 font-bold bg-accent-primary text-white hover:bg-red-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-out">Get Started now</a>
                        </div>
                        <div class="hidden md:flex mt-auto" style="gap: 250px;">
                             <span class="block w-2 h-2 bg-accent-primary"></span>
                             <span class="block w-2 h-2 bg-accent-primary"></span>
                             <span class="block w-2 h-2 bg-accent-primary"></span>
                    </div>
                </div>
            </div>
        </section>
    </main>
    `;
}