# Nhà hàng Golden Taste

Hệ thống quản lý nhà hàng (F&B) — Node.js, MySQL, web SPA.

## Chạy nhanh

```powershell
cd server
npm install
# File .env: DB_NAME=ql_golden_taste
npm run setup-db
npm start
```

Mở http://localhost:3001

**Demo:** Admin `nv001@goldentaste.vn` / `password123` → **Quản trị** → nhập dữ liệu (danh mục, món, bàn…). DB mới chỉ có 1 admin; không còn file SQL điền sẵn.

## CSDL

- Schema MySQL: `database/golden_taste/` — xem `database/README.md`
- Truy vấn mẫu: `docs/TRUY-VAN-MAU.sql`
