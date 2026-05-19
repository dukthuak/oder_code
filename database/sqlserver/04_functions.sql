USE NhaHangDB;
GO

CREATE OR ALTER FUNCTION dbo.fn_tinh_tong_hd (@p_ma_hd INT)
RETURNS DECIMAL(14,2)
AS
BEGIN
  DECLARE @v DECIMAL(14,2);
  SELECT @v = ISNULL(SUM(so_luong * don_gia), 0)
  FROM chi_tiet_hd
  WHERE ma_hd = @p_ma_hd AND trang_thai_mon <> N'huy';
  RETURN @v;
END;
GO

CREATE OR ALTER FUNCTION dbo.fn_hang_thanh_vien (@p_diem INT)
RETURNS NVARCHAR(20)
AS
BEGIN
  IF @p_diem >= 5000 RETURN N'bach_kim';
  IF @p_diem >= 2000 RETURN N'vang';
  IF @p_diem >= 500 RETURN N'bac';
  RETURN N'dong';
END;
GO
