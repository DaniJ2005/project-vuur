import type { Product, CreateProductRequest } from "@/features/products/products.types";
import type { useProductEditor } from "../hooks/useProductEditor";
import { LoadingRows } from "./shared/LoadingRows";
import { AdminInput, AdminNumber, AdminCheckbox } from "./shared/AdminInput";
import { ConfirmModal } from "./shared/ConfirmModal";
import TrashIcon from "@/components/icons/TrashIcon";

type ProductEditorState = ReturnType<typeof useProductEditor>;

interface MongoPanelProps {
  products: Product[];
  isLoading: boolean;
  editor: ProductEditorState;
}

export function MongoPanel({ products, isLoading, editor }: MongoPanelProps) {
  return (
    <>
      <section className="grid lg:grid-cols-[360px_1fr] gap-6">
        <ProductEditor editor={editor} />
        <ProductTable
          products={products}
          isLoading={isLoading}
          isBusy={editor.isBusy}
          onEdit={editor.startEdit}
          onDelete={editor.openConfirmDelete}
        />
      </section>

      {editor.confirmDeleteProduct.open && editor.confirmDeleteProduct.product && (
        <ConfirmModal
          title="Product verwijderen"
          confirmLabel="Verwijderen"
          confirmClass="bg-red-600"
          description={
            <>
              Weet je zeker dat je{" "}
              <span className="font-bold text-[#F25B29]">
                {editor.confirmDeleteProduct.product.productName}
              </span>{" "}
              wilt verwijderen?
            </>
          }
          preview={
            <div className="space-y-1">
              <PreviewRow label="Naam" value={editor.confirmDeleteProduct.product.productName} />
              <PreviewRow label="Platform" value={editor.confirmDeleteProduct.product.platform} />
              <PreviewRow label="Prijs" value={`€${editor.confirmDeleteProduct.product.price.toFixed(2)}`} />
            </div>
          }
          onConfirm={editor.confirmDelete}
          onDecline={editor.declineDelete}
        />
      )}
    </>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-300 py-1">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function ProductEditor({ editor }: { editor: ProductEditorState }) {
  const { form, setForm, editingProduct, isBusy, reset, save } = editor;

  const update = <K extends keyof CreateProductRequest>(field: K, value: CreateProductRequest[K]) =>
    setForm({ ...form, [field]: value });

  return (
    <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5 h-fit">
      <h2 className="text-white font-black text-lg mb-4">
        {editingProduct ? "Product bewerken" : "Nieuw product"}
      </h2>

      <div className="space-y-3">
        <AdminInput label="Naam" value={form.productName} onChange={(v) => update("productName", v)} />
        <AdminInput label="Omschrijving" value={form.productDescription} onChange={(v) => update("productDescription", v)} />
        <div className="grid grid-cols-2 gap-3">
          <AdminInput label="Platform" value={form.platform} onChange={(v) => update("platform", v)} />
          <AdminInput label="Genre" value={form.genre} onChange={(v) => update("genre", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Type</span>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="mt-1 w-full bg-[#0D0D0D] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29]"
            >
              <option value="key">Key</option>
              <option value="disc">Disc</option>
            </select>
          </label>
          <AdminNumber label="Rating" value={form.rating} onChange={(v) => update("rating", v)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <AdminNumber label="Prijs" value={form.price} onChange={(v) => update("price", v)} />
          <AdminNumber label="Origineel" value={form.originalPrice} onChange={(v) => update("originalPrice", v)} />
          <AdminNumber label="Korting" value={form.discountPercent} onChange={(v) => update("discountPercent", v)} />
        </div>
        <div className="flex gap-4">
          <AdminCheckbox label="Nieuw" checked={form.isNew} onChange={(v) => update("isNew", v)} />
          <AdminCheckbox label="Featured" checked={form.isFeatured} onChange={(v) => update("isFeatured", v)} />
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        <button
          onClick={save}
          disabled={isBusy || !form.productName || !form.platform || !form.genre}
          className="flex-1 bg-[#F25B29] disabled:bg-[#3A2219] disabled:text-gray-500 hover:bg-[#d94e22] text-white rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {editingProduct ? "Opslaan" : "Aanmaken"}
        </button>
        {editingProduct && (
          <button
            onClick={reset}
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
      {isLoading ? (
        <LoadingRows />
      ) : (
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
                    {[product.isNew && "Nieuw", product.isFeatured && "Featured"]
                      .filter(Boolean)
                      .join(", ") || "-"}
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
