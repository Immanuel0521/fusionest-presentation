/* ============================================================
   FUSIONest Admin — v3 Clean & Reliable
   ============================================================ */

var PROJECTS_KEY = 'fn_projects';
var LEADS_KEY    = 'fn_leads';
var PIN_KEY      = 'fn_admin_pin';
var DEFAULT_PIN  = 'fusionest';
var SESSION_KEY  = 'fn_admin_auth';

var editingId    = null;
var featuredImg  = null;
var galleryImgs  = [];

/* ── BOOT ─────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', function () {
  checkAuth();
  setupLogin();
  setupSidebar();
  setupModal();
  setupImageUploads();
  setupLeads();
  setupSettings();
});

/* ── AUTH ─────────────────────────────────────────────── */
function getPin()    { return localStorage.getItem(PIN_KEY) || DEFAULT_PIN; }
function isLoggedIn(){ return sessionStorage.getItem(SESSION_KEY) === 'true'; }

function checkAuth() {
  if (isLoggedIn()) showDashboard();
}

function showDashboard() {
  var ls = document.getElementById('login-screen');
  if (ls) ls.classList.add('hidden');
  refreshDashboard();
  refreshLeadsBadge();
}

function setupLogin() {
  var btn   = document.getElementById('login-btn');
  var input = document.getElementById('pin-input');
  var err   = document.getElementById('login-error');

  function tryLogin() {
    if ((input.value || '').trim() === getPin()) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      showDashboard();
    } else {
      err.classList.add('show');
      input.value = '';
      input.focus();
      setTimeout(function(){ err.classList.remove('show'); }, 3000);
    }
  }

  if (btn)   btn.addEventListener('click', tryLogin);
  if (input) input.addEventListener('keydown', function(e){ if(e.key==='Enter') tryLogin(); });

  var lo = document.getElementById('logout-btn');
  if (lo) lo.addEventListener('click', function(){
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });
}

/* ── SIDEBAR / PAGE NAVIGATION ───────────────────────── */
function setupSidebar() {
  document.querySelectorAll('.sidebar-link[data-page]').forEach(function(link) {
    link.addEventListener('click', function() {
      goToPage(link.dataset.page);
    });
  });
}

function goToPage(pageId) {
  // Update sidebar active state
  document.querySelectorAll('.sidebar-link[data-page]').forEach(function(l){
    l.classList.toggle('active', l.dataset.page === pageId);
  });
  // Show correct page
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  var page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  // Load data for page
  if (pageId === 'dashboard') refreshDashboard();
  if (pageId === 'projects')  renderTable();
  if (pageId === 'leads')     renderLeads();
}

/* ── DASHBOARD ───────────────────────────────────────── */
function refreshDashboard() {
  var all      = loadProjects();
  var leads    = loadLeads();
  var published = all.filter(function(p){ return p.published; });
  var featured  = all.filter(function(p){ return p.featured; });

  setEl('ds-projects', all.length);
  setEl('ds-published', published.length);
  setEl('ds-leads', leads.length);
  setEl('ds-featured', featured.length);

  var tbody = document.getElementById('dash-projects-body');
  if (!tbody) return;
  var recent = all.slice().reverse().slice(0, 8);
  if (!recent.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);">No projects yet. Click + New Project to add one.</td></tr>';
    return;
  }
  tbody.innerHTML = recent.map(function(p){
    return '<tr>' +
      '<td style="font-weight:600;">' + x(p.name) + '</td>' +
      '<td><span class="badge badge-gold">' + x(p.category) + '</span></td>' +
      '<td>' + x(p.location||'—') + '</td>' +
      '<td><span class="badge ' + (p.status==='Completed'?'badge-green':'badge-steel') + '">' + x(p.status) + '</span></td>' +
      '<td>' + (p.featured?'⭐':'—') + '</td>' +
    '</tr>';
  }).join('');
}

