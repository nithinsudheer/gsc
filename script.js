/* ============================================================
   GetSetCollab — Shared JavaScript
   Handles: navbar, smooth scroll, forms, mobile menu, UTM params
   ============================================================ */

(function () {
  'use strict';

  /* ── DOM Ready ── */
  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initForms();
    initScrollAnimations();
    captureUTMParams();
    initMobileCTABar();
  });

  /* ============================================================
     Navbar — sticky shadow on scroll
     ============================================================ */
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
    onScroll(); // run once on load
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

    // Close menu when a link is clicked
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
     Form Handling — validation + submission
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
      btn.textContent = 'Submitting…';
      btn.disabled = true;
    }

    // Collect form data
    var data = collectFormData(form);

    // Attach UTM params if captured
    var utms = getStoredUTMs();
    if (utms) { data = Object.assign(data, utms); }

    // Fire analytics event if GA4 is present
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        event_category: 'engagement',
        event_label: data.role || 'unknown',
        page_location: window.location.href
      });
    }

    // Simulate submission (replace with real endpoint / redirect)
    setTimeout(function () {
      // Show success inline OR redirect to thank-you
      var redirect = form.getAttribute('data-redirect');

      if (redirect) {
        window.location.href = redirect + buildUTMQueryString(data);
      } else {
        // Inline success message
        var formFields = form.querySelector('[data-form-fields]');
        if (formFields) formFields.style.display = 'none';
        if (successMsg) successMsg.classList.add('visible');
      }
    }, 800);
  }

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

  // Clear error on input change
  document.addEventListener('input', function (e) {
    var input = e.target;
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
    // Indian mobile: 10 digits, optionally starting with +91
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

      // Attach to all hidden UTM inputs
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
      // Fallback: show all immediately
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

    // Inject animation CSS once
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
