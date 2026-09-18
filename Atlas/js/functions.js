// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
/* ==========================================================================
   Optimization Atlas - functions.js
   The registry of test functions.

   Every entry provides the value, the ANALYTIC gradient and the ANALYTIC
   Hessian.  Nothing here is estimated by finite differences.

   To add a landscape, call Atlas.registerFunction({...}) with:

     id            unique string
     name          label in the selectors
     domain        {x0, x1, y0, y1} initial view rectangle
     params        [{id, label, min, max, log, step, def, integer}]  optional
     f(x, p)       value at x = [x0, x1] with the parameter object p
     grad(x, p)    gradient, analytic
     hess(x, p)    Hessian as [[a, b], [b, c]], analytic
     fstar(p)      optimal value, or null when f is unbounded below
     optima(p)     array of known minimisers
     saddles(p)    array of known saddle points          (optional)
     maxima(p)     array of known local maxima            (optional)
     L(p)          global Lipschitz constant of ∇f, or null when none exists
     mu(p)         strong convexity constant, or null
     traits        {convex, smooth, strong}
     defaultStart(p)   starting point offered when the function is selected
     alphaSuggest(p)   step size that is safe on this landscape
     note          one line shown under the selector

   name, note and params[].label are bilingual Atlas.L('English', 'Russian')
   texts, and so are a set's name, note, params[].label and any constraint
   name that is a word rather than a formula.
   ========================================================================== */
