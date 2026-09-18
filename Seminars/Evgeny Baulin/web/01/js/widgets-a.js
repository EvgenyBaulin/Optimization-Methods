// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Block A widget: the probe of the lecture function, with its gradient arrow, Hessian, determinant and eigenvalues.
(function () {
  'use strict';
  var SEM = window.SEM;
  var M = SEM.math;
  var kit = SEM.kit;
  var util = SEM.util;
  var render = SEM.render;
  var el = SEM.dom.el;

  // A coordinate on the grid of step h.
  function snap(v, h) {
    return Math.round(Math.round(v / h) * h * 1e6) / 1e6;
  }

  // Two vectors match when every component differs by at most 1e-9.
  function same(a, b) {
    return a.length === b.length && a.every(function (v, i) { return Math.abs(v - b[i]) <= 1e-9; });
  }

  SEM.widgets.probe = function (container) {
    var W = SEM.content.main.blocks.A.widgets.probe;
    var L = M.fns.lecture;
    var dom = util.data('A.probe.domain').slice();
    var levels = util.data('A.probe.levels').slice();
    var step = util.data('A.probe.snap');
    var stationary = util.data('A.lecture.stationary').slice();
    var presets = [
      { id: 'lecture', x: util.data('A.lecture.x').slice() },
      { id: 'origin', x: stationary.slice() },
      { id: 'a2', x: util.data('A2.params.x').slice() }
    ];
    var st = kit.state('probe');
    if (!M.finiteVec(st.x) || st.x.length !== 2) st.x = presets[0].x.slice();

    // The id of the preset at x, or null.
    function matching(x) {
      for (var i = 0; i < presets.length; i++) if (same(x, presets[i].x)) return presets[i].id;
      return null;
    }

    var panel = kit.panel(container, W.title, W.caption, { id: 'probe' });
    var predict = null;
    var drag = -1;
    var start = null;
    var moved = false;
    var plot = new SEM.Plot(panel.stage, {
      domain: { x0: dom[0], x1: dom[1], y0: dom[2], y1: dom[3] },
      aspect: 0.8,
      label: function () { return SEM.tu('widgets.probe.aria'); },
      draw: function (ctx, p, C) {
        SEM.draw.region(ctx, p, function (x, y) { return M.isPsd2(L.H(x, y)); }, C['w-psd'], 4);
        SEM.draw.axes(ctx, p, C, 1);
        levels.forEach(function (level) {
          SEM.draw.contour(ctx, p, L.f, level, C['w-contour'], 1, 5);
        });
        SEM.draw.dot(ctx, p.sx(stationary[0]), p.sy(stationary[1]), 6, null, C['w-label'], 2);
        var x = st.x;
        var gr = L.g(x[0], x[1]);
        var ng = M.norm(gr);
        if (ng > 1e-12) {
          var sigma = Math.min(0.6, 1.6 / ng);
          var tip = [p.sx(x[0] + sigma * gr[0]), p.sy(x[1] + sigma * gr[1])];
          SEM.draw.arrow(ctx, p.sx(x[0]), p.sy(x[1]), tip[0], tip[1], C['w-bad'], 2.5);
          SEM.draw.label(ctx, '∇f', tip[0] + 8, tip[1] - 8, C['w-bad']);
        }
        SEM.draw.dot(ctx, p.sx(x[0]), p.sy(x[1]), 8, C['w-point'], C['w-halo'], 2);
      },
      // A drag starts only on the probe; it reveals on release after a move of more than 6 px.
      onPointer: function (type, w, ev, p) {
        if (type === 'down') {
          drag = SEM.pickHandle(p, w, [st.x], 28);
          start = [ev.clientX, ev.clientY];
          moved = false;
          return;
        }
        if (type === 'drag' && drag >= 0) {
          if (Math.sqrt(Math.pow(ev.clientX - start[0], 2) + Math.pow(ev.clientY - start[1], 2)) > 6) moved = true;
          st.x = [snap(util.clamp(w[0], dom[0], dom[1]), step), snap(util.clamp(w[1], dom[2], dom[3]), step)];
          SEM.state.touch();
          refresh();
          return;
        }
        if (type === 'up') {
          if (drag >= 0 && moved && !predict.revealed()) predict.reveal();
          drag = -1;
        }
      }
    });

    predict = kit.predict(panel.side, 'probe', W.predict, refresh);
    var preset = kit.segmented(panel.side, 'probePreset', presets.map(function (q) {
      return { id: q.id, label: 'widgets.probe.' + q.id };
    }), matching(st.x), function (id) {
      presets.forEach(function (q) {
        if (q.id === id) st.x = q.x.slice();
      });
      SEM.state.touch();
      refresh();
    });
    var actions = el('div', { class: 'widget-actions' });
    kit.button(actions, 'widgets.reset', function () {
      st.x = presets[0].x.slice();
      SEM.state.touch();
      refresh();
    }, 'btn-quiet');
    panel.side.appendChild(actions);

    var read = kit.readout(panel.side, function (lang) {
      var x = st.x;
      var H = L.H(x[0], x[1]);
      var e = M.eigSym2(H[0][0], H[0][1], H[1][1]);
      var gr = L.g(x[0], x[1]);
      var lines = [
        SEM.tuf('widgets.probe.x', { vec: kit.v(x, lang), f: kit.n(L.f(x[0], x[1]), lang) }, lang),
        SEM.tuf('widgets.probe.hess', { mat: SEM.fmt.matrix(H, lang) }, lang),
        SEM.tuf('widgets.probe.det', { det: kit.n(M.det(H), lang), l1: kit.n(e[0], lang), l2: kit.n(e[1], lang) }, lang)
      ];
      if (!predict.revealed()) {
        lines.push(SEM.tu('widgets.probe.hidden', lang));
        return lines;
      }
      lines.push(SEM.tuf('widgets.probe.grad', { vec: kit.v(gr, lang) }, lang));
      if (M.norm(gr) > 1e-9) lines.push({ text: SEM.tu('widgets.probe.notStationary', lang), cls: 'is-bad' });
      else lines.push({ text: SEM.tu('widgets.probe.stationary', lang), cls: 'is-strong' });
      return lines;
    });

    var legend = kit.label(el('p', { class: 'widget-legend' }), 'widgets.probe.legend');
    panel.side.appendChild(legend);
    var answer = render.el('p', { class: 'answer-reveal' }, W.answer);
    panel.side.appendChild(answer);

    function refresh() {
      answer.hidden = !predict.revealed();
      preset.setValue(matching(st.x));
      read.update();
      plot.requestDraw();
    }
    refresh();
  };
})();
