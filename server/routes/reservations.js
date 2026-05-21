const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { mapBanRow } = require('../lib/golden');

const router = express.Router();

function mapReservationRow(r) {
  const mapped = mapBanRow(r);
  return {
    ma_dat: mapped.ma_ban,
    ma_ban: mapped.ma_ban,
    so_ban: mapped.so_ban,
    ho_ten: r.ho_ten || 'Walk-in',
    ngay_gio: r.ngay_gio || new Date().toISOString(),
    so_nguoi: r.so_nguoi ?? mapped.suc_chua ?? 2,
    ghi_chu: r.ghi_chu || '',
    trang_thai: mapped.trang_thai === 'dat_truoc' ? 'xac_nhan' : mapped.trang_thai,
  };
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT maBAN AS ma_ban, tenBAN AS so_ban, viTRI AS vi_tri, sucCHUA AS suc_chua,
              trangthaiBAN AS trang_thai
       FROM BAN WHERE trangthaiBAN = 'Đã đặt' ORDER BY tenBAN`
    );
    res.json(rows.map(mapReservationRow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authMiddleware, requireRole('admin', 'thu_ngan', 'phuc_vu'), async (req, res) => {
  const { ma_ban } = req.body;
  if (!ma_ban) return res.status(400).json({ error: 'Thiếu mã bàn' });
  try {
    const [[ban]] = await pool.query(
      `SELECT maBAN AS ma_ban, tenBAN AS so_ban, sucCHUA AS suc_chua, trangthaiBAN AS trang_thai
       FROM BAN WHERE maBAN = ?`,
      [ma_ban]
    );
    if (!ban) return res.status(404).json({ error: 'Không tìm thấy bàn' });
    if (ban.trang_thai !== 'Trống') {
      return res.status(400).json({ error: 'Bàn không còn trống' });
    }
    await pool.query(`UPDATE BAN SET trangthaiBAN = 'Đã đặt' WHERE maBAN = ?`, [ma_ban]);
    res.status(201).json(
      mapReservationRow({
        ...ban,
        trang_thai: 'Đã đặt',
        ho_ten: req.body.ho_ten,
        ngay_gio: req.body.ngay_gio,
        so_nguoi: req.body.so_nguoi,
        ghi_chu: req.body.ghi_chu,
      })
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/status', authMiddleware, requireRole('admin', 'thu_ngan', 'phuc_vu'), async (req, res) => {
  const maBan = req.params.id;
  const st = req.body.trang_thai;
  const statusMap = {
    xac_nhan: 'Đã đặt',
    cho: 'Đã đặt',
    hoan_thanh: 'Có khách',
    huy: 'Trống',
  };
  const dbStatus = statusMap[st];
  if (!dbStatus) return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  try {
    await pool.query('UPDATE BAN SET trangthaiBAN = ? WHERE maBAN = ?', [dbStatus, maBan]);
    res.json({ ok: true, trang_thai: st });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
