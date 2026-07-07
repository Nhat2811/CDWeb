'use client';

import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  BarChart3,
  CalendarPlus,
  CalendarRange,
  CircleDollarSign,
  ClipboardList,
  RefreshCcw,
  Save,
  Search,
  Shield,
  TicketIcon,
  Trash2,
  Upload,
  Users,
  Percent,
  ScanLine,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getErrorMessage } from '@/services/api';
import {
  checkInAdminBooking,
  deleteAdminUser,
  getAdminBookings,
  getAdminUsers,
  getDashboard,
  getDashboardCharts,
  updateAdminBookingStatus,
  confirmAdminBookingPayment,
  updateAdminUserRole,
  checkInAdminBookingQr,
} from '@/services/admin.service';
import {
  deleteEvent,
  deleteTicket,
  getEvents,
  getTickets,
  saveEvent,
  saveTicket,
  uploadEventImage,
} from '@/services/events.service';
import { useProtected } from '@/hooks/use-protected';
import { Booking, BookingStatus, Dashboard, Event, Ticket, TicketName, User, UserRole } from '@/types';
import { Coupon, createCoupon, deleteCoupon, getCoupons } from '@/services/coupons.service';

type AdminTab = 'overview' | 'events' | 'bookings' | 'users' | 'coupons' | 'scanner';

const emptyEvent: Partial<Event> = {
  title: '',
  description: '',
  image: '',
  location: '',
  startDate: '',
  endDate: '',
  category: '',
  status: 'draft',
};

const tabs: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
  { id: 'events', label: 'Sự kiện & vé', icon: CalendarRange },
  { id: 'bookings', label: 'Booking', icon: ClipboardList },
  { id: 'users', label: 'Người dùng', icon: Users },
  { id: 'coupons', label: 'Mã giảm giá', icon: Percent },
  { id: 'scanner', label: 'Quét vé', icon: ScanLine },
];

