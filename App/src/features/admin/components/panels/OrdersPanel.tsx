import { useState } from "react";
import type { AdminOrder, OrderStatus } from "../../admin.types";
import {
  useAdminOrders,
  useAdminUpdateOrderStatus,
  useAdminDeleteOrder,
} from "../../hooks/admin.domain.hooks";
import { ConfirmModal, PreviewRow } from "../shared/ConfirmModal";
import { LoadingRows } from "../shared/LoadingRows";
import {
  PanelHeader, SearchInput, EmptyState, EditButton, DeleteButton,
  OrderStatusBadge, PrimaryButton, SecondaryButton, FormField, selectClass,
} from "../shared/ui";

const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "fulfilled", "cancelled"];

const statusLabel: Record<OrderStatus, string> = {
  pending:   "In afwachting",
  paid:      "Betaald",
  fulfilled: "Verzonden",
  cancelled: "Geannuleerd",
};

export function OrdersPanel() {
  const orders       = useAdminOrders();
  const updateStatus = useAdminUpdateOrderStatus();
  const remove       = useAdminDeleteOrder();

  const [search, setSearch]             = useState("");
  const [statusTarget, setStatusTarget] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus]       = useState<OrderStatus>("pending");
  const [deleteTarget, setDeleteTarget] = useState<AdminOrder | null>(null);

  const isBusy = updateStatus.isPending || remove.isPending;

  const filtered = (orders.data ?? []).filter((o) => {
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q)                ||
      o.customerEmail.toLowerCase().includes(q)     ||
      o.customerFirstName.toLowerCase().includes(q) ||
      o.customerLastName.toLowerCase().includes(q)  ||
      o.status.toLowerCase().includes(q)
    );
  });

  const openStatusModal = (order: AdminOrder) => {
    setStatusTarget(order);
    setNewStatus(order.status);
  };

  const handleStatusUpdate = async () => {
    if (!statusTarget) return;
    await updateStatus.mutateAsync({ id: statusTarget.id, status: newStatus });
    setStatusTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="rounded-xl border border-[#1E1E1E] bg-[#111] overflow-hidden">
      <PanelHeader title="Bestellingen" count={filtered.length} />
      <SearchInput value={search} onChange={setSearch} placeholder="Zoek op klant, e-mail, status of ID..." />

      {orders.isLoading ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        <EmptyState message="Geen bestellingen gevonden." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 uppercase text-xs bg-[#0D0D0D]">
              <tr>
                <th className="text-left px-5 py-3">Klant</th>
                <th className="text-left px-5 py-3">Bedrag</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Verzending</th>
                <th className="text-left px-5 py-3">Datum</th>
                <th className="text-right px-5 py-3">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-[#151515] transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-bold text-white">
                      {order.customerFirstName} {order.customerLastName}
                    </p>
                    <p className="text-gray-500 text-xs">{order.customerEmail}</p>
                  </td>
                  <td className="px-5 py-3 font-bold text-white">
                    €{Number(order.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {order.requiresShipping ? (order.shippingMethod ?? "Standaard") : "Geen"}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <EditButton onClick={() => openStatusModal(order)} disabled={isBusy} />
                      <DeleteButton onClick={() => setDeleteTarget(order)} disabled={isBusy} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status change modal */}
      {statusTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-black text-lg mb-1">Status wijzigen</h3>
            <p className="text-gray-500 text-sm mb-5">
              {statusTarget.customerFirstName} {statusTarget.customerLastName} — €{Number(statusTarget.totalAmount).toFixed(2)}
            </p>
            <FormField label="Nieuwe status">
              <select
                className={selectClass}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </select>
            </FormField>
            <div className="flex justify-end gap-2 mt-6">
              <SecondaryButton onClick={() => setStatusTarget(null)}>Annuleren</SecondaryButton>
              <PrimaryButton
                onClick={handleStatusUpdate}
                disabled={isBusy || newStatus === statusTarget.status}
              >
                {updateStatus.isPending ? "Opslaan..." : "Opslaan"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmModal
          title="Bestelling verwijderen"
          confirmLabel="Verwijderen"
          confirmClass="bg-red-600 hover:bg-red-700"
          isBusy={remove.isPending}
          description={
            <>Weet je zeker dat je deze bestelling van <span className="text-white font-bold">{deleteTarget.customerFirstName} {deleteTarget.customerLastName}</span> wilt verwijderen?</>
          }
          preview={
            <>
              <PreviewRow label="E-mail"  value={deleteTarget.customerEmail} />
              <PreviewRow label="Bedrag"  value={`€${Number(deleteTarget.totalAmount).toFixed(2)}`} />
              <PreviewRow label="Status"  value={deleteTarget.status} />
            </>
          }
          onConfirm={handleDelete}
          onDecline={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}