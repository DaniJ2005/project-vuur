import { useState } from "react";
import type { AdminWishlistItem } from "../../admin.types";
import { useAdminWishlist, useAdminDeleteWishlistItem } from "../../hooks/admin.domain.hooks";
import { ConfirmModal, PreviewRow } from "../shared/ConfirmModal";
import { LoadingRows } from "../shared/LoadingRows";
import { PanelHeader, SearchInput, EmptyState, DeleteButton } from "../shared/ui";

export function WishlistPanel() {
  const wishlist = useAdminWishlist();
  const remove   = useAdminDeleteWishlistItem();

  const [search, setSearch]             = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminWishlistItem | null>(null);

  const filtered = (wishlist.data ?? []).filter((w) => {
    const q = search.toLowerCase();
    return (
      w.userEmail.toLowerCase().includes(q) ||
      w.productsId.toLowerCase().includes(q)
    );
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="rounded-xl border border-[#1E1E1E] bg-[#111] overflow-hidden">
      <PanelHeader title="Verlanglijst" count={filtered.length} />
      <SearchInput value={search} onChange={setSearch} placeholder="Zoek op gebruiker of product ID..." />

      {wishlist.isLoading ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        <EmptyState message="Geen verlanglijst items gevonden." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 uppercase text-xs bg-[#0D0D0D]">
              <tr>
                <th className="text-left px-5 py-3">Gebruiker</th>
                <th className="text-left px-5 py-3">Product ID</th>
                <th className="text-left px-5 py-3">Toegevoegd op</th>
                <th className="text-right px-5 py-3">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#151515] transition-colors">
                  <td className="px-5 py-3 text-gray-300">{item.userEmail}</td>
                  <td className="px-5 py-3 font-mono text-gray-400 text-xs">{item.productsId}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(item.createdAt).toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DeleteButton onClick={() => setDeleteTarget(item)} disabled={remove.isPending} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Item verwijderen"
          confirmLabel="Verwijderen"
          confirmClass="bg-red-600 hover:bg-red-700"
          isBusy={remove.isPending}
          description={<>Weet je zeker dat je dit verlanglijst item wilt verwijderen?</>}
          preview={
            <>
              <PreviewRow label="Gebruiker"  value={deleteTarget.userEmail} />
              <PreviewRow label="Product ID" value={deleteTarget.productsId} />
            </>
          }
          onConfirm={handleDelete}
          onDecline={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}