# Đổi tên thư mục dự án → Nhà hàng Golden Taste

Cursor đang mở folder `pho_ha_noi` nên **không đổi tên được khi IDE đang chạy**.

## Cách đổi (1 lần)

1. **Đóng Cursor** (hoặc File → Close Folder).
2. Mở PowerShell:

```powershell
Rename-Item -Path "d:\ducthuan\pho_ha_noi" -NewName "Nha_hang_Golden_Taste"
```

3. Mở lại project: `d:\ducthuan\Nha_hang_Golden_Taste`

Tên hiển thị trên web: **Nhà hàng Golden Taste** (đã cập nhật trong code).
