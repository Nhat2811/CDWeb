# Event Booking System

Fullstack web app đặt chỗ và quản lý vé sự kiện.

## Tech stack

- Backend: NestJS, MongoDB, Mongoose, JWT, class-validator
- Frontend: Next.js App Router, TypeScript, TailwindCSS, Axios
- Docker-ready: MongoDB, backend, frontend

## Chạy local

```bash
npm run install:all
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- MongoDB mặc định: `mongodb://localhost:27017/event_booking`

## Chạy Docker

```bash
docker compose up --build
```

## Tài khoản admin đầu tiên

Đăng ký user bình thường, sau đó đổi role trong MongoDB:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

## API chính

- `POST /auth/register`
- `POST /auth/login`
- `GET /events`
- `GET /events/:id`
- `POST /events`
- `PATCH /events/:id`
- `DELETE /events/:id`
- `POST /tickets`
- `PATCH /tickets/:id`
- `DELETE /tickets/:id`
- `POST /bookings`
- `GET /bookings/my`
- `PATCH /bookings/:id/pay`
- `PATCH /bookings/:id/cancel`
- `GET /admin/dashboard`

## Dữ liệu demo

```bash
npm run seed
```

Tài khoản demo:

- Admin: `admin@example.com` / `123456`
- Customer: `customer@example.com` / `123456`
