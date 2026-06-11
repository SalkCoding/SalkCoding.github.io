/* ══════════════════════════════════════════════════════
   Portfolio i18n
   ══════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  var currentLang = 'ko';

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) {
      return o != null ? o[k] : undefined;
    }, obj);
  }

  function decodeEntities(str) {
    var el = document.createElement('textarea');
    el.innerHTML = str;
    return el.value;
  }

  function t(key) {
    var val = get(PF_TRANSLATIONS[currentLang], key);
    if (val != null) return val;
    return get(PF_TRANSLATIONS.ko, key) || key;
  }

  function updateMeta() {
    document.title = t('meta.title');
    setMeta('description', t('meta.description'));
    setMeta('og:title', t('meta.title'), 'property');
    setMeta('og:description', t('meta.description'), 'property');
    setMeta('twitter:title', t('meta.title'));
    setMeta('twitter:description', t('meta.description'));
  }

  function setMeta(name, content, attr) {
    attr = attr || 'name';
    var el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (el) el.setAttribute('content', content);
  }

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var val = t(el.getAttribute('data-i18n'));
      if (val != null) el.textContent = decodeEntities(val);
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var val = t(el.getAttribute('data-i18n-html'));
      if (val != null) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var val = t(el.getAttribute('data-i18n-aria'));
      if (val != null) el.setAttribute('aria-label', val);
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
      btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
    });

    updateThemeLabel();
    updateMeta();
    document.documentElement.lang = currentLang;
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
  }

  function updateThemeLabel() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var theme = document.documentElement.getAttribute('data-theme');
    btn.textContent = theme === 'dark' ? t('ui.theme.light') : t('ui.theme.dark');
  }

  function setLang(lang) {
    if (!PF_TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem('pf-lang', lang);
    apply();
  }

  function detectLang() {
    var saved = localStorage.getItem('pf-lang');
    if (saved && PF_TRANSLATIONS[saved]) return saved;
    var nav = (navigator.language || 'ko').toLowerCase();
    return nav.startsWith('ko') ? 'ko' : 'en';
  }

  function initLangToggle() {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
      });
    });
  }

  function init() {
    currentLang = detectLang();
    initLangToggle();
    apply();
  }

  global.PF_I18N = {
    init: init,
    setLang: setLang,
    t: t,
    getLang: function () { return currentLang; },
    updateThemeLabel: updateThemeLabel
  };
})(window);
