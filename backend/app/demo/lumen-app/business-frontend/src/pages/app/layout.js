import { renderSidebar } from '../../components/sidebar.js';
import { renderOverviewPage } from './overview.js';
import { renderDataExplorerPage, attachDataExplorerListeners } from './data-explorer.js';
import { renderApiKeysPage } from './api-keys.js';
import { renderPlansPage } from './plans.js';
import { renderTeamPage } from './team.js';
import { renderSettingsPage } from './settings.js';
import { stateService } from '../../lib/state.js';
import api from '../../lib/api.js';
import { setAuthData } from '../../lib/auth.js';

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

function renderInvitationBanner(invite) {
    const container = document.getElementById('invitation-banner-container');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-primary text-white p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up">
            <p class="text-sm text-center sm:text-left">
                <strong>${invite.invited_by_name}</strong> invited you to join the <strong>${invite.company_name}</strong> team.
            </p>
            <div class="flex items-center gap-2 flex-shrink-0">
                <button id="decline-invite-btn" data-token="${invite.token}" class="btn btn-secondary !bg-app-bg/20 !text-white hover:!bg-app-bg/30 !border-0 text-xs px-3 py-1.5">Decline</button>
                <button id="accept-invite-btn" data-token="${invite.token}" class="btn btn-primary text-xs px-3 py-1.5">Accept</button>
            </div>
        </div>
    `;

    document.getElementById('accept-invite-btn').addEventListener('click', async (e) => {
        const token = e.currentTarget.dataset.token;
        const acceptBtn = e.currentTarget;
        const declineBtn = document.getElementById('decline-invite-btn');

        acceptBtn.disabled = true;
        declineBtn.disabled = true;
        acceptBtn.innerHTML = '...';
        
        try {
            const response = await api.post(`/business/team/invites/accept/${token}`);
            setAuthData(response.data);
            window.location.reload(); 
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to accept invite.');
            acceptBtn.disabled = false;
            declineBtn.disabled = false;
            acceptBtn.innerHTML = 'Accept';
        }
    });

    document.getElementById('decline-invite-btn').addEventListener('click', async (e) => {
        const token = e.currentTarget.dataset.token;
        e.currentTarget.disabled = true;
        document.getElementById('accept-invite-btn').disabled = true;

        try {
            await api.post(`/business/team/invites/decline/${token}`);
            container.innerHTML = '';
        } catch (error) {
            alert('Failed to decline invite.');
            e.currentTarget.disabled = false;
            document.getElementById('accept-invite-btn').disabled = false;
        }
    });
}

async function checkForPendingInvites() {
    try {
        const response = await api.get('/business/team/invites/pending');
        if (response.data && response.data.length > 0) {
            renderInvitationBanner(response.data[0]); 
        }
    } catch (error) {
        console.error('Failed to check for pending invites:', error);
    }
}

function attachEventListeners() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const mainContent = document.getElementById('main-content');
    const headerContent = document.getElementById('header-content');
    
    checkForPendingInvites();

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
        <div id="invitation-banner-container" class="fixed top-20 right-6 z-50 w-full max-w-lg"></div>
    `;
}