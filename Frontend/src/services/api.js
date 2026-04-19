import axios from 'axios';
import Cookies from 'js-cookie';

/**
 * Centralized Axios instance for all API calls.
 * Base URL is sourced from VITE_API_URL environment variable,
 * falling back to localhost for local development.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5160/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ────────────────────────────────────────────────────
// Automatically attach the JWT Bearer token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor ───────────────────────────────────────────────────
// On a 401 Unauthorized response, clear the stale session and redirect
// the user to the login page automatically.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear only auth-related keys, not app settings like SIMULATION_MODE
      Cookies.remove('token');
      Cookies.remove('role');
      Cookies.remove('name');
      Cookies.remove('email');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
