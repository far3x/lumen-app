import { renderSidebar } from '../../components/sidebar.js';
import { renderOverviewPage } from './overview.js';
import { renderDataExplorerPage, attachDataExplorerListeners } from './data-explorer.js';
import { renderApiKeysPage } from './api-keys.js';
import { renderPlansPage } from './plans.js';
import { renderTeamPage } from './team.js';
import { renderSettingsPage } from './settings.js';
import { stateService } from '../../lib/state.js';

const appRoutes = {
    '/app/overview': renderOverviewPage,
    '/app/data-explorer': renderDataExplorerPage,
    '/app/api-keys': renderApiKeysPage,
    '/app/plans': renderPlansPage,
    '/app/team': renderTeamPage,
    '/app/settings': renderSettingsPage,
};

const pageListeners = {
    '/app/data-explorer': attachDataExplorerListeners,
}

function attachEventListeners() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const mainContent = document.getElementById('main-content');
    const headerContent = document.getElementById('header-content');
    
    const loadContent = async (path) => {
        const pageKey = appRoutes[path] ? path : '/app/overview';
        const pageRenderer = appRoutes[pageKey] || renderOverviewPage;
        
        const { pageHtml, headerHtml } = await pageRenderer();
        mainContent.innerHTML = pageHtml;
        headerContent.innerHTML = headerHtml;

        sidebarLinks.forEach(link => {
            const linkPath = new URL(link.href, window.location.origin).pathname;
            if (linkPath === pageKey) {
                link.classList.add('bg-app-accent-hover', 'text-text-headings');
                link.querySelector('span:first-child')?.classList.remove('text-text-muted');
                link.querySelector('span:first-child')?.classList.add('text-primary');
            } else {
                link.classList.remove('bg-app-accent-hover', 'text-text-headings');
                link.querySelector('span:first-child')?.classList.add('text-text-muted');
                link.querySelector('span:first-child')?.classList.remove('text-primary');
            }
        });
        
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        if (pageListeners[pageKey]) {
            pageListeners[pageKey]();
        }
    };

    loadContent(window.location.pathname);

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const isLogout = e.currentTarget.id === 'logout-btn';
            if(isLogout) return;

            e.preventDefault();
            const path = new URL(e.currentTarget.href, window.location.origin).pathname;
            if (path !== window.location.pathname) {
                window.history.pushState({}, '', path);
                loadContent(path);
            }
        });
    });

    window.addEventListener('popstate', () => {
        loadContent(window.location.pathname);
    });

    // Subscribe to state changes to update the token balance on the overview page
    stateService.subscribe(currentState => {
        const tokenBalanceEl = document.getElementById('company-token-balance');
        if (tokenBalanceEl) {
            tokenBalanceEl.textContent = currentState.stats.token_balance.toLocaleString();
        }
    });
}

export function renderDashboardLayout() {
    setTimeout(attachEventListeners, 0);

    return `
        <div class="flex h-screen bg-app-bg">
            <aside class="w-60 flex-shrink-0 bg-app-surface border-r border-app-border">
                ${renderSidebar()}
            </aside>
            <div class="flex-1 flex flex-col overflow-hidden">
                <header id="header-content" class="h-16 flex-shrink-0 bg-app-surface border-b border-app-border flex items-center px-6">
                </header>
                <main id="main-content" class="flex-1 overflow-y-auto">
                </main>
            </div>
        </div>
    `;
}