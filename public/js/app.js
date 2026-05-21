const API = '/api';
let user = null;
let currentOrder = null;
let tables = [];
let menu = [];
let menuFilter = '';
let menuCat = '';
let chatOpen = false;

const HD_STATUS = {
  mo: 'Mới',
  dang_che_bien: 'Đang nấu',
  cho_thanh_toan: 'Chờ TT',
  da_thanh_toan: 'Đã TT',
  huy: 'Hủy',
};

const HANG_CLASS = { dong: 'hang-dong', bac: 'hang-bac', vang: 'hang-vang', bach_kim: 'hang-bach_kim' };

/** Trang → vai trò được phép (ten_vt trong CSDL) */
const PAGE_ACCESS = {
  dashboard: ['admin', 'thu_ngan', 'phuc_vu', 'bep', 'kho'],
  tables: ['admin', 'thu_ngan', 'phuc_vu'],
  kitchen: ['admin', 'bep'],
  menu: ['admin', 'thu_ngan', 'phuc_vu', 'bep', 'kho'],
  inventory: ['admin', 'kho'],
  reservations: ['admin', 'thu_ngan', 'phuc_vu'],
  reports: ['admin', 'thu_ngan'],
  ai: ['admin', 'thu_ngan', 'phuc_vu', 'bep', 'kho'],
  permissions: ['admin'],
  admin: ['admin'],
};

const ROLE_LABELS = {
  admin: 'Quản trị',
  thu_ngan: 'Thu ngân',
  phuc_vu: 'Phục vụ',
  bep: 'Bếp',
  kho: 'Kho',
};

function canAccessPage(name) {
  const allowed = PAGE_ACCESS[name];
  if (!allowed) return true;
  return allowed.includes(user?.vai_tro);
}

function firstAllowedPage() {
  const order = [
    'dashboard',
    'tables',
    'kitchen',
    'menu',
    'inventory',
    'reservations',
    'reports',
    'ai',
    'permissions',
    'admin',
  ];
  return order.find((p) => canAccessPage(p)) || 'dashboard';
}

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (user) {
    h['x-user-id'] = String(user.ma_nv);
    h['x-user-role'] = user.vai_tro;
  }
  return h;
}

