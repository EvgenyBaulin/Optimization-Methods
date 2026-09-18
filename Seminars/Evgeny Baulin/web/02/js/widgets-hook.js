// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// The opening hook: minimize ||x - c||^2 over the unit ball and over the simplex.
// Students predict first; dragging c or pressing the button shows the minimizer.
(function () {
  'use strict';
  var SEM = window.SEM;
  var M = SEM.math;
  var kit = SEM.kit;
  var dom = SEM.dom;
  var render = SEM.render;
  var el = dom.el;

  SEM.widgets.hook = function (container) {
    var D = SEM.util.data('hook');
    var text = SEM.content.main.blocks.O.hook;
    var st = kit.state('hook');
    if (!M.finiteVec(st.ball) || st.ball.length !== 2) st.ball = D.ball.c.slice();
    if (!M.finiteVec(st.simplex) || st.simplex.length !== 3) st.simplex = D.simplex.c.slice();

    var panel = kit.panel(container, null, text.caption, { id: 'hook', stack: true });
    var grid = el('div', { class: 'widget-grid two' });
    panel.stage.appendChild(grid);

    /* ---------------- ball ---------------- */
    var colBall = el('div', { class: 'widget-col' });
    grid.appendChild(colBall);
    colBall.appendChild(kit.label(el('h5', { class: 'widget-subtitle' }), 'widgets.hook.ball'));
    var predBall = kit.predict(colBall, 'hook.ball', text.predictBall, refresh);
    var plotBall = new SEM.Plot(colBall, {
      domain: { x0: -2.1, x1: 2.1, y0: -2.1, y1: 2.1 },
      aspect: 0.8,
      label: function () { return SEM.tu('widgets.hook.ballAria'); },
      draw: function (ctx, p, C) {
        SEM.draw.axes(ctx, p, C, 1);
        var r = D.ball.r;
        ctx.beginPath();
        ctx.arc(p.sx(0), p.sy(0), r * p.scaleX, 0, Math.PI * 2);
        ctx.fillStyle = C['w-set'];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = C['w-set-line'];
        ctx.stroke();
        var c = st.ball;
        var x = M.projBall(c, [0, 0], r);
        if (predBall.revealed() && x) {
          SEM.draw.line(ctx, p.sx(c[0]), p.sy(c[1]), p.sx(x[0]), p.sy(x[1]), C['w-point'], 1.5, [5, 4]);
          SEM.draw.dot(ctx, p.sx(x[0]), p.sy(x[1]), 7, C['w-bad'], C['w-halo'], 2);
          SEM.draw.label(ctx, 'x*', p.sx(x[0]) - 12, p.sy(x[1]) + 16, C['w-bad'], { italic: true, align: 'right' });
        }
        SEM.draw.dot(ctx, p.sx(c[0]), p.sy(c[1]), 8, C['w-point'], C['w-halo'], 2);
        SEM.draw.label(ctx, 'c', p.sx(c[0]) + 12, p.sy(c[1]) - 10, C['w-point'], { italic: true });
      },
      onPointer: function (type, w) {
        if (type === 'down' || type === 'drag') {
          st.ball = [SEM.util.clamp(w[0], -2, 2), SEM.util.clamp(w[1], -2, 2)];
          SEM.state.touch();
          if (!predBall.revealed()) predBall.reveal();
          refresh();
        }
      }
    });
    var ansBall = render.el('p', { class: 'answer-reveal' }, text.answerBall);
    colBall.appendChild(ansBall);
    var readBall = kit.readout(colBall, function (lang) {
      var c = st.ball;
      var x = M.projBall(c, [0, 0], D.ball.r);
      var lines = [SEM.tuf('widgets.hook.cLine', { vec: kit.v(c, lang) }, lang)];
      if (!predBall.revealed()) return lines.concat([SEM.tu('widgets.hook.hidden', lang)]);
      if (!x) return lines;
      lines.push(SEM.tuf('widgets.hook.xLine', { vec: kit.v(x, lang) }, lang));
      var norm = M.norm(c);
      lines.push(norm <= D.ball.r ? SEM.tu('widgets.hook.interior', lang) : SEM.tuf('widgets.hook.boundary', { num: kit.n(norm, lang) }, lang));
      return lines;
    });

    /* ---------------- simplex ---------------- */
    var colSimp = el('div', { class: 'widget-col' });
    grid.appendChild(colSimp);
    colSimp.appendChild(kit.label(el('h5', { class: 'widget-subtitle' }), 'widgets.hook.simplex'));
    var predSimp = kit.predict(colSimp, 'hook.simplex', text.predictSimplex, refresh);
    var plotSimp = new SEM.Plot(colSimp, {
      domain: { x0: -0.55, x1: 1.97, y0: -0.6, y1: 1.62 },
      aspect: 0.8,
      label: function () { return SEM.tu('widgets.hook.simplexAria'); },
      draw: function (ctx, p, C) {
        var V = M.triangle.map(function (v) { return [p.sx(v[0]), p.sy(v[1])]; });
        SEM.draw.polygon(ctx, V, C['w-set'], C['w-set-line'], 2);
        ['e₁', 'e₂', 'e₃'].forEach(function (name, k) {
          var dx = k === 0 ? -14 : k === 1 ? 14 : 0;
          var dy = k === 2 ? -16 : 16;
          SEM.draw.label(ctx, name, V[k][0] + dx, V[k][1] + dy, C['w-label'], { italic: true, align: 'center' });
        });
        var c = st.simplex;
        var cp = M.toPlane(c);
        var x = M.projSimplex(c);
        if (predSimp.revealed() && x) {
          var xp = M.toPlane(x);
          SEM.draw.line(ctx, p.sx(cp[0]), p.sy(cp[1]), p.sx(xp[0]), p.sy(xp[1]), C['w-point'], 1.5, [5, 4]);
          SEM.draw.dot(ctx, p.sx(xp[0]), p.sy(xp[1]), 7, C['w-bad'], C['w-halo'], 2);
          SEM.draw.label(ctx, 'x*', p.sx(xp[0]) - 12, p.sy(xp[1]) - 14, C['w-bad'], { italic: true, align: 'right' });
        }
        SEM.draw.dot(ctx, p.sx(cp[0]), p.sy(cp[1]), 8, C['w-point'], C['w-halo'], 2);
        SEM.draw.label(ctx, 'c', p.sx(cp[0]) + 12, p.sy(cp[1]) + 12, C['w-point'], { italic: true });
      },
      onPointer: function (type, w) {
        if (type === 'down' || type === 'drag') {
          var q = [SEM.util.clamp(w[0], -0.5, 1.9), SEM.util.clamp(w[1], -0.55, 1.55)];
          st.simplex = M.fromPlane(q);
          SEM.state.touch();
          if (!predSimp.revealed()) predSimp.reveal();
          refresh();
        }
      }
    });
    var ansSimp = render.el('p', { class: 'answer-reveal' }, text.answerSimplex);
    colSimp.appendChild(ansSimp);
    var readSimp = kit.readout(colSimp, function (lang) {
      var c = st.simplex;
      var x = M.projSimplex(c);
      var lines = [SEM.tuf('widgets.hook.cLine', { vec: kit.v(c, lang) }, lang)];
      if (!predSimp.revealed()) return lines.concat([SEM.tu('widgets.hook.hidden', lang)]);
      if (!x) return lines;
      lines.push(SEM.tuf('widgets.hook.xLine', { vec: kit.v(x, lang) }, lang));
      var zeros = [];
      x.forEach(function (v, i) {
        if (v <= 1e-12) zeros.push('x_' + (i + 1));
      });
      lines.push(zeros.length ? SEM.tuf('widgets.hook.zeros', { list: '$' + zeros.join(',\\ ') + '$' }, lang) : SEM.tu('widgets.hook.noZeros', lang));
      return lines;
    });

    var controls = el('div', { class: 'widget-actions' });
    kit.button(controls, 'widgets.reset', function () {
      st.ball = D.ball.c.slice();
      st.simplex = D.simplex.c.slice();
      SEM.state.touch();
      refresh();
    }, 'btn-quiet');
    panel.side.appendChild(controls);

    function refresh() {
      ansBall.hidden = !predBall.revealed() || M.norm(M.sub(st.ball, D.ball.c)) > 1e-9;
      ansSimp.hidden = !predSimp.revealed() || M.norm(M.sub(st.simplex, D.simplex.c)) > 1e-9;
      readBall.update();
      readSimp.update();
      plotBall.requestDraw();
      plotSimp.requestDraw();
    }
    refresh();
  };
})();
