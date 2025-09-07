import { isAuthenticated } from '../lib/auth.js';

export function renderLandingPage() {
    const startEarningUrl = isAuthenticated() ? '/app/dashboard' : '/login';

    return `
    <main id="content-root" class="flex-grow bg-[#f0f0f0] text-gray-800 pt-28">

        <!-- Hero Section -->
        <section class="container mx-auto border-2 border-[#C4C4C4]">
            <div class="grid md:grid-cols-2 items-center">
                <div class="text-left p-12">
                    <h1 class="text-4xl md:text-6xl font-bold tracking-tighter">
                        Monetize Your Code.
                        <br>
                        Power the <span class="text-red-600">Future of AI.</span>
                    </h1>
                    <p class="mt-6 text-lg text-gray-600 max-w-lg">
                        The code on your local machine is one of the most valuable datasets on the planet. Stop letting it sit there. Start earning what it's worth.
                    </p>
                    <div class="mt-10 flex items-center gap-4">
                        <a href="${startEarningUrl}" class="px-8 py-3 font-bold bg-red-600 text-white hover:bg-red-700">Start Earning Now</a>
                        <a href="/docs/introduction" class="px-8 py-3 font-bold bg-gray-200 text-gray-800 hover:bg-gray-300">Read docs</a>
                    </div>
                </div>
                <div class="relative self-stretch h-full min-h-[750px] overflow-hidden">
                    <img src="/img/landing/logo-big.png" alt="Logo Big" class="absolute top-1/2 -translate-y-1/2 -left-80 w-auto h-[120%] max-w-none mix-blend-color-burn">
                </div>
            </div>
        </section>

        <!-- Your Code is a Trapped Asset Section -->
        <section class="py-12 mt-12">
            <div class="container mx-auto px-6 text-left">
                <h2 class="text-3xl font-bold mb-4">> Your Code is a Trapped Asset</h2>
                <p class="text-gray-600 mb-12 max-w-none">
                    Billions of lines of high-signal, human-written code are locked away in private repositories. This is a vast, untapped reservoir of value. Until now.
                </p>
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="shadow-lg overflow-hidden border-2 border-[#C4C4C4] relative h-80">
                        <div class="absolute inset-0"><img src="/img/landing/1.png" alt="Card 1" class="w-full h-full object-cover"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">* Sitting Idle</h3>
                            <p>Generating zero Value for You Or<br/>the Ecosystem.</p>
                        </div>
                    </div>
                    <div class="shadow-lg overflow-hidden border-2 border-[#C4C4C4] relative h-80">
                        <div class="absolute inset-0"><img src="/img/landing/2.png" alt="Card 2" class="w-full h-full object-cover"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">* At Risk</h3>
                            <p>Exposed to being Scraped Without<br/>Credit Or Compensation.</p>
                        </div>
                    </div>
                    <div class="shadow-lg overflow-hidden border-2 border-[#C4C4C4] relative h-80">
                        <div class="absolute inset-0"><img src="/img/landing/3.png" alt="Card 3" class="w-full h-full object-cover"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">* Undervalued</h3>
                            <p>Fundamentally Mispriced by the<br/>Entire AI Market.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Lumen Sets It Free Section -->
        <section class="py-12">
            <div class="container mx-auto px-6 text-left">
                <h2 class="text-3xl font-bold mb-4">> Lumen Sets It <span class="text-red-600">Free</span>.</h2>
                <p class="text-gray-600 mb-12 max-w-none">
                    We provide the bridge between your private work and the new data economy, transforming your code into a secure, high-value, and reward-generating asset.
                </p>
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="shadow-lg overflow-hidden border-2 border-[#C4C4C4] relative h-80">
                        <div class="absolute inset-0"><img src="/img/landing/4.png" alt="Card 4" class="w-full h-full object-cover"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">* Anonymized Locally</h3>
                            <p>Your Raw Code And Secrets Never<br/>Leave Your Machine.</p>
                        </div>
                    </div>
                    <div class="shadow-lg overflow-hidden border-2 border-[#C4C4C4] relative h-80">
                        <div class="absolute inset-0"><img src="/img/landing/5.png" alt="Card 5" class="w-full h-full object-cover"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">* Valued Transparently</h3>
                            <p>Our Engine Ensures Fair Rewards<br/>Based On Quality.</p>
                        </div>
                    </div>
                     <div class="shadow-lg overflow-hidden border-2 border-[#C4C4C4] relative h-80">
                        <div class="absolute inset-0"><img src="/img/landing/6.png" alt="Card 6" class="w-full h-full object-cover"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="p-8 absolute bottom-0 left-0 text-white">
                             <img src="/img/landing/neige.svg" alt="Icon" class="w-8 h-8 mb-2">
                            <h3 class="font-bold text-xl">* Rewarded On-Chain</h3>
                            <p>You Own Your Rewards On A<br/>Public, Decentralized Network.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Become a Genesis Contributor Section -->
        <section class="py-12">
            <div class="container mx-auto px-6">
                <div class="shadow-lg border-2 border-[#C4C4C4] mx-auto grid md:grid-cols-2 items-center overflow-hidden relative h-96">
                     <div class="absolute inset-0 bg-gray-300 flex items-center justify-center"><span class="text-gray-500">Image Placeholder</span></div>
                     <div class="absolute inset-0 bg-gradient-to-r from-[#f0f0f0] via-[#f0f0f0]/80 to-transparent"></div>
                    <div class="text-left p-12 relative">
                        <h2 class="text-3xl font-bold">Become a Genesis Contributor</h2>
                        <p class="text-gray-600 mt-4">Contribute during our Genesis Phase to earn your stake in the network and receive a permanent reward multiplier.</p>
                        <a href="#" class="mt-8 inline-block px-8 py-3 font-bold bg-red-600 text-white hover:bg-red-700">Claim your spot</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <section class="py-12">
            <div class="container mx-auto px-6">
                <h2 class="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div class="space-y-2">
                    <details class="group p-6 bg-[#EBEBEB] transition-colors hover:bg-gray-200 open:bg-[#DFDFDF]"><summary class="font-bold cursor-pointer list-none">Can I use Spline for free?</summary><p class="mt-4 text-gray-600">Yes, totally! The Basic plan is free. You can have unlimited personal files and Re-exports. Maximum 1 team project can be created with 2 team files and 2 editors. You also have access to the Spline Library and computation (our servers) with a Spline logo.</p></details>
                    <details class="group p-6 bg-[#EBEBEB] transition-colors hover:bg-gray-200 open:bg-[#DFDFDF]"><summary class="font-bold cursor-pointer list-none">Why should I upgrade to Super or Super Team?</summary><p class="mt-4 text-gray-600">...</p></details>
                    <details class="group p-6 bg-[#EBEBEB] transition-colors hover:bg-gray-200 open:bg-[#DFDFDF]"><summary class="font-bold cursor-pointer list-none">Why should I upgrade to Super or Super Team?</summary><p class="mt-4 text-gray-600">...</p></details>
                    <details class="group p-6 bg-[#EBEBEB] transition-colors hover:bg-gray-200 open:bg-[#DFDFDF]"><summary class="font-bold cursor-pointer list-none">Why should I upgrade to Super or Super Team?</summary><p class="mt-4 text-gray-600">...</p></details>
                    <details class="group p-6 bg-[#EBEBEB] transition-colors hover:bg-gray-200 open:bg-[#DFDFDF]"><summary class="font-bold cursor-pointer list-none">Why should I upgrade to Super or Super Team?</summary><p class="mt-4 text-gray-600">...</p></details>
                </div>
            </div>
        </section>

        <!-- Ready to Join Section -->
        <section class="py-12">
             <div class="container mx-auto px-6">
                 <div class="shadow-lg border-2 border-[#C4C4C4] mx-auto grid md:grid-cols-2 items-center overflow-hidden relative h-96">
                    <div class="absolute inset-0 bg-gray-300 flex items-center justify-center"><span class="text-gray-500">Image Placeholder</span></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-[#f0f0f0] via-[#f0f0f0]/80 to-transparent"></div>
                    <div class="text-left p-12 relative">
                        <h2 class="text-3xl font-bold">Ready to Join the Data Economy?</h2>
                        <p class="text-gray-600 mt-4">Start contributing your anonymized code in minutes and get rewarded with $LUMEN tokens.</p>
                        <a href="#" class="mt-8 inline-block px-8 py-3 font-bold bg-red-600 text-white hover:bg-red-700">Get Started now</a>
                    </div>
                </div>
            </div>
        </section>
    </main>
    `;
}