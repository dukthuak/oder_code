USE NhaHangDB;
GO

-- Xóa bảng theo thứ tự phụ thuộc
IF OBJECT_ID('ai_du_bao','U') IS NOT NULL DROP TABLE ai_du_bao;
IF OBJECT_ID('danh_gia','U') IS NOT NULL DROP TABLE danh_gia;
IF OBJECT_ID('chi_tiet_px','U') IS NOT NULL DROP TABLE chi_tiet_px;
IF OBJECT_ID('phieu_xuat','U') IS NOT NULL DROP TABLE phieu_xuat;
IF OBJECT_ID('chi_tiet_pn','U') IS NOT NULL DROP TABLE chi_tiet_pn;
IF OBJECT_ID('phieu_nhap','U') IS NOT NULL DROP TABLE phieu_nhap;
IF OBJECT_ID('thanh_toan','U') IS NOT NULL DROP TABLE thanh_toan;
IF OBJECT_ID('chi_tiet_hd','U') IS NOT NULL DROP TABLE chi_tiet_hd;
IF OBJECT_ID('hoa_don','U') IS NOT NULL DROP TABLE hoa_don;
IF OBJECT_ID('dat_ban','U') IS NOT NULL DROP TABLE dat_ban;
IF OBJECT_ID('cong_thuc','U') IS NOT NULL DROP TABLE cong_thuc;
IF OBJECT_ID('ban_an','U') IS NOT NULL DROP TABLE ban_an;
IF OBJECT_ID('mon_an','U') IS NOT NULL DROP TABLE mon_an;
IF OBJECT_ID('danh_muc','U') IS NOT NULL DROP TABLE danh_muc;
IF OBJECT_ID('nguyen_lieu','U') IS NOT NULL DROP TABLE nguyen_lieu;
IF OBJECT_ID('nha_cung_cap','U') IS NOT NULL DROP TABLE nha_cung_cap;
IF OBJECT_ID('khach_hang','U') IS NOT NULL DROP TABLE khach_hang;
IF OBJECT_ID('nhan_vien','U') IS NOT NULL DROP TABLE nhan_vien;
IF OBJECT_ID('vai_tro','U') IS NOT NULL DROP TABLE vai_tro;
IF OBJECT_ID('chi_nhanh','U') IS NOT NULL DROP TABLE chi_nhanh;
GO

CREATE TABLE chi_nhanh (
  ma_cn       INT IDENTITY(1,1) PRIMARY KEY,
  ten_cn      NVARCHAR(120) NOT NULL,
  dia_chi     NVARCHAR(255),
  sdt         NVARCHAR(20),
  gio_mo_cua  NVARCHAR(50) DEFAULT N'08:00-22:00',
  trang_thai  NVARCHAR(20) NOT NULL DEFAULT N'hoat_dong'
    CHECK (trang_thai IN (N'hoat_dong', N'tam_dong')),
  CONSTRAINT UQ_cn_ten UNIQUE (ten_cn)
);

CREATE TABLE vai_tro (
  ma_vt   INT IDENTITY(1,1) PRIMARY KEY,
  ten_vt  NVARCHAR(50) NOT NULL UNIQUE,
  mo_ta   NVARCHAR(255)
);

CREATE TABLE nhan_vien (
  ma_nv           INT IDENTITY(1,1) PRIMARY KEY,
  ma_cn           INT NOT NULL REFERENCES chi_nhanh(ma_cn),
  ma_vt           INT NOT NULL REFERENCES vai_tro(ma_vt),
  ho_ten          NVARCHAR(100) NOT NULL,
  email           NVARCHAR(120) NOT NULL UNIQUE,
  mat_khau_hash   NVARCHAR(255) NOT NULL,
  sdt             NVARCHAR(20),
  ngay_vao_lam    DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
  trang_thai      NVARCHAR(20) NOT NULL DEFAULT N'lam_viec'
    CHECK (trang_thai IN (N'lam_viec', N'nghi'))
);

CREATE TABLE khach_hang (
  ma_kh             INT IDENTITY(1,1) PRIMARY KEY,
  ho_ten            NVARCHAR(100) NOT NULL,
  email             NVARCHAR(120) UNIQUE,
  sdt               NVARCHAR(20),
  diem_tich_luy     INT NOT NULL DEFAULT 0 CHECK (diem_tich_luy >= 0),
  hang_thanh_vien   NVARCHAR(20) NOT NULL DEFAULT N'dong'
    CHECK (hang_thanh_vien IN (N'dong', N'bac', N'vang', N'bach_kim'))
);

