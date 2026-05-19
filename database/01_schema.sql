-- ============================================================
-- CSDL Quản lý Nhà hàng — MySQL 8+
-- Mô hình quan hệ 3NF, ràng buộc PK/FK/CHECK/UNIQUE
-- ============================================================
CREATE DATABASE IF NOT EXISTS nha_hang_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nha_hang_db;

SET FOREIGN_KEY_CHECKS = 0;
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
SET FOREIGN_KEY_CHECKS = 1;

-- F01: Chi nhánh
CREATE TABLE chi_nhanh (
  ma_cn       INT AUTO_INCREMENT PRIMARY KEY,
  ten_cn      VARCHAR(120) NOT NULL,
  dia_chi     VARCHAR(255),
  sdt         VARCHAR(20),
  gio_mo_cua  VARCHAR(50) DEFAULT '08:00-22:00',
  trang_thai  ENUM('hoat_dong','tam_dong') NOT NULL DEFAULT 'hoat_dong',
  UNIQUE KEY uk_cn_ten (ten_cn)
) ENGINE=InnoDB;

-- F02: Vai trò & nhân viên
CREATE TABLE vai_tro (
  ma_vt   INT AUTO_INCREMENT PRIMARY KEY,
  ten_vt  VARCHAR(50) NOT NULL UNIQUE,
  mo_ta   VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE nhan_vien (
  ma_nv           INT AUTO_INCREMENT PRIMARY KEY,
  ma_cn           INT NOT NULL,
  ma_vt           INT NOT NULL,
  ho_ten          VARCHAR(100) NOT NULL,
  email           VARCHAR(120) NOT NULL UNIQUE,
  mat_khau_hash   VARCHAR(255) NOT NULL,
  sdt             VARCHAR(20),
  ngay_vao_lam    DATE NOT NULL DEFAULT (CURDATE()),
  trang_thai      ENUM('lam_viec','nghi') NOT NULL DEFAULT 'lam_viec',
  CONSTRAINT fk_nv_cn FOREIGN KEY (ma_cn) REFERENCES chi_nhanh(ma_cn),
  CONSTRAINT fk_nv_vt FOREIGN KEY (ma_vt) REFERENCES vai_tro(ma_vt)
) ENGINE=InnoDB;

-- F11: Khách hàng
CREATE TABLE khach_hang (
  ma_kh             INT AUTO_INCREMENT PRIMARY KEY,
  ho_ten            VARCHAR(100) NOT NULL,
  email             VARCHAR(120) UNIQUE,
  sdt               VARCHAR(20),
  diem_tich_luy     INT NOT NULL DEFAULT 0 CHECK (diem_tich_luy >= 0),
  hang_thanh_vien   ENUM('dong','bac','vang','bach_kim') NOT NULL DEFAULT 'dong'
) ENGINE=InnoDB;

-- F03: Thực đơn
CREATE TABLE danh_muc (
  ma_dm   INT AUTO_INCREMENT PRIMARY KEY,
  ten_dm  VARCHAR(80) NOT NULL UNIQUE,
  mo_ta   VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE mon_an (
  ma_mon      INT AUTO_INCREMENT PRIMARY KEY,
  ma_dm       INT NOT NULL,
  ten_mon     VARCHAR(120) NOT NULL,
  gia_ban     DECIMAL(12,2) NOT NULL CHECK (gia_ban >= 0),
  don_vi      VARCHAR(30) NOT NULL DEFAULT 'phần',
  mo_ta       TEXT,
  hinh_anh    VARCHAR(255),
  trang_thai  ENUM('con','het') NOT NULL DEFAULT 'con',
  CONSTRAINT fk_mon_dm FOREIGN KEY (ma_dm) REFERENCES danh_muc(ma_dm),
  UNIQUE KEY uk_mon_ten (ten_mon)
) ENGINE=InnoDB;

-- F04/F09: Nguyên liệu & công thức
CREATE TABLE nguyen_lieu (
  ma_nl           INT AUTO_INCREMENT PRIMARY KEY,
  ten_nl          VARCHAR(120) NOT NULL UNIQUE,
  don_vi          VARCHAR(30) NOT NULL DEFAULT 'kg',
  ton_kho         DECIMAL(12,3) NOT NULL DEFAULT 0 CHECK (ton_kho >= 0),
  ton_toi_thieu   DECIMAL(12,3) NOT NULL DEFAULT 0 CHECK (ton_toi_thieu >= 0),
  gia_nhap        DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (gia_nhap >= 0)
) ENGINE=InnoDB;

CREATE TABLE cong_thuc (
  ma_mon    INT NOT NULL,
  ma_nl     INT NOT NULL,
  so_luong  DECIMAL(10,3) NOT NULL CHECK (so_luong > 0),
  PRIMARY KEY (ma_mon, ma_nl),
  CONSTRAINT fk_ct_mon FOREIGN KEY (ma_mon) REFERENCES mon_an(ma_mon) ON DELETE CASCADE,
  CONSTRAINT fk_ct_nl FOREIGN KEY (ma_nl) REFERENCES nguyen_lieu(ma_nl)
) ENGINE=InnoDB;

-- F05: Bàn
CREATE TABLE ban_an (
  ma_ban      INT AUTO_INCREMENT PRIMARY KEY,
  ma_cn       INT NOT NULL,
  so_ban      VARCHAR(20) NOT NULL,
  suc_chua    INT NOT NULL CHECK (suc_chua > 0),
  trang_thai  ENUM('trong','dang_dung','dat_truoc') NOT NULL DEFAULT 'trong',
  CONSTRAINT fk_ban_cn FOREIGN KEY (ma_cn) REFERENCES chi_nhanh(ma_cn),
  UNIQUE KEY uk_ban_cn_so (ma_cn, so_ban)
) ENGINE=InnoDB;

-- F06: Đặt bàn
CREATE TABLE dat_ban (
  ma_dat      INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh       INT,
  ma_ban      INT NOT NULL,
  ma_cn       INT NOT NULL,
  ngay_gio    DATETIME NOT NULL,
  so_nguoi    INT NOT NULL CHECK (so_nguoi > 0),
  trang_thai  ENUM('cho','xac_nhan','huy','hoan_thanh') NOT NULL DEFAULT 'cho',
  ghi_chu     VARCHAR(255),
  CONSTRAINT fk_dat_kh FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh),
  CONSTRAINT fk_dat_ban FOREIGN KEY (ma_ban) REFERENCES ban_an(ma_ban),
  CONSTRAINT fk_dat_cn FOREIGN KEY (ma_cn) REFERENCES chi_nhanh(ma_cn)
) ENGINE=InnoDB;

-- F07/F08: Hóa đơn & chi tiết
CREATE TABLE hoa_don (
  ma_hd       INT AUTO_INCREMENT PRIMARY KEY,
  ma_ban      INT,
  ma_nv       INT NOT NULL,
  ma_kh       INT,
  ma_cn       INT NOT NULL,
  ngay_lap    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  trang_thai  ENUM('mo','dang_che_bien','cho_thanh_toan','da_thanh_toan','huy') NOT NULL DEFAULT 'mo',
  tong_tien   DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK (tong_tien >= 0),
  giam_gia    DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK (giam_gia >= 0),
  CONSTRAINT fk_hd_ban FOREIGN KEY (ma_ban) REFERENCES ban_an(ma_ban),
  CONSTRAINT fk_hd_nv FOREIGN KEY (ma_nv) REFERENCES nhan_vien(ma_nv),
  CONSTRAINT fk_hd_kh FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh),
  CONSTRAINT fk_hd_cn FOREIGN KEY (ma_cn) REFERENCES chi_nhanh(ma_cn)
) ENGINE=InnoDB;

