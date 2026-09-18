// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// The numerics behind the widgets. The self-test runs the same functions on every canonical
// configuration and compares them with the values exported by the checks notebook
// (checks/02. Convexity, Constraints and Optimality Conditions.ipynb).
(function () {
  'use strict';
  var SEM = window.SEM;
  var M = (SEM.math = {});

  function finiteVec(v) {
    if (!Array.isArray(v) || !v.length) return false;
    for (var i = 0; i < v.length; i++) if (typeof v[i] !== 'number' || !isFinite(v[i])) return false;
    return true;
  }
  M.finiteVec = finiteVec;

  M.dot = function (a, b) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  };
  M.sub = function (a, b) {
    return a.map(function (v, i) { return v - b[i]; });
  };
  M.add = function (a, b) {
    return a.map(function (v, i) { return v + b[i]; });
  };
  M.scale = function (a, s) {
    return a.map(function (v) { return v * s; });
  };
  M.norm = function (a) {
    return Math.sqrt(M.dot(a, a));
  };

  /* ------------------------------------------------------------------ projections */

  M.projBall = function (x, center, radius) {
    if (!finiteVec(x) || !finiteVec(center) || !(radius >= 0)) return null;
    var d = M.sub(x, center);
    var dist = M.norm(d);
    if (dist <= radius) return x.slice();
    return M.add(center, M.scale(d, radius / dist));
  };

  M.projBox = function (x, lo, hi) {
    if (!finiteVec(x)) return null;
    return x.map(function (v, i) {
      var l = Array.isArray(lo) ? lo[i] : lo;
      var h = Array.isArray(hi) ? hi[i] : hi;
      return v < l ? l : v > h ? h : v;
    });
  };

  // The sort-based algorithm with its whole table: sorted values, cumulative sums,
  // test values, rho, theta and the projection in the original order.
  M.simplexTable = function (v) {
    if (!finiteVec(v)) return null;
    var u = v.slice().sort(function (a, b) { return b - a; });
    var s = [];
    var tests = [];
    var acc = 0;
    var rho = 1;
    for (var j = 0; j < u.length; j++) {
      acc += u[j];
      s.push(acc);
      tests.push(u[j] - (acc - 1) / (j + 1));
      if (tests[j] > 0) rho = j + 1;
    }
    var theta = (s[rho - 1] - 1) / rho;
    var x = v.map(function (t) { return Math.max(t - theta, 0); });
    return { u: u, s: s, tests: tests, rho: rho, theta: theta, x: x };
  };

  M.projSimplex = function (v) {
    var t = M.simplexTable(v);
    return t ? t.x : null;
  };

  // r^T (e_k - x) for every vertex e_k, with r = v - x.
  M.vertexProducts = function (v, x) {
    var r = M.sub(v, x);
    var rx = M.dot(r, x);
    return r.map(function (rk) { return rk - rx; });
  };

  M.projUnion = function (x, centers, radius) {
    var best = null;
    var bestD = Infinity;
    for (var i = 0; i < centers.length; i++) {
      var p = M.projBall(x, centers[i], radius);
      if (!p) return null;
      var d = M.norm(M.sub(x, p));
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  };

  M.projCapsule = function (x, a, b, radius) {
    if (!finiteVec(x)) return null;
    var ab = M.sub(b, a);
    var t = M.dot(M.sub(x, a), ab) / M.dot(ab, ab);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return M.projBall(x, M.add(a, M.scale(ab, t)), radius);
  };

  // Barycentric coordinates in the plane 1^T x = 1, drawn as an equilateral triangle
  // with side sqrt(2), which is an isometry of that plane.
  var S2 = Math.SQRT2;
  M.triangle = [[0, 0], [S2, 0], [S2 / 2, Math.sqrt(6) / 2]];
  M.toPlane = function (x) {
    var V = M.triangle;
    return [x[0] * V[0][0] + x[1] * V[1][0] + x[2] * V[2][0], x[0] * V[0][1] + x[1] * V[1][1] + x[2] * V[2][1]];
  };
  M.fromPlane = function (p) {
    var V = M.triangle;
    var det = (V[1][0] - V[0][0]) * (V[2][1] - V[0][1]) - (V[2][0] - V[0][0]) * (V[1][1] - V[0][1]);
    var l2 = ((p[0] - V[0][0]) * (V[2][1] - V[0][1]) - (V[2][0] - V[0][0]) * (p[1] - V[0][1])) / det;
    var l3 = ((V[1][0] - V[0][0]) * (p[1] - V[0][1]) - (p[0] - V[0][0]) * (V[1][1] - V[0][1])) / det;
    return [1 - l2 - l3, l2, l3];
  };

  /* ------------------------------------------------------------------ convexity */

  M.eigSym2 = function (a, b, d) {
    var tr = (a + d) / 2;
    var disc = Math.sqrt(((a - d) / 2) * ((a - d) / 2) + b * b);
    return [tr - disc, tr + disc];
  };

  M.classify = function (eigs, relTol) {
    var tol = relTol === undefined ? 1e-9 : relTol;
    var scale = 0;
    for (var i = 0; i < eigs.length; i++) scale = Math.max(scale, Math.abs(eigs[i]));
    if (!(scale > 0)) return scale === 0 ? 'zero' : 'invalid';
    var t = tol * scale;
    var pos = eigs.every(function (e) { return e > t; });
    var nonneg = eigs.every(function (e) { return e >= -t; });
    var neg = eigs.every(function (e) { return e < -t; });
    var nonpos = eigs.every(function (e) { return e <= t; });
    if (pos) return 'pd';
    if (nonneg) return 'psd';
    if (neg) return 'nd';
    if (nonpos) return 'nsd';
    return 'indefinite';
  };

  M.isPsd2 = function (H) {
    var e = M.eigSym2(H[0][0], H[0][1], H[1][1]);
    var c = M.classify(e);
    return c === 'pd' || c === 'psd' || c === 'zero';
  };

  // The functions of block A: value and Hessian.
  M.fns = {
    a1: {
      f: function (x, y, p) { return x * x + p.a * x * y + p.cyy * y * y + p.bx * x; },
      H: function (x, y, p) { return [[2, p.a], [p.a, 2 * p.cyy]]; }
    },
    a2: {
      f: function (x, y) { return x * x * y * y; },
      H: function (x, y) { return [[2 * y * y, 4 * x * y], [4 * x * y, 2 * x * x]]; }
    },
    w3: {
      f: function (x, y) { return x * x * x * x - 2 * x * x + y * y; },
      H: function (x) { return [[12 * x * x - 4, 0], [0, 2]]; }
    }
  };

  // The sets of the set tester as g(x, y) <= 0.
  M.sets = {
    disk: function (x, y, p) { return x * x + y * y - p.r * p.r; },
    annulus: function (x, y, p) { var q = x * x + y * y; return Math.max(p.r1 * p.r1 - q, q - p.r2 * p.r2); },
    T: function (x, y, p) { return Math.max(x * x + y * y - p.radius2, x * x - p.shift - y); },
    S: function (x, y) { return x * x * y * y - 1; }
  };

  // Jensen on seeded random pairs in the square [-w, w]^2; returns the number of violations.
  M.jensenPairs = function (f, n, halfWidth, seed) {
    var rnd = SEM.util.rng(seed);
    var count = 0;
    for (var k = 0; k < n; k++) {
      var x = [(2 * rnd() - 1) * halfWidth, (2 * rnd() - 1) * halfWidth];
      var y = [(2 * rnd() - 1) * halfWidth, (2 * rnd() - 1) * halfWidth];
      var t = rnd();
      var chord = (1 - t) * f(x[0], x[1]) + t * f(y[0], y[1]);
      var value = f((1 - t) * x[0] + t * y[0], (1 - t) * x[1] + t * y[1]);
      if (value - chord > 1e-9 * Math.max(Math.abs(chord), Math.abs(value))) count += 1;
    }
    return count;
  };

  /* ------------------------------------------------------------------ KKT by active sets */

  function solve(A, b) {
    var n = A.length;
    var T = A.map(function (row, i) { return row.concat([b[i]]); });
    for (var col = 0; col < n; col++) {
      var piv = col;
      for (var r = col + 1; r < n; r++) if (Math.abs(T[r][col]) > Math.abs(T[piv][col])) piv = r;
      if (Math.abs(T[piv][col]) < 1e-12) return null;
      var tmp = T[col];
      T[col] = T[piv];
      T[piv] = tmp;
      for (var rr = 0; rr < n; rr++) {
        if (rr === col) continue;
        var factor = T[rr][col] / T[col][col];
        for (var cc = col; cc <= n; cc++) T[rr][cc] -= factor * T[col][cc];
      }
    }
    return T.map(function (row, i) { return row[n] / row[i]; });
  }
  M.solve = solve;

  // min ||x - c||^2 s.t. A x <= b, E x = e: every active set with its candidate.
  M.kktEnumerate = function (c, A, b, E, e) {
    if (!finiteVec(c)) return [];
    E = E || [];
    e = e || [];
    var m = A.length;
    var p = E.length;
    var tol = 1e-9;
    var rows = [];
    for (var mask = 0; mask < 1 << m; mask++) {
      var S = [];
      for (var i = 0; i < m; i++) if (mask & (1 << i)) S.push(i);
      rows.push(S);
    }
    rows.sort(function (s1, s2) {
      return s1.length - s2.length || s1.join(',').localeCompare(s2.join(','));
    });
    var out = [];
    rows.forEach(function (S) {
      var W = E.concat(S.map(function (i) { return A[i]; }));
      var w = e.concat(S.map(function (i) { return b[i]; }));
      var mu = [];
      if (W.length) {
        var G = W.map(function (r1) { return W.map(function (r2) { return M.dot(r1, r2); }); });
        var rhs = W.map(function (r, k) { return M.dot(r, c) - w[k]; });
        var sol = solve(G, rhs);
        if (!sol) return;
        mu = sol.map(function (v) { return 2 * v; });
      }
      var lam = A.map(function () { return 0; });
      S.forEach(function (i, k) { lam[i] = mu[p + k]; });
      var x = c.map(function (ci, t) {
        var s = 0;
        for (var r = 0; r < W.length; r++) s += mu[r] * W[r][t];
        return ci - 0.5 * s;
      });
      var g = A.map(function (row, i) { return M.dot(row, x) - b[i]; });
      var primal = g.every(function (v) { return v <= tol; });
      var dual = lam.every(function (v) { return v >= -tol; });
      out.push({
        active: S.map(function (i) { return i + 1; }),
        x: x,
        lam: lam,
        nu: mu.slice(0, p),
        g: g,
        primal: primal,
        dual: dual,
        kkt: primal && dual,
        f: M.dot(M.sub(x, c), M.sub(x, c))
      });
    });
    return out;
  };

  M.kktSolution = function (c, A, b) {
    var rows = M.kktEnumerate(c, A, b);
    for (var i = 0; i < rows.length; i++) if (rows[i].kkt) return { rows: rows, best: rows[i] };
    return { rows: rows, best: null };
  };

  /* ------------------------------------------------------------------ projected gradient */

  M.projectedGradient = function (grad, x0, project, step, maxIter, tol) {
    var x = project(x0);
    if (!x) return null;
    var path = [x];
    for (var k = 1; k <= maxIter; k++) {
      var g = grad(x);
      var xn = project(x.map(function (v, i) { return v - step * g[i]; }));
      if (!xn) return null;
      path.push(xn);
      if (M.norm(M.sub(xn, x)) <= tol) return { x: xn, iterations: k, converged: true, path: path };
      x = xn;
    }
    return { x: x, iterations: maxIter, converged: false, path: path };
  };

  /* ------------------------------------------------------------------ duality */

  M.qC1 = function (lam) {
    return 2 * lam - (lam * lam) / 2;
  };
  M.qD2 = function (lam) {
    return lam > 0 ? -1 / (4 * lam) : -Infinity;
  };

  M.booleanPrimal = function () {
    var values = [];
    for (var a = -1; a <= 1; a += 2)
      for (var b = -1; b <= 1; b += 2)
        for (var c = -1; c <= 1; c += 2) values.push(a * b + b * c + a * c);
    return { values: values, pStar: Math.min.apply(null, values) };
  };

  // max -sum(nu) over a grid, subject to 1/2 (11^T - I) + diag(nu) PSD (all principal minors >= 0).
  M.booleanDualGrid = function (hi, step) {
    var best = -Infinity;
    var n = Math.round(hi / step);
    for (var i = 0; i <= n; i++) {
      for (var j = 0; j <= n; j++) {
        for (var k = 0; k <= n; k++) {
          var a = i * step;
          var b = j * step;
          var c = k * step;
          var h = 0.5;
          var tol = 1e-12;
          var m2 = [a * b - h * h, b * c - h * h, a * c - h * h];
          var det = a * (b * c - h * h) - h * (h * c - h * h) + h * (h * h - b * h);
          if (a >= -tol && b >= -tol && c >= -tol && m2[0] >= -tol && m2[1] >= -tol && m2[2] >= -tol && det >= -tol) {
            best = Math.max(best, -(a + b + c));
          }
        }
      }
    }
    return best;
  };
})();
