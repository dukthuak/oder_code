USE NhaHangDB;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'nh_login_admin')
  CREATE LOGIN nh_login_admin WITH PASSWORD = N'Admin@123', CHECK_POLICY = OFF;
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'nh_login_thungan')
  CREATE LOGIN nh_login_thungan WITH PASSWORD = N'ThuNgan@123', CHECK_POLICY = OFF;
GO

USE NhaHangDB;
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'nh_admin')
  CREATE USER nh_admin FOR LOGIN nh_login_admin;
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'nh_thungan')
  CREATE USER nh_thungan FOR LOGIN nh_login_thungan;

ALTER ROLE db_owner ADD MEMBER nh_admin;

GRANT SELECT, INSERT, UPDATE ON dbo.hoa_don TO nh_thungan;
GRANT SELECT, INSERT, UPDATE ON dbo.chi_tiet_hd TO nh_thungan;
GRANT SELECT, INSERT ON dbo.thanh_toan TO nh_thungan;
GRANT SELECT ON dbo.vw_mon_ban_chay TO nh_thungan;
GRANT EXECUTE ON dbo.sp_tao_hoa_don TO nh_thungan;
GRANT EXECUTE ON dbo.sp_them_mon_hd TO nh_thungan;
GRANT EXECUTE ON dbo.sp_thanh_toan TO nh_thungan;
GRANT EXECUTE ON dbo.sp_bao_cao_doanh_thu TO nh_thungan;
GO
