# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""PBKDF2-HMAC-SHA256 and AES-256-GCM for the locked seminar envelopes, with the standard library only.

The key is PBKDF2-HMAC-SHA256(NFC password, 16-byte salt, 310000 iterations, 32 bytes); the cipher is
AES-256-GCM with a 12-byte IV and the 16-byte tag appended to the ciphertext, which is the layout WebCrypto
reads. AES (FIPS-197) and GCM (NIST SP 800-38D) are implemented here in plain Python; when the package
`cryptography` is importable its AESGCM is used instead, unless the pure path is forced with `pure=True` or
the environment variable SEMINAR_CRYPTO_PURE=1. Run this file to check both paths against the published
test vectors.
"""

import base64
import hashlib
import hmac
import os
import struct
import unicodedata

try:
    from cryptography.exceptions import InvalidTag as _InvalidTag
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM as _AESGCM
except Exception:  # the package is optional
    _AESGCM = None
    _InvalidTag = None

ITERATIONS = 310000
SALT_BYTES = 16
IV_BYTES = 12
KEY_BYTES = 32
TAG_BYTES = 16


class AuthenticationError(ValueError):
    """Raised when a ciphertext does not authenticate: wrong key, wrong AAD or a modified envelope."""


# ---------------------------------------------------------------------------------------------- base64


def b64e(data):
    return base64.b64encode(bytes(data)).decode("ascii")


def b64d(text):
    if not isinstance(text, str):
        raise ValueError("base64 value must be a string")
    return base64.b64decode(text.encode("ascii"), validate=True)


# ---------------------------------------------------------------------------------------------- AES tables


def _xtime(a):
    a <<= 1
    return (a ^ 0x11B) if a & 0x100 else a


def _make_tables():
    exp = [0] * 255
    log = [0] * 256
    x = 1
    for i in range(255):
        exp[i] = x
        log[x] = i
        x ^= _xtime(x)  # multiply by the generator 3
    sbox = [0] * 256
    for a in range(256):
        inv = exp[(255 - log[a]) % 255] if a else 0
        s = inv
        r = inv
        for _ in range(4):
            r = ((r << 1) | (r >> 7)) & 0xFF
            s ^= r
        sbox[a] = s ^ 0x63
    te0 = []
    for a in range(256):
        s = sbox[a]
        s2 = _xtime(s)
        te0.append((s2 << 24) | (s << 16) | (s << 8) | (s2 ^ s))

    def rotr8(t):
        return [((w >> 8) | ((w & 0xFF) << 24)) for w in t]

    te1 = rotr8(te0)
    te2 = rotr8(te1)
    te3 = rotr8(te2)
    return sbox, te0, te1, te2, te3


_SBOX, _TE0, _TE1, _TE2, _TE3 = _make_tables()
_S24 = [s << 24 for s in _SBOX]
_S16 = [s << 16 for s in _SBOX]
_S8 = [s << 8 for s in _SBOX]
_BLOCK = struct.Struct(">IIII")


def _expand_key(key):
    """AES-256 key schedule: 60 round-key words."""
    if len(key) != KEY_BYTES:
        raise ValueError("AES-256 needs a 32-byte key")
    w = list(struct.unpack(">8I", key))
    rcon = 1
    for i in range(8, 60):
        t = w[i - 1]
        if i % 8 == 0:
            t = ((t << 8) | (t >> 24)) & 0xFFFFFFFF
            t = (_S24[t >> 24] | _S16[(t >> 16) & 255] | _S8[(t >> 8) & 255] | _SBOX[t & 255]) ^ (rcon << 24)
            rcon = _xtime(rcon)
        elif i % 8 == 4:
            t = _S24[t >> 24] | _S16[(t >> 16) & 255] | _S8[(t >> 8) & 255] | _SBOX[t & 255]
        w.append(w[i - 8] ^ t)
    return w


def _encrypt_words(rk, s0, s1, s2, s3):
    te0, te1, te2, te3 = _TE0, _TE1, _TE2, _TE3
    s0 ^= rk[0]
    s1 ^= rk[1]
    s2 ^= rk[2]
    s3 ^= rk[3]
    for r in range(4, 56, 4):
        t0 = te0[s0 >> 24] ^ te1[(s1 >> 16) & 255] ^ te2[(s2 >> 8) & 255] ^ te3[s3 & 255] ^ rk[r]
        t1 = te0[s1 >> 24] ^ te1[(s2 >> 16) & 255] ^ te2[(s3 >> 8) & 255] ^ te3[s0 & 255] ^ rk[r + 1]
        t2 = te0[s2 >> 24] ^ te1[(s3 >> 16) & 255] ^ te2[(s0 >> 8) & 255] ^ te3[s1 & 255] ^ rk[r + 2]
        s3 = te0[s3 >> 24] ^ te1[(s0 >> 16) & 255] ^ te2[(s1 >> 8) & 255] ^ te3[s2 & 255] ^ rk[r + 3]
        s0, s1, s2 = t0, t1, t2
    a, b, c, d = _S24, _S16, _S8, _SBOX
    return (
        (a[s0 >> 24] | b[(s1 >> 16) & 255] | c[(s2 >> 8) & 255] | d[s3 & 255]) ^ rk[56],
        (a[s1 >> 24] | b[(s2 >> 16) & 255] | c[(s3 >> 8) & 255] | d[s0 & 255]) ^ rk[57],
        (a[s2 >> 24] | b[(s3 >> 16) & 255] | c[(s0 >> 8) & 255] | d[s1 & 255]) ^ rk[58],
        (a[s3 >> 24] | b[(s0 >> 16) & 255] | c[(s1 >> 8) & 255] | d[s2 & 255]) ^ rk[59],
    )


def aes256_encrypt_block(key, block):
    """One AES-256 block, for the FIPS-197 check."""
    if len(block) != 16:
        raise ValueError("AES block must be 16 bytes")
    return _BLOCK.pack(*_encrypt_words(_expand_key(key), *_BLOCK.unpack(block)))


def _keystream(rk, iv, first, count):
    """The CTR keystream of GCM: blocks E(K, IV || ctr) for ctr = first .. first + count - 1 (mod 2^32)."""
    w0, w1, w2 = struct.unpack(">III", iv)
    pack = _BLOCK.pack
    enc = _encrypt_words
    out = [pack(*enc(rk, w0, w1, w2, (first + j) & 0xFFFFFFFF)) for j in range(count)]
    return b"".join(out)


# ---------------------------------------------------------------------------------------------- GHASH

_R = 0xE1 << 120


def _ghash_tables(h):
    """16 tables of 256 entries: tables[i][b] = (b placed in byte i of a block) times H in GF(2^128)."""
    powers = [0] * 128  # powers[k] = (the block with bit k set, bit 0 = least significant) times H
    v = h
    for i in range(128):
        powers[127 - i] = v
        v = (v >> 1) ^ _R if v & 1 else v >> 1
    tables = []
    for i in range(16):
        base = 8 * (15 - i)
        t = [0] * 256
        for b in range(1, 256):
            low = b & -b
            t[b] = t[b ^ low] ^ powers[base + low.bit_length() - 1]
        tables.append(t)
    return tables


def _ghash(tables, aad, ct):
    t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15 = tables
    y = 0
    from_bytes = int.from_bytes
    for data in (aad, ct):
        n = len(data)
        if n % 16:
            data = data + b"\x00" * (16 - n % 16)
        for i in range(0, len(data), 16):
            b = (y ^ from_bytes(data[i:i + 16], "big")).to_bytes(16, "big")
            y = (t0[b[0]] ^ t1[b[1]] ^ t2[b[2]] ^ t3[b[3]] ^ t4[b[4]] ^ t5[b[5]] ^ t6[b[6]] ^ t7[b[7]]
                 ^ t8[b[8]] ^ t9[b[9]] ^ t10[b[10]] ^ t11[b[11]] ^ t12[b[12]] ^ t13[b[13]] ^ t14[b[14]]
                 ^ t15[b[15]])
    lengths = ((8 * len(aad)) << 64) | (8 * len(ct))
    b = (y ^ lengths).to_bytes(16, "big")
    return (t0[b[0]] ^ t1[b[1]] ^ t2[b[2]] ^ t3[b[3]] ^ t4[b[4]] ^ t5[b[5]] ^ t6[b[6]] ^ t7[b[7]]
            ^ t8[b[8]] ^ t9[b[9]] ^ t10[b[10]] ^ t11[b[11]] ^ t12[b[12]] ^ t13[b[13]] ^ t14[b[14]]
            ^ t15[b[15]])


def _xor(data, stream):
    n = len(data)
    if not n:
        return b""
    return (int.from_bytes(data, "big") ^ int.from_bytes(stream[:n], "big")).to_bytes(n, "big")


def _gcm_setup(key, iv):
    if len(iv) != IV_BYTES:
        raise ValueError("GCM IV must be 12 bytes")
    rk = _expand_key(key)
    h = int.from_bytes(_BLOCK.pack(*_encrypt_words(rk, 0, 0, 0, 0)), "big")
    s = int.from_bytes(_keystream(rk, iv, 1, 1), "big")  # E(K, J0) with J0 = IV || 0^31 || 1
    return rk, _ghash_tables(h), s


def _pure_encrypt(key, iv, plaintext, aad):
    rk, tables, s = _gcm_setup(key, iv)
    ct = _xor(plaintext, _keystream(rk, iv, 2, (len(plaintext) + 15) // 16))
    tag = (_ghash(tables, aad, ct) ^ s).to_bytes(16, "big")
    return ct + tag


def _pure_decrypt(key, iv, data, aad):
    if len(data) < TAG_BYTES:
        raise AuthenticationError("ciphertext is shorter than the tag")
    ct, tag = data[:-TAG_BYTES], data[-TAG_BYTES:]
    rk, tables, s = _gcm_setup(key, iv)
    expected = (_ghash(tables, aad, ct) ^ s).to_bytes(16, "big")
    if not hmac.compare_digest(expected, tag):
        raise AuthenticationError("authentication failed")
    return _xor(ct, _keystream(rk, iv, 2, (len(ct) + 15) // 16))


# ---------------------------------------------------------------------------------------------- AES-GCM


def backend_available():
    return _AESGCM is not None


def _use_pure(pure):
    if pure is None:
        return _AESGCM is None or os.environ.get("SEMINAR_CRYPTO_PURE") == "1"
    if not pure and _AESGCM is None:
        raise RuntimeError("the package cryptography is not installed")
    return bool(pure)


def backend_name(pure=None):
    return "pure Python" if _use_pure(pure) else "cryptography"


def aes_gcm_encrypt(key, iv, plaintext, aad=b"", pure=None):
    """AES-256-GCM: returns ciphertext || 16-byte tag."""
    key, iv, plaintext, aad = bytes(key), bytes(iv), bytes(plaintext), bytes(aad)
    if len(key) != KEY_BYTES:
        raise ValueError("AES-256 needs a 32-byte key")
    if len(iv) != IV_BYTES:
        raise ValueError("GCM IV must be 12 bytes")
    if _use_pure(pure):
        return _pure_encrypt(key, iv, plaintext, aad)
    return _AESGCM(key).encrypt(iv, plaintext, aad)


def aes_gcm_decrypt(key, iv, data, aad=b"", pure=None):
    """Inverse of aes_gcm_encrypt; raises AuthenticationError when the tag does not verify."""
    key, iv, data, aad = bytes(key), bytes(iv), bytes(data), bytes(aad)
    if len(key) != KEY_BYTES:
        raise ValueError("AES-256 needs a 32-byte key")
    if len(iv) != IV_BYTES:
        raise ValueError("GCM IV must be 12 bytes")
    if _use_pure(pure):
        return _pure_decrypt(key, iv, data, aad)
    if len(data) < TAG_BYTES:
        raise AuthenticationError("ciphertext is shorter than the tag")
    try:
        return _AESGCM(key).decrypt(iv, data, aad)
    except _InvalidTag:
        raise AuthenticationError("authentication failed") from None


# ---------------------------------------------------------------------------------------------- keys and envelopes


def password_bytes(password):
    if not isinstance(password, str):
        raise TypeError("password must be a str")
    return unicodedata.normalize("NFC", password).encode("utf-8")


def derive_key(password, salt, iterations=ITERATIONS):
    """PBKDF2-HMAC-SHA256 of the NFC-normalized password: the raw 32-byte AES key."""
    return hashlib.pbkdf2_hmac("sha256", password_bytes(password), bytes(salt), int(iterations), KEY_BYTES)


def _aad_bytes(aad):
    return aad.encode("utf-8") if isinstance(aad, str) else bytes(aad)


def seal(key, plaintext, aad, salt, iv=None, pure=None):
    """Encrypts under a given key; the salt is only recorded so that the password can derive the key again."""
    iv = os.urandom(IV_BYTES) if iv is None else bytes(iv)
    ct = aes_gcm_encrypt(key, iv, plaintext, _aad_bytes(aad), pure=pure)
    return {"salt": b64e(salt), "iv": b64e(iv), "ct": b64e(ct)}


def new_envelope(password, plaintext, aad, iterations=ITERATIONS, pure=None):
    """Fresh salt and IV. Returns (envelope, raw key)."""
    salt = os.urandom(SALT_BYTES)
    key = derive_key(password, salt, iterations)
    return seal(key, plaintext, aad, salt, pure=pure), key


def envelope_parts(envelope):
    """Decodes and checks an envelope {"salt", "iv", "ct"}; raises ValueError when it is malformed."""
    if not isinstance(envelope, dict) or set(envelope) != {"salt", "iv", "ct"}:
        raise ValueError("an envelope has exactly the keys salt, iv and ct")
    try:
        salt, iv, ct = b64d(envelope["salt"]), b64d(envelope["iv"]), b64d(envelope["ct"])
    except (ValueError, TypeError) as err:
        raise ValueError("an envelope field is not valid base64: %s" % err) from None
    if len(salt) != SALT_BYTES or len(iv) != IV_BYTES or len(ct) < TAG_BYTES:
        raise ValueError("an envelope field has the wrong length")
    return salt, iv, ct


def open_envelope(key, envelope, aad, pure=None):
    """Plaintext bytes of an envelope under a raw key; AuthenticationError when the key or AAD is wrong."""
    _, iv, ct = envelope_parts(envelope)
    return aes_gcm_decrypt(key, iv, ct, _aad_bytes(aad), pure=pure)


def open_with_password(password, envelope, aad, iterations=ITERATIONS, pure=None):
    """Returns (plaintext bytes, raw key)."""
    salt, _, _ = envelope_parts(envelope)
    key = derive_key(password, salt, iterations)
    return open_envelope(key, envelope, aad, pure=pure), key


# ---------------------------------------------------------------------------------------------- test vectors

_FIPS197_C3 = (
    "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
    "00112233445566778899aabbccddeeff",
    "8ea2b7ca516745bfeafc49904b496089",
)

# McGrew and Viega, "The Galois/Counter Mode of Operation (GCM)", test cases 13-16 (AES-256):
# (key, iv, plaintext, aad, ciphertext, tag)
_K15 = "feffe9928665731c6d6a8f9467308308feffe9928665731c6d6a8f9467308308"
_P15 = ("d9313225f88406e5a55909c5aff5269a86a7a9531534f7da2e4c303d8a318a72"
        "1c3c0c95956809532fcf0e2449a6b525b16aedf5aa0de657ba637b391aafd255")
_C15 = ("522dc1f099567d07f47f37a32a84427d643a8cdcbfe5c0c97598a2bd2555d1aa"
        "8cb08e48590dbb3da7b08b1056828838c5f61e6393ba7a0abcc9f662898015ad")
GCM_VECTORS = (
    ("0" * 64, "0" * 24, "", "", "", "530f8afbc74536b9a963b4f1c4cb738b"),
    ("0" * 64, "0" * 24, "0" * 32, "", "cea7403d4d606b6e074ec5d3baf39d18", "d0d1c8a799996bf0265b98b5d48ab919"),
    (_K15, "cafebabefacedbaddecaf888", _P15, "", _C15, "b094dac5d93471bdec1a502270e3cc6c"),
    (_K15, "cafebabefacedbaddecaf888", _P15[:120], "feedfacedeadbeeffeedfacedeadbeefabaddad2", _C15[:120],
     "76fc6ece0f4e1768cddf8853bb2d551b"),
)

# RFC 7914, section 11: PBKDF2-HMAC-SHA256("passwd", "salt", 1, 64)
_PBKDF2_VECTOR = ("passwd", b"salt", 1,
                  "55ac046e56e3089fec1691c22544b605f94185216dde0465e68b9d57c20dacbc"
                  "49ca9cccf179b645991664b39d77ef317c71b845b1e30bd509112041d3a19783")


def self_test(pure=None):
    """Checks AES-256, the four GCM vectors (both directions and a tampered tag) and PBKDF2.

    Raises AssertionError on a mismatch and returns the number of vectors checked."""
    checked = 0
    key, block, expected = (bytes.fromhex(x) for x in _FIPS197_C3)
    assert aes256_encrypt_block(key, block) == expected, "FIPS-197 C.3"
    checked += 1
    for n, (k, iv, p, a, c, t) in enumerate(GCM_VECTORS, start=13):
        k, iv, p, a, c, t = (bytes.fromhex(x) for x in (k, iv, p, a, c, t))
        out = aes_gcm_encrypt(k, iv, p, a, pure=pure)
        assert out == c + t, "GCM test case %d: encryption" % n
        assert aes_gcm_decrypt(k, iv, out, a, pure=pure) == p, "GCM test case %d: decryption" % n
        bad = out[:-1] + bytes([out[-1] ^ 1])
        try:
            aes_gcm_decrypt(k, iv, bad, a, pure=pure)
        except AuthenticationError:
            pass
        else:
            raise AssertionError("GCM test case %d: a modified tag was accepted" % n)
        checked += 1
    pw, salt, rounds, dk = _PBKDF2_VECTOR
    assert hashlib.pbkdf2_hmac("sha256", password_bytes(pw), salt, rounds, 64).hex() == dk, "PBKDF2 RFC 7914"
    checked += 1
    return checked


def _main():
    import time

    paths = [True] + ([False] if backend_available() else [])
    for pure in paths:
        n = self_test(pure=pure)
        data = os.urandom(1 << 20)
        key, iv = os.urandom(KEY_BYTES), os.urandom(IV_BYTES)
        start = time.perf_counter()
        ct = aes_gcm_encrypt(key, iv, data, b"bench", pure=pure)
        assert aes_gcm_decrypt(key, iv, ct, b"bench", pure=pure) == data
        elapsed = time.perf_counter() - start
        print("%s: %d vectors ok, 1 MiB encrypted and decrypted in %.2f s" % (backend_name(pure), n, elapsed))


if __name__ == "__main__":
    _main()
