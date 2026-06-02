import { apiPost, apiGet } from '../utils/api.utils';
import { AUTH_ENDPOINTS } from '../config/api.config';
import { getRefreshToken, logout as clearLocalAuth } from '../utils/auth.utils';
import type { ApiResponse } from '../config/api.config';
import {
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
  type VerifyEmailRequest,
  type User,
  OTPType,
} from '../types/auth.types';


export const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  console.log('[AuthService] Logging in user:', credentials.email);

  return await apiPost<LoginResponse>(
    AUTH_ENDPOINTS.LOGIN,
    credentials,
    { skipAuth: true } 
  );
};


export const register = async (userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
  console.log('[AuthService] Registering user:', userData.email);

  return await apiPost<RegisterResponse>(
    AUTH_ENDPOINTS.REGISTER,
    userData,
    { skipAuth: true } 
  );
};


export const verifyEmail = async (data: VerifyEmailRequest): Promise<ApiResponse<any>> => {
  console.log('[AuthService] Verifying email:', data.email);

  return await apiPost(
    AUTH_ENDPOINTS.VERIFY_EMAIL,
    data,
    { skipAuth: true } 
  );
};


export const logout = async (): Promise<ApiResponse<any>> => {
  console.log('[AuthService] Logging out user');

  const refreshToken = getRefreshToken();

  try {
    const response = await fetch(AUTH_ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    try {
      const data = await response.json();
      console.log('[AuthService] Logout API response:', data);
    } catch (parseError) {
      console.warn('[AuthService] Could not parse logout response (not critical)');
    }
  } catch (error) {
    console.warn('[AuthService] Logout API call failed (not critical):', error);
  }

 
  clearLocalAuth();

  return {
    success: true,
    data: {},
    message: 'Logged out successfully',
  };
};


export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  console.log('[AuthService] Fetching current user');

  return await apiGet<User>(AUTH_ENDPOINTS.ME);
};


export const resendOTP = async (email: string): Promise<ApiResponse<any>> => {
  console.log('[AuthService] Resending OTP to:', email);

  return await apiPost(
    AUTH_ENDPOINTS.OTP_RESEND,
    { email, type: OTPType.EMAIL_VERIFICATION },
    { skipAuth: true }
  );
};