const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const reportRoles = [authMiddleware, requireRole('admin', 'thu_ngan')];
const { mapHdRow } = require('../lib/golden');

const router = express.Router();

router.get('/revenue', ...reportRoles, async (req, res) => {
  const tu = req.query.tu || new Date().toISOString().slice(0, 10);
  const den = req.query.den || tu;
  try {
    const [rows] = await pool.query(
      `SELECT DATE(ngayLAP) AS ngay, SUM(tongTIEN) AS doanh_thu, COUNT(*) AS so_hd
       FROM HOADON
       WHERE trangthaiHD = 'Đã thanh toán' AND DATE(ngayLAP) BETWEEN ? AND ?
       GROUP BY DATE(ngayLAP) ORDER BY ngay`,
      [tu, den]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/top-dishes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_mon_ban_chay LIMIT 10');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/branches', async (req, res) => {
  res.json([{ ma_cn: 1, ten_cn: 'Golden Taste', dia_chi: 'Nhà hàng Golden Taste' }]);
});

router.get(
  '/dashboard',
  authMiddleware,
  requireRole('admin', 'thu_ngan', 'phuc_vu', 'bep', 'kho'),
  async (req, res) => {
    try {
      const [[revToday]] = await pool.query(
        `SELECT IFNULL(SUM(tongTIEN), 0) AS doanh_thu, COUNT(*) AS so_hd
         FROM HOADON WHERE trangthaiHD = 'Đã thanh toán' AND DATE(ngayLAP) = CURDATE()`
      );
      const [[openOrders]] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM HOADON WHERE trangthaiHD = 'Chưa thanh toán'`
      );
      const [[tables]] = await pool.query(
        `SELECT
           SUM(trangthaiBAN = 'Có khách') AS dang_dung,
           SUM(trangthaiBAN = 'Đã đặt') AS dat_truoc,
           SUM(trangthaiBAN = 'Trống') AS trong
         FROM BAN`
      );
      const [[kitchen]] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM CHITIET_HD ct
         JOIN HOADON h ON ct.maHD = h.maHD
         WHERE ct.trangthaiQT IN ('Chờ cung ứng', 'Đang chế biến')
           AND h.trangthaiHD = 'Chưa thanh toán'`
      );
      const [recent] = await pool.query(
        `SELECT h.maHD AS ma_hd, h.tongTIEN AS tong_tien, 0 AS giam_gia, h.ngayLAP AS ngay_lap,
                h.trangthaiHD AS trang_thai, b.tenBAN AS so_ban, kh.tenKH AS ten_khach
         FROM HOADON h
         LEFT JOIN BAN b ON h.maBAN = b.maBAN
         LEFT JOIN KHACHHANG kh ON h.maKH = kh.maKH
         ORDER BY h.ngayLAP DESC LIMIT 8`
      );
      const [topKh] = await pool.query(
        `SELECT tenKH AS ho_ten, diemTICHLUY AS diem_tich_luy,
                CASE WHEN diemTICHLUY >= 400 THEN 'bach_kim' WHEN diemTICHLUY >= 200 THEN 'vang' ELSE 'dong' END AS hang_thanh_vien
         FROM KHACHHANG ORDER BY diemTICHLUY DESC LIMIT 5`
      );
      res.json({
        doanh_thu_hom_nay: Number(revToday.doanh_thu),
        so_hd_hom_nay: revToday.so_hd,
        order_dang_mo: openOrders.cnt,
        ban_dang_dung: tables.dang_dung,
        ban_dat_truoc: tables.dat_truoc,
        ban_trong: tables.trong,
        mon_bep_cho: kitchen.cnt,
        gan_day: recent.map(mapHdRow),
        khach_vip: topKh,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.get('/inventory-alerts', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM vw_ton_kho_canh_bao ORDER BY ton_kho ASC LIMIT 20`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
