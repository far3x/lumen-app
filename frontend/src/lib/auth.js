import api from './api.js';

const TOKEN_KEY = 'lumen_token';
const USER_KEY = 'lumen_user';

export const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/token', formData);
    const token = response.data.access_token;
    localStorage.setItem(TOKEN_KEY, token);

    // Fetch and store user data
    await fetchAndStoreUser();
    return true;
};

export const register = async (email, password) => {
    await api.post('/auth/register', { email, password });
    return true;
}

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
    return !!getToken();
};

export const fetchAndStoreUser = async () => {
    try {
        const response = await api.get('/api/v1/users/me');
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    } catch (error) {
        console.error("Failed to fetch user data, logging out.", error);
        logout();
    }
};