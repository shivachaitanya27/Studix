import axios from 'axios';

export const ADMIN_TOKEN_KEY = 'studix_admin_token';
export const ADMIN_USER_KEY = 'studix_admin_user';

export const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api/v1';
  const cleaned = envUrl.replace(/\/+$/, '');
  if (cleaned.endsWith('/api/v1')) return cleaned;
  if (cleaned.endsWith('/api')) return `${cleaned}/v1`;
  return `${cleaned}/api/v1`;
};

export const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 30000,
});

// Attach Admin Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Format API Error Responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected server error occurred.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.errors?.length) {
      message = error.response.data.errors.map((e) => e.message).join(', ');
    } else if (error.message) {
      message = error.message;
    }
    const customErr = new Error(message);
    customErr.response = error.response;
    customErr.status = error.response?.status;
    return Promise.reject(customErr);
  }
);

export const getAdminUser = () => {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAdminSession = (token, user) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

export default api;
