const pool = require('../config/db');
const { mapRole } = require('../lib/golden');

async function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  const role = req.headers['x-user-role'];
  if (!userId) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT maNV AS ma_nv, hotenNV AS ho_ten, chucVU FROM NHANVIEN WHERE maNV = ?`,
      [userId]
    );
    if (!rows.length) return res.status(401).json({ error: 'Phiên không hợp lệ' });
    req.user = {
      ma_nv: rows[0].ma_nv,
      ho_ten: rows[0].ho_ten,
      ma_cn: 1,
      vai_tro: mapRole(rows[0].chucVU),
    };
    if (role) req.user.requestedRole = role;
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.vai_tro)) {
      return res.status(403).json({
        error: 'Không có quyền truy cập chức năng này',
        message: 'Chỉ tài khoản có thẩm quyền phù hợp mới được sử dụng.',
      });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
