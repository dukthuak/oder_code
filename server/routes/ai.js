const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const aiRoles = [authMiddleware, requireRole('admin', 'thu_ngan', 'phuc_vu', 'bep', 'kho')];

const router = express.Router();

const KEYWORDS = [
  { keys: ['phở', 'pho', 'bò', 'bo', 'tái', 'tai'], sql: '%phở%', cat: 'Món chính' },
  { keys: ['gà', 'ga', 'chicken'], sql: '%gà%', cat: null },
  { keys: ['cơm', 'com', 'tấm', 'tam', 'sườn', 'suon'], sql: '%cơm%', cat: null },
  { keys: ['bún', 'bun', 'chả', 'cha'], sql: '%bún%', cat: null },
  { keys: ['gỏi', 'goi', 'cuốn', 'cuon', 'nem'], sql: '%gỏi%', cat: 'Khai vị' },
  { keys: ['nước', 'nuoc', 'uống', 'uong', 'trà', 'tra', 'cà phê', 'cafe', 'coffee'], sql: null, cat: 'Đồ uống' },
  { keys: ['chè', 'che', 'tráng', 'trang', 'miệng', 'mieng', 'dessert'], sql: '%chè%', cat: 'Tráng miệng' },
  { keys: ['chay', 'vegetarian', 'rau'], sql: '%gỏi%', cat: 'Khai vị' },
];

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchIntent(msg) {
  const n = normalize(msg);
  if (n.match(/\b(hello|hi|hey|chao|xin chao|chào|chào bạn)\b/)) return { greeting: true };
  for (const rule of KEYWORDS) {
    if (rule.keys.some((k) => n.includes(normalize(k)))) return rule;
  }
  if (n.includes('re') || n.includes('rẻ') || n.includes('gia re')) return { sort: 'price_asc' };
  if (n.includes('dat') || n.includes('cao cap') || n.includes('đắt')) return { sort: 'price_desc' };
  if (n.includes('ban chay') || n.includes('hot') || n.includes('noi bat')) return { sort: 'popular' };
  if (n.includes('combo') || n.includes('nhom') || n.includes('đông người')) return { combo: true };
  return null;
}

async function searchMenu(intent, limit = 6) {
  let sql = `SELECT m.ma_mon, m.ten_mon, m.gia_ban, m.don_vi, m.mo_ta, dm.ten_dm
             FROM mon_an m JOIN danh_muc dm ON m.ma_dm = dm.ma_dm
             WHERE m.trang_thai = 'con'`;
  const params = [];

  if (intent?.sql) {
    sql += ' AND m.ten_mon LIKE ?';
    params.push(intent.sql);
  } else if (intent?.cat) {
    sql += ' AND dm.ten_dm = ?';
    params.push(intent.cat);
  }

  if (intent?.sort === 'price_asc') sql += ' ORDER BY m.gia_ban ASC';
  else if (intent?.sort === 'price_desc') sql += ' ORDER BY m.gia_ban DESC';
  else if (intent?.sort === 'popular') {
    sql = `SELECT m.ma_mon, m.ten_mon, m.gia_ban, m.don_vi, m.mo_ta, dm.ten_dm,
                  IFNULL(v.tong_sl, 0) AS tong_sl
           FROM mon_an m
           JOIN danh_muc dm ON m.ma_dm = dm.ma_dm
           LEFT JOIN vw_mon_ban_chay v ON m.ma_mon = v.ma_mon
           WHERE m.trang_thai = 'con'
           ORDER BY tong_sl DESC, m.gia_ban DESC`;
    params.length = 0;
  } else {
    sql += ' ORDER BY dm.ten_dm, m.ten_mon';
  }

  sql += ' LIMIT ?';
  params.push(limit);
  const [rows] = await pool.query(sql, params);
  return rows;
}

const ROLE_LABELS = {
  admin: 'Quản trị',
  thu_ngan: 'Thu ngân',
  phuc_vu: 'Phục vụ',
  bep: 'Bếp',
  kho: 'Kho',
};

