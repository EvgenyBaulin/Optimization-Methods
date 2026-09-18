// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Block D widgets: feasible directions in the quadrant (the point, the cone and one direction) and secant slopes tending to the directional derivative.
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

  // A coordinate snapped to the grid h.
  function snap(v, h) {
    return Math.round(Math.round(v / h) * h * 1e6) / 1e6;
  }

  function isVec2(v) {
    return M.finiteVec(v) && v.length === 2;
  }

  /* ------------------------------------------------------------------ feasible directions */

  var PRESETS = ['edge', 'corner', 'interior'];
  var DIRS = [1, 2, 3, 4, 5];

  SEM.widgets.feasible = function (container) {
    var W = SEM.content.main.blocks.D.widgets.feasible;
    var domain = util.data('D.feasible.domain');
    var A = util.data('D.feasible.A');
    var b = util.data('D.feasible.b');
    var grad = util.data('D.feasible.grad');
    var step = util.data('D.feasible.snap');
    function preset(id) {
      return util.data('D.feasible.presets.' + id).slice();
    }
    function direction(i) {
      return util.data('D.feasible.probe.dirs.' + i).slice();
    }

    var st = kit.state('feasible');
    if (!isVec2(st.x) || st.x[0] < 0 || st.x[0] > 3 || st.x[1] < 0 || st.x[1] > 3) st.x = preset('edge');
    if (!isVec2(st.s) || !(M.norm(st.s) > 0)) st.s = util.data('D.feasible.s0').slice();

    function active() {
      return M.activeRows(A, b, st.x);
    }
    function matchingPreset() {
      for (var i = 0; i < PRESETS.length; i++) if (matches(st.x, util.data('D.feasible.presets.' + PRESETS[i]))) return PRESETS[i];
      return null;
    }
    function matchingDir() {
      for (var i = 0; i < DIRS.length; i++) if (matches(st.s, util.data('D.feasible.probe.dirs.' + DIRS[i]))) return 'dir' + DIRS[i];
      return null;
    }

    var panel = kit.panel(container, W.title, W.caption, { id: 'feasible' });

    var drag = -1;
    var start = null;
    var moved = false;
    function onPointer(type, w, ev, p) {
      if (type === 'down') {
        drag = SEM.pickHandle(p, w, [st.x, M.add(st.x, st.s)], 24);
        start = [ev.clientX, ev.clientY];
        moved = false;
        return;
      }
      if (type === 'drag' && drag >= 0) {
        if (Math.sqrt(Math.pow(ev.clientX - start[0], 2) + Math.pow(ev.clientY - start[1], 2)) > 6) moved = true;
        if (drag === 0) {
          st.x = [snap(util.clamp(w[0], 0, 3), step), snap(util.clamp(w[1], 0, 3), step)];
        } else {
          var s = [snap(w[0] - st.x[0], step), snap(w[1] - st.x[1], step)];
          var len = M.norm(s);
          if (len > 1.5) s = [snap((1.5 * s[0]) / len, step), snap((1.5 * s[1]) / len, step)];
          if (M.norm(s) > 0) st.s = s;
        }
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
      domain: { x0: domain[0], x1: domain[1], y0: domain[2], y1: domain[3] },
      aspect: 0.9,
      label: function () { return SEM.tu('widgets.feasible.aria'); },
      draw: function (ctx, p, C) {
        var act = active();
        var row1 = act.indexOf(1) >= 0;
        var row2 = act.indexOf(2) >= 0;
        SEM.draw.region(ctx, p, function (x, y) { return x >= 0 && y >= 0; }, C['w-set'], 3);
        // the boundary rays run to the edges of the visible plot, which is wider than the domain
        SEM.draw.line(ctx, p.sx(0), p.sy(0), p.sx(0), p.sy(p.fit.y1), C['w-set-line'], row1 ? 4 : 2);
        SEM.draw.line(ctx, p.sx(0), p.sy(0), p.sx(p.fit.x1), p.sy(0), C['w-set-line'], row2 ? 4 : 2);
        SEM.draw.axes(ctx, p, C, 1);
        [1, 2, 3, 4].forEach(function (c) {
          SEM.draw.contour(ctx, p, function (x, y) { return x + y; }, c, C['w-contour'], 1, 6, [6, 4]);
        });

        var x = st.x;
        var centre = [p.sx(x[0]), p.sy(x[1])];
        var arc = [];
        var i;
        if (!act.length) {
          for (i = 0; i < 48; i++) {
            arc.push([p.sx(x[0] + 0.9 * Math.cos((2 * Math.PI * i) / 48)), p.sy(x[1] + 0.9 * Math.sin((2 * Math.PI * i) / 48))]);
          }
          SEM.draw.polygon(ctx, arc, C['w-psd'], null, 0);
        } else {
          var from = row1 && row2 ? 0 : row1 ? -90 : 0;
          var to = row1 && row2 ? 90 : row1 ? 90 : 180;
          for (i = 0; i < 48; i++) {
            var phi = ((from + ((to - from) * i) / 47) * Math.PI) / 180;
            arc.push([p.sx(x[0] + 0.9 * Math.cos(phi)), p.sy(x[1] + 0.9 * Math.sin(phi))]);
          }
          SEM.draw.polygon(ctx, [centre].concat(arc), C['w-psd'], null, 0);
        }

        var tip = M.add(x, st.s);
        var P0 = centre;
        var Pt = [p.sx(tip[0]), p.sy(tip[1])];
        var ell = Math.sqrt(Math.pow(Pt[0] - P0[0], 2) + Math.pow(Pt[1] - P0[1], 2));
        if (!M.isFeasibleDir(A, b, x, st.s)) {
          var Pe = ell <= 12 ? P0 : [Pt[0] - (12 * (Pt[0] - P0[0])) / ell, Pt[1] - (12 * (Pt[1] - P0[1])) / ell];
          SEM.draw.line(ctx, P0[0], P0[1], Pe[0], Pe[1], C['w-label'], 2, [6, 4]);
          SEM.draw.arrow(ctx, Pe[0], Pe[1], Pt[0], Pt[1], C['w-label'], 2);
        } else if (M.dot(st.s, grad) < -1e-9) {
          SEM.draw.arrow(ctx, P0[0], P0[1], Pt[0], Pt[1], C.bad, 3);
        } else {
          SEM.draw.arrow(ctx, P0[0], P0[1], Pt[0], Pt[1], C.ok, 3);
        }

        SEM.draw.dot(ctx, P0[0], P0[1], 8, C['w-point'], C['w-halo'], 2);
        SEM.draw.label(ctx, 'x', P0[0] + 11, P0[1] - 11, C['w-point'], { italic: true });
        SEM.draw.dot(ctx, Pt[0], Pt[1], 6, C['w-point'], C['w-halo'], 2);
      },
      onPointer: onPointer
    });

    var predict = kit.predict(panel.side, 'feasible', W.predict, refresh);
    var at = kit.segmented(panel.side, 'feasiblePreset', PRESETS.map(function (id) {
      return { id: id, label: 'widgets.feasible.' + id };
    }), matchingPreset(), function (id) {
      st.x = preset(id);
      SEM.state.touch();
      refresh();
    });
    var dir = kit.segmented(panel.side, 'feasibleDir', DIRS.map(function (i) {
      return { id: 'dir' + i, label: 'widgets.feasible.dir' + i };
    }), matchingDir(), function (id) {
      st.s = direction(parseInt(id.slice(3), 10));
      SEM.state.touch();
      refresh();
    });
    var actions = el('div', { class: 'widget-actions' });
    panel.side.appendChild(actions);
    kit.button(actions, 'widgets.reset', function () {
      st.x = preset('edge');
      st.s = util.data('D.feasible.s0').slice();
      SEM.state.touch();
      refresh();
    }, 'btn-quiet');

    var read = kit.readout(panel.side, function (lang) {
      var x = st.x;
      var s = st.s;
      var act = active();
      var slope = M.dot(s, grad);
      var lines = [SEM.tuf('widgets.feasible.x', { vec: kit.v(x, lang) }, lang)];
      var row1 = act.indexOf(1) >= 0;
      var row2 = act.indexOf(2) >= 0;
      lines.push(SEM.tu('widgets.feasible.' + (row1 && row2 ? 'both' : row1 ? 'first' : row2 ? 'second' : 'none'), lang));
      lines.push(SEM.tuf('widgets.feasible.s', { vec: kit.v(s, lang), slope: kit.n(slope, lang) }, lang));
      if (!M.isFeasibleDir(A, b, x, s)) lines.push(SEM.tu('widgets.feasible.infeasible', lang));
      else if (slope < -1e-9) lines.push({ text: SEM.tu('widgets.feasible.descent', lang), cls: 'is-bad' });
      else lines.push({ text: SEM.tu('widgets.feasible.ascent', lang), cls: 'is-ok' });
      if (!predict.revealed()) {
        lines.push(SEM.tu('widgets.feasible.hidden', lang));
      } else {
        var worst = M.worstUnitSlope(A, b, x, grad);
        if (worst) {
          lines.push(SEM.tuf('widgets.feasible.worst', { w: kit.n(worst.slope, lang) }, lang));
          if (worst.slope < -1e-9) lines.push({ text: SEM.tu('widgets.feasible.fails', lang), cls: 'is-bad' });
          else lines.push({ text: SEM.tu('widgets.feasible.holds', lang), cls: 'is-ok' });
        }
      }
      return lines;
    });

    var answer = render.el('p', { class: 'answer-reveal' }, W.answer);
    panel.side.appendChild(answer);

    function refresh() {
      answer.hidden = !predict.revealed();
      at.setValue(matchingPreset());
      dir.setValue(matchingDir());
      read.update();
      plot.requestDraw();
    }
    refresh();
  };

  /* ------------------------------------------------------------------ secant slopes */

  var SECANT_DIRS = [
    { id: 's', label: 'widgets.secant.dirS' },
    { id: 'unit', label: 'widgets.secant.dirUnit' },
    { id: 'steepest', label: 'widgets.secant.dirSteepest' }
  ];

  SEM.widgets.secant = function (container) {
    var W = SEM.content.main.blocks.D.widgets.secant;
    var F = M.fns.ellipse;
    var x = util.data('D2.params.x').slice();
    var range = util.data('D.secant.range');
    var yRange = util.data('D.secant.yRange');
    var bounds = util.data('D.secant.slider');
    var alpha0 = util.data('D.secant.alpha0');

    var st = kit.state('secant');
    if (['s', 'unit', 'steepest'].indexOf(st.dir) < 0) st.dir = 's';
    if (!util.isNum(st.alpha) || st.alpha < bounds[0] || st.alpha > bounds[1]) st.alpha = alpha0;

    function d() {
      return util.data('D.secant.dirs.' + st.dir);
    }
    function phi(alpha) {
      var v = d();
      return F.f(x[0] + alpha * v[0], x[1] + alpha * v[1], {});
    }
    function limit() {
      return M.dirDeriv(F, x, d());
    }
    function secantSlope() {
      return M.secantSlope(F, x, d(), st.alpha);
    }

    var panel = kit.panel(container, W.title, W.caption, { id: 'secant' });

    var plot = SEM.plot1d(panel.stage, {
      x0: range[0],
      x1: range[1],
      y0: yRange[0],
      y1: yRange[1],
      scroll: true,
      xticks: [0, 0.5, 1],
      yticks: [0, 1, 2, 3, 4, 5],
      xlabel: 'α',
      label: function () { return SEM.tu('widgets.secant.aria'); },
      curves: function () {
        return [{ f: phi, from: range[0], to: range[1], color: 'w-point', width: 3 }];
      },
      segments: function () {
        var f0 = phi(0);
        var lim = limit();
        var m = secantSlope();
        return [
          { x0: range[0], y0: f0 + lim * range[0], x1: range[1], y1: f0 + lim * range[1], color: 'w-good', width: 2, dash: [6, 4] },
          { x0: range[0], y0: f0 + m * range[0], x1: range[1], y1: f0 + m * range[1], color: 'bad', width: 2 }
        ];
      },
      points: function () {
        return [
          { x: 0, y: phi(0), color: 'w-point', r: 6 },
          { x: st.alpha, y: phi(st.alpha), color: 'w-point', r: 6 }
        ];
      }
    });

    var predict = kit.predict(panel.side, 'secant', W.predict, refresh);
    var pick = kit.segmented(panel.side, 'secantDir', SECANT_DIRS, st.dir, function (id) {
      st.dir = id;
      SEM.state.touch();
      refresh();
    });
    var slider = kit.slider(panel.side, {
      label: 'widgets.secant.alpha',
      min: bounds[0],
      max: bounds[1],
      step: bounds[2],
      value: st.alpha,
      format: function (v) { return SEM.fmt.num(v, SEM.i18n.lang, true, 2); }
    }, function (v) {
      st.alpha = v;
      SEM.state.touch();
      refresh();
    });
    var actions = el('div', { class: 'widget-actions' });
    panel.side.appendChild(actions);
    kit.button(actions, 'widgets.reset', function () {
      st.dir = 's';
      st.alpha = alpha0;
      pick.setValue(st.dir);
      slider.setValue(st.alpha);
      SEM.state.touch();
      refresh();
    }, 'btn-quiet');

    var read = kit.readout(panel.side, function (lang) {
      var m = secantSlope();
      var lim = limit();
      var lines = [SEM.tuf('widgets.secant.slope', { slope: kit.n(m, lang) }, lang)];
      if (predict.revealed() || st.dir !== 's') {
        lines.push(SEM.tuf('widgets.secant.limit', { lim: kit.n(lim, lang) }, lang));
        lines.push(SEM.tuf('widgets.secant.gap', { gap: kit.n(m - lim, lang) }, lang));
      } else {
        lines.push(SEM.tu('widgets.secant.hidden', lang));
      }
      return lines;
    });

    var legend = kit.label(el('p', { class: 'widget-legend' }), 'widgets.secant.legend');
    panel.side.appendChild(legend);
    var answer = render.el('p', { class: 'answer-reveal' }, W.answer);
    panel.side.appendChild(answer);

    function refresh() {
      answer.hidden = !predict.revealed();
      read.update();
      plot.requestDraw();
    }
    refresh();
  };
})();
