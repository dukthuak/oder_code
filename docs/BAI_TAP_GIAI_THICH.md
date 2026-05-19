# Bài tập: CSDL Quản lý Kinh doanh Dịch vụ Ăn uống — Giải thích đầy đủ

Tài liệu này đáp ứng yêu cầu đề bài (theo [Google Doc Demo](https://docs.google.com/document/d/1wmrEyuGRun7f5cLi2rOH0XzoDvVL2oWtfDQRxIeY_EM/edit)) và map trực tiếp vào mã nguồn trong repo.

---

## 1. Mô tả và xác định chức năng

### 1.1 Phạm vi

Hệ thống quản lý **nhà hàng / F&B**: nhiều chi nhánh, thực đơn, bàn, đặt chỗ, order–thanh toán, kho nguyên liệu theo công thức món, khách hàng tích điểm, báo cáo và **AI hỗ trợ** (dự báo, gợi ý, cảnh báo tồn).

Chi tiết bảng chức năng F01–F14: [`MO-TA-CHUC-NANG.md`](MO-TA-CHUC-NANG.md).

### 1.2 Tác nhân & quyền

| Vai trò | Chức năng chính |
|---------|-----------------|
| Admin | Toàn bộ CSDL, cấu hình, phân quyền |
| Thu ngân | Hóa đơn, thanh toán, khách hàng, báo cáo |
| Phục vụ | Bàn, tạo order, gọi món |
| Bếp | Hàng đợi chế biến, cập nhật trạng thái món |
| Kho | Nhập/xuất, nhà cung cấp, cảnh báo tồn |

### 1.3 Luồng nghiệp vụ cốt lõi

```
Đặt bàn (tuỳ chọn) → Mở bàn / tạo hóa đơn → Gọi món → Bếp chế biến
→ Thanh toán → Trigger trừ kho (công thức) → Cộng điểm KH → Bàn trống
```

---

## 2a. Mô hình ER & mô hình quan hệ

### ER (khái niệm)

- **Thực thể**: Chi nhánh, Nhân viên, Khách hàng, Món, Nguyên liệu, Bàn, Hóa đơn, …
- **Quan hệ 1:N**: Chi nhánh → Nhân viên, Hóa đơn → Chi tiết HD
- **Quan hệ N:M**: Món ↔ Nguyên liệu qua bảng `cong_thuc` (định mức)

Sơ đồ chi tiết: [`MO-HINH-ER.md`](MO-HINH-ER.md).

### Mô hình quan hệ

18 bảng, chuẩn **3NF**, mô tả PK/FK: [`MO-HINH-QUAN-HE.md`](MO-HINH-QUAN-HE.md).

---

## 2b. Cài đặt CSDL

### SQL Server (theo đề bài)

Thư mục: `database/sqlserver/`

| File | Nội dung |
|------|----------|
| `00_create_database.sql` | Tạo DB `NhaHangDB` |
| `01_schema.sql` | Bảng + PK/FK/CHECK/UNIQUE |
| `02_seed.sql` | Dữ liệu mẫu |
| `03_views.sql` | View |
| `04_functions.sql` | Scalar function |
| `05_procedures.sql` | Stored procedure |
| `06_triggers.sql` | Trigger |
| `07_permissions.sql` | Login/User/GRANT |

Hướng dẫn chạy: [`HUONG_DAN_SQL_SERVER.md`](HUONG_DAN_SQL_SERVER.md).

### MySQL (chạy ứng dụng web)

Thư mục: `database/` — cùng mô hình logic, dùng cho Node.js + giao diện.

```powershell
cd d:\ducthuan\trang\server
npm install
# Cấu hình .env (DB_HOST, DB_PASSWORD...)
npm run setup-db
npm start
```

Mở `http://localhost:3000` — đăng nhập `thungan@nhang.com` / `password123`.

---

## 2c. Giao diện & khai thác CSDL

### Giao diện (F01–F14)

File: `public/index.html`, `public/js/app.js`, `public/css/style.css`

| Màn hình | Chức năng map |
|----------|----------------|
| Tổng quan | F13 — top món, cảnh báo kho |
| Bàn & Order | F05, F07, F08 — SP `sp_tao_hoa_don`, `sp_them_mon_hd`, `sp_thanh_toan` |
| Bếp | F07 — cập nhật `trang_thai_mon` |
| Thực đơn | F03 |
| Kho | F09 — view `vw_ton_kho_canh_bao` |
| Đặt bàn | F06 |
| Báo cáo | F13 — `sp_bao_cao_doanh_thu` |
| AI Insights | F14 |

### Query (truy vấn)

- MySQL: [`TRUY-VAN-MAU.sql`](TRUY-VAN-MAU.sql)
- SQL Server: [`TRUY-VAN-MAU-sqlserver.sql`](TRUY-VAN-MAU-sqlserver.sql)

Ví dụ doanh thu tháng: `SUM(tong_tien - giam_gia)` trên `hoa_don` đã thanh toán.

### View

| View | Mục đích |
|------|----------|
| `vw_mon_ban_chay` | Tổng SL & doanh thu theo món |
| `vw_ton_kho_canh_bao` | NL dưới ngưỡng / hết hàng |
| `vw_chi_tiet_hoa_don` | Chi tiết order cho UI |
| `vw_ban_dang_phuc_vu` | Bàn đang có HD mở |

### Stored Procedure

| SP | Nghiệp vụ |
|----|-----------|
| `sp_tao_hoa_don` | Tạo HD, đặt bàn `dang_dung` |
| `sp_them_mon_hd` | Thêm món, kiểm tra còn hàng, cập nhật tổng |
| `sp_thanh_toan` | Ghi thanh toán, đổi trạng thái, tích điểm KH |
| `sp_bao_cao_doanh_thu` | Báo cáo theo ngày |
| `sp_hoan_tat_phieu_nhap` | Cộng tồn kho khi nhập |
| `sp_ai_*` | Xem mục AI bên dưới |

### Function

- `fn_tinh_tong_hd(ma_hd)`: tổng tiền từ chi tiết (dùng trong SP/trigger).
- `fn_hang_thanh_vien(diem)`: map điểm → hạng (đồng/bạc/vàng/bạch kim).

### Trigger

| Trigger | Hành vi |
|---------|---------|
| `trg_cthd_*` | Sau INSERT/UPDATE/DELETE chi tiết → cập nhật `tong_tien` |
| `trg_hd_after_pay` | Khi HD → `da_thanh_toan` → trừ `nguyen_lieu` theo `cong_thuc`, bàn → `trong` |
| `trg_hd_log_xuat_kho` | Ghi `phieu_xuat` + `chi_tiet_px` (audit kho) |
| `trg_dat_ban_status` | Đặt bàn xác nhận → bàn `dat_truoc` |

### Phân quyền

- **MySQL**: `database/07_permissions.sql` — user `nh_admin`, `nh_thungan`, …
- **SQL Server**: `database/sqlserver/07_permissions.sql` — login + GRANT

Nguyên tắc: **least privilege** — thu ngân không sửa được `nguyen_lieu`; bếp chỉ UPDATE `chi_tiet_hd`.

---

## 2d. Sử dụng AI trong quản trị CSDL

AI **không** thay thế DBMS mà **khai thác dữ liệu lịch sử** trong CSDL:

### Bảng `ai_du_bao`

Lưu kết quả: loại (`nhu_cau_mon`, `canh_bao_ton`), `ma_mon`/`ma_nl`, `gia_tri`, `noi_dung`, `ngay_tao`.

### Stored Procedure AI

1. **`sp_ai_du_bao_nhu_cau(@days)`**  
   - Tính trung bình số phần bán/ngày từ `chi_tiet_hd` + `hoa_don` đã thanh toán.  
   - Heuristic: nhân **1.15** (+15%) làm dự báo ngày tới.  
   - Ghi vào `ai_du_bao` — dùng cho đặt hàng nguyên liệu.

2. **`sp_ai_goi_y_mon(ma_kh, limit)`**  
   - Nếu có `ma_kh`: gợi ý món khách đã mua.  
   - Không: gợi ý từ `vw_mon_ban_chay`.

3. **`sp_ai_phat_hien_bat_thuong()`**  
   - Đọc `vw_ton_kho_canh_bao`, ghi cảnh báo `het_hang` / `sap_het`.

### API & UI

- `server/routes/ai.js` gọi các SP trên.  
- Màn **AI Insights** gọi `/api/ai/forecast`, `/anomaly`, `/recommend`.

**Ghi chú học thuật**: Đây là *rule-based / statistical heuristic* trong SQL; có thể nâng cấp bằng model ML bên ngoài (Python) ghi kết quả vào `ai_du_bao`.

---

## 3. Cấu trúc thư mục dự án

```
trang/
├── database/           # MySQL — chạy app
├── database/sqlserver/ # SQL Server — báo cáo / đề bài
├── docs/               # ER, quan hệ, giải thích, truy vấn mẫu
├── public/             # Giao diện web
└── server/             # API Node.js + Express
```

---

## 4. Demo nhanh cho giảng viên

**SQL Server (SSMS):**

```sql
EXEC dbo.sp_bao_cao_doanh_thu '2025-01-01', '2026-12-31', NULL;
EXEC dbo.sp_ai_du_bao_nhu_cau 7;
SELECT * FROM ai_du_bao;
```

**Ứng dụng web:** `npm run setup-db` → `npm start` → đăng nhập → thử Order, Bếp, Báo cáo, AI.

---

## 5. Tài khoản mẫu

| Email | Vai trò | Mật khẩu (sau setup-db) |
|-------|---------|-------------------------|
| admin@nhang.com | admin | password123 |
| thungan@nhang.com | thu_ngan | password123 |
| phucvu@nhang.com | phuc_vu | password123 |
| bep@nhang.com | bep | password123 |
| kho@nhang.com | kho | password123 |
