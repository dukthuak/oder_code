# Hướng dẫn cài đặt trên SQL Server

## Yêu cầu

- SQL Server 2019+ hoặc SQL Server Express
- SQL Server Management Studio (SSMS)

## Các bước

1. Mở **SSMS**, kết nối `localhost` (Windows Authentication hoặc sa).
2. **File → Open → File**, mở lần lượt trong `database/sqlserver/`:
   - `00_create_database.sql`
   - `01_schema.sql`
   - `02_seed.sql`
   - `03_views.sql`
   - `04_functions.sql`
   - `05_procedures.sql`
   - `06_triggers.sql`
   - `07_permissions.sql`
3. Mỗi file: chọn toàn bộ → **Execute** (F5).

Hoặc dùng **sqlcmd** (từ thư mục `database/sqlserver`):

```powershell
sqlcmd -S localhost -E -i 00_create_database.sql
sqlcmd -S localhost -E -d NhaHangDB -i 01_schema.sql
# ... tiếp tục các file
```

## Kiểm tra

```sql
USE NhaHangDB;
SELECT * FROM vw_mon_ban_chay;
EXEC dbo.sp_bao_cao_doanh_thu @p_tu='2025-01-01', @p_den='2026-12-31', @p_ma_cn=NULL;
EXEC dbo.sp_ai_du_bao_nhu_cau @p_days = 7;
SELECT * FROM ai_du_bao ORDER BY ngay_tao DESC;
```

## Phân quyền mẫu

| Login | User DB | Quyền |
|-------|---------|--------|
| nh_login_admin | nh_admin | db_owner |
| nh_login_thungan | nh_thungan | SELECT/INSERT/UPDATE hóa đơn, EXEC SP thanh toán |

## Ứng dụng web

Ứng dụng Node.js trong `server/` dùng **MySQL**. SQL Server phục vụ phần báo cáo/bài tập; có thể nối sau bằng driver `mssql` nếu cần.
