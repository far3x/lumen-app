import Header from './Header.js';
import Footer from './Footer.js';

class Layout {
    async render(pageContent) {
        const header = new Header();
        const footer = new Footer();
        return `
            <div class="flex flex-col min-h-screen">
                ${await header.render()}
                <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    ${pageContent}
                </main>
                ${await footer.render()}
            </div>
            <!-- NEW: Placeholder for our easter egg canvas -->
            <div id="easter-egg-container"></div>
        `;
    }

    // --- NEW: Konami code easter egg logic ---
    triggerMatrixEasterEgg() {
        const existingCanvas = document.getElementById('matrix-canvas');
        if (existingCanvas) return; // Don't run if it's already active

        const container = document.getElementById('easter-egg-container');
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-canvas';
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const alphabet = katakana + latin + nums;

        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const rainDrops = Array.from({ length: columns }).map(() => 1);

        let animationFrameId;

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        // Cleanup function
        const cleanup = () => {
            cancelAnimationFrame(animationFrameId);
            canvas.remove();
            window.removeEventListener('resize', resizeHandler);
        };
        
        canvas.addEventListener('click', cleanup, { once: true });
        
        const resizeHandler = () => {
            // This is a simple reset on resize. Could be improved.
            cleanup();
            this.triggerMatrixEasterEgg();
        };
        window.addEventListener('resize', resizeHandler);
    }

    async after_render() {
        const header = new Header();
        if (header.after_render) await header.after_render();

        // --- NEW: Konami Code listener ---
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;
        const keyHandler = (event) => {
            if (event.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    this.triggerMatrixEasterEgg();
                    konamiIndex = 0; // Reset
                }
            } else {
                konamiIndex = 0;
            }
        };
        document.addEventListener('keydown', keyHandler);
    }
}

export default Layout;