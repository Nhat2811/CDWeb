import { api } from './api';
import { ApiResponse, Booking, BookingStatus, Dashboard, User, UserRole } from '@/types';

export async function getDashboard() {
  const { data } = await api.get<ApiResponse<Dashboard>>('/admin/dashboard');
  return data.data;
}

export async function getDashboardCharts() {
  const { data } = await api.get<ApiResponse<{ revenueByMonth: any[]; ticketsByType: any[] }>>('/admin/dashboard-charts');
  return data.data;
}

export async function getAdminBookings() {
  const { data } = await api.get<ApiResponse<Booking[]>>('/admin/bookings');
  return data.data;
}

export async function updateAdminBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  const { data } = await api.patch<{ data: Booking }>(`/admin/bookings/${id}/status`, { status });
  return data.data;
}

export async function checkInAdminBookingQr(payload: { user: string; event: string; ticket: string }) {
  const { data } = await api.post<{ success: boolean; data: Booking }>(`/bookings/check-in-qr`, payload);
  return data.data;
}

export async function confirmAdminBookingPayment(id: string): Promise<any> {
  const { data } = await api.patch<{ data: any }>(`/admin/bookings/${id}/confirm-payment`);
  return data.data;
}

export async function checkInAdminBooking(id: string): Promise<Booking> {
  const { data } = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/check-in`);
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
