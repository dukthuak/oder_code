const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const orderRoles = [authMiddleware, requireRole('admin', 'thu_ngan', 'phuc_vu')];
const payRoles = [authMiddleware, requireRole('admin', 'thu_ngan')];
const kitchenRoles = [authMiddleware, requireRole('admin', 'bep')];

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const { trang_thai, ma_cn } = req.query;
  try {
    let sql = `SELECT h.*, b.so_ban, kh.ho_ten AS ten_khach, nv.ho_ten AS ten_nv
               FROM hoa_don h
               LEFT JOIN ban_an b ON h.ma_ban = b.ma_ban
               LEFT JOIN khach_hang kh ON h.ma_kh = kh.ma_kh
               JOIN nhan_vien nv ON h.ma_nv = nv.ma_nv WHERE 1=1`;
    const params = [];
    if (trang_thai) {
      sql += ' AND h.trang_thai = ?';
      params.push(trang_thai);
    }
    if (ma_cn) {
      sql += ' AND h.ma_cn = ?';
      params.push(ma_cn);
    }
    sql += ' ORDER BY h.ngay_lap DESC LIMIT 50';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id/details', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vw_chi_tiet_hoa_don WHERE ma_hd = ?',
      [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', ...orderRoles, async (req, res) => {
  const { ma_ban, ma_kh, ma_cn } = req.body;
  const ma_nv = req.user.ma_nv;
  const cn = ma_cn || req.user.ma_cn;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'CALL sp_tao_hoa_don(?, ?, ?, ?, @ma_hd)',
      [ma_ban, ma_nv, ma_kh || null, cn]
    );
    const [[{ ma_hd }]] = await conn.query('SELECT @ma_hd AS ma_hd');
    await conn.commit();
    res.status(201).json({ ma_hd });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

router.post('/:id/items', ...orderRoles, async (req, res) => {
  const { ma_mon, so_luong, ghi_chu } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.query('CALL sp_them_mon_hd(?, ?, ?, ?, @result)', [
      req.params.id,
      ma_mon,
      so_luong || 1,
      ghi_chu || null,
    ]);
    const [[{ result }]] = await conn.query('SELECT @result AS result');
    if (result !== 'OK') {
      return res.status(400).json({ error: result });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

router.post('/:id/pay', ...payRoles, async (req, res) => {
  const { hinh_thuc, so_tien } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('CALL sp_thanh_toan(?, ?, ?, ?, @result)', [
      req.params.id,
      hinh_thuc || 'tien_mat',
      so_tien,
      req.user.ma_nv,
    ]);
    const [[{ result }]] = await conn.query('SELECT @result AS result');
    await conn.commit();
    if (result !== 'OK') return res.status(400).json({ error: result });
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

router.patch('/items/:ctId/status', ...kitchenRoles, async (req, res) => {
  const { trang_thai_mon } = req.body;
  try {
    await pool.query('UPDATE chi_tiet_hd SET trang_thai_mon = ? WHERE ma_ct = ?', [
      trang_thai_mon,
      req.params.ctId,
    ]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/kitchen/queue', ...kitchenRoles, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ct.*, m.ten_mon, h.ma_hd, b.so_ban
       FROM chi_tiet_hd ct
       JOIN mon_an m ON ct.ma_mon = m.ma_mon
       JOIN hoa_don h ON ct.ma_hd = h.ma_hd
       LEFT JOIN ban_an b ON h.ma_ban = b.ma_ban
       WHERE ct.trang_thai_mon IN ('cho','dang_nau')
         AND h.trang_thai IN ('mo','dang_che_bien','cho_thanh_toan')
       ORDER BY ct.ma_ct`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
