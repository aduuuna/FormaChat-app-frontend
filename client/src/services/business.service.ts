import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api.utils';
import { BUSINESS_ENDPOINTS } from '../config/api.config';
import type {
  Business,
  CreateBusinessRequest,
  UpdateBusinessRequest,
  BusinessListResponse
} from '../types/business.types';
import type { ApiResponse } from '../config/api.config';


export const createBusiness = async (
  businessData: CreateBusinessRequest
): Promise<Business> => {
  console.log('[BusinessService] Creating business...');

  const response: ApiResponse<Business> = await apiPost(
    BUSINESS_ENDPOINTS.CREATE,
    businessData
  );

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to create business');
  }

  console.log('[BusinessService] ✓ Business created:', response.data._id);
  return response.data;
};


export const getBusinesses = async (
  page: number = 1,
  limit: number = 10
): Promise<Business[]> => {
  console.log('[BusinessService] Fetching businesses...');

  const url = `${BUSINESS_ENDPOINTS.LIST}?page=${page}&limit=${limit}`;

  const response: ApiResponse<BusinessListResponse> = await apiGet(url);

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to fetch businesses');
  }

  console.log('[BusinessService] ✓ Fetched', response.data.businesses.length, 'businesses');
  return response.data.businesses;
};

export const getBusinessById = async (
  businessId: string, 
  isPublic: boolean = false
): Promise<Business> => {
  console.log('[BusinessService] Fetching business:', businessId, '(public:', isPublic + ')');

  const endpoint = isPublic 
    ? BUSINESS_ENDPOINTS.PUBLIC_DETAILS(businessId) 
    : BUSINESS_ENDPOINTS.DETAILS(businessId);
  
  console.log('[BusinessService] Using endpoint:', endpoint);
  
  const response: ApiResponse<Business> = await apiGet(endpoint);

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to fetch business details');
  }

  console.log('[BusinessService] ✓ Fetched business:', response.data.basicInfo.businessName);
  return response.data;
};


export const updateBusiness = async (
  businessId: string,
  updateData: UpdateBusinessRequest
): Promise<Business> => {
  console.log('[BusinessService] Updating business:', businessId);

  const response: ApiResponse<Business> = await apiPut(
    BUSINESS_ENDPOINTS.UPDATE(businessId),
    updateData
  );

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to update business');
  }

  console.log('[BusinessService] ✓ Business updated:', response.data._id);
  return response.data;
};


export const deleteBusiness = async (businessId: string): Promise<{ message: string }> => {
  console.log('[BusinessService] Deleting business:', businessId);

  const response: ApiResponse<{ message: string; businessId: string }> = await apiDelete(
    BUSINESS_ENDPOINTS.DELETE(businessId)
  );

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to delete business');
  }

  console.log('[BusinessService] ✓ Business deleted:', businessId);
  return { message: response.data.message };
};


export const businessExists = async (businessId: string): Promise<boolean> => {
  try {
    await getBusinessById(businessId);
    return true;
  } catch (error) {
    return false;
  }
};


export const getBusinessName = async (businessId: string): Promise<string> => {
  const business = await getBusinessById(businessId);
  return business.basicInfo.businessName;
};


export default {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  businessExists,
  getBusinessName
};