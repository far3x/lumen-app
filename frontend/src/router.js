import { renderNavbar, setupNavbarEventListeners, updateNavbarWalletState } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { isAuthenticated, fetchAndStoreUser, getUser, logout } from './lib/auth.js';
import { walletService } from './lib/wallet.js';

const app = document.getElementById('app');

const routes = {
    '/': () => import('./pages/landing.js').then(m => m.renderLandingPage()),
    '/login': () => import('./pages/login.js').then(m => m.renderLoginPage()),
    '/signup': () => import('./pages/signup.js').then(m => m.renderSignupPage()),
    '/link': () => import('./pages/link.js').then(m => m.renderLinkPage()),
    '/leaderboard': () => import('./pages/public_dashboard.js').then(m => m.renderPublicDashboard()),
    '/check-email': () => import('./pages/check-email.js').then(m => m.renderCheckEmailPage()),
    '/verify': () => import('./pages/verify.js').then(m => m.renderVerifyPage()),
    '/forgot-password': () => import('./pages/forgot-password.js').then(m => m.renderForgotPasswordPage()),
    '/reset-password': () => import('./pages/reset-password.js').then(m => m.renderResetPasswordPage()),
    '/app/dashboard': () => import('./pages/app/dashboard/layout.js').then(m => m.renderDashboardLayout()),
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

    let renderPromise;
    if (path.startsWith('/docs/')) {
        const pageId = path.split('/docs/')[1] || 'introduction';
        renderPromise = import('./pages/docs/layout.js').then(m => m.renderDocsLayout(pageId));
    } else {
        const routeHandler = routes[path] || routes['/'];
        renderPromise = routeHandler();
    }
    
    const fullScreenPages = ['/link', '/check-email', '/verify', '/forgot-password', '/reset-password'];
    
    // Show a loading indicator for smoother navigation
    if (!fullScreenPages.includes(path)) {
        app.innerHTML = renderNavbar(path) + `<div class="flex-grow flex items-center justify-center"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span></div>` + renderFooter();
    } else {
        app.innerHTML = `<div class="flex-grow flex items-center justify-center min-h-screen"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span></div>`;
    }

    if (fullScreenPages.includes(path)) {
        app.innerHTML = await renderPromise;
    } else {
        const pageContent = await renderPromise;
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
    walletService.on('connect', (publicKey) => {
        updateNavbarWalletState();
        const connectEvent = new CustomEvent('walletUpdate');
        document.dispatchEvent(connectEvent);
    });

    walletService.on('disconnect', () => {
        updateNavbarWalletState();
        const disconnectEvent = new CustomEvent('walletUpdate');
        document.dispatchEvent(disconnectEvent);
    });

    await walletService.autoConnect();
    
    try {
        if (isAuthenticated() && !getUser()) {
            await fetchAndStoreUser();
        }
    } catch (error) {
        console.error("Session invalid, clearing state.", error);
        logout();
    } finally {
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
}