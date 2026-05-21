# Database — Golden Taste (MySQL)

Ứng dụng web dùng **một bộ schema** trong thư mục `golden_taste/`:

| File | Nội dung |
|------|----------|
| `01_schema.sql` | Tạo DB `ql_golden_taste`, bảng |
| `02_views.sql` | View báo cáo |
| `03_seed.sql` | Dữ liệu mẫu (món, bàn, NV, khách…) |
| `04_chuc_nang_seed.sql` | Mô tả chức năng web |
| `05_demo_full.sql` | Order, bếp, báo cáo demo |

Cài đặt local (từ thư mục `server`):

```bash
npm run setup-db
```

Sau `setup-db` database **gần như trống** (chỉ 1 tài khoản admin). Mọi món, bàn, chức năng… **nhập trên web** → menu **Quản trị**.

Tuỳ chọn nạp mẫu nhanh: `npm run seed-demo`

Nguồn thiết kế gốc: `docs/QL_cuahanggoldentaste.sql`
