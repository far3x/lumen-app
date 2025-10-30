import axios from 'axios';
import { logout } from './auth';
import { withPaymentInterceptor } from '@payai/x402-axios';
import { walletService } from './wallet.js';

const baseAxios = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1',
  withCredentials: true,
});

const api = withPaymentInterceptor(baseAxios, walletService);

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
    if (error.response?.status === 401 && !error.config.url.includes('/business/login')) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;