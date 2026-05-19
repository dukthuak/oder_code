USE nha_hang_db;

-- ========== CHI NHÁNH & NHÂN SỰ ==========
INSERT INTO chi_nhanh (ten_cn, dia_chi, sdt, gio_mo_cua) VALUES
('Phở Hà Nội — Quận 1', '123 Nguyễn Huệ, Q1, TP.HCM', '02838223344', '07:00-22:00'),
('Phở Hà Nội — Quận 3', '45 Võ Văn Tần, Q3, TP.HCM', '02839334455', '08:00-21:30'),
('Phở Hà Nội — Thủ Đức', '88 Võ Văn Ngân, Thủ Đức', '02837223366', '09:00-21:00');

INSERT INTO vai_tro (ten_vt, mo_ta) VALUES
('admin', 'Quản trị hệ thống'),
('thu_ngan', 'Thu ngân, thanh toán'),
('phuc_vu', 'Phục vụ bàn'),
('bep', 'Bếp / chế biến'),
('kho', 'Quản lý kho');

INSERT INTO nhan_vien (ma_cn, ma_vt, ho_ten, email, mat_khau_hash, sdt) VALUES
(1, 1, 'Nguyễn Văn Admin', 'admin@nhang.com', '$2a$10$placeholder', '0901111111'),
(1, 2, 'Trần Thị Thu Ngân', 'thungan@nhang.com', '$2a$10$placeholder', '0902222222'),
(1, 3, 'Lê Văn Phục Vụ', 'phucvu@nhang.com', '$2a$10$placeholder', '0903333333'),
(1, 4, 'Phạm Văn Bếp', 'bep@nhang.com', '$2a$10$placeholder', '0904444444'),
(1, 5, 'Hoàng Thị Kho', 'kho@nhang.com', '$2a$10$placeholder', '0905555555'),
(2, 2, 'Võ Minh Thu Ngân', 'thungan2@nhang.com', '$2a$10$placeholder', '0906666666'),
(2, 3, 'Đỗ Thị Hương', 'huong@nhang.com', '$2a$10$placeholder', '0907777777'),
(3, 2, 'Bùi Văn Tài', 'tai@nhang.com', '$2a$10$placeholder', '0908888888');

-- ========== KHÁCH HÀNG ==========
INSERT INTO khach_hang (ho_ten, email, sdt, diem_tich_luy, hang_thanh_vien) VALUES
('Khách lẻ', NULL, NULL, 0, 'dong'),
('Nguyễn Thị Lan', 'lan@gmail.com', '0912345678', 1200, 'vang'),
('Trần Văn Hùng', 'hung@gmail.com', '0987654321', 350, 'bac'),
('Phạm Minh An', 'an@gmail.com', '0933445566', 5200, 'bach_kim'),
('Lê Hoài Phương', 'phuong@gmail.com', '0909123456', 890, 'vang'),
('Vũ Đức Thắng', 'thang@gmail.com', '0918765432', 210, 'dong'),
('Hoàng Mai Linh', 'linh@gmail.com', '0932111222', 1800, 'vang'),
('Đặng Quốc Bảo', 'bao@gmail.com', '0977888999', 450, 'bac'),
('Trịnh Ngọc Hân', 'han@gmail.com', '0966555444', 3200, 'bach_kim'),
('Ngô Thanh Tùng', 'tung@gmail.com', '0944333222', 75, 'dong');

-- ========== THỰC ĐƠN ==========
INSERT INTO danh_muc (ten_dm, mo_ta) VALUES
('Khai vị', 'Món khai vị'),
('Món chính', 'Món chính đặc trưng'),
('Đồ uống', 'Nước uống'),
('Tráng miệng', 'Món tráng miệng');

