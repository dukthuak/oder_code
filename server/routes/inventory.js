const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM nguyen_lieu ORDER BY ten_nl');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_ton_kho_canh_bao');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/import', authMiddleware, async (req, res) => {
  const { ma_ncc, chi_tiet } = req.body;
  const ma_nv = req.user.ma_nv;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO phieu_nhap (ma_ncc, ma_nv) VALUES (?,?)',
      [ma_ncc, ma_nv]
    );
    const ma_pn = r.insertId;
    for (const item of chi_tiet) {
      await conn.query(
        'INSERT INTO chi_tiet_pn (ma_pn, ma_nl, so_luong, don_gia) VALUES (?,?,?,?)',
        [ma_pn, item.ma_nl, item.so_luong, item.don_gia]
      );
    }
    await conn.query('CALL sp_hoan_tat_phieu_nhap(?)', [ma_pn]);
    await conn.commit();
    res.status(201).json({ ma_pn });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
