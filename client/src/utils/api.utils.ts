import { getAccessToken, getRefreshToken, saveTokens, logout } from './auth.utils';
import { AUTH_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../config/api.config';
import { generateUniqueIdempotencyKey } from './idempotency.utils';

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean; 
  skipIdempotency?: boolean;
  skipCache?: boolean; 
}

interface CacheEntry<T> {
  promise: Promise<ApiResponse<T>>;
  timestamp: number;
}

const requestCache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 100; 
const CACHE_CLEANUP_INTERVAL = 5000; 

setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  requestCache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_DURATION) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => requestCache.delete(key));
  
  if (keysToDelete.length > 0) {
    console.log(`[API Cache] Cleaned up ${keysToDelete.length} stale entries`);
  }
}, CACHE_CLEANUP_INTERVAL);

function generateCacheKey(url: string, options: ApiFetchOptions): string {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.stringify(options.body) : '';
  return `${method}:${url}:${body}`;
}

function getCachedRequest<T>(
  cacheKey: string,
  requestFn: () => Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> {
  const cached = requestCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log('[API Cache] Using cached request:', cacheKey);
    return cached.promise;
  }
  
  console.log('[API Cache] Creating new request:', cacheKey);
  const promise = requestFn().finally(() => {
    setTimeout(() => {
      requestCache.delete(cacheKey);
    }, CACHE_DURATION);
  });
  
  requestCache.set(cacheKey, {
    promise,
    timestamp: now
  });
  
  return promise;
}

export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      console.warn('[API] No refresh token available');
      return false;
    }

    console.log('[API] Refreshing access token...');

    const response = await fetch(AUTH_ENDPOINTS.TOKEN_REFRESH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error('[API] Token refresh failed with status:', response.status);
      return false;
    }

    let data: ApiResponse;
    try {
      data = await response.json();
    } catch {
      console.error('[API] Invalid JSON from token refresh');
      return false;
    }

    if (!data.success) {
      console.error('[API] Token refresh failed:', data.error);
      return false;
    }

    saveTokens({
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken || refreshToken,
    });

    console.log('[API] Access token refreshed successfully');
    return true;
  } catch (error) {
    console.error('[API] Token refresh error:', error);
    return false;
  }
};

export const apiFetch = async <T = any>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> => {
  const { skipAuth = false, skipIdempotency = false, skipCache = false, ...fetchOptions } = options;

  const method = (fetchOptions.method || 'GET').toUpperCase();
  const isCacheable = method === 'GET' && !skipCache;
  
  if (isCacheable) {
    const cacheKey = generateCacheKey(url, options);
    return getCachedRequest(cacheKey, () => executeRequest(url, { skipAuth, skipIdempotency, ...fetchOptions }));
  }
  
  return executeRequest(url, { skipAuth, skipIdempotency, ...fetchOptions });
};

async function executeRequest<T = any>(
  url: string,
  options: ApiFetchOptions & { skipAuth: boolean; skipIdempotency: boolean }
): Promise<ApiResponse<T>> {
  const { skipAuth, skipIdempotency, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (fetchOptions.headers) {
    Object.entries(fetchOptions.headers as Record<string, string>).forEach(([key, value]) => {
      headers[key] = value;
    });
  }

  if (!skipAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('[API] Added Authorization header'); 
    } else {
      console.warn('[API] No access token available!'); 
    }
  }

  const method = (fetchOptions.method || 'GET').toUpperCase();
  const needsIdempotency = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  
  if (needsIdempotency && !skipIdempotency) {
    const idempotencyKey = generateUniqueIdempotencyKey();
    headers['X-Idempotency-Key'] = idempotencyKey;
    console.log('[API] Added X-Idempotency-Key:', idempotencyKey);
  }

  try {
    console.log('[API] Making request:', {
      url,
      method: fetchOptions.method || 'GET',
      headers: { ...headers }, 
      hasBody: !!fetchOptions.body
    });

    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401 && !skipAuth) {
      console.warn('[API] 401 Unauthorized - attempting token refresh');

      const refreshed = await refreshAccessToken();

      if (!refreshed) {
        console.error('[API] Token refresh failed - logging out');
        logout();
        window.location.hash = '/login';
        
        return {
          success: false,
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'Session expired. Please login again.',
          },
        };
      }

      const newAccessToken = getAccessToken();
      if (newAccessToken) {
        headers['Authorization'] = `Bearer ${newAccessToken}`;
      }

      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!isJson) {
      console.error('[API] Non-JSON response received:', {
        url,
        status: response.status,
        contentType,
      });

      const text = await response.text();
      console.error('[API] HTML Response:', text.substring(0, 500));

      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: `Server returned HTML instead of JSON (Status: ${response.status}). This usually means the endpoint doesn't exist or there's a server error.`,
        },
      };
    }

    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch (error) {
      console.error('[API] Failed to parse JSON:', error);
      
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to parse server response',
        },
      };
    }

    if (!data.success) {
      console.error('[API] Request failed:', {
        url,
        status: response.status,
        error: data.error,
      });
    }

    return data;
  } catch (error) {
    console.error('[API] Fetch error:', error);
    
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      },
    };
  }
}

export const apiGet = <T = any>(url: string, options: ApiFetchOptions = {}): Promise<ApiResponse<T>> => {
  return apiFetch<T>(url, { ...options, method: 'GET', skipIdempotency: true }); 
};

export const apiPost = <T = any>(
  url: string,
  body: any,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> => {
  return apiFetch<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const apiPut = <T = any>(
  url: string,
  body: any,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> => {
  return apiFetch<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const apiPatch = <T = any>(
  url: string,
  body: any,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> => {
  return apiFetch<T>(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  });
};

export const apiDelete = <T = any>(url: string, options: ApiFetchOptions = {}): Promise<ApiResponse<T>> => {
  return apiFetch<T>(url, { ...options, method: 'DELETE' });
};

export const clearApiCache = () => {
  requestCache.clear();
  console.log('[API Cache] Cache cleared');
};