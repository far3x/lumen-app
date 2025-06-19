import { api } from '../lib/auth.js';
import { navigate } from '../router.js';

let status = 'verifying';
let errorMessage = '';

async function verifyToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        status = 'error';
        errorMessage = 'No verification token provided.';
        render();
        return;
    }

    try {
        await api.get(`/auth/verify-email?token=${token}`);
        status = 'success';
    } catch (error) {
        status = 'error';
        errorMessage = error.response?.data?.detail || 'An unknown error occurred.';
    } finally {
        render();
    }
}

function getPageContent() {
    if (status === 'verifying') {
        return `
            <span class="animate-spin inline-block w-12 h-12 border-4 border-transparent border-t-accent-purple rounded-full mb-6"></span>
            <h1 class="text-3xl font-bold text-white">Verifying your account...</h1>
            <p class="text-text-secondary mt-3">Please wait a moment.</p>
        `;
    }
    if (status === 'success') {
        return `
            <div class="w-16 h-16 mx-auto mb-6 bg-green-900/50 text-green-300 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 class="text-3xl font-bold text-white">Account Verified!</h1>
            <p class="text-text-secondary mt-3">You can now log in to access your dashboard and start contributing.</p>
            <a href="/login" class="mt-8 inline-block px-8 py-3 font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg">Go to Login</a>
        `;
    }
    if (status === 'error') {
         return `
            <div class="w-16 h-16 mx-auto mb-6 bg-red-900/50 text-red-300 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h1 class="text-3xl font-bold text-white">Verification Failed</h1>
            <p class="text-text-secondary mt-3">${errorMessage}</p>
            <a href="/signup" class="mt-8 inline-block px-8 py-3 font-bold bg-primary text-white rounded-lg">Return to Signup</a>
        `;
    }
}

function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <main class="flex-grow flex items-center justify-center p-6 isolate min-h-screen pt-28">
        <video autoplay loop muted playsinline class="absolute top-0 left-0 w-full h-full object-cover -z-20" src="/plexus-bg.mp4"></video>
        <div class="absolute top-0 left-0 w-full h-full bg-black/50 -z-10"></div>
        <div class="w-full max-w-md mx-auto text-center">
            <div id="verify-content-box" class="bg-surface/80 backdrop-blur-md p-8 rounded-xl border border-primary shadow-2xl shadow-black/20">
                ${getPageContent()}
            </div>
        </div>
    </main>
    `;
}


export function renderVerifyPage() {
    render();
    verifyToken();
    return '';
}