# BetterUS — Nest Backend

API Backend của hệ thống **BetterUS** — nền tảng kết nối tình nguyện viên với người có hoàn cảnh khó khăn tại TP. Hồ Chí Minh.

Được xây dựng bằng **NestJS** (TypeScript) + **Prisma ORM** + **PostgreSQL**.

---

## Tính năng chính

### Xác thực & Phân quyền
- Đăng ký / Đăng nhập với mã hóa `bcrypt`
- JWT Authentication (Access Token)
- Phân quyền theo vai trò: `ADMIN`, `VOLUNTEER`, `BENEFICIARY`, `ORGANIZATION`
- Rate limiting (100 requests/phút) để chống DDoS

### Quản lý người dùng
- CRUD hồ sơ tình nguyện viên (kỹ năng, khu vực, thông tin cá nhân)
- CRUD hồ sơ người thụ hưởng (loại hoàn cảnh, người giám hộ)
- Quản lý trạng thái tài khoản: `PENDING` → `ACTIVE` / `BANNED`

### Yêu cầu hỗ trợ
- Tạo và quản lý yêu cầu giúp đỡ theo danh mục (giáo dục, y tế, thực phẩm, nhà ở...)
- Phân công tình nguyện viên xử lý yêu cầu
- Theo dõi trạng thái: `PENDING` → `APPROVED` → `ONGOING` → `COMPLETED`
- Hệ thống đánh giá và phản hồi sau hoàn thành

### Tổ chức Xã hội (TCXH)
- Quản lý hồ sơ tổ chức (duyệt/từ chối)
- Tạo và quản lý chiến dịch tình nguyện (Campaign)
- Đăng bài truyền thông / thông báo
- Thống kê hoạt động tổ chức

### Phần thưởng & Chứng chỉ
- Hệ thống điểm tích lũy cho tình nguyện viên
- Phát hành chứng chỉ tình nguyện (PDF) bằng PDFKit + Canvas
- Tích hợp Cloudinary để lưu trữ ảnh/file

### Chat Real-time
- Nhắn tin 1-1 qua Socket.IO (WebSocket)
- Lịch sử hội thoại, trạng thái đã đọc

### Cảnh báo khẩn cấp
- Ghi nhận và phân loại yêu cầu khẩn cấp
- Mức độ ưu tiên: `STANDARD` / `CRITICAL`

### Quản trị (Admin)
- Dashboard tổng quan hệ thống
- Duyệt tổ chức, quản lý toàn bộ người dùng
- Nhật ký hoạt động (Activity Log)
- Thống kê theo khu vực (District tại TP.HCM)


---

## Hướng dẫn cài đặt & chạy

### 1. Clone repository và vào thư mục

```bash
cd Nest_Backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
# Kết nối PostgreSQL
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/betterus?schema=public"

# JWT Secret (đặt chuỗi ngẫu nhiên, dài và khó đoán)
SECRET_KEY="your_super_secret_jwt_key"

# Google Maps API Key
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Cloudinary (lưu ảnh)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email SMTP (gửi mail thông báo)
MAIL_SERVICE=gmail
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=BetterUS <your_email@gmail.com>

# Port (mặc định 8080)
PORT=8080
```

### 4. Khởi tạo database

```bash
# Chạy migration để tạo bảng
npm run db:migrate

# (Tùy chọn) Seed dữ liệu mẫu
npx prisma db seed
```

### 5. Chạy server

```bash
# Development (tự reload khi thay đổi code)
npm run dev
# hoặc
npm run start:dev

# Production
npm run start:prod
```

Server sẽ chạy tại: `http://localhost:8080`

---

## Tài liệu API (Swagger)

Sau khi khởi động server, truy cập:

```
http://localhost:8080/api
```

Swagger UI cung cấp đầy đủ danh sách endpoint, mô tả, và cho phép test trực tiếp.

> Dùng tính năng **Authorize** để đăng nhập với JWT token và test các endpoint cần xác thực.

---

## Quản lý Database (Prisma)

```bash
# Xem và chỉnh sửa dữ liệu qua giao diện web
npm run db:studio

# Tạo migration mới khi thay đổi schema
npm run db:migrate

# Reset toàn bộ database (⚠️ XÓA HẾT DỮ LIỆU)
npm run db:reset

# Cập nhật Prisma Client sau khi thay đổi schema
npx prisma generate
```

---

## Cấu trúc dự án

```
Nest_Backend/
├── src/
│   ├── main.ts                  # Entry point (port, Swagger, CORS, Helmet)
│   ├── app.module.ts            # Module gốc
│   ├── auth/                    # Xác thực JWT, login, register
│   ├── users/                   # Quản lý người dùng
│   ├── request/                 # Yêu cầu hỗ trợ
│   ├── feedback/                # Đánh giá & phản hồi
│   ├── chat/                    # Chat real-time (Socket.IO)
│   ├── emergency/               # Yêu cầu khẩn cấp
│   ├── notification/            # Thông báo hệ thống
│   ├── cloudinary/              # Upload ảnh lên Cloudinary
│   ├── volunteer-rewards/       # Điểm thưởng & chứng chỉ tình nguyện
│   ├── activity-log/            # Nhật ký hoạt động
│   ├── admin/                   # Module quản trị hệ thống
│   ├── admin-tcxh/              # Module dành cho Tổ chức Xã hội
│   │   ├── organization/        # Quản lý tổ chức
│   │   ├── campaign/            # Chiến dịch tình nguyện
│   │   ├── communication/       # Bài đăng truyền thông
│   │   └── statistics/          # Thống kê
│   ├── prisma/                  # Prisma service
│   ├── common/                  # Guards, decorators, interceptors dùng chung
│   ├── helpers/                 # Hàm tiện ích (email, PDF...)
│   └── lib/                     # Thư viện nội bộ
├── prisma/
│   ├── schema.prisma            # Schema database
│   ├── seed.ts                  # Seed dữ liệu mẫu
│   └── migrations/              # Lịch sử migration
├── .env                         # Biến môi trường (không commit)
├── .env.example                 # Mẫu biến môi trường
├── nest-cli.json                # Cấu hình NestJS CLI
└── package.json
```

---

## 🗃 Cấu trúc Database (tóm tắt)

| Model | Mô tả |
|---|---|
| `User` | Người dùng (có role: ADMIN, VOLUNTEER, BENEFICIARY, ORGANIZATION) |
| `VolunteerProfile` | Hồ sơ tình nguyện viên (kỹ năng, khu vực hoạt động) |
| `BficiaryProfile` | Hồ sơ người thụ hưởng (loại hoàn cảnh, người giám hộ) |
| `OrganizationProfile` | Hồ sơ tổ chức xã hội |
| `HelpRequest` | Yêu cầu hỗ trợ |
| `Campaign` | Chiến dịch tình nguyện |
| `CampaignRegistration` | Đăng ký tham gia chiến dịch |
| `Review` | Đánh giá sau hoạt động |
| `Appreciation` | Lời cảm ơn |
| `PointHistory` | Lịch sử điểm thưởng |
| `IssuedCertificate` | Chứng chỉ tình nguyện |
| `Conversation` + `Message` | Hội thoại và tin nhắn (chat) |
| `CommunicationPost` | Bài đăng của tổ chức |

---

## Kết nối với các ứng dụng khác

- **Next_Frontend** (Web Admin): kết nối qua `http://localhost:8080/api/v1`  (sử dụng ngrok để expose port)
- **Mobile** (Flutter): kết nối qua REST API + WebSocket

---

## Chạy Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Kiểm tra độ phủ test
npm run test:cov
```

---
