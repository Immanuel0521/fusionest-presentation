/* ============================================================
   FUSIONest — Admin Dashboard JavaScript (v2 - Fixed)
   ============================================================ */

// ── CONFIG ────────────────────────────────────────────────────
const DEFAULT_PIN      = 'fusionest';
const ADMIN_SESSION_KEY = 'fn_admin_auth';
const PROJECTS_KEY      = 'fn_projects';
const LEADS_KEY         = 'fn_leads';
const PIN_KEY           = 'fn_admin_pin';

// ── GLOBAL STATE (accessible everywhere) ─────────────────────
let editingProjectId  = null;
let featuredImageData = null;
let galleryImagesData = [];

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  checkAuth();
  initLogin();
  initSidebar();
  initProjectForm();
  initImageUploads();
  initLeads();
  initSettings();
});

// ── AUTH ──────────────────────────────────────────────────────
function getPin() {
  return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
}

function checkAuth() {
  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
    showApp();
  }
}

function showApp() {
  var login = document.getElementById('login-screen');
  if (login) login.classList.add('hidden');
  loadDashboard();
  updateLeadsBadge();
}

function initLogin() {
  var btn   = document.getElementById('login-btn');
  var input = document.getElementById('pin-input');
  var err   = document.getElementById('login-error');

  function attempt() {
    var val = (input ? input.value : '').trim();
    if (val === getPin()) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      showApp();
    } else {
      if (err) {
        err.classList.add('show');
        setTimeout(function () { err.classList.remove('show'); }, 3000);
      }
      if (input) { input.value = ''; input.focus(); }
    }
  }

  if (btn)   btn.addEventListener('click', attempt);
  if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') attempt(); });

  var logout = document.getElementById('logout-btn');
  if (logout) {
    logout.addEventListener('click', function () {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      location.reload();
    });
  }
}

// ── SIDEBAR ───────────────────────────────────────────────────
function initSidebar() {
  var links = document.querySelectorAll('.sidebar-link[data-page]');
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      links.forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
      var pageId = link.dataset.page;
      document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
      var page = document.getElementById('page-' + pageId);
      if (page) page.classList.add('active');
      if (pageId === 'projects') renderProjectsTable();
      if (pageId === 'leads')    renderLeadsTable();
      if (pageId === 'dashboard') loadDashboard();
    });
  });
}

// ── DASHBOARD ─────────────────────────────────────────────────
function loadDashboard() {
  var projects  = getProjects();
  var leads     = getLeads();
  var published = projects.filter(function (p) { return p.published !== false; });
  var featured  = projects.filter(function (p) { return p.featured; });

  setText('ds-projects', projects.length);
  setText('ds-published', published.length);
  setText('ds-leads', leads.length);
  setText('ds-featured', featured.length);

  var tbody = document.getElementById('dash-projects-body');
  if (tbody) {
    var recent = projects.slice().reverse().slice(0, 8);
    if (recent.length) {
      tbody.innerHTML = recent.map(function (p) {
        return '<tr>' +
          '<td style="font-weight:600;">' + esc(p.name) + '</td>' +
          '<td><span class="badge badge-gold">' + esc(p.category) + '</span></td>' +
          '<td>' + esc(p.location || '—') + '</td>' +
          '<td><span class="badge ' + (p.status === 'Completed' ? 'badge-green' : 'badge-steel') + '">' + esc(p.status) + '</span></td>' +
          '<td>' + (p.featured ? '⭐' : '—') + '</td>' +
          '</tr>';
      }).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px;">No projects yet.</td></tr>';
    }
  }
}

function updateLeadsBadge() {
  var badge = document.getElementById('leads-badge');
  if (badge) badge.textContent = getLeads().length;
}

// ── PROJECT STORAGE ───────────────────────────────────────────
function getProjects() {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); }
  catch (e) { return []; }
}

function saveProjects(arr) {
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(arr)); }
  catch (e) { notify('Storage error. Images may be too large.', 'error'); }
}

