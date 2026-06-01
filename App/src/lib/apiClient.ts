import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

const BASE = import.meta.env.VITE_API_URL ?? '';

// Aparte axios instance voor refresh, zonder interceptors,
// anders krijg je een infinite loop als /auth/refresh zelf 401 geeft.
const refreshClient = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // stuur cookies mee op elk request
});

// --- REFRESH dedup: bij meerdere parallelle 401's slechts één refresh call --
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  try {
    await refreshClient.post('/api/auth/refresh');
    return true;
  } catch {
    return false;
  }
}

// --- RESPONSE interceptor: 401 → refresh → retry ----------------------------
type RetryConfig = AxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    const shouldRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/register') &&
      !original.url?.includes('/auth/refresh');

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshPromise ??= refreshTokens().finally(() => { refreshPromise = null; });
    const ok = await refreshPromise;

    if (!ok) {
      return Promise.reject(error);
    }

    return api(original);
  },
);