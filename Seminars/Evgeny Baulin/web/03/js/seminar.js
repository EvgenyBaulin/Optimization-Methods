// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 3: the composition of the seminar page (blocks 0, A-E), the problems overview, the instructor's timing
// table and notes, and the projector clock. It has no numerics of its own: this file is public, so code that
// recomputed the answers would give them away; the checks notebook and Deploy/locked-seminars/roundtrip_test.py check the numbers.
(function () {
  'use strict';
  var SEM = window.SEM;
  var util = SEM.util;
  var dom = SEM.dom;
  var el = dom.el;
  var render = SEM.render;

  function view() {
    return (SEM.access && SEM.access.view) || {};
  }

  function lockNote(parent, path) {
    parent.appendChild(render.el('p', { class: 'lock-note' }, SEM.ui(path)));
  }

  function list(tag, cls, items) {
    var node = el(tag, { class: cls });
    (items || []).forEach(function (it) {
      node.appendChild(render.el('li', null, it));
    });
    return node;
  }

  // A figure by name: from the students envelope once it is open, else the public copy in figures/ (the board
  // problems' figures; a locked part never names a figure while it is closed).
  function figure(f) {
    if (!f) return null;
    var url = (SEM.figureUrl && SEM.figureUrl(f.src)) || SEM.course.localHref('figures/' + f.src + '.svg');
    var fig = el('figure', { class: 'figure' });
    var img = el('img', { src: url });
    img.setAttribute('alt', render.plain(f.alt));
    fig.appendChild(el('div', { class: 'figure-panel' }, img));
    if (f.caption) fig.appendChild(render.el('figcaption', null, f.caption));
    return fig;
  }

  /* ------------------------------------------------------------------ the instructor's view */

  // The plan of the class with the clock time of every block: shown only to the signed-in instructor.
  function buildTiming(main, app) {
    var T = SEM.content.teacher;
    if (!T) return;
    var d = util.data;
    var box = el('section', { class: 'teacher-timing', 'aria-labelledby': 'teacher-timing-title' });
    box.appendChild(render.el('h2', { class: 'block-title', id: 'teacher-timing-title' }, (T.timing && T.timing.title) || SEM.ui('timing.title')));
    var wrap = el('div', { class: 'table-wrap' });
    var table = el('table', { class: 'data-table timing-table' });
    var head = el('tr');
    ['timing.block', 'timing.from', 'timing.length', 'timing.parts'].forEach(function (path) {
      head.appendChild(app.text('th', { scope: 'col' }, path));
    });
    table.appendChild(el('thead', null, head));
    var body = el('tbody');
    function row(label, from, length, parts) {
      var tr = el('tr');
      tr.appendChild(render.el('td', null, label));
      tr.appendChild(el('td', { text: from }));
      tr.appendChild(el('td', { text: length }));
      tr.appendChild(el('td', { text: parts }));
      body.appendChild(tr);
    }
    (d('timeline.blocks') || []).forEach(function (b) {
      var parts = d('timeline.' + b) || {};
      var text = Object.keys(parts)
        .filter(function (k) {
          return k !== 'total';
        })
        .map(function (k) {
          return SEM.tu('timing.part.' + k) + ' ' + parts[k];
        })
        .join(' · ');
      row(SEM.content.main.blocks[b].short, d('timeline.clock.' + b), parts.total, text);
    });
    row(SEM.ui('timing.buffer'), d('timeline.clock.buffer'), d('timeline.buffer'), '');
    row(SEM.ui('timing.total'), d('timeline.clock.0') + '–' + d('timeline.clock.end'), d('timeline.total'), '');
    table.appendChild(body);
    wrap.appendChild(table);
    box.appendChild(wrap);
    if (T.timing && T.timing.note) box.appendChild(render.el('p', { class: 'teacher-line' }, T.timing.note));
    main.appendChild(box);
  }

  var NOTE_PARTS = [['script', 'teacher.script'], ['board', 'teacher.board'], ['cues', 'teacher.cues'], ['say', 'teacher.say'], ['watch', 'teacher.watch']];

  function teacherNote(notes) {
    if (!notes) return null;
    var box = el('aside', { class: 'teacher-note' });
    box.appendChild(render.el('p', { class: 'teacher-label' }, SEM.ui('teacher.notes')));
    NOTE_PARTS.forEach(function (p) {
      var items = notes[p[0]];
      if (!items || !items.length) return;
      box.appendChild(render.el('p', { class: 'teacher-part' }, SEM.ui(p[1])));
      box.appendChild(list(p[0] === 'script' ? 'ol' : 'ul', 'teacher-list', items));
    });
    return box;
  }

  // The notes of every block under its heading and of every problem under its card; the figures of the
  // solutions inside the solutions, so that they open with them.
  function decorate(main) {
    var T = SEM.content.teacher;
    dom.qsa('.block', main).forEach(function (sec) {
      var note = T && T.blocks ? teacherNote(T.blocks[sec.dataset.block]) : null;
      var head = dom.qs('.block-head', sec);
      if (note && head) head.parentNode.insertBefore(note, head.nextSibling);
    });
    Object.keys(SEM.content.problems || {}).forEach(function (pid) {
      var card = document.getElementById('problem-' + pid);
      if (!card) return;
      var prob = SEM.content.problems[pid];
      var fig = prob.figure ? figure(prob.figure) : null;
      if (fig) {
        var solution = dom.qs('.solution', card);
        if (solution) solution.appendChild(fig);
      }
      var note = T && T.problems ? teacherNote(T.problems[pid]) : null;
      if (note) card.appendChild(note);
    });
  }

  /* ------------------------------------------------------------------ blocks 0, D and E */

  // 0: the chord inequality that defines convexity, then the two parabolas of mu and L.
  function buildCatchup(main, app) {
    var Z = SEM.content.main.blocks['0'] || {};
    var sec = app.blockSection('0');
    if (Z.jensen && Z.constants) {
      var j = app.sub(sec, null, 'timeline.0.jensen', Z.jensen.title);
      if (Z.jensen.intro) j.appendChild(app.rich('p', { class: 'lead' }, Z.jensen.intro));
      var ol = el('ol', { class: 'jensen-points' });
      Z.jensen.points.forEach(function (p) {
        var li = el('li', { class: 'jensen-point' });
        li.appendChild(render.el('p', { class: 'jensen-title' }, p.title));
        li.appendChild(render.el('div', { class: 'jensen-text' }, p.text));
        ol.appendChild(li);
      });
      j.appendChild(ol);
      var C = Z.constants;
      var c = app.sub(sec, null, 'timeline.0.constants', C.title);
      if (C.text) c.appendChild(app.rich('p', null, C.text));
      if (C.sandwich) c.appendChild(app.rich('div', { class: 'sandwich' }, C.sandwich));
      if (C.items) c.appendChild(list('ul', 'recap', C.items));
    } else {
      lockNote(sec, 'access.lockedBlock');
    }
    main.appendChild(sec);
  }

  // D: four demonstrations of what breaks, no student work.
  function buildBreaks(main, app) {
    var D = SEM.content.main.blocks.D || {};
    var sec = app.blockSection('D');
    if (D.demos) {
      if (D.intro) sec.appendChild(app.rich('p', { class: 'lead' }, D.intro));
      D.demos.forEach(function (demo) {
        var box = app.sub(sec, null, 'timeline.D.' + demo.id, demo.title);
        box.appendChild(render.el('div', { class: 'demo-text' }, demo.text));
        var fig = figure(demo.figure);
        if (fig) box.appendChild(fig);
        if (demo.takeaway) box.appendChild(render.el('p', { class: 'takeaway' }, demo.takeaway));
      });
    } else {
      lockNote(sec, 'access.lockedBlock');
    }
    main.appendChild(sec);
  }

  // E: three takeaways, the exit ticket and the home practice.
  function buildWrap(main, app) {
    var E = SEM.content.main.blocks.E || {};
    var sec = app.blockSection('E');

    var sumTitle = E.summary ? E.summary.title : SEM.ui('blocks.summary');
    var sum = app.sub(sec, null, 'timeline.E.summary', sumTitle);
    if (E.summary && E.summary.items) sum.appendChild(list('ol', 'summary', E.summary.items));
    else lockNote(sum, 'access.lockedBlock');
    var links = el('p', { class: 'link-row' });
    links.appendChild(app.text('a', { class: 'btn', href: SEM.course.localHref('theory/index.html') }, 'meta.pageName.theory'));
    sum.appendChild(links);

    var X = E.exit || { items: [] };
    var ex = app.sub(sec, null, 'timeline.E.exit', X.title);
    if (X.text) ex.appendChild(app.rich('p', null, X.text));
    var items = el('ol', { class: 'exit-list' });
    var answers = [];
    X.items.forEach(function (it) {
      var li = el('li', { class: 'exit-item' });
      li.appendChild(render.el('p', { class: 'exit-q' }, it.question));
      if (it.answer) {
        var a = render.el('p', { class: 'exit-a' }, it.answer);
        answers.push(a);
        li.appendChild(a);
      }
      items.appendChild(li);
    });
    ex.appendChild(items);
    if (answers.length) {
      var reveals = SEM.state.section('reveals');
      var btn = el('button', { type: 'button', class: 'btn' });
      var sync = function () {
        var open = !!reveals.exit || SEM.param('reveal') === 'all';
        answers.forEach(function (a) {
          a.hidden = !open;
        });
        btn.textContent = SEM.tu(open ? 'blocks.hideAnswers' : 'blocks.showAnswers');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
      btn.addEventListener('click', function () {
        reveals.exit = !reveals.exit;
        SEM.state.touch();
        sync();
      });
      sync();
      ex.appendChild(btn);
    } else {
      lockNote(ex, 'access.lockedReview');
    }

    var H = E.home || { items: [] };
    var home = app.sub(sec, null, 'timeline.E.home', H.title);
    if (H.text) home.appendChild(app.rich('p', null, H.text));
    var grid = el('div', { class: 'home-list' });
    H.items.forEach(function (item) {
      var card = el('article', { class: 'problem problem-home', id: 'problem-' + item.id, dataset: { problem: item.id } });
      var head = el('header', { class: 'problem-head' });
      head.appendChild(el('span', { class: 'problem-id', text: item.id }));
      head.appendChild(app.text('span', { class: 'problem-who' }, item.kind === 'code' ? 'problem.inCode' : 'problem.byHand'));
      head.appendChild(render.el('h4', { class: 'problem-title' }, item.title));
      card.appendChild(head);
      card.appendChild(render.el('div', { class: 'problem-statement' }, item.statement));
      if (item.check) card.appendChild(render.el('p', { class: 'home-check' }, item.check));
      grid.appendChild(card);
    });
    home.appendChild(grid);

    var buffer = el('p', { class: 'cut-note instructor-only' });
    buffer.textContent = SEM.tuf('blocks.buffer', { time: util.data('timeline.buffer'), total: util.data('timeline.total') });
    sec.appendChild(buffer);
    main.appendChild(sec);
  }

  function buildMain(main, app) {
    if (view().teacher) buildTiming(main, app);
    buildCatchup(main, app);
    var locked = SEM.ui('access.lockedReview');
    app.buildProblemBlock(main, 'A', { board: ['A1'], students: ['A2', 'A3'], ownTime: 'P23', reviewLocked: locked });
    app.buildProblemBlock(main, 'B', { board: ['B1'], students: ['B2', 'B3'], ownTime: 'P23', reviewLocked: locked });
    app.buildProblemBlock(main, 'C', { board: ['C1'], students: ['C2', 'C3'], ownTime: 'P23', reviewLocked: locked });
    buildBreaks(main, app);
    buildWrap(main, app);
    decorate(main);
  }

  // The overview: every statement at once, for a photograph.
  function buildOverview(body, app) {
    body.appendChild(render.el('p', { class: 'dialog-note' }, SEM.ui('blocks.overviewNote')));
    app.overviewGrid(body);
  }

  /* ------------------------------------------------------------------ the projector clock */

  // In present mode a running (or finished) timer is repeated in large type at the corner of the screen.
  var big = null;
  function bigClock() {
    if (!document.body || !SEM.timer) return;
    if (!big) {
      big = el('div', { class: 'big-timer', 'aria-hidden': 'true' });
      document.body.appendChild(big);
    }
    var running = SEM.timer.running();
    var ended = SEM.timer.ended();
    big.hidden = !(running || ended);
    big.classList.toggle('is-ended', ended);
    big.textContent = SEM.fmt.clock(Math.ceil(SEM.timer.remaining()));
  }
  if (SEM.timer && SEM.state.page === 'main') SEM.timer.onChange(bigClock);

  SEM.seminar = {
    blocks: ['0', 'A', 'B', 'C', 'D', 'E'],
    timerDefault: 'timeline.sec.A.P23',
    buildMain: buildMain,
    buildOverview: buildOverview
  };
})();
