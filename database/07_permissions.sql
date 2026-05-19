-- Phân quyền MySQL (chạy với quyền root)
USE nha_hang_db;

-- User cho ứng dụng Node.js (khớp server/.env: DB_USER=nh_app)
CREATE USER IF NOT EXISTS 'nh_app'@'localhost' IDENTIFIED BY 'App@123';
GRANT ALL PRIVILEGES ON nha_hang_db.* TO 'nh_app'@'localhost';
CREATE USER IF NOT EXISTS 'nh_app'@'127.0.0.1' IDENTIFIED BY 'App@123';
GRANT ALL PRIVILEGES ON nha_hang_db.* TO 'nh_app'@'127.0.0.1';

CREATE USER IF NOT EXISTS 'nh_admin'@'localhost' IDENTIFIED BY 'Admin@123';
CREATE USER IF NOT EXISTS 'nh_thungan'@'localhost' IDENTIFIED BY 'ThuNgan@123';
CREATE USER IF NOT EXISTS 'nh_phucvu'@'localhost' IDENTIFIED BY 'PhucVu@123';
CREATE USER IF NOT EXISTS 'nh_bep'@'localhost' IDENTIFIED BY 'Bep@123';
CREATE USER IF NOT EXISTS 'nh_kho'@'localhost' IDENTIFIED BY 'Kho@123';

GRANT ALL PRIVILEGES ON nha_hang_db.* TO 'nh_admin'@'localhost';

GRANT SELECT, INSERT, UPDATE ON nha_hang_db.hoa_don TO 'nh_thungan'@'localhost';
GRANT SELECT, INSERT, UPDATE ON nha_hang_db.chi_tiet_hd TO 'nh_thungan'@'localhost';
GRANT SELECT, INSERT ON nha_hang_db.thanh_toan TO 'nh_thungan'@'localhost';
GRANT SELECT, INSERT, UPDATE ON nha_hang_db.khach_hang TO 'nh_thungan'@'localhost';
GRANT SELECT ON nha_hang_db.vw_mon_ban_chay TO 'nh_thungan'@'localhost';
GRANT EXECUTE ON PROCEDURE nha_hang_db.sp_tao_hoa_don TO 'nh_thungan'@'localhost';
GRANT EXECUTE ON PROCEDURE nha_hang_db.sp_them_mon_hd TO 'nh_thungan'@'localhost';
GRANT EXECUTE ON PROCEDURE nha_hang_db.sp_thanh_toan TO 'nh_thungan'@'localhost';
GRANT EXECUTE ON PROCEDURE nha_hang_db.sp_bao_cao_doanh_thu TO 'nh_thungan'@'localhost';

GRANT SELECT, UPDATE ON nha_hang_db.ban_an TO 'nh_phucvu'@'localhost';
GRANT SELECT, INSERT, UPDATE ON nha_hang_db.hoa_don TO 'nh_phucvu'@'localhost';
GRANT SELECT, INSERT, UPDATE ON nha_hang_db.chi_tiet_hd TO 'nh_phucvu'@'localhost';
GRANT SELECT ON nha_hang_db.mon_an TO 'nh_phucvu'@'localhost';
GRANT SELECT ON nha_hang_db.dat_ban TO 'nh_phucvu'@'localhost';
GRANT EXECUTE ON PROCEDURE nha_hang_db.sp_tao_hoa_don TO 'nh_phucvu'@'localhost';
GRANT EXECUTE ON PROCEDURE nha_hang_db.sp_them_mon_hd TO 'nh_phucvu'@'localhost';

GRANT SELECT, UPDATE ON nha_hang_db.chi_tiet_hd TO 'nh_bep'@'localhost';
GRANT SELECT ON nha_hang_db.hoa_don TO 'nh_bep'@'localhost';
GRANT SELECT ON nha_hang_db.mon_an TO 'nh_bep'@'localhost';

GRANT SELECT, INSERT, UPDATE ON nha_hang_db.nguyen_lieu TO 'nh_kho'@'localhost';
GRANT SELECT, INSERT, UPDATE ON nha_hang_db.phieu_nhap TO 'nh_kho'@'localhost';
GRANT SELECT, INSERT, UPDATE ON nha_hang_db.chi_tiet_pn TO 'nh_kho'@'localhost';
GRANT SELECT, INSERT ON nha_hang_db.phieu_xuat TO 'nh_kho'@'localhost';
GRANT SELECT ON nha_hang_db.vw_ton_kho_canh_bao TO 'nh_kho'@'localhost';
GRANT EXECUTE ON PROCEDURE nha_hang_db.sp_hoan_tat_phieu_nhap TO 'nh_kho'@'localhost';

FLUSH PRIVILEGES;
