const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/revenue', authMiddleware, async (req, res) => {
  const tu = req.query.tu || new Date().toISOString().slice(0, 10);
  const den = req.query.den || tu;
  const ma_cn = req.query.ma_cn || null;
  try {
    const [rows] = await pool.query('CALL sp_bao_cao_doanh_thu(?, ?, ?)', [tu, den, ma_cn]);
    res.json(rows[0] || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/top-dishes', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vw_mon_ban_chay ORDER BY tong_sl DESC LIMIT 10'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/branches', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM chi_nhanh');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/dashboard', authMiddleware, async (req, res) => {
  const ma_cn = req.query.ma_cn || null;
  const cnFilter = ma_cn ? ' AND h.ma_cn = ?' : '';
  const params = ma_cn ? [ma_cn] : [];
  try {
    const [[revToday]] = await pool.query(
      `SELECT IFNULL(SUM(h.tong_tien - h.giam_gia), 0) AS doanh_thu,
              COUNT(*) AS so_hd
       FROM hoa_don h
       WHERE h.trang_thai = 'da_thanh_toan'
         AND DATE(h.ngay_lap) = CURDATE()${cnFilter}`,
      params
    );
    const [[openOrders]] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM hoa_don h
       WHERE h.trang_thai IN ('mo','dang_che_bien','cho_thanh_toan')${cnFilter}`,
      params
    );
    const [[tables]] = await pool.query(
      `SELECT
         SUM(trang_thai = 'dang_dung') AS dang_dung,
         SUM(trang_thai = 'dat_truoc') AS dat_truoc,
         SUM(trang_thai = 'trong') AS trong
       FROM ban_an WHERE 1=1${ma_cn ? ' AND ma_cn = ?' : ''}`,
      ma_cn ? [ma_cn] : []
    );
    const [[kitchen]] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM chi_tiet_hd ct
       JOIN hoa_don h ON ct.ma_hd = h.ma_hd
       WHERE ct.trang_thai_mon IN ('cho','dang_nau')
         AND h.trang_thai IN ('mo','dang_che_bien','cho_thanh_toan')${cnFilter}`,
      params
    );
    const [recent] = await pool.query(
      `SELECT h.ma_hd, h.tong_tien, h.giam_gia, h.ngay_lap, h.trang_thai,
              b.so_ban, kh.ho_ten AS ten_khach
       FROM hoa_don h
       LEFT JOIN ban_an b ON h.ma_ban = b.ma_ban
       LEFT JOIN khach_hang kh ON h.ma_kh = kh.ma_kh
       WHERE 1=1${cnFilter}
       ORDER BY h.ngay_lap DESC LIMIT 8`,
      params
    );
    const [topKh] = await pool.query(
      `SELECT ho_ten, diem_tich_luy, hang_thanh_vien FROM khach_hang
       WHERE ma_kh > 1 ORDER BY diem_tich_luy DESC LIMIT 5`
    );
    res.json({
      doanh_thu_hom_nay: Number(revToday.doanh_thu),
      so_hd_hom_nay: revToday.so_hd,
      order_dang_mo: openOrders.cnt,
      ban_dang_dung: tables.dang_dung,
      ban_dat_truoc: tables.dat_truoc,
      ban_trong: tables.trong,
      mon_bep_cho: kitchen.cnt,
      gan_day: recent,
      khach_vip: topKh,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/customers', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM khach_hang ORDER BY diem_tich_luy DESC LIMIT 100'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
