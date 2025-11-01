import { api } from '../lib/auth.js';

let status = 'verifying';
let errorMessage = '';

async function verifyToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        status = 'error';
        errorMessage = 'No verification token provided.';
        renderContent();
        return;
    }

    try {
        await api.get(`/auth/verify-email?token=${token}`);
        status = 'success';
    } catch (error) {
        status = 'error';
        errorMessage = error.response?.data?.detail || 'An unknown error occurred.';
    } finally {
        renderContent();
    }
}

function renderContent() {
    const contentBox = document.getElementById('verify-content-box');
    if (!contentBox) return;

    if (status === 'verifying') {
        contentBox.innerHTML = `
            <span class="animate-spin inline-block w-12 h-12 border-4 border-transparent border-t-accent-primary rounded-full mb-6"></span>
            <h1 class="text-3xl font-bold text-text-main">Verifying your account...</h1>
            <p class="text-text-secondary mt-3">Please wait a moment.</p>
        `;
    } else if (status === 'success') {
        contentBox.innerHTML = `
            <div class="w-16 h-16 mx-auto mb-6 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 class="text-3xl font-bold text-text-main">Account Verified!</h1>
            <p class="text-text-secondary mt-3">You can now log in to access your dashboard and start contributing.</p>
            <a href="/login" class="mt-8 inline-block px-8 py-3 font-bold bg-accent-primary text-white rounded-lg hover:bg-red-700 transition-colors">Go to Login</a>
        `;
    } else if (status === 'error') {
         contentBox.innerHTML = `
            <div class="w-16 h-16 mx-auto mb-6 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h1 class="text-3xl font-bold text-text-main">Verification Failed</h1>
            <p class="text-text-secondary mt-3">${errorMessage}</p>
            <a href="/signup" class="mt-8 inline-block px-8 py-3 font-bold bg-primary text-text-main rounded-lg hover:bg-subtle transition-colors">Return to Signup</a>
        `;
    }
}


export function renderVerifyPage() {
    status = 'verifying';
    errorMessage = '';
    
    requestAnimationFrame(verifyToken);
    
    return `
    <main class="flex-grow bg-background text-text-main">
        <div class="min-h-screen flex items-center justify-center p-6">
            <div class="container mx-auto grid lg:grid-cols-2 gap-24 items-center">
                <div class="w-full max-w-md mx-auto text-center">
                    <div id="verify-content-box" class="bg-surface p-8 rounded-xl border border-primary shadow-2xl shadow-black/5">
                        <span class="animate-spin inline-block w-12 h-12 border-4 border-transparent border-t-accent-primary rounded-full mb-6"></span>
                        <h1 class="text-3xl font-bold text-text-main">Verifying your account...</h1>
                        <p class="text-text-secondary mt-3">Please wait a moment.</p>
                    </div>
                </div>
                <div class="hidden lg:flex justify-center">
                     <img src="/bg.gif" alt="Lumen network visualization" class="w-full h-auto max-w-sm" />
                </div>
            </div>
        </div>
    </main>
    `;
}