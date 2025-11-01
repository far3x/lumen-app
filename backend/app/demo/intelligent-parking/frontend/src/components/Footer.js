class Footer {
    async render() {
        return `
            <footer class="bg-white/20 dark:bg-black/20 border-t border-light-border dark:border-dark-border mt-16">
                <div class="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div class="col-span-2 md:col-span-1">
                            <a href="/" data-link class="flex items-center gap-3">
                                <img src="/src/assets/logo.svg" alt="Logo" class="h-8 w-auto">
                                <span class="text-light-text dark:text-dark-text font-bold text-xl">Parking Intelligent</span>
                            </a>
                            <p class="text-light-text-secondary dark:text-dark-text-secondary mt-4 text-sm">Surveillance acoustique IoT pour des environnements plus sûrs et plus intelligents.</p>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold text-light-text dark:text-dark-text tracking-wider uppercase">Navigation</h3>
                            <ul class="mt-4 space-y-2">
                                <li><a href="/" data-link class="text-base text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-cyan">Accueil</a></li>
                                <li><a href="/monitor" data-link class="text-base text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-cyan">Monitoring</a></li>
                                <li><a href="/dashboard" data-link class="text-base text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-cyan">Tableau de Bord</a></li>
                                <li><a href="/contact" data-link class="text-base text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-cyan">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold text-light-text dark:text-dark-text tracking-wider uppercase">Projet</h3>
                            <ul class="mt-4 space-y-2">
                                <li><a href="https://github.com/Navalingame/Parking_Intelligent" target="_blank" rel="noopener noreferrer" class="text-base text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-cyan">GitHub</a></li>
                                <li><a href="https://www.isep.fr/" target="_blank" rel="noopener noreferrer" class="text-base text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-cyan">À Propos d'ISEP</a></li>
                            </ul>
                        </div>
                         <div>
                            <h3 class="text-sm font-semibold text-light-text dark:text-dark-text tracking-wider uppercase">Légal</h3>
                            <ul class="mt-4 space-y-2">
                                <li><a href="#" class="text-base text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-cyan">Conditions d'Utilisation</a></li>
                                <li><a href="#" class="text-base text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-cyan">Confidentialité</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="mt-8 border-t border-light-border dark:border-dark-border pt-8 text-center">
                        <p class="text-base text-light-text-secondary dark:text-dark-text-secondary">© 2024-2025 ISEP - App Commun Parking. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}
export default Footer;