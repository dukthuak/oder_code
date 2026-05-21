const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { mapRole, ROLE_TO_CHUC_VU } = require('../lib/golden');

const router = express.Router();

router.get('/staff', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT maNV AS ma_nv, hotenNV AS ho_ten, emailNV AS email, SDT AS sdt,
              chucVU, chucVU AS ten_vt
       FROM NHANVIEN ORDER BY chucVU, hotenNV`
    );
    res.json(
      rows.map((r) => ({
        ...r,
        vai_tro: mapRole(r.chucVU),
        trang_thai: 'lam_viec',
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/roles', authMiddleware, requireRole('admin'), async (req, res) => {
  res.json([
    { ma_vt: 1, ten_vt: 'admin', mo_ta: 'Quản lý' },
    { ma_vt: 2, ten_vt: 'thu_ngan', mo_ta: 'Thu ngân' },
    { ma_vt: 3, ten_vt: 'phuc_vu', mo_ta: 'Phục vụ' },
    { ma_vt: 4, ten_vt: 'bep', mo_ta: 'Đầu bếp' },
  ]);
});

router.patch('/staff/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { ma_vt } = req.body;
  const chucVU = ROLE_TO_CHUC_VU[ma_vt] || req.body.chucVU;
  if (!chucVU) return res.status(400).json({ error: 'Thiếu chức vụ' });
  try {
    await pool.query('UPDATE NHANVIEN SET chucVU = ? WHERE maNV = ?', [chucVU, req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
