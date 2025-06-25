import { register, login } from '../lib/auth.js';
import { navigate } from '../router.js';
import zxcvbn from 'zxcvbn';

function setupEventListeners() {
    const form = document.getElementById('signup-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBarFill = document.getElementById('strength-bar-fill');
    const strengthText = document.getElementById('strength-text');

    const validateEmail = () => {
        const errorEl = document.getElementById('email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value && !emailRegex.test(emailInput.value)) {
            errorEl.textContent = 'Please enter a valid email address.';
            emailInput.classList.add('input-error');
            return false;
        }
        errorEl.textContent = '';
        emailInput.classList.remove('input-error');
        return true;
    };

    const validatePassword = () => {
        const errorEl = document.getElementById('password-error');
        const result = zxcvbn(passwordInput.value);
        const score = result.score;
        
        const barWidths = ['0%', '25%', '50%', '75%', '100%'];
        const barColors = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-500'];
        const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

        strengthBarFill.style.width = barWidths[score];
        strengthBarFill.className = `strength-bar-fill ${barColors[score]}`;
        strengthText.textContent = strengthLabels[score];
        
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

    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);

    const recaptchaContainer = document.getElementById('recaptcha-widget-container');
    if (recaptchaContainer && typeof grecaptcha !== 'undefined' && recaptchaContainer.innerHTML.trim() === '') {
        try {
            grecaptcha.render(recaptchaContainer, {
                'sitekey' : import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY,
                'theme' : 'dark'
            });
        } catch(e) {
            console.error("reCAPTCHA rendering error:", e);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmValid = validateConfirmPassword();
        if (!isEmailValid || !isPasswordValid || !isConfirmValid) return;

        const email = e.target.email.value;
        const password = e.target.password.value;
        const recaptchaToken = grecaptcha.getResponse();
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonHTML = submitButton.innerHTML;
        const errorMessageElement = document.getElementById('form-error-message');
        
        errorMessageElement.classList.add('hidden');

        if (!recaptchaToken) {
            errorMessageElement.textContent = "Please complete the reCAPTCHA.";
            errorMessageElement.classList.remove('hidden');
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;

        try {
            await register(email, password, recaptchaToken);
            navigate('/check-email');
        } catch (error) {
            let detail = error.response?.data?.detail;
            if (Array.isArray(detail)) {
                errorMessageElement.textContent = detail.map(err => err.msg).join(', ');
            } else {
                errorMessageElement.textContent = detail || 'An unknown error occurred.';
            }
            errorMessageElement.classList.remove('hidden');
            grecaptcha.reset();
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonHTML;
        }
    });

    document.querySelectorAll('.oauth-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const provider = e.currentTarget.dataset.provider;
            const redirectPath = localStorage.getItem('post_login_redirect') || '/app/dashboard';
            const state = btoa(JSON.stringify({ redirect_path: redirectPath }));
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            window.location.href = `${baseUrl}/api/v1/auth/login/${provider}?state=${state}`;
        });
    });
}

function renderSignupForm() {
    const container = document.getElementById('signup-container');
    container.innerHTML = `
        <div class="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            
            <div class="hidden lg:flex flex-col justify-center text-left pr-10">
                <a href="/" class="inline-flex items-center space-x-3 mb-8">
                    <img src="/logo.svg" alt="Lumen Logo" class="h-12 w-12">
                    <span class="text-3xl font-bold text-text-main">Lumen</span>
                </a>
                <h1 class="text-5xl font-bold tracking-tight text-white leading-tight">Create Your Account.</h1>
                <p class="mt-4 text-lg text-text-secondary">
                    Join the decentralized data economy and start earning rewards for your anonymized code contributions today.
                </p>
            </div>
            
            <div class="w-full max-w-md mx-auto">
                <div class="bg-surface/80 backdrop-blur-md p-8 rounded-xl border border-primary shadow-2xl shadow-black/20">
                    <div class="text-center mb-6">
                        <h1 class="text-2xl font-bold text-white">Get Started with Lumen</h1>
                        <p class="text-text-secondary mt-2 text-sm">And start earning $LUM today.</p>
                    </div>

                    <div class="space-y-3">
                        <button data-provider="github" class="oauth-button w-full flex items-center justify-center space-x-3 py-3 px-4 bg-primary hover:bg-subtle/80 transition-colors rounded-lg">
                            <svg class="w-5 h-5 text-text-secondary group-hover:text-text-main transition-colors" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd" /></svg>
                            <span class="text-text-secondary hover:text-text-main transition-colors">Continue with GitHub</span>
                        </button>
                    </div>
                    
                    <div class="my-6 flex items-center">
                        <div class="flex-grow border-t border-primary"></div>
                        <span class="flex-shrink mx-4 text-xs text-subtle uppercase">Or create an account with email</span>
                        <div class="flex-grow border-t border-primary"></div>
                    </div>

                    <div id="form-error-message" class="hidden text-red-400 bg-red-900/50 p-3 rounded-md mb-4 text-sm"></div>

                    <form id="signup-form" class="space-y-4" novalidate>
                        <div>
                            <label for="email" class="text-sm font-medium text-text-secondary">Email</label>
                            <input id="email" name="email" type="email" autocomplete="email" required class="mt-1 block w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                            <div id="email-error" class="error-text h-4"></div>
                        </div>
                        <div>
                            <label for="password" class="text-sm font-medium text-text-secondary">Password</label>
                            <input id="password" name="password" type="password" required class="mt-1 block w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                            <div class="strength-bar"><div id="strength-bar-fill" class="strength-bar-fill"></div></div>
                            <div id="password-error" class="error-text h-4"><span id="strength-text" class="text-xs text-subtle"></span></div>
                        </div>
                        <div>
                            <label for="confirmPassword" class="text-sm font-medium text-text-secondary">Confirm Password</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required class="mt-1 block w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                            <div id="confirmPassword-error" class="error-text h-4"></div>
                        </div>
                        <div id="recaptcha-widget-container" class="pt-2 flex justify-center"></div>
                        <div class="pt-2">
                            <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity">
                                Create Account
                            </button>
                        </div>
                    </form>

                    <p class="mt-6 text-center text-sm text-text-secondary">
                        Already have an account?
                        <a href="/login" class="font-medium text-accent-cyan hover:underline">Sign In</a>
                    </p>
                </div>
            </div>
        </div>
    `;
    setupEventListeners();
}

export function renderSignupPage() {
    const content = `
    <main class="flex-grow flex items-center justify-center p-6 isolate min-h-screen pt-28">
        <video
            autoplay
            loop
            muted
            playsinline
            class="absolute top-0 left-0 w-full h-full object-cover -z-20"
            src="/plexus-bg.mp4"
        ></video>
        <div class="absolute top-0 left-0 w-full h-full bg-black/50 -z-10"></div>
        <div id="signup-container" class="w-full"></div>
    </main>`;
    
    setTimeout(() => renderSignupForm(), 0);
    return content;
}