async function api(path, opts = {}) {
  const res = await fetch(API + path, { ...opts, headers: { ...headers(), ...opts.headers } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function fmt(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
}

function safeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function safeInt(value, fallback = 0) {
  const integer = parseInt(value, 10);
  return Number.isFinite(integer) ? integer : fallback;
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('#toast-wrap').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

const TABLE_STATUS = {
  trong: { label: 'Trống', pill: 'pill-trong' },
  dang_dung: { label: 'Đang dùng', pill: 'pill-dang_dung' },
  dat_truoc: { label: 'Đặt trước', pill: 'pill-dat_truoc' },
};

const MENU_EMOJI = {
  'Khai vị': '🥗',
  'Món chính': '🍜',
  'Đồ uống': '🥤',
  'Tráng miệng': '🍮',
};

function pill(text, type = '') {
  return `<span class="pill ${type}">${safeString(text, '—')}</span>`;
}

function tableStatusLabel(trangThai) {
  const mapped = TABLE_STATUS[trangThai];
  if (mapped?.label) return mapped.label;
  return safeString(trangThai, '—');
}

function tableStatusPill(trangThai) {
  const mapped = TABLE_STATUS[trangThai];
  return pill(tableStatusLabel(trangThai), mapped?.pill || '');
}

function emptyState(icon, msg) {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><p>${msg}</p></div>`;
}

function menuEmoji(cat) {
  return MENU_EMOJI[cat] || '🍽️';
}

function loadUser() {
  const s = sessionStorage.getItem('user');
  if (!s) return;
  try {
    user = JSON.parse(s);
  } catch {
    user = null;
  }
}

function saveUser(u) {
  user = u;
  try {
    sessionStorage.setItem('user', JSON.stringify(u));
  } catch {
    // ignore storage errors
  }
}

function showScreen(id) {
  $$('.screen').forEach((el) => el.classList.remove('active'));
  $(`#${id}`).classList.add('active');
  if (id === 'main-screen') {
    $('#chat-widget')?.classList.remove('hidden');
    updateChatOrderBadge();
  } else {
    $('#chat-widget')?.classList.add('hidden');
  }
}

async function checkHealth() {
  const badge = $('#conn-badge');
  const loginConn = $('#login-conn');
  loadLoginHeroFeatures();
  try {
    await fetch(`${API}/health`);
    badge?.classList.remove('offline');
    badge?.classList.add('online');
    if (badge) badge.textContent = 'Đã kết nối BE';
    if (loginConn) loginConn.textContent = '● Server sẵn sàng';
    return true;
  } catch {
    badge?.classList.remove('online');
    badge?.classList.add('offline');
    if (badge) badge.textContent = 'Mất kết nối';
    if (loginConn) loginConn.textContent = '● Không kết nối được server — chạy npm start';
    return false;
  }
}

function showAccessDenied(name) {
  $$('.page').forEach((p) => p.classList.remove('active'));
  $$('.nav-item').forEach((n) => n.classList.remove('active'));
  $('#page-denied')?.classList.add('active');
  const titles = {
    dashboard: 'Tổng quan',
    tables: 'Bàn & Order',
    kitchen: 'Bếp',
    menu: 'Thực đơn',
    inventory: 'Kho',
    reservations: 'Đặt bàn',
    reports: 'Báo cáo',
    ai: 'AI Insights',
    permissions: 'Phân quyền',
    admin: 'Quản trị',
  };
  const label = titles[name] || name;
  const roleName = ROLE_LABELS[user?.vai_tro] || user?.vai_tro || 'chưa xác định';
  $('#page-title').textContent = 'Không có quyền';
  const msg = $('#denied-message');
  if (msg) {
    msg.innerHTML =
      name === 'permissions'
        ? 'Chỉ tài khoản có thẩm quyền <strong>Quản trị (admin)</strong> mới được sử dụng tính năng phân quyền. Vai trò hiện tại của bạn: <strong>' +
          roleName +
          '</strong>.'
        : `Bạn (${roleName}) không có quyền truy cập <strong>${label}</strong>. Chỉ tài khoản có thẩm quyền phù hợp mới được sử dụng chức năng này.`;
  }
  toast('Không có quyền truy cập chức năng này', 'error');
}

function applyNavRBAC() {
  $$('.nav-item').forEach((btn) => {
    const page = btn.dataset.page;
    const ok = canAccessPage(page);
    btn.classList.toggle('hidden', !ok);
    btn.disabled = !ok;
  });
  $$('.rbac-page-note').forEach((note) => {
    const page = note.dataset.rbacNote;
    note.classList.toggle('hidden', !canAccessPage(page));
  });
  const canPay = ['admin', 'thu_ngan'].includes(user?.vai_tro);
  $('#btn-pay')?.classList.toggle('hidden', !canPay);
}

function setPage(name) {
  if (!canAccessPage(name)) {
    showAccessDenied(name);
    return;
  }
  $$('.page').forEach((p) => p.classList.remove('active'));
  $$('.nav-item').forEach((n) => n.classList.remove('active'));
  $(`#page-${name}`)?.classList.add('active');
  $(`[data-page="${name}"]`)?.classList.add('active');
  const titles = {
    dashboard: 'Tổng quan',
    tables: 'Bàn & Order',
    kitchen: 'Bếp',
    menu: 'Thực đơn',
    inventory: 'Kho',
    reservations: 'Đặt bàn',
    reports: 'Báo cáo',
    ai: 'AI Insights',
    permissions: 'Phân quyền',
    admin: 'Quản trị',
    permissions: 'Quản trị',
  };
  $('#page-title').textContent = titles[name] || name;
  if (name === 'permissions') {
    window.__adminTab = 'staff';
    name = 'admin';
  }
  const loaders = {
    dashboard: loadDashboard,
    tables: loadTables,
    kitchen: () => (window.__loadKitchen ? window.__loadKitchen() : loadKitchen()),
    menu: () => (window.__loadMenu ? window.__loadMenu() : loadMenu()),
    inventory: loadInventory,
    reservations: () => (window.__loadReservations ? window.__loadReservations() : loadReservations()),
    reports: loadReports,
    ai: loadAiPage,
    permissions: () => setPage('admin'),
    admin: () => (window.loadAdminHub ? window.loadAdminHub() : null),
  };
  loaders[name]?.();
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('#login-error');
  err.classList.add('hidden');
  try {
    const u = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: $('#login-email').value,
        password: $('#login-password').value,
      }),
    });
    saveUser(u);
    initMain();
    toast(`Chào ${u.ho_ten}!`, 'success');
  } catch (ex) {
    err.textContent = ex.message;
    err.classList.remove('hidden');
  }
});

$('#logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('user');
  user = null;
  currentOrder = null;
  chatOpen = false;
  showScreen('login-screen');
});

$$('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => setPage(btn.dataset.page));
});

function initMain() {
  showScreen('main-screen');
  const fullName = safeString(user?.ho_ten, 'Người dùng');
  const role = safeString(user?.vai_tro, 'Khách');
  const branch = safeString(user?.ten_cn, `CN #${safeString(user?.ma_cn, '—')}`);
  const nickname = fullName.split(' ').filter(Boolean).pop() || fullName;

  $('#user-info').textContent = `${fullName} · ${role}`;
  $('#topbar-greet').textContent = `Xin chào, ${nickname}`;
  $('#branch-badge').textContent = branch;

  const today = new Date().toISOString().slice(0, 10);
  const from = new Date();
  from.setDate(from.getDate() - 14);
  $('#report-from').value = from.toISOString().slice(0, 10);
  $('#report-to').value = today;
  checkHealth();
  setInterval(checkHealth, 30000);
  initChat();
  applyNavRBAC();
  if ($('#chat-messages') && !$('#chat-messages').children.length) {
    sendChatMessage('', true);
  }
  setPage(firstAllowedPage());
}

let permissionsRoles = [];