(function () {
  'use strict';

  var Atlas = window.Atlas;
  var num = Atlas.num;

  /* ------------------------------------------------ 1. quadratic with κ -- */
  Atlas.registerFunction({
    id: 'quadratic',
    name: Atlas.L('Quadratic, adjustable κ', 'Квадратичная с настраиваемым κ'),
    domain: { x0: -3, x1: 3, y0: -3, y1: 3 },
    params: [{ id: 'kappa', label: Atlas.L('Condition number κ', 'Число обусловленности κ'),
               min: 1, max: 1000, log: true, def: 10 }],
    f: function (x, p) { return 0.5 * (x[0] * x[0] + p.kappa * x[1] * x[1]); },
    grad: function (x, p) { return [x[0], p.kappa * x[1]]; },
    hess: function (x, p) { return [[1, 0], [0, p.kappa]]; },
    fstar: function () { return 0; },
    optima: function () { return [[0, 0]]; },
    L: function (p) { return Math.max(1, p.kappa); },
    mu: function (p) { return Math.min(1, p.kappa); },
    traits: { convex: true, smooth: true, strong: true },
    defaultStart: function () { return [2.4, 1.6]; },
    alphaSuggest: function (p) { return 1 / Math.max(1, p.kappa); },
    note: Atlas.L('f(x) = ½(x₁² + κx₂²). The only hard thing here is the shape of the level sets.',
                  'f(x) = ½(x₁² + κx₂²). Вся сложность здесь — в форме множеств уровня.')
  });

  /* ------------------------------------------------------- 2. Rosenbrock -- */
  var RB_A = 1, RB_B = 100;
  Atlas.registerFunction({
    id: 'rosenbrock',
    name: Atlas.L('Rosenbrock', 'Функция Розенброка'),
    domain: { x0: -2, x1: 2, y0: -1, y1: 3 },
    params: [],
    f: function (x) {
      var t1 = RB_A - x[0], t2 = x[1] - x[0] * x[0];
      return t1 * t1 + RB_B * t2 * t2;
    },
    grad: function (x) {
      var t2 = x[1] - x[0] * x[0];
      return [-2 * (RB_A - x[0]) - 4 * RB_B * x[0] * t2, 2 * RB_B * t2];
    },
    hess: function (x) {
      return [[2 - 4 * RB_B * (x[1] - 3 * x[0] * x[0]), -4 * RB_B * x[0]],
              [-4 * RB_B * x[0], 2 * RB_B]];
    },
    fstar: function () { return 0; },
    optima: function () { return [[1, 1]]; },
    L: function () { return null; },
    mu: function () { return null; },
    traits: { convex: false, smooth: true, strong: false },
    defaultStart: function () { return [-1.2, 1.0]; },
    alphaSuggest: function () { return 1e-3; },
    note: Atlas.L('A curved valley: the gradient points across the valley, almost never along it.',
                  'Изогнутый овраг: градиент направлен поперёк оврага и почти никогда — вдоль него.')
  });

  /* ------------------------------------------------------- 3. Himmelblau -- */
  Atlas.registerFunction({
    id: 'himmelblau',
    name: Atlas.L('Himmelblau, four minima', 'Функция Химмельблау, четыре минимума'),
    domain: { x0: -5.5, x1: 5.5, y0: -5.5, y1: 5.5 },
    params: [],
    f: function (x) {
      var A = x[0] * x[0] + x[1] - 11, B = x[0] + x[1] * x[1] - 7;
      return A * A + B * B;
    },
    grad: function (x) {
      var A = x[0] * x[0] + x[1] - 11, B = x[0] + x[1] * x[1] - 7;
      return [4 * x[0] * A + 2 * B, 2 * A + 4 * x[1] * B];
    },
    hess: function (x) {
      return [[12 * x[0] * x[0] + 4 * x[1] - 42, 4 * (x[0] + x[1])],
              [4 * (x[0] + x[1]), 12 * x[1] * x[1] + 4 * x[0] - 26]];
    },
    fstar: function () { return 0; },
    optima: function () {
      return [[3, 2], [-2.805118, 3.131313], [-3.779310, -3.283186], [3.584428, -1.848127]];
    },
    saddles: function () {
      return [[3.385154, 0.073852], [0.086678, 2.884255], [-3.073026, -0.081353], [-0.127961, -1.953715]];
    },
    maxima: function () { return [[-0.270845, -0.923039]]; },
    L: function () { return null; },
    mu: function () { return null; },
    traits: { convex: false, smooth: true, strong: false },
    defaultStart: function () { return [-0.6, 0.4]; },
    alphaSuggest: function () { return 0.01; },
    note: Atlas.L('Four global minima with the same value: where you start decides which one you get.',
                  'Четыре глобальных минимума с одинаковым значением: какой из них будет найден, решает начальная точка.')
  });

  /* ------------------------------------------------------------ 4. Beale -- */
  Atlas.registerFunction({
    id: 'beale',
    name: Atlas.L('Beale', 'Функция Била'),
    domain: { x0: -1.6, x1: 4.6, y0: -1.6, y1: 2.2 },
    params: [],
    f: function (x) {
      var a = x[0], b = x[1];
      var t1 = 1.5 - a + a * b;
      var t2 = 2.25 - a + a * b * b;
      var t3 = 2.625 - a + a * b * b * b;
      return t1 * t1 + t2 * t2 + t3 * t3;
    },
    grad: function (x) {
      var a = x[0], b = x[1], b2 = b * b, b3 = b2 * b;
      var t1 = 1.5 - a + a * b, t2 = 2.25 - a + a * b2, t3 = 2.625 - a + a * b3;
      return [2 * (t1 * (b - 1) + t2 * (b2 - 1) + t3 * (b3 - 1)),
              2 * (t1 * a + t2 * 2 * a * b + t3 * 3 * a * b2)];
    },
    hess: function (x) {
      var a = x[0], b = x[1], b2 = b * b, b3 = b2 * b, b4 = b2 * b2;
      var t1 = 1.5 - a + a * b, t2 = 2.25 - a + a * b2, t3 = 2.625 - a + a * b3;
      var fxx = 2 * ((b - 1) * (b - 1) + (b2 - 1) * (b2 - 1) + (b3 - 1) * (b3 - 1));
      var fxy = 2 * ((b - 1) * a + t1 + (b2 - 1) * 2 * a * b + 2 * b * t2 + (b3 - 1) * 3 * a * b2 + 3 * b2 * t3);
      var fyy = 2 * (a * a + 4 * a * a * b2 + 2 * a * t2 + 9 * a * a * b4 + 6 * a * b * t3);
      return [[fxx, fxy], [fxy, fyy]];
    },
    fstar: function () { return 0; },
    optima: function () { return [[3, 0.5]]; },
    L: function () { return null; },
    mu: function () { return null; },
    traits: { convex: false, smooth: true, strong: false },
    defaultStart: function () { return [1.0, 1.5]; },
    alphaSuggest: function () { return 1e-3; },
    note: Atlas.L('Flat plateau plus a very steep wall: fixed steps are either too slow or explode.',
                  'Плоское плато и очень крутая стенка: с постоянным шагом метод либо ползёт, либо расходится.')
  });

  /* ----------------------------------------------------------- 5. saddle -- */
  Atlas.registerFunction({
    id: 'saddle',
    name: Atlas.L('Saddle, x² − y²', 'Седловая функция x² − y²'),
    domain: { x0: -2, x1: 2, y0: -2, y1: 2 },
    params: [],
    f: function (x) { return x[0] * x[0] - x[1] * x[1]; },
    grad: function (x) { return [2 * x[0], -2 * x[1]]; },
    hess: function () { return [[2, 0], [0, -2]]; },
    fstar: function () { return null; },                 /* unbounded below */
    optima: function () { return []; },
    saddles: function () { return [[0, 0]]; },
    L: function () { return 2; },
    mu: function () { return null; },
    traits: { convex: false, smooth: true, strong: false },
    defaultStart: function () { return [1.4, 0.02]; },
    alphaSuggest: function () { return 0.3; },
    note: Atlas.L('No minimum at all. The gradient vanishes at the origin, and Newton is attracted to it.',
                  'Минимума нет вовсе. Градиент обращается в нуль в начале координат, и метод Ньютона притягивается туда.')
  });

  /* -------------------------------------------------------- 6. Rastrigin -- */
  var TWO_PI = 2 * Math.PI;
  Atlas.registerFunction({
    id: 'rastrigin',
    name: Atlas.L('Rastrigin, many local minima', 'Функция Растригина, много локальных минимумов'),
    domain: { x0: -5.12, x1: 5.12, y0: -5.12, y1: 5.12 },
    params: [],
    f: function (x) {
      return 20 + x[0] * x[0] - 10 * Math.cos(TWO_PI * x[0])
                + x[1] * x[1] - 10 * Math.cos(TWO_PI * x[1]);
    },
    grad: function (x) {
      return [2 * x[0] + 10 * TWO_PI * Math.sin(TWO_PI * x[0]),
              2 * x[1] + 10 * TWO_PI * Math.sin(TWO_PI * x[1])];
    },
    hess: function (x) {
      return [[2 + 10 * TWO_PI * TWO_PI * Math.cos(TWO_PI * x[0]), 0],
              [0, 2 + 10 * TWO_PI * TWO_PI * Math.cos(TWO_PI * x[1])]];
    },
    fstar: function () { return 0; },
    optima: function () { return [[0, 0]]; },
    L: function () { return 2 + 10 * TWO_PI * TWO_PI; },
    mu: function () { return null; },
    traits: { convex: false, smooth: true, strong: false },
    defaultStart: function () { return [-4.1, 3.6]; },
    alphaSuggest: function () { return 1 / (2 + 10 * TWO_PI * TWO_PI); },
    note: Atlas.L('About a hundred local minima on this window. Every local method stops at the nearest one.',
                  'В этом окне около сотни локальных минимумов. Любой локальный метод останавливается в ближайшем.')
  });

  /* ------------------------------------------- 7. quadratic + L1 penalty -- */
  var Q1 = 1, Q2 = 4, C1 = 1.4, C2 = 0.75;
  function soft(v, t) { return num.sign(v) * Math.max(Math.abs(v) - t, 0); }

  Atlas.registerFunction({
    id: 'l1quad',
    name: Atlas.L('Quadratic + λ‖x‖₁, nonsmooth', 'Квадратичная + λ‖x‖₁, негладкая'),
    domain: { x0: -1.4, x1: 2.6, y0: -1.2, y1: 1.8 },
    params: [{ id: 'lam', label: Atlas.L('Penalty λ', 'Штраф λ'), min: 0, max: 2, step: 0.02, def: 0.6 }],
    f: function (x, p) {
      return 0.5 * (Q1 * (x[0] - C1) * (x[0] - C1) + Q2 * (x[1] - C2) * (x[1] - C2))
           + p.lam * (Math.abs(x[0]) + Math.abs(x[1]));
    },
    /* At a kink this returns the subgradient of smallest norm (sign(0) = 0). */
    grad: function (x, p) {
      return [Q1 * (x[0] - C1) + p.lam * num.sign(x[0]),
              Q2 * (x[1] - C2) + p.lam * num.sign(x[1])];
    },
    hess: function () { return [[Q1, 0], [0, Q2]]; },     /* of the smooth part */
    fstar: function (p) {
      var xs = soft(C1, p.lam / Q1), ys = soft(C2, p.lam / Q2);
      return 0.5 * (Q1 * (xs - C1) * (xs - C1) + Q2 * (ys - C2) * (ys - C2))
           + p.lam * (Math.abs(xs) + Math.abs(ys));
    },
    optima: function (p) { return [[soft(C1, p.lam / Q1), soft(C2, p.lam / Q2)]]; },
    L: function () { return Math.max(Q1, Q2); },
    mu: function () { return Math.min(Q1, Q2); },
    traits: { convex: true, smooth: false, strong: true },
    defaultStart: function () { return [-0.9, 1.4]; },
    alphaSuggest: function () { return 1 / Math.max(Q1, Q2); },
    /* Proximal operator of λ‖·‖₁, reused by ISTA and FISTA in section D. */
    prox: function (x, t, p) { return [soft(x[0], t * p.lam), soft(x[1], t * p.lam)]; },
    smoothPart: {
      f: function (x) { return 0.5 * (Q1 * (x[0] - C1) * (x[0] - C1) + Q2 * (x[1] - C2) * (x[1] - C2)); },
      grad: function (x) { return [Q1 * (x[0] - C1), Q2 * (x[1] - C2)]; }
    },
    note: Atlas.L('Kinks along x₁ = 0 and x₂ = 0. Gradient methods chatter there; section D uses the prox instead.',
                  'Изломы вдоль x₁ = 0 и x₂ = 0. Градиентные методы колеблются вокруг них; в разделе D вместо этого используется prox.')
  });

  /* =====================================================================
     Section C: a finite sum of n quadratic terms.

         F(x) = (1/n) Σ ½ (x − cᵢ)ᵀ A (x − cᵢ)

     Every term has the same curvature A, so the stochastic gradient is the
     true gradient plus a noise vector that does not depend on x:
         ∇fᵢ(x) = A(x − cᵢ) = ∇F(x) + A(c̄ − cᵢ)
     That makes the noise covariance exactly A·Cov(c)·A, which is what lets
     the noise-ball radius be predicted rather than only measured.
     =================================================================== */

  Atlas.makeStochasticProblem = function (opts) {
    opts = opts || {};
    var n = opts.n || 200;
    var seed = opts.seed === undefined ? 20250901 : opts.seed;
    var A = opts.A || [[1.6, 0.55], [0.55, 1.0]];
    var xstar = (opts.xstar || [1.2, 0.8]).slice();
    var spread = opts.spread === undefined ? 1.15 : opts.spread;

    var rng = Atlas.rng(seed);
    var c = [], i, mx = 0, my = 0;
    for (i = 0; i < n; i++) {
      var p = [rng.normal() * spread, rng.normal() * spread * 0.8];
      c.push(p); mx += p[0]; my += p[1];
    }
    mx /= n; my /= n;
    /* shift so that the mean is exactly xstar: then x* = c̄ with no rounding */
    for (i = 0; i < n; i++) { c[i][0] += xstar[0] - mx; c[i][1] += xstar[1] - my; }

    /* F* and the sample covariance of the centres */
    var Fstar = 0, s11 = 0, s12 = 0, s22 = 0;
    for (i = 0; i < n; i++) {
      var d0 = xstar[0] - c[i][0], d1 = xstar[1] - c[i][1];
      Fstar += 0.5 * (A[0][0] * d0 * d0 + 2 * A[0][1] * d0 * d1 + A[1][1] * d1 * d1);
      s11 += d0 * d0; s12 += d0 * d1; s22 += d1 * d1;
    }
    Fstar /= n; s11 /= n; s12 /= n; s22 /= n;
    var Cc = [[s11, s12], [s12, s22]];
    /* covariance of the per-sample gradient noise: A·Cov(c)·A */
    var Cnoise = num.matMul2(num.matMul2(A, Cc), A);

    var SP = {
      n: n, A: A, c: c, xstar: xstar, Fstar: Fstar, Cnoise: Cnoise, seed: seed,
      domain: { x0: -2.8, x1: 5.2, y0: -2.4, y1: 4.0 },
      F: function (x) {
        var d0 = x[0] - xstar[0], d1 = x[1] - xstar[1];
        return 0.5 * (A[0][0] * d0 * d0 + 2 * A[0][1] * d0 * d1 + A[1][1] * d1 * d1) + Fstar;
      },
      gradFull: function (x) {
        var d0 = x[0] - xstar[0], d1 = x[1] - xstar[1];
        return [A[0][0] * d0 + A[0][1] * d1, A[1][0] * d0 + A[1][1] * d1];
      },
      /* mean gradient over the given sample indices */
      gradBatch: function (x, idx) {
        var b = idx.length, m0 = 0, m1 = 0, j;
        for (j = 0; j < b; j++) { m0 += c[idx[j]][0]; m1 += c[idx[j]][1]; }
        var d0 = x[0] - m0 / b, d1 = x[1] - m1 / b;
        return [A[0][0] * d0 + A[0][1] * d1, A[1][0] * d0 + A[1][1] * d1];
      },
      /* Methods that draw the same batch size see the same data order, so a
         race compares update rules and not luck. */
      samplerFor: function (b) {
        var r = Atlas.rng((seed ^ (b * 2654435761)) >>> 0);
        return function (size) {
          var out = new Array(size);
          for (var j = 0; j < size; j++) out[j] = r.int(n);
          return out;
        };
      }
    };

    /* an ad-hoc function definition so FieldView can draw the contours of F */
    SP.fnDef = {
      id: 'stochastic-' + seed,
      name: Atlas.L('Sum of ' + n + ' quadratics',
                    'Сумма ' + n + ' ' + Atlas.ruPlural(n, 'квадратичной функции', 'квадратичных функций',
                                                        'квадратичных функций')),
      domain: SP.domain,
      f: function (x) { return SP.F(x); },
      grad: function (x) { return SP.gradFull(x); },
      hess: function () { return A; }
    };
    return SP;
  };

  /* Bounded saddle used by the "escape the saddle" demonstration:
     f = ½x² − ½y² + ¼y⁴, a saddle at the origin and true minima at (0, ±1). */
  Atlas.escapeProblem = {
    id: 'escape-saddle',
    name: Atlas.L('Saddle with two wells', 'Седло с двумя ямами'),
    domain: { x0: -1.6, x1: 1.6, y0: -1.7, y1: 1.7 },
    f: function (x) { return 0.5 * x[0] * x[0] - 0.5 * x[1] * x[1] + 0.25 * Math.pow(x[1], 4); },
    grad: function (x) { return [x[0], -x[1] + x[1] * x[1] * x[1]]; },
    hess: function (x) { return [[1, 0], [0, -1 + 3 * x[1] * x[1]]]; },
    optima: function () { return [[0, 1], [0, -1]]; },
    saddles: function () { return [[0, 0]]; }
  };

  /* =====================================================================
     Section D: feasible sets.

     Each set provides an exact Euclidean projection, a linear minimisation
     oracle for Frank-Wolfe, a boundary polyline to draw, and the individual
     constraints with their gradients so the KKT panel can build the
     multipliers.  Register one object to add a set.
     =================================================================== */

  Atlas.sets = [];
  Atlas.setsById = {};
  Atlas.registerSet = function (def) {
    if (Atlas.setsById[def.id]) throw new Error('duplicate set id: ' + def.id);
    Atlas.sets.push(def);
    Atlas.setsById[def.id] = def;
    return def;
  };

  /* ---- helpers shared by every polygonal set (vertices counter-clockwise) -- */
  function polyEdges(poly) {
    var out = [], i;
    for (i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length];
      var ex = b[0] - a[0], ey = b[1] - a[1];
      var len = Math.hypot(ex, ey) || 1;
      /* outward normal of a counter-clockwise polygon */
      out.push({ a: a, b: b, normal: [ey / len, -ex / len], offset: 0 });
      out[out.length - 1].offset = out[out.length - 1].normal[0] * a[0] +
                                   out[out.length - 1].normal[1] * a[1];
    }
    return out;
  }

  function polyContains(poly, x, tol) {
    var e = polyEdges(poly);
    tol = tol || 1e-9;
    for (var i = 0; i < e.length; i++) {
      if (e[i].normal[0] * x[0] + e[i].normal[1] * x[1] - e[i].offset > tol) return false;
    }
    return true;
  }

  function segProject(a, b, x) {
    var ex = b[0] - a[0], ey = b[1] - a[1];
    var L2 = ex * ex + ey * ey;
    var t = L2 > 0 ? ((x[0] - a[0]) * ex + (x[1] - a[1]) * ey) / L2 : 0;
    t = num.clamp(t, 0, 1);
    return [a[0] + t * ex, a[1] + t * ey];
  }

  function polyProject(poly, x) {
    if (polyContains(poly, x)) return x.slice();
    var best = null, bd = Infinity;
    for (var i = 0; i < poly.length; i++) {
      var q = segProject(poly[i], poly[(i + 1) % poly.length], x);
      var d = num.dist(q, x);
      if (d < bd) { bd = d; best = q; }
    }
    return best;
  }

  function polyLMO(poly, g) {
    var best = poly[0], bv = Infinity;
    for (var i = 0; i < poly.length; i++) {
      var v = g[0] * poly[i][0] + g[1] * poly[i][1];
      if (v < bv) { bv = v; best = poly[i]; }
    }
    return best.slice();
  }

  function polyConstraints(poly, names) {
    var e = polyEdges(poly);
    return e.map(function (edge, i) {
      return {
        name: names && names[i] ? names[i] : Atlas.L('edge ' + (i + 1), 'ребро ' + (i + 1)),
        c: function (x) { return edge.normal[0] * x[0] + edge.normal[1] * x[1] - edge.offset; },
        grad: function () { return edge.normal.slice(); }
      };
    });
  }

  Atlas.poly = { edges: polyEdges, contains: polyContains, project: polyProject,
                 lmo: polyLMO, constraints: polyConstraints };

  /* ------------------------------------------------------------- ball ---- */
  Atlas.registerSet({
    id: 'ball',
    name: Atlas.L('Ball ‖x‖₂ ≤ r', 'Шар ‖x‖₂ ≤ r'),
    params: [{ id: 'r', label: Atlas.L('Radius r', 'Радиус r'), min: 0.3, max: 2, step: 0.05, def: 1 }],
    contains: function (x, p) { return num.norm(x) <= p.r + 1e-9; },
    project: function (x, p) {
      var nx = num.norm(x);
      return nx <= p.r ? x.slice() : [x[0] * p.r / nx, x[1] * p.r / nx];
    },
    lmo: function (g, p) {
      var ng = num.norm(g);
      return ng < 1e-14 ? [p.r, 0] : [-g[0] * p.r / ng, -g[1] * p.r / ng];
    },
    boundary: function (p) {
      var pts = [], i;
      for (i = 0; i <= 96; i++) {
        var t = i / 96 * 2 * Math.PI;
        pts.push([p.r * Math.cos(t), p.r * Math.sin(t)]);
      }
      return [pts];
    },
    constraints: function (p) {
      return [{
        name: '‖x‖₂ − r',
        c: function (x) { return num.norm(x) - p.r; },
        grad: function (x) {
          var nx = num.norm(x);
          return nx < 1e-12 ? [0, 0] : [x[0] / nx, x[1] / nx];
        }
      }];
    },
    note: Atlas.L('Smooth boundary: exactly one constraint can be active, so the KKT combination has a single multiplier.',
                  'Гладкая граница: активным может быть только одно ограничение, поэтому в комбинации ККТ всего один множитель.')
  });

  /* -------------------------------------------------------------- box ---- */
  function boxPoly(p) {
    return [[-p.b, -p.b], [p.b, -p.b], [p.b, p.b], [-p.b, p.b]];
  }
  Atlas.registerSet({
    id: 'box',
    name: Atlas.L('Box ‖x‖∞ ≤ b', 'Брус ‖x‖∞ ≤ b'),
    params: [{ id: 'b', label: Atlas.L('Half-width b', 'Полуширина b'), min: 0.3, max: 2, step: 0.05, def: 0.9 }],
    contains: function (x, p) { return Math.abs(x[0]) <= p.b + 1e-9 && Math.abs(x[1]) <= p.b + 1e-9; },
    project: function (x, p) { return [num.clamp(x[0], -p.b, p.b), num.clamp(x[1], -p.b, p.b)]; },
    lmo: function (g, p) {
      return [g[0] > 0 ? -p.b : p.b, g[1] > 0 ? -p.b : p.b];
    },
    boundary: function (p) { var q = boxPoly(p); return [q.concat([q[0]])]; },
    constraints: function (p) {
      return polyConstraints(boxPoly(p), ['−x₂ − b ≤ 0', 'x₁ − b ≤ 0', 'x₂ − b ≤ 0', '−x₁ − b ≤ 0']);
    },
    note: Atlas.L('At a corner two constraints are active at once and the multipliers split −∇f between them.',
                  'В углу активны сразу два ограничения, и множители делят −∇f между собой.')
  });

  /* ---------------------------------------------------------- simplex ---- */
  function simplexPoly(p) { return [[0, 0], [p.s, 0], [0, p.s]]; }
  Atlas.registerSet({
    id: 'simplex',
    name: Atlas.L('Simplex x ≥ 0, x₁+x₂ ≤ s', 'Симплекс x ≥ 0, x₁+x₂ ≤ s'),
    params: [{ id: 's', label: Atlas.L('Size s', 'Размер s'), min: 0.4, max: 2.4, step: 0.05, def: 1.4 }],
    contains: function (x, p) { return polyContains(simplexPoly(p), x); },
    project: function (x, p) { return polyProject(simplexPoly(p), x); },
    lmo: function (g, p) { return polyLMO(simplexPoly(p), g); },
    boundary: function (p) { var q = simplexPoly(p); return [q.concat([q[0]])]; },
    constraints: function (p) {
      return polyConstraints(simplexPoly(p), ['−x₂ ≤ 0', 'x₁+x₂ − s ≤ 0', '−x₁ ≤ 0']);
    },
    note: Atlas.L('The Frank-Wolfe oracle over a simplex is a single argmin over the vertices, which is why it scales.',
                  'Оракул Франка–Вульфа на симплексе — это один argmin по вершинам, поэтому метод хорошо масштабируется.')
  });

  /* ------------------------------------------------------- half-spaces --- */
  /* counter-clockwise, small enough that the unconstrained optimum is outside */
  function polytopePoly() {
    return [[-0.71, -0.53], [0.65, -0.71], [0.90, 0.22], [0.22, 0.81], [-0.68, 0.47]];
  }
  Atlas.registerSet({
    id: 'polytope',
    name: Atlas.L('Half-spaces aᵢᵀx ≤ bᵢ', 'Полупространства aᵢᵀx ≤ bᵢ'),
    params: [],
    contains: function (x) { return polyContains(polytopePoly(), x); },
    project: function (x) { return polyProject(polytopePoly(), x); },
    lmo: function (g) { return polyLMO(polytopePoly(), g); },
    boundary: function () { var q = polytopePoly(); return [q.concat([q[0]])]; },
    constraints: function () { return polyConstraints(polytopePoly()); },
    note: Atlas.L('Five linear inequalities. The optimum sits on an edge, or at a vertex where two of them are active.',
                  'Пять линейных неравенств. Оптимум лежит на ребре или в вершине, где активны два из них.')
  });

  /* ------------------------------------------------------- intersection -- */
  Atlas.registerSet({
    id: 'ballbox',
    name: Atlas.L('Intersection: ball ∩ box', 'Пересечение: шар ∩ брус'),
    params: [
      { id: 'r', label: Atlas.L('Ball radius r', 'Радиус шара r'), min: 0.4, max: 2, step: 0.05, def: 1.15 },
      { id: 'b', label: Atlas.L('Box half-width b', 'Полуширина бруса b'), min: 0.3, max: 2, step: 0.05, def: 0.8 }
    ],
    contains: function (x, p) {
      return num.norm(x) <= p.r + 1e-9 && Math.abs(x[0]) <= p.b + 1e-9 && Math.abs(x[1]) <= p.b + 1e-9;
    },
    /* No closed form for an intersection: Dykstra's alternating projection
       converges to the true projection, unlike naive alternating projection. */
    project: function (x, p) {
      var y = x.slice(), q = [0, 0], w = [0, 0], i, prev;
      var ball = Atlas.setsById['ball'], box = Atlas.setsById['box'];
      for (i = 0; i < 200; i++) {
        prev = y.slice();
        var u = ball.project([y[0] + q[0], y[1] + q[1]], p);
        q = [y[0] + q[0] - u[0], y[1] + q[1] - u[1]];
        var v = box.project([u[0] + w[0], u[1] + w[1]], p);
        w = [u[0] + w[0] - v[0], u[1] + w[1] - v[1]];
        y = v;
        if (i > 2 && num.dist(prev, y) < 1e-14) break;
      }
      return y;
    },
    lmo: function (g, p) {
      /* the corner of the box, pulled back onto the ball if it sticks out */
      var v = [g[0] > 0 ? -p.b : p.b, g[1] > 0 ? -p.b : p.b];
      var nv = num.norm(v);
      if (nv <= p.r) return v;
      var s = Atlas.setsById['ball'].lmo(g, p);
      return Math.abs(s[0]) <= p.b && Math.abs(s[1]) <= p.b ? s : [v[0] * p.r / nv, v[1] * p.r / nv];
    },
    boundary: function (p) {
      var pts = [], i;
      for (i = 0; i <= 240; i++) {
        var t = i / 240 * 2 * Math.PI;
        var q = [p.r * Math.cos(t), p.r * Math.sin(t)];
        pts.push([num.clamp(q[0], -p.b, p.b), num.clamp(q[1], -p.b, p.b)]);
      }
      return [pts];
    },
    constraints: function (p) {
      return [{
        name: '‖x‖₂ − r',
        c: function (x) { return num.norm(x) - p.r; },
        grad: function (x) { var nx = num.norm(x); return nx < 1e-12 ? [0, 0] : [x[0] / nx, x[1] / nx]; }
      }].concat(polyConstraints(boxPoly(p), ['−x₂ − b ≤ 0', 'x₁ − b ≤ 0', 'x₂ − b ≤ 0', '−x₁ − b ≤ 0']));
    },
    note: Atlas.L('Projecting onto an intersection is itself an optimization problem; this one is solved by Dykstra’s algorithm.',
                  'Проекция на пересечение — сама по себе задача оптимизации; здесь она решается алгоритмом Дикстры (Dykstra).')
  });

  /* =====================================================================
     Section D objective: a tilted quadratic whose unconstrained minimum
     lies outside every feasible set above, so the constraint is always
     active and there is something to see.
     =================================================================== */

  Atlas.makeDProblem = function (cfg) {
    cfg = cfg || {};
    var mode = cfg.mode || 'constrained';
    /* Two different smooth parts on purpose.
       Constrained mode: a well-conditioned quadratic, so the optimum sits
       clearly on the boundary of whatever set is chosen.
       Composite mode: the same shape but ill-conditioned (κ ≈ 70) and centred
       far out.  Over a few hundred iterations that shows the O(1/k) and
       O(1/k²) transients instead of an immediate linear finish, while raising
       λ past about 0.56 still drives a coordinate to exactly zero. */
    var composite = (mode === 'composite');
    var A = cfg.A || (composite ? [[11.36, -11.04], [-11.04, 11.36]]
                                : [[1.6, 0.5], [0.5, 1.0]]);
    var c = cfg.c || (composite ? [2.0, 1.7] : [1.1, 0.55]);
    var lam = cfg.lam === undefined ? 0.2 : cfg.lam;
    var e = num.eigSym2(A);

    var P = {
      A: A, c: c, lam: lam, mode: mode,
      L: e.hi, mu: e.lo,
      domain: composite ? { x0: -1.7, x1: 2.7, y0: -1.5, y1: 2.3 }
                        : { x0: -1.8, x1: 2.1, y0: -1.6, y1: 1.7 },
      /* smooth part */
      g: function (x) {
        var d0 = x[0] - c[0], d1 = x[1] - c[1];
        return 0.5 * (A[0][0] * d0 * d0 + 2 * A[0][1] * d0 * d1 + A[1][1] * d1 * d1);
      },
      gradG: function (x) {
        var d0 = x[0] - c[0], d1 = x[1] - c[1];
        return [A[0][0] * d0 + A[0][1] * d1, A[1][0] * d0 + A[1][1] * d1];
      },
      hess: function () { return A; },
      /* nonsmooth part, only in composite mode */
      pen: function (x) { return mode === 'composite' ? lam * (Math.abs(x[0]) + Math.abs(x[1])) : 0; },
      prox: function (x, t) {
        if (mode !== 'composite') return x.slice();
        return [num.sign(x[0]) * Math.max(Math.abs(x[0]) - t * lam, 0),
                num.sign(x[1]) * Math.max(Math.abs(x[1]) - t * lam, 0)];
      },
      subgrad: function (x) {
        var gr = P.gradG(x);
        if (mode !== 'composite') return gr;
        return [gr[0] + lam * num.sign(x[0]), gr[1] + lam * num.sign(x[1])];
      }
    };
    P.f = function (x) { return P.g(x) + P.pen(x); };

    P.fnDef = {
      id: 'dproblem-' + mode + '-' + (mode === 'composite' ? lam.toFixed(3) : 'x'),
      name: Atlas.L('Section D objective', 'Целевая функция раздела D'),
      domain: P.domain,
      f: function (x) { return P.f(x); },
      grad: function (x) { return P.subgrad(x); },
      hess: function () { return A; }
    };
    return P;
  };

  /* High-accuracy reference solution, used as f* on the convergence chart.
     FISTA first, because the composite problem is only convex and plain
     proximal gradient would crawl there, then a short monotone polish. */
  Atlas.referenceSolution = function (P, set, setParams) {
    var t = 1 / P.L, i;
    function forward(x) {
      var gr = P.gradG(x);
      var y = P.prox([x[0] - t * gr[0], x[1] - t * gr[1]], t);
      return set ? set.project(y, setParams) : y;
    }
    var x = [0, 0], y = [0, 0], tk = 1, used = 0;
    for (i = 0; i < 20000; i++) {
      var xNew = forward(y);
      var tNew = 0.5 * (1 + Math.sqrt(1 + 4 * tk * tk));
      var beta = (tk - 1) / tNew;
      y = [xNew[0] + beta * (xNew[0] - x[0]), xNew[1] + beta * (xNew[1] - x[1])];
      tk = tNew;
      used++;
      if (num.dist(xNew, x) < 1e-16 && i > 20) { x = xNew; break; }
      x = xNew;
    }
    for (i = 0; i < 4000; i++) {                 /* monotone polish */
      var z = forward(x);
      used++;
      if (num.dist(z, x) < 1e-17) { x = z; break; }
      x = z;
    }
    return { x: x, f: P.f(x), iterations: used };
  };


})();
