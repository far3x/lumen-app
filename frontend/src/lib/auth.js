import axios from 'axios';
import { navigate } from '../router';

const TOKEN_KEY = 'lumen_token';
const USER_KEY = 'lumen_user';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function getAuthHeaders() {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export async function register(email, password) {
    await axios.post(`${API_URL}/api/v1/auth/register`, { email, password });
}

export async function login(email, password) {
    const response = await axios.post(`${API_URL}/api/v1/auth/token`, new URLSearchParams({
        username: email,
        password: password
    }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    await fetchAndStoreUser();
}

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
}

export function getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

export async function fetchAndStoreUser() {
    if (!isAuthenticated()) return null;
    try {
        const response = await axios.get(`${API_URL}/api/v1/users/me`, {
            headers: getAuthHeaders()
        });
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user, logging out.", error);
        logout();
        navigate('/login');
        return null;
    }
}