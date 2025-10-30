import axios from 'axios';
import { logout } from './auth';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('business_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    // The x402.js script will handle 402 errors automatically.
    // We only need to handle our app-specific logic, like logging out on 401.
    if (error.response?.status === 401 && !error.config.url.includes('/business/login')) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;