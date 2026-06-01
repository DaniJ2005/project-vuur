import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressesApi } from './addresses.api';
import type { AddressDraft } from './addresses.types';
import { useMe } from "@/features/auth/auth.hooks";

export const addressesKey = ['addresses'] as const;

export function useAddressesQuery() {
  const { data: user } = useMe();
  return useQuery({
    queryKey: addressesKey,
    queryFn: addressesApi.list,
    enabled: !!user, // Niet proberen te fetchen zonder token, want dan krijg je een 401 die je moet afhandelen.
    staleTime: 5 * 60_000,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddressDraft) => addressesApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressesKey }), // React Query cache invalid maken want er is wat veranderd met de data in de backend.
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AddressDraft }) =>
      addressesApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressesKey }),
  });
}

export function useRemoveAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressesKey }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.setDefault(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressesKey }), 
  });
}
