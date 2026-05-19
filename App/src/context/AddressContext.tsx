/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";

export type Address = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  houseExt: string;
  postCode: string;
  city: string;
  country: string;
  phone?: string;
  isDefault: boolean;
};

export type AddressDraft = Omit<Address, "id" | "isDefault"> & { isDefault?: boolean };

// Seed with two example addresses so the picker has something to show.
// TODO: replace with GET /api/addresses when backend exists.
const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Thuis",
    firstName: "Jan",
    lastName: "de Vries",
    street: "Voorbeeldstraat",
    houseNumber: "42",
    houseExt: "",
    postCode: "1234 AB",
    city: "Amsterdam",
    country: "NL",
    phone: "+31 6 12345678",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Werk",
    firstName: "Jan",
    lastName: "de Vries",
    street: "Kantoorlaan",
    houseNumber: "10",
    houseExt: "B",
    postCode: "3011 AB",
    city: "Rotterdam",
    country: "NL",
    isDefault: false,
  },
];

type AddressContextValue = {
  addresses: Address[];
  defaultAddress: Address | null;
  addAddress: (draft: AddressDraft) => Address;
  updateAddress: (id: string, patch: Partial<AddressDraft>) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
};

const AddressContext = createContext<AddressContextValue | undefined>(undefined);

const newId = () => `addr-${Math.random().toString(36).slice(2, 9)}`;

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);

  const addAddress = useCallback((draft: AddressDraft): Address => {
    const fresh: Address = { ...draft, id: newId(), isDefault: draft.isDefault ?? false };
    setAddresses((prev) => {
      // If marked default, demote others; or if this is the first address, make it default.
      let result = prev.map((a) =>
        fresh.isDefault ? { ...a, isDefault: false } : a
      );
      if (prev.length === 0) fresh.isDefault = true;
      result = [...result, fresh];
      return result;
    });
    return fresh;
  }, []);

  const updateAddress = useCallback((id: string, patch: Partial<AddressDraft>) => {
    setAddresses((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...patch, isDefault: a.isDefault } : a
      )
    );
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const removed = prev.find((a) => a.id === id);
      const filtered = prev.filter((a) => a.id !== id);
      // If we removed the default, promote the first remaining.
      if (removed?.isDefault && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      return filtered;
    });
  }, []);

  const setDefault = useCallback((id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }, []);

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
