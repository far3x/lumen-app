import './style.css';
import { router } from './router';

// This is the main entry point.
// It listens for DOM load and link clicks to handle SPA routing.

// Handle initial page load
document.addEventListener('DOMContentLoaded', () => {
    router();
});

// Handle navigation via link clicks
document.body.addEventListener('click', e => {
    if (e.target.matches('[data-link]')) {
        e.preventDefault();
        history.pushState(null, null, e.target.href);
        router();
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', router);