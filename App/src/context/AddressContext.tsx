/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext } from "react";
import {
  useAddressesQuery,
  useCreateAddress,
  useUpdateAddress,
  useRemoveAddress,
  useSetDefaultAddress,
} from "@/features/addresses/addresses.hooks";
import type { Address, AddressDraft } from "@/features/addresses/addresses.types";

type AddressContextValue = {
  addresses: Address[];
  defaultAddress: Address | null;
  addAddress: (draft: AddressDraft) => void;
  updateAddress: (id: string, draft: AddressDraft) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
};

const AddressContext = createContext<AddressContextValue | undefined>(undefined);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const { data } = useAddressesQuery();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const removeMutation = useRemoveAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const addresses = data ?? [];

  const addAddress = useCallback(
    (draft: AddressDraft) => createMutation.mutate(draft),
    [createMutation],
  );

  const updateAddress = useCallback(
    (id: string, draft: AddressDraft) => updateMutation.mutate({ id, body: draft }),
    [updateMutation],
  );

  const removeAddress = useCallback(
    (id: string) => removeMutation.mutate(id),
    [removeMutation],
  );

  const setDefault = useCallback(
    (id: string) => setDefaultMutation.mutate(id),
    [setDefaultMutation],
  );

  const defaultAddress = addresses.find((a) => a.isDefault) ?? null;

  return (
    <AddressContext.Provider
      value={{ addresses, defaultAddress, addAddress, updateAddress, removeAddress, setDefault }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses(): AddressContextValue {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddresses must be used inside AddressProvider");
  return ctx;
}
