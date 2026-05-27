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

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/register', {
    name,
    email,
    password,
  });
  return data.data;
}
