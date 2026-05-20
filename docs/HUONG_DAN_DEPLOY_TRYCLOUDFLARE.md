# Hướng dẫn deploy lên trycloudflare.com

**Dự án:** Phở Hà Nội — Quản lý F&B  
**Repo:** https://github.com/dukthuak/oder_code  

Deploy **miễn phí**, **không cần** Railway / Render / TiDB. Web chạy trên **máy bạn** + MySQL **local**; Cloudflare tạo link public `https://xxxx.trycloudflare.com`.

---

## 1. Yêu cầu

- Windows 10/11
- [Node.js](https://nodejs.org/) 18+
- MySQL Server đang chạy (cổng 3306)
- File `server/.env` (copy từ `server/.env.example`)

---

## 2. Chuẩn bị (lần đầu)

```powershell
cd d:\ducthuan\pho_ha_noi\server
npm install
```

Tạo / sửa `server/.env`:

```env
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=nh_app
DB_PASSWORD=App@123
DB_NAME=nha_hang_db
```

Tạo database + dữ liệu mẫu:

```powershell
npm run setup-db
```

---

## 3. Deploy — một lệnh (khuyến nghị)

Mở **PowerShell**:

```powershell
cd d:\ducthuan\pho_ha_noi
.\scripts\tunnel-public.ps1
```

Script tự:

1. Tải `cloudflared` vào `scripts/bin/` (lần đầu)
2. Kiểm tra kết nối MySQL
3. Chạy `npm start` (port theo `.env`)
4. Mở tunnel → in URL ra màn hình

**Copy URL** dạng:

```text
https://ten-ngau-nhien.trycloudflare.com
```

Mở trên trình duyệt hoặc gửi cho người khác.

**Dừng web:** nhấn `Ctrl + C` trong cửa sổ PowerShell.

---

## 4. Deploy — làm tay (2 cửa sổ)

### Cửa sổ 1 — Server

```powershell
cd d:\ducthuan\pho_ha_noi\server
npm start
```

Đợi dòng: `Server: http://localhost:3001`

### Cửa sổ 2 — Tunnel

```powershell
d:\ducthuan\pho_ha_noi\scripts\bin\cloudflared.exe tunnel --url http://127.0.0.1:3001
```

(Đổi `3001` nếu `PORT` trong `.env` khác.)

Trong log, tìm dòng có **`trycloudflare.com`** → đó là link public.

---

## 5. Kiểm tra

| Kiểm tra | URL |
|----------|-----|
| API | `https://YOUR-URL.trycloudflare.com/api/health` |
| Giao diện | `https://YOUR-URL.trycloudflare.com/` |

Kết quả API đúng:

```json
{"status":"ok","service":"nha-hang-api"}
```

**Đăng nhập demo:**

| Email | Mật khẩu |
|-------|-----------|
| thungan@nhang.com | password123 |
| admin@nhang.com | password123 |

---

## 6. Lưu ý

| Nội dung | Chi tiết |
|----------|----------|
| URL | Mỗi lần chạy lại tunnel thường **đổi** (tên random) |
| Đổi tên `phohanoi` | **Không** được với trycloudflare |
| Máy tắt | Web **không** truy cập được |
| MySQL | Phải chạy trên **cùng máy** với server |
| Mục đích | Demo / chia sẻ tạm — không thay hosting production |

---

## 7. Xử lý lỗi

| Triệu chứng | Cách sửa |
|-------------|----------|
| `MySQL chua ket noi` | Bật MySQL Service; kiểm tra `server/.env` |
| `EADDRINUSE` port 3001 | Đã có server chạy — chỉ chạy tunnel, hoặc tắt process cũ |
| Script không chạy | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Trang lỗi 502 | Kiểm tra `http://localhost:3001` trước; đợi vài giây rồi refresh |
| Chưa có cloudflared | Chạy lại `tunnel-public.ps1` (tự tải) |

---

## 8. So sánh với Render

| | trycloudflare | Render + TiDB |
|--|---------------|---------------|
| Đăng ký cloud | Không | Có |
| Máy phải bật | Có | Không |
| URL cố định | Không | Có (gần) |

Hướng dẫn Render: [HUONG_DAN_DEPLOY_RENDER_TIDB.md](HUONG_DAN_DEPLOY_RENDER_TIDB.md)

---

## 9. Link tải tài liệu

| | Link |
|--|------|
| **Tải file .md (Ctrl+S)** | https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/HUONG_DAN_DEPLOY_TRYCLOUDFLARE.md |
| Xem trên GitHub | https://github.com/dukthuak/oder_code/blob/main/docs/HUONG_DAN_DEPLOY_TRYCLOUDFLARE.md |
| Trên máy local | `d:\ducthuan\pho_ha_noi\docs\HUONG_DAN_DEPLOY_TRYCLOUDFLARE.md |
| Mục lục tất cả docs | https://github.com/dukthuak/oder_code/tree/main/docs |

---

*Tài liệu thuộc dự án Phở Hà Nội.*
