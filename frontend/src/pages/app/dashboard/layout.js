import { getUser, getAccount, fetchLeaderboard, fetchContributions, fetchRecentContributions, logout, fetchAndStoreUser, fetchAndStoreAccount, isAuthenticated } from '../../../lib/auth.js';
import { updateBalancesInUI } from './utils.js';
import { navigate } from '../../../router.js';
import { renderDashboardOverview } from './overview.js';
import { renderMyContributionsPage, attachContributionPageListeners, contributionsState, resetContributionsState } from './my-contributions.js';
import { renderRecentActivityPage } from './network-feed.js';
import { renderReferralPage } from './referral.js';
import { renderSettingsPage, attachSettingsPageListeners } from './settings.js';
import { icons } from './utils.js';

let balancePoller = null;

let dashboardState = {
    user: null,
    account: null,
    userRank: null,
    allContributions: [],
    recentContributions: [],
};

function renderSidebar(activeTab, user) {
    const sidebarButtons = [
        { id: 'overview', label: 'Dashboard', icon: icons.dashboard },
        { id: 'my-contributions', label: 'My Contributions', icon: icons.contributions },
        { id: 'network-feed', label: 'Recent Activity', icon: icons.feed },
        { id: 'referral', label: 'Refer a Dev', icon: icons.referral },
        { id: 'settings', label: 'Settings', icon: icons.settings },
    ];

    return `
    <div class="p-4 bg-surface rounded-xl border border-primary">
        <div class="text-center mb-6">
            <div class="w-20 h-20 rounded-full mx-auto mb-3 bg-surface p-4 border-2 border-primary flex items-center justify-center">
                <img src="/logo.svg" alt="Lumen Logo" class="h-10 w-10">
            </div>
            <h3 class="font-bold text-lg text-text-main">${user?.display_name ?? 'User'}</h3>
            <a href="/leaderboard" class="text-xs text-accent-cyan hover:underline">View Leaderboard</a>
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

async function setupDashboard() {
    const dashboardContentArea = document.getElementById('dashboard-content-area');
    const dashboardSidebarArea = document.getElementById('dashboard-sidebar-area');
    if (!dashboardContentArea || !dashboardSidebarArea) return;

    const urlParams = new URLSearchParams(window.location.search);
    let currentTab = urlParams.get('tab') || 'overview';
    
    if (urlParams.get('status') === 'link_complete') {
        window.history.replaceState({}, document.title, "/app/dashboard?tab=settings&status=link_success");
        window.location.reload();
        return;
    }

    try {
        let user = getUser();
        let account = getAccount();

        if (isAuthenticated() && (!user || !account)) {
            [user, account] = await Promise.all([
                fetchAndStoreUser(),
                fetchAndStoreAccount()
            ]);
        }

        if (!user) {
            logout();
            navigate('/login');
            return;
        }

        if (user) {
            document.querySelectorAll('.navbar-user-display-name').forEach(el => {
                el.textContent = user.display_name ?? 'User';
            });
        }
        if (account) {
            const balanceFormatted = (account.lum_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            document.querySelectorAll('.navbar-user-balance').forEach(el => {
                 el.textContent = `${balanceFormatted} $LUM`;
            });
        }

        dashboardState.user = user;
        dashboardState.account = account;

        const results = await Promise.allSettled([
            fetchLeaderboard(),
            fetchContributions(1, 10),
            fetchRecentContributions()
        ]);
        
        dashboardState.userRank = results[0].status === 'fulfilled' ? results[0].value.current_user_rank : null;
        if (results[1].status === 'fulfilled') {
            dashboardState.allContributions = results[1].value.items;
            contributionsState.totalContributions = results[1].value.total;
            contributionsState.isLastPage = (1 * 10) >= results[1].value.total;
        } else {
             dashboardState.allContributions = [];
        }
        dashboardState.recentContributions = results[2].status === 'fulfilled' ? results[2].value : [];

        if (balancePoller) clearInterval(balancePoller);
    
        balancePoller = setInterval(async () => {
            try {
                const currentAccount = getAccount();
                const newAccount = await fetchAndStoreAccount();
                
                if (currentAccount && newAccount && currentAccount.lum_balance !== newAccount.lum_balance) {
                    updateBalancesInUI();
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    clearInterval(balancePoller);
                }
            }
        }, 15000);

    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
            navigate('/login');
        } else {
            console.error("Dashboard setup failed:", error);
            dashboardContentArea.innerHTML = `<div class="text-center p-8 text-text-secondary">Could not load dashboard data. Please try refreshing.</div>`;
        }
        return;
    }

    const loadContent = (tabId) => {
        resetContributionsState();

        let contentHTML = '';
        if (!dashboardState.user) {
            dashboardContentArea.innerHTML = `<div class="text-center p-8 text-text-secondary">Could not load user data. Please try refreshing.</div>`;
            return;
        }
        
        switch (tabId) {
            case 'overview':
                contentHTML = renderDashboardOverview(dashboardState.user, dashboardState.account, dashboardState.userRank?.rank, dashboardState.allContributions);
                break;
            case 'my-contributions':
                contentHTML = renderMyContributionsPage(dashboardState.allContributions);
                break;
            case 'network-feed':
                contentHTML = renderRecentActivityPage(dashboardState.recentContributions);
                break;
            case 'referral':
                contentHTML = renderReferralPage();
                break;
            case 'settings':
                contentHTML = renderSettingsPage(dashboardState.user);
                break;
            default:
                currentTab = 'overview';
                contentHTML = renderDashboardOverview(dashboardState.user, dashboardState.account, dashboardState.userRank?.rank, dashboardState.allContributions);
        }
        dashboardContentArea.innerHTML = contentHTML;
        
        if (tabId === 'my-contributions') attachContributionPageListeners(dashboardState.allContributions);
        if (tabId === 'settings') attachSettingsPageListeners(dashboardState);
        if (tabId === 'referral') document.getElementById('notify-referral-btn')?.addEventListener('click', renderReferralPage.handleNotifyClick);
    };

    const updateSidebar = (tabId) => {
        dashboardSidebarArea.innerHTML = renderSidebar(tabId, dashboardState.user);
        dashboardSidebarArea.querySelectorAll('.sidebar-button').forEach(button => {
            button.addEventListener('click', () => {
                const newTabId = button.dataset.tab;
                if(currentTab === newTabId) return;
                currentTab = newTabId;
                loadContent(newTabId);
                updateSidebar(newTabId); 
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('tab', newTabId);
                window.history.pushState({}, '', newUrl.pathname + newUrl.search);
            });
        });
    }

    updateSidebar(currentTab);
    loadContent(currentTab);
}

export function renderDashboardLayout() {
    const content = `
    <main class="flex-grow bg-abyss-dark pt-28">
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