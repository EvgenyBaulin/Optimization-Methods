// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 02: the composition of the seminar page (blocks O, A-E), the problems overview, and the self-test
// checks of the widget numerics against the data exported by the checks notebook.
(function () {
  'use strict';
  var SEM = window.SEM;
  var util = SEM.util;
  var el = SEM.dom.el;

  /* ------------------------------------------------------------------ blocks of the seminar page */

  // O: the bridge from Seminar 1, the hook widget, and today's problems.
  function buildOpening(main, app) {
    var O = SEM.content.main.blocks.O;
    var sec = app.blockSection('O');
    var bridge = app.sub(sec, null, 'timeline.O.bridge', O.bridge.title);
    bridge.appendChild(app.rich('p', { class: 'lead' }, O.bridge.text));
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

  // D: three demos of what breaks without convexity or a constraint qualification.
  function buildDemos(main, app) {
    var D = SEM.content.main.blocks.D;
    var sec = app.blockSection('D');
    var cutOrder = el('p', { class: 'cut-note instructor-only' });
    SEM.i18n.bind(function () {
      cutOrder.textContent = SEM.tuf('blocks.cutDemos', { d2: util.data('timeline.D.D2'), d1: util.data('timeline.cut.DD1') });
    });
    sec.appendChild(cutOrder);
    var d1 = app.sub(sec, null, 'timeline.D.D1', D.D1.title);
    SEM.widgets.pgd(d1);
    var d2 = app.sub(sec, null, 'timeline.D.D2', D.D2.title);
    SEM.widgets.dualD2(d2);
    var d3 = app.sub(sec, null, 'timeline.D.D3', D.D3.title);
    SEM.widgets.dualD3(d3);
    SEM.kit.code(sec, 'pgd', D.code.title, D.code.text);
    main.appendChild(sec);
  }

  function buildMain(main, app) {
    buildOpening(main, app);
    app.buildProblemBlock(main, 'A', { board: ['A1'], students: ['A2', 'A3'], widgets: ['sets', 'functions', 'sublevel'], code: 'convexity' });
    app.buildProblemBlock(main, 'B', { board: ['B1'], students: ['B2', 'B3'], widgets: ['projections'], code: ['projBall', 'projBox', 'projSimplex'] });
    app.buildProblemBlock(main, 'C', { board: ['C1'], students: ['C2', 'C3'], widgets: ['kkt'], code: 'kkt' });
    buildDemos(main, app);
    app.buildWrap(main, 'E');
  }

  // The overview dialog: the text of block O above the problems of A, B and C.
  function buildOverview(body, app) {
    body.appendChild(app.rich('p', { class: 'dialog-note' }, SEM.content.main.blocks.O.overview.text));
    app.overviewGrid(body);
  }

  /* ------------------------------------------------------------------ self-test */

  // The widget numerics reproduce the exported data on every canonical configuration.
  // Runs only where the numerics are loaded (the seminar page, index.html).
  function dataChecks(results, check) {
    var M = SEM.math;
    var d = util.data;
    if (!M) return;
    var group = 'data';

    var ball = d('hook.ball');
    check(group, 'hook: ball projection', M.projBall(ball.c, [0, 0], ball.r), ball.x);
    var hs = M.simplexTable(d('hook.simplex.c'));
    check(group, 'hook: simplex projection', hs.x, d('hook.simplex.x'));
    check(group, 'hook: simplex theta', hs.theta, d('hook.simplex.theta'));

    var A1 = d('A1.params');
    var pa = { a: A1.aTest, cyy: A1.cyy, bx: A1.bx };
    var m = [(A1.p[0] + A1.q[0]) / 2, (A1.p[1] + A1.q[1]) / 2];
    check(group, 'A1: f(p), f(q), f(m)', [M.fns.a1.f(A1.p[0], A1.p[1], pa), M.fns.a1.f(A1.q[0], A1.q[1], pa), M.fns.a1.f(m[0], m[1], pa)], [d('A1.steps.fp'), d('A1.steps.fq'), d('A1.steps.fm')]);
    var H = M.fns.a1.H(0, 0, pa);
    check(group, 'A1: det H at a test', H[0][0] * H[1][1] - H[0][1] * H[1][0], d('A1.steps.detTest'));
    var He = M.fns.a1.H(0, 0, { a: A1.aEdge, cyy: A1.cyy, bx: A1.bx });
    check(group, 'A1: eigenvalues at the edge', M.eigSym2(He[0][0], He[0][1], He[1][1]), d('A1.steps.eigEdge'), 1e-9);
    var lo = null;
    var hi = null;
    for (var k = -6000; k <= 6000; k++) {
      var a = k / 1000;
      if (M.isPsd2(M.fns.a1.H(0, 0, { a: a, cyy: A1.cyy, bx: A1.bx }))) {
        if (lo === null) lo = a;
        hi = a;
      }
    }
    check(group, 'A1: convexity interval by an eigenvalue scan', [lo, hi], d('A1.answer.interval.value'), 2e-3);

    var A2 = d('A2.params');
    var H2 = M.fns.a2.H(A2.point[0], A2.point[1]);
    check(group, 'A2: det H at the point', H2[0][0] * H2[1][1] - H2[0][1] * H2[1][0], d('A2.steps.detPoint'));
    check(group, 'A2: eigenvalues at the point', M.eigSym2(H2[0][0], H2[0][1], H2[1][1]), d('A2.steps.eig'));
    check(group, 'A2: f at the midpoint', M.fns.a2.f((A2.p[0] + A2.q[0]) / 2, (A2.p[1] + A2.q[1]) / 2), d('A2.steps.fm'));

    var pairs = d('A3.params.pairs');
    var proving = Object.keys(pairs).filter(function (key) {
      var p = pairs[key].p;
      var q = pairs[key].q;
      return M.sets.S(p[0], p[1]) <= 1e-12 && M.sets.S(q[0], q[1]) <= 1e-12 && M.sets.S((p[0] + q[0]) / 2, (p[1] + q[1]) / 2) > 1e-12;
    });
    check(group, 'A3: the only proving pair', proving.join(','), d('A3.answer.pair.value'));
    var m3 = d('A3.steps.m');
    check(group, 'A3: x^2 y^2 at the midpoint', m3[0] * m3[0] * m3[1] * m3[1], d('A3.steps.val'));

    ['B1', 'B3'].forEach(function (pid) {
      var t = M.simplexTable(d(pid + '.params.v'));
      check(group, pid + ': sorted values', t.u, d(pid + '.steps.u'));
      check(group, pid + ': cumulative sums', t.s, d(pid + '.steps.s'));
      check(group, pid + ': test values', t.tests, d(pid + '.steps.tests'));
      check(group, pid + ': rho and theta', [t.rho, t.theta], [d(pid + '.steps.rho'), d(pid + '.steps.theta')]);
      check(group, pid + ': projection', t.x, d(pid + '.steps.x'));
      check(group, pid + ': vertex products', M.vertexProducts(d(pid + '.params.v'), t.x), d(pid + '.steps.vertex'));
    });
    var B2 = d('B2.params');
    var pb = M.projBall(B2.x, [0, 0], B2.r);
    var pq = M.projBox(B2.x, B2.lo, B2.hi);
    check(group, 'B2: ball projection', pb, d('B2.steps.ball'));
    check(group, 'B2: box projection', pq, d('B2.steps.box'));
    check(group, 'B2: distances', [M.norm(M.sub(B2.x, pb)), M.norm(M.sub(B2.x, pq))], [d('B2.steps.distBall'), d('B2.steps.distBox')]);

    ['C1', 'C2', 'C3'].forEach(function (pid) {
      var P = d(pid + '.params');
      M.kktEnumerate(P.c, P.A, P.b).forEach(function (r) {
        var key = 'S' + (r.active.join('') || '0');
        var ref = d(pid + '.cand.' + key);
        check(group, pid + ': candidate ' + key, [r.x, r.lam, r.g, r.primal, r.dual, r.kkt], ref ? [ref.x, ref.lam, ref.g, ref.primal, ref.dual, ref.kkt] : undefined);
      });
    });

    var D1 = d('D1.params');
    var grad = function (x) { return [2 * (x[0] - D1.c[0]), 2 * (x[1] - D1.c[1])]; };
    D1.starts.forEach(function (s, i) {
      var u = M.projectedGradient(grad, s, function (x) { return M.projUnion(x, D1.centers, D1.radius); }, D1.step, D1.maxIter, D1.tol);
      var c = M.projectedGradient(grad, s, function (x) { return M.projCapsule(x, D1.centers[0], D1.centers[1], D1.radius); }, D1.step, D1.maxIter, D1.tol);
      check(group, 'D1: start ' + (i + 1) + ' on the union', u.x, d('D1.result.endsUnion')[i], 1e-8);
      check(group, 'D1: start ' + (i + 1) + ' on the convex hull', c.x, d('D1.result.endsCapsule')[i], 1e-8);
    });
    check(group, 'D2: dual function samples', d('D2.samples.lam').map(M.qD2), d('D2.samples.q'));
    check(group, 'D3: dual function samples', d('D3.convex.samples.lam').map(M.qC1), d('D3.convex.samples.q'));
    var bp = M.booleanPrimal();
    check(group, 'D3: Boolean p*', bp.pStar, d('D3.bool.pStar'));
    check(group, 'D3: Boolean d* by a grid', M.booleanDualGrid(1.5, 0.05), d('D3.bool.dStar'), 1e-9);

    check(group, 'exit E2: projection', M.projSimplex(d('exit.E2.v')), d('exit.E2.x'));
    var H2h = d('home.H2');
    var P2 = M.projBall(H2h.x, H2h.c, H2h.r);
    check(group, 'home H2: projection', P2, H2h.P);
    check(group, 'home H2: obtuse-angle product', M.dot(M.sub(H2h.x, P2), M.sub(H2h.y, P2)), H2h.prod);
    var H3 = d('home.H3');
    var rows = M.kktEnumerate([0, 0], [[-1, 0]], [-H3.bound], [[1, 2]], [H3.rhs]).filter(function (r) { return r.kkt; });
    check(group, 'home H3: x, lambda, nu', rows.length ? [rows[0].x, rows[0].lam[0], rows[0].nu[0]] : null, [H3.x, H3.lam, H3.nu]);
    var H4 = d('home.H4');
    var run = M.projectedGradient(function (x) {
      return x.map(function (t, i) { return H4.q[i] * t - H4.p[i]; });
    }, H4.x0, M.projSimplex, H4.step, 2000, 1e-13);
    check(group, 'home H4: projected gradient', run.x, H4.x, 1e-8);
  }

  SEM.seminar = {
    blocks: ['O', 'A', 'B', 'C', 'D', 'E'],
    timerDefault: 'timeline.sec.A.P23',
    buildMain: buildMain,
    buildOverview: buildOverview,
    dataChecks: dataChecks
  };
})();
