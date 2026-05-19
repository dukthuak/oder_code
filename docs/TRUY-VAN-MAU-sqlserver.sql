-- Truy vấn mẫu — SQL Server (NhaHangDB)
USE NhaHangDB;
GO

-- Q1: Doanh thu tháng hiện tại
SELECT SUM(tong_tien - giam_gia) AS doanh_thu_thang
FROM hoa_don
WHERE trang_thai = N'da_thanh_toan'
  AND MONTH(ngay_lap) = MONTH(GETDATE())
  AND YEAR(ngay_lap) = YEAR(GETDATE());

-- Q2: Top 5 món bán chạy (View)
SELECT TOP 5 * FROM vw_mon_ban_chay ORDER BY tong_sl DESC;

-- Q3: Hóa đơn chưa thanh toán
SELECT h.ma_hd, b.so_ban, h.tong_tien, h.ngay_lap, nv.ho_ten
FROM hoa_don h
LEFT JOIN ban_an b ON h.ma_ban = b.ma_ban
JOIN nhan_vien nv ON h.ma_nv = nv.ma_nv
WHERE h.trang_thai IN (N'mo', N'dang_che_bien', N'cho_thanh_toan');

-- Q4: Nguyên liệu sắp hết
SELECT * FROM vw_ton_kho_canh_bao;

-- Q5: Khách hàng hạng Vàng trở lên
SELECT ho_ten, diem_tich_luy, hang_thanh_vien
FROM khach_hang
WHERE hang_thanh_vien IN (N'vang', N'bach_kim');

-- Q6: Công thức món Phở
SELECT m.ten_mon, nl.ten_nl, ct.so_luong, nl.don_vi
FROM cong_thuc ct
JOIN mon_an m ON ct.ma_mon = m.ma_mon
JOIN nguyen_lieu nl ON ct.ma_nl = nl.ma_nl
WHERE m.ten_mon LIKE N'%Phở%';

-- Q7: Stored Procedure báo cáo
EXEC dbo.sp_bao_cao_doanh_thu @p_tu = '2025-01-01', @p_den = '2026-12-31', @p_ma_cn = NULL;

-- Q8: Function tính tổng HD
SELECT TOP 5 ma_hd, dbo.fn_tinh_tong_hd(ma_hd) AS tinh_lai FROM hoa_don;

-- Q9: AI — dự báo & cảnh báo
EXEC dbo.sp_ai_du_bao_nhu_cau @p_days = 7;
EXEC dbo.sp_ai_phat_hien_bat_thuong;
SELECT TOP 20 * FROM ai_du_bao ORDER BY ngay_tao DESC;
