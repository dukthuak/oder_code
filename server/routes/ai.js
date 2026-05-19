const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

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

function buildAnswer(message, suggestions, intent) {
  if (!message.trim()) {
    return suggestions.length
      ? `Xin chào! Đây là ${suggestions.length} món đang được khách order nhiều nhất hôm nay. Bấm **Thêm vào order** để gọi món ngay.`
      : 'Xin chào! Hãy mô tả khẩu vị (vd: "phở bò", "đồ uống", "món rẻ") để mình gợi ý món phù hợp.';
  }
  if (intent?.greeting) {
    return suggestions.length
      ? `Xin chào! Mình là trợ lý order. Dưới đây là vài món phổ biến để bạn chọn.`
      : 'Xin chào! Hãy thử hỏi mình về món ăn hoặc order món nhé.';
  }
  if (!suggestions.length) {
    return 'Mình chưa tìm thấy món khớp yêu cầu. Thử hỏi "phở", "đồ uống", "món bán chạy" hoặc "combo cho 4 người" nhé!';
  }
  const names = suggestions.slice(0, 3).map((s) => s.ten_mon).join(', ');
  if (intent?.cat) return `Gợi ý danh mục **${intent.cat}**: ${names}${suggestions.length > 3 ? '…' : ''}.`;
  if (intent?.sort === 'price_asc') return `Các món giá mềm: ${names}.`;
  if (intent?.sort === 'popular') return `Top bán chạy: ${names}. Chọn món để thêm vào order đang mở.`;
  if (intent?.combo) return `Gợi ý combo ~4 người: ${names}. Có thể điều chỉnh số lượng khi thêm.`;
  return `Dựa trên "${message}", mình gợi ý: ${names}${suggestions.length > 3 ? ' và món khác bên dưới' : ''}.`;
}

router.post('/forecast', authMiddleware, async (req, res) => {
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

router.get('/recommend/:maKh', authMiddleware, async (req, res) => {
  const limit = parseInt(req.query.limit || '5', 10);
  try {
    const [rows] = await pool.query('CALL sp_ai_goi_y_mon(?, ?)', [req.params.maKh, limit]);
    res.json(rows[0] || rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/chat', authMiddleware, async (req, res) => {
  const message = String(req.body.message || '').trim();
  const maKh = parseInt(req.body.ma_kh || '0', 10);
  const maHd = req.body.ma_hd ? parseInt(req.body.ma_hd, 10) : null;

  try {
    let suggestions = [];
    let source = 'search';
    const intent = matchIntent(message);

    if (maKh > 0 && !intent) {
      const [rows] = await pool.query('CALL sp_ai_goi_y_mon(?, ?)', [maKh, 6]);
      suggestions = rows[0] || rows;
      source = 'customer_history';
    }

    if (intent?.greeting) {
      suggestions = await searchMenu({ sort: 'popular' }, 5);
      source = 'greeting';
    }

    if (!suggestions.length) {
      suggestions = await searchMenu(intent, intent?.combo ? 4 : 6);
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

    res.json({
      answer: buildAnswer(message, mapped, intent),
      suggestions: mapped,
      source,
      order: orderHint,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/anomaly', authMiddleware, async (req, res) => {
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

router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM ai_du_bao ORDER BY ngay_tao DESC LIMIT 30`);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
