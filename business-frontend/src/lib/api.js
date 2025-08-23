import axios from 'axios';

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

export default api;