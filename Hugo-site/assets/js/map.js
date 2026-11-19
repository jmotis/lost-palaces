// The map page: Leaflet map, pins, year filter, details card and the grouped lists under the map.
(function () {
  const data = JSON.parse(document.getElementById('map-data').textContent);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sortName = (n) => n.replace(/^The /, '');
  // A palace's years: models have start and end; extant palaces run to today; some unmodeled sites are one year.
  const endYear = (p) => (p.end == null ? Infinity : p.end);
  const span = (p) => {
    if (p.start == null) return '';
    const from = p.startLabel || String(p.start);
    if (p.end == null) return from + '–today';
    return p.end === p.start ? from : from + '–' + p.end;
  };

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids) if (k != null) n.append(k);
    return n;
  }

  // ---- Map ----------------------------------------------------------------
  const all = data.pins;
  // The central London pins sit close together: send their labels in different directions.
  const labelDir = {
    whitehall: 'left', bridewell: 'top', baynards: 'right', greenwich: 'bottom',
    richmond: 'left', oatlands: 'left', nonsuch: 'right'
  };
  // The lists under the map: one per pin colour (Models, Unmodeled, Extant), each in a closed <details>.
  const listEl = document.getElementById('pin-groups');
  const cardEl = document.getElementById('map-card');
  const markers = {};
  let map = null;
  let selectedId = null;
  let redeclutter = () => {};
  let refilter = () => {};

  const sorted = all.slice().sort((a, b) => sortName(a.name).localeCompare(sortName(b.name)));
  listEl.querySelectorAll('ul[data-kind]').forEach((ul) => {
    ul.replaceChildren(...sorted.filter((p) => p.kind === ul.dataset.kind).map((p) => el('li', { 'data-li': p.id },
      el('button', { type: 'button', 'data-id': p.id, 'aria-pressed': 'false' },
        el('span', null, p.name),
        p.start != null ? el('span', { class: 'yrs' }, span(p)) : null)
    )));
  });
  listEl.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-id]');
    if (b) select(b.dataset.id, true);
  });

  function select(id, pan) {
    const p = all.find((x) => x.id === id);
    if (!p) return;
    selectedId = id;
    listEl.querySelectorAll('button[data-id]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
    for (const [mid, m] of Object.entries(markers)) {
      const n = m.getElement();
      if (!n) continue;
      n.classList.toggle('on', mid === id);
      n.setAttribute('aria-pressed', String(mid === id));
      m.setZIndexOffset(mid === id ? 1000 : 0);
    }
    const meta = el('div', { class: 'meta' });
    if (p.start != null) meta.append(el('span', { class: 'dates' }, span(p)), ' · ');
    meta.append(p.place);
    const action = p.kind === 'unmodeled' ? el('span', { class: 'meta' }, 'Unmodeled: no 3D model yet')
      : p.kind === 'extant'
        ? (p.visit
          ? el('a', { href: p.visit }, p.visitLabel + ' →')
          : el('span', { class: 'meta' }, 'Extant: still standing'))
      : el('a', { href: p.url }, 'Open the ' + p.name + ' model →');
    cardEl.replaceChildren(el('div', null, el('div', { class: 'name' }, el('span', { class: 'sel-label' }, 'Selected:'), ' ', p.title || p.name), meta), action);
    refilter();

    if (pan && map && map.hasLayer(markers[id])) {
      const ll = L.latLng(p.lat, p.lon);
      if (!map.getBounds().pad(-0.1).contains(ll)) {
        const z = p.far ? 8 : Math.max(map.getZoom(), 10);
        if (reduceMotion) map.setView(ll, z); else map.flyTo(ll, z, { duration: 0.8 });
      }
    }
    redeclutter();
  }

  if (window.L) {
    map = L.map('map', {
      scrollWheelZoom: false, // don't trap page scrolling; enabled once the map is clicked or focused
      zoomAnimation: !reduceMotion,
      fadeAnimation: !reduceMotion,
      markerZoomAnimation: !reduceMotion
    });
    // Centre on Whitehall, one zoom level closer than the zoom that would show every palace with a model
    // (so the most distant ones may start just off the edge).
    const c = L.latLng(data.centre.lat, data.centre.lon);
    let dLat = 0, dLon = 0;
    for (const p of all) {
      if (p.kind !== 'model') continue;
      dLat = Math.max(dLat, Math.abs(p.lat - c.lat));
      dLon = Math.max(dLon, Math.abs(p.lon - c.lng));
    }
    const fit = L.latLngBounds([c.lat - dLat, c.lng - dLon], [c.lat + dLat, c.lng + dLon]);
    map.setView(c, Math.min(11, map.getBoundsZoom(fit, false, L.point(40, 40)) + 1));
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    map.on('click focus', () => map.scrollWheelZoom.enable());
    map.on('mouseout blur', () => map.scrollWheelZoom.disable());
    map.getContainer().setAttribute('aria-label',
      'Map of palace sites, centred on Whitehall. Use the arrow keys to pan and plus or minus to zoom.');

    // A marker's element is rebuilt whenever it is re-added to the map (the year filter does that),
    // so its accessible name and label are set up again each time.
    const prepare = (p, m) => {
      const n = m.getElement();
      if (!n) return;
      n.setAttribute('role', 'button');
      n.setAttribute('aria-label', p.name + (p.kind === 'model' ? '' : ', ' + p.kind));
      n.setAttribute('aria-pressed', String(p.id === selectedId));
      n.classList.toggle('on', p.id === selectedId);
      if (!n.dataset.keys) {
        n.dataset.keys = '1';
        n.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); select(p.id, false); }
        });
      }
      const t = m.getTooltip() && m.getTooltip().getElement();
      if (t) { t.setAttribute('aria-hidden', 'true'); t.removeAttribute('role'); }
    };

    for (const p of all) {
      const m = L.marker([p.lat, p.lon], {
        icon: L.divIcon({ className: 'lpp-pin ' + p.kind, html: '<i></i>', iconSize: [44, 44], iconAnchor: [22, 22] }),
        keyboard: true,
        riseOnHover: true,
        title: p.name // native hover name, for pins whose label is hidden to avoid overlaps
      });
      // Pins without a set direction use 'auto': the label goes on whichever side faces the middle
      // of the view, so labels near the edge of the map (on a phone especially) stay inside it.
      const dir = labelDir[p.id] || 'auto';
      const offset = { auto: [12, 0], right: [12, 0], left: [-12, 0], top: [0, -12], bottom: [0, 12] }[dir];
      m.bindTooltip(p.name, { permanent: true, direction: dir, offset, className: 'lpp-label', interactive: false });
      m.on('click', () => select(p.id, false));
      m.on('add', () => prepare(p, m));
      m.addTo(map);
      markers[p.id] = m;
    }

    // Labels that would overlap a more important label or pin are hidden; zooming in brings them back.
    // Priority: the selected palace first (always shown), then palaces with models, unmodeled, extant
    // (the pin order). Each pin, labelled or not, blocks only the labels that come after it.
    const declutter = () => {
      const pad = 2;
      const boxes = [];
      const hits = (r) => boxes.some((b) => r.left < b.right + pad && r.right > b.left - pad && r.top < b.bottom + pad && r.bottom > b.top - pad);
      const dot = (m) => {
        const r = m.getElement().getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        return { left: cx - 8, right: cx + 8, top: cy - 8, bottom: cy + 8 };
      };
      const view = map.getContainer().getBoundingClientRect();
      const order = all.slice().sort((a, b) => (b.id === selectedId) - (a.id === selectedId));
      for (const p of order) {
        const m = markers[p.id];
        if (!m || !map.hasLayer(m) || !m.getElement()) continue;
        const t = m.getTooltip() && m.getTooltip().getElement();
        if (t) {
          t.style.visibility = '';
          const r = t.getBoundingClientRect();
          // A label that would be cut off by the edge of the map is hidden rather than shown in part.
          const cut = r.right > view.left && r.left < view.right && r.bottom > view.top && r.top < view.bottom &&
            (r.left < view.left || r.right > view.right || r.top < view.top || r.bottom > view.bottom);
          if (cut || (p.id !== selectedId && hits(r))) t.style.visibility = 'hidden';
          else boxes.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
        }
        boxes.push(dot(m));
      }
    };
    map.on('zoomend moveend', declutter);
    redeclutter = declutter;
    requestAnimationFrame(declutter);
  } else {
    document.getElementById('map').replaceChildren(el('p', { style: 'padding:24px;margin:0' },
      'The map could not load. Every palace is listed below it.'));
  }

  // ---- Year filter ------------------------------------------------------------
  // Shows only palaces standing at some point between the two years (their years overlap the range).
  const yf = document.getElementById('year-filter');
  if (yf) {
    const fromIn = document.getElementById('yf-from');
    const toIn = document.getElementById('yf-to');
    const fromOut = document.getElementById('yf-from-out');
    const toOut = document.getElementById('yf-to-out');
    const rangeEl = document.getElementById('yf-range');
    const status = document.getElementById('yf-status');
    const reset = document.getElementById('yf-reset');
    const countEl = document.getElementById('yf-count');
    const prepEl = document.getElementById('yf-prep');
    const andEl = document.getElementById('yf-and');
    const MIN = Number(fromIn.min), MAX = Number(fromIn.max);
    const counts = {};
    listEl.querySelectorAll('details').forEach((d) => {
      const kind = d.querySelector('ul[data-kind]').dataset.kind;
      counts[kind] = { el: d.querySelector('.pg-count'), total: all.filter((p) => p.kind === kind).length };
    });
    yf.hidden = false;

    const standing = (p, from, to) => p.start == null || (p.start <= to && endYear(p) >= from);

    const apply = (announce) => {
      let from = Number(fromIn.value), to = Number(toIn.value);
      fromOut.value = from; toOut.value = to;
      fromOut.textContent = from; toOut.textContent = to;
      const pct = (y) => ((y - MIN) / (MAX - MIN)) * 100;
      rangeEl.style.left = pct(from) + '%';
      rangeEl.style.width = (pct(to) - pct(from)) + '%';
      // Keep the "from" thumb reachable when both thumbs sit at the right-hand end.
      fromIn.style.zIndex = from > MAX - 10 ? 3 : '';
      reset.hidden = from === MIN && to === MAX;
      yf.classList.toggle('is-filtered', !reset.hidden);

      let shown = 0;
      const perKind = {};
      for (const p of all) {
        const ok = standing(p, from, to);
        if (ok) { shown++; perKind[p.kind] = (perKind[p.kind] || 0) + 1; }
        const li = listEl.querySelector('li[data-li="' + p.id + '"]');
        if (li) li.hidden = !ok;
        const m = markers[p.id];
        if (m && map) {
          if (ok && !map.hasLayer(m)) m.addTo(map);
          if (!ok && map.hasLayer(m)) m.removeFrom(map);
        }
      }
      // If the selected palace is filtered out, say so on its card rather than leaving it unexplained.
      const sel = all.find((x) => x.id === selectedId);
      let note = cardEl.querySelector('.card-note');
      if (sel && !standing(sel, from, to)) {
        if (!note) { note = el('p', { class: 'card-note' }); cardEl.append(note); }
        note.textContent = 'Not standing in the years chosen, so its pin is hidden.';
      } else if (note) note.remove();
      for (const [kind, c] of Object.entries(counts)) {
        const n = perKind[kind] || 0;
        c.el.textContent = n === c.total ? '(' + c.total + ')' : '(' + n + ' of ' + c.total + ')';
      }
      // One heading carries the result: "Showing 11 of 24 palaces standing between 1770 and 1800".
      const countText = shown === all.length ? 'Showing all ' + all.length + ' palaces' : 'Showing ' + shown + ' of ' + all.length + ' palaces';
      const single = from === to;
      countEl.textContent = countText;
      prepEl.textContent = single ? 'in' : 'between';
      andEl.hidden = single;
      if (announce) {
        status.textContent = countText + ' standing ' + (single ? 'in ' + from : 'between ' + from + ' and ' + to) + '.';
      }
      redeclutter();
    };

    // Dragging updates the map at once; the spoken summary waits until the thumb is let go.
    fromIn.addEventListener('input', () => {
      if (Number(fromIn.value) > Number(toIn.value)) toIn.value = fromIn.value;
      apply(false);
    });
    toIn.addEventListener('input', () => {
      if (Number(toIn.value) < Number(fromIn.value)) fromIn.value = toIn.value;
      apply(false);
    });
    fromIn.addEventListener('change', () => apply(true));
    toIn.addEventListener('change', () => apply(true));
    reset.addEventListener('click', () => { fromIn.value = MIN; toIn.value = MAX; apply(true); fromIn.focus(); });
    // A click or tap on the track moves the nearer handle to that year, so the filter works without dragging (WCAG 2.5.7).
    const slider = fromIn.parentElement;
    slider.addEventListener('click', (e) => {
      if (e.target === fromIn || e.target === toIn) return; // a handle was dragged or clicked
      const box = slider.getBoundingClientRect();
      const year = Math.round(MIN + Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)) * (MAX - MIN));
      const from = Number(fromIn.value), to = Number(toIn.value);
      const moveFrom = year < from || (year <= to && year - from < to - year);
      const input = moveFrom ? fromIn : toIn;
      input.value = year;
      apply(true);
      input.focus();
    });
    refilter = () => apply(false);
    apply(true);
  }

  select('whitehall', false);
})();
