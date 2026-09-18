// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Block D demos: projected gradient on a nonconvex set and on its convex hull, a failing
// constraint qualification, and the duality gap.
(function () {
  'use strict';
  var SEM = window.SEM;
  var M = SEM.math;
  var kit = SEM.kit;
  var dom = SEM.dom;
  var util = SEM.util;
  var render = SEM.render;
  var el = dom.el;

  /* ------------------------------------------------------------------ D1: multi-start projected gradient */

  SEM.widgets.pgd = function (container) {
    var text = SEM.content.main.blocks.D.D1;
    var P = util.data('D1.params');
    var st = kit.state('pgd');
    if (!Array.isArray(st.extra)) st.extra = [];
    var anim = { start: 0, running: false };
    var sets = [
      {
        id: 'union',
        project: function (x) { return M.projUnion(x, P.centers, P.radius); },
        inside: function (x, y) {
          return P.centers.some(function (c) { return (x - c[0]) * (x - c[0]) + (y - c[1]) * (y - c[1]) <= P.radius * P.radius; });
        },
        g: function (x, y) {
          return Math.min.apply(null, P.centers.map(function (c) { return Math.sqrt((x - c[0]) * (x - c[0]) + (y - c[1]) * (y - c[1])) - P.radius; }));
        }
      },
      {
        id: 'hull',
        project: function (x) { return M.projCapsule(x, P.centers[0], P.centers[1], P.radius); },
        inside: function (x, y) {
          var a = P.centers[0];
          var b = P.centers[1];
          var t = util.clamp((x - a[0]) / (b[0] - a[0]), 0, 1);
          var sx = a[0] + t * (b[0] - a[0]);
          var sy = a[1] + t * (b[1] - a[1]);
          return (x - sx) * (x - sx) + (y - sy) * (y - sy) <= P.radius * P.radius;
        },
        g: null
      }
    ];
    sets[1].g = function (x, y) {
      var a = P.centers[0];
      var b = P.centers[1];
      var t = util.clamp((x - a[0]) / (b[0] - a[0]), 0, 1);
      return Math.sqrt((x - (a[0] + t * (b[0] - a[0]))) * (x - (a[0] + t * (b[0] - a[0]))) + (y - a[1]) * (y - a[1])) - P.radius;
    };

    function starts() {
      return P.starts.concat(st.extra);
    }
    var grad = function (x) {
      return [2 * (x[0] - P.c[0]), 2 * (x[1] - P.c[1])];
    };
    function runs(set) {
      return starts().map(function (s) {
        return M.projectedGradient(grad, s, set.project, P.step, P.maxIter, P.tol);
      });
    }

    var panel = kit.panel(container, null, text.text, { id: 'pgd', stack: true });
    var predict = kit.predict(panel.stage, 'pgd.D1', text.predict, null, 'widgets.showResult');
    var grid = el('div', { class: 'widget-grid two' });
    panel.stage.appendChild(grid);
    var plots = sets.map(function (set) {
      var col = el('div', { class: 'widget-col' });
      grid.appendChild(col);
      col.appendChild(kit.label(el('h5', { class: 'widget-subtitle' }), 'widgets.pgd.' + set.id));
      var cache = null;
      var plot = new SEM.Plot(col, {
        domain: { x0: -3.1, x1: 3.1, y0: -2.6, y1: 2.6 },
        aspect: 0.8,
        label: function () { return SEM.tu('widgets.pgd.aria.' + set.id); },
        draw: function (ctx, p, C) {
          SEM.draw.region(ctx, p, set.inside, C['w-set'], 3);
          SEM.draw.contour(ctx, p, set.g, 0, C['w-set-line'], 2, 3);
          ctx.save();
          ctx.strokeStyle = C['w-contour'];
          ctx.lineWidth = 1;
          [1, 1.5, 2, 2.5, 3, 3.5].forEach(function (r) {
            ctx.beginPath();
            ctx.arc(p.sx(P.c[0]), p.sy(P.c[1]), r * p.scaleX, 0, Math.PI * 2);
            ctx.stroke();
          });
          ctx.restore();
          var ss = starts();
          ss.forEach(function (s) {
            SEM.draw.dot(ctx, p.sx(s[0]), p.sy(s[1]), 4, C['w-label']);
          });
          if (st.ran) {
            if (!cache || cache.n !== ss.length) cache = { n: ss.length, runs: runs(set) };
            var frac = 1;
            if (anim.running) frac = util.clamp((Date.now() - anim.start) / 1400, 0, 1);
            cache.runs.forEach(function (r, k) {
              if (!r) return;
              var path = [ss[k]].concat(r.path);
              var upto = Math.max(1, Math.round(frac * Math.min(path.length - 1, 60)));
              var shown = path.slice(0, Math.min(path.length, upto + 1)).map(function (q) { return [p.sx(q[0]), p.sy(q[1])]; });
              SEM.draw.polyline(ctx, shown, C['w-point'], 1.6);
              if (frac >= 1) SEM.draw.dot(ctx, p.sx(r.x[0]), p.sy(r.x[1]), 7, C['w-bad'], C['w-halo'], 2);
            });
          }
          SEM.draw.label(ctx, '×', p.sx(P.c[0]), p.sy(P.c[1]), C['w-label'], { align: 'center', size: 22 });
          SEM.draw.label(ctx, 'c', p.sx(P.c[0]) + 12, p.sy(P.c[1]) - 10, C['w-label'], { italic: true });
        },
        onPointer: function (type, w) {
          if (type !== 'down') return;
          st.extra = st.extra.concat([[util.clamp(w[0], -3, 3), util.clamp(w[1], -2.5, 2.5)]]).slice(-12);
          run();
        }
      });
      plot.invalidate = function () {
        cache = null;
      };
      return plot;
    });

    var result = render.el('p', { class: 'answer-reveal' }, text.result);
    panel.stage.appendChild(result);

    var actions = el('div', { class: 'widget-actions' });
    panel.side.appendChild(actions);
    kit.button(actions, 'widgets.run', run, 'btn-primary');
    kit.button(actions, 'widgets.reset', function () {
      st.extra = [];
      st.ran = false;
      SEM.state.touch();
      refresh();
    }, 'btn-quiet');
    var read = kit.readout(panel.side, function (lang) {
      if (!st.ran) return [SEM.tu('widgets.pgd.before', lang)];
      return sets.map(function (set) {
        var ends = runs(set).filter(Boolean).map(function (r) { return r.x; });
        var clusters = [];
        ends.forEach(function (x) {
          if (!clusters.some(function (c) { return M.norm(M.sub(c, x)) < 1e-6; })) clusters.push(x);
        });
        return SEM.tuf('widgets.pgd.ends.' + set.id, { k: clusters.length, n: ends.length }, lang);
      });
    });

    function run() {
      st.ran = true;
      SEM.state.touch();
      plots.forEach(function (p) { p.invalidate(); });
      if (!predict.revealed()) predict.reveal();
      if (util.reducedMotion()) anim.running = false;
      else {
        anim.running = true;
        anim.start = Date.now();
        var frame = function () {
          plots.forEach(function (p) { p.requestDraw(); });
          if (Date.now() - anim.start < 1450) window.requestAnimationFrame(frame);
          else {
            anim.running = false;
            plots.forEach(function (p) { p.requestDraw(); });
          }
        };
        window.requestAnimationFrame(frame);
      }
      refresh();
    }
    function refresh() {
      result.hidden = !predict.revealed() || !st.ran;
      plots.forEach(function (p) { p.invalidate(); p.requestDraw(); });
      read.update();
    }
    if (SEM.param('reveal') === 'all') st.ran = true;
    refresh();
  };

  /* ------------------------------------------------------------------ function plot helper */

  // A 1D plot with margins: spec {x0, x1, y0, y1, curves: [{f, color, dash}], hlines: [{y, color, label}], marker()}
  function linePlot(container, spec) {
    return new SEM.Plot(container, {
      domain: { x0: 0, x1: 1, y0: 0, y1: 1 },
      uniform: false,
      aspect: spec.aspect || 0.62,
      label: spec.label,
      draw: function (ctx, p, C) {
        var ml = 44;
        var mr = 18;
        var mt = 14;
        var mb = 30;
        var X = function (x) { return ml + ((x - spec.x0) / (spec.x1 - spec.x0)) * (p.w - ml - mr); };
        var Y = function (y) { return mt + (1 - (y - spec.y0) / (spec.y1 - spec.y0)) * (p.h - mt - mb); };
        var lang = SEM.i18n.lang;
        ctx.save();
        ctx.beginPath();
        ctx.rect(ml, mt, p.w - ml - mr, p.h - mt - mb);
        ctx.clip();
        (spec.yticks || []).forEach(function (t) {
          SEM.draw.line(ctx, ml, Y(t), p.w - mr, Y(t), C['w-grid'], 1);
        });
        (spec.hlines || []).forEach(function (h) {
          SEM.draw.line(ctx, ml, Y(h.y), p.w - mr, Y(h.y), C['w-bad'], 2, [8, 6]);
        });
        (spec.curves || []).forEach(function (cv) {
          var pts = [];
          var n = 240;
          for (var i = 0; i <= n; i++) {
            var x = cv.from + ((cv.to - cv.from) * i) / n;
            var y = cv.f(x);
            if (isFinite(y)) pts.push([X(x), Y(y)]);
          }
          SEM.draw.polyline(ctx, pts, C['w-point'], 3);
        });
        if (spec.marker) {
          var m = spec.marker();
          if (m && isFinite(m[1])) {
            SEM.draw.line(ctx, X(m[0]), Y(m[1]), X(m[0]), Y(spec.hlines && spec.hlines.length ? spec.hlines[0].y : m[1]), C['w-label'], 1.4, [3, 3]);
            SEM.draw.dot(ctx, X(m[0]), Y(m[1]), 7, C['w-point'], C['w-halo'], 2);
          }
        }
        ctx.restore();
        SEM.draw.line(ctx, ml, p.h - mb, p.w - mr, p.h - mb, C['w-axis'], 1.2);
        SEM.draw.line(ctx, ml, mt, ml, p.h - mb, C['w-axis'], 1.2);
        (spec.xticks || []).forEach(function (t) {
          SEM.draw.line(ctx, X(t), p.h - mb, X(t), p.h - mb + 5, C['w-axis'], 1);
          SEM.draw.label(ctx, SEM.fmt.num(t, lang, false), X(t), p.h - mb + 15, C['w-label'], { align: 'center', size: 13 });
        });
        (spec.yticks || []).forEach(function (t) {
          SEM.draw.label(ctx, SEM.fmt.num(t, lang, false), ml - 8, Y(t), C['w-label'], { align: 'right', size: 13 });
        });
        (spec.hlines || []).forEach(function (h) {
          if (h.label) SEM.draw.label(ctx, h.label, p.w - mr - 4, Y(h.y) - 12, C['w-bad'], { align: 'right', italic: true });
        });
        SEM.draw.label(ctx, 'λ', p.w - mr, p.h - mb - 12, C['w-label'], { align: 'right', italic: true });
      }
    });
  }

  /* ------------------------------------------------------------------ D2: no constraint qualification */

  SEM.widgets.dualD2 = function (container) {
    var text = SEM.content.main.blocks.D.D2;
    var st = kit.state('d2');
    if (!util.isNum(st.lam)) st.lam = 1;
    var pStar = util.data('D2.pStar');
    var panel = kit.panel(container, null, text.text, { id: 'd2' });
    var predict = kit.predict(panel.side, 'd2', text.predict, refresh, 'widgets.showResult');
    var plot = linePlot(panel.stage, {
      x0: 0, x1: 5, y0: -2, y1: 0.5,
      xticks: [0, 1, 2, 3, 4, 5],
      yticks: [-2, -1.5, -1, -0.5, 0],
      hlines: [{ y: pStar, label: 'p*' }],
      curves: [{ f: M.qD2, from: 0.05, to: 5 }],
      marker: function () { return [st.lam, M.qD2(st.lam)]; },
      label: function () { return SEM.tu('widgets.d2.aria'); }
    });
    kit.slider(panel.side, { label: 'widgets.lambda', min: 0.1, max: 5, step: 0.1, value: st.lam }, function (v) {
      st.lam = v;
      SEM.state.touch();
      refresh();
    });
    var read = kit.readout(panel.side, function (lang) {
      var q = M.qD2(st.lam);
      return [
        SEM.tuf('widgets.d2.q', { q: kit.n(q, lang) }, lang),
        SEM.tuf('widgets.gap', { gap: kit.n(pStar - q, lang) }, lang)
      ];
    });
    var result = render.el('p', { class: 'answer-reveal' }, text.result);
    panel.side.appendChild(result);
    function refresh() {
      result.hidden = !predict.revealed();
      read.update();
      plot.requestDraw();
    }
    refresh();
  };

  /* ------------------------------------------------------------------ D3: duality gap */

  SEM.widgets.dualD3 = function (container) {
    var text = SEM.content.main.blocks.D.D3;
    var D3 = util.data('D3');
    var st = kit.state('d3');
    if (!util.isNum(st.lam)) st.lam = 1;
    var panel = kit.panel(container, null, text.text, { id: 'd3' });
    var predict = kit.predict(panel.side, 'd3', text.predict, refresh, 'widgets.showResult');
    var plot = linePlot(panel.stage, {
      x0: 0, x1: 5, y0: -3, y1: 3,
      xticks: [0, 1, 2, 3, 4, 5],
      yticks: [-3, -2, -1, 0, 1, 2, 3],
      hlines: [{ y: D3.convex.pStar, label: 'p*' }],
      curves: [{ f: M.qC1, from: 0, to: 5 }],
      marker: function () { return [st.lam, M.qC1(st.lam)]; },
      label: function () { return SEM.tu('widgets.d3.aria'); }
    });
    kit.slider(panel.side, { label: 'widgets.lambda', min: 0, max: 5, step: 0.1, value: st.lam }, function (v) {
      st.lam = v;
      SEM.state.touch();
      refresh();
    });
    var read = kit.readout(panel.side, function (lang) {
      var q = M.qC1(st.lam);
      return [
        SEM.tuf('widgets.d3.q', { q: kit.n(q, lang) }, lang),
        SEM.tuf('widgets.gap', { gap: kit.n(D3.convex.pStar - q, lang) }, lang)
      ];
    });
    var result = render.el('p', { class: 'answer-reveal' }, text.result);
    panel.side.appendChild(result);

    var bool = kit.panel(container, null, text.boolText, { id: 'd3bool' });
    var line = new SEM.Plot(bool.stage, {
      domain: { x0: 0, x1: 1, y0: 0, y1: 1 },
      uniform: false,
      aspect: 0.3,
      label: function () { return SEM.tu('widgets.d3.lineAria'); },
      draw: function (ctx, p, C) {
        var lang = SEM.i18n.lang;
        var x0 = -2.2;
        var x1 = 3.6;
        var X = function (x) { return 30 + ((x - x0) / (x1 - x0)) * (p.w - 60); };
        var y = p.h * 0.55;
        SEM.draw.line(ctx, X(x0), y, X(x1), y, C['w-axis'], 1.5);
        [-2, -1, 0, 1, 2, 3].forEach(function (t) {
          SEM.draw.line(ctx, X(t), y - 5, X(t), y + 5, C['w-axis'], 1);
          SEM.draw.label(ctx, SEM.fmt.num(t, lang, false), X(t), y + 20, C['w-label'], { align: 'center', size: 13 });
        });
        D3.bool.values.forEach(function (v) {
          SEM.draw.dot(ctx, X(v), y, 8, C['w-point'], C['w-halo'], 2);
        });
        var pS = D3.bool.pStar;
        var dS = D3.bool.dStar;
        SEM.draw.label(ctx, 'p*', X(pS), y - 22, C['w-point'], { align: 'center', italic: true });
        if (predictBool.revealed()) {
          ctx.save();
          ctx.translate(X(dS), y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = C['w-bad'];
          ctx.fillRect(-6, -6, 12, 12);
          ctx.restore();
          SEM.draw.label(ctx, 'd*', X(dS), y - 22, C['w-bad'], { align: 'center', italic: true });
          var by = y + 36;
          SEM.draw.line(ctx, X(dS), by - 6, X(dS), by, C['w-bad'], 1.5);
          SEM.draw.line(ctx, X(dS), by, X(pS), by, C['w-bad'], 1.5);
          SEM.draw.line(ctx, X(pS), by - 6, X(pS), by, C['w-bad'], 1.5);
        }
      }
    });
    var predictBool = kit.predict(bool.side, 'd3bool', SEM.ui('widgets.d3.predictBool'), function () {
      boolResult.hidden = false;
      note.hidden = false;
      line.requestDraw();
    }, 'widgets.showResult');
    var boolResult = render.el('p', { class: 'answer-reveal' }, text.boolResult);
    var note = render.el('p', { class: 'widget-note' }, text.note);
    dom.append(bool.side, [boolResult, note]);
    boolResult.hidden = !predictBool.revealed();
    note.hidden = !predictBool.revealed();

    function refresh() {
      result.hidden = !predict.revealed();
      read.update();
      plot.requestDraw();
    }
    refresh();
  };
})();
