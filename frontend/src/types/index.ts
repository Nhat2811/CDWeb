export type UserRole = 'admin' | 'customer';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type EventStatus = 'draft' | 'published' | 'cancelled';

export type Event = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  status: EventStatus;
};

export type TicketName = 'VIP' | 'Standard' | 'Early Bird';

export type Ticket = {
  _id: string;
  event: string;
  name: TicketName;
  price: number;
  quantity: number;
  sold: number;
};

export type BookingStatus = 'pending' | 'paid' | 'cancelled';

export type Booking = {
  _id: string;
  user: User | string;
  event: Event;
  ticket: Ticket;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  qrCode: string;
  createdAt: string;
};

export type Dashboard = {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  recentBookings: Booking[];
};
