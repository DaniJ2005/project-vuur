import { useState } from "react";
import type { AdminTable, AdminRow, AdminRowValue, AdminRowPayload, EditForm, FieldChange } from "../admin.types";
import {
  useDeleteAdminPostgresRow,
  useCreateAdminPostgresRow,
  useUpdateAdminPostgresRow,
} from "./admin.postgres.hooks";

interface ConfirmDeleteState {
  open: boolean;
  table?: AdminTable;
  row?: AdminRow;
}

interface EditModalState {
  open: boolean;
  table?: AdminTable;
  /** The original row being edited. Undefined when creating a new row. */
  row?: AdminRow;
  form?: EditForm;
  showConfirm?: boolean;
  changes?: FieldChange[];
}

/** Convert a stringified form value back to the correct AdminRowValue primitive. */
function parseFormValue(value: string): AdminRowValue {
  if (value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  const asNumber = Number(value);
  if (!isNaN(asNumber) && value.trim() !== "") return asNumber;
  return value;
}

/** Convert an AdminRowValue to a string for use in an <input>. */
function rowValueToFormString(value: AdminRowValue): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

const AUTO_FIELDS = new Set(["id", "createdAt", "updatedAt"]);

export function usePostgresEditor(onMessage: (msg: string) => void) {
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>({ open: false });
  const [editModal, setEditModal] = useState<EditModalState>({ open: false });

  const deleteRow = useDeleteAdminPostgresRow();
  const createRow = useCreateAdminPostgresRow();
  const updateRow = useUpdateAdminPostgresRow();

  const isBusy = deleteRow.isPending || createRow.isPending || updateRow.isPending;

  // ── Delete flow ──────────────────────────────────────────────────────────────

  const openConfirmDelete = (table: AdminTable, row: AdminRow) =>
    setConfirmDelete({ open: true, table, row });

  const declineDelete = () => setConfirmDelete({ open: false });

  const confirmDeleteRow = async () => {
    if (!confirmDelete.table || !confirmDelete.row) return;
    const id = confirmDelete.row.id;
    if (typeof id !== "string") return;
    await deleteRow.mutateAsync({ tableName: confirmDelete.table.name, id });
    onMessage(`Rij verwijderd uit ${confirmDelete.table.name}.`);
    setConfirmDelete({ open: false });
  };

  // ── Edit flow ────────────────────────────────────────────────────────────────

  const openEditModal = (table: AdminTable, row: AdminRow) => {
    const form: EditForm = {};
    for (const key of Object.keys(row)) {
      form[key] = rowValueToFormString(row[key]);
    }
    setEditModal({ open: true, table, row, form, showConfirm: false });
  };

  const openCreateModal = (table: AdminTable) => {
    const templateRow = table.rows[0];
    if (!templateRow) {
      onMessage("Kan geen rij aanmaken: geen template beschikbaar.");
      return;
    }
    const form: EditForm = {};
    for (const key of Object.keys(templateRow)) {
      if (!AUTO_FIELDS.has(key)) form[key] = "";
    }
    setEditModal({ open: true, table, row: undefined, form, showConfirm: false });
  };

  const updateEditField = (field: string, value: string) =>
    setEditModal((s) => ({ ...s, form: { ...(s.form ?? {}), [field]: value } }));

  const saveEditDraft = () => {
    if (!editModal.row) return;
    const form = editModal.form ?? {};
    const changes: FieldChange[] = [];
    for (const key of Object.keys(form)) {
      const before = rowValueToFormString(editModal.row[key]);
      const after = form[key] ?? "";
      if (before !== after) changes.push({ key, before, after });
    }
    setEditModal((s) => ({ ...s, showConfirm: true, changes }));
  };

  const confirmEdit = async () => {
    if (!editModal.table || !editModal.changes) return;

    const payload: AdminRowPayload = {};
    for (const { key, after } of editModal.changes) {
      payload[key] = parseFormValue(after);
    }

    const id = editModal.row?.id;
    if (typeof id === "string") {
      await updateRow.mutateAsync({ tableName: editModal.table.name, id, payload });
      onMessage(`Rij bijgewerkt in ${editModal.table.name}.`);
    } else {
      await createRow.mutateAsync({ tableName: editModal.table.name, payload });
      onMessage(`Rij aangemaakt in ${editModal.table.name}.`);
    }
    setEditModal({ open: false });
  };

  const declineEdit = () => setEditModal({ open: false });

  return {
    isBusy,
    confirmDelete,
    editModal,
    openConfirmDelete,
    declineDelete,
    confirmDeleteRow,
    openEditModal,
    openCreateModal,
    updateEditField,
    saveEditDraft,
    confirmEdit,
    declineEdit,
  };
}
