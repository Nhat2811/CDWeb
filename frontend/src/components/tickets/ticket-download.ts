import { Booking, User } from '@/types';

export function downloadTicket(booking: Booking, user: User | null) {
  const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Ticket ${booking._id}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:32px;color:#0f172a}
    .ticket{max-width:720px;border:1px solid #dbe5ea;border-radius:16px;padding:24px}
    .header{display:flex;justify-content:space-between;gap:24px}
    h1{margin:0 0 8px;font-size:28px}
    .muted{color:#64748b}
    .qr{width:180px;height:180px}
    .row{display:flex;justify-content:space-between;border-top:1px solid #e2e8f0;padding:12px 0}
    .total{font-size:22px;font-weight:700;color:#0f9f8e}
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <div>
        <h1>${booking.event?.title ?? 'Event Ticket'}</h1>
        <p class="muted">${booking.event?.location ?? ''}</p>
        <p class="muted">${new Date(booking.event?.startDate).toLocaleString('vi-VN')}</p>
      </div>
      <img class="qr" src="${booking.qrCode}" alt="QR" />
    </div>
    <div class="row"><span>Booking ID</span><strong>${booking._id}</strong></div>
    <div class="row"><span>Người đặt</span><strong>${user?.name ?? 'Khách hàng'}</strong></div>
    <div class="row"><span>Email</span><strong>${user?.email ?? ''}</strong></div>
    <div class="row"><span>Loại vé</span><strong>${booking.ticket?.name ?? ''}</strong></div>
    <div class="row"><span>Số lượng</span><strong>${booking.quantity}</strong></div>
    <div class="row"><span>Trạng thái</span><strong>${booking.status}</strong></div>
    <p class="total">${booking.totalPrice.toLocaleString('vi-VN')}đ</p>
  </div>
  <script>window.print()</script>
</body>
</html>`;

  const popup = window.open('', '_blank', 'width=900,height=700');
  if (!popup) return;
  popup.document.write(html);
  popup.document.close();
}