function refreshLeadsBadge() {
  var b = document.getElementById('leads-badge');
  if (b) b.textContent = loadLeads().length;
}

/* ── STORAGE ─────────────────────────────────────────── */
function loadProjects() {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); }
  catch(e) { return []; }
}
function saveProjects(arr) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(arr));
    return true;
  } catch(e) {
    toast('⚠ Save failed — image files may be too large. Try smaller images.', 'error');
    return false;
  }
}
function loadLeads() {
  try { return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]'); }
  catch(e) { return []; }
}

/* ── PROJECT TABLE ───────────────────────────────────── */
function renderTable() {
  var projects = loadProjects();
  var tbody    = document.getElementById('projects-table-body');
  var empty    = document.getElementById('no-projects');
  if (!tbody) return;

  if (!projects.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  tbody.innerHTML = projects.slice().reverse().map(function(p){
    return '<tr>' +
      '<td style="color:var(--text-muted);font-size:0.75rem;">' + x(p.code||'—') + '</td>' +
      '<td style="font-weight:600;">' + x(p.name) + '</td>' +
      '<td><span class="badge badge-gold">' + x(p.category) + '</span></td>' +
      '<td>' + x(p.location||'—') + '</td>' +
      '<td><span class="badge ' + (p.status==='Completed'?'badge-green':'badge-steel') + '">' + x(p.status) + '</span></td>' +
      '<td><button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;" onclick="togglePublish(' + p.id + ')">' + (p.published?'✅ Live':'⬛ Draft') + '</button></td>' +
      '<td><button style="background:none;border:none;cursor:pointer;font-size:1.1rem;" onclick="toggleFeatured(' + p.id + ')">' + (p.featured?'⭐':'☆') + '</button></td>' +
      '<td><div style="display:flex;gap:6px;">' +
        '<button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;" onclick="editProject(' + p.id + ')">Edit</button>' +
        '<button class="btn-danger" onclick="delProject(' + p.id + ')">Delete</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
}

/* ── MODAL ───────────────────────────────────────────── */
function setupModal() {
  // New project button
  var nb = document.getElementById('new-project-btn');
  if (nb) nb.addEventListener('click', function(){ openModal(); });

  // Close buttons
  var cb = document.getElementById('modal-close');
  var cn = document.getElementById('modal-cancel');
  if (cb) cb.addEventListener('click', closeModal);
  if (cn) cn.addEventListener('click', closeModal);

  // Click backdrop to close
  var ov = document.getElementById('project-modal-overlay');
  if (ov) ov.addEventListener('click', function(e){ if(e.target===ov) closeModal(); });

  // *** THE SAVE BUTTON — simple onclick, type=button, no form submit ***
  var sb = document.getElementById('save-project-btn');
  if (sb) sb.addEventListener('click', function(){ doSave(); });
}

function openModal(title) {
  var t = document.getElementById('modal-title');
  if (t) t.textContent = title || 'New Project';
  var ov = document.getElementById('project-modal-overlay');
  if (ov) ov.classList.add('open');
  clearSaveStatus();
}

function closeModal() {
  var ov = document.getElementById('project-modal-overlay');
  if (ov) ov.classList.remove('open');
  resetForm();
}

function resetForm() {
  editingId   = null;
  featuredImg = null;
  galleryImgs = [];
  var f = document.getElementById('project-form');
  if (f) f.reset();
  var fp = document.getElementById('featured-preview');
  if (fp) fp.style.display = 'none';
  var gp = document.getElementById('gallery-preview');
  if (gp) gp.innerHTML = '';
  clearSaveStatus();
}

function clearSaveStatus() {
  var s = document.getElementById('save-status');
  if (s) { s.textContent = ''; s.style.display = 'none'; }
}

function showSaveStatus(msg, color) {
  var s = document.getElementById('save-status');
  if (s) {
    s.textContent = msg;
    s.style.color = color || 'var(--green)';
    s.style.display = 'block';
  }
}

/* ── SAVE PROJECT ────────────────────────────────────── */
function doSave() {
  // Read values
  var name     = fval('pf-name');
  var category = fval('pf-category');
  var location = fval('pf-location');

  // Validate
  if (!name) {
    showSaveStatus('⚠ Please enter a project name.', 'var(--red)');
    document.getElementById('pf-name') && document.getElementById('pf-name').focus();
    return;
  }
  if (!category) {
    showSaveStatus('⚠ Please select a project category.', 'var(--red)');
    document.getElementById('pf-category') && document.getElementById('pf-category').focus();
    return;
  }
  if (!location) {
    showSaveStatus('⚠ Please enter a location.', 'var(--red)');
    document.getElementById('pf-location') && document.getElementById('pf-location').focus();
    return;
  }

  var isEdit   = !!editingId;
  var pid      = isEdit ? editingId : Date.now();
  var existing = isEdit ? (loadProjects().find(function(p){ return p.id === pid; }) || {}) : {};

  var project = {
    id:           pid,
    name:         name,
    code:         fval('pf-code'),
    category:     category,
    location:     location,
    status:       fval('pf-status') || 'Completed',
    area:         fval('pf-area'),
    floors:       fval('pf-floors'),
    clientType:   fval('pf-client-type'),
    startDate:    fval('pf-start'),
    endDate:      fval('pf-end'),
    description:  fval('pf-desc'),
    featured:     fchk('pf-featured'),
    published:    fchk('pf-published'),
    featuredImage: featuredImg !== null ? featuredImg : (existing.featuredImage || null),
    gallery:      galleryImgs.length ? galleryImgs : (existing.gallery || []),
    createdAt:    existing.createdAt || new Date().toISOString(),
    updatedAt:    new Date().toISOString()
  };

  // Save
  var arr = loadProjects();
  if (isEdit) {
    var idx = -1;
    for (var i = 0; i < arr.length; i++) { if (arr[i].id === pid) { idx = i; break; } }
    if (idx !== -1) arr[idx] = project;
    else arr.push(project);
  } else {
    arr.push(project);
  }

  var ok = saveProjects(arr);
  if (!ok) return; // storage error shown by saveProjects

  // Success!
  showSaveStatus('✓ Project "' + name + '" saved successfully!', 'var(--green)');
  toast('✓ Project saved: ' + name, 'success');

  // Wait 1s then close and go to Projects page
  setTimeout(function(){
    closeModal();
    goToPage('projects');
  }, 900);
}

/* ── PROJECT ACTIONS (called from inline onclick) ─────── */
function editProject(id) {
  var p = loadProjects().find(function(x){ return x.id === id; });
  if (!p) return;

  editingId   = id;
  featuredImg = null;
  galleryImgs = [];

  setFval('pf-name',        p.name);
  setFval('pf-code',        p.code);
  setFval('pf-location',    p.location);
  setFval('pf-area',        p.area);
  setFval('pf-floors',      p.floors);
  setFval('pf-start',       p.startDate);
  setFval('pf-end',         p.endDate);
  setFval('pf-desc',        p.description);
  setSel('pf-category',     p.category);
  setSel('pf-status',       p.status);
  setSel('pf-client-type',  p.clientType);
  setChk('pf-featured',     !!p.featured);
  setChk('pf-published',    p.published !== false);

  if (p.featuredImage) {
    var fp = document.getElementById('featured-preview');
    var fi = document.getElementById('featured-preview-img');
    if (fp && fi) { fi.src = p.featuredImage; fp.style.display = 'block'; }
  }
  if (p.gallery && p.gallery.length) {
    galleryImgs = p.gallery.slice();
    renderGallery();
  }
  openModal('Edit Project: ' + p.name);
}

function delProject(id) {
  if (!confirm('Delete this project? Cannot be undone.')) return;
  var arr = loadProjects().filter(function(p){ return p.id !== id; });
  saveProjects(arr);
  renderTable();
  refreshDashboard();
  toast('Project deleted.', 'success');
}

function togglePublish(id) {
  var arr = loadProjects();
  var p = arr.find(function(x){ return x.id === id; });
  if (!p) return;
  p.published = !p.published;
  saveProjects(arr);
  renderTable();
  toast((p.published ? '✅ Project set to Live.' : '⬛ Project set to Draft.'), 'success');
}

function toggleFeatured(id) {
  var arr = loadProjects();
  var p = arr.find(function(x){ return x.id === id; });
  if (!p) return;
  p.featured = !p.featured;
  saveProjects(arr);
  renderTable();
}

/* ── IMAGE UPLOADS ───────────────────────────────────── */
function setupImageUploads() {
  setupUpload('featured-upload-area', 'featured-file', false, function(data){
    featuredImg = data;
    var fp = document.getElementById('featured-preview');
    var fi = document.getElementById('featured-preview-img');
    if (fp && fi) { fi.src = data; fp.style.display = 'block'; }
  });

  var rm = document.getElementById('featured-remove');
  if (rm) rm.addEventListener('click', function(){
    featuredImg = null;
    var fp = document.getElementById('featured-preview');
    if (fp) fp.style.display = 'none';
  });

  setupUpload('gallery-upload-area', 'gallery-file', true, function(arr){
    galleryImgs = galleryImgs.concat(arr).slice(0, 20);
    renderGallery();
  });
}

function setupUpload(areaId, inputId, multi, cb) {
  var area  = document.getElementById(areaId);
  var input = document.getElementById(inputId);
  if (!area || !input) return;
  if (multi) input.multiple = true;

  area.addEventListener('click', function(){ input.click(); });
  area.addEventListener('dragover',  function(e){ e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', function(){ area.classList.remove('drag-over'); });
  area.addEventListener('drop', function(e){
    e.preventDefault();
    area.classList.remove('drag-over');
    if (e.dataTransfer && e.dataTransfer.files.length) readFiles(e.dataTransfer.files, multi, cb);
  });
  input.addEventListener('change', function(){
    if (input.files && input.files.length) readFiles(input.files, multi, cb);
    input.value = '';
  });
}

function readFiles(files, multi, cb) {
  var list = Array.from(files).filter(function(f){ return f.type.startsWith('image/'); });
  if (!multi) list = list.slice(0, 1);
  if (!list.length) return;

  var results = [];
  var done    = 0;
  var total   = list.length;

  list.forEach(function(f){
    if (f.size > 10 * 1024 * 1024) {
      toast('Image too large (max 10MB per image).', 'error');
      done++;
      if (done === total && results.length) multi ? cb(results) : cb(results[0]);
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e){
      // Compress image via canvas before storing
      compressImage(e.target.result, function(compressed){
        results.push(compressed);
        done++;
        if (done === total && results.length) {
          if (multi) cb(results);
          else cb(results[0]);
        }
      });
    };
    reader.readAsDataURL(f);
  });
}

// Compress image using Canvas (reduces storage size dramatically)
function compressImage(dataUrl, callback) {
  var img = new Image();
  img.onload = function(){
    var MAX_W = 1200, MAX_H = 1200;
    var w = img.width, h = img.height;
    // Scale down if larger than max dimensions
    if (w > MAX_W || h > MAX_H) {
      if (w / h > MAX_W / MAX_H) {
        h = Math.round(h * MAX_W / w);
        w = MAX_W;
      } else {
        w = Math.round(w * MAX_H / h);
        h = MAX_H;
      }
    }
    var canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    // Output as JPEG at 72% quality — greatly reduces size
    var compressed = canvas.toDataURL('image/jpeg', 0.72);
    callback(compressed);
  };
  img.onerror = function(){ callback(dataUrl); }; // fallback: use original
  img.src = dataUrl;
}


function renderGallery() {
  var c = document.getElementById('gallery-preview');
  if (!c) return;
  c.innerHTML = galleryImgs.map(function(img, i){
    return '<div class="image-preview-item">' +
      '<img src="' + img + '" />' +
      '<button class="image-preview-remove" type="button" onclick="removeGalleryImg(' + i + ')">✕</button>' +
    '</div>';
  }).join('');
}

function removeGalleryImg(i) {
  galleryImgs.splice(i, 1);
  renderGallery();
}

/* ── LEADS ───────────────────────────────────────────── */
function setupLeads() {
  var cb = document.getElementById('clear-leads-btn');
  if (cb) cb.addEventListener('click', function(){
    if (!confirm('Clear all leads?')) return;
    localStorage.setItem(LEADS_KEY, '[]');
    renderLeads();
    refreshLeadsBadge();
    setEl('ds-leads', 0);
    toast('All leads cleared.', 'success');
  });
}

function renderLeads() {
  var leads = loadLeads();
  var tbody = document.getElementById('leads-table-body');
  var empty = document.getElementById('no-leads');
  if (!tbody) return;
  if (!leads.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  tbody.innerHTML = leads.slice().reverse().map(function(l){
    var d = l.date ? new Date(l.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
    return '<tr>' +
      '<td style="font-size:0.72rem;white-space:nowrap;color:var(--text-muted);">' + d + '</td>' +
      '<td style="font-weight:600;">' + x(l.name) + '</td>' +
      '<td><a href="tel:' + x(l.phone) + '" style="color:var(--steel);">' + x(l.phone) + '</a></td>' +
      '<td><span class="badge badge-gold">' + x(l.type) + '</span></td>' +
      '<td>' + x(l.location||'—') + '</td>' +
      '<td>' + x(l.area||'—') + '</td>' +
      '<td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary);font-size:0.78rem;">' + x(l.message||'—') + '</td>' +
    '</tr>';
  }).join('');
}

/* ── SETTINGS ─────────────────────────────────────────── */
function setupSettings() {
  var sb = document.getElementById('save-pin-btn');
  if (!sb) return;
  sb.addEventListener('click', function(){
    var curr = fval('curr-pin');
    var np   = fval('new-pin');
    var cp   = fval('confirm-pin');
    var msg  = document.getElementById('pin-msg');
    if (curr !== getPin()) { if(msg){msg.textContent='✗ Current PIN wrong';msg.style.color='var(--red)';} return; }
    if (np.length < 4)     { if(msg){msg.textContent='✗ Min 4 characters';msg.style.color='var(--red)';} return; }
    if (np !== cp)         { if(msg){msg.textContent='✗ PINs do not match';msg.style.color='var(--red)';} return; }
    localStorage.setItem(PIN_KEY, np);
    if (msg){msg.textContent='✓ PIN updated!';msg.style.color='var(--green)';}
    setFval('curr-pin',''); setFval('new-pin',''); setFval('confirm-pin','');
    toast('PIN updated!', 'success');
  });
}

/* ── TOAST NOTIFICATION ───────────────────────────────── */
function toast(msg, type) {
  var el = document.getElementById('notif');
  if (!el) return;
  el.textContent = msg;
  el.className = 'notif ' + (type||'success') + ' show';
  setTimeout(function(){ el.classList.remove('show'); }, 3500);
}

/* ── UTILS ────────────────────────────────────────────── */
function fval(id) { var e=document.getElementById(id); return e ? (e.value||'').trim() : ''; }
function fchk(id) { var e=document.getElementById(id); return e ? e.checked : false; }
function setFval(id,v){ var e=document.getElementById(id); if(e) e.value=v||''; }
function setSel(id,v) { var e=document.getElementById(id); if(e) e.value=v||''; }
function setChk(id,v) { var e=document.getElementById(id); if(e) e.checked=!!v; }
function setEl(id,v)  { var e=document.getElementById(id); if(e) e.textContent=v; }
function x(s){ if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
