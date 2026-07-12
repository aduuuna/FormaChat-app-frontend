export const API_BASE_URLS = {
  AUTH: 'https://formachat.onrender.com/api/v1/auth',
  BUSINESS: 'https://formachat.onrender.com/api/v1',
  CHAT: 'https://formachat.onrender.com/api/chat',
} as const;

/**
 * The public-facing production domain, used for share links / QR codes / embed
 * snippets shown to business owners - these always need a real public URL,
 * even when the dashboard itself is being viewed on localhost.
 */
export const PRODUCTION_APP_URL = 'https://formachat.com';

export function getPublicAppUrl(): string {
  return window.location.hostname === 'localhost' ? PRODUCTION_APP_URL : window.location.origin;
}

export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE_URLS.AUTH}/register`,
  LOGIN: `${API_BASE_URLS.AUTH}/login`,
  LOGOUT: `${API_BASE_URLS.AUTH}/logout`,
  ME: `${API_BASE_URLS.AUTH}/profile`,
  VERIFY_EMAIL: `${API_BASE_URLS.AUTH}/verify-email`,
  OTP_GENERATE: `${API_BASE_URLS.AUTH}/otp/generate`,
  OTP_VERIFY: `${API_BASE_URLS.AUTH}/otp/verify`,
  OTP_RESEND: `${API_BASE_URLS.AUTH}/otp/resend`,
  LOGIN_2FA_VERIFY: `${API_BASE_URLS.AUTH}/login/2fa/verify`,
  TWO_FA_ENABLE: `${API_BASE_URLS.AUTH}/2fa/enable`,
  TWO_FA_DISABLE: `${API_BASE_URLS.AUTH}/2fa/disable`,
  MAGIC_LINK_REQUEST: `${API_BASE_URLS.AUTH}/magic-link/request`,
  MAGIC_LINK_VERIFY: `${API_BASE_URLS.AUTH}/magic-link/verify`,
  PASSWORD_CHANGE: `${API_BASE_URLS.AUTH}/password/change`,
  PASSWORD_RESET: `${API_BASE_URLS.AUTH}/password/reset`,
  PASSWORD_RESET_CONFIRM: `${API_BASE_URLS.AUTH}/password/reset/confirm`,
  PASSWORD_VALIDATE: `${API_BASE_URLS.AUTH}/password/validate`,
  TOKEN_REFRESH: `${API_BASE_URLS.AUTH}/token/refresh`,
  TOKEN_REVOKE_OTHERS: `${API_BASE_URLS.AUTH}/token/revoke-others`,
  PROFILE: `${API_BASE_URLS.AUTH}/profile`,
  SESSIONS: `${API_BASE_URLS.AUTH}/sessions`,
  SESSION_REVOKE: (sessionId: string) => `${API_BASE_URLS.AUTH}/sessions/${sessionId}`,
  FEEDBACK: `${API_BASE_URLS.AUTH}/feedback`,
} as const;

export const BUSINESS_ENDPOINTS = {
  CREATE: `${API_BASE_URLS.BUSINESS}/businesses`,
  PREFILL: `${API_BASE_URLS.BUSINESS}/businesses/prefill`,
  LIST: `${API_BASE_URLS.BUSINESS}/businesses`,
  DETAILS: (id: string) => `${API_BASE_URLS.BUSINESS}/businesses/${id}`,
  UPDATE: (id: string) => `${API_BASE_URLS.BUSINESS}/businesses/${id}`,
  DELETE: (id: string) => `${API_BASE_URLS.BUSINESS}/businesses/${id}`,
  PUBLIC_DETAILS: (id: string) => `${API_BASE_URLS.BUSINESS}/businesses/public/${id}`,
  HEALTH_SCORE: (id: string) => `${API_BASE_URLS.BUSINESS}/businesses/${id}/health-score`,
  WEBHOOK_EVENTS: `${API_BASE_URLS.BUSINESS}/webhook-events`,
  WEBHOOKS: (businessId: string) => `${API_BASE_URLS.BUSINESS}/businesses/${businessId}/webhooks`,
  WEBHOOK_DETAIL: (businessId: string, webhookId: string) => `${API_BASE_URLS.BUSINESS}/businesses/${businessId}/webhooks/${webhookId}`,
  WEBHOOK_DELIVERIES: (businessId: string, webhookId: string) => `${API_BASE_URLS.BUSINESS}/businesses/${businessId}/webhooks/${webhookId}/deliveries`,
  WEBHOOK_DELIVERY_RETRY: (businessId: string, deliveryId: string) => `${API_BASE_URLS.BUSINESS}/businesses/${businessId}/webhooks/deliveries/${deliveryId}/retry`,
  PRODUCTS: (businessId: string) => `${API_BASE_URLS.BUSINESS}/businesses/${businessId}/products`,
  PRODUCT_DETAIL: (businessId: string, productId: string) => `${API_BASE_URLS.BUSINESS}/businesses/${businessId}/products/${productId}`,
  PRODUCT_STOCK: (businessId: string, productId: string) => `${API_BASE_URLS.BUSINESS}/businesses/${businessId}/products/${productId}/stock`,
  PRODUCT_IMAGE_UPLOAD: (businessId: string) => `${API_BASE_URLS.BUSINESS}/businesses/${businessId}/products/upload-image`,
  DOCUMENT_UPLOAD: (businessId: string) => `${API_BASE_URLS.BUSINESS}/businesses/${businessId}/documents/upload`,
  DOCUMENT_DELETE: (businessId: string, fileName: string) => `${API_BASE_URLS.BUSINESS}/businesses/${businessId}/documents/${encodeURIComponent(fileName)}`,
} as const;

export const CHAT_ENDPOINTS = {
  SESSION_CREATE: `${API_BASE_URLS.CHAT}/session/create`,
  SESSION_GET: (sessionId: string) => `${API_BASE_URLS.CHAT}/session/${sessionId}`,
  // SESSION_MESSAGE: (sessionId: string) => `${API_BASE_URLS.CHAT}/session/${sessionId}/message/stream`,
  SESSION_MESSAGE: (sessionId: string) => `${API_BASE_URLS.CHAT}/session/${sessionId}/message`,
  SESSION_MESSAGES: (sessionId: string) => `${API_BASE_URLS.CHAT}/session/${sessionId}/messages`,
  SESSION_END: (sessionId: string) => `${API_BASE_URLS.CHAT}/session/${sessionId}/end`,
  BUSINESS_SESSIONS: (businessId: string) => `${API_BASE_URLS.CHAT}/business/${businessId}/sessions`,
  BUSINESS_LEADS: (businessId: string) => `${API_BASE_URLS.CHAT}/business/${businessId}/leads`,
  BUSINESS_SESSION_DETAILS: (businessId: string, sessionId: string) => 
    `${API_BASE_URLS.CHAT}/business/${businessId}/session/${sessionId}`,
  BUSINESS_DASHBOARD_SUMMARY: (businessId: string) =>
    `${API_BASE_URLS.CHAT}/business/${businessId}/dashboard-summary`,
  BUSINESS_CHART_DATA: (businessId: string, days: number = 7) =>
    `${API_BASE_URLS.CHAT}/business/${businessId}/analytics/chart-data?days=${days}`,
  SESSION_DELETE: (businessId: string, sessionId: string) => 
  `${API_BASE_URLS.CHAT}/business/${businessId}/session/${sessionId}`,
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const REQUEST_TIMEOUT = 30000;

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export const isApiError = (response: ApiResponse): response is ApiErrorResponse => {
  return !response.success;
};

export const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> => {
  return response.success === true;
};