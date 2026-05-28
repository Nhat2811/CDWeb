import { api } from './api';
import { ApiResponse, Booking } from '@/types';

export async function createBooking(event: string, ticket: string, quantity: number) {
  const { data } = await api.post<ApiResponse<Booking>>('/bookings', { event, ticket, quantity });
  return data.data;
}

export async function getMyBookings() {
  try {
    const { data } = await api.get<ApiResponse<Booking[]>>('/bookings/my-tickets');
    return data.data;
  } catch (error) {
    const { data } = await api.get<ApiResponse<Booking[]>>('/bookings/my');
    return data.data;
  }
}

export async function getBooking(id: string) {
  const { data } = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
  return data.data;
}

export async function payBooking(id: string) {
  try {
    const { data } = await api.post<ApiResponse<Booking>>('/payments/checkout', { bookingId: id });
    return data.data;
  } catch (error) {
    const { data } = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/pay`);
    return data.data;
  }
}

export async function cancelBooking(id: string) {
  const { data } = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
  return data.data;
}
