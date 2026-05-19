-- Tạo database MySQL cho PlanetScale
CREATE DATABASE IF NOT EXISTS nha_hang_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nha_hang_db;

-- Xóa bảng theo thứ tự phụ thuộc
DROP TABLE IF EXISTS ai_du_bao;
DROP TABLE IF EXISTS danh_gia;
DROP TABLE IF EXISTS chi_tiet_px;
DROP TABLE IF EXISTS phieu_xuat;
DROP TABLE IF EXISTS chi_tiet_pn;
DROP TABLE IF EXISTS phieu_nhap;
DROP TABLE IF EXISTS thanh_toan;
DROP TABLE IF EXISTS chi_tiet_hd;
DROP TABLE IF EXISTS hoa_don;
DROP TABLE IF EXISTS dat_ban;
DROP TABLE IF EXISTS cong_thuc;
DROP TABLE IF EXISTS ban_an;
DROP TABLE IF EXISTS mon_an;
DROP TABLE IF EXISTS danh_muc;
DROP TABLE IF EXISTS nguyen_lieu;
DROP TABLE IF EXISTS nha_cung_cap;
DROP TABLE IF EXISTS khach_hang;
DROP TABLE IF EXISTS nhan_vien;
DROP TABLE IF EXISTS vai_tro;
DROP TABLE IF EXISTS chi_nhanh;

-- Chi nhánh
CREATE TABLE chi_nhanh (
  ma_cn INT AUTO_INCREMENT PRIMARY KEY,
  ten_cn VARCHAR(120) NOT NULL,
  dia_chi VARCHAR(255),
  sdt VARCHAR(20),
  gio_mo_cua VARCHAR(50) DEFAULT '08:00-22:00',
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'hoat_dong',
  UNIQUE KEY UQ_cn_ten (ten_cn)
);

-- Vai trò
CREATE TABLE vai_tro (
  ma_vt INT AUTO_INCREMENT PRIMARY KEY,
  ten_vt VARCHAR(50) NOT NULL UNIQUE,
  mo_ta VARCHAR(255)
);

-- Nhân viên
CREATE TABLE nhan_vien (
  ma_nv INT AUTO_INCREMENT PRIMARY KEY,
  ma_cn INT NOT NULL REFERENCES chi_nhanh(ma_cn),
  ma_vt INT NOT NULL REFERENCES vai_tro(ma_vt),
  ho_ten VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  mat_khau_hash VARCHAR(255) NOT NULL,
  sdt VARCHAR(20),
  ngay_vao_lam DATE NOT NULL DEFAULT CURDATE(),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'lam_viec',
  FOREIGN KEY (ma_cn) REFERENCES chi_nhanh(ma_cn),
  FOREIGN KEY (ma_vt) REFERENCES vai_tro(ma_vt)
);

-- Khách hàng
CREATE TABLE khach_hang (
  ma_kh INT AUTO_INCREMENT PRIMARY KEY,
  ho_ten VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE,
  sdt VARCHAR(20),
  diem_tich_luy INT NOT NULL DEFAULT 0,
  hang_thanh_vien VARCHAR(20) NOT NULL DEFAULT 'dong'
);

-- Danh mục
CREATE TABLE danh_muc (
  ma_dm INT AUTO_INCREMENT PRIMARY KEY,
  ten_dm VARCHAR(80) NOT NULL UNIQUE,
  mo_ta VARCHAR(255)
);

-- Món ăn
CREATE TABLE mon_an (
  ma_mon INT AUTO_INCREMENT PRIMARY KEY,
  ma_dm INT NOT NULL REFERENCES danh_muc(ma_dm),
  ten_mon VARCHAR(120) NOT NULL UNIQUE,
  gia_ban DECIMAL(12,2) NOT NULL,
  don_vi VARCHAR(30) NOT NULL DEFAULT 'phần',
  mo_ta LONGTEXT,
  hinh_anh VARCHAR(255),
  trang_thai VARCHAR(10) NOT NULL DEFAULT 'con',
  FOREIGN KEY (ma_dm) REFERENCES danh_muc(ma_dm) ON DELETE CASCADE
);

-- Nguyên liệu
CREATE TABLE nguyen_lieu (
  ma_nl INT AUTO_INCREMENT PRIMARY KEY,
  ten_nl VARCHAR(120) NOT NULL UNIQUE,
  don_vi VARCHAR(30) NOT NULL DEFAULT 'kg',
  ton_kho DECIMAL(12,3) NOT NULL DEFAULT 0,
  ton_toi_thieu DECIMAL(12,3) NOT NULL DEFAULT 0,
  gia_nhap DECIMAL(12,2) NOT NULL DEFAULT 0
);

