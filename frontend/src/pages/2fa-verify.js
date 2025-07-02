import { api, fetchAndStoreUser, fetchAndStoreAccount } from '../lib/auth.js';
import { navigate } from '../router.js';

let formState = 'totp';
let tfa_token = '';

async function on2FASuccess() {
    await fetchAndStoreUser();
    await fetchAndStoreAccount();
    const redirectPath = localStorage.getItem('post_login_redirect');
    if (redirectPath) {
        localStorage.removeItem('post_login_redirect');
        navigate(redirectPath);
    } else {
        navigate('/app/dashboard');
    }
}

function setupEventListeners() {
    if (formState === 'totp') {
        const form = document.getElementById('2fa-form');
        const codeInputs = form.querySelectorAll('.code-input');
        
        codeInputs.forEach((input, index) => {
            input.addEventListener('keydown', (e) => {
                if (e.key >= 0 && e.key <= 9 && input.value === '') {
                    setTimeout(() => codeInputs[index + 1]?.focus(), 10);
                } else if (e.key === 'Backspace') {
                    setTimeout(() => {
                        if (index > 0 && input.value === '') {
                           codeInputs[index - 1].focus();
                           codeInputs[index - 1].value = '';
                        }
                    }, 10);
                }
            });
            input.addEventListener('input', () => {
                const code = Array.from(codeInputs).map(i => i.value).join('');
                if (code.length === 6) {
                    form.querySelector('button[type="submit"]')?.focus();
                }
            });
        });

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = Array.from(codeInputs).map(i => i.value).join('');
            const submitButton = e.submitter;
            const errorMessageElement = document.getElementById('form-error-message');
            
            errorMessageElement.classList.add('hidden');
            submitButton.disabled = true;
            submitButton.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;
            
            try {
                await api.post('/auth/token/2fa', { tfa_token, code });
                await on2FASuccess();
            } catch (error) {
                errorMessageElement.textContent = error.response?.data?.detail || 'Invalid 2FA code.';
                errorMessageElement.classList.remove('hidden');
                submitButton.disabled = false;
                submitButton.innerHTML = 'Verify';
                codeInputs.forEach(input => input.value = '');
                codeInputs[0].focus();
            }
        });
    } else if (formState === 'backup') {
        const form = document.getElementById('backup-code-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const backup_code = e.target['backup-code'].value;
            const submitButton = e.submitter;
            const errorMessageElement = document.getElementById('form-error-message');

            errorMessageElement.classList.add('hidden');
            submitButton.disabled = true;
            submitButton.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span>`;
            
            try {
                await api.post('/auth/token/2fa-backup', { tfa_token, backup_code });
                await on2FASuccess();
            } catch (error) {
                 errorMessageElement.textContent = error.response?.data?.detail || 'Invalid backup code.';
                errorMessageElement.classList.remove('hidden');
                submitButton.disabled = false;
                submitButton.innerHTML = 'Verify Backup Code';
            }
        });
    }
}

function render2FAForm() {
    const container = document.getElementById('2fa-verify-container');
    if (!container) return;
    
    let formContentHtml = `
        <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-white">Two-Factor Authentication</h1>
            <p class="text-text-secondary mt-2 text-sm">${formState === 'totp' ? 'Enter the code from your authenticator app.' : 'Enter one of your 10 backup codes.'}</p>
        </div>
        <div id="form-error-message" class="hidden text-red-400 bg-red-900/50 p-3 rounded-md mb-4 text-sm"></div>
        ${formState === 'totp' ? `
            <form id="2fa-form">
                <div class="flex justify-center gap-2 my-6">
                    ${Array(6).fill(0).map((_, i) => `
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" id="code-input-${i}" class="code-input w-12 h-14 text-center text-2xl font-mono bg-primary border border-subtle rounded-md text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none" autocomplete="one-time-code">
                    `).join('')}
                </div>
                 <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity">
                    Verify
                </button>
            </form>
        ` : `
            <form id="backup-code-form" class="space-y-4">
                <input type="text" id="backup-code" name="backup-code" placeholder="xxxx-xxxx" required class="block w-full text-center tracking-widest font-mono bg-primary border border-subtle rounded-md px-3 py-3 text-text-main focus:ring-2 focus:ring-accent-purple focus:outline-none" autocomplete="one-time-code">
                <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity">
                    Verify Backup Code
                </button>
            </form>
        `}
        <p class="mt-6 text-center text-sm">
            <button id="toggle-2fa-method" class="font-medium text-accent-cyan hover:underline">
                ${formState === 'totp' ? 'Use a backup code' : 'Use an authenticator app'}
            </button>
        </p>
    `;

    container.innerHTML = formContentHtml;

    document.getElementById('toggle-2fa-method')?.addEventListener('click', () => {
        formState = (formState === 'totp') ? 'backup' : 'totp';
        render2FAForm();
    });
    
    setupEventListeners();
}

export function render2FAVerifyPage() {
    const params = new URLSearchParams(window.location.search);
    tfa_token = params.get('token');

    if (!tfa_token) {
        navigate('/login');
        return `<div class="flex-grow flex items-center justify-center"><p class="text-red-400">Missing authentication token. Redirecting...</p></div>`;
    }

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
        <div class="w-full max-w-md mx-auto">
            <div id="2fa-verify-container" class="bg-surface/80 backdrop-blur-md p-8 rounded-xl border border-primary shadow-2xl shadow-black/20">
            </div>
        </div>
    </main>`;
    
    setTimeout(() => {
        formState = 'totp';
        render2FAForm();
    }, 0);
    return content;
}