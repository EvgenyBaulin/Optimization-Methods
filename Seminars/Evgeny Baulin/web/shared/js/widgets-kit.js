// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Building blocks shared by the widgets: panels, segmented choices, sliders, readouts,
// prediction prompts and collapsible code snippets.
(function () {
  'use strict';
  var SEM = window.SEM;
  var dom = SEM.dom;
  var render = SEM.render;
  var el = dom.el;

  var kit = (SEM.kit = {});
  SEM.widgets = SEM.widgets || {};

  function label(node, text) {
    // text: a pair (rich) or a ui path (plain)
    if (typeof text === 'string') {
      SEM.i18n.bind(function () {
        render.rich(node, SEM.ui(text));
      });
    } else {
      SEM.i18n.bind(function () {
        render.rich(node, text);
      });
    }
    return node;
  }
  kit.label = label;

  kit.state = function (id) {
    return SEM.state.section('widgets.' + id);
  };

  kit.panel = function (container, title, caption, opts) {
    var o = opts || {};
    var root = el('figure', { class: 'widget' + (o.wide ? ' widget-wide' : ''), dataset: { widget: o.id || '' } });
    var head = el('figcaption', { class: 'widget-head' });
    if (title) head.appendChild(label(el('h4', { class: 'widget-title' }), title));
    if (caption) head.appendChild(label(el('p', { class: 'widget-caption' }), caption));
    root.appendChild(head);
    var body = el('div', { class: 'widget-body' + (o.stack ? ' is-stacked' : '') });
    var stage = el('div', { class: 'widget-stage' });
    var side = el('div', { class: 'widget-side' });
    dom.append(body, [stage, side]);
    root.appendChild(body);
    container.appendChild(root);
    return { root: root, stage: stage, side: side, body: body };
  };

  // options: [{id, label: pair or ui path}]
  kit.segmented = function (parent, name, options, value, onChange) {
    var group = el('div', { class: 'segmented', role: 'radiogroup' });
    var inputs = [];
    var groupName = dom.id(name);
    options.forEach(function (opt) {
      var id = dom.id(name);
      var input = el('input', { type: 'radio', id: id, name: groupName, value: opt.id, class: 'segmented-input' });
      input.checked = opt.id === value;
      input.addEventListener('change', function () {
        if (input.checked) onChange(opt.id);
      });
      var lab = label(el('label', { for: id, class: 'segmented-label' }), opt.label);
      inputs.push(input);
      dom.append(group, [input, lab]);
    });
    group.setValue = function (v) {
      inputs.forEach(function (i) {
        i.checked = i.value === v;
      });
    };
    parent.appendChild(group);
    return group;
  };

  // spec: {label: pair or ui path, min, max, step, value, format(v) -> TeX}
  kit.slider = function (parent, spec, onInput) {
    var wrap = el('div', { class: 'slider' });
    var id = dom.id('slider');
    var head = el('div', { class: 'slider-head' });
    var lab = label(el('label', { for: id, class: 'slider-label' }), spec.label);
    var out = el('output', { for: id, class: 'slider-value' });
    dom.append(head, [lab, out]);
    var input = el('input', { type: 'range', id: id, min: spec.min, max: spec.max, step: spec.step });
    input.value = String(spec.value);
    function show() {
      var v = parseFloat(input.value);
      render.rich(out, '$' + (spec.format ? spec.format(v) : SEM.fmt.num(v, SEM.i18n.lang, true)) + '$');
    }
    input.addEventListener('input', function () {
      show();
      onInput(parseFloat(input.value));
    });
    SEM.i18n.bind(show);
    dom.append(wrap, [head, input]);
    parent.appendChild(wrap);
    wrap.setValue = function (v) {
      input.value = String(v);
      show();
    };
    wrap.input = input;
    return wrap;
  };

  kit.button = function (parent, uiPath, onClick, cls) {
    var b = el('button', { type: 'button', class: 'btn ' + (cls || ''), onclick: onClick });
    SEM.i18n.bind(function () {
      b.textContent = SEM.tu(uiPath);
    });
    parent.appendChild(b);
    return b;
  };

  // A readout whose lines are rebuilt by fn(lang) -> [rich strings].
  kit.readout = function (parent, fn) {
    var box = el('div', { class: 'readout', 'aria-live': 'polite' });
    parent.appendChild(box);
    var update = function () {
      var lines = fn(SEM.i18n.lang) || [];
      dom.clear(box);
      lines.forEach(function (line) {
        if (line === null || line === undefined) return;
        var p = el('p', { class: 'readout-line' + (line.cls ? ' ' + line.cls : '') });
        render.rich(p, typeof line === 'string' ? line : line.text);
        box.appendChild(p);
      });
    };
    SEM.on('lang', update);
    box.update = update;
    update();
    return box;
  };

  // A one-line prediction prompt with a reveal button. Reveals persist.
  kit.predict = function (parent, key, question, onReveal, buttonPath) {
    var reveals = SEM.state.section('reveals');
    var box = el('div', { class: 'predict-box' });
    var line = el('p', { class: 'predict' });
    var tag = el('span', { class: 'predict-tag' });
    SEM.i18n.bind(function () {
      tag.textContent = SEM.tu('problem.predict');
    });
    dom.append(line, [tag, ' ', label(el('span', { class: 'predict-text' }), question)]);
    var btn = kit.button(box, buttonPath || 'widgets.showAnswer', function () {
      api.reveal();
    }, 'btn-quiet');
    box.insertBefore(line, btn);
    parent.appendChild(box);
    var api = {
      revealed: function () {
        return !!reveals[key] || SEM.param('reveal') === 'all';
      },
      reveal: function () {
        if (!reveals[key]) {
          reveals[key] = true;
          SEM.state.touch();
        }
        update();
        if (onReveal) onReveal();
      },
      reset: function () {
        delete reveals[key];
        SEM.state.touch();
        update();
      }
    };
    function update() {
      btn.hidden = api.revealed();
      box.classList.toggle('is-revealed', api.revealed());
    }
    update();
    return api;
  };

  // A collapsible "In code" block with the Python taken from the notebook export.
  kit.code = function (parent, key, title, text) {
    var keys = Array.isArray(key) ? key : [key];
    var details = el('details', { class: 'code-block', dataset: { code: keys.join(' ') } });
    var summary = label(el('summary'), title);
    details.appendChild(summary);
    if (text) details.appendChild(label(el('p', { class: 'code-note' }), text));
    var source = keys
      .map(function (k) {
        return (SEM.util.data('code.' + k) || '').replace(/\s+$/, '');
      })
      .join('\n\n\n') + '\n';
    if (SEM.param('reveal') === 'all') details.open = true;
    var pre = el('pre', { class: 'code' });
    var code = el('code', { text: source });
    pre.appendChild(code);
    var copy = kit.button(details, 'widgets.copy', function () {
      var done = function () {
        copy.textContent = SEM.tu('widgets.copied');
        setTimeout(function () {
          copy.textContent = SEM.tu('widgets.copy');
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(source).then(done, function () {
          fallbackCopy(source);
          done();
        });
      } else {
        fallbackCopy(source);
        done();
      }
    }, 'btn-quiet btn-copy');
    details.appendChild(pre);
    parent.appendChild(details);
    return details;
  };

  function fallbackCopy(text) {
    var area = el('textarea', { class: 'visually-hidden', 'aria-hidden': 'true' });
    area.value = text;
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      /* copying is a convenience */
    }
    document.body.removeChild(area);
  }

  // Formatting shortcuts for readouts.
  kit.v = function (vec, lang) {
    return SEM.fmt.vector(vec, lang || SEM.i18n.lang, true, 3);
  };
  kit.n = function (x, lang) {
    return SEM.fmt.num(x, lang || SEM.i18n.lang, true, 3);
  };
  // A coefficient in front of a symbol, as it is written by hand: nothing for 1, a minus for -1,
  // the number and a thin space otherwise.
  kit.coef = function (x, lang) {
    if (Math.abs(x - 1) < 1e-12) return '';
    if (Math.abs(x + 1) < 1e-12) return '-';
    return kit.n(x, lang) + '\\,';
  };
})();
