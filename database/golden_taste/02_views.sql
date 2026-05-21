USE ql_golden_taste;

DROP VIEW IF EXISTS vw_SoDoBanTrucTuyen;
CREATE VIEW vw_SoDoBanTrucTuyen AS
SELECT B.maBAN, B.tenBAN, B.viTRI, B.sucCHUA, B.trangthaiBAN, H.maHD
FROM BAN B
LEFT JOIN HOADON H ON B.maBAN = H.maBAN AND H.trangthaiHD = 'Chưa thanh toán';

DROP VIEW IF EXISTS vw_BaoCaoTonKhoAnToan;
CREATE VIEW vw_BaoCaoTonKhoAnToan AS
SELECT maNL, tenNL, slTON, donVITINH,
  CASE
    WHEN slTON < 5 THEN 'Cần nhập gấp'
    WHEN slTON BETWEEN 5 AND 20 THEN 'Sắp hết'
    ELSE 'Ổn định'
  END AS trangthaiKHO
FROM NGUYENLIEU;

DROP VIEW IF EXISTS vw_DoanhThuNhanVienThangNay;
CREATE VIEW vw_DoanhThuNhanVienThangNay AS
SELECT NV.maNV, NV.hotenNV, NV.chucVU,
  COUNT(H.maHD) AS soHOADON,
  SUM(IFNULL(H.tongTIEN, 0)) AS doanhthuTHANG
FROM NHANVIEN NV
LEFT JOIN HOADON H ON NV.maNV = H.maNV
  AND H.trangthaiHD = 'Đã thanh toán'
  AND MONTH(H.ngayLAP) = MONTH(CURDATE())
  AND YEAR(H.ngayLAP) = YEAR(CURDATE())
GROUP BY NV.maNV, NV.hotenNV, NV.chucVU;

DROP VIEW IF EXISTS vw_MonAnBanChay;
CREATE VIEW vw_MonAnBanChay AS
SELECT M.maMON, M.tenMON, M.donGIA,
  SUM(CT.soLUONG) AS tongsoLUONGBAN
FROM CHITIET_HD CT
JOIN MONAN M ON CT.maMON = M.maMON
WHERE CT.trangthaiQT = 'Đã phục vụ'
GROUP BY M.maMON, M.tenMON, M.donGIA
ORDER BY tongsoLUONGBAN DESC
LIMIT 10;

DROP VIEW IF EXISTS vw_LichSuKhachHangVIP;
CREATE VIEW vw_LichSuKhachHangVIP AS
SELECT KH.maKH, KH.tenKH, KH.SDT, KH.diemTICHLUY,
  COUNT(H.maHD) AS solanQUAYLAI,
  SUM(IFNULL(H.tongTIEN, 0)) AS tongCHITIEU
FROM KHACHHANG KH
LEFT JOIN HOADON H ON KH.maKH = H.maKH AND YEAR(H.ngayLAP) = YEAR(CURDATE())
GROUP BY KH.maKH, KH.tenKH, KH.SDT, KH.diemTICHLUY;

-- Alias view tương thích API cũ
DROP VIEW IF EXISTS vw_mon_ban_chay;
CREATE VIEW vw_mon_ban_chay AS
SELECT maMON AS ma_mon, tenMON AS ten_mon, donGIA AS gia_ban, tongsoLUONGBAN AS tong_sl
FROM vw_MonAnBanChay;

DROP VIEW IF EXISTS vw_ton_kho_canh_bao;
CREATE VIEW vw_ton_kho_canh_bao AS
SELECT maNL AS ma_nl, tenNL AS ten_nl, slTON AS ton_kho, donVITINH AS don_vi, trangthaiKHO AS trang_thai
FROM vw_BaoCaoTonKhoAnToan
WHERE trangthaiKHO IN ('Cần nhập gấp', 'Sắp hết');

DROP VIEW IF EXISTS vw_ban_dang_phuc_vu;
CREATE VIEW vw_ban_dang_phuc_vu AS
SELECT * FROM vw_SoDoBanTrucTuyen;

DROP VIEW IF EXISTS vw_chi_tiet_hoa_don;
CREATE VIEW vw_chi_tiet_hoa_don AS
SELECT ct.maCTHD AS ma_ct, ct.maHD AS ma_hd, ct.maMON AS ma_mon, m.tenMON AS ten_mon,
  ct.soLUONG AS so_luong, ct.giaLUCBAN AS don_gia, ct.thanhTIEN AS thanh_tien,
  ct.trangthaiQT AS trang_thai_mon
FROM CHITIET_HD ct
JOIN MONAN m ON ct.maMON = m.maMON;
