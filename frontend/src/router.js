import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderLandingPage } from './pages/landing.js';
import { renderLoginPage } from './pages/login.js';
import { renderSignupPage } from './pages/signup.js';
import { renderDocsLayout } from './pages/docs/layout.js';
import { renderDashboard } from './pages/app/dashboard.js';
import { renderLinkPage } from './pages/link.js';
import { isAuthenticated, fetchAndStoreUser } from './lib/auth.js';

const app = document.getElementById('app');
const TOKEN_KEY = 'lumen_token'; 

const routes = {
    '/': renderLandingPage,
    '/login': renderLoginPage,
    '/signup': renderSignupPage,
    '/link': renderLinkPage,
    '/docs/introduction': () => renderDocsLayout('introduction'),
    '/docs/why-lumen': () => renderDocsLayout('why-lumen'),
    '/docs/installation': () => renderDocsLayout('installation'),
    '/docs/authentication': () => renderDocsLayout('authentication'),
    '/docs/core-commands': () => renderDocsLayout('core-commands'),
    '/docs/contributing': () => renderDocsLayout('contributing'),
    '/docs/configuration': () => renderDocsLayout('configuration'),
    '/docs/security': () => renderDocsLayout('security'),
    '/docs/tokenomics': () => renderDocsLayout('tokenomics'),
    '/docs/governance': () => renderDocsLayout('governance'),
    '/docs/roadmap': () => renderDocsLayout('roadmap'),
    '/docs/faq': () => renderDocsLayout('faq'),
    '/app/dashboard': renderDashboard,
};

export const navigate = (path) => {
    window.history.pushState({}, '', path);
    handleLocation();
}

const handleLocation = async () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path === '/link' && !isAuthenticated()) {
        localStorage.setItem('post_login_redirect', '/link');
        navigate('/login');
        return;
    }

    if (path === '/auth/callback' && params.has('token')) {
        const token = params.get('token');
        localStorage.setItem(TOKEN_KEY, token);
        await fetchAndStoreUser();
        
        const redirectPath = params.get('redirect_to') || localStorage.getItem('post_login_redirect');
        if (redirectPath) {
            localStorage.removeItem('post_login_redirect');
            navigate(redirectPath);
        } else {
            navigate('/app/dashboard');
        }
        return;
    }

    if (path.startsWith('/app') && !isAuthenticated()) {
        navigate('/login');
        return;
    }

    if ((path === '/login' || path === '/signup') && isAuthenticated()) {
        const redirectPath = localStorage.getItem('post_login_redirect');
         if (redirectPath === '/link') {
            localStorage.removeItem('post_login_redirect');
            navigate(redirectPath);
            return;
        }
        navigate('/app/dashboard');
        return;
    }
    
    const renderFunc = routes[path] || routes['/'];
    if (path === '/link') {
        app.innerHTML = await renderFunc();
    } else {
        app.innerHTML = renderNavbar() + await renderFunc() + renderFooter();
    }
    
    window.scrollTo(0, 0);
    
    attachNavEventListeners();
};

const attachNavEventListeners = () => {
    document.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname && !link.hasAttribute('data-external')) {
            link.addEventListener('click', e => {
                if (link.hash) {
                    return;
                }
                e.preventDefault();
                if (window.location.pathname !== link.pathname) {
                    navigate(link.pathname);
                }
            });
        }
    });

    const docsMobileNavTrigger = document.getElementById('docs-mobile-trigger');
    const mobilePanel = document.getElementById('docs-mobile-panel');
    const mobileOverlay = document.getElementById('docs-mobile-overlay');
    const mobileCloseBtn = document.getElementById('docs-mobile-close');

    const toggleMobileDocsNav = () => {
        if (mobilePanel && mobileOverlay) {
            mobilePanel.classList.toggle('-translate-x-full');
            mobileOverlay.classList.toggle('hidden');
        }
    };

    if (docsMobileNavTrigger) docsMobileNavTrigger.addEventListener('click', toggleMobileDocsNav);
    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', toggleMobileDocsNav);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMobileDocsNav);

    if (mobilePanel) {
        mobilePanel.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (!mobilePanel.classList.contains('-translate-x-full')) {
                    toggleMobileDocsNav();
                }
            });
        });
    }
}

export const initializeRouter = () => {
    window.addEventListener('popstate', handleLocation);
    handleLocation();
}