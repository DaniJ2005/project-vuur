// Mirrors AddressResponse / AddressRequest from the backend (Vuur.Api/Features/Users/AddressModels.cs).
// JSON is serialized camelCase by System.Text.Json, so field names line up 1:1.

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  houseNumber: string;
  houseExt: string;
  postCode: string;
  city: string;
  countryCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// What the create/update forms produce. The server owns id/userId/timestamps,
// and isDefault is optional (the API defaults the first address to default).
export type AddressDraft = Omit<
  Address,
  "id" | "userId" | "isDefault" | "createdAt" | "updatedAt"
> & { isDefault?: boolean };
