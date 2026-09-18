// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Block C widgets: the convex set tester (four sets, a segment and the norm chain) and the quadratic family with its eigen-directions.
(function () {
  'use strict';
  var SEM = window.SEM;
  var M = SEM.math;
  var kit = SEM.kit;
  var util = SEM.util;
  var render = SEM.render;
  var el = SEM.dom.el;

  // Two numbers or vectors match when every component differs by at most 1e-9.
  function matches(a, b) {
    var u = [].concat(a);
    var v = [].concat(b);
    if (u.length !== v.length) return false;
    for (var i = 0; i < u.length; i++) if (!(Math.abs(u[i] - v[i]) <= 1e-9)) return false;
    return true;
  }

  function isVec2(v) {
    return M.finiteVec(v) && v.length === 2;
  }

  /* ------------------------------------------------------------------ convex set tester */

  var SETS = ['disk', 'diamond', 'square', 'ring'];
  var NORM = { disk: 'l2', diamond: 'l1', square: 'linf', ring: 'l2' };
  var NORM_TEX = { disk: '2', diamond: '1', square: '\\infty', ring: '2' };

  SEM.widgets.convexSets = function (container) {
    var W = SEM.content.main.blocks.C.widgets.convexSets;
    var ring = util.data('C.sets.ring');
    var lambda0 = util.data('C.sets.lambda');
    var par = { r: util.data('C.sets.r'), r1: ring[0], r2: ring[1] };
    function defaults(set) {
      return util.data('C.sets.defaults.' + set).map(function (pt) { return pt.slice(); });
    }

    var st = kit.state('convexSets');
    if (SETS.indexOf(st.set) < 0) st.set = 'ring';
    if (!Array.isArray(st.points) || st.points.length !== 2 || !isVec2(st.points[0]) || !isVec2(st.points[1])) st.points = defaults(st.set);
    if (!util.isNum(st.lambda) || st.lambda < 0 || st.lambda > 1) st.lambda = lambda0;

    function g(x, y) {
      return M.sets[st.set](x, y, par);
    }
    function zPoint() {
      return M.add(M.scale(st.points[0], st.lambda), M.scale(st.points[1], 1 - st.lambda));
    }

    var panel = kit.panel(container, W.title, W.caption, { id: 'convexSets' });

    var drag = -1;
    var start = null;
    var moved = false;
    function onPointer(type, w, ev, p) {
      if (type === 'down') {
        drag = SEM.pickHandle(p, w, st.points, 24);
        start = [ev.clientX, ev.clientY];
        moved = false;
        return;
      }
      if (type === 'drag' && drag >= 0) {
        if (Math.sqrt(Math.pow(ev.clientX - start[0], 2) + Math.pow(ev.clientY - start[1], 2)) > 6) moved = true;
        st.points[drag] = [util.clamp(w[0], -2.5, 2.5), util.clamp(w[1], -2.5, 2.5)];
        SEM.state.touch();
        refresh();
        return;
      }
      if (type === 'up') {
        if (drag >= 0 && moved && !predict.revealed()) predict.reveal();
        drag = -1;
      }
    }

    var plot = new SEM.Plot(panel.stage, {
      domain: { x0: -2.6, x1: 2.6, y0: -2.6, y1: 2.6 },
      aspect: 0.9,
      label: function () { return SEM.tu('widgets.convexSets.aria'); },
      draw: function (ctx, p, C) {
        SEM.draw.region(ctx, p, function (x, y) { return g(x, y) <= 0; }, C['w-set'], 3);
        SEM.draw.contour(ctx, p, g, 0, C['w-set-line'], 2, 4);
        SEM.draw.axes(ctx, p, C, 1);
        var a = st.points[0];
        var b = st.points[1];
        var n = 240;
        for (var i = 0; i < n; i++) {
          var t0 = i / n;
          var t1 = (i + 1) / n;
          var tm = (i + 0.5) / n;
          var inside = g((1 - tm) * a[0] + tm * b[0], (1 - tm) * a[1] + tm * b[1]) <= 1e-12;
          SEM.draw.line(
            ctx,
            p.sx((1 - t0) * a[0] + t0 * b[0]), p.sy((1 - t0) * a[1] + t0 * b[1]),
            p.sx((1 - t1) * a[0] + t1 * b[0]), p.sy((1 - t1) * a[1] + t1 * b[1]),
            inside ? C['w-good'] : C['w-bad'], inside ? 3 : 5
          );
        }
        var z = zPoint();
        SEM.draw.dot(ctx, p.sx(z[0]), p.sy(z[1]), 6, C['w-label']);
        SEM.draw.label(ctx, 'z', p.sx(z[0]) + 11, p.sy(z[1]) - 11, C['w-label'], { italic: true });
        st.points.forEach(function (q, k) {
          SEM.draw.dot(ctx, p.sx(q[0]), p.sy(q[1]), 8, C['w-point'], C['w-halo'], 2);
          SEM.draw.label(ctx, k === 0 ? 'p' : 'q', p.sx(q[0]) + 11, p.sy(q[1]) - 11, C['w-point'], { italic: true });
        });
      },
      onPointer: onPointer
    });

    var predict = kit.predict(panel.side, 'convexSets', W.predict, refresh);
    kit.segmented(panel.side, 'convexSet', SETS.map(function (id) {
      return { id: id, label: 'widgets.convexSets.' + id };
    }), st.set, function (id) {
      st.set = id;
      st.points = defaults(id);
      SEM.state.touch();
      refresh();
    });
    var slider = kit.slider(panel.side, { label: 'widgets.convexSets.lambda', min: 0, max: 1, step: 0.05, value: st.lambda }, function (v) {
      st.lambda = v;
      SEM.state.touch();
      refresh();
    });
    var actions = el('div', { class: 'widget-actions' });
    panel.side.appendChild(actions);
    kit.button(actions, 'widgets.reset', function () {
      st.points = defaults(st.set);
      st.lambda = lambda0;
      slider.setValue(st.lambda);
      SEM.state.touch();
      refresh();
    }, 'btn-quiet');

    var read = kit.readout(panel.side, function (lang) {
      var p = st.points[0];
      var q = st.points[1];
      var lam = st.lambda;
      var z = zPoint();
      var N = M.norms[NORM[st.set]];
      var revealed = predict.revealed();
      var lines = [SEM.tuf('widgets.convexSets.points', { p: kit.v(p, lang), q: kit.v(q, lang), z: kit.v(z, lang) }, lang)];
      if (g(p[0], p[1]) > 1e-12 || g(q[0], q[1]) > 1e-12) lines.push(SEM.tu('widgets.convexSets.outside', lang));
      else if (!revealed && st.set === 'ring') lines.push(SEM.tu('widgets.convexSets.hidden', lang));
      else if (M.segmentLeaves(g, p, q)) lines.push({ text: SEM.tu('widgets.convexSets.leaves', lang), cls: 'is-bad' });
      else lines.push({ text: SEM.tu('widgets.convexSets.stays', lang), cls: 'is-ok' });
      lines.push(SEM.tuf('widgets.convexSets.chain', { n: NORM_TEX[st.set], nz: kit.n(N(z), lang), rhs: kit.n(lam * N(p) + (1 - lam) * N(q), lang) }, lang));
      if (st.set === 'ring' && revealed && M.norms.l2(z) < ring[0]) {
        lines.push({ text: SEM.tuf('widgets.convexSets.hole', { nz: kit.n(M.norms.l2(z), lang) }, lang), cls: 'is-bad' });
      }
      return lines;
    });

    var answer = render.el('p', { class: 'answer-reveal' }, W.answer);
    panel.side.appendChild(answer);

    function refresh() {
      answer.hidden = !predict.revealed();
      read.update();
      plot.requestDraw();
    }
    refresh();
  };

  /* ------------------------------------------------------------------ quadratic family */

  SEM.widgets.family = function (container) {
    var W = SEM.content.main.blocks.C.widgets.family;
    var levels = util.data('C.family.levels');
    var negLevels = util.data('C.family.negLevels');
    var range = util.data('C.family.slider');
    var aA1 = util.data('C2.params.aA1');
    var aC2 = util.data('C2.params.a');
    var aEdge = util.data('C2.params.aEdge');

    var st = kit.state('family');
    if (!util.isNum(st.a) || st.a < range[0] || st.a > range[1]) st.a = aA1;

    function F(x, y) {
      return M.fns.family.f(x, y, { a: st.a });
    }
    function matching(a) {
      if (matches(a, aA1)) return 'A1';
      if (matches(a, aC2)) return 'C2';
      return null;
    }
    function atEdge() {
      return Math.abs(Math.abs(st.a) - aEdge) <= 1e-9;
    }

    var panel = kit.panel(container, W.title, W.caption, { id: 'family' });

    var plot = new SEM.Plot(panel.stage, {
      domain: { x0: -2.2, x1: 2.2, y0: -2.2, y1: 2.2 },
      aspect: 0.9,
      scroll: true,
      label: function () { return SEM.tu('widgets.family.aria'); },
      draw: function (ctx, p, C) {
        SEM.draw.region(ctx, p, function (x, y) { return F(x, y) <= 1; }, C['w-set'], 3);
        SEM.draw.axes(ctx, p, C, 1);
        levels.forEach(function (lv) {
          SEM.draw.contour(ctx, p, F, lv, C['w-contour'], 1.2);
        });
        if (Math.abs(st.a) > aEdge + 1e-9) {
          negLevels.forEach(function (lv) {
            SEM.draw.contour(ctx, p, F, lv, C['w-contour'], 1.2, 6, [6, 4]);
          });
        }
        var H = M.fns.family.H(0, 0, { a: st.a });
        var h = Math.SQRT1_2;
        [
          { u: [h, h], lambda: H[0][0] + st.a, text: '2 + a' },
          { u: [h, -h], lambda: H[1][1] - st.a, text: '2 − a' }
        ].forEach(function (e) {
          var u = e.u;
          var lam = e.lambda;
          if (Math.abs(lam) <= 1e-9) {
            SEM.draw.line(ctx, p.sx(-3 * u[0]), p.sy(-3 * u[1]), p.sx(3 * u[0]), p.sy(3 * u[1]), C['w-label'], 2);
            SEM.draw.label(ctx, e.text, p.sx(1.8 * u[0]), p.sy(1.8 * u[1]), C['w-label']);
            return;
          }
          var color = lam > 1e-9 ? C.ok : C.bad;
          var L = Math.min(2, 0.35 * Math.abs(lam));
          SEM.draw.arrow(ctx, p.sx(0), p.sy(0), p.sx(L * u[0]), p.sy(L * u[1]), color, 2.5);
          SEM.draw.arrow(ctx, p.sx(0), p.sy(0), p.sx(-L * u[0]), p.sy(-L * u[1]), color, 2.5);
          SEM.draw.label(ctx, e.text, p.sx(L * u[0]) + 8, p.sy(L * u[1]) - 8, color);
        });
      }
    });

    var predict = kit.predict(panel.side, 'family', W.predict, refresh);
    var slider = kit.slider(panel.side, { label: 'widgets.family.a', min: range[0], max: range[1], step: range[2], value: st.a }, function (v) {
      st.a = v;
      if (atEdge() && !predict.revealed()) predict.reveal();
      SEM.state.touch();
      refresh();
    });
    var mark = kit.segmented(panel.side, 'familyMark', [
      { id: 'A1', label: 'widgets.family.markA1' },
      { id: 'C2', label: 'widgets.family.markC2' }
    ], matching(st.a), function (id) {
      st.a = id === 'A1' ? aA1 : aC2;
      slider.setValue(st.a);
      SEM.state.touch();
      refresh();
    });
    var actions = el('div', { class: 'widget-actions' });
    panel.side.appendChild(actions);
    kit.button(actions, 'widgets.reset', function () {
      st.a = aA1;
      slider.setValue(st.a);
      SEM.state.touch();
      refresh();
    }, 'btn-quiet');

    var read = kit.readout(panel.side, function (lang) {
      var H = M.fns.family.H(0, 0, { a: st.a });
      var lines = [
        SEM.tuf('widgets.family.H', { mat: SEM.fmt.matrix(H, lang) }, lang),
        SEM.tuf('widgets.family.eig', { l1: kit.n(H[0][0] + st.a, lang), l2: kit.n(H[0][0] - st.a, lang) }, lang)
      ];
      if (!predict.revealed()) lines.push(SEM.tu('widgets.family.hidden', lang));
      else if (Math.abs(st.a) < aEdge - 1e-9) lines.push({ text: SEM.tu('widgets.family.strict', lang), cls: 'is-ok' });
      else if (atEdge()) lines.push({ text: SEM.tu('widgets.family.edge', lang), cls: 'is-strong' });
      else lines.push({ text: SEM.tu('widgets.family.nonconvex', lang), cls: 'is-bad' });
      return lines;
    });

    var answer = render.el('p', { class: 'answer-reveal' }, W.answer);
    panel.side.appendChild(answer);

    function refresh() {
      answer.hidden = !predict.revealed();
      mark.setValue(matching(st.a));
      read.update();
      plot.requestDraw();
    }
    refresh();
  };
})();
