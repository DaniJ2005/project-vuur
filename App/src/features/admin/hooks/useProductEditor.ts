import { useState } from "react";
import type { Product, CreateProductRequest, ProductVariantInput } from "@/features/products/products.types";
import type { GameType } from "@/types/game";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/features/products/products.hooks";

const emptyVariant: ProductVariantInput = {
  platform: "Steam",
  format: "key",
  price: 0,
  originalPrice: 0,
  discountPercent: 0,
};

const emptyProduct: CreateProductRequest = {
  productName: "",
  productDescription: "",
  genre: "",
  variants: [{ ...emptyVariant }],
  rating: 0,
  flags: [],
};

export function useProductEditor(onMessage: (msg: string) => void, onRefetch: () => void) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<CreateProductRequest>(emptyProduct);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<{ open: boolean; product?: Product }>({ open: false });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const isBusy = createProduct.isPending || updateProduct.isPending || deleteProduct.isPending;

  const reset = () => {
    setEditingProduct(null);
    setForm({ ...emptyProduct, variants: [{ ...emptyVariant }] });
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      productName: product.productName,
      productDescription: product.productDescription ?? "",
      genre: product.genre,
      variants: product.variants.map((v) => ({
        platform: v.platform,
        format: v.format,
        price: v.price,
        originalPrice: v.originalPrice,
        discountPercent: v.discountPercent,
      })),
      rating: product.rating,
      flags: [...product.flags],
    });
  };

  // ── Variant + flag helpers ───────────────────────────────────────────────────
  const addVariant = () =>
    setForm((f) => ({ ...f, variants: [...f.variants, { ...emptyVariant }] }));

  const removeVariant = (index: number) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== index) }));

  const updateVariant = <K extends keyof ProductVariantInput>(
    index: number,
    field: K,
    value: ProductVariantInput[K],
  ) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));

  const toggleFlag = (flag: string) =>
    setForm((f) => ({
      ...f,
      flags: f.flags.includes(flag) ? f.flags.filter((x) => x !== flag) : [...f.flags, flag],
    }));

  const save = async () => {
    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, data: form });
      onMessage("Product bijgewerkt.");
    } else {
      await createProduct.mutateAsync(form);
      onMessage("Product aangemaakt.");
    }
    reset();
    onRefetch();
  };

  const openConfirmDelete = (product: Product) => setConfirmDeleteProduct({ open: true, product });
  const declineDelete = () => setConfirmDeleteProduct({ open: false });

  const confirmDelete = async () => {
    if (!confirmDeleteProduct.product) return;
    const product = confirmDeleteProduct.product;
    await deleteProduct.mutateAsync(product.id);
    onMessage(`${product.productName} verwijderd.`);
    if (editingProduct?.id === product.id) reset();
    setConfirmDeleteProduct({ open: false });
    onRefetch();
  };

  return {
    form,
    setForm,
    editingProduct,
    isBusy,
    confirmDeleteProduct,
    startEdit,
    reset,
    save,
    addVariant,
    removeVariant,
    updateVariant,
    toggleFlag,
    openConfirmDelete,
    declineDelete,
    confirmDelete,
  };
}

export const PLATFORM_OPTIONS = ["Steam", "PlayStation", "Xbox", "Nintendo"];
export const FORMAT_OPTIONS: GameType[] = ["key", "disc"];
