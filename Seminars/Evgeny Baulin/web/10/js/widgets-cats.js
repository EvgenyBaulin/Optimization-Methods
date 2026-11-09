// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 10, block G: the cat sudoku. One cat in every row, column and region, no two cats touching, not even
// at a corner. The player marks cells; the solver walks the rows depth first and steps back when a row or a
// region has no cell left. The puzzles are in data/seminar10_data.js (game.puzzles): a region letter per cell,
// row by row, and the column letter of the cat in each row. Nothing here is graded.
(function () {
  'use strict';
  var SEM = window.SEM;
  var dom = SEM.dom;
  var el = dom.el;
  var render = SEM.render;
  SEM.widgets = SEM.widgets || {};

  var A = 'A'.charCodeAt(0);
  var EMPTY = 0;
  var CAT = 1;
  var CROSS = 2;
  var STEP_MS = 70;
  var running = null; // the timers of the widget on the page, cleared when the page is rebuilt

  function parse(puzzle) {
    var n = puzzle.cats.length;
    var region = [];
    for (var i = 0; i < n * n; i++) region.push(puzzle.regions.charCodeAt(i) - A);
    var cats = [];
    for (var r = 0; r < n; r++) cats.push(puzzle.cats.charCodeAt(r) - A);
    return { n: n, region: region, cats: cats };
  }

  /* ------------------------------------------------------------------ the solver */

  // A search over rows. pos[r] is the column of the cat of row r. A node places one cat; it is closed when the
  // placement leaves a later row or an empty region without a free cell, and the search steps back.
  function Search(p) {
    this.p = p;
    this.pos = [];
    this.next = [0];
    this.nodes = 0;
    this.back = 0;
    this.done = false;
    this.failed = false;
  }

  Search.prototype.free = function (r, c, pos) {
    var p = this.p;
    for (var i = 0; i < pos.length; i++) {
      if (pos[i] === c) return false;
      if (p.region[i * p.n + pos[i]] === p.region[r * p.n + c]) return false;
    }
    if (pos.length && r === pos.length && Math.abs(pos[r - 1] - c) <= 1) return false;
    return true;
  };

  // After the rows of pos: does every later row still have a cell, and every region without a cat a cell?
  Search.prototype.alive = function (pos) {
    var p = this.p;
    var n = p.n;
    var used = {};
    var i;
    for (i = 0; i < pos.length; i++) used[p.region[i * n + pos[i]]] = true;
    var reach = {};
    for (var r = pos.length; r < n; r++) {
      var any = false;
      for (var c = 0; c < n; c++) {
        var ok = true;
        for (i = 0; i < pos.length && ok; i++) if (pos[i] === c) ok = false;
        if (!ok || used[p.region[r * n + c]]) continue;
        if (r === pos.length && pos.length && Math.abs(pos[r - 1] - c) <= 1) continue;
        any = true;
        reach[p.region[r * n + c]] = true;
      }
      if (!any) return false;
    }
    for (var g = 0; g < n; g++) if (!used[g] && !reach[g]) return false;
    return true;
  };

  // One step: place the next feasible cat of the current row (a node), or step back.
  Search.prototype.step = function () {
    if (this.done || this.failed) return;
    var p = this.p;
    var r = this.pos.length;
    var c = this.next[r];
    while (c < p.n && !this.free(r, c, this.pos)) c++;
    if (c < p.n) {
      this.next[r] = c + 1;
      this.nodes++;
      this.pos.push(c);
      if (!this.alive(this.pos)) {
        this.pos.pop();
        this.back++;
        return;
      }
      if (this.pos.length === p.n) {
        this.done = true;
        return;
      }
      this.next[r + 1] = 0;
      return;
    }
    if (r === 0) {
      this.failed = true;
      return;
    }
    this.next.length = r;
    this.pos.pop();
    this.back++;
  };

  function solve(puzzle) {
    var s = new Search(parse(puzzle));
    for (var k = 0; k < 1000000 && !s.done && !s.failed; k++) s.step();
    return { cats: s.done ? s.pos.slice() : null, nodes: s.nodes, back: s.back };
  }

  /* ------------------------------------------------------------------ the rules for the player */

  // Indices of the cats that break a rule: a second cat in a row, a column or a region, or a touching cat.
  function conflicts(p, marks) {
    var n = p.n;
    var cats = [];
    for (var i = 0; i < n * n; i++) if (marks[i] === CAT) cats.push(i);
    var bad = {};
    for (var a = 0; a < cats.length; a++) {
      for (var b = a + 1; b < cats.length; b++) {
        var ra = Math.floor(cats[a] / n);
        var ca = cats[a] % n;
        var rb = Math.floor(cats[b] / n);
        var cb = cats[b] % n;
        if (ra === rb || ca === cb || p.region[cats[a]] === p.region[cats[b]] || (Math.abs(ra - rb) <= 1 && Math.abs(ca - cb) <= 1)) {
          bad[cats[a]] = true;
          bad[cats[b]] = true;
        }
      }
    }
    return { count: cats.length, bad: bad };
  }

  /* ------------------------------------------------------------------ drawing */

  // The cat is drawn by CSS (css/seminar.css): a head with ears cut out by clip-path and a face of gradients.
  function catIcon() {
    var head = el('span', { class: 'cat-icon', 'aria-hidden': 'true' });
    head.appendChild(el('span', { class: 'cat-face' }));
    return head;
  }

  function cross() {
    return el('span', { class: 'cat-cross', 'aria-hidden': 'true', text: '×' });
  }

  /* ------------------------------------------------------------------ the widget */

  SEM.widgets.cats = function (container) {
    if (running) {
      clearInterval(running.clock);
      clearTimeout(running.solver);
    }
    running = { clock: null, solver: null };
    var mine = running;

    var G = (SEM.content.main.blocks && SEM.content.main.blocks.G) || {};
    var puzzles = (SEM.data.game && SEM.data.game.puzzles) || [];
    if (!puzzles.length) return;
    var st = SEM.state.section('widgets.cats');
    if (typeof st.k !== 'number' || st.k < 0 || st.k >= puzzles.length) st.k = 0;

    var p;
    var marks; // the player's marks, kept while the solver shows its own board
    var solverMarks = [];
    var cells = [];
    var search = null;
    var solverShown = false;
    var message = null;

    if (G.intro) container.appendChild(render.el('p', { class: 'lead' }, G.intro));
    var root = el('figure', { class: 'widget cats', dataset: { widget: 'cats' } });
    var stage = el('div', { class: 'cats-stage' });
    var side = el('div', { class: 'cats-side' });

    var choose = el('div', { class: 'cats-choose', role: 'group' });
    var chooseLabel = el('span', { class: 'cats-label' });
    SEM.i18n.bind(function () {
      chooseLabel.textContent = SEM.tu('game.puzzle');
      choose.setAttribute('aria-label', SEM.tu('game.puzzle'));
    });
    choose.appendChild(chooseLabel);
    var chooseButtons = puzzles.map(function (pz, k) {
      var n = pz.cats.length;
      var same = 0;
      for (var j = 0; j <= k; j++) if (puzzles[j].cats.length === n) same++;
      var b = el('button', { type: 'button', class: 'btn cats-pick' });
      SEM.i18n.bind(function () {
        b.textContent = n + '×' + n + (same > 1 ? ' · ' + same : '');
        b.setAttribute('aria-label', SEM.tuf('game.size', { n: n, k: same }));
      });
      b.addEventListener('click', function () {
        if (st.k === k) return;
        stop();
        st.k = k;
        st.marks = null;
        st.clicks = 0;
        st.seconds = 0;
        st.won = false;
        st.started = false;
        SEM.state.touch();
        load();
      });
      choose.appendChild(b);
      return b;
    });
    side.appendChild(choose);

    var actions = el('div', { class: 'widget-actions' });
    SEM.kit.button(actions, 'game.check', function () {
      stop();
      if (solverShown) leaveSolver();
      message = null;
      refresh(true);
    });
    SEM.kit.button(actions, 'game.clear', function () {
      stop();
      st.marks = null;
      st.clicks = 0;
      st.seconds = 0;
      st.won = false;
      st.started = false;
      SEM.state.touch();
      load();
    });
    SEM.kit.button(actions, 'game.hint', hint);
    side.appendChild(actions);

    var solverRow = el('div', { class: 'widget-actions' });
    SEM.kit.button(solverRow, 'game.step', function () {
      stop();
      ensureSearch();
      search.step();
      showSearch();
    });
    var runButton = el('button', { type: 'button', class: 'btn' });
    SEM.i18n.bind(function () {
      runButton.textContent = SEM.tu(mine.solver ? 'game.stop' : 'game.solve');
    });
    runButton.addEventListener('click', function () {
      if (mine.solver) {
        stop();
        return;
      }
      ensureSearch();
      tick();
    });
    solverRow.appendChild(runButton);
    side.appendChild(solverRow);

    var status = SEM.kit.readout(side, lines);

    var board = el('div', { class: 'cats-board', role: 'grid' });
    stage.appendChild(board);
    var body = el('div', { class: 'cats-body' });
    dom.append(body, [stage, side]);
    root.appendChild(body);

    var notes = el('div', { class: 'cats-notes' });
    if (G.solver) {
      var h1 = el('h4', { class: 'widget-subtitle' });
      SEM.i18n.bind(function () {
        h1.textContent = SEM.tu('game.solverTitle');
      });
      notes.appendChild(h1);
      notes.appendChild(render.el('p', null, G.solver));
    }
    if (G.model) {
      var h2 = el('h4', { class: 'widget-subtitle' });
      SEM.i18n.bind(function () {
        h2.textContent = SEM.tu('game.model');
      });
      notes.appendChild(h2);
      notes.appendChild(render.el('p', null, G.model));
    }
    root.appendChild(notes);
    container.appendChild(root);

    function clockText() {
      return SEM.fmt.clock(st.seconds || 0);
    }

    function lines() {
      if (!p) return [];
      var out = [];
      if (solverShown && search) {
        var key = search.done ? 'game.solvedBy' : 'game.solving';
        out.push({ text: SEM.tuf(key, { nodes: search.nodes, back: search.back }), cls: search.done ? 'is-ok' : '' });
        return out;
      }
      var c = conflicts(p, marks);
      if (st.won) {
        out.push({ text: SEM.tuf('game.won', { t: clockText(), m: st.clicks || 0 }), cls: 'is-ok' });
        return out;
      }
      out.push(SEM.tuf('game.placed', { k: c.count, n: p.n }) + ' ' + SEM.tuf('game.time', { t: clockText() }));
      if (message) out.push(SEM.tu(message));
      else if (Object.keys(c.bad).length) out.push({ text: SEM.tu('game.conflicts'), cls: 'is-bad' });
      return out;
    }

    function startClock() {
      if (mine.clock || st.won) return;
      mine.clock = setInterval(function () {
        if (mine !== running || !document.body.contains(root)) {
          clearInterval(mine.clock);
          return;
        }
        st.seconds = (st.seconds || 0) + 1;
        SEM.state.touch();
        status.update();
      }, 1000);
    }

    function stopClock() {
      clearInterval(mine.clock);
      mine.clock = null;
    }

    function stop() {
      clearTimeout(mine.solver);
      mine.solver = null;
      runButton.textContent = SEM.tu('game.solve');
    }

    function ensureSearch() {
      if (!search || search.done || search.failed) {
        search = new Search(p);
      }
      stopClock();
      solverShown = true;
    }

    function tick() {
      search.step();
      showSearch();
      if (search.done || search.failed) {
        stop();
        return;
      }
      mine.solver = setTimeout(tick, STEP_MS);
      runButton.textContent = SEM.tu('game.stop');
    }

    function showSearch() {
      var n = p.n;
      solverMarks = [];
      for (var i = 0; i < n * n; i++) solverMarks.push(EMPTY);
      search.pos.forEach(function (c, r) {
        solverMarks[r * n + c] = CAT;
      });
      refresh(false);
    }

    // Back to the player's board, as it was before the solver ran.
    function leaveSolver() {
      solverShown = false;
      search = null;
      if (st.started && !st.won) startClock();
    }

    function view() {
      return solverShown ? solverMarks : marks;
    }

    function hint() {
      stop();
      if (solverShown) leaveSolver();
      if (st.won) {
        refresh(false);
        return;
      }
      st.started = true;
      startClock();
      var n = p.n;
      for (var r = 0; r < n; r++) {
        var right = r * n + p.cats[r];
        if (marks[right] === CAT) continue;
        for (var c = 0; c < n; c++) if (marks[r * n + c] === CAT) marks[r * n + c] = EMPTY;
        marks[right] = CAT;
        message = 'game.hinted';
        save();
        refresh(false);
        return;
      }
    }

    function save() {
      st.marks = marks.join('');
      SEM.state.touch();
    }

    function click(i) {
      stop();
      if (solverShown) leaveSolver();
      if (st.won) {
        refresh(false);
        return;
      }
      marks[i] = (marks[i] + 1) % 3;
      st.clicks = (st.clicks || 0) + 1;
      st.started = true;
      message = null;
      startClock();
      save();
      refresh(false);
    }

    function cellLabel(i) {
      var n = p.n;
      var v = view();
      var text = SEM.tuf('game.cell', { r: Math.floor(i / n) + 1, c: (i % n) + 1 });
      if (v[i] === CAT) text += ', ' + SEM.tu('game.cat');
      if (v[i] === CROSS) text += ', ' + SEM.tu('game.cross');
      return text;
    }

    function refresh(showConflicts) {
      var v = view();
      var c = conflicts(p, v);
      var marked = showConflicts || !solverShown;
      if (!solverShown && c.count === p.n && !Object.keys(c.bad).length && !st.won) {
        st.won = true;
        stopClock();
        SEM.state.touch();
      }
      cells.forEach(function (cell, i) {
        var m = v[i];
        if (cell.mark !== m) {
          dom.clear(cell.node);
          if (m === CAT) cell.node.appendChild(catIcon());
          if (m === CROSS) cell.node.appendChild(cross());
          cell.mark = m;
        }
        cell.node.classList.toggle('is-conflict', marked && !!c.bad[i]);
        cell.node.classList.toggle('is-solver', solverShown && m === CAT);
        cell.node.setAttribute('aria-label', cellLabel(i));
      });
      root.classList.toggle('is-won', !!st.won && !solverShown);
      status.update();
    }

    function load() {
      chooseButtons.forEach(function (b, k) {
        b.setAttribute('aria-pressed', k === st.k ? 'true' : 'false');
        b.classList.toggle('is-active', k === st.k);
      });
      p = parse(puzzles[st.k]);
      search = null;
      solverShown = false;
      message = null;
      stopClock();
      var n = p.n;
      marks = [];
      for (var i = 0; i < n * n; i++) {
        var s = st.marks && st.marks.length === n * n ? +st.marks.charAt(i) : EMPTY;
        marks.push(s === CAT || s === CROSS ? s : EMPTY);
      }
      dom.clear(board);
      board.style.setProperty('--cats-n', n);
      cells = [];
      for (var r = 0; r < n; r++) {
        var row = el('div', { class: 'cats-row', role: 'row' });
        for (var c = 0; c < n; c++) {
          var k = r * n + c;
          var g = p.region[k];
          var cls = 'cats-cell cats-g' + g;
          if (c + 1 < n && p.region[k + 1] !== g) cls += ' edge-r';
          if (r + 1 < n && p.region[k + n] !== g) cls += ' edge-b';
          if (c === 0 || p.region[k - 1] !== g) cls += ' edge-l';
          if (r === 0 || p.region[k - n] !== g) cls += ' edge-t';
          var node = el('button', { type: 'button', class: cls, role: 'gridcell' });
          node.addEventListener('click', click.bind(null, k));
          row.appendChild(node);
          cells.push({ node: node, mark: EMPTY });
        }
        board.appendChild(row);
      }
      refresh(false);
      if (!st.won && (st.clicks || st.started)) startClock();
    }

    SEM.i18n.bind(function () {
      if (mine === running && p) refresh(false);
    });
    load();
  };

  SEM.widgets.cats.solve = solve;
  SEM.widgets.cats.parse = parse;
})();