function classifyIntent(message) {
  const n = normalize(message);
  if (!n) return 'welcome';
  if (n.match(/\b(cam on|thanks|thank you|tks)\b/)) return 'thanks';
  if (n.match(/\b(tro giup|huong dan|ho tro|help|lam sao|cach dung|su dung he thong)\b/)) return 'help';
  if (n.match(/\b(loi|error|bug|khong ket noi|mat ket noi|sua loi|khong vao duoc)\b/)) return 'troubleshoot';
  if (n.match(/\b(quyen|phan quyen|vai tro|ai duoc)\b/)) return 'permissions';
  if (n.match(/\b(doanh thu|bao cao|revenue|hom nay ban|tien thu)\b/)) return 'revenue';
  if (n.match(/\b(ton kho|het hang|nguyen lieu|nhap kho|canh bao kho)\b/)) return 'inventory';
  if (n.match(/\b(bep|che bien|hang doi|mon cho|dang nau)\b/)) return 'kitchen';
  if (n.match(/\b(dat ban|lich dat|reservation)\b/)) return 'reservation';
  if (n.match(/\b(order|goi mon|them mon|thanh toan|mo ban|hoa don)\b/)) return 'order_help';
  if (n.match(/\b(gio mo cua|dia chi|chi nhanh|lien he|thong tin nha hang)\b/)) return 'info';
  if (matchIntent(message)) return 'menu';
  if (n.length >= 4) return 'general';
  return 'unknown';
}

function buildMenuAnswer(message, suggestions, menuIntent) {
  if (menuIntent?.greeting) {
    return suggestions.length
      ? 'Xin chào! Dưới đây là món phổ biến — bạn có thể **+ Order** nếu đang mở bàn.'
      : 'Xin chào! Hỏi mình về món ăn hoặc các vấn đề khác (kho, báo cáo, hướng dẫn…).';
  }
  if (!suggestions.length) {
    return 'Chưa tìm thấy món khớp. Thử "phở", "đồ uống", "món bán chạy" hoặc hỏi **hướng dẫn** / **hỗ trợ**.';
  }
  const names = suggestions.slice(0, 3).map((s) => s.ten_mon).join(', ');
  if (menuIntent?.cat) return `Gợi ý **${menuIntent.cat}**: ${names}${suggestions.length > 3 ? '…' : ''}.`;
  if (menuIntent?.sort === 'price_asc') return `Món giá mềm: ${names}.`;
  if (menuIntent?.sort === 'popular') return `Top bán chạy: ${names}.`;
  if (menuIntent?.combo) return `Gợi ý combo ~4 người: ${names}.`;
  return `Gợi ý món cho "${message}": ${names}${suggestions.length > 3 ? '…' : ''}.`;
}

function welcomeAnswer(role, name) {
  const r = ROLE_LABELS[role] || role;
  return (
    `Xin chào **${name || 'bạn'}**! Mình là **trợ lý AI** Phở Hà Nội — hỗ trợ giải quyết vấn đề, hướng dẫn hệ thống, tra cứu kho/báo cáo/bếp, và gợi ý món khi cần.\n\n` +
    `Vai trò của bạn: **${r}**. Hỏi ví dụ: *"hướng dẫn"*, *"doanh thu hôm nay"*, *"cảnh báo kho"*, *"lỗi không kết nối"*, *"gợi ý phở"*.`
  );
}

function helpAnswer(role) {
  const blocks = {
    admin:
      '**Quản trị:** Phân quyền nhân viên, báo cáo doanh thu, order, kho, đặt bàn, AI phân tích, xem/sửa thực đơn.',
    thu_ngan:
      '**Thu ngân:** Bàn & order, thanh toán, đặt bàn, báo cáo doanh thu, chat AI, thực đơn (xem).',
    phuc_vu: '**Phục vụ:** Bàn & order (không thanh toán), đặt bàn, gợi ý món qua chat, thực đơn.',
    bep: '**Bếp:** Hàng đợi chế biến, cập nhật trạng thái món. Hỏi mình *"món đang chờ bếp"* để xem nhanh.',
    kho: '**Kho:** Tồn nguyên liệu, cảnh báo tồn thấp. Hỏi *"cảnh báo kho"* hoặc dùng trang Kho.',
  };
  return (
    `**Hướng dẫn theo vai trò**\n\n${blocks[role] || blocks.phuc_vu}\n\n` +
    '**Chủ đề chat hỗ trợ:** hướng dẫn · doanh thu · tồn kho · bếp · đặt bàn · lỗi kết nối · gợi ý món · quyền truy cập.'
  );
}

