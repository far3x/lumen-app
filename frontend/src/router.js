import { renderNavbar, setupNavbarEventListeners } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderLandingPage } from './pages/landing.js';
import { renderLoginPage } from './pages/login.js';
import { renderSignupPage } from './pages/signup.js';
import { renderDocsLayout } from './pages/docs/layout.js';
import { renderDashboardLayout } from './pages/app/dashboard/layout.js';
import { renderLinkPage } from './pages/link.js';
import { renderPublicDashboard } from './pages/public_dashboard.js';
import { isAuthenticated, fetchAndStoreUser, getUser, logout } from './lib/auth.js';
import { renderCheckEmailPage } from './pages/check-email.js';
import { renderVerifyPage } from './pages/verify.js';
import { renderForgotPasswordPage } from './pages/forgot-password.js';
import { renderResetPasswordPage } from './pages/reset-password.js';

const app = document.getElementById('app');

const routes = {
    '/': renderLandingPage,
    '/login': renderLoginPage,
    '/signup': renderSignupPage,
    '/link': renderLinkPage,
    '/leaderboard': renderPublicDashboard,
    '/check-email': renderCheckEmailPage,
    '/verify': renderVerifyPage,
    '/forgot-password': renderForgotPasswordPage,
    '/reset-password': renderResetPasswordPage,
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

    const redirectPath = localStorage.getItem('post_login_redirect');
    if (isAuthenticated() && (path === '/login' || path === '/signup')) {
        if (redirectPath) {
            localStorage.removeItem('post_login_redirect');
            navigate(redirectPath);
        } else {
            navigate('/app/dashboard');
        }
        return;
    }

    if (!isAuthenticated() && (path.startsWith('/app') || path.startsWith('/link'))) {
        localStorage.setItem('post_login_redirect', path);
        navigate('/login');
        return;
    }

    let renderFunc = routes[path] || routes['/'];
    if (path.startsWith('/docs/')) {
        const pageId = path.split('/docs/')[1];
        renderFunc = () => renderDocsLayout(pageId);
    }
    
    const fullScreenPages = ['/link', '/check-email', '/verify', '/forgot-password', '/reset-password'];
    if (fullScreenPages.includes(path)) {
        app.innerHTML = await renderFunc();
    } else {
        const pageContent = await renderFunc();
        app.innerHTML = renderNavbar(path) + pageContent + renderFooter();
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

export const initializeRouter = async () => {
    if (isAuthenticated() && !getUser()) {
        try {
            await fetchAndStoreUser();
        } catch (error) {
            console.error("Session invalid, clearing state.", error);
            logout();
        }
    }

    window.addEventListener('popstate', handleLocation);
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (link && !link.hasAttribute('data-external') && link.hostname === window.location.hostname) {
             if (link.hash) return;
             e.preventDefault();
             if (window.location.pathname !== link.pathname || window.location.search !== link.search) {
                navigate(link.pathname + link.search);
             }
        }
    });
    
    handleLocation();
}