CREATE TABLE chi_tiet_hd (
  ma_ct           INT AUTO_INCREMENT PRIMARY KEY,
  ma_hd           INT NOT NULL,
  ma_mon          INT NOT NULL,
  so_luong        INT NOT NULL CHECK (so_luong > 0),
  don_gia         DECIMAL(12,2) NOT NULL CHECK (don_gia >= 0),
  ghi_chu         VARCHAR(255),
  trang_thai_mon  ENUM('cho','dang_nau','xong','huy') NOT NULL DEFAULT 'cho',
  CONSTRAINT fk_cthd_hd FOREIGN KEY (ma_hd) REFERENCES hoa_don(ma_hd) ON DELETE CASCADE,
  CONSTRAINT fk_cthd_mon FOREIGN KEY (ma_mon) REFERENCES mon_an(ma_mon)
) ENGINE=InnoDB;

CREATE TABLE thanh_toan (
  ma_tt       INT AUTO_INCREMENT PRIMARY KEY,
  ma_hd       INT NOT NULL,
  hinh_thuc   ENUM('tien_mat','chuyen_khoan','qr','the') NOT NULL,
  so_tien     DECIMAL(14,2) NOT NULL CHECK (so_tien > 0),
  ngay_tt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ma_nv       INT NOT NULL,
  CONSTRAINT fk_tt_hd FOREIGN KEY (ma_hd) REFERENCES hoa_don(ma_hd),
  CONSTRAINT fk_tt_nv FOREIGN KEY (ma_nv) REFERENCES nhan_vien(ma_nv)
) ENGINE=InnoDB;