CREATE TABLE danh_muc (
  ma_dm   INT IDENTITY(1,1) PRIMARY KEY,
  ten_dm  NVARCHAR(80) NOT NULL UNIQUE,
  mo_ta   NVARCHAR(255)
);

CREATE TABLE mon_an (
  ma_mon      INT IDENTITY(1,1) PRIMARY KEY,
  ma_dm       INT NOT NULL REFERENCES danh_muc(ma_dm),
  ten_mon     NVARCHAR(120) NOT NULL UNIQUE,
  gia_ban     DECIMAL(12,2) NOT NULL CHECK (gia_ban >= 0),
  don_vi      NVARCHAR(30) NOT NULL DEFAULT N'phần',
  mo_ta       NVARCHAR(MAX),
  hinh_anh    NVARCHAR(255),
  trang_thai  NVARCHAR(10) NOT NULL DEFAULT N'con' CHECK (trang_thai IN (N'con', N'het'))
);

CREATE TABLE nguyen_lieu (
  ma_nl           INT IDENTITY(1,1) PRIMARY KEY,
  ten_nl          NVARCHAR(120) NOT NULL UNIQUE,
  don_vi          NVARCHAR(30) NOT NULL DEFAULT N'kg',
  ton_kho         DECIMAL(12,3) NOT NULL DEFAULT 0 CHECK (ton_kho >= 0),
  ton_toi_thieu   DECIMAL(12,3) NOT NULL DEFAULT 0 CHECK (ton_toi_thieu >= 0),
  gia_nhap        DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (gia_nhap >= 0)
);

CREATE TABLE cong_thuc (
  ma_mon    INT NOT NULL REFERENCES mon_an(ma_mon) ON DELETE CASCADE,
  ma_nl     INT NOT NULL REFERENCES nguyen_lieu(ma_nl),
  so_luong  DECIMAL(10,3) NOT NULL CHECK (so_luong > 0),
  PRIMARY KEY (ma_mon, ma_nl)
);

CREATE TABLE ban_an (
  ma_ban      INT IDENTITY(1,1) PRIMARY KEY,
  ma_cn       INT NOT NULL REFERENCES chi_nhanh(ma_cn),
  so_ban      NVARCHAR(20) NOT NULL,
  suc_chua    INT NOT NULL CHECK (suc_chua > 0),
  trang_thai  NVARCHAR(20) NOT NULL DEFAULT N'trong'
    CHECK (trang_thai IN (N'trong', N'dang_dung', N'dat_truoc')),
  CONSTRAINT UQ_ban_cn_so UNIQUE (ma_cn, so_ban)
);

CREATE TABLE dat_ban (
  ma_dat      INT IDENTITY(1,1) PRIMARY KEY,
  ma_kh       INT REFERENCES khach_hang(ma_kh),
  ma_ban      INT NOT NULL REFERENCES ban_an(ma_ban),
  ma_cn       INT NOT NULL REFERENCES chi_nhanh(ma_cn),
  ngay_gio    DATETIME2 NOT NULL,
  so_nguoi    INT NOT NULL CHECK (so_nguoi > 0),
  trang_thai  NVARCHAR(20) NOT NULL DEFAULT N'cho'
    CHECK (trang_thai IN (N'cho', N'xac_nhan', N'huy', N'hoan_thanh')),
  ghi_chu     NVARCHAR(255)
);

CREATE TABLE hoa_don (
  ma_hd       INT IDENTITY(1,1) PRIMARY KEY,
  ma_ban      INT REFERENCES ban_an(ma_ban),
  ma_nv       INT NOT NULL REFERENCES nhan_vien(ma_nv),
  ma_kh       INT REFERENCES khach_hang(ma_kh),
  ma_cn       INT NOT NULL REFERENCES chi_nhanh(ma_cn),
  ngay_lap    DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  trang_thai  NVARCHAR(20) NOT NULL DEFAULT N'mo'
    CHECK (trang_thai IN (N'mo', N'dang_che_bien', N'cho_thanh_toan', N'da_thanh_toan', N'huy')),
  tong_tien   DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK (tong_tien >= 0),
  giam_gia    DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK (giam_gia >= 0)
);

