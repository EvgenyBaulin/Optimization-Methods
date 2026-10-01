// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// SEM.crypto: PBKDF2-SHA256 keys and AES-256-GCM envelopes through WebCrypto, as Deploy/locked-seminars/build_lock.py writes them.
(function (root) {
  'use strict';
  var SEM = (root.SEM = root.SEM || {});

  var KEY_BYTES = 32;
  var IV_BYTES = 12;
  var TAG_BYTES = 16;

  function subtle() {
    var c = root.crypto;
    if (!c || !c.subtle) throw new Error('WebCrypto is not available here');
    return c.subtle;
  }

  // Needs a secure context: https, localhost, and file:// in some browsers only.
  function available() {
    try {
      return !!(root.isSecureContext && root.crypto && root.crypto.subtle);
    } catch (e) {
      return false;
    }
  }

  // Standard alphabet with padding; checked without a backtracking regex, since a payload can be a megabyte.
  function isBase64(str) {
    if (typeof str !== 'string' || str.length % 4 !== 0 || /[^A-Za-z0-9+\/=]/.test(str)) return false;
    var pad = str.indexOf('=');
    return pad < 0 || (pad >= str.length - 2 && (pad === str.length - 1 || str.charAt(str.length - 1) === '='));
  }

  function b64decode(str) {
    if (!isBase64(str)) throw new Error('not base64');
    var bin = root.atob(str);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function b64encode(bytes) {
    var view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    var parts = [];
    for (var i = 0; i < view.length; i += 0x8000) {
      parts.push(String.fromCharCode.apply(null, view.subarray(i, i + 0x8000)));
    }
    return root.btoa(parts.join(''));
  }

  function utf8(text) {
    return new TextEncoder().encode(text);
  }

  // The raw 32-byte key: PBKDF2-HMAC-SHA256 of the NFC-normalized password.
  function deriveRaw(password, saltB64, iterations) {
    return Promise.resolve()
      .then(function () {
        var pw = String(password);
        if (typeof pw.normalize === 'function') pw = pw.normalize('NFC');
        var n = Number(iterations);
        if (!(n >= 1 && n <= 10000000 && Math.floor(n) === n)) throw new Error('bad iteration count');
        var salt = b64decode(saltB64);
        var s = subtle();
        return s.importKey('raw', utf8(pw), 'PBKDF2', false, ['deriveBits']).then(function (base) {
          return s.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: n }, base, KEY_BYTES * 8);
        });
      })
      .then(function (bits) {
        return new Uint8Array(bits);
      });
  }

  // A decrypt-only, non-extractable AES-GCM key from 32 raw bytes.
  function importKey(raw) {
    return Promise.resolve().then(function () {
      var bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
      if (bytes.length !== KEY_BYTES) throw new Error('an AES-256 key has 32 bytes');
      return subtle().importKey('raw', bytes, { name: 'AES-GCM' }, false, ['decrypt']);
    });
  }

  // The plaintext bytes of an envelope {salt, iv, ct}; rejects when the key, the AAD or the envelope is wrong.
  function decrypt(key, envelope, aad) {
    return Promise.resolve()
      .then(function () {
        if (!envelope || typeof envelope !== 'object') throw new Error('no envelope');
        var iv = b64decode(envelope.iv);
        var ct = b64decode(envelope.ct);
        if (iv.length !== IV_BYTES || ct.length < TAG_BYTES) throw new Error('malformed envelope');
        return subtle().decrypt({ name: 'AES-GCM', iv: iv, additionalData: utf8(String(aad)), tagLength: 128 }, key, ct);
      })
      .then(function (plain) {
        return new Uint8Array(plain);
      });
  }

  // The JSON payload of an envelope. Any rejection means "wrong key" to the caller.
  function open(key, envelope, aad) {
    return decrypt(key, envelope, aad).then(function (bytes) {
      return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    });
  }

  SEM.crypto = {
    available: available,
    b64decode: b64decode,
    b64encode: b64encode,
    deriveRaw: deriveRaw,
    importKey: importKey,
    decrypt: decrypt,
    open: open
  };
})(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : this);
