USE nha_hang_db;

DROP FUNCTION IF EXISTS fn_tinh_tong_hd;
DELIMITER //
CREATE FUNCTION fn_tinh_tong_hd(p_ma_hd INT)
RETURNS DECIMAL(14,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_tong DECIMAL(14,2) DEFAULT 0;
  SELECT IFNULL(SUM(so_luong * don_gia), 0) INTO v_tong
  FROM chi_tiet_hd
  WHERE ma_hd = p_ma_hd AND trang_thai_mon <> 'huy';
  RETURN v_tong;
END//
DELIMITER ;

DROP FUNCTION IF EXISTS fn_hang_thanh_vien;
DELIMITER //
CREATE FUNCTION fn_hang_thanh_vien(p_diem INT)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
  IF p_diem >= 5000 THEN RETURN 'bach_kim';
  ELSEIF p_diem >= 2000 THEN RETURN 'vang';
  ELSEIF p_diem >= 500 THEN RETURN 'bac';
  ELSE RETURN 'dong';
  END IF;
END//
DELIMITER ;
