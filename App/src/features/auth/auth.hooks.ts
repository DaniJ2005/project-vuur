import { useSyncExternalStore } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from './auth.api';
import { tokenStorage } from '@/lib/tokenStorage';

export const meKey = ['auth', 'me'] as const;

// Reactieve view op het access token, rendert mee als tokenStorage muteert / verandert
// Dit fixt een probleem dat bijv. de "me" query niet opnieuw fetched als er een nieuw access token is, omdat die afhankelijk is van het access token

function useAccessToken() {
  return useSyncExternalStore(
    tokenStorage.subscribe,
    tokenStorage.getAccess,
    () => null,
  );
}

export function useMe() {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: meKey,
    queryFn: authApi.me,
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      tokenStorage.set(data.accessToken, data.refreshToken);
      qc.invalidateQueries({ queryKey: meKey });
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      tokenStorage.set(data.accessToken, data.refreshToken);
      qc.invalidateQueries({ queryKey: meKey });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const rt = tokenStorage.getRefresh();
      if (rt) await authApi.logout(rt);
    },
    onSettled: () => {
      tokenStorage.clear();
      qc.clear();
    },
  });
}
