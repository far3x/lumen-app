import { api } from '../lib/auth.js';
import { navigate } from '../router.js';

function setupEventListeners() {
    const form = document.getElementById('link-form');
    if (!form) return;

    const closeButton = document.getElementById('close-link-page');
    closeButton?.addEventListener('click', () => {
        localStorage.removeItem('post_login_redirect');
        navigate('/app/dashboard');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userCode = e.target.user_code.value.toUpperCase();
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonHTML = submitButton.innerHTML;
        const errorMessageElement = document.getElementById('error-message');
        const successMessageElement = document.getElementById('success-message');
        const formContainer = document.getElementById('form-container');

        errorMessageElement.classList.add('hidden');
        successMessageElement.classList.add('hidden');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;

        try {
            const response = await api.post('/auth/cli/approve-device', {
                user_code: userCode,
                device_name: "My Lumen CLI"
            });

            if (response.status !== 200) {
                const errorData = response.data;
                throw new Error(errorData.detail || 'Failed to authorize device.');
            }
            
            formContainer.classList.add('hidden');
            successMessageElement.classList.remove('hidden');
            localStorage.removeItem('post_login_redirect');

            const countdownElement = document.getElementById('countdown-message');
            let secondsLeft = 5;

            const updateCountdown = () => {
                countdownElement.textContent = `You will be redirected to the dashboard in ${secondsLeft} seconds...`;
            };
            
            updateCountdown();

            const countdownInterval = setInterval(() => {
                secondsLeft--;
                updateCountdown();
                if (secondsLeft <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            setTimeout(() => {
                if (window.opener) {
                    window.close();
                } else {
                    navigate('/app/dashboard');
                }
            }, 5000);

        } catch (error) {
            errorMessageElement.textContent = error.response?.data?.detail || error.message;
            errorMessageElement.classList.remove('hidden');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonHTML;
        }
    });
}

export function renderLinkPage() {
    const content = `
    <main class="flex-grow bg-background text-text-main">
        <div class="min-h-screen flex items-center justify-center p-6">
            <div class="container mx-auto grid lg:grid-cols-2 gap-24 items-center">
                <div class="w-full max-w-md mx-auto">
                    <div class="relative bg-surface p-8 rounded-xl border border-primary shadow-2xl shadow-black/5 text-center">
                        <button id="close-link-page" class="absolute top-3 right-3 p-2 text-text-secondary hover:text-text-main rounded-full hover:bg-primary transition-colors" aria-label="Close and go to dashboard">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <a href="/" class="inline-flex items-center space-x-3 mb-6">
                            <img src="/logo.png" alt="Lumen Logo" class="h-10 w-10">
                            <span class="text-2xl font-bold text-text-main">Lumen Protocol</span>
                        </a>
                        
                        <div id="form-container">
                            <h1 class="text-2xl font-bold text-text-main">Authorize New Device</h1>
                            <p class="text-text-secondary mt-2 text-sm">Enter the code displayed in your terminal to link your Lumen CLI.</p>
                            
                            <div id="error-message" class="hidden text-red-400 bg-red-900/50 p-3 rounded-md my-4 text-sm text-left"></div>

                            <form id="link-form" class="space-y-4 mt-6">
                                <div>
                                    <label for="user_code" class="sr-only">User Code</label>
                                    <input id="user_code" name="user_code" type="text" required
                                           class="block w-full bg-primary border border-subtle rounded-md px-3 py-3 text-text-main text-center text-lg tracking-widest font-mono uppercase focus:ring-2 focus:ring-accent-primary focus:outline-none"
                                           placeholder="XXXX-XXXX">
                                </div>
                                <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-red-700 transition-colors">
                                    Authorize CLI
                                </button>
                            </form>
                        </div>

                        <div id="success-message" class="hidden">
                            <svg class="w-16 h-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h1 class="text-2xl font-bold text-text-main mt-4">Device Authorized!</h1>
                            <p class="text-text-secondary mt-2">You can now safely close this tab and return to your terminal.</p>
                            <p id="countdown-message" class="text-sm text-text-secondary mt-2"></p>
                        </div>
                         <p class="mt-6 text-center text-sm">
                            <a href="/app/dashboard" class="font-medium text-accent-primary hover:underline">Back to Dashboard</a>
                        </p>
                    </div>
                </div>
                <div class="hidden lg:flex justify-center">
                     <img src="/bg.gif" alt="Lumen network visualization" class="w-full h-auto max-w-sm" />
                </div>
            </div>
        </div>
    </main>
    `;
    
    setTimeout(setupEventListeners, 0);
    return content;
}