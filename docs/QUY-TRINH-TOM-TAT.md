# Quy trình làm web Phở Hà Nội — Tóm tắt

**Repo:** https://github.com/dukthuak/oder_code

---

## Hệ thống gồm gì?

| Phần | Thư mục | Công nghệ |
|------|---------|-----------|
| Giao diện | `public/` | HTML, CSS, JS |
| API | `server/` | Node.js + Express |
| Database | `database/` | MySQL `nha_hang_db` |

Trình duyệt → API `/api/*` → MySQL.

---

## Làm trên máy (5 bước)

```powershell
cd d:\ducthuan\pho_ha_noi\server
npm install
# Tạo server/.env từ .env.example, điền mật khẩu MySQL
npm run setup-db
npm start
```

Mở: **http://localhost:3001**  
Đăng nhập: `thungan@nhang.com` / `password123`

---

## Ra link Internet

### Nhanh (URL tạm, máy phải bật)

```powershell
cd d:\ducthuan\pho_ha_noi
.\scripts\tunnel-public.ps1
```

→ Copy URL `https://....trycloudflare.com` (không đổi tên được).

### Ổn định (URL cố định, không cần máy bật)

1. **TiDB Cloud** (free) → copy `DATABASE_URL`
2. `cd server` → `$env:DATABASE_URL="mysql://..."` → `npm run import-cloud-db`
3. **Render** → Blueprint → repo `oder_code` → dán `DATABASE_URL`
4. URL: `https://pho-ha-noi.onrender.com` (đổi tên: sửa `name:` trong `render.yaml`)

Chi tiết tunnel: `HUONG_DAN_DEPLOY_TRYCLOUDFLARE.md` · Render: `HUONG_DAN_DEPLOY_RENDER_TIDB.md`

---

## Đổi tên link `phohanoi`

| Cách | Được? |
|------|-------|
| trycloudflare | Không |
| Render: `name: phohanoi` | Có → `phohanoi.onrender.com` |
| Domain riêng + Cloudflare | Có |

---

## Kiểm tra

`GET /api/health` → `{"status":"ok","service":"nha-hang-api"}`

---

## Tài khoản demo

| Email | Mật khẩu |
|-------|-----------|
| admin@nhang.com | password123 |
| thungan@nhang.com | password123 |

---

## Tải tài liệu

| File | Link tải |
|------|----------|
| **Tóm tắt (file này)** | https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/QUY-TRINH-TOM-TAT.md |
| Đầy đủ | https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/QUY-TRINH-LAM-WEB-PHO-HA-NOI.md |
| Mục lục docs | https://github.com/dukthuak/oder_code/tree/main/docs |
