/* UI extensions — load sau app.js */
(function () {
  const HANG_CLASS = { dong: 'hang-dong', bac: 'hang-bac', vang: 'hang-vang', bach_kim: 'hang-bach_kim' };
  const HD_STATUS = { mo: 'Mới', dang_che_bien: 'Đang nấu', cho_thanh_toan: 'Chờ TT', da_thanh_toan: 'Đã TT', huy: 'Hủy' };

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function safeString(value, fallback = '') {
    if (value === null || value === undefined) return fallback;
    return String(value);
  }

  function safeNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  document.querySelectorAll('.demo-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.getElementById('login-email').value = chip.dataset.email;
      document.getElementById('login-password').value = 'password123';
    });
  });

  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector(`[data-page="${btn.dataset.goto}"]`)?.click();
    });
  });

  document.getElementById('btn-close-order')?.addEventListener('click', () => {
    document.getElementById('order-panel')?.classList.add('hidden');
  });

  let menuCache = [];
  let menuCatFilter = '';
  let menuSearch = '';

  function renderMenuGrid() {
    const q = menuSearch.toLowerCase();
    const filtered = safeArray(menuCache).filter((m) => {
      const tenDm = safeString(m.ten_dm);
      const tenMon = safeString(m.ten_mon);
      if (menuCatFilter && tenDm !== menuCatFilter) return false;
      if (q && !tenMon.toLowerCase().includes(q)) return false;
      return true;
    });
    const grid = document.getElementById('menu-grid');
    if (!grid) return;
    const em = { 'Khai vị': '🥗', 'Món chính': '🍜', 'Đồ uống': '🥤', 'Tráng miệng': '🍮' };
    grid.innerHTML = filtered.length
      ? filtered
          .map(
            (m) => `
    <div class="menu-item">
      <div class="menu-item-visual">${em[m.ten_dm] || '🍽️'}</div>
      <div class="menu-item-body">
        <span class="cat">${m.ten_dm}</span>
        <h4>${m.ten_mon}</h4>
        <p class="price">${fmt(m.gia_ban)}đ <small>/ ${m.don_vi}</small></p>
        <div class="footer"><span class="pill ${m.trang_thai === 'con' ? 'pill-con' : 'pill-danger'}">${m.trang_thai === 'con' ? 'Còn' : 'Hết'}</span></div>
      </div>
    </div>`
          )
          .join('')
      : '<div class="empty-state"><div class="empty-icon">🔍</div><p>Không tìm thấy món</p></div>';
  }

  async function loadMenuEnhanced() {
    menuCache = safeArray(await api('/menu'));
    renderMenuGrid();
  }

  document.getElementById('menu-search')?.addEventListener('input', (e) => {
    menuSearch = e.target.value;
    renderMenuGrid();
  });

  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      menuCatFilter = chip.dataset.cat || '';
      renderMenuGrid();
    });
  });

  async function loadKitchenEnhanced() {
    const q = safeArray(await api('/orders/kitchen/queue'));
    const cho = q.filter((x) => x.trang_thai_mon === 'cho').length;
    const nau = q.filter((x) => x.trang_thai_mon === 'dang_nau').length;
    const stats = document.getElementById('kitchen-stats');
    if (stats) {
      stats.innerHTML = `<span class="kitchen-stat-pill"><strong>${q.length}</strong> tổng</span>
        <span class="kitchen-stat-pill"><strong>${cho}</strong> chờ</span>
        <span class="kitchen-stat-pill"><strong>${nau}</strong> đang nấu</span>`;
    }
    document.getElementById('kitchen-queue').innerHTML = q.length
      ? q
          .map(
            (t) => `
      <div class="kitchen-ticket ${t.trang_thai_mon === 'dang_nau' ? 'cooking' : ''}">
        <div><strong>${t.ten_mon}</strong><p class="kitchen-meta">×${t.so_luong} · Bàn ${t.so_ban || '—'} · HD #${t.ma_hd}</p></div>
        <button class="btn ${t.trang_thai_mon === 'cho' ? 'secondary' : 'primary'}" onclick="kitchenDone(${t.ma_ct})">${t.trang_thai_mon === 'cho' ? '▶ Bắt đầu' : '✓ Xong'}</button>
      </div>`
          )
          .join('')
      : '<div class="empty-state"><div class="empty-icon">👨‍🍳</div><p>Bếp nhàn rỗi</p></div>';
  }

  async function loadReservationsEnhanced() {
    const rows = safeArray(await api('/reservations'));
    const sp = { cho: 'pill-warning', xac_nhan: 'pill-success', huy: 'pill-danger', hoan_thanh: 'pill-info' };
    document.getElementById('reservations-list').innerHTML = rows.length
      ? rows
          .map(
            (d) => `
      <div class="reservation-card">
        <div>
          <div class="guest">${d.ho_ten || 'Walk-in'}</div>
          <div class="detail">Bàn ${d.so_ban} · ${d.so_nguoi} người · ${new Date(d.ngay_gio).toLocaleString('vi-VN')}</div>
          ${d.ghi_chu ? `<div class="detail">${d.ghi_chu}</div>` : ''}
        </div>
        <div class="reservation-actions">
          <span class="pill ${sp[d.trang_thai] || ''}">${d.trang_thai}</span>
          ${d.trang_thai === 'cho' ? `<button class="btn btn-xs primary" onclick="confirmReservation(${d.ma_dat})">Xác nhận</button>` : ''}
        </div>
      </div>`
          )
          .join('')
      : '<div class="empty-state"><div class="empty-icon">📅</div><p>Chưa có đặt bàn</p></div>';
  }

  window.confirmReservation = async (maDat) => {
    await api(`/reservations/${maDat}/status`, { method: 'PATCH', body: JSON.stringify({ trang_thai: 'xac_nhan' }) });
    toast('Đã xác nhận', 'success');
    loadReservationsEnhanced();
  };

  document.getElementById('btn-new-reservation')?.addEventListener('click', async () => {
    const [tbl, kh] = await Promise.all([safeArray(await api(`/tables?ma_cn=${user.ma_cn}`)), safeArray(await api('/reports/customers'))]);
    showModal(
      'Đặt bàn mới',
      `<div class="modal-grid">
         <div class="field">
           <label>Khách</label>
           <select id="res-kh" class="input-grow">${kh.map((k) => `<option value="${k.ma_kh}">${k.ho_ten}</option>`).join('')}</select>
         </div>
         <div class="field">
           <label>Bàn trống</label>
           <select id="res-ban" class="input-grow">${tbl.filter((t) => t.trang_thai === 'trong').map((t) => `<option value="${t.ma_ban}">${t.so_ban}</option>`).join('')}</select>
         </div>
         <div class="field">
           <label>Ngày giờ</label>
           <input type="datetime-local" id="res-dt" class="input-date">
         </div>
         <div class="field">
           <label>Số người</label>
           <input type="number" id="res-nguoi" value="2" min="1" class="input-sm">
         </div>
         <div class="field field-full">
           <label>Ghi chú</label>
           <input id="res-note" class="input-grow" placeholder="Ví dụ: sinh nhật, kèm trẻ em...">
         </div>
       </div>`,
      async () => {
        const dt = document.getElementById('res-dt').value;
        if (!dt) return toast('Chọn ngày giờ', 'error');
        await api('/reservations', {
          method: 'POST',
          body: JSON.stringify({
            ma_kh: safeNumber(document.getElementById('res-kh')?.value, 0),
            ma_ban: safeNumber(document.getElementById('res-ban')?.value, 0),
            ma_cn: user?.ma_cn ?? null,
            ngay_gio: new Date(dt).toISOString(),
            so_nguoi: Math.max(1, safeNumber(document.getElementById('res-nguoi')?.value, 1)),
            ghi_chu: safeString(document.getElementById('res-note')?.value, null),
          }),
        });
        hideModal();
        toast('Đã đặt bàn', 'success');
        loadReservationsEnhanced();
      }
    );
    const d = new Date();
    d.setHours(d.getHours() + 2);
    document.getElementById('res-dt').value = d.toISOString().slice(0, 16);
  });

  async function loadDashboardEnhanced() {
    const [dash, top, alerts] = await Promise.all([
      api(`/reports/dashboard?ma_cn=${user.ma_cn}`),
      api('/reports/top-dishes'),
      api('/inventory/alerts'),
    ]);
    const dashboard = dash || {};
    const dishList = safeArray(top);
    const alertList = safeArray(alerts);
    const recent = safeArray(dashboard.gan_day);
    const vipList = safeArray(dashboard.khach_vip);

    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card stat-gold"><div class="stat-icon">💰</div><div class="value">${fmt(dashboard.doanh_thu_hom_nay)}</div><div class="label">Doanh thu hôm nay</div><div class="sub">${safeNumber(dashboard.so_hd_hom_nay, 0)} hóa đơn</div></div>
      <div class="stat-card stat-violet"><div class="stat-icon">🧾</div><div class="value">${safeNumber(dashboard.order_dang_mo, 0)}</div><div class="label">Order mở</div><div class="sub">${safeNumber(dashboard.mon_bep_cho, 0)} món chờ bếp</div></div>
      <div class="stat-card stat-emerald"><div class="stat-icon">🪑</div><div class="value">${safeNumber(dashboard.ban_dang_dung, 0)}</div><div class="label">Bàn đang dùng</div><div class="sub">${safeNumber(dashboard.ban_trong, 0)} trống · ${safeNumber(dashboard.ban_dat_truoc, 0)} đặt trước</div></div>
      <div class="stat-card stat-rose"><div class="stat-icon">📦</div><div class="value">${alertList.length}</div><div class="label">Cảnh báo kho</div></div>`;

    document.getElementById('top-dishes').innerHTML = dishList
      .slice(0, 6)
      .map(
        (m, i) => `<div class="item"><div class="item-left"><span class="rank rank-${Math.min(i + 1, 3)}">${i + 1}</span><span>${safeString(m.ten_mon, '—')}</span></div><span style="color:var(--gold-light)">${safeNumber(m.tong_sl, 0)} phần</span></div>`
      )
      .join('') || '<p class="hint">Chưa có dữ liệu</p>';

    document.getElementById('stock-alerts').innerHTML = alertList
      .map(
        (a) => `<div class="item"><span>${safeString(a.ten_nl, '—')}</span><span class="pill ${a.muc_canh_bao === 'het_hang' ? 'pill-danger' : 'pill-warning'}">${safeString(a.muc_canh_bao, '').replace(/_/g, ' ')}</span></div>`
      )
      .join('') || '<p class="hint">Kho ổn</p>';

    const act = document.getElementById('recent-activity');
    if (act)
      act.innerHTML = recent
        .map(
          (h) => `<div class="activity-item"><div><strong>HD #${safeString(h.ma_hd, '—')}</strong> Bàn ${safeString(h.so_ban, '—')}<div class="activity-meta">${safeString(h.ten_khach, 'Khách lẻ')}</div></div><span>${fmt(safeNumber(h.tong_tien, 0) - safeNumber(h.giam_gia, 0))}đ</span></div>`
        )
        .join('') || '<p class="hint">Trống</p>';

    const vip = document.getElementById('vip-customers');
    if (vip)
      vip.innerHTML = vipList
        .map(
          (k) => `<div class="vip-item"><span class="vip-avatar">${safeString(k.ho_ten, 'U').charAt(0)}</span><div style="flex:1"><strong>${safeString(k.ho_ten, '—')}</strong><div class="activity-meta">${fmt(safeNumber(k.diem_tich_luy, 0))} điểm</div></div><span class="${HANG_CLASS[safeString(k.hang_thanh_vien)] || ''}">${safeString(k.hang_thanh_vien, '—')}</span></div>`
        )
        .join('') || '<p class="hint">Trống</p>';
  }

  window.__loadDash = loadDashboardEnhanced;
  window.__loadMenu = loadMenuEnhanced;
  window.__loadKitchen = loadKitchenEnhanced;
  window.__loadReservations = loadReservationsEnhanced;

  if (user) loadDashboardEnhanced().catch(() => {});
})();
