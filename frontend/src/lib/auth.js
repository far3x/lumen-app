import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'lumen_token';
const USER_KEY = 'lumen_user';
const ACCOUNT_KEY = 'lumen_account';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

export const isAuthenticated = () => !!getToken();
export const getUser = () => JSON.parse(localStorage.getItem(USER_KEY));
export const getAccount = () => JSON.parse(localStorage.getItem(ACCOUNT_KEY));

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCOUNT_KEY);
};

export const fetchAndStoreUser = async () => {
    if (!isAuthenticated()) return null;
    try {
        const [userRes, accountRes] = await Promise.all([
            axios.get(`${API_URL}/api/v1/users/me`, { headers: getAuthHeaders() }),
            axios.get(`${API_URL}/api/v1/users/me/balance`, { headers: getAuthHeaders() })
        ]);
        localStorage.setItem(USER_KEY, JSON.stringify(userRes.data));
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accountRes.data));
        return userRes.data;
    } catch (error) {
        console.error("Failed to fetch user data, logging out:", error);
        logout();
        return null;
    }
};

export const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/api/v1/auth/token`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    await fetchAndStoreUser();
};

export const register = async (email, password) => {
    return axios.post(`${API_URL}/api/v1/auth/register`, { email, password }, {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const fetchLeaderboard = async (limit = 100) => {
    const response = await axios.get(`${API_URL}/api/v1/leaderboard?limit=${limit}`);
    return response.data;
};

export const fetchRecentContributions = async () => {
    const response = await axios.get(`${API_URL}/api/v1/recent-contributions?limit=10`);
    return response.data;
};

export const fetchContributions = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const response = await axios.get(`${API_URL}/api/v1/users/me/contributions?skip=${skip}&limit=${limit}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const updateUserProfile = async (displayName, isInLeaderboard) => {
    return axios.put(`${API_URL}/api/v1/users/me`, 
        { display_name: displayName, is_in_leaderboard: isInLeaderboard }, 
        { headers: getAuthHeaders() }
    );
};