// ── MODAL OPEN / CLOSE (global so openEditProject can call them) ──
function openModal(title) {
  var mTitle = document.getElementById('modal-title');
  if (mTitle) mTitle.textContent = title || 'New Project';
  var overlay = document.getElementById('project-modal-overlay');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  var overlay = document.getElementById('project-modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';

  // Reset state
  editingProjectId  = null;
  featuredImageData = null;
  galleryImagesData = [];

  // Reset form
  var form = document.getElementById('project-form');
  if (form) form.reset();

  // Reset previews
  var fp = document.getElementById('featured-preview');
  if (fp) fp.style.display = 'none';
  var gp = document.getElementById('gallery-preview');
  if (gp) gp.innerHTML = '';
}

// ── PROJECT FORM ──────────────────────────────────────────────
function initProjectForm() {
  // New project button
  var newBtn = document.getElementById('new-project-btn');
  if (newBtn) {
    newBtn.addEventListener('click', function () {
      closeModal();
      openModal('New Project');
    });
  }

  // Close / cancel
  var closeBtn  = document.getElementById('modal-close');
  var cancelBtn = document.getElementById('modal-cancel');
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Click outside modal to close
  var overlay = document.getElementById('project-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  // Form submit
  var form = document.getElementById('project-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    saveProject();
  });

  // Also wire up the save button directly as a backup
  var saveBtn = document.getElementById('save-project-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function (e) {
      e.preventDefault();
      saveProject();
    });
  }
}

function saveProject() {
  var name     = (document.getElementById('pf-name')     ? document.getElementById('pf-name').value     : '').trim();
  var category = (document.getElementById('pf-category') ? document.getElementById('pf-category').value : '').trim();
  var location = (document.getElementById('pf-location') ? document.getElementById('pf-location').value : '').trim();

  if (!name) {
    notify('Please enter a project name.', 'error');
    document.getElementById('pf-name') && document.getElementById('pf-name').focus();
    return;
  }
  if (!category) {
    notify('Please select a category.', 'error');
    document.getElementById('pf-category') && document.getElementById('pf-category').focus();
    return;
  }
  if (!location) {
    notify('Please enter a location.', 'error');
    document.getElementById('pf-location') && document.getElementById('pf-location').focus();
    return;
  }

  var isEdit    = !!editingProjectId;
  var id        = isEdit ? editingProjectId : Date.now();
  var existing  = isEdit ? (getProjects().find(function (p) { return p.id === id; }) || {}) : {};

  var project = {
    id:           id,
    name:         name,
    code:         getValue('pf-code'),
    category:     category,
    location:     location,
    status:       getValue('pf-status') || 'Completed',
    area:         getValue('pf-area'),
    floors:       getValue('pf-floors'),
    clientType:   getValue('pf-client-type'),
    startDate:    getValue('pf-start'),
    endDate:      getValue('pf-end'),
    description:  getValue('pf-desc'),
    featured:     getChecked('pf-featured'),
    published:    getChecked('pf-published'),
    featuredImage: featuredImageData !== null ? featuredImageData : (existing.featuredImage || null),
    gallery:      galleryImagesData.length > 0 ? galleryImagesData : (existing.gallery || []),
    createdAt:    existing.createdAt || new Date().toISOString(),
    updatedAt:    new Date().toISOString()
  };

  var arr = getProjects();
  if (isEdit) {
    var idx = arr.findIndex(function (p) { return p.id === id; });
    if (idx !== -1) { arr[idx] = project; }
    else { arr.push(project); }
  } else {
    arr.push(project);
  }

  saveProjects(arr);
  closeModal();
  renderProjectsTable();
  loadDashboard();
  updateLeadsBadge();
  notify(isEdit ? '✓ Project updated!' : '✓ Project saved!', 'success');
}

