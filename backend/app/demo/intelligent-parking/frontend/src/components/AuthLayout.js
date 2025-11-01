class AuthLayout {
    async render(pageContent) {
        return `
            <div class="flex flex-col items-center justify-center min-h-screen p-4">
                <a href="/" data-link class="mb-8">
                    <img src="/src/assets/logo.svg" alt="Logo" class="h-12 w-12">
                </a>
                ${pageContent}
            </div>
        `;
    }
    async after_render() {}
}

export default AuthLayout;