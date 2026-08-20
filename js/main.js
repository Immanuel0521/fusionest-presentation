/* ============================================================
   FUSIONest — Main JavaScript
   Three.js Hero | GSAP Animations | All Interactions
   ============================================================ */

'use strict';

// ── CONSTANTS ─────────────────────────────────────────────────
const STAGE_DATA = [
  {
    label: 'STAGE 01 · DISCOVER',
    title: 'Discovery & Consultation',
    desc: 'We begin by listening. Understanding your space requirements, site conditions, budget expectations, and design aspirations forms the foundation of every FUSIONest project.',
    points: ['Client brief and space requirements', 'Site visit and assessment', 'Budget and timeline discussion', 'Design aspirations and preferences'],
    icon: '💬'
  },
  {
    label: 'STAGE 02 · DESIGN',
    title: 'Architectural Design',
    desc: 'Our team develops the architectural concept — combining your vision with structural practicality. 3D models, floor plans, and material palettes are developed and refined.',
    points: ['Architectural planning and floor layout', '3D visualization and modelling', 'Material and finish selection', 'Design review and sign-off'],
    icon: '📐'
  },
  {
    label: 'STAGE 03 · ENGINEERING',
    title: 'Structural Engineering',
    desc: 'Every structural element is engineered before it is installed. Detailed drawings, MEP coordination, and structural calculations ensure precision on-site.',
    points: ['Structural frame detailing', 'MEP coordination drawings', 'Connection and fastener specifications', 'Bill of quantities and material planning'],
    icon: '⚙️'
  },
  {
    label: 'STAGE 04 · SITE PREPARATION',
    title: 'Site Preparation & Foundation',
    desc: 'The site is prepared, levelled, and the foundation system is established. Proper ground preparation ensures structural integrity for the entire build above.',
    points: ['Site clearing and levelling', 'Foundation design and construction', 'Ground condition assessment', 'Services preparation (water, electricity)'],
    icon: '🏗️'
  },
  {
    label: 'STAGE 05 · STRUCTURAL FRAME',
    title: 'MS Structural Frame',
    desc: 'The primary MS steel skeleton is erected on-site. Columns, beams and joists are installed, aligned and connected with engineering precision.',
    points: ['MS column and beam installation', 'Structural alignment and levelling', 'Weld and connection inspection', 'Frame quality verification'],
    icon: '🔩'
  },
  {
    label: 'STAGE 06 · WALL SYSTEM',
    title: 'Wall System Installation',
    desc: 'The engineered wall assembly is installed layer by layer — GI framing, MEP services, Rockwool insulation, vapour barrier, and cement fibre boards.',
    points: ['GI C-channel framing installation', 'Electrical and plumbing routing (MEP)', 'Rockwool insulation placement', 'Vapour barrier and board fixing'],
    icon: '🧱'
  },
  {
    label: 'STAGE 07 · FINISHING',
    title: 'Interior & Exterior Finishing',
    desc: 'The structure receives its final character — jointing, priming, painting, flooring, fixtures, and all interior and exterior elements that complete the space.',
    points: ['Joint treatment and surface prep', 'Exterior and interior painting', 'Flooring installation', 'Fixtures, fittings and landscaping'],
    icon: '🎨'
  },
  {
    label: 'STAGE 08 · HANDOVER',
    title: 'Quality Inspection & Handover',
    desc: 'Final quality inspection across all systems and finishes. The completed space is handed over to the client with all documentation and project records.',
    points: ['Final quality inspection walkthrough', 'All systems commissioning check', 'Defect identification and resolution', 'Project handover and documentation'],
    icon: '🏡'
  }
];

