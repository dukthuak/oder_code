# Tài liệu chức năng Web — Phở Hà Nội (F&B)

Hệ thống quản lý nhà hàng gồm **backend Express** (`server/`) và **giao diện web** (`public/`). Người dùng đăng nhập bằng email/mật khẩu; mỗi nhân viên gắn một **vai trò** (`vai_tro`) quyết định menu và API được phép dùng.

---

## 1. Đăng nhập & phiên làm việc

| Mục | Mô tả |
|-----|--------|
| **Màn hình** | Trang chủ khi chưa đăng nhập |
| **API** | `POST /api/auth/login` |
| **Dữ liệu** | Email, mật khẩu → trả về `ma_nv`, `ho_ten`, `vai_tro`, `ma_cn`, `ten_cn` |
| **Lưu phiên** | `sessionStorage` (trình duyệt) |
| **Gọi API** | Header `x-user-id`, `x-user-role` (server xác thực lại vai trò từ CSDL theo `ma_nv`) |

**Tài khoản demo** (mật khẩu mặc định `password123`):

| Email | Vai trò | Quyền chính |
|-------|---------|-------------|
| `admin@nhang.com` | Quản trị (`admin`) | Toàn bộ, **bao gồm Phân quyền** |
| `thungan@nhang.com` | Thu ngân | Order, thanh toán, đặt bàn, báo cáo, AI |
| `phucvu@nhang.com` | Phục vụ | Bàn & order, đặt bàn, thực đơn, AI chat |
| `bep@nhang.com` | Bếp | Hàng đợi bếp, tổng quan |
| `kho@nhang.com` | Kho | Tồn kho, tổng quan |

> **Ghi chú phân quyền:** Chỉ tài khoản có thẩm quyền **Quản trị (admin)** mới được sử dụng mục **Phân quyền** trên menu và API `/api/permissions/*`. Các vai trò khác không thấy mục này; nếu cố truy cập sẽ nhận thông báo *Không có quyền*.

---

## 2. Tổng quan (Dashboard)

| Mục | Mô tả |
|-----|--------|
| **Vai trò** | Tất cả: admin, thu ngân, phục vụ, bếp, kho |
| **API** | `GET /api/reports/dashboard`, `GET /api/reports/top-dishes`, `GET /api/inventory/alerts` |
| **Nội dung** | Món bán chạy, cảnh báo tồn kho thấp, thống kê nhanh theo chi nhánh đăng nhập |
| **Liên kết** | Chuyển nhanh sang Thực đơn / Kho |

---

## 3. Bàn & Order

| Mục | Mô tả |
|-----|--------|
| **Vai trò** | admin, thu ngân, phục vụ |
| **API** | `GET /api/tables`, `GET/POST /api/orders`, `POST .../items`, `POST .../pay` |
| **Chức năng** | Xem lưới bàn (trống / đang dùng / đặt trước); mở hóa đơn; thêm món; **thanh toán** (chỉ admin & thu ngân) |
| **Chat AI** | Widget góc phải — gợi ý món, thêm vào order đang mở (cần quyền AI) |

**Luồng:** Chọn bàn → tạo/mở hóa đơn → thêm món → (bếp xử lý) → thu ngân thanh toán.

---

## 4. Bếp

| Mục | Mô tả |
|-----|--------|
| **Vai trò** | admin, bếp |
| **API** | `GET /api/orders/kitchen/queue`, `PATCH /api/orders/items/:id/status` |
| **Chức năng** | Hàng đợi món: *Chờ* → *Đang nấu* → *Hoàn thành* |
| **Ghi chú trên trang** | Chỉ Quản trị hoặc Bếp có thẩm quyền cập nhật |

---

## 5. Thực đơn

| Mục | Mô tả |
|-----|--------|
| **Vai trò** | Xem: tất cả vai trò đã đăng nhập (API `GET /api/menu` công khai) |
| **Sửa CSDL** | Chỉ **admin** (`POST /api/menu`, `PATCH .../status`) |
| **Giao diện** | Lưới món theo danh mục, tìm kiếm, lọc (extras.js) |

---

## 6. Kho

| Mục | Mô tả |
|-----|--------|
| **Vai trò** | admin, kho |
| **API** | `GET /api/inventory`, `GET /api/inventory/alerts`; nhập kho: `POST /api/inventory/import` (admin, kho) |
| **Nội dung** | Bảng nguyên liệu, tồn, ngưỡng tối thiểu, giá nhập; dòng tồn thấp được highlight |
| **Ghi chú** | Chỉ Quản trị hoặc Kho có thẩm quyền quản lý tồn |

---

## 7. Đặt bàn

| Mục | Mô tả |
|-----|--------|
| **Vai trò** | admin, thu ngân, phục vụ |
| **API** | `GET/POST /api/reservations`, `PATCH .../status` |
| **Chức năng** | Danh sách đặt chỗ, tạo đặt bàn mới, trạng thái xác nhận |

---

## 8. Báo cáo

