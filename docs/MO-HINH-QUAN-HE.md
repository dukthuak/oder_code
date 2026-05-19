# Mô hình quan hệ (Relational Model)

Chuẩn hóa **3NF**: mỗi thuộc tính phụ thuộc khóa chính, không phụ thuộc bắc cầu.

## Danh sách quan hệ

| Bảng | Khóa chính | Khóa ngoại chính |
|------|------------|------------------|
| `chi_nhanh` | ma_cn | — |
| `vai_tro` | ma_vt | — |
| `nhan_vien` | ma_nv | ma_cn → chi_nhanh, ma_vt → vai_tro |
| `khach_hang` | ma_kh | — |
| `danh_muc` | ma_dm | — |
| `mon_an` | ma_mon | ma_dm → danh_muc |
| `nguyen_lieu` | ma_nl | — |
| `cong_thuc` | (ma_mon, ma_nl) | ma_mon, ma_nl |
| `ban_an` | ma_ban | ma_cn |
| `dat_ban` | ma_dat | ma_kh, ma_ban, ma_cn |
| `hoa_don` | ma_hd | ma_ban, ma_nv, ma_kh, ma_cn |
| `chi_tiet_hd` | ma_ct | ma_hd, ma_mon |
| `thanh_toan` | ma_tt | ma_hd, ma_nv |
| `nha_cung_cap` | ma_ncc | — |
| `phieu_nhap` | ma_pn | ma_ncc, ma_nv |
| `chi_tiet_pn` | ma_ctpn | ma_pn, ma_nl |
| `phieu_xuat` | ma_px | ma_nv, ma_cn |
| `chi_tiet_px` | ma_ctpx | ma_px, ma_nl |
| `danh_gia` | ma_dg | ma_kh, ma_mon, ma_hd |
| `ai_du_bao` | ma_ai | ma_mon, ma_nl |

## Ràng buộc toàn vẹn

- **ENTITY**: PK trên mọi bảng; `cong_thuc` dùng PK ghép.
- **REFERENTIAL**: ON DELETE CASCADE ở chi tiết hóa đơn / phiếu nhập.
- **DOMAIN**: CHECK giá ≥ 0, số lượng > 0, điểm đánh giá 1–5, ENUM trạng thái.
- **UNIQUE**: email nhân viên, tên món, (ma_cn, so_ban).

## File triển khai

- MySQL (ứng dụng web): `database/01_schema.sql` … `08_ai.sql`
- SQL Server (bài tập): `database/sqlserver/`
