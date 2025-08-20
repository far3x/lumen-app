import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderLandingPage } from './pages/landing.js';
import { renderPlaceholderPage } from './pages/placeholder.js';

const contentContainer = document.getElementById('content-container');
const headerContainer = document.getElementById('header-container');
const footerContainer = document.getElementById('footer-container');

const routes = {
    '/': renderLandingPage,
    '/why-lumen': () => renderPlaceholderPage('Why Lumen?'),
    '/product': () => renderPlaceholderPage('Our Product'),
    '/docs': () => renderPlaceholderPage('Documentation'),
    '/about': () => renderPlaceholderPage('About Us'),
    '/login': () => renderPlaceholderPage('Login'),
    '/contact': () => renderPlaceholderPage('Contact Us'),
    '/signup': () => renderPlaceholderPage('Sign Up'),
};

export const navigate = (path) => {
    if (window.location.pathname === path) return;
    window.history.pushState({}, '', path);
    handleLocation();
};

const handleLocation = async () => {
    const path = window.location.pathname;
    
    if (path !== '/') {
        window.history.replaceState({}, '', '/');
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
        return;
    }

    const route = routes[path] || routes['/'];
    contentContainer.innerHTML = await route();
    
    const animatedElements = document.querySelectorAll('.scroll-animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scrolled-in');
            }
        });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));
};

export const initializeRouter = () => {
    headerContainer.innerHTML = renderHeader();
    footerContainer.innerHTML = renderFooter();
    handleLocation();
    
    window.addEventListener('popstate', handleLocation);

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || link.hasAttribute('data-external')) return;
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (link.hostname === window.location.hostname) {
            e.preventDefault();
            navigate(href);
        }
    });

    // REVISED: Header scroll behavior logic
    let lastScrollY = window.scrollY;
    const headerElement = document.getElementById('header-container');

    window.addEventListener('scroll', () => {
        if (headerElement) {
            const currentScrollY = window.scrollY;
            if (lastScrollY < currentScrollY && currentScrollY > 150) {
                // Scrolling down
                headerElement.classList.add('-translate-y-full');
            } else {
                // Scrolling up
                headerElement.classList.remove('-translate-y-full');
            }
            lastScrollY = currentScrollY;
        }
    });
};