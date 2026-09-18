// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Block C widget: KKT geometry for min ||x - c||^2 under linear constraints, with a draggable
// unconstrained minimizer, the active set, the gradients, the normal cone and the multipliers.
(function () {
  'use strict';
  var SEM = window.SEM;
  var M = SEM.math;
  var kit = SEM.kit;
  var dom = SEM.dom;
  var util = SEM.util;
  var render = SEM.render;
  var el = dom.el;

  var SUB = ['₁', '₂', '₃'];

  SEM.widgets.kkt = function (container) {
    var text = SEM.content.main.blocks.C.widget;
    var presets = util.data('C.widget.presets') || ['C1', 'C2', 'C3'];
    var st = kit.state('kkt');
    if (presets.indexOf(st.preset) < 0) st.preset = 'C1';
    function params() {
      return util.data(st.preset + '.params');
    }
    if (!M.finiteVec(st.c) || st.c.length !== 2) st.c = params().c.slice();

    var panel = kit.panel(container, text.title, text.caption, { id: 'kkt' });
    var dragging = false;

    function solve() {
      var P = params();
      var sol = M.kktSolution(st.c, P.A, P.b);
      var best = sol.best;
      var active = [];
      if (best) {
        best.g.forEach(function (g, i) {
          if (Math.abs(g) <= 1e-9) active.push(i);
        });
      }
      return { P: P, rows: sol.rows, best: best, active: active };
    }

    var plot = new SEM.Plot(panel.stage, {
      domain: { x0: -1.6, x1: 3.8, y0: -1.6, y1: 4.2 },
      aspect: 0.9,
      label: function () { return SEM.tu('widgets.kkt.aria'); },
      draw: function (ctx, p, C) {
        var S = solve();
        var P = S.P;
        SEM.draw.region(ctx, p, function (x, y) {
          for (var i = 0; i < P.A.length; i++) if (P.A[i][0] * x + P.A[i][1] * y > P.b[i]) return false;
          return true;
        }, C['w-set'], 3);
        SEM.draw.axes(ctx, p, C, 1);
        var f = p.fit;
        P.A.forEach(function (a, i) {
          var pts;
          if (Math.abs(a[1]) > Math.abs(a[0])) pts = [[f.x0, (P.b[i] - a[0] * f.x0) / a[1]], [f.x1, (P.b[i] - a[0] * f.x1) / a[1]]];
          else pts = [[(P.b[i] - a[1] * f.y0) / a[0], f.y0], [(P.b[i] - a[1] * f.y1) / a[0], f.y1]];
          var active = S.active.indexOf(i) >= 0;
          SEM.draw.line(ctx, p.sx(pts[0][0]), p.sy(pts[0][1]), p.sx(pts[1][0]), p.sy(pts[1][1]), C['w-set-line'], active ? 3 : 1.6, active ? null : [8, 6]);
        });
        ctx.save();
        ctx.strokeStyle = C['w-contour'];
        ctx.lineWidth = 1;
        [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].forEach(function (r) {
          ctx.beginPath();
          ctx.arc(p.sx(st.c[0]), p.sy(st.c[1]), r * p.scaleX, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
        var best = S.best;
        if (best) {
          var x = best.x;
          var X = p.sx(x[0]);
          var Y = p.sy(x[1]);
          if (S.active.length) {
            var angles = S.active.map(function (i) { return Math.atan2(P.A[i][1], P.A[i][0]); });
            var R = 2.4 * p.scaleX;
            ctx.save();
            ctx.fillStyle = C['w-cone'];
            ctx.beginPath();
            if (angles.length === 1) {
              var a0 = angles[0];
              ctx.moveTo(X, Y);
              ctx.arc(X, Y, R, -a0 - 0.06, -a0 + 0.06);
            } else {
              var lo = Math.min(angles[0], angles[1]);
              var hi = Math.max(angles[0], angles[1]);
              if (hi - lo > Math.PI) {
                var tmp = lo;
                lo = hi;
                hi = tmp + 2 * Math.PI;
              }
              ctx.moveTo(X, Y);
              ctx.arc(X, Y, R, -hi, -lo);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            S.active.forEach(function (i) {
              var a = P.A[i];
              var len = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
              var ex = x[0] + (0.9 * a[0]) / len;
              var ey = x[1] + (0.9 * a[1]) / len;
              SEM.draw.arrow(ctx, X, Y, p.sx(ex), p.sy(ey), C['w-set-line'], 2.5);
              var name = P.A.length === 1 ? '∇g' : '∇g' + SUB[i];
              SEM.draw.label(ctx, name, p.sx(ex) + (a[0] >= 0 ? 8 : -8), p.sy(ey) + 14, C['w-set-line'], { align: a[0] >= 0 ? 'left' : 'right' });
            });
          }
          var mg = [2 * (st.c[0] - x[0]), 2 * (st.c[1] - x[1])];
          var mgLen = Math.sqrt(mg[0] * mg[0] + mg[1] * mg[1]);
          if (mgLen > 1e-9) {
            var s = Math.min(0.45, 2.2 / mgLen);
            SEM.draw.arrow(ctx, X, Y, p.sx(x[0] + s * mg[0]), p.sy(x[1] + s * mg[1]), C['w-bad'], 3);
            SEM.draw.label(ctx, '−∇f', p.sx(x[0] + s * mg[0]) - 8, p.sy(x[1] + s * mg[1]) - 12, C['w-bad'], { align: 'right' });
          }
          SEM.draw.dot(ctx, X, Y, 7, C['w-bad'], C['w-halo'], 2);
          SEM.draw.label(ctx, 'x*', X + 10, Y + 16, C['w-bad'], { italic: true });
        }
        SEM.draw.dot(ctx, p.sx(st.c[0]), p.sy(st.c[1]), 8, C['w-point'], C['w-halo'], 2);
        SEM.draw.label(ctx, 'c', p.sx(st.c[0]) + 11, p.sy(st.c[1]) - 11, C['w-point'], { italic: true });
      },
      onPointer: function (type, w, ev, p) {
        if (type === 'down') dragging = SEM.pickHandle(p, w, [st.c], 40) === 0;
        if ((type === 'down' || type === 'drag') && dragging) {
          st.c = [util.clamp(w[0], -1.5, 3.7), util.clamp(w[1], -1.5, 4.1)];
          SEM.state.touch();
          if (st.preset === 'C2' && !predict.revealed()) predict.reveal();
          refresh();
        }
        if (type === 'up') dragging = false;
      }
    });

    kit.segmented(panel.side, 'kkt', presets.map(function (id) {
      return { id: id, label: { en: id, ru: id } };
    }), st.preset, function (v) {
      st.preset = v;
      st.c = params().c.slice();
      SEM.state.touch();
      refresh();
    });
    var predict = kit.predict(panel.side, 'kkt.C2', text.predict, refresh);
    var fBox = el('p', { class: 'readout-line widget-problem' });
    panel.side.appendChild(fBox);
    var read = kit.readout(panel.side, function (lang) {
      var S = solve();
      var best = S.best;
      if (!best) return [SEM.tu('widgets.kkt.none', lang)];
      var hide = st.preset === 'C2' && !predict.revealed();
      var lines = [
        SEM.tuf('widgets.kkt.c', { vec: kit.v(st.c, lang) }, lang),
        SEM.tuf('widgets.kkt.x', { vec: kit.v(best.x, lang), f: kit.n(best.f, lang) }, lang),
        SEM.tuf('widgets.kkt.active', { set: S.active.length ? '\\{' + S.active.map(function (i) { return i + 1; }).join(',\\ ') + '\\}' : '\\varnothing' }, lang)
      ];
      if (hide) lines.push(SEM.tu('widgets.kkt.hidden', lang));
      else {
        best.lam.forEach(function (l, i) {
          lines.push({ text: SEM.tuf('widgets.kkt.lambda', { i: S.P.A.length === 1 ? '' : '_' + (i + 1), val: kit.n(l, lang) }, lang), cls: l > 1e-9 ? 'is-strong' : '' });
        });
      }
      return lines;
    });
    var tableBox = el('div', { class: 'table-wrap' });
    panel.side.appendChild(tableBox);
    var controls = el('div', { class: 'widget-actions' });
    panel.side.appendChild(controls);
    kit.button(controls, 'widgets.reset', function () {
      st.c = params().c.slice();
      SEM.state.touch();
      refresh();
    }, 'btn-quiet');

    function drawTable() {
      var lang = SEM.i18n.lang;
      var S = solve();
      dom.clear(tableBox);
      if (st.preset === 'C2' && !predict.revealed()) return;
      var table = el('table', { class: 'cand-table' });
      var head = el('tr');
      ['widgets.kkt.colSet', 'widgets.kkt.colX', 'widgets.kkt.colLam', 'widgets.kkt.colFeasible', 'widgets.kkt.colSign'].forEach(function (path) {
        var th = el('th', { scope: 'col' });
        render.rich(th, SEM.ui(path));
        head.appendChild(th);
      });
      table.appendChild(el('thead', null, head));
      var body = el('tbody');
      S.rows.forEach(function (r) {
        var tr = el('tr', { class: r.kkt ? 'is-kkt' : '' });
        var set = r.active.length ? '\\{' + r.active.join(',\\ ') + '\\}' : '\\varnothing';
        [set, kit.v(r.x, lang), r.lam.length === 1 ? kit.n(r.lam[0], lang) : kit.v(r.lam, lang)].forEach(function (c) {
          var td = el('td');
          render.katex(td, c);
          tr.appendChild(td);
        });
        tr.appendChild(el('td', { class: r.primal ? 'yes' : 'no', text: r.primal ? '✓' : '✗' }));
        tr.appendChild(el('td', { class: r.dual ? 'yes' : 'no', text: r.dual ? '✓' : '✗' }));
        body.appendChild(tr);
      });
      table.appendChild(body);
      tableBox.appendChild(table);
    }
    SEM.on('lang', drawTable);

    function problemLine() {
      var lang = SEM.i18n.lang;
      var T = util.data(st.preset + '.tex') || {};
      var cons = T.g ? [T.g] : [T.g1, T.g2];
      var parts = cons.filter(Boolean).map(function (g) {
        return SEM.fmt.tex(g, lang) + ' \\le 0';
      });
      render.rich(fBox, '$\\min\\ \\|x - c\\|^2,\\quad ' + parts.join(',\\quad ') + '$');
    }

    function refresh() {
      problemLine();
      read.update();
      drawTable();
      plot.requestDraw();
    }
    SEM.on('lang', problemLine);
    refresh();
  };
})();
