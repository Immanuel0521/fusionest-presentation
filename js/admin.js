/* ============================================================
   FUSIONest — Admin Dashboard JavaScript
   CRUD for projects, media upload, leads management
   ============================================================ */

'use strict';

// ── CONFIG ────────────────────────────────────────────────────
const DEFAULT_PIN = 'fusionest';
const ADMIN_SESSION_KEY = 'fn_admin_auth';
const PROJECTS_KEY = 'fn_projects';
const LEADS_KEY    = 'fn_leads';
const PIN_KEY      = 'fn_admin_pin';

// ── STATE ─────────────────────────────────────────────────────
let editingProjectId = null;
let featuredImageData = null; // base64
let galleryImagesData = [];   // array of base64

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initLogin();
  initSidebar();
  initProjectModal();
  initLeads();
  initSettings();
});

// ── AUTH ──────────────────────────────────────────────────────
function getPin() { return localStorage.getItem(PIN_KEY) || DEFAULT_PIN; }

function checkAuth() {
  const auth = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (auth === 'true') {
    showApp();
  }
}

function showApp() {
  const login = document.getElementById('login-screen');
  if (login) login.classList.add('hidden');
  loadDashboard();
  updateLeadsBadge();
}

function initLogin() {
  const btn   = document.getElementById('login-btn');
  const input = document.getElementById('pin-input');
  const err   = document.getElementById('login-error');

  function attempt() {
    const val = (input?.value || '').trim();
    if (val === getPin()) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      showApp();
    } else {
      if (err) { err.classList.add('show'); setTimeout(() => err.classList.remove('show'), 3000); }
      if (input) { input.value = ''; input.focus(); }
    }
  }

  if (btn) btn.addEventListener('click', attempt);
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });

  const logout = document.getElementById('logout-btn');
  if (logout) {
    logout.addEventListener('click', () => {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      location.reload();
    });
  }
}

// ── SIDEBAR ───────────────────────────────────────────────────
function initSidebar() {
  const links = document.querySelectorAll('.sidebar-link[data-page]');
  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const pageId = link.dataset.page;
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const page = document.getElementById('page-' + pageId);
      if (page) page.classList.add('active');
      if (pageId === 'projects') renderProjectsTable();
      if (pageId === 'leads')    renderLeadsTable();
      if (pageId === 'dashboard') loadDashboard();
    });
  });
}

// ── DASHBOARD ─────────────────────────────────────────────────
function loadDashboard() {
  const projects = getProjects();
  const leads    = getLeads();
  const published= projects.filter(p => p.published !== false);
  const featured = projects.filter(p => p.featured);

  setText('ds-projects', projects.length);
  setText('ds-published', published.length);
  setText('ds-leads', leads.length);
  setText('ds-featured', featured.length);

  // Recent projects table
  const tbody = document.getElementById('dash-projects-body');
  if (tbody) {
    const recent = projects.slice(-8).reverse();
    tbody.innerHTML = recent.length ? recent.map(p => `
      <tr>
        <td style="font-weight:600;">${esc(p.name)}</td>
        <td><span class="badge badge-gold">${esc(p.category)}</span></td>
        <td>${esc(p.location || '—')}</td>
        <td><span class="badge ${p.status === 'Completed' ? 'badge-green' : 'badge-steel'}">${esc(p.status)}</span></td>
        <td>${p.featured ? '⭐' : '—'}</td>
      </tr>
    `).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px;">No projects yet.</td></tr>';
  }
}

function updateLeadsBadge() {
  const badge = document.getElementById('leads-badge');
  if (badge) badge.textContent = getLeads().length;
}

// ── PROJECT STORAGE ───────────────────────────────────────────
function getProjects() {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); }
  catch { return []; }
}

function saveProjects(arr) { localStorage.setItem(PROJECTS_KEY, JSON.stringify(arr)); }

function deleteProject(id) {
  if (!confirm('Delete this project? This cannot be undone.')) return;
  const arr = getProjects().filter(p => p.id !== id);
  saveProjects(arr);
  renderProjectsTable();
  loadDashboard();
  notify('Project deleted.', 'success');
}

