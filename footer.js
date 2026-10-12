/* Shared footer behavior, loaded by partials/footer.html on every page.
 * - Stamps the current year into #year.
 * - Footer newsletter: POSTs JSON to /api/subscribe (Resend Audience) and
 *   shows a toast. The inline [data-newsletter-status] node stays as an
 *   sr-only aria-live target so screen readers still hear the result.
 */
(function () {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var newsletterForm = document.querySelector('[data-newsletter-form]');
  if (!newsletterForm) return;

  var newsletterStatus = newsletterForm.querySelector('[data-newsletter-status]');
  var newsletterBtn = newsletterForm.querySelector('button[type="submit"]');
  var newsletterBtnDefault = newsletterBtn ? newsletterBtn.innerHTML : '';

  // Floating toast: created on first use, reused thereafter.
  var newsletterToast = null;
  var newsletterToastTimer = null;
  function showNewsletterToast(msg, isError) {
    if (!msg) return;
    if (!newsletterToast) {
      newsletterToast = document.createElement('div');
      newsletterToast.className = 'toast';
      newsletterToast.setAttribute('role', 'status');
      document.body.appendChild(newsletterToast);
    }
    newsletterToast.textContent = msg;
    newsletterToast.classList.toggle('toast--error', !!isError);
    // Force reflow so the transition fires on re-show
    void newsletterToast.offsetWidth;
    newsletterToast.classList.add('is-shown');
    if (newsletterToastTimer) clearTimeout(newsletterToastTimer);
    newsletterToastTimer = setTimeout(function () {
      if (newsletterToast) newsletterToast.classList.remove('is-shown');
    }, 4500);
  }
  function setNewsletterStatus(msg, isError) {
    if (newsletterStatus) {
      newsletterStatus.textContent = msg;
      newsletterStatus.classList.toggle('is-error', !!isError);
      newsletterStatus.classList.add('is-shown');
    }
    if (msg) showNewsletterToast(msg, isError);
  }

  newsletterForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (newsletterBtn) {
      newsletterBtn.disabled = true;
      newsletterBtn.textContent = '…';
    }
    setNewsletterStatus('', false);

    var endpoint = newsletterForm.getAttribute('action') || '/api/subscribe';
    var payload = {};
    new FormData(newsletterForm).forEach(function (v, k) { payload[k] = v; });

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('subscribe responded ' + res.status);
        setNewsletterStatus('You’re locked in. New dates drop soon, check your inbox.', false);
        newsletterForm.reset();
        if (newsletterBtn) newsletterBtn.innerHTML = newsletterBtnDefault;
        // GA4 conversion: a real subscriber added
        try { if (typeof gtag === 'function') gtag('event', 'newsletter_signup', { method: 'footer_form' }); } catch (e) {}
      })
      .catch(function () {
        setNewsletterStatus('Couldn’t subscribe. Try again or email info@banginandbeats.com.', true);
        if (newsletterBtn) newsletterBtn.innerHTML = newsletterBtnDefault;
      })
      .then(function () {
        if (newsletterBtn) newsletterBtn.disabled = false;
      });
  });
})();