const WALL_DATA = {
  1: {
    num: 'LAYER 01 · EXTERNAL FINISH',
    name: 'External Finish',
    desc: 'The outermost face of the FUSIONest wall system. A weather-resistant exterior finish provides durability, aesthetic character, and protection from the elements — rain, heat, and UV.',
    specs: [
      { label: 'Function', value: 'Weather protection & aesthetics' },
      { label: 'Position', value: 'Outermost layer' },
      { label: 'Materials', value: 'Exterior grade paint / texture coat' }
    ]
  },
  2: {
    num: 'LAYER 02 · CEMENT FIBRE BOARD',
    name: 'Cement Fibre Board',
    desc: 'A durable, dimensionally stable panel system that forms the structural sheathing of the wall. Provides a high-quality, flat substrate for exterior and interior finishes.',
    specs: [
      { label: 'Function', value: 'Structural sheathing & substrate' },
      { label: 'Material', value: 'Cement fibre composite panel' },
      { label: 'Application', value: 'Fixed to GI framing with fasteners' }
    ]
  },
  3: {
    num: 'LAYER 03 · VAPOUR BARRIER',
    name: 'Vapour Barrier',
    desc: 'A moisture management membrane that prevents condensation from migrating through the wall assembly. Protects the insulation and structural components from moisture-related degradation.',
    specs: [
      { label: 'Function', value: 'Moisture control' },
      { label: 'Material', value: 'Polyethylene membrane' },
      { label: 'Installation', value: 'Continuous layer over insulation' }
    ]
  },
  4: {
    num: 'LAYER 04 · ROCKWOOL INSULATION',
    name: 'Rockwool Insulation',
    desc: 'Mineral wool insulation that fills the GI frame cavity, providing both thermal and acoustic performance. Reduces heat transfer and improves indoor comfort significantly.',
    specs: [
      { label: 'Function', value: 'Thermal & acoustic insulation' },
      { label: 'Material', value: 'Mineral (rock) wool / Rockwool' },
      { label: 'Benefits', value: 'Thermal comfort, noise reduction' }
    ]
  },
  5: {
    num: 'LAYER 05 · MEP SERVICES',
    name: 'MEP Services',
    desc: 'Mechanical, Electrical and Plumbing services are routed through the wall cavity within the GI frame grid. Conduits, wiring, and plumbing pipes are coordinated in the wall before boarding.',
    specs: [
      { label: 'Electrical', value: 'Conduits and cable routing' },
      { label: 'Plumbing', value: 'Supply and drain pipes' },
      { label: 'Coordination', value: 'Pre-planned service routes' }
    ]
  },
  6: {
    num: 'LAYER 06 · GI WALL FRAMING',
    name: 'GI Wall Framing',
    desc: 'Cold-formed galvanised iron C-channel framing forms the precision support grid for the entire wall assembly. Vertical studs and horizontal tracks create a dimensionally accurate wall skeleton.',
    specs: [
      { label: 'Material', value: 'Galvanised Iron (GI) C-channel' },
      { label: 'Function', value: 'Wall panel support structure' },
      { label: 'Configuration', value: 'Vertical studs + horizontal tracks' }
    ]
  },
  7: {
    num: 'LAYER 07 · MS STRUCTURAL FRAME',
    name: 'MS Structural Frame',
    desc: 'The primary mild steel structural skeleton of the building. Columns, beams and joists transmit all loads to the foundation. Engineered, fabricated and erected on-site with precision.',
    specs: [
      { label: 'Material', value: 'Mild Steel (MS) sections' },
      { label: 'Function', value: 'Primary load-bearing skeleton' },
      { label: 'Components', value: 'Columns, beams, joists, connections' }
    ]
  }
};

// ── DOM READY ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNav();
  initHeroCanvas();
  initRevealObserver();
  initCounters();
  initStages();
  initProjects();
  initPresentationMode();
  initContactForm();
  initModelScroll();
  initFilterDrag();

  // Auto-refresh projects when admin saves (cross-tab localStorage change)
  window.addEventListener('storage', (e) => {
    if (e.key === 'fn_projects') {
      const activeFilter = document.querySelector('.filter-btn.active');
      loadProjects(activeFilter ? activeFilter.dataset.filter : 'all');
    }
  });

  // Also refresh when user switches back to this tab from admin
  window.addEventListener('focus', () => {
    const activeFilter = document.querySelector('.filter-btn.active');
    loadProjects(activeFilter ? activeFilter.dataset.filter : 'all');
  });
});

// ── LOADER ────────────────────────────────────────────────────
function initLoader() {
  const loader = document.getElementById('loader');
  const bar    = document.getElementById('loader-bar');
  const pct    = document.getElementById('loader-pct');
  if (!loader) return;
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        triggerHeroAnimation();
      }, 300);
    }
    bar.style.width = progress + '%';
    pct.textContent = Math.round(progress) + '%';
  }, 80);
  document.body.style.overflow = 'hidden';
}

function triggerHeroAnimation() {
  const badge   = document.querySelector('.hero-badge');
  const title   = document.querySelector('.hero-title');
  const sub     = document.querySelector('.hero-sub');
  const ctas    = document.querySelector('.hero-ctas');
  const scroll  = document.querySelector('.hero-scroll');
  [badge, title, sub, ctas, scroll].forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, i * 150);
  });
}

