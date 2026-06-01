import { api } from '@/lib/apiClient';
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from './auth.types';

export const authApi = {
  register: (body: RegisterRequest) =>
    api.post<AuthResponse>('/api/auth/register', body, { withCredentials: true }).then(r => r.data),

  login: (body: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', body, { withCredentials: true }).then(r => r.data),

  logout: () =>
    api.post<void>('/api/auth/logout', {}, { withCredentials: true }).then(r => r.data),

  me: () =>
    api.get<UserResponse>('/api/auth/me', { withCredentials: true }).then(r => r.data),
};