-- Công thức
CREATE TABLE cong_thuc (
  ma_mon INT NOT NULL,
  ma_nl INT NOT NULL,
  so_luong DECIMAL(10,3) NOT NULL,
  PRIMARY KEY (ma_mon, ma_nl),
  FOREIGN KEY (ma_mon) REFERENCES mon_an(ma_mon) ON DELETE CASCADE,
  FOREIGN KEY (ma_nl) REFERENCES nguyen_lieu(ma_nl)
);

-- Bàn ăn
CREATE TABLE ban_an (
  ma_ban INT AUTO_INCREMENT PRIMARY KEY,
  ma_cn INT NOT NULL REFERENCES chi_nhanh(ma_cn),
  so_ban INT NOT NULL,
  so_cho INT NOT NULL,
  vi_tri VARCHAR(50),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'trong',
  FOREIGN KEY (ma_cn) REFERENCES chi_nhanh(ma_cn),
  UNIQUE KEY UQ_ban (ma_cn, so_ban)
);

-- Nhà cung cấp
CREATE TABLE nha_cung_cap (
  ma_ncc INT AUTO_INCREMENT PRIMARY KEY,
  ten_ncc VARCHAR(120) NOT NULL UNIQUE,
  dia_chi VARCHAR(255),
  sdt VARCHAR(20),
  email VARCHAR(120),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'hoat_dong'
);

-- Đặt bàn
CREATE TABLE dat_ban (
  ma_db INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT NOT NULL REFERENCES khach_hang(ma_kh),
  ma_ban INT NOT NULL REFERENCES ban_an(ma_ban),
  ngay_dat DATE NOT NULL,
  gio_dat TIME NOT NULL,
  gio_den_du_kien TIME,
  so_khach INT NOT NULL,
  ghi_chu LONGTEXT,
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'cho_den',
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh),
  FOREIGN KEY (ma_ban) REFERENCES ban_an(ma_ban)
);

-- Hóa đơn
CREATE TABLE hoa_don (
  ma_hd INT AUTO_INCREMENT PRIMARY KEY,
  ma_ban INT NOT NULL REFERENCES ban_an(ma_ban),
  ma_nv INT NOT NULL REFERENCES nhan_vien(ma_nv),
  ma_kh INT REFERENCES khach_hang(ma_kh),
  ngay_lap DATETIME NOT NULL DEFAULT NOW(),
  tong_tien DECIMAL(12,2) NOT NULL DEFAULT 0,
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'dang_xu_ly',
  FOREIGN KEY (ma_ban) REFERENCES ban_an(ma_ban),
  FOREIGN KEY (ma_nv) REFERENCES nhan_vien(ma_nv),
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh)
);

-- Chi tiết hóa đơn
CREATE TABLE chi_tiet_hd (
  ma_ct INT AUTO_INCREMENT PRIMARY KEY,
  ma_hd INT NOT NULL REFERENCES hoa_don(ma_hd),
  ma_mon INT NOT NULL REFERENCES mon_an(ma_mon),
  so_luong INT NOT NULL,
  gia_don DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (ma_hd) REFERENCES hoa_don(ma_hd) ON DELETE CASCADE,
  FOREIGN KEY (ma_mon) REFERENCES mon_an(ma_mon)
);

-- Thanh toán
CREATE TABLE thanh_toan (
  ma_tt INT AUTO_INCREMENT PRIMARY KEY,
  ma_hd INT NOT NULL REFERENCES hoa_don(ma_hd),
  hinh_thuc VARCHAR(50) NOT NULL,
  so_tien DECIMAL(12,2) NOT NULL,
  ngay_thanh_toan DATETIME NOT NULL DEFAULT NOW(),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'thanh_cong',
  FOREIGN KEY (ma_hd) REFERENCES hoa_don(ma_hd)
);

-- Phiếu nhập
CREATE TABLE phieu_nhap (
  ma_pn INT AUTO_INCREMENT PRIMARY KEY,
  ma_ncc INT NOT NULL REFERENCES nha_cung_cap(ma_ncc),
  ma_nv INT NOT NULL REFERENCES nhan_vien(ma_nv),
  ngay_nhap DATETIME NOT NULL DEFAULT NOW(),
  tong_tien DECIMAL(12,2) NOT NULL DEFAULT 0,
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'da_nhap',
  FOREIGN KEY (ma_ncc) REFERENCES nha_cung_cap(ma_ncc),
  FOREIGN KEY (ma_nv) REFERENCES nhan_vien(ma_nv)
);