function togglePublish(id) {
  const arr = getProjects();
  const p   = arr.find(p => p.id === id);
  if (p) { p.published = !p.published; saveProjects(arr); renderProjectsTable(); }
}

function toggleFeatured(id) {
  const arr = getProjects();
  const p   = arr.find(p => p.id === id);
  if (p) { p.featured = !p.featured; saveProjects(arr); renderProjectsTable(); }
}

// ── PROJECTS TABLE ────────────────────────────────────────────
function renderProjectsTable() {
  const projects = getProjects();
  const tbody    = document.getElementById('projects-table-body');
  const noProj   = document.getElementById('no-projects');
  if (!tbody) return;

  if (!projects.length) {
    tbody.innerHTML = '';
    noProj && (noProj.style.display = 'block');
    return;
  }
  noProj && (noProj.style.display = 'none');

  tbody.innerHTML = [...projects].reverse().map(p => `
    <tr>
      <td style="color:var(--text-muted);font-size:0.75rem;">${esc(p.code || '—')}</td>
      <td style="font-weight:600;">${esc(p.name)}</td>
      <td><span class="badge badge-gold">${esc(p.category)}</span></td>
      <td>${esc(p.location || '—')}</td>
      <td><span class="badge ${p.status === 'Completed' ? 'badge-green' : 'badge-steel'}">${esc(p.status)}</span></td>
      <td>
        <button onclick="togglePublish(${p.id})" class="btn-outline" style="padding:6px 12px;font-size:0.7rem;">
          ${p.published !== false ? '✅ Live' : '⬛ Draft'}
        </button>
      </td>
      <td>
        <button onclick="toggleFeatured(${p.id})" style="background:none;border:none;cursor:pointer;font-size:1.1rem;">
          ${p.featured ? '⭐' : '☆'}
        </button>
      </td>
      <td>
        <div style="display:flex;gap:8px;">
          <button onclick="openEditProject(${p.id})" class="btn-outline" style="padding:6px 12px;font-size:0.7rem;">Edit</button>
          <button onclick="deleteProject(${p.id})" class="btn-danger">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── PROJECT MODAL ─────────────────────────────────────────────
function initProjectModal() {
  const overlay  = document.getElementById('project-modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  const cancelBtn= document.getElementById('modal-cancel');
  const newBtn   = document.getElementById('new-project-btn');
  const form     = document.getElementById('project-form');

  function openModal(title = 'New Project') {
    const mTitle = document.getElementById('modal-title');
    if (mTitle) mTitle.textContent = title;
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    form && form.reset();
    editingProjectId = null;
    featuredImageData = null;
    galleryImagesData = [];
    const fp = document.getElementById('featured-preview');
    if (fp) fp.style.display = 'none';
    const gp = document.getElementById('gallery-preview');
    if (gp) gp.innerHTML = '';
    const pfid = document.getElementById('pf-id');
    if (pfid) pfid.value = '';
  }

  if (newBtn) newBtn.addEventListener('click', () => { closeModal(); openModal('New Project'); });
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  // Form submit
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name     = document.getElementById('pf-name')?.value?.trim();
      const category = document.getElementById('pf-category')?.value;
      const location = document.getElementById('pf-location')?.value?.trim();
      if (!name || !category || !location) {
        notify('Please fill in Name, Category and Location.', 'error');
        return;
      }
      const isEdit = !!editingProjectId;
      const id     = isEdit ? editingProjectId : Date.now();
      const project = {
        id,
        name,
        code:        document.getElementById('pf-code')?.value?.trim() || '',
        category,
        location,
        status:      document.getElementById('pf-status')?.value || 'Completed',
        area:        document.getElementById('pf-area')?.value?.trim() || '',
        floors:      document.getElementById('pf-floors')?.value?.trim() || '',
        clientType:  document.getElementById('pf-client-type')?.value || '',
        startDate:   document.getElementById('pf-start')?.value || '',
        endDate:     document.getElementById('pf-end')?.value || '',
        description: document.getElementById('pf-desc')?.value?.trim() || '',
        featured:    document.getElementById('pf-featured')?.checked || false,
        published:   document.getElementById('pf-published')?.checked !== false,
        featuredImage: featuredImageData || (isEdit ? getProjects().find(p => p.id === id)?.featuredImage : null),
        gallery:     galleryImagesData.length ? galleryImagesData : (isEdit ? getProjects().find(p => p.id === id)?.gallery : []),
        createdAt:   isEdit ? (getProjects().find(p => p.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt:   new Date().toISOString()
      };

      const arr = getProjects();
      if (isEdit) {
        const idx = arr.findIndex(p => p.id === editingProjectId);
        if (idx !== -1) arr[idx] = project;
        else arr.push(project);
      } else {
        arr.push(project);
      }
      saveProjects(arr);
      closeModal();
      renderProjectsTable();
      loadDashboard();
      notify(isEdit ? 'Project updated!' : 'Project created!', 'success');
    });
  }

  // Image uploads
  initImageUpload(
    'featured-upload-area', 'featured-file',
    (data) => {
      featuredImageData = data;
      const preview = document.getElementById('featured-preview');
      const img     = document.getElementById('featured-preview-img');
      if (preview && img) { img.src = data; preview.style.display = 'block'; }
    },
    false
  );

  const featuredRemove = document.getElementById('featured-remove');
  if (featuredRemove) {
    featuredRemove.addEventListener('click', () => {
      featuredImageData = null;
      const preview = document.getElementById('featured-preview');
      if (preview) preview.style.display = 'none';
    });
  }

  initImageUpload(
    'gallery-upload-area', 'gallery-file',
    (dataArr) => {
      galleryImagesData = [...galleryImagesData, ...dataArr].slice(0, 20);
      renderGalleryPreview();
    },
    true
  );
}

// Open edit project
window.openEditProject = function(id) {
  const p = getProjects().find(p => p.id === id);
  if (!p) return;
  editingProjectId = id;
  featuredImageData = p.featuredImage || null;
  galleryImagesData = p.gallery || [];

  setValue('pf-id', id);
  setValue('pf-name', p.name);
  setValue('pf-code', p.code);
  setValue('pf-category', p.category);
  setValue('pf-status', p.status);
  setValue('pf-location', p.location);
  setValue('pf-area', p.area);
  setValue('pf-floors', p.floors);
  setValue('pf-client-type', p.clientType);
  setValue('pf-start', p.startDate);
  setValue('pf-end', p.endDate);
  setValue('pf-desc', p.description);
  setChecked('pf-featured', p.featured);
  setChecked('pf-published', p.published !== false);

  if (p.featuredImage) {
    const preview = document.getElementById('featured-preview');
    const img     = document.getElementById('featured-preview-img');
    if (preview && img) { img.src = p.featuredImage; preview.style.display = 'block'; }
  }

  renderGalleryPreview();

  const overlay  = document.getElementById('project-modal-overlay');
  const mTitle   = document.getElementById('modal-title');
  if (mTitle) mTitle.textContent = 'Edit Project';
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.deleteProject   = deleteProject;
window.togglePublish   = togglePublish;
window.toggleFeatured  = toggleFeatured;

function renderGalleryPreview() {
  const container = document.getElementById('gallery-preview');
  if (!container) return;
  container.innerHTML = galleryImagesData.map((img, i) => `
    <div class="image-preview-item">
      <img src="${img}" alt="Gallery image ${i + 1}" />
      <button class="image-preview-remove" onclick="removeGalleryImage(${i})" aria-label="Remove image ${i + 1}">✕</button>
    </div>
  `).join('');
}

window.removeGalleryImage = function(idx) {
  galleryImagesData.splice(idx, 1);
  renderGalleryPreview();
};

// ── IMAGE UPLOAD HELPER ───────────────────────────────────────
function initImageUpload(areaId, inputId, callback, multiple) {
  const area  = document.getElementById(areaId);
  const input = document.getElementById(inputId);
  if (!area || !input) return;

  area.addEventListener('click', () => input.click());

  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const files = e.dataTransfer?.files;
    if (files) processFiles(files, multiple, callback);
  });

  input.multiple = !!multiple;
  input.addEventListener('change', () => {
    if (input.files?.length) processFiles(input.files, multiple, callback);
    input.value = '';
  });
}

function processFiles(files, multiple, callback) {
  const results = [];
  const fileArr = Array.from(files).slice(0, multiple ? 20 : 1);
  let loaded = 0;
  fileArr.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { notify('Image too large (max 5MB).', 'error'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      results.push(e.target.result);
      loaded++;
      if (loaded === fileArr.length) {
        if (multiple) callback(results);
        else callback(results[0]);
      }
    };
    reader.readAsDataURL(file);
  });
}

// ── LEADS ─────────────────────────────────────────────────────
function getLeads() {
  try { return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]'); }
  catch { return []; }
}

function initLeads() {
  const clearBtn = document.getElementById('clear-leads-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Clear all leads? This cannot be undone.')) return;
      localStorage.setItem(LEADS_KEY, '[]');
      renderLeadsTable();
      updateLeadsBadge();
      setText('ds-leads', 0);
    });
  }
}

function renderLeadsTable() {
  const leads = getLeads();
  const tbody = document.getElementById('leads-table-body');
  const noEl  = document.getElementById('no-leads');
  if (!tbody) return;

  if (!leads.length) {
    tbody.innerHTML = '';
    noEl && (noEl.style.display = 'block');
    return;
  }
  noEl && (noEl.style.display = 'none');

  tbody.innerHTML = [...leads].reverse().map(l => `
    <tr>
      <td style="color:var(--text-muted);font-size:0.72rem;white-space:nowrap;">
        ${l.date ? new Date(l.date).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}) : '—'}
      </td>
      <td style="font-weight:600;">${esc(l.name)}</td>
      <td><a href="tel:${esc(l.phone)}" style="color:var(--steel);">${esc(l.phone)}</a></td>
      <td><span class="badge badge-gold">${esc(l.type)}</span></td>
      <td>${esc(l.location || '—')}</td>
      <td>${esc(l.area || '—')}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary);font-size:0.78rem;">
        ${esc(l.message || '—')}
      </td>
    </tr>
  `).join('');
}

// ── SETTINGS ──────────────────────────────────────────────────
function initSettings() {
  const saveBtn = document.getElementById('save-pin-btn');
  const msg     = document.getElementById('pin-msg');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', () => {
    const curr    = document.getElementById('curr-pin')?.value || '';
    const newPin  = document.getElementById('new-pin')?.value || '';
    const confirm = document.getElementById('confirm-pin')?.value || '';

    if (curr !== getPin()) {
      if (msg) { msg.textContent = '✗ Current PIN is incorrect.'; msg.style.color = 'var(--red)'; }
      return;
    }
    if (newPin.length < 4) {
      if (msg) { msg.textContent = '✗ New PIN must be at least 4 characters.'; msg.style.color = 'var(--red)'; }
      return;
    }
    if (newPin !== confirm) {
      if (msg) { msg.textContent = '✗ PINs do not match.'; msg.style.color = 'var(--red)'; }
      return;
    }
    localStorage.setItem(PIN_KEY, newPin);
    if (msg) { msg.textContent = '✓ PIN updated successfully!'; msg.style.color = 'var(--green)'; }
    document.getElementById('curr-pin').value = '';
    document.getElementById('new-pin').value  = '';
    document.getElementById('confirm-pin').value = '';
    notify('Admin PIN updated!', 'success');
  });
}

// ── NOTIFICATION ──────────────────────────────────────────────
function notify(message, type = 'success') {
  const notif = document.getElementById('notif');
  if (!notif) return;
  notif.textContent = message;
  notif.className   = `notif ${type} show`;
  setTimeout(() => notif.classList.remove('show'), 3000);
}

// ── UTILS ─────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }
function setChecked(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }
