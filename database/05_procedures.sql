USE nha_hang_db;

DROP PROCEDURE IF EXISTS sp_tao_hoa_don;
DELIMITER //
CREATE PROCEDURE sp_tao_hoa_don(
  IN p_ma_ban INT,
  IN p_ma_nv INT,
  IN p_ma_kh INT,
  IN p_ma_cn INT,
  OUT p_ma_hd INT
)
BEGIN
  DECLARE v_ban_status VARCHAR(20);
  SELECT trang_thai INTO v_ban_status FROM ban_an WHERE ma_ban = p_ma_ban FOR UPDATE;
  IF v_ban_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ban khong ton tai';
  END IF;
  INSERT INTO hoa_don (ma_ban, ma_nv, ma_kh, ma_cn, trang_thai)
  VALUES (p_ma_ban, p_ma_nv, p_ma_kh, p_ma_cn, 'mo');
  SET p_ma_hd = LAST_INSERT_ID();
  UPDATE ban_an SET trang_thai = 'dang_dung' WHERE ma_ban = p_ma_ban;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_them_mon_hd;
DELIMITER //
CREATE PROCEDURE sp_them_mon_hd(
  IN p_ma_hd INT,
  IN p_ma_mon INT,
  IN p_so_luong INT,
  IN p_ghi_chu VARCHAR(255),
  OUT p_result VARCHAR(50)
)
BEGIN
  DECLARE v_gia DECIMAL(12,2);
  DECLARE v_tt VARCHAR(30);
  SELECT gia_ban, trang_thai INTO v_gia, v_tt FROM mon_an WHERE ma_mon = p_ma_mon;
  IF v_gia IS NULL THEN
    SET p_result = 'Mon khong ton tai';
  ELSEIF v_tt <> 'con' THEN
    SET p_result = 'Mon het hang';
  ELSE
    INSERT INTO chi_tiet_hd (ma_hd, ma_mon, so_luong, don_gia, ghi_chu)
    VALUES (p_ma_hd, p_ma_mon, p_so_luong, v_gia, p_ghi_chu);
    UPDATE hoa_don SET tong_tien = fn_tinh_tong_hd(p_ma_hd),
      trang_thai = IF(trang_thai = 'mo', 'dang_che_bien', trang_thai)
    WHERE ma_hd = p_ma_hd;
    SET p_result = 'OK';
  END IF;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_thanh_toan;
DELIMITER //
CREATE PROCEDURE sp_thanh_toan(
  IN p_ma_hd INT,
  IN p_hinh_thuc VARCHAR(20),
  IN p_so_tien DECIMAL(14,2),
  IN p_ma_nv INT,
  OUT p_result VARCHAR(50)
)
BEGIN
  DECLARE v_tt VARCHAR(30);
  DECLARE v_tong DECIMAL(14,2);
  DECLARE v_giam DECIMAL(14,2);
  DECLARE v_ma_kh INT;
  DECLARE v_diem INT;
  SELECT trang_thai, tong_tien, giam_gia, ma_kh
  INTO v_tt, v_tong, v_giam, v_ma_kh
  FROM hoa_don WHERE ma_hd = p_ma_hd FOR UPDATE;
  IF v_tt IS NULL THEN
    SET p_result = 'Hoa don khong ton tai';
  ELSEIF v_tt = 'da_thanh_toan' THEN
    SET p_result = 'Da thanh toan';
  ELSE
    INSERT INTO thanh_toan (ma_hd, hinh_thuc, so_tien, ma_nv)
    VALUES (p_ma_hd, p_hinh_thuc, p_so_tien, p_ma_nv);
    UPDATE hoa_don SET trang_thai = 'da_thanh_toan' WHERE ma_hd = p_ma_hd;
    IF v_ma_kh IS NOT NULL THEN
      SET v_diem = FLOOR((v_tong - v_giam) / 10000);
      UPDATE khach_hang
      SET diem_tich_luy = diem_tich_luy + v_diem,
          hang_thanh_vien = fn_hang_thanh_vien(diem_tich_luy + v_diem)
      WHERE ma_kh = v_ma_kh;
    END IF;
    SET p_result = 'OK';
  END IF;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_bao_cao_doanh_thu;
DELIMITER //
CREATE PROCEDURE sp_bao_cao_doanh_thu(
  IN p_tu DATE,
  IN p_den DATE,
  IN p_ma_cn INT
)
BEGIN
  SELECT
    DATE(h.ngay_lap) AS ngay,
    COUNT(DISTINCT h.ma_hd) AS so_hd,
    SUM(h.tong_tien - h.giam_gia) AS doanh_thu
  FROM hoa_don h
  WHERE h.trang_thai = 'da_thanh_toan'
    AND DATE(h.ngay_lap) BETWEEN p_tu AND p_den
    AND (p_ma_cn IS NULL OR h.ma_cn = p_ma_cn)
  GROUP BY DATE(h.ngay_lap)
  ORDER BY ngay;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_hoan_tat_phieu_nhap;
