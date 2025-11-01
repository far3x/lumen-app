export function renderCheckEmailPage() {
    return `
    <main class="flex-grow bg-background text-text-main">
        <div class="min-h-screen flex items-center justify-center p-6">
            <div class="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <div class="w-full max-w-md mx-auto text-center">
                    <div class="bg-surface p-8 rounded-xl border border-primary shadow-2xl shadow-black/5">
                        <div class="w-16 h-16 mx-auto mb-6 bg-primary text-accent-primary rounded-full flex items-center justify-center">
                             <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                        </div>
                        <h1 class="text-3xl font-bold text-text-main">Check Your Inbox</h1>
                        <p class="text-text-secondary mt-3">We've sent a verification link to your email address. Please click the link to activate your account.</p>
                        <p class="text-xs text-subtle mt-6">Didn't receive it? Check your spam folder or wait a few minutes.</p>
                    </div>
                </div>
                <div class="hidden lg:block">
                     <div class="bg-surface p-2 rounded-lg border-2 border-primary">
                        <img src="/bg.gif" alt="Lumen network visualization" class="w-full h-auto rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    </main>
    `;
}