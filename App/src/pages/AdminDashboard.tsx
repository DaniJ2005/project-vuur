import { useMemo, useState } from "react";
import {
  useAdminAnalytics,
  useAdminActivityLog,
  useAdminMongoProducts,
  useAdminPostgresTables,
  useAdminRefreshTokens,
  useDeleteAdminPostgresRow,
  useCreateAdminPostgresRow,
  useUpdateAdminPostgresRow,
  useRevokeRefreshToken,
} from "@/features/admin/admin.hooks";
import type {
  AdminActivityEntry,
  AdminAnalytics,
  AdminRow,
  AdminTable,
} from "@/features/admin/admin.types";
import {
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/features/products/products.hooks";
import type {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from "@/features/products/products.types";
import TrashIcon from "@/components/icons/TrashIcon";

type AdminTab = "overview" | "mongo" | "postgres" | "redis" | "analytics" | "activity";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "overview", label: "Overzicht" },
  { id: "mongo", label: "MongoDB" },
  { id: "postgres", label: "Postgres" },
  { id: "redis", label: "Redis" },
  { id: "analytics", label: "Analytics" },
  { id: "activity", label: "Activiteit" },
];

const emptyProduct: CreateProductRequest = {
  productName: "",
  productDescription: "",
  platform: "",
  genre: "",
  type: "key",
  price: 0,
  originalPrice: 0,
  discountPercent: 0,
  rating: 0,
  isNew: false,
  isFeatured: false,
};

function valueToText(value: AdminRow[string]) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Ja" : "Nee";
  return String(value);
}

function statLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [selectedTableName, setSelectedTableName] = useState("users");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<CreateProductRequest>(emptyProduct);
  const [message, setMessage] = useState("");

  // Modals / edit state
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; table?: AdminTable; row?: AdminRow }>({ open: false });
  const [editModal, setEditModal] = useState<{
    open: boolean;
    table?: AdminTable;
    row?: AdminRow;
    form?: Record<string, string>;
    showConfirm?: boolean;
    changes?: { key: string; before: string; after: string }[];
  }>({ open: false });
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<{ open: boolean; product?: Product }>({ open: false });

  const postgres = useAdminPostgresTables();
  const mongoProducts = useAdminMongoProducts();
  const refreshTokens = useAdminRefreshTokens();
  const analytics = useAdminAnalytics();
  const activity = useAdminActivityLog();
  const deletePostgresRow = useDeleteAdminPostgresRow();
  const createPostgresRow = useCreateAdminPostgresRow();
  const updatePostgresRow = useUpdateAdminPostgresRow();
  const revokeRefreshToken = useRevokeRefreshToken();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const selectedTable = useMemo(
    () => postgres.data?.find((table) => table.name === selectedTableName) ?? postgres.data?.[0],
    [postgres.data, selectedTableName]
  );

  const isBusy =
    createProduct.isPending ||
    updateProduct.isPending ||
    deleteProduct.isPending ||
    deletePostgresRow.isPending ||
    createPostgresRow.isPending ||
    updatePostgresRow.isPending ||
    revokeRefreshToken.isPending;

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      productName: product.productName,
      productDescription: product.productDescription ?? "",
      platform: product.platform,
      genre: product.genre,
      type: product.type,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercent: product.discountPercent,
      rating: product.rating,
      isNew: product.isNew,
      isFeatured: product.isFeatured,
    });
  };

  const openEditModal = (table: AdminTable, row: AdminRow) => {
    const form: Record<string, string> = {};
    Object.keys(row).forEach((k) => {
      form[k] = row[k] == null ? "" : String(row[k]);
    });
    setEditModal({ open: true, table, row, form, showConfirm: false });
  };

  const openCreateModal = (table: AdminTable) => {
    // Derive keys from first row if available
    const templateRow = table.rows[0];
    if (!templateRow) {
      setMessage("Cannot create row: no template available.");
      return;
    }
    const form: Record<string, string> = {};
    Object.keys(templateRow).forEach((k) => {
      if (k === "id" || k === "createdAt" || k === "updatedAt") return; // Skip auto fields
      form[k] = "";
    });
    setEditModal({ open: true, table, row: undefined, form, showConfirm: false });
  };

  const handleEditFieldChange = (field: string, value: string) => {
    setEditModal((s) => ({ ...s, form: { ...(s.form ?? {}), [field]: value } }));
  };

  const saveEditDraft = () => {
    if (!editModal.open || !editModal.row) return;
    const changes: { key: string; before: string; after: string }[] = [];
    const form = editModal.form ?? {};
    Object.keys(form).forEach((k) => {
      const before = editModal.row?.[k] == null ? "" : String(editModal.row?.[k]);
      const after = form[k] ?? "";
      if (before !== after) changes.push({ key: k, before, after });
    });
    setEditModal((s) => ({ ...s, showConfirm: true, changes }));
  };

  const confirmEdit = async () => {
    if (!editModal.open || !editModal.table || !editModal.changes) return;
    const payload: Record<string, any> = {};
    editModal.changes.forEach((c) => {
      // Convert string values to appropriate types
      if (c.after === "true") payload[c.key] = true;
      else if (c.after === "false") payload[c.key] = false;
      else if (c.after === "") payload[c.key] = null;
      else if (!isNaN(Number(c.after)) && c.after !== "") payload[c.key] = Number(c.after);
      else payload[c.key] = c.after;
    });

    setMessage("");
    // create vs update: if row has an id string -> update, otherwise create
    const id = editModal.row?.id;
    if (typeof id === "string") {
      await updatePostgresRow.mutateAsync({ tableName: editModal.table.name, id, payload });
      setMessage(`Rij bijgewerkt in ${editModal.table.name}.`);
    } else {
      await createPostgresRow.mutateAsync({ tableName: editModal.table.name, payload });
      setMessage(`Rij aangemaakt in ${editModal.table.name}.`);
    }

    setEditModal({ open: false });
  };

  const declineEdit = () => setEditModal({ open: false });

  const saveProduct = async () => {
    setMessage("");

    if (editingProduct) {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        data: productForm satisfies UpdateProductRequest,
      });
      setMessage("Product bijgewerkt.");
    } else {
      await createProduct.mutateAsync(productForm);
      setMessage("Product aangemaakt.");
    }

    resetProductForm();
    await mongoProducts.refetch();
  };

  const removeProduct = async (product: Product) => {
    setMessage("");
    await deleteProduct.mutateAsync(product.id);
    setMessage(`${product.productName} verwijderd.`);
    if (editingProduct?.id === product.id) resetProductForm();
    setConfirmDeleteProduct({ open: false });
    await mongoProducts.refetch();
  };

  const confirmDeleteProductFlow = (product: Product) => {
    setConfirmDeleteProduct({ open: true, product });
  };

  const onConfirmDeleteProduct = async () => {
    if (!confirmDeleteProduct.product) return;
    await removeProduct(confirmDeleteProduct.product);
  };

  const onDeclineDeleteProduct = () => {
    setConfirmDeleteProduct({ open: false });
  };

  const confirmDeleteRow = (table: AdminTable, row: AdminRow) => {
    setConfirmDelete({ open: true, table, row });
  };

  const onConfirmDelete = async () => {
    if (!confirmDelete.open || !confirmDelete.table || !confirmDelete.row) return;
    const id = confirmDelete.row.id;
    if (typeof id !== "string") return;
    setMessage("");
    await deletePostgresRow.mutateAsync({ tableName: confirmDelete.table.name, id });
    setMessage(`Rij verwijderd uit ${confirmDelete.table.name}.`);
    setConfirmDelete({ open: false });
  };

  const onDeclineDelete = () => setConfirmDelete({ open: false });

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D] text-gray-300">
      <div className="border-b border-[#1A1A1A] bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-[#F25B29] text-xs font-black uppercase tracking-wider mb-2">
            Admin
          </p>
          <h1 className="text-3xl font-black text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Beheer MongoDB, Postgres en Redis data vanuit een centrale console.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 border-b border-[#1A1A1A] mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#F25B29] text-[#F25B29]"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-[#F25B29]/30 bg-[#F25B29]/10 px-4 py-3 text-sm text-[#F25B29]">
            {message}
          </div>
        )}

        {activeTab === "overview" && (
          <OverviewPanel
            productCount={mongoProducts.data?.length ?? 0}
            tableCount={postgres.data?.length ?? 0}
            postgresRowCount={postgres.data?.reduce((sum, table) => sum + table.rows.length, 0) ?? 0}
            tokenCount={refreshTokens.data?.length ?? 0}
            isLoading={postgres.isLoading || mongoProducts.isLoading || refreshTokens.isLoading}
          />
        )}

        {activeTab === "mongo" && (
          <section className="grid lg:grid-cols-[360px_1fr] gap-6">
            <ProductEditor
              form={productForm}
              editingProduct={editingProduct}
              isBusy={isBusy}
              onCancel={resetProductForm}
              onChange={setProductForm}
              onSave={saveProduct}
            />
            <ProductTable
              products={mongoProducts.data ?? []}
              isLoading={mongoProducts.isLoading}
              isBusy={isBusy}
              onEdit={startEditProduct}
              onDelete={confirmDeleteProductFlow}
            />
          </section>
        )}

        {activeTab === "postgres" && (
          <PostgresPanel
            tables={postgres.data ?? []}
            selectedTable={selectedTable}
            selectedTableName={selectedTableName}
            isLoading={postgres.isLoading}
            isBusy={isBusy}
            onSelectTable={setSelectedTableName}
            onDeleteRow={confirmDeleteRow}
            onEditRow={openEditModal}
            onCreateRow={openCreateModal}
          />
        )}

        {activeTab === "redis" && (
          <RedisPanel
            tokens={refreshTokens.data ?? []}
            isLoading={refreshTokens.isLoading}
            isBusy={isBusy}
            onRevoke={async (token) => {
              setMessage("");
              await revokeRefreshToken.mutateAsync(token);
              setMessage("Refresh token ingetrokken.");
            }}
          />
        )}

        {activeTab === "analytics" && <AnalyticsPanel data={analytics.data} isLoading={analytics.isLoading} />}
        {activeTab === "activity" && <ActivityPanel activities={activity.data ?? []} isLoading={activity.isLoading} />}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete.open && confirmDelete.table && confirmDelete.row && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-white font-black text-lg mb-3">Bevestig verwijderen</h3>
            <p className="text-gray-400 text-sm mb-4">Weet je zeker dat je deze rij wilt verwijderen uit <span className="font-bold text-[#F25B29]">{confirmDelete.table.name}</span>?</p>
            <div className="rounded-md bg-[#0D0D0D] border border-[#1A1A1A] p-3 mb-4 text-sm max-h-48 overflow-auto">
              {Object.keys(confirmDelete.row).map((k) => (
                <div key={k} className="flex justify-between text-gray-300 py-1">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-mono">{String(confirmDelete.row![k] ?? "-")}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={onDeclineDelete} className="px-4 py-2 bg-[#2A2A2A] text-gray-300 rounded">Decline</button>
              <button onClick={onConfirmDelete} className="px-4 py-2 bg-[#F25B29] text-white rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal + Confirm Changes */}
      {editModal.open && editModal.table && editModal.row && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-6 w-full max-w-3xl">
            <h3 className="text-white font-black text-lg mb-3">Rij bewerken ({editModal.table.name})</h3>
            {!editModal.showConfirm && (
              <div>
                <div className="max-h-72 overflow-auto mb-4">
                  {Object.keys(editModal.form ?? {}).map((k) => {
                    // Skip id and auto-timestamp fields for creation
                    if (k === "id" || k === "createdAt" || k === "updatedAt") return null;
                    return (
                      <label key={k} className="block mb-2">
                        <span className="text-xs text-gray-500 uppercase">{k}</span>
                        <input value={(editModal.form as any)[k] ?? ""} onChange={(e) => handleEditFieldChange(k, e.target.value)} className="mt-1 w-full bg-[#0D0D0D] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29]" />
                      </label>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={declineEdit} className="px-4 py-2 bg-[#2A2A2A] text-gray-300 rounded font-bold">Decline</button>
                  <button onClick={saveEditDraft} className="px-4 py-2 bg-[#F25B29] text-white rounded font-bold">Save</button>
                </div>
              </div>
            )}

            {editModal.showConfirm && (
              <div>
                <p className="text-gray-400 text-sm mb-3">De volgende velden worden aangepast. Bevestig of annuleer.</p>
                <div className="mb-4 max-h-56 overflow-auto">
                  {(editModal.changes ?? []).map((c) => (
                    <div key={c.key} className="flex justify-between items-center gap-4 py-2 border-b border-[#1A1A1A]">
                      <div>
                        <div className="text-sm text-gray-300 font-bold">{c.key}</div>
                        <div className="text-xs text-gray-500">{c.before} → {c.after}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditModal({ open: false })} className="px-4 py-2 bg-[#2A2A2A] text-gray-300 rounded font-bold">Decline</button>
                  <button onClick={confirmEdit} className="px-4 py-2 bg-[#F25B29] text-white rounded font-bold">Confirm</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Delete Product Modal */}
      {confirmDeleteProduct.open && confirmDeleteProduct.product && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-white font-black text-lg mb-3">Product verwijderen</h3>
            <p className="text-gray-400 text-sm mb-4">Weet je zeker dat je <span className="font-bold text-[#F25B29]">{confirmDeleteProduct.product.productName}</span> wilt verwijderen?</p>
            <div className="rounded-md bg-[#0D0D0D] border border-[#1A1A1A] p-3 mb-4 text-sm max-h-48 overflow-auto">
              <div className="flex justify-between text-gray-300 py-1"><span className="text-gray-500">Naam</span><span className="font-mono">{confirmDeleteProduct.product.productName}</span></div>
              <div className="flex justify-between text-gray-300 py-1"><span className="text-gray-500">Platform</span><span className="font-mono">{confirmDeleteProduct.product.platform}</span></div>
              <div className="flex justify-between text-gray-300 py-1"><span className="text-gray-500">Prijs</span><span className="font-mono">€{confirmDeleteProduct.product.price.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={onDeclineDeleteProduct} className="px-4 py-2 bg-[#2A2A2A] text-gray-300 rounded font-bold">Decline</button>
              <button onClick={onConfirmDeleteProduct} className="px-4 py-2 bg-red-600 text-white rounded font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function OverviewPanel({
  productCount,
  tableCount,
  postgresRowCount,
  tokenCount,
  isLoading,
}: {
  productCount: number;
  tableCount: number;
  postgresRowCount: number;
  tokenCount: number;
  isLoading: boolean;
}) {
  const cards = [
    { label: "MongoDB", value: statLabel(productCount, "product", "producten") },
    { label: "Postgres", value: `${tableCount} tabellen, ${postgresRowCount} rijen` },
    { label: "Redis", value: statLabel(tokenCount, "sessie", "sessies") },
    { label: "Analytics", value: "Tab klaar voor integratie" },
  ];

  if (isLoading) {
    return <LoadingRows />;
  }

  return (
    <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
          <p className="text-gray-500 text-xs font-black uppercase tracking-wider">{card.label}</p>
          <p className="text-white text-2xl font-black mt-3">{card.value}</p>
        </div>
      ))}
    </section>
  );
}

function ProductEditor({
  form,
  editingProduct,
  isBusy,
  onCancel,
  onChange,
  onSave,
}: {
  form: CreateProductRequest;
  editingProduct: Product | null;
  isBusy: boolean;
  onCancel: () => void;
  onChange: (form: CreateProductRequest) => void;
  onSave: () => void;
}) {
  const updateField = <K extends keyof CreateProductRequest>(
    field: K,
    value: CreateProductRequest[K]
  ) => onChange({ ...form, [field]: value });

  return (
    <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5 h-fit">
      <h2 className="text-white font-black text-lg mb-4">
        {editingProduct ? "Product bewerken" : "Nieuw product"}
      </h2>

      <div className="space-y-3">
        <AdminInput label="Naam" value={form.productName} onChange={(value) => updateField("productName", value)} />
        <AdminInput label="Omschrijving" value={form.productDescription} onChange={(value) => updateField("productDescription", value)} />
        <div className="grid grid-cols-2 gap-3">
          <AdminInput label="Platform" value={form.platform} onChange={(value) => updateField("platform", value)} />
          <AdminInput label="Genre" value={form.genre} onChange={(value) => updateField("genre", value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Type</span>
            <select
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
              className="mt-1 w-full bg-[#0D0D0D] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29]"
            >
              <option value="key">Key</option>
              <option value="disc">Disc</option>
            </select>
          </label>
          <AdminNumber label="Rating" value={form.rating} onChange={(value) => updateField("rating", value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <AdminNumber label="Prijs" value={form.price} onChange={(value) => updateField("price", value)} />
          <AdminNumber label="Origineel" value={form.originalPrice} onChange={(value) => updateField("originalPrice", value)} />
          <AdminNumber label="Korting" value={form.discountPercent} onChange={(value) => updateField("discountPercent", value)} />
        </div>
        <div className="flex gap-4">
          <AdminCheckbox label="Nieuw" checked={form.isNew} onChange={(value) => updateField("isNew", value)} />
          <AdminCheckbox label="Featured" checked={form.isFeatured} onChange={(value) => updateField("isFeatured", value)} />
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        <button
          onClick={onSave}
          disabled={isBusy || !form.productName || !form.platform || !form.genre}
          className="flex-1 bg-[#F25B29] disabled:bg-[#3A2219] disabled:text-gray-500 hover:bg-[#d94e22] text-white rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {editingProduct ? "Opslaan" : "Aanmaken"}
        </button>
        {editingProduct && (
          <button
            onClick={onCancel}
            disabled={isBusy}
            className="border border-[#2A2A2A] text-gray-400 hover:text-white rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer"
          >
            Annuleren
          </button>
        )}
      </div>
    </div>
  );
}

function AdminInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full bg-[#0D0D0D] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29]"
      />
    </label>
  );
}

function AdminNumber({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full bg-[#0D0D0D] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29]"
      />
    </label>
  );
}

function AdminCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-[#F25B29]"
      />
      {label}
    </label>
  );
}

function ProductTable({
  products,
  isLoading,
  isBusy,
  onEdit,
  onDelete,
}: {
  products: Product[];
  isLoading: boolean;
  isBusy: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <div className="rounded-lg border border-[#1E1E1E] bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1A1A1A] flex items-center justify-between">
        <h2 className="text-white font-black">MongoDB producten</h2>
        <span className="text-gray-500 text-sm">{products.length} items</span>
      </div>
      {isLoading ? <LoadingRows /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 uppercase text-xs">
              <tr>
                <th className="text-left px-5 py-3">Naam</th>
                <th className="text-left px-5 py-3">Platform</th>
                <th className="text-left px-5 py-3">Prijs</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#151515]">
                  <td className="px-5 py-3 text-white font-bold">{product.productName}</td>
                  <td className="px-5 py-3">{product.platform}</td>
                  <td className="px-5 py-3">€{product.price.toFixed(2)}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {[product.isNew && "Nieuw", product.isFeatured && "Featured"].filter(Boolean).join(", ") || "-"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        disabled={isBusy}
                        className="border border-[#2A2A2A] hover:border-[#F25B29]/40 text-gray-300 hover:text-[#F25B29] rounded-md px-3 py-1.5 text-xs font-bold cursor-pointer"
                      >
                        Bewerken
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        disabled={isBusy}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-md cursor-pointer"
                        aria-label={`${product.productName} verwijderen`}
                        title="Verwijderen"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PostgresPanel({
  tables,
  selectedTable,
  selectedTableName,
  isLoading,
  isBusy,
  onSelectTable,
  onDeleteRow,
  onEditRow,
  onCreateRow,
}: {
  tables: AdminTable[];
  selectedTable: AdminTable | undefined;
  selectedTableName: string;
  isLoading: boolean;
  isBusy: boolean;
  onSelectTable: (name: string) => void;
  onDeleteRow: (table: AdminTable, row: AdminRow) => void;
  onEditRow: (table: AdminTable, row: AdminRow) => void;
  onCreateRow: (table: AdminTable) => void;
}) {
  return (
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
          {selectedTable && selectedTable.canDelete && (
            <div className="flex gap-2">
              <button onClick={() => onCreateRow(selectedTable)} className="border border-[#2A2A2A] text-gray-300 hover:text-white rounded-md px-3 py-1.5 text-xs font-bold">New row</button>
            </div>
          )}
        </div>
        {isLoading || !selectedTable ? <LoadingRows /> : (
          <AdminDataTable table={selectedTable} isBusy={isBusy} onDeleteRow={onDeleteRow} onEditRow={onEditRow} />
        )}
      </div>
    </section>
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
            {columns.map((column) => (
              <th key={column} className="text-left px-5 py-3 whitespace-nowrap">{column}</th>
            ))}
            <th className="sticky right-0 bg-[#111] text-right px-5 py-3 z-10">Acties</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A1A1A]">
          {table.rows.map((row) => (
            <tr key={String(row.id)} className="hover:bg-[#151515]">
              {columns.map((column) => (
                <td key={column} className="px-5 py-3 whitespace-nowrap max-w-[260px] truncate">
                  {valueToText(row[column])}
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
                      aria-label={`Rij uit ${table.name} verwijderen`}
                      title="Verwijderen"
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

function RedisPanel({
  tokens,
  isLoading,
  isBusy,
  onRevoke,
}: {
  tokens: { token: string; tokenPreview: string; userId: string; expiresAt: string | null }[];
  isLoading: boolean;
  isBusy: boolean;
  onRevoke: (token: string) => void;
}) {
  return (
    <section className="rounded-lg border border-[#1E1E1E] bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1A1A1A] flex items-center justify-between">
        <h2 className="text-white font-black">Redis refresh tokens</h2>
        <span className="text-gray-500 text-sm">{tokens.length} actief</span>
      </div>
      {isLoading ? <LoadingRows /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 uppercase text-xs">
              <tr>
                <th className="text-left px-5 py-3">Token</th>
                <th className="text-left px-5 py-3">User ID</th>
                <th className="text-left px-5 py-3">Verloopt</th>
                <th className="text-right px-5 py-3">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {tokens.map((token) => (
                <tr key={token.token} className="hover:bg-[#151515]">
                  <td className="px-5 py-3 text-white font-mono">{token.tokenPreview}</td>
                  <td className="px-5 py-3 font-mono text-gray-500">{token.userId}</td>
                  <td className="px-5 py-3">{token.expiresAt ? new Date(token.expiresAt).toLocaleString() : "-"}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => onRevoke(token.token)}
                      disabled={isBusy}
                      className="border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-md px-3 py-1.5 text-xs font-bold cursor-pointer"
                    >
                      Intrekken
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tokens.length === 0 && <p className="text-gray-500 p-5 text-sm">Geen actieve tokens gevonden.</p>}
        </div>
      )}
    </section>
  );
}

function AnalyticsPanel({ data, isLoading }: { data?: AdminAnalytics; isLoading: boolean }) {
  if (isLoading) {
    return <LoadingRows />;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-8">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-[#F25B29] text-xs font-black uppercase tracking-wider mb-2">Analytics</p>
            <h2 className="text-white text-2xl font-black">Realtime verkoop en activiteit</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-2xl">
              Inzicht in bestellingen, betalingen en populaire producten. Deze cijfers zijn gebaseerd op de huidige database.
            </p>
          </div>
          <div className="rounded-full border border-[#2A2A2A] px-4 py-2 text-sm text-gray-300 bg-[#0D0D0D]">
            Laatste update: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
          <p className="text-gray-500 text-xs font-black uppercase tracking-wider">Bestellingen</p>
          <p className="text-white text-3xl font-black mt-3">{data?.totalOrders ?? 0}</p>
          <p className="text-gray-500 text-sm mt-2">Aantal bestellingen in het systeem.</p>
        </div>
        <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
          <p className="text-gray-500 text-xs font-black uppercase tracking-wider">Betalingen</p>
          <p className="text-white text-3xl font-black mt-3">{data?.totalPayments ?? 0}</p>
          <p className="text-gray-500 text-sm mt-2">Aantal afgeronde betalingstransacties.</p>
        </div>
        <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
          <p className="text-gray-500 text-xs font-black uppercase tracking-wider">Wishlist acties</p>
          <p className="text-white text-3xl font-black mt-3">{data?.totalWishlistItems ?? 0}</p>
          <p className="text-gray-500 text-sm mt-2">Hoe vaak producten zijn toegevoegd aan wishlist.</p>
        </div>
        <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
          <p className="text-gray-500 text-xs font-black uppercase tracking-wider">Gebruikers</p>
          <p className="text-white text-3xl font-black mt-3">{data?.totalUsers ?? 0}</p>
          <p className="text-gray-500 text-sm mt-2">Aantal geregistreerde gebruikers.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
          <h3 className="text-white font-black mb-4">Top bestelde producten</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            {(data?.topProducts.length ? data.topProducts : [{ productId: "-", productName: "Nog geen orders", orderCount: 0 }]).map((product) => (
              <li key={product.productId} className="rounded-lg border border-[#1A1A1A] bg-[#0D0D0D] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-white truncate">{product.productName}</p>
                    <p className="text-gray-500 text-xs truncate">ID: {product.productId}</p>
                  </div>
                  <span className="text-sm text-[#F25B29] font-black">{product.orderCount}x</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
          <h3 className="text-white font-black mb-4">Tracking status</h3>
          <p className="text-gray-500 text-sm mb-4">
            De frontend kent momenteel nog geen pageview-tracking. Voor live bekijkstatistieken kan dit later gekoppeld worden aan een aparte analytics-collectie.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-[#1A1A1A] bg-[#0D0D0D] p-4">
              <p className="text-white font-bold">Bekeken productpagina's</p>
              <p className="text-gray-500 text-sm mt-2">Nog geen event tracking beschikbaar.</p>
            </div>
            <div className="rounded-lg border border-[#1A1A1A] bg-[#0D0D0D] p-4">
              <p className="text-white font-bold">Conversie</p>
              <p className="text-gray-500 text-sm mt-2">Laat zien hoeveel bezoekers tot een bestelling komen zodra tracking is toegevoegd.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivityPanel({ activities, isLoading }: { activities: AdminActivityEntry[]; isLoading: boolean }) {
  if (isLoading) {
    return <LoadingRows />;
  }

  return (
    <section className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[#F25B29] text-xs font-black uppercase tracking-wider mb-2">Activiteit</p>
          <h2 className="text-white text-2xl font-black">Recente database acties</h2>
        </div>
        <span className="text-gray-500 text-sm">Laatste 20 gebeurtenissen</span>
      </div>

      {activities.length === 0 ? (
        <div className="mt-8 text-gray-500 text-sm">Er zijn nog geen recente acties beschikbaar.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="rounded-lg border border-[#1A1A1A] bg-[#0D0D0D] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-gray-300 text-sm">{activity.description}</p>
                <span className="text-gray-500 text-xs">{new Date(activity.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LoadingRows() {
  return (
    <div className="pt-16 min-h-[220px] flex items-center justify-center bg-[#111] rounded-b-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-gray-400 text-sm">Data laden...</p>
      </div>
    </div>
  );
}

export default AdminDashboard;