DELIMITER //
CREATE PROCEDURE sp_hoan_tat_phieu_nhap(IN p_ma_pn INT)
BEGIN
  DECLARE v_tong DECIMAL(14,2) DEFAULT 0;
  DECLARE done INT DEFAULT 0;
  DECLARE v_ma_nl INT;
  DECLARE v_sl DECIMAL(12,3);
  DECLARE v_dg DECIMAL(12,2);
  DECLARE cur CURSOR FOR
    SELECT ma_nl, so_luong, don_gia FROM chi_tiet_pn WHERE ma_pn = p_ma_pn;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_ma_nl, v_sl, v_dg;
    IF done THEN LEAVE read_loop; END IF;
    UPDATE nguyen_lieu SET ton_kho = ton_kho + v_sl WHERE ma_nl = v_ma_nl;
    SET v_tong = v_tong + v_sl * v_dg;
  END LOOP;
  CLOSE cur;

  UPDATE phieu_nhap SET tong_tien = v_tong, trang_thai = 'hoan_tat' WHERE ma_pn = p_ma_pn;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_ai_du_bao_nhu_cau;
DELIMITER //
CREATE PROCEDURE sp_ai_du_bao_nhu_cau(IN p_days INT)
BEGIN
  INSERT INTO ai_du_bao (loai, ma_mon, gia_tri, noi_dung)
  SELECT
    'nhu_cau_mon',
    m.ma_mon,
    ROUND(SUM(ct.so_luong) / GREATEST(p_days, 1) * 1.15, 2),
    CONCAT('Du bao ', ROUND(SUM(ct.so_luong) / GREATEST(p_days, 1) * 1.15, 0),
           ' phan/ngay (AI heuristic +15%)')
  FROM chi_tiet_hd ct
  JOIN hoa_don h ON ct.ma_hd = h.ma_hd
  JOIN mon_an m ON ct.ma_mon = m.ma_mon
  WHERE h.trang_thai = 'da_thanh_toan'
    AND h.ngay_lap >= DATE_SUB(CURDATE(), INTERVAL p_days DAY)
  GROUP BY m.ma_mon
  HAVING SUM(ct.so_luong) > 0
  ORDER BY SUM(ct.so_luong) DESC
  LIMIT 10;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_ai_goi_y_mon;
DELIMITER //
CREATE PROCEDURE sp_ai_goi_y_mon(IN p_ma_kh INT, IN p_limit INT)
BEGIN
  IF p_ma_kh > 0 THEN
    SELECT m.ma_mon, m.ten_mon, dm.ten_dm, m.gia_ban,
           'AI: goi y theo lich su mua' AS ly_do
    FROM mon_an m
    JOIN danh_muc dm ON m.ma_dm = dm.ma_dm
    WHERE m.trang_thai = 'con'
      AND m.ma_mon IN (
        SELECT DISTINCT ct.ma_mon
        FROM chi_tiet_hd ct
        JOIN hoa_don h ON ct.ma_hd = h.ma_hd
        WHERE h.ma_kh = p_ma_kh AND h.trang_thai = 'da_thanh_toan'
      )
    LIMIT p_limit;
  ELSE
    SELECT m.ma_mon, m.ten_mon, dm.ten_dm, m.gia_ban,
           'AI: mon ban chay' AS ly_do
    FROM vw_mon_ban_chay v
    JOIN mon_an m ON v.ma_mon = m.ma_mon
    JOIN danh_muc dm ON m.ma_dm = dm.ma_dm
    WHERE m.trang_thai = 'con'
    ORDER BY v.tong_sl DESC
    LIMIT p_limit;
  END IF;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_ai_phat_hien_bat_thuong;
DELIMITER //
CREATE PROCEDURE sp_ai_phat_hien_bat_thuong()
BEGIN
  INSERT INTO ai_du_bao (loai, ma_nl, gia_tri, noi_dung)
  SELECT
    'canh_bao_ton',
    ma_nl,
    ton_kho,
    CONCAT('AI: ton kho ', ton_kho, ' ', don_vi,
           ' — muc ', muc_canh_bao, ' (nguong ', ton_toi_thieu, ')')
  FROM vw_ton_kho_canh_bao
  WHERE muc_canh_bao IN ('het_hang', 'sap_het');
END//
DELIMITER ;
