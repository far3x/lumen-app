import api from './api.js';
import { navigate } from '../router.js';

let user = null;
let company = null;

export const isAuthenticated = () => {
    return !!localStorage.getItem('business_token');
};

export const getUser = () => {
    if (user) return user;
    const storedUser = localStorage.getItem('business_user');
    return storedUser ? JSON.parse(storedUser) : null;
};

export const getCompany = () => {
    if (company) return company;
    const storedCompany = localStorage.getItem('business_company');
    return storedCompany ? JSON.parse(storedCompany) : null;
}

const setAuthData = (data) => {
    user = data.user;
    company = data.company;
    localStorage.setItem('business_token', data.access_token);
    localStorage.setItem('business_user', JSON.stringify(data.user));
    localStorage.setItem('business_company', JSON.stringify(data.company));
};

const clearAuthData = () => {
    user = null;
    company = null;
    localStorage.removeItem('business_token');
    localStorage.removeItem('business_user');
    localStorage.removeItem('business_company');
};

export const register = async (fullName, email, password, companyName) => {
    const response = await api.post('/business/register', {
        full_name: fullName,
        email,
        password,
        company_name: companyName,
    });
    setAuthData(response.data);
    return response.data;
};

export const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const response = await api.post('/business/login', params);
    setAuthData(response.data);
    return response.data;
};

export const logout = () => {
    clearAuthData();
    navigate('/login');
};