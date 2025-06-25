import axios from 'axios';
import { navigate } from '../router.js';
import { walletService } from './wallet.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    withCredentials: true,
});

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