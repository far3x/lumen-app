class Home {
    async render() {
        return `
            <div class="relative text-center py-24 sm:py-32 px-4">
                <div class="absolute inset-0 -z-10 overflow-hidden">
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%) blur-3xl dark:opacity-100 opacity-50"></div>
                </div>

                <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-light-text dark:text-dark-text leading-tight">
                    Le Futur de la Sécurité des Parkings est 
                    <span class="text-gradient-aurora">Acoustique</span>
                </h1>
                <p class="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-light-text-secondary dark:text-dark-text-secondary">
                    Notre plateforme IoT transforme le son en données exploitables, assurant un environnement plus sûr et plus silencieux grâce à une surveillance en temps réel.
                </p>
                <div class="mt-10">
                    <a href="/login" data-link class="bg-button-gradient text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity">
                        Accéder à la Plateforme
                    </a>
                </div>
            </div>

            <div class="mt-16">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="glass-card p-8 text-center">
                        <div class="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-button-gradient mb-6">
                           <i class="fa-solid fa-satellite-dish text-3xl text-white"></i>
                        </div>
                        <h3 class="text-xl font-bold text-light-text dark:text-dark-text">Flux en Direct</h3>
                        <p class="mt-2 text-light-text-secondary dark:text-dark-text-secondary">Visualisez les données sonores captées par les microcontrôleurs instantanément via une interface web réactive.</p>
                    </div>
                     <div class="glass-card p-8 text-center">
                        <div class="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-button-gradient mb-6">
                           <i class="fa-solid fa-chart-pie text-3xl text-white"></i>
                        </div>
                        <h3 class="text-xl font-bold text-light-text dark:text-dark-text">Analyses Intégrées</h3>
                        <p class="mt-2 text-light-text-secondary dark:text-dark-text-secondary">Accédez à un tableau de bord présentant les tendances et les données historiques de multiples capteurs.</p>
                    </div>
                     <div class="glass-card p-8 text-center">
                        <div class="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-button-gradient mb-6">
                           <i class="fa-solid fa-bell text-3xl text-white"></i>
                        </div>
                        <h3 class="text-xl font-bold text-light-text dark:text-dark-text">Alertes Intelligentes</h3>
                        <p class="mt-2 text-light-text-secondary dark:text-dark-text-secondary">Recevez des alertes visuelles immédiates lorsque les niveaux sonores dépassent les seuils critiques.</p>
                    </div>
                </div>
            </div>
        `;
    }
}
export default Home;