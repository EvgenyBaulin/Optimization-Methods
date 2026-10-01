// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 4 access: the page ships its statements in the clear and the rest in two AES-GCM envelopes
// (js/locked.enc.js). The instructor opens both with the password; everyone else gets the students envelope
// when the server publishes its key (config.releaseUrl) after the class. SEM.access.state is 'locked',
// 'teacher' or 'open'; every change rebuilds the page in place, keeping what was typed.
(function () {
  'use strict';
  var SEM = window.SEM;
  var cfg = SEM.config;
  var dom = SEM.dom;
  var el = dom.el;
  var render = SEM.render;
  var root = document.documentElement;
  var page = SEM.state.page;

  // the raw keys of the envelopes the instructor opened, kept across a reload or a move between the two pages
  // of the seminar in the same tab; KEYS + '.left' is when this tab last left a page, so that the keys of a
  // closed tab that the browser reopens later are dropped; KEYS + '.hide' is the "hide the answers" switch
  var KEYS = 'om.s' + SEM.state.seminar + '.keys';
  var LEFT = KEYS + '.left';
  var HIDE = KEYS + '.hide';

  /* ------------------------------------------------------------------ data helpers */

  function clone(v) {
    return v === undefined ? undefined : JSON.parse(JSON.stringify(v));
  }

  function isObject(v) {
    return !!v && typeof v === 'object' && !Array.isArray(v);
  }

  // Objects merge key by key, arrays element by element, anything else is replaced. A locked fragment never
  // repeats the public text: the answers of the exit ticket merge into the items that hold the questions.
  function merge(target, overlay) {
    Object.keys(overlay || {}).forEach(function (key) {
      var a = target[key];
      var b = overlay[key];
      if (isObject(a) && isObject(b)) merge(a, b);
      else if (Array.isArray(a) && Array.isArray(b)) {
        b.forEach(function (item, i) {
          if (isObject(a[i]) && isObject(item)) merge(a[i], item);
          else a[i] = clone(item);
        });
      } else target[key] = clone(b);
    });
    return target;
  }

  // Replace the contents of an object that other scripts hold a reference to.
  function replace(target, source) {
    Object.keys(target).forEach(function (key) {
      delete target[key];
    });
    Object.keys(source).forEach(function (key) {
      target[key] = source[key];
    });
  }

  /* ------------------------------------------------------------------ state */

  // What the page shipped with, before any envelope was opened.
  var baseline = { data: clone(SEM.data), content: clone(SEM.content) };

  var access = (SEM.access = {
    state: 'locked',
    released: false,
    hideAnswers: false,
    // idle, file, waiting, polling, stopped, done
    polling: 'idle',
    payload: { students: null, teacher: null },
    view: { teaching: false, solutions: false, handout: false }
  });

  var figureUrls = {};
  SEM.figureUrl = function (name) {
    return Object.prototype.hasOwnProperty.call(figureUrls, name) ? figureUrls[name] : null;
  };

  function setFigures(figures) {
    Object.keys(figureUrls).forEach(function (name) {
      try {
        URL.revokeObjectURL(figureUrls[name]);
      } catch (e) {
        /* nothing to release */
      }
    });
    figureUrls = {};
    Object.keys(figures || {}).forEach(function (name) {
      try {
        figureUrls[name] = URL.createObjectURL(new Blob([figures[name]], { type: 'image/svg+xml' }));
      } catch (e) {
        /* the figure simply does not show */
      }
    });
  }

  // The data and content the page shows now: the public part and the students envelope once it is open (without
  // the solutions while the instructor hides them for projecting).
  function applyView() {
    var s = access.payload.students;
    var teacher = access.state === 'teacher';
    var v = {
      teaching: !!s && (teacher || access.state === 'open'),
      solutions: !!s && (teacher ? !access.hideAnswers : access.state === 'open')
    };
    v.handout = v.solutions;
    access.view = v;

    var data = clone(baseline.data);
    var content = clone(baseline.content);
    if (v.teaching) {
      merge(data, s.data);
      var sc = clone(s.content);
      if (!v.solutions) {
        delete sc.problems;
        delete sc.handout;
        delete sc.cheatsheet;
        delete data.answers;
        if (sc.main) {
          delete sc.main.mistakes;
          var E = sc.main.blocks && sc.main.blocks.E;
          if (E) {
            delete E.exit;
            delete E.home;
          }
        }
      }
      merge(content, sc);
    }
    // a problem without its solution says when it opens (or that the instructor hid it); the board problems
    // carry their solutions in the clear
    var note = SEM.ui(access.state === 'teacher' && access.hideAnswers ? 'access.hiddenProblem' : 'access.lockedProblem');
    Object.keys(content.problems || {}).forEach(function (pid) {
      if (!v.solutions && !content.problems[pid].steps) content.problems[pid].locked = note;
    });
    replace(SEM.data, data);
    replace(SEM.content, content);
  }

  /* ------------------------------------------------------------------ envelopes */

  var locked = window.SeminarLocked || null;

  function aad(name) {
    return cfg.id + '/' + name;
  }

  // Open one envelope with a key; resolves to the payload or rejects.
  function openEnvelope(name, key) {
    if (!locked || !locked[name]) return Promise.reject(new Error('no envelope ' + name));
    return SEM.crypto.open(key, locked[name], aad(name)).then(function (payload) {
      if (!payload || payload.id !== cfg.id) throw new Error('wrong envelope');
      return payload;
    });
  }

  function useStudents(payload) {
    access.payload.students = payload;
    setFigures(payload.figures);
  }

  /* ------------------------------------------------------------------ rendering */

  // What to hold in place while the page is rebuilt: the answer being typed in, else the first answer, problem,
  // block or handout section whose top is at or below the line under the toolbar.
  function readingAnchor() {
    var a = document.activeElement;
    var part = a && a.classList && a.classList.contains('answer-input') ? a.closest('[data-answer]') : null;
    if (part) return { answer: part.getAttribute('data-answer'), top: part.getBoundingClientRect().top };
    var line = (parseFloat(window.getComputedStyle(root).getPropertyValue('--toolbar-h')) || 0) + 12;
    var main = document.getElementById('content');
    var nodes = main ? dom.qsa('[data-answer], [id^="problem-"], [id^="block-"], [id^="sec-"], [id^="sub-"]', main) : [];
    for (var i = 0; i < nodes.length; i++) {
      var r = nodes[i].getBoundingClientRect();
      if (r.height && r.top >= line) {
        return nodes[i].id ? { id: nodes[i].id, top: r.top } : { answer: nodes[i].getAttribute('data-answer'), top: r.top };
      }
    }
    return null;
  }

  function anchorNode(hold) {
    if (hold.id) return document.getElementById(hold.id);
    var found = null;
    dom.qsa('[data-answer]').forEach(function (p) {
      if (!found && p.getAttribute('data-answer') === hold.answer) found = p;
    });
    return found;
  }

  // The answer field being typed in, so that it keeps the focus and the caret.
  function focusedField() {
    var a = document.activeElement;
    if (!a || !a.classList || !a.classList.contains('answer-input')) return null;
    var part = a.closest('[data-answer]');
    if (!part) return null;
    var fields = dom.qsa('.answer-input', part);
    return { key: part.getAttribute('data-answer'), index: fields.indexOf(a), start: a.selectionStart, end: a.selectionEnd };
  }

  function restoreField(f) {
    if (!f) return;
    var part = null;
    dom.qsa('[data-answer]').forEach(function (p) {
      if (p.getAttribute('data-answer') === f.key) part = p;
    });
    var field = part && dom.qsa('.answer-input', part)[f.index];
    if (!field) return;
    try {
      field.focus({ preventScroll: true });
      field.setSelectionRange(f.start, f.end);
    } catch (e) {
      /* the focus is a courtesy */
    }
  }

  var started = false;

  function redraw() {
    applyView();
    syncMode();
    if (!started || !SEM.app) return;
    var hold = readingAnchor();
    var field = focusedField();
    if (page === 'main') SEM.app.rebuildMain();
    else if (SEM.pages && SEM.pages[page]) SEM.app.rebuildPage(page, SEM.pages[page]);
    notices();
    if (hold) {
      var node = anchorNode(hold);
      if (node) window.scrollBy(0, node.getBoundingClientRect().top - hold.top);
    }
    restoreField(field);
    selftest();
  }

  function selftest() {
    root.setAttribute('data-access', access.state);
    if (SEM.param('selftest') === '1' && SEM.selftest) {
      var slot = document.getElementById('selftest-slot');
      if (slot) SEM.selftest.run(slot);
    }
  }

  // Instructor mode is the instructor's view: on while signed in, off while the answers are hidden.
  function syncMode() {
    var on = access.state === 'teacher' && !access.hideAnswers;
    if (SEM.app && SEM.app.setInstructor && root.classList.contains('is-instructor') !== on) SEM.app.setInstructor(on);
    else root.classList.toggle('is-instructor', on);
    syncBadge();
  }

  /* ------------------------------------------------------------------ notices */

  function notices() {
    var main = document.getElementById('content');
    if (!main || page !== 'main') return;
    dom.qsa('.access-notice', main).forEach(function (n) {
      n.parentNode.removeChild(n);
    });
    var slot = document.getElementById('selftest-slot');
    var after = slot ? slot.nextSibling : main.firstChild;
    var dismissed = !!SEM.state.get('access.bannerClosed', false);
    var box = null;
    if (access.state === 'open' && !dismissed) {
      box = el('div', { class: 'access-notice is-open', role: 'status' });
      box.appendChild(render.el('p', null, SEM.ui('access.banner')));
      var close = el('button', { type: 'button', class: 'btn btn-quiet' });
      close.textContent = SEM.tu('access.bannerClose');
      close.addEventListener('click', function () {
        SEM.state.set('access.bannerClosed', true);
        notices();
      });
      box.appendChild(close);
    } else if (access.state === 'locked' && access.polling === 'stopped') {
      box = el('div', { class: 'access-notice is-later', role: 'status' });
      box.appendChild(render.el('p', null, SEM.ui('access.reload')));
    }
    if (box) main.insertBefore(box, after);
  }

  /* ------------------------------------------------------------------ the instructor */

  var badge = null;

  function syncBadge() {
    if (!document.body) return;
    if (!badge) {
      badge = el('button', { type: 'button', class: 'access-badge', hidden: true });
      badge.addEventListener('click', openSession);
      document.body.appendChild(badge);
    }
    badge.hidden = access.state !== 'teacher';
    badge.textContent = SEM.tu(access.hideAnswers ? 'access.badgeHidden' : 'access.badge');
    badge.title = SEM.tu('access.sessionTitle');
  }
  SEM.on('lang', function () {
    if (badge) syncBadge();
  });

  function saveKeys(raw) {
    SEM.store.set(KEYS, JSON.stringify({ students: SEM.crypto.b64encode(raw.students), teacher: SEM.crypto.b64encode(raw.teacher) }), 'session');
  }

  function forgetKeys() {
    [KEYS, LEFT, HIDE].forEach(function (key) {
      try {
        window.sessionStorage.removeItem(key);
      } catch (e) {
        /* nothing stored */
      }
      SEM.store.set(key, '', 'session');
    });
  }

  window.addEventListener('pagehide', function () {
    if (SEM.store.get(KEYS, 'session')) SEM.store.set(LEFT, String(Date.now()), 'session');
  });

  // The keys count only on a page loaded within a minute of this tab leaving the last one (a reload, the
  // handout link): a closed tab that the browser reopens later has to sign in again.
  function storedKeys() {
    var raw = SEM.store.get(KEYS, 'session');
    if (!raw) return null;
    if (!(Date.now() - Number(SEM.store.get(LEFT, 'session')) < 60000)) {
      forgetKeys();
      return null;
    }
    try {
      var k = JSON.parse(raw);
      return k && typeof k.students === 'string' && typeof k.teacher === 'string' ? k : null;
    } catch (e) {
      return null;
    }
  }

  // Both envelopes from their raw keys; resolves to true when both open.
  function openBoth(rawStudents, rawTeacher) {
    return Promise.all([SEM.crypto.importKey(rawStudents), SEM.crypto.importKey(rawTeacher)])
      .then(function (keys) {
        return Promise.all([openEnvelope('students', keys[0]), openEnvelope('teacher', keys[1])]);
      })
      .then(function (payloads) {
        useStudents(payloads[0]);
        access.payload.teacher = payloads[1];
        access.state = 'teacher';
        return true;
      });
  }

  // The password check: the username is compared for courtesy only; the password is right exactly when
  // AES-GCM authenticates both envelopes with the keys derived from it.
  function signIn(user, password) {
    if (String(user || '').trim().toLowerCase() !== String(cfg.teacherUser).toLowerCase() || !password) {
      return Promise.reject(new Error('wrong'));
    }
    var raw = {};
    return SEM.crypto.deriveRaw(password, locked.students.salt, locked.iterations)
      .then(function (bytes) {
        raw.students = bytes;
        return SEM.crypto.deriveRaw(password, locked.teacher.salt, locked.iterations);
      })
      .then(function (bytes) {
        raw.teacher = bytes;
        return openBoth(raw.students, raw.teacher);
      })
      .then(function () {
        saveKeys(raw);
        return true;
      });
  }

  function signOut() {
    forgetKeys();
    access.payload.teacher = null;
    access.hideAnswers = false;
    if (access.released) access.state = 'open';
    else {
      access.payload.students = null;
      setFigures({});
      access.state = 'locked';
    }
    redraw();
  }

  var loginBox = null;
  // The failure counter and the pause after five failures are a courtesy that slows down guessing at the
  // keyboard, nothing more: anyone can read locked.enc.js and try passwords offline. The protection is that
  // the plaintext is not on the page and every guess costs a PBKDF2 run of config iterations.
  var failures = 0;
  var pausedUntil = 0;
  var pauseTimer = null;

  function buildLogin() {
    var d = SEM.app.dialog('access-login', 'access.loginTitle');
    var form = el('form', { class: 'access-form', autocomplete: 'on' });
    var userLabel = el('label', { class: 'access-field' });
    var userText = el('span');
    userText.textContent = SEM.tu('access.login');
    var user = el('input', { type: 'text', name: 'username', autocomplete: 'username', autocapitalize: 'off', spellcheck: 'false', required: true });
    dom.append(userLabel, [userText, user]);
    var passLabel = el('label', { class: 'access-field' });
    var passText = el('span');
    passText.textContent = SEM.tu('access.password');
    var pass = el('input', { type: 'password', name: 'password', autocomplete: 'current-password', required: true });
    dom.append(passLabel, [passText, pass]);
    var submit = el('button', { type: 'submit', class: 'btn btn-primary' });
    submit.textContent = SEM.tu('access.submit');
    var message = el('p', { class: 'access-message', role: 'alert' });
    var note = render.el('p', { class: 'access-note' }, SEM.ui('access.loginNote'));
    dom.append(form, [userLabel, passLabel, submit, message, note]);
    d.body.appendChild(form);

    function setBusy(busy) {
      user.disabled = busy;
      pass.disabled = busy;
      submit.disabled = busy;
    }
    function pauseTick() {
      var left = Math.ceil((pausedUntil - Date.now()) / 1000);
      if (left > 0) {
        setBusy(true);
        message.textContent = SEM.tuf('access.paused', { s: left });
        return;
      }
      clearInterval(pauseTimer);
      pauseTimer = null;
      setBusy(false);
      message.textContent = '';
    }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (Date.now() < pausedUntil) return;
      if (!locked) {
        message.textContent = SEM.tu('access.missing');
        return;
      }
      if (!SEM.crypto.available()) {
        message.textContent = SEM.tu('access.unavailable');
        return;
      }
      setBusy(true);
      message.textContent = SEM.tu('access.working');
      signIn(user.value, pass.value).then(
        function () {
          failures = 0;
          pass.value = '';
          message.textContent = '';
          setBusy(false);
          SEM.app.closeDialogs();
          redraw();
        },
        function () {
          failures += 1;
          pass.value = '';
          setBusy(false);
          message.textContent = SEM.tu('access.wrong');
          if (failures >= 5) {
            failures = 0;
            pausedUntil = Date.now() + 60000;
            pauseTick();
            pauseTimer = setInterval(pauseTick, 1000);
          } else {
            pass.focus();
          }
        }
      );
    });
    return { user: user, pass: pass };
  }

  function openLogin() {
    if (!loginBox) loginBox = buildLogin();
    SEM.app.openDialog('access-login');
    var target = loginBox.user.value ? loginBox.pass : loginBox.user;
    if (!target.disabled) target.focus();
  }

  var sessionBox = null;

  function statusText() {
    var t = function (ms) {
      var d = new Date(ms);
      return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    };
    var from = unlockAt - cfg.pollLeadMinutes * 60000;
    var until = from + cfg.pollWindowMinutes * 60000;
    switch (access.polling) {
      case 'file': return SEM.tu('access.statusFile');
      case 'done': return SEM.tu('access.statusReleased');
      case 'waiting': return SEM.tuf('access.statusWaiting', { time: t(from), sec: cfg.pollSeconds, min: cfg.pollWindowMinutes });
      case 'polling': return SEM.tuf('access.statusPolling', { sec: cfg.pollSeconds, time: t(until) });
      case 'stopped': return SEM.tuf('access.statusStopped', { time: t(until) });
      default: return SEM.tu('access.statusIdle');
    }
  }

  function buildSession() {
    var d = SEM.app.dialog('access-session', 'access.sessionTitle');
    var intro = el('p', { class: 'access-note' });
    intro.textContent = SEM.tu('access.signedIn');
    var hideLabel = el('label', { class: 'access-toggle' });
    var hide = el('input', { type: 'checkbox' });
    var hideText = el('span');
    hideText.textContent = SEM.tu('access.hide');
    dom.append(hideLabel, [hide, hideText]);
    hide.addEventListener('change', function () {
      access.hideAnswers = hide.checked;
      SEM.store.set(HIDE, hide.checked ? '1' : '', 'session');
      redraw();
    });
    var status = el('p', { class: 'access-status' });
    var out = el('button', { type: 'button', class: 'btn' });
    out.textContent = SEM.tu('access.signOut');
    out.addEventListener('click', function () {
      SEM.app.closeDialogs();
      signOut();
    });
    dom.append(d.body, [intro, hideLabel, status, out]);
    return { hide: hide, status: status };
  }

  function openSession() {
    if (access.state !== 'teacher') {
      openLogin();
      return;
    }
    if (!sessionBox) sessionBox = buildSession();
    sessionBox.hide.checked = access.hideAnswers;
    sessionBox.status.textContent = statusText();
    SEM.app.openDialog('access-session');
  }

  /* ------------------------------------------------------------------ the release */

  var unlockAt = Date.parse(cfg.unlockAt);
  var pollTimer = null;
  var inFlight = false;

  function canAsk() {
    return window.location.protocol !== 'file:' && typeof window.fetch === 'function' && SEM.crypto.available() && !!locked;
  }

  // One request for the released key. Resolves to true once the students envelope is open.
  function probe() {
    if (inFlight || access.released) return Promise.resolve(access.released);
    inFlight = true;
    var url = SEM.course.localHref(cfg.releaseUrl);
    url += (url.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now();
    return window
      .fetch(url, { cache: 'no-store', credentials: 'same-origin' })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (j) {
        if (!j || j.id !== cfg.id || typeof j.key !== 'string') return false;
        return SEM.crypto
          .importKey(SEM.crypto.b64decode(j.key))
          .then(function (key) {
            return openEnvelope('students', key);
          })
          .then(function (payload) {
            // an instructor who is signed in has this envelope already
            if (!access.payload.students) useStudents(payload);
            access.released = true;
            access.polling = 'done';
            if (access.state === 'locked') access.state = 'open';
            return true;
          });
      })
      .then(
        function (ok) {
          inFlight = false;
          return ok;
        },
        function () {
          inFlight = false;
          return false;
        }
      );
  }

  // From pollLeadMinutes before the unlock the page asks every pollSeconds for pollWindowMinutes, then stops.
  // The clock only decides when to ask: a clock set forward asks early and finds nothing.
  function plan(justAsked) {
    clearTimeout(pollTimer);
    if (access.released) {
      access.polling = 'done';
      return;
    }
    var now = Date.now();
    var from = unlockAt - cfg.pollLeadMinutes * 60000;
    var until = from + cfg.pollWindowMinutes * 60000;
    if (now < from) {
      access.polling = 'waiting';
      pollTimer = setTimeout(plan, Math.min(from - now, 3600000));
      return;
    }
    if (now > until) {
      var was = access.polling;
      access.polling = 'stopped';
      if (was !== 'stopped') {
        if (page === 'main') notices();
        else if (access.state === 'locked') redraw();
      }
      return;
    }
    access.polling = 'polling';
    if (justAsked) {
      pollTimer = setTimeout(plan, cfg.pollSeconds * 1000);
      return;
    }
    probe().then(function (ok) {
      if (ok) redraw();
      else pollTimer = setTimeout(plan, cfg.pollSeconds * 1000);
    });
  }

  /* ------------------------------------------------------------------ hooks into the page */

  SEM.problems.lockedTitle = function () {
    return render.plain(SEM.ui('access.opensAt'));
  };

  if (SEM.app && SEM.app.hooks) {
    SEM.app.hooks.instructor = function () {
      openSession();
    };
  }

  // The handout and the cheat sheet are in the students envelope: until it is open each page shows its title and
  // when it opens.
  [['theory', 'handout', 'access.lockedHandout', 'access.hiddenHandout'],
   ['cheatsheet', 'cheatsheet', 'access.lockedCheatsheet', 'access.hiddenCheatsheet']].forEach(function (spec) {
    var name = spec[0];
    if (!SEM.pages || !SEM.pages[name]) return;
    var build = SEM.pages[name];
    SEM.pages[name] = function (main) {
      var part = SEM.content[spec[1]];
      if (access.view.handout && part && part.sections) {
        build(main);
        return;
      }
      var box = el('article', { class: 'handout handout-locked' });
      var head = el('header', { class: 'handout-head' });
      head.appendChild(render.el('h2', { class: 'handout-title' }, (part && part.title) || SEM.ui('meta.pageTitle.' + name)));
      var hidden = access.state === 'teacher' && access.hideAnswers;
      head.appendChild(render.el('p', { class: 'lock-note' }, SEM.ui(hidden ? spec[3] : spec[2])));
      if (!hidden && access.polling === 'stopped') head.appendChild(render.el('p', { class: 'lock-note' }, SEM.ui('access.reload')));
      box.appendChild(head);
      main.appendChild(box);
    };
  });

  applyView();

  /* ------------------------------------------------------------------ start */

  function start() {
    started = true;
    // the saved position belongs to the page as it was left, which the locked page built first may be too
    // short to hold: it is applied again once the page has opened
    var saved = page === 'main' && !SEM.param('block') ? SEM.state.get('scroll', 0) : 0;
    syncMode();
    notices();
    var file = window.location.protocol === 'file:';
    var keys = storedKeys();
    if (keys) access.hideAnswers = SEM.store.get(HIDE, 'session') === '1';
    var restore = keys && locked && SEM.crypto.available()
      ? Promise.resolve()
          .then(function () {
            return openBoth(SEM.crypto.b64decode(keys.students), SEM.crypto.b64decode(keys.teacher));
          })
          .then(
            function () {
              return true;
            },
            function () {
              forgetKeys();
              return false;
            }
          )
      : Promise.resolve(false);
    restore
      .then(function (signedIn) {
        if (signedIn) redraw();
        if (file || !canAsk()) {
          access.polling = file ? 'file' : 'idle';
          return false;
        }
        // one request on load: after the class the key is simply there
        return probe().then(function (ok) {
          if (ok) {
            redraw();
            return true;
          }
          plan(true);
          return false;
        });
      })
      .then(function () {
        if (saved > 0 && access.state !== 'locked' && !root.classList.contains('is-present')) {
          window.scrollTo(0, saved);
          // the figures come from blob addresses and take their height a moment later
          Promise.all(dom.qsa('#content img').map(function (img) {
            return img.decode ? img.decode().catch(function () {}) : null;
          })).then(function () {
            window.scrollTo(0, saved);
          });
        }
        root.setAttribute('data-access', access.state);
        root.setAttribute('data-access-ready', '1');
        if (SEM.param('selftest') === '1' && access.state !== 'locked') selftest();
      });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && access.polling === 'polling') plan(false);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else setTimeout(start, 0);
})();
