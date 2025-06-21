import { api } from '../lib/auth.js';
import zxcvbn from 'zxcvbn';
import { navigate } from '../router.js';

let formState = 'initial';
let formErrorMessage = '';
let token = '';

function render() {
    const container = document.getElementById('reset-password-container');
    if (!container) return;

    if (formState === 'success') {
        container.innerHTML = `
             <div class="w-16 h-16 mx-auto mb-6 bg-green-900/50 text-green-300 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 class="text-3xl font-bold text-white">Password Reset!</h1>
            <p class="text-text-secondary mt-3">Your password has been successfully updated. You can now log in with your new password.</p>
            <button id="go-to-login" class="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity">
                Go to Login
            </button>
        `;
        document.getElementById('go-to-login').addEventListener('click', () => navigate('/login'));
        return;
    }
    
    container.innerHTML = `
        <h1 class="text-3xl font-bold text-white">Set a New Password</h1>
        <p class="text-text-secondary mt-3">Choose a strong password to protect your account.</p>
        <div id="form-error-message" class="hidden text-red-400 bg-red-900/50 p-3 rounded-md mt-6 text-sm"></div>
        <form id="reset-password-form" class="mt-6 space-y-4" novalidate>
             <div>
                <label for="password" class="text-sm font-medium text-text-secondary">New Password</label>
                <input id="password" name="password" type="password" required class="mt-1 block w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                <div class="strength-bar"><div id="strength-bar-fill" class="strength-bar-fill"></div></div>
                <div id="password-error" class="error-text h-4"><span id="strength-text" class="text-xs text-subtle"></span></div>
            </div>
            <div>
                <label for="confirmPassword" class="text-sm font-medium text-text-secondary">Confirm New Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" required class="mt-1 block w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                <div id="confirmPassword-error" class="error-text h-4"></div>
            </div>
            <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity">
                Set New Password
            </button>
        </form>
    `;
    setupEventListeners();
}

function setupEventListeners() {
    const form = document.getElementById('reset-password-form');
    if (!form) return;

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBarFill = document.getElementById('strength-bar-fill');
    const strengthText = document.getElementById('strength-text');
    const errorMessageElement = document.getElementById('form-error-message');

    const validatePassword = () => {
        const errorEl = document.getElementById('password-error');
        const result = zxcvbn(passwordInput.value);
        const score = result.score;
        strengthBarFill.style.width = ['0%', '25%', '50%', '75%', '100%'][score];
        strengthBarFill.className = `strength-bar-fill ${['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-500'][score]}`;
        strengthText.textContent = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
        
        if (passwordInput.value && score < 2) {
            errorEl.textContent = result.feedback.warning || 'Password is too weak.';
            passwordInput.classList.add('input-error');
            return false;
        }
        errorEl.textContent = '';
        passwordInput.classList.remove('input-error');
        return true;
    };

    const validateConfirmPassword = () => {
        const errorEl = document.getElementById('confirmPassword-error');
        if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
            errorEl.textContent = 'Passwords do not match.';
            confirmPasswordInput.classList.add('input-error');
            return false;
        }
        errorEl.textContent = '';
        confirmPasswordInput.classList.remove('input-error');
        return true;
    };

    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validatePassword() || !validateConfirmPassword()) return;

        const password = passwordInput.value;
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;
        errorMessageElement.classList.add('hidden');

        try {
            await api.post('/auth/reset-password', { token, password });
            formState = 'success';
        } catch (error) {
            formState = 'initial';
            errorMessageElement.textContent = error.response?.data?.detail || 'An unknown error occurred.';
            errorMessageElement.classList.remove('hidden');
        } finally {
            render();
        }
    });
}

export function renderResetPasswordPage() {
    const params = new URLSearchParams(window.location.search);
    token = params.get('token');
    formState = 'initial';

    const content = `
    <main class="flex-grow flex items-center justify-center p-6 isolate min-h-screen pt-28">
        <video autoplay loop muted playsinline class="absolute top-0 left-0 w-full h-full object-cover -z-20" src="/plexus-bg.mp4"></video>
        <div class="absolute top-0 left-0 w-full h-full bg-black/50 -z-10"></div>
        <div class="w-full max-w-md mx-auto text-center">
            <div id="reset-password-container" class="bg-surface/80 backdrop-blur-md p-8 rounded-xl border border-primary shadow-2xl shadow-black/20">
            </div>
        </div>
    </main>
    `;
    
    setTimeout(() => render(), 0);
    return content;
}