# Hệ thống CSDL Quản lý Kinh doanh Dịch vụ Ăn uống – Nhà hàng

## 1. Phạm vi bài toán

Quản lý toàn bộ hoạt động kinh doanh F&B của một nhà hàng (có thể nhiều chi nhánh): thực đơn, bàn/đặt chỗ, gọi món – thanh toán, kho nguyên liệu, nhân sự, khách hàng và báo cáo.

## 2. Các chức năng chính

| Mã | Chức năng | Mô tả |
|----|-----------|--------|
| F01 | Quản lý chi nhánh | CRUD chi nhánh, giờ mở cửa, trạng thái |
| F02 | Quản lý nhân viên & phân quyền | Nhân viên, vai trò (admin, thu ngân, bếp, phục vụ), đăng nhập |
| F03 | Quản lý thực đơn | Danh mục, món ăn, giá, trạng thái còn/bán |
| F04 | Công thức & nguyên liệu | Định mức nguyên liệu/món, liên kết kho |
| F05 | Quản lý bàn | Bàn theo chi nhánh, trạng thái trống/đang dùng/đặt trước |
| F06 | Đặt bàn | Khách đặt trước, xác nhận/hủy |
| F07 | Gọi món (Order) | Tạo hóa đơn, chi tiết món, trạng thái chế biến |
| F08 | Thanh toán | Tiền mặt/chuyển khoản/QR, hóa đơn |
| F09 | Quản lý kho | Nhập – xuất – tồn, cảnh báo tồn thấp |
| F10 | Nhà cung cấp & phiếu nhập | Đơn mua nguyên liệu |
| F11 | Khách hàng & tích điểm | Thông tin KH, hạng, điểm tích lũy |
| F12 | Đánh giá | Rating món/dịch vụ |
| F13 | Báo cáo | Doanh thu, món bán chạy, tồn kho |
| F14 | AI hỗ trợ | Gợi ý món, dự báo nhu cầu, phát hiện bất thường tồn kho |

## 3. Tác nhân

- **Quản trị (Admin)**: toàn quyền CSDL và cấu hình.
- **Thu ngân (Cashier)**: order, thanh toán, khách hàng.
- **Phục vụ (Waiter)**: bàn, order, trạng thái món.
- **Bếp (Kitchen)**: xem order, cập nhật trạng thái chế biến.
- **Kho (Inventory)**: nhập/xuất, nhà cung cấp.

## 4. Luồng nghiệp vụ cốt lõi

```
Khách đặt bàn (tuỳ chọn) → Nhân viên mở bàn → Gọi món → Bếp chế biến
→ Phục vụ phục vụ → Thu ngân thanh toán → Trừ kho theo công thức → Cộng điểm KH
```
