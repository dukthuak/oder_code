# Deploy miễn phí (Railway)

Repo GitHub: **https://github.com/dukthuak/oder_code**

## Bước 1 — Railway (5 phút)

1. Vào [railway.app](https://railway.app) → đăng nhập GitHub.
2. **New Project** → **Provision MySQL**.
3. Trong project → **New** → **GitHub Repo** → chọn `oder_code`.
4. Service Web → **Settings**:
   - **Root Directory**: `server`
   - **Start Command**: `npm start` (mặc định)
5. Service Web → **Variables** → **Add variable reference** từ MySQL, hoặc thêm tay:
   ```env
   DATABASE_URL=${{MySQL.MYSQL_URL}}
   ```
   (Tên service MySQL có thể khác — chọn biến `MYSQL_URL` từ MySQL.)
6. Service Web → **Settings** → **Networking** → **Generate Domain**.

## Bước 2 — Import database lên MySQL cloud

Trên máy Windows (PowerShell), trong thư mục `server`:

```powershell
cd d:\ducthuan\pho_ha_noi\server
$env:DATABASE_URL="mysql://USER:PASS@HOST:PORT/railway"
npm run import-cloud-db
```

Copy chuỗi `MYSQL_URL` từ Railway (tab Variables của MySQL).  
Bật **Public Networking** cho MySQL nếu import từ máy local bị từ chối kết nối.

## Bước 3 — Kiểm tra

- `https://TEN-DOMAIN.up.railway.app/api/health` → `{"status":"ok",...}`
- Trang chủ → đăng nhập: `thungan@nhang.com` / `password123`

## Deploy lại sau khi sửa code

```powershell
cd d:\ducthuan\pho_ha_noi
git add .
git commit -m "mo ta thay doi"
git push
```

Railway tự build lại khi push `main`.

## Phương án Render (web free)

1. [render.com](https://render.com) → **New** → **Blueprint** → repo `oder_code`.
2. File `render.yaml` đã có sẵn — cần tạo MySQL (Railway) và dán `DATABASE_URL` vào Render.

## Lưu ý

- Không commit file `server/.env`.
- Gói Railway free có giới hạn credit/tháng.
