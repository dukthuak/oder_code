-- Dữ liệu demo phong phú (order, bếp, báo cáo, đặt bàn)
USE ql_golden_taste;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM CHITIET_HD;
DELETE FROM HOADON;
SET FOREIGN_KEY_CHECKS = 1;

UPDATE BAN SET trangthaiBAN = 'Trống';

UPDATE BAN SET trangthaiBAN = 'Có khách' WHERE maBAN IN ('BA001', 'BA004', 'BA006');
UPDATE BAN SET trangthaiBAN = 'Đã đặt' WHERE maBAN IN ('BA005', 'BA008');

INSERT INTO HOADON (maHD, ngayLAP, tongTIEN, trangthaiHD, daIN, maNV, maBAN, maKH) VALUES
('HD00000001', DATE_SUB(NOW(), INTERVAL 0 HOUR), 0, 'Chưa thanh toán', 0, 'NV003', 'BA001', 'KH001'),
('HD00000002', DATE_SUB(NOW(), INTERVAL 2 HOUR), 0, 'Chưa thanh toán', 0, 'NV003', 'BA004', 'KH003'),
('HD00000003', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 285000, 'Đã thanh toán', 1, 'NV002', 'BA002', 'KH002'),
('HD00000004', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 420000, 'Đã thanh toán', 1, 'NV002', 'BA003', 'KH001'),
('HD00000005', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 195000, 'Đã thanh toán', 1, 'NV001', 'BA007', 'KH004'),
('HD00000006', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 560000, 'Đã thanh toán', 1, 'NV002', 'BA001', 'KH005'),
('HD00000007', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 310000, 'Đã thanh toán', 1, 'NV003', 'BA006', 'KH002'),
('HD00000008', DATE_SUB(CURDATE(), INTERVAL 6 DAY), 175000, 'Đã thanh toán', 1, 'NV002', 'BA002', NULL);

INSERT INTO CHITIET_HD (maHD, maMON, soLUONG, giaLUCBAN, trangthaiQT) VALUES
('HD00000001', 'MA012', 2, 70000, 'Đang chế biến'),
('HD00000001', 'MA004', 2, 20000, 'Chờ cung ứng'),
('HD00000001', 'MA006', 1, 35000, 'Chờ cung ứng'),
('HD00000002', 'MA001', 1, 85000, 'Chờ cung ứng'),
('HD00000002', 'MA014', 2, 75000, 'Đang chế biến'),
('HD00000003', 'MA012', 3, 70000, 'Đã phục vụ'),
('HD00000003', 'MA004', 2, 20000, 'Đã phục vụ'),
('HD00000004', 'MA001', 2, 85000, 'Đã phục vụ'),
('HD00000004', 'MA013', 2, 65000, 'Đã phục vụ'),
('HD00000004', 'MA008', 4, 25000, 'Đã phục vụ'),
('HD00000005', 'MA015', 2, 90000, 'Đã phục vụ'),
('HD00000005', 'MA005', 1, 15000, 'Đã phục vụ'),
('HD00000006', 'MA012', 4, 70000, 'Đã phục vụ'),
('HD00000006', 'MA007', 2, 45000, 'Đã phục vụ'),
('HD00000007', 'MA001', 2, 85000, 'Đã phục vụ'),
('HD00000007', 'MA010', 2, 40000, 'Đã phục vụ'),
('HD00000008', 'MA004', 3, 20000, 'Đã phục vụ'),
('HD00000008', 'MA011', 1, 55000, 'Đã phục vụ');

UPDATE HOADON h SET tongTIEN = (
  SELECT IFNULL(SUM(soLUONG * giaLUCBAN), 0) FROM CHITIET_HD WHERE maHD = h.maHD
);

UPDATE NGUYENLIEU SET slTON = 3 WHERE maNL = 'NL003';
UPDATE NGUYENLIEU SET slTON = 8 WHERE maNL = 'NL009';
UPDATE NGUYENLIEU SET slTON = 12 WHERE maNL = 'NL012';
