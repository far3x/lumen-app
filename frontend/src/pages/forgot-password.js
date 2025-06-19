import { api } from '../lib/auth.js';

let formState = 'initial';

function render() {
    const container = document.getElementById('forgot-password-container');
    if (!container) return;

    if (formState === 'success') {
        container.innerHTML = `
            <div class="w-16 h-16 mx-auto mb-6 bg-primary text-accent-cyan rounded-full flex items-center justify-center">
                 <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
            </div>
            <h1 class="text-3xl font-bold text-white">Check Your Inbox</h1>
            <p class="text-text-secondary mt-3">If an account with that email exists, we've sent a link to reset your password.</p>
        `;
        return;
    }
    
    container.innerHTML = `
        <h1 class="text-3xl font-bold text-white">Forgot Password?</h1>
        <p class="text-text-secondary mt-3">No problem. Enter your email address below and we'll send you a link to reset it.</p>
        <div id="form-error-message" class="hidden text-red-400 bg-red-900/50 p-3 rounded-md mt-6 text-sm"></div>
        <form id="forgot-password-form" class="mt-6 space-y-4">
            <div>
                <label for="email" class="sr-only">Email</label>
                <input id="email" name="email" type="email" autocomplete="email" required
                       class="block w-full bg-primary border border-subtle rounded-md px-3 py-3 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none"
                       placeholder="you@example.com">
            </div>
            <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity">
                Send Reset Link
            </button>
        </form>
    `;
    setupEventListeners();
}

function setupEventListeners() {
    const form = document.getElementById('forgot-password-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const submitButton = form.querySelector('button[type="submit"]');
        const errorMessageElement = document.getElementById('form-error-message');
        
        errorMessageElement.classList.add('hidden');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;
        
        try {
            await api.post('/auth/forgot-password', { email });
            formState = 'success';
        } catch (error) {
            errorMessageElement.textContent = error.response?.data?.detail || 'An unknown error occurred.';
            errorMessageElement.classList.remove('hidden');
        } finally {
            render();
        }
    });
}

export function renderForgotPasswordPage() {
    formState = 'initial';
    const content = `
    <main class="flex-grow flex items-center justify-center p-6 isolate min-h-screen pt-28">
        <video autoplay loop muted playsinline class="absolute top-0 left-0 w-full h-full object-cover -z-20" src="/plexus-bg.mp4"></video>
        <div class="absolute top-0 left-0 w-full h-full bg-black/50 -z-10"></div>
        <div class="w-full max-w-md mx-auto text-center">
            <div id="forgot-password-container" class="bg-surface/80 backdrop-blur-md p-8 rounded-xl border border-primary shadow-2xl shadow-black/20">
            </div>
             <p class="mt-6 text-center text-sm">
                <a href="/login" class="font-medium text-accent-cyan hover:underline">Back to Login</a>
            </p>
        </div>
    </main>
    `;

    setTimeout(() => render(), 0);
    return content;
}