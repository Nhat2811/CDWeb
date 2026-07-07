# BÁO CÁO ĐỒ ÁN MÔN HỌC
TÊN ĐỀ TÀI:
**XÂY DỰNG WEBSITE ĐẶT VÉ VÀ QUẢN LÝ SỰ KIỆN EVENT BOOKING**

## 1. Thông tin nhóm sinh viên thực hiện
* Thành viên 1: Ngô Quang Nhật
* Thành viên 2: Đinh Trần Xuân Hậu

## 2. Bảng phân công công việc

| STT | Họ tên | Vai trò | Công việc thực hiện | Đánh giá |
|---|---|---|---|---|
| 1 | Ngô Quang Nhật | Nhóm trưởng | Phân tích yêu cầu nghiệp vụ đặt vé sự kiện; thiết kế mô hình dữ liệu MongoDB/Mongoose; xây dựng kiến trúc hệ thống; lập trình Backend bằng NestJS, Node.js và TypeScript; quản lý tiến độ và tích hợp thanh toán (VNPay, COD, Chuyển khoản). **Phát triển thêm:** Tích hợp xác thực Social (Google, Facebook), xác thực qua Email & quên mật khẩu, xây dựng API mã giảm giá (Coupons), hệ thống đánh giá (Reviews), và module gửi Email tự động. | 100% |
| 2 | Đinh Trần Xuân Hậu | Thành viên | Thiết kế UI/UX toàn trang; lập trình Frontend bằng Next.js, React, TypeScript và Tailwind CSS cho hệ thống người dùng đặt vé; xây dựng Admin Dashboard quản lý sự kiện, vé, booking; xử lý Responsive và luồng hiển thị QR vé. **Phát triển thêm:** Tích hợp Dark/Light Theme, giao diện nhập mã giảm giá, và UI đánh giá sự kiện (Review Modal). | 100% |

## 3. Tóm tắt nội dung project
Đồ án Website đặt vé và quản lý sự kiện Event Booking là một hệ thống thương mại điện tử chuyên biệt, hỗ trợ số hóa quy trình đăng tải sự kiện, tìm kiếm sự kiện, đặt vé, thanh toán và quản lý đơn vé. Hệ thống được tách thành hai phân hệ chính, hiện đã được cập nhật thêm nhiều tính năng mới:

*   **Phân hệ người dùng:** Cung cấp giao diện trực quan để người dùng xem danh sách sự kiện, tìm kiếm theo tên hoặc danh mục, xem chi tiết thời gian - địa điểm - giá vé. 
    *   **Tính năng mới nổi bật:** Hỗ trợ đăng nhập nhanh bằng Google/Facebook, xác thực tài khoản qua Email, áp dụng mã giảm giá (Coupons) khi thanh toán, đánh giá sự kiện sau khi tham gia (Reviews). Người dùng cũng có thể tuỳ chỉnh giao diện Sáng/Tối (Dark/Light mode).
*   **Phân hệ quản trị viên:** Cung cấp Dashboard độc lập để quản lý người dùng, danh mục sự kiện, thông tin sự kiện, mã giảm giá (Coupons), đánh giá (Reviews), doanh thu và trạng thái đơn đặt vé theo thời gian thực.

## 4. Các công nghệ và kỹ thuật sử dụng
Dự án được triển khai theo mô hình Client-Server kết hợp kiến trúc RESTful API, phân tách rõ ràng giữa Frontend và Backend nhằm tối ưu hiệu năng, khả năng bảo trì và khả năng mở rộng.

**A. Nền tảng Frontend: Next.js, React, TypeScript và Tailwind CSS**
*   **Next.js 15 & React 19:** Sử dụng App Router để xây dựng giao diện hiện đại, tối ưu SEO và trải nghiệm người dùng.
*   **TypeScript:** Giúp định nghĩa kiểu dữ liệu cho toàn bộ hệ thống, giảm thiểu lỗi trong quá trình phát triển.
*   **Tailwind CSS:** Hỗ trợ xây dựng giao diện responsive theo hướng utility-first.
*   **Framer Motion, Lucide React & next-themes:** Bổ sung hiệu ứng chuyển động, biểu tượng trực quan và hỗ trợ chuyển đổi giao diện Dark/Light mode dễ dàng.

**B. Nền tảng Backend: Node.js, NestJS và MongoDB**
*   **NestJS & TypeScript:** Xây dựng cấu trúc Backend theo module (Controller, Service, DTO, Guard) dễ bảo trì và mở rộng.
*   **MongoDB & Mongoose:** Lưu trữ dữ liệu linh hoạt (NoSQL) cho các collection chính như users, events, tickets, bookings, payments, coupons, reviews.
*   **Bảo mật & Tích hợp:** Sử dụng JWT cho xác thực người dùng. Tích hợp thanh toán đa nền tảng (VNPay, COD, Chuyển khoản) và hệ thống Mailer để gửi email xác thực/thông báo đặt vé. Hỗ trợ Passport.js cho xác thực Google và Facebook.

## 5. Kết quả thực hiện
Sau quá trình nghiên cứu, thiết kế và phát triển, nhóm đã hoàn thành đồ án với các kết quả chính sau:
*   Xây dựng thành công hệ thống API hoàn chỉnh và thiết kế cơ sở dữ liệu MongoDB phục vụ các nghiệp vụ đặt vé phức tạp.
*   Hoàn thiện luồng nghiệp vụ Front-to-Back: đăng ký/đăng nhập (bao gồm Google/Facebook), xác thực Email, xem sự kiện, áp dụng mã giảm giá, xác nhận booking, thanh toán qua VNPay, COD hoặc Chuyển khoản và lưu lịch sử vé.
*   Tách riêng hai hệ thống Frontend cho người dùng và Admin Dashboard cho quản trị viên, bảo đảm phân quyền chặt chẽ.
*   Hỗ trợ hệ thống đánh giá (Reviews) giúp tăng tính tương tác của nền tảng, gửi thông báo tự động tới người dùng qua Email.
*   Giao diện website hiện đại, hỗ trợ chuyển đổi Dark/Light mode, phản hồi nhanh và hiển thị ổn định trên nhiều kích thước màn hình.

## 6. Link tham khảo dự án
*   **Link deploy:** https://cd-web-one.vercel.app/
*   **Link Source Code GitHub:** https://github.com/Nhat2811/CDWeb.git
