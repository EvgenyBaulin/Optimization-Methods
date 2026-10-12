// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// The browser crypto check: derives the fixture key, opens the fixture envelope and compares text and SHA-256.
(function () {
  'use strict';
  var SEM = (window.SEM = window.SEM || {});
  var fixture = window.SeminarFixture || null;
  var running = false;

  function $(id) {
    return document.getElementById(id);
  }

  function put(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  function hex(buffer) {
    var bytes = new Uint8Array(buffer);
    var out = '';
    for (var i = 0; i < bytes.length; i++) out += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
    return out;
  }

  function now() {
    return window.performance && performance.now ? performance.now() : new Date().getTime();
  }

  function finish(result, message) {
    document.documentElement.setAttribute('data-result', result);
    put('out-result', result);
    var verdict = $('verdict');
    verdict.textContent = message;
    verdict.className = 'feedback ' + (result === 'pass' ? 'is-ok' : 'is-bad');
    $('run').disabled = false;
    running = false;
  }

  function environment() {
    var secure = window.isSecureContext === true;
    var subtle = !!(window.crypto && window.crypto.subtle);
    put('out-secure', window.isSecureContext === undefined ? 'unknown (no isSecureContext)' : secure ? 'yes' : 'no');
    put('out-subtle', subtle ? 'present' : 'missing');
    put('out-protocol', window.location.protocol + (window.location.host ? '//' + window.location.host : ''));
    put('out-agent', navigator.userAgent);
    return subtle;
  }

  function run() {
    if (running) return;
    running = true;
    $('run').disabled = true;
    document.documentElement.setAttribute('data-result', 'running');
    put('out-result', 'running');
    put('out-derive', '');
    put('out-decrypt', '');
    put('out-compare', '');
    put('out-time', '');
    $('verdict').className = 'feedback';
    $('verdict').textContent = 'Running.';

    if (!SEM.crypto || !fixture) {
      finish('fail', 'crypto.js or fixture.js did not load.');
      return;
    }
    if (!environment()) {
      finish('unavailable', 'WebCrypto is not available here. Open the page over https or from a local server.');
      return;
    }

    var start = now();
    var derived = 0;
    var decrypted = 0;
    var text = '';
    SEM.crypto
      .deriveRaw(fixture.password, fixture.envelope.salt, fixture.iterations)
      .then(function (raw) {
        derived = now();
        put('out-derive', 'ok, ' + fixture.iterations + ' iterations in ' + Math.round(derived - start) + ' ms');
        return SEM.crypto.importKey(raw);
      })
      .then(function (key) {
        return SEM.crypto.decrypt(key, fixture.envelope, fixture.aad);
      })
      .then(function (bytes) {
        decrypted = now();
        put('out-decrypt', 'ok, ' + bytes.length + ' bytes in ' + Math.round(decrypted - derived) + ' ms');
        text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        return window.crypto.subtle.digest('SHA-256', bytes);
      })
      .then(function (digest) {
        var textOk = text === fixture.expect.text;
        var hashOk = hex(digest) === fixture.expect.sha256;
        var total = Math.round(now() - start);
        put('out-compare', (textOk ? 'text matches' : 'text differs') + ', ' + (hashOk ? 'hash matches' : 'hash differs'));
        put('out-time', total + ' ms');
        if (textOk && hashOk) finish('pass', 'Pass: this browser can open the seminar envelopes.');
        else finish('fail', 'Fail: the envelope opened, but not to the expected text.');
      })
      .catch(function (err) {
        put('out-time', Math.round(now() - start) + ' ms');
        finish('fail', 'Fail: ' + (err && err.message ? err.message : String(err)));
      });
  }

  function init() {
    environment();
    var button = $('run');
    button.disabled = false;
    button.addEventListener('click', run);
    $('verdict').textContent = fixture ? 'Ready.' : 'fixture.js did not load.';
    var auto = false;
    try {
      auto = new URLSearchParams(window.location.search).get('auto') === '1';
    } catch (e) {
      auto = false;
    }
    if (auto) run();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
