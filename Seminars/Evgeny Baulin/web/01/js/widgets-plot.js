// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// SEM.plot1d: a one-dimensional plot with margins and ticks that draws curves, segments and points in data coordinates.
(function () {
  'use strict';
  var SEM = window.SEM;

  // Margins around the data rectangle, in CSS px.
  var ML = 44;
  var MR = 18;
  var MT = 14;
  var MB = 30;

  // A number or a function returning one.
  function value(v) {
    return typeof v === 'function' ? v() : v;
  }

  // An array or a function returning one; anything else is an empty list.
  function list(v) {
    var out = typeof v === 'function' ? v() : v;
    return Array.isArray(out) ? out : [];
  }

  // spec: {x0, x1, y0, y1 (numbers or functions), aspect, scroll, xticks, yticks, xlabel,
  //        curves() -> [{f, from, to, color, width, dash}], segments() -> [{x0, y0, x1, y1, color, width, dash}],
  //        points() -> [{x, y, color, r, label, hollow}], label() -> aria-label, onPointer(type, xy, ev, plot)}.
  // Returns the SEM.Plot with one extra method pickPoint(ev, radius).
  SEM.plot1d = function (container, spec) {
    function bounds() {
      return { x0: value(spec.x0), x1: value(spec.x1), y0: value(spec.y0), y1: value(spec.y1) };
    }

    // Data coordinates to canvas px for the current size and bounds.
    function mapping(p) {
      var b = bounds();
      return {
        X: function (x) { return ML + ((x - b.x0) / (b.x1 - b.x0)) * (p.w - ML - MR); },
        Y: function (y) { return MT + (1 - (y - b.y0) / (b.y1 - b.y0)) * (p.h - MT - MB); }
      };
    }

    var plot = new SEM.Plot(container, {
      domain: { x0: 0, x1: 1, y0: 0, y1: 1 },
      uniform: false,
      aspect: spec.aspect || 0.62,
      scroll: !!spec.scroll,
      label: spec.label,
      draw: function (ctx, p, C) {
        var m = mapping(p);
        var X = m.X;
        var Y = m.Y;
        var lang = SEM.i18n.lang;
        var w = p.w;
        var h = p.h;
        ctx.save();
        ctx.beginPath();
        ctx.rect(ML, MT, w - ML - MR, h - MT - MB);
        ctx.clip();
        list(spec.yticks).forEach(function (t) {
          SEM.draw.line(ctx, ML, Y(t), w - MR, Y(t), C['w-grid'], 1);
        });
        list(spec.curves).forEach(function (cv) {
          var pts = [];
          for (var i = 0; i <= 240; i++) {
            var x = cv.from + ((cv.to - cv.from) * i) / 240;
            var y = cv.f(x);
            if (isFinite(y)) pts.push([X(x), Y(y)]);
          }
          SEM.draw.polyline(ctx, pts, C[cv.color], cv.width || 3, cv.dash);
        });
        list(spec.segments).forEach(function (s) {
          SEM.draw.line(ctx, X(s.x0), Y(s.y0), X(s.x1), Y(s.y1), C[s.color], s.width || 2, s.dash);
        });
        list(spec.points).forEach(function (pt) {
          var px = X(pt.x);
          var py = Y(pt.y);
          if (pt.hollow) SEM.draw.dot(ctx, px, py, pt.r || 6, null, C[pt.color], 2);
          else SEM.draw.dot(ctx, px, py, pt.r || 6, C[pt.color], C['w-halo'], 2);
          if (pt.label) SEM.draw.label(ctx, pt.label, px + 9, py - 9, C[pt.color]);
        });
        ctx.restore();
        SEM.draw.line(ctx, ML, h - MB, w - MR, h - MB, C['w-axis'], 1.2);
        SEM.draw.line(ctx, ML, MT, ML, h - MB, C['w-axis'], 1.2);
        list(spec.xticks).forEach(function (t) {
          SEM.draw.line(ctx, X(t), h - MB, X(t), h - MB + 5, C['w-axis'], 1);
          SEM.draw.label(ctx, SEM.fmt.num(t, lang, false), X(t), h - MB + 15, C['w-label'], { align: 'center', size: 13 });
        });
        list(spec.yticks).forEach(function (t) {
          SEM.draw.label(ctx, SEM.fmt.num(t, lang, false), ML - 8, Y(t), C['w-label'], { align: 'right', size: 13 });
        });
        if (spec.xlabel) SEM.draw.label(ctx, spec.xlabel, w - MR, h - MB - 12, C['w-label'], { align: 'right', italic: true });
      },
      // The world point of the unit square becomes canvas px, then data coordinates.
      onPointer: spec.onPointer
        ? function (type, world, ev, p) {
          var b = bounds();
          var px = world[0] * p.w;
          var py = p.h - world[1] * p.h;
          var xy = [b.x0 + ((px - ML) / (p.w - ML - MR)) * (b.x1 - b.x0), b.y0 + (1 - (py - MT) / (p.h - MT - MB)) * (b.y1 - b.y0)];
          spec.onPointer(type, xy, ev, p);
        }
        : undefined
    });

    // The index of the nearest non-hollow point within radius px of the pointer, or -1.
    plot.pickPoint = function (ev, radius) {
      var r = radius === undefined ? 28 : radius;
      var rect = plot.canvas.getBoundingClientRect();
      var px = ev.clientX - rect.left;
      var py = ev.clientY - rect.top;
      var m = mapping(plot);
      var best = -1;
      var bestD = r * r;
      list(spec.points).forEach(function (pt, i) {
        if (pt.hollow) return;
        var dx = m.X(pt.x) - px;
        var dy = m.Y(pt.y) - py;
        var d = dx * dx + dy * dy;
        if (d <= bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    };

    return plot;
  };
})();
