-- ============================================================
-- Truy vấn mẫu (Query) — Khai thác CSDL Nhà hàng
-- ============================================================
USE nha_hang_db;

-- Q1: Doanh thu tháng hiện tại
SELECT SUM(tong_tien - giam_gia) AS doanh_thu_thang
FROM hoa_don
WHERE trang_thai = 'da_thanh_toan'
  AND MONTH(ngay_lap) = MONTH(CURDATE())
  AND YEAR(ngay_lap) = YEAR(CURDATE());

-- Q2: Top 5 món bán chạy (dùng View)
SELECT * FROM vw_mon_ban_chay LIMIT 5;

-- Q3: Hóa đơn chưa thanh toán
SELECT h.ma_hd, b.so_ban, h.tong_tien, h.ngay_lap, nv.ho_ten
FROM hoa_don h
LEFT JOIN ban_an b ON h.ma_ban = b.ma_ban
JOIN nhan_vien nv ON h.ma_nv = nv.ma_nv
WHERE h.trang_thai IN ('mo','dang_che_bien','cho_thanh_toan');

-- Q4: Nguyên liệu sắp hết
SELECT * FROM vw_ton_kho_canh_bao;

-- Q5: Khách hàng hạng Vàng trở lên
SELECT ho_ten, diem_tich_luy, hang_thanh_vien
FROM khach_hang
WHERE hang_thanh_vien IN ('vang','bach_kim');

-- Q6: Chi tiết công thức món Phở bò
SELECT m.ten_mon, nl.ten_nl, ct.so_luong, nl.don_vi
FROM cong_thuc ct
JOIN mon_an m ON ct.ma_mon = m.ma_mon
JOIN nguyen_lieu nl ON ct.ma_nl = nl.ma_nl
WHERE m.ten_mon LIKE '%Phở%';

-- Q7: Gọi Stored Procedure báo cáo
CALL sp_bao_cao_doanh_thu('2025-01-01', CURDATE(), NULL);

-- Q8: Kiểm tra function
SELECT ma_hd, fn_tinh_tong_hd(ma_hd) AS tinh_lai FROM hoa_don LIMIT 5;

-- Q9: Lịch sử AI
SELECT * FROM ai_du_bao ORDER BY ngay_tao DESC LIMIT 20;
