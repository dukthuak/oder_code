const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = [authMiddleware, requireRole('admin')];

router.get('/roles', adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT ma_vt, ten_vt, mo_ta FROM vai_tro ORDER BY ma_vt');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/staff', adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT nv.ma_nv, nv.ho_ten, nv.email, nv.sdt, nv.trang_thai, nv.ma_cn, nv.ma_vt,
              cn.ten_cn, vt.ten_vt AS vai_tro, vt.mo_ta AS mo_ta_vt
       FROM nhan_vien nv
       JOIN chi_nhanh cn ON nv.ma_cn = cn.ma_cn
       JOIN vai_tro vt ON nv.ma_vt = vt.ma_vt
       ORDER BY nv.ma_cn, nv.ho_ten`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/staff/:id', adminOnly, async (req, res) => {
  const maNv = parseInt(req.params.id, 10);
  const { ma_vt, trang_thai } = req.body;
  if (!Number.isFinite(maNv)) {
    return res.status(400).json({ error: 'Mã nhân viên không hợp lệ' });
  }
  if (maNv === req.user.ma_nv && trang_thai === 'nghi') {
    return res.status(400).json({ error: 'Không thể tự vô hiệu hóa tài khoản đang đăng nhập' });
  }
  try {
    const updates = [];
    const params = [];
    if (ma_vt != null) {
      const [[role]] = await pool.query('SELECT ma_vt FROM vai_tro WHERE ma_vt = ?', [ma_vt]);
      if (!role) return res.status(400).json({ error: 'Vai trò không tồn tại' });
      updates.push('ma_vt = ?');
      params.push(ma_vt);
    }
    if (trang_thai != null) {
      if (!['lam_viec', 'nghi'].includes(trang_thai)) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
      }
      updates.push('trang_thai = ?');
      params.push(trang_thai);
    }
    if (!updates.length) {
      return res.status(400).json({ error: 'Không có dữ liệu cập nhật' });
    }
    params.push(maNv);
    await pool.query(`UPDATE nhan_vien SET ${updates.join(', ')} WHERE ma_nv = ?`, params);
    const [[row]] = await pool.query(
      `SELECT nv.ma_nv, nv.ho_ten, nv.email, nv.trang_thai, nv.ma_cn, cn.ten_cn, vt.ten_vt AS vai_tro
       FROM nhan_vien nv
       JOIN chi_nhanh cn ON nv.ma_cn = cn.ma_cn
       JOIN vai_tro vt ON nv.ma_vt = vt.ma_vt
       WHERE nv.ma_nv = ?`,
      [maNv]
    );
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
