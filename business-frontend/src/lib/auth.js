import api from './api.js';
import { navigate } from '../router.js';
import { stateService } from './state.js';

export const setAuthData = (data) => {
    localStorage.setItem('business_token', data.access_token);
    localStorage.setItem('business_user', JSON.stringify(data.user));
    localStorage.setItem('business_company', JSON.stringify(data.company));
    stateService.setUser(data.user);
    stateService.setCompany(data.company);
};

const clearAuthData = () => {
    localStorage.removeItem('business_token');
    localStorage.removeItem('business_user');
    localStorage.removeItem('business_company');
    stateService.setUser(null);
    stateService.setCompany(null);
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('business_token');
};

export const getUser = () => {
    const storedUser = localStorage.getItem('business_user');
    return storedUser ? JSON.parse(storedUser) : null;
};

export const getCompany = () => {
    const storedCompany = localStorage.getItem('business_company');
    return storedCompany ? JSON.parse(storedCompany) : null;
}

export const register = async (fullName, email, password, companyName, jobTitle, companySize, industry, recaptcha_token, invite_token = null) => {
    const payload = {
        full_name: fullName,
        email,
        password,
        company_name: companyName,
        job_title: jobTitle,
        company_size: companySize,
        industry: industry,
        recaptcha_token: recaptcha_token,
    };
    if (invite_token) {
        payload.invite_token = invite_token;
    }
    const response = await api.post('/business/register', payload);
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