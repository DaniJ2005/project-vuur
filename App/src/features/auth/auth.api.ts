import { api } from '@/lib/apiClient';
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from './auth.types';

export const authApi = {
  register: (body: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', body).then(r => r.data),

  login: (body: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', body).then(r => r.data),

  logout: (refreshToken: string) =>
    api.post<void>('/auth/logout', { refreshToken }).then(r => r.data),

  me: () =>
    api.get<UserResponse>('/auth/me').then(r => r.data),
};