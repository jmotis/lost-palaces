// Sorting the palace cards on the home page (the cards themselves are rendered by Hugo).
(function () {
  const cards = document.getElementById('cards');
  const sortGroup = document.querySelector('[data-sort-group]');
  if (!cards || !sortGroup) return;
  sortGroup.hidden = false;
  const items = Array.from(cards.children);
  sortGroup.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-sort]');
    if (!b) return;
    sortGroup.querySelectorAll('button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    const by = b.dataset.sort;
    items.sort((x, y) => by === 'name'
      ? x.dataset.name.localeCompare(y.dataset.name)
      : Number(x.dataset.order) - Number(y.dataset.order));
    cards.append(...items);
  });
})();
