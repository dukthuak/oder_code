-- ============================================================
-- Truy vấn mẫu — QL Nhà hàng Golden Taste (MySQL)
-- Theo docs/QL_cuahanggoldentaste.sql
-- ============================================================
USE ql_golden_taste;

-- Q1: Hóa đơn chưa thanh toán
SELECT maHD, ngayLAP, maBAN, maNV, tongTIEN, trangthaiHD
FROM HOADON
WHERE trangthaiHD = 'Chưa thanh toán'
ORDER BY ngayLAP ASC;

-- Q2: Hiệu suất khu vực (doanh thu theo vị trí bàn)
SELECT B.viTRI,
       COUNT(H.maHD) AS soHOADON,
       SUM(H.tongTIEN) AS tongDOANHTHU
FROM BAN B
JOIN HOADON H ON B.maBAN = H.maBAN
WHERE H.trangthaiHD = 'Đã thanh toán'
GROUP BY B.viTRI
ORDER BY tongDOANHTHU DESC;

-- Q3: Hao hụt / tiêu hao nguyên liệu (món đã phục vụ)
SELECT NL.maNL, NL.tenNL,
       SUM(CT.soLUONG * DM.hamLUONG) AS tieuhaoLYTHUYET,
       NL.slTON AS tonkhoTHUCTE,
       CASE WHEN NL.slTON < 5 THEN 'Cảnh báo rủi ro lãng phí/Hết hàng' ELSE 'Ổn định' END AS danhGIA
FROM CHITIET_HD CT
JOIN DINHMUC DM ON CT.maMON = DM.maMON
JOIN NGUYENLIEU NL ON DM.maNL = NL.maNL
WHERE CT.trangthaiQT = 'Đã phục vụ'
GROUP BY NL.maNL, NL.tenNL, NL.slTON
ORDER BY tieuhaoLYTHUYET DESC;

-- Q4: Giờ vàng (giờ cao điểm)
SELECT HOUR(ngayLAP) AS gioTRONGNGAY,
       COUNT(maHD) AS soluongHOADON,
       SUM(tongTIEN) AS doanhTHU
FROM HOADON
WHERE trangthaiHD = 'Đã thanh toán'
GROUP BY HOUR(ngayLAP)
ORDER BY soluongHOADON DESC;

-- Q5: Tồn kho khó bán (30 ngày)
SELECT NL.maNL, NL.tenNL, NL.slTON, M.tenMON,
       IFNULL(SUM(CT.soLUONG), 0) AS tongsoLUONGBAN
FROM NGUYENLIEU NL
JOIN DINHMUC DM ON NL.maNL = DM.maNL
JOIN MONAN M ON DM.maMON = M.maMON
LEFT JOIN CHITIET_HD CT ON M.maMON = CT.maMON
LEFT JOIN HOADON H ON CT.maHD = H.maHD AND H.ngayLAP >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY NL.maNL, NL.tenNL, NL.slTON, M.tenMON
HAVING NL.slTON > 20 AND IFNULL(SUM(CT.soLUONG), 0) < 5
ORDER BY NL.slTON DESC;

-- Q6: View sơ đồ bàn trực tuyến
SELECT * FROM vw_SoDoBanTrucTuyen;

-- Q7: View tồn kho an toàn
SELECT * FROM vw_BaoCaoTonKhoAnToan;

-- Q8: Doanh thu nhân viên tháng này
SELECT * FROM vw_DoanhThuNhanVienThangNay;

-- Q9: Top món bán chạy
SELECT * FROM vw_MonAnBanChay;

-- Q10: Khách VIP (điểm tích lũy)
SELECT * FROM vw_LichSuKhachHangVIP
WHERE diemTICHLUY >= 150
ORDER BY diemTICHLUY DESC;

-- Q11: Chi tiết định mức món Phở bò
SELECT M.tenMON, NL.tenNL, DM.hamLUONG, NL.donVITINH
FROM DINHMUC DM
JOIN MONAN M ON DM.maMON = M.maMON
JOIN NGUYENLIEU NL ON DM.maNL = NL.maNL
WHERE M.tenMON LIKE '%Phở%';

-- Q12: Doanh thu tháng hiện tại
SELECT SUM(tongTIEN) AS doanh_thu_thang
FROM HOADON
WHERE trangthaiHD = 'Đã thanh toán'
  AND MONTH(ngayLAP) = MONTH(CURDATE())
  AND YEAR(ngayLAP) = YEAR(CURDATE());