CREATE TABLE chi_tiet_hd (
  ma_ct           INT IDENTITY(1,1) PRIMARY KEY,
  ma_hd           INT NOT NULL REFERENCES hoa_don(ma_hd) ON DELETE CASCADE,
  ma_mon          INT NOT NULL REFERENCES mon_an(ma_mon),
  so_luong        INT NOT NULL CHECK (so_luong > 0),
  don_gia         DECIMAL(12,2) NOT NULL CHECK (don_gia >= 0),
  ghi_chu         NVARCHAR(255),
  trang_thai_mon  NVARCHAR(20) NOT NULL DEFAULT N'cho'
    CHECK (trang_thai_mon IN (N'cho', N'dang_nau', N'xong', N'huy'))
);

CREATE TABLE thanh_toan (
  ma_tt       INT IDENTITY(1,1) PRIMARY KEY,
  ma_hd       INT NOT NULL REFERENCES hoa_don(ma_hd),
  hinh_thuc   NVARCHAR(20) NOT NULL
    CHECK (hinh_thuc IN (N'tien_mat', N'chuyen_khoan', N'qr', N'the')),
  so_tien     DECIMAL(14,2) NOT NULL CHECK (so_tien > 0),
  ngay_tt     DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  ma_nv       INT NOT NULL REFERENCES nhan_vien(ma_nv)
);

CREATE TABLE nha_cung_cap (
  ma_ncc    INT IDENTITY(1,1) PRIMARY KEY,
  ten_ncc   NVARCHAR(120) NOT NULL,
  sdt       NVARCHAR(20),
  dia_chi   NVARCHAR(255)
);

CREATE TABLE phieu_nhap (
  ma_pn       INT IDENTITY(1,1) PRIMARY KEY,
  ma_ncc      INT NOT NULL REFERENCES nha_cung_cap(ma_ncc),
  ma_nv       INT NOT NULL REFERENCES nhan_vien(ma_nv),
  ngay_nhap   DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  tong_tien   DECIMAL(14,2) NOT NULL DEFAULT 0,
  trang_thai  NVARCHAR(20) NOT NULL DEFAULT N'nhap'
    CHECK (trang_thai IN (N'nhap', N'hoan_tat', N'huy'))
);

CREATE TABLE chi_tiet_pn (
  ma_ctpn   INT IDENTITY(1,1) PRIMARY KEY,
  ma_pn     INT NOT NULL REFERENCES phieu_nhap(ma_pn) ON DELETE CASCADE,
  ma_nl     INT NOT NULL REFERENCES nguyen_lieu(ma_nl),
  so_luong  DECIMAL(12,3) NOT NULL CHECK (so_luong > 0),
  don_gia   DECIMAL(12,2) NOT NULL CHECK (don_gia >= 0)
);

CREATE TABLE phieu_xuat (
  ma_px       INT IDENTITY(1,1) PRIMARY KEY,
  ma_nv       INT NOT NULL REFERENCES nhan_vien(ma_nv),
  ma_cn       INT NOT NULL REFERENCES chi_nhanh(ma_cn),
  ly_do       NVARCHAR(255) NOT NULL,
  ngay_xuat   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE chi_tiet_px (
  ma_ctpx   INT IDENTITY(1,1) PRIMARY KEY,
  ma_px     INT NOT NULL REFERENCES phieu_xuat(ma_px) ON DELETE CASCADE,
  ma_nl     INT NOT NULL REFERENCES nguyen_lieu(ma_nl),
  so_luong  DECIMAL(12,3) NOT NULL CHECK (so_luong > 0)
);

CREATE TABLE danh_gia (
  ma_dg     INT IDENTITY(1,1) PRIMARY KEY,
  ma_kh     INT NOT NULL REFERENCES khach_hang(ma_kh),
  ma_mon    INT REFERENCES mon_an(ma_mon),
  ma_hd     INT REFERENCES hoa_don(ma_hd),
  diem      TINYINT NOT NULL CHECK (diem BETWEEN 1 AND 5),
  noi_dung  NVARCHAR(MAX),
  ngay_dg   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE ai_du_bao (
  ma_ai      INT IDENTITY(1,1) PRIMARY KEY,
  loai       NVARCHAR(30) NOT NULL
    CHECK (loai IN (N'nhu_cau_mon', N'canh_bao_ton', N'goi_y', N'khac')),
  ma_mon     INT REFERENCES mon_an(ma_mon),
  ma_nl      INT REFERENCES nguyen_lieu(ma_nl),
  gia_tri    DECIMAL(14,4),
  noi_dung   NVARCHAR(MAX),
  ngay_tao   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE INDEX idx_hd_trang_thai ON hoa_don(trang_thai, ngay_lap);
CREATE INDEX idx_ai_loai ON ai_du_bao(loai, ngay_tao);
GO
