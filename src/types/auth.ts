// types/auth.ts

export interface LoginUserDto {
  emailOrUsername: string;
  password: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  statusCode:number
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}