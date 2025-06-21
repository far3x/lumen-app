import { register, login } from '../lib/auth.js';
import { navigate } from '../router.js';

function setupEventListeners() {
    const form = document.getElementById('signup-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonHTML = submitButton.innerHTML;
        const errorMessageElement = document.getElementById('error-message');
        
        errorMessageElement.classList.add('hidden');

        if (password !== confirmPassword) {
            errorMessageElement.textContent = "Passwords do not match.";
            errorMessageElement.classList.remove('hidden');
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;

        try {
            await register(email, password);
            await login(email, password);
            
            const redirectPath = localStorage.getItem('post_login_redirect');
            if (redirectPath) {
                localStorage.removeItem('post_login_redirect');
                navigate(redirectPath);
            } else {
                navigate('/app/dashboard');
            }
        } catch (error) {
            errorMessageElement.textContent = error.response?.data?.detail || 'An unknown error occurred.';
            errorMessageElement.classList.remove('hidden');
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
            window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/login/${provider}?state=${state}`;
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
                        <button data-provider="google" class="oauth-button w-full flex items-center justify-center space-x-3 py-3 px-4 bg-primary hover:bg-subtle/80 transition-colors rounded-lg">
                            <svg class="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,36.627,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                            <span class="text-text-secondary hover:text-text-main transition-colors">Continue with Google</span>
                        </button>
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

                    <div id="error-message" class="hidden text-red-400 bg-red-900/50 p-3 rounded-md mb-4 text-sm"></div>

                    <form id="signup-form" class="space-y-4">
                        <div>
                            <label for="email" class="text-sm font-medium text-text-secondary">Email</label>
                            <input id="email" name="email" type="email" autocomplete="email" required class="mt-1 block w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                        </div>
                        <div>
                            <label for="password" class="text-sm font-medium text-text-secondary">Password</label>
                            <input id="password" name="password" type="password" required class="mt-1 block w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                        </div>
                        <div>
                            <label for="confirmPassword" class="text-sm font-medium text-text-secondary">Confirm Password</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required class="mt-1 block w-full bg-primary border border-subtle rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none">
                        </div>
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
    <main class="flex-grow flex items-center justify-center p-6 isolate min-h-screen">
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