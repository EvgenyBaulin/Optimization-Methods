// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Block B widget: projections onto the ball, the box and the simplex, with the sort table
// of the current point.
(function () {
  'use strict';
  var SEM = window.SEM;
  var M = SEM.math;
  var kit = SEM.kit;
  var dom = SEM.dom;
  var util = SEM.util;
  var render = SEM.render;
  var el = dom.el;

  SEM.widgets.projections = function (container) {
    var text = SEM.content.main.blocks.B.widget;
    var B2 = util.data('B2.params');
    var st = kit.state('projections');
    if (!M.finiteVec(st.v2) || st.v2.length !== 2) st.v2 = B2.x.slice();
    if (!M.finiteVec(st.plane) || st.plane.length !== 3) st.plane = util.data('B3.steps.inPlane').slice();
    if (!util.isNum(st.sum)) st.sum = util.data('B3.steps.sumV');
    if (['r2', 'r3', 'b1'].indexOf(st.source) < 0) st.source = 'r2';

    function vector() {
      if (st.source === 'r2') return st.v2.slice();
      if (st.source === 'b1') return util.data('B1.params.v').slice();
      var shift = (st.sum - 1) / 3;
      return st.plane.map(function (t) { return t + shift; });
    }

    var panel = kit.panel(container, text.title, text.caption, { id: 'projections', stack: true });
    var grid = el('div', { class: 'widget-grid two' });
    panel.stage.appendChild(grid);
    var left = el('div', { class: 'widget-col' });
    var right = el('div', { class: 'widget-col' });
    dom.append(grid, [left, right]);

    var plot2 = new SEM.Plot(left, {
      domain: { x0: -2.1, x1: 2.1, y0: -2.1, y1: 2.1 },
      aspect: 0.85,
      label: function () { return SEM.tu('widgets.projections.planeAria'); },
      draw: function (ctx, p, C) {
        SEM.draw.axes(ctx, p, C, 1);
        var lo = B2.lo;
        var hi = B2.hi;
        SEM.draw.polygon(ctx, [[p.sx(lo), p.sy(lo)], [p.sx(hi), p.sy(lo)], [p.sx(hi), p.sy(hi)], [p.sx(lo), p.sy(hi)]], null, C['w-box'], 2);
        ctx.beginPath();
        ctx.arc(p.sx(0), p.sy(0), B2.r * p.scaleX, 0, Math.PI * 2);
        ctx.fillStyle = C['w-set'];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = C['w-ball'];
        ctx.stroke();
        SEM.draw.line(ctx, p.sx(1), p.sy(0), p.sx(0), p.sy(1), C['w-simplex'], 4);
        var v = st.v2;
        var projs = [
          [M.projBall(v, [0, 0], B2.r), C['w-ball']],
          [M.projBox(v, B2.lo, B2.hi), C['w-box']],
          [M.projSimplex(v), C['w-simplex']]
        ];
        projs.forEach(function (pr) {
          if (!pr[0]) return;
          SEM.draw.line(ctx, p.sx(v[0]), p.sy(v[1]), p.sx(pr[0][0]), p.sy(pr[0][1]), pr[1], 1.6, [5, 4]);
          SEM.draw.dot(ctx, p.sx(pr[0][0]), p.sy(pr[0][1]), 6.5, pr[1], C['w-halo'], 2);
        });
        SEM.draw.dot(ctx, p.sx(v[0]), p.sy(v[1]), 8, C['w-point'], C['w-halo'], 2);
        SEM.draw.label(ctx, 'v', p.sx(v[0]) + 11, p.sy(v[1]) - 11, C['w-point'], { italic: true });
        SEM.draw.label(ctx, 'Δ₂', p.sx(0.62), p.sy(0.52), C['w-simplex'], { italic: true });
      },
      onPointer: function (type, w) {
        if (type === 'down' || type === 'drag') {
          st.v2 = [util.clamp(w[0], -2, 2), util.clamp(w[1], -2, 2)];
          st.source = 'r2';
          SEM.state.touch();
          refresh();
        }
      }
    });

    var plot3 = new SEM.Plot(right, {
      domain: { x0: -0.6, x1: 2.0, y0: -0.62, y1: 1.62 },
      aspect: 0.85,
      label: function () { return SEM.tu('widgets.projections.triangleAria'); },
      draw: function (ctx, p, C) {
        var V = M.triangle.map(function (q) { return [p.sx(q[0]), p.sy(q[1])]; });
        SEM.draw.polygon(ctx, V, C['w-set'], C['w-simplex'], 2);
        ['e₁', 'e₂', 'e₃'].forEach(function (name, k) {
          SEM.draw.label(ctx, name, V[k][0] + (k === 0 ? -14 : k === 1 ? 14 : 0), V[k][1] + (k === 2 ? -16 : 16), C['w-label'], { italic: true, align: 'center' });
        });
        var q = M.toPlane(st.plane);
        var x = M.projSimplex(st.plane);
        if (x) {
          var xp = M.toPlane(x);
          SEM.draw.line(ctx, p.sx(q[0]), p.sy(q[1]), p.sx(xp[0]), p.sy(xp[1]), C['w-simplex'], 1.6, [5, 4]);
          SEM.draw.dot(ctx, p.sx(xp[0]), p.sy(xp[1]), 6.5, C['w-simplex'], C['w-halo'], 2);
        }
        SEM.draw.dot(ctx, p.sx(q[0]), p.sy(q[1]), 8, C['w-point'], C['w-halo'], 2);
        SEM.draw.label(ctx, 'v', p.sx(q[0]) + 11, p.sy(q[1]) - 11, C['w-point'], { italic: true });
      },
      onPointer: function (type, w) {
        if (type === 'down' || type === 'drag') {
          st.plane = M.fromPlane([util.clamp(w[0], -0.55, 1.95), util.clamp(w[1], -0.58, 1.58)]);
          st.source = 'r3';
          SEM.state.touch();
          refresh();
        }
      }
    });
    var sumSlider = kit.slider(right, {
      label: 'widgets.projections.sum',
      min: -1,
      max: 3,
      step: 0.1,
      value: st.sum
    }, function (v) {
      st.sum = v;
      st.source = 'r3';
      SEM.state.touch();
      refresh();
    });

    var sideLeft = el('div', { class: 'widget-col side-col' });
    var sideRight = el('div', { class: 'widget-col side-col' });
    var sideGrid = el('div', { class: 'widget-grid two side-grid' });
    dom.append(sideGrid, [sideLeft, sideRight]);
    panel.side.appendChild(sideGrid);
    var presets = el('div', { class: 'widget-actions' });
    sideLeft.appendChild(presets);
    ['B1', 'B2', 'B3'].forEach(function (pid) {
      var b = el('button', { type: 'button', class: 'btn btn-quiet', text: pid });
      b.addEventListener('click', function () {
        if (pid === 'B1') st.source = 'b1';
        if (pid === 'B2') {
          st.v2 = B2.x.slice();
          st.source = 'r2';
        }
        if (pid === 'B3') {
          st.plane = util.data('B3.steps.inPlane').slice();
          st.sum = util.data('B3.steps.sumV');
          sumSlider.setValue(st.sum);
          st.source = 'r3';
        }
        SEM.state.touch();
        refresh();
      });
      SEM.i18n.bind(function () {
        b.setAttribute('aria-label', SEM.tuf('widgets.projections.preset', { id: pid }));
      });
      presets.appendChild(b);
    });

    var read2 = kit.readout(sideLeft, function (lang) {
      var v = st.v2;
      var pb = M.projBall(v, [0, 0], B2.r);
      var pq = M.projBox(v, B2.lo, B2.hi);
      var ps = M.projSimplex(v);
      if (!pb || !pq || !ps) return [];
      return [
        SEM.tuf('widgets.projections.v2', { vec: kit.v(v, lang) }, lang),
        { text: SEM.tuf('widgets.projections.ball', { vec: kit.v(pb, lang), d: kit.n(M.norm(M.sub(v, pb)), lang) }, lang), cls: 'key-ball' },
        { text: SEM.tuf('widgets.projections.box', { vec: kit.v(pq, lang), d: kit.n(M.norm(M.sub(v, pq)), lang) }, lang), cls: 'key-box' },
        { text: SEM.tuf('widgets.projections.simplex', { vec: kit.v(ps, lang), d: kit.n(M.norm(M.sub(v, ps)), lang) }, lang), cls: 'key-simplex' }
      ];
    });

    var tableTitle = el('h5', { class: 'widget-subtitle' });
    sideRight.appendChild(tableTitle);
    var tableBox = el('div', { class: 'table-wrap' });
    sideRight.appendChild(tableBox);
    function drawTable() {
      var lang = SEM.i18n.lang;
      var v = vector();
      var T = M.simplexTable(v);
      tableTitle.textContent = SEM.tu('widgets.projections.table.' + st.source, lang);
      dom.clear(tableBox);
      if (!T) return;
      var vline = el('p', { class: 'readout-line' });
      render.rich(vline, SEM.tuf('widgets.projections.vN', { vec: kit.v(v, lang) }, lang));
      tableBox.appendChild(vline);
      var table = el('table', { class: 'sort-table' });
      var head = el('tr');
      ['j', 'u_j', 's_j', 't_j'].forEach(function (h) {
        var th = el('th', { scope: 'col' });
        render.katex(th, h);
        head.appendChild(th);
      });
      table.appendChild(el('thead', null, head));
      var body = el('tbody');
      T.u.forEach(function (u, i) {
        var tr = el('tr', { class: i + 1 === T.rho ? 'is-rho' : i + 1 > T.rho ? 'is-after' : '' });
        [String(i + 1), kit.n(u, lang), kit.n(T.s[i], lang), kit.n(T.tests[i], lang)].forEach(function (c) {
          var td = el('td');
          render.katex(td, c);
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      table.appendChild(body);
      tableBox.appendChild(table);
      var res = el('p', { class: 'readout-line' });
      render.rich(res, SEM.tuf('widgets.projections.result', { rho: T.rho, theta: kit.n(T.theta, lang), vec: kit.v(T.x, lang) }, lang));
      tableBox.appendChild(res);
    }
    SEM.on('lang', drawTable);

    function refresh() {
      read2.update();
      drawTable();
      plot2.requestDraw();
      plot3.requestDraw();
    }
    refresh();
  };
})();
