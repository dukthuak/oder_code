USE ql_golden_taste;

-- Chỉ tạo tài khoản Quản trị để đăng nhập lần đầu.
-- Món, bàn, khách, chức năng web… thêm qua menu Quản trị trên web.
INSERT INTO NHANVIEN (maNV, hotenNV, ngaySINH, gioiTINH, SDT, emailNV, chucVU, luongCB) VALUES
('NV001', 'Phạm Thị Thu Trang', '1995-01-10', 'Nữ', '0900000001', 'nv001@goldentaste.vn', 'Quản lý', 15000000);
