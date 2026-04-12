/* ============================================================
   GetSetCollab — Shared JavaScript
   Handles: navbar, smooth scroll, forms, mobile menu, UTM params,
            community counter, tier display
   ============================================================ */

/* ──────────────────────────────────────────────────────────────
   LAUNCH DATE — Edit ONLY this object; every date on the page
   updates automatically (countdown, badge, chip, title, meta).
   ────────────────────────────────────────────────────────────── */
var LAUNCH_DATE = {
  iso:      '2026-06-10T10:00:00+05:30',  /* ← change date here */
  display:  'June 10, 2026',               /* shown in badge */
  datetime: 'June 10, 2026 • 10:00 AM IST', /* countdown section row 3 */
  title:    'Launching June 10, 2026'      /* page <title> & meta */
};

/* ──────────────────────────────────────────────────────────────
   COMMUNITY CONFIG — Tier thresholds and seeded counter start.
   Edit tier ceilings here; counter and tier display update
   automatically everywhere on the page.
   ────────────────────────────────────────────────────────────── */
var COMMUNITY_CONFIG = {
  seed: 421,
  tiers: [
    {
      name:        'Founding Creator',
      min:         0,
      max:         1000,
      dotClass:    'community-tier-dot--green',
      earlyAccess: '15 days',
      feeWaiver:   '15 collabs',
      hiddenValue: 'founding',
      cards: {
        badge:  { title: 'Permanent Founding Creator Badge',   desc: 'On your profile and every proposal — forever. Not available after 1,000 creators join.' },
        fee:    { title: '0% Platform Fee · First 15 Collabs', desc: 'Brands pay the platform fee. You keep every rupee of your first 15 collaborations.' },
        search: { title: 'Brands Find You First · 12 Months',  desc: 'Top of brand search results in your niche for a full year from launch. More deals.' },
        access: { title: '15 Days Before Anyone Else',         desc: 'Build your profile and be discoverable 15 days before the public. Brands find you on Day 1.' }
      }
    },
    {
      name:        'Prime Creator',
      min:         1001,
      max:         2500,
      dotClass:    'community-tier-dot--yellow',
      earlyAccess: '7 days',
      feeWaiver:   '5 collabs',
      hiddenValue: 'prime',
      cards: {
        badge:  { title: 'Permanent Prime Creator Badge',      desc: 'On your profile and every proposal — forever. A permanent mark of being early.' },
        fee:    { title: '0% Platform Fee · First 5 Collabs',  desc: 'Brands pay the platform fee. You keep every rupee of your first 5 collaborations.' },
        search: { title: 'Brands Find You First · 6 Months',   desc: 'Top of brand search results in your niche for 6 months from launch. More visibility.' },
        access: { title: '7 Days Before Anyone Else',          desc: 'Build your profile and be discoverable 7 days before the public launch.' }
      }
    },
    {
      name:        'Early Access',
      min:         2501,
      max:         5000,
      dotClass:    'community-tier-dot--orange',
      earlyAccess: '3 days',
      feeWaiver:   '2 collabs',
      hiddenValue: 'early_access',
      cards: {
        badge:  { title: 'Early Access Badge',                 desc: 'A permanent badge on your profile marking you as an early community member.' },
        fee:    { title: '0% Platform Fee · First 2 Collabs',  desc: 'Brands pay the platform fee. You keep every rupee of your first 2 collaborations.' },
        search: { title: 'Standard Search Placement',          desc: 'Appear in brand search results from day one of launch.' },
        access: { title: '3 Days Before Anyone Else',          desc: 'Build your profile and be discoverable 3 days before the public launch.' }
      }
    }
  ],
  closedAt: 5000,
  closedCards: {
    badge:  { title: 'Join the Launch-Day List',        desc: 'The founding community is full. Join the launch-day notification list to be first when we go live.' },
    fee:    { title: 'Platform Launches June 10, 2026', desc: 'GetSetCollab goes live on June 10. Join the list and you\'ll be notified the moment we\'re live.' },
    search: { title: 'Full Access at Launch',           desc: 'Everyone on the launch-day list gets full platform access the moment we go live on June 10.' },
    access: { title: 'No Credit Card Required',         desc: 'Free to join. No subscription. No hidden fees. Sign up and we\'ll reach out before launch day.' }
  }
};

