import axios from 'axios';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1',
  withCredentials: true,
});

const getVisitorId = async () => {
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('FingerprintJS error:', error);
    return 'fingerprint_unavailable';
  }
};

let visitorIdPromise = getVisitorId();

api.interceptors.request.use(async (config) => {
  const visitorId = await visitorIdPromise;
  if (visitorId) {
    config.headers['X-Visitor-ID'] = visitorId;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;