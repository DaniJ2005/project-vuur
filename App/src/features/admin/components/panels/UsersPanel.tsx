import { useState } from "react";
import type { AdminUser, AdminCreateUserRequest, AdminUpdateUserRequest } from "../../admin.types";
import {
  useAdminUsers,
  useAdminCreateUser,
  useAdminUpdateUser,
  useAdminDeleteUser,
} from "../../hooks/admin.domain.hooks";
import { ConfirmModal, PreviewRow } from "../shared/ConfirmModal";
import { LoadingRows } from "../shared/LoadingRows";
import {
  PanelHeader, SearchInput, EmptyState, EditButton, DeleteButton,
  PrimaryButton, SecondaryButton, FormField, RoleBadge, inputClass, selectClass,
} from "../shared/ui";

const emptyCreateForm: AdminCreateUserRequest = {
  firstName: "", lastName: "", email: "", password: "", role: "customer",
};

export function UsersPanel() {
  const users    = useAdminUsers();
  const create   = useAdminCreateUser();
  const update   = useAdminUpdateUser();
  const remove   = useAdminDeleteUser();

  const [search, setSearch]           = useState("");
  const [createOpen, setCreateOpen]   = useState(false);
  const [createForm, setCreateForm]   = useState<AdminCreateUserRequest>(emptyCreateForm);
  const [createError, setCreateError] = useState("");

  const [editTarget, setEditTarget]   = useState<AdminUser | null>(null);
  const [editForm, setEditForm]       = useState<AdminUpdateUserRequest>({});

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const isBusy = create.isPending || update.isPending || remove.isPending;

  const filtered = (users.data ?? []).filter((u) => {
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q)  ||
      u.email.toLowerCase().includes(q)     ||
      u.roleName.toLowerCase().includes(q)
    );
  });

  const handleCreate = async () => {
    setCreateError("");
    if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.password) {
      setCreateError("Vul alle verplichte velden in.");
      return;
    }
    await create.mutateAsync(createForm);
    setCreateForm(emptyCreateForm);
    setCreateOpen(false);
  };

  const openEdit = (user: AdminUser) => {
    setEditTarget(user);
    setEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.roleName as "customer" | "admin" });
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    await update.mutateAsync({ id: editTarget.id, payload: editForm });
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="rounded-xl border border-[#1E1E1E] bg-[#111] overflow-hidden">
      <PanelHeader
        title="Gebruikers"
        count={filtered.length}
        action={
          <PrimaryButton onClick={() => setCreateOpen(true)} disabled={isBusy}>
            + Gebruiker aanmaken
          </PrimaryButton>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Zoek op naam, e-mail of rol..." />

      {users.isLoading ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        <EmptyState message="Geen gebruikers gevonden." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 uppercase text-xs bg-[#0D0D0D]">
              <tr>
                <th className="text-left px-5 py-3">Naam</th>
                <th className="text-left px-5 py-3">E-mail</th>
                <th className="text-left px-5 py-3">Rol</th>
                <th className="text-left px-5 py-3">Aangemaakt</th>
                <th className="text-right px-5 py-3">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#151515] transition-colors">
                  <td className="px-5 py-3 font-bold text-white">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{user.email}</td>
                  <td className="px-5 py-3"><RoleBadge role={user.roleName} /></td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <EditButton onClick={() => openEdit(user)} disabled={isBusy} />
                      <DeleteButton onClick={() => setDeleteTarget(user)} disabled={isBusy} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-black text-lg mb-5">Gebruiker aanmaken</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Voornaam">
                  <input className={inputClass} value={createForm.firstName}
                    onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))} />
                </FormField>
                <FormField label="Achternaam">
                  <input className={inputClass} value={createForm.lastName}
                    onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="E-mail">
                <input className={inputClass} type="email" value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
              </FormField>
              <FormField label="Wachtwoord (initieel)">
                <input className={inputClass} type="password" value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} />
              </FormField>
              <FormField label="Rol">
                <select className={selectClass} value={createForm.role}
                  onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as "customer" | "admin" }))}>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
              {createError && <p className="text-red-400 text-xs">{createError}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <SecondaryButton onClick={() => { setCreateOpen(false); setCreateForm(emptyCreateForm); setCreateError(""); }}>
                Annuleren
              </SecondaryButton>
              <PrimaryButton onClick={handleCreate} disabled={isBusy}>
                {create.isPending ? "Aanmaken..." : "Aanmaken"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-black text-lg mb-1">Gebruiker bewerken</h3>
            <p className="text-gray-500 text-sm mb-5">{editTarget.email}</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Voornaam">
                  <input className={inputClass} value={editForm.firstName ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} />
                </FormField>
                <FormField label="Achternaam">
                  <input className={inputClass} value={editForm.lastName ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="E-mail">
                <input className={inputClass} type="email" value={editForm.email ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
              </FormField>
              <FormField label="Rol">
                <select className={selectClass} value={editForm.role ?? "customer"}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as "customer" | "admin" }))}>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <SecondaryButton onClick={() => setEditTarget(null)}>Annuleren</SecondaryButton>
              <PrimaryButton onClick={handleUpdate} disabled={isBusy}>
                {update.isPending ? "Opslaan..." : "Opslaan"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmModal
          title="Gebruiker verwijderen"
          confirmLabel="Verwijderen"
          confirmClass="bg-red-600 hover:bg-red-700"
          isBusy={remove.isPending}
          description={
            <>Weet je zeker dat je <span className="text-white font-bold">{deleteTarget.firstName} {deleteTarget.lastName}</span> wilt verwijderen? Dit verwijdert ook alle gekoppelde adressen.</>
          }
          preview={
            <>
              <PreviewRow label="E-mail" value={deleteTarget.email} />
              <PreviewRow label="Rol"    value={deleteTarget.roleName} />
            </>
          }
          onConfirm={handleDelete}
          onDecline={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}