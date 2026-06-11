/* ══════════════════════════════════════════════════════
   JO SANGBEOM — PORTFOLIO  |  Interactive Layer
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── THEME TOGGLE ───────────────────────────────────── */

  function initTheme() {
    var btn = document.getElementById('theme-toggle');
    var html = document.documentElement;
    var saved = localStorage.getItem('pf-theme') || 'light';
    html.setAttribute('data-theme', saved);
    if (window.PF_I18N) PF_I18N.updateThemeLabel();
    else btn.textContent = saved === 'dark' ? '[ LIGHT ]' : '[ DARK ]';
    updateThemeColor(saved);

    btn.addEventListener('click', function () {
      var cur = html.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('pf-theme', next);
      if (window.PF_I18N) PF_I18N.updateThemeLabel();
      else btn.textContent = next === 'dark' ? '[ LIGHT ]' : '[ DARK ]';
      updateThemeColor(next);
      document.dispatchEvent(new CustomEvent('theme-change'));
    });
  }

  function updateThemeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0d0d0d' : '#f4f3ef');
  }

  /* ── SCROLL PROGRESS & BACK TO TOP ─────────────────── */

  function initScrollUI() {
    var progress = document.getElementById('scroll-progress');
    var backTop = document.getElementById('back-top');
    var nav = document.getElementById('site-nav');

    function onScroll() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (progress) progress.style.width = pct + '%';
      if (nav) nav.classList.toggle('scrolled', scrollTop > 24);
      if (backTop) backTop.classList.toggle('visible', scrollTop > 600);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backTop) {
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ── MOBILE NAV ─────────────────────────────────────── */

  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    function closeMenu() {
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    }

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    menu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ── SCROLL SPY & SMOOTH ANCHOR ─────────────────────── */

  function initScrollSpy() {
    var navLinks = document.querySelectorAll('.nav-link[data-section]');
    var sections = [];

    navLinks.forEach(function (link) {
      var id = link.getAttribute('data-section');
      var el = document.getElementById(id);
      if (el) sections.push({ id: id, el: el, link: link });
    });

    sections.unshift({
      id: 'home',
      el: document.getElementById('home'),
      link: document.querySelector('.nav-brand')
    });

    function setActive(id) {
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('data-section') === id);
      });
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (s) {
      if (s.el) obs.observe(s.el);
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();

        var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 52;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });

        if (target.classList.contains('proj-item')) {
          setTimeout(function () {
            var hdr = target.querySelector('.proj-hdr');
            if (hdr && !target.classList.contains('open')) hdr.click();
          }, 450);
        }
      });
    });
  }

  /* ── KEYBOARD NAVIGATION ────────────────────────────── */

  function initKeyNav() {
    var map = {
      KeyH: 'home',
      KeyA: 'about',
      KeyW: 'work',
      KeyP: 'projects',
      KeyE: 'education',
      KeyS: 'skills',
      KeyC: 'contact',
    };

    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey) {
        var id = map[e.code];
        if (id) {
          e.preventDefault();
          var el = document.getElementById(id);
          if (el) {
            var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 52;
            var top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
          }
        }
        if (e.code === 'KeyI') {
          e.preventDefault();
          document.getElementById('theme-toggle').click();
        }
        if (e.code === 'ArrowUp') {
          e.preventDefault();
          window.scrollBy({ top: -window.innerHeight * 0.9, behavior: 'smooth' });
        }
        if (e.code === 'ArrowDown') {
          e.preventDefault();
          window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
        }
      }
    });
  }

  /* ── PROJECT ACCORDION ──────────────────────────────── */

  function initProjects() {
    var TRANSITION_MS = 450;

    // Approximates CSS 'ease' (cubic-bezier .25,.1,.25,1)
    function cssEase(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    document.querySelectorAll('.proj-hdr').forEach(function (hdr) {
      hdr.addEventListener('click', function () {
        var item = hdr.closest('.proj-item');
        var wasOpen = item.classList.contains('open');

        // Measure how much height will collapse ABOVE the clicked header.
        // We need this BEFORE mutating the DOM.
        var itemTop = item.getBoundingClientRect().top;
        var collapsingAbove = 0;

        document.querySelectorAll('.proj-item.open').forEach(function (p) {
          if (p.getBoundingClientRect().top < itemTop) {
            collapsingAbove += p.querySelector('.proj-body').getBoundingClientRect().height;
          }
          p.classList.remove('open');
        });

        if (!wasOpen) {
          item.classList.add('open');
        }

        // Scroll-compensate: as sections above shrink over TRANSITION_MS,
        // scroll up by the same amount so the clicked header stays put.
        if (collapsingAbove > 0) {
          var startY = window.scrollY;
          var t0 = null;
          (function frame(ts) {
            if (!t0) t0 = ts;
            var t = Math.min((ts - t0) / TRANSITION_MS, 1);
            window.scrollTo(0, startY - collapsingAbove * cssEase(t));
            if (t < 1) requestAnimationFrame(frame);
          })(performance.now());
        }
      });
    });
  }

  /* ── SCROLL REVEAL ──────────────────────────────────── */

  function initReveal() {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ── CUSTOM CURSOR ──────────────────────────────────── */

  function initCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var glow = document.getElementById('cursor-glow');
    var dot = document.getElementById('cursor-dot');
    if (!glow || !dot) return;

    document.body.classList.add('custom-cursor');
    var mx = 0, my = 0, gx = 0, gy = 0;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    }, { passive: true });

    (function loop() {
      gx += (mx - gx) * 0.12;
      gy += (my - gy) * 0.12;
      glow.style.left = gx + 'px';
      glow.style.top = gy + 'px';
      requestAnimationFrame(loop);
    })();

    var hoverables = 'a, button, .proj-hdr, .featured-card';
    document.querySelectorAll(hoverables).forEach(function (el) {
      el.addEventListener('mouseenter', function () { glow.classList.add('hovering'); });
      el.addEventListener('mouseleave', function () { glow.classList.remove('hovering'); });
    });
  }

  /* ── PAGE LOAD & HERO FX ────────────────────────────── */

  function initPageLoad() {
    requestAnimationFrame(function () {
      document.body.classList.add('is-ready');
    });
  }

  function initHeroGlow() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var glow = document.getElementById('hero-glow');
    var section = document.querySelector('.hero-section');
    if (!glow || !section) return;

    section.addEventListener('mousemove', function (e) {
      var rect = section.getBoundingClientRect();
      glow.style.left = (e.clientX - rect.left) + 'px';
      glow.style.top = (e.clientY - rect.top) + 'px';
    }, { passive: true });
  }

  function initCardTilt() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('.featured-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.classList.add('is-tilting');
        card.style.transform =
          'perspective(700px) rotateX(' + (-y * 5) + 'deg) rotateY(' + (x * 5) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  function initDividerReveal() {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.divider').forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ── INIT ───────────────────────────────────────────── */

  function init() {
    if (window.PF_I18N) PF_I18N.init();
    initTheme();
    initPageLoad();
    initHeroGlow();
    initScrollUI();
    initMobileNav();
    initScrollSpy();
    initKeyNav();
    initProjects();
    initReveal();
    initDividerReveal();
    initCursor();
    initCardTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
