import { api } from './api';
import { ApiResponse, Booking, PaymentCheckoutMethod, PaymentStatusResponse } from '@/types';

export async function checkoutPayment(
  bookingId: string,
  method: PaymentCheckoutMethod,
  simulateFailure = false,
) {
  const { data } = await api.post<ApiResponse<PaymentStatusResponse>>('/payments/checkout', {
    bookingId,
    method,
    simulateFailure,
  });
  return data.data;
}

export async function getPaymentStatus(bookingId: string) {
  const { data } = await api.get<ApiResponse<PaymentStatusResponse>>(`/payments/${bookingId}/status`);
  return data.data;
}

export async function getPaymentBooking(bookingId: string) {
  const response = await getPaymentStatus(bookingId);
  return response.booking as Booking;
}
