// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 01: the composition of main.html (blocks O, A-E), the problems overview, and the self-test
// checks of the widget numerics against the data exported by the checks notebook.
(function () {
  'use strict';
  var SEM = window.SEM;
  var util = SEM.util;
  var el = SEM.dom.el;

  /* ------------------------------------------------------------------ blocks of main.html */

  // The problem blocks: F1 specs, plus the instructor cut note placed right after the block head.
  var GROUPS = {
    A: { board: ['A1'], students: ['A2', 'A3'], ownTime: 'P23', ownNote: 'blocks.ownNote', widgets: ['probe'], code: 'centralDiff' },
    B: { board: ['B1'], students: ['B2', 'B3', 'B4'], ownTime: 'P234', ownNote: 'blocks.ownNoteThree', reviewNote: 'blocks.reviewB', widgets: ['definiteness', 'lines'], code: ['classify', 'minors'], cut: { note: 'blocks.cutB', time: 'timeline.cut.BP1' } },
    C: { board: ['C1'], students: ['C2'], ownTime: 'P2', ownNote: 'blocks.ownNoteOne', widgets: ['convexSets', 'family'], code: 'convexity', cut: { note: 'blocks.cutC', time: 'timeline.cut.CP1' } },
    D: { board: ['D1'], students: ['D2'], ownTime: 'P2', ownNote: 'blocks.ownNoteOne', widgets: ['feasible', 'secant'], code: ['feasible', 'dirDeriv'], cut: { note: 'blocks.cutD', time: 'timeline.cut.DP2' } }
  };

  // O: training is minimization, the hook widget, and today's problems.
  function buildOpening(main, app) {
    var O = SEM.content.main.blocks.O;
    var sec = app.blockSection('O');
    var goals = app.sub(sec, null, 'timeline.O.goals', O.goals.title);
    goals.appendChild(app.rich('p', { class: 'lead' }, O.goals.text));
    var ol = el('ol', { class: 'summary' });
    O.goals.items.forEach(function (it) {
      ol.appendChild(app.rich('li', null, it));
    });
    goals.appendChild(ol);
    var hook = app.sub(sec, null, 'timeline.O.hook', O.hook.title);
    hook.appendChild(app.rich('p', null, O.hook.text));
    SEM.widgets.hook(hook);
    var ov = app.sub(sec, null, 'timeline.O.overview', O.overview.title);
    ov.appendChild(app.rich('p', null, O.overview.text));
    var btn = app.text('button', { type: 'button', class: 'btn btn-primary' }, 'blocks.openOverview');
    btn.addEventListener('click', function () {
      app.openDialog('overview');
    });
    ov.appendChild(btn);
    main.appendChild(sec);
  }

  // An instructor-only cut note right after the block head (children[0] is the head).
  function cutNote(sec, cut) {
    var p = el('p', { class: 'cut-note instructor-only' });
    SEM.i18n.bind(function () {
      p.textContent = SEM.tuf(cut.note, { time: util.data(cut.time) });
    });
    sec.insertBefore(p, sec.children[1] || null);
  }

  function buildMain(main, app) {
    buildOpening(main, app);
    ['A', 'B', 'C', 'D'].forEach(function (b) {
      var sec = app.buildProblemBlock(main, b, GROUPS[b]);
      if (GROUPS[b].cut) cutNote(sec, GROUPS[b].cut);
    });
    app.buildWrap(main, 'E');
  }

  // The overview dialog: the text of block O above the problems of A, B, C and D in a 2 x 2 grid.
  function buildOverview(body, app) {
    body.appendChild(app.rich('p', { class: 'dialog-note' }, SEM.content.main.blocks.O.overview.text));
    app.overviewGrid(body).classList.add('two');
  }

  /* ------------------------------------------------------------------ self-test */

  function dataChecks(results, check) {
    var M = SEM.math;
    var d = util.data;
    if (!M) return; // theory.html and cheatsheet.html load seminar.js without the widget numerics
    var group = 'data';
    function eig2(H) {
      return M.eigSym2(H[0][0], H[0][1], H[1][1]);
    }

    // 1-4: hook
    var pb = d('hook.bowl.point');
    var ps = d('hook.saddle.point');
    check(group, 'hook: gradients vanish at p1 and p2', [M.fns.hookBowl.g(pb[0], pb[1]), M.fns.saddle.g(ps[0], ps[1])], [d('hook.bowl.grad'), d('hook.saddle.grad')]);
    var Hb = M.fns.hookBowl.H(0, 0);
    var Hs = M.fns.saddle.H(0, 0);
    var pr = d('hook.probe');
    check(group, 'hook: Hessians, eigenvalues and values at the probe point for p1 and p2',
      [Hb, Hs, eig2(Hb), eig2(Hs), M.fns.hookBowl.f(pr[0], pr[1]), M.fns.saddle.f(pr[0], pr[1])],
      [d('hook.bowl.H'), d('hook.saddle.H'), d('hook.bowl.eig'), d('hook.saddle.eig'), d('hook.bowl.fProbe'), d('hook.saddle.fProbe')]);
    var num = d('hook.slice.num');
    var den = d('hook.slice.den');
    var ts = d('hook.slice.points');
    var values = ts.map(function (t) { return M.slice(t, num, den); });
    var curvs = ts.map(function (t) { return M.sliceD2(t, num, den); });
    check(group, 'hook: slice values, slopes and curvatures', [values, ts.map(function (t) { return M.sliceD1(t, num, den); }), curvs], [d('hook.slice.values'), [0, 0, 0], d('hook.slice.d2')]);
    var kinds = [M.secondOrder(eig2(Hb)), M.secondOrder(eig2(Hs))].concat(curvs.map(function (c) { return M.secondOrder([c]); }));
    check(group, 'hook: kinds and the global minimum', [kinds, 3 + values.indexOf(Math.min.apply(null, values))], [d('hook.kinds'), d('hook.globalIndex')]);

    // 5-9: block A
    var L = M.fns.lecture;
    var xl = d('A.lecture.x');
    var HL = L.H(xl[0], xl[1]);
    check(group, 'A: lecture example at the point of the lecture', [L.g(xl[0], xl[1]), HL, M.det(HL), eig2(HL), L.f(xl[0], xl[1])], [d('A.lecture.grad'), d('A.lecture.H'), d('A.lecture.det'), d('A.lecture.eig'), d('A.lecture.f')]);
    var xo = d('A.lecture.stationary');
    var HO = L.H(xo[0], xo[1]);
    check(group, 'A: lecture example at the origin', [L.g(xo[0], xo[1]), HO, eig2(HO), M.secondOrder(eig2(HO))], [[0, 0], d('A.lecture.H0'), d('A.lecture.eig0'), 'inconclusive']);
    check(group, 'A1: eigenvalues', eig2(d('A1.steps.H')), d('A1.steps.eig'));
    var x2 = d('A2.params.x');
    var H2 = L.H(x2[0], x2[1]);
    check(group, 'A2: gradient, Hessian, determinant and eigenvalues', [L.g(x2[0], x2[1]), H2, M.det(H2), eig2(H2), L.f(x2[0], x2[1])], [d('A2.steps.grad'), d('A2.steps.H'), d('A2.steps.det'), d('A2.steps.eig'), d('A2.steps.f')]);
    var H3 = d('A3.steps.H');
    check(group, 'A3: leading and principal minors', [M.leadingMinors(H3), M.principalMinors(H3)], [d('A3.steps.minors'), d('A3.steps.principal')]);

    // 10-14: block B
    ['bowl', 'saddle', 'family', 'trapNeg', 'trapPos'].forEach(function (id) {
      var P = d('B.definiteness.presets.' + id);
      var lead = M.leadingMinors(P);
      var e = eig2(P);
      var E = 'B.definiteness.expect.' + id;
      check(group, 'B: Sylvester lab preset ' + id, [lead, M.principalMinors(P), e, M.classify(e), M.sylvester(lead)], [d(E + '.leading'), d(E + '.principal'), d(E + '.eig'), d(E + '.cls'), d(E + '.sylvester')]);
    });
    var angles = d('B.lines.angles');
    ['bowl', 'saddle', 'monkey', 'quartic'].forEach(function (fn) {
      var coefs = angles.map(function (th) { return M.restrictCoef(M.fns[fn], th); });
      check(group, 'B: restriction coefficients of ' + fn, [coefs, M.fns[fn].degree], [d('B.lines.coef.' + fn), d('B.lines.degree.' + fn)]);
    });
    function zeroAngles(fn) {
      var out = [];
      for (var th = 0; th < 180; th++) if (Math.abs(M.restrictCoef(M.fns[fn], th)) < 1e-9) out.push(th);
      return out;
    }
    var dirs3 = [[1, 0], [0, 1], [Math.sqrt(3), 1], [1, 1]];
    check(group, 'B3: lines where the monkey saddle vanishes', [zeroAngles('monkey'), dirs3.map(function (v) { return M.fns.monkey.f(v[0], v[1]); })], [d('B.lines.zeroAngles.monkey'), d('B3.steps.dirValues')]);
    check(group, 'B2: lines where the saddle vanishes', zeroAngles('saddle'), d('B.lines.zeroAngles.saddle'));
    var xb = [1.3, -0.7];
    check(group, 'B1: one gradient step with step 1/2', M.sub(xb, M.scale(M.fns.bowl.g(xb[0], xb[1]), d('B1.steps.step'))), [0, 0]);

    // 15-17: block C
    var par = { r: d('C.sets.r'), r1: d('C.sets.ring.1'), r2: d('C.sets.ring.2') };
    var lam = d('C.sets.lambda');
    var normOf = { disk: 'l2', diamond: 'l1', square: 'linf', ring: 'l2' };
    ['disk', 'diamond', 'square', 'ring'].forEach(function (set) {
      var pq = d('C.sets.defaults.' + set);
      var p = pq[0];
      var q = pq[1];
      var g = function (x, y) { return M.sets[set](x, y, par); };
      var z = M.add(M.scale(p, lam), M.scale(q, 1 - lam));
      var nrm = M.norms[normOf[set]];
      var E = 'C.sets.expect.' + set;
      check(group, 'C: set tester canonical pair ' + set, [M.segmentLeaves(g, p, q), z, nrm(z), lam * nrm(p) + (1 - lam) * nrm(q)], [d(E + '.leaves'), d(E + '.z'), d(E + '.nz'), d(E + '.rhs')]);
    });
    var samples = d('C.family.samples.a').map(function (a) { return eig2(M.fns.family.H(0, 0, { a: a })); });
    check(group, 'C: family eigenvalues and classes', [samples, samples.map(function (e) { return M.classify(e); })], [d('C.family.samples.eig'), d('C.family.samples.cls')]);
    var lo = null;
    var hi = null;
    for (var k = -6000; k <= 6000; k++) {
      if (M.isPsd2(M.fns.family.H(0, 0, { a: k / 1000 }))) {
        if (lo === null) lo = k / 1000;
        hi = k / 1000;
      }
    }
    check(group, 'C2: convexity interval by an eigenvalue scan', [[lo, hi], M.leadingMinors(d('C2.steps.H'))], [d('C2.answer.interval.value'), d('C2.steps.minors')], 2e-3);

    // 18-21: block D
    var A = d('D.feasible.A');
    var b = d('D.feasible.b');
    var grad = d('D.feasible.grad');
    var x1 = d('D1.params.x');
    var dirs = d('D.feasible.probe.dirs');
    check(group, 'D: feasible directions at the D1 point',
      [M.activeRows(A, b, x1), dirs.map(function (s) { return M.isFeasibleDir(A, b, x1, s); }), dirs.map(function (s) { return M.dot(s, grad); })],
      [d('D1.steps.active'), d('D.feasible.probe.feasible'), d('D.feasible.probe.slopes')]);
    ['edge', 'corner', 'interior'].forEach(function (preset) {
      var xp = d('D.feasible.presets.' + preset);
      var w = M.worstUnitSlope(A, b, xp, grad);
      var slope = w ? w.slope : null;
      if (preset === 'corner') {
        check(group, 'D: worst unit slope at corner', [slope, slope, M.activeRows(A, b, xp)], [d('D.feasible.worst.corner'), d('home.H3.steps.minSlope'), d('home.H3.steps.active')]);
      } else {
        check(group, 'D: worst unit slope at ' + preset, slope, d('D.feasible.worst.' + preset));
      }
    });
    var F = M.fns.ellipse;
    var xd = d('D2.params.x');
    var alphas = d('D.secant.alphas');
    ['s', 'unit', 'steepest'].forEach(function (dir) {
      var v = d('D.secant.dirs.' + dir);
      check(group, 'D: secant slopes for ' + dir, [alphas.map(function (a) { return M.secantSlope(F, xd, v, a); }), M.dirDeriv(F, xd, v)], [d('D.secant.slopes.' + dir), d('D.secant.limits.' + dir)]);
    });
    check(group, 'D2: gradient, rates and the length of s',
      [F.g(xd[0], xd[1]), M.dirDeriv(F, xd, d('D.secant.dirs.unit')), M.dirDeriv(F, xd, d('D.secant.dirs.steepest')), M.norm(d('D2.params.s'))],
      [d('D2.steps.grad'), d('D2.steps.perLength'), d('D2.steps.steepest'), d('D2.steps.normS')]);

    // 22-25: exit ticket and home practice
    check(group, 'exit E3: equal leading minors', [M.leadingMinors([[1, 0, 0], [0, 0, 0], [0, 0, -1]]), M.leadingMinors([[1, 0, 0], [0, 0, 0], [0, 0, 1]])], [d('exit.E3.minors'), d('exit.E3.minors')]);
    var e1 = eig2(d('home.H1.steps.H0'));
    check(group, 'home H1: eigenvalues and the verdict', [e1, M.secondOrder(e1)], [d('home.H1.steps.eig'), 'inconclusive']);
    var aSelf = d('home.H2.params.aSelf');
    var pH2 = d('home.H2.params.p');
    check(group, 'home H2: eigenvalues and the value at p for a = aSelf', [eig2(M.fns.family.H(0, 0, { a: aSelf })), M.fns.family.f(pH2[0], pH2[1], { a: aSelf })], [d('home.H2.steps.eigSelf'), d('home.H2.steps.value')]);
    var H4 = { A1: 'A1.steps.H', A2: 'A2.steps.H', B1: 'B1.steps.H', B2: 'B2.steps.H', B3: 'B3.steps.H0', B4: 'B4.steps.H0', C2: 'C2.steps.H', H1: 'home.H1.steps.H0', sylNeg: 'B.definiteness.presets.trapNeg', sylPos: 'B.definiteness.presets.trapPos' };
    var ids = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'B4', 'C2', 'H1', 'sylNeg', 'sylPos'];
    var labels = ids.map(function (id) {
      if (id === 'A3') return M.sylvester(M.leadingMinors(d('A3.steps.H'))) === 'pd' ? 'min' : 'not pd';
      return M.secondOrder(eig2(d(H4[id])));
    });
    var tally = ['min', 'saddle', 'inconclusive', 'max'];
    check(group, 'home H4: classify labels',
      [labels, tally.map(function (c) { return labels.filter(function (l) { return l === c; }).length; })],
      [ids.map(function (id) { return d('home.H4.labels.' + id); }), tally.map(function (c) { return d('home.H4.counts.' + c); })]);
  }

  SEM.seminar = {
    blocks: ['O', 'A', 'B', 'C', 'D', 'E'],
    groups: GROUPS,
    timerDefault: 'timeline.sec.A.P23',
    buildMain: buildMain,
    buildOverview: buildOverview,
    dataChecks: dataChecks
  };
})();
