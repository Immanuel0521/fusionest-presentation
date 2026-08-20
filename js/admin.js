/* ============================================================
   FUSIONest Admin — v4 (IndexedDB + GitHub publish)
   ============================================================ */

var DB_NAME   = 'fusionest_db';
var DB_VER    = 1;
var DB_STORE  = 'projects';
var PIN_KEY   = 'fn_admin_pin';
var LEADS_KEY = 'fn_leads';
var SES_KEY   = 'fn_admin_auth';
var DEFAULT_PIN = 'fusionest';

// ── GITHUB PUBLISH CONFIG ─────────────────────────────────────
// Fill in your GitHub Personal Access Token to enable "Publish to Site"
var GH_OWNER = 'Immanuel0521';
var GH_REPO  = 'fusionest-presentation';
var GH_FILE  = 'data/projects.json';
var GH_TOKEN = ''; // ← paste your GitHub token here

var _db         = null;
var editingId   = null;
var featuredImg = null;
var galleryImgs = [];


/* ── BOOT ─────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', function () {
  openDB(function () {
    checkAuth();
    setupLogin();
    setupSidebar();
    setupModal();
    setupImageUploads();
    setupLeads();
    setupSettings();
  });
});

/* ── INDEXEDDB ────────────────────────────────────────────── */
function openDB(cb) {
  if (_db) { cb(); return; }
  var req = indexedDB.open(DB_NAME, DB_VER);
  req.onupgradeneeded = function (e) {
    var db = e.target.result;
    if (!db.objectStoreNames.contains(DB_STORE)) {
      db.createObjectStore(DB_STORE, { keyPath: 'id' });
    }
  };
  req.onsuccess = function (e) { _db = e.target.result; cb(); };
  req.onerror   = function () { toast('DB error — please refresh.', 'error'); };
}

function dbGetAll(cb) {
  var req = _db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).getAll();
  req.onsuccess = function () { cb(req.result || []); };
  req.onerror   = function () { cb([]); };
}

function dbPut(project, cb) {
  var req = _db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).put(project);
  req.onsuccess = function () { if (cb) cb(true); };
  req.onerror   = function (e) {
    console.error('IndexedDB put error', e);
    toast('Save failed. Please try again.', 'error');
    if (cb) cb(false);
  };
}

function dbDelete(id, cb) {
  var req = _db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).delete(id);
  req.onsuccess = function () { if (cb) cb(); };
}

/* ── AUTH ─────────────────────────────────────────────────── */
function getPin()  { return localStorage.getItem(PIN_KEY) || DEFAULT_PIN; }
function checkAuth() { if (sessionStorage.getItem(SES_KEY) === 'true') showDashboard(); }

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
    if ((input ? input.value : '').trim() === getPin()) {
      sessionStorage.setItem(SES_KEY, 'true');
      showDashboard();
    } else {
      if (err) { err.classList.add('show'); setTimeout(function(){ err.classList.remove('show'); }, 3000); }
      if (input) { input.value = ''; input.focus(); }
    }
  }
  if (btn)   btn.addEventListener('click', tryLogin);
  if (input) input.addEventListener('keydown', function(e){ if (e.key === 'Enter') tryLogin(); });
  var lo = document.getElementById('logout-btn');
  if (lo) lo.addEventListener('click', function(){ sessionStorage.removeItem(SES_KEY); location.reload(); });
}

/* ── SIDEBAR ──────────────────────────────────────────────── */
function setupSidebar() {
  document.querySelectorAll('.sidebar-link[data-page]').forEach(function(link) {
    link.addEventListener('click', function(){ goToPage(link.dataset.page); });
  });
}

function goToPage(pageId) {
  document.querySelectorAll('.sidebar-link[data-page]').forEach(function(l){
    l.classList.toggle('active', l.dataset.page === pageId);
  });
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  var page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  if (pageId === 'dashboard') refreshDashboard();
  if (pageId === 'projects')  renderTable();
  if (pageId === 'leads')     renderLeads();
}

