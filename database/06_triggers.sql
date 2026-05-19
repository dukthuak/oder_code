USE nha_hang_db;

-- Cập nhật tổng tiền hóa đơn khi sửa/xóa chi tiết
DROP TRIGGER IF EXISTS trg_cthd_after_insert;
DELIMITER //
CREATE TRIGGER trg_cthd_after_insert
AFTER INSERT ON chi_tiet_hd
FOR EACH ROW
BEGIN
  UPDATE hoa_don SET tong_tien = fn_tinh_tong_hd(NEW.ma_hd) WHERE ma_hd = NEW.ma_hd;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_cthd_after_update;
DELIMITER //
CREATE TRIGGER trg_cthd_after_update
AFTER UPDATE ON chi_tiet_hd
FOR EACH ROW
BEGIN
  UPDATE hoa_don SET tong_tien = fn_tinh_tong_hd(NEW.ma_hd) WHERE ma_hd = NEW.ma_hd;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_cthd_after_delete;
DELIMITER //
CREATE TRIGGER trg_cthd_after_delete
AFTER DELETE ON chi_tiet_hd
FOR EACH ROW
BEGIN
  UPDATE hoa_don SET tong_tien = fn_tinh_tong_hd(OLD.ma_hd) WHERE ma_hd = OLD.ma_hd;
END//
DELIMITER ;

-- Trừ kho theo công thức khi thanh toán xong
DROP TRIGGER IF EXISTS trg_hd_after_pay;
DELIMITER //
CREATE TRIGGER trg_hd_after_pay
AFTER UPDATE ON hoa_don
FOR EACH ROW
BEGIN
  IF NEW.trang_thai = 'da_thanh_toan' AND OLD.trang_thai <> 'da_thanh_toan' THEN
    UPDATE nguyen_lieu nl
    JOIN (
      SELECT ct.ma_nl, SUM(ct.so_luong * cthd.so_luong) AS can_tru
      FROM cong_thuc ct
      JOIN chi_tiet_hd cthd ON ct.ma_mon = cthd.ma_mon
      WHERE cthd.ma_hd = NEW.ma_hd AND cthd.trang_thai_mon <> 'huy'
      GROUP BY ct.ma_nl
    ) x ON nl.ma_nl = x.ma_nl
    SET nl.ton_kho = GREATEST(0, nl.ton_kho - x.can_tru);

    UPDATE ban_an SET trang_thai = 'trong'
    WHERE ma_ban = NEW.ma_ban;
  END IF;
END//
DELIMITER ;

-- Ghi phiếu xuất kho tự động khi trừ kho từ thanh toán
DROP TRIGGER IF EXISTS trg_hd_log_xuat_kho;
DELIMITER //
CREATE TRIGGER trg_hd_log_xuat_kho
AFTER UPDATE ON hoa_don
FOR EACH ROW
BEGIN
  DECLARE v_ma_px INT;
  IF NEW.trang_thai = 'da_thanh_toan' AND OLD.trang_thai <> 'da_thanh_toan' THEN
    INSERT INTO phieu_xuat (ma_nv, ma_cn, ly_do)
    VALUES (NEW.ma_nv, NEW.ma_cn, CONCAT('Xuat kho tu HD #', NEW.ma_hd));
    SET v_ma_px = LAST_INSERT_ID();
    INSERT INTO chi_tiet_px (ma_px, ma_nl, so_luong)
    SELECT v_ma_px, ct.ma_nl, SUM(ct.so_luong * cthd.so_luong)
    FROM cong_thuc ct
    JOIN chi_tiet_hd cthd ON ct.ma_mon = cthd.ma_mon
    WHERE cthd.ma_hd = NEW.ma_hd AND cthd.trang_thai_mon <> 'huy'
    GROUP BY ct.ma_nl;
  END IF;
END//
DELIMITER ;

-- Đặt bàn xác nhận → bàn đặt trước
DROP TRIGGER IF EXISTS trg_dat_ban_status;
DELIMITER //
CREATE TRIGGER trg_dat_ban_status
AFTER UPDATE ON dat_ban
FOR EACH ROW
BEGIN
  IF NEW.trang_thai = 'xac_nhan' AND OLD.trang_thai <> 'xac_nhan' THEN
    UPDATE ban_an SET trang_thai = 'dat_truoc' WHERE ma_ban = NEW.ma_ban;
  ELSEIF NEW.trang_thai = 'huy' THEN
    UPDATE ban_an SET trang_thai = 'trong'
    WHERE ma_ban = NEW.ma_ban AND trang_thai = 'dat_truoc';
  END IF;
END//
DELIMITER ;
