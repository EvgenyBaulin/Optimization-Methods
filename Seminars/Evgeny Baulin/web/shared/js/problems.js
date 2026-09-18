// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Problem cards: statements, step-by-step solutions with prediction prompts, two hint levels,
// answer checking through a restricted math.js evaluator, and the P2/P3 timer.
(function () {
  'use strict';
  var SEM = window.SEM;
  var dom = SEM.dom;
  var util = SEM.util;
  var render = SEM.render;
  var el = dom.el;

  var P = (SEM.problems = { steppers: {}, active: null });

  function mode(name) {
    return document.documentElement.classList.contains('is-' + name);
  }
  P.instructor = function () {
    return mode('instructor');
  };
  P.revealAll = function () {
    return SEM.param('reveal') === 'all';
  };

  function bindText(node, path, values) {
    SEM.i18n.bind(function () {
      node.textContent = values ? SEM.tuf(path, typeof values === 'function' ? values() : values) : SEM.tu(path);
    });
    return node;
  }
  P.bindText = bindText;

  /* ------------------------------------------------------------------ stepper */

  // A step-by-step solution. steps: [{text, predict?, table?}]; state key: id.
  function Stepper(container, id, steps, opts) {
    var self = this;
    self.id = id;
    self.steps = steps;
    self.opts = opts || {};
    var store = SEM.state.section('steps');
    var saved = store[id] || {};
    self.n = util.clamp(saved.n | 0, 0, steps.length);
    self.predict = !!saved.predict;
    self.root = el('div', { class: 'stepper', tabindex: '-1', dataset: { stepper: id } });
    self.list = el('ol', { class: 'steps' });
    self.items = steps.map(function (s) {
      var li = el('li', { class: 'step' });
      if (s.predict) {
        var pr = el('p', { class: 'predict' });
        var tag = el('span', { class: 'predict-tag' });
        bindText(tag, 'problem.predict');
        var body = el('span', { class: 'predict-text' });
        SEM.i18n.bind(function () {
          render.rich(body, s.predict);
        });
        dom.append(pr, [tag, ' ', body]);
        li.appendChild(pr);
        li._predict = pr;
      }
      var text = el('div', { class: 'step-text' });
      SEM.i18n.bind(function () {
        render.rich(text, s.text);
      });
      li.appendChild(text);
      li._text = text;
      if (s.table) li.appendChild(P.simplexTable(s.table));
      self.list.appendChild(li);
      return li;
    });
    self.root.appendChild(self.list);

    var controls = el('div', { class: 'stepper-controls' });
    self.prevBtn = el('button', { type: 'button', class: 'btn', onclick: function () { self.focus(); self.back(); } });
    self.nextBtn = el('button', { type: 'button', class: 'btn btn-primary', onclick: function () { self.focus(); self.forward(); } });
    self.allBtn = el('button', { type: 'button', class: 'btn btn-quiet', onclick: function () { self.focus(); self.showAll(); } });
    self.count = el('span', { class: 'step-count', 'aria-live': 'polite' });
    bindText(self.prevBtn, 'problem.prev');
    bindText(self.nextBtn, 'problem.next');
    bindText(self.allBtn, 'problem.showAll');
    SEM.i18n.bind(function () {
      self.updateCount();
    });
    dom.append(controls, [self.prevBtn, self.nextBtn, self.allBtn, self.count]);
    self.root.appendChild(controls);
    if (self.opts.after) self.root.appendChild(self.opts.after);
    self.root.addEventListener('pointerdown', function () {
      self.focus();
    });
    self.root.addEventListener('focusin', function () {
      P.active = self;
    });
    container.appendChild(self.root);
    P.steppers[id] = self;
    if (P.revealAll()) {
      self.n = steps.length;
      self.predict = false;
    }
    self.update();
  }

  Stepper.prototype.focus = function () {
    P.active = this;
  };

  Stepper.prototype.save = function () {
    SEM.state.section('steps')[this.id] = { n: this.n, predict: this.predict };
    SEM.state.touch();
  };

  Stepper.prototype.forward = function () {
    if (this.n >= this.steps.length) return false;
    var next = this.steps[this.n];
    if (next.predict && !this.predict) this.predict = true;
    else {
      this.n += 1;
      this.predict = false;
    }
    this.save();
    this.update(true);
    return true;
  };

  Stepper.prototype.back = function () {
    if (this.predict) this.predict = false;
    else if (this.n > 0) this.n -= 1;
    else return false;
    this.save();
    this.update();
    return true;
  };

  Stepper.prototype.showAll = function () {
    this.n = this.steps.length;
    this.predict = false;
    this.save();
    this.update();
  };

  Stepper.prototype.updateCount = function () {
    this.count.textContent = SEM.tuf('problem.stepCount', { n: this.n, total: this.steps.length });
  };

  Stepper.prototype.update = function (scroll) {
    var self = this;
    self.items.forEach(function (li, i) {
      var shown = i < self.n;
      var prompting = i === self.n && self.predict;
      li.hidden = !(shown || prompting);
      li.classList.toggle('is-prompt', prompting);
      if (li._text) li._text.hidden = !shown;
    });
    self.prevBtn.disabled = self.n === 0 && !self.predict;
    self.nextBtn.disabled = self.n >= self.steps.length;
    self.allBtn.disabled = self.n >= self.steps.length;
    self.updateCount();
    if (self.opts.onChange) self.opts.onChange(self.n >= self.steps.length);
    if (scroll) {
      var target = self.items[Math.min(self.n, self.items.length - 1)];
      if (self.predict) target = self.items[self.n];
      else if (self.n > 0) target = self.items[self.n - 1];
      if (target && target.scrollIntoView) {
        var r = target.getBoundingClientRect();
        // clear of the sticky toolbar (--toolbar-h, set by app.js; 0 where the toolbar scrolls away)
        var clearTop = (parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--toolbar-h')) || 0) + 7;
        if (r.bottom > window.innerHeight - 40 || r.top < clearTop) target.scrollIntoView({ block: 'nearest', behavior: util.reducedMotion() ? 'auto' : 'smooth' });
      }
    }
  };
  P.Stepper = Stepper;

  /* ------------------------------------------------------------------ the simplex table */

  P.simplexTable = function (pid) {
    var wrap = el('div', { class: 'table-wrap' });
    SEM.i18n.bind(function (lang) {
      var steps = util.data(pid + '.steps');
      dom.clear(wrap);
      if (!steps) return;
      var table = el('table', { class: 'sort-table' });
      var head = el('tr');
      ['j', 'u_j', 's_j', 't_j'].forEach(function (h) {
        var th = el('th', { scope: 'col' });
        render.katex(th, h);
        head.appendChild(th);
      });
      table.appendChild(el('thead', null, head));
      var body = el('tbody');
      steps.u.forEach(function (u, i) {
        var tr = el('tr', { class: i + 1 === steps.rho ? 'is-rho' : i + 1 > steps.rho ? 'is-after' : '' });
        [String(i + 1), SEM.fmt.num(u, lang, true), SEM.fmt.num(steps.s[i], lang, true), SEM.fmt.num(steps.tests[i], lang, true)].forEach(function (v) {
          var td = el('td');
          render.katex(td, v);
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      table.appendChild(body);
      wrap.appendChild(table);
    });
    return wrap;
  };

  /* ------------------------------------------------------------------ answer checking */

  var limited = null;
  // A math.js instance with the functions its security guide recommends disabling.
  function evaluator() {
    if (limited) return limited;
    var mathjs = window.math;
    if (!mathjs || typeof mathjs.create !== 'function') return null;
    // A separate instance, so that the global one stays untouched. The UMD build
    // creates a complete instance when no factory set is given.
    var instance = mathjs.create(mathjs.all);
    if (typeof instance.evaluate !== 'function' || typeof instance.sqrt !== 'function') return null;
    var evaluate = instance.evaluate;
    var disabled = function (name) {
      return function () {
        throw new Error('Function ' + name + ' is disabled');
      };
    };
    instance['import'](
      {
        'import': disabled('import'),
        createUnit: disabled('createUnit'),
        reviver: disabled('reviver'),
        evaluate: disabled('evaluate'),
        parse: disabled('parse'),
        simplify: disabled('simplify'),
        derivative: disabled('derivative'),
        resolve: disabled('resolve')
      },
      { override: true }
    );
    limited = function (expr, scope) {
      return evaluate(expr, scope || {});
    };
    return limited;
  }
  P.evaluator = evaluator;

  function toNumber(v) {
    if (typeof v === 'number') return isFinite(v) ? v : null;
    if (v && typeof v === 'object' && v.isFraction) return Number(v.valueOf());
    if (v && typeof v === 'object' && v.isBigNumber) return Number(v.toString());
    return null;
  }

  // Parse one field: decimals with '.' or ',', fractions, roots, pi.
  P.parseNumber = function (raw, scope) {
    var s = String(raw === undefined || raw === null ? '' : raw).trim();
    if (!s) return { error: 'empty' };
    if (s.length > 80) return { error: 'unreadable' };
    s = s.replace(/−/g, '-').replace(/·|×/g, '*').replace(/√/g, 'sqrt').replace(/π/g, 'pi').replace(/,/g, '.');
    if (!/^[0-9a-zA-Z+\-*/^().\s]*$/.test(s)) return { error: 'unreadable' };
    var ev = evaluator();
    if (!ev) {
      var n = Number(s);
      return isFinite(n) ? { value: n } : { error: 'unreadable' };
    }
    try {
      var v = toNumber(ev(s, scope));
      return v === null ? { error: 'unreadable' } : { value: v };
    } catch (e) {
      return { error: 'unreadable' };
    }
  };

  // A typed formula in the spelling of the labels: x_1 and x_{1} are x1, alpha may be written as
  // a letter or as \alpha. Everything else is left to the evaluator.
  P.readFormula = function (raw) {
    return String(raw === undefined || raw === null ? '' : raw)
      .trim()
      .replace(/\u03b1|\\alpha/g, 'alpha')
      .replace(/([A-Za-z])_\{?(\d+)\}?/g, '$1$2');
  };

  function close(a, b, tol) {
    return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
  }

  // s split on sep where no bracket is open, so that sqrt(2) stays whole.
  function splitTop(s, sep) {
    var parts = [];
    var depth = 0;
    var last = 0;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === '(') depth += 1;
      else if (ch === ')') depth -= 1;
      else if (ch === sep && depth === 0) {
        parts.push(s.slice(last, i));
        last = i + 1;
      }
    }
    parts.push(s.slice(last));
    return parts;
  }

  // Split "(a, b); (c, d)" into points, each a list of coordinate strings. Inside a point the coordinates
  // are separated by ';' when there is one (Russian decimal commas: "(0,5; 1)"), else by ','. Between the
  // points only spaces, ';' and ',' may stand. A single point may be typed without its brackets.
  P.splitPoints = function (raw) {
    var s = String(raw === undefined || raw === null ? '' : raw).trim();
    if (!s) return { error: 'empty' };
    if (s.charAt(0) !== '(') s = '(' + s + ')';
    var points = [];
    var depth = 0;
    var start = 0;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === '(') {
        if (depth === 0) start = i + 1;
        depth += 1;
      } else if (ch === ')') {
        depth -= 1;
        if (depth < 0) return { error: 'unreadablePoints' };
        if (depth === 0) points.push(s.slice(start, i));
      } else if (depth === 0 && !/[\s;,]/.test(ch)) {
        return { error: 'unreadablePoints' };
      }
    }
    if (depth !== 0 || !points.length) return { error: 'unreadablePoints' };
    return {
      points: points.map(function (inner) {
        var bySemicolon = splitTop(inner, ';');
        return bySemicolon.length > 1 ? bySemicolon : splitTop(inner, ',');
      })
    };
  };

  // Check a submission against an answer spec {type, value, tol, sign?, vars?}.
  // Returns {ok, key, args?}: key is a path in content.ui.feedback, args fill its {placeholders}.
  P.checkAnswer = function (spec, input) {
    var tol = spec.tol || 1e-6;
    var i;
    switch (spec.type) {
      case 'number': {
        var r = P.parseNumber(input[0]);
        if (r.error) return { ok: false, key: r.error };
        if (spec.sign === 'nonneg' && r.value < -tol) return { ok: false, key: 'negativeMultiplier' };
        return close(r.value, spec.value, tol) ? { ok: true, key: 'correct' } : { ok: false, key: r.value * spec.value < 0 ? 'wrongSign' : 'wrongNumber' };
      }
      case 'vector': {
        var vals = [];
        for (i = 0; i < spec.value.length; i++) {
          var c = P.parseNumber(input[i]);
          if (c.error) return { ok: false, key: c.error === 'empty' ? 'emptyComponent' : 'unreadableComponent' };
          vals.push(c.value);
        }
        if (spec.sign === 'nonneg') {
          for (i = 0; i < vals.length; i++) if (vals[i] < -tol) return { ok: false, key: 'negativeMultiplier' };
        }
        for (i = 0; i < vals.length; i++) {
          if (!close(vals[i], spec.value[i], tol)) return { ok: false, key: 'component' + (i + 1) };
        }
        return { ok: true, key: 'correct' };
      }
      case 'interval': {
        var lo = P.parseNumber(input[0]);
        var hi = P.parseNumber(input[1]);
        if (lo.error || hi.error) return { ok: false, key: lo.error === 'empty' || hi.error === 'empty' ? 'emptyComponent' : 'unreadable' };
        if (!close(lo.value, spec.value[0], tol)) return { ok: false, key: 'wrongLeft' };
        if (!close(hi.value, spec.value[1], tol)) return { ok: false, key: 'wrongRight' };
        return { ok: true, key: 'correct' };
      }
      case 'formula': {
        // what the label shows: a subscript as x_1 and alpha written as a letter
        var raw = P.readFormula(input[0]);
        if (!raw) return { ok: false, key: 'empty' };
        var vars = spec.vars || [];
        var points = [-3.7, -1.2, 0.4, 2.9, 5.3];
        for (i = 0; i < points.length; i++) {
          var scope = {};
          vars.forEach(function (name, k) {
            scope[name] = points[(i + k * 2) % points.length];
          });
          var got = P.parseNumber(raw, scope);
          var want = P.parseNumber(spec.value, scope);
          if (got.error) return { ok: false, key: 'unreadableFormula' };
          if (want.error || !close(got.value, want.value, tol)) return { ok: false, key: 'wrongFormula' };
        }
        return { ok: true, key: 'correct' };
      }
      case 'single': {
        if (!input[0]) return { ok: false, key: 'emptyChoice' };
        return input[0] === spec.value ? { ok: true, key: 'correct' } : { ok: false, key: 'wrongChoice' };
      }
      case 'multiple': {
        var chosen = (input || []).filter(Boolean);
        if (!chosen.length) return { ok: false, key: 'emptyChoice' };
        var want2 = spec.value;
        for (i = 0; i < chosen.length; i++) if (want2.indexOf(chosen[i]) < 0) return { ok: false, key: 'multipleExtra' };
        for (i = 0; i < want2.length; i++) if (chosen.indexOf(want2[i]) < 0) return { ok: false, key: 'multipleMissing' };
        return { ok: true, key: 'correct' };
      }
      case 'matrix': {
        // input: the entries row by row
        var entries = [];
        var r, c;
        for (r = 0; r < spec.value.length; r++) {
          for (c = 0; c < spec.value[r].length; c++) {
            var e = P.parseNumber(input[entries.length]);
            if (e.error) return { ok: false, key: e.error === 'empty' ? 'emptyComponent' : 'unreadableEntry' };
            entries.push(e.value);
          }
        }
        if (spec.sign === 'nonneg') {
          for (i = 0; i < entries.length; i++) if (entries[i] < -tol) return { ok: false, key: 'negativeEntry' };
        }
        i = 0;
        for (r = 0; r < spec.value.length; r++) {
          for (c = 0; c < spec.value[r].length; c++) {
            if (!close(entries[i], spec.value[r][c], tol)) return { ok: false, key: 'entry', args: { i: r + 1, j: c + 1 } };
            i += 1;
          }
        }
        return { ok: true, key: 'correct' };
      }
      case 'points': {
        // an unordered set: a point typed twice counts once. spec.value must not be empty: its first point
        // gives the dimension, and an empty field is never accepted (the self-test reports such a spec).
        var split = P.splitPoints(input[0]);
        if (split.error) return { ok: false, key: split.error };
        var dim = spec.value.length ? spec.value[0].length : 0;
        var got = [];
        // every coordinate is read first: text that is not numbers ("hello") is unreadable, and only
        // readable points with the wrong number of coordinates ("5") are a dimension mistake
        for (i = 0; i < split.points.length; i++) {
          var pt = [];
          for (var k = 0; k < split.points[i].length; k++) {
            var x = P.parseNumber(split.points[i][k]);
            if (x.error) return { ok: false, key: 'unreadablePoints' };
            pt.push(x.value);
          }
          got.push(pt);
        }
        for (i = 0; i < got.length; i++) {
          if (got[i].length !== dim) return { ok: false, key: 'pointsDimension', args: { n: dim } };
        }
        var same = function (p, q) {
          for (var m = 0; m < dim; m++) if (!close(p[m], q[m], tol)) return false;
          return true;
        };
        var distinct = got.filter(function (p, n) {
          for (var m = 0; m < n; m++) if (same(p, got[m])) return false;
          return true;
        });
        var matched = [];
        for (i = 0; i < distinct.length; i++) {
          var hit = -1;
          for (var j = 0; j < spec.value.length && hit < 0; j++) if (!matched[j] && same(distinct[i], spec.value[j])) hit = j;
          if (hit < 0) return { ok: false, key: 'pointsExtra' };
          matched[hit] = true;
        }
        return distinct.length < spec.value.length ? { ok: false, key: 'pointsMissing' } : { ok: true, key: 'correct' };
      }
      default:
        return { ok: false, key: 'unreadable' };
    }
  };

  // The feedback text of a result {key, args?} in the current language. A coordinate without a string
  // of its own (component5, ...) gets feedback.componentN.
  P.feedbackText = function (result) {
    var m = /^component(\d+)$/.exec(result.key);
    if (m && !SEM.i18n.has('feedback.' + result.key)) return SEM.tuf('feedback.componentN', { n: m[1] });
    return SEM.tuf('feedback.' + result.key, result.args || {});
  };

  // The reference value typed as a student would type it, for the self-test.
  P.referenceInput = function (spec) {
    var dec = function (v) {
      return SEM.fmt.decimal(v, 10);
    };
    switch (spec.type) {
      case 'number': return [dec(spec.value)];
      case 'vector': return spec.value.map(dec);
      case 'interval': return spec.value.map(dec);
      case 'formula': return [spec.value];
      case 'single': return [spec.value];
      case 'multiple': return spec.value.slice();
      case 'matrix':
        return spec.value.reduce(function (all, row) {
          return all.concat(row.map(dec));
        }, []);
      case 'points': {
        // in the notation of the current language, so that a run in each language reads both
        var ru = SEM.i18n && SEM.i18n.lang === 'ru';
        return [
          spec.value
            .map(function (pt) {
              return '(' + pt.map(function (v) { return ru ? dec(v).replace('.', ',') : dec(v); }).join(ru ? '; ' : ', ') + ')';
            })
            .join('; ')
        ];
      }
      default: return [];
    }
  };

  /* ------------------------------------------------------------------ answer UI */

  // One answer part. part: {id, ref, label, options?, components?, rowLabels?, colLabels?};
  // onAttempt(pid) is called on every check.
  P.answerPart = function (pid, part, onAttempt) {
    var spec = util.data(part.ref);
    var key = pid + '.' + part.id;
    var store = SEM.state.section('answers');
    var saved = store[key] || { values: [] };
    var root = el('div', { class: 'answer-part', dataset: { answer: key } });
    var labelId = dom.id('ans');
    var label = render.el('div', { class: 'answer-label', id: labelId }, part.label);
    root.appendChild(label);
    var row = el('div', { class: 'answer-row' });
    var inputs = [];
    var type = spec ? spec.type : 'number';

    // ariaLabel: a pair, or a function returning the plain label in the current language
    function textInput(index, ariaLabel) {
      var input = el('input', {
        type: 'text',
        class: 'answer-input',
        inputmode: type === 'formula' || type === 'points' ? 'text' : 'decimal',
        autocomplete: 'off',
        autocapitalize: 'off',
        spellcheck: 'false',
        maxlength: type === 'points' ? '240' : '80'
      });
      input.value = typeof saved.values[index] === 'string' ? saved.values[index] : '';
      if (ariaLabel) {
        SEM.i18n.bind(function () {
          input.setAttribute('aria-label', typeof ariaLabel === 'function' ? ariaLabel() : render.plain(ariaLabel));
        });
      } else input.setAttribute('aria-labelledby', labelId);
      input.addEventListener('input', persist);
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          submit();
        }
      });
      inputs.push(input);
      return input;
    }

    // the brackets and what they enclose stay on one line, however narrow the screen is
    if (type === 'vector') {
      var comps = part.components || spec.value.map(function (v, i) {
        return '$x_{' + (i + 1) + '}$';
      });
      var vec = el('span', { class: 'answer-group' });
      vec.appendChild(el('span', { class: 'bracket', text: '(' }));
      spec.value.forEach(function (v, i) {
        var cell = el('label', { class: 'component' });
        cell.appendChild(render.el('span', { class: 'component-label' }, comps[i]));
        cell.appendChild(textInput(i));
        vec.appendChild(cell);
      });
      vec.appendChild(el('span', { class: 'bracket', text: ')' }));
      row.appendChild(vec);
    } else if (type === 'interval') {
      var span = el('span', { class: 'answer-group' });
      span.appendChild(el('span', { class: 'bracket', text: '[' }));
      var left = el('label', { class: 'component' });
      var leftName = el('span', { class: 'component-label' });
      bindText(leftName, 'problem.left');
      dom.append(left, [leftName, textInput(0)]);
      var right = el('label', { class: 'component' });
      var rightName = el('span', { class: 'component-label' });
      bindText(rightName, 'problem.right');
      dom.append(right, [rightName, textInput(1)]);
      dom.append(span, [left, right, el('span', { class: 'bracket', text: ']' })]);
      row.appendChild(span);
    } else if (type === 'matrix') {
      row.appendChild(matrixGrid());
    } else if (type === 'points') {
      var field = textInput(0);
      field.classList.add('answer-input-wide');
      var hint = el('p', { class: 'answer-hint', id: dom.id('ans-hint') });
      var three = spec.value.length > 0 && spec.value[0].length === 3;
      SEM.i18n.bind(function () {
        field.setAttribute('placeholder', SEM.tu(three ? 'problem.pointsPlaceholder3' : 'problem.pointsPlaceholder'));
        hint.textContent = SEM.tu('problem.pointsHint');
      });
      field.setAttribute('aria-describedby', hint.id);
      root.appendChild(hint);
      row.appendChild(field);
    } else if (type === 'single' || type === 'multiple') {
      var group = el('div', { class: 'choices', role: type === 'single' ? 'radiogroup' : 'group', 'aria-labelledby': labelId });
      (part.options || []).forEach(function (opt) {
        var input = el('input', { type: type === 'single' ? 'radio' : 'checkbox', name: key, value: opt.id });
        input.checked = saved.values.indexOf(opt.id) >= 0;
        input.addEventListener('change', persist);
        inputs.push(input);
        var lab = el('label', { class: 'choice' });
        dom.append(lab, [input, render.el('span', null, opt.label)]);
        group.appendChild(lab);
      });
      row.appendChild(group);
    } else {
      var single = textInput(0);
      if (type === 'formula') {
        SEM.i18n.bind(function () {
          single.setAttribute('placeholder', SEM.tuf('problem.formulaPlaceholder', { vars: (spec.vars || []).join(', ') }));
        });
      }
      row.appendChild(single);
    }

    // A rows × cols grid of entries between tall brackets, with optional row and column labels (pairs or
    // TeX strings, from the part or from the spec) outside the brackets. Arrow keys move between the entries:
    // up and down always, left and right from the ends of the text.
    function matrixGrid() {
      var nRows = spec.value.length;
      var nCols = nRows ? spec.value[0].length : 0;
      var rowLabels = part.rowLabels || spec.rowLabels;
      var colLabels = part.colLabels || spec.colLabels;
      var first = rowLabels ? 2 : 1; // grid column of the left bracket
      var top = colLabels ? 2 : 1; // grid row of the first entries
      var grid = el('div', { class: 'matrix-input', role: 'group', 'aria-labelledby': labelId });
      grid.style.gridTemplateColumns = (rowLabels ? 'auto ' : '') + 'auto repeat(' + nCols + ', auto) auto';
      function place(node, r, c) {
        node.style.gridRow = String(r);
        node.style.gridColumn = String(c);
        grid.appendChild(node);
      }
      (colLabels || []).forEach(function (lab, j) {
        place(render.el('span', { class: 'matrix-label is-col' }, lab), 1, first + 1 + j);
      });
      spec.value.forEach(function (values, i) {
        if (rowLabels) place(render.el('span', { class: 'matrix-label is-row' }, rowLabels[i]), top + i, 1);
        values.forEach(function (v, j) {
          var cell = textInput(i * nCols + j, function () {
            return SEM.tuf('problem.matrixEntry', { i: i + 1, j: j + 1 });
          });
          cell.classList.add('matrix-cell');
          place(cell, top + i, first + 1 + j);
        });
      });
      ['is-left', 'is-right'].forEach(function (side, s) {
        var bracket = el('span', { class: 'matrix-bracket ' + side, 'aria-hidden': 'true' });
        bracket.style.gridRow = top + ' / span ' + nRows;
        bracket.style.gridColumn = String(s ? first + nCols + 1 : first);
        grid.appendChild(bracket);
      });
      grid.addEventListener('keydown', function (ev) {
        var k = inputs.indexOf(ev.target);
        if (k < 0 || ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
        var t = ev.target;
        var next = -1;
        if (ev.key === 'ArrowUp' && k >= nCols) next = k - nCols;
        else if (ev.key === 'ArrowDown' && k + nCols < inputs.length) next = k + nCols;
        else if (ev.key === 'ArrowLeft' && k % nCols > 0 && t.selectionStart === 0 && t.selectionEnd === 0) next = k - 1;
        else if (ev.key === 'ArrowRight' && k % nCols < nCols - 1 && t.selectionStart === t.value.length) next = k + 1;
        if (next < 0) return;
        ev.preventDefault();
        inputs[next].focus();
        inputs[next].select();
      });
      return grid;
    }

    var btn = el('button', { type: 'button', class: 'btn', onclick: submit });
    bindText(btn, 'problem.check');
    row.appendChild(btn);
    root.appendChild(row);
    var feedback = el('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    root.appendChild(feedback);

    function values() {
      if (type === 'single' || type === 'multiple') {
        return inputs.filter(function (i) { return i.checked; }).map(function (i) { return i.value; });
      }
      return inputs.map(function (i) { return i.value; });
    }

    function persist() {
      var s = store[key] || {};
      s.values = values();
      store[key] = s;
      SEM.state.touch();
    }

    function showFeedback() {
      var s = store[key];
      feedback.classList.remove('is-ok', 'is-bad');
      if (!s || !s.result) {
        feedback.textContent = '';
        return;
      }
      feedback.classList.add(s.result.ok ? 'is-ok' : 'is-bad');
      feedback.textContent = P.feedbackText(s.result);
    }

    function submit() {
      persist();
      if (!spec) return;
      var result = P.checkAnswer(spec, values());
      store[key].result = result.args ? { ok: result.ok, key: result.key, args: result.args } : { ok: result.ok, key: result.key };
      SEM.state.touch();
      showFeedback();
      if (result.key !== 'empty' && result.key !== 'emptyChoice' && result.key !== 'emptyComponent' && onAttempt) onAttempt(pid);
    }

    SEM.i18n.bind(showFeedback);
    return root;
  };

  /* ------------------------------------------------------------------ problem card */

  P.attempted = function (pid) {
    return (SEM.state.section('attempts')[pid] | 0) > 0;
  };

  // Render a problem (one of the nine, or a home-practice item) into container.
  // opts: {kind: 'board'|'students'|'home', time: timeline path, headingLevel}
  P.card = function (container, pid, prob, opts) {
    var o = opts || {};
    var kind = o.kind || prob.who;
    var card = el('article', { class: 'problem problem-' + kind, id: 'problem-' + pid, dataset: { problem: pid } });
    var head = el('header', { class: 'problem-head' });
    head.appendChild(el('span', { class: 'problem-id', text: pid }));
    if (kind === 'board' || kind === 'students') {
      var who = el('span', { class: 'problem-who' });
      bindText(who, kind === 'board' ? 'problem.board' : 'problem.students');
      head.appendChild(who);
    } else if (prob.kind) {
      var kindTag = el('span', { class: 'problem-who' });
      bindText(kindTag, prob.kind === 'code' ? 'problem.inCode' : 'problem.byHand');
      head.appendChild(kindTag);
    }
    head.appendChild(render.el('h' + (o.headingLevel || 4), { class: 'problem-title' }, prob.title));
    if (o.time) {
      var time = el('span', { class: 'planned-time' });
      bindText(time, 'blocks.planned', function () { return { time: util.data(o.time) }; });
      head.appendChild(time);
    }
    card.appendChild(head);
    if (prob.skill) card.appendChild(render.el('p', { class: 'problem-skill' }, prob.skill));
    card.appendChild(render.el('div', { class: 'problem-statement' }, prob.statement));

    var answersBox = el('div', { class: 'answers' });
    var solution = el('section', { class: 'solution' });
    var locked = el('div', { class: 'locked' });

    function unlock() {
      var attempts = SEM.state.section('attempts');
      attempts[pid] = (attempts[pid] | 0) + 1;
      SEM.state.touch();
      updateLock();
    }

    // hints, one level at a time
    if (prob.hints && prob.hints.length) {
      var hintsBox = el('div', { class: 'hints' });
      var hintState = SEM.state.section('hints');
      var hintList = el('ol', { class: 'hint-list' });
      var hintBtn = el('button', { type: 'button', class: 'btn btn-quiet' });
      var hintItems = prob.hints.map(function (h) {
        var li = render.el('li', { class: 'hint' }, h);
        hintList.appendChild(li);
        return li;
      });
      var updateHints = function () {
        var shown = P.revealAll() ? prob.hints.length : hintState[pid] | 0;
        hintItems.forEach(function (li, i) {
          li.hidden = i >= shown;
        });
        hintBtn.hidden = shown >= prob.hints.length;
        hintBtn.textContent = SEM.tuf('problem.hintNext', { n: shown + 1, total: prob.hints.length });
      };
      hintBtn.addEventListener('click', function () {
        hintState[pid] = Math.min((hintState[pid] | 0) + 1, prob.hints.length);
        SEM.state.touch();
        updateHints();
      });
      SEM.i18n.bind(updateHints);
      dom.append(hintsBox, [hintBtn, hintList]);
      if (kind !== 'board') card.appendChild(hintsBox);
      else o.selfStudy = hintsBox;
    }

    // answer fields
    if (prob.answers && prob.answers.length) {
      var answersTitle = el('h5', { class: 'answers-title' });
      bindText(answersTitle, 'problem.yourAnswers');
      answersBox.appendChild(answersTitle);
      prob.answers.forEach(function (part) {
        answersBox.appendChild(P.answerPart(pid, part, unlock));
      });
    }

    // solution
    var answerText = null;
    if (prob.answerText) {
      answerText = el('div', { class: 'answer-text' });
      var answerLabel = el('strong', { class: 'answer-label-inline' });
      bindText(answerLabel, 'problem.answer');
      var answerBody = render.el('span', null, prob.answerText);
      dom.append(answerText, [answerLabel, ' ', answerBody]);
    }
    var review = prob.review ? render.el('p', { class: 'review' }, prob.review) : null;
    var solutionTitle = el('h5', { class: 'solution-title' });
    bindText(solutionTitle, 'problem.solution');
    solution.appendChild(solutionTitle);
    var stepper = new Stepper(solution, pid, prob.steps || [], {
      after: answerText,
      onChange: function (done) {
        if (answerText) answerText.hidden = !done;
        if (review) review.hidden = !done;
      }
    });
    if (review) solution.appendChild(review);

    if (kind === 'board') {
      card.appendChild(solution);
      var self = el('details', { class: 'self-study' });
      var sum = el('summary');
      bindText(sum, 'problem.selfStudy');
      self.appendChild(sum);
      if (o.selfStudy) self.appendChild(o.selfStudy);
      self.appendChild(answersBox);
      card.appendChild(self);
    } else {
      card.appendChild(answersBox);
      var lockText = el('p', { class: 'locked-text' });
      bindText(lockText, 'problem.locked');
      locked.appendChild(lockText);
      card.appendChild(locked);
      card.appendChild(solution);
    }

    function updateLock() {
      if (kind === 'board') return;
      var open = P.instructor() || P.revealAll() || P.attempted(pid);
      locked.hidden = open;
      solution.hidden = !open;
    }
    SEM.on('mode', updateLock);
    updateLock();

    if (prob.mistakes && prob.mistakes.length) {
      var mistakes = el('details', { class: 'mistakes' });
      var ms = el('summary');
      bindText(ms, 'problem.mistakes');
      mistakes.appendChild(ms);
      var ul = el('ul');
      prob.mistakes.forEach(function (m) {
        ul.appendChild(render.el('li', null, m));
      });
      mistakes.appendChild(ul);
      if (P.revealAll()) mistakes.open = true;
      card.appendChild(mistakes);
    }
    if (prob.check) {
      var ref = el('p', { class: 'check-ref' });
      bindText(ref, 'problem.checkRef', { id: prob.check });
      card.appendChild(ref);
    }
    container.appendChild(card);
    return { card: card, stepper: stepper };
  };

  /* ------------------------------------------------------------------ timer */

  var T = (SEM.timer = { listeners: [] });
  var tick = null;

  function timerState() {
    var s = SEM.state.get('timer', null);
    if (!s || typeof s !== 'object') {
      var path = SEM.seminar && SEM.seminar.timerDefault;
      var d = (path && util.data(path)) || 420;
      s = { duration: d, remaining: d, endsAt: null };
    }
    return s;
  }

  T.remaining = function () {
    var s = timerState();
    if (s.endsAt) return Math.max(0, (s.endsAt - Date.now()) / 1000);
    return s.remaining;
  };
  T.running = function () {
    return !!timerState().endsAt && T.remaining() > 0;
  };
  T.ended = function () {
    var s = timerState();
    return (s.endsAt && T.remaining() <= 0) || (!s.endsAt && s.remaining <= 0);
  };
  function save(s) {
    SEM.state.set('timer', s);
    T.emit();
  }
  T.emit = function () {
    T.listeners.forEach(function (fn) {
      fn();
    });
  };
  T.onChange = function (fn) {
    T.listeners.push(fn);
    fn();
  };
  T.toggle = function () {
    var s = timerState();
    if (s.endsAt) {
      s.remaining = T.remaining();
      s.endsAt = null;
    } else {
      if (s.remaining <= 0) s.remaining = s.duration;
      s.endsAt = Date.now() + s.remaining * 1000;
    }
    save(s);
    ensureTick();
  };
  T.reset = function () {
    var s = timerState();
    s.remaining = s.duration;
    s.endsAt = null;
    save(s);
  };
  T.adjust = function (deltaMinutes) {
    var s = timerState();
    var d = util.clamp(s.duration + deltaMinutes * 60, 60, 60 * 60);
    var shift = d - s.duration;
    s.duration = d;
    if (s.endsAt) s.endsAt += shift * 1000;
    else s.remaining = util.clamp(s.remaining + shift, 0, d);
    save(s);
  };
  T.setDuration = function (seconds) {
    save({ duration: seconds, remaining: seconds, endsAt: null });
  };
  function ensureTick() {
    if (tick) return;
    tick = setInterval(function () {
      T.emit();
      if (!T.running()) {
        clearInterval(tick);
        tick = null;
      }
    }, 250);
  }
  if (T.running()) ensureTick();
})();
