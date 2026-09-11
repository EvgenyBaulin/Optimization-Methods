/* ==========================================================================
   Optimization Atlas - ui.js
   Shell (tabs, theme), shared control widgets, section A (landscape) and
   section B (continuous optimization playground).

   All state lives in this closure.  Nothing is persisted anywhere.
   ========================================================================== */
(function () {
  'use strict';

  var Atlas = window.Atlas;
  var num = Atlas.num;
  var draw = Atlas.draw;

  /* =======================================================================
     DOM helpers
     ===================================================================== */

  var $ = Atlas.dom.qs;
  var el = Atlas.dom.el;
  var clear = Atlas.dom.clear;
  var makeSlider = Atlas.makeSlider;

  /* =======================================================================
     Shared state: one parameter object per test function
     ===================================================================== */

  var paramStore = {};

  function paramsFor(fnDef) {
    if (!paramStore[fnDef.id]) {
      var o = {};
      (fnDef.params || []).forEach(function (s) { o[s.id] = s.def; });
      paramStore[fnDef.id] = o;
    }
    return paramStore[fnDef.id];
  }

  function buildFunctionSelect(select, selectedId) {
    clear(select);
    Atlas.functions.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      if (f.id === selectedId) opt.selected = true;
      select.appendChild(opt);
    });
  }

  /* After a language switch: new option texts, the selection untouched. */
  function relabelOptions(select, byId) {
    for (var i = 0; i < select.options.length; i++) {
      var def = byId(select.options[i].value);
      if (def) select.options[i].textContent = def.name;
    }
  }

  function relabelSliders(list) {
    Object.keys(list || {}).forEach(function (k) { if (list[k]) list[k].relabel(); });
  }

  /* Returns the slider handles, so a language switch can relabel them. */
  function buildParamControls(container, fnDef, onChange) {
    clear(container);
    var p = paramsFor(fnDef);
    var sliders = [];
    (fnDef.params || []).forEach(function (spec) {
      var s = makeSlider(spec, p[spec.id], function (v) {
        p[spec.id] = v;
        onChange(spec.id, v);
      });
      sliders.push(s);
      container.appendChild(s.root);
    });
    return sliders;
  }

  /* Run status codes stay English inside (they are compared and used as CSS
     classes); this is the word shown for one. */
  var STATUS_RU = {
    ready: 'готов', running: 'идёт', converged: 'сошёлся', diverged: 'разошёлся',
    stalled: 'застрял', budget: 'лимит', done: 'завершён', failed: 'сбой'
  };
  function statusWord(code) { return Atlas.t(code, STATUS_RU[code]); }

  /* ' — ' + detail, only when there is a detail to show. */
  function detail(x) { return Atlas.tr(x) ? ' — ' + x : ''; }

  function traitText(fnDef, params) {
    var t = fnDef.traits || {};
    var bits = [];
    bits.push(t.convex ? (t.strong ? Atlas.t('strongly convex', 'сильно выпуклая') : Atlas.t('convex', 'выпуклая'))
                       : Atlas.t('non-convex', 'невыпуклая'));
    bits.push(t.smooth ? Atlas.t('smooth', 'гладкая') : Atlas.t('nonsmooth', 'негладкая'));
    var L = fnDef.L ? fnDef.L(params) : null;
    var mu = fnDef.mu ? fnDef.mu(params) : null;
    if (L) bits.push('L = ' + num.fmt(L, 3));
    if (mu) bits.push('μ = ' + num.fmt(mu, 3));
    if (L && mu) bits.push('κ = ' + num.fmt(L / mu, 3));
    return bits.join(' · ');
  }

  /* =======================================================================
     Shell: tabs and theme
     ===================================================================== */

  var sections = {};
  var currentSection = null;

  /* The address stays clean, https://optimization-methods.tarakan-tuc.ru and
     never …/#/B, whatever the user does.  Opening a section records a history
     entry with the SAME address, so Back still steps through the sections,
     and sessionStorage brings the open section back after a reload.  An old
     link of the form #/C or #/C/ru still opens that section (and language);
     the address is cleaned right after. */
  var SECTION_KEY = 'atlas.section';

  function sectionFromHash() {
    var m = /^#\/([A-F])(?:\/(?:en|ru))?$/.exec(window.location.hash || '');
    return m ? 'sec-' + m[1] : null;
  }

  /* This page's bare address: no fragment, no query and, on a web server, no
     "index.html" either.  A file:// page keeps its file name, because the
     folder alone would not open it. */
  function cleanAddress() {
    var p = window.location.pathname;
    if (window.location.protocol !== 'file:') p = p.replace(/\/index\.html?$/, '/');
    return p;
  }

  /* how: 'push' (default: a click, a new history entry when the section
     changes), 'replace' (start-up or an old link: rewrite the current entry)
     or 'none' (Back / Forward has already moved). */
  function showSection(id, how) {
    var changed = (id !== currentSection);
    currentSection = id;
    Object.keys(sections).forEach(function (sid) {
      var s = document.getElementById(sid);
      if (s) s.hidden = (sid !== id);
    });
    var tabs = document.querySelectorAll('#tabs .tab');
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-target') === id;
      tabs[i].classList.toggle('is-on', on);
      if (on) tabs[i].setAttribute('aria-current', 'page');
      else tabs[i].removeAttribute('aria-current');
    }
    if (how !== 'none') {
      try {
        if (changed && how !== 'replace') window.history.pushState({ section: id }, '', cleanAddress());
        else window.history.replaceState({ section: id }, '', cleanAddress());
      } catch (e) { /* history refused (file:// in some browsers): the page works without it */ }
    }
    try { window.sessionStorage.setItem(SECTION_KEY, id); } catch (e) { /* storage blocked */ }
    if (sections[id] && sections[id].onShow) sections[id].onShow();
  }
  Atlas.showSection = showSection;

  function initShell() {
    var tabs = document.querySelectorAll('#tabs .tab');
    for (var i = 0; i < tabs.length; i++) {
      (function (tab) {
        tab.addEventListener('click', function () { showSection(tab.getAttribute('data-target')); });
      })(tabs[i]);
    }

    var toggle = $('#theme-toggle');
    function label() {
      toggle.textContent = Atlas.theme.name === 'dark' ? Atlas.t('Light', 'Светлая') : Atlas.t('Dark', 'Тёмная');
    }
    toggle.addEventListener('click', function () {
      Atlas.theme.set(Atlas.theme.name === 'dark' ? 'light' : 'dark');
      label();
    });

    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    Atlas.theme.set(prefersDark ? 'dark' : 'light');
    label();

    /* Language: the EN / RU switch, the window title, and every section
       re-labelled in place.  Nothing that is running is restarted. */
    var langBtns = document.querySelectorAll('#lang-switch .lang-btn');
    function syncLang() {
      for (var j = 0; j < langBtns.length; j++) {
        var on = langBtns[j].getAttribute('data-lang') === Atlas.i18n.lang;
        langBtns[j].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      document.title = Atlas.t('Optimization Atlas', 'Атлас оптимизации');
      label();
    }
    for (var j = 0; j < langBtns.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () { Atlas.i18n.set(btn.getAttribute('data-lang')); });
      })(langBtns[j]);
    }
    Atlas.i18n.onChange(function () {
      syncLang();
      relabelAll();
    });
    syncLang();

    Atlas.theme.onChange(function () {
      A.dirty = true;
      B.dirty = true; B.tableDirty = true;
      Cx.dirty = true; Cx.tableDirty = true;
      Dx.dirty = true; Dx.tableDirty = true;
      if (Atlas.discrete) Atlas.discrete.onShow();
    });

    /* Rebuilding a shaded landscape costs up to ~150 ms, so redraw once the
       window has stopped moving rather than on every resize event. */
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        A.dirty = true; B.dirty = true; Cx.dirty = true; Dx.dirty = true;
        if (Atlas.discrete) Atlas.discrete.onShow();
      }, 120);
    });
  }

  /* After a language switch every section re-renders the text it wrote
     itself.  Sections E and F subscribe to Atlas.i18n.onChange on their own.
     One section failing must not leave the others in the old language. */
  function relabelAll() {
    [A, B, Cx, Dx].forEach(function (s) {
      try { s.relabel(); } catch (e) { console.error('[atlas] relabel failed', e); }
    });
  }

  /* =======================================================================
     Section A - landscape
     ===================================================================== */

  var A = {
    fnId: 'quadratic',
    mode: 'contours',
    cursor: null,
    dirty: true,
    showGrad: true,
    showMarks: true,
    fv: null
  };

  A.init = function () {
    A.fv = new Atlas.FieldView($('#a-canvas'), { gridN: 200, levelCount: 18 });
    A.fv.overlay = A.overlay;

    var sel = $('#a-fn');
    buildFunctionSelect(sel, A.fnId);
    sel.addEventListener('change', function () { A.setFunction(sel.value); });

    var modeBox = $('#a-mode');
    modeBox.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('.seg-btn') : null;
      if (!btn) return;
      A.mode = btn.getAttribute('data-mode');
      var all = modeBox.querySelectorAll('.seg-btn');
      for (var i = 0; i < all.length; i++) all[i].classList.toggle('is-on', all[i] === btn);
      A.fv.setMode(A.mode);
      A.dirty = true;
    });

    $('#a-grad').addEventListener('change', function (e) { A.showGrad = e.target.checked; A.dirty = true; });
    $('#a-marks').addEventListener('change', function (e) { A.showMarks = e.target.checked; A.dirty = true; });

    var canvas = $('#a-canvas');
    canvas.addEventListener('pointermove', function (ev) {
      A.cursor = A.fv.view.pointer(ev);
      A.dirty = true;
    });
    canvas.addEventListener('pointerleave', function () { A.cursor = null; A.dirty = true; });

    A.setFunction(A.fnId);
  };

  A.setFunction = function (id) {
    A.fnId = id;
    var fnDef = Atlas.functionsById[id];
    A.fv.setFunction(fnDef, paramsFor(fnDef));
    A.paramSliders = buildParamControls($('#a-params'), fnDef, function () {
      A.fv.setFunction(fnDef, paramsFor(fnDef));
      A.dirty = true;
      A.updateTag();
    });
    $('#a-fnnote').textContent = fnDef.note || '';
    A.cursor = null;
    A.dirty = true;
    A.updateTag();
  };

  A.updateTag = function () {
    var fnDef = Atlas.functionsById[A.fnId];
    $('#a-tag').textContent = fnDef.name + ' — ' + traitText(fnDef, paramsFor(fnDef));
  };

  A.overlay = function (view, ctx) {
    var C = Atlas.theme.colors();
    var fnDef = Atlas.functionsById[A.fnId];
    var params = paramsFor(fnDef);

    if (A.showMarks) {
      var opt = fnDef.optima ? fnDef.optima(params) : [];
      opt.forEach(function (p) {
        var s = view.toScreen(p);
        draw.cross(ctx, s[0], s[1], 7, C.fg, 1.7);
        draw.label(ctx, Atlas.t('min', 'минимум'), s[0] + 10, s[1] + 4, { color: C.fg, box: C.panel, boxAlpha: 0.7 });
      });
      var sad = fnDef.saddles ? fnDef.saddles(params) : [];
      sad.forEach(function (p) {
        var s = view.toScreen(p);
        ctx.save();
        ctx.translate(s[0], s[1]);
        ctx.rotate(Math.PI / 4);
        draw.cross(ctx, 0, 0, 6, C.muted, 1.5);
        ctx.restore();
        draw.label(ctx, Atlas.t('saddle', 'седло'), s[0] + 9, s[1] - 6, { color: C.muted, box: C.panel, boxAlpha: 0.7 });
      });
      var mx = fnDef.maxima ? fnDef.maxima(params) : [];
      mx.forEach(function (p) {
        var s = view.toScreen(p);
        draw.ring(ctx, s[0], s[1], 5, C.muted, 1.4);
        draw.label(ctx, Atlas.t('local max', 'лок. максимум'), s[0] + 9, s[1] - 6, { color: C.muted, box: C.panel, boxAlpha: 0.7 });
      });
    }

    if (A.cursor && view.inside(A.cursor)) {
      var info = A.fv.sample(A.cursor);
      var s = view.toScreen(A.cursor);
      draw.dot(ctx, s[0], s[1], 3.2, C.accent);
      if (A.showGrad && info.gnorm > 0 && isFinite(info.gnorm)) {
        var len = num.clamp(28 * Math.log10(1 + info.gnorm) + 14, 14, 130);
        var ux = info.g[0] / info.gnorm, uy = info.g[1] / info.gnorm;
        draw.arrow(ctx, s[0], s[1], s[0] + ux * len, s[1] - uy * len, C.accent, 2, 9);
        draw.label(ctx, '∇f', s[0] + ux * len + 6, s[1] - uy * len, { color: C.accent, box: C.panel, boxAlpha: 0.75 });
      }
    }
  };

  A.updateReadout = function () {
    var set = function (id, v) { $(id).textContent = v; };
    if (!A.cursor) {
      set('#a-ro-pt', '—'); set('#a-ro-f', '—'); set('#a-ro-g', '—');
      set('#a-ro-gn', '—'); set('#a-ro-eig', '—'); set('#a-ro-k', '—');
      set('#a-ro-cls', Atlas.t('move the cursor over the plot', 'наведите курсор на график'));
      return;
    }
    var s = A.fv.sample(A.cursor);
    set('#a-ro-pt', num.fmtVec(A.cursor, 3));
    set('#a-ro-f', num.fmt(s.f, 4));
    set('#a-ro-g', num.fmtVec(s.g, 3));
    set('#a-ro-gn', num.fmt(s.gnorm, 4));
    set('#a-ro-eig', num.fmt(s.eig.lo, 3) + ', ' + num.fmt(s.eig.hi, 3));
    set('#a-ro-k', isFinite(s.kappa) ? num.fmt(s.kappa, 3) : Atlas.t('∞ (singular Hessian)', '∞ (гессиан вырожден)'));

    var lo = s.eig.lo, hi = s.eig.hi, tol = 1e-9 * Math.max(1, Math.abs(hi));
    var cls;
    if (lo > tol && hi > tol) {
      cls = Atlas.t('positive definite — a bowl, every direction curves up',
                    'гессиан положительно определён — чаша: в любом направлении поверхность изгибается вверх');
    } else if (lo < -tol && hi < -tol) {
      cls = Atlas.t('negative definite — a dome, every direction curves down',
                    'гессиан отрицательно определён — купол: в любом направлении поверхность изгибается вниз');
    } else if (lo < -tol && hi > tol) {
      cls = Atlas.t('indefinite — a saddle direction exists here',
                    'гессиан знаконеопределён — здесь есть седловое направление');
    } else {
      cls = Atlas.t('singular — the Hessian is flat along one direction',
                    'гессиан вырожден — вдоль одного из направлений кривизна нулевая');
    }
    set('#a-ro-cls', cls);
  };

  A.frame = function () {
    if (!A.dirty) return;
    A.fv.render();
    A.updateReadout();
    A.dirty = false;
  };

  A.onShow = function () { A.dirty = true; };

  /* Language switch: re-render every text this section wrote, keep its state. */
  A.relabel = function () {
    var fnDef = Atlas.functionsById[A.fnId];
    relabelOptions($('#a-fn'), function (id) { return Atlas.functionsById[id]; });
    relabelSliders(A.paramSliders);
    $('#a-fnnote').textContent = fnDef.note || '';
    A.updateTag();
    A.updateReadout();
    A.dirty = true;
  };

  /* =======================================================================
     Section B - continuous optimization
     ===================================================================== */

  var B = {
    fnId: 'quadratic',
    enabled: { gd: true, nesterov: true },
    focus: 'gd',
    hover: null,
    opts: {},
    budget: 200,
    speed: 40,
    running: false,
    acc: 0,
    runs: [],
    x0: null,
    dirty: true,
    tableDirty: true,
    sliders: {},
    overlays: {},
    fv: null,
    chart: null
  };

  /* Theoretical rate shapes that can be laid over the convergence chart.
     The κ-based two only appear when a condition number is available. */
  var OVERLAYS = [
    { id: '1/k',    label: 'O(1/k)',    dash: [5, 4] },
    { id: '1/k2',   label: 'O(1/k²)',   dash: [2, 3] },
    { id: 'linear', label: '(1−1/κ)ᵏ',  dash: [8, 3, 2, 3], needsKappa: true },
    { id: 'accel',  label: '(1−1/√κ)ᵏ', dash: [11, 4],      needsKappa: true }
  ];

  B.init = function () {
    B.fv = new Atlas.FieldView($('#b-canvas'), { gridN: 200, levelCount: 18 });
    B.fv.overlay = B.overlay;
    B.chart = new Atlas.Chart($('#b-chart'));

    /* default hyperparameter values from the registry */
    Object.keys(Atlas.hyper).forEach(function (k) { B.opts[k] = Atlas.hyper[k].def; });

    var sel = $('#b-fn');
    buildFunctionSelect(sel, B.fnId);
    sel.addEventListener('change', function () { B.setFunction(sel.value, true); });

    B.buildMethodList();
    B.buildHyperControls();
    B.buildPresets();

    $('#b-run').addEventListener('click', function () { B.setRunning(true); });
    $('#b-pause').addEventListener('click', function () { B.setRunning(false); });
    $('#b-step').addEventListener('click', function () {
      B.setRunning(false);
      B.stepAll(1);
    });
    $('#b-reset').addEventListener('click', function () { B.setRunning(false); B.rebuild(); });
    $('#b-theory').addEventListener('click', B.theoreticalStep);

    $('#b-canvas').addEventListener('pointerdown', function (ev) {
      var p = B.fv.view.pointer(ev);
      if (!B.fv.view.inside(p)) return;
      B.x0 = p;
      B.rebuild();
    });

    B.setFunction(B.fnId, true);
  };

  /* ------------------------------------------------------- method list -- */

  B.buildMethodList = function () {
    var box = $('#b-methods');
    clear(box);
    Atlas.methodsIn('continuous').forEach(function (m) {
      var row = el('div', 'mrow');
      row.setAttribute('data-id', m.id);
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!B.enabled[m.id];
      cb.setAttribute('aria-label', m.name);
      var sw = el('span', 'swatch');
      sw.style.background = m.color;
      var name = el('span', 'mname', m.name);
      var tag = tagChip(m);
      row.appendChild(cb);
      row.appendChild(sw);
      row.appendChild(name);
      row.appendChild(tag);

      row.addEventListener('click', function (ev) {
        if (ev.target !== cb) cb.checked = !cb.checked;
        B.enabled[m.id] = cb.checked;
        B.focus = m.id;
        B.refreshMethodRows();
        B.showCard(m.id);
        B.rebuild();
      });
      row.addEventListener('mouseenter', function () { B.showCard(m.id); });
      row.addEventListener('mouseleave', function () { B.showCard(B.focus); });

      box.appendChild(row);
    });
    B.refreshMethodRows();
    B.showCard(B.focus);
  };

  B.refreshMethodRows = function () {
    var rows = document.querySelectorAll('#b-methods .mrow');
    var n = 0;
    for (var i = 0; i < rows.length; i++) {
      var id = rows[i].getAttribute('data-id');
      rows[i].classList.toggle('is-focus', id === B.focus);
      var cb = rows[i].querySelector('input');
      cb.checked = !!B.enabled[id];
      if (cb.checked) n++;
    }
    $('#b-count').textContent = Atlas.t(n + ' enabled', 'включено: ' + n);
  };

  /* The short tag at the end of a method row.  A Russian tag such as «1-й»
     would break at its hyphen when a long name squeezes the row, so it is
     kept on one line; the English rows are left exactly as they were. */
  function tagChip(m) {
    var tag = el('span', 'morder', m.tag || '');
    return tag;
  }

  function methodKind(m) {
    if (m.category === 'stochastic') return Atlas.t('stochastic', 'стохастический');
    if (m.category === 'constrained') {
      return m.needsSet ? Atlas.t('constrained', 'с ограничениями')
                        : Atlas.t('nonsmooth / composite', 'негладкий / композитный');
    }
    return m.order === 1 ? Atlas.t('first order', 'первого порядка')
         : (m.order === 2 ? Atlas.t('second order', 'второго порядка') : Atlas.t('quasi-Newton', 'квазиньютоновский'));
  }

  B.showCard = function (id) { renderCardInto($('#b-card'), id); };

  function renderCardInto(card, id) {
    var m = Atlas.methodsById[id];
    clear(card);
    if (!m || !m.card) return;
    var c = m.card;

    var h = el('h4');
    h.appendChild(document.createTextNode(m.name));
    h.appendChild(el('span', 'mini', '  ' + methodKind(m)));
    card.appendChild(h);

    var f = el('div', 'formula');
    f.innerHTML = c.formula;
    card.appendChild(f);

    card.appendChild(el('p', null, c.intuition));

    var dl = el('dl', 'kv');
    function kv(k, v) {
      var dt = el('dt', null, k);
      var dd = el('dd');
      dd.innerHTML = v;
      dl.appendChild(dt); dl.appendChild(dd);
    }
    kv(Atlas.t('cost / iter', 'стоимость итерации'), c.cost);
    kv(Atlas.t('memory', 'память'), c.memory);
    kv(Atlas.t('rate, convex', 'скорость: выпуклый случай'), c.rateConvex);
    kv(Atlas.t('rate, strongly cvx', 'скорость: сильно выпуклый случай'), c.rateStrong);
    kv(Atlas.t('hyperparams', 'гиперпарам.'), c.hyper);
    card.appendChild(dl);

    var verdict = el('div', 'verdict');
    verdict.appendChild(el('div', 'use', c.useWhen));
    verdict.appendChild(el('div', 'avoid', c.avoidWhen));
    card.appendChild(verdict);
  }

  /* ------------------------------------------------ hyperparameter panel -- */

  B.buildHyperControls = function () {
    var box = $('#b-hyper');
    clear(box);
    B.sliders = {};

    /* Only render a hyperparameter that at least one registered method reads. */
    var used = {};
    Atlas.methodsIn('continuous').forEach(function (m) {
      (m.uses || []).forEach(function (u) {
        if (!used[u]) used[u] = [];
        used[u].push(m.name);
      });
    });

    Object.keys(Atlas.hyper).forEach(function (key) {
      if (!used[key]) return;
      var spec = Atlas.hyper[key];
      var s = makeSlider(spec, B.opts[key], function (v) {
        B.opts[key] = v;
        B.rebuild();
        if (key === 'alpha') B.updateAlphaHint();
      });
      s.setHint(usedByHint(spec, used[key]));
      B.sliders[key] = s;
      box.appendChild(s.root);
    });

    B.sliders.budget = makeSlider(
      { id: 'budget', label: Atlas.L('Iteration budget', 'Лимит итераций'), min: 10, max: 2000, log: true, integer: true,
        hint: Atlas.L('The run stops here even if it has not converged.',
                      'Здесь запуск останавливается, даже если метод не сошёлся.') },
      B.budget,
      function (v) { B.budget = Math.round(v); B.rebuild(); });
    box.appendChild(B.sliders.budget.root);

    B.sliders.speed = makeSlider(
      { id: 'speed', label: Atlas.L('Animation speed', 'Скорость анимации'), min: 1, max: 500, log: true, integer: true,
        unit: Atlas.L('it/s', 'ит/с'),
        hint: Atlas.L('Iterations per second while running.', 'Число итераций в секунду во время запуска.') },
      B.speed,
      function (v) { B.speed = v; });
    box.appendChild(B.sliders.speed.root);
  };

  /* The registry hint plus the methods that read the parameter.  A function,
     so the slider re-reads it in the new language after a switch. */
  function usedByHint(spec, names) {
    return function () {
      return Atlas.tr(spec.hint) + Atlas.t(' Used by: ', ' Используется в методах: ') + names.join(', ') + '.';
    };
  }

  /* What the chart can say about theory on the current landscape. */
  B.rateContext = function () {
    var fnDef = Atlas.functionsById[B.fnId];
    var params = paramsFor(fnDef);
    var fstar = fnDef.fstar ? fnDef.fstar(params) : null;
    var ctx = { fstar: fstar, known: fstar !== null && fstar !== undefined,
                kappa: null, kappaNote: '' };
    if (!ctx.known) return ctx;
    var L = fnDef.L ? fnDef.L(params) : null;
    var mu = fnDef.mu ? fnDef.mu(params) : null;
    if (L && mu) {
      ctx.kappa = L / mu;
      ctx.kappaNote = 'κ = ' + num.fmt(ctx.kappa, 4) + Atlas.t(' (exact)', ' (точно)');
    } else if (B.x0) {
      /* no global constants: fall back to the curvature at the start point */
      var e = num.eigSym2(fnDef.hess(B.x0, params));
      var amin = Math.min(Math.abs(e.lo), Math.abs(e.hi));
      var amax = Math.max(Math.abs(e.lo), Math.abs(e.hi));
      if (amin > 1e-12) {
        ctx.kappa = amax / amin;
        ctx.kappaNote = 'κ ≈ ' + num.fmt(ctx.kappa, 4) +
                        Atlas.t(' (local, from ∇²f at the start point)', ' (локально, по ∇²f в начальной точке)');
      }
    }
    return ctx;
  };

  B.buildOverlays = function () {
    var box = $('#b-overlays');
    clear(box);
    var ctx = B.rateContext();
    if (!ctx.known) {
      box.appendChild(el('span', 'note-inline', Atlas.t('rate overlays need a finite f*',
                                                        'для кривых скорости нужно конечное f*')));
      return;
    }
    OVERLAYS.forEach(function (ov) {
      if (ov.needsKappa && ctx.kappa === null) return;
      var lab = el('label', 'check');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!B.overlays[ov.id];
      cb.addEventListener('change', function () {
        B.overlays[ov.id] = cb.checked;
        B.dirty = true;
      });
      lab.appendChild(cb);
      lab.appendChild(el('span', 'dash'));
      lab.appendChild(document.createTextNode(ov.label));
      box.appendChild(lab);
    });
  };

  B.updateAlphaHint = function () {
    if (!B.sliders.alpha) return;
    var fnDef = Atlas.functionsById[B.fnId];
    var params = paramsFor(fnDef);
    var L = fnDef.L ? fnDef.L(params) : null;
    var txt;
    if (L) {
      txt = Atlas.L('Safe range α < 2/L = ' + num.fmt(2 / L, 4) + '. Here 1/L = ' + num.fmt(1 / L, 4) + '.',
                    'Безопасный диапазон: α < 2/L = ' + num.fmt(2 / L, 4) + '. Здесь 1/L = ' + num.fmt(1 / L, 4) + '.');
    } else {
      var P = Atlas.makeProblem(fnDef, params);
      var Lloc = Atlas.localL(P, B.x0 || fnDef.defaultStart(params));
      txt = Atlas.L('No global L on this landscape. At the start point |λ|max = ' + num.fmt(Lloc, 4) +
                    ', so 1/L ≈ ' + num.fmt(1 / Lloc, 4) + ' locally.',
                    'Глобальной L у этого ландшафта нет. В начальной точке |λ|max = ' + num.fmt(Lloc, 4) +
                    ', так что локально 1/L ≈ ' + num.fmt(1 / Lloc, 4) + '.');
    }
    B.sliders.alpha.setHint(txt);
  };

  /* --------------------------------------------------------- presets ----- */

  var PRESETS = [
    {
      title: Atlas.L('Divergence: α just above 2/L', 'Расходимость: α чуть больше 2/L'),
      why: Atlas.L('Gradient descent contracts only while α < 2/L. One notch above and every step is amplified instead, until the run stops with "diverged at iteration k".',
                   'Градиентный спуск сжимает ошибку, только пока α < 2/L. Чуть больше — и каждый шаг её усиливает, пока запуск не остановится с сообщением «разошёлся на итерации k».'),
      build: function () {
        var f = Atlas.functionsById['quadratic'];
        var L = f.L({ kappa: 10 });
        return { fn: 'quadratic', params: { kappa: 10 }, methods: ['gd'],
                 opts: { alpha: 2.05 / L }, start: [2.4, 1.6],
                 budget: 400, speed: 200, run: true };
      }
    },
    {
      title: Atlas.L('Narrow valley: κ = 1000', 'Узкий овраг: κ = 1000'),
      why: Atlas.L('The safe step is set by the steep direction, so progress along the flat direction is κ times slower. Acceleration cuts that to about √κ.',
                   'Безопасный шаг определяется крутым направлением, поэтому вдоль пологого продвижение в κ раз медленнее. Ускорение сокращает это отставание примерно до √κ раз.'),
      build: function () {
        var f = Atlas.functionsById['quadratic'];
        var L = f.L({ kappa: 1000 });
        return { fn: 'quadratic', params: { kappa: 1000 }, methods: ['gd', 'nesterov'],
                 opts: { alpha: 1 / L, beta: 0.94 }, start: [2.4, 1.6],
                 budget: 800, speed: 200, run: true,
                 overlays: ['linear', 'accel'] };
      }
    },
    {
      title: Atlas.L('Momentum overshoots: β = 0.98', 'Импульс проскакивает минимум: β = 0.98'),
      why: Atlas.L('Heavy Ball keeps its velocity through the minimum, so a β that is too large turns descent into a long orbit.',
                   'Тяжёлый шарик сохраняет скорость, проходя через минимум, поэтому слишком большое β превращает спуск в долгое кружение вокруг него.'),
      build: function () {
        var f = Atlas.functionsById['quadratic'];
        var L = f.L({ kappa: 20 });
        return { fn: 'quadratic', params: { kappa: 20 }, methods: ['heavy_ball', 'gd'],
                 opts: { alpha: 1 / L, beta: 0.98 }, start: [2.4, 1.6],
                 budget: 600, speed: 200, run: true };
      }
    },
    {
      title: Atlas.L('Newton goes to a saddle', 'Ньютон приходит в седло'),
      why: Atlas.L('Newton solves ∇f = 0, and a saddle satisfies that equation exactly as well as a minimum does. Gradient descent slides off the ridge; Newton jumps onto it in one step and reports that it has finished.',
                   'Метод Ньютона решает уравнение ∇f = 0, а седло удовлетворяет ему ничуть не хуже минимума. Градиентный спуск соскальзывает с гребня, а Ньютон за один шаг прыгает прямо в седло и сообщает, что закончил.'),
      build: function () {
        return { fn: 'saddle', params: {}, methods: ['newton', 'gd'],
                 opts: { alpha: 0.3 }, start: [1.4, 0.02],
                 budget: 60, speed: 12, run: true };
      }
    },
    {
      title: Atlas.L('Local minima: Rastrigin', 'Локальные минимумы: функция Растригина'),
      why: Atlas.L('Every method here is local. It stops in the basin it started in, so click a different starting point and run again.',
                   'Все методы здесь локальные: каждый останавливается в той впадине, где начал. Щёлкните, чтобы выбрать другую начальную точку, и запустите снова.'),
      build: function () {
        var f = Atlas.functionsById['rastrigin'];
        return { fn: 'rastrigin', params: {}, methods: ['gd_ls', 'cg'],
                 opts: { alpha: 1 / f.L({}) }, start: [-4.1, 3.6],
                 budget: 300, speed: 60, run: true };
      }
    }
  ];

  B.buildPresets = function () {
    var box = $('#b-presets');
    clear(box);
    PRESETS.forEach(function (p) {
      var wrap = el('div', 'preset');
      var btn = el('button', null, p.title);
      btn.type = 'button';
      btn.addEventListener('click', function () { B.applyPreset(p.build()); });
      wrap.appendChild(btn);
      wrap.appendChild(el('p', null, p.why));
      box.appendChild(wrap);
    });
  };

  B.applyPreset = function (cfg) {
    var fnDef = Atlas.functionsById[cfg.fn];
    var params = paramsFor(fnDef);
    Object.keys(cfg.params || {}).forEach(function (k) { params[k] = cfg.params[k]; });

    B.enabled = {};
    (cfg.methods || []).forEach(function (id) { B.enabled[id] = true; });
    B.focus = (cfg.methods && cfg.methods[0]) || B.focus;

    Object.keys(cfg.opts || {}).forEach(function (k) {
      B.opts[k] = cfg.opts[k];
      if (B.sliders[k]) B.sliders[k].set(cfg.opts[k]);
    });
    if (cfg.budget) { B.budget = cfg.budget; B.sliders.budget.set(cfg.budget); }
    if (cfg.speed) { B.speed = cfg.speed; B.sliders.speed.set(cfg.speed); }

    B.fnId = cfg.fn;
    $('#b-fn').value = cfg.fn;
    B.fv.setFunction(fnDef, params);
    B.paramSliders = buildParamControls($('#b-params'), fnDef, B.onParamChange);
    $('#b-fnnote').textContent = fnDef.note || '';
    B.x0 = (cfg.start || fnDef.defaultStart(params)).slice();

    if (cfg.overlays) {
      B.overlays = {};
      cfg.overlays.forEach(function (id) { B.overlays[id] = true; });
    }

    B.refreshMethodRows();
    B.showCard(B.focus);
    B.updateAlphaHint();
    B.buildOverlays();
    B.rebuild();
    B.setRunning(!!cfg.run);
    A.dirty = true;
  };

  /* ------------------------------------------------------ problem setup -- */

  B.onParamChange = function () {
    var fnDef = Atlas.functionsById[B.fnId];
    B.fv.setFunction(fnDef, paramsFor(fnDef));
    B.autoAlpha();
    B.updateAlphaHint();
    B.rebuild();
    A.dirty = true;
  };

  /* The safe step size differs by orders of magnitude between landscapes, so
     α follows the landscape unless the user changes it afterwards. */
  B.autoAlpha = function () {
    var fnDef = Atlas.functionsById[B.fnId];
    var a = fnDef.alphaSuggest ? fnDef.alphaSuggest(paramsFor(fnDef)) : B.opts.alpha;
    a = num.clamp(a, Atlas.hyper.alpha.min, Atlas.hyper.alpha.max);
    B.opts.alpha = a;
    if (B.sliders.alpha) B.sliders.alpha.set(a);
  };

  B.setFunction = function (id, resetStart) {
    B.fnId = id;
    var fnDef = Atlas.functionsById[id];
    var params = paramsFor(fnDef);
    B.fv.setFunction(fnDef, params);
    B.paramSliders = buildParamControls($('#b-params'), fnDef, B.onParamChange);
    $('#b-fnnote').textContent = fnDef.note || '';
    if (resetStart || !B.x0) B.x0 = fnDef.defaultStart(params).slice();
    B.autoAlpha();
    B.updateAlphaHint();
    B.buildOverlays();
    B.rebuild();
  };

  B.rebuild = function () {
    var fnDef = Atlas.functionsById[B.fnId];
    var params = paramsFor(fnDef);
    if (!B.x0) B.x0 = fnDef.defaultStart(params).slice();
    B.runs = [];
    Atlas.methodsIn('continuous').forEach(function (m) {
      if (!B.enabled[m.id]) return;
      var P = Atlas.makeProblem(fnDef, params);
      B.runs.push(new Atlas.Run(m, P, B.opts, B.x0, B.budget));
    });
    B.acc = 0;
    B.dirty = true;
    B.tableDirty = true;
    B.updateStatus();
  };

  B.setRunning = function (on) {
    if (on && !B.runs.some(function (r) { return r.active(); })) {
      /* everything already finished: start over so the button always does something */
      B.rebuild();
    }
    B.running = on;
    $('#b-run').disabled = on;
    $('#b-pause').disabled = !on;
  };

  B.stepAll = function (n) {
    var moved = false;
    for (var s = 0; s < n; s++) {
      var any = false;
      for (var i = 0; i < B.runs.length; i++) {
        if (B.runs[i].active()) { B.runs[i].step(); any = true; moved = true; }
      }
      if (!any) break;
    }
    if (moved) { B.dirty = true; B.tableDirty = true; }
    if (!B.runs.some(function (r) { return r.active(); })) B.setRunning(false);
  };

  B.theoreticalStep = function () {
    var fnDef = Atlas.functionsById[B.fnId];
    var params = paramsFor(fnDef);
    var L = fnDef.L ? fnDef.L(params) : null;
    var note;
    if (L) {
      note = Atlas.L('α = 1/L = ' + num.fmt(1 / L, 5) + ', with L = ' + num.fmt(L, 4) + ' exact for this landscape.',
                     'α = 1/L = ' + num.fmt(1 / L, 5) + ', где L = ' + num.fmt(L, 4) + ' — точное значение для этого ландшафта.');
    } else {
      var P = Atlas.makeProblem(fnDef, params);
      L = Atlas.localL(P, B.x0);
      note = Atlas.L('α = 1/L = ' + num.fmt(1 / L, 5) + ', with L = |λ|max of ∇²f at the start point = ' +
                     num.fmt(L, 4) + ' — a local estimate, this landscape has no global L.',
                     'α = 1/L = ' + num.fmt(1 / L, 5) + ', где L = |λ|max матрицы ∇²f в начальной точке = ' +
                     num.fmt(L, 4) + ' — локальная оценка: глобальной L у этого ландшафта нет.');
    }
    var a = num.clamp(1 / L, Atlas.hyper.alpha.min, Atlas.hyper.alpha.max);
    B.opts.alpha = a;
    if (B.sliders.alpha) B.sliders.alpha.set(a);
    /* kept, so a language switch can write it again */
    B.theoryNote = note;
    $('#b-theory-note').textContent = note;
    B.updateAlphaHint();
    B.rebuild();
  };

  /* ------------------------------------------------------------ drawing -- */

  B.overlay = function (view, ctx) {
    var C = Atlas.theme.colors();
    var fnDef = Atlas.functionsById[B.fnId];
    var params = paramsFor(fnDef);

    /* known optima: grey crosses */
    (fnDef.optima ? fnDef.optima(params) : []).forEach(function (p) {
      var s = view.toScreen(p);
      draw.cross(ctx, s[0], s[1], 7, C.marker, 1.6);
    });
    (fnDef.saddles ? fnDef.saddles(params) : []).forEach(function (p) {
      var s = view.toScreen(p);
      ctx.save();
      ctx.translate(s[0], s[1]);
      ctx.rotate(Math.PI / 4);
      draw.cross(ctx, 0, 0, 5, C.muted, 1.3);
      ctx.restore();
    });

    for (var i = 0; i < B.runs.length; i++) drawTrajectory(view, ctx, B.runs[i], C);

    if (B.x0) {
      var s0 = view.toScreen(B.x0);
      draw.ring(ctx, s0[0], s0[1], 5.5, C.fg, 1.8, C.panel);
    }
  };

  function drawTrajectory(view, ctx, run, C) {
    var traj = run.traj, pts = [], i;
    for (i = 0; i < traj.length; i++) {
      var p = traj[i];
      if (!num.finite(p)) break;
      var x = view.sx(p[0]), y = view.sy(p[1]);
      if (!isFinite(x) || !isFinite(y)) break;
      pts.push([num.clamp(x, -1e5, 1e5), num.clamp(y, -1e5, 1e5)]);
    }
    if (!pts.length) return;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = run.color;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.globalAlpha = 1;
    var stride = Math.max(1, Math.ceil(pts.length / 200));
    for (i = 0; i < pts.length; i += stride) draw.dot(ctx, pts[i][0], pts[i][1], 2.1, run.color);

    var last = pts[pts.length - 1];
    if (pts.length > 1) {
      var prev = pts[pts.length - 2];
      draw.arrow(ctx, prev[0], prev[1], last[0], last[1], run.color, 2.1, 9);
    }
    if (run.status === 'converged') {
      /* a star only for a real minimum; a diamond for a saddle or a maximum */
      if (run.pointType === 'minimum' || !run.pointType) {
        draw.star(ctx, last[0], last[1], 7.5, run.color, C.panel);
      } else {
        draw.diamond(ctx, last[0], last[1], 6.5, run.color, C.panel);
      }
    }
    ctx.restore();
  }

  B.renderChart = function () {
    var fnDef = Atlas.functionsById[B.fnId];
    var params = paramsFor(fnDef);
    var rc = B.rateContext();
    var C = Atlas.theme.colors();
    var series = B.runs.map(function (r) {
      return { name: r.method.name, color: r.color, values: r.chartValues() };
    });

    var shown = [];
    if (rc.known && B.x0) {
      /* The gap at the starting point anchors every overlay, so the shapes
         are drawn even before a single method has been run. */
      var gap0 = fnDef.f(B.x0, params) - rc.fstar;
      var n = 2;
      B.runs.forEach(function (r) { if (r.traj.length > n) n = r.traj.length; });
      if (n < 3) n = Math.min(B.budget, 400) + 1;
      n = Math.min(n, 4000);
      if (gap0 > 0 && isFinite(gap0)) {
        OVERLAYS.forEach(function (ov) {
          if (!B.overlays[ov.id]) return;
          if (ov.needsKappa && rc.kappa === null) return;
          shown.push(ov.label);
          series.push({
            color: C.muted, dash: ov.dash, width: 1.2, alpha: 0.95,
            label: ov.label,
            values: Atlas.rateCurve(ov.id, n, gap0, rc.kappa)
          });
        });
      }
    }

    B.chart.render({
      series: series,
      yLabel: rc.known ? 'f(xₖ) − f*' : '‖∇f(xₖ)‖',
      xLabel: Atlas.t('iteration k', 'итерация k'),
      empty: Atlas.t('enable a method and press Run', 'включите метод и нажмите «Запуск»')
    });

    $('#b-chart-title').textContent = rc.known ? Atlas.t('Convergence: f(xₖ) − f*', 'Сходимость: f(xₖ) − f*')
                                               : Atlas.t('Convergence: ‖∇f(xₖ)‖', 'Сходимость: ‖∇f(xₖ)‖');
    var sub = rc.known
      ? Atlas.t('logarithmic axis — a straight line means linear convergence',
                'логарифмическая шкала — прямая линия означает линейную сходимость')
      : Atlas.t('f is unbounded below here, so the gradient norm is plotted instead',
                'здесь f не ограничена снизу, поэтому вместо f − f* показана норма градиента');
    if (shown.length) {
      sub += Atlas.t('. Dashed: theoretical shapes anchored at the initial gap',
                     '. Пунктир — теоретические кривые, привязанные к начальному значению f − f*');
      if (rc.kappaNote && shown.some(function (l) { return Atlas.tr(l).indexOf('κ') >= 0; })) {
        sub += ', ' + rc.kappaNote;
      }
    }
    $('#b-chart-sub').textContent = sub;
  };

  B.renderTable = function () {
    var tbody = $('#b-runs').querySelector('tbody');
    clear(tbody);
    if (!B.runs.length) {
      var tr = el('tr');
      var td = el('td', null, Atlas.t('No method enabled.', 'Нет включённых методов.'));
      td.colSpan = 7;
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    B.runs.forEach(function (r) {
      var tr = el('tr');
      var name = el('td');
      var sw = el('span', 'swatch');
      sw.style.background = r.color;
      name.appendChild(sw);
      name.appendChild(document.createTextNode(r.method.name));
      tr.appendChild(name);

      function cell(text) { var td = el('td', 'num', text); tr.appendChild(td); }
      cell(String(r.k));
      cell(num.fmt(r.fs[r.fs.length - 1], 4));
      cell(num.fmt(r.gs[r.gs.length - 1], 3));
      cell(String(r.problem.fEvals));
      cell(String(r.problem.gEvals));

      var kind = (r.status === 'converged' && r.pointType && r.pointType !== 'minimum')
        ? 'saddle' : r.status;
      var st = el('td', 'state-' + kind);
      st.textContent = r.status === 'ready' ? statusWord('ready')
        : r.status === 'running' ? (statusWord('running') + detail(r.info))
        : statusWord(r.status) + detail(r.message);
      tr.appendChild(st);
      tbody.appendChild(tr);
    });
  };

  B.updateStatus = function () {
    var fnDef = Atlas.functionsById[B.fnId];
    var params = paramsFor(fnDef);
    var bar = $('#b-status');
    clear(bar);
    function item(k, v) {
      var span = el('span');
      span.appendChild(el('b', null, k + ' '));
      var val = el('span', 'mono', v);
      span.appendChild(val);
      bar.appendChild(span);
    }
    item(Atlas.t('landscape', 'функция'), traitText(fnDef, params));
    item(Atlas.t('start', 'начальная точка'), B.x0 ? num.fmtVec(B.x0, 3) : '—');
    var opt = fnDef.optima ? fnDef.optima(params) : [];
    var fs = fnDef.fstar ? fnDef.fstar(params) : null;
    var many = opt.length + ' ' + Atlas.t('minima', Atlas.ruPlural(opt.length, 'минимум', 'минимума', 'минимумов'));
    item(Atlas.t('optimum', 'оптимум'),
         opt.length ? (opt.length > 1 ? many + ', f* = ' + num.fmt(fs, 3)
                                      : num.fmtVec(opt[0], 3) + ', f* = ' + num.fmt(fs, 3))
                    : Atlas.t('none, f is unbounded below', 'отсутствует, f не ограничена снизу'));
    item('α', num.fmt(B.opts.alpha, 5));
    B.tag();
  };

  B.tag = function () {
    $('#b-tag').textContent = Atlas.t('click to move the start point', 'щёлкните, чтобы перенести начальную точку');
  };

  B.frame = function (dt) {
    if (B.running) {
      B.acc += dt * B.speed;
      var steps = Math.floor(B.acc);
      if (steps > 0) {
        B.acc -= steps;
        B.stepAll(Math.min(steps, 400));
      }
    }
    if (B.dirty) {
      B.fv.render();
      B.renderChart();
      B.dirty = false;
    }
    if (B.tableDirty) {
      B.renderTable();
      B.tableDirty = false;
    }
  };

  B.onShow = function () { B.dirty = true; B.tableDirty = true; };

  /* Language switch: re-render every text this section wrote, keep its runs. */
  B.relabel = function () {
    var fnDef = Atlas.functionsById[B.fnId];
    relabelOptions($('#b-fn'), function (id) { return Atlas.functionsById[id]; });
    relabelSliders(B.paramSliders);
    $('#b-fnnote').textContent = fnDef.note || '';
    B.buildMethodList();                /* rows, count and card; the selection is kept */
    relabelSliders(B.sliders);          /* the α hint is a bilingual text, ' Used by' a function */
    B.buildOverlays();
    B.buildPresets();
    if (B.theoryNote) $('#b-theory-note').textContent = B.theoryNote;
    B.updateStatus();
    B.dirty = true;
    B.tableDirty = true;
  };

  /* =======================================================================
     Generic builders shared by sections C and D
     ===================================================================== */

  /* A checkbox list of every method in `category` that `applies` accepts. */
  function buildMethodPicker(cfg) {
    var box = cfg.container;
    clear(box);
    var hidden = [];
    var shown = 0;
    Atlas.methodsIn(cfg.category).forEach(function (m) {
      if (cfg.applies && !cfg.applies(m)) { hidden.push(m.name); return; }
      shown++;
      var row = el('div', 'mrow');
      row.setAttribute('data-id', m.id);
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!cfg.state.enabled[m.id];
      cb.setAttribute('aria-label', m.name);
      var sw = el('span', 'swatch');
      sw.style.background = m.color;
      row.appendChild(cb);
      row.appendChild(sw);
      row.appendChild(el('span', 'mname', m.name));
      row.appendChild(tagChip(m));
      row.addEventListener('click', function (ev) {
        if (ev.target !== cb) cb.checked = !cb.checked;
        cfg.state.enabled[m.id] = cb.checked;
        cfg.state.focus = m.id;
        cfg.refresh();
        cfg.onChange();
      });
      row.addEventListener('mouseenter', function () { renderCardInto(cfg.card, m.id); });
      row.addEventListener('mouseleave', function () { renderCardInto(cfg.card, cfg.state.focus); });
      box.appendChild(row);
    });
    if (!shown) {
      box.appendChild(el('div', 'ctl-hint', Atlas.t('No method applies to this problem.',
                                                    'К этой задаче не применим ни один метод.')));
    }
    if (cfg.noteEl) {
      cfg.noteEl.textContent = hidden.length
        ? Atlas.t('Not applicable here: ', 'Здесь неприменимы: ') + hidden.join(', ') + '.'
        : '';
    }
    renderCardInto(cfg.card, cfg.state.focus);
  }

  function refreshPicker(container, countEl, state) {
    var rows = container.querySelectorAll('.mrow');
    var n = 0;
    for (var i = 0; i < rows.length; i++) {
      var id = rows[i].getAttribute('data-id');
      rows[i].classList.toggle('is-focus', id === state.focus);
      var cb = rows[i].querySelector('input');
      cb.checked = !!state.enabled[id];
      if (cb.checked) n++;
    }
    if (countEl) countEl.textContent = Atlas.t(n + ' enabled', 'включено: ' + n);
  }

  /* Sliders for every hyperparameter some method of `category` declares. */
  function buildHyperPanel(cfg) {
    var box = cfg.container;
    clear(box);
    var sliders = {};
    var used = {};
    Atlas.methodsIn(cfg.category).forEach(function (m) {
      (m.uses || []).forEach(function (u) {
        if (!used[u]) used[u] = [];
        used[u].push(m.name);
      });
    });
    Object.keys(Atlas.hyper).forEach(function (key) {
      if (!used[key]) return;
      var spec = Atlas.hyper[key];
      var sl = makeSlider(spec, cfg.opts[key], function (v) {
        cfg.opts[key] = v;
        cfg.onChange(key);
      });
      sl.setHint(usedByHint(spec, used[key]));
      sliders[key] = sl;
      box.appendChild(sl.root);
    });
    (cfg.extras || []).forEach(function (e) {
      var sl = makeSlider(e.spec, e.get(), function (v) { e.set(v); });
      sliders[e.spec.id] = sl;
      box.appendChild(sl.root);
    });
    return sliders;
  }

  /* Trajectory drawing shared by sections C and D. */
  function drawPath(view, ctx, pts, color, opt) {
    opt = opt || {};
    var clean = [], i;
    for (i = 0; i < pts.length; i++) {
      if (!num.finite(pts[i])) break;
      var sx = view.sx(pts[i][0]), sy = view.sy(pts[i][1]);
      if (!isFinite(sx) || !isFinite(sy)) break;
      clean.push([num.clamp(sx, -1e5, 1e5), num.clamp(sy, -1e5, 1e5)]);
    }
    if (!clean.length) return null;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(clean[0][0], clean[0][1]);
    for (i = 1; i < clean.length; i++) ctx.lineTo(clean[i][0], clean[i][1]);
    ctx.strokeStyle = color;
    ctx.globalAlpha = opt.alpha === undefined ? 0.85 : opt.alpha;
    ctx.lineWidth = opt.width || 1.7;
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (opt.dots !== false) {
      var stride = Math.max(1, Math.ceil(clean.length / (opt.maxDots || 160)));
      for (i = 0; i < clean.length; i += stride) draw.dot(ctx, clean[i][0], clean[i][1], opt.dotR || 1.8, color);
    }
    ctx.restore();
    return clean[clean.length - 1];
  }

  /* =======================================================================
     Section C - stochastic optimization
     ===================================================================== */

  var SCHEDULES = [
    { id: 'constant', name: Atlas.L('Constant', 'Постоянное'),
      fn: function () { return 1; },
      note: Atlas.L('α never changes, so the iterates settle into a ball of fixed size and stay there.',
                    'α не меняется, поэтому точки траектории оседают в шаре фиксированного размера и там остаются.') },
    { id: 'inv', name: Atlas.L('1/k decay', 'Затухание 1/k'),
      fn: function (p) { return 1 / (1 + 39 * p); },
      note: Atlas.L('α/(1 + 39·k/K), the Robbins-Monro 1/k form: the ball shrinks to a point, slowly.',
                    'α/(1 + 39·k/K) — форма 1/k Роббинса–Монро: шар стягивается в точку, но медленно.') },
    { id: 'cosine', name: Atlas.L('Cosine', 'Косинусное'),
      fn: function (p) { return 0.5 * (1 + Math.cos(Math.PI * p)); },
      note: Atlas.L('Large steps early, then a smooth glide to zero. The standard schedule for deep models.',
                    'Сначала крупные шаги, затем плавное снижение до нуля. Стандартное расписание для глубоких моделей.') },
    { id: 'warmcos', name: Atlas.L('Warmup + cosine', 'Прогрев + косинус'),
      fn: function (p) {
        var w = 0.06;
        return p < w ? p / w : 0.5 * (1 + Math.cos(Math.PI * (p - w) / (1 - w)));
      },
      note: Atlas.L('A short ramp first, so early noisy gradients cannot throw the iterate somewhere silly.',
                    'Сначала короткий прогрев, чтобы шумные градиенты первых шагов не забросили текущую точку куда попало.') }
  ];
  function scheduleById(id) {
    for (var i = 0; i < SCHEDULES.length; i++) if (SCHEDULES[i].id === id) return SCHEDULES[i];
    return SCHEDULES[0];
  }

  var Cx = {
    SP: null,
    seed: 20250901,
    enabled: { gd_full: true, sgd_mb: true, adam: true },
    focus: 'sgd_mb',
    opts: {},
    epochs: 30,
    speed: 2.5,
    schedule: 'constant',
    running: false,
    acc: 0,
    runs: [],
    x0: [-1.9, 3.1],
    dirty: true,
    tableDirty: true,
    sliders: {},
    fv: null, chart: null, ballView: null, schedView: null, escFv: null
  };

  Cx.init = function () {
    Cx.fv = new Atlas.FieldView($('#c-canvas'), { gridN: 200, levelCount: 16 });
    Cx.fv.overlay = Cx.overlay;
    Cx.chart = new Atlas.Chart($('#c-chart'));
    Cx.ballView = new Atlas.View($('#c-ball'));
    Cx.schedView = new Atlas.View($('#c-sched'));
    Cx.schedView.uniform = false;
    Cx.escFv = new Atlas.FieldView($('#c-escape'), { gridN: 140, levelCount: 14 });
    Cx.escFv.overlay = Cx.escapeOverlay;
    Cx.escFv.setFunction(Atlas.escapeProblem, {});

    Object.keys(Atlas.hyper).forEach(function (k) { Cx.opts[k] = Atlas.hyper[k].def; });

    var sel = $('#c-schedule');
    SCHEDULES.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      sel.appendChild(o);
    });
    sel.value = Cx.schedule;
    sel.addEventListener('change', function () {
      Cx.schedule = sel.value;
      $('#c-sched-note').textContent = scheduleById(Cx.schedule).note;
      Cx.rebuild();
    });
    $('#c-sched-note').textContent = scheduleById(Cx.schedule).note;

    Cx.buildMethods();
    Cx.buildHyper();

    $('#c-run').addEventListener('click', function () { Cx.setRunning(true); });
    $('#c-pause').addEventListener('click', function () { Cx.setRunning(false); });
    $('#c-step').addEventListener('click', function () { Cx.setRunning(false); Cx.advance(1 / 8); });
    $('#c-reset').addEventListener('click', function () { Cx.setRunning(false); Cx.rebuild(); });
    $('#c-race').addEventListener('click', function () {
      Atlas.methodsIn('stochastic').forEach(function (m) { Cx.enabled[m.id] = true; });
      Cx.buildMethods();
      Cx.rebuild();
      Cx.setRunning(true);
    });
    $('#c-resample').addEventListener('click', function () {
      Cx.seed = (Cx.seed * 1103515245 + 12345) >>> 0;
      Cx.makeProblem();
      Cx.rebuild();
    });
    $('#c-canvas').addEventListener('pointerdown', function (ev) {
      var p = Cx.fv.view.pointer(ev);
      if (!Cx.fv.view.inside(p)) return;
      Cx.x0 = p;
      Cx.rebuild();
    });
    $('#c-escape-run').addEventListener('click', function () { Cx.esc.running = !Cx.esc.running; Cx.dirty = true; });
    $('#c-escape-reset').addEventListener('click', function () { Cx.resetEscape(); });

    Cx.makeProblem();
    Cx.resetEscape();
    Cx.rebuild();
    Cx.setRunning(false);
  };

  Cx.makeProblem = function () {
    Cx.SP = Atlas.makeStochasticProblem({ seed: Cx.seed });
    Cx.fv.setFunction(Cx.SP.fnDef, {});
  };

  Cx.buildMethods = function () {
    buildMethodPicker({
      container: $('#c-methods'), card: $('#c-card'), category: 'stochastic',
      state: Cx,
      refresh: function () { refreshPicker($('#c-methods'), $('#c-count'), Cx); },
      onChange: function () { Cx.rebuild(); }
    });
    refreshPicker($('#c-methods'), $('#c-count'), Cx);
  };

  Cx.buildHyper = function () {
    Cx.sliders = buildHyperPanel({
      container: $('#c-hyper'), category: 'stochastic', opts: Cx.opts,
      onChange: function () { Cx.rebuild(); },
      extras: [
        { spec: { id: 'epochs', label: Atlas.L('Epochs', 'Эпохи'), min: 1, max: 60, step: 1, integer: true,
                  hint: Atlas.L('One epoch is n individual gradients, whatever the batch size.',
                                'Одна эпоха — это n отдельных градиентов при любом размере батча.') },
          get: function () { return Cx.epochs; },
          set: function (v) { Cx.epochs = Math.round(v); Cx.rebuild(); } },
        { spec: { id: 'cspeed', label: Atlas.L('Animation speed', 'Скорость анимации'), min: 0.2, max: 20, log: true,
                  unit: Atlas.L('epoch/s', 'эп/с'),
                  hint: Atlas.L('Every optimizer advances at the same epoch rate, so the race is fair.',
                                'Все оптимизаторы продвигаются с одинаковой скоростью в эпохах, так что гонка честная.') },
          get: function () { return Cx.speed; },
          set: function (v) { Cx.speed = v; } }
      ]
    });
  };

  Cx.rebuild = function () {
    var sched = scheduleById(Cx.schedule).fn;
    Cx.runs = [];
    Atlas.methodsIn('stochastic').forEach(function (m) {
      if (!Cx.enabled[m.id]) return;
      Cx.runs.push(new Atlas.SRun(m, Cx.SP, Cx.opts, Cx.x0, sched, Cx.epochs));
    });
    Cx.acc = 0;
    Cx.dirty = true;
    Cx.tableDirty = true;
    Cx.updateStatus();
    Cx.drawSchedule();
  };

  Cx.setRunning = function (on) {
    if (on && !Cx.runs.some(function (r) { return r.active(); })) Cx.rebuild();
    Cx.running = on;
    $('#c-run').disabled = on;
    $('#c-pause').disabled = !on;
  };

  Cx.advance = function (epochDelta) {
    Cx.acc += epochDelta;
    var moved = false;
    Cx.runs.forEach(function (r) {
      var want = Math.min(r.totalSteps, Math.floor(Cx.acc * r.updatesPerEpoch));
      var guard = 0;
      while (r.k < want && r.active() && guard < 20000) { r.step(); guard++; moved = true; }
    });
    if (moved) { Cx.dirty = true; Cx.tableDirty = true; }
    if (!Cx.runs.some(function (r) { return r.active(); })) Cx.setRunning(false);
  };

  /* Used by the cheat sheet to open this section already configured. */
  Cx.applyPreset = function (cfg) {
    if (cfg.methods) {
      Cx.enabled = {};
      cfg.methods.forEach(function (id) { Cx.enabled[id] = true; });
      Cx.focus = cfg.methods[0];
    }
    Object.keys(cfg.opts || {}).forEach(function (k) {
      Cx.opts[k] = cfg.opts[k];
      if (Cx.sliders[k]) Cx.sliders[k].set(cfg.opts[k]);
    });
    if (cfg.schedule) {
      Cx.schedule = cfg.schedule;
      $('#c-schedule').value = cfg.schedule;
      $('#c-sched-note').textContent = scheduleById(cfg.schedule).note;
    }
    if (cfg.epochs) {
      Cx.epochs = cfg.epochs;
      if (Cx.sliders.epochs) Cx.sliders.epochs.set(cfg.epochs);
    }
    Cx.buildMethods();
    Cx.rebuild();
    Cx.setRunning(!!cfg.run);
  };

  Cx.overlay = function (view, ctx) {
    var C = Atlas.theme.colors();
    var SP = Cx.SP, i;

    /* the individual minima: one dot per term of the sum */
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (i = 0; i < SP.c.length; i++) {
      var s = view.toScreen(SP.c[i]);
      draw.dot(ctx, s[0], s[1], 1.6, C.muted);
    }
    ctx.restore();

    var st = view.toScreen(SP.xstar);
    draw.cross(ctx, st[0], st[1], 8, C.fg, 1.8);
    draw.label(ctx, 'x*', st[0] + 10, st[1] - 5, { color: C.fg, box: C.panel, boxAlpha: 0.7 });

    for (i = 0; i < Cx.runs.length; i++) {
      var r = Cx.runs[i];
      var last = drawPath(view, ctx, r.traj, r.color, { width: 1.5, alpha: 0.8, maxDots: 90, dotR: 1.5 });
      if (last) draw.dot(ctx, last[0], last[1], 3.4, r.color);
    }

    var s0 = view.toScreen(Cx.x0);
    draw.ring(ctx, s0[0], s0[1], 5.5, C.fg, 1.8, C.panel);
  };

  /* Which run the noise ball shows: the focused one if it is running. */
  Cx.ballRun = function () {
    var f = null;
    Cx.runs.forEach(function (r) { if (r.method.id === Cx.focus) f = r; });
    return f || Cx.runs[0] || null;
  };

  Cx.drawBall = function () {
    var v = Cx.ballView;
    v.resize();
    if (!v.w || !v.h) return;
    var ctx = v.ctx, C = Atlas.theme.colors();
    ctx.clearRect(0, 0, v.w, v.h);
    var run = Cx.ballRun();
    var note = $('#c-ball-note');
    /* The cloud only means anything once the transient is over, so the second
       half of the run is discarded as burn-in and at most 200 iterates of what
       remains are used. */
    var count = run ? Math.min(200, Math.ceil(run.k / 2)) : 0;
    if (!run || run.k < 40 || count < 20) {
      v.setDomain({ x0: -1, x1: 1, y0: -1, y1: 1 });
      draw.label(ctx, run ? Atlas.t('keep running: this is still the descent', 'продолжайте: это ещё этап спуска')
                          : Atlas.t('run an optimizer to see its cloud', 'запустите оптимизатор — появится облако'),
                 v.w / 2, v.h / 2,
                 { color: C.muted, align: 'center', font: '12px system-ui, -apple-system, sans-serif' });
      note.textContent = run
        ? Atlas.t('The noise ball is what is left after the iterates stop making progress. Give it at least 40 updates.',
                  'Шар шума — это то, что остаётся, когда точки траектории перестают продвигаться к x*. Дайте методу не меньше 40 обновлений.')
        : '';
      return;
    }
    var xs = Cx.SP.xstar;
    var tail = run.tail(count);
    var stat = run.tailRadius(count, xs);   /* spread about x*, as the theory predicts */
    var span = Math.max(stat.radius * 3.2, num.dist(stat.center, xs) * 2.2, 1e-3);
    v.setDomain({ x0: xs[0] - span, x1: xs[0] + span, y0: xs[1] - span, y1: xs[1] + span });

    /* axes through x* */
    ctx.save();
    ctx.strokeStyle = C.line;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(v.sx(xs[0]), 0); ctx.lineTo(v.sx(xs[0]), v.h);
    ctx.moveTo(0, v.sy(xs[1])); ctx.lineTo(v.w, v.sy(xs[1]));
    ctx.stroke();
    ctx.restore();

    var i, p;
    for (i = 0; i < tail.length; i++) {
      p = v.toScreen(tail[i]);
      draw.dot(ctx, p[0], p[1], 1.7, run.color);
    }
    var sx2 = v.toScreen(xs);
    ctx.save();
    ctx.setLineDash([4, 3]);
    draw.ring(ctx, sx2[0], sx2[1], stat.radius * v.scale, run.color, 1.6);
    ctx.restore();
    draw.cross(ctx, sx2[0], sx2[1], 7, C.fg, 1.6);

    /* exact prediction, where the theory applies */
    var pred = Cx.predictedRadius(run);
    if (pred !== null) {
      ctx.save();
      ctx.setLineDash([2, 3]);
      draw.ring(ctx, sx2[0], sx2[1], pred * v.scale, C.fg, 1.3);
      ctx.restore();
    }
    note.innerHTML = Atlas.t(
      'RMS radius <b>' + num.fmt(stat.radius, 4) + '</b> over the last ' + count +
      ' of ' + run.k + ' updates' +
      (pred !== null
        ? ' · predicted <b>' + num.fmt(pred, 4) + '</b> by solving the stationary covariance exactly'
        : ' · a prediction is shown only for plain SGD at a constant step') +
      ' · batch <b>' + run.batch + '</b>, α <b>' + num.fmt(run.lr, 4) + '</b>',
      'Среднеквадратичный радиус <b>' + num.fmt(stat.radius, 4) + '</b> по последним ' + count +
      ' из ' + run.k + ' ' + Atlas.ruPlural(run.k, 'обновления', 'обновлений', 'обновлений') +
      (pred !== null
        ? ' · прогноз <b>' + num.fmt(pred, 4) + '</b> по точно вычисленной стационарной ковариации'
        : ' · прогноз показывается только для обычного SGD с постоянным шагом') +
      ' · батч <b>' + run.batch + '</b>, α <b>' + num.fmt(run.lr, 4) + '</b>');
  };

  /* Stationary covariance of x_k − x* for SGD with a constant step on this
     quadratic:  Σ = (I−αA)Σ(I−αA)ᵀ + (α²/b)·Cov(noise).  Solved exactly. */
  Cx.predictedRadius = function (run) {
    if (Cx.schedule !== 'constant') return null;
    if (run.method.id !== 'sgd1' && run.method.id !== 'sgd_mb') return null;
    var a = Cx.opts.lr, A = Cx.SP.A, b = run.batch;
    var M = [[1 - a * A[0][0], -a * A[0][1]], [-a * A[1][0], 1 - a * A[1][1]]];
    var Q = num.matScale(Cx.SP.Cnoise, a * a / b);
    var S = Atlas.lyapunov2(M, Q);
    if (!S) return null;
    var tr = S[0][0] + S[1][1];
    return tr > 0 ? Math.sqrt(tr) : null;
  };

  Cx.drawSchedule = function () {
    var v = Cx.schedView;
    v.resize();
    if (!v.w || !v.h) return;
    var ctx = v.ctx, C = Atlas.theme.colors();
    ctx.clearRect(0, 0, v.w, v.h);
    var fn = scheduleById(Cx.schedule).fn;
    var pad = 4, W = v.w - 2 * pad, H = v.h - 2 * pad;
    ctx.save();
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.moveTo(pad, v.h - pad); ctx.lineTo(v.w - pad, v.h - pad);
    ctx.stroke();
    ctx.beginPath();
    for (var i = 0; i <= 120; i++) {
      var p = i / 120;
      var y = v.h - pad - num.clamp(fn(p), 0, 1) * H;
      var x = pad + p * W;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();
  };

  /* ---- escape the saddle ------------------------------------------------ */

  Cx.esc = { gd: null, sgd: null, gdT: [], sgdT: [], k: 0, running: false, rng: null, lr: 0.06, sigma: 0.45, maxK: 500 };

  Cx.resetEscape = function () {
    var e = Cx.esc;
    e.gd = [0.95, 0];
    e.sgd = [0.95, 0];
    e.gdT = [e.gd.slice()];
    e.sgdT = [e.sgd.slice()];
    e.k = 0;
    e.running = false;
    e.rng = Atlas.rng(4242);
    Cx.dirty = true;
  };

  Cx.escapeStep = function () {
    var e = Cx.esc, P = Atlas.escapeProblem;
    if (e.k >= e.maxK) { e.running = false; return; }
    var g1 = P.grad(e.gd);
    e.gd = [e.gd[0] - e.lr * g1[0], e.gd[1] - e.lr * g1[1]];
    var g2 = P.grad(e.sgd);
    e.sgd = [e.sgd[0] - e.lr * (g2[0] + e.sigma * e.rng.normal()),
             e.sgd[1] - e.lr * (g2[1] + e.sigma * e.rng.normal())];
    e.gdT.push(e.gd.slice());
    e.sgdT.push(e.sgd.slice());
    e.k++;
  };

  Cx.escapeOverlay = function (view, ctx) {
    var C = Atlas.theme.colors(), e = Cx.esc;
    var P = Atlas.escapeProblem;
    P.optima().forEach(function (p) {
      var s = view.toScreen(p);
      draw.cross(ctx, s[0], s[1], 6, C.marker, 1.4);
    });
    var sd = view.toScreen([0, 0]);
    ctx.save(); ctx.translate(sd[0], sd[1]); ctx.rotate(Math.PI / 4);
    draw.cross(ctx, 0, 0, 5, C.muted, 1.3);
    ctx.restore();

    var blue = Atlas.palette.blue, orange = Atlas.palette.orange;
    var l1 = drawPath(view, ctx, e.gdT, blue, { width: 1.8, dots: false });
    var l2 = drawPath(view, ctx, e.sgdT, orange, { width: 1.4, alpha: 0.75, dots: false });
    if (l2) draw.dot(ctx, l2[0], l2[1], 4, orange);
    if (l1) draw.dot(ctx, l1[0], l1[1], 4, blue);
    draw.label(ctx, 'GD', 8, 14, { color: blue, box: C.panel, boxAlpha: 0.7 });
    draw.label(ctx, 'SGD', 38, 14, { color: orange, box: C.panel, boxAlpha: 0.7 });
  };

  Cx.updateEscapeNote = function () {
    var e = Cx.esc;
    $('#c-escape-note').innerHTML =
      Atlas.t('step ', 'шаг ') + e.k + ' · GD y = <b>' + num.fmt(e.gd[1], 4) + '</b>' +
      Atlas.t(' (the ridge is exactly flat, so it never leaves)', ' (гребень в точности плоский, поэтому GD с него не сходит)') +
      ' · SGD y = <b>' + num.fmt(e.sgd[1], 4) + '</b>';
    $('#c-escape-run').textContent = e.running ? Atlas.t('Pause', 'Пауза') : Atlas.t('Run', 'Запуск');
  };

  /* ---- section C rendering ---------------------------------------------- */

  Cx.renderChart = function () {
    var series = Cx.runs.map(function (r) {
      return { name: r.method.name, color: r.color, values: r.chartValues(), xs: r.epochAt,
               width: r.method.id === 'gd_full' ? 2.2 : 1.4,
               alpha: r.method.id === 'gd_full' ? 1 : 0.85 };
    });
    Cx.chart.render({
      series: series,
      yLabel: 'F(xₖ) − F*',
      xLabel: Atlas.t('epoch (gradients used / n)', 'эпоха (использовано градиентов / n)'),
      empty: Atlas.t('enable an optimizer and press Run', 'включите оптимизатор и нажмите «Запуск»')
    });
    $('#c-chart-sub').textContent =
      Atlas.t('the x axis counts individual gradients, so one full-batch step costs a whole epoch',
              'по оси x отложено число отдельных градиентов, поэтому один шаг по полному батчу стоит целую эпоху');
  };

  Cx.renderTable = function () {
    var tbody = $('#c-runs').querySelector('tbody');
    clear(tbody);
    if (!Cx.runs.length) {
      var tr0 = el('tr');
      var td0 = el('td', null, Atlas.t('No optimizer enabled.', 'Нет включённых оптимизаторов.'));
      td0.colSpan = 7;
      tr0.appendChild(td0);
      tbody.appendChild(tr0);
      return;
    }
    Cx.runs.forEach(function (r) {
      var tr = el('tr');
      var name = el('td');
      var sw = el('span', 'swatch');
      sw.style.background = r.color;
      name.appendChild(sw);
      name.appendChild(document.createTextNode(r.method.name));
      tr.appendChild(name);
      function cell(t) { tr.appendChild(el('td', 'num', t)); }
      cell(String(r.k));
      cell(num.fmt(r.epochNow(), 2));
      cell(num.fmt(r.Fs[r.Fs.length - 1] - r.SP.Fstar, 3));
      cell(num.fmt(num.dist(r.last(), Cx.SP.xstar), 4));
      cell(String(r.batch));
      var st = el('td', 'state-' + (r.status === 'done' ? 'converged' : r.status));
      st.textContent = r.status === 'ready' ? statusWord('ready')
        : r.status === 'running' ? (statusWord('running') + ' — ' + (r.info || ''))
        : statusWord(r.status) + detail(r.message);
      tr.appendChild(st);
      tbody.appendChild(tr);
    });
  };

  Cx.updateStatus = function () {
    var bar = $('#c-status');
    clear(bar);
    function item(k, v) {
      var span = el('span');
      span.appendChild(el('b', null, k + ' '));
      span.appendChild(el('span', 'mono', v));
      bar.appendChild(span);
    }
    var e = num.eigSym2(Cx.SP.A);
    item(Atlas.t('problem', 'задача'), 'F(x) = (1/n) Σ ½(x−cᵢ)ᵀA(x−cᵢ), n = ' + Cx.SP.n);
    item('x*', num.fmtVec(Cx.SP.xstar, 3) + ', F* = ' + num.fmt(Cx.SP.Fstar, 4));
    item(Atlas.t('curvature', 'кривизна'), 'λ = ' + num.fmt(e.lo, 3) + ', ' + num.fmt(e.hi, 3) +
                      Atlas.t(' so 1/L = ', ', так что 1/L = ') + num.fmt(1 / e.hi, 3));
    item(Atlas.t('start', 'начальная точка'), num.fmtVec(Cx.x0, 3));
    $('#c-tag').textContent = Atlas.t('click to move the start point', 'щёлкните, чтобы перенести начальную точку');
  };

  Cx.frame = function (dt) {
    if (Cx.running) Cx.advance(dt * Cx.speed);
    if (Cx.esc.running) {
      var steps = Math.min(6, Math.max(1, Math.round(dt * 90)));
      for (var i = 0; i < steps; i++) Cx.escapeStep();
      Cx.dirty = true;
    }
    if (Cx.dirty) {
      Cx.fv.render();
      Cx.drawBall();
      Cx.escFv.render();
      Cx.drawSchedule();
      Cx.renderChart();
      Cx.updateEscapeNote();
      Cx.dirty = false;
    }
    if (Cx.tableDirty) { Cx.renderTable(); Cx.tableDirty = false; }
  };

  Cx.onShow = function () { Cx.dirty = true; Cx.tableDirty = true; };

  /* Language switch: re-render every text this section wrote, keep its runs. */
  Cx.relabel = function () {
    relabelOptions($('#c-schedule'), scheduleById);
    $('#c-sched-note').textContent = scheduleById(Cx.schedule).note;
    Cx.buildMethods();                  /* rows, count and card; nothing is enabled or reset */
    relabelSliders(Cx.sliders);
    Cx.updateStatus();
    Cx.updateEscapeNote();
    Cx.dirty = true;
    Cx.tableDirty = true;
  };

  /* =======================================================================
     Section D - constraints and nonsmoothness
     ===================================================================== */

  var D_OVERLAYS = [
    { id: '1/sqrt(k)', label: 'O(1/√k)', dash: [3, 3] },
    { id: '1/k',       label: 'O(1/k)',  dash: [7, 4] },
    { id: '1/k2',      label: 'O(1/k²)', dash: [11, 4] }
  ];

  var Dx = {
    mode: 'constrained',
    setId: 'ball',
    setParams: {},
    lam: 0.2,
    enabled: { proj_grad: true, frank_wolfe: true },
    focus: 'proj_grad',
    opts: {},
    budget: 200,
    speed: 25,
    running: false,
    acc: 0,
    runs: [],
    x0: [-1.3, -1.1],
    cursor: null,
    overlays: {},
    dirty: true, tableDirty: true,
    DP: null, ref: null, P: null, set: null,
    sliders: {}, lamSlider: null, setSliders: [],
    fv: null, chart: null, l1View: null, softView: null
  };

  Dx.init = function () {
    Dx.fv = new Atlas.FieldView($('#d-canvas'), { gridN: 200, levelCount: 16 });
    Dx.fv.overlay = Dx.overlay;
    Dx.chart = new Atlas.Chart($('#d-chart'));
    Dx.l1View = new Atlas.View($('#d-l1'));
    Dx.softView = new Atlas.View($('#d-soft'));
    Dx.softView.uniform = false;
    Dx.opts.alpha = 0.3;

    var sel = $('#d-set');
    Atlas.sets.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      sel.appendChild(o);
    });
    sel.value = Dx.setId;
    sel.addEventListener('change', function () { Dx.setId = sel.value; Dx.rebuildProblem(true); });

    var modeBox = $('#d-mode');
    modeBox.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('.seg-btn') : null;
      if (!btn) return;
      Dx.mode = btn.getAttribute('data-mode');
      var all = modeBox.querySelectorAll('.seg-btn');
      for (var i = 0; i < all.length; i++) all[i].classList.toggle('is-on', all[i] === btn);
      Dx.rebuildProblem(true);
    });

    Dx.sliders = buildHyperPanel({
      container: $('#d-hyper'), category: 'constrained', opts: Dx.opts,
      onChange: function () { Dx.rebuild(); },
      extras: [
        { spec: { id: 'dbudget', label: Atlas.L('Iteration budget', 'Лимит итераций'), min: 20, max: 4000, log: true, integer: true,
                  hint: Atlas.L('Frank-Wolfe and the subgradient method need many more steps than the others.',
                                'Франк–Вульф и субградиентный метод требуют гораздо больше шагов, чем остальные.') },
          get: function () { return Dx.budget; },
          set: function (v) { Dx.budget = Math.round(v); Dx.rebuild(); } },
        { spec: { id: 'dspeed', label: Atlas.L('Animation speed', 'Скорость анимации'), min: 1, max: 500, log: true, integer: true,
                  unit: Atlas.L('it/s', 'ит/с'),
                  hint: Atlas.L('Iterations per second while running.', 'Число итераций в секунду во время запуска.') },
          get: function () { return Dx.speed; },
          set: function (v) { Dx.speed = v; } }
      ]
    });

    $('#d-run').addEventListener('click', function () { Dx.setRunning(true); });
    $('#d-pause').addEventListener('click', function () { Dx.setRunning(false); });
    $('#d-step').addEventListener('click', function () { Dx.setRunning(false); Dx.stepAll(1); });
    $('#d-reset').addEventListener('click', function () { Dx.setRunning(false); Dx.rebuild(); });

    var cv = $('#d-canvas');
    cv.addEventListener('pointermove', function (ev) {
      Dx.cursor = Dx.fv.view.pointer(ev);
      Dx.dirty = true;
    });
    cv.addEventListener('pointerleave', function () { Dx.cursor = null; Dx.dirty = true; });
    cv.addEventListener('pointerdown', function (ev) {
      var p = Dx.fv.view.pointer(ev);
      if (!Dx.fv.view.inside(p)) return;
      Dx.x0 = p;
      Dx.rebuild();
    });

    Dx.rebuildProblem(true);
  };

  Dx.setParamsFor = function (setDef) {
    if (!Dx.setParams[setDef.id]) {
      var o = {};
      (setDef.params || []).forEach(function (s) { o[s.id] = s.def; });
      Dx.setParams[setDef.id] = o;
    }
    return Dx.setParams[setDef.id];
  };

  /* Rebuilds the problem, the reference solution and the method list. */
  Dx.rebuildProblem = function (resetStart) {
    var constrained = Dx.mode === 'constrained';
    Dx.set = constrained ? Atlas.setsById[Dx.setId] : null;
    var sp = Dx.set ? Dx.setParamsFor(Dx.set) : {};
    Dx.DP = Atlas.makeDProblem({ mode: constrained ? 'constrained' : 'composite', lam: Dx.lam });
    Dx.ref = Atlas.referenceSolution(Dx.DP, Dx.set, sp);

    $('#d-set-row').hidden = !constrained;
    $('#d-set-params').hidden = !constrained;
    $('#d-l1-panels').hidden = constrained;
    $('#d-set-note').textContent = Dx.set ? (Dx.set.note || '') : '';

    /* set parameters */
    var spBox = $('#d-set-params');
    clear(spBox);
    Dx.setSliders = [];                 /* kept, so a language switch can relabel them */
    if (constrained && Dx.set.params) {
      Dx.set.params.forEach(function (spec) {
        var sl = makeSlider(spec, sp[spec.id], function (v) {
          sp[spec.id] = v;
          Dx.rebuildProblem(false);
        });
        Dx.setSliders.push(sl);
        spBox.appendChild(sl.root);
      });
    }

    /* lambda */
    var lamBox = $('#d-lam-row');
    clear(lamBox);
    if (!constrained) {
      Dx.lamSlider = makeSlider(
        { id: 'lam', label: Atlas.L('Penalty λ', 'Штраф λ'), min: 0, max: 2.5, step: 0.02, digits: 3,
          hint: Atlas.L('Below about 0.56 both coordinates are nonzero and the rate gap is what you see; above it a coordinate is exactly zero.',
                        'Примерно до 0.56 обе координаты ненулевые и видна разница в скоростях сходимости; выше одна из координат точно равна нулю.') },
        Dx.lam,
        function (v) { Dx.lam = v; Dx.rebuildProblem(false); });
      lamBox.appendChild(Dx.lamSlider.root);
    }

    Dx.fv.setFunction(Dx.DP.fnDef, {});
    if (resetStart) Dx.x0 = constrained ? [-1.3, -1.1] : [-1.4, 1.9];
    Dx.autoAlpha();
    Dx.buildMethods();
    Dx.buildOverlays();
    Dx.rebuild();
  };

  /* Used by the cheat sheet to open this section already configured. */
  Dx.applyPreset = function (cfg) {
    if (cfg.mode) {
      Dx.mode = cfg.mode;
      var btns = $('#d-mode').querySelectorAll('.seg-btn');
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle('is-on', btns[i].getAttribute('data-mode') === cfg.mode);
      }
    }
    if (cfg.setId) { Dx.setId = cfg.setId; $('#d-set').value = cfg.setId; }
    if (cfg.lam !== undefined) Dx.lam = cfg.lam;
    if (cfg.methods) {
      Dx.enabled = {};
      cfg.methods.forEach(function (id) { Dx.enabled[id] = true; });
      Dx.focus = cfg.methods[0];
    }
    if (cfg.overlays) {
      Dx.overlays = {};
      cfg.overlays.forEach(function (id) { Dx.overlays[id] = true; });
    }
    Dx.rebuildProblem(true);
    Dx.setRunning(!!cfg.run);
  };

  Dx.autoAlpha = function () {
    var a = num.clamp(1 / Dx.DP.L, Atlas.hyper.alpha.min, Atlas.hyper.alpha.max);
    Dx.opts.alpha = a;
    if (Dx.sliders.alpha) Dx.sliders.alpha.set(a);
  };

  /* The method list of the current mode.  A language switch draws it again
     from here, without the fallback below that enables methods. */
  Dx.pickerConfig = function () {
    var constrained = Dx.mode === 'constrained';
    return {
      container: $('#d-methods'), card: $('#d-card'), category: 'constrained',
      noteEl: $('#d-mnote'), state: Dx,
      applies: function (m) { return constrained ? !!m.needsSet : !!m.needsProx; },
      refresh: function () { refreshPicker($('#d-methods'), $('#d-count'), Dx); },
      onChange: function () { Dx.rebuild(); }
    };
  };

  Dx.buildMethods = function () {
    var constrained = Dx.mode === 'constrained';
    buildMethodPicker(Dx.pickerConfig());
    /* make sure something is enabled in this mode */
    var any = false;
    Atlas.methodsIn('constrained').forEach(function (m) {
      var ok = constrained ? m.needsSet : m.needsProx;
      if (ok && Dx.enabled[m.id]) any = true;
    });
    if (!any) {
      Atlas.methodsIn('constrained').forEach(function (m) {
        var ok = constrained ? m.needsSet : m.needsProx;
        if (ok) { Dx.enabled[m.id] = true; if (!Dx.focusValid()) Dx.focus = m.id; }
      });
      buildMethodPicker(Dx.pickerConfig());
    }
    refreshPicker($('#d-methods'), $('#d-count'), Dx);
  };

  Dx.focusValid = function () {
    var m = Atlas.methodsById[Dx.focus];
    if (!m) return false;
    return Dx.mode === 'constrained' ? !!m.needsSet : !!m.needsProx;
  };

  Dx.buildOverlays = function () {
    var box = $('#d-overlays');
    clear(box);
    D_OVERLAYS.forEach(function (ov) {
      var lab = el('label', 'check');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!Dx.overlays[ov.id];
      cb.addEventListener('change', function () { Dx.overlays[ov.id] = cb.checked; Dx.dirty = true; });
      lab.appendChild(cb);
      lab.appendChild(el('span', 'dash'));
      lab.appendChild(document.createTextNode(ov.label));
      box.appendChild(lab);
    });
  };

  /* A Run-compatible problem carrying the projection, the oracle and the prox. */
  Dx.makeRunProblem = function () {
    var DP = Dx.DP, set = Dx.set, sp = set ? Dx.setParamsFor(set) : {};
    var P = Atlas.makeProblem(DP.fnDef, {});
    P.fstar = Dx.ref.f;
    P.optima = [Dx.ref.x];
    P.L = DP.L;
    P.mu = DP.mu;
    P.gradSmooth = function (x) { return DP.gradG(x); };
    P.prox = function (x, t) { return DP.prox(x, t); };
    if (set) {
      P.project = function (x) { return set.project(x, sp); };
      P.lmo = function (g) { return set.lmo(g, sp); };
    }
    /* Norm of the gradient mapping: exactly zero at the solution, whether the
       obstruction is a constraint or a kink. */
    var t = 1 / DP.L;
    P.stationarity = function (x) {
      var y = num.axpy(-t, DP.gradG(x), x);
      y = DP.prox(y, t);
      if (set) y = set.project(y, sp);
      return num.dist(x, y) / t;
    };
    return P;
  };

  Dx.rebuild = function () {
    var constrained = Dx.mode === 'constrained';
    Dx.runs = [];
    Atlas.methodsIn('constrained').forEach(function (m) {
      var ok = constrained ? m.needsSet : m.needsProx;
      if (!ok || !Dx.enabled[m.id]) return;
      Dx.runs.push(new Atlas.Run(m, Dx.makeRunProblem(), Dx.opts, Dx.x0, Dx.budget));
    });
    Dx.acc = 0;
    Dx.dirty = true;
    Dx.tableDirty = true;
    Dx.updateStatus();
    Dx.updateKKT();
  };

  Dx.setRunning = function (on) {
    if (on && !Dx.runs.some(function (r) { return r.active(); })) Dx.rebuild();
    Dx.running = on;
    $('#d-run').disabled = on;
    $('#d-pause').disabled = !on;
  };

  Dx.stepAll = function (n) {
    var moved = false;
    for (var s = 0; s < n; s++) {
      var any = false;
      for (var i = 0; i < Dx.runs.length; i++) {
        if (Dx.runs[i].active()) { Dx.runs[i].step(); any = true; moved = true; }
      }
      if (!any) break;
    }
    if (moved) { Dx.dirty = true; Dx.tableDirty = true; }
    if (!Dx.runs.some(function (r) { return r.active(); })) Dx.setRunning(false);
  };

  /* ---- KKT ---------------------------------------------------------------- */

  Dx.updateKKT = function () {
    var box = $('#d-kkt');
    clear(box);
    if (Dx.mode !== 'constrained' || !Dx.set) return;
    var sp = Dx.setParamsFor(Dx.set);
    var xs = Dx.ref.x;
    var cons = Dx.set.constraints(sp);
    var active = [];
    cons.forEach(function (cc) {
      if (Math.abs(cc.c(xs)) < 1e-6) active.push(cc);
    });
    var mg = num.scale(Dx.DP.gradG(xs), -1);        /* −∇f at the optimum */
    Dx.kkt = { x: xs, mgrad: mg, active: active, lambdas: [], residual: null };

    box.appendChild(el('h5', null, Atlas.t('KKT at the optimum', 'Условия ККТ в оптимуме')));
    function row(k, v, cls) {
      var r = el('div', 'row');
      r.appendChild(el('span', null, k));
      r.appendChild(el('span', cls || null, v));
      box.appendChild(r);
    }
    row('x*', num.fmtVec(xs, 4));
    row('−∇f(x*)', num.fmtVec(mg, 4));

    if (!active.length) {
      row(Atlas.t('active constraints', 'активные ограничения'),
          Atlas.t('none — the optimum is interior', 'нет — оптимум внутри множества'));
      row(Atlas.t('condition', 'условие'), '∇f(x*) = 0', 'verdict-ok');
      return;
    }
    var G = active.map(function (cc) { return cc.grad(xs); });
    var lam = null;
    if (G.length === 1) {
      var d = num.dot(G[0], G[0]);
      lam = d > 1e-14 ? [num.dot(mg, G[0]) / d] : [0];
    } else {
      /* two active gradients span the plane: solve exactly */
      lam = num.solve([[G[0][0], G[1][0]], [G[0][1], G[1][1]]], mg);
      if (!lam) lam = [0, 0];
      G = G.slice(0, 2);
      active = active.slice(0, 2);
    }
    var recon = [0, 0], i;
    for (i = 0; i < G.length; i++) { recon[0] += lam[i] * G[i][0]; recon[1] += lam[i] * G[i][1]; }
    var res = num.dist(recon, mg);
    Dx.kkt.lambdas = lam;
    Dx.kkt.active = active;
    Dx.kkt.residual = res;

    for (i = 0; i < active.length; i++) {
      row(Atlas.t('λ for ' + active[i].name, 'λ (' + active[i].name + ')'),
          num.fmt(lam[i], 4), lam[i] >= -1e-8 ? 'verdict-ok' : 'verdict-bad');
    }
    row('‖−∇f − Σλᵢ∇cᵢ‖', num.fmt(res, 6), res < 1e-4 ? 'verdict-ok' : 'verdict-bad');
    var allNonNeg = lam.every(function (v) { return v >= -1e-8; });
    row(Atlas.t('condition', 'условие'), allNonNeg && res < 1e-4
      ? Atlas.t('−∇f is a nonnegative combination of the active gradients',
                '−∇f — неотрицательная комбинация градиентов активных ограничений')
      : Atlas.t('not satisfied at this accuracy', 'не выполнено с такой точностью'),
      allNonNeg && res < 1e-4 ? 'verdict-ok' : 'verdict-bad');
  };

  /* ---- drawing ------------------------------------------------------------ */

  Dx.overlay = function (view, ctx) {
    var C = Atlas.theme.colors();
    var constrained = Dx.mode === 'constrained';
    var sp = Dx.set ? Dx.setParamsFor(Dx.set) : {};
    var i, s;

    /* the feasible set */
    if (Dx.set) {
      var loops = Dx.set.boundary(sp);
      ctx.save();
      loops.forEach(function (loop) {
        ctx.beginPath();
        loop.forEach(function (p, j) {
          var q = view.toScreen(p);
          if (j === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
        });
        ctx.closePath();
        ctx.fillStyle = C.accent;
        ctx.globalAlpha = 0.13;
        ctx.fill();
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.restore();
    }

    /* kinks of the L1 penalty */
    if (!constrained) {
      ctx.save();
      ctx.strokeStyle = C.muted;
      ctx.globalAlpha = 0.55;
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(view.sx(0), 0); ctx.lineTo(view.sx(0), view.h);
      ctx.moveTo(0, view.sy(0)); ctx.lineTo(view.w, view.sy(0));
      ctx.stroke();
      ctx.restore();
    }

    /* the reference optimum */
    var so = view.toScreen(Dx.ref.x);
    draw.cross(ctx, so[0], so[1], 8, C.fg, 1.8);
    draw.label(ctx, 'x*', so[0] + 10, so[1] - 5, { color: C.fg, box: C.panel, boxAlpha: 0.7 });

    /* trajectories, plus what each method draws for itself */
    for (i = 0; i < Dx.runs.length; i++) {
      var r = Dx.runs[i];
      var last = drawPath(view, ctx, r.traj, r.color, { width: 1.8, maxDots: 150 });
      if (!last) continue;
      if (r.method.id === 'frank_wolfe' && r.state && r.state.vertex) {
        var v = view.toScreen(r.state.vertex);
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(last[0], last[1]); ctx.lineTo(v[0], v[1]);
        ctx.stroke();
        ctx.restore();
        draw.diamond(ctx, v[0], v[1], 5, r.color, C.panel);
        draw.label(ctx, Atlas.t('LMO vertex', 'вершина LMO'), v[0] + 8, v[1] - 6,
                   { color: r.color, box: C.panel, boxAlpha: 0.75 });
      }
      if (r.status === 'converged') draw.star(ctx, last[0], last[1], 7, r.color, C.panel);
    }

    /* projection of the point under the cursor */
    if (constrained && Dx.cursor && view.inside(Dx.cursor)) {
      var p0 = Dx.cursor, p1 = Dx.set.project(p0, sp);
      var a = view.toScreen(p0), b = view.toScreen(p1);
      draw.dot(ctx, a[0], a[1], 3.4, C.fg);
      if (num.dist(p0, p1) > 1e-9) {
        draw.arrow(ctx, a[0], a[1], b[0], b[1], C.fg, 1.6, 8);
        draw.dot(ctx, b[0], b[1], 3.4, C.accent);
        draw.label(ctx, Atlas.t('P(x), distance ', 'P(x), расстояние ') + num.fmt(num.dist(p0, p1), 3),
                   a[0] + 9, a[1] - 8, { color: C.fg, box: C.panel, boxAlpha: 0.8 });
      } else {
        draw.label(ctx, Atlas.t('already feasible', 'точка уже допустима'), a[0] + 9, a[1] - 8,
                   { color: C.muted, box: C.panel, boxAlpha: 0.8 });
      }
    }

    /* KKT arrows at the optimum */
    if (constrained && Dx.kkt && Dx.kkt.active && Dx.kkt.active.length) {
      var scale = Math.min(90, view.w * 0.22);
      var mg = Dx.kkt.mgrad;
      var nmg = num.norm(mg) || 1;
      draw.arrow(ctx, so[0], so[1],
                 so[0] + mg[0] / nmg * scale, so[1] - mg[1] / nmg * scale,
                 C.bad, 2.4, 10);
      draw.label(ctx, '−∇f', so[0] + mg[0] / nmg * scale + 6, so[1] - mg[1] / nmg * scale,
                 { color: C.bad, box: C.panel, boxAlpha: 0.8 });
      for (i = 0; i < Dx.kkt.active.length; i++) {
        var gc = Dx.kkt.active[i].grad(Dx.ref.x);
        var ng = num.norm(gc) || 1;
        draw.arrow(ctx, so[0], so[1],
                   so[0] + gc[0] / ng * scale * 0.72, so[1] - gc[1] / ng * scale * 0.72,
                   C.accent, 1.8, 9);
        draw.label(ctx, '∇c' + (i + 1),
                   so[0] + gc[0] / ng * scale * 0.72 + 6, so[1] - gc[1] / ng * scale * 0.72 + 10,
                   { color: C.accent, box: C.panel, boxAlpha: 0.8 });
      }
    }

    var s0 = view.toScreen(Dx.x0);
    draw.ring(ctx, s0[0], s0[1], 5.5, C.fg, 1.8, C.panel);
  };

  /* ---- the L1 widgets ----------------------------------------------------- */

  Dx.drawL1 = function () {
    var v = Dx.l1View;
    v.resize();
    if (!v.w || !v.h) return;
    var ctx = v.ctx, C = Atlas.theme.colors();
    ctx.clearRect(0, 0, v.w, v.h);
    var DP = Dx.DP;
    v.setDomain({ x0: -0.6, x1: 2.5, y0: -0.6, y1: 2.1 });

    var xl1 = Dx.ref.x;
    /* ridge solution of the same problem: (A + λI)x = Ac */
    var A = DP.A, c = DP.c;
    var Ac = num.matVec(A, c);
    var xl2 = num.solve([[A[0][0] + Dx.lam, A[0][1]], [A[1][0], A[1][1] + Dx.lam]], Ac) || [0, 0];

    /* a few contours of the smooth part through each solution */
    ctx.save();
    ctx.lineWidth = 1;
    [xl1, xl2].forEach(function (xx, idx) {
      var lev = DP.g(xx);
      if (!(lev > 0)) return;
      ctx.beginPath();
      for (var i = 0; i <= 160; i++) {
        var th = i / 160 * 2 * Math.PI;
        /* level set of ½dᵀAd = lev along direction th */
        var d = [Math.cos(th), Math.sin(th)];
        var q = 0.5 * (A[0][0] * d[0] * d[0] + 2 * A[0][1] * d[0] * d[1] + A[1][1] * d[1] * d[1]);
        var rr = Math.sqrt(lev / q);
        var p = v.toScreen([c[0] + rr * d[0], c[1] + rr * d[1]]);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
      ctx.strokeStyle = idx === 0 ? Atlas.palette.teal : Atlas.palette.orange;
      ctx.globalAlpha = 0.75;
      ctx.stroke();
    });
    ctx.restore();

    /* the two penalty balls that touch those contours */
    function ball(kind, radius, color) {
      ctx.save();
      ctx.beginPath();
      if (kind === 'l1') {
        var pts = [[radius, 0], [0, radius], [-radius, 0], [0, -radius]];
        pts.forEach(function (p, j) {
          var q = v.toScreen(p);
          if (j === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
        });
        ctx.closePath();
      } else {
        var q0 = v.toScreen([0, 0]);
        ctx.arc(q0[0], q0[1], radius * v.scale, 0, 2 * Math.PI);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.9;
      ctx.stroke();
      ctx.globalAlpha = 0.10;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }
    ball('l1', Math.abs(xl1[0]) + Math.abs(xl1[1]), Atlas.palette.teal);
    ball('l2', num.norm(xl2), Atlas.palette.orange);

    /* axes */
    ctx.save();
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.moveTo(v.sx(-0.55), v.sy(0)); ctx.lineTo(v.sx(2.45), v.sy(0));
    ctx.moveTo(v.sx(0), v.sy(-0.55)); ctx.lineTo(v.sx(0), v.sy(2.05));
    ctx.stroke();
    ctx.restore();

    var a1 = v.toScreen(xl1), a2 = v.toScreen(xl2), ac = v.toScreen(c);
    draw.cross(ctx, ac[0], ac[1], 6, C.muted, 1.4);
    draw.label(ctx, Atlas.t('unpenalised', 'без штрафа'), ac[0] + 8, ac[1] - 5, { color: C.muted, box: C.panel, boxAlpha: 0.7 });
    draw.dot(ctx, a2[0], a2[1], 5, Atlas.palette.orange);
    draw.label(ctx, 'L2', a2[0] + 8, a2[1] + 12, { color: Atlas.palette.orange, box: C.panel, boxAlpha: 0.8 });
    draw.dot(ctx, a1[0], a1[1], 5.5, Atlas.palette.teal);
    draw.label(ctx, 'L1', a1[0] + 8, a1[1] - 6, { color: Atlas.palette.teal, box: C.panel, boxAlpha: 0.8 });

    var zeros = (Math.abs(xl1[0]) < 1e-9 ? 1 : 0) + (Math.abs(xl1[1]) < 1e-9 ? 1 : 0);
    $('#d-l1-note').innerHTML = Atlas.t(
      'L1 solution <b>' + num.fmtVec(xl1, 4) + '</b> · L2 solution <b>' + num.fmtVec(xl2, 4) + '</b> · ' +
      (zeros ? '<b>' + zeros + '</b> coordinate' + (zeros > 1 ? 's are' : ' is') + ' exactly zero — the touching point is a corner of the diamond'
             : 'no coordinate is zero yet; raise λ until the contour first touches a corner'),
      'Решение с L1 <b>' + num.fmtVec(xl1, 4) + '</b> · решение с L2 <b>' + num.fmtVec(xl2, 4) + '</b> · ' +
      (zeros ? '<b>' + zeros + '</b> ' +
               Atlas.ruPlural(zeros, 'координата точно равна', 'координаты точно равны', 'координат точно равны') +
               ' нулю — точка касания лежит в вершине ромба'
             : 'пока ни одна координата не равна нулю; увеличивайте λ, пока линия уровня не коснётся вершины ромба'));
  };

  Dx.drawSoft = function () {
    var v = Dx.softView;
    v.resize();
    if (!v.w || !v.h) return;
    var ctx = v.ctx, C = Atlas.theme.colors();
    ctx.clearRect(0, 0, v.w, v.h);
    var R = 2.2, lam = Dx.lam;
    var m = { l: 30, r: 10, t: 10, b: 22 };
    var W = v.w - m.l - m.r, H = v.h - m.t - m.b;
    if (W < 20 || H < 20) return;
    function X(x) { return m.l + (x + R) / (2 * R) * W; }
    function Y(y) { return m.t + (R - y) / (2 * R) * H; }

    ctx.save();
    ctx.strokeStyle = C.lineSoft;
    ctx.beginPath();
    ctx.moveTo(X(-R), Y(0)); ctx.lineTo(X(R), Y(0));
    ctx.moveTo(X(0), Y(-R)); ctx.lineTo(X(0), Y(R));
    ctx.stroke();
    /* identity */
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = C.muted;
    ctx.beginPath(); ctx.moveTo(X(-R), Y(-R)); ctx.lineTo(X(R), Y(R)); ctx.stroke();
    ctx.setLineDash([]);
    /* soft threshold */
    ctx.beginPath();
    for (var i = 0; i <= 200; i++) {
      var x = -R + 2 * R * i / 200;
      var y = num.sign(x) * Math.max(Math.abs(x) - lam, 0);
      if (i === 0) ctx.moveTo(X(x), Y(y)); else ctx.lineTo(X(x), Y(y));
    }
    ctx.strokeStyle = Atlas.palette.teal;
    ctx.lineWidth = 2.2;
    ctx.stroke();
    /* the dead zone */
    ctx.fillStyle = Atlas.palette.teal;
    ctx.globalAlpha = 0.12;
    ctx.fillRect(X(-lam), m.t, X(lam) - X(-lam), H);
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.muted;
    ctx.font = '10.5px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('−λ', X(-lam), m.t + H + 12);
    ctx.fillText('λ', X(lam), m.t + H + 12);
    ctx.restore();
    $('#d-soft-note').innerHTML = Atlas.t(
      'prox<sub>λ|·|</sub>(z) = sign(z)·max(|z|−λ, 0) with λ = <b>' + num.fmt(lam, 3) +
      '</b>: everything inside the shaded band is mapped to exactly zero.',
      'prox<sub>λ|·|</sub>(z) = sign(z)·max(|z|−λ, 0) при λ = <b>' + num.fmt(lam, 3) +
      '</b>: всё, что попадает в закрашенную полосу, отображается точно в нуль.');
  };

  /* ---- section D rendering ------------------------------------------------ */

  Dx.renderChart = function () {
    var C = Atlas.theme.colors();
    var series = Dx.runs.map(function (r) {
      return { name: r.method.name, color: r.color, values: r.chartValues() };
    });
    var shown = 0;
    var gap0 = Dx.DP.f(Dx.x0) - Dx.ref.f;
    if (gap0 > 0 && isFinite(gap0)) {
      var n = 2;
      Dx.runs.forEach(function (r) { if (r.traj.length > n) n = r.traj.length; });
      if (n < 3) n = Math.min(Dx.budget, 400) + 1;
      D_OVERLAYS.forEach(function (ov) {
        if (!Dx.overlays[ov.id]) return;
        shown++;
        series.push({ color: C.muted, dash: ov.dash, width: 1.2, label: ov.label,
                      values: Atlas.rateCurve(ov.id, Math.min(n, 4000), gap0, 1) });
      });
    }
    Dx.chart.render({
      series: series,
      yLabel: 'f(xₖ) − f*',
      xLabel: Atlas.t('iteration k', 'итерация k'),
      empty: Atlas.t('enable a method and press Run', 'включите метод и нажмите «Запуск»')
    });
    $('#d-chart-sub').textContent =
      'f* = ' + num.fmt(Dx.ref.f, 8) + Atlas.t(' from a reference solve', ' по эталонному решению') +
      (shown ? Atlas.t('. Dashed: theoretical shapes anchored at the initial gap',
                       '. Пунктир — теоретические кривые, привязанные к начальному значению f − f*') : '');
  };

  Dx.renderTable = function () {
    var tbody = $('#d-runs').querySelector('tbody');
    clear(tbody);
    if (!Dx.runs.length) {
      var tr0 = el('tr');
      var td0 = el('td', null, Atlas.t('No method enabled.', 'Нет включённых методов.'));
      td0.colSpan = 6;
      tr0.appendChild(td0);
      tbody.appendChild(tr0);
      return;
    }
    Dx.runs.forEach(function (r) {
      var tr = el('tr');
      var name = el('td');
      var sw = el('span', 'swatch');
      sw.style.background = r.color;
      name.appendChild(sw);
      name.appendChild(document.createTextNode(r.method.name));
      tr.appendChild(name);
      function cell(t) { tr.appendChild(el('td', 'num', t)); }
      cell(String(r.k));
      cell(num.fmt(r.fs[r.fs.length - 1], 5));
      cell(num.fmt(r.fs[r.fs.length - 1] - r.problem.fstar, 3));
      cell(num.fmt(r.gs[r.gs.length - 1], 3));
      var st = el('td', 'state-' + r.status);
      st.textContent = r.status === 'ready' ? statusWord('ready')
        : r.status === 'running' ? (statusWord('running') + ' — ' + (r.info || ''))
        : statusWord(r.status) + detail(r.message);
      tr.appendChild(st);
      tbody.appendChild(tr);
    });
  };

  Dx.updateStatus = function () {
    var bar = $('#d-status');
    clear(bar);
    function item(k, v) {
      var span = el('span');
      span.appendChild(el('b', null, k + ' '));
      span.appendChild(el('span', 'mono', v));
      bar.appendChild(span);
    }
    var its = Dx.ref.iterations;
    item(Atlas.t('objective', 'целевая функция'), Dx.mode === 'constrained'
      ? Atlas.t('min ½(x−c)ᵀA(x−c) over C', 'min ½(x−c)ᵀA(x−c) на C')
      : 'min ½(x−c)ᵀA(x−c) + λ‖x‖₁, λ = ' + num.fmt(Dx.lam, 3));
    item(Atlas.t('smooth part', 'гладкая часть'), 'L = ' + num.fmt(Dx.DP.L, 3) + ', μ = ' + num.fmt(Dx.DP.mu, 3) +
      ', κ = ' + num.fmt(Dx.DP.L / Dx.DP.mu, 3) +
      (Dx.mode === 'composite'
        ? Atlas.t(' — ill-conditioned on purpose, so the O(1/k) and O(1/k²) transients are visible',
                  ' — намеренно плохо обусловлена, чтобы были видны переходные участки O(1/k) и O(1/k²)')
        : ''));
    item('x*', num.fmtVec(Dx.ref.x, 5) +
      Atlas.t(' (reference, ' + its + ' iterations)',
              ' (эталон, ' + its + ' ' + Atlas.ruPlural(its, 'итерация', 'итерации', 'итераций') + ')'));
    item(Atlas.t('start', 'начальная точка'), num.fmtVec(Dx.x0, 3));
    $('#d-tag').textContent = Dx.mode === 'constrained'
      ? Atlas.t('hover to project a point, click to move the start',
                'наведите курсор, чтобы увидеть проекцию точки; щёлкните, чтобы перенести начальную точку')
      : Atlas.t('dashed lines are the kinks of ‖x‖₁', 'пунктир — линии излома ‖x‖₁');
  };

  Dx.frame = function (dt) {
    if (Dx.running) {
      Dx.acc += dt * Dx.speed;
      var steps = Math.floor(Dx.acc);
      if (steps > 0) { Dx.acc -= steps; Dx.stepAll(Math.min(steps, 400)); }
    }
    if (Dx.dirty) {
      Dx.fv.render();
      if (Dx.mode === 'composite') { Dx.drawL1(); Dx.drawSoft(); }
      Dx.renderChart();
      Dx.dirty = false;
    }
    if (Dx.tableDirty) { Dx.renderTable(); Dx.tableDirty = false; }
  };

  Dx.onShow = function () { Dx.dirty = true; Dx.tableDirty = true; };

  /* Language switch: re-render every text this section wrote, keep its runs.
     Nothing here rebuilds the problem or the runs; the KKT panel is only
     recomputed from the reference solution it already shows. */
  Dx.relabel = function () {
    relabelOptions($('#d-set'), function (id) { return Atlas.setsById[id]; });
    $('#d-set-note').textContent = Dx.set ? (Dx.set.note || '') : '';
    relabelSliders(Dx.setSliders);
    if (Dx.lamSlider) Dx.lamSlider.relabel();
    relabelSliders(Dx.sliders);         /* ' Used by' is a function, the extras bilingual texts */
    buildMethodPicker(Dx.pickerConfig());   /* rows, 'Not applicable here' and card */
    refreshPicker($('#d-methods'), $('#d-count'), Dx);
    Dx.updateKKT();
    Dx.updateStatus();
    Dx.dirty = true;                    /* chart, canvas labels, L1 and prox notes */
    Dx.tableDirty = true;
  };

  /* =======================================================================
     Boot
     ===================================================================== */

  function visible(id) {
    var s = document.getElementById(id);
    return s && !s.hidden;
  }

  function boot() {
    sections['sec-A'] = A;
    sections['sec-B'] = B;
    sections['sec-C'] = Cx;
    sections['sec-D'] = Dx;
    sections['sec-E'] = Atlas.discrete || {};
    sections['sec-F'] = Atlas.cheatsheet || {};

    initShell();
    A.init();
    B.init();
    B.setRunning(false);
    Cx.init();
    Dx.init();
    if (Atlas.discrete) Atlas.discrete.init();
    if (Atlas.cheatsheet) Atlas.cheatsheet.init();
    /* an old #/C link first, then the section open before a reload */
    var start = sectionFromHash();
    if (!start) { try { start = window.sessionStorage.getItem(SECTION_KEY); } catch (e) { start = null; } }
    if (!start || !sections[start]) start = 'sec-A';
    showSection(start, 'replace');                 /* this also cleans the address */
    window.addEventListener('popstate', function (ev) {
      var id = ev.state && ev.state.section;
      if (id && sections[id] && id !== currentSection) showSection(id, 'none');
    });
    /* Anything typed after the address in this very tab: an old #/C/ru link
       is honoured (Atlas.i18n reads its language), any fragment is removed. */
    window.addEventListener('hashchange', function () {
      var lang = Atlas.i18n.fromHash(window.location.hash);
      if (lang) Atlas.i18n.set(lang);
      showSection(sectionFromHash() || currentSection, 'replace');
    });

    Atlas.loop.add(function (dt) {
      if (visible('sec-A')) A.frame(dt);
      if (visible('sec-B')) B.frame(dt);
      if (visible('sec-C')) Cx.frame(dt);
      if (visible('sec-D')) Dx.frame(dt);
      if (Atlas.discrete && visible('sec-E')) Atlas.discrete.frame(dt);
    });

    /* Published so that later sections can drive the playground: the cheat
       sheet in section F jumps to a widget with a preset already applied. */
    Atlas.ui = { A: A, B: B, C: Cx, D: Dx, E: Atlas.discrete,
                 showSection: showSection, applyPreset: B.applyPreset };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
