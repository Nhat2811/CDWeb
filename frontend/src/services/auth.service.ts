import { api } from './api';
import { ApiResponse, User } from '@/types';

type AuthPayload = {
  accessToken: string;
  user: User;
};

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/login', { email, password });
  return data.data;
}

export async function loginWithGoogle(token: string) {
  const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/google', { token });
  return data.data;
}

export async function loginWithFacebook(accessToken: string) {
  const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/facebook', { accessToken });
  return data.data;
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/register', {
    name,
    email,
    password,
  });
  return data.data;
}

export async function verifyEmail(token: string) {
  const { data } = await api.post<ApiResponse<{ success: boolean; message: string }>>('/auth/verify-email', { token });
  return data.data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post<ApiResponse<{ success: boolean; message: string }>>('/auth/forgot-password', { email });
  return data.data;
}

export async function resetPassword(token: string, password: string) {
  const { data } = await api.post<ApiResponse<{ success: boolean; message: string }>>('/auth/reset-password', { token, password });
  return data.data;
}
