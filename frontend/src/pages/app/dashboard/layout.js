import { getUser, getAccount, fetchContributions, logout, fetchAndStoreUser, fetchAndStoreAccount, isAuthenticated, fetchPayouts, api as authApi, fetchAllContributions, setAccount, updateAllBalances } from '../../../lib/auth.js';
import { renderModal } from './utils.js';
import { navigate } from '../../../router.js';
import { renderDashboardOverview, initializeChart, attachChartButtonListeners } from './overview.js';
import { renderMyContributionsPage, attachContributionPageListeners, contributionsState, resetContributionsState } from './my-contributions.js';
import { renderWebContributePage, attachWebContributeListeners, cleanupWebContribute } from './web-contribute.js';
import { renderRecentActivityPage } from './network-feed.js';
import { renderReferralPage, handleReferralNotifyClick } from './referral.js';
import { renderSettingsPage, attachSettingsPageListeners } from './settings.js';
import { icons } from './utils.js';

let userWebSocket = null;
let pingInterval = null;
let dashboardState = {
    user: null,
    account: null,
    userRank: null,
    paginatedContributions: [],
    allUserContributions: [],
    allPayouts: [],
};
let activeTimeRange = 'all';

function renderSidebar(activeTab, user) {
    const sidebarButtons = [
        { id: 'overview', label: 'Dashboard', icon: icons.dashboard },
        { id: 'my-contributions', label: 'History', icon: icons.contributions },
        { id: 'web-contribute', label: 'Web Contribute', icon: icons.upload },
        { id: 'network-feed', label: 'My Activity', icon: icons.feed },
        { id: 'referral', label: 'Refer a Dev', icon: icons.referral },
        { id: 'settings', label: 'Settings', icon: icons.settings },
    ];

    return `
    <div class="p-4 bg-surface rounded-lg border border-primary">
        <div class="text-center mb-6">
            <img src="/logo.png" alt="Lumen Logo" class="h-12 w-12 mx-auto mb-4">
            <h3 class="font-bold text-lg text-text-main">${user?.display_name ?? 'User'}</h3>
            <a href="/leaderboard" class="font-semibold text-accent-primary hover:text-red-700 transition">View Leaderboard</a>
        </div>
        <nav class="flex flex-col space-y-1">
             ${sidebarButtons.map(btn => `
                <button id="sidebar-button-${btn.id}" data-tab="${btn.id}" class="sidebar-button flex-shrink-0 w-full text-left py-2.5 px-4 rounded-md text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === btn.id ? 'bg-primary text-text-main' : 'text-text-secondary hover:bg-primary hover:text-text-main'}">
                    ${btn.icon}
                    <span>${btn.label}</span>
                </button>
             `).join('')}
        </nav>
    </div>
    `;
}

function updateSidebarUI(activeTab) {
    const dashboardSidebarArea = document.getElementById('dashboard-sidebar-area');
    if (!dashboardSidebarArea || !dashboardState.user) return;

    dashboardSidebarArea.innerHTML = renderSidebar(activeTab, dashboardState.user);
    dashboardSidebarArea.querySelectorAll('.sidebar-button').forEach(button => {
        button.removeEventListener('click', handleSidebarButtonClick);
        button.addEventListener('click', handleSidebarButtonClick);
    });
}

function handleSidebarButtonClick(event) {
    const newTabId = event.currentTarget.dataset.tab;
    const urlParams = new URLSearchParams(window.location.search);
    const currentTab = urlParams.get('tab') || 'overview';

    if (currentTab === newTabId) return;
    
    loadContent(newTabId);
    updateSidebarUI(newTabId);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', newTabId);
    window.history.pushState({}, '', newUrl.pathname + newUrl.search);
}

async function refreshDashboardData(isInitialLoad = false) {
    const dashboardContentArea = document.getElementById('dashboard-content-area');

    if (isInitialLoad) {
        dashboardContentArea.innerHTML = `<div class="flex justify-center items-center h-64"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-primary rounded-full"></span><p class="ml-4 text-text-secondary">Loading dashboard data...</p></div>`;
    }

    try {
        const results = await Promise.allSettled([
            fetchAndStoreAccount(),
            authApi.get('/users/me/rank'),
            fetchContributions(1, 10),
            fetchPayouts(1, 10),
            fetchAllContributions()
        ]);

        dashboardState.account = results[0].status === 'fulfilled' ? results[0].value : getAccount();
        dashboardState.userRank = results[1].status === 'fulfilled' ? results[1].value.data : null;
        
        if (results[2].status === 'fulfilled') {
            dashboardState.paginatedContributions = results[2].value.items;
            contributionsState.totalContributions = results[2].value.total;
            contributionsState.isLastPage = (contributionsState.currentPage * 10) >= results[2].value.total;
        }

        dashboardState.allPayouts = results[3].status === 'fulfilled' ? results[3].value : [];
        dashboardState.allUserContributions = results[4].status === 'fulfilled' ? results[4].value : [];

        const urlParams = new URLSearchParams(window.location.search);
        const currentTabId = urlParams.get('tab') || 'overview';
        loadContent(currentTabId);
        updateAllBalances();

    } catch (error) {
        if (dashboardContentArea) {
            dashboardContentArea.innerHTML = `<div class="text-center p-8 text-red-400">Could not refresh dashboard data. Some features might be unavailable.</div>`;
        }
    }
}

