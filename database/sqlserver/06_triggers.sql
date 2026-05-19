USE NhaHangDB;
GO

CREATE OR ALTER TRIGGER trg_cthd_tong_tien
ON chi_tiet_hd
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE h
  SET tong_tien = dbo.fn_tinh_tong_hd(h.ma_hd)
  FROM hoa_don h
  WHERE h.ma_hd IN (
    SELECT ma_hd FROM inserted
    UNION SELECT ma_hd FROM deleted
  );
END;
GO

CREATE OR ALTER TRIGGER trg_hd_thanh_toan
ON hoa_don
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT UPDATE(trang_thai) RETURN;

  UPDATE nl SET ton_kho = CASE WHEN nl.ton_kho - x.can_tru < 0 THEN 0 ELSE nl.ton_kho - x.can_tru END
  FROM nguyen_lieu nl
  JOIN (
    SELECT i.ma_hd, ct.ma_nl, SUM(ct.so_luong * cthd.so_luong) AS can_tru
    FROM inserted i
    JOIN chi_tiet_hd cthd ON i.ma_hd = cthd.ma_hd AND cthd.trang_thai_mon <> N'huy'
    JOIN cong_thuc ct ON cthd.ma_mon = ct.ma_mon
    JOIN deleted d ON i.ma_hd = d.ma_hd
    WHERE i.trang_thai = N'da_thanh_toan' AND d.trang_thai <> N'da_thanh_toan'
    GROUP BY i.ma_hd, ct.ma_nl
  ) x ON nl.ma_nl = x.ma_nl;

  UPDATE b SET trang_thai = N'trong'
  FROM ban_an b
  JOIN inserted i ON b.ma_ban = i.ma_ban
  JOIN deleted d ON i.ma_hd = d.ma_hd
  WHERE i.trang_thai = N'da_thanh_toan' AND d.trang_thai <> N'da_thanh_toan';
END;
GO
