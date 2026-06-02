export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  source?: string;
}


export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}


export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}


export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}


export interface RegisterResponse {
  user: User;
  requiresVerification: boolean;
}


export interface TokenRefreshRequest {
  refreshToken: string;
}


export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}


export interface VerifyEmailRequest {
  email: string;
  otp: string;
  type: OTPType;
}


export interface PasswordResetRequest {
  email: string;
}


export interface PasswordResetConfirmRequest {
  email: string;
  otp: string;
  newPassword: string;
}


export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}


export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface SessionInfo {
  sessionId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: Date;
  createdAt: Date;
}


export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export enum OTPType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  TWO_FACTOR = '2fa',
}

export interface GenerateOTPRequest {
  email: string;
  type: OTPType;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  type: OTPType;
}