| Mục | Mô tả |
|-----|--------|
| **Vai trò** | admin, thu ngân |
| **API** | `GET /api/reports/revenue?tu=&den=&ma_cn=` |
| **Chức năng** | Biểu đồ doanh thu theo ngày trong khoảng thời gian chọn |
| **Ghi chú** | Chỉ tài khoản có thẩm quyền Quản trị hoặc Thu ngân |

---

## 9. AI Insights & Chat trợ lý

| Mục | Mô tả |
|-----|--------|
| **Vai trò** | Chat: tất cả nhân viên đăng nhập; trang AI Insights: admin, thu ngân, phục vụ, bếp, kho |
| **API** | `POST /api/ai/chat` (đa chủ đề), `forecast`, `anomaly`, `recommend`, `insights` |
| **Trang AI** | Dự báo nhu cầu, cảnh báo tồn bất thường, gợi ý món VIP |

**Chat AI** (widget góc phải) — không chỉ order:

| Chủ đề hỏi (ví dụ) | AI trả lời |
|--------------------|------------|
| *hướng dẫn*, *hỗ trợ* | Hướng dẫn theo vai trò đăng nhập |
| *doanh thu hôm nay* | Tổng hợp doanh thu (thu ngân/admin) |
| *cảnh báo kho*, *tồn kho* | Danh sách nguyên liệu cảnh báo (kho/admin) |
| *món chờ bếp* | Hàng đợi bếp (bếp/admin) |
| *đặt bàn* | Lịch đặt sắp tới |
| *lỗi*, *không kết nối* | Gợi ý xử lý sự cố |
| *phở*, *món bán chạy* | Gợi ý món (+ Order nếu đang mở hóa đơn) |
| Câu hỏi chung | Gợi ý chủ đề + nút chuyển trang liên quan |

---

## 10. Phân quyền (chỉ Quản trị)

| Mục | Mô tả |
|-----|--------|
| **Vai trò** | **Chỉ `admin`** |
| **API** | `GET /api/permissions/roles`, `GET /api/permissions/staff`, `PATCH /api/permissions/staff/:id` |
| **Chức năng** | Xem danh sách nhân viên; đổi **vai trò** (`ma_vt`) và **trạng thái** (đang làm / nghỉ) |
| **Bảo vệ** | Không tự chuyển trạng thái *Nghỉ* cho chính tài khoản đang đăng nhập |
| **Banner** | *Chỉ tài khoản có thẩm quyền (Quản trị — admin) mới được sử dụng tính năng phân quyền* |

Đây là triển khai chức năng **F02 — Quản lý nhân viên & phân quyền** trên web (phần gán vai trò; thêm nhân viên mới có thể mở rộng sau).

---

## 11. Bảng phân quyền theo trang (tóm tắt)

| Trang | admin | thu_ngan | phuc_vu | bep | kho |
|-------|:-----:|:--------:|:-------:|:---:|:---:|
| Tổng quan | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bàn & Order | ✓ | ✓ | ✓ | — | — |
| Bếp | ✓ | — | — | ✓ | — |
| Thực đơn | ✓ | ✓ | ✓ | ✓ | ✓ |
| Kho | ✓ | — | — | — | ✓ |
| Đặt bàn | ✓ | ✓ | ✓ | — | — |
| Báo cáo | ✓ | ✓ | — | — | — |
| AI Insights | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Phân quyền** | **✓** | — | — | — | — |

Thanh toán hóa đơn: **admin**, **thu_ngan** (nút ẩn với vai trò khác).

---

## 12. Kiến trúc kỹ thuật

```
Trình duyệt (index.html + app.js)
    │  sessionStorage + headers x-user-id
    ▼
Express API (server/server.js)
    │  authMiddleware → requireRole (theo route)
    ▼
MySQL (nha_hang_db) — nhan_vien, vai_tro, hoa_don, ...
```

- **Phân quyền ứng dụng:** `server/middleware/auth.js` — `requireRole('admin', ...)`
- **Phân quyền MySQL (tùy chọn):** `database/07_permissions.sql` — user DB `nh_admin`, `nh_thungan`, … (cho truy cập SQL trực tiếp, khác với RBAC web)

---

## 13. Chạy hệ thống

```bash
cd server
npm install
npm start
```

Mở `http://localhost:3000` — đăng nhập bằng tài khoản demo ở mục 1.

Thiết lập CSDL: xem `README` / `server/scripts/setup-db.js`.

---

## 14. Tài liệu liên quan

- `docs/MO-TA-CHUC-NANG.md` — mô tả nghiệp vụ & mã chức năng F01–F14
- `docs/MO-HINH-ER.md`, `docs/MO-HINH-QUAN-HE.md` — mô hình dữ liệu
- `docs/BAI_TAP_GIAI_THICH.md` — giải thích bài tập & GRANT MySQL

---

*Tài liệu cập nhật theo triển khai phân quyền web (RBAC) — Phở Hà Nội.*