(function () {
  'use strict';

  /* ── API endpoint — Edge Function (no secrets in the browser) ── */
  var SUBMIT_URL = 'https://ecbdqopvatonjietfzuv.supabase.co/functions/v1/submit-signup';

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
    initCommunityCounter();
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

    /* .countdown-date-line */
    var dateLine = document.querySelector('.countdown-date-line');
    if (dateLine) dateLine.textContent = LAUNCH_DATE.datetime;

    /* .launch-badge */
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

    if (liveEl) liveEl.hidden = true;

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      var diff = target - Date.now();

      if (diff <= 0) {
        cdDays.textContent  = '00';
        cdHours.textContent = '00';
        cdMins.textContent  = '00';
        cdSecs.textContent  = '00';
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
     Community Counter — fetch live count, display tier & spots
     ========================================================== */
  function initCommunityCounter() {
    var counterNumEl       = document.getElementById('community-counter-num');
    var pillCountEl        = document.getElementById('pill-creator-count');
    var tierTextEl         = document.getElementById('community-tier-text');
    var tierDotEl          = document.getElementById('community-tier-dot');
    var spotsRemainingEl   = document.getElementById('community-spots-remaining');
    var hiddenTierEl       = document.getElementById('hidden-tier');
    var formSpotsFilledEl  = document.getElementById('form-spots-filled');
    var formSubtitleEl     = document.getElementById('form-spots-subtitle');

    /* Run if any counter-related element exists on the page */
    if (!counterNumEl && !pillCountEl && !formSubtitleEl) return;

    /* Clear stale cache to force fresh fetch from Supabase */
    try { sessionStorage.removeItem('gsc_counter_cache'); } catch (e) {}

    fetchLiveCount(function (count) {
      renderCounter(count);
    });

    function fetchLiveCount(callback) {
      /* Check sessionStorage for a recently cached count (valid for 60 seconds) */
      try {
        var cached = sessionStorage.getItem('gsc_counter_cache');
        if (cached) {
          var parsed = JSON.parse(cached);
          if (parsed && parsed.count && (Date.now() - parsed.ts) < 60000) {
            callback(parsed.count);
            /* Fetch fresh in background — re-render if count has changed */
            fetchFromServer(function (freshCount) {
              if (freshCount !== parsed.count) renderCounter(freshCount);
            });
            return;
          }
        }
      } catch (e) {}

      fetchFromServer(callback);
    }

    function fetchFromServer(callback) {
      var url = 'https://ecbdqopvatonjietfzuv.supabase.co/functions/v1/get-count';
      fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var count = data && data.count;
        if (count) {
          try {
            sessionStorage.setItem('gsc_counter_cache', JSON.stringify({ count: count, ts: Date.now() }));
          } catch (e) {}
          callback(count);
        } else {
          callback(COMMUNITY_CONFIG.seed);
        }
      })
      .catch(function () {
        callback(COMMUNITY_CONFIG.seed);
      });
    }

    function renderCounter(count) {
      /* Clamp count to minimum of seed */
      count = Math.max(count, COMMUNITY_CONFIG.seed);

      /* Cache the count */
      try {
        sessionStorage.setItem('gsc_counter_cache', JSON.stringify({ count: count, ts: Date.now() }));
      } catch (e) {}

      /* Animate counter number */
      if (counterNumEl) {
        animateCounterTo(counterNumEl, parseInt(counterNumEl.textContent) || COMMUNITY_CONFIG.seed, count);
      }

      /* Animate pill counter */
      if (pillCountEl) {
        animateCounterTo(pillCountEl, parseInt(pillCountEl.textContent) || COMMUNITY_CONFIG.seed, count);
      }

      /* Determine current tier */
      var currentTier = null;
      for (var i = 0; i < COMMUNITY_CONFIG.tiers.length; i++) {
        var t = COMMUNITY_CONFIG.tiers[i];
        if (count >= t.min && count <= t.max) {
          currentTier = t;
          break;
        }
      }

      /* Update tier display */
      if (count > COMMUNITY_CONFIG.closedAt) {
        /* Waitlist closed */
        if (tierDotEl) {
          tierDotEl.className = 'community-tier-dot community-tier-dot--red';
        }
        if (tierTextEl) {
          tierTextEl.innerHTML = '<strong>Founding community is full</strong> · Join the launch-day list';
        }
        if (formSubtitleEl) {
          formSubtitleEl.textContent = 'The founding community is now full — launch is June 10';
        }
        /* Update form button */
        var submitBtn = document.querySelector('[data-submit-btn]');
        if (submitBtn) {
          submitBtn.textContent = 'Join the Launch-Day List →';
        }
        /* Update form title */
        var formTitle = document.querySelector('.hero-form-title');
        if (formTitle) {
          formTitle.textContent = 'Join the Launch-Day List';
        }
        /* Update hidden tier */
        if (hiddenTierEl) hiddenTierEl.value = 'launch_list';

        /* Update feature cards */
        updateFeatureCards(COMMUNITY_CONFIG.closedCards);

      } else if (currentTier) {
        var spotsRemaining = currentTier.max - count;

        /* Update dot colour */
        if (tierDotEl) {
          tierDotEl.className = 'community-tier-dot ' + currentTier.dotClass;
        }

        /* Update tier text */
        if (tierTextEl) {
          tierTextEl.innerHTML = '<strong>' + currentTier.name + '</strong> spots open · <span id="community-spots-remaining">' + spotsRemaining.toLocaleString('en-IN') + '</span> remaining';
        }

        /* Update form subtitle — single span, JS writes full string */
        var formSpotStatusEl = document.getElementById('form-spot-status');
        if (formSpotStatusEl) {
          formSpotStatusEl.innerHTML = 'Only <strong class="spot-count">' + spotsRemaining.toLocaleString('en-IN') + '</strong> of ' + currentTier.max.toLocaleString('en-IN') + ' ' + currentTier.name + ' spots remaining';
        }

        /* Update hidden tier field */
        if (hiddenTierEl) hiddenTierEl.value = currentTier.hiddenValue;

        /* Update form title and button for non-Founding tiers */
        if (currentTier.hiddenValue !== 'founding') {
          var formTitle = document.querySelector('.hero-form-title');
          if (formTitle) {
            formTitle.textContent = 'Claim Your ' + currentTier.name + ' Spot';
          }
          var submitBtn = document.querySelector('[data-submit-btn]');
          if (submitBtn) {
            submitBtn.textContent = 'Claim My ' + currentTier.name + ' Spot →';
          }
        }

        /* Update feature cards */
        updateFeatureCards(currentTier.cards);

        /* Warning when fewer than 50 spots remain in current tier */
        if (spotsRemaining <= 50 && spotsRemaining > 0) {
          if (tierTextEl) {
            tierTextEl.innerHTML = '⚠️ Only <strong>' + spotsRemaining + ' ' + currentTier.name + ' spots</strong> left';
          }
        }
      }
    }

    function animateCounterTo(el, from, to) {
      if (from === to) { el.textContent = to.toLocaleString('en-IN'); return; }
      var duration = 800;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        /* Ease out cubic */
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(from + (to - from) * eased);
        el.textContent = current.toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }

  /* ==========================================================
     Update Feature Cards — swap titles and descriptions per tier
     ========================================================== */
  function updateFeatureCards(cards) {
    if (!cards) return;
    var keys = ['badge', 'fee', 'search', 'access'];
    keys.forEach(function (key) {
      if (!cards[key]) return;
      var titleEl = document.querySelector('[data-feature-title="' + key + '"]');
      var descEl  = document.querySelector('[data-feature-desc="' + key + '"]');
      if (titleEl) titleEl.textContent = cards[key].title;
      if (descEl)  descEl.textContent  = cards[key].desc;
    });
  }
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
    var hamburger  = document.getElementById('hamburger');
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

    var heroForm   = document.getElementById('hero-form');
    var bottomForm = document.getElementById('bottom-form');

    if (!heroForm && !bottomForm) return;

    var observer = new IntersectionObserver(function (entries) {
      var anyVisible = entries.some(function (e) { return e.isIntersecting; });
      bar.style.opacity      = anyVisible ? '0' : '1';
      bar.style.pointerEvents = anyVisible ? 'none' : 'auto';
    }, { threshold: 0.3 });

    if (heroForm)   observer.observe(heroForm);
    if (bottomForm) observer.observe(bottomForm);
  }

  /* ============================================================
     Form Handling — validation + Supabase submission
     ============================================================ */
  function initForms() {
    var forms = document.querySelectorAll('[data-form]');
    forms.forEach(function (form) {
      /* Record load time — used to reject submissions under 2 seconds */
      form.setAttribute('data-loaded-at', Date.now());

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleFormSubmit(form);
      });
    });
  }

  function handleFormSubmit(form) {
    if (!validateForm(form)) return;

    /* Honeypot check — bots fill the hidden website field */
    var honeypot = form.querySelector('#hp-website');
    if (honeypot && honeypot.value) return;

    /* Timestamp check — reject if submitted in under 2 seconds */
    var loadedAt = parseInt(form.getAttribute('data-loaded-at'));
    if (loadedAt && (Date.now() - loadedAt) < 2000) return;

    var btn          = form.querySelector('[data-submit-btn]');
    var originalText = btn ? btn.textContent : '';
    var successMsg   = form.querySelector('.form-success-msg');

    if (btn) {
      btn.textContent = 'Submitting...';
      btn.disabled    = true;
    }

    var data = collectFormData(form);

    var utms = getStoredUTMs();
    if (utms) { data = Object.assign(data, utms); }

    /* Pass load time and honeypot to the server for its own checks */
    data.loaded_at = form.getAttribute('data-loaded-at') || '0';
    data.timestamp = new Date().toISOString();

    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        event_category: 'engagement',
        event_label:    data.role || 'unknown',
        page_location:  window.location.href
      });
    }

    submitToEdgeFunction(data, function (success) {
      if (success) {
        /* Increment cached counter by 1 for this session */
        try {
          var cached = sessionStorage.getItem('gsc_counter_cache');
          if (cached) {
            var parsed = JSON.parse(cached);
            if (parsed && parsed.count) {
              parsed.count = parsed.count + 1;
              sessionStorage.setItem('gsc_counter_cache', JSON.stringify(parsed));
            }
          }
        } catch (e) {}

        var redirect = form.getAttribute('data-redirect');
        if (redirect) {
          window.location.href = redirect + buildUTMQueryString(data);
        } else {
          var formFields = form.querySelector('[data-form-fields]');
          if (formFields) formFields.style.display = 'none';
          if (successMsg) successMsg.classList.add('visible');
        }
      } else {
        if (btn) {
          btn.textContent = originalText;
          btn.disabled    = false;
        }
        alert('Something went wrong. Please try again or email us at hello@getsetcollab.com');
      }
    });
  }

  function submitToEdgeFunction(data, callback) {
    /* Send all collected fields — the server whitelists what it accepts */
    fetch(SUBMIT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    })
    .then(function (res) {
      return res.json().then(function (body) {
        if (res.ok && body.ok) {
          callback(true);
        } else {
          console.error('Submission error:', body.error || res.status);
          callback(false);
        }
      });
    })
    .catch(function (err) {
      console.error('Submission error:', err);
      callback(false);
    });
  }

  /* ============================================================
     Validation
     ============================================================ */
  function validateForm(form) {
    var inputs = form.querySelectorAll('[data-required]');
    var valid  = true;

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

    if (input.classList.contains('phone-input')) {
      var pos     = input.selectionStart;
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
    var data   = {};
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
    var utms   = {};
    var keys   = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

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
    var keys  = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
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
    var style   = document.createElement('style');
    style.id    = 'gsc-anim-css';
    style.textContent = [
      '[data-animate]{opacity:0;transform:translateY(20px);transition:opacity 0.5s cubic-bezier(0.16,1,0.3,1),transform 0.5s cubic-bezier(0.16,1,0.3,1);}',
      '[data-animate].is-visible{opacity:1;transform:translateY(0);}'
    ].join('');
    document.head.appendChild(style);
  }

})();

/* ── Niche accordion toggle (mobile) ── */
function toggleNiches() {
  var hiddenCards = document.querySelectorAll('.niche-card--hidden');
  var btn         = document.getElementById('niche-toggle-btn');
  var isExpanded  = btn.getAttribute('data-expanded') === 'true';

  hiddenCards.forEach(function (card) {
    card.classList.toggle('visible', !isExpanded);
  });

  btn.setAttribute('data-expanded', !isExpanded);
  btn.textContent = isExpanded ? 'See all 6 niches ▾' : 'Show less ▴';
}