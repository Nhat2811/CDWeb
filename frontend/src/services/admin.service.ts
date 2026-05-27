import { api } from './api';
import { ApiResponse, Dashboard } from '@/types';

export async function getDashboard() {
  const { data } = await api.get<ApiResponse<Dashboard>>('/admin/dashboard');
  return data.data;
}
