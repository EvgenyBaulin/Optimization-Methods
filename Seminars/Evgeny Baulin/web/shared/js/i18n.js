// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Language switch. Every visible string is bound to an updater that re-renders it in place,
// so a switch changes words only: steps, timer, widgets, answers and scroll position stay.
(function () {
  'use strict';
  var SEM = window.SEM;
  var binders = [];
  var missing = {};

  var i18n = (SEM.i18n = {
    lang: SEM.boot.lang === 'ru' ? 'ru' : 'en',
    missing: missing
  });

  // The string of a pair {en, ru} in the current (or given) language.
  SEM.t = function (pair, lang) {
    var l = lang || i18n.lang;
    if (pair === null || pair === undefined) return '';
    if (typeof pair === 'string') return pair;
    if (typeof pair[l] === 'string' && pair[l] !== '') return pair[l];
    missing['pair:' + JSON.stringify(pair).slice(0, 60)] = true;
    return '';
  };

  function pairAt(root, path) {
    var pair = root ? SEM.util.get(root, path) : undefined;
    return pair && typeof pair.en === 'string' && typeof pair.ru === 'string' ? pair : null;
  }

  // The UI pair at a dotted path: the seminar's own strings (content.seminar) first,
  // then the strings shared by the course (content.ui); null when neither has it.
  function lookup(path) {
    return pairAt(SEM.content.seminar, path) || pairAt(SEM.content.ui, path);
  }

  // Whether a UI string exists at path (nothing is recorded as missing).
  i18n.has = function (path) {
    return !!lookup(path);
  };

  // A UI pair by dotted path; a missing string is recorded and shows its path.
  SEM.ui = function (path) {
    var pair = lookup(path);
    if (!pair) {
      missing['ui:' + path] = true;
      return { en: path, ru: path };
    }
    return pair;
  };

  // A UI string in the current language.
  SEM.tu = function (path, lang) {
    return SEM.t(SEM.ui(path), lang);
  };

  // A UI string with {name} placeholders filled by already formatted values.
  SEM.tuf = function (path, values, lang) {
    var s = SEM.tu(path, lang);
    return s.replace(/\{(\w+)\}/g, function (m, key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : m;
    });
  };

  // Register an updater and run it once. Updaters run again after every switch.
  i18n.bind = function (fn) {
    binders.push(fn);
    try {
      fn(i18n.lang);
    } catch (e) {
      if (window.console) console.error(e);
    }
    return fn;
  };

  // Plain-text binding for elements and attributes.
  i18n.text = function (node, path) {
    return i18n.bind(function () {
      node.textContent = SEM.tu(path);
    });
  };
  i18n.attr = function (node, attr, path) {
    return i18n.bind(function () {
      node.setAttribute(attr, SEM.tu(path));
    });
  };

  var titlePair = null;
  i18n.setTitle = function (pair) {
    titlePair = pair;
    document.title = SEM.t(pair);
  };

  i18n.set = function (lang, persist) {
    if (lang !== 'en' && lang !== 'ru') return;
    var changed = lang !== i18n.lang;
    i18n.lang = lang;
    document.documentElement.setAttribute('lang', lang);
    if (persist) {
      SEM.store.set('om.lang', lang);
      SEM.store.set('atlas.lang', lang);
    }
    if (!changed) return;
    var scroller = document.scrollingElement || document.documentElement;
    var anchor = null;
    var anchorTop = 0;
    var blocks = SEM.dom.qsa('[data-anchor]');
    for (var i = 0; i < blocks.length; i++) {
      var r = blocks[i].getBoundingClientRect();
      if (r.bottom > 0) {
        anchor = blocks[i];
        anchorTop = r.top;
        break;
      }
    }
    binders.forEach(function (fn) {
      try {
        fn(lang);
      } catch (e) {
        if (window.console) console.error(e);
      }
    });
    if (titlePair) document.title = SEM.t(titlePair);
    if (anchor) scroller.scrollTop += anchor.getBoundingClientRect().top - anchorTop;
    SEM.emit('lang', lang);
  };

  i18n.toggle = function () {
    i18n.set(i18n.lang === 'en' ? 'ru' : 'en', true);
  };
})();
