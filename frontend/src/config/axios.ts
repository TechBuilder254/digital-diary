import axios from 'axios';
import API_CONFIG from './api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL.startsWith('http') ? API_CONFIG.baseURL : undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('token') ?? window.sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const user = window.localStorage.getItem('user') ?? window.sessionStorage.getItem('user');
      if (user && (config.method === 'get' || !config.method)) {
        try {
          const userObj = JSON.parse(user);
          if (userObj?.id) {
            config.params = config.params || {};
            if (typeof config.params === 'object' && !Array.isArray(config.params)) {
              config.params.user_id = String(userObj.id);
            }
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[Axios] Error parsing stored user:', error);
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear storage and redirect to login
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.replace('/');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;