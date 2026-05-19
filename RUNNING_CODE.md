# Hướng dẫn chạy dự án nhà hàng

## Giới thiệu nhanh
Dự án này là hệ thống quản lý nhà hàng nhỏ với:
- Backend Node.js + Express phục vụ API và frontend tĩnh
- MySQL làm database
- Frontend vanilla JavaScript trong `public/`
- Tính năng chính: quản lý bàn, order, menu, kho, báo cáo, đặt chỗ và chat AI hỗ trợ gợi ý món

## 1. Yêu cầu môi trường
- Node.js 18+ (hoặc tương đương)
- MySQL server đang chạy
- Quyền truy cập MySQL từ máy local

## 2. Cài đặt phụ thuộc
Mở terminal và chuyển đến thư mục `server`:

```bash
cd d:\ducthuan\trang\server
```

Rồi chạy:

```bash
npm install
```

## 3. Cấu hình môi trường
Tạo file `.env` trong `server` nếu chưa có, với nội dung ví dụ:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_ROOT_USER=root
DB_ROOT_PASSWORD=your_root_password
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=nha_hang_db
```

Giải thích các biến:
- `PORT`: cổng backend (mặc định 3000)
- `DB_HOST`, `DB_PORT`: máy chủ MySQL
- `DB_ROOT_USER`, `DB_ROOT_PASSWORD`: dùng khi tạo database/migrations
- `DB_USER`, `DB_PASSWORD`, `DB_NAME`: thông tin kết nối ứng dụng

## 4. Khởi tạo database
Trong thư mục `server`, chạy:

```bash
npm run setup-db
```

Lệnh này sẽ:
- tạo database `nha_hang_db` nếu chưa tồn tại
- cấu hình bảng và dữ liệu mẫu
- thiết lập dữ liệu ban đầu cho ứng dụng

> Nếu cần reset database, có thể thêm biến môi trường `RESET_DB=1` trước khi chạy.

## 5. Chạy server
Trong thư mục `server`:

```bash
npm start
```

Hoặc chạy ở chế độ theo dõi thay đổi:

```bash
node --watch server.js
```

Khi server khởi động, truy cập:

```text
http://localhost:3000
```

## 6. Frontend / Giao diện sử dụng
Frontend được phục vụ trực tiếp từ `public/`.
- Mở trình duyệt tới `http://localhost:<PORT>/`
- Không cần build frontend nếu chỉ chạy bằng cấu trúc hiện tại

## 7. Chức năng chính của hệ thống
- Quản lý bàn: xem trạng thái bàn trống, đang dùng, đặt trước
- Order: mở order mới, thêm món, tính tổng và thanh toán
- Menu: duyệt món, lọc theo loại và tính năng đặt món nhanh
- Inventory: quản lý kho, theo dõi tồn kho
- Báo cáo: doanh thu, đơn hàng, trạng thái bán chạy
- Đặt chỗ: tạo, xem và quản lý reservation
- Chat AI: chat trợ giúp, gợi ý món, gửi đề xuất order hoặc gợi ý nhanh

## 8. API chính
Một số endpoint chính:
- `GET /api/health`: kiểm tra server
- `POST /api/auth/login`: đăng nhập
- `GET /api/tables`: lấy danh sách bàn
- `GET /api/orders`: lấy đơn
- `POST /api/orders`: mở order mới
- `GET /api/menu`: lấy danh sách món
- `POST /api/ai/chat`: chat AI

## 9. Kiểm tra nhanh
- Mở `http://localhost:3000` để xem giao diện
- Truy cập `http://localhost:3000/api/health` để xác nhận backend OK
- Nếu gặp lỗi kết nối MySQL, kiểm tra `.env` và MySQL đã chạy

## 10. Ghi chú
- File backend chính: `server/server.js`
- Frontend chính: `public/index.html`, `public/js/app.js`, `public/css/style.css`
- Nếu muốn thay đổi route API, xem các file trong `server/routes/`

---

Tài liệu này giúp bạn thiết lập, chạy và hiểu nhanh các chức năng chính của dự án.