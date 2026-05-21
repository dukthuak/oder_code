/** Ánh xạ mô hình Golden Taste ↔ API web */
const CHUC_VU_TO_ROLE = {
  'Quản lý': 'admin',
  'Thu ngân': 'thu_ngan',
  'Phục vụ': 'phuc_vu',
  'Đầu bếp': 'bep',
};

const ROLE_TO_CHUC_VU = Object.fromEntries(
  Object.entries(CHUC_VU_TO_ROLE).map(([k, v]) => [v, k])
);

/** Mã vai trò API (1–4) ↔ ten_vt */
const ROLE_TO_VT_ID = { admin: 1, thu_ngan: 2, phuc_vu: 3, bep: 4 };
const VT_ID_TO_ROLE = { 1: 'admin', 2: 'thu_ngan', 3: 'phuc_vu', 4: 'bep' };

function chucVuFromMaVt(ma_vt) {
  const id = Number(ma_vt);
  if (VT_ID_TO_ROLE[id]) return ROLE_TO_CHUC_VU[VT_ID_TO_ROLE[id]];
  if (typeof ma_vt === 'string' && ROLE_TO_CHUC_VU[ma_vt]) return ROLE_TO_CHUC_VU[ma_vt];
  return null;
}

function vtIdFromChucVu(chucVU) {
  const role = mapRole(chucVU);
  return ROLE_TO_VT_ID[role] || 3;
}

function mapRole(chucVU) {
  return CHUC_VU_TO_ROLE[chucVU] || 'phuc_vu';
}

async function nextMaHD(conn) {
  const [[row]] = await conn.query(
    `SELECT CONCAT('HD', LPAD(IFNULL(MAX(CAST(SUBSTRING(maHD, 3) AS UNSIGNED)), 0) + 1, 8, '0')) AS id
     FROM HOADON`
  );
  return row.id;
}

async function recalcTongTien(conn, maHD) {
  await conn.query(
    `UPDATE HOADON SET tongTIEN = IFNULL((
       SELECT SUM(soLUONG * giaLUCBAN) FROM CHITIET_HD WHERE maHD = ?
     ), 0) WHERE maHD = ?`,
    [maHD, maHD]
  );
}

const BAN_TO_API = { Trống: 'trong', 'Có khách': 'dang_dung', 'Đã đặt': 'dat_truoc' };
const HD_TO_API = { 'Chưa thanh toán': 'mo', 'Đã thanh toán': 'da_thanh_toan', 'Đã hủy': 'huy' };
const QT_TO_API = { 'Chờ cung ứng': 'cho', 'Đang chế biến': 'dang_nau', 'Đã phục vụ': 'xong' };
const MON_TO_API = { 'Sẵn có': 'con', 'Hết hàng': 'het', 'Ngừng bán': 'ngung' };

function mapBanRow(r) {
  return { ...r, trang_thai: BAN_TO_API[r.trang_thai] || r.trang_thai };
}

function mapHdRow(r) {
  return { ...r, trang_thai: HD_TO_API[r.trang_thai] || r.trang_thai };
}

function mapQtRow(r) {
  return { ...r, trang_thai_mon: QT_TO_API[r.trang_thai_mon] || r.trang_thai_mon };
}

function mapMonRow(r) {
  return { ...r, trang_thai: MON_TO_API[r.trang_thai] || r.trang_thai };
}

module.exports = {
  CHUC_VU_TO_ROLE,
  ROLE_TO_CHUC_VU,
  ROLE_TO_VT_ID,
  VT_ID_TO_ROLE,
  chucVuFromMaVt,
  vtIdFromChucVu,
  mapRole,
  nextMaHD,
  recalcTongTien,
  mapBanRow,
  mapHdRow,
  mapQtRow,
  mapMonRow,
};
