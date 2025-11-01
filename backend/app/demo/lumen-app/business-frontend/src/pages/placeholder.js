export function renderPlaceholderPage(title) {
    return `
    <div class="container mx-auto px-6 py-32 text-center">
        <h1 class="text-4xl font-bold text-text-headings">${title}</h1>
        <p class="mt-4 text-lg text-text-body">This page is currently under construction.</p>
        <p class="text-text-muted">For more information, please <a href="#contact" class="text-primary-blue font-semibold hover:underline">contact our sales team</a>.</p>
    </div>
    `;
}