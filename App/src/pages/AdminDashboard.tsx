import { useMemo, useState } from "react";
import {
  useAdminMongoProducts,
  useAdminPostgresTables,
  useAdminRefreshTokens,
  useDeleteAdminPostgresRow,
  useRevokeRefreshToken,
} from "@/features/admin/admin.hooks";
import type { AdminRow, AdminTable } from "@/features/admin/admin.types";
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

type AdminTab = "overview" | "mongo" | "postgres" | "redis" | "analytics";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "overview", label: "Overzicht" },
  { id: "mongo", label: "MongoDB" },
  { id: "postgres", label: "Postgres" },
  { id: "redis", label: "Redis" },
  { id: "analytics", label: "Analytics" },
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

  const postgres = useAdminPostgresTables();
  const mongoProducts = useAdminMongoProducts();
  const refreshTokens = useAdminRefreshTokens();
  const deletePostgresRow = useDeleteAdminPostgresRow();
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
    await mongoProducts.refetch();
  };

  const removePostgresRow = async (table: AdminTable, row: AdminRow) => {
    const id = row.id;
    if (typeof id !== "string") return;
    setMessage("");
    await deletePostgresRow.mutateAsync({ tableName: table.name, id });
    setMessage(`Rij verwijderd uit ${table.name}.`);
  };

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
              onDelete={removeProduct}
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
            onDeleteRow={removePostgresRow}
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

        {activeTab === "analytics" && <AnalyticsPanel />}
      </div>
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

  return (
    <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
          <p className="text-gray-500 text-xs font-black uppercase tracking-wider">{card.label}</p>
          <p className="text-white text-2xl font-black mt-3">{isLoading ? "..." : card.value}</p>
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
}: {
  tables: AdminTable[];
  selectedTable: AdminTable | undefined;
  selectedTableName: string;
  isLoading: boolean;
  isBusy: boolean;
  onSelectTable: (name: string) => void;
  onDeleteRow: (table: AdminTable, row: AdminRow) => void;
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
        <div className="px-5 py-4 border-b border-[#1A1A1A]">
          <h2 className="text-white font-black">{selectedTable?.name ?? "Postgres tabellen"}</h2>
        </div>
        {isLoading || !selectedTable ? <LoadingRows /> : (
          <AdminDataTable table={selectedTable} isBusy={isBusy} onDeleteRow={onDeleteRow} />
        )}
      </div>
    </section>
  );
}

function AdminDataTable({
  table,
  isBusy,
  onDeleteRow,
}: {
  table: AdminTable;
  isBusy: boolean;
  onDeleteRow: (table: AdminTable, row: AdminRow) => void;
}) {
  const columns = Object.keys(table.rows[0] ?? {});

  if (table.rows.length === 0) {
    return <p className="text-gray-500 p-5 text-sm">Geen rijen gevonden.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-gray-500 uppercase text-xs">
          <tr>
            {columns.map((column) => (
              <th key={column} className="text-left px-5 py-3 whitespace-nowrap">{column}</th>
            ))}
            <th className="text-right px-5 py-3">Acties</th>
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
              <td className="px-5 py-3 text-right">
                {table.canDelete ? (
                  <button
                    onClick={() => onDeleteRow(table, row)}
                    disabled={isBusy}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-md cursor-pointer"
                    aria-label={`Rij uit ${table.name} verwijderen`}
                    title="Verwijderen"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
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

function AnalyticsPanel() {
  return (
    <section className="rounded-lg border border-dashed border-[#2A2A2A] bg-[#111] p-8">
      <p className="text-[#F25B29] text-xs font-black uppercase tracking-wider mb-2">Analytics</p>
      <h2 className="text-white text-2xl font-black">Klaar voor integratie</h2>
      <p className="text-gray-500 text-sm mt-2 max-w-2xl">
        Deze tab staat alvast in de admin navigatie. Grafieken, KPI's en reporting kunnen hier later op worden aangesloten.
      </p>
    </section>
  );
}

function LoadingRows() {
  return (
    <div className="p-5 text-gray-500 text-sm">
      Data laden...
    </div>
  );
}

export default AdminDashboard;
