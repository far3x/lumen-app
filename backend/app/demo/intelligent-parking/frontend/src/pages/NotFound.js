class NotFound {
    async render() {
        return `
            <div class="text-center py-16">
                <h1 class="text-9xl font-extrabold text-gradient-aurora tracking-widest">404</h1>
                <div class="bg-gray-800 px-2 text-sm rounded rotate-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    Page Non Trouvée
                </div>
                <p class="mt-4 text-gray-400 text-lg">Désolé, la page que vous recherchez n'existe pas.</p>
                <a href="/" data-link class="mt-8 inline-block bg-button-gradient text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity">
                    Retour à l'accueil
                </a>
            </div>
        `;
    }
}
export default NotFound;