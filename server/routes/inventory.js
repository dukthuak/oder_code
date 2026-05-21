const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const khoRoles = [authMiddleware, requireRole('admin', 'kho')];

const router = express.Router();

function mapAlertRow(r) {
  const muc =
    r.trang_thai === 'Cần nhập gấp'
      ? 'het_hang'
      : r.trang_thai === 'Sắp hết'
        ? 'sap_het'
        : 'on_dinh';
  return { ...r, muc_canh_bao: muc };
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT maNL AS ma_nl, tenNL AS ten_nl, slTON AS ton_kho, donVITINH AS don_vi,
              NULL AS ton_toi_thieu
       FROM NGUYENLIEU ORDER BY tenNL`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_ton_kho_canh_bao');
    res.json(rows.map(mapAlertRow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/import', ...khoRoles, async (req, res) => {
  const { ma_nl, so_luong } = req.body;
  if (!ma_nl || !so_luong) {
    return res.status(400).json({ error: 'Cần ma_nl và so_luong' });
  }
  try {
    await pool.query('UPDATE NGUYENLIEU SET slTON = slTON + ? WHERE maNL = ?', [
      so_luong,
      ma_nl,
    ]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
