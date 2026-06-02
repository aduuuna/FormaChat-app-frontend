export const API_BASE_URLS = {
  AUTH: 'https://formachat.onrender.com/api/v1/auth',
  BUSINESS: 'https://formachat.onrender.com/api/v1',
  CHAT: 'https://formachat.onrender.com/api/chat',
} as const;

export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE_URLS.AUTH}/register`,
  LOGIN: `${API_BASE_URLS.AUTH}/login`,
  LOGOUT: `${API_BASE_URLS.AUTH}/logout`,
  ME: `${API_BASE_URLS.AUTH}/profile`,
  VERIFY_EMAIL: `${API_BASE_URLS.AUTH}/verify-email`,
  OTP_GENERATE: `${API_BASE_URLS.AUTH}/otp/generate`,
  OTP_VERIFY: `${API_BASE_URLS.AUTH}/otp/verify`,
  OTP_RESEND: `${API_BASE_URLS.AUTH}/otp/resend`,
  PASSWORD_CHANGE: `${API_BASE_URLS.AUTH}/password/change`,
  PASSWORD_RESET: `${API_BASE_URLS.AUTH}/password/reset`,
  PASSWORD_RESET_CONFIRM: `${API_BASE_URLS.AUTH}/password/reset/confirm`,
  PASSWORD_VALIDATE: `${API_BASE_URLS.AUTH}/password/validate`,
  TOKEN_REFRESH: `${API_BASE_URLS.AUTH}/token/refresh`,
  TOKEN_REVOKE_OTHERS: `${API_BASE_URLS.AUTH}/token/revoke-others`,
  PROFILE: `${API_BASE_URLS.AUTH}/profile`,
  SESSIONS: `${API_BASE_URLS.AUTH}/sessions`,
  FEEDBACK: `${API_BASE_URLS.AUTH}/feedback`,
} as const;

export const BUSINESS_ENDPOINTS = {
  CREATE: `${API_BASE_URLS.BUSINESS}/businesses`,
  LIST: `${API_BASE_URLS.BUSINESS}/businesses`,
  DETAILS: (id: string) => `${API_BASE_URLS.BUSINESS}/businesses/${id}`,
  UPDATE: (id: string) => `${API_BASE_URLS.BUSINESS}/businesses/${id}`,
  DELETE: (id: string) => `${API_BASE_URLS.BUSINESS}/businesses/${id}`,
  PUBLIC_DETAILS: (id: string) => `${API_BASE_URLS.BUSINESS}/businesses/public/${id}`,
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