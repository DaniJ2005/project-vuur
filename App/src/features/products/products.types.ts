export interface Product {
  id: string;

  productName: string;
  productDescription?: string;

  platform: string;
  genre: string;
  type: string;

  price: number;
  originalPrice: number;
  discountPercent: number;

  rating: number;

  isNew: boolean;
  isFeatured: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  productName: string;
  productDescription: string;

  platform: string;
  genre: string;
  type: string;

  price: number;
  originalPrice: number;
  discountPercent: number;

  rating: number;

  isNew: boolean;
  isFeatured: boolean;
}

export interface UpdateProductRequest {
  productName?: string;
  productDescription?: string;

  platform?: string;
  genre?: string;
  type?: string;

  price?: number;
  originalPrice?: number;
  discountPercent?: number;

  rating?: number;

  isNew?: boolean;
  isFeatured?: boolean;
}