// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Page assembly: the shared header, controls and footer (of the seminar pages and of the landing page),
// the block templates of main.html (each seminar composes its page in its own js/seminar.js), present and
// instructor modes, the overview and shortcut dialogs, and the keyboard.
(function () {
  'use strict';
  var SEM = window.SEM;
  var dom = SEM.dom;
  var util = SEM.util;
  var render = SEM.render;
  var el = dom.el;
  var root = document.documentElement;

  var app = (SEM.app = {});

  // The block ids of main.html in order, as the seminar lists them in SEM.seminar.blocks.
  function blockList() {
    return (SEM.seminar && SEM.seminar.blocks) || [];
  }
  // The problem ids of each block, recorded while the blocks are built: {A: {board: ['A1'], students: ['A2', 'A3']}}.
  var problemIds = {};

  function text(tag, attrs, path) {
    var node = el(tag, attrs);
    SEM.i18n.bind(function () {
      node.textContent = SEM.tu(path);
    });
    return node;
  }
  function rich(tag, attrs, pair) {
    return render.el(tag, attrs, pair);
  }
  // startPath, when given, adds the minute of the session the block starts at
  function planned(path, startPath) {
    var node = el('span', { class: 'planned-time' });
    SEM.i18n.bind(function () {
      var start = startPath ? util.data(startPath) : null;
      node.textContent = start
        ? SEM.tuf('blocks.plannedFrom', { time: util.data(path) || '', start: start })
        : SEM.tuf('blocks.planned', { time: util.data(path) || '' });
    });
    return node;
  }

  /* ------------------------------------------------------------------ theme */

  app.setTheme = function (theme, persist) {
    if (theme !== 'light' && theme !== 'dark') return;
    root.setAttribute('data-theme', theme);
    if (persist) SEM.store.set('om.theme', theme);
    SEM.emit('theme', theme);
  };
  app.toggleTheme = function () {
    app.setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  };
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (ev) {
      if (!SEM.boot.themeOverride && !SEM.store.get('om.theme')) app.setTheme(ev.matches ? 'dark' : 'light', false);
    });
  } catch (e) {
    /* older browsers: the theme simply stays */
  }

  /* ------------------------------------------------------------------ modes */

  function setMode(name, on) {
    root.classList.toggle('is-' + name, !!on);
    SEM.state.set('mode.' + name, !!on);
    SEM.emit('mode', name);
  }
  app.instructor = function (on) {
    setMode('instructor', on === undefined ? !root.classList.contains('is-instructor') : on);
  };
  app.present = function (on) {
    var next = on === undefined ? !root.classList.contains('is-present') : on;
    setMode('present', next);
    try {
      if (next && root.requestFullscreen && !document.fullscreenElement) root.requestFullscreen().catch(function () {});
      if (!next && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    } catch (e) {
      /* full screen is optional */
    }
    if (next) app.goBlock(app.current(), true);
    SEM.redrawAll();
  };

  /* ------------------------------------------------------------------ dialogs */

  var lastFocus = null;
  // Everything else in <body> is inert while a dialog is open, so that Tab stays inside it.
  var inerted = [];
  function dialog(id, titlePath) {
    var box = el('div', { class: 'dialog', id: id, role: 'dialog', 'aria-modal': 'true', hidden: true });
    var inner = el('div', { class: 'dialog-inner' });
    var head = el('div', { class: 'dialog-head' });
    var h = text('h2', { id: id + '-title' }, titlePath);
    box.setAttribute('aria-labelledby', id + '-title');
    var closeBtn = text('button', { type: 'button', class: 'btn btn-quiet' }, 'controls.close');
    closeBtn.addEventListener('click', function () {
      app.closeDialogs();
    });
    dom.append(head, [h, closeBtn]);
    var body = el('div', { class: 'dialog-body' });
    dom.append(inner, [head, body]);
    box.appendChild(inner);
    box.addEventListener('click', function (ev) {
      if (ev.target === box) app.closeDialogs();
    });
    document.body.appendChild(box);
    return { box: box, body: body, close: closeBtn };
  }
  app.openDialog = function (id) {
    var box = document.getElementById(id);
    if (!box) return;
    var wasOpen = !box.hidden;
    app.closeDialogs();
    if (wasOpen) return;
    lastFocus = document.activeElement;
    box.hidden = false;
    inerted = dom.qsa('body > *').filter(function (n) {
      return n !== box && !n.inert;
    });
    inerted.forEach(function (n) {
      n.inert = true;
    });
    var btn = box.querySelector('button');
    if (btn) btn.focus();
  };
  app.closeDialogs = function () {
    var any = false;
    dom.qsa('.dialog').forEach(function (d) {
      if (!d.hidden) any = true;
      d.hidden = true;
    });
    inerted.forEach(function (n) {
      n.inert = false;
    });
    inerted = [];
    if (any && lastFocus && lastFocus.focus) lastFocus.focus();
    return any;
  };

  function buildShortcuts() {
    var d = dialog('shortcuts', 'controls.shortcuts');
    var table = el('table', { class: 'shortcut-table' });
    var body = el('tbody');
    var rows = (SEM.content.seminar && SEM.content.seminar.shortcuts) || (SEM.content.ui && SEM.content.ui.shortcuts) || [];
    rows.filter(function (row) {
      return !row.pages || row.pages.indexOf(SEM.state.page) >= 0;
    }).forEach(function (row) {
      var tr = el('tr');
      var keys = el('td', { class: 'keys' });
      row.keys.forEach(function (k, i) {
        if (i) keys.appendChild(document.createTextNode(' '));
        keys.appendChild(el('kbd', { text: k }));
      });
      tr.appendChild(keys);
      tr.appendChild(rich('td', null, row.action));
      body.appendChild(tr);
    });
    table.appendChild(body);
    d.body.appendChild(table);
  }

  // The statements of the problems: one column per block that has problems, in the order of the blocks.
  function overviewGrid(parent) {
    var grid = el('div', { class: 'overview-grid' });
    blockList().forEach(function (b) {
      var ids = problemIds[b];
      if (!ids) return;
      var col = el('section', { class: 'overview-col' });
      col.appendChild(rich('h3', null, SEM.content.main.blocks[b].title));
      ids.board.concat(ids.students).forEach(function (pid) {
        var prob = SEM.content.problems[pid];
        var item = el('div', { class: 'overview-item ' + (prob.who === 'board' ? 'is-board' : 'is-students') });
        var head = el('p', { class: 'overview-head' });
        dom.append(head, [el('strong', { text: pid }), ' ', text('span', { class: 'problem-who' }, prob.who === 'board' ? 'problem.board' : 'problem.students')]);
        item.appendChild(head);
        item.appendChild(rich('div', { class: 'overview-statement' }, prob.statement));
        col.appendChild(item);
      });
      grid.appendChild(col);
    });
    parent.appendChild(grid);
    return grid;
  }

  // The seminar may put its own text around the grid (SEM.seminar.buildOverview).
  function buildOverview() {
    var d = dialog('overview', 'blocks.overviewTitle');
    if (SEM.seminar && SEM.seminar.buildOverview) SEM.seminar.buildOverview(d.body, app);
    else overviewGrid(d.body);
  }

  /* ------------------------------------------------------------------ chrome */

  // Header, controls and footer shared by the three pages of a seminar and the landing page (page 'home').
  app.chrome = function (page) {
    var header = el('header', { class: 'site-header' });
    var brand = el('div', { class: 'brand' });
    var h1 = el('h1', { class: 'brand-title' });
    if (page === 'home') {
      brand.appendChild(text('p', { class: 'brand-course' }, 'meta.institution'));
      h1.appendChild(text('span', { class: 'brand-name' }, 'meta.course'));
      brand.appendChild(h1);
    } else {
      brand.appendChild(text('p', { class: 'brand-course' }, 'meta.course'));
      dom.append(h1, [text('span', { class: 'brand-label' }, 'meta.seminarLabel'), ' ', text('span', { class: 'brand-name' }, 'meta.seminarTitle')]);
      brand.appendChild(h1);
    }
    if (page !== 'main') brand.appendChild(text('p', { class: 'brand-page' }, 'meta.pageName.' + page));
    var byline = el('div', { class: 'byline' });
    byline.appendChild(text('p', null, 'meta.lecturerCredit'));
    byline.appendChild(text('p', null, 'meta.authorCredit'));
    brand.appendChild(byline);
    header.appendChild(brand);

    var bar = el('div', { class: 'toolbar', role: 'toolbar' });
    SEM.i18n.bind(function () {
      bar.setAttribute('aria-label', SEM.tu(page === 'home' ? 'controls.toolbarHome' : 'controls.toolbar'));
    });
    var nav = el('nav', { class: 'toolbar-nav' });
    SEM.i18n.bind(function () {
      nav.setAttribute('aria-label', SEM.tu('controls.navigation'));
    });
    if (page === 'main') {
      blockList().forEach(function (b) {
        var a = el('a', { href: '#block-' + b, class: 'nav-link', dataset: { nav: b } });
        SEM.i18n.bind(function () {
          a.textContent = SEM.t(SEM.content.main.blocks[b].short);
        });
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          app.goBlock(b, true);
        });
        nav.appendChild(a);
      });
    } else if (page !== 'home') {
      nav.appendChild(text('a', { href: 'main.html', class: 'nav-link' }, 'controls.toSeminar'));
      if (page !== 'theory') nav.appendChild(text('a', { href: 'theory.html', class: 'nav-link' }, 'controls.toTheory'));
      if (page !== 'cheatsheet') nav.appendChild(text('a', { href: 'cheatsheet.html', class: 'nav-link' }, 'controls.toCheatsheet'));
    }
    // the landing page has no page links: the topics are in the sidebar
    if (page !== 'home') bar.appendChild(nav);

    var tools = el('div', { class: 'toolbar-tools' });
    function tool(path, key, onClick, cls) {
      var b = el('button', { type: 'button', class: 'btn tool ' + (cls || '') });
      var label = el('span', { class: 'tool-label' });
      SEM.i18n.bind(function () {
        label.textContent = SEM.tu(path);
        b.setAttribute('aria-keyshortcuts', key);
        b.title = SEM.tu(path) + ' (' + key + ')';
      });
      b.appendChild(label);
      b.addEventListener('click', onClick);
      tools.appendChild(b);
      return b;
    }
    if (page === 'main') {
      var timer = el('div', { class: 'timer', role: 'timer' });
      var minus = el('button', { type: 'button', class: 'btn tool timer-step', text: '−1' });
      var display = el('button', { type: 'button', class: 'btn tool timer-display' });
      var plus = el('button', { type: 'button', class: 'btn tool timer-step', text: '+1' });
      var reset = el('button', { type: 'button', class: 'btn tool timer-reset' });
      SEM.i18n.bind(function () {
        minus.setAttribute('aria-label', SEM.tu('controls.timerMinus'));
        plus.setAttribute('aria-label', SEM.tu('controls.timerPlus'));
        reset.textContent = '↺';
        reset.setAttribute('aria-label', SEM.tu('controls.timerReset'));
        reset.title = SEM.tu('controls.timerReset') + ' (R)';
        display.title = SEM.tu('controls.timerToggle') + ' (T)';
        updateTimer();
      });
      minus.addEventListener('click', function () { SEM.timer.adjust(-1); });
      plus.addEventListener('click', function () { SEM.timer.adjust(1); });
      display.addEventListener('click', function () { SEM.timer.toggle(); });
      reset.addEventListener('click', function () { SEM.timer.reset(); });
      dom.append(timer, [minus, display, plus, reset]);
      tools.appendChild(timer);
      function updateTimer() {
        var running = SEM.timer.running();
        var ended = SEM.timer.ended();
        display.textContent = util.isNum(SEM.timer.remaining()) ? SEM.fmt.clock(Math.ceil(SEM.timer.remaining())) : '';
        display.setAttribute('aria-label', SEM.tu(running ? 'controls.timerPause' : 'controls.timerStart') + ', ' + display.textContent);
        timer.classList.toggle('is-running', running);
        timer.classList.toggle('is-ended', ended);
        root.classList.toggle('timer-active', running || ended);
      }
      SEM.timer.onChange(updateTimer);
      tool('controls.overview', 'O', function () { app.openDialog('overview'); });
    }
    tool('controls.language', 'L', function () { SEM.i18n.toggle(); }, 'tool-lang');
    tool('controls.theme', 'D', app.toggleTheme);
    if (page === 'main') {
      tool('controls.present', 'F', function () { app.present(); }, 'tool-present');
      tool('controls.instructor', 'I', function () { app.instructor(); }, 'tool-instructor');
    } else if (page !== 'home') {
      tool('controls.print', 'P', function () { window.print(); });
    }
    var keysBtn = tool('controls.shortcuts', '?', function () { app.openDialog('shortcuts'); }, 'tool-keys');
    SEM.i18n.bind(function () {
      keysBtn.firstChild.textContent = '?';
      keysBtn.setAttribute('aria-label', SEM.tu('controls.shortcuts'));
    });
    bar.appendChild(tools);

    var badge = text('div', { class: 'instructor-badge', 'aria-live': 'polite' }, 'controls.instructorOn');
    tools.insertBefore(badge, tools.firstChild);

    var footer = el('footer', { class: 'site-footer' });
    var fl = el('div', { class: 'footer-lines' });
    var author = el('p');
    var tg = el('a', { href: 'https://t.me/tarakan_tuc', rel: 'noopener', target: '_blank' });
    SEM.i18n.bind(function () {
      tg.textContent = SEM.tu('meta.telegram');
    });
    dom.append(author, [text('span', null, 'meta.author'), el('br'), tg]);
    fl.appendChild(author);
    var course = el('p');
    dom.append(course, [text('span', null, 'meta.course'), el('br'), text('span', null, 'meta.institution'), el('br'), text('span', null, 'meta.year')]);
    fl.appendChild(course);
    var lic = el('p');
    dom.append(lic, [text('span', null, 'meta.license'), el('br'), text('span', null, 'meta.copyright')]);
    fl.appendChild(lic);
    footer.appendChild(fl);

    return { header: header, bar: bar, footer: footer };
  };

  // --toolbar-h on <html>: the height of the toolbar while it stays on top of the page, 0 where it scrolls
  // away with the page (narrow screens). Scroll margins and the steps that scroll into view keep clear of it.
  function trackToolbar(bar) {
    var last = -1;
    var measure = function () {
      var h = window.getComputedStyle(bar).position === 'sticky' ? Math.ceil(bar.getBoundingClientRect().height) : 0;
      if (h === last) return;
      last = h;
      root.style.setProperty('--toolbar-h', h + 'px');
    };
    measure();
    if (typeof window.ResizeObserver === 'function') new ResizeObserver(measure).observe(bar);
    else window.addEventListener('resize', measure);
  }

  // The course sidebar (course-nav.js) with its toggle in the toolbar, and the toolbar height.
  function mountBar(bar) {
    if (SEM.courseNav && SEM.courseNav.mount) SEM.courseNav.mount(bar);
    trackToolbar(bar);
  }

  /* ------------------------------------------------------------------ blocks of main.html */

  function sectionHead(block) {
    var head = el('header', { class: 'block-head' });
    head.appendChild(rich('h2', { class: 'block-title' }, SEM.content.main.blocks[block].title));
    head.appendChild(planned('timeline.' + block + '.total', 'timeline.start.' + block));
    return head;
  }

  function sub(parent, titlePath, timePath, titlePair) {
    var box = el('div', { class: 'subblock' });
    var h = titlePair ? rich('h3', { class: 'subblock-title' }, titlePair) : text('h3', { class: 'subblock-title' }, titlePath);
    var head = el('div', { class: 'subblock-head' });
    head.appendChild(h);
    if (timePath) head.appendChild(planned(timePath));
    box.appendChild(head);
    parent.appendChild(box);
    return box;
  }

  function recap(parent, block) {
    var box = sub(parent, 'blocks.recap', 'timeline.' + block + '.recap');
    var ul = el('ul', { class: 'recap' });
    SEM.content.main.blocks[block].recap.forEach(function (item) {
      ul.appendChild(rich('li', null, item));
    });
    box.appendChild(ul);
  }

  // The problems of a block. spec: {board: ['A1'], students: ['A2', 'A3'], ownTime, ownNote, reviewNote}.
  // The worked examples on the board, the problems solved alone with their timer and the review of their
  // answers, then the common mistakes. ownTime names the time keys of the "On your own" subblock and
  // defaults to 'P' + the numbers of the student problems; ownNote is its note; reviewNote, when given,
  // is an extra instructor line under the head of the review.
  function problemsGroup(parent, block, spec) {
    var board = (spec && spec.board) || [];
    var students = (spec && spec.students) || [];
    var ownTime = (spec && spec.ownTime) || 'P' + students.map(function (id) { return id.slice(1); }).join('');
    var ownNote = (spec && spec.ownNote) || 'blocks.ownNote';
    problemIds[block] = { board: board.slice(), students: students.slice() };
    if (board.length) {
      var P1 = sub(parent, 'blocks.worked', 'timeline.' + block + '.P1');
      board.forEach(function (pid) {
        SEM.problems.card(P1, pid, SEM.content.problems[pid], { kind: 'board' });
      });
    }

    if (students.length) {
      var own = sub(parent, 'blocks.own', 'timeline.' + block + '.' + ownTime);
      var ownBar = el('div', { class: 'own-bar' });
      var start = el('button', { type: 'button', class: 'btn btn-primary' });
      SEM.i18n.bind(function () {
        start.textContent = SEM.tuf('blocks.startTimer', { time: util.data('timeline.' + block + '.' + ownTime) });
      });
      start.addEventListener('click', function () {
        SEM.timer.setDuration(util.data('timeline.sec.' + block + '.' + ownTime));
        SEM.timer.toggle();
      });
      ownBar.appendChild(start);
      ownBar.appendChild(text('p', { class: 'own-note' }, ownNote));
      own.appendChild(ownBar);
      var grid = el('div', { class: 'problem-pair' });
      own.appendChild(grid);
      students.forEach(function (pid) {
        SEM.problems.card(grid, pid, SEM.content.problems[pid], { kind: 'students' });
      });

      var review = sub(parent, 'blocks.review', 'timeline.' + block + '.review');
      if (spec && spec.reviewNote) {
        var note = el('p', { class: 'cut-note instructor-only' });
        SEM.i18n.bind(function () {
          note.textContent = SEM.tu(spec.reviewNote);
        });
        review.appendChild(note);
      }
      var cut = el('p', { class: 'cut-note instructor-only' });
      var cutPath = 'timeline.cut.' + block + 'review';
      // a review that is planned but never cut carries "0:00" and needs no note
      if (util.data(cutPath) && util.data(cutPath) !== '0:00') {
        SEM.i18n.bind(function () {
          cut.textContent = SEM.tuf('blocks.cutReview', { time: util.data(cutPath) });
        });
        review.appendChild(cut);
      }
      var answers = el('div', { class: 'review-answers' });
      students.forEach(function (pid) {
        var line = el('p', { class: 'review-line' });
        dom.append(line, [el('strong', { text: pid }), ' ', render.el('span', null, SEM.content.problems[pid].answerText)]);
        answers.appendChild(line);
      });
      var reveals = SEM.state.section('reveals');
      var key = 'review.' + block;
      var toggle = el('button', { type: 'button', class: 'btn btn-quiet' });
      var sync = function () {
        var open = !!reveals[key] || SEM.param('reveal') === 'all';
        answers.hidden = !open;
        toggle.textContent = SEM.tu(open ? 'blocks.hideAnswers' : 'blocks.showAnswers');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
      toggle.addEventListener('click', function () {
        reveals[key] = !reveals[key];
        SEM.state.touch();
        sync();
      });
      SEM.i18n.bind(sync);
      dom.append(review, [toggle, answers]);
    }

    var blockMistakes = SEM.content.main.mistakes && SEM.content.main.mistakes[block];
    if (blockMistakes) {
      var mistakes = sub(parent, 'blocks.mistakes', null);
      var ul = el('ul', { class: 'mistake-list' });
      blockMistakes.forEach(function (m) {
        ul.appendChild(rich('li', null, m));
      });
      mistakes.appendChild(ul);
    }
  }

  function blockSection(block) {
    var sec = el('section', { class: 'block', id: 'block-' + block, dataset: { block: block, anchor: block } });
    sec.appendChild(sectionHead(block));
    return sec;
  }

  // A problem block. spec: {board: ['A1'], students: ['A2', 'A3'], widgets: ['sets', ...], code: key or [keys]}:
  // the recap, the widgets to explore, the problems, and the code of the block.
  function buildProblemBlock(main, block, spec) {
    spec = spec || {};
    var B = SEM.content.main.blocks[block];
    var sec = blockSection(block);
    if (B.recap) recap(sec, block);
    if (spec.widgets && spec.widgets.length) {
      var explore = sub(sec, 'blocks.explore', null);
      explore.appendChild(text('p', { class: 'cut-note instructor-only' }, 'blocks.exploreNote'));
      spec.widgets.forEach(function (w) {
        SEM.widgets[w](explore);
      });
    }
    problemsGroup(sec, block, spec);
    if (spec.code && B.code && SEM.kit) {
      SEM.kit.code(sec, spec.code, B.code.title, B.code.text);
      sec.appendChild(text('p', { class: 'cut-note instructor-only' }, 'blocks.codeNote'));
    }
    main.appendChild(sec);
    return sec;
  }

  // The wrap-up block (id 'E' unless given): summary, cheat sheet links, exit ticket, home practice, bridge.
  function buildWrap(main, block) {
    var id = block || 'E';
    var E = SEM.content.main.blocks[id];
    var sec = blockSection(id);
    var sum = sub(sec, null, 'timeline.' + id + '.summary', E.summary.title);
    var ol = el('ol', { class: 'summary' });
    E.summary.items.forEach(function (it) {
      ol.appendChild(rich('li', null, it));
    });
    sum.appendChild(ol);

    var cs = sub(sec, null, 'timeline.' + id + '.cheatsheet', E.cheatsheet.title);
    cs.appendChild(rich('p', null, E.cheatsheet.text));
    var links = el('p', { class: 'link-row' });
    E.cheatsheet.links.forEach(function (l) {
      var a = el('a', { href: l.href, class: 'btn' });
      SEM.i18n.bind(function () {
        a.textContent = SEM.t(l.label);
      });
      links.appendChild(a);
    });
    cs.appendChild(links);

    var ex = sub(sec, null, 'timeline.' + id + '.exit', E.exit.title);
    ex.appendChild(rich('p', null, E.exit.text));
    var list = el('ol', { class: 'exit-list' });
    var answers = [];
    E.exit.items.forEach(function (it) {
      var li = el('li', { class: 'exit-item' });
      li.appendChild(rich('p', { class: 'exit-q' }, it.question));
      var a = rich('p', { class: 'exit-a' }, it.answer);
      answers.push(a);
      li.appendChild(a);
      list.appendChild(li);
    });
    var reveals = SEM.state.section('reveals');
    var exitBtn = el('button', { type: 'button', class: 'btn' });
    var syncExit = function () {
      var open = !!reveals.exit || SEM.param('reveal') === 'all';
      answers.forEach(function (a) {
        a.hidden = !open;
      });
      exitBtn.textContent = SEM.tu(open ? 'blocks.hideAnswers' : 'blocks.showAnswers');
      exitBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    exitBtn.addEventListener('click', function () {
      reveals.exit = !reveals.exit;
      SEM.state.touch();
      syncExit();
    });
    SEM.i18n.bind(syncExit);
    dom.append(ex, [list, exitBtn]);

    var home = sub(sec, null, 'timeline.' + id + '.home', E.home.title);
    home.appendChild(rich('p', null, E.home.text));
    var homeGrid = el('div', { class: 'home-list' });
    E.home.items.forEach(function (item) {
      SEM.problems.card(homeGrid, item.id, item, { kind: 'home' });
    });
    home.appendChild(homeGrid);

    var br = sub(sec, null, 'timeline.' + id + '.bridge', E.bridge.title);
    var ul = el('ul', { class: 'bridge' });
    E.bridge.items.forEach(function (it) {
      ul.appendChild(rich('li', null, it));
    });
    br.appendChild(ul);
    var buffer = el('p', { class: 'cut-note instructor-only' });
    SEM.i18n.bind(function () {
      buffer.textContent = SEM.tuf('blocks.buffer', { time: util.data('timeline.buffer'), total: util.data('timeline.total') });
    });
    sec.appendChild(buffer);
    main.appendChild(sec);
    return sec;
  }

  // The templates, for the seminar's js/seminar.js.
  app.text = text;
  app.rich = rich;
  app.planned = planned;
  app.dialog = dialog;
  app.overviewGrid = overviewGrid;
  app.sectionHead = sectionHead;
  app.sub = sub;
  app.recap = recap;
  app.problemsGroup = problemsGroup;
  app.blockSection = blockSection;
  app.buildProblemBlock = buildProblemBlock;
  app.buildWrap = buildWrap;

  /* ------------------------------------------------------------------ navigation */

  app.current = function () {
    var list = blockList();
    var b = SEM.state.get('block', list[0]);
    return list.indexOf(b) >= 0 ? b : list[0];
  };

  app.goBlock = function (block, scroll) {
    if (blockList().indexOf(block) < 0) return;
    SEM.state.set('block', block);
    dom.qsa('.block').forEach(function (s) {
      s.classList.toggle('is-current', s.dataset.block === block);
    });
    dom.qsa('.nav-link[data-nav]').forEach(function (a) {
      if (a.dataset.nav === block) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    if (root.classList.contains('is-present')) {
      window.scrollTo(0, 0);
      SEM.redrawAll();
    } else if (scroll) {
      var target = document.getElementById('block-' + block);
      if (target) target.scrollIntoView({ block: 'start', behavior: util.reducedMotion() ? 'auto' : 'smooth' });
    }
  };

  app.step = function (dir) {
    var list = blockList();
    var i = list.indexOf(app.current()) + dir;
    if (i < 0 || i >= list.length) return;
    app.goBlock(list[i], true);
  };

  function defaultStepper() {
    var P = SEM.problems;
    if (P.active && document.body.contains(P.active.root) && P.active.root.offsetParent !== null) return P.active;
    var candidates = Object.keys(P.steppers).map(function (k) { return P.steppers[k]; }).filter(function (s) {
      return s.root.offsetParent !== null;
    });
    var cur = app.current();
    var boards = (problemIds[cur] && problemIds[cur].board) || [];
    var inBlock = candidates.filter(function (s) {
      return boards.indexOf(s.id) >= 0;
    });
    if (root.classList.contains('is-present') && inBlock.length) return inBlock[0];
    var mid = window.innerHeight / 2;
    var best = null;
    var bestD = Infinity;
    candidates.forEach(function (s) {
      var r = s.root.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var d = Math.abs((r.top + r.bottom) / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    });
    return best || inBlock[0] || null;
  }

  function onKey(ev) {
    if (ev.defaultPrevented || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (dom.isTyping(ev.target)) return;
    var key = ev.key;
    var drawer = SEM.courseNav && SEM.courseNav.isOpen();
    if (key === 'Escape') {
      if (drawer) SEM.courseNav.close();
      else if (!app.closeDialogs()) return;
      ev.preventDefault();
      return;
    }
    // while the topics drawer is open, M closes it and the other keys do nothing
    if (drawer) {
      if (key === 'm' || key === 'M') {
        SEM.courseNav.close();
        ev.preventDefault();
      }
      return;
    }
    var page = SEM.state.page;
    var handled = true;
    var tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : '';
    // the focused element uses the key itself: a checkbox, a radio or a slider takes Space and the
    // arrows, and a button, a summary or a link is activated by Space
    var ownsKey = dom.isFormControl(ev.target) || (key === ' ' && (tag === 'button' || tag === 'summary' || tag === 'a'));
    switch (key) {
      case 'ArrowRight':
      case ' ':
        if (page !== 'main' || ownsKey) {
          handled = false;
          break;
        }
        var s = defaultStepper();
        if (s) {
          s.forward();
          P_active(s);
        } else handled = false;
        break;
      case 'ArrowLeft':
        if (page !== 'main' || ownsKey) {
          handled = false;
          break;
        }
        var sb = defaultStepper();
        if (sb) {
          sb.back();
          P_active(sb);
        } else handled = false;
        break;
      case 'n': case 'N':
        if (page === 'main') app.step(1); else handled = false;
        break;
      case 'b': case 'B':
        if (page === 'main') app.step(-1); else handled = false;
        break;
      case 'o': case 'O':
        if (page === 'main') app.openDialog('overview'); else handled = false;
        break;
      case 't': case 'T':
        if (page === 'main') SEM.timer.toggle(); else handled = false;
        break;
      case 'r': case 'R':
        if (page === 'main') SEM.timer.reset(); else handled = false;
        break;
      case 'l': case 'L':
        SEM.i18n.toggle();
        break;
      case 'd': case 'D':
        app.toggleTheme();
        break;
      case 'f': case 'F':
        if (page === 'main') app.present(); else handled = false;
        break;
      case 'i': case 'I':
        if (page === 'main') app.instructor(); else handled = false;
        break;
      case 'p': case 'P':
        if (page === 'theory' || page === 'cheatsheet') window.print(); else handled = false;
        break;
      case 'm': case 'M':
        if (!SEM.courseNav || !SEM.courseNav.toggle()) handled = false;
        break;
      case '?':
        app.openDialog('shortcuts');
        break;
      default:
        handled = false;
    }
    if (handled) ev.preventDefault();
  }
  function P_active(s) {
    SEM.problems.active = s;
  }

  function trackScroll() {
    var save = util.debounce(function () {
      if (!root.classList.contains('is-present')) SEM.state.set('scroll', Math.round(window.scrollY));
    }, 200);
    window.addEventListener('scroll', function () {
      save();
      if (root.classList.contains('is-present')) return;
      var mid = window.innerHeight * 0.35;
      var current = null;
      dom.qsa('.block').forEach(function (s) {
        if (s.getBoundingClientRect().top <= mid) current = s.dataset.block;
      });
      if (current && current !== SEM.state.get('block')) {
        SEM.state.set('block', current);
        dom.qsa('.nav-link[data-nav]').forEach(function (a) {
          if (a.dataset.nav === current) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
        dom.qsa('.block').forEach(function (s) {
          s.classList.toggle('is-current', s.dataset.block === current);
        });
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ startup */

  app.startMain = function () {
    SEM.i18n.setTitle(SEM.ui('meta.pageTitle.main'));
    if (SEM.param('instructor') === '1') root.classList.add('is-instructor');
    else if (SEM.param('instructor') === '0') root.classList.remove('is-instructor');
    else root.classList.toggle('is-instructor', !!SEM.state.get('mode.instructor', false));
    if (SEM.param('present') === '1') root.classList.add('is-present');
    else if (SEM.param('present') === '0') root.classList.remove('is-present');
    else root.classList.toggle('is-present', !!SEM.state.get('mode.present', false));

    var chrome = app.chrome('main');
    var body = document.body;
    var skip = text('a', { href: '#content', class: 'skip-link' }, 'controls.skip');
    var main = el('main', { id: 'content', class: 'content' });
    dom.append(body, [skip, chrome.header, chrome.bar]);
    mountBar(chrome.bar);
    var selftestSlot = el('div', { id: 'selftest-slot' });
    main.appendChild(selftestSlot);
    body.appendChild(main);
    if (SEM.seminar && SEM.seminar.buildMain) SEM.seminar.buildMain(main, app);
    body.appendChild(chrome.footer);
    buildOverview();
    buildShortcuts();
    document.addEventListener('keydown', onKey);
    trackScroll();

    var start = SEM.param('block');
    if (start && blockList().indexOf(start) >= 0) {
      app.goBlock(start, false);
      var run = function () {
        if (!root.classList.contains('is-present')) {
          var t = document.getElementById('block-' + start);
          if (t) t.scrollIntoView({ block: 'start' });
        }
      };
      // scroll now, and again once the fonts have settled the layout
      run();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
      window.addEventListener('load', run);
    } else {
      app.goBlock(app.current(), false);
      var y = SEM.state.get('scroll', 0);
      if (y > 0 && !root.classList.contains('is-present')) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            window.scrollTo(0, y);
          });
        });
      }
    }
    if (SEM.param('selftest') === '1' && SEM.selftest) SEM.selftest.run(selftestSlot);
  };

  app.startPage = function (page, build) {
    SEM.i18n.setTitle(SEM.ui('meta.pageTitle.' + page));
    var chrome = app.chrome(page);
    var body = document.body;
    var skip = text('a', { href: '#content', class: 'skip-link' }, 'controls.skip');
    var main = el('main', { id: 'content', class: 'content content-' + page });
    var selftestSlot = el('div', { id: 'selftest-slot' });
    main.appendChild(selftestSlot);
    dom.append(body, [skip, chrome.header, chrome.bar]);
    mountBar(chrome.bar);
    body.appendChild(main);
    build(main);
    body.appendChild(chrome.footer);
    buildShortcuts();
    document.addEventListener('keydown', onKey);
    if (SEM.param('selftest') === '1' && SEM.selftest) SEM.selftest.run(selftestSlot);
  };
})();
