import { api } from './api';
import { ApiResponse, Booking, Event, User } from '@/types';

export type Review = {
  _id: string;
  user: Pick<User, '_id' | 'name' | 'avatar'> | string;
  event: Pick<Event, '_id' | 'title'> | string;
  booking: Booking | string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export async function createReview(bookingId: string, rating: number, comment?: string) {
  const { data } = await api.post<ApiResponse<Review>>('/reviews', { bookingId, rating, comment });
  return data.data;
}

export async function getEventReviews(eventId: string) {
  const { data } = await api.get<ApiResponse<Review[]>>(`/reviews/event/${eventId}`);
  return data.data;
}

export async function getMyReviews() {
  const { data } = await api.get<ApiResponse<Review[]>>('/reviews/my');
  return data.data;
}
