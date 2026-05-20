const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const reservationRoles = [authMiddleware, requireRole('admin', 'thu_ngan', 'phuc_vu')];

const router = express.Router();

router.get('/', ...reservationRoles, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, kh.ho_ten, b.so_ban, cn.ten_cn
       FROM dat_ban d
       LEFT JOIN khach_hang kh ON d.ma_kh = kh.ma_kh
       JOIN ban_an b ON d.ma_ban = b.ma_ban
       JOIN chi_nhanh cn ON d.ma_cn = cn.ma_cn
       ORDER BY d.ngay_gio DESC LIMIT 50`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', ...reservationRoles, async (req, res) => {
  const { ma_kh, ma_ban, ma_cn, ngay_gio, so_nguoi, ghi_chu } = req.body;
  try {
    const [r] = await pool.query(
      `INSERT INTO dat_ban (ma_kh, ma_ban, ma_cn, ngay_gio, so_nguoi, ghi_chu)
       VALUES (?,?,?,?,?,?)`,
      [ma_kh, ma_ban, ma_cn, ngay_gio, so_nguoi, ghi_chu]
    );
    res.status(201).json({ ma_dat: r.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/status', ...reservationRoles, async (req, res) => {
  const { trang_thai } = req.body;
  try {
    await pool.query('UPDATE dat_ban SET trang_thai = ? WHERE ma_dat = ?', [
      trang_thai,
      req.params.id,
    ]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
