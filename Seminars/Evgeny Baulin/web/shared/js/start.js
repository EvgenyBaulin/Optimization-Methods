// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Loaded last on every page: builds the page named in <html data-page>.
(function () {
  'use strict';
  var SEM = window.SEM;
  var page = document.documentElement.getAttribute('data-page') || 'main';
  if (page === 'main') SEM.app.startMain();
  else SEM.app.startPage(page, SEM.pages[page]);

  // Printing expands every collapsible part.
  window.addEventListener('beforeprint', function () {
    SEM.dom.qsa('details').forEach(function (d) {
      d.setAttribute('data-print-open', d.open ? '1' : '0');
      d.open = true;
    });
  });
  window.addEventListener('afterprint', function () {
    SEM.dom.qsa('details[data-print-open]').forEach(function (d) {
      d.open = d.getAttribute('data-print-open') === '1';
      d.removeAttribute('data-print-open');
    });
  });
})();
