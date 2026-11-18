// Timeline page: a link to one of the collapsible timelines (#tl-models, #tl-unmodeled, #tl-extant)
// opens that timeline before scrolling to it, whether followed from the intro or from another page.
(function () {
  const openTarget = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id && document.getElementById(id);
    const details = target && (target.tagName === 'DETAILS' ? target : target.closest('details'));
    if (!details) return;
    details.open = true;
    target.scrollIntoView({ block: 'start' });
    const summary = details.querySelector('summary');
    if (summary) summary.focus({ preventScroll: true });
  };
  window.addEventListener('hashchange', openTarget);
  // A click on a link to the section already in the address bar fires no hashchange, so handle clicks too.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#tl-"]');
    if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); openTarget(); }
  });
  openTarget();
})();
