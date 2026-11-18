# SADVN — Hệ thống tra cứu sản phẩm vàng bạc đá quý

**SADVN** (`sadvn.vn`) là hệ thống web tra cứu thông tin sản phẩm vàng bạc đá quý và quản trị đối tác, doanh nghiệp kinh doanh vàng tại Việt Nam.

Hệ thống được phát triển dưới dạng kiến trúc Fullstack hoàn chỉnh trên **Next.js 16 (App Router)** kết nối trực tiếp với **Microsoft SQL Server** thông qua các **Server Actions** bảo mật cao, loại bỏ tầng API trung gian riêng biệt nhằm tối ưu hiệu năng và bảo mật.

---

## Kiến trúc hệ thống

```
sadvn/
├── database/
│   └── schema.sql             # Kịch bản khởi tạo bảng (accounts, business)
├── public/                    # Tài nguyên tĩnh (ảnh, icon)
├── src/
│   ├── actions/               # Server Actions kết nối trực tiếp SQL Server
│   │   ├── authActions.ts     # Xác thực tài khoản với BCrypt & JWT
│   │   ├── businessActions.ts # Nghiệp vụ CRUD Doanh nghiệp (sadvn.vn)
│   │   └── customerActions.ts # Tra cứu liên CSDL (BangGiaVang, SADVietNam)
│   ├── app/                   # App Router (Next.js 16, React 19)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Trang đăng nhập
│   │   ├── admin/             # Quản trị Doanh nghiệp & Khách hàng
│   │   └── [business_code]/   # Tra cứu thông tin sản phẩm công khai
│   ├── components/            # Giao diện UI tái sử dụng
│   ├── lib/
│   │   └── db.ts              # Quản lý Connection Pool kết nối MS SQL Server
│   └── services/              # Client services gọi Server Actions
├── .env.example               # Mẫu cấu hình môi trường an toàn (không chứa mật khẩu)
├── .gitignore                 # Bảo vệ không commit file .env hay secret lên git
├── package.json
└── README.md
```

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| **Fullstack Framework** | Next.js 16 (Turbopack, React 19) | Chạy trên Node.js 20+ |
| **Giao diện & Styling** | TailwindCSS 4, Lucide Icons | Tối ưu trải nghiệm Responsive |
| **Cơ sở dữ liệu** | Microsoft SQL Server (1433) | Kết nối pool qua thư viện `mssql` |
| **Xác thực & Bảo mật** | BCrypt + HMAC-SHA256 JWT | 100% Parameterized Queries chống SQL Injection |

---

## Tính năng chính

### 1. 🔍 Tra cứu sản phẩm (Public)
- Tra cứu theo URL định dạng:
  `/{business_code}/{product_name}/{gold_purity}/{total_weight}/{stone_weight}/{product_code}`
- Tự động bóc tách và tính toán: hàm lượng vàng, trọng lượng tổng, trọng lượng đá, **trọng lượng vàng thực**.
- Truy vấn thông tin doanh nghiệp (tên, MST, địa chỉ) trực tiếp từ database.

### 2. 🏢 Quản trị doanh nghiệp (Admin)
- Quản lý danh sách doanh nghiệp kinh doanh vàng (`sadvn.vn`).
- Tìm kiếm linh hoạt theo Tên, Mã số thuế, Địa chỉ.
- Thêm mới, cập nhật và xóa doanh nghiệp với kiểm soát trạng thái (Active/Inactive).

### 3. 👥 Tra cứu đa nguồn khách hàng (Multi-DB Customer Search)
- Kết nối đồng thời và đồng bộ dữ liệu từ:
  - CSDL `BangGiaVang` (Bảng `ShopsTbl`, `AccountsTbl`).
  - CSDL `SADVietNam` (Bảng `dmdoitac`).
- Tra cứu nhanh tên tiệm, chủ tiệm, số điện thoại, tài khoản theo từ khóa với phân trang tối ưu.

### 4. 🛡️ Tiêu chuẩn bảo mật (Security Standards)
- **Chống SQL Injection**: Toàn bộ câu lệnh SQL trong `src/actions/` sử dụng `request.input(...)` với kiểu dữ liệu định danh (`sql.Int`, `sql.NVarChar`, `sql.VarChar`, `sql.Bit`), tuyệt đối không dùng phép nối chuỗi.
- **Không lưu trữ Secret trong mã nguồn**: Tất cả địa chỉ máy chủ, cổng, tên đăng nhập, mật khẩu cơ sở dữ liệu và khóa bí mật JWT được đọc hoàn toàn từ biến môi trường (`process.env`).
- **Git Protection**: Tệp `.env` và các biến thể môi trường cục bộ được đưa vào `.gitignore` để ngăn ngừa rò rỉ thông tin nhạy cảm.

---

## Hướng dẫn cài đặt & Chạy

### Yêu cầu tiên quyết
- **Node.js**: Phiên bản 20.x trở lên.
- **Microsoft SQL Server**: Có quyền truy cập các cơ sở dữ liệu tương ứng.

### 1. Thiết lập biến môi trường
Sao chép tệp cấu hình mẫu và điền thông tin kết nối thực tế:
```bash
cp .env.example .env
```

Mở tệp `.env` và khai báo cấu hình của bạn:
```env
# Database chính (sadvn.vn)
DATABASE_HOST=127.0.0.1
DATABASE_PORT=1433
DATABASE_NAME=sadvn.vn
DATABASE_USER=sa
DATABASE_PASSWORD=your_secure_password
DATABASE_ENCRYPT=false

# Database khách hàng (BangGiaVang, SADVietNam)
CUSTOMER_DB_HOST=127.0.0.1
CUSTOMER_DB_PORT=1433
CUSTOMER_DB_USER=sa
CUSTOMER_DB_PASSWORD=your_secure_password
CUSTOMER_DB_ENCRYPT=false
CUSTOMER_DB1_NAME=BangGiaVang
CUSTOMER_DB2_NAME=SADVietNam

# Khóa ký JWT
JWT_SECRET=your_jwt_secret_signing_key_here
```

### 2. Cài đặt thư viện phụ thuộc
```bash
npm install
```

### 3. Khởi tạo cấu trúc Database (nếu là cơ sở dữ liệu mới)
Chạy tệp `database/schema.sql` trong SQL Server Management Studio (SSMS) hoặc Azure Data Studio để khởi tạo bảng `accounts` và `business`.

### 4. Chạy chế độ phát triển (Development)
```bash
npm run dev
```
Hệ thống sẽ chạy tại địa chỉ: `http://localhost:3000`.

### 5. Đóng gói và chạy Production
```bash
npm run build
npm run start
```

---

## Bản quyền
Nội bộ doanh nghiệp — All rights reserved.