async function loadPermissions() {
  const wrap = $('#permissions-table-wrap');
  const rolesRef = $('#roles-reference');
  if (!wrap) return;
  try {
    const [staff, roles] = await Promise.all([api('/permissions/staff'), api('/permissions/roles')]);
    permissionsRoles = safeArray(roles);
    rolesRef.innerHTML = permissionsRoles
      .map(
        (r) => `
      <div class="item">
        <div class="item-left"><strong>${safeString(ROLE_LABELS[r.ten_vt] || r.ten_vt)}</strong> <span class="hint">(${r.ten_vt})</span></div>
        <span class="hint">${safeString(r.mo_ta, '—')}</span>
      </div>`
      )
      .join('');
    wrap.innerHTML = `
      <table>
        <thead><tr><th>Họ tên</th><th>Email</th><th>Chi nhánh</th><th>Vai trò</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
          ${safeArray(staff)
            .map((nv) => {
              const isSelf = nv.ma_nv === user?.ma_nv;
              const roleOpts = permissionsRoles
                .map(
                  (r) =>
                    `<option value="${r.ma_vt}" ${r.ma_vt === nv.ma_vt ? 'selected' : ''}>${ROLE_LABELS[r.ten_vt] || r.ten_vt}</option>`
                )
                .join('');
              return `
            <tr data-nv="${nv.ma_nv}">
              <td>${safeString(nv.ho_ten)}${isSelf ? ' <span class="pill pill-info">Bạn</span>' : ''}</td>
              <td>${safeString(nv.email)}</td>
              <td>${safeString(nv.ten_cn)}</td>
              <td><select class="perm-role input-grow" data-nv="${nv.ma_nv}" ${isSelf ? 'disabled title="Không đổi vai trò của chính mình tại đây"' : ''}>${roleOpts}</select></td>
              <td><select class="perm-status input-grow" data-nv="${nv.ma_nv}" ${isSelf ? 'disabled' : ''}>
                <option value="lam_viec" ${nv.trang_thai === 'lam_viec' ? 'selected' : ''}>Đang làm</option>
                <option value="nghi" ${nv.trang_thai === 'nghi' ? 'selected' : ''}>Nghỉ</option>
              </select></td>
              <td>${isSelf ? '<span class="hint">—</span>' : `<button type="button" class="btn secondary btn-save-perm" data-nv="${nv.ma_nv}">Lưu</button>`}</td>
            </tr>`;
            })
            .join('')}
        </tbody>
      </table>`;
    wrap.querySelectorAll('.btn-save-perm').forEach((btn) => {
      btn.addEventListener('click', () => savePermissionRow(+btn.dataset.nv));
    });
  } catch (e) {
    wrap.innerHTML = emptyState('🔒', e.message);
    toast(e.message, 'error');
  }
}

async function savePermissionRow(maNv) {
  const row = wrapQuery(`tr[data-nv="${maNv}"]`);
  if (!row) return;
  const ma_vt = +row.querySelector('.perm-role')?.value;
  const trang_thai = row.querySelector('.perm-status')?.value;
  try {
    await api(`/permissions/staff/${maNv}`, {
      method: 'PATCH',
      body: JSON.stringify({ ma_vt, trang_thai }),
    });
    toast('Đã cập nhật phân quyền', 'success');
    loadPermissions();
  } catch (e) {
    toast(e.message, 'error');
  }
}

function wrapQuery(sel) {
  return document.querySelector(sel);
}

$('#btn-reload-permissions')?.addEventListener('click', loadPermissions);

const FEATURE_ROLE_OPTS = ['admin', 'thu_ngan', 'phuc_vu', 'bep', 'kho'];
let featureAdminCache = [];

function renderLoginHeroFeatures(items) {
  const ul = $('#login-hero-features');
  if (!ul) return;
  const list = safeArray(items)
    .filter((f) => f.hien_thi && f.ma_trang !== 'admin' && f.ma_trang !== 'admin_features')
    .slice(0, 5);
  if (!list.length) return;
  ul.innerHTML = list.map((f) => `<li>${safeString(f.icon, '📌')} ${safeString(f.ten_chuc_nang, '')}</li>`).join('');
}

function renderFeaturePreview(items) {
  const ul = $('#feature-preview');
  if (!ul) return;
  const list = safeArray(items).filter((f) => f.hien_thi && f.ma_trang !== 'admin_features');
  ul.innerHTML = list.length
    ? list.map((f) => `<li>${safeString(f.icon, '📌')} ${safeString(f.ten_chuc_nang, '')} — ${safeString(f.mo_ta, '').slice(0, 60)}…</li>`).join('')
    : '<li class="hint">Chưa có chức năng hiển thị</li>';
}

async function loadLoginHeroFeatures() {
  try {
    const rows = safeArray(await fetch(`${API}/features`).then((r) => r.json()));
    renderLoginHeroFeatures(rows);
  } catch {
    /* giữ nội dung mặc định trong HTML */
  }
}

function buildFeatureRoleChecks(selected = []) {
  const wrap = $('#feat-roles');
  if (!wrap) return;
  const sel = new Set(safeArray(selected));
  wrap.innerHTML = FEATURE_ROLE_OPTS.map(
    (r) =>
      `<label class="role-check"><input type="checkbox" name="feat-role" value="${r}" ${sel.has(r) ? 'checked' : ''}> ${ROLE_LABELS[r] || r}</label>`
  ).join('');
}

