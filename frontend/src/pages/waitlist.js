import { getUser, logout } from '../lib/auth.js';

export function renderWaitlistPage() {
    const user = getUser();
    const waitlistPosition = user?.waitlist_position || '...';
    
    return `
    <main class="flex-grow flex items-center justify-center p-6 isolate min-h-screen pt-20 bg-abyss-dark bg-starfield-pattern bg-starfield-size">
        <div class="w-full max-w-lg mx-auto">
            <div class="relative bg-surface p-8 md:p-12 rounded-xl border border-primary shadow-2xl shadow-black/50 animate-fade-in-up">
                <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan opacity-50 rounded-t-xl"></div>
                
                <div class="text-center">
                    <div class="w-20 h-20 mx-auto mb-6 bg-primary text-accent-purple rounded-full flex items-center justify-center animate-pulse">
                        <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>

                    <h1 class="text-4xl font-bold text-white">You're on the Waitlist</h1>
                    <p class="text-text-secondary mt-4 text-lg">Thank you for your interest in Lumen. The initial beta is currently full.</p>
                    
                    <div class="my-8 bg-primary/50 border border-subtle rounded-lg p-6">
                        <p class="text-text-secondary text-base">Your position in the queue is</p>
                        <p class="text-7xl font-bold gradient-text">#${waitlistPosition.toLocaleString()}</p>
                    </div>

                    <p class="text-sm text-subtle">We're admitting new users in batches. We'll notify you by email as soon as a spot opens up. In the meantime, you can follow our progress on <a href="https://twitter.com/0xFar3000" target="_blank" rel="noopener" data-external="true" class="font-medium text-accent-cyan hover:underline">Twitter</a>.</p>
                    
                    <button id="waitlist-logout-btn" class="mt-8 text-sm text-text-secondary hover:underline">Logout</button>
                </div>
            </div>
        </div>
    </main>
    `;
}

export function attachWaitlistPageListeners() {
    document.getElementById('waitlist-logout-btn')?.addEventListener('click', logout);
}