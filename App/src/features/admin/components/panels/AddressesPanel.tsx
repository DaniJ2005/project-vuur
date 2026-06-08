import { useState } from "react";
import type { AdminAddress } from "../../admin.types";
import { useAdminAddresses, useAdminDeleteAddress } from "../../hooks/admin.domain.hooks";
import { ConfirmModal, PreviewRow } from "../shared/ConfirmModal";
import { LoadingRows } from "../shared/LoadingRows";
import { PanelHeader, SearchInput, EmptyState, DeleteButton, Badge } from "../shared/ui";

export function AddressesPanel() {
  const addresses = useAdminAddresses();
  const remove    = useAdminDeleteAddress();

  const [search, setSearch]             = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminAddress | null>(null);

  const filtered = (addresses.data ?? []).filter((a) => {
    const q = search.toLowerCase();
    return (
      a.userEmail.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)      ||
      a.street.toLowerCase().includes(q)    ||
      a.countryCode.toLowerCase().includes(q)
    );
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="rounded-xl border border-[#1E1E1E] bg-[#111] overflow-hidden">
      <PanelHeader title="Adressen" count={filtered.length} />
      <SearchInput value={search} onChange={setSearch} placeholder="Zoek op e-mail, stad of straat..." />

      {addresses.isLoading ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        <EmptyState message="Geen adressen gevonden." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 uppercase text-xs bg-[#0D0D0D]">
              <tr>
                <th className="text-left px-5 py-3">Gebruiker</th>
                <th className="text-left px-5 py-3">Label</th>
                <th className="text-left px-5 py-3">Adres</th>
                <th className="text-left px-5 py-3">Stad</th>
                <th className="text-left px-5 py-3">Land</th>
                <th className="text-right px-5 py-3">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {filtered.map((addr) => (
                <tr key={addr.id} className="hover:bg-[#151515] transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{addr.userEmail}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">{addr.label || "—"}</span>
                      {addr.isDefault && <Badge variant="orange">Standaard</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-300">
                    {addr.street} {addr.houseNumber}{addr.houseExt ? ` ${addr.houseExt}` : ""}
                  </td>
                  <td className="px-5 py-3 text-gray-300">
                    {addr.postCode} {addr.city}
                  </td>
                  <td className="px-5 py-3 text-gray-400 uppercase text-xs">{addr.countryCode}</td>
                  <td className="px-5 py-3 text-right">
                    <DeleteButton onClick={() => setDeleteTarget(addr)} disabled={remove.isPending} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Adres verwijderen"
          confirmLabel="Verwijderen"
          confirmClass="bg-red-600 hover:bg-red-700"
          isBusy={remove.isPending}
          description={<>Weet je zeker dat je dit adres wilt verwijderen?</>}
          preview={
            <>
              <PreviewRow label="Gebruiker" value={deleteTarget.userEmail} />
              <PreviewRow label="Straat"    value={`${deleteTarget.street} ${deleteTarget.houseNumber}`} />
              <PreviewRow label="Stad"      value={`${deleteTarget.postCode} ${deleteTarget.city}`} />
              <PreviewRow label="Land"      value={deleteTarget.countryCode} />
            </>
          }
          onConfirm={handleDelete}
          onDecline={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}