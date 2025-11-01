import Layout from './components/Layout.js';
import AuthLayout from './components/AuthLayout.js';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Signup from './pages/Signup.js';
import Monitor from './pages/Monitor.js';
import Dashboard from './pages/Dashboard.js';
import Contact from './pages/Contact.js';
import NotFound from './pages/NotFound.js';

const routes = [
    { path: '/', page: Home, layout: Layout },
    { path: '/login', page: Login, layout: AuthLayout },
    { path: '/signup', page: Signup, layout: AuthLayout },
    { path: '/monitor', page: Monitor, layout: Layout, auth: true },
    { path: '/dashboard', page: Dashboard, layout: Layout, auth: true },
    { path: '/contact', page: Contact, layout: Layout },
];

const checkAuth = () => !!localStorage.getItem('accessToken');

export const router = async () => {
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: window.location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (!match) {
        match = {
            route: { path: '/404', page: NotFound, layout: Layout },
            isMatch: true
        };
    }

    if (match.route.auth && !checkAuth()) {
        history.pushState(null, null, '/login');
        return router();
    }
    
    if ((match.route.path === '/login' || match.route.path === '/signup') && checkAuth()) {
        history.pushState(null, null, '/monitor');
        return router();
    }

    const page = new match.route.page();
    const layout = new match.route.layout();
    
    document.querySelector('#app').innerHTML = await layout.render(await page.render());
    if (page.after_render) await page.after_render();
    if (layout.after_render) await layout.after_render();
};

export const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};