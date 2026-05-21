const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { mapBanRow } = require('../lib/golden');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT maBAN AS ma_ban, tenBAN AS so_ban, viTRI AS vi_tri, sucCHUA AS suc_chua,
              trangthaiBAN AS trang_thai, 'Golden Taste' AS ten_cn, 1 AS ma_cn
       FROM BAN ORDER BY viTRI, tenBAN`
    );
    res.json(rows.map(mapBanRow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/serving', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_ban_dang_phuc_vu');
    res.json(rows.map(mapBanRow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
