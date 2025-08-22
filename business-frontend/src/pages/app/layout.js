import { renderSidebar } from '../../components/sidebar.js';
import { renderOverviewPage } from './overview.js';
import { renderDataExplorerPage, attachDataExplorerListeners } from './data-explorer.js';
import { renderApiKeysPage } from './api-keys.js';
import { renderUsagePage, attachUsageListeners } from './usage.js';
import { renderTeamPage } from './team.js';
import { renderSettingsPage } from './settings.js';

const appRoutes = {
    '/app/overview': renderOverviewPage,
    '/app/data-explorer': renderDataExplorerPage,
    '/app/api-keys': renderApiKeysPage,
    '/app/usage': renderUsagePage,
    '/app/team': renderTeamPage,
    '/app/settings': renderSettingsPage,
};

const pageListeners = {
    '/app/data-explorer': attachDataExplorerListeners,
    '/app/usage': attachUsageListeners,
}

function attachEventListeners() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const mainContent = document.getElementById('main-content');
    const headerContent = document.getElementById('header-content');
    
    const loadContent = async (path) => {
        const pageKey = appRoutes[path] ? path : '/app/overview';
        const pageRenderer = appRoutes[pageKey] || renderOverviewPage;
        
        const { pageHtml, headerHtml } = pageRenderer();
        mainContent.innerHTML = pageHtml;
        headerContent.innerHTML = headerHtml;

        sidebarLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (linkPath === pageKey) {
                link.classList.add('bg-app-accent-hover', 'text-app-text-primary');
            } else {
                link.classList.remove('bg-app-accent-hover', 'text-app-text-primary');
            }
        });

        if (pageListeners[pageKey]) {
            pageListeners[pageKey]();
        }
    };

    loadContent(window.location.pathname);

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = new URL(e.currentTarget.href).pathname;
            if (path !== window.location.pathname) {
                window.history.pushState({}, '', path);
                loadContent(path);
            }
        });
    });

    window.addEventListener('popstate', () => {
        loadContent(window.location.pathname);
    });
}

export function renderDashboardLayout() {
    setTimeout(attachEventListeners, 0);

    return `
        <div class="flex h-screen bg-app-bg">
            <aside class="w-64 flex-shrink-0 bg-app-surface border-r border-app-border">
                ${renderSidebar()}
            </aside>
            <div class="flex-1 flex flex-col overflow-hidden">
                <header id="header-content" class="h-20 flex-shrink-0 bg-app-surface border-b border-app-border flex items-center px-8">
                </header>
                <main id="main-content" class="flex-1 overflow-y-auto">
                </main>
            </div>
        </div>
    `;
}