import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';

const BASE = import.meta.env.VITE_API_URL ?? '';

// Aparte axios instance voor refresh, zonder interceptors,
// anders krijg je een infinite loop als /auth/refresh zelf 401 geeft.
const refreshClient = axios.create({ baseURL: BASE });

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// --- REQUEST interceptor: bearer token erop plakken -------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// --- REFRESH dedup: bij meerdere parallelle 401's slechts één refresh call --
let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  try {
    const { data } = await refreshClient.post<{
      accessToken: string; refreshToken: string; accessTokenExpiresAt: string;
    }>('/auth/refresh', { refreshToken });

    tokenStorage.set(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

// --- RESPONSE interceptor: 401 → refresh → retry ----------------------------
// We taggen de config met `_retry` zodat we niet in een oneindige lus belanden.
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
    const newToken = await refreshPromise;

    if (!newToken) {
      return Promise.reject(error);
    }

    original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
    return api(original);
  },
);