function getSelectedFeatureRoles() {
  return [...document.querySelectorAll('#feat-roles input:checked')].map((el) => el.value);
}

function resetFeatureForm() {
  $('#feat-ma-cn').value = '';
  $('#feat-ma-trang').value = '';
  $('#feat-ma-trang').disabled = false;
  $('#feat-ten').value = '';
  $('#feat-icon').value = '📌';
  $('#feat-thu-tu').value = '1';
  $('#feat-mo-ta').value = '';
  $('#feat-api').value = '';
  $('#feat-hien-thi').checked = true;
  $('#btn-feature-delete')?.classList.add('hidden');
  $('#feature-form-title').textContent = 'Thêm chức năng mới';
  buildFeatureRoleChecks(['admin']);
}

function fillFeatureForm(f) {
  $('#feat-ma-cn').value = f.ma_cn;
  $('#feat-ma-trang').value = f.ma_trang;
  $('#feat-ma-trang').disabled = true;
  $('#feat-ten').value = f.ten_chuc_nang;
  $('#feat-icon').value = f.icon || '📌';
  $('#feat-thu-tu').value = f.thu_tu ?? 0;
  $('#feat-mo-ta').value = f.mo_ta || '';
  $('#feat-api').value = f.api_mo_ta || '';
  $('#feat-hien-thi').checked = !!f.hien_thi;
  $('#btn-feature-delete')?.classList.remove('hidden');
  $('#feature-form-title').textContent = `Sửa: ${safeString(f.ten_chuc_nang, '—')}`;
  buildFeatureRoleChecks(f.vai_tro);
}

async function loadFeatureAdmin() {
  const wrap = $('#features-list-wrap');
  if (!wrap) return;
  try {
    featureAdminCache = safeArray(await api('/features/all'));
    wrap.innerHTML = `
      <table>
        <thead><tr><th></th><th>Trang</th><th>Tên</th><th>Vai trò</th><th>TT</th><th></th></tr></thead>
        <tbody>
          ${featureAdminCache
            .map(
              (f) => `
            <tr>
              <td>${safeString(f.icon, '📌')}</td>
              <td><code>${safeString(f.ma_trang)}</code></td>
              <td>${safeString(f.ten_chuc_nang)}</td>
              <td class="hint">${safeArray(f.vai_tro).map((r) => ROLE_LABELS[r] || r).join(', ')}</td>
              <td>${f.hien_thi ? pill('Hiện', 'pill-success') : pill('Ẩn', 'pill-warning')}</td>
              <td><button type="button" class="btn ghost btn-sm btn-edit-feat" data-id="${f.ma_cn}">Sửa</button></td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>`;
    wrap.querySelectorAll('.btn-edit-feat').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = featureAdminCache.find((x) => x.ma_cn === btn.dataset.id);
        if (item) fillFeatureForm(item);
      });
    });
    renderFeaturePreview(featureAdminCache);
    renderLoginHeroFeatures(featureAdminCache);
    if (!document.querySelector('#feat-ma-cn')?.value) resetFeatureForm();
  } catch (e) {
    const hint =
      e.message?.includes('CHUC_NANG') || e.message?.includes('migrate-chuc-nang')
        ? `${e.message}<br><br>Trong thư mục <code>server</code> chạy: <strong>npm run migrate-chuc-nang</strong> rồi tải lại trang.`
        : e.message;
    wrap.innerHTML = emptyState('⚙️', hint);
    toast(e.message, 'error');
  }
}

$('#btn-feature-new')?.addEventListener('click', resetFeatureForm);
$('#btn-feature-reload')?.addEventListener('click', loadFeatureAdmin);
$('#btn-feature-cancel')?.addEventListener('click', resetFeatureForm);

$('#feature-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ma_cn = $('#feat-ma-cn').value;
  const body = {
    ma_trang: $('#feat-ma-trang').value.trim(),
    ten_chuc_nang: $('#feat-ten').value.trim(),
    icon: $('#feat-icon').value.trim() || '📌',
    mo_ta: $('#feat-mo-ta').value.trim(),
    api_mo_ta: $('#feat-api').value.trim() || null,
    thu_tu: safeInt($('#feat-thu-tu').value, 1),
    hien_thi: $('#feat-hien-thi').checked,
    vai_tro: getSelectedFeatureRoles(),
  };
  if (!getSelectedFeatureRoles().length) return toast('Chọn ít nhất một vai trò', 'error');
  try {
    if (ma_cn) {
      await api(`/features/${ma_cn}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Đã cập nhật chức năng', 'success');
    } else {
      await api('/features', { method: 'POST', body: JSON.stringify(body) });
      toast('Đã thêm chức năng', 'success');
    }
    resetFeatureForm();
    loadFeatureAdmin();
  } catch (ex) {
    toast(ex.message, 'error');
  }
});

$('#btn-feature-delete')?.addEventListener('click', async () => {
  const ma_cn = $('#feat-ma-cn').value;
  if (!ma_cn || !confirm('Xóa chức năng này?')) return;
  try {
    await api(`/features/${ma_cn}`, { method: 'DELETE' });
    toast('Đã xóa', 'success');
    resetFeatureForm();
    loadFeatureAdmin();
  } catch (ex) {
    toast(ex.message, 'error');
  }
});

