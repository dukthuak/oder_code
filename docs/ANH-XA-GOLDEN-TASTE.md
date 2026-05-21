# Ánh xạ CSDL Golden Taste ↔ Web

Nguồn: `docs/QL_cuahanggoldentaste.sql` → MySQL `ql_golden_taste`

| Golden Taste | Web API (alias) |
|--------------|-----------------|
| LOAIMON | danh_muc |
| MONAN | mon_an |
| BAN | ban_an |
| NHANVIEN.chucVU | vai_tro (admin, thu_ngan, …) |
| HOADON | hoa_don |
| CHITIET_HD | chi_tiet_hd |
| NGUYENLIEU | nguyen_lieu |
| DINHMUC | cong_thuc |

## Trạng thái

| Bảng | Golden Taste | API web |
|------|--------------|---------|
| BAN | Trống / Có khách / Đã đặt | trong / dang_dung / dat_truoc |
| HOADON | Chưa thanh toán / Đã thanh toán / Đã hủy | mo / da_thanh_toan / huy |
| CHITIET_HD | Chờ cung ứng / Đang chế biến / Đã phục vụ | cho / dang_nau / xong |
| MONAN | Sẵn có / Hết hàng | con / het |

## Thiết lập DB

```powershell
cd server
# Sửa .env: DB_NAME=ql_golden_taste
npm run setup-db
```

Đăng nhập: `nv002@goldentaste.vn` / `password123` (Thu ngân)

## Truy vấn mẫu

`docs/TRUY-VAN-MAU.sql` — theo file Golden Taste (MySQL).
