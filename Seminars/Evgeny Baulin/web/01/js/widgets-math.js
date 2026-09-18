// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// The numerics behind the Seminar 01 widgets. The self-test (dataChecks in js/seminar.js) runs the same
// functions on every canonical configuration and compares them with the values exported by the checks notebook.
(function () {
  'use strict';
  var SEM = window.SEM;
  var M = (SEM.math = {});

  /* ------------------------------------------------------------------ vectors (copied from Seminar 02) */

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

  /* ------------------------------------------------------------------ symmetric 2x2 matrices (copied from Seminar 02) */

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

  // Unit eigenvectors [u(lambda_min), u(lambda_max)] of [[a, b], [b, d]].
  M.eigvec2 = function (a, b, d) {
    if (Math.abs(b) > 1e-12) {
      return M.eigSym2(a, b, d).map(function (l) {
        var n = Math.sqrt((l - d) * (l - d) + b * b);
        return [(l - d) / n, b / n];
      });
    }
    return a <= d ? [[1, 0], [0, 1]] : [[0, 1], [1, 0]];
  };

  /* ------------------------------------------------------------------ minors and the second-order test */

  function isSquare(A) {
    if (!Array.isArray(A) || !A.length || A.length > 3) return false;
    for (var i = 0; i < A.length; i++) if (!finiteVec(A[i]) || A[i].length !== A.length) return false;
    return true;
  }

  function submatrix(A, idx) {
    return idx.map(function (i) {
      return idx.map(function (j) { return A[i][j]; });
    });
  }

  // Index sets of size k from 0..n-1 in lexicographic order.
  function combinations(n, k) {
    var out = [];
    (function rec(start, acc) {
      if (acc.length === k) {
        out.push(acc.slice());
        return;
      }
      for (var i = start; i < n; i++) {
        acc.push(i);
        rec(i + 1, acc);
        acc.pop();
      }
    })(0, []);
    return out;
  }

  // Determinant of a 1x1, 2x2 or 3x3 matrix; 3x3 by the first-row cofactor expansion with sign (-1)^(1+j), j = 1..3.
  M.det = function (A) {
    if (!isSquare(A)) return null;
    if (A.length === 1) return A[0][0];
    if (A.length === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
    var s = 0;
    for (var j = 0; j < 3; j++) {
      var cols = [0, 1, 2].filter(function (c) { return c !== j; });
      var minor = [1, 2].map(function (i) {
        return cols.map(function (c) { return A[i][c]; });
      });
      s += (j % 2 === 0 ? 1 : -1) * A[0][j] * M.det(minor);
    }
    return s;
  };

  M.leadingMinors = function (A) {
    if (!isSquare(A)) return null;
    var out = [];
    var idx = [];
    for (var k = 0; k < A.length; k++) {
      idx.push(k);
      out.push(M.det(submatrix(A, idx)));
    }
    return out;
  };

  // All principal minors, by size, index sets in lexicographic order: 2x2 -> [a11, a22, det], 3x3 -> 7 values.
  M.principalMinors = function (A) {
    if (!isSquare(A)) return null;
    var out = [];
    for (var k = 1; k <= A.length; k++) {
      combinations(A.length, k).forEach(function (idx) { out.push(M.det(submatrix(A, idx))); });
    }
    return out;
  };

  // Sylvester's criterion on the leading minors: 'pd', 'nd' or 'silent'.
  M.sylvester = function (minors) {
    if (!finiteVec(minors)) return null;
    var pd = true;
    var nd = true;
    for (var k = 1; k <= minors.length; k++) {
      if (!(minors[k - 1] > 1e-12)) pd = false;
      if (!((k % 2 === 0 ? 1 : -1) * minors[k - 1] > 1e-12)) nd = false;
    }
    return pd ? 'pd' : nd ? 'nd' : 'silent';
  };

  // The notebook's classify on a list of eigenvalues: 'min', 'max', 'saddle' or 'inconclusive'.
  M.secondOrder = function (eigs, relTol) {
    if (!finiteVec(eigs)) return 'inconclusive';
    var tol = (relTol === undefined ? 1e-9 : relTol) * Math.max.apply(null, eigs.map(function (e) { return Math.abs(e); }));
    var lo = Math.min.apply(null, eigs);
    var hi = Math.max.apply(null, eigs);
    if (lo > tol) return 'min';
    if (hi < -tol) return 'max';
    if (lo < -tol && hi > tol) return 'saddle';
    return 'inconclusive';
  };

  /* ------------------------------------------------------------------ the functions of the widgets */

  // f(x, y, p), gradient g(x, y, p) -> [2], Hessian H(x, y, p) -> [[2]]; degree only for homogeneous functions.
  M.fns = {
    hookBowl: {
      f: function (x, y) { return x * x + x * y + y * y; },
      g: function (x, y) { return [2 * x + y, x + 2 * y]; },
      H: function () { return [[2, 1], [1, 2]]; },
      degree: 2
    },
    saddle: {
      f: function (x, y) { return x * x - y * y; },
      g: function (x, y) { return [2 * x, -2 * y]; },
      H: function () { return [[2, 0], [0, -2]]; },
      degree: 2
    },
    lecture: {
      f: function (x, y) { return 3 * x * x * x + 2 * x * y * y + 4 * y * y; },
      g: function (x, y) { return [9 * x * x + 2 * y * y, 4 * x * y + 8 * y]; },
      H: function (x, y) { return [[18 * x, 4 * y], [4 * y, 4 * x + 8]]; }
    },
    bowl: {
      f: function (x, y) { return x * x + y * y; },
      g: function (x, y) { return [2 * x, 2 * y]; },
      H: function () { return [[2, 0], [0, 2]]; },
      degree: 2
    },
    monkey: {
      f: function (x, y) { return x * x * x - 3 * x * y * y; },
      g: function (x, y) { return [3 * x * x - 3 * y * y, -6 * x * y]; },
      H: function (x, y) { return [[6 * x, -6 * y], [-6 * y, -6 * x]]; },
      degree: 3
    },
    quartic: {
      f: function (x, y) { return x * x * x * x + y * y * y * y; },
      g: function (x, y) { return [4 * x * x * x, 4 * y * y * y]; },
      H: function (x, y) { return [[12 * x * x, 0], [0, 12 * y * y]]; },
      degree: 4
    },
    family: {
      f: function (x, y, p) { return x * x + y * y + p.a * x * y; },
      g: function (x, y, p) { return [2 * x + p.a * y, 2 * y + p.a * x]; },
      H: function (x, y, p) { return [[2, p.a], [p.a, 2]]; }
    },
    ellipse: {
      f: function (x, y) { return x * x + 2 * y * y; },
      g: function (x, y) { return [2 * x, 4 * y]; },
      H: function () { return [[2, 0], [0, 4]]; }
    }
  };

  // The one-dimensional slice g(t) = sum_k num[k] t^k / den and its first two derivatives.
  M.slice = function (t, num, den) {
    var s = 0;
    for (var k = 0; k < num.length; k++) s += num[k] * Math.pow(t, k);
    return s / den;
  };
  M.sliceD1 = function (t, num, den) {
    var s = 0;
    for (var k = 1; k < num.length; k++) s += k * num[k] * Math.pow(t, k - 1);
    return s / den;
  };
  M.sliceD2 = function (t, num, den) {
    var s = 0;
    for (var k = 2; k < num.length; k++) s += k * (k - 1) * num[k] * Math.pow(t, k - 2);
    return s / den;
  };

  // For a homogeneous fn of degree k: f(t cos(theta), t sin(theta)) = c t^k with c = f(cos(theta), sin(theta)); theta in degrees.
  M.restrictCoef = function (fn, thetaDeg) {
    var th = (thetaDeg * Math.PI) / 180;
    return fn.f(Math.cos(th), Math.sin(th), {});
  };

  /* ------------------------------------------------------------------ convex sets */

  M.norms = {
    l2: function (v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1]); },
    l1: function (v) { return Math.abs(v[0]) + Math.abs(v[1]); },
    linf: function (v) { return Math.max(Math.abs(v[0]), Math.abs(v[1])); }
  };

  // The sets of the set tester as g(x, y, p) <= 0, p = {r, r1, r2}.
  M.sets = {
    disk: function (x, y, p) { return M.norms.l2([x, y]) - p.r; },
    diamond: function (x, y, p) { return M.norms.l1([x, y]) - p.r; },
    square: function (x, y, p) { return M.norms.linf([x, y]) - p.r; },
    ring: function (x, y, p) {
      var n = M.norms.l2([x, y]);
      return Math.max(p.r1 - n, n - p.r2);
    }
  };

  // Does the segment from p to q leave {g <= 0}? Interior samples i/n, i = 1..n-1.
  M.segmentLeaves = function (g, p, q, n) {
    var N = n || 400;
    for (var i = 1; i < N; i++) {
      var s = i / N;
      if (g((1 - s) * p[0] + s * q[0], (1 - s) * p[1] + s * q[1]) > 1e-12) return true;
    }
    return false;
  };

  /* ------------------------------------------------------------------ feasible directions for {z: A z <= b} */

  // 1-based indices of the active rows.
  M.activeRows = function (A, b, x, tol) {
    var t = tol === undefined ? 1e-9 : tol;
    var out = [];
    for (var i = 0; i < A.length; i++) if (Math.abs(M.dot(A[i], x) - b[i]) <= t) out.push(i + 1);
    return out;
  };

  M.isFeasibleDir = function (A, b, x, s, tol) {
    var t = tol === undefined ? 1e-9 : tol;
    if (!finiteVec(s) || !(M.norm(s) > 0)) return false;
    return M.activeRows(A, b, x, t).every(function (i) { return M.dot(A[i - 1], s) <= t; });
  };

  // The smallest g^T s over feasible unit directions s in the plane: {s, slope}, or null when there is no candidate.
  M.worstUnitSlope = function (A, b, x, g) {
    var cands = [];
    var ng = M.norm(g);
    if (ng > 0) cands.push(M.scale(g, -1 / ng));
    M.activeRows(A, b, x).forEach(function (i) {
      var a = A[i - 1];
      var na = M.norm(a);
      cands.push([-a[1] / na, a[0] / na]);
      cands.push([a[1] / na, -a[0] / na]);
    });
    var best = null;
    cands.forEach(function (s) {
      if (!M.isFeasibleDir(A, b, x, s)) return;
      var slope = M.dot(g, s);
      if (best === null || slope < best.slope) best = { s: s, slope: slope };
    });
    return best;
  };

  /* ------------------------------------------------------------------ directional derivatives */

  M.secantSlope = function (fn, x, d, alpha) {
    return (fn.f(x[0] + alpha * d[0], x[1] + alpha * d[1], {}) - fn.f(x[0], x[1], {})) / alpha;
  };

  M.dirDeriv = function (fn, x, d) {
    return M.dot(d, fn.g(x[0], x[1], {}));
  };
})();
