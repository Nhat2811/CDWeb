# Event Booking System

Fullstack web app dat ve su kien, gom luong khach hang, thanh toan, ve QR va trang quan tri.

## Tech Stack

- Backend: NestJS, MongoDB, Mongoose, JWT, class-validator
- Frontend: Next.js App Router, TypeScript, TailwindCSS, framer-motion, lucide-react
- DevOps: Docker Compose cho MongoDB, backend va frontend

## Chay Local

```bash
npm run install:all
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
npm run seed --prefix backend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- MongoDB mac dinh: `mongodb://localhost:27017/event_booking`

## Chay Docker

```bash
docker compose up --build
```

Sau khi cac container chay xong, khoi tao du lieu:

```bash
npm run seed --prefix backend
```

## Tai Khoan Khoi Tao

- Admin: `admin@example.com` / `123456`
- Customer: `customer@example.com` / `123456`

## Luong Chinh

1. Dang nhap bang customer.
2. Vao danh sach su kien, chon su kien, chon loai ve va so luong.
3. Xac nhan booking va sang trang thanh toan.
4. Chon phuong thuc thanh toan: Stripe, VNPay, MoMo hoac xac nhan noi bo.
5. Thanh toan thanh cong de cap nhat booking thanh `paid` va xem QR code o trang `Ve cua toi`.
5. Nhap ma giam gia `EVENT10`, `VIP50` hoac `STUDENT20`.
6. Dang nhap admin de quan ly dashboard, su kien, ve, booking, nguoi dung va check-in ve paid.

## API Chinh

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Events

- `GET /events`
- `GET /events/:id`
- `POST /events` admin
- `PATCH /events/:id` admin
- `DELETE /events/:id` admin

### Tickets

- `GET /tickets/event/:eventId`
- `POST /tickets` admin
- `PATCH /tickets/:id` admin
- `DELETE /tickets/:id` admin

### Bookings

- `POST /bookings`
- `GET /bookings/my`
- `GET /bookings/my-tickets`
- `GET /bookings/:id`
- `PATCH /bookings/:id/pay`
- `PATCH /bookings/:id/cancel`

### Payments

- `POST /payments/checkout`
- `GET /payments/:bookingId/status`
- `GET /payments/:bookingId/history`
- `GET /payments/stripe/return`
- `POST /payments/stripe/webhook`
- `GET /payments/vnpay/return`
- `POST /payments/momo/ipn`
- `GET /payments/momo/return`

### Admin

- `GET /admin/dashboard`
- `GET /admin/bookings`
- `PATCH /admin/bookings/:id/status`
- `GET /admin/users`
- `PATCH /admin/users/:id/role`
- `DELETE /admin/users/:id`

### Check-in

- `PATCH /bookings/:id/check-in` admin

## Cau Hinh Cong Thanh Toan

- Stripe can `STRIPE_SECRET_KEY` va `STRIPE_WEBHOOK_SECRET`.
- VNPay can `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_PAYMENT_URL`.
- MoMo can `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`, `MOMO_ENDPOINT`.
- `BACKEND_PUBLIC_URL` phai tro ve backend public URL de gateway redirect/IPN ve dung server.

### The Test VNPay Sandbox

- Ngan hang: `NCB`
- So the: `9704198526191432198`
- Ten chu the: `NGUYEN VAN A`
- Ngay phat hanh: `07/15`
- Mat khau OTP: `123456`

## Ghi Chu Van Hanh

- Phuong thuc xac nhan noi bo dung cho moi truong chua cau hinh credentials cong thanh toan.
- Email xac nhan hien la receipt trong response, chua gui SMTP that.
- Coupon backend ho tro `EVENT10`, `VIP50`, `STUDENT20`.
- QR code chua quet camera truc tiep; admin check-in bang booking trong bang admin.

## Du Lieu Khoi Tao

```bash
npm run seed --prefix backend
```

Seed tao danh sach su kien, moi su kien co 4 hang ve va moi hang ve co 100 ve. Script seed co the chay lai nhieu lan; cac su kien va ve se duoc cap nhat theo title/name hien co.