// ── NAVIGATION ────────────────────────────────────────────────
function initNav() {
  const nav       = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const closeBtn  = document.getElementById('mobile-nav-close');

  // Scroll behavior
  window.addEventListener('scroll', () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Active link
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          const href = a.getAttribute('href').replace('#', '');
          a.classList.toggle('active', href === id);
        });
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => observer.observe(s));

  // Hamburger
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      const open = mobileNav.classList.contains('open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  if (closeBtn && mobileNav) {
    closeBtn.addEventListener('click', () => mobileNav.classList.remove('open'));
  }
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileNav && mobileNav.classList.remove('open'));
  });
}

// ── THREE.JS HERO CANVAS ──────────────────────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 8, 20);
  camera.lookAt(0, 0, 0);

  // ── Blueprint grid ──
  const gridHelper = new THREE.GridHelper(40, 20, 0xC8A96E, 0xC8A96E);
  gridHelper.material.opacity = 0.06;
  gridHelper.material.transparent = true;
  gridHelper.position.y = -4;
  scene.add(gridHelper);

  // ── Particles ──
  const particleCount = 180;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xC8A96E, size: 0.08, transparent: true, opacity: 0.4 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Wireframe Building Structure ──
  const buildingGroup = new THREE.Group();
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x4A9EDB, wireframe: true });
  const goldMat = new THREE.MeshBasicMaterial({ color: 0xC8A96E, wireframe: true });

  // Foundation slab
  const foundGeo = new THREE.BoxGeometry(10, 0.3, 8);
  const found = new THREE.Mesh(foundGeo, wireMat);
  found.position.y = -3.5;
  buildingGroup.add(found);

  // Columns (4 corners)
  const colPositions = [[-4.5, 0, -3.5], [4.5, 0, -3.5], [-4.5, 0, 3.5], [4.5, 0, 3.5]];
  colPositions.forEach(p => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6, 0.3), goldMat);
    col.position.set(p[0], p[1], p[2]);
    buildingGroup.add(col);
  });

  // Beams (top)
  const beamGeo = new THREE.BoxGeometry(10, 0.3, 0.3);
  const beam1 = new THREE.Mesh(beamGeo, wireMat);
  beam1.position.set(0, 3, -3.5);
  const beam2 = beam1.clone();
  beam2.position.set(0, 3, 3.5);
  buildingGroup.add(beam1, beam2);

  const beamGeoZ = new THREE.BoxGeometry(0.3, 0.3, 8);
  const beam3 = new THREE.Mesh(beamGeoZ, wireMat);
  beam3.position.set(-4.5, 3, 0);
  const beam4 = beam3.clone();
  beam4.position.set(4.5, 3, 0);
  buildingGroup.add(beam3, beam4);

  // Floor slab
  const floorGeo = new THREE.BoxGeometry(9.5, 0.15, 7.5);
  const floorMesh = new THREE.Mesh(floorGeo, wireMat);
  floorMesh.position.y = -0.3;
  buildingGroup.add(floorMesh);

  // Roof
  const roofGeo = new THREE.BoxGeometry(10, 0.15, 8);
  const roof = new THREE.Mesh(roofGeo, goldMat);
  roof.position.y = 3.1;
  buildingGroup.add(roof);

  // Wall panels (partial)
  const wallFront = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 0.05), new THREE.MeshBasicMaterial({ color: 0x4A9EDB, transparent: true, opacity: 0.04, wireframe: false }));
  wallFront.position.set(0, 0, -3.5);
  buildingGroup.add(wallFront);

  buildingGroup.position.set(0, 0, 0);
  buildingGroup.rotation.y = 0.3;
  scene.add(buildingGroup);

  // ── Ambient light lines ──
  const lineMat = new THREE.LineBasicMaterial({ color: 0xC8A96E, transparent: true, opacity: 0.12 });
  for (let i = 0; i < 8; i++) {
    const pts = [];
    pts.push(new THREE.Vector3((Math.random() - 0.5) * 50, Math.random() * 20 - 5, (Math.random() - 0.5) * 30));
    pts.push(new THREE.Vector3((Math.random() - 0.5) * 50, Math.random() * 20 - 5, (Math.random() - 0.5) * 30));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    scene.add(new THREE.Line(lineGeo, lineMat));
  }

  // ── Animate ──
  let frame = 0;
  let animating = true;
  function animate() {
    if (!animating) return;
    requestAnimationFrame(animate);
    frame += 0.003;
    buildingGroup.rotation.y = 0.3 + Math.sin(frame * 0.4) * 0.15;
    buildingGroup.position.y = Math.sin(frame * 0.3) * 0.2;
    particles.rotation.y += 0.0008;
    particles.rotation.x += 0.0003;
    camera.position.x = Math.sin(frame * 0.15) * 1.5;
    camera.position.y = 8 + Math.sin(frame * 0.2) * 0.5;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });

  // Cleanup on mobile (low power)
  if (window.innerWidth < 768) {
    setTimeout(() => { animating = false; renderer.dispose(); }, 5000);
  }
}

