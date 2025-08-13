import { renderNavbar, setupNavbarEventListeners, updateNavbarWalletState } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { isAuthenticated, fetchAndStoreUser, getUser, logout, validateAndRefreshUserSession } from './lib/auth.js';
import { walletService } from './lib/wallet.js';
import Lenis from 'lenis';
import { renderFeedbackModal } from './pages/app/dashboard/utils.js';
import { renderWaitlistPage, attachWaitlistPageListeners } from './pages/waitlist.js';
import { docPages } from './pages/docs/layout.js';
import { patchNotes } from './pages/patch-notes/layout.js';

const app = document.getElementById('app');
const navbarContainer = document.getElementById('navbar-container');
const contentContainer = document.getElementById('content-container');
const footerContainer = document.getElementById('footer-container');

const routes = {
    '/': () => import('./pages/landing.js').then(m => m.renderLandingPage()),
    '/data': () => import('./pages/data-hub.js').then(m => m.renderDataHubPage()),
    '/login': () => import('./pages/login.js').then(m => m.renderLoginPage()),
    '/signup': () => import('./pages/signup.js').then(m => m.renderSignupPage()),
    '/waitlist': () => Promise.resolve(renderWaitlistPage()),
    '/link': () => import('./pages/link.js').then(m => m.renderLinkPage()),
    '/leaderboard': () => import('./pages/public_dashboard.js').then(m => m.renderPublicDashboard()),
    '/check-email': () => import('./pages/check-email.js').then(m => m.renderCheckEmailPage()),
    '/verify': () => import('./pages/verify.js').then(m => m.renderVerifyPage()),
    '/forgot-password': () => import('./pages/forgot-password.js').then(m => m.renderForgotPasswordPage()),
    '/reset-password': () => import('./pages/reset-password.js').then(m => m.renderResetPasswordPage()),
    '/2fa-verify': () => import('./pages/2fa-verify.js').then(m => m.render2FAVerifyPage()),
    '/app/dashboard': () => import('./pages/app/dashboard/layout.js').then(m => m.renderDashboardLayout()),
};

const routeMeta = {
    '/': {
        title: 'Lumen Protocol | Monetize Your Code, Power AI | Get Rewarded for Your Work',
        description: 'Lumen Protocol rewards developers for their code. Use our secure CLI to contribute anonymized source code from your projects, earn rewards, and help power the next generation of AI.',
    },
    '/data': {
        title: 'Lumen Protocol | Acquire Premium AI Training Data',
        description: 'Access high-quality, anonymized source code datasets for AI training. Ethical, verifiable, and proprietary data to power your models.',
    },
    '/leaderboard': {
        title: 'Lumen Protocol | Contributor Leaderboard',
        description: 'See the top contributors powering the Lumen network and earning $LUM rewards.',
    },
    '/login': {
        title: 'Lumen Protocol | Login',
        description: 'Sign in to your Lumen account to access your dashboard and start contributing code.',
    },
    '/signup': {
        title: 'Lumen Protocol | Sign Up',
        description: 'Create a Lumen account to monetize your code and earn rewards.',
    },
    '/patch-notes': {
        title: 'Lumen Protocol | Patch Notes',
        description: 'Latest updates and changes to the Lumen Protocol CLI and platform.',
    },
};

function updateHeadMeta(meta) {
    const defaultMeta = routeMeta['/'];
    const finalMeta = { ...defaultMeta, ...meta };

    document.title = finalMeta.title;

    document.querySelector('meta[name="description"]').content = finalMeta.description;
    document.querySelector('meta[name="keywords"]').content = finalMeta.keywords || defaultMeta.keywords;
    
    const canonicalLink = document.getElementById('canonical-link');
    if (canonicalLink) {
        if (window.location.hostname.startsWith('docs.')) {
            canonicalLink.href = `https://docs.lumen.onl${window.location.pathname}`;
        } else {
            canonicalLink.href = `https://lumen.onl${window.location.pathname}`;
        }
    }
    document.getElementById('og-url-link').setAttribute('content', finalMeta.url);

    document.querySelector('meta[property="og:title"]').content = finalMeta.ogTitle || finalMeta.title;
    document.querySelector('meta[property="og:description"]').content = finalMeta.ogDescription || finalMeta.description;
    
    document.querySelector('meta[name="twitter:title"]').content = finalMeta.ogTitle || finalMeta.title;
    document.querySelector('meta[name="twitter:description"]').content = finalMeta.ogDescription || finalMeta.description;
}

