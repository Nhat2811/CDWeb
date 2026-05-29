import { api } from './api';
import { ApiResponse, Booking, BookingStatus, Dashboard, User, UserRole } from '@/types';

export async function getDashboard() {
  const { data } = await api.get<ApiResponse<Dashboard>>('/admin/dashboard');
  return data.data;
}

export async function getAdminBookings() {
  const { data } = await api.get<ApiResponse<Booking[]>>('/admin/bookings');
  return data.data;
}

export async function updateAdminBookingStatus(id: string, status: BookingStatus) {
  const { data } = await api.patch<ApiResponse<Booking>>(`/admin/bookings/${id}/status`, { status });
  return data.data;
}

export async function getAdminUsers() {
  const { data } = await api.get<ApiResponse<User[]>>('/admin/users');
  return data.data;
}

export async function updateAdminUserRole(id: string, role: UserRole) {
  const { data } = await api.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role });
  return data.data;
}

export async function deleteAdminUser(id: string) {
  await api.delete(`/admin/users/${id}`);
}