/* ── DASHBOARD ────────────────────────────────────────────── */
function refreshDashboard() {
  dbGetAll(function(projects) {
    var leads     = loadLeads();
    var published = projects.filter(function(p){ return p.published; });
    var featured  = projects.filter(function(p){ return p.featured; });

    setEl('ds-projects',  projects.length);
    setEl('ds-published', published.length);
    setEl('ds-leads',     leads.length);
    setEl('ds-featured',  featured.length);

    var tbody = document.getElementById('dash-projects-body');
    if (!tbody) return;
    var recent = projects.slice().reverse().slice(0, 8);
    if (!recent.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);">No projects yet. Click + New Project.</td></tr>';
      return;
    }
    tbody.innerHTML = recent.map(function(p){
      return '<tr>' +
        '<td style="font-weight:600;">' + x(p.name) + '</td>' +
        '<td><span class="badge badge-gold">' + x(p.category) + '</span></td>' +
        '<td>' + x(p.location||'—') + '</td>' +
        '<td><span class="badge ' + (p.status==='Completed'?'badge-green':'badge-steel') + '">' + x(p.status) + '</span></td>' +
        '<td>' + (p.featured?'⭐':'—') + '</td></tr>';
    }).join('');
  });
}

function refreshLeadsBadge() {
  var b = document.getElementById('leads-badge');
  if (b) b.textContent = loadLeads().length;
}

/* ── PROJECT TABLE ────────────────────────────────────────── */
function renderTable() {
  dbGetAll(function(projects) {
    var tbody = document.getElementById('projects-table-body');
    var empty = document.getElementById('no-projects');
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
        '</div></td></tr>';
    }).join('');
  });
}

/* ── MODAL ────────────────────────────────────────────────── */
function setupModal() {
  var nb = document.getElementById('new-project-btn');
  if (nb) nb.addEventListener('click', function(){ resetForm(); openModal('New Project'); });
  var cb = document.getElementById('modal-close');
  var cn = document.getElementById('modal-cancel');
  if (cb) cb.addEventListener('click', closeModal);
  if (cn) cn.addEventListener('click', closeModal);
  var ov = document.getElementById('project-modal-overlay');
  if (ov) ov.addEventListener('click', function(e){ if(e.target===ov) closeModal(); });
  var sb = document.getElementById('save-project-btn');
  if (sb) sb.addEventListener('click', function(){ doSave(); });
}

function openModal(title) {
  var t = document.getElementById('modal-title');
  if (t) t.textContent = title || 'New Project';
  var ov = document.getElementById('project-modal-overlay');
  if (ov) ov.classList.add('open');
  setSaveStatus('', '');
}

function closeModal() {
  var ov = document.getElementById('project-modal-overlay');
  if (ov) ov.classList.remove('open');
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
  setSaveStatus('', '');
}

function setSaveStatus(msg, color) {
  var s = document.getElementById('save-status');
  if (!s) return;
  s.textContent  = msg;
  s.style.color  = color || 'var(--green)';
  s.style.display = msg ? 'block' : 'none';
}

/* ── SAVE ─────────────────────────────────────────────────── */
function doSave() {
  var name     = fval('pf-name');
  var category = fval('pf-category');
  var location = fval('pf-location');

  if (!name)     { setSaveStatus('⚠ Please enter a project name.', 'var(--red)'); return; }
  if (!category) { setSaveStatus('⚠ Please select a category.', 'var(--red)'); return; }
  if (!location) { setSaveStatus('⚠ Please enter a location.', 'var(--red)'); return; }

  setSaveStatus('Saving...', 'var(--text-muted)');

  var isEdit = !!editingId;
  var pid    = isEdit ? editingId : Date.now();

  function buildAndSave(existing) {
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
      featuredImage: featuredImg !== null ? featuredImg : ((existing && existing.featuredImage) || null),
      gallery:      galleryImgs.length ? galleryImgs    : ((existing && existing.gallery) || []),
      createdAt:    (existing && existing.createdAt) || new Date().toISOString(),
      updatedAt:    new Date().toISOString()
    };

    dbPut(project, function(ok) {
      if (!ok) { setSaveStatus('⚠ Save failed. Please try again.', 'var(--red)'); return; }
      setSaveStatus('✓ Saved: ' + name, 'var(--green)');
      toast('✓ Project saved: ' + name, 'success');
      // Signal main site to refresh (using a timestamp key in localStorage)
      localStorage.setItem('fn_projects_updated', Date.now().toString());
      setTimeout(function(){
        closeModal();
        resetForm();
        goToPage('projects');
      }, 800);
    });
  }

  if (isEdit) {
    // Fetch existing project to preserve fields not in the form (like old images if not replaced)
    var req = _db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(pid);
    req.onsuccess = function(){ buildAndSave(req.result); };
    req.onerror   = function(){ buildAndSave(null); };
  } else {
    buildAndSave(null);
  }
}

