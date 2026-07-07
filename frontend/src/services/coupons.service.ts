import { api } from './api';

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  quantity: number;
  used: number;
  validUntil: string;
  createdAt: string;
}

export async function getCoupons(): Promise<Coupon[]> {
  const { data } = await api.get<{ data: Coupon[] }>('/coupons');
  return data.data;
}

export async function getActiveCoupons(): Promise<Coupon[]> {
  const { data } = await api.get<{ data: Coupon[] }>('/coupons/active');
  return data.data;
}

export async function createCoupon(dto: Partial<Coupon>): Promise<Coupon> {
  const { data } = await api.post<{ data: Coupon }>('/coupons', dto);
  return data.data;
}

export async function deleteCoupon(id: string): Promise<void> {
  await api.delete(`/coupons/${id}`);
}