-- Chi tiết phiếu nhập
CREATE TABLE chi_tiet_pn (
  ma_ct INT AUTO_INCREMENT PRIMARY KEY,
  ma_pn INT NOT NULL REFERENCES phieu_nhap(ma_pn),
  ma_nl INT NOT NULL REFERENCES nguyen_lieu(ma_nl),
  so_luong DECIMAL(12,3) NOT NULL,
  gia_nhap DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (ma_pn) REFERENCES phieu_nhap(ma_pn) ON DELETE CASCADE,
  FOREIGN KEY (ma_nl) REFERENCES nguyen_lieu(ma_nl)
);

-- Phiếu xuất
CREATE TABLE phieu_xuat (
  ma_px INT AUTO_INCREMENT PRIMARY KEY,
  ma_nv INT NOT NULL REFERENCES nhan_vien(ma_nv),
  ngay_xuat DATETIME NOT NULL DEFAULT NOW(),
  ly_do VARCHAR(255),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'da_xuat',
  FOREIGN KEY (ma_nv) REFERENCES nhan_vien(ma_nv)
);

-- Chi tiết phiếu xuất
CREATE TABLE chi_tiet_px (
  ma_ct INT AUTO_INCREMENT PRIMARY KEY,
  ma_px INT NOT NULL REFERENCES phieu_xuat(ma_px),
  ma_nl INT NOT NULL REFERENCES nguyen_lieu(ma_nl),
  so_luong DECIMAL(12,3) NOT NULL,
  FOREIGN KEY (ma_px) REFERENCES phieu_xuat(ma_px) ON DELETE CASCADE,
  FOREIGN KEY (ma_nl) REFERENCES nguyen_lieu(ma_nl)
);

-- Dữ liệu AI dự báo
CREATE TABLE ai_du_bao (
  ma_db INT AUTO_INCREMENT PRIMARY KEY,
  loai VARCHAR(50) NOT NULL,
  ngay_du_bao DATE NOT NULL,
  gia_tri_du_bao DECIMAL(12,2),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'dang_xu_ly'
);

-- Đánh giá
CREATE TABLE danh_gia (
  ma_dg INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT NOT NULL REFERENCES khach_hang(ma_kh),
  ma_hd INT REFERENCES hoa_don(ma_hd),
  diem_so INT NOT NULL,
  nhan_xet LONGTEXT,
  ngay_danh_gia DATETIME NOT NULL DEFAULT NOW(),
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh),
  FOREIGN KEY (ma_hd) REFERENCES hoa_don(ma_hd)
);

-- Insert dữ liệu mẫu
INSERT INTO chi_nhanh (ten_cn, dia_chi, sdt, gio_mo_cua, trang_thai) VALUES
(N'Chi nhánh 1', N'123 Đường Nguyễn Huệ', '0243-123456', '08:00-22:00', 'hoat_dong');

INSERT INTO vai_tro (ten_vt, mo_ta) VALUES
('admin', 'Quản trị viên'),
('manager', 'Quản lý'),
('staff', 'Nhân viên');

INSERT INTO nhan_vien (ma_cn, ma_vt, ho_ten, email, mat_khau_hash, sdt, ngay_vao_lam, trang_thai) VALUES
(1, 1, N'Nguyễn Admin', 'admin@test.com', '$2a$10$YIj7p4Twu1I4I3ZLq.dM.eHMt/4.pPAz6.W.pT.H6G5nXl0h.4g.m', '0901234567', NOW(), 'lam_viec');

INSERT INTO danh_muc (ten_dm, mo_ta) VALUES
(N'Khai vị', N'Các món khai vị'),
(N'Chính', N'Các món chính'),
(N'Tráng miệng', N'Các món tráng miệng');

INSERT INTO mon_an (ma_dm, ten_mon, gia_ban, don_vi, mo_ta, trang_thai) VALUES
(1, N'Gỏi cuốn', 45000, 'phần', N'Gỏi cuốn tôm thịt', 'con'),
(2, N'Cơm tấm', 55000, 'phần', N'Cơm tấm nước mắm', 'con'),
(3, N'Chè ba màu', 25000, 'ly', N'Chè ba màu truyền thống', 'con');