// ── REVEAL ON SCROLL ──────────────────────────────────────────
function initRevealObserver() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

// ── COUNTERS ──────────────────────────────────────────────────
function initCounters() {
  const els = document.querySelectorAll('.stat-number[data-target]');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      let start    = 0;
      const step   = Math.ceil(target / 60);
      const timer  = setInterval(() => {
        start += step;
        if (start >= target) {
          start = target;
          clearInterval(timer);
        }
        el.textContent = start.toLocaleString() + suffix;
      }, 24);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => obs.observe(el));
}

// ── CONSTRUCTION STAGES ───────────────────────────────────────
function initStages() {
  const cards  = document.querySelectorAll('.stage-card');
  const detail = document.getElementById('stage-detail');
  const sdLabel = document.getElementById('sd-label');
  const sdTitle = document.getElementById('sd-title');
  const sdDesc  = document.getElementById('sd-desc');
  const sdPoints= document.getElementById('sd-points');
  const sdIcon  = document.getElementById('sd-icon');
  if (!cards.length || !detail) return;

  function showStage(idx) {
    const d = STAGE_DATA[idx];
    if (!d) return;
    sdLabel.textContent  = d.label;
    sdTitle.textContent  = d.title;
    sdDesc.textContent   = d.desc;
    sdIcon.textContent   = d.icon;
    sdPoints.innerHTML   = d.points.map(p => `<div class="stage-point">${p}</div>`).join('');
    detail.classList.add('visible');
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
  }

  cards.forEach((card, idx) => {
    card.addEventListener('click', () => showStage(idx));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showStage(idx); } });
  });

  // Auto-open first on scroll
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { showStage(0); obs.disconnect(); }
    });
  }, { threshold: 0.3 });
  const section = document.getElementById('stages');
  if (section) obs.observe(section);

  // Drag scroll for stage track
  initDragScroll('stages-wrap');
}

// ── DRAG SCROLL ───────────────────────────────────────────────
function initDragScroll(wrapperId) {
  const wrap = document.getElementById(wrapperId);
  if (!wrap) return;
  let isDown = false, startX = 0, scrollLeft = 0;
  wrap.addEventListener('mousedown', e => {
    isDown = true; wrap.classList.add('grabbing');
    startX = e.pageX - wrap.offsetLeft;
    scrollLeft = wrap.scrollLeft;
  });
  wrap.addEventListener('mouseleave', () => { isDown = false; wrap.classList.remove('grabbing'); });
  wrap.addEventListener('mouseup', () => { isDown = false; wrap.classList.remove('grabbing'); });
  wrap.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - wrap.offsetLeft;
    const walk = (x - startX) * 1.5;
    wrap.scrollLeft = scrollLeft - walk;
  });
}

function initFilterDrag() {
  initDragScroll('filters');
}

// ── PROJECTS ──────────────────────────────────────────────────
function initProjects() {
  loadProjects('all');

  // Filters
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      loadProjects(btn.dataset.filter);
    });
  });

  // Modal close
  const modal    = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }
  if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      modal.classList.remove('open');
    }
  });

  // Auto-refresh when admin saves (listens for localStorage signal)
  window.addEventListener('storage', (e) => {
    if (e.key === 'fn_projects_updated') {
      const activeFilter = document.querySelector('.filter-btn.active');
      loadProjects(activeFilter ? activeFilter.dataset.filter : 'all');
    }
  });
  // Refresh when user switches back to this tab
  window.addEventListener('focus', () => {
    const activeFilter = document.querySelector('.filter-btn.active');
    loadProjects(activeFilter ? activeFilter.dataset.filter : 'all');
  });
}