function connectUserWebSocket() {
    if (userWebSocket && userWebSocket.readyState === WebSocket.OPEN) {
        return;
    }
    if (pingInterval) clearInterval(pingInterval);

    const apiUrlString = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const apiUrl = new URL(apiUrlString);
    const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${apiUrl.host}/ws/user/updates`;
        
    userWebSocket = new WebSocket(wsUrl);

    userWebSocket.onopen = () => {
        pingInterval = setInterval(() => {
            if (userWebSocket.readyState === WebSocket.OPEN) {
                userWebSocket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);
    };

    userWebSocket.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'pong') return;

        if (data.payload && data.payload.account) {
            setAccount(data.payload.account);
            updateAllBalances();
        }

        if (data.type === 'contribution_update') {
            document.dispatchEvent(new CustomEvent('contributionUpdate', { detail: data.payload.contribution }));
            if (data.payload.contribution.status === 'PROCESSED' || data.payload.contribution.status === 'REJECTED_NO_NEW_CODE') {
                refreshDashboardData();
            }
        }
    };

    userWebSocket.onclose = (event) => {
        if (pingInterval) clearInterval(pingInterval);
        if (!event.wasClean) {
            setTimeout(connectUserWebSocket, 5000);
        }
    };

    userWebSocket.onerror = (error) => {
        userWebSocket.close();
    };
}

function disconnectUserWebSocket() {
    if (pingInterval) clearInterval(pingInterval);
    pingInterval = null;
    if (userWebSocket) {
        userWebSocket.onclose = null;
        userWebSocket.close();
        userWebSocket = null;
    }
}

function loadContent(tabId) {
    const dashboardContentArea = document.getElementById('dashboard-content-area');
    if (!dashboardContentArea) return;

    resetContributionsState();
    
    const urlParams = new URLSearchParams(window.location.search);
    const currentTab = urlParams.get('tab') || 'overview';
    if (currentTab === 'web-contribute' && tabId !== 'web-contribute') {
        cleanupWebContribute();
    }

    let contentHTML = '';
    if (!dashboardState.user) {
        dashboardContentArea.innerHTML = `<div class="text-center p-8 text-text-secondary">User data not available. Please try refreshing.</div>`;
        return;
    }
    
    const activeTabForRender = tabId || 'overview';

    switch (activeTabForRender) {
        case 'overview':
            contentHTML = renderDashboardOverview(dashboardState.user, dashboardState.account, dashboardState.userRank?.rank, contributionsState.totalContributions);
            break;
        case 'my-contributions':
            contentHTML = renderMyContributionsPage(dashboardState.paginatedContributions);
            break;
        case 'web-contribute':
            contentHTML = renderWebContributePage(dashboardState);
            break;
        case 'network-feed':
            contentHTML = renderRecentActivityPage(dashboardState.paginatedContributions, dashboardState.allPayouts);
            break;
        case 'referral':
            contentHTML = renderReferralPage();
            break;
        case 'settings':
            contentHTML = renderSettingsPage(dashboardState.user);
            break;
        default:
            const defaultTab = 'overview';
            window.history.replaceState({}, '', `?tab=${defaultTab}`);
            contentHTML = renderDashboardOverview(dashboardState.user, dashboardState.account, dashboardState.userRank?.rank, contributionsState.totalContributions);
    }
    dashboardContentArea.innerHTML = contentHTML;
    
    if (activeTabForRender === 'overview') {
        initializeChart(dashboardState.allUserContributions, activeTimeRange);
        attachChartButtonListeners(dashboardState.allUserContributions, (newRange) => {
            activeTimeRange = newRange;
            initializeChart(dashboardState.allUserContributions, newRange);
        });
        updateAllBalances();
    }
    if (activeTabForRender === 'my-contributions') attachContributionPageListeners(dashboardState);
    if (activeTabForRender === 'web-contribute') attachWebContributeListeners(dashboardState);
    if (activeTabForRender === 'settings') attachSettingsPageListeners(dashboardState);
    if (activeTabForRender === 'referral') document.getElementById('notify-referral-btn')?.addEventListener('click', handleReferralNotifyClick);
}

async function setupDashboard() {
    const dashboardContentArea = document.getElementById('dashboard-content-area');
    const dashboardSidebarArea = document.getElementById('dashboard-sidebar-area');

    if (dashboardSidebarArea && !dashboardSidebarArea.querySelector('.sidebar-button')) {
        dashboardSidebarArea.innerHTML = `<div class="flex justify-center items-center h-64"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-primary rounded-full"></span></div>`;
    }
    dashboardContentArea.innerHTML = `<div class="flex justify-center items-center h-64"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-primary rounded-full"></span><p class="ml-4 text-text-secondary">Fetching account details...</p></div>`;

    const urlParams = new URLSearchParams(window.location.search);
    let currentTabId = urlParams.get('tab') || 'overview';

    if (urlParams.get('status') === 'link_complete') {
        window.history.replaceState({}, document.title, "/app/dashboard?tab=settings&status=link_success");
        window.location.reload();
        return;
    }

    try {
        if (!isAuthenticated()) {
            logout();
            return;
        }

        const [user, account] = await Promise.all([
            fetchAndStoreUser(),
            fetchAndStoreAccount()
        ]);
        
        dashboardState.user = user;
        dashboardState.account = account;
        
        updateSidebarUI(currentTabId);
        
        document.querySelectorAll('.navbar-user-display-name').forEach(el => el.textContent = user.display_name ?? 'User');
        if (account) updateAllBalances();

        await refreshDashboardData(true);

        connectUserWebSocket();

    } catch (error) {
        if (error.response && error.response.status === 401) {
           logout();
           return;
        }
        if (dashboardContentArea) {
           dashboardContentArea.innerHTML = `<div class="text-center p-8 text-red-400">Could not load all dashboard data. Some features might be unavailable. Error: ${error.message}</div>`;
        }
        return;
    }
}

export function renderDashboardLayout() {
    activeTimeRange = 'all';
    disconnectUserWebSocket();
    const content = `
    <main class="flex-grow bg-background pt-28">
        <div class="container mx-auto px-6 pb-20 flex flex-col lg:flex-row lg:gap-8 lg:items-start">
            <aside id="dashboard-sidebar-area" class="w-full lg:w-64 flex-shrink-0 mb-8 lg:mb-0">
                <div class="flex justify-center items-center h-64">
                    <span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-primary rounded-full"></span>
                </div>
            </aside>
            <div id="dashboard-content-area" class="flex-1 min-w-0">
                <div class="flex justify-center items-center h-64">
                    <span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-primary rounded-full"></span>
                </div>
            </div>
        </div>
    </main>
    `;

    requestAnimationFrame(setupDashboard);
    return content;
}