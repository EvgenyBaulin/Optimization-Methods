// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
/* ==========================================================================
   Optimization Atlas - i18n.js
   The language switch.  English and Russian are written side by side, at the
   place where each piece of text is defined, so a translation can never
   drift away from the sentence it translates:

     static markup    <span lang="en">Run</span><span lang="ru">Запуск</span>
                      styles.css hides whichever language is not current.
                      Attributes cannot hold two languages, so an element
                      carries the Russian one as data-ru-<attribute>:
                      <nav aria-label="Sections" data-ru-aria-label="Разделы">

     code, right now  Atlas.t('Run', 'Запуск')
                      a plain string in the current language.

     code, stored     Atlas.L('Run', 'Запуск')
                      a bilingual text for registries and stored messages.
                      It turns into the current language whenever it is used
                      as a string (concatenation, textContent, fillText,
                      join), so it follows the switch without being rebuilt.
                      Call Atlas.tr(x) before any string METHOD such as
                      indexOf or replace.

   A module that has already rendered text subscribes with
   Atlas.i18n.onChange(fn) and re-renders it, without resetting anything the
   user has set up or started.

   This file is loaded in <head>, before any markup, so the page never
   flashes the wrong language.  The address of the page always stays clean,
   so the choice is remembered in localStorage under atlas.lang, and with the
   same value under om.lang, the course-wide key that the seminar pages read
   first (nothing else is kept there).  The seminar pages write both keys as
   well, so on the site the language chosen last, on either side, is the one
   both open in.  Without a choice the atlas opens in English.  A link
   ending in /ru or /en (index.html#/B/ru) still sets the language, and so
   does ?lang=ru, which the seminar pages add when opened from the
   repository.
   ========================================================================== */
(function () {
  'use strict';

  var Atlas = window.Atlas || (window.Atlas = {});

  var LANGS = ['en', 'ru'];
  var DEFAULT = 'en';
  var STORE_KEY = 'atlas.lang';
  var COURSE_KEY = 'om.lang';   /* written, never read: the seminar pages' key */

  /* '#/B/ru' -> 'ru'.  A section hash without a suffix, or any other hash,
     gives null: the language is then left as it is. */
  function langFromHash(hash) {
    var m = /^#\/[A-F]\/(en|ru)$/.exec(hash || '');
    return m ? m[1] : null;
  }

  /* Storage can be blocked (private windows, strict settings): then the
     language simply is not remembered. */
  function recall() {
    try {
      var v = window.localStorage.getItem(STORE_KEY);
      return LANGS.indexOf(v) >= 0 ? v : null;
    } catch (e) { return null; }
  }
  function remember(lang) {
    try {
      window.localStorage.setItem(STORE_KEY, lang);
      window.localStorage.setItem(COURSE_KEY, lang);
    } catch (e) { /* not remembered */ }
  }

  /* '?lang=ru' -> 'ru': how the seminar pages hand their language over when
     opened from the repository, where the two pages may not share
     localStorage (file://).  ui.js removes the query together with the rest
     of the address. */
  function langFromQuery(search) {
    var m = /[?&]lang=(en|ru)(?:&|$)/.exec(search || '');
    return m ? m[1] : null;
  }

  /* A link names its language explicitly (a hash wins over the query); it is
     remembered, because the address is cleaned as soon as the page starts. */
  var fromLink = langFromHash(window.location.hash) || langFromQuery(window.location.search);
  if (fromLink) remember(fromLink);

  var i18n = {
    langs: LANGS,
    defaultLang: DEFAULT,
    lang: fromLink || recall() || DEFAULT,
    listeners: [],
    fromHash: langFromHash,

    set: function (lang) {
      if (LANGS.indexOf(lang) < 0) return;
      remember(lang);
      if (lang === i18n.lang) return;
      i18n.lang = lang;
      document.documentElement.lang = lang;
      swapAttributes();
      for (var i = 0; i < i18n.listeners.length; i++) {
        try { i18n.listeners[i](lang); } catch (e) { console.error('[atlas] language listener failed', e); }
      }
    },

    onChange: function (fn) { i18n.listeners.push(fn); }
  };
  Atlas.i18n = i18n;

  /* Set before the body is parsed, so the CSS shows the right language from
     the very first paint. */
  document.documentElement.lang = i18n.lang;

  /* ---------------------------------------------------- bilingual text -- */

  function Text(en, ru) { this.en = en; this.ru = ru; }
  Text.prototype.toString = function () {
    var v = (i18n.lang === 'ru') ? this.ru : this.en;
    return String(v === undefined || v === null ? this.en : v);
  };
  Text.prototype.toJSON = Text.prototype.toString;
  Atlas.Text = Text;

  /* A stored bilingual text.  Russian may be omitted while it is missing. */
  Atlas.L = function (en, ru) { return new Text(en, ru); };

  /* The current language, right now. */
  Atlas.t = function (en, ru) {
    return (i18n.lang === 'ru' && ru !== undefined && ru !== null) ? ru : en;
  };

  /* Resolves anything that may hold text: a string, an Atlas.L text, a
     function returning either (a hint whose wording depends on the state),
     or nothing at all. */
  Atlas.tr = function (v) {
    if (v === undefined || v === null) return '';
    if (typeof v === 'function') return Atlas.tr(v());
    return String(v);
  };

  /* Russian nouns take three forms after a number: 1 итерация, 2 итерации,
     5 итераций (and 11-14 always take the third).  Returns the form alone,
     so the caller also chooses the case:
       'после ' + k + ' ' + Atlas.ruPlural(k, 'итерации', 'итераций', 'итераций') */
  Atlas.ruPlural = function (n, one, few, many) {
    n = Math.abs(n);
    if (n !== Math.floor(n)) return few;
    var d = n % 10, h = n % 100;
    if (d === 1 && h !== 11) return one;
    if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return few;
    return many;
  };

  /* ------------------------------------------- translated attributes ----- */

  var ATTRS = ['aria-label', 'title', 'placeholder'];

  function swapAttributes() {
    if (!document.body) return;
    ATTRS.forEach(function (attr) {
      var nodes = document.querySelectorAll('[data-ru-' + attr + ']');
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i], keep = 'data-en-' + attr;
        /* the English original is remembered the first time it is replaced */
        if (!n.hasAttribute(keep)) n.setAttribute(keep, n.getAttribute(attr) || '');
        n.setAttribute(attr, i18n.lang === 'ru' ? n.getAttribute('data-ru-' + attr) : n.getAttribute(keep));
      }
    });
  }
  i18n.swapAttributes = swapAttributes;

  if (i18n.lang !== DEFAULT) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', swapAttributes);
    else swapAttributes();
  }

})();