function loadProjects(filter) {
  const grid  = document.getElementById('projects-grid');
  const empty = document.getElementById('projects-empty');
  if (!grid) return;

  getProjectsFromDB(function(allProjects) {
    let projects = allProjects.filter(p => p.published !== false);
    if (filter && filter !== 'all') projects = projects.filter(p => p.category === filter);

    // Clear existing cards
    Array.from(grid.children).forEach(c => { if (c.id !== 'projects-empty') c.remove(); });

    if (!projects.length) {
      empty && (empty.style.display = 'block');
      return;
    }
    empty && (empty.style.display = 'none');

    projects.forEach((p, i) => {
      const card = createProjectCard(p, i);
      grid.appendChild(card);
    });

    // Animate cards in
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('reveal-card'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.project-card').forEach(c => obs.observe(c));
  });
}

function createProjectCard(p, idx) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${p.name} — ${p.category}`);
  card.style.animationDelay = `${idx * 0.08}s`;

  const imgHtml = p.featuredImage
    ? `<img src="${escHtml(p.featuredImage)}" alt="${escHtml(p.name)} project image" loading="lazy" />`
    : `<div class="project-card-img-placeholder">${getCategoryIcon(p.category)}</div>`;

  card.innerHTML = `
    <div class="project-card-img">
      ${imgHtml}
      <div class="project-card-category">${escHtml(p.category)}</div>
      ${p.featured ? '<div class="project-card-featured">★</div>' : ''}
    </div>
    <div class="project-card-body">
      <div class="project-card-code">${escHtml(p.code || 'FN-000')}</div>
      <div class="project-card-name">${escHtml(p.name)}</div>
      <div class="project-card-location">📍 ${escHtml(p.location || 'Hyderabad')}</div>
      <div class="project-card-meta">
        ${p.area ? `<div class="project-meta-item"><span class="project-meta-label">Area</span><span class="project-meta-value">${escHtml(p.area)}</span></div>` : ''}
        ${p.floors ? `<div class="project-meta-item"><span class="project-meta-label">Floors</span><span class="project-meta-value">${escHtml(p.floors)}</span></div>` : ''}
        ${p.status ? `<div class="project-meta-item"><span class="project-meta-label">Status</span><span class="project-meta-value">${escHtml(p.status)}</span></div>` : ''}
      </div>
    </div>
    <div class="project-card-footer">
      <span class="project-status ${p.status === 'Completed' ? 'status-completed' : 'status-ongoing'}">
        <span class="status-dot"></span>${escHtml(p.status || 'Completed')}
      </span>
      <span class="project-card-enter">Enter Project →</span>
    </div>
  `;

  card.addEventListener('click', () => openProjectModal(p));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProjectModal(p); } });
  return card;
}

function getCategoryIcon(cat) {
  const icons = { Residential:'🏠', Farmhouse:'🌾', Resort:'🏨', Commercial:'🏢', Office:'💼', 'Site Office':'🏗️' };
  return icons[cat] || '🏗️';
}

function openProjectModal(p) {
  const modal       = document.getElementById('project-modal');
  const heroImg     = document.getElementById('modal-hero-img');
  const category    = document.getElementById('modal-category');
  const title       = document.getElementById('modal-title');
  const location    = document.getElementById('modal-location');
  const meta        = document.getElementById('modal-meta');
  const desc        = document.getElementById('modal-desc');
  const gallery     = document.getElementById('modal-gallery');
  if (!modal) return;

  if (heroImg) {
    heroImg.src = p.featuredImage || '';
    heroImg.alt = p.name + ' project image';
    heroImg.style.display = p.featuredImage ? '' : 'none';
  }
  if (category) category.textContent = p.category;
  if (title)    title.textContent    = p.name;
  if (location) location.textContent = p.location || 'Hyderabad';
  if (desc)     desc.textContent     = p.description || 'Project details will be added.';

  if (meta) {
    const metas = [
      { label: 'Project Code', value: p.code },
      { label: 'Area', value: p.area },
      { label: 'Floors', value: p.floors },
      { label: 'Status', value: p.status }
    ].filter(m => m.value);
    meta.innerHTML = metas.map(m => `
      <div class="project-modal-meta-item">
        <div class="project-modal-meta-label">${m.label}</div>
        <div class="project-modal-meta-value">${escHtml(m.value)}</div>
      </div>
    `).join('');
  }

  if (gallery) {
    const images = (p.gallery || []).slice(0, 6);
    gallery.innerHTML = images.map(img => `
      <div class="project-modal-gallery-img">
        <img src="${escHtml(img)}" alt="${escHtml(p.name)} gallery image" loading="lazy" />
      </div>
    `).join('') || '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px;">Gallery will be added via admin dashboard.</div>';
  }

  modal.classList.add('open');
  modal.scrollTop = 0;
}

// ── PRESENTATION MODE ─────────────────────────────────────────
function initPresentationMode() {
  const mode      = document.getElementById('presentation-mode');
  const enterBtn  = document.getElementById('enter-presentation');
  const closeBtn  = document.getElementById('pres-close');
  const nextBtn   = document.getElementById('pres-next');
  const backBtn   = document.getElementById('pres-back');
  const dotsWrap  = document.getElementById('pres-dots');
  const counter   = document.getElementById('pres-counter');
  const slides    = document.querySelectorAll('.pres-slide');
  if (!mode || !slides.length) return;

  let current = 0;
  const total = slides.length;

  // Build dots
  if (dotsWrap) {
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'pres-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(idx) {
    slides[current].classList.remove('active');
    current = Math.max(0, Math.min(idx, total - 1));
    slides[current].classList.add('active');
    if (counter) counter.textContent = `${current + 1} / ${total}`;
    if (backBtn)  backBtn.disabled = current === 0;
    if (nextBtn)  nextBtn.textContent = current === total - 1 ? '✕ Exit' : 'Next →';
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.pres-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }
  }

  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      mode.classList.add('active');
      goTo(0);
      document.body.style.overflow = 'hidden';
    });
  }
  function exitPres() {
    mode.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (closeBtn) closeBtn.addEventListener('click', exitPres);
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (current >= total - 1) exitPres();
    else goTo(current + 1);
  });
  if (backBtn) backBtn.addEventListener('click', () => goTo(current - 1));

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (!mode.classList.contains('active')) return;
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'Escape') exitPres();
  });
  goTo(0);
}

// ── CONTACT FORM ──────────────────────────────────────────────
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const submit  = document.getElementById('form-submit');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('cf-name')?.value?.trim();
    const phone = document.getElementById('cf-phone')?.value?.trim();
    const type  = document.getElementById('cf-type')?.value;
    if (!name || !phone || !type) {
      alert('Please fill in your name, phone and project type.');
      return;
    }
    // Save lead to localStorage
    const leads = JSON.parse(localStorage.getItem('fn_leads') || '[]');
    leads.push({
      id: Date.now(),
      name, phone,
      email:    document.getElementById('cf-email')?.value || '',
      type,
      area:     document.getElementById('cf-area')?.value || '',
      location: document.getElementById('cf-location')?.value || '',
      message:  document.getElementById('cf-message')?.value || '',
      date:     new Date().toISOString()
    });
    localStorage.setItem('fn_leads', JSON.stringify(leads));
    if (submit) submit.disabled = true;
    form.reset();
    if (success) success.classList.add('show');
    setTimeout(() => {
      if (success) success.classList.remove('show');
      if (submit) submit.disabled = false;
    }, 5000);
  });
}

// ── MODEL SCROLL ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function initModelScroll() {
  initDragScroll('models-track-wrap');
}

// ── PROJECT DATA (Netlify = fetch JSON; local = IndexedDB) ────
var _mainDB = null;
function openMainDB(cb) {
  if (_mainDB) { cb(_mainDB); return; }
  var req = indexedDB.open('fusionest_db', 1);
  req.onupgradeneeded = function(e) {
    var db = e.target.result;
    if (!db.objectStoreNames.contains('projects')) {
      db.createObjectStore('projects', { keyPath: 'id' });
    }
  };
  req.onsuccess = function(e) { _mainDB = e.target.result; cb(_mainDB); };
  req.onerror   = function()  { cb(null); };
}

function getProjectsFromDB(callback) {
  if (location.protocol !== 'file:') {
    // Hosted on Netlify — fetch static JSON, visible to all visitors
    fetch('data/projects.json?t=' + Date.now())
      .then(function(r) { return r.ok ? r.json() : []; })
      .then(function(d) { callback(Array.isArray(d) ? d : []); })
      .catch(function()  { callback([]); });
    return;
  }
  // Local file:// — use IndexedDB for preview
  openMainDB(function(db) {
    if (!db) { callback([]); return; }
    var req = db.transaction('projects', 'readonly').objectStore('projects').getAll();
    req.onsuccess = function() { callback(req.result || []); };
    req.onerror   = function() { callback([]); };
  });
}

// ── UTILS ─────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
