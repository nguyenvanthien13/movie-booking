# Movie Ticket Booking System

Website bán vé xem phim Full-stack: **React + Vite + Tailwind** · **Spring Boot 3 (Java 21)** · **PostgreSQL**.

## Chạy dự án

Yêu cầu: JDK 21, Maven, Node 18+, Docker (hoặc PostgreSQL cài sẵn).

```bash
# 1. Database
docker compose up -d                 # PostgreSQL 16 ở localhost:5432 (db: moviebooking, user/pass: postgres)

# 2. Backend  (http://localhost:8080, Swagger: /swagger-ui.html)
cd backend
mvn spring-boot:run

# 3. Frontend (http://localhost:5173)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Lần chạy đầu tiên Flyway tạo schema (`db/migration/V1__init.sql`) và `DataSeeder` nạp dữ liệu mẫu:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@moviebooking.com | Admin@123 |
| Khách | user@moviebooking.com | User@123 |

Biến môi trường backend: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (>= 32 ký tự), `CORS_ORIGINS`, `PAYMENT_SECRET`.
Frontend: `VITE_API_URL`.

## Nghiệp vụ đặt vé và chống đặt trùng ghế

1. `POST /api/bookings` (trong `@Transactional`) kiểm tra ghế thuộc đúng phòng, chưa có booking đang hiệu lực, rồi tạo booking `PENDING` giữ ghế **10 phút**.
2. Ràng buộc DB: `UNIQUE INDEX (showtime_id, seat_id) WHERE active` trên `booking_seats`. Nếu hai người bấm cùng lúc, DB từ chối người thứ hai -> API trả `409`.
3. Thanh toán thành công -> booking `CONFIRMED`, ghế giữ vĩnh viễn, sinh vé + QR.
4. Quá hạn không thanh toán -> `BookingScheduler` (30 giây/lần) chuyển `EXPIRED` và nhả ghế (`active = false`).
5. Hủy: `PENDING` hủy tự do; `CONFIRMED` chỉ hủy trước giờ chiếu 2 tiếng (payment -> `REFUNDED`).
6. Sơ đồ ghế `GET /api/showtimes/{id}/seats` trả `AVAILABLE / HELD / BOOKED`; giá ghế VIP = 1.25x giá suất chiếu.

## Thanh toán

Cổng thanh toán đang **mô phỏng** (`PaymentService.pay`), có nút giả lập thất bại để thử luồng lỗi.
`POST /api/payments/callback` là webhook mẫu, xác thực bằng header `X-Signature` = HMAC-SHA256(`PAYMENT_SECRET`, `bookingId|transactionId|status|amount`). Để dùng VNPay/MoMo/Stripe thật, thay phần mô phỏng bằng việc tạo link thanh toán và để webhook xác nhận kết quả.

## API chính

| Nhóm | Endpoint |
|---|---|
| Auth | `POST /api/auth/register · login · refresh`, `GET /api/auth/me` |
| Phim | `GET /api/movies?q=&status=&page=&size=`, `/now-showing`, `/upcoming`, `/{id}` · admin: `POST/PUT/DELETE /api/admin/movies` |
| Rạp/phòng | `GET /api/cinemas`, `/api/cinemas/{id}/rooms` · admin: `/api/admin/cinemas`, `/api/admin/rooms` (tự sinh ghế rows x columns) |
| Suất chiếu | `GET /api/showtimes?movieId=&cinemaId=&date=`, `/{id}`, `/{id}/seats` · admin: `GET/POST/DELETE /api/admin/showtimes` |
| Booking | `POST /api/bookings`, `GET /my-bookings`, `/{id}`, `POST /{id}/cancel`, `GET /{id}/ticket` |
| Payment | `POST /api/payments`, `GET /api/payments/{id}`, `POST /api/payments/callback` |
| Admin | `GET /api/admin/stats`, `/bookings`, `/users`, `PUT /users/{id}/role` |

## Cấu trúc

```
backend/   Spring Boot (config, common, auth, user, movie, cinema, room, seat, showtime, booking, payment, admin)
frontend/  React (components, layouts, pages, pages/admin, services, hooks, context, routes)
docker-compose.yml
```

## Gợi ý mở rộng

Test (JUnit + Testcontainers, đặc biệt test hai request đặt cùng ghế), refresh token lưu DB để thu hồi, email gửi vé, trang quản lý người dùng trên UI, deploy (Dockerfile cho backend, `npm run build` cho frontend).
