import { navigateTo } from '../router.js';

class Header {
    async render() {
        const path = window.location.pathname;
        const isAuthenticated = !!localStorage.getItem('accessToken');

        const navLinks = [
            { href: '/', text: 'Accueil' },
            { href: '/monitor', text: 'Monitoring', auth: true },
            { href: '/dashboard', text: 'Tableau de Bord', auth: true },
            { href: '/contact', text: 'Contact' },
        ];

        return `
            <header class="sticky top-0 z-50 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-light-border dark:border-dark-border transition-colors duration-300">
                <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <div class="flex-shrink-0">
                            <a href="/" data-link class="flex items-center gap-3">
                                <img src="/src/assets/logo.svg" alt="Logo" class="h-8 w-auto">
                                <span class="font-bold text-xl text-light-text dark:text-dark-text">Parking Intelligent</span>
                            </a>
                        </div>
                        <nav class="hidden md:flex items-center space-x-1">
                            ${navLinks.map(link => `
                                <a href="${link.href}" 
                                   data-link 
                                   ${link.auth ? 'data-auth="true"' : ''}
                                   class="relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300
                                    ${path === link.href ? 'text-light-text dark:text-dark-text' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'}">
                                    ${link.text}
                                    ${path === link.href ? '<span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-aurora-gradient rounded-full"></span>' : ''}
                                </a>
                            `).join('')}
                        </nav>
                        <div class="flex items-center gap-4">
                            <button id="theme-toggle-btn" class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors">
                                <i id="theme-icon-sun" class="fas fa-sun text-lg"></i>
                                <i id="theme-icon-moon" class="fas fa-moon text-lg"></i>
                            </button>
                            ${isAuthenticated 
                                ? `<button id="logout-btn" class="bg-black/5 dark:bg-white/5 text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/10 dark:hover:bg-white/10 hover:text-light-text dark:hover:text-dark-text px-4 py-2 rounded-md text-sm font-medium transition-colors">Déconnexion</button>`
                                : `<a href="/login" data-link class="bg-button-gradient text-white font-semibold px-6 py-2 rounded-md text-sm transition-opacity hover:opacity-90">Connexion</a>`
                            }
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    async after_render() {
        const isAuthenticated = !!localStorage.getItem('accessToken');
        const logoutBtn = document.getElementById('logout-btn');
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('accessToken');
                navigateTo('/');
            });
        }

        document.querySelectorAll('[data-auth="true"]').forEach(link => {
            link.addEventListener('click', (e) => {
                if (!isAuthenticated) {
                    e.preventDefault();
                    navigateTo('/login');
                }
            });
        });
        
        const applyTheme = (theme) => {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        const currentTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(currentTheme);

        themeToggleBtn.addEventListener('click', () => {
            const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }
}

export default Header;