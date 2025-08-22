import axios from 'axios';
import { navigate } from '../router.js';
import { walletService } from './wallet.js';
import { DateTime } from "luxon";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    withCredentials: true,
});

api.interceptors.response.use(
    response => response,
    async (error) => {
        if (error.response?.status === 403 && error.response.data.detail === 'USER_ON_WAITLIST') {
            return Promise.reject(error);
        }
        if (error.response?.status === 401) {
            console.log("Unauthorized, logging out.");
            await logout();
        }
        return Promise.reject(error);
    }
);

let user = null;
let account = null;

export const setAccount = (newAccountData) => {
    account = newAccountData;
    localStorage.setItem('lumen_account', JSON.stringify(account));
};

export const isAuthenticated = () => {
    return document.cookie.includes('is_logged_in=true');
};

export const getUser = () => {
    if (user) return user;
    const storedUser = localStorage.getItem('lumen_user');
    if (storedUser) {
        try {
            user = JSON.parse(storedUser);
            return user;
        } catch (e) {
            localStorage.removeItem('lumen_user');
            return null;
        }
    }
    return null;
};

export const getAccount = () => {
    if (account) return account;
    const storedAccount = localStorage.getItem('lumen_account');
    if (storedAccount) {
        try {
            account = JSON.parse(storedAccount);
            return account;
        } catch (e) {
            localStorage.removeItem('lumen_account');
            return null;
        }
    }
    return null;
};

export const register = (email, password, recaptcha_token) => {
    return api.post('/auth/register', { email, password, recaptcha_token });
};

export const login = (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    return api.post('/auth/token', params);
};

export const logout = async () => {
    try {
        await walletService.disconnect();
        await api.post('/auth/logout');
    } catch (error) {
        console.error("Logout API call failed, clearing client-side data anyway.", error);
    } finally {
        user = null;
        account = null;
        localStorage.removeItem('lumen_user');
        localStorage.removeItem('lumen_account');
        localStorage.removeItem('post_login_redirect');
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "is_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/login');
    }
};

export const fetchAndStoreUser = async () => {
    const response = await api.get('/users/me');
    user = response.data;
    localStorage.setItem('lumen_user', JSON.stringify(user));
    return user;
};

export const fetchAndStoreAccount = async () => {
    const response = await api.get('/users/me/balance');
    account = response.data;
    localStorage.setItem('lumen_account', JSON.stringify(account));
    return account;
};

export const validateAndRefreshUserSession = async () => {
    if (!isAuthenticated()) {
        return; 
    }

    try {
        const [userResponse, accountResponse] = await Promise.all([
            api.get('/users/me'),
            api.get('/users/me/balance')
        ]);

        const remoteUser = userResponse.data;
        user = remoteUser;
        localStorage.setItem('lumen_user', JSON.stringify(remoteUser));

        const remoteAccount = accountResponse.data;
        account = remoteAccount;
        localStorage.setItem('lumen_account', JSON.stringify(remoteAccount));
        
        console.log("User and account session state synced with backend.");
        
    } catch (error) {
        console.error("Session validation failed during startup. The API interceptor will handle logout.", error);
    }
};


export const updateUserProfile = async (displayName, isInLeaderboard) => {
    const response = await api.put('/users/me', {
        display_name: displayName,
        is_in_leaderboard: isInLeaderboard
    });
    user = response.data;
    localStorage.setItem('lumen_user', JSON.stringify(user));
    return user;
};

export const changePassword = (current_password, new_password) => {
    return api.post('/users/me/change-password', { current_password, new_password });
};

export const fetchLeaderboard = async () => {
    const response = await api.get('/leaderboard');
    return response.data;
};

export const fetchContributions = async (page = 1, limit = 10) => {
    const response = await api.get(`/users/me/contributions?skip=${(page - 1) * limit}&limit=${limit}`);
    return response.data;
};

export const fetchAllContributions = async () => {
    const response = await api.get(`/users/me/contributions/all`);
    return response.data;
};

