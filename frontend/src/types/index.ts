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
  minTicketPrice?: number;
  maxTicketPrice?: number;
  availableTickets?: number;
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

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';

export type PaymentCheckoutMethod = 'card' | 'bank_transfer' | 'e_wallet';
export type PaymentProvider = 'mock' | 'stripe' | 'vnpay' | 'momo';

export type PaymentProviderConfig = {
  enabled: boolean;
  webhookReady?: boolean;
  reason?: string;
};

export type PaymentGatewayConfig = Record<PaymentProvider, PaymentProviderConfig>;

export type Booking = {
  _id: string;
  user: User | string;
  event: Event;
  ticket: Ticket;
  quantity: number;
  totalPrice: number;
  discountAmount?: number;
  discountCode?: string;
  status: BookingStatus;
  qrCode: string;
  createdAt: string;
  paidAt?: string;
  checkedInAt?: string;
};

export type PaymentReceipt = {
  transactionCode: string;
  originalAmount: number;
  discountAmount: number;
  discountCode?: string;
  paidAmount: number;
  emailStatus: 'mock_sent';
};

export type PaymentStatusResponse = {
  bookingId: string;
  method?: PaymentCheckoutMethod;
  provider?: PaymentProvider;
  status: BookingStatus;
  qrCode?: string;
  booking: Booking;
  receipt?: PaymentReceipt;
  paymentUrl?: string;
  latestPayment?: PaymentTransaction;
};

export type PaymentTransaction = {
  _id: string;
  booking: string;
  user: string;
  method: PaymentCheckoutMethod;
  provider: PaymentProvider;
  status: 'pending' | 'success' | 'failed';
  originalAmount: number;
  discountAmount: number;
  discountCode?: string;
  paidAmount: number;
  transactionCode: string;
  message?: string;
  createdAt: string;
  paymentUrl?: string;
};

export type Dashboard = {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalUsers?: number;
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
