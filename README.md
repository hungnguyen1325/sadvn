# SADVN — Hệ thống tra cứu sản phẩm vàng bạc đá quý

**SADVN** (`sadvn.vn`) là hệ thống web tra cứu thông tin sản phẩm vàng bạc đá quý dành cho các doanh nghiệp kinh doanh vàng tại Việt Nam. Hệ thống cho phép người dùng cuối tra cứu chi tiết sản phẩm (tên, mã sản phẩm, hàm lượng vàng, trọng lượng tổng, trọng lượng đá, trọng lượng vàng thực…) thông qua đường dẫn URL chứa các thông số sản phẩm, đồng thời cung cấp trang quản trị (Admin) để quản lý danh sách doanh nghiệp.

---

## Tổng quan kiến trúc

```
sadvn/
├── sources/
│   ├── frontend/          # Next.js 16 (React 19, TypeScript, TailwindCSS 4)
│   └── backend/           # Spring Boot 4.1 (Java 25, Gradle, SQL Server)
├── release/
│   ├── frontend/          # Bản build standalone Next.js (production)
│   └── backend/           # File JAR đóng gói + script chạy
├── .gitignore             # Gitignore toàn bộ project
└── README.md
```

| Thành phần | Công nghệ | Port mặc định |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, TailwindCSS 4 | `3000` |
| **Backend** | Spring Boot 4.1, Java 25, Gradle, Flyway | `8386` |
| **Database** | Microsoft SQL Server | `1433` |
| **Auth** | JWT (jjwt 0.12.6) + Spring Security | — |

---

## Tính năng chính

### 🔍 Tra cứu sản phẩm (Public)
- Người dùng truy cập URL dạng `/{business_code}/{product_name}/{gold_purity}/{total_weight}/{stone_weight}/{product_code}` để xem chi tiết sản phẩm
- Hiển thị: tên sản phẩm, mã sản phẩm, hàm lượng vàng, trọng lượng tổng (chỉ/gram), trọng lượng đá, **trọng lượng vàng thực** (tổng − đá)
- Tự động tra cứu thông tin doanh nghiệp (tên, mã số thuế, địa chỉ) từ API backend

### 🔐 Đăng nhập (Authentication)
- Trang đăng nhập hệ thống với JWT token
- Token hết hạn (401) tự động redirect về trang đăng nhập

### 🏢 Quản trị doanh nghiệp (Admin)
- Xem danh sách doanh nghiệp
- Tìm kiếm doanh nghiệp theo tên, mã số thuế
- Thêm / Sửa / Xóa doanh nghiệp (CRUD)
- Quản lý trạng thái hoạt động (active/inactive)

---

## Cài đặt & Chạy

### Yêu cầu hệ thống

- **Java** 25+
- **Node.js** 20+
- **SQL Server** (bất kỳ phiên bản hỗ trợ JDBC)
- **Gradle** (đi kèm wrapper trong project)

### 1. Backend

```bash
cd sources/backend

# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa .env với thông tin database & JWT thực tế
# DATABASE_HOST, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, JWT_SECRET...

# Chạy development
./gradlew bootRun
```

Backend sẽ khởi chạy tại `http://localhost:8386`. Flyway sẽ tự động tạo schema database lần đầu tiên.

### 2. Frontend

```bash
cd sources/frontend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa .env — đặt API_URL trỏ đến backend
# API_URL=http://localhost:8386

# Chạy development
npm run dev
```

Frontend sẽ khởi chạy tại `http://localhost:3000`.

### 3. Production (Release)

Thư mục `release/` chứa bản build sẵn dùng cho production:

```bash
# Backend — chạy JAR trực tiếp
cd release/backend
cp .env.example .env   # Cấu hình .env
run.cmd                # Windows

# Frontend — chạy standalone Next.js server
cd release/frontend
cp .env.example .env   # Cấu hình .env
node server.js
```

---

## Cấu trúc Database

Hệ thống sử dụng **Flyway** để quản lý migration. Schema ban đầu gồm 2 bảng:

| Bảng | Mô tả |
|---|---|
| `accounts` | Tài khoản đăng nhập hệ thống (username, password hash) |
| `business` | Doanh nghiệp kinh doanh vàng (tên, MST, địa chỉ, trạng thái) |

---

## Biến môi trường

### Backend (`sources/backend/.env`)

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `APP_NAME` | Tên ứng dụng | `Backend sadvn.vn` |
| `SERVER_PORT` | Port chạy backend | `8386` |
| `DATABASE_HOST` | Host SQL Server | `localhost` |
| `DATABASE_PORT` | Port SQL Server | `1433` |
| `DATABASE_NAME` | Tên database | `sadvn_db` |
| `DATABASE_USER` | User database | `sa` |
| `DATABASE_PASSWORD` | Password database | — |
| `JWT_SECRET` | Secret key cho JWT | — |
| `JWT_EXPIRATION` | Thời gian hết hạn JWT (ms) | `860000` |
| `CORS_ALLOWED_ORIGINS` | Danh sách origin được phép | `https://sadvn.vn` |

### Frontend (`sources/frontend/.env`)

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `API_URL` | URL backend API | `http://localhost:8386` |

---

## Cấu trúc source code

### Frontend (`sources/frontend/src/`)

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (Inter font, Vietnamese)
│   ├── page.tsx                      # Trang đăng nhập
│   ├── login/                        # Route đăng nhập
│   ├── admin/                        # Trang quản trị doanh nghiệp
│   │   ├── page.tsx                  # Admin dashboard
│   │   ├── components/               # Components riêng cho admin
│   │   └── hooks/                    # Custom hooks (useBusinesses)
│   └── [business_code]/[product_name]/[gold_purity]/[total_weight]/[stone_weight]/[product_code]/
│       └── page.tsx                  # Trang tra cứu sản phẩm (dynamic route)
├── assets/                           # CSS chính
├── components/                       # Components dùng chung (Modal, Toast, CopyProtection)
└── services/                         # API client & service layers
    ├── ApiClient.ts                  # HTTP client wrapper
    ├── authService.ts                # Xử lý đăng nhập/JWT
    └── businessService.ts            # CRUD doanh nghiệp
```

### Backend (`sources/backend/src/main/java/com/app/backend/`)

```
backend/
├── BackendApplication.java           # Entry point
├── configs/                          # Cấu hình (CORS, JWT, Security)
├── core/                             # Thành phần lõi
│   ├── database/                     # Database utilities
│   ├── exceptions/                   # Xử lý exception toàn cục
│   ├── jwt/                          # JWT filter & utilities
│   └── response/                     # Response wrapper chuẩn hóa
├── entities/                         # JPA entities (Account, Business)
└── modules/                          # Business modules
    ├── auth/                         # Authentication (login)
    ├── business/                     # CRUD doanh nghiệp
    └── health/                       # Health check endpoint
```

---

## License

Private — Internal use only.