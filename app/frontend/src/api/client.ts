import axios from 'axios';

// Centralized Session Duration Configuration (exactly 30 days)
export const SESSION_DURATION_DAYS = 30;

// Base API Server URL configured dynamically with a fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling 401 Unauthorized errors (session expiration)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle session expiration: clear local role tracking
      localStorage.removeItem('userRole');
    }
    return Promise.reject(error);
  }
);
