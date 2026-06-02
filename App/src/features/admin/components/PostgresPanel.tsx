import type { AdminTable, AdminRow, EditForm, FieldChange } from "../admin.types";
import type { usePostgresEditor } from "../hooks/usePostgresEditor";
import { LoadingRows } from "./shared/LoadingRows";
import { ConfirmModal } from "./shared/ConfirmModal";
import TrashIcon from "@/components/icons/TrashIcon";

type PostgresEditorState = ReturnType<typeof usePostgresEditor>;

interface PostgresPanelProps {
  tables: AdminTable[];
  selectedTable: AdminTable | undefined;
  selectedTableName: string;
  isLoading: boolean;
  editor: PostgresEditorState;
  onSelectTable: (name: string) => void;
}

export function PostgresPanel({
  tables,
  selectedTable,
  selectedTableName,
  isLoading,
  editor,
  onSelectTable,
}: PostgresPanelProps) {
  return (
    <>
      <section className="grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="rounded-lg border border-[#1E1E1E] bg-[#111] p-3 h-fit">
          {tables.map((table) => (
            <button
              key={table.name}
              onClick={() => onSelectTable(table.name)}
              className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-bold transition-all cursor-pointer ${
                selectedTableName === table.name
                  ? "bg-[#F25B29]/15 text-[#F25B29]"
                  : "text-gray-400 hover:bg-[#1A1A1A] hover:text-white"
              }`}
            >
              <span>{table.name}</span>
              <span className="text-xs text-gray-500">{table.rows.length}</span>
            </button>
          ))}
        </aside>

        <div className="rounded-lg border border-[#1E1E1E] bg-[#111] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1A1A1A] flex items-center justify-between">
            <h2 className="text-white font-black">{selectedTable?.name ?? "Postgres tabellen"}</h2>
            {selectedTable?.canDelete && (
              <button
                onClick={() => editor.openCreateModal(selectedTable)}
                className="border border-[#2A2A2A] text-gray-300 hover:text-white rounded-md px-3 py-1.5 text-xs font-bold"
              >
                New row
              </button>
            )}
          </div>
          {isLoading || !selectedTable ? (
            <LoadingRows />
          ) : (
            <AdminDataTable
              table={selectedTable}
              isBusy={editor.isBusy}
              onDeleteRow={(table, row) => editor.openConfirmDelete(table, row)}
              onEditRow={(table, row) => editor.openEditModal(table, row)}
            />
          )}
        </div>
      </section>

      {/* Confirm Delete Row */}
      {editor.confirmDelete.open && editor.confirmDelete.table && editor.confirmDelete.row && (
        <ConfirmModal
          title="Bevestig verwijderen"
          confirmLabel="Verwijderen"
          description={
            <>
              Weet je zeker dat je deze rij wilt verwijderen uit{" "}
              <span className="font-bold text-[#F25B29]">{editor.confirmDelete.table.name}</span>?
            </>
          }
          preview={
            <div className="space-y-1">
              {Object.entries(editor.confirmDelete.row).map(([key, value]) => (
                <div key={key} className="flex justify-between text-gray-300 py-1">
                  <span className="text-gray-500">{key}</span>
                  <span className="font-mono">{rowValueToText(value)}</span>
                </div>
              ))}
            </div>
          }
          onConfirm={editor.confirmDeleteRow}
          onDecline={editor.declineDelete}
        />
      )}

      {/* Edit / Create Row Modal */}
      {editor.editModal.open && editor.editModal.table && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-6 w-full max-w-3xl">
            <h3 className="text-white font-black text-lg mb-3">
              {editor.editModal.row ? "Rij bewerken" : "Rij aanmaken"} ({editor.editModal.table.name})
            </h3>

            {!editor.editModal.showConfirm ? (
              <EditFields
                form={editor.editModal.form ?? {}}
                onFieldChange={editor.updateEditField}
                onDecline={editor.declineEdit}
                onSave={editor.saveEditDraft}
              />
            ) : (
              <ConfirmChanges
                changes={editor.editModal.changes ?? []}
                onDecline={editor.declineEdit}
                onConfirm={editor.confirmEdit}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function EditFields({
  form,
  onFieldChange,
  onDecline,
  onSave,
}: {
  form: EditForm;
  onFieldChange: (field: string, value: string) => void;
  onDecline: () => void;
  onSave: () => void;
}) {
  const AUTO_FIELDS = new Set(["id", "createdAt", "updatedAt"]);

  return (
    <>
      <div className="max-h-72 overflow-auto mb-4">
        {Object.entries(form).map(([key, value]) => {
          if (AUTO_FIELDS.has(key)) return null;
          return (
            <label key={key} className="block mb-2">
              <span className="text-xs text-gray-500 uppercase">{key}</span>
              <input
                value={value}
                onChange={(e) => onFieldChange(key, e.target.value)}
                className="mt-1 w-full bg-[#0D0D0D] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29]"
              />
            </label>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onDecline} className="px-4 py-2 bg-[#2A2A2A] text-gray-300 rounded font-bold">
          Annuleren
        </button>
        <button onClick={onSave} className="px-4 py-2 bg-[#F25B29] text-white rounded font-bold">
          Doorgaan
        </button>
      </div>
    </>
  );
}

function ConfirmChanges({
  changes,
  onDecline,
  onConfirm,
}: {
  changes: FieldChange[];
  onDecline: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <p className="text-gray-400 text-sm mb-3">
        De volgende velden worden aangepast. Bevestig of annuleer.
      </p>
      <div className="mb-4 max-h-56 overflow-auto">
        {changes.map((c) => (
          <div key={c.key} className="flex justify-between items-center gap-4 py-2 border-b border-[#1A1A1A]">
            <div>
              <div className="text-sm text-gray-300 font-bold">{c.key}</div>
              <div className="text-xs text-gray-500">{c.before} → {c.after}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onDecline} className="px-4 py-2 bg-[#2A2A2A] text-gray-300 rounded font-bold">
          Annuleren
        </button>
        <button onClick={onConfirm} className="px-4 py-2 bg-[#F25B29] text-white rounded font-bold">
          Bevestigen
        </button>
      </div>
    </>
  );
}

function AdminDataTable({
  table,
  isBusy,
  onDeleteRow,
  onEditRow,
}: {
  table: AdminTable;
  isBusy: boolean;
  onDeleteRow: (table: AdminTable, row: AdminRow) => void;
  onEditRow: (table: AdminTable, row: AdminRow) => void;
}) {
  const columns = Object.keys(table.rows[0] ?? {});

  if (table.rows.length === 0) {
    return <p className="text-gray-500 p-5 text-sm">Geen rijen gevonden.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm table-fixed">
        <thead className="text-gray-500 uppercase text-xs bg-[#0D0D0D]">
          <tr>
            {columns.map((col) => (
              <th key={col} className="text-left px-5 py-3 whitespace-nowrap">{col}</th>
            ))}
            <th className="sticky right-0 bg-[#111] text-right px-5 py-3 z-10">Acties</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A1A1A]">
          {table.rows.map((row) => (
            <tr key={String(row.id)} className="hover:bg-[#151515]">
              {columns.map((col) => (
                <td key={col} className="px-5 py-3 whitespace-nowrap max-w-[260px] truncate">
                  {rowValueToText(row[col])}
                </td>
              ))}
              <td className="sticky right-0 bg-[#111] px-5 py-3 text-right border-l border-[#1A1A1A] z-10">
                {table.canDelete ? (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEditRow(table, row)}
                      disabled={isBusy}
                      className="border border-[#2A2A2A] hover:border-[#F25B29]/40 text-gray-300 hover:text-[#F25B29] rounded-md px-3 py-1.5 text-xs font-bold cursor-pointer"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={() => onDeleteRow(table, row)}
                      disabled={isBusy}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-md cursor-pointer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-600 text-xs">Alleen lezen</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function rowValueToText(value: AdminRow[string]): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Ja" : "Nee";
  return String(value);
}
