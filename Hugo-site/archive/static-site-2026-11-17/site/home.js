(function () {
  const { palaces, planned, centre, sortName, span, pageFor } = window.LPP;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T0 = 1400, T1 = 1750; // timeline scale
  const pct = (y) => ((y - T0) / (T1 - T0) * 100).toFixed(3) + '%';

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'style') n.style.cssText = v;
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids) if (k != null) n.append(k);
    return n;
  }

  // ---- Cards ------------------------------------------------------------
  const built = palaces.filter((p) => p.model);
  document.getElementById('palace-count').textContent =
    built.length + ' models so far, with Whitehall and five more in preparation.';
  document.getElementById('prep-list').textContent = planned.map((p) => p.name).join(' · ');

  const cardsEl = document.getElementById('cards');
  function renderCards(order) {
    const list = palaces.slice();
    if (order === 'name') list.sort((a, b) => sortName(a.name).localeCompare(sortName(b.name)));
    cardsEl.replaceChildren(...list.map((p) => el('li', null,
      el('a', { class: 'card' + (p.model ? '' : ' is-soon'), href: pageFor(p) },
        el('h3', null, p.title),
        el('span', { class: 'dates' }, span(p)),
        el('span', { class: 'span-bar', 'aria-hidden': 'true' },
          el('span', { style: 'left:' + pct(p.start) + ';width:calc(' + pct(p.end) + ' - ' + pct(p.start) + ')' })),
        el('span', { class: 'place' }, p.place),
        el('span', { class: 'card-cta' }, p.model ? 'Open the model →' : 'Model being added')
      ))));
  }
  renderCards('date');
  document.querySelectorAll('[data-sort]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('[data-sort]').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    renderCards(b.dataset.sort);
  }));

  // ---- Timeline ---------------------------------------------------------
  const axis = document.getElementById('tl-axis');
  for (let y = T0; y <= T1; y += 50) axis.append(el('span', { style: 'left:' + pct(y) }, String(y)));
  document.getElementById('tl-rows').replaceChildren(...palaces.map((p) => el('li', null,
    el('a', { class: 'tl-row' + (p.model ? '' : ' is-soon'), href: pageFor(p) },
      el('span', { class: 'tl-name' }, p.name, el('span', { class: 'sr-only' }, ', ' + span(p))),
      el('span', { class: 'tl-track', 'aria-hidden': 'true' },
        el('span', { style: 'left:' + pct(p.start) + ';width:calc(' + pct(p.end) + ' - ' + pct(p.start) + ')' }))
    ))));

  // ---- Map ----------------------------------------------------------------
  const all = palaces.map((p) => ({ ...p, kind: p.id === 'whitehall' ? 'centre' : 'model' }))
    .concat(planned.map((p) => ({ ...p, kind: 'soon' })));
  // Bridewell and Baynard's Castle are a few hundred metres apart: one shared label.
  const labels = { baynards: 'Baynard’s Castle · Bridewell', bridewell: null };
  const far = new Set(['tickenhill', 'linlithgow', 'fieldofgold']);

  const listEl = document.getElementById('pin-list');
  const cardEl = document.getElementById('map-card');
  const markers = {};
  let map = null;
  let selected = null;

  const sorted = all.slice().sort((a, b) => sortName(a.name).localeCompare(sortName(b.name)));
  listEl.replaceChildren(...sorted.map((p) => el('li', null,
    el('button', { type: 'button', 'data-id': p.id, 'aria-pressed': 'false' },
      el('i', { class: 'dot' + (p.kind === 'centre' ? ' centre' : p.kind === 'soon' ? ' soon' : ''), 'aria-hidden': 'true' }),
      el('span', null, p.name),
      el('span', { class: 'yrs' }, p.start ? span(p) : 'in preparation'))
  )));
  listEl.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-id]');
    if (b) select(b.dataset.id, true);
  });

  function select(id, pan) {
    const p = all.find((x) => x.id === id);
    if (!p) return;
    selected = id;
    listEl.querySelectorAll('button[data-id]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
    for (const [mid, m] of Object.entries(markers)) {
      const n = m.getElement();
      if (!n) continue;
      n.classList.toggle('on', mid === id);
      n.setAttribute('aria-pressed', String(mid === id));
      m.setZIndexOffset(mid === id ? 1000 : 0);
    }
    const meta = el('div', { class: 'meta' });
    if (p.start) meta.append(el('span', { class: 'dates' }, span(p)), ' · ');
    meta.append(p.place);
    let action;
    if (p.kind === 'soon') action = el('span', { class: 'meta' }, 'Model in preparation');
    else if (!p.model) action = el('a', { href: pageFor(p) }, 'About this palace →');
    else action = el('a', { href: pageFor(p) }, 'Open the ' + p.name + ' model →');
    cardEl.replaceChildren(el('div', null, el('div', { class: 'name' }, p.title || p.name), meta), action);

    if (pan && map) {
      const ll = L.latLng(p.lat, p.lon);
      if (!map.getBounds().pad(-0.1).contains(ll)) {
        const z = far.has(p.id) ? 9 : Math.max(map.getZoom(), 10);
        if (reduceMotion) map.setView(ll, z); else map.flyTo(ll, z, { duration: 0.8 });
      }
    }
  }

  if (window.L) {
    const narrow = window.matchMedia('(max-width: 640px)').matches;
    map = L.map('map', {
      center: [centre.lat, centre.lon],
      zoom: narrow ? 9 : 10,
      scrollWheelZoom: false, // don't trap page scrolling; enabled once the map is clicked or focused
      zoomAnimation: !reduceMotion,
      fadeAnimation: !reduceMotion,
      markerZoomAnimation: !reduceMotion
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    map.on('click focus', () => map.scrollWheelZoom.enable());
    map.on('mouseout blur', () => map.scrollWheelZoom.disable());
    // The map container itself takes focus for arrow-key panning; give it a clear name.
    map.getContainer().setAttribute('aria-label', 'Map of palace sites, centred on Whitehall. Use the arrow keys to pan and plus or minus to zoom.');

    for (const p of all) {
      const m = L.marker([p.lat, p.lon], {
        icon: L.divIcon({ className: 'lpp-pin ' + p.kind, html: '<i></i>', iconSize: [44, 44], iconAnchor: [22, 22] }),
        keyboard: true,
        riseOnHover: true
      }).addTo(map);
      const n = m.getElement();
      n.setAttribute('role', 'button');
      n.setAttribute('aria-label', p.name + (p.kind === 'soon' ? ', in preparation' : ''));
      n.setAttribute('aria-pressed', 'false');
      n.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); select(p.id, false); }
      });
      m.on('click', () => select(p.id, false));
      const label = p.id in labels ? labels[p.id] : p.name;
      if (label) {
        m.bindTooltip(label, { permanent: true, direction: 'right', offset: [12, 0], className: 'lpp-label', interactive: false });
        const t = m.getTooltip().getElement();
        if (t) t.setAttribute('aria-hidden', 'true');
      }
      markers[p.id] = m;
    }
  } else {
    document.getElementById('map').replaceChildren(el('p', { style: 'padding:24px;margin:0' },
      'The map could not load. Every palace is listed beside it.'));
  }

  select('whitehall', false);
})();
