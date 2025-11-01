import { renderLandingPage } from './pages/landing.js';
import { renderWhyLumenPage } from './pages/why-lumen.js';
import { renderContactPage } from './pages/contact.js';
import { renderLoginPage } from './pages/login.js';
import { renderSignupPage } from './pages/signup.js';
import { renderVerifyPage } from './pages/verify.js';
import { renderPlaceholderPage } from './pages/placeholder.js';
import { renderCheckEmailPage } from './pages/check-email.js';
import { renderDashboardLayout } from './pages/app/layout.js';
import { renderHeader as renderMarketingHeader } from './components/header.js';
import { renderFooter as renderMarketingFooter } from './components/footer.js';
import { isAuthenticated } from './lib/auth.js';
import { stateService } from './lib/state.js';
import { renderProductPage } from './pages/product.js';
import { renderAcceptInvitePage } from './pages/accept-invite.js';
import { renderAboutPage } from './pages/about.js';
import { renderDocsLayout } from './pages/docs/layout.js';

const app = document.getElementById('app');
const headerContainer = document.getElementById('header-container');
const contentContainer = document.getElementById('content-container');
const footerContainer = document.getElementById('footer-container');

const appRouteRegex = /^\/app(\/.*)?$/;
const docsRouteRegex = /^\/docs(\/.*)?$/;

const marketingRoutes = {
    '/': renderLandingPage,
    '/why-lumen': renderWhyLumenPage,
    '/contact': renderContactPage,
    '/login': renderLoginPage,
    '/signup': renderSignupPage,
    '/verify': renderVerifyPage,
    '/check-email': renderCheckEmailPage,
    '/accept-invite': renderAcceptInvitePage,
    '/product': renderProductPage,
    '/about': renderAboutPage,
    '/privacy': () => renderPlaceholderPage('Privacy Policy'),
};

export const navigate = (path) => {
    if (window.location.pathname === path) return;
    window.history.pushState({}, '', path);
    handleLocation();
};

const handleLocation = async () => {
    stateService.init();
    const path = window.location.pathname;
    const isAppRoute = appRouteRegex.test(path);
    const isDocsRoute = docsRouteRegex.test(path);

    window.scrollTo(0, 0);

    if (isAppRoute) {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        await stateService.fetchDashboardStats();
        app.className = 'bg-app-bg text-text-body font-sans antialiased';
        headerContainer.innerHTML = '';
        footerContainer.innerHTML = '';
        contentContainer.className = '';
        contentContainer.innerHTML = await renderDashboardLayout();
    } else if (isDocsRoute) {
        const pageId = path.split('/docs/')[1] || 'introduction';
        app.className = 'relative min-h-screen flex flex-col bg-background text-text-body font-sans antialiased';
        headerContainer.innerHTML = renderMarketingHeader();
        footerContainer.innerHTML = renderMarketingFooter();
        contentContainer.className = 'flex-grow pt-24';
        contentContainer.innerHTML = await renderDocsLayout(pageId);
    }
    else {
        if (isAuthenticated() && (path === '/login' || path === '/signup')) {
            navigate('/app/overview');
            return;
        }
        app.className = 'relative min-h-screen flex flex-col bg-background text-text-body font-sans antialiased';
        headerContainer.innerHTML = renderMarketingHeader();
        footerContainer.innerHTML = renderMarketingFooter();
        contentContainer.className = 'flex-grow pt-24';
        const route = marketingRoutes[path] || marketingRoutes['/'];
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
    }
};

export const initializeRouter = () => {
    handleLocation();
    
    window.addEventListener('popstate', handleLocation);

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || link.hasAttribute('data-external')) return;
        const href = link.getAttribute('href');
        if (!href) return;

        if (href.startsWith('#')) {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        const targetUrl = new URL(href, window.location.origin);
        if (targetUrl.hostname === window.location.hostname) {
            e.preventDefault();
            navigate(href);
        }
    });
};