const pool = require('../config/db');

async function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  const role = req.headers['x-user-role'];
  if (!userId) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT nv.ma_nv, nv.ho_ten, nv.ma_cn, vt.ten_vt AS vai_tro
       FROM nhan_vien nv JOIN vai_tro vt ON nv.ma_vt = vt.ma_vt
       WHERE nv.ma_nv = ? AND nv.trang_thai = 'lam_viec'`,
      [userId]
    );
    if (!rows.length) return res.status(401).json({ error: 'Phiên không hợp lệ' });
    req.user = rows[0];
    if (role) req.user.requestedRole = role;
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.vai_tro)) {
      return res.status(403).json({ error: 'Không có quyền' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
