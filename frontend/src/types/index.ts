export type UserRole = 'admin' | 'customer';

export type User = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
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

export type TicketName = 'VIP' | 'VVIP' | 'Standard' | 'Early Bird';

export type Ticket = {
  _id: string;
  event: string;
  name: TicketName;
  price: number;
  quantity: number;
  sold: number;
};

export type BookingStatus = 'pending' | 'paid' | 'cancelled' | 'used';

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

export type ProfileStats = {
  totalBookings: number;
  paidBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalTickets: number;
  totalSpent: number;
};

export type ProfileResponse = {
  profile: User;
  stats: ProfileStats;
};
