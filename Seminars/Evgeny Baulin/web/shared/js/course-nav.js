// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// The course sidebar: the course title (to the landing page), the Atlas link and the topics of content.course,
// with the pages of the current seminar. Docked beside the page from 1440px; below that, a drawer over a scrim,
// opened by the Topics button that goes first in the toolbar (key M).
(function () {
  'use strict';
  var SEM = window.SEM;
  var dom = SEM.dom;
  var el = dom.el;
  var root = document.documentElement;

  // The same width as the docked layout in course-nav.css.
  var DOCKED = '(min-width: 1440px)';
  var PAGES = ['main', 'theory', 'cheatsheet'];

  var nav = (SEM.courseNav = {
    isOpen: function () {
      return false;
    },
    toggle: function () {
      return false;
    }
  });

  function text(tag, attrs, path) {
    var node = el(tag, attrs);
    SEM.i18n.bind(function () {
      node.textContent = SEM.tu(path);
    });
    return node;
  }

  // One topic of the list: a link when its pages exist, the pages of the current seminar under it
  // (the upcoming page marks its topic without them).
  function topicItem(topic, currentTopic, page) {
    var current = topic === currentTopic;
    var li = el('li', { class: 'course-nav-item' + (current ? ' is-current' : '') });
    var link;
    if (topic.available) {
      link = el('a', { class: 'course-nav-link', href: SEM.course.pageHref(topic, 'main') });
    } else {
      link = el('span', { class: 'course-nav-link', 'aria-disabled': 'true' });
    }
    // a topic not out yet is current on its upcoming page
    if (current) link.setAttribute('aria-current', 'page');
    link.appendChild(el('span', { class: 'course-nav-num', text: String(topic.n) }));
    var name = el('span', { class: 'course-nav-name' });
    SEM.i18n.bind(function () {
      name.textContent = SEM.t(topic.title);
    });
    link.appendChild(name);
    if (!topic.available) link.appendChild(text('span', { class: 'visually-hidden' }, 'courseNav.later'));
    li.appendChild(link);
    if (current && PAGES.indexOf(page) >= 0) {
      var sub = el('ul', { class: 'course-nav-pages' });
      PAGES.forEach(function (p) {
        sub.appendChild(el('li', null, text('a', { href: SEM.course.pageHref(topic, p), 'aria-current': p === page ? 'page' : null }, 'courseNav.pages.' + p)));
      });
      li.appendChild(sub);
    }
    return li;
  }

  // Put the toggle first in the toolbar and the sidebar with its scrim right after the toolbar.
  nav.mount = function (bar) {
    var page = SEM.state.page;
    var currentTopic = SEM.course.current();
    var docked = null;
    try {
      docked = window.matchMedia(DOCKED);
    } catch (e) {
      docked = null;
    }

    var toggle = el('button', { type: 'button', class: 'btn tool tool-topics', 'aria-controls': 'course-nav', 'aria-expanded': 'false', 'aria-keyshortcuts': 'M' });
    var toggleLabel = el('span', { class: 'tool-label' });
    SEM.i18n.bind(function () {
      toggleLabel.textContent = SEM.tu('controls.topics');
      toggle.title = SEM.tu('controls.topics') + ' (M)';
    });
    dom.append(toggle, [el('span', { class: 'tool-icon', 'aria-hidden': 'true', text: '☰' }), toggleLabel]);
    bar.insertBefore(toggle, bar.firstChild);

    var side = el('nav', { class: 'course-nav', id: 'course-nav' });
    SEM.i18n.bind(function () {
      side.setAttribute('aria-label', SEM.tu('courseNav.label'));
    });
    var head = el('div', { class: 'course-nav-head' });
    var title = el('p', { class: 'course-nav-title' });
    var home = text('a', { href: SEM.course.homeHref(), 'aria-current': page === 'home' ? 'page' : null }, 'meta.course');
    SEM.i18n.bind(function () {
      home.title = SEM.tu('courseNav.home');
    });
    title.appendChild(home);
    var close = text('button', { type: 'button', class: 'btn btn-quiet tool course-nav-close' }, 'controls.close');
    dom.append(head, [title, close]);
    side.appendChild(head);

    var atlas = el('a', { class: 'course-nav-atlas' });
    SEM.i18n.bind(function () {
      atlas.textContent = SEM.tu('courseNav.atlas');
      atlas.title = SEM.tu('courseNav.atlasTitle');
      // in the repository the link carries the language, which the Atlas reads from ?lang=
      atlas.setAttribute('href', SEM.course.atlasHref());
    });
    side.appendChild(atlas);

    side.appendChild(text('p', { class: 'course-nav-group', id: 'course-nav-group' }, 'courseNav.seminars'));
    var list = el('ol', { class: 'course-nav-list', 'aria-labelledby': 'course-nav-group' });
    SEM.course.topics().forEach(function (topic) {
      list.appendChild(topicItem(topic, currentTopic, page));
    });
    side.appendChild(list);

    var scrim = el('div', { class: 'course-nav-scrim' });
    bar.parentNode.insertBefore(side, bar.nextSibling);
    bar.parentNode.insertBefore(scrim, side.nextSibling);

    /* -------------------------------------------------------------- the drawer */

    // Everything else in <body> is inert while the drawer is open.
    var inerted = [];
    function isDocked() {
      return !!(docked && docked.matches);
    }
    function isOpen() {
      return root.classList.contains('is-nav-open');
    }
    function setOpen(on, returnFocus) {
      var next = !!on && !isDocked() && !root.classList.contains('is-present');
      if (next === isOpen()) return;
      if (next && SEM.app && SEM.app.closeDialogs) SEM.app.closeDialogs();
      root.classList.toggle('is-nav-open', next);
      toggle.setAttribute('aria-expanded', next ? 'true' : 'false');
      if (next) {
        inerted = dom.qsa('body > *').filter(function (n) {
          return n !== side && n !== scrim && !n.inert;
        });
        inerted.forEach(function (n) {
          n.inert = true;
        });
        close.focus();
      } else {
        inerted.forEach(function (n) {
          n.inert = false;
        });
        inerted = [];
        // the toolbar is not sticky on narrow screens: focusing the toggle must not scroll back to the top
        if (returnFocus) toggle.focus({ preventScroll: true });
      }
    }

    nav.isOpen = isOpen;
    nav.open = function () {
      setOpen(true);
    };
    nav.close = function () {
      setOpen(false, true);
    };
    // Key M: open or close the drawer; with the sidebar docked, move the focus into it. False when nothing happens.
    nav.toggle = function () {
      if (root.classList.contains('is-present')) return false;
      if (isDocked()) {
        var target = side.querySelector('.is-current > a') || side.querySelector('a.course-nav-link');
        if (target) target.focus();
        return !!target;
      }
      setOpen(!isOpen(), true);
      return true;
    };

    toggle.addEventListener('click', function () {
      setOpen(true);
    });
    close.addEventListener('click', function () {
      setOpen(false, true);
    });
    scrim.addEventListener('click', function () {
      setOpen(false, true);
    });
    if (docked) {
      var onDocked = function () {
        setOpen(false);
      };
      try {
        docked.addEventListener('change', onDocked);
      } catch (e) {
        if (docked.addListener) docked.addListener(onDocked);
      }
    }
    SEM.on('mode', function (name) {
      if (name === 'present' && root.classList.contains('is-present')) setOpen(false);
    });
  };
})();