// ── PROJECTS TABLE ────────────────────────────────────────────
function renderProjectsTable() {
  var projects = getProjects();
  var tbody    = document.getElementById('projects-table-body');
  var noProj   = document.getElementById('no-projects');
  if (!tbody) return;

  if (!projects.length) {
    tbody.innerHTML = '';
    if (noProj) noProj.style.display = 'block';
    return;
  }
  if (noProj) noProj.style.display = 'none';

  tbody.innerHTML = projects.slice().reverse().map(function (p) {
    return '<tr>' +
      '<td style="color:var(--text-muted);font-size:0.75rem;">' + esc(p.code || '—') + '</td>' +
      '<td style="font-weight:600;">' + esc(p.name) + '</td>' +
      '<td><span class="badge badge-gold">' + esc(p.category) + '</span></td>' +
      '<td>' + esc(p.location || '—') + '</td>' +
      '<td><span class="badge ' + (p.status === 'Completed' ? 'badge-green' : 'badge-steel') + '">' + esc(p.status) + '</span></td>' +
      '<td>' +
        '<button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;" onclick="togglePublish(' + p.id + ')">' +
          (p.published !== false ? '✅ Live' : '⬛ Draft') +
        '</button>' +
      '</td>' +
      '<td>' +
        '<button style="background:none;border:none;cursor:pointer;font-size:1.1rem;" onclick="toggleFeatured(' + p.id + ')">' +
          (p.featured ? '⭐' : '☆') +
        '</button>' +
      '</td>' +
      '<td>' +
        '<div style="display:flex;gap:8px;">' +
          '<button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;" onclick="openEditProject(' + p.id + ')">Edit</button>' +
          '<button class="btn-danger" onclick="deleteProject(' + p.id + ')">Delete</button>' +
        '</div>' +
      '</td>' +
      '</tr>';
  }).join('');
}

// ── GLOBAL PROJECT ACTIONS (called from inline onclick) ───────
function openEditProject(id) {
  var projects = getProjects();
  var p = projects.find(function (x) { return x.id === id; });
  if (!p) return;

  editingProjectId  = id;
  featuredImageData = null; // will use existing unless new one uploaded
  galleryImagesData = [];   // will use existing unless new ones uploaded

  setValue('pf-name',        p.name);
  setValue('pf-code',        p.code);
  setSelect('pf-category',   p.category);
  setSelect('pf-status',     p.status);
  setValue('pf-location',    p.location);
  setValue('pf-area',        p.area);
  setValue('pf-floors',      p.floors);
  setSelect('pf-client-type', p.clientType);
  setValue('pf-start',       p.startDate);
  setValue('pf-end',         p.endDate);
  setValue('pf-desc',        p.description);
  setChecked2('pf-featured', p.featured);
  setChecked2('pf-published', p.published !== false);

  // Show existing featured image
  if (p.featuredImage) {
    var fp  = document.getElementById('featured-preview');
    var img = document.getElementById('featured-preview-img');
    if (fp && img) { img.src = p.featuredImage; fp.style.display = 'block'; }
  }

  // Show existing gallery
  if (p.gallery && p.gallery.length) {
    galleryImagesData = p.gallery.slice();
    renderGalleryPreview();
  }

  openModal('Edit Project');
}

function deleteProject(id) {
  if (!confirm('Delete this project? This cannot be undone.')) return;
  var arr = getProjects().filter(function (p) { return p.id !== id; });
  saveProjects(arr);
  renderProjectsTable();
  loadDashboard();
  notify('Project deleted.', 'success');
}

function togglePublish(id) {
  var arr = getProjects();
  var p   = arr.find(function (x) { return x.id === id; });
  if (p) {
    p.published = !(p.published !== false);
    saveProjects(arr);
    renderProjectsTable();
    notify(p.published ? 'Project set to Live.' : 'Project set to Draft.', 'success');
  }
}

function toggleFeatured(id) {
  var arr = getProjects();
  var p   = arr.find(function (x) { return x.id === id; });
  if (p) {
    p.featured = !p.featured;
    saveProjects(arr);
    renderProjectsTable();
  }
}

