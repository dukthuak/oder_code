const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const menuAdmin = [authMiddleware, requireRole('admin')];

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, dm.ten_dm FROM mon_an m
       JOIN danh_muc dm ON m.ma_dm = dm.ma_dm
       ORDER BY dm.ten_dm, m.ten_mon`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM danh_muc ORDER BY ten_dm');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', ...menuAdmin, async (req, res) => {
  const { ma_dm, ten_mon, gia_ban, mo_ta, don_vi } = req.body;
  try {
    const [r] = await pool.query(
      'INSERT INTO mon_an (ma_dm, ten_mon, gia_ban, mo_ta, don_vi) VALUES (?,?,?,?,?)',
      [ma_dm, ten_mon, gia_ban, mo_ta || null, don_vi || 'phần']
    );
    res.status(201).json({ ma_mon: r.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/status', ...menuAdmin, async (req, res) => {
  const { trang_thai } = req.body;
  try {
    await pool.query('UPDATE mon_an SET trang_thai = ? WHERE ma_mon = ?', [trang_thai, req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
