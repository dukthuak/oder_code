const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = [authMiddleware, requireRole('admin')];

const ROLES = ['admin', 'thu_ngan', 'phuc_vu', 'bep', 'kho'];

function isMissingTable(e) {
  return e.code === 'ER_NO_SUCH_TABLE' && String(e.message).includes('CHUC_NANG');
}

function handleDbError(e, res) {
  if (isMissingTable(e)) {
    return res.status(503).json({
      error: 'Bảng CHUC_NANG chưa có. Mở terminal trong thư mục server và chạy: npm run migrate-chuc-nang',
      code: 'SCHEMA_MISSING',
    });
  }
  res.status(500).json({ error: e.message });
}

function mapRow(r) {
  const vai_tro = String(r.vaiTroPhep || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    ma_cn: r.maCN,
    ma_trang: r.maTrang,
    ten_chuc_nang: r.tenCN,
    icon: r.icon,
    mo_ta: r.moTa,
    vai_tro,
    api_mo_ta: r.apiMoTa,
    thu_tu: r.thuTu,
    hien_thi: !!r.hienThi,
    cap_nhat: r.capNhat,
  };
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT maCN, maTrang, tenCN, icon, moTa, vaiTroPhep, apiMoTa, thuTu, hienThi, capNhat
       FROM CHUC_NANG WHERE hienThi = 1 ORDER BY thuTu, maTrang`
    );
    res.json(rows.map(mapRow));
  } catch (e) {
    handleDbError(e, res);
  }
});

router.get('/all', ...adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT maCN, maTrang, tenCN, icon, moTa, vaiTroPhep, apiMoTa, thuTu, hienThi, capNhat
       FROM CHUC_NANG ORDER BY thuTu, maTrang`
    );
    res.json(rows.map(mapRow));
  } catch (e) {
    handleDbError(e, res);
  }
});

router.post('/', ...adminOnly, async (req, res) => {
  const { ma_trang, ten_chuc_nang, icon, mo_ta, vai_tro, api_mo_ta, thu_tu, hien_thi } = req.body;
  if (!ma_trang || !ten_chuc_nang || !mo_ta) {
    return res.status(400).json({ error: 'Thiếu mã trang, tên hoặc mô tả' });
  }
  const roles = Array.isArray(vai_tro) ? vai_tro.join(',') : String(vai_tro || 'admin');
  try {
    const [[{ n }]] = await pool.query(
      `SELECT CONCAT('CN', LPAD(IFNULL(MAX(CAST(SUBSTRING(maCN, 3) AS UNSIGNED)), 0) + 1, 3, '0')) AS n FROM CHUC_NANG`
    );
    await pool.query(
      `INSERT INTO CHUC_NANG (maCN, maTrang, tenCN, icon, moTa, vaiTroPhep, apiMoTa, thuTu, hienThi)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        n,
        ma_trang,
        ten_chuc_nang,
        icon || '📌',
        mo_ta,
        roles,
        api_mo_ta || null,
        thu_tu ?? 99,
        hien_thi === false ? 0 : 1,
      ]
    );
    res.status(201).json({ ma_cn: n });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Mã trang đã tồn tại' });
    }
    handleDbError(e, res);
  }
});

router.put('/:id', ...adminOnly, async (req, res) => {
  const {
    ma_trang,
    ten_chuc_nang,
    icon,
    mo_ta,
    vai_tro,
    api_mo_ta,
    thu_tu,
    hien_thi,
  } = req.body;
  if (!ma_trang || !ten_chuc_nang || !mo_ta) {
    return res.status(400).json({ error: 'Thiếu mã trang, tên hoặc mô tả' });
  }
  const roles = Array.isArray(vai_tro) ? vai_tro.join(',') : String(vai_tro || '');
  if (!roles) return res.status(400).json({ error: 'Chọn ít nhất một vai trò' });
  try {
    await pool.query(
      `UPDATE CHUC_NANG SET maTrang=?, tenCN=?, icon=?, moTa=?, vaiTroPhep=?, apiMoTa=?, thuTu=?, hienThi=?
       WHERE maCN=?`,
      [
        ma_trang,
        ten_chuc_nang,
        icon || '📌',
        mo_ta,
        roles,
        api_mo_ta || null,
        thu_tu ?? 0,
        hien_thi === false ? 0 : 1,
        req.params.id,
      ]
    );
    res.json({ ok: true });
  } catch (e) {
    handleDbError(e, res);
  }
});

router.delete('/:id', ...adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM CHUC_NANG WHERE maCN = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    handleDbError(e, res);
  }
});

router.get('/roles', ...adminOnly, (req, res) => {
  res.json(ROLES);
});

module.exports = router;
