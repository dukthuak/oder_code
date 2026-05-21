/* Trung tâm Quản trị — nhập dữ liệu trực tiếp vào MySQL */
(function () {
  const BAN_LABEL = { trong: 'Trống', dang_dung: 'Có khách', dat_truoc: 'Đã đặt' };

  function adminNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function switchAdminTab(name) {
    document.querySelectorAll('.admin-tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.adminTab === name);
    });
    document.querySelectorAll('.admin-tab-panel').forEach((p) => {
      p.classList.toggle('active', p.id === `admin-panel-${name}`);
    });
    const loaders = {
      overview: loadAdminOverview,
      features: () => typeof loadFeatureAdmin === 'function' && loadFeatureAdmin(),
      categories: loadAdminCategories,
      menu: loadAdminMenu,
      tables: loadAdminTables,
      staff: () => {
        loadAdminStaffList();
        typeof loadPermissions === 'function' && loadPermissions();
      },
      customers: loadAdminCustomers,
      inventory: loadAdminInventory,
    };
    loaders[name]?.();
  }

  async function loadAdminOverview() {
    const grid = document.getElementById('admin-stats-grid');
    if (!grid) return;
    try {
      const d = await api('/admin/overview');
      const tongBan =
        adminNum(d.ban_trong) + adminNum(d.ban_dang_dung) + adminNum(d.ban_dat_truoc);
      grid.innerHTML = `
        <div class="stat-card stat-gold"><div class="value">${adminNum(d.danh_muc)}</div><div class="label">Danh mục</div></div>
        <div class="stat-card stat-violet"><div class="value">${adminNum(d.mon_an)}</div><div class="label">Món ăn</div></div>
        <div class="stat-card stat-emerald"><div class="value">${tongBan}</div><div class="label">Bàn</div></div>
        <div class="stat-card stat-rose"><div class="value">${adminNum(d.nhan_vien)}</div><div class="label">Nhân viên</div></div>
        <div class="stat-card"><div class="value">${adminNum(d.khach_hang)}</div><div class="label">Khách</div></div>
        <div class="stat-card"><div class="value">${adminNum(d.nguyen_lieu)}</div><div class="label">Nguyên liệu</div></div>
        <div class="stat-card"><div class="value">${adminNum(d.chuc_nang)}</div><div class="label">Chức năng web</div></div>`;
      const hero = document.getElementById('login-hero-stats');
      if (hero) {
        hero.innerHTML = `
          <div><strong>${adminNum(d.mon_an)}</strong><span>Món</span></div>
          <div><strong>${adminNum(d.ban_trong) + adminNum(d.ban_dang_dung)}</strong><span>Bàn</span></div>
          <div><strong>${adminNum(d.chuc_nang)}</strong><span>Chức năng</span></div>`;
      }
      const heroList = document.getElementById('login-hero-features');
      if (heroList && d.chuc_nang === 0) {
        heroList.innerHTML = '<li>Đăng nhập Quản trị → thêm chức năng web</li>';
      }
    } catch (e) {
      grid.innerHTML = `<p class="hint">${e.message}</p>`;
    }
  }

  function bindDeleteButtons(container, delFn, reloadFn) {
    container.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Xóa mục này?')) return;
        try {
          await delFn(btn.dataset.del);
          toast('Đã xóa', 'success');
          reloadFn();
        } catch (e) {
          toast(e.message, 'error');
        }
      });
    });
  }

  async function loadAdminCategories() {
    const wrap = document.getElementById('admin-cat-table');
    if (!wrap) return;
    try {
      const rows = safeArray(await api('/admin/categories'));
      wrap.innerHTML = rows.length
        ? `<table><thead><tr><th>Mã</th><th>Tên danh mục</th><th></th></tr></thead><tbody>
          ${rows.map((r) => `<tr><td>${r.ma_dm}</td><td>${r.ten_dm}</td><td><button type="button" class="btn ghost btn-sm" data-del="${r.ma_dm}">Xóa</button></td></tr>`).join('')}
          </tbody></table>`
        : '<p class="hint">Chưa có danh mục — thêm ở form phía trên.</p>';
      bindDeleteButtons(
        wrap,
        (id) => api(`/admin/categories/${id}`, { method: 'DELETE' }),
        loadAdminCategories
      );
    } catch (e) {
      wrap.innerHTML = `<p class="hint">${e.message}</p>`;
    }
  }

  async function loadAdminMenu() {
    const wrap = document.getElementById('admin-menu-table');
    const sel = document.getElementById('admin-menu-dm');
    if (!wrap) return;
    try {
      const [menuRaw, catsRaw] = await Promise.all([
        api('/admin/menu'),
        api('/admin/categories'),
      ]);
      const menu = safeArray(menuRaw);
      const cats = safeArray(catsRaw);
      if (sel) {
        sel.innerHTML = cats.length
          ? cats.map((c) => `<option value="${c.ma_dm}">${c.ten_dm}</option>`).join('')
          : '<option value="">— Thêm danh mục trước —</option>';
      }
      const MON_LABEL = { con: 'Còn', het: 'Hết', ngung: 'Ngừng' };
      wrap.innerHTML = menu.length
        ? `<table><thead><tr><th>Mã</th><th>Tên</th><th>DM</th><th>Giá</th><th>TT</th><th></th></tr></thead><tbody>
          ${menu.map((m) => `<tr><td>${m.ma_mon}</td><td>${m.ten_mon}</td><td>${m.ten_dm || '—'}</td><td>${fmt(m.gia_ban)}đ</td><td>${MON_LABEL[m.trang_thai] || m.trang_thai || '—'}</td>
          <td><button type="button" class="btn ghost btn-sm" data-del="${m.ma_mon}">Xóa</button></td></tr>`).join('')}
          </tbody></table>`
        : '<p class="hint">Chưa có món — chọn danh mục và nhập form trên.</p>';
      bindDeleteButtons(wrap, (id) => api(`/admin/menu/${id}`, { method: 'DELETE' }), loadAdminMenu);
    } catch (e) {
      wrap.innerHTML = `<p class="hint">${e.message}</p>`;
    }
  }

  async function loadAdminTables() {
    const wrap = document.getElementById('admin-tables-table');
    if (!wrap) return;
    try {
      const rows = safeArray(await api('/admin/tables'));
      wrap.innerHTML = rows.length
        ? `<table><thead><tr><th>Bàn</th><th>Vị trí</th><th>Chỗ</th><th>Trạng thái</th><th></th></tr></thead><tbody>
          ${rows.map((t) => `<tr><td>${t.so_ban}</td><td>${t.vi_tri || '—'}</td><td>${t.suc_chua}</td><td>${BAN_LABEL[t.trang_thai] || t.trang_thai || '—'}</td>
          <td><button type="button" class="btn ghost btn-sm" data-del="${t.ma_ban}">Xóa</button></td></tr>`).join('')}
          </tbody></table>`
        : '<p class="hint">Chưa có bàn — thêm ở form trên.</p>';
      bindDeleteButtons(wrap, (id) => api(`/admin/tables/${id}`, { method: 'DELETE' }), loadAdminTables);
    } catch (e) {
      wrap.innerHTML = `<p class="hint">${e.message}</p>`;
    }
  }

  async function loadAdminStaffList() {
    try {
      await api('/admin/staff');
    } catch {
      /* list via permissions */
    }
  }

  async function loadAdminCustomers() {
    const wrap = document.getElementById('admin-kh-table');
    if (!wrap) return;
    try {
      const rows = safeArray(await api('/admin/customers'));
      wrap.innerHTML = rows.length
        ? `<table><thead><tr><th>Mã</th><th>Họ tên</th><th>SĐT</th><th>Điểm</th><th></th></tr></thead><tbody>
          ${rows.map((k) => `<tr><td>${k.ma_kh}</td><td>${k.ho_ten}</td><td>${k.sdt}</td><td>${k.diem_tich_luy}</td>
          <td><button type="button" class="btn ghost btn-sm" data-del="${k.ma_kh}">Xóa</button></td></tr>`).join('')}
          </tbody></table>`
        : '<p class="hint">Chưa có khách hàng.</p>';
      bindDeleteButtons(wrap, (id) => api(`/admin/customers/${id}`, { method: 'DELETE' }), loadAdminCustomers);
    } catch (e) {
      wrap.innerHTML = `<p class="hint">${e.message}</p>`;
    }
  }

  async function loadAdminInventory() {
    const wrap = document.getElementById('admin-nl-table');
    if (!wrap) return;
    try {
      const rows = safeArray(await api('/admin/inventory'));
      wrap.innerHTML = rows.length
        ? `<table><thead><tr><th>Mã</th><th>Tên NL</th><th>Tồn</th><th>ĐVT</th><th>Cập nhật tồn</th><th></th></tr></thead><tbody>
          ${rows
            .map(
              (n) => `<tr>
              <td>${n.ma_nl}</td><td>${n.ten_nl}</td><td>${n.ton_kho}</td><td>${n.don_vi}</td>
              <td><input type="number" class="input-sm admin-nl-ton-input" data-id="${n.ma_nl}" value="${n.ton_kho}" style="width:80px">
                <button type="button" class="btn ghost btn-sm" data-save-ton="${n.ma_nl}">Lưu</button></td>
              <td><button type="button" class="btn ghost btn-sm" data-del="${n.ma_nl}">Xóa</button></td></tr>`
            )
            .join('')}
          </tbody></table>`
        : '<p class="hint">Chưa có nguyên liệu.</p>';
      wrap.querySelectorAll('[data-save-ton]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const inp = wrap.querySelector(`input[data-id="${btn.dataset.saveTon}"]`);
          try {
            await api(`/admin/inventory/${btn.dataset.saveTon}`, {
              method: 'PATCH',
              body: JSON.stringify({ ton_kho: safeNumber(inp?.value, 0) }),
            });
            toast('Đã cập nhật tồn', 'success');
          } catch (e) {
            toast(e.message, 'error');
          }
        });
      });
      bindDeleteButtons(wrap, (id) => api(`/admin/inventory/${id}`, { method: 'DELETE' }), loadAdminInventory);
    } catch (e) {
      wrap.innerHTML = `<p class="hint">${e.message}</p>`;
    }
  }

  window.loadAdminHub = function loadAdminHub() {
    switchAdminTab(window.__adminTab || 'overview');
    window.__adminTab = null;
  };

  document.getElementById('admin-tabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.admin-tab');
    if (btn) switchAdminTab(btn.dataset.adminTab);
  });

  document.getElementById('admin-cat-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ ten_dm: document.getElementById('admin-cat-ten').value.trim() }),
      });
      document.getElementById('admin-cat-ten').value = '';
      toast('Đã lưu danh mục', 'success');
      loadAdminCategories();
      loadAdminOverview();
    } catch (ex) {
      toast(ex.message, 'error');
    }
  });

  document.getElementById('admin-menu-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ma_dm = document.getElementById('admin-menu-dm')?.value;
    if (!ma_dm) return toast('Thêm danh mục trước', 'error');
    try {
      await api('/admin/menu', {
        method: 'POST',
        body: JSON.stringify({
          ma_dm,
          ten_mon: document.getElementById('admin-menu-ten').value.trim(),
          gia_ban: safeNumber(document.getElementById('admin-menu-gia').value, 0),
          don_vi: document.getElementById('admin-menu-dvt').value || 'Phần',
        }),
      });
      document.getElementById('admin-menu-ten').value = '';
      toast('Đã lưu món', 'success');
      loadAdminMenu();
      loadAdminOverview();
    } catch (ex) {
      toast(ex.message, 'error');
    }
  });

  document.getElementById('admin-table-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/admin/tables', {
        method: 'POST',
        body: JSON.stringify({
          ten_ban: document.getElementById('admin-table-ten').value.trim(),
          vi_tri: document.getElementById('admin-table-vitri').value,
          suc_chua: safeInt(document.getElementById('admin-table-suc').value, 4),
        }),
      });
      document.getElementById('admin-table-ten').value = '';
      toast('Đã lưu bàn', 'success');
      loadAdminTables();
      loadAdminOverview();
    } catch (ex) {
      toast(ex.message, 'error');
    }
  });

  document.getElementById('admin-staff-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const r = await api('/admin/staff', {
        method: 'POST',
        body: JSON.stringify({
          ho_ten: document.getElementById('admin-staff-ten').value.trim(),
          email: document.getElementById('admin-staff-email').value.trim(),
          sdt: document.getElementById('admin-staff-sdt').value.trim(),
          chuc_vu: document.getElementById('admin-staff-chuc').value,
          password: document.getElementById('admin-staff-pass').value.trim() || undefined,
        }),
      });
      toast(r.message || 'Đã thêm nhân viên', 'success');
      document.getElementById('admin-staff-form').reset();
      loadPermissions();
      loadAdminOverview();
    } catch (ex) {
      toast(ex.message, 'error');
    }
  });

  document.getElementById('admin-kh-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/admin/customers', {
        method: 'POST',
        body: JSON.stringify({
          ho_ten: document.getElementById('admin-kh-ten').value.trim(),
          sdt: document.getElementById('admin-kh-sdt').value.trim(),
          diem_tich_luy: safeInt(document.getElementById('admin-kh-diem').value, 0),
        }),
      });
      document.getElementById('admin-kh-form').reset();
      toast('Đã lưu khách hàng', 'success');
      loadAdminCustomers();
      loadAdminOverview();
    } catch (ex) {
      toast(ex.message, 'error');
    }
  });

  document.getElementById('admin-nl-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/admin/inventory', {
        method: 'POST',
        body: JSON.stringify({
          ten_nl: document.getElementById('admin-nl-ten').value.trim(),
          ton_kho: safeNumber(document.getElementById('admin-nl-ton').value, 0),
          don_vi: document.getElementById('admin-nl-dvt').value || 'Kg',
        }),
      });
      document.getElementById('admin-nl-ten').value = '';
      toast('Đã lưu nguyên liệu', 'success');
      loadAdminInventory();
      loadAdminOverview();
    } catch (ex) {
      toast(ex.message, 'error');
    }
  });
})();
