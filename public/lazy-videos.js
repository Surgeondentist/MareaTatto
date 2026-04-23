/**
 * Reproduce videos bajo demanda (viewport) y respeta prefers-reduced-motion.
 * Actualiza el año en el pie si existe #footer-year o #js-year.
 */
(function () {
  var reduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var yearEl = document.getElementById('footer-year') || document.getElementById('js-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  if (reduced) {
    return;
  }

  document.querySelectorAll('video[data-managed="inline"]').forEach(function (v) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            v.play().catch(function () {});
          } else {
            v.pause();
          }
        });
      },
      { rootMargin: '80px', threshold: 0.15 }
    );
    io.observe(v);
  });
})();
