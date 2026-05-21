const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const menuAdmin = [authMiddleware, requireRole('admin')];
const { mapMonRow } = require('../lib/golden');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.maMON AS ma_mon, m.tenMON AS ten_mon, m.donGIA AS gia_ban, m.donVITINH AS don_vi,
              m.trangthaiMON AS trang_thai, l.maLOAI AS ma_dm, l.tenLOAI AS ten_dm
       FROM MONAN m
       JOIN LOAIMON l ON m.maLOAI = l.maLOAI
       ORDER BY l.tenLOAI, m.tenMON`
    );
    res.json(rows.map(mapMonRow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT maLOAI AS ma_dm, tenLOAI AS ten_dm FROM LOAIMON ORDER BY tenLOAI'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', ...menuAdmin, async (req, res) => {
  const { ma_dm, ten_mon, gia_ban, don_vi, trang_thai } = req.body;
  try {
    const [[{ n }]] = await pool.query(
      `SELECT CONCAT('MA', LPAD(IFNULL(MAX(CAST(SUBSTRING(maMON, 3) AS UNSIGNED)), 0) + 1, 3, '0')) AS n FROM MONAN`
    );
    await pool.query(
      `INSERT INTO MONAN (maMON, tenMON, donGIA, donVITINH, trangthaiMON, maLOAI)
       VALUES (?,?,?,?,?,?)`,
      [n, ten_mon, gia_ban, don_vi || 'Phần', trang_thai || 'Sẵn có', ma_dm]
    );
    res.status(201).json({ ma_mon: n });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/status', ...menuAdmin, async (req, res) => {
  const statusMap = { con: 'Sẵn có', het: 'Hết hàng', ngung: 'Ngừng bán' };
  const trang_thai = statusMap[req.body.trang_thai] || req.body.trang_thai;
  try {
    await pool.query('UPDATE MONAN SET trangthaiMON = ? WHERE maMON = ?', [trang_thai, req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