export const fetchClaims = async (page = 1, limit = 10) => {
    const response = await api.get(`/users/me/claims?skip=${(page - 1) * limit}&limit=${limit}`);
    return response.data;
};

export const fetchRecentContributions = async (limit = 10) => {
    const response = await api.get(`/recent-contributions?limit=${limit}`);
    return response.data;
};

export const checkContributionStatus = (id) => {
    return api.get(`/cli/contributions/${id}/status`);
};

export async function updateAllBalances() {
    const account = getAccount();
    const user = getUser();
    if (!account || !user) return;

    let currentPrice = 0.001;
    try {
        const response = await api.get('/token-price/lumen');
        if (response.data && response.data.price_usd > 0) {
            currentPrice = response.data.price_usd;
        }
    } catch (e) {
        console.warn("Could not fetch live token price, using fallback.");
    }

    const claimableBalanceUSD = account.usd_balance ?? 0;
    const claimableBalanceLUM = claimableBalanceUSD / currentPrice;
    const lifetimeBalanceUSD = account.total_usd_earned ?? 0;
    const lifetimeBalanceLUM = lifetimeBalanceUSD / currentPrice;
    
    document.querySelectorAll('.navbar-user-balance').forEach(el => {
        el.textContent = `${claimableBalanceLUM.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $LUMEN`;
    });
    
    const overviewLifetimeEl = document.getElementById('overview-total-balance');
    if (overviewLifetimeEl) {
        overviewLifetimeEl.textContent = `${lifetimeBalanceLUM.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $LUMEN`;
    }

    const overviewTotalUsdEl = document.getElementById('overview-total-balance-usd');
    if (overviewTotalUsdEl) {
        overviewTotalUsdEl.textContent = `≈ $${lifetimeBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
    }

    const overviewClaimableEl = document.querySelector('#claim-button-area .pulse-text');
    if (overviewClaimableEl) {
        overviewClaimableEl.textContent = claimableBalanceLUM.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4});
    }
    
    const overviewClaimableUsdEl = document.getElementById('overview-claimable-balance-usd');
    if (overviewClaimableUsdEl) {
        overviewClaimableUsdEl.textContent = `≈ $${(claimableBalanceUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
    }
    
    const claimButton = document.getElementById('claim-rewards-btn');
    if(claimButton) {
        const subtextEl = document.getElementById('claim-rewards-btn-subtext');
        
        if (user.cooldown_until) {
            const now = DateTime.utc();
            const cooldownEnd = DateTime.fromISO(user.cooldown_until);
            if (now < cooldownEnd) {
                claimButton.disabled = true;
                claimButton.classList.add('opacity-50', 'cursor-not-allowed');
                const remaining = cooldownEnd.diff(now, ['days', 'hours']).normalize();
                if (subtextEl) subtextEl.textContent = `New account cooldown. You can claim in ${remaining.toFormat("d 'days,' h 'hours'")}.`;
                return;
            }
        }
        
        const isWalletLinked = !!user.solana_address;
        if (!isWalletLinked || claimableBalanceLUM <= 0) {
            claimButton.disabled = true;
            claimButton.classList.add('opacity-50', 'cursor-not-allowed');
            if (subtextEl) subtextEl.textContent = '';
            return;
        }

        const lastClaimTimestamp = account.last_claim_at ? new Date(account.last_claim_at).getTime() : 0;
        const cooldown = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const timeSinceLastClaim = now - lastClaimTimestamp;

        if (lastClaimTimestamp !== 0 && timeSinceLastClaim < cooldown) {
            claimButton.disabled = true;
            claimButton.classList.add('opacity-50', 'cursor-not-allowed');
            const remainingTime = cooldown - timeSinceLastClaim;
            const hours = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            if (subtextEl) subtextEl.textContent = `You can claim again in ${hours}h ${minutes}m.`;
        } else {
            claimButton.disabled = false;
            claimButton.classList.remove('opacity-50', 'cursor-not-allowed');
            if (subtextEl) subtextEl.textContent = '';
        }
    }
}