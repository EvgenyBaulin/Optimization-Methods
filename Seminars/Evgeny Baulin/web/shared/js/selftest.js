// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// ?selftest=1: the seminar's numerics reproduce the exported data (its own checks in js/seminar.js),
// every answer spec accepts its reference value, every content token resolves, both languages
// have every string (the course-wide and the seminar strings alike), and KaTeX renders every formula.
(function () {
  'use strict';
  var SEM = window.SEM;
  var dom = SEM.dom;
  var render = SEM.render;
  var el = dom.el;

  var T = (SEM.selftest = {});

  function close(a, b, tol) {
    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) if (!close(a[i], b[i], tol)) return false;
      return true;
    }
    if (typeof a === 'boolean' || typeof b === 'boolean' || typeof a === 'string' || typeof b === 'string') return a === b;
    return typeof a === 'number' && typeof b === 'number' && isFinite(a) && isFinite(b) && Math.abs(a - b) <= tol;
  }

  T.close = close;

  // The seminar's own checks (SEM.seminar.dataChecks in js/seminar.js): its numerics against the exported data.
  // check(group, name, computed, expected, tol) records one result; a missing expected value fails.
  T.dataChecks = function (results) {
    function check(group, name, computed, expected, tol) {
      results.push({ group: group, name: name, ok: expected !== undefined && close(computed, expected, tol === undefined ? 1e-9 : tol) });
    }
    if (SEM.seminar && typeof SEM.seminar.dataChecks === 'function') SEM.seminar.dataChecks(results, check);
  };

  // Every answer spec in the data accepts its own reference value. It runs where the answer checker
  // is complete: the problems engine and the math.js evaluator are loaded. The handouts load neither
  // and skip it; on the main page, which takes the answers, a missing checker is a failure.
  T.answerChecks = function (results) {
    if (!SEM.problems || !SEM.problems.evaluator()) {
      if (SEM.state.page === 'main') results.push({ group: 'answers', name: 'the problems engine and the math.js evaluator are loaded', ok: false });
      return;
    }
    var specs = [];
    (function walk(node, path) {
      if (!node || typeof node !== 'object') return;
      if (!Array.isArray(node) && typeof node.type === 'string' && Object.prototype.hasOwnProperty.call(node, 'value')) {
        specs.push([path, node]);
        return;
      }
      Object.keys(node).forEach(function (key) {
        if (key !== 'code') walk(node[key], path ? path + '.' + key : key);
      });
    })(SEM.data, '');
    specs.forEach(function (entry) {
      var res = SEM.problems.checkAnswer(entry[1], SEM.problems.referenceInput(entry[1]));
      results.push({ group: 'answers', name: entry[0], ok: !!res.ok });
    });
  };

  function walkPairs(node, path, out) {
    if (!node || typeof node !== 'object') return out;
    if (!Array.isArray(node) && typeof node.en === 'string' && typeof node.ru === 'string') {
      out.push([path, node]);
      // a pair may carry more keys, as a glossary item carries its note: those are walked too
      Object.keys(node).forEach(function (key) {
        if (key !== 'en' && key !== 'ru') walkPairs(node[key], path ? path + '.' + key : key, out);
      });
      return out;
    }
    Object.keys(node).forEach(function (key) {
      walkPairs(node[key], path ? path + '.' + key : key, out);
    });
    return out;
  }

  T.contentChecks = function (results) {
    var pairs = walkPairs(SEM.content, '', []);
    var missingLang = [];
    var tokenMissing = {};
    var katexErrors = [];
    pairs.forEach(function (entry) {
      ['en', 'ru'].forEach(function (lang) {
        var s = entry[1][lang];
        if (!s || !s.trim()) missingLang.push(entry[0] + '.' + lang);
        render.missingTokens = {};
        render.segments(s).forEach(function (seg) {
          var tex = render.tokens(seg.value, lang, seg.kind !== 'text');
          if (seg.kind !== 'text' && window.katex) {
            try {
              window.katex.renderToString(tex, { displayMode: seg.kind === 'display', throwOnError: true, strict: 'ignore' });
            } catch (e) {
              katexErrors.push(entry[0] + '.' + lang + ': ' + String(e.message || e).slice(0, 80));
            }
          }
        });
        Object.keys(render.missingTokens).forEach(function (k) {
          tokenMissing[k] = true;
        });
      });
    });
    results.push({ group: 'content', name: 'strings checked: ' + pairs.length, ok: pairs.length > 0 });
    results.push({ group: 'content', name: 'every token resolves', ok: Object.keys(tokenMissing).length === 0, detail: Object.keys(tokenMissing).join(', ') });
    results.push({ group: 'content', name: 'both languages have every string', ok: missingLang.length === 0, detail: missingLang.join(', ') });
    results.push({ group: 'content', name: 'KaTeX renders every formula', ok: katexErrors.length === 0, detail: katexErrors.join('; ') });
    render.missingTokens = {};
  };

  // Render the page in the other language and back, and report missing UI strings and render errors.
  T.languageChecks = function (results) {
    var original = SEM.i18n.lang;
    var other = original === 'en' ? 'ru' : 'en';
    render.errors.length = 0;
    Object.keys(SEM.i18n.missing).forEach(function (k) {
      delete SEM.i18n.missing[k];
    });
    SEM.i18n.set(other, false);
    var missingOther = Object.keys(SEM.i18n.missing);
    var errorsOther = render.errors.length;
    SEM.i18n.set(original, false);
    var missingBoth = Object.keys(SEM.i18n.missing);
    results.push({ group: 'languages', name: 'no missing strings in ' + other + ' and ' + original, ok: missingOther.length === 0 && missingBoth.length === 0, detail: missingBoth.join(', ') });
    results.push({ group: 'languages', name: 'no KaTeX errors while rendering both languages', ok: errorsOther === 0 && render.errors.length === 0, detail: render.errors.map(function (e) { return e.tex; }).join('; ') });
  };

  T.run = function (slot) {
    var results = [];
    try {
      T.dataChecks(results);
    } catch (e) {
      results.push({ group: 'data', name: 'exception: ' + String(e.message || e), ok: false });
    }
    try {
      T.answerChecks(results);
    } catch (e) {
      results.push({ group: 'answers', name: 'exception: ' + String(e.message || e), ok: false });
    }
    try {
      T.contentChecks(results);
      T.languageChecks(results);
    } catch (e) {
      results.push({ group: 'content', name: 'exception: ' + String(e.message || e), ok: false });
    }
    T.results = results;
    var passed = results.filter(function (r) { return r.ok; }).length;
    var failed = results.filter(function (r) { return !r.ok; });
    var box = el('section', { class: 'selftest ' + (failed.length ? 'is-bad' : 'is-ok'), 'aria-live': 'polite' });
    var title = el('h2', { class: 'selftest-title' });
    var summary = el('p', { class: 'selftest-summary' });
    SEM.i18n.bind(function () {
      title.textContent = SEM.tu('selftest.title');
      summary.textContent = SEM.tuf(failed.length ? 'selftest.failed' : 'selftest.passed', { passed: passed, total: results.length });
    });
    dom.append(box, [title, summary]);
    var groups = {};
    results.forEach(function (r) {
      groups[r.group] = groups[r.group] || { ok: 0, n: 0 };
      groups[r.group].n += 1;
      if (r.ok) groups[r.group].ok += 1;
    });
    var ul = el('ul', { class: 'selftest-groups' });
    Object.keys(groups).forEach(function (g) {
      var li = el('li');
      SEM.i18n.bind(function () {
        li.textContent = SEM.tuf('selftest.group', { name: SEM.tu('selftest.groups.' + g), ok: groups[g].ok, n: groups[g].n });
      });
      ul.appendChild(li);
    });
    box.appendChild(ul);
    if (failed.length) {
      // failing check identifiers are technical keys, shown as code
      var fl = el('ul', { class: 'selftest-failures' });
      failed.forEach(function (r) {
        fl.appendChild(el('li', null, el('code', { text: r.group + ' / ' + r.name + (r.detail ? ' / ' + r.detail : '') })));
      });
      box.appendChild(fl);
    }
    dom.clear(slot);
    slot.appendChild(box);
    document.documentElement.setAttribute('data-selftest', failed.length ? 'failed' : 'passed');
    return results;
  };
})();
