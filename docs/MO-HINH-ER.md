# Mô hình ER (Entity-Relationship)

## Thực thể & thuộc tính chính

```
CHI_NHANH (MaCN, TenCN, DiaChi, SDT, GioMoCua, TrangThai)
VAI_TRO (MaVT, TenVT, MoTa)
NHAN_VIEN (MaNV, MaCN, MaVT, HoTen, Email, MatKhauHash, SDT, NgayVaoLam, TrangThai)
KHACH_HANG (MaKH, HoTen, Email, SDT, DiemTichLuy, HangThanhVien)
DANH_MUC (MaDM, TenDM, MoTa)
MON_AN (MaMon, MaDM, TenMon, GiaBan, DonVi, MoTa, HinhAnh, TrangThai)
NGUYEN_LIEU (MaNL, TenNL, DonVi, TonKho, TonToiThieu, GiaNhap)
CONG_THUC (MaMon, MaNL, SoLuong)          -- PK composite
BAN_AN (MaBan, MaCN, SoBan, SucChua, TrangThai)
DAT_BAN (MaDat, MaKH, MaBan, MaCN, NgayGio, SoNguoi, TrangThai, GhiChu)
HOA_DON (MaHD, MaBan, MaNV, MaKH, MaCN, NgayLap, TrangThai, TongTien, GiamGia)
CHI_TIET_HD (MaCT, MaHD, MaMon, SoLuong, DonGia, GhiChu, TrangThaiMon)
THANH_TOAN (MaTT, MaHD, HinhThuc, SoTien, NgayTT, MaNV)
NHA_CUNG_CAP (MaNCC, TenNCC, SDT, DiaChi)
PHIEU_NHAP (MaPN, MaNCC, MaNV, NgayNhap, TongTien, TrangThai)
CHI_TIET_PN (MaCTPN, MaPN, MaNL, SoLuong, DonGia)
PHIEU_XUAT (MaPX, MaNV, MaCN, LyDo, NgayXuat)
CHI_TIET_PX (MaCTPX, MaPX, MaNL, SoLuong)
DANH_GIA (MaDG, MaKH, MaMon, MaHD, Diem, NoiDung, NgayDG)
```

## Quan hệ

| Quan hệ | Kiểu | Cardinality |
|---------|------|-------------|
| CHI_NHANH – NHAN_VIEN | 1:N | Một CN có nhiều NV |
| VAI_TRO – NHAN_VIEN | 1:N | |
| CHI_NHANH – BAN_AN | 1:N | |
| KHACH_HANG – DAT_BAN | 1:N | |
| BAN_AN – DAT_BAN | 1:N | |
| BAN_AN – HOA_DON | 1:N | |
| HOA_DON – CHI_TIET_HD | 1:N | |
| MON_AN – CHI_TIET_HD | 1:N | |
| MON_AN – CONG_THUC – NGUYEN_LIEU | N:M qua CONG_THUC | |
| HOA_DON – THANH_TOAN | 1:N | |
| NHA_CUNG_CAP – PHIEU_NHAP | 1:N | |
| PHIEU_NHAP – CHI_TIET_PN | 1:N | |
| NGUYEN_LIEU – CHI_TIET_PN | 1:N | |

## Mô hình quan hệ (chuẩn hóa 3NF)

Các bảng tương ứng được triển khai trong:

- **MySQL** (ứng dụng): `database/01_schema.sql`
- **SQL Server** (đề bài): `database/sqlserver/01_schema.sql`

Xem thêm mô hình quan hệ: [`MO-HINH-QUAN-HE.md`](MO-HINH-QUAN-HE.md).