/* ── PROJECT ACTIONS ──────────────────────────────────────── */
function editProject(id) {
  var req = _db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(id);
  req.onsuccess = function() {
    var p = req.result;
    if (!p) return;
    resetForm();
    editingId   = id;
    featuredImg = null;
    galleryImgs = [];

    setFval('pf-name', p.name);         setFval('pf-code', p.code);
    setFval('pf-location', p.location); setFval('pf-area', p.area);
    setFval('pf-floors', p.floors);     setFval('pf-start', p.startDate);
    setFval('pf-end', p.endDate);       setFval('pf-desc', p.description);
    setSel('pf-category', p.category);  setSel('pf-status', p.status);
    setSel('pf-client-type', p.clientType);
    setChk('pf-featured',  !!p.featured);
    setChk('pf-published', p.published !== false);

    if (p.featuredImage) {
      var fp = document.getElementById('featured-preview');
      var fi = document.getElementById('featured-preview-img');
      if (fp && fi) { fi.src = p.featuredImage; fp.style.display = 'block'; }
    }
    if (p.gallery && p.gallery.length) {
      galleryImgs = p.gallery.slice();
      renderGallery();
    }
    openModal('Edit: ' + p.name);
  };
}

function delProject(id) {
  if (!confirm('Delete this project? Cannot be undone.')) return;
  dbDelete(id, function() {
    renderTable();
    refreshDashboard();
    localStorage.setItem('fn_projects_updated', Date.now().toString());
    toast('Project deleted.', 'success');
  });
}

function togglePublish(id) {
  var req = _db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(id);
  req.onsuccess = function() {
    var p = req.result;
    if (!p) return;
    p.published = !p.published;
    dbPut(p, function() {
      renderTable();
      localStorage.setItem('fn_projects_updated', Date.now().toString());
      toast(p.published ? '✅ Set to Live' : '⬛ Set to Draft', 'success');
    });
  };
}

function toggleFeatured(id) {
  var req = _db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(id);
  req.onsuccess = function() {
    var p = req.result;
    if (!p) return;
    p.featured = !p.featured;
    dbPut(p, function() { renderTable(); });
  };
}