async function answerRevenue(maCn) {
  const cnFilter = maCn ? ' AND h.ma_cn = ?' : '';
  const params = maCn ? [maCn] : [];
  const [[today]] = await pool.query(
    `SELECT IFNULL(SUM(h.tong_tien - h.giam_gia), 0) AS dt, COUNT(*) AS hd
     FROM hoa_don h WHERE h.trang_thai = 'da_thanh_toan' AND DATE(h.ngay_lap) = CURDATE()${cnFilter}`,
    params
  );
  const [[open]] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM hoa_don h
     WHERE h.trang_thai IN ('mo','dang_che_bien','cho_thanh_toan')${cnFilter}`,
    params
  );
  const dt = Number(today.dt);
  const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);
  return {
    answer:
      `**Doanh thu hôm nay:** ${fmt(dt)}đ (${today.hd} hóa đơn đã thanh toán).\n` +
      `**Order đang mở:** ${open.cnt} hóa đơn.\n\n` +
      'Xem biểu đồ chi tiết tại trang **Báo cáo** (cần quyền Thu ngân/Quản trị).',
    actions: [{ label: 'Mở Báo cáo', page: 'reports' }],
  };
}

async function answerInventory() {
  const [rows] = await pool.query('SELECT * FROM vw_ton_kho_canh_bao LIMIT 8');
  if (!rows.length) {
    return {
      answer: '**Kho ổn định** — không có cảnh báo tồn thấp hoặc hết hàng lúc này.',
      actions: [{ label: 'Mở Kho', page: 'inventory' }],
    };
  }
  const lines = rows
    .slice(0, 5)
    .map((r) => `• **${r.ten_nl}**: ${r.ton_kho} ${r.don_vi} (${String(r.muc_canh_bao).replace(/_/g, ' ')})`)
    .join('\n');
  return {
    answer: `**Cảnh báo kho** (${rows.length} mục):\n${lines}${rows.length > 5 ? '\n…' : ''}`,
    actions: [{ label: 'Chi tiết Kho', page: 'inventory' }],
  };
}

async function answerKitchen() {
  const [rows] = await pool.query(
    `SELECT ct.trang_thai_mon, m.ten_mon, ct.so_luong, b.so_ban
     FROM chi_tiet_hd ct
     JOIN mon_an m ON ct.ma_mon = m.ma_mon
     JOIN hoa_don h ON ct.ma_hd = h.ma_hd
     LEFT JOIN ban_an b ON h.ma_ban = b.ma_ban
     WHERE ct.trang_thai_mon IN ('cho','dang_nau')
       AND h.trang_thai IN ('mo','dang_che_bien','cho_thanh_toan')
     ORDER BY ct.ma_ct LIMIT 10`
  );
  if (!rows.length) {
    return { answer: '**Bếp đang nhàn** — không có món chờ hoặc đang nấu.', actions: [{ label: 'Mở Bếp', page: 'kitchen' }] };
  }
  const cho = rows.filter((r) => r.trang_thai_mon === 'cho').length;
  const nau = rows.length - cho;
  const lines = rows
    .slice(0, 6)
    .map((r) => `• ${r.ten_mon} ×${r.so_luong} — Bàn ${r.so_ban || '—'} (${r.trang_thai_mon === 'cho' ? 'chờ' : 'đang nấu'})`)
    .join('\n');
  return {
    answer: `**Hàng đợi bếp:** ${cho} chờ, ${nau} đang nấu.\n${lines}`,
    actions: [{ label: 'Mở Bếp', page: 'kitchen' }],
  };
}

async function answerReservations() {
  const [rows] = await pool.query(
    `SELECT d.ngay_gio, d.trang_thai, kh.ho_ten, b.so_ban
     FROM dat_ban d
     LEFT JOIN khach_hang kh ON d.ma_kh = kh.ma_kh
     JOIN ban_an b ON d.ma_ban = b.ma_ban
     WHERE d.ngay_gio >= NOW()
     ORDER BY d.ngay_gio LIMIT 6`
  );
  if (!rows.length) {
    return { answer: 'Không có lịch đặt bàn sắp tới.', actions: [{ label: 'Đặt bàn', page: 'reservations' }] };
  }
  const lines = rows
    .map((r) => {
      const t = new Date(r.ngay_gio).toLocaleString('vi-VN');
      return `• ${r.ho_ten || 'Khách'} — Bàn ${r.so_ban}, ${t} (${r.trang_thai})`;
    })
    .join('\n');
  return { answer: `**Lịch đặt bàn sắp tới:**\n${lines}`, actions: [{ label: 'Mở Đặt bàn', page: 'reservations' }] };
}

async function answerInfo() {
  const [rows] = await pool.query(
    "SELECT ten_cn, dia_chi, gio_mo_cua, sdt FROM chi_nhanh WHERE trang_thai = 'hoat_dong' LIMIT 5"
  );
  const lines = rows.map((c) => `• **${c.ten_cn}** — ${c.dia_chi || '—'}, ${c.gio_mo_cua || '—'}, ${c.sdt || ''}`).join('\n');
  return { answer: `**Thông tin chi nhánh Phở Hà Nội:**\n${lines || 'Chưa có dữ liệu chi nhánh.'}` };
}

async function processChat(message, user, maKh, maHd) {
  const intent = classifyIntent(message);
  const role = user?.vai_tro || 'phuc_vu';
  const maCn = user?.ma_cn || null;

  let answer = '';
  let suggestions = [];
  let source = intent;
  let actions = [];
  let tips = [];
  let showMenuActions = false;

  if (intent === 'welcome') {
    answer = welcomeAnswer(role, user?.ho_ten);
    tips = ['Hướng dẫn sử dụng', 'Doanh thu hôm nay', 'Cảnh báo kho', 'Gợi ý phở bò'];
    if (['admin', 'thu_ngan', 'phuc_vu'].includes(role)) {
      const menuIntent = { sort: 'popular' };
      suggestions = (await searchMenu(menuIntent, 4)).map((r) => ({
        ma_mon: r.ma_mon,
        ten_mon: r.ten_mon,
        ten_dm: r.ten_dm,
        gia_ban: Number(r.gia_ban),
        don_vi: r.don_vi,
        mo_ta: r.mo_ta,
        ly_do: 'Món phổ biến',
      }));
      showMenuActions = true;
    }
  } else if (intent === 'thanks') {
    answer = 'Không có gì! Cần hỗ trợ thêm cứ hỏi nhé — món ăn, kho, báo cáo, hướng dẫn đều được.';
  } else if (intent === 'help') {
    answer = helpAnswer(role);
    actions = [{ label: 'Tổng quan', page: 'dashboard' }];
    tips = ['Gợi ý món bán chạy', 'Cảnh báo kho', 'Món đang chờ bếp'];
  } else if (intent === 'troubleshoot') {
    answer =
      '**Xử lý sự cố thường gặp:**\n' +
      '1. Badge *Mất kết nối* → chạy `npm start` trong thư mục `server`.\n' +
      '2. *Chưa đăng nhập* / 401 → đăng nhập lại.\n' +
      '3. *Không có quyền* → đúng vai trò (vd: Phân quyền chỉ **admin**).\n' +
      '4. MySQL lỗi → kiểm tra `.env` và chạy `node scripts/setup-db.js`.\n\n' +
      'Mô tả chi tiết lỗi bạn gặp, mình gợi ý bước tiếp theo.';
    tips = ['Kiểm tra kết nối server', 'Hướng dẫn quyền'];
  } else if (intent === 'permissions') {
    answer =
      role === 'admin'
        ? 'Bạn là **Quản trị** — có thể dùng **Phân quyền** để gán vai trò nhân viên. Các vai trò: admin, thu_ngan, phuc_vu, bep, kho.'
        : `Vai trò **${ROLE_LABELS[role] || role}** có giới hạn menu. Chỉ **Quản trị** mới vào mục Phân quyền. Hỏi *"hướng dẫn"* để xem quyền của bạn.`;
    if (role === 'admin') actions = [{ label: 'Phân quyền', page: 'permissions' }];
  } else if (intent === 'revenue') {
    if (!['admin', 'thu_ngan'].includes(role)) {
      answer = 'Bạn không có quyền xem báo cáo doanh thu chi tiết. Hỏi *"hướng dẫn"* hoặc liên hệ Thu ngân/Quản trị.';
    } else {
      const res = await answerRevenue(maCn);
      answer = res.answer;
      actions = res.actions || [];
    }
  } else if (intent === 'inventory') {
    if (!['admin', 'kho'].includes(role)) {
      answer = 'Tra cứu kho chi tiết cần vai trò **Kho** hoặc **Quản trị**. Bạn vẫn có thể xem cảnh báo trên **Tổng quan**.';
      actions = [{ label: 'Tổng quan', page: 'dashboard' }];
    } else {
      const res = await answerInventory();
      answer = res.answer;
      actions = res.actions || [];
    }
  } else if (intent === 'kitchen') {
    if (!['admin', 'bep'].includes(role)) {
      answer = 'Cập nhật bếp cần vai trò **Bếp** hoặc **Quản trị**.';
    } else {
      const res = await answerKitchen();
      answer = res.answer;
      actions = res.actions || [];
    }
  } else if (intent === 'reservation') {
    if (!['admin', 'thu_ngan', 'phuc_vu'].includes(role)) {
      answer = 'Đặt bàn dành cho Phục vụ, Thu ngân hoặc Quản trị.';
    } else {
      const res = await answerReservations();
      answer = res.answer;
      actions = res.actions || [];
    }
  } else if (intent === 'order_help') {
    answer =
      '**Order & bàn:**\n' +
      '1. Vào **Bàn & Order** → chọn bàn → mở hóa đơn.\n' +
      '2. Thêm món từ panel hoặc chat (nút **+ Order** khi có gợi ý món).\n' +
      '3. **Thanh toán** — Thu ngân hoặc Quản trị.\n\n' +
      (maHd ? `Đang có hóa đơn **#${maHd}** — có thể gợi ý món để thêm ngay.` : 'Chưa mở order — chọn bàn trước khi thêm món từ chat.');
    actions = [{ label: 'Bàn & Order', page: 'tables' }];
    showMenuActions = !!maHd;
    const menuIntent = matchIntent(message) || { sort: 'popular' };
    suggestions = (await searchMenu(menuIntent, 4)).map((r) => ({
      ma_mon: r.ma_mon,
      ten_mon: r.ten_mon,
      ten_dm: r.ten_dm,
      gia_ban: Number(r.gia_ban),
      don_vi: r.don_vi,
      ly_do: 'Gợi ý thêm order',
    }));
  } else if (intent === 'info') {
    const res = await answerInfo();
    answer = res.answer;
  } else if (intent === 'menu') {
    const menuIntent = matchIntent(message);
    if (maKh > 0 && !menuIntent) {
      const [rows] = await pool.query('CALL sp_ai_goi_y_mon(?, ?)', [maKh, 6]);
      suggestions = rows[0] || rows;
      source = 'customer_history';
    }
    if (menuIntent?.greeting) {
      suggestions = await searchMenu({ sort: 'popular' }, 5);
      source = 'greeting';
    }
    if (!suggestions.length) {
      suggestions = await searchMenu(menuIntent, menuIntent?.combo ? 4 : 6);
    }
    if (!suggestions.length) {
      const [rows] = await pool.query('CALL sp_ai_goi_y_mon(?, ?)', [0, 5]);
      suggestions = rows[0] || rows;
      source = 'popular';
    }
    const mapped = suggestions.map((r) => ({
      ma_mon: r.ma_mon,
      ten_mon: r.ten_mon,
      ten_dm: r.ten_dm,
      gia_ban: Number(r.gia_ban),
      don_vi: r.don_vi,
      mo_ta: r.mo_ta,
      ly_do: r.ly_do || (source === 'customer_history' ? 'Đã từng order' : 'Phù hợp yêu cầu'),
    }));
    suggestions = mapped;
    answer = buildMenuAnswer(message, mapped, menuIntent);
    showMenuActions = true;
    actions = [{ label: 'Thực đơn', page: 'menu' }];
  } else if (intent === 'general' || intent === 'unknown') {
    answer =
      `Mình hiểu bạn đang cần hỗ trợ${message ? ` về: *"${message}"*` : ''}.\n\n` +
      'Mình có thể giúp:\n' +
      '• **Hướng dẫn** hệ thống theo vai trò\n' +
      '• **Doanh thu**, **tồn kho**, **bếp**, **đặt bàn**\n' +
      '• **Gợi ý món** & thêm vào order\n' +
      '• **Xử lý lỗi** kết nối / quyền\n\n' +
      'Hãy nói rõ hơn (vd: "doanh thu hôm nay", "món bán chạy", "lỗi đăng nhập").';
    tips = ['Hướng dẫn', 'Doanh thu hôm nay', 'Cảnh báo kho', 'Gợi ý phở'];
    if (message && matchIntent(message)) {
      const menuIntent = matchIntent(message);
      const rows = await searchMenu(menuIntent, 4);
      if (rows.length) {
        suggestions = rows.map((r) => ({
          ma_mon: r.ma_mon,
          ten_mon: r.ten_mon,
          ten_dm: r.ten_dm,
          gia_ban: Number(r.gia_ban),
          don_vi: r.don_vi,
          ly_do: 'Có thể bạn cần món này',
        }));
        showMenuActions = true;
        answer += '\n\nCó thể bạn quan tâm các món sau:';
      }
    }
  }

  let orderHint = null;
  if (maHd) {
    const [hd] = await pool.query(
      `SELECT h.ma_hd, b.so_ban, h.tong_tien FROM hoa_don h
       LEFT JOIN ban_an b ON h.ma_ban = b.ma_ban WHERE h.ma_hd = ?`,
      [maHd]
    );
    if (hd.length) {
      orderHint = { ma_hd: hd[0].ma_hd, so_ban: hd[0].so_ban, tong_tien: Number(hd[0].tong_tien) };
    }
  }

  return {
    answer,
    suggestions: Array.isArray(suggestions) && suggestions[0]?.ma_mon ? suggestions : [],
    source,
    intent,
    actions,
    tips,
    show_menu_actions: showMenuActions,
    order: orderHint,
  };
}

