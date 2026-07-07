# Event Booking System

Fullstack web app đặt vé sự kiện, bao gồm luồng khách hàng, thanh toán đa nền tảng, gửi vé QR qua email, quét QR Check-in trực tiếp và trang quản trị toàn diện.

## Tech Stack

- **Backend**: NestJS, MongoDB, Mongoose, JWT, Nodemailer (Gửi vé QR), Stripe, VNPay, MoMo, Google Auth.
- **Frontend**: Next.js App Router, TypeScript, TailwindCSS, framer-motion, html5-qrcode (Quét QR), react-quill-new (Rich text), recharts (Biểu đồ).
- **DevOps**: Docker Compose cho MongoDB, backend và frontend.

## Tính Năng Nổi Bật

### 🧑‍💻 Khách Hàng (Customer)
- **Xác Thực**: Đăng nhập/Đăng ký tài khoản (Local & Google Auth).
- **Khám Phá Sự Kiện**: Xem danh sách, chi tiết sự kiện, và tìm kiếm sự kiện.
- **Đặt Vé**: Chọn hạng vé, số lượng, và áp dụng mã giảm giá (Coupon).
- **Thanh Toán**: Hỗ trợ thanh toán qua Stripe, VNPay, MoMo hoặc xác nhận nội bộ.
- **Vé & QR Code**: Nhận vé kèm mã QR qua Email (SMTP). Xem lại vé đã mua trực tiếp trong hệ thống.
- **Đánh Giá (Reviews)**: Viết đánh giá (Ratings & Reviews) cho sự kiện.

### 👑 Quản Trị Viên (Admin)
- **Dashboard**: Thống kê doanh thu, số lượng vé bán ra, và biểu đồ trực quan (Recharts).
- **Quản Lý Sự Kiện**: Thêm, sửa, xóa sự kiện. Upload ảnh sự kiện bằng Multer. Mô tả bằng Rich Text Editor.
- **Quản Lý Vé & Booking**: Theo dõi đơn hàng (Pending, Paid, Cancelled).
- **Check-in Tự Động**: Quét mã QR trực tiếp từ camera (tích hợp html5-qrcode) để Check-in cho khách ngay tại sự kiện.
- **Quản Lý Mã Giảm Giá**: Tạo, sửa, xóa mã giảm giá (Coupon CRUD).
- **Quản Lý Người Dùng**: Cấp/thu hồi quyền admin, xóa tài khoản.

## Chạy Local

Cài đặt tất cả phụ thuộc:
```bash
npm run install:all
```

Tạo file biến môi trường:
```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
```
*(Hãy điền các thông số SMTP, Google Auth, Stripe, VNPay, MoMo trong file biến môi trường nếu muốn test các tính năng thực tế)*

Khởi tạo dữ liệu mẫu (Seed):
```bash
npm run seed --prefix backend
```

Chạy dự án:
```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **MongoDB mặc định**: `mongodb://localhost:27017/event_booking`

## Chạy Docker

```bash
docker compose up --build
```
Sau khi các container chạy xong, mở một terminal khác để khởi tạo dữ liệu:
```bash
npm run seed --prefix backend
```

## Tài Khoản Khởi Tạo Mẫu
- **Admin**: `admin@example.com` / `123456`
- **Customer**: `customer@example.com` / `123456`

## Cấu Hình Dịch Vụ Mở Rộng (.env)
- **Email (SMTP)**: Cần `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` để gửi vé QR.
- **Google Auth**: Cần `GOOGLE_CLIENT_ID` cho cả Frontend và Backend.
- **Stripe**: Cần `STRIPE_SECRET_KEY` và `STRIPE_WEBHOOK_SECRET`.
- **VNPay**: Cần `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_PAYMENT_URL`.
- **MoMo**: Cần `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`, `MOMO_ENDPOINT`.
- *Lưu ý*: `BACKEND_PUBLIC_URL` phải trỏ về backend URL công khai để cổng thanh toán redirect/IPN về đúng server và đường dẫn ảnh Upload hoạt động đúng.
