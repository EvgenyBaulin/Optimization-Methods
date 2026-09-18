// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// The opening hook: five marked points on a bowl, a saddle and a one-dimensional slice, classified before any calculus.
(function () {
  'use strict';
  var SEM = window.SEM;
  var M = SEM.math;
  var kit = SEM.kit;
  var util = SEM.util;
  var render = SEM.render;
  var el = SEM.dom.el;

  // The five marked points, their canvas names, and the colour and readout key of each kind.
  var POINTS = ['p1', 'p2', 'p3', 'p4', 'p5'];
  var NAMES = ['p₁', 'p₂', 'p₃', 'p₄', 'p₅'];
  var KIND_COLOR = { min: 'ok', max: 'bad', saddle: 'w-label' };
  var KIND_KEY = { min: 'kindMin', max: 'kindMax', saddle: 'kindSaddle' };

  SEM.widgets.hook = function (container) {
    var text = SEM.content.main.blocks.O.hook;
    var bowl = { point: util.data('hook.bowl.point').slice(), levels: util.data('hook.bowl.levels').slice() };
    var saddle = { point: util.data('hook.saddle.point').slice(), levels: util.data('hook.saddle.levels').slice() };
    var num = util.data('hook.slice.num').slice();
    var den = util.data('hook.slice.den');
    var domain = util.data('hook.slice.domain').slice();
    var range = util.data('hook.slice.range').slice();
    var ts = util.data('hook.slice.points').slice();
    var kinds = util.data('hook.kinds').slice();
    var globalIndex = util.data('hook.globalIndex');
    var st = kit.state('hook');
    if (POINTS.indexOf(st.point) < 0) st.point = 'p1';

    var predict = null;
    function revealed() {
      return !!predict && predict.revealed();
    }
    function g(t) {
      return M.slice(t, num, den);
    }
    // Point k (1..5): larger when selected, filled by its kind once the answer is shown.
    function radius(k) {
      return st.point === 'p' + k ? 8 : 6;
    }
    function colorOf(k) {
      return revealed() ? KIND_COLOR[kinds[k - 1]] : 'w-point';
    }
    function drawPoint(ctx, C, k, X, Y) {
      SEM.draw.dot(ctx, X, Y, radius(k), C[colorOf(k)], C['w-halo'], 2);
      if (revealed() && k === globalIndex) SEM.draw.dot(ctx, X, Y, 12, null, C.ok, 2);
      SEM.draw.label(ctx, NAMES[k - 1], X + 10, Y - 10, C['w-point']);
    }

    var panel = kit.panel(container, null, text.caption, { id: 'hook', stack: true });
    var grid = el('div', { class: 'widget-grid three' });
    panel.stage.appendChild(grid);
    var cols = ['bowl', 'saddle', 'slice'].map(function (name) {
      var col = el('div', { class: 'widget-col' });
      col.appendChild(kit.label(el('h5', { class: 'widget-subtitle' }), 'widgets.hook.' + name));
      grid.appendChild(col);
      return col;
    });

    /* ---------------- bowl ---------------- */
    var plotBowl = new SEM.Plot(cols[0], {
      domain: { x0: -2, x1: 2, y0: -2, y1: 2 },
      aspect: 0.9,
      scroll: true,
      label: function () { return SEM.tu('widgets.hook.ariaBowl'); },
      draw: function (ctx, p, C) {
        var lang = SEM.i18n.lang;
        SEM.draw.axes(ctx, p, C, 1);
        bowl.levels.forEach(function (l) {
          SEM.draw.contour(ctx, p, M.fns.hookBowl.f, l, C['w-set-line'], 2);
        });
        bowl.levels.forEach(function (l) {
          // the contour meets the diagonal at (t, t)
          var t = Math.sqrt(l / 3);
          SEM.draw.label(ctx, SEM.fmt.num(l, lang, false), p.sx(t) + 6, p.sy(t) - 6, C['w-label'], { size: 13 });
        });
        drawPoint(ctx, C, 1, p.sx(bowl.point[0]), p.sy(bowl.point[1]));
      },
      onPointer: function (type, w, ev, p) {
        if (type === 'down' && SEM.pickHandle(p, w, [bowl.point], 28) === 0) select('p1');
      }
    });

    /* ---------------- saddle ---------------- */
    var plotSaddle = new SEM.Plot(cols[1], {
      domain: { x0: -2, x1: 2, y0: -2, y1: 2 },
      aspect: 0.9,
      scroll: true,
      label: function () { return SEM.tu('widgets.hook.ariaSaddle'); },
      draw: function (ctx, p, C) {
        var lang = SEM.i18n.lang;
        SEM.draw.axes(ctx, p, C, 1);
        saddle.levels.forEach(function (l) {
          SEM.draw.contour(ctx, p, M.fns.saddle.f, l, C['w-set-line'], 2);
        });
        // the labels go on top of every contour, and clear of the branch they belong to: a positive
        // level stands right of its vertex, where the branch runs vertically, a negative one under its
        // vertex, inside the cup the branch opens upward from
        saddle.levels.forEach(function (l) {
          var text = SEM.fmt.num(l, lang, false);
          if (l > 0) SEM.draw.label(ctx, text, p.sx(Math.sqrt(l)) + 6, p.sy(0) - 6, C['w-label'], { size: 13 });
          else SEM.draw.label(ctx, text, p.sx(0), p.sy(Math.sqrt(-l)) + 13, C['w-label'], { align: 'center', size: 13 });
        });
        drawPoint(ctx, C, 2, p.sx(saddle.point[0]), p.sy(saddle.point[1]));
      },
      onPointer: function (type, w, ev, p) {
        if (type === 'down' && SEM.pickHandle(p, w, [saddle.point], 28) === 0) select('p2');
      }
    });

    /* ---------------- slice ---------------- */
    var plotSlice = SEM.plot1d(cols[2], {
      x0: domain[0],
      x1: domain[1],
      y0: range[0],
      y1: range[1],
      aspect: 0.9,
      scroll: true,
      xticks: [-2, -1, 0, 1],
      yticks: [0, 1, 2],
      xlabel: 't',
      label: function () { return SEM.tu('widgets.hook.ariaSlice'); },
      curves: function () {
        return [{ f: g, from: domain[0], to: domain[1], color: 'w-set-line', width: 3 }];
      },
      points: function () {
        var out = ts.map(function (t, i) {
          var k = i + 3;
          return { x: t, y: g(t), color: colorOf(k), r: radius(k), label: NAMES[k - 1] };
        });
        if (revealed() && globalIndex >= 3 && globalIndex <= 5) {
          var tg = ts[globalIndex - 3];
          out.push({ x: tg, y: g(tg), color: 'ok', r: 12, hollow: true });
        }
        return out;
      },
      onPointer: function (type, xy, ev, plot) {
        if (type !== 'down') return;
        var i = plot.pickPoint(ev, 28);
        if (0 <= i && i < 3) select('p' + (i + 3));
      }
    });

    /* ---------------- controls, readout, answer ---------------- */
    predict = kit.predict(panel.side, 'hook', text.predict, refresh);
    var pick = kit.segmented(panel.side, 'hookPoint', [1, 2, 3, 4, 5].map(function (k) {
      return { id: 'p' + k, label: 'widgets.hook.p' + k };
    }), st.point, select);

    // A tap on a plot or a choice in the picker selects a point; neither reveals the answer.
    function select(id) {
      st.point = id;
      SEM.state.touch();
      pick.setValue(id);
      refresh();
    }

    var read = kit.readout(panel.side, function (lang) {
      var k = POINTS.indexOf(st.point) + 1;
      var lines = [];
      if (k <= 2) {
        var fn = k === 1 ? M.fns.hookBowl : M.fns.saddle;
        var pt = k === 1 ? bowl.point : saddle.point;
        var H = fn.H(pt[0], pt[1]);
        var e = M.eigSym2(H[0][0], H[0][1], H[1][1]);
        lines.push(SEM.tuf('widgets.hook.grad', { vec: kit.v(fn.g(pt[0], pt[1]), lang), x: kit.v(pt, lang) }, lang));
        lines.push(SEM.tuf('widgets.hook.hess', { mat: SEM.fmt.matrix(H, lang), l1: kit.n(e[0], lang), l2: kit.n(e[1], lang) }, lang));
      } else {
        var t = ts[k - 3];
        lines.push(SEM.tuf('widgets.hook.slope', { d1: kit.n(M.sliceD1(t, num, den), lang), t: kit.n(t, lang), g: kit.n(M.slice(t, num, den), lang) }, lang));
        lines.push(SEM.tuf('widgets.hook.curv', { d2: kit.n(M.sliceD2(t, num, den), lang) }, lang));
      }
      if (!revealed()) {
        lines.push(SEM.tu('widgets.hook.hidden', lang));
        return lines;
      }
      lines.push({ text: SEM.tu('widgets.hook.' + KIND_KEY[kinds[k - 1]], lang), cls: 'is-strong' });
      if (k === globalIndex) lines.push({ text: SEM.tu('widgets.hook.kindGlobal', lang), cls: 'is-ok' });
      if (k === 1) lines.push({ text: SEM.tu('widgets.hook.kindGlobalBowl', lang), cls: 'is-ok' });
      var list = [1, 2, 3, 4, 5].map(function (j) {
        return '$p_' + j + '$: ' + SEM.tu('widgets.hook.short.' + kinds[j - 1], lang);
      });
      lines.push(SEM.tuf('widgets.hook.all', { list: list.join('; ') }, lang));
      return lines;
    });

    var answer = render.el('p', { class: 'answer-reveal' }, text.answer);
    panel.side.appendChild(answer);

    function refresh() {
      answer.hidden = !predict.revealed();
      read.update();
      plotBowl.requestDraw();
      plotSaddle.requestDraw();
      plotSlice.requestDraw();
    }
    refresh();
  };
})();
