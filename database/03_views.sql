USE nha_hang_db;

DROP VIEW IF EXISTS vw_mon_ban_chay;
CREATE VIEW vw_mon_ban_chay AS
SELECT
  m.ma_mon,
  m.ten_mon,
  dm.ten_dm,
  SUM(ct.so_luong) AS tong_sl,
  SUM(ct.so_luong * ct.don_gia) AS doanh_thu_mon
FROM chi_tiet_hd ct
JOIN mon_an m ON ct.ma_mon = m.ma_mon
JOIN danh_muc dm ON m.ma_dm = dm.ma_dm
JOIN hoa_don h ON ct.ma_hd = h.ma_hd
WHERE h.trang_thai = 'da_thanh_toan'
GROUP BY m.ma_mon, m.ten_mon, dm.ten_dm;

DROP VIEW IF EXISTS vw_ton_kho_canh_bao;
CREATE VIEW vw_ton_kho_canh_bao AS
SELECT
  ma_nl,
  ten_nl,
  don_vi,
  ton_kho,
  ton_toi_thieu,
  gia_nhap,
  CASE
    WHEN ton_kho <= 0 THEN 'het_hang'
    WHEN ton_kho <= ton_toi_thieu THEN 'sap_het'
    ELSE 'on_dinh'
  END AS muc_canh_bao
FROM nguyen_lieu
WHERE ton_kho <= ton_toi_thieu;

DROP VIEW IF EXISTS vw_chi_tiet_hoa_don;
CREATE VIEW vw_chi_tiet_hoa_don AS
SELECT
  ct.ma_ct,
  ct.ma_hd,
  ct.ma_mon,
  m.ten_mon,
  ct.so_luong,
  ct.don_gia,
  ct.so_luong * ct.don_gia AS thanh_tien,
  ct.ghi_chu,
  ct.trang_thai_mon
FROM chi_tiet_hd ct
JOIN mon_an m ON ct.ma_mon = m.ma_mon;

DROP VIEW IF EXISTS vw_ban_dang_phuc_vu;
CREATE VIEW vw_ban_dang_phuc_vu AS
SELECT
  b.ma_ban,
  b.ma_cn,
  b.so_ban,
  b.suc_chua,
  h.ma_hd,
  h.trang_thai AS trang_thai_hd,
  h.ngay_lap,
  nv.ho_ten AS ten_nv
FROM ban_an b
JOIN hoa_don h ON b.ma_ban = h.ma_ban
JOIN nhan_vien nv ON h.ma_nv = nv.ma_nv
WHERE b.trang_thai = 'dang_dung'
  AND h.trang_thai IN ('mo','dang_che_bien','cho_thanh_toan');
