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

  /* ------------------------------------------------------------------ the reading position */

  // Every text changes its length on a switch, so the page is held at what sits just below the sticky toolbar:
  // that element keeps its place on the screen. It is found by going down from the content through the boxes
  // that cross that line, to the deepest block-level one or to the first that starts below the line. A binder
  // may rebuild what it shows, so the whole path is kept, with the kind and the place of each box among its
  // siblings: after the switch the deepest box still in the page is used, or the one that took its place.
  var root = document.documentElement;
  var held = null;
  var settling = 0;

  function kind(node) {
    return node.tagName + '.' + (node.getAttribute('class') || '');
  }
  function placeOf(node) {
    var k = kind(node);
    var i = 0;
    for (var c = node.parentNode.firstElementChild; c !== node; c = c.nextElementSibling) {
      if (kind(c) === k) i += 1;
    }
    return i;
  }
  function nthOfKind(parent, k, i) {
    for (var c = parent.firstElementChild; c; c = c.nextElementSibling) {
      if (kind(c) === k && i-- === 0) return c;
    }
    return null;
  }

  // Inline text reflows inside its paragraph, sticky and fixed boxes do not move with the page, and absolute ones
  // (a hidden radio button) are out of the flow.
  function canAnchor(node) {
    var r = node.getBoundingClientRect();
    if (!r.width && !r.height) return false;
    var cs = window.getComputedStyle(node);
    return cs.display !== 'inline' && cs.position !== 'sticky' && cs.position !== 'fixed' && cs.position !== 'absolute';
  }

  // Whether text of parent itself, before child, reaches below the line: a paragraph whose words under the toolbar
  // run on into a formula is held as the paragraph.
  function textBefore(parent, child, line) {
    for (var n = parent.firstChild; n && n !== child; n = n.nextSibling) {
      if (n.nodeType !== 3 && !(n.nodeType === 1 && window.getComputedStyle(n).display === 'inline')) continue;
      var range = document.createRange();
      range.selectNode(n);
      var rects = range.getClientRects();
      for (var i = 0; i < rects.length; i++) {
        if (rects[i].height && rects[i].bottom > line) return true;
      }
    }
    return false;
  }

  // Each box is held by its edge nearer to the line: a paragraph that shows only its last line under the toolbar
  // keeps its bottom, and with it everything below. A formula is one piece: its inner boxes are rebuilt every time.
  function readingPath() {
    var line = (parseFloat(window.getComputedStyle(root).getPropertyValue('--toolbar-h')) || 0) + 1;
    var path = [];
    var node = document.getElementById('content') || document.body;
    while (node) {
      var next = null;
      for (var c = node.firstElementChild; c && !next; c = c.nextElementSibling) {
        if (c.getBoundingClientRect().bottom > line && canAnchor(c)) next = c;
      }
      if (!next) break;
      var r = next.getBoundingClientRect();
      if (r.top >= line && path.length && textBefore(node, next, line)) break;
      var edge = line - r.top <= r.bottom - line ? 'top' : 'bottom';
      path.push({ node: next, kind: kind(next), place: placeOf(next), edge: edge, at: r[edge] });
      node = r.top < line && !next.classList.contains('math-display') ? next : null;
    }
    return path;
  }

  // The deepest box of the path still in the page, or its stand-in, with the step it stands for.
  function resolve(path) {
    var found = null;
    var parent = null;
    for (var i = 0; i < path.length; i++) {
      var step = path[i];
      var node = root.contains(step.node) ? step.node : parent && nthOfKind(parent, step.kind, step.place);
      if (!node || !node.getClientRects().length) break;
      found = { node: node, step: step };
      parent = node;
    }
    return found;
  }

  function moved(anchor) {
    return anchor.node.getBoundingClientRect()[anchor.step.edge] - anchor.step.at;
  }

  // Scroll by as much as the anchor has moved. The path is kept with the position reached, so that switching
  // back and forth without scrolling in between reuses the same anchor and never drifts.
  function restore(scroller, path) {
    var anchor = resolve(path);
    var shift = anchor ? moved(anchor) : 0;
    if (Math.abs(shift) > 0.25) scroller.scrollTop += shift;
    held = { path: path, at: scroller.scrollTop };
  }
  function heldPath(scroller) {
    if (!held || held.at !== scroller.scrollTop) return null;
    var anchor = resolve(held.path);
    return anchor && Math.abs(moved(anchor)) < 1 ? held.path : null;
  }

  i18n.set = function (lang, persist) {
    if (lang !== 'en' && lang !== 'ru') return;
    var changed = lang !== i18n.lang;
    i18n.lang = lang;
    root.setAttribute('lang', lang);
    if (persist) {
      SEM.store.set('om.lang', lang);
      SEM.store.set('atlas.lang', lang);
    }
    if (!changed) return;
    var scroller = document.scrollingElement || root;
    // at the top the page stays at the top
    var path = scroller.scrollTop > 0 ? heldPath(scroller) || readingPath() : null;
    // the browser's own scroll anchoring would follow an anchor of its choosing: off until the text settles
    // (Chrome reads it from the body, not from the root)
    document.body.style.overflowAnchor = 'none';
    binders.forEach(function (fn) {
      try {
        fn(lang);
      } catch (e) {
        if (window.console) console.error(e);
      }
    });
    if (titlePair) document.title = SEM.t(titlePair);
    SEM.emit('lang', lang);
    if (path) restore(scroller, path);
    else held = null;
    // the faces of the other alphabet may still be loading; once they arrive the text moves again
    var mine = (settling += 1);
    var settle = function () {
      if (mine !== settling) return;
      if (path && held && held.path === path && held.at === scroller.scrollTop) restore(scroller, path);
      document.body.style.overflowAnchor = '';
    };
    if (document.fonts && document.fonts.status === 'loading' && document.fonts.ready) document.fonts.ready.then(settle);
    else window.requestAnimationFrame(settle);
  };

  i18n.toggle = function () {
    i18n.set(i18n.lang === 'en' ? 'ru' : 'en', true);
  };

  // An English page has not needed the Cyrillic faces of PT Serif yet (base.css); they are loaded once the page is
  // idle, so that the first switch does not wait for them. A Russian page has the Latin ones already.
  window.addEventListener('load', function () {
    window.setTimeout(function () {
      if (i18n.lang !== 'en' || !document.fonts || !document.fonts.load) return;
      ['400', 'italic 400', '700', 'italic 700'].forEach(function (face) {
        document.fonts.load(face + ' 1em "PT Serif"', '\u0416').catch(function () {});
      });
    }, 0);
  });
})();
