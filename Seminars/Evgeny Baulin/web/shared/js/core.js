// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Core of the seminar pages: the namespace, safe storage, persisted state, events, the course registry,
// DOM helpers, number formatting, colors from CSS tokens, and the canvas engine.
(function () {
  'use strict';
  var SEM = (window.SEM = window.SEM || {});
  SEM.boot = SEM.boot || { params: {}, theme: 'light', lang: 'en' };
  SEM.data = SEM.data || {};
  SEM.content = SEM.content || {};

  /* ------------------------------------------------------------------ utilities */

  var util = (SEM.util = {});

  util.clamp = function (v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  };

  util.isNum = function (v) {
    return typeof v === 'number' && isFinite(v);
  };

  util.isNumArray = function (v) {
    if (!Array.isArray(v) || v.length === 0) return false;
    for (var i = 0; i < v.length; i++) if (!util.isNum(v[i])) return false;
    return true;
  };

  // Dotted path lookup; numeric segments index arrays from 1, as in the LaTeX values.
  util.get = function (root, path) {
    if (typeof path !== 'string' || !path) return undefined;
    var parts = path.split('.');
    var node = root;
    for (var i = 0; i < parts.length; i++) {
      if (node === null || node === undefined) return undefined;
      var part = parts[i];
      if (Array.isArray(node)) {
        if (!/^\d+$/.test(part)) return undefined;
        node = node[parseInt(part, 10) - 1];
      } else if (typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, part)) {
        node = node[part];
      } else {
        return undefined;
      }
    }
    return node;
  };

  util.data = function (path) {
    return util.get(SEM.data, path);
  };

  util.debounce = function (fn, ms) {
    var timer = null;
    return function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        fn();
      }, ms);
    };
  };

  util.reducedMotion = function () {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  };

  // Deterministic pseudo-random numbers (mulberry32), so every demo repeats exactly.
  util.rng = function (seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /* ------------------------------------------------------------------ storage */

  var memory = {};
  SEM.store = {
    get: function (key, area) {
      try {
        var s = area === 'session' ? window.sessionStorage : window.localStorage;
        var v = s.getItem(key);
        if (v !== null) return v;
      } catch (e) {
        /* storage blocked: fall back to memory */
      }
      return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
    },
    set: function (key, value, area) {
      memory[key] = String(value);
      try {
        var s = area === 'session' ? window.sessionStorage : window.localStorage;
        s.setItem(key, String(value));
      } catch (e) {
        /* the in-memory copy is enough */
      }
    },
    getJSON: function (key, fallback) {
      var raw = this.get(key);
      if (raw === null) return fallback;
      try {
        var v = JSON.parse(raw);
        return v === null || typeof v !== 'object' ? fallback : v;
      } catch (e) {
        return fallback;
      }
    },
    setJSON: function (key, value) {
      try {
        this.set(key, JSON.stringify(value));
      } catch (e) {
        /* ignore values that cannot be serialized */
      }
    }
  };

  /* ------------------------------------------------------------------ events */

  var listeners = {};
  SEM.on = function (name, fn) {
    (listeners[name] = listeners[name] || []).push(fn);
  };
  SEM.emit = function (name, payload) {
    var list = listeners[name] || [];
    for (var i = 0; i < list.length; i++) {
      try {
        list[i](payload);
      } catch (e) {
        if (window.console) console.error(e);
      }
    }
  };

  /* ------------------------------------------------------------------ persisted state */

  // One state object per page: om.s<NN>.state.<page> on a seminar page, om.<page>.state elsewhere.
  var page = document.documentElement.getAttribute('data-page') || 'main';
  var seminar = document.documentElement.getAttribute('data-seminar') || '';
  // the upcoming page in upcoming/theory/ and upcoming/cheatsheet/ stands in for that page of a seminar
  var standsFor = document.documentElement.getAttribute('data-for') || '';
  var STATE_KEY = seminar ? 'om.s' + seminar + '.state.' + page : 'om.' + page + '.state';
  var state = SEM.store.getJSON(STATE_KEY, {});
  if (typeof state !== 'object' || state === null) state = {};
  var saveNow = function () {
    SEM.store.setJSON(STATE_KEY, state);
  };
  var saveSoon = util.debounce(saveNow, 150);
  SEM.state = {
    page: page,
    seminar: seminar,
    get: function (key, fallback) {
      return Object.prototype.hasOwnProperty.call(state, key) ? state[key] : fallback;
    },
    set: function (key, value) {
      state[key] = value;
      saveSoon();
    },
    section: function (key) {
      if (!state[key] || typeof state[key] !== 'object' || Array.isArray(state[key])) state[key] = {};
      return state[key];
    },
    touch: function () {
      saveSoon();
    },
    flush: saveNow
  };
  window.addEventListener('pagehide', saveNow);

  SEM.param = function (name) {
    return Object.prototype.hasOwnProperty.call(SEM.boot.params, name) ? SEM.boot.params[name] : null;
  };

  /* ------------------------------------------------------------------ course registry */

  // Helpers over content.course (web/shared/js/content-common.js): the topics, the addresses of their pages,
  // their PDFs and the Atlas link. Every link between the pages is made here, in one of two forms:
  //   site      /seminars/ is the landing page, /seminars/1/ seminar 1, /seminars/1/theory/ and
  //             /seminars/1/cheatsheet/ its handout and cheat sheet: folders only, no file names;
  //   checkout  web/index.html, web/01/index.html, web/01/theory/index.html, web/01/cheatsheet/index.html:
  //             file:// has no directory index, so every link names the file.
  var course = (SEM.course = {});

  course.pad2 = function (n) {
    return (n < 10 ? '0' : '') + n;
  };

  course.topics = function () {
    var c = SEM.content.course;
    return c && Array.isArray(c.topics) ? c.topics : [];
  };

  // The topic of a seminar folder name ('02'); the current seminar when dir is omitted.
  course.topic = function (dir) {
    var d = dir === undefined ? seminar : dir;
    var list = course.topics();
    for (var i = 0; i < list.length; i++) if (list[i].dir === d) return list[i];
    return null;
  };

  // The topic with the number n (a number or a string of digits), or null.
  course.topicByNumber = function (n) {
    var k = parseInt(n, 10);
    var list = course.topics();
    for (var i = 0; i < list.length; i++) if (list[i].n === k) return list[i];
    return null;
  };

  // The topic the page belongs to: the seminar of a seminar page. The upcoming page stands in for any
  // seminar that is not out yet, so it reads the number from its folder (/seminars/3/, /seminars/3/theory/),
  // else from ?topic=3.
  course.current = function () {
    if (seminar) return course.topic(seminar);
    if (page !== 'upcoming') return null;
    var m = /\/(\d+)\/(?:(?:theory|cheatsheet)\/)?(?:index\.html?)?$/.exec(window.location.pathname);
    return course.topicByNumber(m ? m[1] : SEM.param('topic'));
  };

  // Opened from the repository (file:// or a server rooted at the repository), not from the site.
  course.inRepository = function () {
    var path = '';
    try {
      path = decodeURIComponent(window.location.pathname);
    } catch (e) {
      path = window.location.pathname;
    }
    return window.location.protocol === 'file:' || path.indexOf('/Seminars/Evgeny Baulin/web/') >= 0;
  };

  // How many folders below web/ the page is: the landing page 0, a seminar page and the upcoming page 1,
  // a handout, a cheat sheet and the upcoming page standing in for one of them 2.
  course.depth = function () {
    if (page === 'home') return 0;
    return page === 'theory' || page === 'cheatsheet' || standsFor ? 2 : 1;
  };

  function up(depth) {
    var prefix = '';
    for (var i = 0; i < depth; i++) prefix += '../';
    return prefix;
  }

  // The link from this page to a page of a topic: 'main' (the seminar), 'theory' or 'cheatsheet'.
  // On the site the folder is the number without the zero (1/), in the checkout the folder on disk (01/).
  course.pageHref = function (topic, which) {
    var sub = which === 'theory' || which === 'cheatsheet' ? which + '/' : '';
    if (course.inRepository()) return up(course.depth()) + topic.dir + '/' + sub + 'index.html';
    return up(course.depth()) + topic.n + '/' + sub;
  };

  // The link from this page to the landing page.
  course.homeHref = function () {
    var prefix = up(course.depth());
    if (course.inRepository()) return prefix + 'index.html';
    return prefix || './';
  };

  // A path given from the seminar folder ('theory/index.html', 'figures/fig_sets.svg') as a link from this
  // page; on the site a final index.html is dropped, so the link names the folder.
  course.localHref = function (path) {
    var p = String(path || '');
    if (!course.inRepository()) p = p.replace(/(^|\/)index\.html?(?=$|[?#])/, '$1');
    return (course.depth() === 2 ? '../' : '') + p || './';
  };

  // The folder of a topic in theory/: 'NN. <English title>'.
  course.theoryDir = function (topic) {
    return topic ? course.pad2(topic.n) + '. ' + topic.title.en : '';
  };

  // The link from this page to a PDF of a topic, theory/NN. <Topic title>/<base>_<lang>.pdf next to web/.
  course.pdfHref = function (topic, base, lang) {
    var file = encodeURIComponent(course.theoryDir(topic)) + '/' + base + '_' + lang + '.pdf';
    return up(course.depth() + 1) + 'theory/' + file;
  };

  // The link from this page to the Atlas. In the checkout the link carries the language, which the Atlas
  // reads from ?lang=.
  course.atlasHref = function () {
    var atlas = (SEM.content.course && SEM.content.course.atlas) || {};
    var prefix = up(course.depth());
    if (!course.inRepository()) return prefix + (atlas.site || '');
    var lang = SEM.i18n ? SEM.i18n.lang : SEM.boot.lang;
    return prefix + (atlas.repo || '') + '?lang=' + (lang === 'ru' ? 'ru' : 'en');
  };

  // On the site a page is shown at its folder: /seminars/1/index.html becomes /seminars/1/, the query
  // and the hash kept. Relative links still resolve, the folder being the same.
  if (!course.inRepository() && /\/index\.html?$/.test(window.location.pathname)) {
    try {
      var clean = window.location.pathname.replace(/\/index\.html?$/, '/');
      window.history.replaceState(window.history.state, '', clean + window.location.search + window.location.hash);
    } catch (e) {
      /* history refused: the address keeps its file name */
    }
  }

  /* ------------------------------------------------------------------ DOM */

  var dom = (SEM.dom = {});

  // el('button', {class: 'btn', type: 'button', onclick: fn, dataset: {...}}, [children])
  // Text is always inserted with textContent: user input never becomes HTML.
  dom.el = function (tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value === null || value === undefined || value === false) return;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key === 'dataset') {
          Object.keys(value).forEach(function (k) {
            node.dataset[k] = value[k];
          });
        } else if (key.slice(0, 2) === 'on' && typeof value === 'function') {
          node.addEventListener(key.slice(2), value);
        } else if (value === true) node.setAttribute(key, '');
        else node.setAttribute(key, String(value));
      });
    }
    if (children) dom.append(node, children);
    return node;
  };

  dom.append = function (node, children) {
    (Array.isArray(children) ? children : [children]).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  };

  dom.clear = function (node) {
    while (node.firstChild) node.removeChild(node.firstChild);
    return node;
  };

  dom.qs = function (sel, root) {
    return (root || document).querySelector(sel);
  };

  dom.qsa = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var uid = 0;
  dom.id = function (prefix) {
    uid += 1;
    return (prefix || 'sem') + '-' + uid;
  };

  // Any focused form control. It keeps the keys it works with itself: Space ticks a checkbox or
  // selects a radio, the arrows move a radio group or a slider.
  dom.isFormControl = function (target) {
    if (!target || !target.tagName) return false;
    var tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || !!target.isContentEditable;
  };

  dom.isTyping = function (target) {
    if (!target || !target.tagName) return false;
    var tag = target.tagName.toLowerCase();
    if (tag === 'textarea' || tag === 'select' || target.isContentEditable) return true;
    if (tag === 'input') {
      var type = (target.getAttribute('type') || 'text').toLowerCase();
      return ['checkbox', 'radio', 'range', 'button', 'submit'].indexOf(type) === -1;
    }
    return false;
  };

  /* ------------------------------------------------------------------ number formatting */

  var fmt = (SEM.fmt = {});

  fmt.decimal = function (v, digits) {
    if (!util.isNum(v)) return '';
    var d = digits === undefined ? 4 : digits;
    var s = v.toFixed(d);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0';
    return s;
  };

  // A number as text (inMath false) or as TeX (inMath true) in the given language.
  fmt.num = function (v, lang, inMath, digits) {
    var s = fmt.decimal(v, digits);
    if (s === '') return '';
    if (inMath) return lang === 'ru' ? s.replace('.', '{,}') : s;
    if (lang === 'ru') s = s.replace('.', ',');
    return s.charAt(0) === '-' ? '−' + s.slice(1) : s;
  };

  fmt.vector = function (arr, lang, inMath, digits) {
    var parts = arr.map(function (v) {
      return fmt.num(v, lang, inMath, digits);
    });
    if (inMath) return '(' + parts.join(lang === 'ru' ? ';\\ ' : ',\\ ') + ')';
    return '(' + parts.join(lang === 'ru' ? '; ' : ', ') + ')';
  };

  fmt.matrix = function (rows, lang) {
    return (
      '\\begin{pmatrix} ' +
      rows
        .map(function (row) {
          return row
            .map(function (v) {
              return fmt.num(v, lang, true);
            })
            .join(' & ');
        })
        .join(' \\\\ ') +
      ' \\end{pmatrix}'
    );
  };

  // A TeX string from the data in the given language: decimal commas and ';' separators in Russian.
  fmt.tex = function (s, lang) {
    if (lang !== 'ru') return s;
    return s.replace(/(\d)\.(\d)/g, '$1{,}$2').replace(/,\\ /g, ';\\ ');
  };

  fmt.clock = function (seconds) {
    var s = Math.max(0, Math.round(seconds));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  };

  /* ------------------------------------------------------------------ colors */

  var colorCache = null;
  SEM.colors = function () {
    if (colorCache) return colorCache;
    var cs = getComputedStyle(document.documentElement);
    var names = [
      'bg', 'panel', 'panel-2', 'fg', 'fg-soft', 'muted', 'line', 'line-strong', 'accent', 'accent-2',
      'ok', 'bad', 'w-grid', 'w-axis', 'w-set', 'w-set-line', 'w-contour', 'w-point', 'w-ball', 'w-box',
      'w-simplex', 'w-bad', 'w-good', 'w-cone', 'w-label', 'w-halo', 'w-psd'
    ];
    colorCache = {};
    names.forEach(function (n) {
      colorCache[n] = cs.getPropertyValue('--' + n).trim() || '#000';
    });
    return colorCache;
  };
  SEM.on('theme', function () {
    colorCache = null;
  });

  var probe = null;
  // Any CSS color as [r, g, b, a] with 0..255 components.
  SEM.rgba = function (color) {
    if (!probe) {
      var c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      probe = c.getContext('2d', { willReadFrequently: true });
    }
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = '#000';
    probe.fillStyle = color;
    probe.fillRect(0, 0, 1, 1);
    var d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3]];
  };

  /* ------------------------------------------------------------------ canvas engine */

  var plots = [];
  var resizeObserver = null;
  if (typeof window.ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) {
        var plot = entry.target.__semplot;
        if (plot) plot.requestDraw();
      });
    });
  } else {
    window.addEventListener('resize', function () {
      plots.forEach(function (p) {
        p.requestDraw();
      });
    });
  }

  // A HiDPI canvas with a world coordinate system, pointer input and redraws on
  // resize, theme and language changes.
  // opts: {domain: {x0,x1,y0,y1}, uniform: true, aspect: h/w, draw(ctx, plot),
  //        onPointer(type, world, event, plot), label: string or function,
  //        scroll: true for a plot without dragging, so a touch can scroll the page vertically}
  function Plot(container, opts) {
    this.opts = opts || {};
    this.domain = this.opts.domain || { x0: -1, x1: 1, y0: -1, y1: 1 };
    this.uniform = this.opts.uniform !== false;
    this.wrap = dom.el('div', { class: 'plot' });
    if (this.opts.aspect) this.wrap.style.aspectRatio = String(1 / this.opts.aspect);
    this.canvas = dom.el('canvas', { class: 'plot-canvas', role: 'img' });
    if (this.opts.scroll) this.canvas.style.touchAction = 'pan-y';
    this.wrap.appendChild(this.canvas);
    container.appendChild(this.wrap);
    this.ctx = this.canvas.getContext('2d');
    this.w = 0;
    this.h = 0;
    this.dpr = 1;
    this.scaleX = 1;
    this.scaleY = 1;
    this.fit = { x0: 0, x1: 1, y0: 0, y1: 1 };
    this.pending = false;
    this.dragging = false;
    this.wrap.__semplot = this;
    if (resizeObserver) resizeObserver.observe(this.wrap);
    plots.push(this);
    this._bindPointer();
    this.requestDraw();
  }
  SEM.Plot = Plot;

  Plot.prototype._layout = function () {
    var rect = this.wrap.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));
    var dpr = window.devicePixelRatio || 1;
    if (w !== this.w || h !== this.h || dpr !== this.dpr) {
      this.w = w;
      this.h = h;
      this.dpr = dpr;
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
    }
    var d = this.domain;
    var dx = d.x1 - d.x0 || 1;
    var dy = d.y1 - d.y0 || 1;
    if (this.uniform) {
      var s = Math.min(w / dx, h / dy);
      var cx = (d.x0 + d.x1) / 2;
      var cy = (d.y0 + d.y1) / 2;
      this.fit = { x0: cx - w / s / 2, x1: cx + w / s / 2, y0: cy - h / s / 2, y1: cy + h / s / 2 };
      this.scaleX = s;
      this.scaleY = s;
    } else {
      this.fit = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 };
      this.scaleX = w / dx;
      this.scaleY = h / dy;
    }
  };

  Plot.prototype.sx = function (x) {
    return (x - this.fit.x0) * this.scaleX;
  };
  Plot.prototype.sy = function (y) {
    return this.h - (y - this.fit.y0) * this.scaleY;
  };
  Plot.prototype.wx = function (px) {
    return this.fit.x0 + px / this.scaleX;
  };
  Plot.prototype.wy = function (py) {
    return this.fit.y0 + (this.h - py) / this.scaleY;
  };

  Plot.prototype.setDomain = function (d) {
    this.domain = d;
    this.requestDraw();
  };

  Plot.prototype.requestDraw = function () {
    var self = this;
    if (self.pending) return;
    self.pending = true;
    var run = function () {
      self.pending = false;
      self.draw();
    };
    if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(run);
    else setTimeout(run, 16);
  };

  Plot.prototype.draw = function () {
    this._layout();
    var ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    var C = SEM.colors();
    ctx.fillStyle = C.panel;
    ctx.fillRect(0, 0, this.w, this.h);
    if (typeof this.opts.draw === 'function') {
      try {
        this.opts.draw(ctx, this, C);
      } catch (e) {
        if (window.console) console.error(e);
      }
    }
    if (this.opts.label) {
      var label = typeof this.opts.label === 'function' ? this.opts.label() : this.opts.label;
      this.canvas.setAttribute('aria-label', label);
    }
  };

  Plot.prototype._bindPointer = function () {
    var self = this;
    var canvas = self.canvas;
    function world(ev) {
      var rect = canvas.getBoundingClientRect();
      return [self.wx(ev.clientX - rect.left), self.wy(ev.clientY - rect.top)];
    }
    canvas.addEventListener('pointerdown', function (ev) {
      if (!self.opts.onPointer) return;
      self.dragging = true;
      try {
        canvas.setPointerCapture(ev.pointerId);
      } catch (e) {
        /* capture is optional */
      }
      self.opts.onPointer('down', world(ev), ev, self);
      ev.preventDefault();
    });
    canvas.addEventListener('pointermove', function (ev) {
      if (!self.opts.onPointer) return;
      self.opts.onPointer(self.dragging ? 'drag' : 'hover', world(ev), ev, self);
    });
    var end = function (ev) {
      if (!self.dragging) return;
      self.dragging = false;
      if (self.opts.onPointer) self.opts.onPointer('up', world(ev), ev, self);
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  };

  SEM.redrawAll = function () {
    plots.forEach(function (p) {
      p.requestDraw();
    });
  };
  SEM.on('theme', SEM.redrawAll);
  SEM.on('lang', SEM.redrawAll);

  /* ------------------------------------------------------------------ drawing helpers */

  var draw = (SEM.draw = {});

  draw.line = function (ctx, x0, y0, x1, y1, color, width, dash) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1;
    if (dash) ctx.setLineDash(dash);
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  };

  draw.dot = function (ctx, x, y, r, fill, stroke, strokeWidth) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = strokeWidth || 2;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  };

  draw.arrow = function (ctx, x0, y0, x1, y1, color, width) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (!(len > 2)) return;
    var head = Math.min(12, len * 0.45);
    var ux = dx / len;
    var uy = dy / len;
    draw.line(ctx, x0, y0, x1 - ux * head * 0.6, y1 - uy * head * 0.6, color, width || 2.5);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - ux * head - uy * head * 0.45, y1 - uy * head + ux * head * 0.45);
    ctx.lineTo(x1 - ux * head + uy * head * 0.45, y1 - uy * head - ux * head * 0.45);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  draw.polyline = function (ctx, pts, color, width, dash) {
    if (!pts.length) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1.5;
    ctx.lineJoin = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.stroke();
    ctx.restore();
  };

  draw.polygon = function (ctx, pts, fill, stroke, width) {
    if (pts.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width || 1.5;
      ctx.stroke();
    }
  };

  // A label with a halo so that it stays readable over lines and fills.
  draw.label = function (ctx, text, x, y, color, opts) {
    var o = opts || {};
    var C = SEM.colors();
    ctx.save();
    ctx.font = (o.italic ? 'italic ' : '') + (o.size || 15) + 'px "PT Serif", Georgia, serif';
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.baseline || 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = C['w-halo'];
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // Light grid and axes over the visible world rectangle.
  draw.axes = function (ctx, plot, C, step) {
    var s = step || 1;
    var f = plot.fit;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = C['w-grid'];
    ctx.beginPath();
    for (var gx = Math.ceil(f.x0 / s) * s; gx <= f.x1; gx += s) {
      ctx.moveTo(Math.round(plot.sx(gx)) + 0.5, 0);
      ctx.lineTo(Math.round(plot.sx(gx)) + 0.5, plot.h);
    }
    for (var gy = Math.ceil(f.y0 / s) * s; gy <= f.y1; gy += s) {
      ctx.moveTo(0, Math.round(plot.sy(gy)) + 0.5);
      ctx.lineTo(plot.w, Math.round(plot.sy(gy)) + 0.5);
    }
    ctx.stroke();
    ctx.strokeStyle = C['w-axis'];
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (f.x0 < 0 && f.x1 > 0) {
      ctx.moveTo(Math.round(plot.sx(0)) + 0.5, 0);
      ctx.lineTo(Math.round(plot.sx(0)) + 0.5, plot.h);
    }
    if (f.y0 < 0 && f.y1 > 0) {
      ctx.moveTo(0, Math.round(plot.sy(0)) + 0.5);
      ctx.lineTo(plot.w, Math.round(plot.sy(0)) + 0.5);
    }
    ctx.stroke();
    ctx.restore();
  };

  // Fill the world region where inside(x, y) is true, at a reduced resolution.
  draw.region = function (ctx, plot, inside, color, cell) {
    var step = cell || 3;
    var cols = Math.ceil(plot.w / step);
    var rows = Math.ceil(plot.h / step);
    var off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    var octx = off.getContext('2d');
    var img = octx.createImageData(cols, rows);
    var rgba = SEM.rgba(color);
    var k = 0;
    for (var j = 0; j < rows; j++) {
      var wy = plot.wy((j + 0.5) * step);
      for (var i = 0; i < cols; i++) {
        var wx = plot.wx((i + 0.5) * step);
        var hit = false;
        try {
          hit = !!inside(wx, wy);
        } catch (e) {
          hit = false;
        }
        if (hit) {
          img.data[k] = rgba[0];
          img.data[k + 1] = rgba[1];
          img.data[k + 2] = rgba[2];
          img.data[k + 3] = rgba[3];
        }
        k += 4;
      }
    }
    octx.putImageData(img, 0, 0);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, cols * step, rows * step);
    ctx.restore();
  };

  // Level set g(x, y) = level by marching squares, drawn in screen space.
  draw.contour = function (ctx, plot, g, level, color, width, cell, dash) {
    var step = cell || 6;
    var cols = Math.ceil(plot.w / step) + 1;
    var rows = Math.ceil(plot.h / step) + 1;
    var vals = new Float64Array(cols * rows);
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var v = g(plot.wx(i * step), plot.wy(j * step));
        vals[j * cols + i] = isFinite(v) ? v - level : NaN;
      }
    }
    ctx.save();
    ctx.beginPath();
    function lerp(a, b) {
      var d = a - b;
      return d === 0 ? 0.5 : a / d;
    }
    for (var jj = 0; jj < rows - 1; jj++) {
      for (var ii = 0; ii < cols - 1; ii++) {
        var a = vals[jj * cols + ii];
        var b = vals[jj * cols + ii + 1];
        var c = vals[(jj + 1) * cols + ii + 1];
        var d = vals[(jj + 1) * cols + ii];
        if (!(a === a && b === b && c === c && d === d)) continue;
        var idx = (a > 0 ? 1 : 0) | (b > 0 ? 2 : 0) | (c > 0 ? 4 : 0) | (d > 0 ? 8 : 0);
        if (idx === 0 || idx === 15) continue;
        var x = ii * step;
        var y = jj * step;
        var top = [x + lerp(a, b) * step, y];
        var right = [x + step, y + lerp(b, c) * step];
        var bottom = [x + lerp(d, c) * step, y + step];
        var left = [x, y + lerp(a, d) * step];
        var segs;
        switch (idx) {
          case 1: case 14: segs = [[top, left]]; break;
          case 2: case 13: segs = [[top, right]]; break;
          case 3: case 12: segs = [[left, right]]; break;
          case 4: case 11: segs = [[right, bottom]]; break;
          case 6: case 9: segs = [[top, bottom]]; break;
          case 7: case 8: segs = [[left, bottom]]; break;
          case 5: segs = [[top, left], [right, bottom]]; break;
          default: segs = [[top, right], [left, bottom]]; break;
        }
        for (var s = 0; s < segs.length; s++) {
          ctx.moveTo(segs[s][0][0], segs[s][0][1]);
          ctx.lineTo(segs[s][1][0], segs[s][1][1]);
        }
      }
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1;
    if (dash) ctx.setLineDash(dash);
    ctx.stroke();
    ctx.restore();
  };

  /* ------------------------------------------------------------------ drag helper */

  // Pick the nearest draggable handle within a radius in pixels.
  SEM.pickHandle = function (plot, world, handles, radius) {
    var best = -1;
    var bestD = (radius || 18) * (radius || 18);
    for (var i = 0; i < handles.length; i++) {
      var h = handles[i];
      if (!h) continue;
      var dx = plot.sx(h[0]) - plot.sx(world[0]);
      var dy = plot.sy(h[1]) - plot.sy(world[1]);
      var d = dx * dx + dy * dy;
      if (d <= bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  };
})();
