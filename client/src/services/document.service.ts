import { apiDelete } from '../utils/api.utils';
import { getAccessToken } from '../utils/auth.utils';
import { BUSINESS_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../config/api.config';
import type { FileDocument } from '../types/business.types';

/**
 * Raw fetch, not the shared apiFetch helper - same reasoning as
 * uploadProductImage in product.service.ts: apiFetch hardcodes
 * Content-Type: application/json, which breaks a multipart upload.
 */
export const uploadDocument = async (businessId: string, file: File): Promise<FileDocument> => {
  const formData = new FormData();
  formData.append('document', file);

  const accessToken = getAccessToken();
  const res = await fetch(BUSINESS_ENDPOINTS.DOCUMENT_UPLOAD(businessId), {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData,
  });

  const data: ApiResponse<FileDocument> = await res.json();
  if (!data.success) throw new Error((data as any).error?.message || 'Failed to upload document');
  return data.data;
};

export const deleteDocument = async (businessId: string, fileName: string): Promise<void> => {
  const response: ApiResponse<{ message: string }> = await apiDelete(BUSINESS_ENDPOINTS.DOCUMENT_DELETE(businessId, fileName));
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to delete document');
};

export default { uploadDocument, deleteDocument };
