(function () {
  const { palaces, span, pageFor, modelUrl } = window.LPP;
  const id = new URLSearchParams(location.search).get('id');
  const i = palaces.findIndex((p) => p.id === id);
  const $ = (s) => document.getElementById(s);

  if (i < 0) {
    document.title = 'Palace not found · Lost Palaces Project';
    $('crumb-here').textContent = 'Not found';
    $('p-title').textContent = 'Palace not found';
    $('p-lede').replaceChildren('There is no palace with that address. ',
      Object.assign(document.createElement('a'), { href: './#palaces', textContent: 'See all the palaces' }), '.');
    return;
  }

  const p = palaces[i];
  const full = p.title + ', ' + span(p);
  document.title = full + ' · Lost Palaces Project';
  $('crumb-here').textContent = p.name;
  $('p-title').textContent = p.title;
  $('p-sub').textContent = span(p) + ' · ' + p.place;

  // Previous / next, in date order.
  const pager = $('p-pager');
  const link = (q, cls, dir) => {
    const a = document.createElement('a');
    a.className = cls; a.href = pageFor(q);
    a.innerHTML = '<span class="dir"></span><span class="pname"></span>';
    a.querySelector('.dir').textContent = dir;
    a.querySelector('.pname').textContent = q.name;
    return a;
  };
  if (i > 0) pager.append(link(palaces[i - 1], 'prev', '← Previous'));
  if (i < palaces.length - 1) pager.append(link(palaces[i + 1], 'next', 'Next →'));

  const url = modelUrl(p);
  if (!url) {
    const box = document.createElement('div');
    box.className = 'model-missing';
    box.innerHTML = '<h2>The model is being added</h2><p>The ' + p.title.replace(/[<&]/g, '') +
      ' model is being moved into the project and will appear here soon.</p>';
    $('p-model').replaceWith(box);
    return;
  }

  const fullBtn = $('p-full');
  fullBtn.href = url;
  fullBtn.hidden = false;

  const fig = document.createElement('figure');
  fig.className = 'model-frame';
  const frame = document.createElement('iframe');
  frame.src = url;
  frame.title = '3D model of ' + full;
  frame.setAttribute('allow', 'fullscreen');
  const cap = document.createElement('figcaption');
  cap.textContent = 'The model’s own panel holds the year slider, views, layers and sources. On a small screen, open the model full screen for more room.';
  fig.append(frame, cap);
  $('p-model').replaceWith(fig);
  $('p-body').hidden = false;

  const cite = $('p-cite');
  const here = new URL(pageFor(p), location.href).href;
  cite.textContent = '“' + full + ': a 3D model.” Lost Palaces Project. ' + here;

  // Pull the introduction and bibliography from the model page itself, so they never drift apart.
  frame.addEventListener('load', () => {
    let doc;
    try { doc = frame.contentDocument; } catch (e) { return; }
    if (!doc) return;
    const lede = doc.querySelector('.lede');
    if (lede) $('p-lede').replaceChildren(...Array.from(lede.childNodes, (n) => document.importNode(n, true)));
    const bib = doc.querySelector('#bibliography ul');
    if (bib) {
      const items = Array.from(bib.children, (li) => {
        const c = document.importNode(li, true);
        c.querySelectorAll('a[target="_blank"]').forEach((a) => a.setAttribute('rel', 'noopener'));
        return c;
      });
      if (items.length) $('p-bib').replaceChildren(...items);
    }
  });
})();
