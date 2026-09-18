// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Block A widgets: the set tester, the function tester and the sublevel sets.
(function () {
  'use strict';
  var SEM = window.SEM;
  var M = SEM.math;
  var kit = SEM.kit;
  var dom = SEM.dom;
  var util = SEM.util;
  var el = dom.el;

  function setParams() {
    var w = util.data('A.widgets.sets') || {};
    var ann = w.annulus || [1, 2];
    return {
      disk: { r: w.diskR },
      annulus: { r1: ann[0], r2: ann[1] },
      T: { radius2: util.data('A3.params.radius2'), shift: util.data('A3.params.shift') },
      S: {}
    };
  }

  var SET_DEFAULTS = {
    disk: [[-1, -0.6], [0.9, 0.7]],
    annulus: [[-1.5, -0.3], [1.5, 0.4]],
    T: [[-1.2, 1], [1, 1.5]],
    S: null
  };

  /* ------------------------------------------------------------------ set tester */

  SEM.widgets.sets = function (container) {
    var text = SEM.content.main.blocks.A.widgets.sets;
    var st = kit.state('sets');
    var params = setParams();
    if (!params[st.set]) st.set = 'S';
    function defaults(name) {
      if (name === 'S') return [util.data('A3.params.p').slice(), util.data('A3.params.q').slice()];
      return SET_DEFAULTS[name].map(function (p) { return p.slice(); });
    }
    if (!Array.isArray(st.points) || st.points.length !== 2 || !M.finiteVec(st.points[0]) || !M.finiteVec(st.points[1])) st.points = defaults(st.set);

    var panel = kit.panel(container, text.title, text.caption, { id: 'sets' });
    var g = function (x, y) {
      return M.sets[st.set](x, y, params[st.set]);
    };
    var dragging = -1;
    var plot = new SEM.Plot(panel.stage, {
      domain: { x0: -3, x1: 3, y0: -2.6, y1: 2.6 },
      aspect: 0.72,
      label: function () { return SEM.tu('widgets.sets.aria'); },
      draw: function (ctx, p, C) {
        SEM.draw.axes(ctx, p, C, 1);
        SEM.draw.region(ctx, p, function (x, y) { return g(x, y) <= 0; }, C['w-set'], 3);
        SEM.draw.contour(ctx, p, g, 0, C['w-set-line'], 2, 4);
        var a = st.points[0];
        var b = st.points[1];
        var n = 240;
        var prev = null;
        for (var i = 0; i <= n; i++) {
          var t = i / n;
          var x = (1 - t) * a[0] + t * b[0];
          var y = (1 - t) * a[1] + t * b[1];
          var inside = g(x, y) <= 1e-12;
          if (prev) SEM.draw.line(ctx, p.sx(prev[0]), p.sy(prev[1]), p.sx(x), p.sy(y), inside && prev[2] ? C['w-good'] : C['w-bad'], inside && prev[2] ? 3 : 5);
          prev = [x, y, inside];
        }
        st.points.forEach(function (q, k) {
          SEM.draw.dot(ctx, p.sx(q[0]), p.sy(q[1]), 8, C['w-point'], C['w-halo'], 2);
          SEM.draw.label(ctx, k === 0 ? 'p' : 'q', p.sx(q[0]) + 11, p.sy(q[1]) - 11, C['w-point'], { italic: true });
        });
      },
      onPointer: function (type, w, ev, p) {
        if (type === 'down') dragging = SEM.pickHandle(p, w, st.points, 24);
        if ((type === 'down' || type === 'drag') && dragging >= 0) {
          st.points[dragging] = [util.clamp(w[0], -3, 3), util.clamp(w[1], -2.6, 2.6)];
          SEM.state.touch();
          refresh();
        }
        if (type === 'up') dragging = -1;
      }
    });

    kit.segmented(panel.side, 'sets', [
      { id: 'disk', label: 'widgets.sets.disk' },
      { id: 'annulus', label: 'widgets.sets.annulus' },
      { id: 'T', label: 'widgets.sets.T' },
      { id: 'S', label: 'widgets.sets.S' }
    ], st.set, function (v) {
      st.set = v;
      st.points = defaults(v);
      SEM.state.touch();
      refresh();
    });
    var read = kit.readout(panel.side, function (lang) {
      var a = st.points[0];
      var b = st.points[1];
      var lines = [SEM.tuf('widgets.sets.points', { p: kit.v(a, lang), q: kit.v(b, lang) }, lang)];
      if (g(a[0], a[1]) > 1e-12 || g(b[0], b[1]) > 1e-12) {
        lines.push(SEM.tu('widgets.sets.outside', lang));
        return lines;
      }
      var leaves = false;
      for (var i = 1; i < 400; i++) {
        var t = i / 400;
        if (g((1 - t) * a[0] + t * b[0], (1 - t) * a[1] + t * b[1]) > 1e-12) {
          leaves = true;
          break;
        }
      }
      lines.push({ text: SEM.tu(leaves ? 'widgets.sets.leaves' : 'widgets.sets.stays', lang), cls: leaves ? 'is-bad' : 'is-ok' });
      return lines;
    });
    function refresh() {
      read.update();
      plot.requestDraw();
    }
  };

  /* ------------------------------------------------------------------ function tester */

  SEM.widgets.functions = function (container) {
    var text = SEM.content.main.blocks.A.widgets.functions;
    var st = kit.state('functions');
    var A1 = util.data('A1.params');
    if (['a1', 'a2', 'w3'].indexOf(st.fn) < 0) st.fn = 'a1';
    if (!util.isNum(st.a)) st.a = A1.aTest;
    if (!Array.isArray(st.points) || st.points.length !== 2 || !M.finiteVec(st.points[0]) || !M.finiteVec(st.points[1])) st.points = [A1.p.slice(), A1.q.slice()];
    var params = function () {
      return { a: st.a, cyy: A1.cyy, bx: A1.bx };
    };
    var f = function (x, y) {
      return M.fns[st.fn].f(x, y, params());
    };
    var psd = function (x, y) {
      return M.isPsd2(M.fns[st.fn].H(x, y, params()));
    };

    var panel = kit.panel(container, text.title, text.caption, { id: 'functions', stack: true });
    var grid = el('div', { class: 'widget-grid two' });
    panel.stage.appendChild(grid);
    var left = el('div', { class: 'widget-col' });
    var right = el('div', { class: 'widget-col' });
    dom.append(grid, [left, right]);
    var dragging = -1;
    var mapPlot = new SEM.Plot(left, {
      domain: { x0: -2.6, x1: 2.6, y0: -2.2, y1: 2.2 },
      aspect: 0.8,
      label: function () { return SEM.tu('widgets.functions.mapAria'); },
      draw: function (ctx, p, C) {
        SEM.draw.region(ctx, p, psd, C['w-psd'], 4);
        SEM.draw.axes(ctx, p, C, 1);
        var levels = st.fn === 'a2' ? [0.25, 1, 4] : st.fn === 'w3' ? [-0.5, 0, 1, 3] : [-4, -1, 1, 4, 9];
        levels.forEach(function (lv) {
          SEM.draw.contour(ctx, p, f, lv, C['w-contour'], 1, 5);
        });
        var a = st.points[0];
        var b = st.points[1];
        SEM.draw.line(ctx, p.sx(a[0]), p.sy(a[1]), p.sx(b[0]), p.sy(b[1]), C['w-point'], 2);
        st.points.forEach(function (q, k) {
          SEM.draw.dot(ctx, p.sx(q[0]), p.sy(q[1]), 8, C['w-point'], C['w-halo'], 2);
          SEM.draw.label(ctx, k === 0 ? 'p' : 'q', p.sx(q[0]) + 11, p.sy(q[1]) - 11, C['w-point'], { italic: true });
        });
      },
      onPointer: function (type, w, ev, p) {
        if (type === 'down') dragging = SEM.pickHandle(p, w, st.points, 24);
        if ((type === 'down' || type === 'drag') && dragging >= 0) {
          st.points[dragging] = [util.clamp(w[0], -2.5, 2.5), util.clamp(w[1], -2.1, 2.1)];
          SEM.state.touch();
          refresh();
        }
        if (type === 'up') dragging = -1;
      }
    });
    var slicePlot = new SEM.Plot(right, {
      domain: { x0: 0, x1: 1, y0: 0, y1: 1 },
      uniform: false,
      aspect: 0.8,
      label: function () { return SEM.tu('widgets.functions.sliceAria'); },
      draw: function (ctx, p, C) {
        var a = st.points[0];
        var b = st.points[1];
        var n = 120;
        var vals = [];
        for (var i = 0; i <= n; i++) {
          var t = i / n;
          vals.push(f((1 - t) * a[0] + t * b[0], (1 - t) * a[1] + t * b[1]));
        }
        var lo = Math.min.apply(null, vals);
        var hi = Math.max.apply(null, vals);
        if (!isFinite(lo) || !isFinite(hi)) return;
        if (hi - lo < 1e-9) {
          hi += 1;
          lo -= 1;
        }
        var pad = (hi - lo) * 0.18;
        var mx = 34;
        var my = 18;
        var X = function (t) { return mx + t * (p.w - 2 * mx); };
        var Y = function (v) { return p.h - my - ((v - (lo - pad)) / (hi - lo + 2 * pad)) * (p.h - 2 * my); };
        SEM.draw.line(ctx, X(0), p.h - my, X(1), p.h - my, C['w-axis'], 1);
        [0, 0.5, 1].forEach(function (t) {
          SEM.draw.line(ctx, X(t), p.h - my, X(t), p.h - my + 5, C['w-axis'], 1);
        });
        SEM.draw.label(ctx, 't', X(1) + 12, p.h - my, C['w-label'], { italic: true });
        SEM.draw.polyline(ctx, vals.map(function (v, i) { return [X(i / n), Y(v)]; }), C['w-point'], 3);
        SEM.draw.line(ctx, X(0), Y(vals[0]), X(1), Y(vals[n]), C['w-bad'], 2, [7, 5]);
        var mid = vals[n / 2];
        var chordMid = (vals[0] + vals[n]) / 2;
        SEM.draw.line(ctx, X(0.5), Y(mid), X(0.5), Y(chordMid), C['w-label'], 1.2);
        SEM.draw.dot(ctx, X(0.5), Y(mid), 6, C['w-point']);
        SEM.draw.dot(ctx, X(0.5), Y(chordMid), 6, C['w-bad']);
      }
    });

    var fnPick = kit.segmented(panel.side, 'fn', [
      { id: 'a1', label: 'widgets.functions.a1' },
      { id: 'a2', label: 'widgets.functions.a2' },
      { id: 'w3', label: 'widgets.functions.w3' }
    ], st.fn, function (v) {
      st.fn = v;
      st.random = null;
      SEM.state.touch();
      slider.hidden = v !== 'a1';
      refresh();
    });
    var slider = kit.slider(panel.side, { label: 'widgets.functions.aLabel', min: -6, max: 6, step: 0.5, value: st.a }, function (v) {
      st.a = v;
      st.random = null;
      SEM.state.touch();
      refresh();
    });
    slider.hidden = st.fn !== 'a1';
    var actions = el('div', { class: 'widget-actions' });
    panel.side.appendChild(actions);
    kit.button(actions, 'widgets.functions.random', function () {
      var n = 1000;
      st.random = { fn: st.fn, a: st.a, n: n, count: M.jensenPairs(f, n, 2, 42) };
      SEM.state.touch();
      read.update();
    });
    kit.button(actions, 'widgets.reset', function () {
      st.points = [A1.p.slice(), A1.q.slice()];
      st.a = A1.aTest;
      st.random = null;
      slider.setValue(st.a);
      SEM.state.touch();
      refresh();
    }, 'btn-quiet');
    var read = kit.readout(panel.side, function (lang) {
      var a = st.points[0];
      var b = st.points[1];
      var fm = f((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      var chord = (f(a[0], a[1]) + f(b[0], b[1])) / 2;
      var lines = [
        SEM.tuf('widgets.functions.mid', { fm: kit.n(fm, lang), avg: kit.n(chord, lang) }, lang),
        { text: SEM.tu(fm - chord > 1e-9 * Math.max(1, Math.abs(chord)) ? 'widgets.functions.violated' : 'widgets.functions.holds', lang), cls: fm - chord > 1e-9 * Math.max(1, Math.abs(chord)) ? 'is-bad' : 'is-ok' }
      ];
      var r = st.random;
      if (r && r.fn === st.fn && r.a === st.a) lines.push(SEM.tuf('widgets.functions.randomResult', { k: r.count, n: r.n }, lang));
      return lines;
    });
    panel.side.appendChild(kit.label(el('p', { class: 'widget-legend' }), 'widgets.functions.legend'));

    function refresh() {
      read.update();
      mapPlot.requestDraw();
      slicePlot.requestDraw();
    }
    fnPick.setValue(st.fn);
  };

  /* ------------------------------------------------------------------ sublevel sets */

  SEM.widgets.sublevel = function (container) {
    var text = SEM.content.main.blocks.A.widgets.sublevel;
    var W = util.data('A.widgets.sublevel');
    var A1 = util.data('A1.params');
    var st = kit.state('sublevel');
    if (st.fn !== 'convex' && st.fn !== 'nonconvex') st.fn = 'convex';
    if (!util.isNum(st.levelConvex)) st.levelConvex = W.levelConvex;
    if (!util.isNum(st.levelNonconvex)) st.levelNonconvex = W.levelNonconvex;
    var f = function (x, y) {
      return st.fn === 'convex' ? M.fns.a1.f(x, y, { a: W.convexA, cyy: A1.cyy, bx: A1.bx }) : M.fns.a2.f(x, y);
    };
    var level = function () {
      return st.fn === 'convex' ? st.levelConvex : st.levelNonconvex;
    };
    var panel = kit.panel(container, text.title, text.caption, { id: 'sublevel' });
    var plot = new SEM.Plot(panel.stage, {
      domain: { x0: -4.2, x1: 2.6, y0: -2.6, y1: 2.6 },
      aspect: 0.72,
      label: function () { return SEM.tu('widgets.sublevel.aria'); },
      draw: function (ctx, p, C) {
        var lv = level();
        SEM.draw.region(ctx, p, function (x, y) { return f(x, y) <= lv; }, C['w-set'], 3);
        SEM.draw.axes(ctx, p, C, 1);
        var extra = st.fn === 'convex' ? [-0.5, 2, 6, 10, 15] : [0.1, 0.5, 2, 4];
        extra.forEach(function (e) {
          SEM.draw.contour(ctx, p, f, e, C['w-contour'], 1, 5);
        });
        SEM.draw.contour(ctx, p, f, lv, C['w-set-line'], 2.5, 3);
      }
    });
    var slider;
    kit.segmented(panel.side, 'sublevel', [
      { id: 'convex', label: 'widgets.sublevel.convex' },
      { id: 'nonconvex', label: 'widgets.sublevel.nonconvex' }
    ], st.fn, function (v) {
      st.fn = v;
      SEM.state.touch();
      rebuildSlider();
      refresh();
    });
    var sliderBox = el('div');
    panel.side.appendChild(sliderBox);
    function rebuildSlider() {
      dom.clear(sliderBox);
      var convex = st.fn === 'convex';
      slider = kit.slider(sliderBox, { label: 'widgets.sublevel.level', min: convex ? -1 : 0, max: convex ? 12 : 4, step: convex ? 0.5 : 0.1, value: level() }, function (v) {
        if (st.fn === 'convex') st.levelConvex = v;
        else st.levelNonconvex = v;
        SEM.state.touch();
        refresh();
      });
    }
    rebuildSlider();
    var read = kit.readout(panel.side, function (lang) {
      return [
        SEM.tuf(st.fn === 'convex' ? 'widgets.sublevel.fConvex' : 'widgets.sublevel.fNonconvex', { tex: SEM.fmt.tex(util.data('A1.tex.f'), lang), a: kit.n(W.convexA, lang) }, lang),
        { text: SEM.tu(st.fn === 'convex' ? 'widgets.sublevel.alwaysConvex' : 'widgets.sublevel.neverConvex', lang), cls: st.fn === 'convex' ? 'is-ok' : 'is-bad' }
      ];
    });
    function refresh() {
      read.update();
      plot.requestDraw();
    }
  };
})();
