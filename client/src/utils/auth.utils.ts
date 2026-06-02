import type { AuthTokens, User } from '../types/auth.types';

const TOKEN_KEY = 'formachat_tokens';
const USER_KEY = 'formachat_user';

export const saveTokens = (tokens: { accessToken: string; refreshToken: string }): void => {
  try {
    const authTokens: AuthTokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(authTokens));
    
    try {
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
      const expiryDate = new Date(payload.exp * 1000);
      console.log('[Auth]  Token saved, expires at:', expiryDate.toISOString());
    } catch {
      console.log('[Auth] Tokens saved');
    }
  } catch (error) {
    console.error('[Auth] Failed to save tokens:', error);
  }
};

export const getTokens = (): AuthTokens | null => {
  try {
    const tokensJson = localStorage.getItem(TOKEN_KEY);
    if (!tokensJson) return null;
    
    return JSON.parse(tokensJson) as AuthTokens;
  } catch (error) {
    console.error('[Auth] Failed to get tokens:', error);
    return null;
  }
};

export const getAccessToken = (): string | null => {
  const tokens = getTokens();
  return tokens?.accessToken || null;
};


export const getRefreshToken = (): string | null => {
  const tokens = getTokens();
  return tokens?.refreshToken || null;
};

export const deleteTokens = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    console.log('[Auth] Tokens deleted');
  } catch (error) {
    console.error('[Auth] Failed to delete tokens:', error);
  }
};

export const saveUser = (user: User): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('[Auth] User saved');
  } catch (error) {
    console.error('[Auth] Failed to save user:', error);
  }
};

export const getUser = (): User | null => {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('[Auth] Failed to get user:', error);
    return null;
  }
};


export const deleteUser = (): void => {
  try {
    localStorage.removeItem(USER_KEY);
    console.log('[Auth] User deleted');
  } catch (error) {
    console.error('[Auth] Failed to delete user:', error);
  }
};


export const isAuthenticated = (): boolean => {
  const tokens = getTokens();
  return tokens !== null && !!tokens.accessToken;
};


export const logout = (): void => {
  deleteTokens();
  deleteUser();
  console.log('[Auth] User logged out');
};


export const decodeToken = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[Auth] Failed to decode token:', error);
    return null;
  }
};


export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const now = Date.now() / 1000;
  return decoded.exp < now;
};


export const isTokenExpiredSoon = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    const isExpiring = expiryTime - currentTime < 30000;
    
    if (isExpiring) {
      console.warn('[Auth] Token expired or expiring soon', {
        expiresAt: new Date(expiryTime).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
        timeLeft: Math.floor((expiryTime - currentTime) / 1000) + 's'
      });
    }
    
    return isExpiring;
  } catch (error) {
    console.error('[Auth] Failed to parse token:', error);
    return true; 
  }
};

export const getUserIdFromToken = (): string | null => {
  const accessToken = getAccessToken();
  if (!accessToken) return null;

  const decoded = decodeToken(accessToken);
  return decoded?.userId || null;
};

export const getUserEmailFromToken = (): string | null => {
  const accessToken = getAccessToken();
  if (!accessToken) return null;

  const decoded = decodeToken(accessToken);
  return decoded?.email || null;
};