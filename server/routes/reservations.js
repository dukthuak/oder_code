const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT maBAN AS ma_ban, tenBAN AS so_ban, viTRI, sucCHUA, trangthaiBAN AS trang_thai
       FROM BAN WHERE trangthaiBAN = 'Đã đặt' ORDER BY tenBAN`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authMiddleware, requireRole('admin', 'thu_ngan', 'phuc_vu'), async (req, res) => {
  const { ma_ban } = req.body;
  try {
    await pool.query(`UPDATE BAN SET trangthaiBAN = 'Đã đặt' WHERE maBAN = ?`, [ma_ban]);
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
