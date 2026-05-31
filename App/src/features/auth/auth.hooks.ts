import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from './auth.api';

export const meKey = ['auth', 'me'] as const;

export function useMe() {
  return useQuery({
    queryKey: meKey,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => qc.invalidateQueries({ queryKey: meKey }),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => qc.invalidateQueries({ queryKey: meKey }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => qc.clear(),
  });
}
