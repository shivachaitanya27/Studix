import axios from 'axios';
import { STORAGE_KEYS } from '../types/index.js';

export const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api/v1';
  const cleaned = envUrl.replace(/\/+$/, '');
  if (cleaned.endsWith('/api/v1')) return cleaned;
  if (cleaned.endsWith('/api')) return `${cleaned}/v1`;
  return `${cleaned}/api/v1`;
};

// Base API instance
export const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 30000,
});

// Request interceptor: automatically attach Authorization Bearer token from localStorage or sessionStorage
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, delete explicit Content-Type so browser sets boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: standardize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected network error occurred.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.errors?.length) {
      message = error.response.data.errors.map((e) => e.message).join(', ');
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