/* ── IMAGE UPLOADS ────────────────────────────────────────── */
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
  area.addEventListener('click',    function(){ input.click(); });
  area.addEventListener('dragover',  function(e){ e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', function(){ area.classList.remove('drag-over'); });
  area.addEventListener('drop', function(e){
    e.preventDefault(); area.classList.remove('drag-over');
    if (e.dataTransfer && e.dataTransfer.files.length) processFiles(e.dataTransfer.files, multi, cb);
  });
  input.addEventListener('change', function(){
    if (input.files && input.files.length) processFiles(input.files, multi, cb);
    input.value = '';
  });
}

function processFiles(files, multi, cb) {
  var list = Array.from(files).filter(function(f){ return f.type.startsWith('image/'); });
  if (!multi) list = list.slice(0, 1);
  if (!list.length) return;
  var results = [], done = 0;
  list.forEach(function(f){
    var reader = new FileReader();
    reader.onload = function(e){
      compressImage(e.target.result, function(compressed){
        results.push(compressed);
        done++;
        if (done === list.length) { multi ? cb(results) : cb(results[0]); }
      });
    };
    reader.readAsDataURL(f);
  });
}

// Compress via canvas — 1024px max, JPEG 70%
function compressImage(dataUrl, cb) {
  var img = new Image();
  img.onload = function(){
    var MAX = 1024, w = img.width, h = img.height;
    if (w > MAX || h > MAX) {
      if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
      else       { w = Math.round(w * MAX / h); h = MAX; }
    }
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    cb(canvas.toDataURL('image/jpeg', 0.70));
  };
  img.onerror = function(){ cb(dataUrl); };
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

function removeGalleryImg(i) { galleryImgs.splice(i, 1); renderGallery(); }

/* ── LEADS ────────────────────────────────────────────────── */
function loadLeads() {
  try { return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]'); }
  catch(e) { return []; }
}
function setupLeads() {
  var cb = document.getElementById('clear-leads-btn');
  if (cb) cb.addEventListener('click', function(){
    if (!confirm('Clear all leads?')) return;
    localStorage.setItem(LEADS_KEY, '[]');
    renderLeads(); refreshLeadsBadge(); setEl('ds-leads', 0);
    toast('All leads cleared.', 'success');
  });
}
function renderLeads() {
  var leads = loadLeads();
  var tbody = document.getElementById('leads-table-body');
  var empty = document.getElementById('no-leads');
  if (!tbody) return;
  if (!leads.length) { tbody.innerHTML = ''; if (empty) empty.style.display = 'block'; return; }
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

/* ── SETTINGS ─────────────────────────────────────────────── */
function setupSettings() {
  var sb = document.getElementById('save-pin-btn');
  if (!sb) return;
  sb.addEventListener('click', function(){
    var curr = fval('curr-pin'), np = fval('new-pin'), cp = fval('confirm-pin');
    var msg  = document.getElementById('pin-msg');
    if (curr !== getPin()) { if(msg){msg.textContent='✗ Wrong current PIN';msg.style.color='var(--red)';} return; }
    if (np.length < 4)     { if(msg){msg.textContent='✗ Min 4 characters';msg.style.color='var(--red)';} return; }
    if (np !== cp)         { if(msg){msg.textContent='✗ PINs do not match';msg.style.color='var(--red)';} return; }
    localStorage.setItem(PIN_KEY, np);
    if(msg){msg.textContent='✓ PIN updated!';msg.style.color='var(--green)';}
    setFval('curr-pin',''); setFval('new-pin',''); setFval('confirm-pin','');
    toast('PIN updated!', 'success');
  });
}

/* ── TOAST ────────────────────────────────────────────────── */
function toast(msg, type) {
  var el = document.getElementById('notif');
  if (!el) return;
  el.textContent = msg;
  el.className = 'notif ' + (type||'success') + ' show';
  setTimeout(function(){ el.classList.remove('show'); }, 3500);
}

/* ── PUBLISH TO NETLIFY VIA GITHUB API ───────────────────── */
function publishToSite() {
  if (!GH_TOKEN) {
    toast('⚠ Add your GitHub token in admin.js to enable publishing.', 'error');
    var btn = document.getElementById('publish-btn');
    if (btn) { btn.textContent = '⚠ Token needed — see instructions'; }
    return;
  }

  var btn = document.getElementById('publish-btn');
  if (btn) { btn.textContent = '⏳ Publishing...'; btn.disabled = true; }

  dbGetAll(function(projects) {
    // Strip base64 images for the JSON file — store image data separately
    // (Images are stored in IndexedDB locally; for Netlify we include them inline)
    var jsonStr = JSON.stringify(projects, null, 2);
    var b64     = btoa(unescape(encodeURIComponent(jsonStr)));

    // First get the current SHA of the file (needed for update)
    var apiUrl = 'https://api.github.com/repos/' + GH_OWNER + '/' + GH_REPO + '/contents/' + GH_FILE;
    fetch(apiUrl, {
      headers: {
        'Authorization': 'token ' + GH_TOKEN,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    .then(function(r) { return r.json(); })
    .then(function(info) {
      var sha = info.sha || undefined;
      var body = { message: 'Update projects — ' + new Date().toLocaleString(), content: b64 };
      if (sha) body.sha = sha;
      return fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': 'token ' + GH_TOKEN,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    })
    .then(function(r) {
      if (r.ok) {
        toast('✅ Published! Netlify will update in ~1 minute.', 'success');
        if (btn) { btn.textContent = '✅ Published to Netlify'; btn.disabled = false; }
        setTimeout(function(){ if (btn) btn.textContent = '🌐 Publish to Site'; }, 4000);
      } else {
        throw new Error('GitHub API error ' + r.status);
      }
    })
    .catch(function(e) {
      toast('❌ Publish failed: ' + e.message, 'error');
      if (btn) { btn.textContent = '🌐 Publish to Site'; btn.disabled = false; }
    });
  });
}

/* ── UTILS ────────────────────────────────────────────────── */
function fval(id){ var e=document.getElementById(id); return e?(e.value||'').trim():''; }
function fchk(id){ var e=document.getElementById(id); return e?e.checked:false; }
function setFval(id,v){ var e=document.getElementById(id); if(e) e.value=v||''; }
function setSel(id,v) { var e=document.getElementById(id); if(e) e.value=v||''; }
function setChk(id,v) { var e=document.getElementById(id); if(e) e.checked=!!v; }
function setEl(id,v)  { var e=document.getElementById(id); if(e) e.textContent=v; }
function x(s){ if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