async function loadDashboard() {
  if (typeof window.__loadDash === 'function') return window.__loadDash();
  try {
    const [dash, top, alerts] = await Promise.all([
      api(`/reports/dashboard?ma_cn=${user.ma_cn}`),
      api('/reports/top-dishes'),
      api('/inventory/alerts'),
    ]);
    const topList = safeArray(top);
    const alertList = safeArray(alerts);
    $('#top-dishes').innerHTML = topList.length
      ? topList
          .map(
            (m, i) => `
        <div class="item">
          <div class="item-left">
            <span class="rank rank-${Math.min(i + 1, 3)}">${i + 1}</span>
            <span>${safeString(m.ten_mon, '—')}</span>
          </div>
          <span>${safeNumber(m.tong_sl, 0)} phần</span>
        </div>`
          )
          .join('')
      : emptyState('🍽️', 'Chưa có dữ liệu bán hàng');
    $('#stock-alerts').innerHTML = alertList.length
      ? alertList
          .map((a) => {
            const pt = a.muc_canh_bao === 'het_hang' ? 'pill-danger' : 'pill-warning';
            return `
        <div class="item">
          <div class="item-left">
            <span>${safeString(a.ten_nl, '—')}</span>
          </div>
          ${pill(safeString(a.muc_canh_bao, 'Không rõ').replace(/_/g, ' '), pt)}
        </div>`;
          })
          .join('')
      : emptyState('✅', 'Kho ổn định');
    $('#stats-grid').innerHTML = `
      <div class="stat-card stat-gold"><div class="stat-icon">🔥</div><div class="value">${safeNumber(top.length, 0)}</div><div class="label">Món có doanh số</div></div>
      <div class="stat-card stat-rose"><div class="stat-icon">📦</div><div class="value">${safeNumber(alerts.length, 0)}</div><div class="label">Cảnh báo kho</div></div>
      <div class="stat-card stat-emerald"><div class="stat-icon">👤</div><div class="value">${safeString(user?.vai_tro, '—')}</div><div class="label">Vai trò</div></div>`;
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function loadTables() {
  try {
    tables = safeArray(await api(`/tables?ma_cn=${user.ma_cn}`));
    menu = safeArray(await api('/menu'));
    const sel = $('#add-mon-select');
    if (sel) {
      const options = menu
        .filter((m) => safeString(m.trang_thai) === 'con')
        .map((m) => `<option value="${safeString(m.ma_mon)}">${safeString(m.ten_mon)} — ${fmt(m.gia_ban)}đ</option>`)
        .join('');
      sel.innerHTML = options || '<option value="">Chưa có món</option>';
    }

    $('#tables-grid').innerHTML = tables
      .map(
        (t) => `
    <div class="table-card ${t.trang_thai}" data-ban="${t.ma_ban}" data-soban="${t.so_ban}">
      <span class="num">${t.so_ban}</span>
      ${tableStatusPill(t.trang_thai)}
      <span class="meta">${t.suc_chua} chỗ</span>
    </div>`
      )
      .join('');

    $$('.table-card').forEach((card) => {
      card.addEventListener('click', () => openTable(card.dataset.ban, card.dataset.soban));
    });
    updateChatOrderBadge();
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function openTable(maBan, soBan) {
  try {
    const lists = await Promise.all(
      ['mo', 'dang_che_bien', 'cho_thanh_toan'].map((s) =>
        api(`/orders?ma_cn=${user.ma_cn}&trang_thai=${s}`)
      )
    );
    const orders = lists.flat();
    let hd = orders.find((o) => String(o.ma_ban) === String(maBan));
    if (!hd) {
      const created = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({ ma_ban: maBan, ma_cn: user.ma_cn }),
      });
      hd = { ma_hd: created.ma_hd, ma_ban: maBan, so_ban: soBan };
      toast(`Đã mở order #${created.ma_hd} bàn ${soBan}`, 'success');
    }
    currentOrder = { ma_hd: hd.ma_hd, ma_ban: maBan, so_ban: soBan || hd.so_ban };
    $('#order-panel').classList.remove('hidden');
    $('#current-hd').textContent = currentOrder.ma_hd;
    $('#current-ban').textContent = currentOrder.so_ban;
    await refreshOrder();
    updateChatOrderBadge();
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function refreshOrder() {
  if (!currentOrder) return;
  const items = safeArray(await api(`/orders/${currentOrder.ma_hd}/details`));
  const QT_LABELS = { cho: 'Chờ bếp', dang_nau: 'Đang nấu', xong: 'Đã xong' };
  let total = 0;
  $('#order-items').innerHTML = items.length
    ? items
        .map((i) => {
          const t = safeNumber(i.so_luong, 0) * safeNumber(i.don_gia, 0);
          total += t;
          const st =
            i.trang_thai_mon === 'xong'
              ? 'pill-success'
              : i.trang_thai_mon === 'dang_nau'
                ? 'pill-warning'
                : '';
          const qtLabel = QT_LABELS[i.trang_thai_mon] || safeString(i.trang_thai_mon, '—');
          return `<div class="item"><span>${safeString(i.ten_mon, '—')} ×${safeNumber(i.so_luong, 0)}</span><span>${fmt(t)}đ ${pill(qtLabel, st)}</span></div>`;
        })
        .join('')
    : emptyState('🛒', 'Chưa có món — hỏi AI bên phải');
  $('#order-total').textContent = fmt(total);
  updateChatOrderBadge();
}

async function addItemToOrder(maMon, qty = 1) {
  if (!currentOrder) {
    toast('Mở bàn trước (Bàn & Order) rồi thêm món', 'error');
    setPage('tables');
    return false;
  }
  await api(`/orders/${currentOrder.ma_hd}/items`, {
    method: 'POST',
    body: JSON.stringify({ ma_mon: +maMon, so_luong: qty }),
  });
  await refreshOrder();
  return true;
}

$('#btn-new-order').addEventListener('click', () => {
  const free = tables.filter((t) => t.trang_thai === 'trong');
  if (!free.length) return toast('Không còn bàn trống', 'error');
  showModal(
    'Chọn bàn',
    `<select id="modal-ban" class="input-grow">${free.map((t) => `<option value="${t.ma_ban}" data-so="${t.so_ban}">${t.so_ban} (${t.suc_chua} chỗ)</option>`).join('')}</select>`,
    async () => {
      const sel = $('#modal-ban');
      const soBan = sel.options[sel.selectedIndex].dataset.so;
      await openTable(sel.value, soBan);
      hideModal();
      loadTables();
    }
  );
});

$('#btn-add-item').addEventListener('click', async () => {
  if (!currentOrder) return toast('Chọn bàn trước', 'error');
  try {
    const qty = safeNumber($('#add-sl').value, 1);
    await addItemToOrder($('#add-mon-select').value, qty > 0 ? qty : 1);
    toast('Đã thêm món', 'success');
  } catch (e) {
    toast(e.message, 'error');
  }
});

$('#btn-pay').addEventListener('click', async () => {
  if (!currentOrder) return;
  const total = safeInt($('#order-total')?.textContent.replace(/\D/g, ''), 0);
  if (total <= 0) return toast('Tổng tiền không hợp lệ', 'error');
  try {
    await api(`/orders/${currentOrder.ma_hd}/pay`, {
      method: 'POST',
      body: JSON.stringify({ hinh_thuc: 'qr', so_tien: total }),
    });
    toast('Thanh toán thành công', 'success');
    currentOrder = null;
    $('#order-panel').classList.add('hidden');
    updateChatOrderBadge();
    loadTables();
  } catch (e) {
    toast(e.message, 'error');
  }
});

$('#btn-open-chat')?.addEventListener('click', () => toggleChat(true));

async function loadKitchen() {
  try {
    const q = await api('/orders/kitchen/queue');
    $('#kitchen-queue').innerHTML = q.length
      ? q
          .map(
            (t) => `
      <div class="kitchen-ticket ${t.trang_thai_mon === 'dang_nau' ? 'cooking' : ''}" data-ct="${t.ma_ct}">
        <div>
          <strong>${t.ten_mon}</strong>
          <p class="kitchen-meta">×${t.so_luong} · Bàn ${t.so_ban || '—'}</p>
        </div>
        <button class="btn ${t.trang_thai_mon === 'cho' ? 'secondary' : 'primary'}" onclick="kitchenDone(${t.ma_ct})">${t.trang_thai_mon === 'cho' ? 'Bắt đầu' : 'Hoàn thành'}</button>
      </div>`
          )
          .join('')
      : emptyState('👨‍🍳', 'Bếp đang nhàn rỗi');
  } catch (e) {
    toast(e.message, 'error');
  }
}

window.kitchenDone = async (maCt) => {
  const tickets = await api('/orders/kitchen/queue');
  const t = tickets.find((x) => x.ma_ct === maCt);
  const next = t?.trang_thai_mon === 'cho' ? 'dang_nau' : 'xong';
  await api(`/orders/items/${maCt}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ trang_thai_mon: next }),
  });
  loadKitchen();
};

async function loadMenu() {
  try {
    const items = await api('/menu');
    $('#menu-grid').innerHTML = items
      .map(
        (m) => `
    <div class="menu-item">
      <div class="menu-item-visual">${menuEmoji(m.ten_dm)}</div>
      <div class="menu-item-body">
        <span class="cat">${m.ten_dm}</span>
        <h4>${m.ten_mon}</h4>
        <p class="price">${fmt(m.gia_ban)}đ <small>/ ${m.don_vi}</small></p>
        <div class="footer">${pill(m.trang_thai === 'con' ? 'Còn' : safeString(m.trang_thai, '—'), m.trang_thai === 'con' ? 'pill-con' : 'pill-danger')}</div></div>
    </div>`
      )
      .join('');
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function loadInventory() {
  try {
    const rows = safeArray(await api('/inventory'));
    $('#inventory-table').innerHTML = `
    <div class="data-table-wrap">
      <table>
        <thead><tr><th>Nguyên liệu</th><th>Tồn</th><th>ĐVT</th><th>Tối thiểu</th><th>Giá nhập</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr class="${safeNumber(r.ton_kho, 0) <= safeNumber(r.ton_toi_thieu, 0) ? 'low-stock' : ''}">
              <td>${safeString(r.ten_nl, '—')}</td>
              <td>${safeNumber(r.ton_kho, 0)}</td>
              <td>${safeString(r.don_vi, '—')}</td>
              <td>${safeNumber(r.ton_toi_thieu, 0)}</td>
              <td>${fmt(r.gia_nhap)}đ</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`;
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function loadReservations() {
  if (typeof window.__loadReservations === 'function') return window.__loadReservations();
  try {
    const rows = safeArray(await api('/reservations'));
    const sp = { cho: 'pill-warning', xac_nhan: 'pill-success', huy: 'pill-danger' };
    $('#reservations-list').innerHTML = rows.length
      ? rows
          .map(
            (d) => `
      <div class="reservation-card">
        <div>
          <div class="guest">${safeString(d.ho_ten, 'Walk-in')}</div>
          <div class="detail">Bàn ${safeString(d.so_ban, '—')} · ${safeNumber(d.so_nguoi, 2)} người · ${new Date(d.ngay_gio).toLocaleString('vi-VN')}</div>
        </div>
        ${pill(safeString(d.trang_thai, 'xac_nhan'), sp[d.trang_thai] || 'pill-info')}
      </div>`
          )
          .join('')
      : emptyState('📅', 'Chưa có đặt bàn');
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function loadReports() {
  $('#btn-report').click();
}

async function loadAiPage() {
  try {
    const data = await api('/ai/insights');
    const rows = Array.isArray(data) ? data : [];
    if (rows.length) renderAi(rows);
  } catch (_) {}
}

$('#btn-report').addEventListener('click', async () => {
  try {
    const rows = await api(
      `/reports/revenue?tu=${$('#report-from').value}&den=${$('#report-to').value}&ma_cn=${user.ma_cn}`
    );
    const max = Math.max(...rows.map((r) => +r.doanh_thu || 0), 1);
    $('#report-chart').innerHTML = rows.length
      ? rows
          .map(
            (r) => `
      <div class="bar-row">
        <span>${String(r.ngay).slice(0, 10)}</span>
        <div class="bar-track"><div class="bar" style="width:${(r.doanh_thu / max) * 100}%"></div></div>
        <span class="bar-value">${fmt(r.doanh_thu)}đ</span>
      </div>`
          )
          .join('')
      : emptyState('📈', 'Không có dữ liệu');
  } catch (e) {
    toast(e.message, 'error');
  }
});

$('#btn-ai-forecast').addEventListener('click', async () => {
  try {
    const rows = await api('/ai/forecast', { method: 'POST', body: JSON.stringify({ days: 7 }) });
    renderAi(rows);
    toast('Đã chạy dự báo AI', 'success');
  } catch (e) {
    toast(e.message, 'error');
  }
});

$('#btn-ai-anomaly').addEventListener('click', async () => {
  try {
    const rows = await api('/ai/anomaly', { method: 'POST' });
    renderAi(rows);
    toast('Đã quét kho AI', 'success');
  } catch (e) {
    toast(e.message, 'error');
  }
});

$('#btn-ai-recommend').addEventListener('click', async () => {
  try {
    const rows = await api('/ai/recommend/2?limit=5');
    $('#ai-recommend').innerHTML = (Array.isArray(rows) ? rows : [])
      .map((r) => `<div class="item"><span>${r.ten_mon}</span><span>${fmt(r.gia_ban)}đ</span></div>`)
      .join('') || '<p class="hint">Chưa có gợi ý</p>';
  } catch (e) {
    toast(e.message, 'error');
  }
});

function renderAi(rows) {
  $('#ai-results').innerHTML = rows.length
    ? rows
        .map(
          (r) => `
      <div class="item">
        <span>${safeString(r.ten_mon || r.ten_nl || r.loai, '—')}<span class="ai-tag">AI</span></span>
        <span class="ai-insight-text">${safeString(r.noi_dung || r.gia_tri, '—')}</span>
      </div>`
        )
        .join('')
    : '<p class="hint">Chạy phân tích để xem kết quả</p>';
}

/* ─── AI Chat ─── */
function updateChatOrderBadge() {
  const badge = $('#chat-order-badge');
  if (!badge) return;
  if (currentOrder) {
    badge.textContent = `Order #${currentOrder.ma_hd}`;
    badge.title = `Hóa đơn #${currentOrder.ma_hd} · Bàn ${currentOrder.so_ban}`;
    badge.classList.add('has-order');
  } else {
    badge.textContent = '·';
    badge.title = 'Chưa mở order — vẫn chat hỗ trợ bình thường';
    badge.classList.remove('has-order');
  }
}

function toggleChat(open) {
  chatOpen = open ?? !chatOpen;
  $('#chat-panel')?.classList.toggle('open', chatOpen);
  $('#chat-fab')?.classList.toggle('open', chatOpen);
  if (chatOpen) $('#chat-input')?.focus();
}

function appendChatMsg(role, html) {
  const wrap = document.createElement('div');
  wrap.className = `chat-msg ${role}`;
  wrap.innerHTML = `<div class="chat-bubble">${html}</div>`;
  $('#chat-messages').appendChild(wrap);
  $('#chat-messages').scrollTop = $('#chat-messages').scrollHeight;
  return wrap;
}

function formatChatAnswer(text) {
  return escapeHtml(safeString(text, ''))
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function renderChatTips(tips) {
  const items = Array.isArray(tips) ? tips.filter(Boolean) : [];
  if (!items.length) return '';
  return `<div class="chat-tips">${items
    .map((t) => `<button type="button" class="chat-tip-btn" data-q="${escapeHtml(t)}">${escapeHtml(t)}</button>`)
    .join('')}</div>`;
}

function renderChatActions(actions) {
  const items = Array.isArray(actions) ? actions.filter((a) => a.page && canAccessPage(a.page)) : [];
  if (!items.length) return '';
  return `<div class="chat-actions">${items
    .map((a) => `<button type="button" class="chat-action-btn" data-page="${a.page}">${escapeHtml(a.label)}</button>`)
    .join('')}</div>`;
}

function renderSuggestions(suggestions, showOrderButtons = true) {
  const items = Array.isArray(suggestions) ? suggestions : [];
  if (!items.length) return '';
  return `<div class="chat-suggestions">${items
    .map((s) => {
      const category = safeString(s.ten_dm, 'Khác');
      const itemName = safeString(s.ten_mon, 'Gợi ý món');
      const price = safeNumber(s.gia_ban, 0);
      const reason = safeString(s.ly_do, '');
      const emoji = menuEmoji(category);
      const orderBtn = showOrderButtons
        ? `<button type="button" class="btn-add-chat" data-mon="${safeString(s.ma_mon)}" data-name="${itemName}">+ Order</button>`
        : '';
      return `
    <div class="chat-suggest-card">
      <span class="emoji">${emoji}</span>
      <div class="info">
        <div class="name">${itemName}</div>
        <div class="meta">${category} · ${fmt(price)}đ${reason ? ` · ${reason}` : ''}</div>
      </div>
      ${orderBtn}
    </div>`;
    })
    .join('')}</div>`;
}

function bindChatExtras(container) {
  container.querySelectorAll('.chat-tip-btn').forEach((btn) => {
    btn.addEventListener('click', () => sendChatMessage(btn.dataset.q));
  });
  container.querySelectorAll('.chat-action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setPage(btn.dataset.page);
      toggleChat(false);
    });
  });
}

function bindSuggestionButtons(container) {
  container.querySelectorAll('.btn-add-chat').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        if (!currentOrder) {
          const freeTables = tables.filter((t) => t.trang_thai === 'trong');
          if (freeTables.length === 1) {
            await openTable(freeTables[0].ma_ban, freeTables[0].so_ban);
          } else {
            toast('Chọn bàn trước hoặc mở order mới để thêm món từ chat.', 'info');
            setPage('tables');
            return;
          }
        }
        const ok = await addItemToOrder(btn.dataset.mon, 1);
        if (ok) toast(`Đã thêm ${btn.dataset.name}`, 'success');
      } catch (e) {
        toast(e.message, 'error');
      } finally {
        btn.disabled = false;
      }
    });
  });
}

