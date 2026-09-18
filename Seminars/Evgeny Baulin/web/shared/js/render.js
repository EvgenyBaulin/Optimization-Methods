// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Rich text: {{tokens}} from the exported data, $inline$ and $$display$$ math through KaTeX,
// **bold**, *italic* and `code`. Nothing is ever inserted as HTML.
(function () {
  'use strict';
  var SEM = window.SEM;
  var util = SEM.util;
  var fmt = SEM.fmt;
  var dom = SEM.dom;

  var render = (SEM.render = {
    errors: [],
    missingTokens: {}
  });

  var TOKEN = /\{\{\s*([A-Za-z0-9.]+)\s*\}\}/g;

  // One data value as text or as TeX.
  render.value = function (value, lang, inMath) {
    if (util.isNum(value)) return fmt.num(value, lang, inMath);
    if (typeof value === 'string') return inMath ? fmt.tex(value, lang) : value;
    if (util.isNumArray(value)) return fmt.vector(value, lang, inMath);
    if (Array.isArray(value) && value.length && value.every(util.isNumArray)) {
      return inMath ? fmt.matrix(value, lang) : value.map(function (r) { return fmt.vector(r, lang, false); }).join(' ');
    }
    return null;
  };

  render.tokens = function (text, lang, inMath) {
    return text.replace(TOKEN, function (m, path) {
      var v = util.data(path);
      var s = v === undefined || (v !== null && typeof v === 'object' && !Array.isArray(v)) ? null : render.value(v, lang, inMath);
      if (s === null) {
        render.missingTokens[path] = true;
        return '?';
      }
      return s;
    });
  };

  // Split a string into text and math segments. Tokens are resolved per segment.
  render.segments = function (text) {
    var out = [];
    var i = 0;
    var buf = '';
    while (i < text.length) {
      var ch = text.charAt(i);
      if (ch === '\\' && text.charAt(i + 1) === '$') {
        buf += '$';
        i += 2;
        continue;
      }
      if (ch === '$') {
        var display = text.charAt(i + 1) === '$';
        var open = display ? 2 : 1;
        var close = text.indexOf(display ? '$$' : '$', i + open);
        if (close < 0) {
          buf += text.slice(i);
          break;
        }
        if (buf) out.push({ kind: 'text', value: buf });
        buf = '';
        out.push({ kind: display ? 'display' : 'math', value: text.slice(i + open, close) });
        i = close + open;
        continue;
      }
      buf += ch;
      i += 1;
    }
    if (buf) out.push({ kind: 'text', value: buf });
    return out;
  };

  render.katex = function (node, tex, display) {
    if (!window.katex) {
      node.textContent = tex;
      return false;
    }
    try {
      window.katex.render(tex, node, { displayMode: !!display, throwOnError: true, strict: 'ignore', output: 'htmlAndMathml' });
      return true;
    } catch (e) {
      render.errors.push({ tex: tex, message: String(e && e.message ? e.message : e) });
      node.textContent = tex;
      node.classList.add('math-error');
      return false;
    }
  };

  var MARK = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/;

  function appendText(parent, text) {
    var parts = text.split(MARK);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!p) continue;
      if (p.length > 4 && p.slice(0, 2) === '**' && p.slice(-2) === '**') parent.appendChild(dom.el('strong', { text: p.slice(2, -2) }));
      else if (p.length > 2 && p.charAt(0) === '*' && p.slice(-1) === '*') parent.appendChild(dom.el('em', { text: p.slice(1, -1) }));
      else if (p.length > 2 && p.charAt(0) === '`' && p.slice(-1) === '`') parent.appendChild(dom.el('code', { text: p.slice(1, -1) }));
      else parent.appendChild(document.createTextNode(p));
    }
  }

  // Put punctuation that follows an inline formula inside the formula's last KaTeX box. That box is
  // `white-space: nowrap`, so the mark cannot open the next line, and the formula itself may still
  // break between its boxes - which it cannot when formula and mark share one .nowrap span.
  function glueMark(holder, mark) {
    var html = holder.querySelector('.katex-html');
    var last = null;
    for (var c = html ? html.lastElementChild : null; c && !last; c = c.previousElementSibling) {
      if (c.classList.contains('katex-base') || c.classList.contains('base')) last = c;
    }
    if (!last) return false;
    last.appendChild(dom.el('span', { class: 'math-punct', text: mark }));
    // .katex-html is aria-hidden, so the MathML branch needs the mark as well; the namespace comes
    // from the <math> element KaTeX built, never from a literal URL
    var math = holder.querySelector('.katex-mathml math');
    var semantics = math && math.firstElementChild;
    if (semantics && semantics.tagName.toLowerCase() === 'semantics') {
      var mo = document.createElementNS(math.namespaceURI, 'mo');
      mo.appendChild(document.createTextNode(mark));
      var row = semantics.firstElementChild;
      if (row && row.tagName.toLowerCase() === 'mrow') row.appendChild(mo);
      else semantics.insertBefore(mo, semantics.querySelector('annotation'));
    }
    return true;
  }

  // Render a pair (or a plain string) into node, replacing its content.
  render.rich = function (node, pair, lang) {
    var l = lang || SEM.i18n.lang;
    var text = typeof pair === 'string' ? pair : SEM.t(pair, l);
    dom.clear(node);
    var segs = render.segments(text);
    var glue = '';
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];
      if (seg.kind === 'text') {
        var t = render.tokens(seg.value, l, false);
        if (glue) t = t.slice(glue.length);
        glue = '';
        appendText(node, t);
      } else {
        var holder = dom.el('span', { class: seg.kind === 'display' ? 'math-display' : 'math-inline' });
        render.katex(holder, render.tokens(seg.value, l, true), seg.kind === 'display');
        // keep punctuation that follows inline math on the same line as the formula
        var next = segs[i + 1];
        var m = seg.kind === 'math' && next && next.kind === 'text' ? /^[.,;:!?)»]+/.exec(render.tokens(next.value, l, false)) : null;
        if (m) {
          glue = m[0];
          if (glueMark(holder, glue)) {
            node.appendChild(holder);
          } else {
            // no KaTeX box to hold the mark (KaTeX missing or the formula failed): hold both together
            var wrap = dom.el('span', { class: 'nowrap' });
            wrap.appendChild(holder);
            wrap.appendChild(document.createTextNode(glue));
            node.appendChild(wrap);
          }
        } else {
          node.appendChild(holder);
        }
      }
    }
    return node;
  };

  // Create an element whose rich content follows the language.
  render.el = function (tag, attrs, pair) {
    var node = dom.el(tag, attrs);
    SEM.i18n.bind(function () {
      render.rich(node, pair);
    });
    return node;
  };

  // Plain text of a pair with tokens resolved (for attributes and canvas labels).
  render.plain = function (pair, lang) {
    var l = lang || SEM.i18n.lang;
    var text = typeof pair === 'string' ? pair : SEM.t(pair, l);
    return render.segments(text)
      .map(function (s) {
        return s.kind === 'text' ? render.tokens(s.value, l, false) : render.tokens(s.value, l, false);
      })
      .join('');
  };

  // Every TeX fragment of a string, with tokens resolved, for the self-test.
  render.mathOf = function (text, lang) {
    return render.segments(text)
      .filter(function (s) {
        return s.kind !== 'text';
      })
      .map(function (s) {
        return { tex: render.tokens(s.value, lang, true), display: s.kind === 'display' };
      });
  };
})();