// ── IMAGE UPLOADS ─────────────────────────────────────────────
function initImageUploads() {
  // Featured image
  var featuredArea  = document.getElementById('featured-upload-area');
  var featuredInput = document.getElementById('featured-file');
  if (featuredArea && featuredInput) {
    featuredArea.addEventListener('click', function () { featuredInput.click(); });
    featuredArea.addEventListener('dragover', function (e) { e.preventDefault(); featuredArea.classList.add('drag-over'); });
    featuredArea.addEventListener('dragleave', function () { featuredArea.classList.remove('drag-over'); });
    featuredArea.addEventListener('drop', function (e) {
      e.preventDefault();
      featuredArea.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files.length) {
        readImageFile(e.dataTransfer.files[0], function (data) { setFeaturedImage(data); });
      }
    });
    featuredInput.addEventListener('change', function () {
      if (featuredInput.files && featuredInput.files[0]) {
        readImageFile(featuredInput.files[0], function (data) { setFeaturedImage(data); });
      }
      featuredInput.value = '';
    });
  }

  // Featured remove
  var featuredRemove = document.getElementById('featured-remove');
  if (featuredRemove) {
    featuredRemove.addEventListener('click', function () {
      featuredImageData = null;
      var fp = document.getElementById('featured-preview');
      if (fp) fp.style.display = 'none';
    });
  }

  // Gallery images
  var galleryArea  = document.getElementById('gallery-upload-area');
  var galleryInput = document.getElementById('gallery-file');
  if (galleryArea && galleryInput) {
    galleryInput.multiple = true;
    galleryArea.addEventListener('click', function () { galleryInput.click(); });
    galleryArea.addEventListener('dragover', function (e) { e.preventDefault(); galleryArea.classList.add('drag-over'); });
    galleryArea.addEventListener('dragleave', function () { galleryArea.classList.remove('drag-over'); });
    galleryArea.addEventListener('drop', function (e) {
      e.preventDefault();
      galleryArea.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files.length) {
        readMultipleImages(e.dataTransfer.files, function (results) {
          galleryImagesData = galleryImagesData.concat(results).slice(0, 20);
          renderGalleryPreview();
        });
      }
    });
    galleryInput.addEventListener('change', function () {
      if (galleryInput.files && galleryInput.files.length) {
        readMultipleImages(galleryInput.files, function (results) {
          galleryImagesData = galleryImagesData.concat(results).slice(0, 20);
          renderGalleryPreview();
        });
      }
      galleryInput.value = '';
    });
  }
}

function setFeaturedImage(data) {
  featuredImageData = data;
  var fp  = document.getElementById('featured-preview');
  var img = document.getElementById('featured-preview-img');
  if (fp && img) { img.src = data; fp.style.display = 'block'; }
}

function readImageFile(file, callback) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 5 * 1024 * 1024) { notify('Image too large (max 5MB per image).', 'error'); return; }
  var reader = new FileReader();
  reader.onload = function (e) { callback(e.target.result); };
  reader.readAsDataURL(file);
}

function readMultipleImages(files, callback) {
  var fileArr = Array.from(files).filter(function (f) { return f.type.startsWith('image/'); }).slice(0, 20);
  var results = [];
  var count   = 0;
  if (!fileArr.length) return;
  fileArr.forEach(function (file) {
    readImageFile(file, function (data) {
      results.push(data);
      count++;
      if (count === fileArr.length) callback(results);
    });
  });
}

function renderGalleryPreview() {
  var container = document.getElementById('gallery-preview');
  if (!container) return;
  container.innerHTML = galleryImagesData.map(function (img, i) {
    return '<div class="image-preview-item">' +
      '<img src="' + img + '" alt="Gallery ' + (i + 1) + '" />' +
      '<button class="image-preview-remove" type="button" onclick="removeGalleryImage(' + i + ')">✕</button>' +
      '</div>';
  }).join('');
}

