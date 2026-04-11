/* ============================================================
   GetSetCollab — Shared JavaScript
   Handles: navbar, smooth scroll, forms, mobile menu, UTM params
   ============================================================ */

/* ──────────────────────────────────────────────────────────────
   LAUNCH DATE — Edit ONLY this object; every date on the page
   updates automatically (countdown, badge, chip, title, meta).
   ────────────────────────────────────────────────────────────── */
var LAUNCH_DATE = {
  iso:      '2026-06-02T10:00:00+05:30',  /* ← change date here */
  display:  'June 10, 2026',               /* shown in badge */
  datetime: 'June 10, 2026 • 10:00 AM IST', /* countdown section row 3 */
  title:    'Launching June 10, 2026'      /* page <title> & meta */
};

(function () {
  'use strict';

  /* ── REPLACE THIS with your deployed Google Apps Script URL ── */
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyyECRUkuUmoAgQfsZlfo0ZS1PU4uXSFN9wV0s9GDnJHztc3VFvTUgrvX9wxYHZl8YE_A/exec';

  /* ── DOM Ready ── */
  document.addEventListener('DOMContentLoaded', function () {
    /* CSS display:flex / inline-flex overrides the HTML [hidden] attribute.
       This one rule restores correct behaviour for every element site-wide. */
    var s = document.createElement('style');
    s.textContent = '[hidden]{display:none!important}';
    document.head.appendChild(s);

    updateDateDisplays();
    initCountdown();
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initForms();
    initScrollAnimations();
    captureUTMParams();
    initMobileCTABar();
  });

  /* ==========================================================
     Date Displays — propagate LAUNCH_DATE.display everywhere
     ========================================================== */
  function updateDateDisplays() {
    /* Page <title> */
    document.title = document.title.replace(/[A-Z][a-z]+ \d+, \d{4}/, LAUNCH_DATE.display);

    /* <meta> tags that contain the old date string */
    document.querySelectorAll('meta[content]').forEach(function (m) {
      var c = m.getAttribute('content');
      if (c && /[A-Z][a-z]+ \d+, \d{4}/.test(c)) {
        m.setAttribute('content', c.replace(/[A-Z][a-z]+ \d+, \d{4}/, LAUNCH_DATE.display));
      }
    });

    /* .countdown-date-line — "June 10, 2026 • 10:00 AM IST" */
    var dateLine = document.querySelector('.countdown-date-line');
    if (dateLine) dateLine.textContent = LAUNCH_DATE.datetime;

    /* .launch-badge — "Launching June 10, 2026" (has a child dot <span>) */
    var badge = document.querySelector('.launch-badge');
    if (badge) {
      var dot = badge.querySelector('.waitlist-dot');
      badge.textContent = 'Launching ' + LAUNCH_DATE.display;
      if (dot) badge.insertBefore(dot, badge.firstChild);
    }
  }

  /* ==========================================================
     Countdown Timer — single source; reveals live badge at zero
     ========================================================== */
  function initCountdown() {
    var target  = new Date(LAUNCH_DATE.iso).getTime();
    var cdEl    = document.getElementById('countdown');
    var liveEl  = document.getElementById('live-badge');
    var eyebrow = document.getElementById('countdown-eyebrow');
    var cdDays  = document.getElementById('cd-days');
    var cdHours = document.getElementById('cd-hours');
    var cdMins  = document.getElementById('cd-mins');
    var cdSecs  = document.getElementById('cd-secs');

    if (!cdEl) return;

    /* Live badge stays hidden until the timer reaches zero */
    if (liveEl) liveEl.hidden = true;

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      var diff = target - Date.now();

      if (diff <= 0) {
        /* Zero out all digits before hiding so no stale number flashes */
        cdDays.textContent  = '00';
        cdHours.textContent = '00';
        cdMins.textContent  = '00';
        cdSecs.textContent  = '00';
        /* Timer done — hide countdown, reveal live badge */
        cdEl.hidden = true;
        if (eyebrow) eyebrow.hidden = true;
        if (liveEl)  { liveEl.hidden = false; liveEl.classList.add('is-live'); }
        clearInterval(timer);
        return;
      }

      cdDays.textContent  = pad(Math.floor(diff / 86400000));
      cdHours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
      cdMins.textContent  = pad(Math.floor((diff % 3600000)  / 60000));
      cdSecs.textContent  = pad(Math.floor((diff % 60000)    / 1000));
    }

    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ==========================================================
     Navbar — sticky shadow on scroll
     ========================================================== */
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    function onScroll() {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     Mobile Menu — hamburger toggle
     ============================================================ */
  function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ============================================================
     Smooth Scroll — all anchor links
     ============================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        var navbarHeight = 68;
        var targetY = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });
    });
  }

  /* ============================================================
     Mobile CTA Bar — hide when form is visible
     ============================================================ */
  function initMobileCTABar() {
    var bar = document.getElementById('mobile-cta-bar');
    if (!bar) return;

    var heroForm = document.getElementById('hero-form');
    var bottomForm = document.getElementById('bottom-form');

    if (!heroForm && !bottomForm) return;

    var observer = new IntersectionObserver(function (entries) {
      var anyVisible = entries.some(function (e) { return e.isIntersecting; });
      bar.style.opacity = anyVisible ? '0' : '1';
      bar.style.pointerEvents = anyVisible ? 'none' : 'auto';
    }, { threshold: 0.3 });

    if (heroForm) observer.observe(heroForm);
    if (bottomForm) observer.observe(bottomForm);
  }

  /* ============================================================
     Form Handling — validation + Google Sheets submission
     ============================================================ */
  function initForms() {
    var forms = document.querySelectorAll('[data-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleFormSubmit(form);
      });
    });
  }

  function handleFormSubmit(form) {
    if (!validateForm(form)) return;

    var btn = form.querySelector('[data-submit-btn]');
    var originalText = btn ? btn.textContent : '';
    var successMsg = form.querySelector('.form-success-msg');

    // Loading state
    if (btn) {
      btn.textContent = 'Submitting...';
      btn.disabled = true;
    }

    // Collect form data
    var data = collectFormData(form);

    // Attach UTM params
    var utms = getStoredUTMs();
    if (utms) { data = Object.assign(data, utms); }

    // Add timestamp
    data.timestamp = new Date().toISOString();

    // Fire GA4 event if present
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        event_category: 'engagement',
        event_label: data.role || 'unknown',
        page_location: window.location.href
      });
    }

    // Submit to Google Sheets via Apps Script
    submitToGoogleSheets(data, function (success) {
      if (success) {
        var redirect = form.getAttribute('data-redirect');
        if (redirect) {
          window.location.href = redirect + buildUTMQueryString(data);
        } else {
          var formFields = form.querySelector('[data-form-fields]');
          if (formFields) formFields.style.display = 'none';
          if (successMsg) successMsg.classList.add('visible');
        }
      } else {
        // Re-enable button on failure so user can retry
        if (btn) {
          btn.textContent = originalText;
          btn.disabled = false;
        }
        alert('Something went wrong. Please try again or email us at hello@getsetcollab.com');
      }
    });
  }

  function submitToGoogleSheets(data, callback) {
    // Build query string and use GET — more reliable than POST
    // with no-cors from static sites like GitHub Pages
    var params = new URLSearchParams();
    Object.keys(data).forEach(function (key) {
      params.append(key, data[key] || '');
    });

    var url = APPS_SCRIPT_URL + '?' + params.toString();

    fetch(url, {
      method: 'GET',
      mode: 'no-cors'
    })
    .then(function () {
      // no-cors means we cannot read the response body
      // if fetch did not throw, treat as success
      callback(true);
    })
    .catch(function (err) {
      console.error('Form submission error:', err);
      callback(false);
    });
  }

  /* ============================================================
     Validation
     ============================================================ */
  function validateForm(form) {
    var inputs = form.querySelectorAll('[data-required]');
    var valid = true;

    inputs.forEach(function (input) {
      var error = form.querySelector('[data-error-for="' + input.name + '"]');
      clearError(input, error);

      var value = input.value.trim();

      if (!value) {
        showError(input, error, 'This field is required.');
        valid = false;
        return;
      }

      if (input.type === 'email' && !isValidEmail(value)) {
        showError(input, error, 'Please enter a valid email address.');
        valid = false;
        return;
      }

      if (input.type === 'tel' && value && !isValidPhone(value)) {
        showError(input, error, 'Please enter a valid mobile number.');
        valid = false;
        return;
      }
    });

    return valid;
  }

  function showError(input, errorEl, message) {
    input.classList.add('error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearError(input, errorEl) {
    input.classList.remove('error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  document.addEventListener('input', function (e) {
    var input = e.target;

    /* Strip non-digits from phone fields in real time */
    if (input.classList.contains('phone-input')) {
      var pos = input.selectionStart;
      var cleaned = input.value.replace(/\D/g, '').slice(0, 10);
      if (input.value !== cleaned) {
        input.value = cleaned;
        try { input.setSelectionRange(pos - 1, pos - 1); } catch (err) {}
      }
    }

    if (input.classList.contains('error')) {
      var form = input.closest('[data-form]');
      if (!form) return;
      var error = form.querySelector('[data-error-for="' + input.name + '"]');
      clearError(input, error);
    }
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    var cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
  }

  function collectFormData(form) {
    var data = {};
    var inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(function (input) {
      if (input.name) {
        data[input.name] = input.value.trim();
      }
    });
    return data;
  }

  /* ============================================================
     UTM Parameter Capture & Passthrough
     ============================================================ */
  function captureUTMParams() {
    var params = new URLSearchParams(window.location.search);
    var utms = {};
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

    keys.forEach(function (key) {
      var val = params.get(key);
      if (val) utms[key] = val;
    });

    if (Object.keys(utms).length > 0) {
      try {
        sessionStorage.setItem('gsc_utms', JSON.stringify(utms));
      } catch (e) {}

      document.querySelectorAll('[name^="utm_"]').forEach(function (input) {
        var key = input.getAttribute('name');
        if (utms[key]) input.value = utms[key];
      });
    }
  }

  function getStoredUTMs() {
    try {
      var stored = sessionStorage.getItem('gsc_utms');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  function buildUTMQueryString(data) {
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    var parts = [];
    keys.forEach(function (key) {
      if (data[key]) parts.push(key + '=' + encodeURIComponent(data[key]));
    });
    return parts.length ? '?' + parts.join('&') : '';
  }

  /* ============================================================
     Scroll Animations — fade-in on enter
     ============================================================ */
  function initScrollAnimations() {
    var targets = document.querySelectorAll('[data-animate]');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute('data-delay') || 0;
          setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });

    injectAnimationCSS();
  }

  function injectAnimationCSS() {
    if (document.getElementById('gsc-anim-css')) return;
    var style = document.createElement('style');
    style.id = 'gsc-anim-css';
    style.textContent = [
      '[data-animate]{opacity:0;transform:translateY(20px);transition:opacity 0.5s cubic-bezier(0.16,1,0.3,1),transform 0.5s cubic-bezier(0.16,1,0.3,1);}',
      '[data-animate].is-visible{opacity:1;transform:translateY(0);}'
    ].join('');
    document.head.appendChild(style);
  }

})();
/* ── Niche accordion toggle (mobile) ── */
function toggleNiches() {
  const hiddenCards = document.querySelectorAll('.niche-card--hidden');
  const btn = document.getElementById('niche-toggle-btn');
  const isExpanded = btn.getAttribute('data-expanded') === 'true';

  hiddenCards.forEach(card => {
    card.classList.toggle('visible', !isExpanded);
  });

  btn.setAttribute('data-expanded', !isExpanded);
  btn.textContent = isExpanded ? 'See all 6 niches ▾' : 'Show less ▴';
}