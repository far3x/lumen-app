import { renderNavbar, setupNavbarEventListeners, updateNavbarWalletState } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { isAuthenticated, fetchAndStoreUser, getUser, logout } from './lib/auth.js';
import { walletService } from './lib/wallet.js';
import Lenis from 'lenis';
import { renderFeedbackModal } from './pages/app/dashboard/utils.js';

const app = document.getElementById('app');
const navbarContainer = document.getElementById('navbar-container');
const contentContainer = document.getElementById('content-container');
const footerContainer = document.getElementById('footer-container');

const routes = {
    '/': () => import('./pages/landing.js').then(m => m.renderLandingPage()),
    '/data': () => import('./pages/data-hub.js').then(m => m.renderDataHubPage()),
    '/login': () => import('./pages/login.js').then(m => m.renderLoginPage()),
    '/signup': () => import('./pages/signup.js').then(m => m.renderSignupPage()),
    '/link': () => import('./pages/link.js').then(m => m.renderLinkPage()),
    '/leaderboard': () => import('./pages/public_dashboard.js').then(m => m.renderPublicDashboard()),
    '/check-email': () => import('./pages/check-email.js').then(m => m.renderCheckEmailPage()),
    '/verify': () => import('./pages/verify.js').then(m => m.renderVerifyPage()),
    '/forgot-password': () => import('./pages/forgot-password.js').then(m => m.renderForgotPasswordPage()),
    '/reset-password': () => import('./pages/reset-password.js').then(m => m.renderResetPasswordPage()),
    '/2fa-verify': () => import('./pages/2fa-verify.js').then(m => m.render2FAVerifyPage()),
    '/app/dashboard': () => import('./pages/app/dashboard/layout.js').then(m => m.renderDashboardLayout()),
};

export const navigate = (path) => {
    if (window.location.pathname === path) return;
    window.history.pushState({}, '', path);
    handleLocation();
}

const renderFullPageLoader = () => {
    return `
        <div class="flex-grow flex flex-col items-center justify-center">
            <img src="/logo.svg" alt="Lumen Logo" class="h-16 w-16 mb-6 animate-pulse">
            <span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span>
            <p class="text-text-secondary mt-4 text-sm">Loading Lumen...</p>
        </div>
    `;
};

function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-animate');
    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scrolled-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

const handleLocation = async () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const fullScreenPages = ['/link', '/check-email', '/verify', '/forgot-password', '/reset-password', '/2fa-verify'];

    contentContainer.classList.add('page-transition-out');
    footerContainer.classList.add('page-transition-out');

    await new Promise(resolve => setTimeout(resolve, 200));

    if (fullScreenPages.includes(path)) {
        navbarContainer.classList.add('hidden');
        footerContainer.classList.add('hidden');
        contentContainer.innerHTML = renderFullPageLoader();
    } else {
        navbarContainer.classList.remove('hidden');
        footerContainer.classList.remove('hidden');
        contentContainer.innerHTML = `<div class="flex-grow flex items-center justify-center"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span></div>`;
        footerContainer.innerHTML = '';
    }

    try {
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
        } else if (path.startsWith('/patch-notes')) {
            const versionId = path.split('/patch-notes/')[1] || Object.keys(await import('./pages/patch-notes/layout.js').then(m => m.patchNotes || {}))[0] || 'v1.0.2';
            renderPromise = import('./pages/patch-notes/layout.js').then(m => m.renderPatchNotesLayout(versionId));
        } else {
            const routeHandler = routes[path] || routes['/'];
            if (typeof routeHandler !== 'function') {
                console.error(`No route handler found for path: ${path}. Defaulting to home.`);
                renderPromise = routes['/']();
            } else {
                renderPromise = routeHandler();
            }
        }
        
        const pageContentHTML = await renderPromise;
        
        contentContainer.innerHTML = pageContentHTML;

        if (!fullScreenPages.includes(path)) {
            navbarContainer.innerHTML = renderNavbar(path);
            footerContainer.innerHTML = renderFooter();
        }

        if (hash) {
            setTimeout(() => {
                const element = document.getElementById(hash.substring(1));
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 150);
        } else {
            window.scrollTo(0, 0);
        }
        
        requestAnimationFrame(() => {
            attachNavEventListeners();
            setupNavbarEventListeners();
            setupScrollAnimations();
        });

    } catch (error) {
        console.error("Critical rendering error in handleLocation:", error);
        contentContainer.innerHTML = `
            <div class="flex-grow flex flex-col items-center justify-center text-center p-8">
                <h1 class="text-2xl font-bold text-red-400">Application Error</h1>
                <p class="text-text-secondary mt-2">A critical error occurred while loading the page.</p>
                <p class="mt-4 text-xs font-mono bg-primary p-4 rounded-lg text-red-300 w-full max-w-lg overflow-x-auto">${error.message || 'Unknown error'}</p>
                <button onclick="location.reload()" class="mt-6 px-6 py-2 bg-accent-purple text-white font-bold rounded-lg">Refresh Page</button>
            </div>
        `;
    } finally {
        contentContainer.classList.remove('page-transition-out');
        footerContainer.classList.remove('page-transition-out');
    }
};

const attachNavEventListeners = () => {
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

export let lenis;

export const initializeRouter = async () => {
    lenis = new Lenis();
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    walletService.on('connect', (publicKey) => {
        updateNavbarWalletState();
        const connectEvent = new CustomEvent('walletUpdate');
        document.dispatchEvent(connectEvent);
    });

    walletService.on('disconnect', () => {
        window.location.reload();
    });

    walletService.autoConnect().catch(err => console.warn("Auto-connect failed:", err));
    
    try {
        if (isAuthenticated() && !getUser()) {
            fetchAndStoreUser().catch(err => {
                console.error("Failed to fetch user on init, logging out:", err);
                logout();
                handleLocation();
            });
        }
    } catch (error) {
        console.error("Initial auth check error:", error);
        logout();
    } finally {
        window.addEventListener('popstate', handleLocation);
        
        document.body.addEventListener('click', (e) => {
            let link = e.target.closest('a[href]');

            if (e.target.closest('#feedback-button')) {
                e.preventDefault();
                renderFeedbackModal();
                return;
            }
            
            if (!link || link.hasAttribute('data-external') || link.hostname !== window.location.hostname) {
                return;
            }

            const currentUrl = new URL(window.location.href);
            const targetUrl = new URL(link.href);

            if (targetUrl.pathname.startsWith('/patch-notes')) {
                e.preventDefault();
                navigate(targetUrl.pathname);
                return;
            }
            
            if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search && targetUrl.hash) {
                e.preventDefault();
                lenis.scrollTo(targetUrl.hash);
                window.history.pushState(null, '', targetUrl.pathname + targetUrl.search + targetUrl.hash);
                return;
            }
            
            if (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search) {
                e.preventDefault();
                navigate(targetUrl.pathname + targetUrl.search);
            }
        });
        
        handleLocation();
    }
}