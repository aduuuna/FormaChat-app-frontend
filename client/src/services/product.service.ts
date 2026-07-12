import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api.utils';
import { getAccessToken } from '../utils/auth.utils';
import { BUSINESS_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../config/api.config';

export interface Product {
  _id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stockQuantity?: number;
  category?: string;
  imageUrl?: string;
}

export const listProducts = async (businessId: string): Promise<Product[]> => {
  const response: ApiResponse<Product[]> = await apiGet(BUSINESS_ENDPOINTS.PRODUCTS(businessId));
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to load products');
  return response.data;
};

export const createProduct = async (businessId: string, input: ProductInput): Promise<Product> => {
  const response: ApiResponse<Product> = await apiPost(BUSINESS_ENDPOINTS.PRODUCTS(businessId), input);
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to create product');
  return response.data;
};

export const updateProduct = async (
  businessId: string,
  productId: string,
  updates: Partial<ProductInput> & { isActive?: boolean }
): Promise<Product> => {
  const response: ApiResponse<Product> = await apiPut(BUSINESS_ENDPOINTS.PRODUCT_DETAIL(businessId, productId), updates);
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to update product');
  return response.data;
};

export const updateProductStock = async (businessId: string, productId: string, stockQuantity: number): Promise<void> => {
  const url = BUSINESS_ENDPOINTS.PRODUCT_STOCK(businessId, productId);
  const accessToken = getAccessToken();
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ stockQuantity }),
  });
  const data: ApiResponse = await res.json();
  if (!data.success) throw new Error((data as any).error?.message || 'Failed to update stock');
};

export const deleteProduct = async (businessId: string, productId: string): Promise<void> => {
  const response: ApiResponse<{ message: string }> = await apiDelete(BUSINESS_ENDPOINTS.PRODUCT_DETAIL(businessId, productId));
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to delete product');
};

/**
 * Raw fetch, not the shared apiFetch helper - apiFetch hardcodes
 * Content-Type: application/json, which breaks a multipart file upload
 * (the browser needs to set its own Content-Type with the form boundary).
 */
export const uploadProductImage = async (businessId: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const accessToken = getAccessToken();
  const res = await fetch(BUSINESS_ENDPOINTS.PRODUCT_IMAGE_UPLOAD(businessId), {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData,
  });

  const data: ApiResponse<{ imageUrl: string }> = await res.json();
  if (!data.success) throw new Error((data as any).error?.message || 'Failed to upload image');
  return data.data.imageUrl;
};

export default {
  listProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  uploadProductImage,
};
