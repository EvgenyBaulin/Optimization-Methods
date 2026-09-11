/* ==========================================================================
   Optimization Atlas - discrete.js
   Section E: seven independent widgets, each running the real algorithm one
   step at a time.

   To add a widget, call Atlas.registerWidget({...}) with:

     id, name, blurb
     panes      [{id, height, uniform, label}]   one canvas each
     layout     'split' or 'wide-left' to put the panes side by side
     controls   [slider specs, see Atlas.makeSlider]
     modes      [{id, name}] optional segmented control
     actions    [{id, name, run(w)}] optional extra buttons
     speed      steps per second while Auto is on
     reset(w)   build w.state from scratch
     step(w)    advance one step; return false when there is nothing left
     draw(w)    render into w.views[paneId]
     status(w)  one line of HTML under the controls

   The framework owns Step / Auto / Reset, the sliders and the redraw loop.
   ========================================================================== */
(function () {
  'use strict';

  var Atlas = window.Atlas;
  var num = Atlas.num;
  var draw = Atlas.draw;
  var el = Atlas.dom.el;
  var clear = Atlas.dom.clear;

  var defs = [];
  Atlas.registerWidget = function (def) { defs.push(def); return def; };

  /* =======================================================================
     Shared geometry for the polyhedral widgets
     ===================================================================== */

  /* A constraint is {a: [a1, a2], b, name} and means a·x ≤ b. */
  function insideAll(cons, x, tol) {
    tol = (tol === undefined) ? 1e-9 : tol;
    for (var i = 0; i < cons.length; i++) {
      if (cons[i].a[0] * x[0] + cons[i].a[1] * x[1] > cons[i].b + tol) return false;
    }
    return true;
  }

  /* Vertices of {x : Ax ≤ b}: every pair of constraints is intersected and
     kept when the point satisfies all the others.  Exact in two dimensions. */
  function halfspaceVertices(cons) {
    var pts = [], i, j, k;
    for (i = 0; i < cons.length; i++) {
      for (j = i + 1; j < cons.length; j++) {
        var a = cons[i].a, c = cons[j].a;
        var det = a[0] * c[1] - a[1] * c[0];
        if (Math.abs(det) < 1e-12) continue;
        var x = [(cons[i].b * c[1] - a[1] * cons[j].b) / det,
                 (a[0] * cons[j].b - cons[i].b * c[0]) / det];
        if (!num.finite(x)) continue;
        if (!insideAll(cons, x, 1e-7)) continue;
        var dup = false;
        for (k = 0; k < pts.length; k++) if (num.dist(pts[k], x) < 1e-7) { dup = true; break; }
        if (!dup) pts.push(x);
      }
    }
    if (pts.length < 3) return pts;
    var cx = 0, cy = 0;
    pts.forEach(function (p) { cx += p[0]; cy += p[1]; });
    cx /= pts.length; cy /= pts.length;
    pts.sort(function (p, q) {
      return Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx);
    });
    return pts;
  }

  /* Andrew's monotone chain, counter-clockwise. */
  function convexHull(pts) {
    if (pts.length < 3) return pts.slice();
    var p = pts.slice().sort(function (a, b) { return (a[0] - b[0]) || (a[1] - b[1]); });
    function cross(o, a, b) {
      return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    }
    var lower = [], upper = [], i;
    for (i = 0; i < p.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p[i]) <= 0) lower.pop();
      lower.push(p[i]);
    }
    for (i = p.length - 1; i >= 0; i--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p[i]) <= 0) upper.pop();
      upper.push(p[i]);
    }
    lower.pop(); upper.pop();
    return lower.concat(upper);
  }

  function latticePoints(cons, xhi, yhi) {
    var out = [], x, y;
    for (x = 0; x <= xhi; x++) {
      for (y = 0; y <= yhi; y++) if (insideAll(cons, [x, y])) out.push([x, y]);
    }
    return out;
  }

  /* Maximise c·x over {x : Ax ≤ b} by enumerating vertices. */
  function solveLP(cons, c) {
    var V = halfspaceVertices(cons);
    if (!V.length) return null;
    var bi = 0, bv = num.dot(c, V[0]);
    for (var i = 1; i < V.length; i++) {
      var v = num.dot(c, V[i]);
      if (v > bv) { bv = v; bi = i; }
    }
    return { x: V[bi].slice(), val: bv, vertices: V };
  }

  function drawPolygon(v, ctx, pts, opt) {
    if (!pts.length) return;
    ctx.save();
    ctx.beginPath();
    pts.forEach(function (p, i) {
      var s = v.toScreen(p);
      if (i === 0) ctx.moveTo(s[0], s[1]); else ctx.lineTo(s[0], s[1]);
    });
    ctx.closePath();
    if (opt.fill) {
      ctx.fillStyle = opt.fill;
      ctx.globalAlpha = opt.fillAlpha === undefined ? 0.14 : opt.fillAlpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (opt.stroke) {
      ctx.strokeStyle = opt.stroke;
      ctx.lineWidth = opt.width || 1.8;
      if (opt.dash) ctx.setLineDash(opt.dash);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  /* Fits a domain around a set of points with a margin, for a uniform view. */
  function fitTo(v, pts, margin) {
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    pts.forEach(function (p) {
      x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]);
      y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
    });
    margin = margin === undefined ? 0.6 : margin;
    v.setDomain({ x0: x0 - margin, x1: x1 + margin, y0: y0 - margin, y1: y1 + margin });
  }

  function axes(v, ctx, C) {
    ctx.save();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, v.sy(0)); ctx.lineTo(v.w, v.sy(0));
    ctx.moveTo(v.sx(0), 0); ctx.lineTo(v.sx(0), v.h);
    ctx.stroke();
    ctx.restore();
  }

  /* =======================================================================
     The widget framework
     ===================================================================== */

  var instances = [];

  function buildWidget(def, host) {
    var w = {
      def: def, views: {}, params: {}, sliders: {}, buttons: {},
      auto: false, acc: 0, dirty: true, state: null,
      mode: def.modes ? def.modes[0].id : null,
      texts: []                         /* [element, text] pairs re-read by relabel() */
    };

    /* Writes a label that may be an Atlas.L text and remembers where it went,
       so a language switch can rewrite it in place. */
    function labelled(node, text) {
      node.textContent = Atlas.tr(text);
      w.texts.push([node, text]);
      return node;
    }

    var card = el('div', 'wcard');
    card.id = 'w-' + def.id;
    w.card = card;
    card.appendChild(labelled(el('h3'), def.name));
    card.appendChild(labelled(el('p', 'wblurb'), def.blurb));

    var body = el('div', 'wbody' + (def.layout ? ' ' + def.layout : ''));
    (def.panes || [{ id: 'main', height: 360 }]).forEach(function (pane) {
      var box = el('div', 'wpane');
      box.style.height = (pane.height || 360) + 'px';
      if (pane.maxWidth) {
        box.style.maxWidth = pane.maxWidth + 'px';
        box.style.width = '100%';
        box.style.margin = '0 auto';
      }
      var cv = document.createElement('canvas');
      box.appendChild(cv);
      if (pane.label) box.appendChild(labelled(el('div', 'wpane-label'), pane.label));
      body.appendChild(box);
      var v = new Atlas.View(cv);
      v.uniform = !!pane.uniform;
      w.views[pane.id] = v;
      if (pane.pointer) {
        cv.addEventListener('pointerdown', function (ev) { pane.pointer(w, v.pointer(ev)); w.dirty = true; });
      }
    });
    card.appendChild(body);

    var ctl = el('div', 'wctl');

    if (def.modes) {
      var seg = el('div', 'seg');
      def.modes.forEach(function (m, i) {
        var b = labelled(el('button', 'seg-btn' + (i === 0 ? ' is-on' : '')), m.name);
        b.type = 'button';
        b.addEventListener('click', function () {
          w.mode = m.id;
          var all = seg.querySelectorAll('.seg-btn');
          for (var k = 0; k < all.length; k++) all[k].classList.toggle('is-on', all[k] === b);
          w.reset();
        });
        seg.appendChild(b);
      });
      ctl.appendChild(seg);
    }

    (def.controls || []).forEach(function (spec) {
      w.params[spec.id] = spec.def;
      var sl = Atlas.makeSlider(spec, spec.def, function (v) {
        w.params[spec.id] = v;
        if (def.onParam) def.onParam(w, spec.id, v); else w.reset();
        w.dirty = true;
      });
      w.sliders[spec.id] = sl;
      ctl.appendChild(sl.root);
    });

    function mkBtn(label, cls, fn) {
      var b = labelled(el('button', 'btn' + (cls ? ' ' + cls : '')), label);
      b.type = 'button';
      b.addEventListener('click', fn);
      ctl.appendChild(b);
      return b;
    }

    w.buttons.step = mkBtn(Atlas.L('Step', 'Шаг'), null, function () { w.auto = false; syncAuto(); w.stepOnce(); });
    w.buttons.auto = mkBtn(Atlas.L('Auto', 'Авто'), 'primary', function () {
      w.auto = !w.auto;
      if (w.auto && w.finished) w.reset();
      w.acc = 0;
      syncAuto();
    });
    w.buttons.reset = mkBtn(Atlas.L('Reset', 'Сброс'), null, function () { w.auto = false; syncAuto(); w.reset(); });

    (def.actions || []).forEach(function (act) {
      w.buttons[act.id] = mkBtn(act.name, null, function () {
        act.run(w);
        w.dirty = true;
      });
    });

    function syncAuto() { w.buttons.auto.textContent = w.auto ? Atlas.t('Pause', 'Пауза') : Atlas.t('Auto', 'Авто'); }

    card.appendChild(ctl);
    w.statusEl = el('div', 'wstatus');
    card.appendChild(w.statusEl);
    host.appendChild(card);

    w.reset = function () {
      w.finished = false;
      def.reset(w);
      w.acc = 0;
      w.dirty = true;
    };
    w.stepOnce = function () {
      if (w.finished) return false;
      var more = def.step(w);
      if (more === false) { w.finished = true; w.auto = false; syncAuto(); }
      w.dirty = true;
      return more !== false;
    };
    w.syncAuto = syncAuto;

    /* After a language switch: every label is rewritten where it stands and
       the canvases and the status line are redrawn.  Nothing is reset, so a
       running Auto keeps running and a half-filled table stays half-filled. */
    w.relabel = function () {
      w.texts.forEach(function (p) { p[0].textContent = Atlas.tr(p[1]); });
      Object.keys(w.sliders).forEach(function (k) { w.sliders[k].relabel(); });
      syncAuto();                       /* after the texts: Auto may read Pause */
      w.dirty = true;
    };

    if (def.init) def.init(w);
    w.reset();
    return w;
  }

  /* =======================================================================
     Section E driver
     ===================================================================== */

  var navLinks = [];                  /* [link, text] pairs of the #e-nav bar */

  Atlas.discrete = {
    instances: instances,
    defs: defs,                       /* exposed so the widgets can be tested headlessly */
    init: function () {
      var host = document.getElementById('e-host');
      var nav = document.getElementById('e-nav');
      if (!host) return;
      clear(host);
      if (nav) { clear(nav); navLinks.length = 0; }
      defs.forEach(function (def) {
        var a = null;
        if (nav) {
          a = document.createElement('a');
          a.href = '#w-' + def.id;
          a.textContent = Atlas.tr(def.name);
          nav.appendChild(a);
          navLinks.push([a, def.name]);
        }
        var w = buildWidget(def, host);
        instances.push(w);
        if (a) {
          /* Scroll to the card without following the link: the address of
             the page stays clean, with no #w-… fragment. */
          a.addEventListener('click', function (ev) {
            ev.preventDefault();
            w.card.scrollIntoView({ block: 'start' });
          });
        }
      });
    },
    onShow: function () {
      instances.forEach(function (w) { w.dirty = true; });
    },
    frame: function (dt) {
      var C = Atlas.theme.colors();
      instances.forEach(function (w) {
        if (w.auto) {
          w.acc += dt * (w.def.speed || 4);
          var n = Math.floor(w.acc);
          if (n > 0) {
            w.acc -= n;
            n = Math.min(n, w.def.maxPerFrame || 200);
            for (var i = 0; i < n; i++) if (!w.stepOnce()) break;
          }
        }
        if (!w.dirty) return;
        var any = false;
        Object.keys(w.views).forEach(function (k) {
          var v = w.views[k];
          v.resize();
          if (v.w && v.h) any = true;
        });
        if (!any) return;
        Object.keys(w.views).forEach(function (k) {
          var v = w.views[k];
          v.ctx.clearRect(0, 0, v.w, v.h);
        });
        w.def.draw(w, C);
        w.statusEl.innerHTML = w.def.status(w);
        w.dirty = false;
      });
    }
  };

  /* The language switch: the section's labels are rewritten in place and every
     widget is marked dirty, so its canvases and status line redraw on the next
     frame in the new language.  No widget is reset. */
  Atlas.i18n.onChange(function () {
    instances.forEach(function (w) { w.relabel(); });
    navLinks.forEach(function (p) { p[0].textContent = Atlas.tr(p[1]); });
  });

  /* =======================================================================
     Widget 1 - linear programming
     ===================================================================== */

  var LP_CONS = [
    { a: [-1, 0], b: 0,  name: 'x₁ ≥ 0' },
    { a: [0, -1], b: 0,  name: 'x₂ ≥ 0' },
    { a: [3, 2],  b: 12, name: '3x₁ + 2x₂ ≤ 12' },
    { a: [1, 2],  b: 8,  name: 'x₁ + 2x₂ ≤ 8' },
    { a: [1, 0],  b: 3,  name: 'x₁ ≤ 3' }
  ];

  function objVec(thetaDeg) {
    var t = thetaDeg * Math.PI / 180;
    return [Math.cos(t), Math.sin(t)];
  }

  function drawObjective(v, ctx, C, c, through, label) {
    /* the level line c·x = c·through, plus an arrow along c */
    var d = [-c[1], c[0]];
    var big = 40;
    var p1 = [through[0] - d[0] * big, through[1] - d[1] * big];
    var p2 = [through[0] + d[0] * big, through[1] + d[1] * big];
    var s1 = v.toScreen(p1), s2 = v.toScreen(p2);
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(s1[0], s1[1]); ctx.lineTo(s2[0], s2[1]);
    ctx.stroke();
    ctx.restore();
    var st = v.toScreen(through);
    draw.arrow(ctx, st[0], st[1], st[0] + c[0] * 46, st[1] - c[1] * 46, C.accent, 2, 9);
    if (label) {
      draw.label(ctx, label, st[0] + c[0] * 46 + 6, st[1] - c[1] * 46,
                 { color: C.accent, box: C.panel, boxAlpha: 0.8 });
    }
  }

  Atlas.registerWidget({
    id: 'lp',
    name: Atlas.L('1. Linear programming', '1. Линейное программирование'),
    blurb: Atlas.L('Maximise a linear objective over a polygon. The optimum is always at a vertex, so the simplex method never looks anywhere else: it walks along edges, taking any that improves.',
                   'Максимизируем линейную целевую функцию на многоугольнике. Оптимум всегда достигается в вершине, поэтому симплекс-метод больше нигде и не ищет: он идёт по рёбрам, выбирая любое улучшающее.'),
    panes: [{ id: 'main', height: 400, uniform: true, maxWidth: 620 }],
    controls: [{ id: 'theta', label: Atlas.L('Objective direction θ', 'Направление цели θ'), min: 0, max: 90, step: 1,
                 integer: true, def: 27, unit: '°',
                 hint: Atlas.L('Rotates c = (cos θ, sin θ). The optimal vertex jumps as θ crosses an edge normal.',
                               'Поворачивает c = (cos θ, sin θ). Оптимальная вершина перескакивает, когда θ проходит через нормаль к ребру.') }],
    speed: 1.1,
    onParam: function (w) { w.reset(); },
    reset: function (w) {
      var V = halfspaceVertices(LP_CONS);
      var c = objVec(w.params.theta);
      var at = 0;
      for (var i = 1; i < V.length; i++) if (num.dot(c, V[i]) < num.dot(c, V[at])) at = i;
      w.state = { V: V, c: c, at: at, path: [at],
                  msg: Atlas.L('start at the worst vertex', 'начинаем с худшей вершины'), optimal: false };
    },
    step: function (w) {
      var s = w.state, n = s.V.length;
      var cur = num.dot(s.c, s.V[s.at]);
      var best = -1, bestVal = cur + 1e-10;
      [(s.at + 1) % n, (s.at + n - 1) % n].forEach(function (j) {
        var val = num.dot(s.c, s.V[j]);
        if (val > bestVal) { bestVal = val; best = j; }
      });
      if (best < 0) {
        s.optimal = true;
        s.msg = Atlas.L('neither neighbour improves, so this vertex is optimal',
                        'ни одна соседняя вершина не лучше, значит, эта вершина оптимальна');
        return false;
      }
      s.at = best;
      s.path.push(best);
      s.msg = Atlas.L('moved along an improving edge to V' + (best + 1),
                      'переход по улучшающему ребру в V' + (best + 1));
      return true;
    },
    draw: function (w, C) {
      var v = w.views.main, ctx = v.ctx, s = w.state;
      fitTo(v, s.V, 1.1);
      axes(v, ctx, C);
      drawPolygon(v, ctx, s.V, { fill: C.accent, stroke: C.accent, width: 2 });

      /* the walk so far */
      if (s.path.length > 1) {
        ctx.save();
        ctx.beginPath();
        s.path.forEach(function (idx, i) {
          var p = v.toScreen(s.V[idx]);
          if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
        });
        ctx.strokeStyle = Atlas.palette.orange;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.85;
        ctx.stroke();
        ctx.restore();
      }

      drawObjective(v, ctx, C, s.c, s.V[s.at], 'c');

      s.V.forEach(function (p, i) {
        var sp = v.toScreen(p);
        var here = (i === s.at);
        draw.dot(ctx, sp[0], sp[1], here ? 6 : 4, here ? Atlas.palette.orange : C.fg);
        draw.label(ctx, 'V' + (i + 1) + ' (' + num.fmt(p[0], 3) + ', ' + num.fmt(p[1], 3) + ')  ' +
                        num.fmt(num.dot(s.c, p), 3),
                   sp[0] + 9, sp[1] - 6,
                   { color: here ? Atlas.palette.orange : C.muted, box: C.panel, boxAlpha: 0.8 });
      });
      if (s.optimal) {
        var so = v.toScreen(s.V[s.at]);
        draw.star(ctx, so[0], so[1], 9, Atlas.palette.orange, C.panel);
      }
    },
    status: function (w) {
      var s = w.state;
      var c = s.c, x = s.V[s.at];
      var nc = LP_CONS.length;
      return Atlas.t('maximise <b>', 'максимизируем <b>') + num.fmt(c[0], 3) + '·x₁ + ' + num.fmt(c[1], 3) +
        Atlas.t('·x₂</b> over ' + nc + ' constraints · at <b>V',
                '·x₂</b> при ' + nc + ' ' + Atlas.ruPlural(nc, 'ограничении', 'ограничениях', 'ограничениях') +
                ' · вершина <b>V') +
        (s.at + 1) + ' = (' + num.fmt(x[0], 3) + ', ' + num.fmt(x[1], 3) +
        Atlas.t(')</b> with objective <b>', ')</b>, значение цели <b>') + num.fmt(num.dot(c, x), 4) + '</b> · ' +
        (s.optimal ? '<span class="ok">' + s.msg + '</span>' : s.msg) +
        Atlas.t(' · visited ' + s.path.length + ' of ' + s.V.length + ' vertices',
                ' · посещено вершин: ' + s.path.length + ' из ' + s.V.length);
    }
  });

  /* =======================================================================
     Widget 2 - integrality
     ===================================================================== */

  Atlas.registerWidget({
    id: 'integrality',
    name: Atlas.L('2. Integrality: why rounding is not enough', '2. Целочисленность: почему округления недостаточно'),
    blurb: Atlas.L('The same polygon with its integer points and their convex hull. The linear program answers over the pale region, the integer program over the darker one, and the two answers are usually different points.',
                   'Тот же многоугольник, его целые точки и их выпуклая оболочка. Линейная задача ищет ответ в бледной области, целочисленная — в более тёмной, и обычно ответы оказываются разными точками.'),
    panes: [{ id: 'main', height: 400, uniform: true, maxWidth: 620 }],
    controls: [{ id: 'theta', label: Atlas.L('Objective direction θ', 'Направление цели θ'), min: 0, max: 90, step: 1,
                 integer: true, def: 27, unit: '°',
                 hint: Atlas.L('Step and Auto rotate it, so you can watch the two optima separate and rejoin.',
                               'Кнопки «Шаг» и «Авто» поворачивают его: видно, как два оптимума расходятся и снова совпадают.') }],
    speed: 6,
    onParam: function (w) { w.reset(); },
    reset: function (w) {
      var pts = latticePoints(LP_CONS, 3, 4);
      w.state = {
        V: halfspaceVertices(LP_CONS),
        lattice: pts,
        hull: convexHull(pts)
      };
      w.state.solve = null;
      solveBoth(w);
    },
    step: function (w) {
      var t = (w.params.theta + 2) % 91;
      w.params.theta = t;
      w.sliders.theta.set(t);
      solveBoth(w);
      return true;                       /* rotating for ever is the point */
    },
    draw: function (w, C) {
      var v = w.views.main, ctx = v.ctx, s = w.state;
      fitTo(v, s.V, 1.1);
      axes(v, ctx, C);
      drawPolygon(v, ctx, s.V, { fill: C.accent, stroke: C.accent, fillAlpha: 0.08, width: 1.4, dash: [5, 4] });
      drawPolygon(v, ctx, s.hull, { fill: Atlas.palette.teal, stroke: Atlas.palette.teal, fillAlpha: 0.18, width: 2 });

      s.lattice.forEach(function (p) {
        var sp = v.toScreen(p);
        draw.dot(ctx, sp[0], sp[1], 3, C.fg);
      });

      drawObjective(v, ctx, C, s.c, s.lp.x, 'c');

      var a = v.toScreen(s.lp.x);
      draw.star(ctx, a[0], a[1], 9, C.accent, C.panel);
      draw.label(ctx, Atlas.t('LP  ', 'ЛП  ') + num.fmt(s.lp.val, 4), a[0] + 11, a[1] - 8,
                 { color: C.accent, box: C.panel, boxAlpha: 0.85 });
      var b = v.toScreen(s.ip.x);
      draw.dot(ctx, b[0], b[1], 6.5, Atlas.palette.teal);
      draw.label(ctx, Atlas.t('integer  ', 'целочисл.  ') + num.fmt(s.ip.val, 4), b[0] + 11, b[1] + 14,
                 { color: Atlas.palette.teal, box: C.panel, boxAlpha: 0.85 });
    },
    status: function (w) {
      var s = w.state;
      var frac = s.lp.x.some(function (c) { return Math.abs(c - Math.round(c)) > 1e-9; });
      var rounded = [Math.round(s.lp.x[0]), Math.round(s.lp.x[1])];
      var roundOk = insideAll(LP_CONS, rounded);
      return 'θ = <b>' + Math.round(w.params.theta) + Atlas.t('°</b> · LP optimum <b>(', '°</b> · оптимум ЛП <b>(') +
        num.fmt(s.lp.x[0], 3) + ', ' + num.fmt(s.lp.x[1], 3) + ')</b> = <b>' + num.fmt(s.lp.val, 4) + '</b>' +
        (frac ? Atlas.t(' <span class="warn">(fractional)</span>', ' <span class="warn">(дробный)</span>')
              : Atlas.t(' (already integral)', ' (уже целочисленный)')) +
        Atlas.t(' · integer optimum <b>(', ' · целочисленный оптимум <b>(') + s.ip.x[0] + ', ' + s.ip.x[1] + ')</b> = <b>' + num.fmt(s.ip.val, 4) + '</b>' +
        Atlas.t(' · gap <b>', ' · зазор <b>') + num.fmt(s.lp.val - s.ip.val, 3) +
        Atlas.t('</b> · rounding the LP answer gives (', '</b> · округление ответа ЛП даёт (') +
        rounded[0] + ', ' + rounded[1] + Atlas.t('), which is ', ') — ') +
        (roundOk
          ? (rounded[0] === s.ip.x[0] && rounded[1] === s.ip.x[1]
              ? Atlas.t('optimal here', 'здесь это оптимум')
              : Atlas.t('<span class="warn">feasible but not optimal</span>',
                        '<span class="warn">допустимая, но не оптимальная точка</span>'))
          : Atlas.t('<span class="bad">infeasible</span>', '<span class="bad">недопустимая точка</span>'));
    }
  });

  function solveBoth(w) {
    var s = w.state;
    s.c = objVec(w.params.theta);
    s.lp = solveLP(LP_CONS, s.c);
    var best = s.lattice[0], bv = num.dot(s.c, s.lattice[0]);
    s.lattice.forEach(function (p) {
      var val = num.dot(s.c, p);
      if (val > bv) { bv = val; best = p; }
    });
    s.ip = { x: best.slice(), val: bv };
  }

  /* =======================================================================
     Widget 3 - branch and bound
     ===================================================================== */

  var BIG = 100;

  function nodeLP(bounds, c) {
    var cons = LP_CONS.concat([
      { a: [1, 0], b: bounds.hi[0] }, { a: [-1, 0], b: -bounds.lo[0] },
      { a: [0, 1], b: bounds.hi[1] }, { a: [0, -1], b: -bounds.lo[1] }
    ]);
    var r = solveLP(cons, c);
    if (r) r.cons = cons;
    return r;
  }

  function isIntegral(x) {
    return Math.abs(x[0] - Math.round(x[0])) < 1e-7 && Math.abs(x[1] - Math.round(x[1])) < 1e-7;
  }

  function layoutTree(nodes) {
    var next = 0;
    function place(id) {
      var nd = nodes[id];
      if (!nd.children.length) { nd.tx = next++; return; }
      nd.children.forEach(place);
      nd.tx = 0.5 * (nodes[nd.children[0]].tx + nodes[nd.children[nd.children.length - 1]].tx);
    }
    if (nodes.length) place(0);
    return next;
  }

  Atlas.registerWidget({
    id: 'bnb',
    name: Atlas.L('3. Branch and bound', '3. Метод ветвей и границ'),
    blurb: Atlas.L('The integer problem is solved by repeatedly splitting a fractional variable in two. Each node solves its own linear relaxation; a node whose bound cannot beat the best integer solution found so far is discarded without ever being explored.',
                   'Целочисленную задачу решают, раз за разом разбивая её надвое по дробной переменной. В каждом узле решается своя ЛП-релаксация; узел, граница которого не может превзойти лучшее из найденных целочисленных решений, отбрасывается без исследования.'),
    layout: 'wide-left',
    panes: [
      { id: 'region', height: 400, uniform: true,
        label: Atlas.L('feasible region of the current node', 'допустимая область текущего узла') },
      { id: 'tree', height: 400, label: Atlas.L('search tree', 'дерево поиска') }
    ],
    controls: [{ id: 'theta', label: Atlas.L('Objective direction θ', 'Направление цели θ'), min: 0, max: 90, step: 1,
                 integer: true, def: 27, unit: '°',
                 hint: Atlas.L('Different objectives give very different trees. 27° is the one with all four outcomes.',
                               'Разные целевые функции дают совсем разные деревья. При 27° встречаются все четыре исхода.') }],
    speed: 0.9,
    onParam: function (w) { w.reset(); },
    reset: function (w) {
      var c = objVec(w.params.theta);
      var root = {
        id: 0, parent: -1, depth: 0, children: [], status: 'open',
        bounds: { lo: [0, 0], hi: [BIG, BIG] }, label: 'root'
      };
      w.state = {
        c: c, nodes: [root], stack: [0], incumbent: null, best: -Infinity,
        current: null,
        msg: Atlas.L('ready: the root relaxation has not been solved yet',
                     'готов к запуску: ЛП-релаксация в корне ещё не решена'),
        lattice: latticePoints(LP_CONS, 3, 4), V: halfspaceVertices(LP_CONS), processed: 0
      };
    },
    step: function (w) {
      var s = w.state;
      if (!s.stack.length) {
        s.current = null;
        s.msg = Atlas.L('the queue is empty: every node has been solved, pruned or shown infeasible',
                        'очередь пуста: каждый узел решён, отсечён или оказался недопустимым');
        return false;
      }
      var id = s.stack.pop();
      var nd = s.nodes[id];
      s.current = id;
      s.processed++;

      var lp = nodeLP(nd.bounds, s.c);
      nd.lp = lp;
      if (!lp) {
        nd.status = 'infeasible';
        s.msg = Atlas.L('node ' + id + ' (' + nd.label + ') has no feasible point at all',
                        'в узле ' + id + ' (' + (nd.parent < 0 ? 'корень' : nd.label) + ') нет ни одной допустимой точки');
        return true;
      }
      nd.val = lp.val;
      nd.x = lp.x;
      if (lp.val <= s.best + 1e-9) {
        nd.status = 'pruned';
        s.msg = Atlas.L('node ' + id + ' bound ' + num.fmt(lp.val, 4) +
                        ' cannot beat the incumbent ' + num.fmt(s.best, 4) + ', so it is discarded unexplored',
                        'узел ' + id + ': граница ' + num.fmt(lp.val, 4) +
                        ' не может превзойти рекорд ' + num.fmt(s.best, 4) + ', поэтому узел отброшен без исследования');
        return true;
      }
      if (isIntegral(lp.x)) {
        nd.status = 'incumbent';
        s.best = lp.val;
        s.incumbent = { x: [Math.round(lp.x[0]), Math.round(lp.x[1])], val: lp.val };
        s.msg = Atlas.L('node ' + id + ' is integral: new incumbent (' + s.incumbent.x[0] + ', ' +
                        s.incumbent.x[1] + ') worth ' + num.fmt(lp.val, 4),
                        'решение в узле ' + id + ' целочисленное: новый рекорд (' + s.incumbent.x[0] + ', ' +
                        s.incumbent.x[1] + ') со значением ' + num.fmt(lp.val, 4));
        /* an improved incumbent can retire nodes still waiting */
        s.stack = s.stack.filter(function (j) {
          var pn = s.nodes[j];
          if (pn.parentBound !== undefined && pn.parentBound <= s.best + 1e-9) {
            pn.status = 'pruned';
            return false;
          }
          return true;
        });
        return true;
      }
      /* branch on the more fractional coordinate */
      var f0 = Math.abs(lp.x[0] - Math.round(lp.x[0]));
      var f1 = Math.abs(lp.x[1] - Math.round(lp.x[1]));
      var k = f1 > f0 ? 1 : 0;
      var vname = 'x' + (k === 0 ? '₁' : '₂');
      var fl = Math.floor(lp.x[k]), ce = Math.ceil(lp.x[k]);
      nd.status = 'branched';
      nd.branchOn = k;

      function child(loK, hiK, lab) {
        var b = { lo: nd.bounds.lo.slice(), hi: nd.bounds.hi.slice() };
        b.lo[k] = Math.max(b.lo[k], loK);
        b.hi[k] = Math.min(b.hi[k], hiK);
        var c2 = {
          id: s.nodes.length, parent: id, depth: nd.depth + 1, children: [],
          status: 'open', bounds: b, label: lab, parentBound: lp.val
        };
        s.nodes.push(c2);
        nd.children.push(c2.id);
        return c2.id;
      }
      var a = child(-BIG, fl, vname + ' ≤ ' + fl);
      var b2 = child(ce, BIG, vname + ' ≥ ' + ce);
      /* depth first, the ≥ side explored first */
      s.stack.push(a);
      s.stack.push(b2);
      s.msg = Atlas.L('node ' + id + ' gives ' + vname + ' = ' + num.fmt(lp.x[k], 4) +
                      ', which is fractional: branch into ' + vname + ' ≤ ' + fl + ' and ' + vname + ' ≥ ' + ce,
                      'узел ' + id + ' даёт ' + vname + ' = ' + num.fmt(lp.x[k], 4) +
                      ' — значение дробное: ветвление на ' + vname + ' ≤ ' + fl + ' и ' + vname + ' ≥ ' + ce);
      return true;
    },
    draw: function (w, C) {
      var s = w.state;

      /* ---- left: the region ---- */
      var v = w.views.region, ctx = v.ctx;
      fitTo(v, s.V, 1.1);
      axes(v, ctx, C);
      drawPolygon(v, ctx, s.V, { fill: C.accent, stroke: C.accent, fillAlpha: 0.07, width: 1.2, dash: [5, 4] });
      s.lattice.forEach(function (p) {
        var sp = v.toScreen(p);
        draw.dot(ctx, sp[0], sp[1], 2.6, C.muted);
      });
      var nd = s.current !== null ? s.nodes[s.current] : null;
      if (nd && nd.lp) {
        drawPolygon(v, ctx, nd.lp.vertices, { fill: statusColor(nd.status, C), stroke: statusColor(nd.status, C), fillAlpha: 0.2, width: 2 });
        var sx = v.toScreen(nd.x);
        draw.star(ctx, sx[0], sx[1], 8, statusColor(nd.status, C), C.panel);
        draw.label(ctx, Atlas.t('LP ', 'ЛП ') + num.fmt(nd.val, 4), sx[0] + 10, sx[1] - 7,
                   { color: statusColor(nd.status, C), box: C.panel, boxAlpha: 0.85 });
      }
      if (s.incumbent) {
        var si = v.toScreen(s.incumbent.x);
        draw.dot(ctx, si[0], si[1], 6.5, Atlas.palette.teal);
        draw.label(ctx, Atlas.t('incumbent ', 'рекорд ') + num.fmt(s.incumbent.val, 4), si[0] + 10, si[1] + 14,
                   { color: Atlas.palette.teal, box: C.panel, boxAlpha: 0.85 });
      }

      /* ---- right: the tree ---- */
      var t = w.views.tree, tc = t.ctx;
      var leaves = layoutTree(s.nodes);
      var maxDepth = 0;
      s.nodes.forEach(function (n2) { maxDepth = Math.max(maxDepth, n2.depth); });
      var padX = 46, padY = 34;
      var W = Math.max(1, t.w - 2 * padX), H = Math.max(1, t.h - 2 * padY);
      var stepX = leaves > 1 ? W / (leaves - 1) : 0;
      var stepY = maxDepth > 0 ? H / maxDepth : 0;
      function nodePos(n2) {
        return [padX + (leaves > 1 ? n2.tx * stepX : W / 2), padY + n2.depth * stepY];
      }
      tc.save();
      tc.strokeStyle = C.line;
      tc.lineWidth = 1.4;
      s.nodes.forEach(function (n2) {
        if (n2.parent < 0) return;
        var a = nodePos(s.nodes[n2.parent]), b = nodePos(n2);
        tc.beginPath(); tc.moveTo(a[0], a[1]); tc.lineTo(b[0], b[1]); tc.stroke();
      });
      tc.restore();
      s.nodes.forEach(function (n2) {
        var p = nodePos(n2);
        var col = statusColor(n2.status, C);
        var isCur = (s.current === n2.id);
        tc.save();
        tc.beginPath();
        tc.arc(p[0], p[1], isCur ? 14 : 11, 0, 2 * Math.PI);
        tc.fillStyle = n2.status === 'open' ? C.panel : col;
        tc.globalAlpha = n2.status === 'open' ? 1 : 0.85;
        tc.fill();
        tc.globalAlpha = 1;
        tc.lineWidth = isCur ? 2.6 : 1.4;
        tc.strokeStyle = n2.status === 'open' ? C.lineStrong : col;
        if (n2.status === 'open') tc.setLineDash([3, 3]);
        tc.stroke();
        tc.setLineDash([]);
        tc.restore();
        draw.label(tc, String(n2.id), p[0], p[1] + 4,
                   { color: n2.status === 'open' ? C.muted : C.panel, align: 'center', font: '11px system-ui, sans-serif' });
        if (n2.parent >= 0) {
          draw.label(tc, n2.label, p[0], p[1] - 17,
                     { color: C.muted, align: 'center', font: '10.5px system-ui, sans-serif' });
        }
        if (n2.val !== undefined) {
          draw.label(tc, num.fmt(n2.val, 3), p[0], p[1] + 26,
                     { color: col, align: 'center', font: '10.5px system-ui, sans-serif' });
        }
      });
      /* legend */
      var keys = [['branched', Atlas.t('branched', 'разветвлён')], ['incumbent', Atlas.t('incumbent', 'рекорд')],
                  ['pruned', Atlas.t('pruned by bound', 'отсечён по границе')], ['infeasible', Atlas.t('infeasible', 'недопустим')]];
      /* 108 px holds the English labels; a translated label may need more
         (the text starts 20 px into the box) */
      var legW = 108;
      tc.save();
      if (Atlas.i18n.lang !== 'en') {
        tc.font = '10.5px system-ui, sans-serif';
        keys.forEach(function (k) { legW = Math.max(legW, Math.ceil(tc.measureText(k[1]).width) + 26); });
      }
      /* top right: the pane's own label occupies the top left corner */
      var lx = Math.max(6, t.w - legW - 6);
      tc.fillStyle = C.panel2;
      tc.globalAlpha = 0.92;
      tc.fillRect(lx, 4, legW, 4 + keys.length * 15);
      tc.globalAlpha = 1;
      tc.strokeStyle = C.line;
      tc.strokeRect(lx + 0.5, 4.5, legW, 4 + keys.length * 15);
      tc.restore();
      keys.forEach(function (k, i) {
        var x = lx + 6, y = 16 + i * 15;
        tc.save();
        tc.fillStyle = statusColor(k[0], C);
        tc.fillRect(x, y - 7, 9, 9);
        tc.restore();
        draw.label(tc, k[1], x + 14, y + 1, { color: C.muted, font: '10.5px system-ui, sans-serif' });
      });
    },
    status: function (w) {
      var s = w.state;
      var open = s.stack.map(function (i) { return s.nodes[i]; });
      var ub = -Infinity;
      open.forEach(function (n2) { if (n2.parentBound !== undefined) ub = Math.max(ub, n2.parentBound); });
      if (s.current !== null && s.nodes[s.current].val !== undefined && s.nodes[s.current].status === 'branched') {
        ub = Math.max(ub, s.nodes[s.current].val);
      }
      if (!isFinite(ub)) ub = s.best;
      var lb = s.best;
      var gap = (isFinite(ub) && isFinite(lb) && Math.abs(ub) > 1e-12) ? (ub - lb) / Math.abs(ub) * 100 : 0;
      return Atlas.t('nodes solved <b>', 'решено узлов: <b>') + s.processed +
        Atlas.t('</b> of <b>', '</b> из <b>') + s.nodes.length +
        Atlas.t('</b> created, ' + s.stack.length + ' waiting · lower bound <b>',
                '</b> ' + Atlas.ruPlural(s.nodes.length, 'созданного', 'созданных', 'созданных') +
                ', в очереди ' + s.stack.length + ' · нижняя граница <b>') +
        (isFinite(lb) ? num.fmt(lb, 4) : Atlas.t('none yet', 'пока не найдена')) +
        Atlas.t('</b> · upper bound <b>', '</b> · верхняя граница <b>') +
        (isFinite(ub) ? num.fmt(ub, 4) : '∞') + Atlas.t('</b> · gap <b>', '</b> · зазор <b>') +
        (isFinite(lb) && isFinite(ub) ? num.fmt(Math.max(0, gap), 3) + ' %' : '∞') + '</b><br>' +
        (s.stack.length === 0 && s.processed > 0
          ? '<span class="ok">' + s.msg + '</span>'
          : s.msg);
    }
  });

  function statusColor(st, C) {
    if (st === 'branched') return C.accent;
    if (st === 'incumbent') return Atlas.palette.teal;
    if (st === 'pruned') return Atlas.palette.amber;
    if (st === 'infeasible') return C.muted;
    return C.muted;
  }

  /* =======================================================================
     Widget 4 - dynamic programming: the 0/1 knapsack table
     ===================================================================== */

  function makeItems(n, seed) {
    var r = Atlas.rng(seed);
    var items = [];
    for (var i = 0; i < n; i++) {
      items.push({ w: 1 + r.int(8), v: 2 + r.int(14) });
    }
    return items;
  }

  Atlas.registerWidget({
    id: 'dp',
    name: Atlas.L('4. Dynamic programming: the knapsack table', '4. Динамическое программирование: таблица задачи о рюкзаке'),
    blurb: Atlas.L('Every cell asks one question: with the first i items and capacity c, is it better to skip item i or to take it? Each answer is reused by the cells below it, which is why n·W work replaces 2ⁿ enumeration.',
                   'Каждая клетка задаёт один вопрос: если доступны первые i предметов и вместимость c, выгоднее пропустить предмет i или взять его? Каждый ответ переиспользуют клетки ниже, поэтому вместо перебора 2ⁿ подмножеств хватает работы порядка n·W.'),
    panes: [{ id: 'main', height: 380 }],
    controls: [
      { id: 'n', label: Atlas.L('Items n', 'Число предметов n'), min: 3, max: 12, step: 1, integer: true, def: 8,
        hint: Atlas.L('Rows of the table.', 'Строки таблицы.') },
      { id: 'W', label: Atlas.L('Capacity W', 'Вместимость W'), min: 8, max: 30, step: 1, integer: true, def: 20,
        hint: Atlas.L('Columns. The table is (n+1)·(W+1) cells and the algorithm fills every one.',
                      'Столбцы. В таблице (n+1)·(W+1) клеток, и алгоритм заполняет каждую.') }
    ],
    speed: 40,
    maxPerFrame: 60,
    onParam: function (w) { w.reset(); },
    reset: function (w) {
      var n = Math.round(w.params.n), W = Math.round(w.params.W);
      var items = makeItems(n, 424242);
      var T = [], i, c;
      for (i = 0; i <= n; i++) {
        T.push([]);
        for (c = 0; c <= W; c++) T[i].push(i === 0 ? 0 : null);
      }
      w.state = {
        n: n, W: W, items: items, T: T, i: 1, c: 0,
        phase: 'fill', trace: [], chosen: [], ti: 0, tc: 0,
        msg: Atlas.L('the first row is the empty knapsack, worth nothing at every capacity',
                     'первая строка — пустой рюкзак: его ценность равна нулю при любой вместимости'),
        filled: 0, took: null
      };
    },
    step: function (w) {
      var s = w.state;
      if (s.phase === 'fill') {
        var it = s.items[s.i - 1];
        var skip = s.T[s.i - 1][s.c];
        var take = (s.c >= it.w) ? s.T[s.i - 1][s.c - it.w] + it.v : -1;
        s.T[s.i][s.c] = Math.max(skip, take);
        s.took = (take > skip);
        s.filled++;
        s.msg = Atlas.L('cell (' + s.i + ', ' + s.c + '): skip = ' + skip +
                        (s.c >= it.w ? ', take = ' + s.T[s.i - 1][s.c - it.w] + ' + ' + it.v + ' = ' + take
                                     : ', item ' + s.i + ' does not fit') +
                        ' → ' + s.T[s.i][s.c],
                        'клетка (' + s.i + ', ' + s.c + '): пропустить = ' + skip +
                        (s.c >= it.w ? ', взять = ' + s.T[s.i - 1][s.c - it.w] + ' + ' + it.v + ' = ' + take
                                     : ', предмет ' + s.i + ' не помещается') +
                        ' → ' + s.T[s.i][s.c]);
        s.c++;
        if (s.c > s.W) { s.c = 0; s.i++; }
        if (s.i > s.n) {
          s.phase = 'trace';
          s.ti = s.n; s.tc = s.W;
          s.trace = [[s.n, s.W]];
          s.msg = Atlas.L('table complete: the answer is in the bottom-right cell. Now walk back to see which items produced it.',
                          'таблица заполнена: ответ — в правой нижней клетке. Теперь пройдём назад и посмотрим, какие предметы его дали.');
        }
        return true;
      }
      if (s.phase === 'trace') {
        if (s.ti === 0) {
          s.phase = 'done';
          s.msg = Atlas.L('reconstruction finished', 'восстановление ответа завершено');
          return false;
        }
        var it2 = s.items[s.ti - 1];
        if (s.T[s.ti][s.tc] === s.T[s.ti - 1][s.tc]) {
          s.msg = Atlas.L('item ' + s.ti + ' was not taken: the value came from the row above',
                          'предмет ' + s.ti + ' не взят: значение пришло из строки выше');
          s.ti--;
        } else {
          s.chosen.push(s.ti);
          s.msg = Atlas.L('item ' + s.ti + ' (w = ' + it2.w + ', v = ' + it2.v + ') was taken',
                          'предмет ' + s.ti + ' (w = ' + it2.w + ', v = ' + it2.v + ') взят');
          s.tc -= it2.w;
          s.ti--;
        }
        s.trace.push([s.ti, s.tc]);
        return true;
      }
      return false;
    },
    draw: function (w, C) {
      var v = w.views.main, ctx = v.ctx, s = w.state;
      var padL = 96, padT = 22, padR = 8, padB = 8;
      var cols = s.W + 1, rows = s.n + 1;
      var cw = Math.max(6, (v.w - padL - padR) / cols);
      var ch = Math.max(6, (v.h - padT - padB) / rows);
      var cell = Math.min(cw, ch);
      var x0 = padL, y0 = padT;
      var showText = cell >= 15;

      var maxV = 1;
      s.T.forEach(function (row) { row.forEach(function (x) { if (x !== null && x > maxV) maxV = x; }); });

      ctx.save();
      ctx.font = Math.max(8, Math.min(11, cell * 0.42)) + 'px ui-monospace, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var i = 0; i < rows; i++) {
        for (var c = 0; c < cols; c++) {
          var x = x0 + c * cell, y = y0 + i * cell;
          var val = s.T[i][c];
          if (val === null) {
            ctx.fillStyle = C.panel2;
            ctx.fillRect(x, y, cell - 1, cell - 1);
          } else {
            var col = Atlas.colormap(val / maxV);
            ctx.fillStyle = Atlas.rgb(col, 0.85);
            ctx.fillRect(x, y, cell - 1, cell - 1);
            if (showText) {
              ctx.fillStyle = (val / maxV > 0.55) ? '#10161f' : '#f2f6fa';
              ctx.fillText(String(val), x + cell / 2, y + cell / 2);
            }
          }
        }
      }

      /* the cell being computed and where its two candidates come from */
      if (s.phase === 'fill' && s.i <= s.n) {
        var cx = x0 + s.c * cell, cy = y0 + s.i * cell;
        ctx.strokeStyle = C.fg;
        ctx.lineWidth = 2;
        ctx.strokeRect(cx, cy, cell - 1, cell - 1);
        var it = s.items[s.i - 1];
        ctx.strokeStyle = Atlas.palette.orange;
        ctx.lineWidth = 1.6;
        ctx.strokeRect(x0 + s.c * cell, y0 + (s.i - 1) * cell, cell - 1, cell - 1);
        if (s.c >= it.w) {
          ctx.strokeStyle = Atlas.palette.teal;
          ctx.strokeRect(x0 + (s.c - it.w) * cell, y0 + (s.i - 1) * cell, cell - 1, cell - 1);
        }
      }

      /* the reconstruction path */
      if (s.trace.length) {
        ctx.save();
        ctx.strokeStyle = C.fg;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        s.trace.forEach(function (t, k) {
          var px = x0 + t[1] * cell + cell / 2, py = y0 + t[0] * cell + cell / 2;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.restore();
        s.chosen.forEach(function (idx) {
          ctx.save();
          ctx.strokeStyle = Atlas.palette.teal;
          ctx.lineWidth = 2.4;
          ctx.strokeRect(x0 - padL + 2, y0 + idx * cell, padL - 6, cell - 1);
          ctx.restore();
        });
      }

      /* labels */
      ctx.fillStyle = C.muted;
      ctx.font = '10px ui-monospace, Menlo, monospace';
      ctx.textAlign = 'right';
      for (i = 0; i < rows; i++) {
        var lab = i === 0 ? Atlas.t('no items', 'нет предметов') : ('i' + i + '  w' + s.items[i - 1].w + ' v' + s.items[i - 1].v);
        ctx.fillStyle = (s.chosen.indexOf(i) >= 0) ? Atlas.palette.teal : C.muted;
        ctx.fillText(lab, x0 - 6, y0 + i * cell + cell / 2 + 3);
      }
      ctx.fillStyle = C.muted;
      ctx.textAlign = 'center';
      var stepC = Math.max(1, Math.round(5 / (cell / 14)));
      for (c = 0; c < cols; c += stepC) ctx.fillText(String(c), x0 + c * cell + cell / 2, y0 - 8);
      /* in the gutter above the row labels, clear of the column numbers */
      ctx.textAlign = 'right';
      ctx.fillText(Atlas.t('capacity c', 'вместимость c'), x0 - 6, y0 - 8);
      ctx.restore();
    },
    status: function (w) {
      var s = w.state;
      var total = (s.n) * (s.W + 1);
      var best = s.T[s.n][s.W];
      var chosen = s.chosen.slice().sort(function (a, b) { return a - b; });
      var wt = 0, vv = 0;
      chosen.forEach(function (i) { wt += s.items[i - 1].w; vv += s.items[i - 1].v; });
      var subsets = Math.pow(2, s.n);
      return Atlas.t('filled <b>', 'заполнено клеток: <b>') + s.filled + Atlas.t('</b> of <b>', '</b> из <b>') + total +
        Atlas.t('</b> cells (brute force would test 2<sup>', '</b> (полный перебор проверил бы 2<sup>') +
        s.n + '</sup> = <b>' + subsets +
        Atlas.t('</b> subsets) · best value <b>',
                '</b> ' + Atlas.ruPlural(subsets, 'подмножество', 'подмножества', 'подмножеств') + ') · лучшая ценность <b>') +
        (best === null ? '—' : best) + '</b><br>' + s.msg +
        (s.phase === 'done'
          ? Atlas.t(' · <span class="ok">items {' + chosen.join(', ') + '} with weight ' + wt + ' ≤ ' + s.W +
                    ' and value ' + vv + '</span>',
                    ' · <span class="ok">предметы {' + chosen.join(', ') + '} с весом ' + wt + ' ≤ ' + s.W +
                    ' и ценностью ' + vv + '</span>')
          : '');
    }
  });

  /* =======================================================================
     Widget 5 - network flow: Edmonds-Karp
     ===================================================================== */

  var FLOW_NODES = [
    { id: 0, name: 's', p: [0.0, 1.0] },
    { id: 1, name: 'a', p: [1.0, 1.85] },
    { id: 2, name: 'b', p: [1.0, 0.15] },
    { id: 3, name: 'c', p: [2.1, 1.85] },
    { id: 4, name: 'd', p: [2.1, 0.15] },
    { id: 5, name: 'e', p: [2.7, 1.0] },
    { id: 6, name: 't', p: [3.7, 1.0] }
  ];
  var FLOW_EDGES = [
    [0, 1, 10], [0, 2, 8],
    [1, 2, 3], [1, 3, 6],
    [2, 4, 9],
    [3, 5, 5], [3, 6, 4],
    [4, 3, 3], [4, 6, 7],
    [5, 6, 6]
  ];

  function buildFlow() {
    var edges = [], adj = [];
    FLOW_NODES.forEach(function () { adj.push([]); });
    FLOW_EDGES.forEach(function (e) {
      edges.push({ u: e[0], v: e[1], cap: e[2], flow: 0, orig: true });
      adj[e[0]].push(edges.length - 1);
      edges.push({ u: e[1], v: e[0], cap: 0, flow: 0, orig: false });
      adj[e[1]].push(edges.length - 1);
    });
    return { edges: edges, adj: adj };
  }

  function bfsPath(g, s, t) {
    var prev = [], seen = [], q = [s], i;
    for (i = 0; i < FLOW_NODES.length; i++) { prev.push(-1); seen.push(false); }
    seen[s] = true;
    while (q.length) {
      var u = q.shift();
      for (i = 0; i < g.adj[u].length; i++) {
        var ei = g.adj[u][i], e = g.edges[ei];
        if (!seen[e.v] && e.cap - e.flow > 1e-9) {
          seen[e.v] = true;
          prev[e.v] = ei;
          if (e.v === t) return { prev: prev, seen: seen };
          q.push(e.v);
        }
      }
    }
    return { prev: prev, seen: seen, none: true };
  }

  Atlas.registerWidget({
    id: 'flow',
    name: Atlas.L('5. Network flow: Edmonds-Karp', '5. Потоки в сетях: алгоритм Эдмондса–Карпа'),
    blurb: Atlas.L('Push flow along the shortest path that still has room, again and again. When no such path is left, the flow is maximal — and the edges you can no longer cross form a cut whose capacity equals it exactly.',
                   'Раз за разом проталкиваем поток по кратчайшему пути, на котором ещё осталась свободная пропускная способность. Когда таких путей не остаётся, поток максимален — а рёбра, по которым больше не пройти, образуют разрез, и его пропускная способность в точности равна потоку.'),
    panes: [{ id: 'main', height: 380, uniform: true }],
    speed: 0.8,
    reset: function (w) {
      w.state = {
        g: buildFlow(), value: 0, path: null, bottleneck: 0,
        cut: null, reach: null, steps: 0,
        msg: Atlas.L('no flow yet: every edge is empty', 'потока пока нет: все рёбра пусты')
      };
    },
    step: function (w) {
      var s = w.state, g = s.g;
      var r = bfsPath(g, 0, 6);
      if (r.none) {
        s.path = null;
        s.reach = r.seen;
        s.cut = [];
        var capacity = 0;
        g.edges.forEach(function (e, i) {
          if (e.orig && r.seen[e.u] && !r.seen[e.v]) { s.cut.push(i); capacity += e.cap; }
        });
        s.cutCapacity = capacity;
        s.msg = Atlas.L('no augmenting path remains, so the flow is maximal',
                        'увеличивающих путей не осталось, значит, поток максимален');
        return false;
      }
      /* rebuild the path and find its bottleneck */
      var path = [], node = 6, f = Infinity;
      while (node !== 0) {
        var ei = r.prev[node];
        path.push(ei);
        f = Math.min(f, g.edges[ei].cap - g.edges[ei].flow);
        node = g.edges[ei].u;
      }
      path.reverse();
      path.forEach(function (ei) {
        g.edges[ei].flow += f;
        g.edges[ei ^ 1].flow -= f;
      });
      s.path = path;
      s.bottleneck = f;
      s.value += f;
      s.steps++;
      var names = [FLOW_NODES[0].name];
      path.forEach(function (ei) { names.push(FLOW_NODES[g.edges[ei].v].name); });
      s.msg = Atlas.L('augmented along ' + names.join(' → ') + ' by the bottleneck ' + f,
                      'поток вдоль ' + names.join(' → ') + ' увеличен на ' + f + ' — столько пропускает узкое место');
      return true;
    },
    draw: function (w, C) {
      var v = w.views.main, ctx = v.ctx, s = w.state, g = s.g;
      fitTo(v, FLOW_NODES.map(function (n) { return n.p; }), 0.42);
      var R = 17;

      if (s.reach) {
        FLOW_NODES.forEach(function (n) {
          if (!s.reach[n.id]) return;
          var p = v.toScreen(n.p);
          ctx.save();
          ctx.beginPath();
          ctx.arc(p[0], p[1], R + 9, 0, 2 * Math.PI);
          ctx.fillStyle = Atlas.palette.teal;
          ctx.globalAlpha = 0.14;
          ctx.fill();
          ctx.restore();
        });
      }

      var onPath = {};
      if (s.path) s.path.forEach(function (ei) { onPath[ei] = true; });
      var inCut = {};
      if (s.cut) s.cut.forEach(function (ei) { inCut[ei] = true; });

      g.edges.forEach(function (e, i) {
        if (!e.orig) return;
        var a = v.toScreen(FLOW_NODES[e.u].p), b = v.toScreen(FLOW_NODES[e.v].p);
        var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
        var ux = dx / L, uy = dy / L;
        var p1 = [a[0] + ux * R, a[1] + uy * R];
        var p2 = [b[0] - ux * (R + 3), b[1] - uy * (R + 3)];
        var frac = e.cap > 0 ? e.flow / e.cap : 0;
        var col = inCut[i] ? Atlas.palette.amber
                : onPath[i] ? Atlas.palette.orange
                : (frac > 0.999 ? Atlas.palette.wine : C.muted);
        draw.arrow(ctx, p1[0], p1[1], p2[0], p2[1], col, 1.2 + 5 * frac, 10);
        var mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
        draw.label(ctx, e.flow + '/' + e.cap, mx + 6 * uy, my - 6 * ux - 2,
                   { color: col, align: 'center', box: C.panel, boxAlpha: 0.85 });
      });

      FLOW_NODES.forEach(function (n) {
        var p = v.toScreen(n.p);
        var isEnd = (n.id === 0 || n.id === 6);
        draw.ring(ctx, p[0], p[1], R, isEnd ? C.accent : C.fg, isEnd ? 2.6 : 1.6, C.panel);
        draw.label(ctx, n.name, p[0], p[1] + 5,
                   { color: C.fg, align: 'center', font: '13px system-ui, sans-serif' });
      });
    },
    status: function (w) {
      var s = w.state;
      return Atlas.t('augmenting paths used <b>', 'использовано увеличивающих путей: <b>') + s.steps +
        Atlas.t('</b> · flow value <b>', '</b> · величина потока <b>') + s.value + '</b>' +
        (s.cut
          ? Atlas.t(' · <span class="ok">max flow ' + s.value + ' = min cut capacity ' + s.cutCapacity +
                    ', cut across ' + s.cut.length + ' saturated edges (amber), shaded side reachable from s</span>',
                    ' · <span class="ok">максимальный поток ' + s.value + ' = пропускная способность минимального разреза ' +
                    s.cutCapacity + ', разрез проходит по ' + s.cut.length + ' ' +
                    Atlas.ruPlural(s.cut.length, 'насыщенному ребру (янтарному)', 'насыщенным рёбрам (янтарным)',
                                   'насыщенным рёбрам (янтарным)') +
                    ', затенённая сторона достижима из s</span>')
          : '') +
        '<br>' + s.msg;
    }
  });

  /* =======================================================================
     Widget 6 - TSP and local search
     ===================================================================== */

  function tourCost(cities, tour) {
    var c = 0;
    for (var i = 0; i < tour.length; i++) {
      var a = cities[tour[i]], b = cities[tour[(i + 1) % tour.length]];
      c += Math.hypot(a[0] - b[0], a[1] - b[1]);
    }
    return c;
  }

  function makeCities(n, seed) {
    var r = Atlas.rng(seed), out = [];
    for (var i = 0; i < n; i++) out.push([r.next(), r.next()]);
    return out;
  }

  Atlas.registerWidget({
    id: 'tsp',
    name: Atlas.L('6. Travelling salesman and local search', '6. Задача коммивояжёра и локальный поиск'),
    blurb: Atlas.L('Forty cities, so 39!/2 tours exist and none of them will ever be enumerated. A greedy construction gets close quickly, 2-opt untangles its mistakes, and simulated annealing accepts the occasional worse tour to escape a local optimum.',
                   'Сорок городов — значит, маршрутов 39!/2, и перебирать их никто не будет. Жадное построение быстро даёт неплохое приближение, 2-opt распутывает его ошибки, а имитация отжига время от времени принимает маршрут похуже, чтобы выбраться из локального оптимума.'),
    layout: 'wide-left',
    panes: [
      { id: 'main', height: 380, uniform: true, label: Atlas.L('tour', 'маршрут') },
      { id: 'chart', height: 380, label: Atlas.L('cost, and temperature while annealing', 'стоимость, а при отжиге — и температура') }
    ],
    modes: [
      { id: 'nn', name: Atlas.L('Nearest neighbour', 'Ближайший сосед') },
      { id: '2opt', name: Atlas.L('2-opt', '2-opt') },
      { id: 'anneal', name: Atlas.L('Simulated annealing', 'Имитация отжига') }
    ],
    actions: [{ id: 'newcities', name: Atlas.L('New cities', 'Новые города'), run: function (w) {
      w.citySeed = (w.citySeed * 1103515245 + 12345) >>> 0;
      w.cities = makeCities(40, w.citySeed);
      w.tour = null;
      w.reset();
    } }],
    controls: [{ id: 't0', label: Atlas.L('Annealing start temperature', 'Начальная температура отжига'),
                 min: 0.005, max: 0.6, log: true, def: 0.09,
                 digits: 4,
                 hint: Atlas.L('Only used by simulated annealing. Higher means more uphill moves are accepted early.',
                               'Используется только в имитации отжига. Чем выше, тем больше ухудшающих ходов принимается в начале.') }],
    speed: 120,
    maxPerFrame: 400,
    onParam: function (w) { if (w.mode === 'anneal') w.reset(); },
    init: function (w) {
      w.citySeed = 31337;      /* a representative instance: 2-opt finds two dozen crossings */
      w.cities = makeCities(40, w.citySeed);
      w.tour = null;
    },
    reset: function (w) {
      var n = w.cities.length, i;
      var st = { history: [], temps: [], iter: 0, msg: '', accepted: 0, proposed: 0 };
      if (w.mode === 'nn') {
        st.tour = [0];
        st.used = [];
        for (i = 0; i < n; i++) st.used.push(false);
        st.used[0] = true;
        st.msg = Atlas.L('start at city 0 and repeatedly jump to the nearest city not yet visited',
                         'начинаем с города 0 и каждый раз переходим в ближайший ещё не посещённый город');
      } else {
        if (!w.tour) {
          var t = [];
          for (i = 0; i < n; i++) t.push(i);
          var r = Atlas.rng(7);
          for (i = n - 1; i > 0; i--) {
            var j = r.int(i + 1), tmp = t[i]; t[i] = t[j]; t[j] = tmp;
          }
          w.tour = t;
        }
        st.tour = w.tour.slice();
        st.i = 1; st.j = 2;
        st.sweeps = 0; st.scanned = 0; st.moves = 0;
        st.rng = Atlas.rng(99);
        st.T = w.params.t0;
        st.best = st.tour.slice();
        st.bestCost = tourCost(w.cities, st.tour);
        st.msg = w.mode === '2opt'
          ? Atlas.L('scan every pair of edges for a crossing that can be undone',
                    'перебираем все пары рёбер в поисках пересечения, которое можно распутать')
          : Atlas.L('propose a random 2-opt move and accept it with probability exp(−Δ/T)',
                    'предлагаем случайный ход 2-opt и принимаем его с вероятностью exp(−Δ/T)');
      }
      st.cost = tourCost(w.cities, st.tour);
      st.history.push(st.cost);
      st.temps.push(w.mode === 'anneal' ? st.T : 0);
      w.state = st;
    },
    step: function (w) {
      var s = w.state, cities = w.cities, n = cities.length;

      if (w.mode === 'nn') {
        if (s.tour.length >= n) {
          w.tour = s.tour.slice();
          s.msg = Atlas.L('tour complete', 'маршрут построен');
          return false;
        }
        var last = s.tour[s.tour.length - 1];
        var bestJ = -1, bestD = Infinity;
        for (var j = 0; j < n; j++) {
          if (s.used[j]) continue;
          var d = Math.hypot(cities[last][0] - cities[j][0], cities[last][1] - cities[j][1]);
          if (d < bestD) { bestD = d; bestJ = j; }
        }
        s.used[bestJ] = true;
        s.tour.push(bestJ);
        s.cost = tourCost(cities, s.tour);
        s.history.push(s.cost);
        s.temps.push(0);
        s.iter++;
        s.msg = Atlas.L('city ' + bestJ + ' added, ' + (n - s.tour.length) + ' left',
                        'добавлен город ' + bestJ + ', осталось посетить: ' + (n - s.tour.length));
        w.tour = s.tour.slice();
        return true;
      }

      if (w.mode === '2opt') {
        /* Continue the scan from wherever it stopped and apply the first
           improving pair.  The tour is only declared 2-opt optimal once a
           WHOLE pass over every pair has gone by without an improvement,
           counted from the last move rather than from the last wrap. */
        var pairs = (n - 1) * (n - 2) / 2;
        var checked = 0;
        while (checked < 800) {
          checked++;
          if (s.j >= n) { s.i++; s.j = s.i + 1; }
          if (s.i >= n - 1) { s.i = 1; s.j = 2; s.sweeps++; }
          var a = s.tour[s.i - 1], b = s.tour[s.i];
          var c = s.tour[s.j], d2 = s.tour[(s.j + 1) % n];
          s.scanned++;
          if (a === d2) { s.j++; continue; }
          var before = dist(cities, a, b) + dist(cities, c, d2);
          var after = dist(cities, a, c) + dist(cities, b, d2);
          if (after < before - 1e-12) {
            var seg = s.tour.slice(s.i, s.j + 1);
            seg.reverse();
            for (var k = 0; k < seg.length; k++) s.tour[s.i + k] = seg[k];
            s.cost = tourCost(cities, s.tour);
            s.history.push(s.cost);
            s.temps.push(0);
            s.iter++;
            s.moves++;
            s.scanned = 0;
            s.bestCost = s.cost;          /* 2-opt only ever goes downhill */
            s.best = s.tour.slice();
            s.msg = Atlas.L('reversed the segment between positions ' + s.i + ' and ' + s.j +
                            ', saving ' + num.fmt(before - after, 4),
                            'развёрнут участок между позициями ' + s.i + ' и ' + s.j +
                            ', выигрыш ' + num.fmt(before - after, 4));
            s.j++;
            w.tour = s.tour.slice();
            return true;
          }
          s.j++;
          if (s.scanned >= pairs) {
            w.tour = s.tour.slice();
            s.msg = Atlas.L('a full pass over all ' + pairs + ' pairs found nothing to improve: ' +
                            'this tour is 2-opt optimal after ' + s.moves + ' reversals',
                            'полный проход по всем парам рёбер (' + pairs + ') не дал улучшений: после ' + s.moves + ' ' +
                            Atlas.ruPlural(s.moves, 'разворота', 'разворотов', 'разворотов') +
                            ' маршрут оптимален относительно 2-opt');
            return false;
          }
        }
        s.iter++;
        return true;
      }

      /* annealing */
      var r2 = s.rng;
      var i2 = 1 + r2.int(n - 2);
      var j2 = i2 + 1 + r2.int(n - i2 - 1);
      var A = s.tour[i2 - 1], B = s.tour[i2], Cc = s.tour[j2], D = s.tour[(j2 + 1) % n];
      if (A === D) { s.iter++; return true; }
      var delta = (dist(cities, A, Cc) + dist(cities, B, D)) - (dist(cities, A, B) + dist(cities, Cc, D));
      s.proposed++;
      if (delta < 0 || r2.next() < Math.exp(-delta / Math.max(1e-9, s.T))) {
        var seg2 = s.tour.slice(i2, j2 + 1);
        seg2.reverse();
        for (var k2 = 0; k2 < seg2.length; k2++) s.tour[i2 + k2] = seg2[k2];
        s.cost += delta;
        s.accepted++;
        if (s.cost < s.bestCost - 1e-12) { s.bestCost = s.cost; s.best = s.tour.slice(); }
      }
      s.T *= 0.9995;
      s.iter++;
      if (s.iter % 5 === 0) { s.history.push(s.cost); s.temps.push(s.T); }
      var pct = num.fmt(100 * s.accepted / Math.max(1, s.proposed), 3);
      s.msg = Atlas.L('temperature ' + num.fmt(s.T, 5) + ', accepted ' + pct + ' % of proposals',
                      'температура ' + num.fmt(s.T, 5) + ', принято ' + pct + ' % предложенных ходов');
      w.tour = s.best.slice();
      if (s.T < 1e-4) {
        s.tour = s.best.slice();
        s.cost = s.bestCost;
        s.msg = Atlas.L('frozen: returning the best tour seen', 'система остыла: возвращаем лучший из найденных маршрутов');
        return false;
      }
      return true;
    },
    draw: function (w, C) {
      var v = w.views.main, ctx = v.ctx, s = w.state, cities = w.cities;
      fitTo(v, cities, 0.06);
      var closed = (w.mode !== 'nn') || s.tour.length === cities.length;
      if (s.tour.length > 1) {
        ctx.save();
        ctx.beginPath();
        s.tour.forEach(function (idx, k) {
          var p = v.toScreen(cities[idx]);
          if (k === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
        });
        if (closed) ctx.closePath();
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 1.7;
        ctx.stroke();
        ctx.restore();
      }
      cities.forEach(function (p, i) {
        var sp = v.toScreen(p);
        draw.dot(ctx, sp[0], sp[1], 3, i === s.tour[0] ? Atlas.palette.orange : C.fg);
      });

      /* ---- the chart ---- */
      var t = w.views.chart, tc = t.ctx;
      var m = { l: 52, r: 44, t: 30, b: 24 };          /* t leaves room for the pane label */
      var W = t.w - m.l - m.r, H = t.h - m.t - m.b;
      if (W < 20 || H < 20) return;
      var hist = s.history;
      var lo = Infinity, hi = -Infinity;
      hist.forEach(function (c) { lo = Math.min(lo, c); hi = Math.max(hi, c); });
      if (!(hi > lo)) { hi = lo + 1; }
      tc.save();
      tc.strokeStyle = C.line;
      tc.strokeRect(m.l + 0.5, m.t + 0.5, W, H);
      tc.fillStyle = C.muted;
      tc.font = '10px system-ui, sans-serif';
      tc.textAlign = 'right';
      tc.fillText(num.fmt(hi, 4), m.l - 6, m.t + 8);
      tc.fillText(num.fmt(lo, 4), m.l - 6, m.t + H);
      tc.textAlign = 'center';
      tc.fillText(Atlas.t('iteration', 'итерация'), m.l + W / 2, m.t + H + 16);
      tc.save();
      tc.translate(13, m.t + H / 2);
      tc.rotate(-Math.PI / 2);
      tc.fillText(Atlas.t('tour length', 'длина маршрута'), 0, 0);
      tc.restore();

      tc.beginPath();
      hist.forEach(function (c, k) {
        var x = m.l + (hist.length > 1 ? k / (hist.length - 1) : 0) * W;
        var y = m.t + (hi - c) / (hi - lo) * H;
        if (k === 0) tc.moveTo(x, y); else tc.lineTo(x, y);
      });
      tc.strokeStyle = C.accent;
      tc.lineWidth = 1.8;
      tc.stroke();

      if (w.mode === 'anneal') {
        var tmax = w.params.t0;
        tc.beginPath();
        s.temps.forEach(function (T, k) {
          var x = m.l + (s.temps.length > 1 ? k / (s.temps.length - 1) : 0) * W;
          var y = m.t + (1 - num.clamp(T / tmax, 0, 1)) * H;
          if (k === 0) tc.moveTo(x, y); else tc.lineTo(x, y);
        });
        tc.setLineDash([5, 4]);
        tc.strokeStyle = Atlas.palette.orange;
        tc.lineWidth = 1.5;
        tc.stroke();
        tc.setLineDash([]);
        tc.fillStyle = Atlas.palette.orange;
        tc.textAlign = 'left';
        var tLab = Atlas.t('temperature', 'температура');
        if (m.l + W + 4 + tc.measureText(tLab).width <= t.w - 2) {
          tc.fillText(tLab, m.l + W + 4, m.t + 10);
        } else {
          /* too wide for the 44 px margin: set it upright along the right
             edge, like a second axis title, ending level with the curve's start */
          tc.save();
          tc.translate(m.l + W + 16, m.t);
          tc.rotate(-Math.PI / 2);
          tc.textAlign = 'right';
          tc.fillText(tLab, 0, 0);
          tc.restore();
        }
      }
      tc.restore();
    },
    status: function (w) {
      var s = w.state;
      var modeName = w.mode === 'nn' ? Atlas.t('nearest neighbour', 'ближайший сосед')
                   : w.mode === '2opt' ? '2-opt' : Atlas.t('simulated annealing', 'имитация отжига');
      return modeName + Atlas.t(' · iteration <b>', ' · итерация <b>') + s.iter +
        Atlas.t('</b> · tour length <b>', '</b> · длина маршрута <b>') +
        num.fmt(s.cost, 5) + '</b>' +
        /* only annealing can be worse than its own best, so only it needs the field */
        (w.mode === 'anneal' ? Atlas.t(' · best seen <b>', ' · лучшая из найденных <b>') + num.fmt(s.bestCost, 5) + '</b>' : '') +
        Atlas.t(' · 40 cities, so 39!/2 ≈ <b>10<sup>45</sup></b> tours exist<br>',
                ' · 40 городов, значит, маршрутов 39!/2 ≈ <b>10<sup>45</sup></b><br>') + s.msg;
    }
  });

  function dist(cities, a, b) {
    return Math.hypot(cities[a][0] - cities[b][0], cities[a][1] - cities[b][1]);
  }

  /* =======================================================================
     Widget 7 - constraint propagation on a Sudoku
     ===================================================================== */

  var PUZZLE =
    '53__7____' +
    '6__195___' +
    '_98____6_' +
    '8___6___3' +
    '4__8_3__1' +
    '7___2___6' +
    '_6____28_' +
    '___419__5' +
    '____8__79';

  function peersOf(idx) {
    var r = Math.floor(idx / 9), c = idx % 9, out = [], i, j;
    for (i = 0; i < 9; i++) {
      if (i !== c) out.push(r * 9 + i);
      if (i !== r) out.push(i * 9 + c);
    }
    var br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (i = br; i < br + 3; i++) {
      for (j = bc; j < bc + 3; j++) {
        if (i !== r || j !== c) out.push(i * 9 + j);
      }
    }
    return out.filter(function (x, k, a) { return a.indexOf(x) === k; });
  }

  var PEERS = [];
  for (var pi = 0; pi < 81; pi++) PEERS.push(peersOf(pi));

  /* name: English; nameIn: Russian in the prepositional case, for «в строке 3» */
  var UNITS = [];
  (function () {
    var i, j, u;
    for (i = 0; i < 9; i++) {
      u = []; for (j = 0; j < 9; j++) u.push(i * 9 + j);
      UNITS.push({ name: 'row ' + (i + 1), nameIn: 'строке ' + (i + 1), cells: u });
      u = []; for (j = 0; j < 9; j++) u.push(j * 9 + i);
      UNITS.push({ name: 'column ' + (i + 1), nameIn: 'столбце ' + (i + 1), cells: u });
    }
    for (i = 0; i < 9; i += 3) {
      for (j = 0; j < 9; j += 3) {
        u = [];
        for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) u.push((i + a) * 9 + j + b);
        UNITS.push({ name: 'box (' + (i / 3 + 1) + ',' + (j / 3 + 1) + ')',
                     nameIn: 'блоке (' + (i / 3 + 1) + ',' + (j / 3 + 1) + ')', cells: u });
      }
    }
  })();

  Atlas.registerWidget({
    id: 'sudoku',
    name: Atlas.L('7. Constraint propagation', '7. Распространение ограничений'),
    blurb: Atlas.L('A Sudoku is a constraint satisfaction problem: 81 variables, each with a domain of nine digits, and 27 all-different constraints. Propagation never guesses — it only removes values that cannot possibly be right, and watches the domains collapse.',
                   'Судоку — задача удовлетворения ограничений: 81 переменная, у каждой домен из девяти цифр, и 27 ограничений all-different («все различны»). Распространение никогда не угадывает — оно лишь удаляет значения, которые заведомо не могут быть верными, и домены на глазах схлопываются.'),
    panes: [{ id: 'main', height: 430, maxWidth: 520 }],
    speed: 2.5,
    reset: function (w) {
      var cand = [], given = [], val = [], i;
      for (i = 0; i < 81; i++) {
        var ch = PUZZLE.charAt(i);
        if (ch >= '1' && ch <= '9') {
          val.push(parseInt(ch, 10));
          given.push(true);
          cand.push(0);
        } else {
          val.push(0);
          given.push(false);
          cand.push(0x1FF);                    /* bits 0..8 mean digits 1..9 */
        }
      }
      var st = { cand: cand, val: val, given: given, last: -1, lastPeers: [],
                 assigned: 0, removed: 0,
                 msg: Atlas.L('domains start at nine digits everywhere', 'вначале в каждом домене все девять цифр'),
                 stuck: false };
      /* initial propagation from the givens */
      for (i = 0; i < 81; i++) {
        if (val[i]) { st.assigned++; st.removed += eliminate(st, i, val[i]); }
      }
      st.msg = Atlas.L('the ' + st.assigned + ' given digits already removed ' + st.removed + ' candidates from their peers',
                       st.assigned + ' ' + Atlas.ruPlural(st.assigned, 'заданная цифра уже вычеркнула',
                                                          'заданные цифры уже вычеркнули', 'заданных цифр уже вычеркнули') +
                       ' из доменов соседних клеток ' + st.removed + ' ' +
                       Atlas.ruPlural(st.removed, 'кандидата', 'кандидата', 'кандидатов'));
      w.state = st;
    },
    step: function (w) {
      var s = w.state, i, d;
      /* 1. naked single: a cell with one candidate left */
      for (i = 0; i < 81; i++) {
        if (s.val[i]) continue;
        var bits = s.cand[i];
        if (bits === 0) {
          s.stuck = true;
          s.msg = Atlas.L('cell r' + (Math.floor(i / 9) + 1) + 'c' + (i % 9 + 1) +
                          ' has no candidate left: this puzzle has no solution',
                          'у клетки r' + (Math.floor(i / 9) + 1) + 'c' + (i % 9 + 1) +
                          ' не осталось кандидатов: у головоломки нет решения');
          return false;
        }
        if ((bits & (bits - 1)) === 0) {
          d = Math.round(Math.log(bits) / Math.LN2) + 1;
          assign(s, i, d);
          s.msg = Atlas.L('naked single: r' + (Math.floor(i / 9) + 1) + 'c' + (i % 9 + 1) +
                          ' had only ' + d + ' left',
                          'голый одиночка: в r' + (Math.floor(i / 9) + 1) + 'c' + (i % 9 + 1) +
                          ' остался только кандидат ' + d);
          return true;
        }
      }
      /* 2. hidden single: a digit with one possible cell in some unit */
      for (var u = 0; u < UNITS.length; u++) {
        var unit = UNITS[u];
        for (d = 1; d <= 9; d++) {
          var bit = 1 << (d - 1), where = -1, count = 0, taken = false;
          for (i = 0; i < 9; i++) {
            var idx = unit.cells[i];
            if (s.val[idx] === d) { taken = true; break; }
            if (!s.val[idx] && (s.cand[idx] & bit)) { count++; where = idx; }
          }
          if (taken || count !== 1) continue;
          assign(s, where, d);
          s.msg = Atlas.L('hidden single: in ' + unit.name + ' the digit ' + d +
                          ' fits only in r' + (Math.floor(where / 9) + 1) + 'c' + (where % 9 + 1),
                          'скрытый одиночка: в ' + unit.nameIn + ' цифра ' + d +
                          ' возможна только в r' + (Math.floor(where / 9) + 1) + 'c' + (where % 9 + 1));
          return true;
        }
      }
      if (s.assigned === 81) {
        s.msg = Atlas.L('solved by propagation alone, with no search at all',
                        'решено одним лишь распространением, без всякого перебора');
        return false;
      }
      s.stuck = true;
      s.msg = Atlas.L('propagation is stuck at ' + s.assigned + ' of 81: no cell and no unit is forced any more. ' +
                      'A solver would now branch on a cell and try each candidate.',
                      'распространение застряло (заполнено клеток: ' + s.assigned + ' из 81): ни одна клетка, строка, столбец ' +
                      'или блок больше не даёт вынужденного хода. Теперь решатель начал бы ветвление: выбрал бы клетку ' +
                      'и перебрал её кандидатов.');
      return false;
    },
    draw: function (w, C) {
      var v = w.views.main, ctx = v.ctx, s = w.state;
      var size = Math.min(v.w, v.h) - 12;
      var x0 = (v.w - size) / 2, y0 = (v.h - size) / 2;
      var cell = size / 9;

      ctx.save();
      /* highlight the peers of the last assignment */
      s.lastPeers.forEach(function (p) {
        var r = Math.floor(p / 9), c = p % 9;
        ctx.fillStyle = C.accent;
        ctx.globalAlpha = 0.09;
        ctx.fillRect(x0 + c * cell, y0 + r * cell, cell, cell);
      });
      ctx.globalAlpha = 1;
      if (s.last >= 0) {
        var lr = Math.floor(s.last / 9), lc = s.last % 9;
        ctx.fillStyle = Atlas.palette.teal;
        ctx.globalAlpha = 0.22;
        ctx.fillRect(x0 + lc * cell, y0 + lr * cell, cell, cell);
        ctx.globalAlpha = 1;
      }

      for (var i = 0; i < 81; i++) {
        var r2 = Math.floor(i / 9), c2 = i % 9;
        var cx = x0 + c2 * cell, cy = y0 + r2 * cell;
        if (s.val[i]) {
          ctx.fillStyle = s.given[i] ? C.fg : Atlas.palette.teal;
          ctx.font = (s.given[i] ? '600 ' : '') + Math.round(cell * 0.56) + 'px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(s.val[i]), cx + cell / 2, cy + cell / 2 + 1);
        } else {
          ctx.font = Math.round(cell * 0.21) + 'px ui-monospace, Menlo, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = C.muted;
          for (var d = 1; d <= 9; d++) {
            if (!(s.cand[i] & (1 << (d - 1)))) continue;
            var dr = Math.floor((d - 1) / 3), dc = (d - 1) % 3;
            ctx.fillText(String(d), cx + cell * (0.2 + 0.3 * dc), cy + cell * (0.22 + 0.29 * dr));
          }
        }
      }

      ctx.strokeStyle = C.line;
      for (var k = 0; k <= 9; k++) {
        var thick = (k % 3 === 0);
        ctx.lineWidth = thick ? 2 : 1;
        ctx.strokeStyle = thick ? C.lineStrong : C.line;
        ctx.beginPath();
        ctx.moveTo(x0 + k * cell, y0); ctx.lineTo(x0 + k * cell, y0 + size);
        ctx.moveTo(x0, y0 + k * cell); ctx.lineTo(x0 + size, y0 + k * cell);
        ctx.stroke();
      }
      ctx.restore();
    },
    status: function (w) {
      var s = w.state;
      var domains = 0;
      for (var i = 0; i < 81; i++) if (!s.val[i]) domains += bitCount(s.cand[i]);
      return Atlas.t('assigned <b>', 'заполнено клеток: <b>') + s.assigned +
        Atlas.t('</b> of 81 · candidates removed <b>', '</b> из 81 · удалено кандидатов: <b>') + s.removed +
        Atlas.t('</b> · <b>', '</b> · ещё в игре: <b>') + domains +
        Atlas.t('</b> still in play (a blank grid would have 729)<br>', '</b> (в пустой сетке их было бы 729)<br>') +
        (s.assigned === 81 ? '<span class="ok">' + s.msg + '</span>'
                           : (s.stuck ? '<span class="warn">' + s.msg + '</span>' : s.msg));
    }
  });

  function bitCount(x) {
    var n = 0;
    while (x) { n += x & 1; x >>= 1; }
    return n;
  }

  function eliminate(s, idx, d) {
    var bit = 1 << (d - 1), removed = 0;
    PEERS[idx].forEach(function (p) {
      if (!s.val[p] && (s.cand[p] & bit)) { s.cand[p] &= ~bit; removed++; }
    });
    return removed;
  }

  function assign(s, idx, d) {
    s.val[idx] = d;
    s.cand[idx] = 0;
    s.assigned++;
    s.removed += eliminate(s, idx, d);
    s.last = idx;
    s.lastPeers = PEERS[idx];
  }


})();
