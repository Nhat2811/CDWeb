import { api } from './api';
import { ApiResponse, ProfileResponse, User } from '@/types';

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  bio?: string;
};

export async function getProfile() {
  const { data } = await api.get<ApiResponse<ProfileResponse>>('/users/me');
  return data.data;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await api.patch<ApiResponse<User>>('/users/me', payload);
  return data.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await api.patch<ApiResponse<{ changed: boolean }>>('/users/me/password', {
    currentPassword,
    newPassword,
  });
  return data.data;
}