-- F10: Nhà cung cấp & phiếu nhập
CREATE TABLE nha_cung_cap (
  ma_ncc    INT AUTO_INCREMENT PRIMARY KEY,
  ten_ncc   VARCHAR(120) NOT NULL,
  sdt       VARCHAR(20),
  dia_chi   VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE phieu_nhap (
  ma_pn       INT AUTO_INCREMENT PRIMARY KEY,
  ma_ncc      INT NOT NULL,
  ma_nv       INT NOT NULL,
  ngay_nhap   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tong_tien   DECIMAL(14,2) NOT NULL DEFAULT 0,
  trang_thai  ENUM('nhap','hoan_tat','huy') NOT NULL DEFAULT 'nhap',
  CONSTRAINT fk_pn_ncc FOREIGN KEY (ma_ncc) REFERENCES nha_cung_cap(ma_ncc),
  CONSTRAINT fk_pn_nv FOREIGN KEY (ma_nv) REFERENCES nhan_vien(ma_nv)
) ENGINE=InnoDB;

CREATE TABLE chi_tiet_pn (
  ma_ctpn   INT AUTO_INCREMENT PRIMARY KEY,
  ma_pn     INT NOT NULL,
  ma_nl     INT NOT NULL,
  so_luong  DECIMAL(12,3) NOT NULL CHECK (so_luong > 0),
  don_gia   DECIMAL(12,2) NOT NULL CHECK (don_gia >= 0),
  CONSTRAINT fk_ctpn_pn FOREIGN KEY (ma_pn) REFERENCES phieu_nhap(ma_pn) ON DELETE CASCADE,
  CONSTRAINT fk_ctpn_nl FOREIGN KEY (ma_nl) REFERENCES nguyen_lieu(ma_nl)
) ENGINE=InnoDB;

-- F09: Phiếu xuất kho
CREATE TABLE phieu_xuat (
  ma_px       INT AUTO_INCREMENT PRIMARY KEY,
  ma_nv       INT NOT NULL,
  ma_cn       INT NOT NULL,
  ly_do       VARCHAR(255) NOT NULL,
  ngay_xuat   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_px_nv FOREIGN KEY (ma_nv) REFERENCES nhan_vien(ma_nv),
  CONSTRAINT fk_px_cn FOREIGN KEY (ma_cn) REFERENCES chi_nhanh(ma_cn)
) ENGINE=InnoDB;

CREATE TABLE chi_tiet_px (
  ma_ctpx   INT AUTO_INCREMENT PRIMARY KEY,
  ma_px     INT NOT NULL,
  ma_nl     INT NOT NULL,
  so_luong  DECIMAL(12,3) NOT NULL CHECK (so_luong > 0),
  CONSTRAINT fk_ctpx_px FOREIGN KEY (ma_px) REFERENCES phieu_xuat(ma_px) ON DELETE CASCADE,
  CONSTRAINT fk_ctpx_nl FOREIGN KEY (ma_nl) REFERENCES nguyen_lieu(ma_nl)
) ENGINE=InnoDB;

-- F12: Đánh giá
CREATE TABLE danh_gia (
  ma_dg     INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh     INT NOT NULL,
  ma_mon    INT,
  ma_hd     INT,
  diem      TINYINT NOT NULL CHECK (diem BETWEEN 1 AND 5),
  noi_dung  TEXT,
  ngay_dg   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dg_kh FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh),
  CONSTRAINT fk_dg_mon FOREIGN KEY (ma_mon) REFERENCES mon_an(ma_mon),
  CONSTRAINT fk_dg_hd FOREIGN KEY (ma_hd) REFERENCES hoa_don(ma_hd)
) ENGINE=InnoDB;

CREATE INDEX idx_hd_trang_thai ON hoa_don(trang_thai, ngay_lap);
CREATE INDEX idx_cthd_mon ON chi_tiet_hd(ma_hd, trang_thai_mon);
CREATE INDEX idx_dat_ngay ON dat_ban(ngay_gio);