router.post('/forecast', ...aiRoles, async (req, res) => {
  const days = parseInt(req.body.days || '7', 10);
  try {
    await pool.query('CALL sp_ai_du_bao_nhu_cau(?)', [days]);
    const [rows] = await pool.query(
      `SELECT a.*, m.ten_mon FROM ai_du_bao a
       LEFT JOIN mon_an m ON a.ma_mon = m.ma_mon
       WHERE a.loai = 'nhu_cau_mon' AND a.ngay_tao >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
       ORDER BY a.gia_tri DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/recommend/:maKh', ...aiRoles, async (req, res) => {
  const limit = parseInt(req.query.limit || '5', 10);
  try {
    const [rows] = await pool.query('CALL sp_ai_goi_y_mon(?, ?)', [req.params.maKh, limit]);
    res.json(rows[0] || rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/chat', ...aiRoles, async (req, res) => {
  const message = String(req.body.message || '').trim();
  const maKh = parseInt(req.body.ma_kh || '0', 10);
  const maHd = req.body.ma_hd ? parseInt(req.body.ma_hd, 10) : null;

  try {
    const payload = await processChat(message, req.user, maKh, maHd);
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/anomaly', authMiddleware, requireRole('admin', 'kho'), async (req, res) => {
  try {
    await pool.query('CALL sp_ai_phat_hien_bat_thuong()');
    const [rows] = await pool.query(
      `SELECT a.*, nl.ten_nl FROM ai_du_bao a
       LEFT JOIN nguyen_lieu nl ON a.ma_nl = nl.ma_nl
       WHERE a.loai = 'canh_bao_ton' AND a.ngay_tao >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
       ORDER BY a.ngay_tao DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/insights', ...aiRoles, async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM ai_du_bao ORDER BY ngay_tao DESC LIMIT 30`);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
