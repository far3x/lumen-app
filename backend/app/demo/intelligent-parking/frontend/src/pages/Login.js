import { api } from '../api.js';
import { navigateTo } from '../router.js';

class Login {
    async render() {
        return `
            <div class="w-full max-w-md">
                <h1 class="text-3xl font-bold text-center text-light-text dark:text-dark-text mb-2">Bon Retour</h1>
                <p class="text-center text-light-text-secondary dark:text-dark-text-secondary mb-8">Connectez-vous pour accéder à votre tableau de bord.</p>
                <form id="login-form" class="glass-card p-8 space-y-6">
                    <div id="message-box" class="hidden"></div>
                    <div>
                        <input type="text" id="username" name="username" class="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-lg px-4 py-3 text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyan" placeholder="Nom d'utilisateur" required>
                    </div>
                    <div>
                        <input type="password" id="password" name="password" class="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-lg px-4 py-3 text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyan" placeholder="Mot de passe" required>
                    </div>
                    {/* --- MODIFIED: Added a spinner element --- */}
                    <button type="submit" id="login-btn" class="w-full bg-button-gradient text-white font-semibold py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center">
                        <span class="btn-text">Se Connecter</span>
                        <i class="fas fa-spinner fa-spin btn-spinner hidden ml-2"></i>
                    </button>
                </form>
                <p class="text-center text-light-text-secondary dark:text-dark-text-secondary mt-6">
                    Pas de compte ? <a href="/signup" data-link class="font-medium text-accent-cyan hover:underline">Inscrivez-vous ici</a>
                </p>
            </div>
        `;
    }

    async after_render() {
        const loginForm = document.getElementById('login-form');
        const messageBox = document.getElementById('message-box');
        // --- NEW: Get button elements ---
        const loginBtn = document.getElementById('login-btn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnSpinner = loginBtn.querySelector('.btn-spinner');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            
            // --- NEW: Show loading state ---
            loginBtn.disabled = true;
            btnText.textContent = 'Connexion...';
            btnSpinner.classList.remove('hidden');
            messageBox.classList.add('hidden');

            try {
                const data = await api.login(formData);
                localStorage.setItem('accessToken', data.access_token);
                navigateTo('/monitor');
            } catch (error) {
                messageBox.innerHTML = `<div class="bg-red-500/20 border border-red-500 text-red-400 dark:text-red-300 px-4 py-3 rounded-lg">${error.message}</div>`;
                messageBox.classList.remove('hidden');
                 // --- NEW: Reset button on error ---
                loginBtn.disabled = false;
                btnText.textContent = 'Se Connecter';
                btnSpinner.classList.add('hidden');
            }
        });
    }
}
export default Login;