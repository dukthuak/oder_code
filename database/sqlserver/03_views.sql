USE NhaHangDB;
GO

CREATE OR ALTER VIEW vw_mon_ban_chay AS
SELECT m.ma_mon, m.ten_mon, dm.ten_dm,
       SUM(ct.so_luong) AS tong_sl,
       SUM(ct.so_luong * ct.don_gia) AS doanh_thu_mon
FROM chi_tiet_hd ct
JOIN mon_an m ON ct.ma_mon = m.ma_mon
JOIN danh_muc dm ON m.ma_dm = dm.ma_dm
JOIN hoa_don h ON ct.ma_hd = h.ma_hd
WHERE h.trang_thai = N'da_thanh_toan'
GROUP BY m.ma_mon, m.ten_mon, dm.ten_dm;
GO

CREATE OR ALTER VIEW vw_ton_kho_canh_bao AS
SELECT ma_nl, ten_nl, don_vi, ton_kho, ton_toi_thieu, gia_nhap,
  CASE WHEN ton_kho <= 0 THEN N'het_hang'
       WHEN ton_kho <= ton_toi_thieu THEN N'sap_het'
       ELSE N'on_dinh' END AS muc_canh_bao
FROM nguyen_lieu
WHERE ton_kho <= ton_toi_thieu;
GO

CREATE OR ALTER VIEW vw_chi_tiet_hoa_don AS
SELECT ct.ma_ct, ct.ma_hd, ct.ma_mon, m.ten_mon, ct.so_luong, ct.don_gia,
       ct.so_luong * ct.don_gia AS thanh_tien, ct.ghi_chu, ct.trang_thai_mon
FROM chi_tiet_hd ct JOIN mon_an m ON ct.ma_mon = m.ma_mon;
GO
