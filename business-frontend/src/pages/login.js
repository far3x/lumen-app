import { login } from '../lib/auth.js';
import { navigate } from '../router.js';

function setupEventListeners() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const submitButton = form.querySelector('button[type="submit"]');
        const errorMessageElement = document.getElementById('error-message');

        errorMessageElement.classList.add('hidden');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;

        try {
            await login(email, password);
            navigate('/app/overview');
        } catch (error) {
            errorMessageElement.textContent = error.response?.data?.detail || 'An unknown error occurred.';
            errorMessageElement.classList.remove('hidden');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Sign In';
        }
    });
}

export function renderLoginPage() {
    setTimeout(setupEventListeners, 0);
    return `
    <div class="bg-white py-24 sm:py-32">
        <div class="container mx-auto px-6 max-w-lg">
            <div class="max-w-md mx-auto">
                <div class="text-center">
                    <a href="/" class="inline-block mb-6">
                        <img class="h-12 w-auto" src="/logo.png" alt="Lumen Logo">
                    </a>
                    <h2 class="text-3xl font-bold tracking-tight text-text-headings">Sign in to your account</h2>
                    <p class="mt-2 text-text-body">
                        Or <a href="/signup" class="font-medium text-accent-purple hover:text-accent-pink">create a new business account</a>
                    </p>
                </div>
                <div class="mt-10">
                    <div id="error-message" class="hidden bg-red-100 border border-red-300 text-red-800 text-sm p-3 rounded-md mb-4"></div>
                    <form id="login-form" class="space-y-6">
                        <div>
                            <label for="email" class="block text-sm font-medium leading-6 text-text-body">Email address</label>
                            <div class="mt-2">
                                <input id="email" name="email" type="email" autocomplete="email" required class="form-input">
                            </div>
                        </div>
                        <div>
                             <label for="password" class="block text-sm font-medium leading-6 text-text-body">Password</label>
                            <div class="mt-2">
                                <input id="password" name="password" type="password" autocomplete="current-password" required class="form-input">
                            </div>
                        </div>
                        <div>
                            <button type="submit" class="w-full px-8 py-3 font-semibold text-white bg-accent-gradient rounded-md transition-all duration-300 hover:scale-105 hover:brightness-110">Sign In</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <style>
        .form-input {
            @apply block w-full rounded-md border-0 py-2.5 px-3 text-text-body shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-accent-purple sm:text-sm sm:leading-6;
        }
    </style>
    `;
}