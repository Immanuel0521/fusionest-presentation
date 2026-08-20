/* ============================================================
   FUSIONest — Interactive Wall System
   Clickable wall layers with glass info panels
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', initWallSystem);

// Layer data (matches WALL_DATA in main.js but self-contained here)
const WALL_LAYERS = {
  1: {
    num: 'LAYER 01 · EXTERNAL FINISH',
    name: 'External Finish',
    desc: 'The outermost face of the FUSIONest wall. A weather-resistant exterior finish provides durability, aesthetic character, and protection from rain, heat, and UV exposure.',
    specs: [
      { label: 'Function', value: 'Weather protection & aesthetics' },
      { label: 'Position', value: 'Outermost layer' },
      { label: 'Material', value: 'Exterior grade paint / texture' }
    ]
  },
  2: {
    num: 'LAYER 02 · CEMENT FIBRE BOARD',
    name: 'Cement Fibre Board',
    desc: 'A dimensionally stable panel system forming the structural sheathing. Provides a high-quality, flat substrate for all exterior and interior finishes. Durable and precision-fitted.',
    specs: [
      { label: 'Function', value: 'Structural sheathing & substrate' },
      { label: 'Material', value: 'Cement fibre composite panel' },
      { label: 'Fixing', value: 'Fixed to GI framing with fasteners' }
    ]
  },
  3: {
    num: 'LAYER 03 · VAPOUR BARRIER',
    name: 'Vapour Barrier',
    desc: 'A moisture management membrane that prevents condensation from migrating through the wall assembly. Protects insulation and structural components from moisture degradation.',
    specs: [
      { label: 'Function', value: 'Moisture & vapour control' },
      { label: 'Material', value: 'Polyethylene / foil membrane' },
      { label: 'Installation', value: 'Continuous layer, sealed joints' }
    ]
  },
  4: {
    num: 'LAYER 04 · ROCKWOOL INSULATION',
    name: 'Rockwool Insulation',
    desc: 'Mineral wool insulation filling the GI frame cavity. Provides both thermal and acoustic performance — significantly reducing heat transfer and improving indoor comfort.',
    specs: [
      { label: 'Function', value: 'Thermal & acoustic insulation' },
      { label: 'Material', value: 'Mineral (rock) wool' },
      { label: 'Benefits', value: 'Temperature comfort, noise reduction' }
    ]
  },
  5: {
    num: 'LAYER 05 · MEP SERVICES',
    name: 'MEP Services',
    desc: 'Mechanical, Electrical and Plumbing services are routed through the wall cavity. Conduits, wiring, and plumbing pipes are coordinated within the GI frame before boarding.',
    specs: [
      { label: 'Electrical', value: 'Conduits and cable routing' },
      { label: 'Plumbing', value: 'Supply and drain pipework' },
      { label: 'Coordination', value: 'Pre-planned service routes' }
    ]
  },
  6: {
    num: 'LAYER 06 · GI WALL FRAMING',
    name: 'GI Wall Framing',
    desc: 'Cold-formed galvanised iron C-channel framing creates the precision support grid for the wall assembly. Vertical studs and horizontal tracks provide a dimensionally accurate skeleton.',
    specs: [
      { label: 'Material', value: 'Galvanised Iron (GI) C-channel' },
      { label: 'Function', value: 'Wall panel support structure' },
      { label: 'Components', value: 'Studs, tracks, openings, fasteners' }
    ]
  },
  7: {
    num: 'LAYER 07 · MS STRUCTURAL FRAME',
    name: 'MS Structural Frame',
    desc: 'The primary mild steel structural skeleton. Columns, beams and joists transmit all structural loads to the foundation. Engineered, detailed and erected on-site with precision.',
    specs: [
      { label: 'Material', value: 'Mild Steel (MS) sections' },
      { label: 'Function', value: 'Primary load-bearing skeleton' },
      { label: 'Components', value: 'Columns, beams, joists, connections' }
    ]
  }
};

function initWallSystem() {
  const layers   = document.querySelectorAll('.wall-layer');
  const panel    = document.getElementById('wall-info-panel');
  const segments = document.querySelectorAll('.wall-visual-segment');
  if (!layers.length || !panel) return;

  function activateLayer(num) {
    num = parseInt(num);
    const data = WALL_LAYERS[num];
    if (!data) return;

    // Update layers
    layers.forEach(l => l.classList.toggle('active', parseInt(l.dataset.layer) === num));

    // Update segments
    segments.forEach(s => s.classList.toggle('active', parseInt(s.dataset.seg) === num));

    // Update info panel with animation
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(10px)';
    setTimeout(() => {
      updatePanel(data);
      panel.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    }, 120);
  }

  function updatePanel(data) {
    const numEl  = document.getElementById('wip-num');
    const nameEl = document.getElementById('wip-name');
    const descEl = document.getElementById('wip-desc');
    const specEl = document.getElementById('wip-specs');
    if (numEl)  numEl.textContent  = data.num;
    if (nameEl) nameEl.textContent = data.name;
    if (descEl) descEl.textContent = data.desc;
    if (specEl) {
      specEl.innerHTML = data.specs.map(s => `
        <div class="wall-spec-row">
          <span class="wall-spec-label">${s.label}</span>
          <span class="wall-spec-value">${s.value}</span>
        </div>
      `).join('');
    }
  }

  layers.forEach(layer => {
    layer.addEventListener('click', () => activateLayer(layer.dataset.layer));
    layer.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateLayer(layer.dataset.layer);
      }
    });
  });

  // Segment clicks also trigger layers
  segments.forEach(seg => {
    seg.addEventListener('click', () => activateLayer(seg.dataset.seg));
  });

  // Auto-activate first layer
  activateLayer(1);

  // Auto-cycle layers for visual interest on load (stop on first user interaction)
  let autoCycle = null;
  let userInteracted = false;
  let cycleIdx = 1;

  function startAutoCycle() {
    if (userInteracted) return;
    autoCycle = setInterval(() => {
      if (userInteracted) { clearInterval(autoCycle); return; }
      cycleIdx = cycleIdx >= 7 ? 1 : cycleIdx + 1;
      activateLayer(cycleIdx);
    }, 2500);
  }

  layers.forEach(layer => {
    layer.addEventListener('click', () => {
      userInteracted = true;
      if (autoCycle) clearInterval(autoCycle);
    });
  });

  // Start cycle when wall system is in view
  const section = document.getElementById('wall-system');
  if (section) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !userInteracted) startAutoCycle();
        else if (!e.isIntersecting) { clearInterval(autoCycle); }
      });
    }, { threshold: 0.3 });
    obs.observe(section);
  }
}
