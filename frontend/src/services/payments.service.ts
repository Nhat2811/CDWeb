import { api } from './api';
import {
  ApiResponse,
  Booking,
  PaymentCheckoutMethod,
  PaymentGatewayConfig,
  PaymentProvider,
  PaymentStatusResponse,
  PaymentTransaction,
} from '@/types';

export async function checkoutPayment(
  bookingId: string,
  method: PaymentCheckoutMethod,
  simulateFailure = false,
  discountCode?: string,
  provider: PaymentProvider = 'mock',
) {
  const { data } = await api.post<ApiResponse<PaymentStatusResponse>>('/payments/checkout', {
    bookingId,
    method,
    provider,
    simulateFailure,
    discountCode,
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

export async function getPaymentHistory(bookingId: string) {
  const { data } = await api.get<ApiResponse<PaymentTransaction[]>>(`/payments/${bookingId}/history`);
  return data.data;
}

export async function getPaymentGatewayConfig() {
  const { data } = await api.get<ApiResponse<PaymentGatewayConfig>>('/payments/config');
  return data.data;
}