INSERT INTO mon_an (ma_dm, ten_mon, gia_ban, don_vi, mo_ta, trang_thai) VALUES
(1, 'Gỏi cuốn tôm thịt', 45000, 'phần', '4 cuốn tươi', 'con'),
(1, 'Nem nướng Nha Trang', 55000, 'phần', 'Kèm bánh tráng', 'con'),
(1, 'Salad rau củ', 35000, 'phần', 'Sốt mè rang', 'con'),
(2, 'Phở bò tái', 65000, 'tô', 'Nước dùng 12h', 'con'),
(2, 'Phở bò đặc biệt', 85000, 'tô', 'Tái + nạm + gầu', 'con'),
(2, 'Phở gà', 55000, 'tô', 'Gà ta', 'con'),
(2, 'Cơm tấm sườn bì chả', 75000, 'đĩa', 'Đặc sản SG', 'con'),
(2, 'Bún chả Hà Nội', 70000, 'phần', 'Kèm nem rán', 'con'),
(2, 'Bún bò Huế', 68000, 'tô', 'Cay vừa', 'con'),
(2, 'Mì Quảng', 72000, 'tô', 'Tôm thịt', 'con'),
(3, 'Trà đá', 5000, 'ly', NULL, 'con'),
(3, 'Nước ngọt', 15000, 'lon', 'Coca / Sprite', 'con'),
(3, 'Cà phê sữa đá', 25000, 'ly', 'Phin truyền thống', 'con'),
(3, 'Sinh tố bơ', 45000, 'ly', NULL, 'con'),
(3, 'Trà đào cam sả', 35000, 'ly', 'Best seller', 'con'),
(4, 'Chè đậu xanh', 20000, 'ly', NULL, 'con'),
(4, 'Kem flan caramel', 28000, 'cái', NULL, 'con'),
(2, 'Phở chay nấm', 60000, 'tô', 'Món chay', 'het');

-- ========== KHO & CÔNG THỨC ==========
INSERT INTO nguyen_lieu (ten_nl, don_vi, ton_kho, ton_toi_thieu, gia_nhap) VALUES
('Bánh phở', 'kg', 48, 10, 35000),
('Thịt bò', 'kg', 22, 5, 280000),
('Thịt gà', 'kg', 18, 5, 120000),
('Rau thơm', 'kg', 3.5, 2, 40000),
('Gạo tấm', 'kg', 95, 20, 18000),
('Tôm', 'kg', 2.2, 3, 350000),
('Đường', 'kg', 28, 5, 22000),
('Đậu xanh', 'kg', 14, 3, 45000),
('Nấm hương', 'kg', 8, 2, 95000),
('Bia Tiger', 'thùng', 12, 4, 420000);

INSERT INTO cong_thuc (ma_mon, ma_nl, so_luong) VALUES
(4, 1, 0.25), (4, 2, 0.12), (4, 4, 0.05),
(5, 1, 0.30), (5, 2, 0.18), (5, 4, 0.05),
(6, 1, 0.25), (6, 3, 0.15), (6, 4, 0.05),
(7, 5, 0.20), (7, 2, 0.10),
(8, 1, 0.22), (8, 2, 0.08),
(1, 6, 0.08), (1, 4, 0.03),
(10, 1, 0.28), (10, 2, 0.15);

-- ========== BÀN (trạng thái đa dạng) ==========
INSERT INTO ban_an (ma_cn, so_ban, suc_chua, trang_thai) VALUES
(1, 'B01', 4, 'dang_dung'),
(1, 'B02', 4, 'dang_dung'),
(1, 'B03', 6, 'dat_truoc'),
(1, 'B04', 2, 'trong'),
(1, 'B05', 8, 'dang_dung'),
(1, 'B06', 4, 'trong'),
(1, 'B07', 6, 'trong'),
(1, 'VIP', 10, 'dat_truoc'),
(2, 'B01', 4, 'trong'),
(2, 'B02', 6, 'dang_dung'),
(2, 'B03', 4, 'trong'),
(3, 'B01', 4, 'trong'),
(3, 'B02', 8, 'trong');

INSERT INTO nha_cung_cap (ten_ncc, sdt, dia_chi) VALUES
('Thực phẩm Sạch ABC', '0281234567', 'KCN Tân Bình'),
('Nông sản Đà Lạt Fresh', '0263123456', 'Đà Lạt'),
('Hải sản Biển Đông', '0283999888', 'Bình Thuận');

-- ========== ĐẶT BÀN ==========
INSERT INTO dat_ban (ma_kh, ma_ban, ma_cn, ngay_gio, so_nguoi, trang_thai, ghi_chu) VALUES
(2, 3, 1, DATE_ADD(NOW(), INTERVAL 3 HOUR), 4, 'xac_nhan', 'Sinh nhật — bánh kem'),
(3, 8, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 8, 'xac_nhan', 'Tiệc công ty'),
(5, 7, 1, DATE_ADD(NOW(), INTERVAL 5 HOUR), 2, 'cho', 'Bàn cửa sổ'),
(6, 2, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), 4, 'cho', NULL),
(9, 8, 1, DATE_ADD(NOW(), INTERVAL 4 HOUR), 10, 'xac_nhan', 'VIP — trang trí hoa'),
(4, 4, 1, DATE_ADD(NOW(), INTERVAL -2 HOUR), 3, 'hoan_thanh', 'Đã đến');

