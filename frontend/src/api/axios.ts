import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;
if (!VITE_API_URL) throw new Error('VITE_API_URL environment variable is required');
const api = axios.create({ baseURL: VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Prevent hard reload if we are already trying to auth
      if (globalThis.location.pathname !== '/login' && globalThis.location.pathname !== '/signup') {
        globalThis.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
