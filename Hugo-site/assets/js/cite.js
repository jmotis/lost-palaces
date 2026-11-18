// Fills in the suggested citation: the page's full web address, and the reader's own today as the access date.
(function () {
  const url = document.querySelector('.cite-url');
  if (url) url.textContent = location.origin + location.pathname;
  const t = document.querySelector('.cite-accessed');
  if (!t) return;
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  t.dateTime = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  t.textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
})();
