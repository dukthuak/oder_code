# Hướng dẫn MySQL Server & kết nối CSDL

## 1. Cài MySQL (Windows)

1. Mở **MySQL Installer** → **Reconfigure** hoặc **Add** → chọn **MySQL Server 8.0**.
2. Đặt **root password** (ví dụ: `181220`) — ghi lại để điền vào `.env`.
3. Port mặc định: **3306**.
4. Bật service **MySQL80** chạy cùng Windows (Services → MySQL80 → Running).

## 2. Cấu hình dự án

File `server/.env`:

```env
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=nh_app
DB_PASSWORD=App@123
DB_NAME=nha_hang_db
DB_ROOT_USER=root
DB_ROOT_PASSWORD=181220
```

| Biến | Ý nghĩa |
|------|---------|
| `DB_ROOT_*` | Dùng **một lần** khi chạy `npm run setup-db` (tạo DB + user) |
| `DB_USER` / `DB_PASSWORD` | User app dùng khi chạy server (phải tồn tại sau setup) |
| `DB_NAME` | Database `nha_hang_db` |

## 3. Tạo database & user (bắt buộc lần đầu)

```powershell
cd d:\ducthuan\trang\server
npm install
npm run setup-db
```

Script sẽ:

- Tạo database `nha_hang_db`
- Chạy bảng, view, procedure, trigger, dữ liệu mẫu
- Tạo user **`nh_app`** / `App@123` và cấp quyền
- Đặt mật khẩu nhân viên mẫu: `password123`

Khởi tạo lại từ đầu:

```powershell
$env:RESET_DB="1"; npm run setup-db
```

## 4. Chạy ứng dụng

```powershell
cd d:\ducthuan\trang\server
npm start
```

Mở trình duyệt: **http://localhost:3001**

| Email | Mật khẩu |
|-------|----------|
| thungan@nhang.com | password123 |
| admin@nhang.com | password123 |

> Lưu ý domain: **`@nhang.com`** (không phải `@nhahang.com`).

## 5. Kiểm tra kết nối MySQL

### Cách 1 — MySQL Workbench / Command Line

```sql
mysql -u root -p
-- nhập DB_ROOT_PASSWORD

CREATE USER IF NOT EXISTS 'nh_app'@'localhost' IDENTIFIED BY 'App@123';
GRANT ALL ON nha_hang_db.* TO 'nh_app'@'localhost';
FLUSH PRIVILEGES;

USE nha_hang_db;
SELECT * FROM nhan_vien LIMIT 3;
```

### Cách 2 — API health

```text
GET http://localhost:3001/api/health
→ {"status":"ok","service":"nha-hang-api"}
```

Đăng nhập thành công = BE đã kết nối MySQL đúng.

## 6. Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| `Access denied for user 'nh_app'@'localhost'` | Chạy lại `npm run setup-db` (tạo user `nh_app`) |
| `ECONNREFUSED` | Bật service MySQL80, kiểm tra port 3306 |
| `Access denied for user 'root'` | Sửa `DB_ROOT_PASSWORD` trong `.env` cho đúng mật khẩu root |
| `EADDRINUSE :3001` | Đóng process cũ hoặc đổi `PORT` trong `.env |
| Email/mật khẩu sai | Dùng `thungan@nhang.com` / `password123` |

## 7. Luồng kết nối (kiến trúc)

```
Trình duyệt (index.html)
    → fetch /api/*  (port 3001)
        → Express (server.js)
            → mysql2 pool (config/db.js)
                → MySQL Server 8.0 :3306
                    → database nha_hang_db
```

Chat AI & order gọi stored procedure trên cùng pool MySQL này.