async function sendChatMessage(text, silent = false) {
  if (!user) return;
  const msg = text.trim();
  if (!silent && msg) appendChatMsg('user', escapeHtml(msg));

  const typing = appendChatMsg('bot', '<div class="chat-typing"><span></span><span></span><span></span></div>');

  try {
    const data = await api('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: msg,
        ma_kh: 2,
        ma_hd: currentOrder?.ma_hd || null,
      }),
    });
    typing.remove();
    const showOrder = data.show_menu_actions !== false && !!data.suggestions?.length;
    const html =
      formatChatAnswer(data.answer) +
      renderChatActions(data.actions) +
      renderChatTips(data.tips) +
      renderSuggestions(data.suggestions, showOrder);
    const bubble = appendChatMsg('bot', html);
    bindChatExtras(bubble);
    if (showOrder) bindSuggestionButtons(bubble);
    if (data?.order) updateChatOrderBadge();
  } catch (e) {
    typing.remove();
    appendChatMsg('bot', `Lỗi: ${escapeHtml(e.message)}. Kiểm tra server & đăng nhập.`);
  }
}

function escapeHtml(s) {
  const text = s == null ? '' : String(s);
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function initChat() {
  $('#chat-fab')?.addEventListener('click', () => toggleChat());
  $('#chat-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#chat-input');
    const v = input.value.trim();
    if (!v) return;
    input.value = '';
    sendChatMessage(v);
  });
  $$('#chat-quick button').forEach((btn) => {
    btn.addEventListener('click', () => sendChatMessage(btn.dataset.q));
  });
}

let modalOk = null;
function showModal(title, body, onOk) {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = body;
  modalOk = onOk;
  $('#modal').classList.remove('hidden');
}
function hideModal() {
  $('#modal').classList.add('hidden');
  modalOk = null;
}
$('#modal-cancel')?.addEventListener('click', hideModal);
$('#modal-backdrop')?.addEventListener('click', hideModal);
$('#modal-ok')?.addEventListener('click', () => modalOk?.());

checkHealth();
loadUser();
if (user) initMain();
else showScreen('login-screen');
