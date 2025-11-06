import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios] Added Authorization header with token');
    } else {
      console.warn('[Axios] No token found in localStorage');
    }
    
    // Also add user_id as query param if available (for GET requests)
    // This is a fallback in case Authorization header doesn't work
    const user = localStorage.getItem('user');
    if (user && (config.method === 'get' || !config.method)) {
      try {
        const userObj = JSON.parse(user);
        if (userObj?.id) {
          // Add user_id to existing params
          config.params = config.params || {};
          if (typeof config.params === 'object' && !Array.isArray(config.params)) {
            config.params.user_id = userObj.id.toString();
            console.log('[Axios] Added user_id to query params:', userObj.id);
          }
        }
      } catch (e) {
        console.error('[Axios] Error parsing user from localStorage:', e);
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
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

