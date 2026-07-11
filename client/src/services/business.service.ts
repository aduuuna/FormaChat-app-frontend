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

export interface HealthScoreCheck { label: string; achieved: boolean; }
export interface HealthScoreResponse {
  score: number;
  tier: 'excellent' | 'good' | 'fair' | 'incomplete';
  checks: HealthScoreCheck[];
  vectorStatus: string;
}

export const getBusinessHealthScore = async (businessId: string): Promise<HealthScoreResponse> => {
  const response: ApiResponse<HealthScoreResponse> = await apiGet(
    BUSINESS_ENDPOINTS.HEALTH_SCORE(businessId)
  );
  if (!response.success) {
    throw new Error((response as any).error?.message || 'Failed to fetch health score');
  }
  return response.data;
};

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string; // only present in the create response
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  event: string;
  status: 'pending' | 'success' | 'failed' | 'exhausted';
  httpStatus?: number;
  attempt: number;
  maxAttempts: number;
  nextRetryAt?: string;
  error?: string;
  deliveredAt?: string;
  createdAt: string;
}

export const getWebhookEvents = async (): Promise<string[]> => {
  const response: ApiResponse<string[]> = await apiGet(BUSINESS_ENDPOINTS.WEBHOOK_EVENTS);
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to fetch webhook events');
  return response.data;
};

export const listWebhooks = async (businessId: string): Promise<Webhook[]> => {
  const response: ApiResponse<Webhook[]> = await apiGet(BUSINESS_ENDPOINTS.WEBHOOKS(businessId));
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to load webhooks');
  return response.data;
};

export const createWebhook = async (businessId: string, url: string, events: string[]): Promise<Webhook> => {
  const response: ApiResponse<Webhook> = await apiPost(BUSINESS_ENDPOINTS.WEBHOOKS(businessId), { url, events });
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to create webhook');
  return response.data;
};

export const updateWebhook = async (
  businessId: string,
  webhookId: string,
  updates: { url?: string; events?: string[]; isActive?: boolean }
): Promise<Webhook> => {
  const response: ApiResponse<Webhook> = await apiPut(BUSINESS_ENDPOINTS.WEBHOOK_DETAIL(businessId, webhookId), updates);
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to update webhook');
  return response.data;
};

export const deleteWebhook = async (businessId: string, webhookId: string): Promise<void> => {
  const response: ApiResponse<{ message: string }> = await apiDelete(BUSINESS_ENDPOINTS.WEBHOOK_DETAIL(businessId, webhookId));
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to delete webhook');
};

export const listWebhookDeliveries = async (businessId: string, webhookId: string): Promise<WebhookDelivery[]> => {
  const response: ApiResponse<WebhookDelivery[]> = await apiGet(BUSINESS_ENDPOINTS.WEBHOOK_DELIVERIES(businessId, webhookId));
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to load delivery history');
  return response.data;
};

export const retryWebhookDelivery = async (businessId: string, deliveryId: string): Promise<void> => {
  const response: ApiResponse<{ message: string }> = await apiPost(BUSINESS_ENDPOINTS.WEBHOOK_DELIVERY_RETRY(businessId, deliveryId), {});
  if (!response.success) throw new Error((response as any).error?.message || 'Failed to retry delivery');
};

export default {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  businessExists,
  getBusinessName,
  getBusinessHealthScore,
  getWebhookEvents,
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  listWebhookDeliveries,
  retryWebhookDelivery,
};