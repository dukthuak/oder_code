USE NhaHangDB;
GO
SET IDENTITY_INSERT chi_nhanh ON;
INSERT INTO chi_nhanh (ma_cn, ten_cn, dia_chi, sdt, gio_mo_cua) VALUES
(1, N'Nhà hàng Phở Hà Nội - Quận 1', N'123 Nguyễn Huệ, Q1', N'02838223344', N'07:00-22:00'),
(2, N'Nhà hàng Phở Hà Nội - Quận 3', N'45 Võ Văn Tần, Q3', N'02839334455', N'08:00-21:30');
SET IDENTITY_INSERT chi_nhanh OFF;

INSERT INTO vai_tro (ten_vt, mo_ta) VALUES
(N'admin', N'Quản trị'), (N'thu_ngan', N'Thu ngân'), (N'phuc_vu', N'Phục vụ'),
(N'bep', N'Bếp'), (N'kho', N'Kho');

INSERT INTO nhan_vien (ma_cn, ma_vt, ho_ten, email, mat_khau_hash, sdt) VALUES
(1, 1, N'Nguyễn Văn Admin', N'admin@nhang.com', N'hash', N'0901111111'),
(1, 2, N'Trần Thị Thu Ngân', N'thungan@nhang.com', N'hash', N'0902222222'),
(1, 3, N'Lê Văn Phục Vụ', N'phucvu@nhang.com', N'hash', N'0903333333'),
(1, 4, N'Phạm Văn Bếp', N'bep@nhang.com', N'hash', N'0904444444'),
(1, 5, N'Hoàng Thị Kho', N'kho@nhang.com', N'hash', N'0905555555');

INSERT INTO khach_hang (ho_ten, email, sdt, diem_tich_luy, hang_thanh_vien) VALUES
(N'Khách lẻ', NULL, NULL, 0, N'dong'),
(N'Nguyễn Thị Lan', N'lan@gmail.com', N'0912345678', 1200, N'vang'),
(N'Trần Văn Hùng', N'hung@gmail.com', N'0987654321', 350, N'bac');

INSERT INTO danh_muc (ten_dm) VALUES (N'Khai vị'), (N'Món chính'), (N'Đồ uống'), (N'Tráng miệng');

INSERT INTO mon_an (ma_dm, ten_mon, gia_ban, don_vi) VALUES
(1, N'Gỏi cuốn tôm thịt', 45000, N'phần'),
(2, N'Phở bò tái', 65000, N'tô'),
(2, N'Phở gà', 55000, N'tô'),
(3, N'Trà đá', 5000, N'ly'),
(3, N'Cà phê sữa đá', 25000, N'ly');

INSERT INTO nguyen_lieu (ten_nl, don_vi, ton_kho, ton_toi_thieu, gia_nhap) VALUES
(N'Bánh phở', N'kg', 50, 10, 35000),
(N'Thịt bò', N'kg', 25, 5, 280000),
(N'Thịt gà', N'kg', 20, 5, 120000),
(N'Rau thơm', N'kg', 8, 2, 40000);

INSERT INTO cong_thuc (ma_mon, ma_nl, so_luong) VALUES
(2, 1, 0.25), (2, 2, 0.12), (2, 4, 0.05),
(3, 1, 0.25), (3, 3, 0.15), (3, 4, 0.05);

INSERT INTO ban_an (ma_cn, so_ban, suc_chua) VALUES
(1, N'B01', 4), (1, N'B02', 4), (1, N'B03', 6), (1, N'B04', 2);

INSERT INTO nha_cung_cap (ten_ncc, sdt) VALUES
(N'Công ty Thực phẩm ABC', N'0281234567'),
(N'Nông sản Đà Lạt', N'0263123456');

INSERT INTO hoa_don (ma_ban, ma_nv, ma_kh, ma_cn, ngay_lap, trang_thai, tong_tien) VALUES
(1, 2, 2, 1, DATEADD(DAY, -3, SYSDATETIME()), N'da_thanh_toan', 185000),
(2, 2, 3, 1, DATEADD(DAY, -2, SYSDATETIME()), N'da_thanh_toan', 140000);

INSERT INTO chi_tiet_hd (ma_hd, ma_mon, so_luong, don_gia, trang_thai_mon) VALUES
(1, 2, 2, 65000, N'xong'), (1, 4, 2, 5000, N'xong'),
(2, 3, 2, 55000, N'xong');

INSERT INTO thanh_toan (ma_hd, hinh_thuc, so_tien, ma_nv) VALUES
(1, N'qr', 185000, 2), (2, N'tien_mat', 140000, 2);
GO
