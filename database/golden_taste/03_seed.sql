USE ql_golden_taste;

INSERT INTO LOAIMON (maLOAI, tenLOAI) VALUES
('LM001', 'Món chính'), ('LM002', 'Nước uống'), ('LM003', 'Tráng miệng'),
('LM010', 'Phở'), ('LM020', 'Combo');

INSERT INTO BAN (maBAN, tenBAN, viTRI, sucCHUA, trangthaiBAN) VALUES
('BA001', 'Bàn 1', 'Tầng 1', 4, 'Có khách'),
('BA002', 'Bàn 2', 'Tầng 1', 4, 'Trống'),
('BA003', 'Bàn 3', 'Tầng 1', 6, 'Trống');

INSERT INTO NHANVIEN (maNV, hotenNV, ngaySINH, gioiTINH, SDT, emailNV, chucVU, luongCB) VALUES
('NV001', 'Phạm Thị Thu Trang', '1995-01-10', 'Nữ', '0900000001', 'nv001@goldentaste.vn', 'Quản lý', 15000000),
('NV002', 'Vũ Thị Huyền Trang', '1997-02-12', 'Nữ', '0900000002', 'nv002@goldentaste.vn', 'Thu ngân', 9000000),
('NV003', 'Chu Thị Thanh Trà', '1998-03-14', 'Nữ', '0900000003', 'nv003@goldentaste.vn', 'Phục vụ', 7000000),
('NV004', 'Diêm Bích Loan', '1999-04-16', 'Nữ', '0900000004', 'nv004@goldentaste.vn', 'Đầu bếp', 12000000);

INSERT INTO KHACHHANG (maKH, tenKH, SDT, ngayDANGKY, diemTICHLUY) VALUES
('KH001', 'Nguyễn Hồng Hạnh', '0911111101', '2026-01-01', 100),
('KH002', 'Nguyễn Trang Nhung', '0911111118', '2026-01-18', 230);

INSERT INTO NGUYENLIEU (maNL, tenNL, slTON, donVITINH) VALUES
('NL001', 'Gạo', 100, 'Kg'), ('NL003', 'Thịt bò', 70, 'Kg'), ('NL009', 'Bún tươi', 45, 'Kg');

INSERT INTO MONAN (maMON, tenMON, donGIA, donVITINH, trangthaiMON, maLOAI) VALUES
('MA001', 'Cơm chiên hải sản', 85000, 'Đĩa', 'Sẵn có', 'LM001'),
('MA012', 'Phở bò', 70000, 'Tô', 'Sẵn có', 'LM010'),
('MA004', 'Pepsi', 20000, 'Lon', 'Sẵn có', 'LM002');

INSERT INTO DINHMUC (maMON, maNL, hamLUONG) VALUES
('MA012', 'NL009', 0.4), ('MA012', 'NL003', 0.15);

INSERT INTO HOADON (maHD, ngayLAP, tongTIEN, trangthaiHD, daIN, maNV, maBAN, maKH) VALUES
('HD00000001', '2026-05-10 08:15:00', 170000, 'Chưa thanh toán', 0, 'NV001', 'BA001', 'KH001'),
('HD00000002', '2026-05-10 09:30:00', 120000, 'Đã thanh toán', 1, 'NV002', 'BA002', 'KH002');

INSERT INTO CHITIET_HD (maHD, maMON, soLUONG, giaLUCBAN, trangthaiQT) VALUES
('HD00000001', 'MA012', 2, 70000, 'Đã phục vụ'),
('HD00000002', 'MA004', 3, 20000, 'Đã phục vụ');
