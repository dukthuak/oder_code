const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const ma_cn = req.query.ma_cn;
  try {
    let sql = 'SELECT b.*, cn.ten_cn FROM ban_an b JOIN chi_nhanh cn ON b.ma_cn = cn.ma_cn';
    const params = [];
    if (ma_cn) {
      sql += ' WHERE b.ma_cn = ?';
      params.push(ma_cn);
    }
    sql += ' ORDER BY b.ma_cn, b.so_ban';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/serving', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_ban_dang_phuc_vu');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
