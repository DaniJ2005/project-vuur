import { useState } from "react";
import type { Product, CreateProductRequest } from "@/features/products/products.types";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/features/products/products.hooks";

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
    setForm(emptyProduct);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
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

  const openConfirmDelete = (product: Product) =>
    setConfirmDeleteProduct({ open: true, product });

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
    openConfirmDelete,
    declineDelete,
    confirmDelete,
  };
}
