/* Shared inquiry pop-up, loaded by partials/footer.html on every page.
 *
 * Any element with [data-open-inquiry] opens the form (delegated, so event
 * cards rendered later work too). Optional attributes on the trigger:
 *   data-inquiry-topic    pre-selects the "Inquiry Type" option
 *   data-inquiry-context  pre-fills context (e.g. the event name)
 * Links to "#inquire" (on this page or another) also open it on arrival.
 * Other scripts can call window.BBInquiry.open({ topic, context }).
 *
 * Phones get a bottom sheet (styles.css); the Android back button closes it.
 * Submissions post JSON to /api/inquiry, which emails a branded lead
 * notification to the inbox and a confirmation to the sender (Formspree is
 * the server-side fallback).
 */
(function () {
  var modal = document.getElementById('inquiry-modal');
  if (!modal) return;

  var ENDPOINT = '/api/inquiry';
  var DRAFT_KEY = 'bb-inquiry-draft';
  var panel = modal.querySelector('.modal__panel');
  var form = modal.querySelector('[data-inquiry-form]');
  var done = modal.querySelector('[data-inquiry-done]');
  var status = modal.querySelector('[data-inquiry-status]');
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitDefault = submitBtn ? submitBtn.innerHTML : '';
  var select = form.querySelector('select[name="topic"]');
  var message = form.querySelector('textarea[name="message"]');
  var subjectField = form.querySelector('[data-inquiry-subject-field]');
  var contextField = form.querySelector('[data-inquiry-context-field]');
  var pageField = form.querySelector('[data-inquiry-page-field]');
  var dateField = form.querySelector('input[name="eventDate"]');
  var defaultPlaceholder = message ? message.getAttribute('placeholder') : '';
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  var lastFocus = null;
  var scrollY = 0;
  var pushedState = false;

  // ---- helpers ----
  function store(fn) { try { return fn(window.sessionStorage); } catch (e) { return null; } }
  function track(name, params) { try { if (typeof gtag === 'function') gtag('event', name, params || {}); } catch (e) {} }

  function toggleBookingFields() {
    var isBooking = select && (select.value || '').toLowerCase().indexOf('private booking') === 0;
    // Inline display, because .modal__row / .modal__field set display in CSS.
    form.querySelectorAll('[data-booking-only]').forEach(function (el) {
      el.hidden = false;
      el.style.display = isBooking ? '' : 'none';
    });
  }

  function applyContext(topic, context) {
    if (subjectField) subjectField.value = "[Bangin' & Beats] Inquiry";
    if (contextField) contextField.value = '';
    if (message) message.setAttribute('placeholder', defaultPlaceholder);
    if (topic && select) {
      var matched = false;
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].text.toLowerCase() === topic.toLowerCase()) { select.selectedIndex = i; matched = true; break; }
      }
      if (!matched) {
        var opt = document.createElement('option');
        opt.text = topic; opt.value = topic; opt.selected = true;
        select.appendChild(opt);
      }
      if (subjectField) subjectField.value = "[Bangin' & Beats] " + topic;
    }
    if (context) {
      if (contextField) contextField.value = context;
      if (message) message.setAttribute('placeholder', 'Re: ' + context + '. Tell us your date, headcount and the vibe.');
    }
    toggleBookingFields();
  }

  // Keep a draft so an accidental close doesn't lose what they typed.
  function saveDraft() {
    var data = {};
    new FormData(form).forEach(function (v, k) { if (k.charAt(0) !== '_' && k !== 'context' && k !== 'page') data[k] = v; });
    store(function (s) { s.setItem(DRAFT_KEY, JSON.stringify(data)); });
  }
  function restoreDraft() {
    var raw = store(function (s) { return s.getItem(DRAFT_KEY); });
    if (!raw) return;
    try {
      var data = JSON.parse(raw);
      Object.keys(data).forEach(function (k) {
        var el = form.elements[k];
        if (el && !el.value && k !== 'topic') el.value = data[k];
      });
    } catch (e) {}
  }

  // iOS-safe scroll lock: pin the body where it is, restore on close.
  function lockScroll() {
    scrollY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.add('modal-open');
    document.body.style.top = (-scrollY) + 'px';
  }
  function unlockScroll() {
    document.documentElement.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
  }

  function isOpen() { return !modal.hidden; }

  function open(opts) {
    opts = opts || {};
    if (isOpen()) { applyContext(opts.topic, opts.context); return; }
    lastFocus = document.activeElement;
    // Fresh form each open (unless a send just finished, which resets anyway).
    form.hidden = false;
    if (done) done.hidden = true;
    if (select) select.selectedIndex = 0;
    restoreDraft();
    applyContext(opts.topic, opts.context);
    if (pageField) pageField.value = location.pathname;
    if (dateField && !dateField.min) dateField.min = new Date().toISOString().slice(0, 10);
    if (status) { status.textContent = ''; status.classList.remove('is-shown', 'is-error'); }

    // Push a history entry first (while the page is still at its real scroll
    // position), so the phone's back button closes the form, not the page.
    if (window.history && history.pushState) {
      try {
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        history.pushState({ bbInquiry: true }, ''); pushedState = true;
      } catch (e) {}
    }
    modal.hidden = false;
    lockScroll();
    requestAnimationFrame(function () {
      modal.classList.add('is-open');
      // On phones, focusing an input throws the keyboard over the form, so
      // focus the panel; on desktop, jump straight to the first field.
      var first = coarse ? panel : form.querySelector('input:not([type=hidden]):not([tabindex="-1"]), select, textarea');
      if (first) first.focus({ preventScroll: true });
    });
    track('inquiry_open', { topic: opts.topic || 'general', page: location.pathname });
  }

  function close(fromPopState) {
    if (!isOpen() || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    unlockScroll();
    if (pushedState && !fromPopState) { try { history.back(); } catch (e) {} }
    pushedState = false;
    // history.back() can land after we restore; pin the scroll again then.
    var y = scrollY;
    setTimeout(function () { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); }, 60);
    setTimeout(function () {
      try { if ('scrollRestoration' in history) history.scrollRestoration = 'auto'; } catch (e) {}
      modal.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }, 240);
  }

  // ---- wiring ----
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-open-inquiry]');
    if (!trigger) return;
    e.preventDefault();
    open({ topic: trigger.getAttribute('data-inquiry-topic'), context: trigger.getAttribute('data-inquiry-context') });
  });
  modal.querySelectorAll('[data-modal-close]').forEach(function (el) { el.addEventListener('click', function () { close(false); }); });
  window.addEventListener('popstate', function () { if (isOpen()) close(true); });

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); close(false); return; }
    if (e.key !== 'Tab') return;
    // Focus trap.
    var f = Array.prototype.filter.call(
      panel.querySelectorAll('a[href], button:not([disabled]), input:not([type=hidden]):not([tabindex="-1"]), select, textarea'),
      function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  if (select) select.addEventListener('change', function () {
    toggleBookingFields();
    if (subjectField && select.value) subjectField.value = "[Bangin' & Beats] " + select.value;
  });
  form.addEventListener('input', function (e) {
    saveDraft();
    var field = e.target.closest('.modal__field');
    if (field && e.target.checkValidity()) { field.classList.remove('is-invalid'); e.target.removeAttribute('aria-invalid'); }
  });

  // Inline validation: flag every bad field, focus the first one.
  function validate() {
    var firstBad = null;
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (el.type === 'hidden' || el.name === '_gotcha') return;
      var field = el.closest('.modal__field');
      var hiddenRow = el.closest('[data-booking-only]');
      if (hiddenRow && hiddenRow.style.display === 'none') return;
      var ok = el.checkValidity();
      if (field) field.classList.toggle('is-invalid', !ok);
      if (ok) el.removeAttribute('aria-invalid'); else el.setAttribute('aria-invalid', 'true');
      if (!ok && !firstBad) firstBad = el;
    });
    if (firstBad) {
      firstBad.focus();
      if (status) {
        status.classList.add('is-shown', 'is-error');
        status.textContent = firstBad.type === 'email' && firstBad.value
          ? 'That email doesn’t look right.' : 'Fill in the highlighted fields.';
      }
    }
    return !firstBad;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
    if (status) { status.classList.remove('is-error'); status.classList.add('is-shown'); status.textContent = ''; }

    var payload = {};
    new FormData(form).forEach(function (v, k) { payload[k] = v; });
    var name = (payload.name || '').split(' ')[0];

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('inquiry responded ' + res.status);
        track('inquiry_submit', { topic: payload.topic || 'unspecified', page: location.pathname });
        form.reset();
        store(function (s) { s.removeItem(DRAFT_KEY); });
        if (done) {
          var who = done.querySelector('[data-inquiry-name]');
          if (who) who.textContent = name ? ', ' + name : '';
          form.hidden = true;
          done.hidden = false;
          var btn = done.querySelector('button');
          if (btn) btn.focus({ preventScroll: true });
          panel.scrollTop = 0;
        } else if (status) {
          status.textContent = 'Thanks, we got it. We’ll be back within one business day.';
        }
      })
      .catch(function () {
        if (status) {
          status.classList.add('is-error');
          status.textContent = 'That didn’t send. Try again, or text 201-344-4589.';
        }
      })
      .then(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = submitDefault; }
      });
  });

  // Deep link: /any-page#inquire opens the form on arrival.
  function fromHash() {
    if (location.hash !== '#inquire') return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    open({});
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();

  window.BBInquiry = { open: open, close: function () { close(false); } };
})();
