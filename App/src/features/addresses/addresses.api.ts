import { api } from '@/lib/apiClient';
import type { Address, AddressDraft } from './addresses.types';

export const addressesApi = {
  list: () =>
    api.get<Address[]>('/api/addresses').then(r => r.data),

  create: (body: AddressDraft) =>
    api.post<Address>('/api/addresses', body).then(r => r.data),

  update: (id: string, body: AddressDraft) =>
    api.put<Address>(`/api/addresses/${id}`, body).then(r => r.data),

  remove: (id: string) =>
    api.delete<void>(`/api/addresses/${id}`).then(r => r.data),

  setDefault: (id: string) =>
    api.put<Address>(`/api/addresses/${id}/default`, {}).then(r => r.data),
};
