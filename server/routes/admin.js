const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { ROLE_TO_CHUC_VU } = require('../lib/golden');
const { mapMonRow, mapBanRow } = require('../lib/golden');

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const router = express.Router();
const adminOnly = [authMiddleware, requireRole('admin')];

const CHUC_VU_LIST = ['Quản lý', 'Thu ngân', 'Phục vụ', 'Đầu bếp'];

router.get('/overview', ...adminOnly, async (req, res) => {
  try {
    const [[nv]] = await pool.query('SELECT COUNT(*) AS c FROM NHANVIEN');
    const [[mon]] = await pool.query('SELECT COUNT(*) AS c FROM MONAN');
    const [[dm]] = await pool.query('SELECT COUNT(*) AS c FROM LOAIMON');
    const [[ban]] = await pool.query(
      `SELECT
         SUM(trangthaiBAN = 'Có khách') AS dang_dung,
         SUM(trangthaiBAN = 'Đã đặt') AS dat_truoc,
         SUM(trangthaiBAN = 'Trống') AS trong
       FROM BAN`
    );
    const [[hd]] = await pool.query(
      `SELECT
         SUM(trangthaiHD = 'Chưa thanh toán') AS mo,
         SUM(trangthaiHD = 'Đã thanh toán' AND DATE(ngayLAP) = CURDATE()) AS da_tt_hom_nay
       FROM HOADON`
    );
    const [[rev]] = await pool.query(
      `SELECT IFNULL(SUM(tongTIEN), 0) AS tong FROM HOADON
       WHERE trangthaiHD = 'Đã thanh toán' AND DATE(ngayLAP) = CURDATE()`
    );
    const [[cn]] = await pool.query('SELECT COUNT(*) AS c FROM CHUC_NANG WHERE hienThi = 1');
    const [[kh]] = await pool.query('SELECT COUNT(*) AS c FROM KHACHHANG');
    const [[nl]] = await pool.query('SELECT COUNT(*) AS c FROM NGUYENLIEU');
    let canh_bao_kho = 0;
    try {
      const [[k]] = await pool.query('SELECT COUNT(*) AS c FROM vw_ton_kho_canh_bao');
      canh_bao_kho = k.c;
    } catch {
      canh_bao_kho = 0;
    }
    const [[bep]] = await pool.query(
      `SELECT COUNT(*) AS c FROM CHITIET_HD ct
       JOIN HOADON h ON ct.maHD = h.maHD
       WHERE ct.trangthaiQT IN ('Chờ cung ứng', 'Đang chế biến')
         AND h.trangthaiHD = 'Chưa thanh toán'`
    );
    res.json({
      nhan_vien: num(nv.c),
      mon_an: num(mon.c),
      danh_muc: num(dm.c),
      khach_hang: num(kh.c),
      nguyen_lieu: num(nl.c),
      chuc_nang: num(cn.c),
      ban_dang_dung: num(ban.dang_dung),
      ban_dat_truoc: num(ban.dat_truoc),
      ban_trong: num(ban.trong),
      order_mo: num(hd.mo),
      hd_hom_nay: num(hd.da_tt_hom_nay),
      doanh_thu_hom_nay: num(rev.tong),
      canh_bao_kho: num(canh_bao_kho),
      mon_bep_cho: num(bep.c),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* --- Danh mục món --- */
router.get('/categories', ...adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT maLOAI AS ma_dm, tenLOAI AS ten_dm FROM LOAIMON ORDER BY tenLOAI');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/categories', ...adminOnly, async (req, res) => {
  const { ten_dm } = req.body;
  if (!ten_dm) return res.status(400).json({ error: 'Thiếu tên danh mục' });
  try {
    const [[{ n }]] = await pool.query(
      `SELECT CONCAT('LM', LPAD(IFNULL(MAX(CAST(SUBSTRING(maLOAI, 3) AS UNSIGNED)), 0) + 1, 3, '0')) AS n FROM LOAIMON`
    );
    await pool.query('INSERT INTO LOAIMON (maLOAI, tenLOAI) VALUES (?, ?)', [n, ten_dm]);
    res.status(201).json({ ma_dm: n, ten_dm });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Danh mục đã tồn tại' });
    res.status(500).json({ error: e.message });
  }
});

router.delete('/categories/:id', ...adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM LOAIMON WHERE maLOAI = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* --- Món ăn --- */
router.get('/menu', ...adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.maMON AS ma_mon, m.tenMON AS ten_mon, m.donGIA AS gia_ban, m.donVITINH AS don_vi,
              m.trangthaiMON AS trang_thai, l.maLOAI AS ma_dm, l.tenLOAI AS ten_dm
       FROM MONAN m JOIN LOAIMON l ON m.maLOAI = l.maLOAI ORDER BY l.tenLOAI, m.tenMON`
    );
    res.json(rows.map(mapMonRow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/menu', ...adminOnly, async (req, res) => {
  const { ma_dm, ten_mon, gia_ban, don_vi, trang_thai } = req.body;
  if (!ma_dm || !ten_mon || gia_ban == null) {
    return res.status(400).json({ error: 'Thiếu danh mục, tên hoặc giá' });
  }
  const statusMap = { con: 'Sẵn có', het: 'Hết hàng', ngung: 'Ngừng bán' };
  const st = statusMap[trang_thai] || trang_thai || 'Sẵn có';
  try {
    const [[{ n }]] = await pool.query(
      `SELECT CONCAT('MA', LPAD(IFNULL(MAX(CAST(SUBSTRING(maMON, 3) AS UNSIGNED)), 0) + 1, 3, '0')) AS n FROM MONAN`
    );
    await pool.query(
      `INSERT INTO MONAN (maMON, tenMON, donGIA, donVITINH, trangthaiMON, maLOAI) VALUES (?,?,?,?,?,?)`,
      [n, ten_mon, gia_ban, don_vi || 'Phần', st, ma_dm]
    );
    res.status(201).json({ ma_mon: n });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/menu/:id', ...adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM MONAN WHERE maMON = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* --- Bàn --- */
router.get('/tables', ...adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT maBAN AS ma_ban, tenBAN AS so_ban, viTRI AS vi_tri, sucCHUA AS suc_chua, trangthaiBAN AS trang_thai
       FROM BAN ORDER BY viTRI, tenBAN`
    );
    res.json(rows.map(mapBanRow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/tables', ...adminOnly, async (req, res) => {
  const { ten_ban, vi_tri, suc_chua } = req.body;
  if (!ten_ban) return res.status(400).json({ error: 'Thiếu tên bàn' });
  try {
    const [[{ n }]] = await pool.query(
      `SELECT CONCAT('BA', LPAD(IFNULL(MAX(CAST(SUBSTRING(maBAN, 3) AS UNSIGNED)), 0) + 1, 3, '0')) AS n FROM BAN`
    );
    await pool.query(
      `INSERT INTO BAN (maBAN, tenBAN, viTRI, sucCHUA, trangthaiBAN) VALUES (?,?,?,?,'Trống')`,
      [n, ten_ban, vi_tri || 'Tầng 1', suc_chua || 4]
    );
    res.status(201).json({ ma_ban: n });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/tables/:id', ...adminOnly, async (req, res) => {
  try {
    const [[hd]] = await pool.query(
      `SELECT COUNT(*) AS c FROM HOADON WHERE maBAN = ? AND trangthaiHD = 'Chưa thanh toán'`,
      [req.params.id]
    );
    if (hd.c > 0) return res.status(400).json({ error: 'Bàn đang có hóa đơn mở' });
    await pool.query('DELETE FROM BAN WHERE maBAN = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* --- Nhân viên --- */
router.get('/staff', ...adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT maNV AS ma_nv, hotenNV AS ho_ten, emailNV AS email, SDT AS sdt, chucVU, ngaySINH AS ngay_sinh, gioiTINH AS gioi_tinh
       FROM NHANVIEN ORDER BY chucVU, hotenNV`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/staff', ...adminOnly, async (req, res) => {
  const { ho_ten, email, sdt, chuc_vu, ngay_sinh, gioi_tinh, password } = req.body;
  if (!ho_ten || !email || !chuc_vu) {
    return res.status(400).json({ error: 'Thiếu họ tên, email hoặc chức vụ' });
  }
  const chucVU = ROLE_TO_CHUC_VU[chuc_vu] || chuc_vu;
  if (!CHUC_VU_LIST.includes(chucVU)) {
    return res.status(400).json({ error: 'Chức vụ không hợp lệ' });
  }
  try {
    const [[{ n }]] = await pool.query(
      `SELECT CONCAT('NV', LPAD(IFNULL(MAX(CAST(SUBSTRING(maNV, 3) AS UNSIGNED)), 0) + 1, 3, '0')) AS n FROM NHANVIEN`
    );
    const hash = await bcrypt.hash(password || 'password123', 10);
    await pool.query(
      `INSERT INTO NHANVIEN (maNV, hotenNV, ngaySINH, gioiTINH, SDT, emailNV, chucVU, luongCB, matKhauHash)
       VALUES (?,?,?,?,?,?,?,4420000,?)`,
      [
        n,
        ho_ten,
        ngay_sinh || '2000-01-01',
        gioi_tinh || 'Nam',
        sdt || '0900000099',
        email,
        chucVU,
        hash,
      ]
    );
    res.status(201).json({ ma_nv: n, message: 'Mật khẩu mặc định: password123 (nếu không nhập)' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email hoặc SĐT trùng' });
    res.status(500).json({ error: e.message });
  }
});

router.delete('/staff/:id', ...adminOnly, async (req, res) => {
  if (req.params.id === req.user.ma_nv) {
    return res.status(400).json({ error: 'Không thể xóa chính mình' });
  }
  try {
    await pool.query('DELETE FROM NHANVIEN WHERE maNV = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* --- Khách hàng --- */
router.get('/customers', ...adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT maKH AS ma_kh, tenKH AS ho_ten, SDT AS sdt, ngayDANGKY AS ngay_dang_ky, diemTICHLUY AS diem_tich_luy
       FROM KHACHHANG ORDER BY tenKH`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/customers', ...adminOnly, async (req, res) => {
  const { ho_ten, sdt, diem_tich_luy } = req.body;
  if (!ho_ten || !sdt) return res.status(400).json({ error: 'Thiếu tên hoặc SĐT' });
  try {
    const [[{ n }]] = await pool.query(
      `SELECT CONCAT('KH', LPAD(IFNULL(MAX(CAST(SUBSTRING(maKH, 3) AS UNSIGNED)), 0) + 1, 3, '0')) AS n FROM KHACHHANG`
    );
    await pool.query(
      `INSERT INTO KHACHHANG (maKH, tenKH, SDT, diemTICHLUY) VALUES (?,?,?,?)`,
      [n, ho_ten, sdt, diem_tich_luy || 0]
    );
    res.status(201).json({ ma_kh: n });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'SĐT đã tồn tại' });
    res.status(500).json({ error: e.message });
  }
});

router.delete('/customers/:id', ...adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM KHACHHANG WHERE maKH = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* --- Nguyên liệu --- */
router.get('/inventory', ...adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT maNL AS ma_nl, tenNL AS ten_nl, slTON AS ton_kho, donVITINH AS don_vi FROM NGUYENLIEU ORDER BY tenNL`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/inventory', ...adminOnly, async (req, res) => {
  const { ten_nl, ton_kho, don_vi } = req.body;
  if (!ten_nl) return res.status(400).json({ error: 'Thiếu tên nguyên liệu' });
  try {
    const [[{ n }]] = await pool.query(
      `SELECT CONCAT('NL', LPAD(IFNULL(MAX(CAST(SUBSTRING(maNL, 3) AS UNSIGNED)), 0) + 1, 3, '0')) AS n FROM NGUYENLIEU`
    );
    await pool.query(
      `INSERT INTO NGUYENLIEU (maNL, tenNL, slTON, donVITINH) VALUES (?,?,?,?)`,
      [n, ten_nl, ton_kho ?? 0, don_vi || 'Kg']
    );
    res.status(201).json({ ma_nl: n });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/inventory/:id', ...adminOnly, async (req, res) => {
  const { ton_kho } = req.body;
  try {
    await pool.query('UPDATE NGUYENLIEU SET slTON = ? WHERE maNL = ?', [ton_kho, req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/inventory/:id', ...adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM NGUYENLIEU WHERE maNL = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/seed-demo', ...adminOnly, async (req, res) => {
  const sqlPath = path.join(__dirname, '../../database/golden_taste/05_demo_full.sql');
  const conn = await pool.getConnection();
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await conn.beginTransaction();
    await conn.query(sql);
    await conn.commit();
    res.json({
      ok: true,
      message: 'Đã nạp dữ liệu mẫu (tùy chọn). Bạn vẫn có thể tự nhập từng mục trong Quản trị.',
    });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
