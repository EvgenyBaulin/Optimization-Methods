/* ==========================================================================
   Optimization Atlas - core.js
   Registries, small numeric library, line searches, canvas engine,
   contour renderer, convergence chart, shared animation loop, run driver.

   Loaded as a classic script (no modules, so file:// works).  Everything
   public hangs off the single global object window.Atlas.
   ========================================================================== */
(function () {
  'use strict';

  var Atlas = window.Atlas || (window.Atlas = {});

  /* =======================================================================
     0.  Registries
     Adding a test function or a method means calling one of these with one
     object.  Nothing else in the code has to change.
     ===================================================================== */

  Atlas.functions = [];
  Atlas.functionsById = {};
  Atlas.methods = [];
  Atlas.methodsById = {};

  Atlas.registerFunction = function (def) {
    if (Atlas.functionsById[def.id]) throw new Error('duplicate function id: ' + def.id);
    Atlas.functions.push(def);
    Atlas.functionsById[def.id] = def;
    return def;
  };

  Atlas.registerMethod = function (def) {
    if (Atlas.methodsById[def.id]) throw new Error('duplicate method id: ' + def.id);
    def.category = def.category || 'continuous';
    def.uses = def.uses || [];
    Atlas.methods.push(def);
    Atlas.methodsById[def.id] = def;
    return def;
  };

  Atlas.methodsIn = function (category) {
    return Atlas.methods.filter(function (m) { return m.category === category; });
  };

  /* Hyperparameters that methods may declare in `uses`.  The panel renders a
     slider for a hyperparameter only if some registered method asks for it,
     so there are never controls without an effect. */
  Atlas.hyper = {
    alpha: { id: 'alpha', label: Atlas.L('Step size α', 'Шаг α'), min: 1e-5, max: 10, log: true, def: 0.1,
             hint: Atlas.L('Fixed step length. Above 2/L gradient descent diverges.',
                           'Постоянная длина шага. При шаге больше 2/L градиентный спуск расходится.') },
    beta:  { id: 'beta',  label: Atlas.L('Momentum β', 'Импульс β'), min: 0, max: 0.995, step: 0.005, def: 0.9,
             hint: Atlas.L('Fraction of the previous step that is carried over.',
                           'Доля предыдущего шага, которая переносится в текущий.') },
    mem:   { id: 'mem',   label: Atlas.L('L-BFGS memory m', 'Память m (L-BFGS)'), min: 1, max: 20, step: 1, def: 5, integer: true,
             hint: Atlas.L('Number of stored (s, y) pairs.', 'Число хранимых пар (s, y).') },
    tau:   { id: 'tau',   label: Atlas.L('LM damping τ', 'Демпфирование τ (Левенберг–Марквардт)'), min: 1e-4, max: 100, log: true, def: 1,
             hint: Atlas.L('Initial damping of the Levenberg-Marquardt system.',
                           'Начальное демпфирование в системе Левенберга–Марквардта.') },
    /* section C */
    lr:    { id: 'lr',    label: Atlas.L('Step size', 'Шаг'), min: 1e-4, max: 2, log: true, def: 0.08,
             hint: Atlas.L('Base step size, before the schedule multiplies it.',
                           'Базовый шаг, который затем умножается на расписание.') },
    batch: { id: 'batch', label: Atlas.L('Batch size b', 'Размер батча b'), min: 1, max: 200, step: 1, def: 16, integer: true,
             hint: Atlas.L('Samples averaged per update. The noise ball shrinks like √(1/b).',
                           'Число объектов, усредняемых за одно обновление. Шар шума сжимается как √(1/b).') },
    beta1: { id: 'beta1', label: Atlas.L('β₁ (momentum)', 'β₁ (импульс)'), min: 0, max: 0.99, step: 0.01, def: 0.9,
             hint: Atlas.L('Decay of the first moment.', 'Затухание первого момента.') },
    beta2: { id: 'beta2', label: Atlas.L('β₂ (second moment)', 'β₂ (второй момент)'), min: 0.8, max: 0.9999, step: 0.0001, def: 0.999,
             hint: Atlas.L('Decay of the squared-gradient average.', 'Затухание среднего квадрата градиента.') },
    wd:    { id: 'wd',    label: Atlas.L('Weight decay', 'Затухание весов'), min: 0, max: 0.2, step: 0.002, def: 0.03,
             hint: Atlas.L('Adam folds it into the gradient; AdamW applies it separately.',
                           'Adam добавляет его к градиенту, а AdamW применяет отдельно.') }
  };

  /* =======================================================================
     1.  Numeric helpers
     ===================================================================== */

  var num = {};
  Atlas.num = num;

  num.zeros = function (n) { var v = new Array(n); for (var i = 0; i < n; i++) v[i] = 0; return v; };
  num.add   = function (a, b) { var r = new Array(a.length); for (var i = 0; i < a.length; i++) r[i] = a[i] + b[i]; return r; };
  num.sub   = function (a, b) { var r = new Array(a.length); for (var i = 0; i < a.length; i++) r[i] = a[i] - b[i]; return r; };
  num.scale = function (a, s) { var r = new Array(a.length); for (var i = 0; i < a.length; i++) r[i] = a[i] * s; return r; };
  /* x + t*d */
  num.axpy  = function (t, d, x) { var r = new Array(x.length); for (var i = 0; i < x.length; i++) r[i] = x[i] + t * d[i]; return r; };
  num.dot   = function (a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  num.norm  = function (a) { return Math.sqrt(num.dot(a, a)); };
  num.dist  = function (a, b) { var s = 0; for (var i = 0; i < a.length; i++) { var d = a[i] - b[i]; s += d * d; } return Math.sqrt(s); };
  num.finite = function (a) {
    for (var i = 0; i < a.length; i++) if (!isFinite(a[i])) return false;
    return true;
  };

  /* A is an array of rows. */
  num.matVec = function (A, x) {
    var n = A.length, r = new Array(n);
    for (var i = 0; i < n; i++) { var s = 0, Ai = A[i]; for (var j = 0; j < Ai.length; j++) s += Ai[j] * x[j]; r[i] = s; }
    return r;
  };
  /* 2x2 matrix product, used by the noise-covariance algebra in section C. */
  num.matMul2 = function (A, B) {
    return [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
            [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
  };

  num.matAdd = function (A, B) {
    return A.map(function (row, i) { return row.map(function (v, j) { return v + B[i][j]; }); });
  };
  num.matScale = function (A, s) {
    return A.map(function (row) { return row.map(function (v) { return v * s; }); });
  };
  num.eye = function (n, s) {
    s = (s === undefined) ? 1 : s;
    var A = [];
    for (var i = 0; i < n; i++) { A.push(num.zeros(n)); A[i][i] = s; }
    return A;
  };
  num.outer = function (a, b) {
    return a.map(function (ai) { return b.map(function (bj) { return ai * bj; }); });
  };

  /* Direct solve of A y = b by Gaussian elimination with partial pivoting.
     Used for 2x2 and 3x3 Newton / Levenberg-Marquardt systems.
     Returns null when the matrix is numerically singular. */
  num.solve = function (A, b) {
    var n = b.length, i, j, k;
    var M = new Array(n);
    for (i = 0; i < n; i++) { M[i] = A[i].slice(); M[i].push(b[i]); }
    for (k = 0; k < n; k++) {
      var piv = k, best = Math.abs(M[k][k]);
      for (i = k + 1; i < n; i++) { var v = Math.abs(M[i][k]); if (v > best) { best = v; piv = i; } }
      if (!(best > 1e-14)) return null;
      if (piv !== k) { var t = M[k]; M[k] = M[piv]; M[piv] = t; }
      var akk = M[k][k];
      for (i = k + 1; i < n; i++) {
        var f = M[i][k] / akk;
        if (f === 0) continue;
        for (j = k; j <= n; j++) M[i][j] -= f * M[k][j];
      }
    }
    var y = num.zeros(n);
    for (i = n - 1; i >= 0; i--) {
      var s = M[i][n];
      for (j = i + 1; j < n; j++) s -= M[i][j] * y[j];
      y[i] = s / M[i][i];
    }
    return num.finite(y) ? y : null;
  };

  /* Closed-form eigen-decomposition of a symmetric 2x2 matrix
     H = [[a,b],[b,c]].  Returns eigenvalues sorted lo <= hi with vectors. */
  num.eigSym2 = function (H) {
    var a = H[0][0], b = H[0][1], c = H[1][1];
    var mid = 0.5 * (a + c);
    var r = Math.sqrt(0.25 * (a - c) * (a - c) + b * b);
    var lo = mid - r, hi = mid + r;
    var vlo, vhi;
    if (Math.abs(b) > 1e-14) {
      vlo = normalize2([b, lo - a]);
      vhi = normalize2([b, hi - a]);
    } else {
      vlo = (a <= c) ? [1, 0] : [0, 1];
      vhi = (a <= c) ? [0, 1] : [1, 0];
    }
    return { lo: lo, hi: hi, vlo: vlo, vhi: vhi };
  };

  function normalize2(v) {
    var n = Math.hypot(v[0], v[1]);
    return n > 1e-300 ? [v[0] / n, v[1] / n] : [1, 0];
  }
  num.normalize2 = normalize2;

  num.clamp = function (v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); };
  num.sign  = function (v) { return v > 0 ? 1 : (v < 0 ? -1 : 0); };

  /* Compact number formatting for the readouts. */
  num.fmt = function (x, digits) {
    if (x === null || x === undefined || !isFinite(x)) return '—';
    digits = (digits === undefined) ? 3 : digits;
    var a = Math.abs(x);
    if (x === 0) return '0';
    if (a >= 1e5 || a < 1e-3) return x.toExponential(2).replace('e+', 'e');
    var s = x.toFixed(digits);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s;
  };
  num.fmtVec = function (v, digits) {
    return '(' + v.map(function (c) { return num.fmt(c, digits === undefined ? 3 : digits); }).join(', ') + ')';
  };

  /* Seeded pseudo-random generator (mulberry32).  Everything random in the
     atlas goes through this, so a demonstration always looks the same and two
     optimizers race on identical data. */
  Atlas.rng = function (seed) {
    var s = seed >>> 0, spare = null;
    var r = {
      next: function () {
        s = (s + 0x6D2B79F5) | 0;
        var t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      int: function (n) { return Math.min(n - 1, Math.floor(r.next() * n)); },
      normal: function () {                              /* Box-Muller */
        if (spare !== null) { var v = spare; spare = null; return v; }
        var u, w, q;
        do { u = 2 * r.next() - 1; w = 2 * r.next() - 1; q = u * u + w * w; }
        while (q >= 1 || q === 0);
        var f = Math.sqrt(-2 * Math.log(q) / q);
        spare = w * f;
        return u * f;
      }
    };
    return r;
  };

  /* Solves the discrete Lyapunov equation  S = M S Mᵀ + Q  for symmetric 2x2.
     Section C uses it to predict the radius of the SGD noise ball exactly
     instead of only measuring it. */
  Atlas.lyapunov2 = function (M, Q) {
    var a = M[0][0], b = M[0][1], c = M[1][0], d = M[1][1];
    /* rows act on [s11, s12, s22] */
    var T = [[a * a,     2 * a * b,         b * b],
             [a * c, b * c + a * d,         b * d],
             [c * c,     2 * c * d,         d * d]];
    var A = [], i, j;
    for (i = 0; i < 3; i++) {
      A.push([]);
      for (j = 0; j < 3; j++) A[i].push((i === j ? 1 : 0) - T[i][j]);
    }
    var sol = num.solve(A, [Q[0][0], Q[0][1], Q[1][1]]);
    if (!sol) return null;
    return [[sol[0], sol[1]], [sol[1], sol[2]]];
  };

  /* Slider position (0..1) <-> value, on a logarithmic axis. */
  Atlas.logMap = function (min, max) {
    var lo = Math.log(min), hi = Math.log(max);
    return {
      toValue: function (p) { return Math.exp(lo + num.clamp(p, 0, 1) * (hi - lo)); },
      toPos:   function (v) { return num.clamp((Math.log(v) - lo) / (hi - lo), 0, 1); }
    };
  };

  /* =======================================================================
     2.  Line searches
     Both only use f and the gradient, never a Hessian, so quasi-Newton and
     conjugate-gradient methods can share them.
     ===================================================================== */

  Atlas.lineSearch = {};

  /* Armijo backtracking.  Returns {ok, t, x, f, evals}. */
  Atlas.lineSearch.armijo = function (P, x, f0, g0, d, t0, opt) {
    opt = opt || {};
    var c1 = opt.c1 || 1e-4, rho = opt.rho || 0.5, maxIt = opt.maxIt || 60;
    var dphi0 = num.dot(g0, d);
    if (!(dphi0 < 0)) {                       /* not a descent direction: fall back */
      d = num.scale(g0, -1);
      dphi0 = -num.dot(g0, g0);
      if (!(dphi0 < 0)) return { ok: false, t: 0, x: x.slice(), f: f0, evals: 0, d: d };
    }
    var t = (t0 > 0 && isFinite(t0)) ? t0 : 1, evals = 0;
    for (var i = 0; i < maxIt; i++) {
      var xt = num.axpy(t, d, x);
      var ft = P.f(xt); evals++;
      if (isFinite(ft) && ft <= f0 + c1 * t * dphi0) return { ok: true, t: t, x: xt, f: ft, evals: evals, d: d };
      t *= rho;
      if (t < 1e-18) break;
    }
    return { ok: false, t: t, x: x.slice(), f: f0, evals: evals, d: d };
  };

  /* Strong Wolfe line search (Nocedal & Wright, algorithms 3.5 and 3.6),
     with safeguarded quadratic interpolation inside zoom.  The interpolation
     is what makes the search land on the exact minimiser along a quadratic
     ray in one shot, which is what conjugate gradient needs to behave the way
     the theory says.  Returns {ok, t, x, f, g, evals}. */
  Atlas.lineSearch.strongWolfe = function (P, x, f0, g0, d, t0, opt) {
    opt = opt || {};
    var c1 = opt.c1 || 1e-4, c2 = opt.c2 || 0.1;
    var maxIt = opt.maxIt || 25, tmax = opt.tmax || 1e6;
    var evals = 0;
    var dphi0 = num.dot(g0, d);
    if (!(dphi0 < 0)) return { ok: false, t: 0, x: x.slice(), f: f0, g: g0.slice(), evals: 0 };

    /* one probe of the ray t -> f(x + t d) */
    function phi(t) {
      var xt = num.axpy(t, d, x);
      var ft = P.f(xt);
      var gt = P.grad(xt);
      evals++;
      return { t: t, x: xt, f: ft, g: gt, dphi: num.dot(gt, d) };
    }

    /* Minimiser of the parabola through (a.t, a.f, a.dphi) and (b.t, b.f),
       rejected unless it lands well inside the bracket. */
    function interp(a, b) {
      var w = b.t - a.t;
      if (!isFinite(w) || w === 0 || !isFinite(a.f) || !isFinite(b.f)) return null;
      var curv = (b.f - a.f - a.dphi * w) / (w * w);
      if (!isFinite(curv) || !(curv > 0)) return null;
      var t = a.t - a.dphi / (2 * curv);
      var lo = Math.min(a.t, b.t), hi = Math.max(a.t, b.t);
      var pad = 0.05 * (hi - lo);
      if (!(t > lo + pad && t < hi - pad)) return null;
      return t;
    }

    /* a is the endpoint with the lower value, b closes the bracket */
    function zoom(a, b) {
      for (var i = 0; i < 30; i++) {
        if (!isFinite(a.t) || !isFinite(b.t) || Math.abs(b.t - a.t) < 1e-16) break;
        var t = interp(a, b);
        if (t === null) t = 0.5 * (a.t + b.t);
        var r = phi(t);
        if (!isFinite(r.f) || r.f > f0 + c1 * t * dphi0 || r.f >= a.f) {
          b = r;
        } else {
          if (Math.abs(r.dphi) <= -c2 * dphi0) return { ok: true, t: t, x: r.x, f: r.f, g: r.g, evals: evals };
          if (r.dphi * (b.t - a.t) >= 0) b = a;
          a = r;
        }
      }
      return { ok: isFinite(a.f) && a.f < f0, t: a.t, x: a.x, f: a.f, g: a.g, evals: evals };
    }

    var prev = { t: 0, x: x.slice(), f: f0, g: g0.slice(), dphi: dphi0 };
    var t = Math.min((t0 > 0 && isFinite(t0)) ? t0 : 1, tmax);
    for (var i = 1; i <= maxIt; i++) {
      var r = phi(t);
      if (!isFinite(r.f) || r.f > f0 + c1 * t * dphi0 || (i > 1 && r.f >= prev.f)) return zoom(prev, r);
      if (Math.abs(r.dphi) <= -c2 * dphi0) return { ok: true, t: t, x: r.x, f: r.f, g: r.g, evals: evals };
      if (r.dphi >= 0) return zoom(r, prev);
      prev = r;
      if (t >= tmax) break;
      t = Math.min(t * 2, tmax);
    }
    /* Nothing satisfied the conditions: fall back to plain backtracking. */
    var ar = Atlas.lineSearch.armijo(P, x, f0, g0, d, Math.min(prev.t > 0 ? prev.t : 1, 1));
    return { ok: ar.ok, t: ar.t, x: ar.x, f: ar.f, g: ar.ok ? P.grad(ar.x) : g0.slice(), evals: evals + ar.evals };
  };

  /* =======================================================================
     3.  Colour
     Viridis for the landscape (perceptually monotone and colour-blind safe);
     a qualitative palette without any red/green pairing for the methods.
     ===================================================================== */

  var VIRIDIS = [
    [68, 1, 84], [72, 40, 120], [62, 74, 137], [49, 104, 142], [38, 130, 142],
    [31, 158, 137], [53, 183, 121], [109, 205, 89], [180, 222, 44], [253, 231, 37]
  ];

  Atlas.colormap = function (t) {
    t = num.clamp(isFinite(t) ? t : 0, 0, 1);
    var s = t * (VIRIDIS.length - 1);
    var i = Math.floor(s), f = s - i;
    var a = VIRIDIS[i], b = VIRIDIS[Math.min(i + 1, VIRIDIS.length - 1)];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  };

  Atlas.rgb = function (c, alpha) {
    var r = Math.round(num.clamp(c[0], 0, 255)), g = Math.round(num.clamp(c[1], 0, 255)), b = Math.round(num.clamp(c[2], 0, 255));
    return alpha === undefined ? 'rgb(' + r + ',' + g + ',' + b + ')' : 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  };

  Atlas.mix = function (c, target, t) {
    return [c[0] + (target[0] - c[0]) * t, c[1] + (target[1] - c[1]) * t, c[2] + (target[2] - c[2]) * t];
  };

  /* Method colours.  A method keeps its colour in every panel of the atlas. */
  Atlas.palette = {
    blue:    '#4477AA',
    cyan:    '#66CCEE',
    orange:  '#EE7733',
    purple:  '#AA4499',
    rose:    '#CC6677',
    olive:   '#999933',
    wine:    '#882255',
    teal:    '#009988',
    mint:    '#44BB99',
    amber:   '#DDAA33',
    indigo:  '#332288',
    violet:  '#8866CC'
  };

  /* =======================================================================
     4.  Theme
     ===================================================================== */

  Atlas.theme = {
    name: 'light',
    _cache: null,
    listeners: [],
    colors: function () {
      if (this._cache) return this._cache;
      var cs = getComputedStyle(document.documentElement);
      function g(n) { return cs.getPropertyValue(n).trim(); }
      this._cache = {
        bg: g('--bg'), panel: g('--panel'), panel2: g('--panel-2'),
        fg: g('--fg'), fgSoft: g('--fg-soft'), muted: g('--muted'),
        line: g('--line'), lineSoft: g('--line-soft'), lineStrong: g('--line-strong'),
        contour: g('--contour'), marker: g('--marker'), accent: g('--accent'),
        ok: g('--ok'), warn: g('--warn'), bad: g('--bad'),
        contourAlpha: parseFloat(g('--contour-alpha')) || 0.3,
        fillAlpha: parseFloat(g('--fill-alpha')) || 0.3
      };
      return this._cache;
    },
    set: function (name) {
      this.name = name;
      document.documentElement.setAttribute('data-theme', name);
      this._cache = null;
      for (var i = 0; i < this.listeners.length; i++) this.listeners[i](name);
    },
    onChange: function (fn) { this.listeners.push(fn); }
  };

  /* =======================================================================
     5.  View - one canvas, device-pixel aware, world <-> screen mapping
     ===================================================================== */

  function View(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = 1;
    this.w = 0;
    this.h = 0;
    this.uniform = true;                       /* keep the aspect ratio of the domain */
    this.domain = { x0: -1, x1: 1, y0: -1, y1: 1 };
    this.fitted = { x0: -1, x1: 1, y0: -1, y1: 1 };
    this.scale = 1;
  }
  Atlas.View = View;

  View.prototype.setDomain = function (d) {
    this.domain = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 };
    this._fit();
  };

  View.prototype._fit = function () {
    var d = this.domain, w = this.w || 1, h = this.h || 1;
    var dx = d.x1 - d.x0, dy = d.y1 - d.y0;
    if (!(dx > 0) || !(dy > 0)) { dx = dx || 1; dy = dy || 1; }
    if (this.uniform) {
      var s = Math.min(w / dx, h / dy);
      var cx = 0.5 * (d.x0 + d.x1), cy = 0.5 * (d.y0 + d.y1);
      var hx = (w / s) / 2, hy = (h / s) / 2;
      this.fitted = { x0: cx - hx, x1: cx + hx, y0: cy - hy, y1: cy + hy };
      this.scale = s;
    } else {
      this.fitted = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 };
      this.scale = w / dx;
    }
  };

  /* Returns true when the pixel size changed (so caches must be rebuilt). */
  View.prototype.resize = function () {
    var dpr = window.devicePixelRatio || 1;
    var w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return false;
    var changed = (w !== this.w || h !== this.h || dpr !== this.dpr);
    if (changed) {
      this.w = w; this.h = h; this.dpr = dpr;
      this.canvas.width = Math.max(1, Math.round(w * dpr));
      this.canvas.height = Math.max(1, Math.round(h * dpr));
      this._fit();
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return changed;
  };

  View.prototype.sx = function (x) { return (x - this.fitted.x0) * this.scale; };
  View.prototype.sy = function (y) { return this.h - (y - this.fitted.y0) * this.scale; };
  View.prototype.wx = function (px) { return this.fitted.x0 + px / this.scale; };
  View.prototype.wy = function (py) { return this.fitted.y0 + (this.h - py) / this.scale; };
  View.prototype.toScreen = function (p) { return [this.sx(p[0]), this.sy(p[1])]; };
  View.prototype.toWorld = function (px, py) { return [this.wx(px), this.wy(py)]; };

  View.prototype.pointer = function (ev) {
    var r = this.canvas.getBoundingClientRect();
    return this.toWorld(ev.clientX - r.left, ev.clientY - r.top);
  };

  View.prototype.inside = function (p) {
    var f = this.fitted;
    return p[0] >= f.x0 && p[0] <= f.x1 && p[1] >= f.y0 && p[1] <= f.y1;
  };

  View.prototype.clear = function (color) {
    var ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (color) { ctx.fillStyle = color; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); }
    else ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
  };

  /* =======================================================================
     6.  Drawing primitives (screen coordinates, CSS pixels)
     ===================================================================== */

  var draw = {};
  Atlas.draw = draw;

  draw.dot = function (ctx, x, y, r, color) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283185307179586);
    ctx.fillStyle = color; ctx.fill();
  };

  draw.ring = function (ctx, x, y, r, color, lw, fill) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283185307179586);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.lineWidth = lw || 2; ctx.strokeStyle = color; ctx.stroke();
  };

  draw.cross = function (ctx, x, y, r, color, lw) {
    ctx.beginPath();
    ctx.moveTo(x - r, y); ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r); ctx.lineTo(x, y + r);
    ctx.lineWidth = lw || 1.5; ctx.strokeStyle = color; ctx.stroke();
  };

  draw.star = function (ctx, x, y, r, color, outline) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / 5;
      var rad = (i % 2 === 0) ? r : r * 0.44;
      var px = x + Math.cos(ang) * rad, py = y + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
    if (outline) { ctx.lineWidth = 1; ctx.strokeStyle = outline; ctx.stroke(); }
  };

  draw.diamond = function (ctx, x, y, r, color, outline) {
    ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
    if (outline) { ctx.lineWidth = 1.4; ctx.strokeStyle = outline; ctx.stroke(); }
  };

  draw.arrow = function (ctx, x0, y0, x1, y1, color, lw, head) {
    var dx = x1 - x0, dy = y1 - y0;
    var len = Math.hypot(dx, dy);
    if (!(len > 0.5)) return;
    head = Math.min(head || 8, len * 0.6);
    var ux = dx / len, uy = dy / len;
    ctx.beginPath();
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    ctx.lineWidth = lw || 1.6; ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.stroke();
    var bx = x1 - ux * head, by = y1 - uy * head;
    var nx = -uy, ny = ux;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(bx + nx * head * 0.42, by + ny * head * 0.42);
    ctx.lineTo(bx - nx * head * 0.42, by - ny * head * 0.42);
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
  };

  draw.label = function (ctx, text, x, y, opt) {
    opt = opt || {};
    ctx.save();
    ctx.font = (opt.font || '11px system-ui, -apple-system, sans-serif');
    ctx.textAlign = opt.align || 'left';
    ctx.textBaseline = opt.baseline || 'alphabetic';
    if (opt.box) {
      var m = ctx.measureText(text);
      var padX = 4, padY = 3, h = 13;
      var bx = x - (opt.align === 'center' ? m.width / 2 : (opt.align === 'right' ? m.width : 0)) - padX;
      var by = y - h + 2 - padY;
      ctx.fillStyle = opt.box;
      ctx.globalAlpha = opt.boxAlpha === undefined ? 0.85 : opt.boxAlpha;
      ctx.fillRect(bx, by, m.width + 2 * padX, h + 2 * padY - 1);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = opt.color || '#000';
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  /* =======================================================================
     7.  Scalar field: sampling, level choice, marching squares, shading
     ===================================================================== */

  /* Evaluate f on an n x n grid over the visible rectangle. */
  function sampleGrid(fn, params, dom, n) {
    var vals = new Float64Array(n * n);
    var dx = (dom.x1 - dom.x0) / (n - 1), dy = (dom.y1 - dom.y0) / (n - 1);
    var min = Infinity, max = -Infinity;
    var pt = [0, 0];
    for (var j = 0; j < n; j++) {
      pt[1] = dom.y0 + j * dy;
      for (var i = 0; i < n; i++) {
        pt[0] = dom.x0 + i * dx;
        var f = fn.f(pt, params);
        if (!isFinite(f)) f = NaN;
        vals[j * n + i] = f;
        if (f < min) min = f;
        if (f > max) max = f;
      }
    }
    return { vals: vals, n: n, x0: dom.x0, x1: dom.x1, y0: dom.y0, y1: dom.y1, dx: dx, dy: dy, min: min, max: max };
  }
  Atlas.sampleGrid = sampleGrid;

  /* Levels spaced geometrically above the minimum: dense in the valley,
     sparse on the slopes, which is the only way a narrow valley stays
     visible on functions such as Rosenbrock or Beale. */
  Atlas.levels = function (min, max, count) {
    var out = [];
    if (!isFinite(min) || !isFinite(max) || !(max > min)) return out;
    var span = max - min;
    /* Three decades of dynamic range: enough to expose a narrow valley, not so
       much that the innermost contour becomes smaller than one grid cell. */
    var eps = span * 1e-3;
    var ratio = span / eps + 1;
    for (var i = 1; i <= count; i++) {
      var t = i / (count + 1);
      out.push(min + eps * (Math.pow(ratio, t) - 1));
    }
    return out;
  };

  /* Histogram equalisation of the sampled values.
     Level VALUES stay geometric, because that is what keeps a narrow valley
     visible; but the COLOUR ramp is spread by rank, otherwise a function with
     a huge range (Rastrigin, Beale) is one flat block of the top colour.
     lookup() also returns a smoothed dt/dv, which the hill shading needs to
     convert the analytic gradient into a slope of the displayed surface. */
  Atlas.quantileMap = function (vals, sampleN) {
    var step = Math.max(1, Math.floor(vals.length / (sampleN || 4096)));
    var s = [];
    for (var i = 0; i < vals.length; i += step) {
      var v = vals[i];
      if (v === v && isFinite(v)) s.push(v);
    }
    if (s.length < 2) s = [0, 1];
    s.sort(function (a, b) { return a - b; });
    var n = s.length;
    var W = Math.max(2, Math.round(n * 0.02));
    return {
      values: s,
      lookup: function (v, out) {
        if (!(v === v)) { out.t = 0; out.slope = 0; return out; }
        var lo = 0, hi = n - 1;
        if (v <= s[0]) lo = 0;
        else if (v >= s[n - 1]) lo = n - 1;
        else {
          while (lo < hi) {
            var mid = (lo + hi) >> 1;
            if (s[mid] < v) lo = mid + 1; else hi = mid;
          }
        }
        out.t = lo / (n - 1);
        var a = lo - W; if (a < 0) a = 0;
        var b = lo + W; if (b > n - 1) b = n - 1;
        var dv = s[b] - s[a];
        out.slope = dv > 0 ? ((b - a) / (n - 1)) / dv : 0;
        return out;
      },
      t: function (v) { return this.lookup(v, { t: 0, slope: 0 }).t; }
    };
  };

  function ip(v1, v2, level) {
    var d = v2 - v1;
    if (d === 0) return 0.5;
    var t = (level - v1) / d;
    return t < 0 ? 0 : (t > 1 ? 1 : t);
  }

  /* Marching squares on the sampled grid.  emit(x1, y1, x2, y2) in world
     coordinates, one call per segment of the level set. */
  function marchingSquares(field, level, emit) {
    var n = field.n, v = field.vals, dx = field.dx, dy = field.dy;
    for (var j = 0; j < n - 1; j++) {
      var yb = field.y0 + j * dy, yt = yb + dy;
      var row = j * n, rowUp = (j + 1) * n;
      for (var i = 0; i < n - 1; i++) {
        var a = v[row + i], b = v[row + i + 1], c = v[rowUp + i + 1], d = v[rowUp + i];
        /* NaN guard: any corner undefined and the cell is skipped */
        if (!(a === a) || !(b === b) || !(c === c) || !(d === d)) continue;
        var mn = a, mx = a;
        if (b < mn) mn = b; else if (b > mx) mx = b;
        if (c < mn) mn = c; else if (c > mx) mx = c;
        if (d < mn) mn = d; else if (d > mx) mx = d;
        if (level < mn || level > mx) continue;
        var idx = (a > level ? 1 : 0) | (b > level ? 2 : 0) | (c > level ? 4 : 0) | (d > level ? 8 : 0);
        if (idx === 0 || idx === 15) continue;
        var xl = field.x0 + i * dx, xr = xl + dx;
        switch (idx) {
          case 1: case 14:                                   /* bottom - left */
            emit(xl + ip(a, b, level) * dx, yb, xl, yb + ip(a, d, level) * dy); break;
          case 2: case 13:                                   /* bottom - right */
            emit(xl + ip(a, b, level) * dx, yb, xr, yb + ip(b, c, level) * dy); break;
          case 3: case 12:                                   /* right - left */
            emit(xr, yb + ip(b, c, level) * dy, xl, yb + ip(a, d, level) * dy); break;
          case 4: case 11:                                   /* right - top */
            emit(xr, yb + ip(b, c, level) * dy, xl + ip(d, c, level) * dx, yt); break;
          case 6: case 9:                                    /* bottom - top */
            emit(xl + ip(a, b, level) * dx, yb, xl + ip(d, c, level) * dx, yt); break;
          case 7: case 8:                                    /* top - left */
            emit(xl + ip(d, c, level) * dx, yt, xl, yb + ip(a, d, level) * dy); break;
          case 5:                                            /* saddle cell */
            emit(xl + ip(a, b, level) * dx, yb, xl, yb + ip(a, d, level) * dy);
            emit(xr, yb + ip(b, c, level) * dy, xl + ip(d, c, level) * dx, yt); break;
          case 10:                                           /* saddle cell */
            emit(xl + ip(a, b, level) * dx, yb, xr, yb + ip(b, c, level) * dy);
            emit(xl + ip(d, c, level) * dx, yt, xl, yb + ip(a, d, level) * dy); break;
        }
      }
    }
  }
  Atlas.marchingSquares = marchingSquares;

  /* Per-pixel shaded image of the landscape.
     `relief` > 0 adds hill shading computed from the ANALYTIC gradient, which
     is what turns the flat contour plot into the pseudo-3D view. */
  function shadeBuffer(fn, params, view, res, relief, field, qmap) {
    var cw = view.canvas.width, ch = view.canvas.height;
    var sw = Math.max(2, Math.min(res, cw));
    var sh = Math.max(2, Math.round(sw * ch / cw));
    var cv = document.createElement('canvas');
    cv.width = sw; cv.height = sh;
    var ictx = cv.getContext('2d');
    var img = ictx.createImageData(sw, sh);
    var data = img.data;

    var dom = view.fitted;
    var W = dom.x1 - dom.x0, H = dom.y1 - dom.y0;
    var lx = -0.45, ly = 0.55, lz = 0.70;
    var ln = Math.hypot(lx, ly, lz); lx /= ln; ly /= ln; lz /= ln;

    var pt = [0, 0], k = 0, rec = { t: 0, slope: 0 };
    for (var py = 0; py < sh; py++) {
      pt[1] = dom.y1 - (py + 0.5) / sh * H;                  /* row 0 is the top */
      for (var px = 0; px < sw; px++) {
        pt[0] = dom.x0 + (px + 0.5) / sw * W;
        var f = fn.f(pt, params);
        qmap.lookup(f, rec);
        var c = Atlas.colormap(rec.t);
        var r = c[0], g = c[1], b2 = c[2];
        if (relief) {
          var gr = fn.grad(pt, params);
          if (num.finite(gr)) {
            var nx = -gr[0] * rec.slope * W * relief;
            var ny = -gr[1] * rec.slope * H * relief;
            var nn = Math.sqrt(nx * nx + ny * ny + 1);
            var lam = (nx * lx + ny * ly + lz) / nn;
            var shade = 0.34 + 0.88 * (lam > 0 ? lam : 0);
            if (shade > 1.32) shade = 1.32;
            r *= shade; g *= shade; b2 *= shade;
          }
        }
        data[k++] = r < 0 ? 0 : (r > 255 ? 255 : r);
        data[k++] = g < 0 ? 0 : (g > 255 ? 255 : g);
        data[k++] = b2 < 0 ? 0 : (b2 > 255 ? 255 : b2);
        data[k++] = 255;
      }
    }
    ictx.putImageData(img, 0, 0);
    return cv;
  }

  /* =======================================================================
     8.  FieldView - a canvas showing one landscape, with a cached background
     ===================================================================== */

  function FieldView(canvas, opts) {
    opts = opts || {};
    this.view = new View(canvas);
    this.gridN = opts.gridN || 200;
    this.levelCount = opts.levelCount || 18;
    this.mode = opts.mode || 'contours';
    this.fn = null;
    this.params = null;
    this.field = null;
    this.levelValues = [];
    this.overlay = opts.overlay || null;       /* function(view, ctx, fieldView) */
    this.cache = document.createElement('canvas');
    this.cacheKey = '';
  }
  Atlas.FieldView = FieldView;

  FieldView.prototype.setFunction = function (fnDef, params) {
    this.fn = fnDef;
    this.params = params;
    this.view.setDomain(fnDef.domain);
    this.cacheKey = '';
  };
  FieldView.prototype.setMode = function (m) { this.mode = m; this.cacheKey = ''; };
  FieldView.prototype.invalidate = function () { this.cacheKey = ''; };

  FieldView.prototype._key = function () {
    var v = this.view;
    return [this.fn ? this.fn.id : '-', JSON.stringify(this.params), this.mode,
            v.w, v.h, v.dpr, this.gridN, this.levelCount, Atlas.theme.name].join('|');
  };

  FieldView.prototype.build = function () {
    var v = this.view, fn = this.fn, p = this.params;
    var cw = v.canvas.width, ch = v.canvas.height;
    this.cache.width = cw; this.cache.height = ch;
    var cx = this.cache.getContext('2d');
    var C = Atlas.theme.colors();

    cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.clearRect(0, 0, cw, ch);
    cx.fillStyle = C.panel;
    cx.fillRect(0, 0, cw, ch);

    this.field = sampleGrid(fn, p, v.fitted, this.gridN);
    this.levelValues = Atlas.levels(this.field.min, this.field.max, this.levelCount);
    this.qmap = Atlas.quantileMap(this.field.vals, 4096);

    var height = (this.mode === 'height');
    var buf = shadeBuffer(fn, p, v, height ? 820 : 460, height ? 1 : 0, this.field, this.qmap);
    cx.save();
    cx.globalAlpha = height ? 1 : C.fillAlpha;
    cx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in cx) cx.imageSmoothingQuality = 'high';
    cx.drawImage(buf, 0, 0, cw, ch);
    cx.restore();

    cx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    this._isolines(cx, C, height);
    this._axes(cx, C);
  };

  FieldView.prototype._isolines = function (cx, C, height) {
    var v = this.view, field = this.field, levels = this.levelValues;
    var qmap = this.qmap;
    cx.save();
    cx.lineJoin = 'round';
    cx.lineCap = 'round';
    for (var li = 0; li < levels.length; li++) {
      var lv = levels[li];
      cx.beginPath();
      marchingSquares(field, lv, function (x1, y1, x2, y2) {
        cx.moveTo(v.sx(x1), v.sy(y1));
        cx.lineTo(v.sx(x2), v.sy(y2));
      });
      var strong = (li % 4 === 0);
      if (height) {
        var t = qmap.t(lv);
        var base = Atlas.colormap(t);
        var col = t < 0.45 ? Atlas.mix(base, [255, 255, 255], 0.62) : Atlas.mix(base, [0, 0, 0], 0.55);
        cx.strokeStyle = Atlas.rgb(col);
        cx.globalAlpha = strong ? 0.95 : 0.6;
      } else {
        cx.strokeStyle = C.contour;
        cx.globalAlpha = strong ? Math.min(0.85, C.contourAlpha * 1.9) : C.contourAlpha;
      }
      cx.lineWidth = strong ? 1.2 : 0.75;
      cx.stroke();
    }
    cx.restore();
  };

  FieldView.prototype._axes = function (cx, C) {
    var v = this.view, f = v.fitted;
    cx.save();
    cx.strokeStyle = C.contour;
    cx.globalAlpha = 0.22;
    cx.lineWidth = 1;
    cx.setLineDash([3, 3]);
    if (f.x0 < 0 && f.x1 > 0) { cx.beginPath(); cx.moveTo(v.sx(0), 0); cx.lineTo(v.sx(0), v.h); cx.stroke(); }
    if (f.y0 < 0 && f.y1 > 0) { cx.beginPath(); cx.moveTo(0, v.sy(0)); cx.lineTo(v.w, v.sy(0)); cx.stroke(); }
    cx.restore();
  };

  FieldView.prototype.render = function () {
    var v = this.view;
    if (v.resize()) this.cacheKey = '';
    if (!v.w || !v.h || !this.fn) return;
    var key = this._key();
    if (key !== this.cacheKey) { this.build(); this.cacheKey = key; }
    var ctx = v.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, v.canvas.width, v.canvas.height);
    ctx.drawImage(this.cache, 0, 0);
    ctx.restore();
    ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    if (this.overlay) this.overlay(v, ctx, this);
  };

  /* Everything a readout needs about one point, from analytic derivatives. */
  FieldView.prototype.sample = function (p) {
    var fn = this.fn, par = this.params;
    var f = fn.f(p, par);
    var g = fn.grad(p, par);
    var H = fn.hess(p, par);
    var e = num.eigSym2(H);
    var amin = Math.min(Math.abs(e.lo), Math.abs(e.hi));
    var amax = Math.max(Math.abs(e.lo), Math.abs(e.hi));
    return {
      p: p, f: f, g: g, gnorm: num.norm(g), H: H, eig: e,
      kappa: amin > 1e-12 ? amax / amin : Infinity
    };
  };

  /* =======================================================================
     9.  Convergence chart (logarithmic y axis)
     ===================================================================== */

  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
              '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  function sup(n) {
    return String(n).split('').map(function (ch) { return SUP[ch] || ch; }).join('');
  }
  Atlas.sup = sup;

  function Chart(canvas) {
    this.view = new View(canvas);
    this.view.uniform = false;
  }
  Atlas.Chart = Chart;

  /* opts = {series:[{name,color,values:[],dash:[]}], yLabel, xLabel, floor, empty} */
  Chart.prototype.render = function (opts) {
    var v = this.view;
    v.resize();
    if (!v.w || !v.h) return;
    var ctx = v.ctx, C = Atlas.theme.colors();
    ctx.clearRect(0, 0, v.w, v.h);

    var m = { l: 62, r: 14, t: 12, b: 28 };
    var W = v.w - m.l - m.r, H = v.h - m.t - m.b;
    if (W < 30 || H < 30) return;

    /* A single recorded point is not a curve yet: show the hint instead. */
    var series = (opts.series || []).filter(function (s) { return s.values && s.values.length > 1; });
    var floor = opts.floor || 1e-16;
    var yMin = Infinity, yMax = -Infinity, xMax = 1, i, j, val;

    for (i = 0; i < series.length; i++) {
      var vals = series[i].values, xs = series[i].xs;
      var endX = xs ? xs[xs.length - 1] : vals.length - 1;
      if (isFinite(endX) && endX > xMax) xMax = endX;
      for (j = 0; j < vals.length; j++) {
        val = vals[j];
        if (isFinite(val) && val > 0) { if (val < yMin) yMin = val; if (val > yMax) yMax = val; }
      }
    }
    if (!(yMax > 0)) { yMin = 1e-8; yMax = 1e2; }
    yMin = Math.max(yMin, floor);
    if (!(yMin < yMax)) yMin = yMax / 1e3;

    var lo = Math.floor(Math.log10(yMin)), hi = Math.ceil(Math.log10(yMax));
    if (hi - lo < 2) { hi = lo + 2; }
    var decades = hi - lo;

    /* X takes an x VALUE: an iteration index by default, or whatever a series
       supplies in `xs` (section C plots epochs, not updates). */
    function X(xv) { return m.l + (xMax > 0 ? xv / xMax : 0) * W; }
    function Y(value) {
      var t = (hi - Math.log10(value)) / decades;
      return m.t + num.clamp(t, -0.02, 1.02) * H;
    }

    /* grid */
    ctx.save();
    ctx.strokeStyle = C.lineSoft;
    ctx.fillStyle = C.muted;
    ctx.lineWidth = 1;
    ctx.font = '10.5px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    var labelStep = Math.max(1, Math.ceil(decades / 7));
    for (var d = lo; d <= hi; d++) {
      var y = Math.round(Y(Math.pow(10, d))) + 0.5;
      ctx.beginPath(); ctx.moveTo(m.l, y); ctx.lineTo(m.l + W, y); ctx.stroke();
      if ((hi - d) % labelStep === 0) ctx.fillText('10' + sup(d), m.l - 8, y);
    }
    var xStep = niceStep(xMax / 6);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (var xk = 0; xk <= xMax + 1e-9; xk += xStep) {
      var px = Math.round(X(xk)) + 0.5;
      ctx.strokeStyle = C.lineSoft;
      ctx.beginPath(); ctx.moveTo(px, m.t); ctx.lineTo(px, m.t + H); ctx.stroke();
      ctx.fillText(num.fmt(xk, 2), px, m.t + H + 6);
    }

    /* frame */
    ctx.strokeStyle = C.line;
    ctx.strokeRect(m.l + 0.5, m.t + 0.5, W, H);

    /* axis labels */
    ctx.fillStyle = C.muted;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(opts.xLabel || Atlas.t('iteration k', 'итерация k'), m.l + W, v.h - 2);
    ctx.save();
    ctx.translate(12, m.t + H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(opts.yLabel || '', 0, 0);
    ctx.restore();
    ctx.restore();

    if (!series.length) {
      ctx.save();
      ctx.fillStyle = C.muted;
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(opts.empty || Atlas.t('enable a method and press Run', 'включите метод и нажмите «Запуск»'),
                   m.l + W / 2, m.t + H / 2);
      ctx.restore();
      return;
    }

    /* curves */
    ctx.save();
    ctx.beginPath();
    ctx.rect(m.l, m.t - 2, W, H + 4);
    ctx.clip();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    var labels = [];
    for (i = 0; i < series.length; i++) {
      var s = series[i];
      ctx.beginPath();
      var started = false, lastX = 0, lastY = 0;
      for (j = 0; j < s.values.length; j++) {
        val = s.values[j];
        var xv = s.xs ? s.xs[j] : j;
        if (!isFinite(val) || !isFinite(xv)) { started = false; continue; }
        var yv = val <= 0 ? yMin : val;
        var px2 = X(xv), py2 = Y(yv);
        if (!started) { ctx.moveTo(px2, py2); started = true; } else ctx.lineTo(px2, py2);
        lastX = px2; lastY = py2;
      }
      if (s.label && started) labels.push({ text: s.label, x: lastX, y: lastY, color: s.color });
      ctx.setLineDash(s.dash || []);
      ctx.lineWidth = s.width || 1.9;
      ctx.globalAlpha = s.alpha === undefined ? 1 : s.alpha;
      ctx.strokeStyle = s.color;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    /* Overlay names sit at the end of their own curve, outside the clip. */
    ctx.save();
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (i = 0; i < labels.length; i++) {
      var lb = labels[i];
      ctx.fillStyle = lb.color;
      ctx.fillText(lb.text, Math.min(lb.x, m.l + W) - 3,
                   num.clamp(lb.y - 7, m.t + 7, m.t + H - 7));
    }
    ctx.restore();
  };

  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    var e = Math.pow(10, Math.floor(Math.log10(raw)));
    var f = raw / e;
    var m = f <= 1 ? 1 : (f <= 2 ? 2 : (f <= 5 ? 5 : 10));
    return Math.max(1, m * e);
  }
  Atlas.niceStep = niceStep;

  /* =======================================================================
     10.  One shared animation loop
     ===================================================================== */

  Atlas.loop = (function () {
    var subs = [], running = false, last = 0;
    function tick(t) {
      if (!subs.length) { running = false; last = 0; return; }
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
      last = t;
      var list = subs.slice();
      for (var i = 0; i < list.length; i++) {
        try { list[i](dt, t); } catch (e) { console.error('[atlas] frame callback failed', e); }
      }
      requestAnimationFrame(tick);
    }
    return {
      add: function (fn) {
        if (subs.indexOf(fn) < 0) subs.push(fn);
        if (!running) { running = true; last = 0; requestAnimationFrame(tick); }
      },
      remove: function (fn) {
        var i = subs.indexOf(fn);
        if (i >= 0) subs.splice(i, 1);
      }
    };
  })();

  /* =======================================================================
     10b.  Small DOM helpers and the slider widget

     Shared by ui.js and discrete.js so a control looks and behaves the same
     everywhere in the atlas.
     ===================================================================== */

  var uid = 0;

  Atlas.dom = {
    qs: function (sel, root) { return (root || document).querySelector(sel); },
    el: function (tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text !== undefined && text !== null) e.textContent = text;
      return e;
    },
    clear: function (node) { while (node.firstChild) node.removeChild(node.firstChild); }
  };

  /* spec: {id, label, min, max, log, step, integer, digits, unit, hint}
     label, unit and hint may be Atlas.L texts; relabel() re-reads them after
     a language switch without touching the value. */
  Atlas.makeSlider = function (spec, value, onChange) {
    var el = Atlas.dom.el;
    var wrap = el('div', 'ctl');
    var top = el('div', 'ctl-top');
    var lab = el('label', null, Atlas.tr(spec.label));
    var out = document.createElement('output');
    var input = document.createElement('input');
    var hintSrc = spec.hint || '';
    var hint = el('div', 'ctl-hint', Atlas.tr(hintSrc));
    var map = spec.log ? Atlas.logMap(spec.min, spec.max) : null;
    var id = 'ctl-' + spec.id + '-' + (uid++);
    var current = value;

    input.type = 'range';
    input.id = id;
    lab.htmlFor = id;
    if (map) { input.min = '0'; input.max = '1000'; input.step = '1'; }
    else {
      input.min = String(spec.min);
      input.max = String(spec.max);
      input.step = String(spec.step || (spec.max - spec.min) / 100);
    }

    function text(v) {
      if (spec.integer) return String(Math.round(v));
      return num.fmt(v, spec.digits === undefined ? 4 : spec.digits);
    }
    function place(v) {
      input.value = map ? String(Math.round(map.toPos(v) * 1000)) : String(v);
      out.textContent = text(v) + (spec.unit ? ' ' + Atlas.tr(spec.unit) : '');
    }

    input.addEventListener('input', function () {
      var v = map ? map.toValue(parseFloat(input.value) / 1000) : parseFloat(input.value);
      if (spec.integer) v = Math.round(v);
      current = v;
      out.textContent = text(v) + (spec.unit ? ' ' + Atlas.tr(spec.unit) : '');
      onChange(v);
    });

    top.appendChild(lab);
    top.appendChild(out);
    wrap.appendChild(top);
    wrap.appendChild(input);
    wrap.appendChild(hint);
    place(value);

    return {
      root: wrap,
      set: function (v) { current = num.clamp(v, spec.min, spec.max); place(current); },
      get: function () { return current; },
      /* t: a string, an Atlas.L text, or a function returning one; it is
         re-read by relabel(), so a hint that depends on the state keeps up */
      setHint: function (t) { hintSrc = t; hint.textContent = Atlas.tr(t); },
      relabel: function () {
        lab.textContent = Atlas.tr(spec.label);
        hint.textContent = Atlas.tr(hintSrc);
        out.textContent = text(current) + (spec.unit ? ' ' + Atlas.tr(spec.unit) : '');
      }
    };
  };

  /* =======================================================================
     11.  Problem wrapper and run driver
     ===================================================================== */

  /* Wraps a registered test function together with its parameters and counts
     how often the METHOD asked for a value, a gradient or a Hessian.
     The run driver uses the uncounted fRaw / gradRaw instead, so the numbers
     shown in the table are the real cost of the method and nothing else. */
  Atlas.makeProblem = function (fnDef, params) {
    var P = {
      def: fnDef,
      params: params,
      n: 2,
      fEvals: 0, gEvals: 0, hEvals: 0,
      domain: fnDef.domain,
      nonsmooth: !!fnDef.nonsmooth,
      f: function (x) { P.fEvals++; return fnDef.f(x, params); },
      grad: function (x) { P.gEvals++; return fnDef.grad(x, params); },
      hess: function (x) { P.hEvals++; return fnDef.hess(x, params); },
      fRaw: function (x) { return fnDef.f(x, params); },
      gradRaw: function (x) { return fnDef.grad(x, params); },
      hessRaw: function (x) { return fnDef.hess(x, params); }
    };
    P.fstar  = fnDef.fstar  ? fnDef.fstar(params)  : null;
    P.optima = fnDef.optima ? fnDef.optima(params) : [];
    P.saddles = fnDef.saddles ? fnDef.saddles(params) : [];
    P.L  = fnDef.L  ? fnDef.L(params)  : null;
    P.mu = fnDef.mu ? fnDef.mu(params) : null;
    return P;
  };

  /* Largest curvature at a point, used when no global L is known. */
  Atlas.localL = function (P, x) {
    var e = num.eigSym2(P.def.hess(x, P.params));
    return Math.max(Math.abs(e.lo), Math.abs(e.hi));
  };

  /* Theoretical convergence shapes for the chart overlays.  Each is anchored
     at the initial gap f(x0) − f*, so it shows the SHAPE a rate predicts
     rather than a certified constant.  For gradient descent with α = 1/L on a
     μ-strongly convex f, (1 − μ/L)^k anchored this way is a genuine upper
     bound; the others are shapes only, and the chart caption says so. */
  Atlas.rateCurve = function (kind, n, gap0, kappa) {
    var out = new Array(n), k, q;
    if (!(gap0 > 0) || !isFinite(gap0)) gap0 = 1;
    kappa = (isFinite(kappa) && kappa >= 1) ? kappa : 1;
    switch (kind) {
      case '1/sqrt(k)':
        for (k = 0; k < n; k++) out[k] = gap0 / Math.sqrt(1 + k);
        break;
      case '1/k':
        for (k = 0; k < n; k++) out[k] = gap0 / (1 + k);
        break;
      case '1/k2':
        for (k = 0; k < n; k++) out[k] = gap0 / ((1 + k) * (1 + k));
        break;
      case 'linear':
        q = 1 - 1 / kappa;
        for (k = 0; k < n; k++) out[k] = gap0 * Math.pow(q, k);
        break;
      case 'accel':
        q = 1 - 1 / Math.sqrt(kappa);
        for (k = 0; k < n; k++) out[k] = gap0 * Math.pow(q, k);
        break;
      default:
        for (k = 0; k < n; k++) out[k] = gap0;
    }
    return out;
  };

  function iters(k) { return k + (k === 1 ? ' iteration' : ' iterations'); }
  /* the Russian counterpart after «после», which takes the genitive:
     «после 1 итерации», «после 3 итераций», «после 21 итерации» */
  function itersRu(k) { return k + ' ' + Atlas.ruPlural(k, 'итерации', 'итераций', 'итераций'); }

  /* The message SRun shows when its epoch budget is used up, with the
     Russian verb agreeing with the count («пройдена 1 эпоха», «пройдено
     5 эпох») and «за N обновлений» in the accusative. */
  function finishedEpochs(epochs, k) {
    return Atlas.L('finished ' + epochs + ' epochs in ' + k + ' updates',
                   Atlas.ruPlural(epochs, 'пройдена ', 'пройдено ', 'пройдено ') + epochs + ' ' +
                   Atlas.ruPlural(epochs, 'эпоха', 'эпохи', 'эпох') + ' за ' + k + ' ' +
                   Atlas.ruPlural(k, 'обновление', 'обновления', 'обновлений'));
  }

  /* SRun's default status detail: the step size the schedule gives now. */
  function lrInfo(lr) {
    var s = num.fmt(lr, 4);
    return Atlas.L('lr = ' + s, 'шаг = ' + s);
  }

  var DIVERGE_X = 1e8;
  var DIVERGE_F = 1e14;
  var GTOL = 1e-8;

  /* Drives one method on one problem: records the trajectory, detects
     convergence, divergence, NaN and stalling. */
  function Run(method, problem, opts, x0, budget) {
    this.method = method;
    this.problem = problem;
    this.opts = opts;
    this.color = method.color;
    this.budget = budget || 200;
    this.x0 = x0.slice();
    this.restart();
  }
  Atlas.Run = Run;

  Run.prototype.restart = function () {
    var P = this.problem;
    P.fEvals = 0; P.gEvals = 0; P.hEvals = 0;
    this.k = 0;
    this.status = 'ready';
    this.message = '';
    this.info = '';
    this.pointType = null;
    this.traj = [this.x0.slice()];
    var f0 = P.fRaw(this.x0);
    var g0 = P.gradRaw(this.x0);
    this.fs = [f0];
    this.gs = [num.norm(g0)];
    this.state = null;
    try {
      this.state = this.method.create(P, this.opts, this.x0.slice());
    } catch (e) {
      this.status = 'diverged';
      this.message = Atlas.L('could not start: ' + e.message, 'не удалось запустить: ' + e.message);
    }
    if (!isFinite(f0) || !num.finite(g0)) {
      this.status = 'diverged';
      this.message = Atlas.L('the starting point is outside the domain of f',
                             'начальная точка вне области определения f');
    }
  };

  Run.prototype.active = function () {
    return this.status === 'ready' || this.status === 'running';
  };

  Run.prototype.last = function () { return this.traj[this.traj.length - 1]; };

  /* One iteration.  Returns true when the run is still active afterwards. */
  Run.prototype.step = function () {
    if (!this.active() || !this.state) return false;
    if (this.k >= this.budget) {
      this.status = 'budget';
      this.message = Atlas.L('iteration budget reached (' + this.budget + ')',
                             'лимит итераций исчерпан (' + this.budget + ')');
      return false;
    }
    var x;
    try {
      x = this.state.step();
    } catch (e) {
      this.status = 'diverged';
      this.message = Atlas.L('numerical failure at iteration ' + (this.k + 1),
                             'численный сбой на итерации ' + (this.k + 1));
      return false;
    }
    this.k++;
    this.info = this.state.info || '';

    if (!x || !num.finite(x)) {
      this.status = 'diverged';
      this.message = Atlas.L('diverged at iteration ' + this.k + ' (not a number)',
                             'разошёлся на итерации ' + this.k + ' (получено не число)');
      return false;
    }
    if (num.norm(x) > DIVERGE_X) {
      this.traj.push(x.slice());
      this.status = 'diverged';
      this.message = Atlas.L('diverged at iteration ' + this.k, 'разошёлся на итерации ' + this.k);
      return false;
    }

    var P = this.problem;
    var f = P.fRaw(x), g = P.gradRaw(x);
    if (!isFinite(f) || !num.finite(g) || Math.abs(f) > DIVERGE_F) {
      this.traj.push(x.slice());
      this.status = 'diverged';
      this.message = f < 0
        ? Atlas.L('f is unbounded below, left the region at iteration ' + this.k,
                  'f не ограничена снизу, метод покинул область на итерации ' + this.k)
        : Atlas.L('diverged at iteration ' + this.k, 'разошёлся на итерации ' + this.k);
      return false;
    }

    var prev = this.traj[this.traj.length - 1];
    var move = num.dist(x, prev);
    /* A constrained or composite problem supplies its own optimality measure
       (the norm of the gradient mapping), because there the gradient itself
       does not vanish at the solution. */
    var gval = P.stationarity ? P.stationarity(x) : num.norm(g);
    this.traj.push(x.slice());
    this.fs.push(f);
    this.gs.push(gval);
    this.status = 'running';

    if (this.gs[this.gs.length - 1] < GTOL) {
      /* ∇f = 0 holds at a saddle and at a maximum just as well as at a
         minimum, so say which one the method actually stopped at. */
      this.status = 'converged';
      if (P.stationarity) {
        /* the eigenvalue story does not apply once a constraint is active */
        this.pointType = 'minimum';
        this.message = Atlas.L('fixed point of the update reached after ' + iters(this.k),
                               'неподвижная точка шага достигнута после ' + itersRu(this.k));
        return false;
      }
      var e = num.eigSym2(P.hessRaw(x));
      var etol = 1e-8 * Math.max(1, Math.abs(e.hi), Math.abs(e.lo));
      if (e.lo < -etol && e.hi > etol) {
        this.pointType = 'saddle';
        this.message = Atlas.L('stationary after ' + iters(this.k) + ', but ∇²f is indefinite — a saddle',
                               'стационарная точка после ' + itersRu(this.k) +
                               ', но ∇²f знаконеопределён — это седло');
      } else if (e.hi < -etol) {
        this.pointType = 'maximum';
        this.message = Atlas.L('stationary after ' + iters(this.k) + ', but ∇²f is negative definite — a maximum',
                               'стационарная точка после ' + itersRu(this.k) +
                               ', но ∇²f отрицательно определён — это максимум');
      } else if (e.lo > etol) {
        this.pointType = 'minimum';
        this.message = Atlas.L('‖∇f‖ < 1e-8 after ' + iters(this.k), '‖∇f‖ < 1e-8 после ' + itersRu(this.k));
      } else {
        this.pointType = 'flat';
        this.message = Atlas.L('stationary after ' + iters(this.k) + ', ∇²f is singular here',
                               'стационарная точка после ' + itersRu(this.k) + ', ∇²f здесь вырожден');
      }
      return false;
    }
    if (this.state.status === 'failed') {
      this.status = 'stalled';
      this.message = this.state.message || Atlas.L('line search failed at iteration ' + this.k,
                                                    'линейный поиск не удался на итерации ' + this.k);
      return false;
    }
    /* A method may deliberately stay put: Levenberg-Marquardt rejects a trial
       step and raises the damping.  That is progress, not stalling. */
    if (this.k > 2 && move < 1e-13 && !this.state.rejected) {
      this.status = 'stalled';
      this.message = Atlas.L('no further progress at iteration ' + this.k,
                             'продвижение остановилось на итерации ' + this.k);
      return false;
    }
    if (this.k >= this.budget) {
      this.status = 'budget';
      this.message = Atlas.L('iteration budget reached (' + this.budget + ')',
                             'лимит итераций исчерпан (' + this.budget + ')');
      return false;
    }
    return true;
  };

  /* =======================================================================
     12.  Stochastic run driver (section C)

     Different from Run in three ways that matter for teaching:
       - progress is measured in EPOCHS (individual gradients used / n), so
         full-batch and mini-batch methods are compared on equal work;
       - there is no gradient-norm stopping test, because with noise the
         gradient never vanishes — a run ends when its epoch budget does;
       - the step size passed to the method comes from a schedule.
     A stochastic method reads this.lr and reports this.used, the number of
     individual gradients its update consumed.
     ===================================================================== */

  function SRun(method, SP, opts, x0, schedule, epochs) {
    this.method = method;
    this.SP = SP;
    this.opts = opts;
    this.color = method.color;
    this.schedule = schedule || function () { return 1; };
    this.epochs = epochs;
    this.x0 = x0.slice();
    this.batch = method.batchSize ? method.batchSize(opts, SP.n) : 1;
    this.updatesPerEpoch = Math.max(1, Math.ceil(SP.n / this.batch));
    this.totalSteps = Math.max(1, Math.round(epochs * this.updatesPerEpoch));
    this.restart();
  }
  Atlas.SRun = SRun;

  SRun.prototype.restart = function () {
    this.k = 0;
    this.grads = 0;
    this.status = 'ready';
    this.message = '';
    this.info = '';
    this.lr = 0;
    this.traj = [this.x0.slice()];
    this.epochAt = [0];
    this.Fs = [this.SP.F(this.x0)];
    this.batch = this.method.batchSize ? this.method.batchSize(this.opts, this.SP.n) : 1;
    this.updatesPerEpoch = Math.max(1, Math.ceil(this.SP.n / this.batch));
    this.totalSteps = Math.max(1, Math.round(this.epochs * this.updatesPerEpoch));
    try {
      this.state = this.method.create(this.SP, this.opts, this.x0.slice());
    } catch (e) {
      this.status = 'diverged';
      this.message = Atlas.L('could not start: ' + e.message, 'не удалось запустить: ' + e.message);
    }
  };

  SRun.prototype.active = function () {
    return this.status === 'ready' || this.status === 'running';
  };
  SRun.prototype.last = function () { return this.traj[this.traj.length - 1]; };
  SRun.prototype.epochNow = function () { return this.grads / this.SP.n; };

  SRun.prototype.step = function () {
    if (!this.active() || !this.state) return false;
    if (this.k >= this.totalSteps) {
      this.status = 'done';
      this.message = finishedEpochs(this.epochs, this.k);
      return false;
    }
    this.lr = this.opts.lr * this.schedule(this.k / this.totalSteps);
    this.state.lr = this.lr;
    var x;
    try {
      x = this.state.step();
    } catch (e) {
      this.status = 'diverged';
      this.message = Atlas.L('numerical failure at update ' + (this.k + 1),
                             'численный сбой на обновлении ' + (this.k + 1));
      return false;
    }
    this.k++;
    this.grads += (this.state.used || this.batch);
    if (!x || !num.finite(x) || num.norm(x) > 1e6) {
      this.status = 'diverged';
      this.message = Atlas.L('diverged at update ' + this.k, 'разошёлся на обновлении ' + this.k);
      return false;
    }
    var F = this.SP.F(x);
    if (!isFinite(F) || F > 1e12) {
      this.status = 'diverged';
      this.message = Atlas.L('diverged at update ' + this.k, 'разошёлся на обновлении ' + this.k);
      return false;
    }
    this.traj.push(x.slice());
    this.epochAt.push(this.grads / this.SP.n);
    this.Fs.push(F);
    this.info = this.state.info || lrInfo(this.lr);
    this.status = 'running';
    if (this.k >= this.totalSteps) {
      this.status = 'done';
      this.message = finishedEpochs(this.epochs, this.k);
    }
    return true;
  };

  /* F(x_k) - F* for the convergence chart. */
  SRun.prototype.chartValues = function () {
    var out = new Array(this.Fs.length);
    for (var i = 0; i < this.Fs.length; i++) out[i] = this.Fs[i] - this.SP.Fstar;
    return out;
  };

  /* The last `count` iterates, used for the noise-ball cloud. */
  SRun.prototype.tail = function (count) {
    return this.traj.slice(Math.max(1, this.traj.length - count));
  };

  /* Root-mean-square distance of the tail from `center`, or from its own mean
     when no centre is given.  The theory predicts the spread about x*, so the
     caller passes x* to compare like with like. */
  SRun.prototype.tailRadius = function (count, center) {
    var pts = this.tail(count);
    if (pts.length < 2) return null;
    var mx = 0, my = 0, i;
    for (i = 0; i < pts.length; i++) { mx += pts[i][0]; my += pts[i][1]; }
    mx /= pts.length; my /= pts.length;
    var cx = center ? center[0] : mx, cy = center ? center[1] : my;
    var s2 = 0;
    for (i = 0; i < pts.length; i++) {
      var dx = pts[i][0] - cx, dy = pts[i][1] - cy;
      s2 += dx * dx + dy * dy;
    }
    return { center: [cx, cy], mean: [mx, my], radius: Math.sqrt(s2 / pts.length), n: pts.length };
  };

  /* Values plotted on the convergence chart: f(x_k) - f* when the optimal
     value is known, otherwise the gradient norm. */
  Run.prototype.chartValues = function () {
    var fstar = this.problem.fstar;
    if (fstar === null || fstar === undefined) return this.gs.slice();
    var out = new Array(this.fs.length);
    for (var i = 0; i < this.fs.length; i++) out[i] = this.fs[i] - fstar;
    return out;
  };

})();
