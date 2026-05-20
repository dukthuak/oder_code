# Deploy miễn phí: Render + TiDB (thay Railway)

## Phần A — TiDB Cloud (MySQL free)

1. Đăng ký [https://tidbcloud.com](https://tidbcloud.com) (Google/GitHub).
2. **Create Cluster** → chọn **Serverless** (Free).
3. Sau khi cluster sẵn sàng → **Connect** → chọn **General**.
4. Copy connection string dạng:
   ```text
   mysql://USER:PASSWORD@gateway01.xxx.prod.aws.tidbcloud.com:4000/DATABASE?ssl-mode=REQUIRED
   ```
5. Trên máy (PowerShell):

```powershell
cd d:\ducthuan\pho_ha_noi\server
$env:DATABASE_URL="mysql://..."   # dán chuỗi TiDB
$env:DB_SSL="true"
npm run import-cloud-db
```

Đăng nhập web sau import: `thungan@nhang.com` / `password123`

---

## Phần B — Render (Web Node free)

1. [https://dashboard.render.com](https://dashboard.render.com) → đăng ký.
2. **New +** → **Blueprint** → kết nối GitHub → repo **oder_code**.
3. Render đọc file `render.yaml` ở thư mục gốc repo.
4. Khi hỏi biến môi trường → dán **DATABASE_URL** (chuỗi TiDB ở trên).
5. **Apply** → đợi deploy (5–10 phút).
6. URL: `https://pho-ha-noi.onrender.com` (hoặc tên Render gán).

**Lưu ý gói free:** app **ngủ** sau ~15 phút không truy cập; lần mở đầu chờ 30–60 giây.

---

## Phần C — Demo nhanh (không cần Render/TiDB)

Máy bạn bật MySQL + chạy script tunnel (URL public tạm thời):

```powershell
cd d:\ducthuan\pho_ha_noi
.\scripts\tunnel-public.ps1
```

Máy tắt → web tắt.

---

## Cập nhật code

```powershell
git add .
git commit -m "cap nhat"
git push
```

Render tự deploy lại từ GitHub.