export const navigate = (path) => {
    if (window.location.pathname === path) return;
    window.history.pushState({}, '', path);
    handleLocation();
}

const renderFullPageLoader = () => {
    return `
        <div class="flex-grow flex flex-col items-center justify-center">
            <img src="/logo.png" alt="Lumen Logo" class="h-16 w-16 mb-6 animate-pulse">
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
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

function attachIndependentScroll() {
    document.querySelectorAll('.independent-scroll').forEach(element => {
        element.addEventListener('wheel', event => {
            event.stopPropagation();
        });
    });
}

const handleLocation = async () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const fullScreenPages = ['/link', '/check-email', '/verify', '/forgot-password', '/reset-password', '/2fa-verify', '/waitlist'];
    
    if (path === '/docs' || path === '/docs/') {
        navigate('/docs/introduction');
        return;
    }

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
        const user = getUser();
        if (user && !user.has_beta_access && path !== '/waitlist') {
            navigate('/waitlist');
            return;
        }
        if (user && user.has_beta_access && path === '/waitlist') {
            navigate('/app/dashboard');
            return;
        }

        const redirectItem = localStorage.getItem('post_login_redirect');
        let redirectPath = null;
        if (redirectItem) {
            try {
                const redirectData = JSON.parse(redirectItem);
                if (redirectData.expires > Date.now()) {
                    redirectPath = redirectData.path;
                } else {
                    localStorage.removeItem('post_login_redirect');
                }
            } catch (e) {
                localStorage.removeItem('post_login_redirect');
            }
        }
        
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
            const redirectData = {
                path: path,
                expires: Date.now() + 3600 * 1000
            };
            localStorage.setItem('post_login_redirect', JSON.stringify(redirectData));
            navigate('/login');
            return;
        }

        let renderPromise;
        if (path.startsWith('/docs/')) {
            const pageId = path.split('/docs/')[1] || 'introduction';
            const pageMeta = docPages[pageId] || docPages['introduction'];
            updateHeadMeta({
                title: `Lumen Docs | ${pageMeta.title}`,
                description: `Documentation for Lumen Protocol: ${pageMeta.title}.`,
                url: `https://lumen.onl${path}`
            });
            renderPromise = import('./pages/docs/layout.js').then(m => m.renderDocsLayout(pageId));
        } else if (path.startsWith('/patch-notes')) {
             const noteId = path.split('/patch-notes/')[1] || Object.keys(patchNotes)[0];
             const noteMeta = patchNotes[noteId] || patchNotes[Object.keys(patchNotes)[0]];
             updateHeadMeta({
                title: `Lumen Patch Notes | ${noteMeta.title}`,
                description: `Release notes for ${noteMeta.date}: ${noteMeta.title}`,
                url: `https://lumen.onl${path}`
             });
            renderPromise = import('./pages/patch-notes/layout.js').then(m => m.renderPatchNotesLayout(noteId));
        } else {
            updateHeadMeta({ ...routeMeta[path], url: `https://lumen.onl${path}` });
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
            footerContainer.innerHTML = renderFooter(path);
        }

        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo(0, 0);
        }
        
        if (hash) {
            setTimeout(() => {
                const element = document.getElementById(hash.substring(1));
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 150);
        }
        
        requestAnimationFrame(() => {
            attachNavEventListeners();
            setupNavbarEventListeners();
            setupScrollAnimations();
            attachIndependentScroll();
            if (path === '/waitlist') {
                attachWaitlistPageListeners();
            }
        });

    } catch (error) {
        if (error.response?.data?.detail === 'USER_ON_WAITLIST') {
            await fetchAndStoreUser();
            navigate('/waitlist');
            return;
        }

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
    
    handleLocation();
    
    try {
        await validateAndRefreshUserSession();
    } catch (error) {
        console.error("Initial session validation threw an unhandled error:", error);
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
    }
}