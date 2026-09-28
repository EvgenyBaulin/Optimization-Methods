// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 3: when the locked part opens and how the page asks the server for it (js/access.js).
//
// The page never opens on the strength of its own clock: unlockAt only tells it when to start asking for
// releaseUrl (a file the server publishes at that moment, see Deploy/locked-seminars). The instructor
// opens both envelopes earlier with the password; teacherUser is a courtesy, the password is the check.
//
// The unlock moments of the next seminars, Moscow time (+03:00), for their own config.js:
//   seminar 4  2026-10-05T14:20:00+03:00      seminar 6  2026-10-19T12:30:00+03:00
//   seminar 5  2026-10-12T14:20:00+03:00      seminar 7  2026-10-19T14:00:00+03:00
(function () {
  'use strict';
  var SEM = (window.SEM = window.SEM || {});
  SEM.config = {
    id: 'seminar-03',
    unlockAt: '2026-09-28T14:20:00+03:00',
    // from the seminar folder: /seminars/3/release.json on the site
    releaseUrl: 'release.json',
    // start asking this many minutes before unlockAt, every pollSeconds, for pollWindowMinutes
    pollLeadMinutes: 2,
    pollSeconds: 30,
    pollWindowMinutes: 45,
    teacherUser: 'baulin'
  };
})();
