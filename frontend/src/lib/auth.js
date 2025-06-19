import axios from 'axios';

export const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1`,
    withCredentials: true,
});

let user = null;
let account = null;

try {
    const storedUser = localStorage.getItem('lumen_user');
    const storedAccount = localStorage.getItem('lumen_account');
    if (storedUser) user = JSON.parse(storedUser);
    if (storedAccount) account = JSON.parse(storedAccount);
} catch (e) {
    console.error("Could not parse stored user data", e);
    user = null;
    account = null;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export const isAuthenticated = () => {
    return getCookie('is_logged_in') === 'true';
};

export const register = async (email, password, recaptcha_token) => {
    return await api.post('/auth/register', { email, password, recaptcha_token });
};

export const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    return await api.post('/auth/token', formData);
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error("Logout failed, clearing client-side session anyway.", error);
    } finally {
        user = null;
        account = null;
        localStorage.removeItem('lumen_user');
        localStorage.removeItem('lumen_account');
    }
};

export const fetchAndStoreUser = async () => {
    try {
        if (!isAuthenticated()) {
            user = null;
            return null;
        }
        const response = await api.get('/users/me');
        user = response.data;
        localStorage.setItem('lumen_user', JSON.stringify(user));
        return user;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        user = null;
        localStorage.removeItem('lumen_user');
        return null;
    }
};

export const fetchAndStoreAccount = async () => {
    try {
        if (!isAuthenticated()) {
            account = null;
            return null;
        }
        const response = await api.get('/users/me/balance');
        account = response.data;
        localStorage.setItem('lumen_account', JSON.stringify(account));
        return account;
    } catch (error) {
        console.error("Failed to fetch account:", error);
        account = null;
        localStorage.removeItem('lumen_account');
        return null;
    }
};

export const getUser = () => user;
export const getAccount = () => account;

export const updateUserProfile = async (displayName, isInLeaderboard) => {
    const response = await api.put('/users/me', {
        display_name: displayName,
        is_in_leaderboard: isInLeaderboard
    });
    user = response.data;
    localStorage.setItem('lumen_user', JSON.stringify(user));
    return user;
};

export const changePassword = async (current_password, new_password) => {
    return await api.post('/users/me/change-password', { current_password, new_password });
};

export const fetchLeaderboard = async (limit = 100) => {
    const response = await api.get(`/leaderboard?limit=${limit}`);
    return response.data;
};

export const fetchContributions = async (page = 1, limit = 10) => {
    const response = await api.get(`/users/me/contributions?skip=${(page - 1) * limit}&limit=${limit}`);
    return response.data;
};

export const fetchRecentContributions = async () => {
    const response = await api.get('/recent-contributions');
    return response.data;
};