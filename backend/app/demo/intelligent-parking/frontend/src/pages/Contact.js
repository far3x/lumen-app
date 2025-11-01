class Contact {
    async render() {
        return `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-12">
                    <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tighter text-gradient-aurora">
                        Nous Contacter
                    </h1>
                    {/* --- MODIFIED: Use Tailwind dark: variant for consistency --- */}
                    <p class="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                        Une question ou une suggestion ? N'hésitez pas à nous envoyer un message.
                    </p>
                </div>

                <div class="glass-card p-8 md:p-12">
                    <form id="contact-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                {/* --- MODIFIED: Use Tailwind dark: variant for consistency --- */}
                                <label for="name" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Nom complet</label>
                                <input type="text" id="name" required class="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-lg px-4 py-3 text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyan transition">
                            </div>
                            <div>
                                {/* --- MODIFIED: Use Tailwind dark: variant for consistency --- */}
                                <label for="email" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Adresse e-mail</label>
                                <input type="email" id="email" required class="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-lg px-4 py-3 text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyan transition">
                            </div>
                        </div>
                        <div>
                            {/* --- MODIFIED: Use Tailwind dark: variant for consistency --- */}
                            <label for="subject" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Sujet</label>
                            <input type="text" id="subject" required class="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-lg px-4 py-3 text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyan transition">
                        </div>
                        <div>
                            {/* --- MODIFIED: Use Tailwind dark: variant for consistency --- */}
                            <label for="message" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Votre message</label>
                            <textarea id="message" rows="6" required class="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-lg px-4 py-3 text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyan transition"></textarea>
                        </div>
                        <div id="contact-message-box" class="hidden"></div>
                        <div class="text-right">
                            <button type="submit" class="bg-button-gradient text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity">
                                Envoyer le Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    async after_render() {
        const form = document.getElementById('contact-form');
        const messageBox = document.getElementById('contact-message-box');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            messageBox.innerHTML = `
                <div class="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-center">
                    Merci ! Votre message a été envoyé. (Simulation)
                </div>
            `;
            messageBox.classList.remove('hidden');
            form.reset();

            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, 5000);
        });
    }
}
export default Contact;