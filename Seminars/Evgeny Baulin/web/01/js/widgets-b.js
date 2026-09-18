// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Block B widgets: the Sylvester lab for a symmetric 2 x 2 matrix and the restriction of a function to lines through the origin.
(function () {
  'use strict';
  var SEM = window.SEM;
  var M = SEM.math;
  var kit = SEM.kit;
  var util = SEM.util;
  var render = SEM.render;
  var el = SEM.dom.el;

  /* ------------------------------------------------------------------ definiteness: the Sylvester lab */

  var DEF_PRESETS = ['trapNeg', 'trapPos', 'bowl', 'saddle', 'family'];
  var SYL_KEY = { pd: 'sylPd', nd: 'sylNd', silent: 'sylSilent' };
  var CLS_LINE = {
    pd: { key: 'clsPd', cls: 'is-ok' },
    psd: { key: 'clsPsd', cls: 'is-ok' },
    indefinite: { key: 'clsIndefinite', cls: 'is-bad' },
    nd: { key: 'clsNd', cls: 'is-strong' },
    nsd: { key: 'clsNsd', cls: 'is-strong' },
    zero: { key: 'clsZero', cls: 'is-strong' }
  };

  SEM.widgets.definiteness = function (container) {
    var W = SEM.content.main.blocks.B.widgets.definiteness;
    var presets = {};
    DEF_PRESETS.forEach(function (id) {
      var P = util.data('B.definiteness.presets.' + id);
      presets[id] = [P[0][0], P[0][1], P[1][1]];
    });
    var slider = util.data('B.definiteness.slider').slice();
    var st = kit.state('definiteness');
    if (!M.finiteVec(st.H) || st.H.length !== 3 || (st.preset !== null && DEF_PRESETS.indexOf(st.preset) < 0)) {
      st.preset = 'trapNeg';
      st.H = presets.trapNeg.slice();
    }

    var panel = kit.panel(container, W.title, W.caption, { id: 'definiteness' });
    var predict = null;
    var plot = new SEM.Plot(panel.stage, {
      domain: { x0: -1.6, x1: 1.6, y0: -1.6, y1: 1.6 },
      aspect: 0.9,
      scroll: true,
      label: function () { return SEM.tu('widgets.definiteness.aria'); },
      draw: function (ctx, p, C) {
        var a = st.H[0];
        var b = st.H[1];
        var d = st.H[2];
        var ox = p.sx(0);
        var oy = p.sy(0);
        function circle() {
          ctx.save();
          ctx.beginPath();
          ctx.arc(ox, oy, p.scaleX, 0, Math.PI * 2);
          ctx.strokeStyle = C['w-axis'];
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
        // Before the reveal: only the axes and the unit circle.
        if (!predict || !predict.revealed()) {
          SEM.draw.axes(ctx, p, C, 1);
          circle();
          return;
        }
        var eps = 1e-9 * Math.max(1, Math.abs(a), Math.abs(b), Math.abs(d));
        var q = function (x, y) { return a * x * x + 2 * b * x * y + d * y * y; };
        SEM.draw.region(ctx, p, function (x, y) { return q(x, y) > eps; }, C['w-psd'], 3);
        SEM.draw.region(ctx, p, function (x, y) { return q(x, y) < -eps; }, C['w-cone'], 3);
        SEM.draw.axes(ctx, p, C, 1);
        circle();
        var e = M.eigSym2(a, b, d);
        var U = M.eigvec2(a, b, d);
        // zero lines of q through the origin
        var dirs = [];
        var small = [Math.abs(e[0]) <= eps, Math.abs(e[1]) <= eps];
        if (small[0] !== small[1]) dirs.push(small[0] ? U[0] : U[1]);
        else if (e[0] < -eps && e[1] > eps) {
          [1, -1].forEach(function (sg) {
            var v = M.add(M.scale(U[0], Math.sqrt(Math.abs(e[1]))), M.scale(U[1], sg * Math.sqrt(Math.abs(e[0]))));
            dirs.push(M.scale(v, 1 / M.norm(v)));
          });
        }
        dirs.forEach(function (v) {
          SEM.draw.line(ctx, p.sx(-1.7 * v[0]), p.sy(-1.7 * v[1]), p.sx(1.7 * v[0]), p.sy(1.7 * v[1]), C['w-label'], 2);
        });
        // eigenvector arrows scaled by |lambda| / max |lambda|
        var m = Math.max(Math.abs(e[0]), Math.abs(e[1]));
        [0, 1].forEach(function (i) {
          if (Math.abs(e[i]) <= eps) {
            SEM.draw.dot(ctx, ox, oy, 4, C['w-label']);
            return;
          }
          var color = e[i] > eps ? C.ok : C.bad;
          var s = (1.2 * Math.abs(e[i])) / m;
          var u = U[i];
          SEM.draw.arrow(ctx, ox, oy, p.sx(s * u[0]), p.sy(s * u[1]), color, 2.5);
          SEM.draw.arrow(ctx, ox, oy, p.sx(-s * u[0]), p.sy(-s * u[1]), color, 2.5);
          SEM.draw.label(ctx, i === 0 ? 'λ₁' : 'λ₂', p.sx(s * u[0]) + 8, p.sy(s * u[1]) - 8, color);
        });
      }
    });

    predict = kit.predict(panel.side, 'definiteness', W.predict, refresh);
    var pick = kit.segmented(panel.side, 'defPreset', DEF_PRESETS.map(function (id) {
      return { id: id, label: 'widgets.definiteness.' + id };
    }), st.preset, function (id) {
      st.preset = id;
      st.H = presets[id].slice();
      sliders.forEach(function (s, i) {
        s.setValue(st.H[i]);
      });
      SEM.state.touch();
      refresh();
    });
    // Moving an entry leaves the presets and reveals the answer.
    var sliders = ['h11', 'h12', 'h22'].map(function (key, i) {
      return kit.slider(panel.side, {
        label: 'widgets.definiteness.' + key,
        min: slider[0],
        max: slider[1],
        step: slider[2],
        value: st.H[i]
      }, function (v) {
        st.H[i] = v;
        st.preset = null;
        pick.setValue(null);
        if (!predict.revealed()) predict.reveal();
        SEM.state.touch();
        refresh();
      });
    });

    var read = kit.readout(panel.side, function (lang) {
      var a = st.H[0];
      var b = st.H[1];
      var d = st.H[2];
      var P = [[a, b], [b, d]];
      var lm = M.leadingMinors(P);
      var pm = M.principalMinors(P);
      var e = M.eigSym2(a, b, d);
      var lines = [
        SEM.tuf('widgets.definiteness.matrix', { mat: SEM.fmt.matrix(P, lang) }, lang),
        SEM.tuf('widgets.definiteness.leading', { d1: kit.n(lm[0], lang), d2: kit.n(lm[1], lang) }, lang),
        SEM.tuf('widgets.definiteness.principal', { a: kit.n(pm[0], lang), d: kit.n(pm[1], lang), det: kit.n(pm[2], lang) }, lang)
      ];
      var syl = SYL_KEY[M.sylvester(lm)];
      if (syl) lines.push({ text: SEM.tu('widgets.definiteness.' + syl, lang), cls: 'is-strong' });
      if (!predict.revealed()) {
        lines.push(SEM.tu('widgets.definiteness.hidden', lang));
        return lines;
      }
      lines.push(SEM.tuf('widgets.definiteness.eig', { l1: kit.n(e[0], lang), l2: kit.n(e[1], lang) }, lang));
      var cls = CLS_LINE[M.classify(e)];
      if (cls) lines.push({ text: SEM.tu('widgets.definiteness.' + cls.key, lang), cls: cls.cls });
      return lines;
    });

    // The legend names the colours, which appear only after the reveal.
    var legend = kit.label(el('p', { class: 'widget-legend' }), 'widgets.definiteness.legend');
    panel.side.appendChild(legend);
    var answer = render.el('p', { class: 'answer-reveal' }, W.answer);
    panel.side.appendChild(answer);

    function refresh() {
      answer.hidden = !predict.revealed();
      legend.hidden = !predict.revealed();
      read.update();
      plot.requestDraw();
    }
    refresh();
  };

  /* ------------------------------------------------------------------ lines: restriction to a line */

  var LINE_FNS = ['bowl', 'saddle', 'monkey', 'quartic'];
  var TEST_KEY = { bowl: 'testMin', saddle: 'testSaddle', monkey: 'testSilent', quartic: 'testSilent' };

  SEM.widgets.lines = function (container) {
    var W = SEM.content.main.blocks.B.widgets.lines;
    var T = util.data('B.lines.t');
    var st = kit.state('lines');
    if (LINE_FNS.indexOf(st.fn) < 0) st.fn = 'monkey';
    if (!util.isNum(st.theta) || st.theta < 0 || st.theta > 175 || st.theta % 5 !== 0) st.theta = 0;

    function F() {
      return M.fns[st.fn];
    }
    function degree() {
      return util.data('B.lines.degree.' + st.fn);
    }
    function coef() {
      return M.restrictCoef(F(), st.theta);
    }

    var panel = kit.panel(container, W.title, W.caption, { id: 'lines', stack: true });
    var grid = el('div', { class: 'widget-grid two' });
    panel.stage.appendChild(grid);
    var cols = [el('div', { class: 'widget-col' }), el('div', { class: 'widget-col' })];
    cols.forEach(function (col) {
      grid.appendChild(col);
    });

    var mapPlot = new SEM.Plot(cols[0], {
      domain: { x0: -1.6, x1: 1.6, y0: -1.6, y1: 1.6 },
      aspect: 0.9,
      scroll: true,
      label: function () { return SEM.tu('widgets.lines.ariaMap'); },
      draw: function (ctx, p, C) {
        var fn = F();
        SEM.draw.region(ctx, p, function (x, y) { return fn.f(x, y) > 1e-12; }, C['w-psd'], 3);
        SEM.draw.region(ctx, p, function (x, y) { return fn.f(x, y) < -1e-12; }, C['w-cone'], 3);
        SEM.draw.axes(ctx, p, C, 1);
        util.data('B.lines.levels.' + st.fn).forEach(function (level) {
          SEM.draw.contour(ctx, p, fn.f, level, C['w-contour'], 1);
        });
        var th = (st.theta * Math.PI) / 180;
        var ends = [[-T * Math.cos(th), -T * Math.sin(th)], [T * Math.cos(th), T * Math.sin(th)]];
        SEM.draw.line(ctx, p.sx(ends[0][0]), p.sy(ends[0][1]), p.sx(ends[1][0]), p.sy(ends[1][1]), C['w-point'], 2.5);
        ends.forEach(function (q) {
          SEM.draw.dot(ctx, p.sx(q[0]), p.sy(q[1]), 4, C['w-point'], C['w-halo'], 2);
        });
        SEM.draw.dot(ctx, p.sx(0), p.sy(0), 4, C['w-label']);
      }
    });

    var slicePlot = SEM.plot1d(cols[1], {
      x0: -T,
      x1: T,
      y0: function () { return -1.1 * Math.pow(T, degree()); },
      y1: function () { return 1.1 * Math.pow(T, degree()); },
      aspect: 0.9,
      scroll: true,
      xticks: [-1, 0, 1],
      xlabel: 't',
      label: function () { return SEM.tu('widgets.lines.ariaSlice'); },
      curves: function () {
        var c = coef();
        var k = degree();
        return [{ f: function (t) { return c * Math.pow(t, k); }, from: -T, to: T, color: 'w-point', width: 3 }];
      },
      segments: function () {
        return [{ x0: -T, y0: 0, x1: T, y1: 0, color: 'w-axis', width: 1 }];
      },
      points: function () {
        return [{ x: 0, y: 0, color: 'w-label', r: 4 }];
      }
    });

    var predict = kit.predict(panel.side, 'lines', W.predict, refresh);
    var pick = kit.segmented(panel.side, 'linesFn', LINE_FNS.map(function (id) {
      return { id: id, label: 'widgets.lines.' + id };
    }), st.fn, function (id) {
      st.fn = id;
      SEM.state.touch();
      refresh();
    });
    // Turning the line reveals the answer.
    var angle = kit.slider(panel.side, {
      label: 'widgets.lines.angle',
      min: 0,
      max: 175,
      step: 5,
      value: st.theta,
      format: function (v) { return SEM.fmt.num(v, SEM.i18n.lang, true, 2) + '^\\circ'; }
    }, function (v) {
      st.theta = v;
      if (!predict.revealed()) predict.reveal();
      SEM.state.touch();
      refresh();
    });
    var actions = el('div', { class: 'widget-actions' });
    kit.button(actions, 'widgets.reset', function () {
      st.fn = 'monkey';
      st.theta = 0;
      pick.setValue(st.fn);
      angle.setValue(st.theta);
      SEM.state.touch();
      refresh();
    }, 'btn-quiet');
    panel.side.appendChild(actions);

    var read = kit.readout(panel.side, function (lang) {
      var c = coef();
      var k = degree();
      var lines = [SEM.tuf('widgets.lines.phi', { c: kit.coef(c, lang), k: String(k) }, lang)];
      if (!predict.revealed()) lines.push(SEM.tu('widgets.lines.hidden', lang));
      else if (Math.abs(c) <= 1e-9) lines.push(SEM.tu('widgets.lines.zero', lang));
      else if (k % 2 === 1) lines.push({ text: SEM.tu('widgets.lines.changes', lang), cls: 'is-bad' });
      else lines.push(SEM.tu(c > 0 ? 'widgets.lines.pos' : 'widgets.lines.neg', lang));
      lines.push(SEM.tuf('widgets.lines.data', { mat: SEM.fmt.matrix(F().H(0, 0), lang) }, lang));
      lines.push(SEM.tu('widgets.lines.' + TEST_KEY[st.fn], lang));
      return lines;
    });

    var legend = kit.label(el('p', { class: 'widget-legend' }), 'widgets.lines.legend');
    panel.side.appendChild(legend);
    var answer = render.el('p', { class: 'answer-reveal' }, W.answer);
    panel.side.appendChild(answer);

    function refresh() {
      answer.hidden = !predict.revealed();
      read.update();
      mapPlot.requestDraw();
      slicePlot.requestDraw();
    }
    refresh();
  };
})();
