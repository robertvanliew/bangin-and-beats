/* Google Analytics (GA4), loaded lazily so it never blocks the first paint.
 *
 * Set GA_ID to the Bangin' & Beats GA4 Measurement ID ("G-XXXXXXX").
 * While it is empty, nothing loads; gtag() calls on the page just queue.
 * (The previous brand's GA IDs were removed on purpose.)
 */
(function () {
  var GA_ID = '';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  if (!GA_ID) return;

  gtag('js', new Date());
  gtag('config', GA_ID);

  function load() {
    if (load.done) return; load.done = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  // After the page has loaded and gone idle, or on the first interaction.
  window.addEventListener('load', function () {
    (window.requestIdleCallback || function (cb) { setTimeout(cb, 1500); })(load, { timeout: 4000 });
  });
  ['pointerdown', 'keydown', 'scroll'].forEach(function (ev) {
    window.addEventListener(ev, load, { once: true, passive: true });
  });
})();