function ScannerTab() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let scanner: any = null;
    let isMounted = true;
    
    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (!isMounted) return;
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      let isProcessing = false;
      scanner.render(
        async (decodedText: string) => {
          if (isProcessing) return;
          try {
            isProcessing = true;
            const payload = JSON.parse(decodedText);
            if (payload.user && payload.event && payload.ticket) {
              setLoading(true);
              setError(null);
              setResult(null);
              await checkInAdminBookingQr(payload);
              setResult('Check-in thành công!');
              setTimeout(() => {
                setResult(null);
                isProcessing = false;
              }, 3000);
            } else {
              setError('Mã QR không hợp lệ.');
              isProcessing = false;
            }
          } catch (e: any) {
            setError(getErrorMessage(e));
            setTimeout(() => {
              isProcessing = false;
            }, 3000);
          } finally {
            setLoading(false);
          }
        },
        () => {
          // ignore scan errors
        }
      );
    });

    return () => {
      isMounted = false;
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Quét mã QR Check-in</h2>
          <p className="text-sm text-slate-500">Đưa mã QR của khách hàng vào khung hình để kiểm tra và check-in tự động.</p>
        </div>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      {result && <div className="mb-4 p-3 bg-teal-100 text-teal-700 rounded-md font-bold text-lg text-center">{result}</div>}
      {loading && <div className="mb-4 p-3 text-slate-700 text-center font-semibold">Đang xử lý check-in...</div>}
      
      <div className="flex justify-center">
        <div id="qr-reader" className="w-full max-w-md overflow-hidden rounded-lg border-2 border-slate-200" />
      </div>
    </Card>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useProtected(['admin', 'staff']);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [chartsData, setChartsData] = useState<{ revenueByMonth: any[]; ticketsByType: any[] } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selected, setSelected] = useState<Partial<Event>>(emptyEvent);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketForm, setTicketForm] = useState<{ _id?: string; name: TicketName; price: number; quantity: number }>({
    name: 'Standard',
    price: 0,
    quantity: 0,
  });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      if (user?.role === 'staff') {
        const bookingData = await getAdminBookings();
        setBookings(bookingData);
        setActiveTab('bookings');
      } else {
        const [dashboardData, charts, eventData, bookingData, userData, couponData] = await Promise.all([
          getDashboard(),
          getDashboardCharts(),
          getEvents({ limit: '1000' }),
          getAdminBookings(),
          getAdminUsers(),
          getCoupons(),
        ]);
        setDashboard(dashboardData);
        setChartsData(charts);
        setEvents(eventData.items);
        setBookings(bookingData);
        setUsers(userData);
        setCoupons(couponData);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user]);

  function exportCSV() {
    const headers = ['Mã Đặt Vé', 'Khách Hàng', 'Email', 'Sự Kiện', 'Trạng Thái', 'Tổng Tiền', 'Mã Giảm Giá', 'Ngày Đặt'];
    const rows = bookings.map(b => {
      const userName = typeof b.user === 'string' ? b.user : b.user?.name || '';
      const userEmail = typeof b.user === 'string' ? '' : b.user?.email || '';
      return [
        b._id,
        `"${userName}"`,
        userEmail,
        `"${b.event?.title || ''}"`,
        b.status,
        b.totalPrice,
        b.discountCode || '',
        new Date(b.createdAt).toLocaleString('vi-VN')
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookings_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return bookings;
    return bookings.filter((booking) =>
      [booking.event?.title, typeof booking.user === 'string' ? booking.user : booking.user?.email, typeof booking.ticket === 'object' && booking.ticket ? booking.ticket.name : undefined]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [bookings, search]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) => [user.name, user.email, user.phone].filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword)));
  }, [search, users]);

  async function chooseEvent(event: Event) {
    setSelected({
      ...event,
      startDate: event.startDate.slice(0, 16),
      endDate: event.endDate.slice(0, 16),
    });
    setTickets(await getTickets(event._id));
    setTicketForm({ name: 'Standard', price: 0, quantity: 0 });
  }

  async function onSaveEvent(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    try {
      const saved = await saveEvent(selected);
      setSelected({
        ...saved,
        startDate: saved.startDate.slice(0, 16),
        endDate: saved.endDate.slice(0, 16),
      });
      setMessage('Đã lưu sự kiện.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onUpload(file?: File) {
    if (!file) return;
    try {
      const url = await uploadEventImage(file);
      setSelected((current) => ({ ...current, image: url }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onSaveTicket(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    if (!selected._id) return;
    try {
      await saveTicket({ ...ticketForm, event: selected._id });
      setTickets(await getTickets(selected._id));
      setTicketForm({ name: 'Standard', price: 0, quantity: 0 });
      setMessage('Đã lưu vé.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function removeEvent() {
    if (!selected._id || !window.confirm('Xóa sự kiện này?')) return;
    await deleteEvent(selected._id);
    setSelected(emptyEvent);
    setTickets([]);
    setMessage('Đã xóa sự kiện.');
    await load();
  }

  async function changeBookingStatus(id: string, status: BookingStatus) {
    try {
      await updateAdminBookingStatus(id, status);
      setMessage('Đã cập nhật trạng thái booking.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function checkInBooking(id: string) {
    try {
      await checkInAdminBooking(id);
      setMessage('Đã check-in vé.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function confirmPayment(id: string) {
    if (!window.confirm('Xác nhận đã nhận đủ tiền cho booking này? Hệ thống sẽ ngay lập tức phát hành mã QR vé cho khách.')) return;
    try {
      await confirmAdminBookingPayment(id);
      setMessage('Đã xác nhận thanh toán thành công.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function changeUserRole(id: string, role: UserRole) {
    try {
      await updateAdminUserRole(id, role);
      setMessage('Đã cập nhật quyền người dùng.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function removeUser(id: string) {
    if (!window.confirm('Xóa người dùng này?')) return;
    try {
      await deleteAdminUser(id);
      setMessage('Đã xóa người dùng.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-[#14b8a6]">Admin Console</p>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">Quản trị hệ thống</h1>
          <p className="mt-2 text-slate-500">Theo dõi doanh thu, sự kiện, booking và người dùng.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCcw size={17} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              logout();
              router.push('/login');
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 p-4">
        {tabs.filter(t => user?.role === 'admin' || t.id === 'bookings').map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex min-w-fit items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id ? 'bg-[#14b8a6] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {(error || message) && (
        <div className={`rounded-lg border p-3 ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      {activeTab === 'overview' && (
        <OverviewTab dashboard={dashboard} charts={chartsData} bookings={bookings} events={events} users={users} />
      )}

      {activeTab === 'events' && (
        <EventsTab
          events={events}
          selected={selected}
          tickets={tickets}
          ticketForm={ticketForm}
          loading={loading}
          setSelected={setSelected}
          setTicketForm={setTicketForm}
          chooseEvent={chooseEvent}
          onSaveEvent={onSaveEvent}
          onUpload={onUpload}
          onSaveTicket={onSaveTicket}
          removeEvent={removeEvent}
          reloadTickets={async () => {
            if (selected._id) setTickets(await getTickets(selected._id));
          }}
        />
      )}

      {activeTab === 'bookings' && (
        <BookingsTab
          search={search}
          setSearch={setSearch}
          bookings={filteredBookings}
          onStatusChange={changeBookingStatus}
          onCheckIn={checkInBooking}
          onConfirmPayment={confirmPayment}
          onExport={exportCSV}
        />
      )}

      {activeTab === 'users' && (
        <UsersTab search={search} setSearch={setSearch} users={filteredUsers} onRoleChange={changeUserRole} onRemove={removeUser} />
      )}

      {activeTab === 'coupons' && <CouponsTab coupons={coupons} onReload={() => void load()} />}
      {activeTab === 'scanner' && <ScannerTab />}
    </div>
  );
}

const COLORS = ['#14b8a6', '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b'];

function OverviewTab({ dashboard, charts, bookings, events, users }: { dashboard: Dashboard | null; charts: any; bookings: Booking[]; events: Event[]; users: User[] }) {
  const paidBookings = bookings.filter((booking) => booking.status === 'paid' || booking.status === 'used').length;
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarRange} label="Tổng sự kiện" value={dashboard?.totalEvents ?? events.length} />
        <StatCard icon={TicketIcon} label="Vé đã bán" value={dashboard?.totalTicketsSold ?? 0} />
        <StatCard icon={CircleDollarSign} label="Doanh thu" value={`${(dashboard?.totalRevenue ?? 0).toLocaleString('vi-VN')}đ`} />
        <StatCard icon={Users} label="Người dùng" value={dashboard?.totalUsers ?? users.length} />
      </section>

      {charts && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-xl font-bold mb-4">Doanh thu theo tháng</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={charts.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value: any) => [`${Number(value || 0).toLocaleString('vi-VN')}đ`, 'Doanh thu']} />
                  <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="p-5">
            <h2 className="text-xl font-bold mb-4">Tỷ lệ bán theo loại vé</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.ticketsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {charts.ticketsByType.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [value, 'Số lượng']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <h2 className="text-xl font-bold">Booking gần đây</h2>
          <AdminBookingTable bookings={dashboard?.recentBookings ?? bookings.slice(0, 8)} compact />
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-bold">Tình trạng vận hành</h2>
          <div className="mt-4 space-y-3">
            <ProgressRow label="Đã thanh toán" value={paidBookings} total={Math.max(bookings.length, 1)} />
            <ProgressRow label="Chờ thanh toán" value={pendingBookings} total={Math.max(bookings.length, 1)} />
            <ProgressRow label="Sự kiện published" value={events.filter((event) => event.status === 'published').length} total={Math.max(events.length, 1)} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function EventsTab(props: {
  events: Event[];
  selected: Partial<Event>;
  tickets: Ticket[];
  ticketForm: { _id?: string; name: TicketName; price: number; quantity: number };
  loading: boolean;
  setSelected: (event: Partial<Event>) => void;
  setTicketForm: (ticket: { _id?: string; name: TicketName; price: number; quantity: number }) => void;
  chooseEvent: (event: Event) => Promise<void>;
  onSaveEvent: (event: FormEvent) => Promise<void>;
  onUpload: (file?: File) => Promise<void>;
  onSaveTicket: (event: FormEvent) => Promise<void>;
  removeEvent: () => Promise<void>;
  reloadTickets: () => Promise<void>;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Danh sách sự kiện</h2>
          <Button
            onClick={() => {
              props.setSelected(emptyEvent);
              props.setTicketForm({ name: 'Standard', price: 0, quantity: 0 });
            }}
          >
            <CalendarPlus size={17} />
            Tạo mới
          </Button>
        </div>
        {props.loading ? <div className="h-48 animate-pulse rounded bg-slate-100" /> : null}
        <div className="max-h-[720px] space-y-2 overflow-y-auto pr-1">
          {props.events.map((event) => (
            <button
              key={event._id}
              className={`w-full rounded-lg border p-3 text-left transition hover:border-teal-200 hover:bg-teal-50 ${
                props.selected._id === event._id ? 'border-[#14b8a6] bg-teal-50' : 'border-slate-200 bg-white'
              }`}
              onClick={() => void props.chooseEvent(event)}
            >
              <div className="flex items-start justify-between gap-3">
                <span>
                  <strong className="block text-slate-950">{event.title}</strong>
                  <span className="text-sm text-slate-500">{event.location}</span>
                </span>
                <EventStatusBadge status={event.status} />
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-xl font-bold">Thông tin sự kiện</h2>
        <form onSubmit={props.onSaveEvent} className="mt-4 grid gap-3 md:grid-cols-2">
          <input placeholder="Tiêu đề" value={props.selected.title ?? ''} onChange={(e) => props.setSelected({ ...props.selected, title: e.target.value })} />
          <input placeholder="Địa điểm" value={props.selected.location ?? ''} onChange={(e) => props.setSelected({ ...props.selected, location: e.target.value })} />
          <select
            value={props.selected.category ?? ''}
            onChange={(e) => props.setSelected({ ...props.selected, category: e.target.value })}
            className="w-full"
          >
            <option value="" disabled>
              -- Chọn danh mục --
            </option>
            {[
              'Âm nhạc',
              'Công nghệ',
              'Kinh doanh',
              'Thể thao',
              'Nghệ thuật',
              'Giáo dục',
              'Giải trí',
              'Sức khỏe',
              'Du lịch',
              'Ẩm thực',
              'Workshop',
              'Hội thảo',
              'Khác',
            ].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select value={props.selected.status ?? 'draft'} onChange={(e) => props.setSelected({ ...props.selected, status: e.target.value as Event['status'] })}>
            <option value="draft">Nháp</option>
            <option value="published">Đang bán</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <input type="datetime-local" value={props.selected.startDate ?? ''} onChange={(e) => props.setSelected({ ...props.selected, startDate: e.target.value })} />
          <input type="datetime-local" value={props.selected.endDate ?? ''} onChange={(e) => props.setSelected({ ...props.selected, endDate: e.target.value })} />
          <input className="md:col-span-2" placeholder="Ảnh URL" value={props.selected.image ?? ''} onChange={(e) => props.setSelected({ ...props.selected, image: e.target.value })} />
          <div className="md:col-span-2">
            <ReactQuill
              theme="snow"
              value={props.selected.description ?? ''}
              onChange={(content: string) => props.setSelected({ ...props.selected, description: content })}
              className="bg-white rounded-md h-[200px] mb-12"
            />
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-[#14b8a6]">
            <Upload size={16} />
            Upload ảnh
            <input className="hidden" type="file" accept="image/*" onChange={(e) => void props.onUpload(e.target.files?.[0])} />
          </label>
          <div className="flex gap-2">
            <Button className="flex-1">
              <Save size={16} />
              Lưu sự kiện
            </Button>
            {props.selected._id && (
              <Button type="button" variant="danger" onClick={() => void props.removeEvent()}>
                <Trash2 size={17} />
              </Button>
            )}
          </div>
        </form>

        {props.selected._id && (
          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="text-lg font-bold">Quản lý vé</h3>
            <form onSubmit={props.onSaveTicket} className="mt-3 grid gap-3 md:grid-cols-[1fr_140px_140px_auto]">
              <select value={props.ticketForm.name} onChange={(e) => props.setTicketForm({ ...props.ticketForm, name: e.target.value as TicketName })}>
                <option>Standard</option>
                <option>VIP</option>
                <option>VVIP</option>
                <option>Early Bird</option>
              </select>
              <input type="number" min={0} placeholder="Giá" value={props.ticketForm.price} onChange={(e) => props.setTicketForm({ ...props.ticketForm, price: Number(e.target.value) })} />
              <input type="number" min={0} placeholder="Số lượng" value={props.ticketForm.quantity} onChange={(e) => props.setTicketForm({ ...props.ticketForm, quantity: Number(e.target.value) })} />
              <Button>{props.ticketForm._id ? 'Cập nhật' : 'Thêm vé'}</Button>
            </form>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {props.tickets.map((ticket) => (
                <div key={ticket._id} className="rounded-lg border border-slate-200 p-3">
                  <button
                    className="w-full text-left"
                    onClick={() => props.setTicketForm({ _id: ticket._id, name: ticket.name, price: ticket.price, quantity: ticket.quantity })}
                  >
                    <strong>{ticket.name}</strong>
                    <p className="text-sm text-slate-500">{ticket.price.toLocaleString('vi-VN')}đ · đã bán {ticket.sold}/{ticket.quantity}</p>
                  </button>
                  <Button
                    type="button"
                    variant="danger"
                    className="mt-3 w-full"
                    onClick={async () => {
                      if (!window.confirm('Xóa loại vé này?')) return;
                      await deleteTicket(ticket._id);
                      await props.reloadTickets();
                    }}
                  >
                    <Trash2 size={16} />
                    Xóa vé
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function QRScanner({ onScan, onClose }: { onScan: (text: string) => void; onClose: () => void }) {
  useEffect(() => {
    let scanner: any = null;
    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        (decodedText: string) => {
          scanner.clear();
          onScan(decodedText);
        },
        (error: any) => { /* ignore frame errors */ }
      );
    });
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [onScan]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-center text-lg font-bold">Quét mã QR Vé</h3>
        <div id="qr-reader" className="overflow-hidden rounded-lg"></div>
        <Button variant="outline" className="mt-4 w-full" onClick={onClose}>Đóng</Button>
      </div>
    </div>
  );
}

function BookingsTab({
  search,
  setSearch,
  bookings,
  onStatusChange,
  onCheckIn,
  onConfirmPayment,
  onExport,
}: {
  search: string;
  setSearch: (value: string) => void;
  bookings: Booking[];
  onStatusChange: (id: string, status: BookingStatus) => Promise<void>;
  onCheckIn: (id: string) => Promise<void>;
  onConfirmPayment: (id: string) => Promise<void>;
  onExport: () => void;
}) {
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = async (text: string) => {
    setShowScanner(false);
    try {
      const data = JSON.parse(text);
      if (data.user && data.event && data.ticket) {
        await checkInAdminBookingQr(data);
        alert('Check-in thành công!');
        // Refresh bookings list if needed
        window.location.reload(); // Simple way to refresh data
      } else {
        alert('Mã QR không hợp lệ!');
      }
    } catch (e: any) {
      alert(getErrorMessage(e) || 'Không thể đọc mã QR!');
    }
  };

  return (
    <Card className="p-5 relative">
      <div className="flex items-center justify-between mb-4">
        <TableHeader title="Quản lý booking" search={search} setSearch={setSearch} placeholder="Tìm booking..." />
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport}>Tải Excel (CSV)</Button>
          <Button onClick={() => setShowScanner(true)}>Quét QR Check-in</Button>
        </div>
      </div>
      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      <AdminBookingTable bookings={bookings} onStatusChange={onStatusChange} onCheckIn={onCheckIn} onConfirmPayment={onConfirmPayment} />
    </Card>
  );
}

function UsersTab({ search, setSearch, users, onRoleChange, onRemove }: { search: string; setSearch: (value: string) => void; users: User[]; onRoleChange: (id: string, role: UserRole) => Promise<void>; onRemove: (id: string) => Promise<void> }) {
  return (
    <Card className="p-5">
      <TableHeader title="Quản lý người dùng" search={search} setSearch={setSearch} placeholder="Tìm tên, email, số điện thoại..." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-3">Người dùng</th>
              <th>Liên hệ</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const id = user._id ?? user.id;
              return (
                <tr key={id} className="border-b border-slate-100">
                  <td className="py-3">
                    <strong>{user.name}</strong>
                    <p className="text-xs text-slate-500">#{id?.slice(-8)?.toUpperCase()}</p>
                  </td>
                  <td>
                    <p>{user.email}</p>
                    <p className="text-xs text-slate-500">{user.phone || 'Chưa có SĐT'}</p>
                  </td>
                  <td>
                    <select className="bg-transparent" value={user.role} onChange={(e) => void onRoleChange(id, e.target.value as UserRole)}>
                      <option value="customer">Khách hàng</option>
                      <option value="staff">Nhân viên</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                  <td className="text-right">
                    <Button variant="danger" onClick={() => void onRemove(id)}>
                      <Trash2 size={16} />
                      Xóa
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AdminBookingTable({
  bookings,
  compact,
  onStatusChange,
  onCheckIn,
  onConfirmPayment,
}: {
  bookings: Booking[];
  compact?: boolean;
  onStatusChange?: (id: string, status: BookingStatus) => Promise<void>;
  onCheckIn?: (id: string) => Promise<void>;
  onConfirmPayment?: (id: string) => Promise<void>;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-3">Khách</th>
            <th>Sự kiện</th>
            <th>Vé</th>
            <th>Tổng</th>
            <th>Trạng thái</th>
            {!compact && <th>Ngày tạo</th>}
            {onCheckIn && <th className="text-right">Check-in</th>}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id} className="border-b border-slate-100">
              <td className="py-3">{typeof booking.user === 'string' ? booking.user : booking.user?.email}</td>
              <td>{booking.event?.title}</td>
              <td>{typeof booking.ticket === 'object' && booking.ticket !== null ? booking.ticket.name : 'Unknown'} x {booking.quantity}</td>
              <td>{booking.totalPrice.toLocaleString('vi-VN')}đ</td>
              <td>
                {onStatusChange ? (
                  <select value={booking.status} onChange={(e) => void onStatusChange(booking._id, e.target.value as BookingStatus)}>
                    <option value="pending">Chờ thanh toán</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="used">Đã check-in</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                ) : (
                  <BookingStatusBadge status={booking.status} />
                )}
              </td>
              {!compact && <td>{new Date(booking.createdAt).toLocaleString('vi-VN')}</td>}
              {(onCheckIn || onConfirmPayment) && (
                <td className="text-right space-x-2">
                  {onConfirmPayment && booking.status === 'pending' && (
                    <Button type="button" variant="primary" className="bg-[#14b8a6] hover:bg-teal-600" onClick={() => void onConfirmPayment(booking._id)}>
                      Xác nhận thu tiền
                    </Button>
                  )}
                  {onCheckIn && (
                    <Button type="button" variant="outline" disabled={booking.status !== 'paid'} onClick={() => void onCheckIn(booking._id)}>
                      Check-in
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded bg-teal-50 text-[#14b8a6]">
          <Icon size={22} />
        </span>
        <Shield className="text-slate-200" size={22} />
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <strong className="mt-1 block text-3xl text-slate-950">{value}</strong>
    </Card>
  );
}

function ProgressRow({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = Math.round((value / total) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <strong>{percent}%</strong>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-[#14b8a6]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function TableHeader({ title, search, setSearch, placeholder }: { title: string; search: string; setSearch: (value: string) => void; placeholder: string }) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h2 className="text-xl font-bold">{title}</h2>
      <label className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 md:w-80">
        <Search size={17} className="text-slate-400" />
        <input className="w-full border-0 bg-transparent p-0 focus:ring-0" placeholder={placeholder} value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
    </div>
  );
}

function EventStatusBadge({ status }: { status?: Event['status'] }) {
  if (status === 'published') return <Badge tone="teal">Đang bán</Badge>;
  if (status === 'cancelled') return <Badge tone="rose">Đã hủy</Badge>;
  return <Badge tone="amber">Nháp</Badge>;
}

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  if (status === 'paid') return <Badge tone="teal">Đã thanh toán</Badge>;
  if (status === 'used') return <Badge tone="slate">Đã sử dụng</Badge>;
  if (status === 'cancelled') return <Badge tone="rose">Đã hủy</Badge>;
  return <Badge tone="amber">Chờ thanh toán</Badge>;
}

function CouponsTab({ coupons, onReload }: { coupons: Coupon[]; onReload: () => void }) {
  const [form, setForm] = useState({ code: '', discountType: 'percent', discountValue: 10, quantity: 100, validUntil: '' });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createCoupon({ ...form, discountType: form.discountType as any });
      setForm({ code: '', discountType: 'percent', discountValue: 10, quantity: 100, validUntil: '' });
      onReload();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Xóa mã giảm giá này?')) return;
    try {
      await deleteCoupon(id);
      onReload();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-xl font-bold mb-4">Tạo mã giảm giá</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-6 items-end">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Mã code</label>
            <input required className="mt-1 w-full rounded-md border p-2 text-sm" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="VD: EVENT10" />
          </div>
          <div>
            <label className="text-sm font-medium">Loại</label>
            <select className="mt-1 w-full rounded-md border p-2 text-sm" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
              <option value="percent">%</option>
              <option value="fixed">Tiền mặt</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Giá trị</label>
            <input required type="number" min="0" className="mt-1 w-full rounded-md border p-2 text-sm" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm font-medium">Số lượng</label>
            <input required type="number" min="1" className="mt-1 w-full rounded-md border p-2 text-sm" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm font-medium">Hết hạn</label>
            <input required type="datetime-local" className="mt-1 w-full rounded-md border p-2 text-sm" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
          </div>
          <div className="md:col-span-6 flex justify-end">
            <Button type="submit">
              <Save size={16} className="mr-2" /> Lưu mã
            </Button>
          </div>
        </form>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-bold mb-4">Danh sách mã giảm giá</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3">Mã code</th>
                <th>Giảm giá</th>
                <th>Đã dùng</th>
                <th>Hết hạn</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-b border-slate-100">
                  <td className="py-3 font-bold">{c.code}</td>
                  <td>{c.discountType === 'percent' ? `${c.discountValue}%` : `${c.discountValue.toLocaleString('vi-VN')}đ`}</td>
                  <td>{c.used} / {c.quantity}</td>
                  <td>{new Date(c.validUntil).toLocaleString('vi-VN')}</td>
                  <td className="text-right">
                    <Button variant="danger" onClick={() => void handleRemove(c._id)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
