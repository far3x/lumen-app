import { renderNavbar, setupNavbarEventListeners } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderLandingPage } from './pages/landing.js';
import { renderLoginPage } from './pages/login.js';
import { renderSignupPage } from './pages/signup.js';
import { renderDocsLayout } from './pages/docs/layout.js';
import { renderDashboardLayout } from './pages/app/dashboard/layout.js';
import { renderLinkPage } from './pages/link.js';
import { renderPublicDashboard } from './pages/public_dashboard.js';
import { isAuthenticated, fetchAndStoreUser } from './lib/auth.js';

const app = document.getElementById('app');
const TOKEN_KEY = 'lumen_token'; 

const routes = {
    '/': renderLandingPage,
    '/login': renderLoginPage,
    '/signup': renderSignupPage,
    '/link': renderLinkPage,
    '/leaderboard': renderPublicDashboard,
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
    '/app/dashboard': renderDashboardLayout, 
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
        localStorage.setItem('post_login_redirect', path);
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
        app.innerHTML = renderNavbar(path) + await renderFunc() + renderFooter();
    }
    
    window.scrollTo(0, 0);
    
    requestAnimationFrame(() => {
        attachNavEventListeners();
        setupNavbarEventListeners();
    });
};

const attachNavEventListeners = () => {
    document.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname && !link.hasAttribute('data-external')) {
            link.addEventListener('click', e => {
                if (link.hash) {
                    return; 
                }
                e.preventDefault();
                if (window.location.pathname !== link.pathname || window.location.search !== link.search) {
                    navigate(link.pathname + link.search);
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
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigate(e.target.getAttribute('href'));
        }
    });
    handleLocation();
}