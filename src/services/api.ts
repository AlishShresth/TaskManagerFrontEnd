import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosRequestConfig,
} from 'axios';
import { toast } from 'react-toastify';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (token && prom.config.headers) {
        prom.config.headers['Authorization'] = `Bearer ${token}`;
      }
      prom.resolve(api(prom.config));
    }
  });
  failedQueue = [];
};

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    // If 401 and not already trying to refresh
    if (
      error.response &&
      error.response.status === 401 &&
      !(originalRequest as any)._retry
    ) {
      if (isRefreshing) {
        // Queue the request until refresh is done
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
            config: originalRequest,
          });
        });
      }
      (originalRequest as any)._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        // No refresh token, force logout or redirect
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );
        const newAccessToken = response.data.access_token;
        localStorage.setItem('access_token', newAccessToken);
        processQueue(null, newAccessToken);
        return api({
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    // Handle network or other errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
