import { api } from './api';
import { ApiResponse, Event, Ticket } from '@/types';

export type EventQuery = {
  search?: string;
  category?: string;
  status?: string;
};

export async function getEvents(params?: EventQuery) {
  const { data } = await api.get<ApiResponse<Event[]>>('/events', { params });
  return data.data;
}

export async function getEvent(id: string) {
  const { data } = await api.get<ApiResponse<Event>>(`/events/${id}`);
  return data.data;
}

export async function saveEvent(payload: Partial<Event>) {
  const { data } = payload._id
    ? await api.patch<ApiResponse<Event>>(`/events/${payload._id}`, payload)
    : await api.post<ApiResponse<Event>>('/events', payload);
  return data.data;
}

export async function deleteEvent(id: string) {
  await api.delete(`/events/${id}`);
}

export async function getTickets(eventId: string) {
  const { data } = await api.get<ApiResponse<Ticket[]>>(`/tickets/event/${eventId}`);
  return data.data;
}

export async function saveTicket(payload: Partial<Ticket> & { event: string }) {
  const { data } = payload._id
    ? await api.patch<ApiResponse<Ticket>>(`/tickets/${payload._id}`, payload)
    : await api.post<ApiResponse<Ticket>>('/tickets', payload);
  return data.data;
}

export async function deleteTicket(id: string) {
  await api.delete(`/tickets/${id}`);
}

export async function uploadEventImage(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<ApiResponse<{ url: string }>>('/uploads/event-image', form);
  return data.data.url;
}
