import { api } from '../api.js';
import { navigateTo } from '../router.js';

class Signup {
    async render() {
        return `
            <div class="w-full max-w-md">
                <h1 class="text-3xl font-bold text-center text-light-text dark:text-dark-text mb-2">Créez Votre Compte</h1>
                <p class="text-center text-light-text-secondary dark:text-dark-text-secondary mb-8">Démarrez le monitoring en quelques minutes.</p>
                <form id="signup-form" class="glass-card p-8 space-y-6">
                    <div id="message-box" class="hidden"></div>
                    <div>
                        <input type="text" id="username" class="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-lg px-4 py-3 text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyan" placeholder="Nom d'utilisateur" required>
                    </div>
                    <div>
                        <input type="password" id="password" class="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-lg px-4 py-3 text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyan" placeholder="Mot de passe" required>
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span id="strength-text" class="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-300">Force du mot de passe</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2 flex space-x-1 p-0.5">
                            <div id="strength-bar-1" class="h-full w-1/4 rounded-full transition-all duration-500"></div>
                            <div id="strength-bar-2" class="h-full w-1/4 rounded-full transition-all duration-500"></div>
                            <div id="strength-bar-3" class="h-full w-1/4 rounded-full transition-all duration-500"></div>
                            <div id="strength-bar-4" class="h-full w-1/4 rounded-full transition-all duration-500"></div>
                        </div>
                        <p id="strength-criteria" class="text-xs text-gray-500 dark:text-gray-500 mt-1">Votre mot de passe doit inclure majuscules, minuscules, chiffres et symboles.</p>
                    </div>

                    <div>
                        <input type="password" id="confirm-password" class="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-lg px-4 py-3 text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyan" placeholder="Confirmez le mot de passe" required>
                    </div>
                    
                    {/* --- MODIFIED: Added spinner element and flex layout --- */}
                    <button type="submit" id="signup-btn" class="w-full bg-button-gradient text-white font-semibold py-3 rounded-lg shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                        <span class="btn-text">Créer le Compte</span>
                        <i class="fas fa-spinner fa-spin btn-spinner hidden ml-2"></i>
                    </button>
                </form>
                <p class="text-center text-light-text-secondary dark:text-dark-text-secondary mt-6">
                    Déjà un compte ? <a href="/login" data-link class="font-medium text-accent-cyan hover:underline">Connectez-vous ici</a>
                </p>
            </div>
        `;
    }

    checkPasswordStrength(password) {
        let score = 0;
        if (password.length > 0) score++;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }

    updateStrengthUI(password) {
        const score = this.checkPasswordStrength(password);
        const textEl = document.getElementById('strength-text');
        const bars = [
            document.getElementById('strength-bar-1'),
            document.getElementById('strength-bar-2'),
            document.getElementById('strength-bar-3'),
            document.getElementById('strength-bar-4')
        ];
        const strengthLevels = [
            { text: '', color: '' },
            { text: 'Très Faible', color: 'bg-red-500' },
            { text: 'Faible', color: 'bg-orange-500' },
            { text: 'Moyen', color: 'bg-yellow-500' },
            { text: 'Fort', color: 'bg-green-500' },
            { text: 'Excellent', color: 'bg-accent-cyan' }
        ];

        bars.forEach(bar => bar.className = 'h-full w-1/4 rounded-full transition-all duration-500');

        if (password.length === 0) {
            textEl.textContent = 'Force du mot de passe';
            textEl.classList.remove('text-light-text', 'dark:text-dark-text');
            textEl.classList.add('text-light-text-secondary', 'dark:text-dark-text-secondary');
            return;
        }

        const level = strengthLevels[score];
        textEl.textContent = level.text;
        textEl.classList.add('text-light-text', 'dark:text-dark-text');
        textEl.classList.remove('text-light-text-secondary', 'dark:text-dark-text-secondary');
        
        const barsToColor = Math.floor(score / 5 * 4);
        for (let i = 0; i < barsToColor; i++) {
            bars[i].classList.add(level.color);
        }
    }

    async after_render() {
        const signupForm = document.getElementById('signup-form');
        const passwordInput = document.getElementById('password');
        const signupBtn = document.getElementById('signup-btn');
        const messageBox = document.getElementById('message-box');
        // --- NEW: Get button elements for loading state ---
        const btnText = signupBtn.querySelector('.btn-text');
        const btnSpinner = signupBtn.querySelector('.btn-spinner');

        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            this.updateStrengthUI(password);
            const score = this.checkPasswordStrength(password);
            signupBtn.disabled = score < 3;
        });

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirm_password = document.getElementById('confirm-password').value;

            if (password !== confirm_password) {
                 messageBox.innerHTML = `<div class="bg-red-500/20 border border-red-500 text-red-400 dark:text-red-300 px-4 py-3 rounded-lg">Les mots de passe ne correspondent pas.</div>`;
                 messageBox.classList.remove('hidden');
                 return;
            }
            
            // --- MODIFIED: Show loading state ---
            signupBtn.disabled = true;
            btnText.textContent = 'Création...';
            btnSpinner.classList.remove('hidden');
            messageBox.classList.add('hidden');

            try {
                const data = await api.signup(username, password, confirm_password);
                messageBox.innerHTML = `<div class="bg-green-500/20 border border-green-500 text-green-400 dark:text-green-300 px-4 py-3 rounded-lg">${data.message} Redirection...</div>`;
                messageBox.classList.remove('hidden');
                // Keep button in loading state while redirecting
                setTimeout(() => navigateTo('/login'), 2000);
            } catch (error) {
                messageBox.innerHTML = `<div class="bg-red-500/20 border border-red-500 text-red-400 dark:text-red-300 px-4 py-3 rounded-lg">${error.message}</div>`;
                messageBox.classList.remove('hidden');
                // --- MODIFIED: Reset button on error ---
                const score = this.checkPasswordStrength(password);
                signupBtn.disabled = score < 3;
                btnText.textContent = 'Créer le Compte';
                btnSpinner.classList.add('hidden');
            }
        });

        passwordInput.dispatchEvent(new Event('input'));
    }
}
export default Signup;