-- ========== HÓA ĐƠN ĐÃ THANH TOÁN (14 ngày — báo cáo) ==========
INSERT INTO hoa_don (ma_ban, ma_nv, ma_kh, ma_cn, ngay_lap, trang_thai, tong_tien, giam_gia) VALUES
(4, 2, 2, 1, DATE_SUB(CURDATE(), INTERVAL 13 DAY) + INTERVAL 12 HOUR, 'da_thanh_toan', 185000, 0),
(5, 2, 3, 1, DATE_SUB(CURDATE(), INTERVAL 12 DAY) + INTERVAL 19 HOUR, 'da_thanh_toan', 140000, 10000),
(6, 2, 4, 1, DATE_SUB(CURDATE(), INTERVAL 11 DAY) + INTERVAL 13 HOUR, 'da_thanh_toan', 320000, 20000),
(4, 2, 5, 1, DATE_SUB(CURDATE(), INTERVAL 10 DAY) + INTERVAL 11 HOUR, 'da_thanh_toan', 95000, 0),
(6, 2, 6, 1, DATE_SUB(CURDATE(), INTERVAL 9 DAY) + INTERVAL 20 HOUR, 'da_thanh_toan', 210000, 5000),
(7, 2, 7, 1, DATE_SUB(CURDATE(), INTERVAL 8 DAY) + INTERVAL 12 HOUR, 'da_thanh_toan', 175000, 0),
(4, 2, 8, 1, DATE_SUB(CURDATE(), INTERVAL 7 DAY) + INTERVAL 18 HOUR, 'da_thanh_toan', 420000, 30000),
(5, 2, 2, 1, DATE_SUB(CURDATE(), INTERVAL 6 DAY) + INTERVAL 12 HOUR, 'da_thanh_toan', 155000, 0),
(6, 2, 9, 1, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 19 HOUR, 'da_thanh_toan', 580000, 50000),
(4, 2, 3, 1, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 13 HOUR, 'da_thanh_toan', 125000, 0),
(7, 2, 10, 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 11 HOUR, 'da_thanh_toan', 88000, 0),
(5, 2, 4, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 20 HOUR, 'da_thanh_toan', 265000, 15000),
(6, 2, 5, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL 12 HOUR, 'da_thanh_toan', 198000, 0),
(4, 2, 7, 1, CURDATE() - INTERVAL 3 HOUR, 'da_thanh_toan', 142000, 0);

INSERT INTO chi_tiet_hd (ma_hd, ma_mon, so_luong, don_gia, trang_thai_mon) VALUES
(1, 4, 2, 65000, 'xong'), (1, 11, 2, 5000, 'xong'), (1, 13, 1, 25000, 'xong'),
(2, 6, 2, 55000, 'xong'), (2, 12, 2, 15000, 'xong'),
(3, 4, 3, 65000, 'xong'), (3, 7, 1, 75000, 'xong'), (3, 8, 1, 70000, 'xong'),
(4, 1, 1, 45000, 'xong'), (4, 4, 1, 65000, 'xong'),
(5, 5, 2, 85000, 'xong'), (5, 15, 2, 35000, 'xong'),
(6, 8, 2, 70000, 'xong'), (6, 13, 1, 25000, 'xong'),
(7, 4, 4, 65000, 'xong'), (7, 5, 1, 85000, 'xong'), (7, 14, 2, 45000, 'xong'),
(8, 6, 2, 55000, 'xong'), (8, 11, 2, 5000, 'xong'),
(9, 5, 4, 85000, 'xong'), (9, 7, 2, 75000, 'xong'), (9, 16, 4, 20000, 'xong'),
(10, 4, 1, 65000, 'xong'), (10, 9, 1, 68000, 'xong'),
(11, 1, 2, 45000, 'xong'), (11, 12, 1, 15000, 'xong'),
(12, 5, 2, 85000, 'xong'), (12, 8, 1, 70000, 'xong'),
(13, 4, 2, 65000, 'xong'), (13, 15, 2, 35000, 'xong'), (13, 17, 1, 28000, 'xong'),
(14, 6, 2, 55000, 'xong'), (14, 13, 1, 25000, 'xong');

