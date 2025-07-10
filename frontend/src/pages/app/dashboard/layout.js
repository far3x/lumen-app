import { getUser, getAccount, fetchContributions, logout, fetchAndStoreUser, fetchAndStoreAccount, isAuthenticated, fetchClaims, api as authApi, fetchAllContributions, setAccount } from '../../../lib/auth.js';
import { updateBalancesInUI, renderModal } from './utils.js';
import { navigate } from '../../../router.js';
import { renderDashboardOverview, initializeChart, attachChartButtonListeners } from './overview.js';
import { renderMyContributionsPage, attachContributionPageListeners, contributionsState, resetContributionsState } from './my-contributions.js';
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
    allContributions: [],
    chartContributions: [],
    recentContributions: [],
    allClaims: [],
};
let activeTimeRange = 'all';

function renderSidebar(activeTab, user) {
    const sidebarButtons = [
        { id: 'overview', label: 'Dashboard', icon: icons.dashboard },
        { id: 'my-contributions', label: 'My Contributions', icon: icons.contributions },
        { id: 'network-feed', label: 'My Activity', icon: icons.feed },
        { id: 'referral', label: 'Refer a Dev', icon: icons.referral },
        { id: 'settings', label: 'Settings', icon: icons.settings },
    ];

    return `
    <div class="p-4 bg-surface rounded-xl border border-primary">
        <div class="text-center mb-6">
            <div class="w-20 h-20 rounded-full mx-auto mb-3 bg-surface p-4 border-2 border-primary flex items-center justify-center">
                <img src="/logo.png" alt="Lumen Logo" class="h-10 w-10">
            </div>
            <h3 class="font-bold text-lg text-text-main">${user?.display_name ?? 'User'}</h3>
            <a href="/leaderboard" class="font-semibold gradient-text hover:brightness-125 transition">View Leaderboard</a>
        </div>
        <nav class="flex flex-col space-y-1">
             ${sidebarButtons.map(btn => `
                <button id="sidebar-button-${btn.id}" data-tab="${btn.id}" class="sidebar-button flex-shrink-0 w-full text-left py-2.5 px-4 rounded-lg text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === btn.id ? 'bg-primary text-text-main' : 'text-text-secondary hover:bg-primary hover:text-text-main'}">
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

async function handleClaim(claimButton, user) {
    const account = getAccount();
    if (!account || account.lum_balance <= 0) return;

    claimButton.disabled = true;
    claimButton.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full"></span> Claiming...`;

    try {
        const response = await authApi.post('/rewards/claim');
        await fetchAndStoreAccount();
        dashboardState.account = getAccount();

        const txLink = `https://solscan.io/tx/${response.data.transaction_hash}?cluster=devnet`;
        const modalContent = `
            <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-green-900/50 text-green-300 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 class="font-bold text-lg text-white">Claim Successful!</h3>
                <p class="text-text-secondary mt-2 mb-4">${response.data.message}</p>
                <a href="${txLink}" target="_blank" rel="noopener noreferrer" class="font-medium text-accent-cyan hover:underline">View Transaction</a>
            </div>
        `;
        renderModal('Rewards Claimed', modalContent);

    } catch (error) {
        const errorMessage = error.response?.data?.detail || "An unknown error occurred.";
        const errorContent = `
             <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-red-900/50 text-red-300 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h3 class="font-bold text-lg text-white">Claim Failed</h3>
                <p class="text-text-secondary mt-2">${errorMessage}</p>
            </div>
        `;
        renderModal('Error', errorContent);
    } finally {
        updateBalancesInUI();
    }
}

async function refreshDashboardData(isInitialLoad = false) {
    const dashboardContentArea = document.getElementById('dashboard-content-area');

    if (isInitialLoad) {
        dashboardContentArea.innerHTML = `<div class="flex justify-center items-center h-64"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span><p class="ml-4 text-text-secondary">Loading dashboard data...</p></div>`;
    }

    try {
        const results = await Promise.allSettled([
            fetchAndStoreAccount(),
            authApi.get('/users/me/rank'),
            fetchContributions(1, 10),
            fetchClaims(1, 10),
            fetchAllContributions()
        ]);

        dashboardState.account = results[0].status === 'fulfilled' ? results[0].value : getAccount();
        dashboardState.userRank = results[1].status === 'fulfilled' ? results[1].value.data : null;
        
        if (results[2].status === 'fulfilled') {
            dashboardState.allContributions = results[2].value.items;
            contributionsState.totalContributions = results[2].value.total;
            contributionsState.isLastPage = (contributionsState.currentPage * 10) >= results[2].value.total;
        }

        dashboardState.allClaims = results[3].status === 'fulfilled' ? results[3].value.items : [];
        dashboardState.chartContributions = results[4].status === 'fulfilled' ? results[4].value : [];

        const urlParams = new URLSearchParams(window.location.search);
        const currentTabId = urlParams.get('tab') || 'overview';
        loadContent(currentTabId);
        updateBalancesInUI();

    } catch (error) {
        console.error("Dashboard data refresh failed:", error);
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

    userWebSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'pong') return;

        if (data.payload && data.payload.account) {
            setAccount(data.payload.account);
            updateBalancesInUI();
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
            contentHTML = renderMyContributionsPage(dashboardState.allContributions);
            break;
        case 'network-feed':
            contentHTML = renderRecentActivityPage(dashboardState.allContributions, dashboardState.allClaims);
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
        initializeChart(dashboardState.chartContributions, activeTimeRange);
        attachChartButtonListeners(dashboardState.chartContributions, (newRange) => {
            activeTimeRange = newRange;
            initializeChart(dashboardState.chartContributions, newRange);
        });
        const claimButton = document.getElementById('claim-rewards-btn');
        if (claimButton) {
            claimButton.addEventListener('click', () => handleClaim(claimButton, dashboardState.user));
        }
        updateBalancesInUI();
    }
    if (activeTabForRender === 'my-contributions') attachContributionPageListeners(dashboardState);
    if (activeTabForRender === 'settings') attachSettingsPageListeners(dashboardState);
    if (activeTabForRender === 'referral') document.getElementById('notify-referral-btn')?.addEventListener('click', handleReferralNotifyClick);
}

async function setupDashboard() {
    const dashboardContentArea = document.getElementById('dashboard-content-area');
    const dashboardSidebarArea = document.getElementById('dashboard-sidebar-area');

    if (dashboardSidebarArea && !dashboardSidebarArea.querySelector('.sidebar-button')) {
        dashboardSidebarArea.innerHTML = `<div class="flex justify-center items-center h-64"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span><p class="ml-4 text-text-secondary">Loading sidebar...</p></div>`;
    }
    dashboardContentArea.innerHTML = `<div class="flex justify-center items-center h-64"><span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span><p class="ml-4 text-text-secondary">Fetching account details...</p></div>`;

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
        if (account) updateBalancesInUI();

        await refreshDashboardData(true);

        connectUserWebSocket();

    } catch (error) {
        console.error("Dashboard setup failed globally:", error);
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
    <main class="flex-grow bg-abyss-dark pt-28">
        <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;">
          <defs>
            <linearGradient id="dashboard-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: #8A2BE2;" />
              <stop offset="50%" style="stop-color: #FF69B4;" />
              <stop offset="100%" style="stop-color: #00D9D9;" />
            </linearGradient>
          </defs>
        </svg>
        <div class="container mx-auto px-6 pb-20 flex flex-col lg:flex-row lg:gap-8 lg:items-start">
            <aside id="dashboard-sidebar-area" class="w-full lg:w-64 flex-shrink-0 mb-8 lg:mb-0">
                <div class="flex justify-center items-center h-64">
                    <span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span>
                </div>
            </aside>
            <div id="dashboard-content-area" class="flex-1 min-w-0">
                <div class="flex justify-center items-center h-64">
                    <span class="animate-spin inline-block w-8 h-8 border-4 border-transparent border-t-accent-purple rounded-full"></span>
                </div>
            </div>
        </div>
    </main>
    `;

    requestAnimationFrame(setupDashboard);
    return content;
}