function removeGalleryImage(idx) {
  galleryImagesData.splice(idx, 1);
  renderGalleryPreview();
}

// ── LEADS ─────────────────────────────────────────────────────
function getLeads() {
  try { return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]'); }
  catch (e) { return []; }
}

function initLeads() {
  var clearBtn = document.getElementById('clear-leads-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (!confirm('Clear all leads? This cannot be undone.')) return;
      localStorage.setItem(LEADS_KEY, '[]');
      renderLeadsTable();
      updateLeadsBadge();
      setText('ds-leads', 0);
      notify('All leads cleared.', 'success');
    });
  }
}

function renderLeadsTable() {
  var leads = getLeads();
  var tbody = document.getElementById('leads-table-body');
  var noEl  = document.getElementById('no-leads');
  if (!tbody) return;

  if (!leads.length) {
    tbody.innerHTML = '';
    if (noEl) noEl.style.display = 'block';
    return;
  }
  if (noEl) noEl.style.display = 'none';

  tbody.innerHTML = leads.slice().reverse().map(function (l) {
    var dateStr = l.date ? new Date(l.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    return '<tr>' +
      '<td style="color:var(--text-muted);font-size:0.72rem;white-space:nowrap;">' + dateStr + '</td>' +
      '<td style="font-weight:600;">' + esc(l.name) + '</td>' +
      '<td><a href="tel:' + esc(l.phone) + '" style="color:var(--steel);">' + esc(l.phone) + '</a></td>' +
      '<td><span class="badge badge-gold">' + esc(l.type) + '</span></td>' +
      '<td>' + esc(l.location || '—') + '</td>' +
      '<td>' + esc(l.area || '—') + '</td>' +
      '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary);font-size:0.78rem;">' + esc(l.message || '—') + '</td>' +
      '</tr>';
  }).join('');
}

// ── SETTINGS ──────────────────────────────────────────────────
function initSettings() {
  var saveBtn = document.getElementById('save-pin-btn');
  var msg     = document.getElementById('pin-msg');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', function () {
    var curr    = getValue('curr-pin');
    var newPin  = getValue('new-pin');
    var confirm2 = getValue('confirm-pin');

    if (!curr || curr !== getPin()) {
      if (msg) { msg.textContent = '✗ Current PIN is incorrect.'; msg.style.color = 'var(--red)'; }
      return;
    }
    if (!newPin || newPin.length < 4) {
      if (msg) { msg.textContent = '✗ New PIN must be at least 4 characters.'; msg.style.color = 'var(--red)'; }
      return;
    }
    if (newPin !== confirm2) {
      if (msg) { msg.textContent = '✗ PINs do not match.'; msg.style.color = 'var(--red)'; }
      return;
    }
    localStorage.setItem(PIN_KEY, newPin);
    if (msg) { msg.textContent = '✓ PIN updated successfully!'; msg.style.color = 'var(--green)'; }
    setValue('curr-pin', '');
    setValue('new-pin', '');
    setValue('confirm-pin', '');
    notify('Admin PIN updated!', 'success');
  });
}

// ── NOTIFICATION ──────────────────────────────────────────────
function notify(message, type) {
  var notif = document.getElementById('notif');
  if (!notif) return;
  notif.textContent = message;
  notif.className   = 'notif ' + (type || 'success') + ' show';
  setTimeout(function () { notif.classList.remove('show'); }, 3500);
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
function getText(id) { var el = document.getElementById(id); return el ? el.value || '' : ''; }
function getValue(id) { var el = document.getElementById(id); return el ? (el.value || '').trim() : ''; }
function setValue(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; }
function setSelect(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; }
function getChecked(id) { var el = document.getElementById(id); return el ? el.checked : false; }
function setChecked2(id, val) { var el = document.getElementById(id); if (el) el.checked = !!val; }
function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
