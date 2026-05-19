# Hướng dẫn kết nối MySQL và chạy dự án

## 1. Yêu cầu trước khi bắt đầu

- Node.js phiên bản 18+
- MySQL server đang chạy trên máy (mặc định cổng `3306`)
- Quyền truy cập MySQL từ máy local

## 1.1 Trên Windows: dùng MySQL Installer

Nếu bạn đang cài MySQL bằng MySQL Installer, hãy làm theo các bước sau:

1. Mở MySQL Installer và chọn `Reconfigure` hoặc `Add` nếu cần cài mới.
2. Chọn `MySQL Server` và kiểm tra phiên bản đã cài.
3. Trong phần cấu hình, chọn:
   - `Config Type`: `Development Computer`
   - `Connectivity`: bật `TCP/IP`, port là `3306`
   - `Authentication Method`: chọn `Use Strong Password Encryption for Authentication`
4. Tạo account root và đặt mật khẩu.
5. Hoàn tất cấu hình và khởi động MySQL Server.

> Nếu MySQL Installer báo server đã cài và đang chạy, bạn chỉ cần chắc chắn rằng server đang hoạt động và cổng `3306` mở.

## 2. Cài đặt phụ thuộc

Mở terminal và chuyển vào thư mục `server` của dự án:

```bash
cd d:\ducthuan\trang\server
```

Chạy:

```bash
npm install
```

## 3. Tạo file cấu hình môi trường

Trong thư mục `server`, tạo file `.env` (nếu chưa có). Nội dung mẫu:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_ROOT_USER=root
DB_ROOT_PASSWORD=your_root_password
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=nha_hang_db
```

Giải thích các biến:

- `PORT`: cổng backend Node.js sẽ chạy
- `DB_HOST`: địa chỉ MySQL (thường là `127.0.0.1` hoặc `localhost`)
- `DB_PORT`: cổng MySQL (`3306` mặc định)
- `DB_ROOT_USER`, `DB_ROOT_PASSWORD`: thông tin root để thiết lập database lần đầu
- `DB_USER`, `DB_PASSWORD`: thông tin kết nối ứng dụng với database
- `DB_NAME`: tên database dự án, mặc định là `nha_hang_db`

> Lưu ý: sau khi chạy `npm run setup-db`, ứng dụng sẽ dùng user MySQL `nh_app` với mật khẩu `App@123`.

## 4. Thiết lập database MySQL

Trong thư mục `server`, chạy:

```bash
npm run setup-db
```

Lệnh này sẽ:

- tạo database `nha_hang_db` nếu chưa tồn tại
- chạy các file SQL trong thư mục `database/`
- tạo dữ liệu mẫu
- cập nhật mật khẩu cho tất cả nhân viên là `password123`

> Nếu muốn tạo lại database hoàn toàn, chạy thêm `RESET_DB=1` trước khi gọi `npm run setup-db`:
>
> ```bash
> SET RESET_DB=1&& npm run setup-db
> ```

## 5. Chạy server

Sau khi thiết lập xong, khởi động backend bằng:

```bash
npm start
```

Nếu server khởi động đúng, bạn sẽ thấy dòng tương tự:

```text
Server: http://localhost:3000
```

## 6. Mở ứng dụng

Mở trình duyệt và truy cập:

```text
http://localhost:3000/
```

## 7. Tài khoản demo

- Email: `thungan@quehuong.vn`
- Mật khẩu: `password123`

## 8. Kiểm tra lỗi khi không kết nối được

- MySQL service đã chạy chưa
- `DB_HOST` và `DB_PORT` trong `.env` có đúng không
- Tên đăng nhập và mật khẩu MySQL có đúng không
- Quyền user MySQL có thể kết nối từ máy local không

## 9. Ghi chú thêm

- Frontend hiện tại được phục vụ bởi Express từ thư mục `public/`, không cần build riêng.
- Nếu đổi cổng `PORT`, hãy mở chính xác `http://localhost:<PORT>/`.
