export function renderCheckEmailPage() {
    return `
    <div class="bg-white py-24 sm:py-32 flex-grow flex items-center">
        <div class="container mx-auto px-6 max-w-lg">
            <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-6 bg-gray-100 text-accent-purple rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h1 class="text-3xl font-bold text-text-headings">Check Your Inbox</h1>
                <p class="text-text-body mt-3">We've sent a verification link to your email address. Please click the link to activate your account.</p>
            </div>
        </div>
    </div>
    `;
}