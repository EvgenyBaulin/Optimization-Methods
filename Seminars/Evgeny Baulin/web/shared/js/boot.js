// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Runs in <head> before the first paint. It resolves the theme and the language
// from the URL, then from storage, then from the system, so the page never flashes the wrong theme.
// Theme and language are course-wide (om.theme, om.lang); the language is shared with the Atlas (atlas.lang).
(function () {
  'use strict';
  var SEM = (window.SEM = window.SEM || {});
  var params = {};
  try {
    new URLSearchParams(window.location.search).forEach(function (value, key) {
      params[key] = value;
    });
  } catch (e) {
    params = {};
  }

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  var themeOverride = null;
  if (params.theme === 'light' || params.theme === 'dark') themeOverride = params.theme;
  else {
    var stored = read('om.theme');
    if (stored === 'light' || stored === 'dark') themeOverride = stored;
  }
  var systemDark = false;
  try {
    systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {
    systemDark = false;
  }
  var theme = themeOverride || (systemDark ? 'dark' : 'light');

  var root = document.documentElement;
  var lang = params.lang === 'en' || params.lang === 'ru' ? params.lang : read('om.lang');
  if (lang !== 'en' && lang !== 'ru') lang = read('atlas.lang');
  // the language chosen on the URL or elsewhere in the course, before a page in one language overrides it
  var chosen = lang === 'en' || lang === 'ru' ? lang : null;
  if (!chosen) lang = 'en';
  // a seminar written in one language (<html data-langs="en">) is shown in it, whatever was chosen elsewhere
  var only = root.getAttribute('data-langs');
  var langs = only === 'en' || only === 'ru' ? [only] : ['en', 'ru'];
  if (langs.indexOf(lang) < 0) lang = langs[0];

  root.setAttribute('data-theme', theme);
  root.setAttribute('lang', lang);
  if (params.present === '1') root.classList.add('is-present');
  // a locked seminar (<html data-lock>) opens instructor mode only after the instructor has signed in
  if (params.instructor === '1' && !root.hasAttribute('data-lock')) root.classList.add('is-instructor');

  SEM.boot = {
    params: params,
    theme: theme,
    themeFromUrl: params.theme === 'light' || params.theme === 'dark',
    themeOverride: themeOverride,
    lang: lang,
    langs: langs,
    chosen: chosen,
    langFromUrl: langs.length > 1 && (params.lang === 'en' || params.lang === 'ru')
  };
})();
