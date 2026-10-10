// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
(function () {
  'use strict';
  var SEM = (window.SEM = window.SEM || {});
  SEM.config = {
    id: 'seminar-05',
    unlockAt: '2026-10-12T14:20:00+03:00',
    // from the seminar folder: /seminars/5/release.json on the site
    releaseUrl: 'release.json',
    // start asking this many minutes before unlockAt, every pollSeconds, for pollWindowMinutes
    pollLeadMinutes: 2,
    pollSeconds: 30,
    pollWindowMinutes: 45,
    teacherUser: 'baulin'
  };
})();
