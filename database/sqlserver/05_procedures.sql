USE NhaHangDB;
GO

CREATE OR ALTER PROCEDURE dbo.sp_tao_hoa_don
  @p_ma_ban INT, @p_ma_nv INT, @p_ma_kh INT = NULL, @p_ma_cn INT,
  @p_ma_hd INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO hoa_don (ma_ban, ma_nv, ma_kh, ma_cn, trang_thai)
  VALUES (@p_ma_ban, @p_ma_nv, @p_ma_kh, @p_ma_cn, N'mo');
  SET @p_ma_hd = SCOPE_IDENTITY();
  UPDATE ban_an SET trang_thai = N'dang_dung' WHERE ma_ban = @p_ma_ban;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_them_mon_hd
  @p_ma_hd INT, @p_ma_mon INT, @p_so_luong INT, @p_ghi_chu NVARCHAR(255) = NULL,
  @p_result NVARCHAR(50) OUTPUT
AS
BEGIN
  DECLARE @gia DECIMAL(12,2), @tt NVARCHAR(10);
  SELECT @gia = gia_ban, @tt = trang_thai FROM mon_an WHERE ma_mon = @p_ma_mon;
  IF @gia IS NULL SET @p_result = N'Mon khong ton tai';
  ELSE IF @tt <> N'con' SET @p_result = N'Mon het hang';
  ELSE BEGIN
    INSERT INTO chi_tiet_hd (ma_hd, ma_mon, so_luong, don_gia, ghi_chu)
    VALUES (@p_ma_hd, @p_ma_mon, @p_so_luong, @gia, @p_ghi_chu);
    UPDATE hoa_don SET tong_tien = dbo.fn_tinh_tong_hd(@p_ma_hd),
      trang_thai = CASE WHEN trang_thai = N'mo' THEN N'dang_che_bien' ELSE trang_thai END
    WHERE ma_hd = @p_ma_hd;
    SET @p_result = N'OK';
  END
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_thanh_toan
  @p_ma_hd INT, @p_hinh_thuc NVARCHAR(20), @p_so_tien DECIMAL(14,2), @p_ma_nv INT,
  @p_result NVARCHAR(50) OUTPUT
AS
BEGIN
  DECLARE @tt NVARCHAR(20), @tong DECIMAL(14,2), @giam DECIMAL(14,2), @ma_kh INT, @diem INT;
  SELECT @tt = trang_thai, @tong = tong_tien, @giam = giam_gia, @ma_kh = ma_kh
  FROM hoa_don WHERE ma_hd = @p_ma_hd;
  IF @tt = N'da_thanh_toan' SET @p_result = N'Da thanh toan';
  ELSE BEGIN
    INSERT INTO thanh_toan (ma_hd, hinh_thuc, so_tien, ma_nv)
    VALUES (@p_ma_hd, @p_hinh_thuc, @p_so_tien, @p_ma_nv);
    UPDATE hoa_don SET trang_thai = N'da_thanh_toan' WHERE ma_hd = @p_ma_hd;
    IF @ma_kh IS NOT NULL BEGIN
      SET @diem = FLOOR((@tong - @giam) / 10000);
      UPDATE khach_hang SET diem_tich_luy = diem_tich_luy + @diem,
        hang_thanh_vien = dbo.fn_hang_thanh_vien(diem_tich_luy + @diem)
      WHERE ma_kh = @ma_kh;
    END
    SET @p_result = N'OK';
  END
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_bao_cao_doanh_thu
  @p_tu DATE, @p_den DATE, @p_ma_cn INT = NULL
AS
BEGIN
  SELECT CAST(h.ngay_lap AS DATE) AS ngay,
         COUNT(DISTINCT h.ma_hd) AS so_hd,
         SUM(h.tong_tien - h.giam_gia) AS doanh_thu
  FROM hoa_don h
  WHERE h.trang_thai = N'da_thanh_toan'
    AND CAST(h.ngay_lap AS DATE) BETWEEN @p_tu AND @p_den
    AND (@p_ma_cn IS NULL OR h.ma_cn = @p_ma_cn)
  GROUP BY CAST(h.ngay_lap AS DATE)
  ORDER BY ngay;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ai_du_bao_nhu_cau @p_days INT = 7
AS
BEGIN
  INSERT INTO ai_du_bao (loai, ma_mon, gia_tri, noi_dung)
  SELECT TOP 10 N'nhu_cau_mon', m.ma_mon,
         ROUND(SUM(ct.so_luong) * 1.0 / NULLIF(@p_days, 0) * 1.15, 2),
         N'Du bao AI (heuristic +15%)'
  FROM chi_tiet_hd ct
  JOIN hoa_don h ON ct.ma_hd = h.ma_hd
  JOIN mon_an m ON ct.ma_mon = m.ma_mon
  WHERE h.trang_thai = N'da_thanh_toan'
    AND h.ngay_lap >= DATEADD(DAY, -@p_days, CAST(GETDATE() AS DATE))
  GROUP BY m.ma_mon
  ORDER BY SUM(ct.so_luong) DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ai_phat_hien_bat_thuong
AS
BEGIN
  INSERT INTO ai_du_bao (loai, ma_nl, gia_tri, noi_dung)
  SELECT N'canh_bao_ton', ma_nl, ton_kho,
         CONCAT(N'AI canh bao: ', ten_nl, N' — ', muc_canh_bao)
  FROM vw_ton_kho_canh_bao
  WHERE muc_canh_bao IN (N'het_hang', N'sap_het');
END;
GO
