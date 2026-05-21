const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { nextMaHD, recalcTongTien, mapHdRow, mapQtRow } = require('../lib/golden');

const orderRoles = [authMiddleware, requireRole('admin', 'thu_ngan', 'phuc_vu')];
const payRoles = [authMiddleware, requireRole('admin', 'thu_ngan')];
const kitchenRoles = [authMiddleware, requireRole('admin', 'bep')];

const router = express.Router();

const HD_OPEN = 'Chưa thanh toán';
const HD_PAID = 'Đã thanh toán';

function mapOrderStatusFilter(trang_thai) {
  if (!trang_thai) return null;
  if (trang_thai === 'da_thanh_toan') return HD_PAID;
  if (['mo', 'dang_che_bien', 'cho_thanh_toan'].includes(trang_thai)) return HD_OPEN;
  return trang_thai;
}

const orderSelect = `SELECT h.maHD AS ma_hd, h.ngayLAP AS ngay_lap, h.tongTIEN AS tong_tien,
  0 AS giam_gia, h.trangthaiHD AS trang_thai, h.maBAN AS ma_ban, h.maKH AS ma_kh, h.maNV AS ma_nv,
  b.tenBAN AS so_ban, kh.tenKH AS ten_khach, nv.hotenNV AS ten_nv
  FROM HOADON h
  LEFT JOIN BAN b ON h.maBAN = b.maBAN
  LEFT JOIN KHACHHANG kh ON h.maKH = kh.maKH
  JOIN NHANVIEN nv ON h.maNV = nv.maNV`;

router.get('/', authMiddleware, async (req, res) => {
  const st = mapOrderStatusFilter(req.query.trang_thai);
  try {
    let sql = `${orderSelect} WHERE 1=1`;
    const params = [];
    if (st) {
      sql += ' AND h.trangthaiHD = ?';
      params.push(st);
    }
    sql += ' ORDER BY h.ngayLAP DESC LIMIT 50';
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(mapHdRow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id/details', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_chi_tiet_hoa_don WHERE ma_hd = ?', [
      req.params.id,
    ]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', ...orderRoles, async (req, res) => {
  const { ma_ban, ma_kh } = req.body;
  const ma_nv = req.user.ma_nv;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const maHD = await nextMaHD(conn);
    await conn.query(
      `INSERT INTO HOADON (maHD, trangthaiHD, maNV, maBAN, maKH) VALUES (?, ?, ?, ?, ?)`,
      [maHD, HD_OPEN, ma_nv, ma_ban, ma_kh || null]
    );
    await conn.query(`UPDATE BAN SET trangthaiBAN = 'Có khách' WHERE maBAN = ?`, [ma_ban]);
    await conn.commit();
    res.status(201).json({ ma_hd: maHD });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

router.post('/:id/items', ...orderRoles, async (req, res) => {
  const { ma_mon, so_luong } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[hd]] = await conn.query(
      'SELECT trangthaiHD, daIN FROM HOADON WHERE maHD = ?',
      [req.params.id]
    );
    if (!hd) return res.status(404).json({ error: 'Không tìm thấy hóa đơn' });
    if (hd.trangthaiHD !== HD_OPEN) {
      return res.status(400).json({ error: 'Hóa đơn không còn mở để thêm món' });
    }
    if (hd.daIN) {
      return res.status(400).json({ error: 'Đã in bill — không thêm món (theo nghiệp vụ Golden Taste)' });
    }
    const [[mon]] = await conn.query(
      'SELECT donGIA, trangthaiMON FROM MONAN WHERE maMON = ?',
      [ma_mon]
    );
    if (!mon || mon.trangthaiMON !== 'Sẵn có') {
      return res.status(400).json({ error: 'Món không sẵn có' });
    }
    await conn.query(
      `INSERT INTO CHITIET_HD (maHD, maMON, soLUONG, giaLUCBAN, trangthaiQT)
       VALUES (?, ?, ?, ?, 'Chờ cung ứng')`,
      [req.params.id, ma_mon, so_luong || 1, mon.donGIA]
    );
    await recalcTongTien(conn, req.params.id);
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

router.post('/:id/pay', ...payRoles, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[hd]] = await conn.query('SELECT maBAN, tongTIEN, maKH FROM HOADON WHERE maHD = ?', [
      req.params.id,
    ]);
    if (!hd) return res.status(404).json({ error: 'Không tìm thấy hóa đơn' });
    await conn.query(`UPDATE HOADON SET trangthaiHD = ? WHERE maHD = ?`, [HD_PAID, req.params.id]);
    await conn.query(`UPDATE BAN SET trangthaiBAN = 'Trống' WHERE maBAN = ?`, [hd.maBAN]);
    if (hd.maKH) {
      const diem = Math.floor(Number(hd.tongTIEN) / 10000);
      if (diem > 0) {
        await conn.query('UPDATE KHACHHANG SET diemTICHLUY = diemTICHLUY + ? WHERE maKH = ?', [
          diem,
          hd.maKH,
        ]);
      }
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

const QT_MAP = { cho: 'Chờ cung ứng', dang_nau: 'Đang chế biến', xong: 'Đã phục vụ' };

router.patch('/items/:ctId/status', ...kitchenRoles, async (req, res) => {
  const trang_thai_mon = QT_MAP[req.body.trang_thai_mon] || req.body.trang_thai_mon;
  try {
    await pool.query('UPDATE CHITIET_HD SET trangthaiQT = ? WHERE maCTHD = ?', [
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
      `SELECT ct.maCTHD AS ma_ct, ct.maHD AS ma_hd, ct.soLUONG AS so_luong,
              ct.trangthaiQT AS trang_thai_mon, m.tenMON AS ten_mon, b.tenBAN AS so_ban
       FROM CHITIET_HD ct
       JOIN MONAN m ON ct.maMON = m.maMON
       JOIN HOADON h ON ct.maHD = h.maHD
       LEFT JOIN BAN b ON h.maBAN = b.maBAN
       WHERE ct.trangthaiQT IN ('Chờ cung ứng', 'Đang chế biến')
         AND h.trangthaiHD = ?
       ORDER BY ct.maCTHD`,
      [HD_OPEN]
    );
    res.json(rows.map(mapQtRow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
