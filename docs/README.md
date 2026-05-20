# Tài liệu dự án — Phở Hà Nội

Thư mục chứa toàn bộ tài liệu hướng dẫn. Bạn có thể **tải về** từng file qua link bên dưới hoặc copy từ máy: `d:\ducthuan\pho_ha_noi\docs\`

**Repo:** https://github.com/dukthuak/oder_code

---

## Tài liệu chính — Quy trình làm web

| Tài liệu | Mô tả | Tải về (GitHub) |
|----------|--------|-----------------|
| **[QUY-TRINH-TOM-TAT.md](QUY-TRINH-TOM-TAT.md)** | **Tóm tắt** — chỉ phần quan trọng | [Tải .md](https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/QUY-TRINH-TOM-TAT.md) |
| [QUY-TRINH-LAM-WEB-PHO-HA-NOI.md](QUY-TRINH-LAM-WEB-PHO-HA-NOI.md) | Đầy đủ (chi tiết từng bước) | [Tải .md](https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/QUY-TRINH-LAM-WEB-PHO-HA-NOI.md) |

**Xem trên GitHub:** [docs/QUY-TRINH-LAM-WEB-PHO-HA-NOI.md](https://github.com/dukthuak/oder_code/blob/main/docs/QUY-TRINH-LAM-WEB-PHO-HA-NOI.md)

---

## Deploy & vận hành

| Tài liệu | Tải về |
|----------|--------|
| [HUONG_DAN_DEPLOY_RENDER_TIDB.md](HUONG_DAN_DEPLOY_RENDER_TIDB.md) — Render + TiDB (thay Railway) | [raw](https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/HUONG_DAN_DEPLOY_RENDER_TIDB.md) |
| [HUONG_DAN_DEPLOY.md](HUONG_DAN_DEPLOY.md) — Railway | [raw](https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/HUONG_DAN_DEPLOY.md) |
| [HUONG_DAN_KET_NOI_MYSQL.md](HUONG_DAN_KET_NOI_MYSQL.md) — MySQL & chạy local | [raw](https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/HUONG_DAN_KET_NOI_MYSQL.md) |
| [HUONG_DAN_MYSQL.md](HUONG_DAN_MYSQL.md) | [raw](https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/HUONG_DAN_MYSQL.md) |

---

## Nghiệp vụ & kỹ thuật

| Tài liệu | Tải về |
|----------|--------|
| [TAI-LIEU-HE-THONG.md](TAI-LIEU-HE-THONG.md) — Chức năng, bảng CSDL | [raw](https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/TAI-LIEU-HE-THONG.md) |
| [TAI-LIEU-CHUC-NANG-WEB.md](TAI-LIEU-CHUC-NANG-WEB.md) — Màn hình & API web | [raw](https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/TAI-LIEU-CHUC-NANG-WEB.md) |
| [MO-TA-CHUC-NANG.md](MO-TA-CHUC-NANG.md) — Phạm vi F01–F14 | [raw](https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/MO-TA-CHUC-NANG.md) |
| [MO-HINH-QUAN-HE.md](MO-HINH-QUAN-HE.md) | [raw](https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/MO-HINH-QUAN-HE.md) |
| [BAI_TAP_GIAI_THICH.md](BAI_TAP_GIAI_THICH.md) | [raw](https://raw.githubusercontent.com/dukthuak/oder_code/main/docs/BAI_TAP_GIAI_THICH.md) |

---

## Cách tải về máy

1. **Một file:** bấm link **raw** ở trên → trình duyệt mở nội dung → `Ctrl + S` lưu file `.md`.
2. **Cả thư mục:** trên GitHub vào [github.com/dukthuak/oder_code/tree/main/docs](https://github.com/dukthuak/oder_code/tree/main/docs) → nút **Download ZIP** (tải cả repo) hoặc dùng Git: `git clone https://github.com/dukthuak/oder_code.git`.
3. **In PDF:** mở file `.md` trong Word / VS Code / Typora → **In** → **Microsoft Print to PDF**.

---

## Script hỗ trợ (không nằm trong docs/)

| Script | Mục đích |
|--------|----------|
| `scripts/tunnel-public.ps1` | Mở link web public tạm (Cloudflare) |
| `scripts/setup-render-tidb.ps1` | Import DB lên TiDB Cloud |