INSERT INTO thanh_toan (ma_hd, hinh_thuc, so_tien, ma_nv, ngay_tt) VALUES
(1, 'qr', 185000, 2, DATE_SUB(CURDATE(), INTERVAL 13 DAY) + INTERVAL 12 HOUR),
(2, 'tien_mat', 130000, 2, DATE_SUB(CURDATE(), INTERVAL 12 DAY) + INTERVAL 19 HOUR),
(3, 'chuyen_khoan', 300000, 2, DATE_SUB(CURDATE(), INTERVAL 11 DAY) + INTERVAL 13 HOUR),
(4, 'qr', 95000, 2, DATE_SUB(CURDATE(), INTERVAL 10 DAY) + INTERVAL 11 HOUR),
(5, 'the', 205000, 2, DATE_SUB(CURDATE(), INTERVAL 9 DAY) + INTERVAL 20 HOUR),
(6, 'qr', 175000, 2, DATE_SUB(CURDATE(), INTERVAL 8 DAY) + INTERVAL 12 HOUR),
(7, 'chuyen_khoan', 390000, 2, DATE_SUB(CURDATE(), INTERVAL 7 DAY) + INTERVAL 18 HOUR),
(8, 'qr', 155000, 2, DATE_SUB(CURDATE(), INTERVAL 6 DAY) + INTERVAL 12 HOUR),
(9, 'chuyen_khoan', 530000, 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 19 HOUR),
(10, 'tien_mat', 125000, 2, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 13 HOUR),
(11, 'qr', 88000, 2, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 11 HOUR),
(12, 'the', 250000, 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 20 HOUR),
(13, 'qr', 198000, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL 12 HOUR),
(14, 'qr', 142000, 2, CURDATE() - INTERVAL 3 HOUR);

-- ========== ORDER ĐANG MỞ (tương tác bếp / order) ==========
INSERT INTO hoa_don (ma_ban, ma_nv, ma_kh, ma_cn, ngay_lap, trang_thai, tong_tien, giam_gia) VALUES
(1, 3, 2, 1, NOW() - INTERVAL 25 MINUTE, 'dang_che_bien', 175000, 0),
(2, 3, 5, 1, NOW() - INTERVAL 12 MINUTE, 'dang_che_bien', 95000, 0),
(5, 3, 9, 1, NOW() - INTERVAL 8 MINUTE, 'mo', 0, 0);

INSERT INTO chi_tiet_hd (ma_hd, ma_mon, so_luong, don_gia, trang_thai_mon, ghi_chu) VALUES
(15, 4, 2, 65000, 'dang_nau', 'Ít hành'),
(15, 5, 1, 85000, 'cho', NULL),
(15, 11, 2, 5000, 'xong', NULL),
(15, 15, 1, 35000, 'cho', NULL),
(16, 6, 1, 55000, 'dang_nau', NULL),
(16, 1, 1, 45000, 'cho', NULL),
(16, 12, 1, 15000, 'xong', NULL),
(17, 8, 2, 70000, 'cho', 'Không cay');

UPDATE hoa_don SET tong_tien = 175000 WHERE ma_hd = 15;
UPDATE hoa_don SET tong_tien = 95000 WHERE ma_hd = 16;

-- ========== ĐÁNH GIÁ ==========
INSERT INTO danh_gia (ma_kh, ma_mon, ma_hd, diem, noi_dung) VALUES
(2, 4, 1, 5, 'Phở rất ngon, nước dùng đậm'),
(3, 6, 2, 4, 'Phục vụ nhanh'),
(4, 5, 3, 5, 'Phở đặc biệt xuất sắc'),
(7, 15, 13, 5, 'Trà đào cam sả tuyệt vời'),
(9, 5, 9, 4, 'Đông khách nhưng ổn');

-- ========== PHIẾU NHẬP MẪU ==========
INSERT INTO phieu_nhap (ma_ncc, ma_nv, ngay_nhap, tong_tien, trang_thai) VALUES
(1, 5, DATE_SUB(NOW(), INTERVAL 5 DAY), 2450000, 'hoan_tat'),
(2, 5, DATE_SUB(NOW(), INTERVAL 2 DAY), 890000, 'hoan_tat');

INSERT INTO chi_tiet_pn (ma_pn, ma_nl, so_luong, don_gia) VALUES
(1, 1, 30, 35000), (1, 2, 15, 280000), (1, 4, 5, 40000),
(2, 6, 8, 350000), (2, 9, 3, 95000);
