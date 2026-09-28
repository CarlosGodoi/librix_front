import axios from 'axios';
import { triggerLogout } from './authEvents';

const baseApi = process.env.NEXT_PUBLIC_BASE_API!;

const api = axios.create({
  baseURL: baseApi,
});

export const apiFront = axios.create({
  baseURL: '',
  withCredentials: true,
});

// --- fluxo de refresh automático (só faz sentido no apiFront, que é o client) ---

let isRefreshing = false;
let queue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  queue = [];
}

apiFront.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    const isLoginRoute = originalRequest?.url?.includes('/api/login');
    const isRefreshRoute = originalRequest?.url?.includes('/api/refresh');

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isLoginRoute ||
      isRefreshRoute
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then(() => apiFront(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await apiFront.post('/api/refresh');
      processQueue(null);
      return apiFront(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      apiFront.post('/api/logout').catch(() => {}); // limpa os cookies no servidor, best-effort
      triggerLogout(); // se você reintroduzir esse helper, pra disparar redirect/estado global
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
