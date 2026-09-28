# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Opens web/NN/js/locked.enc.js with SEMINAR_PASS the way the page does and compares it with the sources.

Checks that both envelopes decrypt to content/students.json (with the figures) and content/teacher.json of the
theory folder of the seminar, that release/NN/release.json in this folder holds the students key and opens the
students envelope, that neither key opens the other envelope, that a wrong password and a modified byte are both
rejected, and that the cipher passes its test vectors. When deno is installed it then runs web/NN/js/crypto.js
itself on the same file. The password travels only through the environment, never through the command line.

    read -rs SEMINAR_PASS && export SEMINAR_PASS
    python3 Deploy/locked-seminars/roundtrip_test.py 3
"""

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))

import build_lock  # noqa: E402
import seminar_crypto as sc  # noqa: E402

ORDER = ["v", "id", "kdf", "iterations", "cipher", "students", "teacher"]

DENO_RUNNER = r"""
const [cryptoPath, lockedPath, releasePath] = Deno.args;
const load = (path) => new Function('window', 'self', 'crypto', Deno.readTextFileSync(path));
load(cryptoPath)(globalThis, globalThis, globalThis.crypto);
load(lockedPath)(globalThis, globalThis, globalThis.crypto);
const C = globalThis.SEM.crypto;
const L = globalThis.SeminarLocked;
const pw = Deno.env.get('SEMINAR_PASS');
const aad = (name) => L.id + '/' + name;
const hex = async (bytes) =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (b) => b.toString(16).padStart(2, '0')).join('');
const rejects = async (promise) => { try { await promise; return false; } catch (e) { return true; } };
const out = { payloads: {}, keys: {} };
const keys = {};
for (const name of ['students', 'teacher']) {
  const raw = await C.deriveRaw(pw, L[name].salt, L.iterations);
  if (!(raw instanceof Uint8Array) || raw.length !== 32) throw new Error('deriveRaw did not give 32 bytes');
  keys[name] = await C.importKey(raw);
  out.payloads[name] = await C.open(keys[name], L[name], aad(name));
  out.keys[name] = await hex(raw);
  const again = C.b64decode(C.b64encode(raw));
  if (again.length !== 32 || again.some((b, i) => b !== raw[i])) throw new Error('base64 round trip');
}
out.cross = (await rejects(C.open(keys.students, L.teacher, aad('teacher'))))
  && (await rejects(C.open(keys.teacher, L.students, aad('students'))));
const wrong = await C.importKey(await C.deriveRaw(pw + 'x', L.students.salt, L.iterations));
out.wrong = await rejects(C.open(wrong, L.students, aad('students')));
out.wrongAad = await rejects(C.open(keys.students, L.students, aad('teacher')));
if (releasePath) {
  const release = JSON.parse(Deno.readTextFileSync(releasePath));
  const k = await C.importKey(C.b64decode(release.key));
  const p = await C.open(k, L.students, aad('students'));
  out.release = JSON.stringify(p) === JSON.stringify(out.payloads.students);
}
console.log(JSON.stringify(out));
"""


class Failure(Exception):
    pass


def check(condition, message):
    if not condition:
        raise Failure(message)


def rejected(fn):
    try:
        fn()
    except ValueError:  # AuthenticationError or a malformed envelope
        return True
    return False


def read_locked(sem, path):
    text, obj = build_lock.read_marked_json(path)
    check(text is not None, "%s is missing" % path)
    check(obj is not None, "%s has no strict JSON between the markers" % path)
    check(list(obj) == ORDER, "locked.enc.js keys are %s, expected %s" % (list(obj), ORDER))
    check(obj["v"] == 1 and obj["id"] == sem.id, "wrong v or id in locked.enc.js")
    check(obj["kdf"] == "PBKDF2-SHA256" and obj["cipher"] == "AES-256-GCM", "wrong kdf or cipher")
    check(obj["iterations"] == sc.ITERATIONS, "iterations must be %d" % sc.ITERATIONS)
    check(text.startswith(build_lock.locked_header(sem) + "window.SeminarLocked = /*JSON-BEGIN*/"), "wrong header")
    for name in ("students", "teacher"):
        check(list(obj[name]) == ["salt", "iv", "ct"], "%s envelope keys must be salt, iv, ct" % name)
        sc.envelope_parts(obj[name])
    check(text == build_lock.render_locked(sem, obj["students"], obj["teacher"]),
          "locked.enc.js is not in canonical form")
    return obj


def run_deno(deno, web, locked_path, release_path, password):
    crypto_js = web / "js" / "crypto.js"
    with tempfile.TemporaryDirectory(prefix="roundtrip-") as tmp:
        runner = Path(tmp) / "runner.mjs"
        runner.write_text(DENO_RUNNER, encoding="utf-8")
        readable = ",".join(str(p) for p in (crypto_js, locked_path, release_path) if p)
        cmd = [deno, "run", "--quiet", "--no-config", "--no-lock", "--allow-read=" + readable,
               "--allow-env=SEMINAR_PASS", str(runner), str(crypto_js), str(locked_path), str(release_path or "")]
        env = dict(os.environ, SEMINAR_PASS=password, DENO_NO_UPDATE_CHECK="1", NO_COLOR="1")
        result = subprocess.run(cmd, cwd=tmp, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode:
        raise Failure("deno: " + result.stderr.decode("utf-8", "replace").strip()[-2000:])
    return json.loads(result.stdout.decode("utf-8"))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    build_lock.add_seminar_arguments(parser)
    args = parser.parse_args(argv)

    password = os.environ.get("SEMINAR_PASS")
    if not password:
        print("roundtrip_test: SEMINAR_PASS is not set (read -rs SEMINAR_PASS && export SEMINAR_PASS)",
              file=sys.stderr)
        return 2

    try:
        sem = build_lock.Seminar(args.seminar, args.theory, args.web)
        vectors = sc.self_test(pure=True)
        if sc.backend_available():
            sc.self_test(pure=False)

        locked_path = sem.web / "js" / "locked.enc.js"
        locked = read_locked(sem, locked_path)
        students_src, teacher_src = build_lock.build_payloads(sem)
        expected = {"students": students_src, "teacher": teacher_src}
        plain, keys, opened = {}, {}, {}
        for name in ("students", "teacher"):
            env = locked[name]
            try:
                plain[name], keys[name] = sc.open_with_password(password, env, sem.aad(name), locked["iterations"])
            except ValueError:
                raise Failure("the %s envelope does not open with SEMINAR_PASS" % name) from None
            text = plain[name].decode("utf-8")
            opened[name] = json.loads(text)
            check(opened[name] == expected[name], "the %s payload differs from its sources" % name)
            check(plain[name] == build_lock.canonical(expected[name]), "the %s plaintext is not canonical" % name)
        s, t = opened["students"], opened["teacher"]
        check(set(s) == {"v", "id", "data", "content", "figures"}, "students payload keys")
        check(set(t) == {"v", "id", "data", "content"}, "teacher payload keys")
        check(keys["students"] != keys["teacher"], "the two keys are equal")
        check(locked["students"]["salt"] != locked["teacher"]["salt"], "the two salts are equal")

        check(rejected(lambda: sc.open_envelope(keys["students"], locked["teacher"], sem.aad("teacher"))),
              "the students key opens the teacher envelope")
        check(rejected(lambda: sc.open_envelope(keys["teacher"], locked["students"], sem.aad("students"))),
              "the teacher key opens the students envelope")
        check(rejected(lambda: sc.open_with_password(password + "x", locked["students"], sem.aad("students"))),
              "a wrong password opens the students envelope")
        check(rejected(lambda: sc.open_envelope(keys["students"], locked["students"], sem.aad("teacher"))),
              "the students envelope opens with the teacher AAD")
        ct = bytearray(sc.b64d(locked["students"]["ct"]))
        for i in (0, len(ct) // 2, len(ct) - 1):
            bad = bytearray(ct)
            bad[i] ^= 0x01
            env = dict(locked["students"], ct=sc.b64e(bytes(bad)))
            check(rejected(lambda: sc.open_envelope(keys["students"], env, sem.aad("students"))),
                  "a ciphertext with byte %d modified was accepted" % i)
        for field in ("iv", "salt"):
            raw = bytearray(sc.b64d(locked["students"][field]))
            raw[0] ^= 0x80
            env = dict(locked["students"], **{field: sc.b64e(bytes(raw))})
            check(rejected(lambda: sc.open_with_password(password, env, sem.aad("students"))),
                  "a modified %s was accepted" % field)

        release_path = sem.release
        release_name = build_lock.rel(release_path, build_lock.ROOT)
        check(release_path.is_file(), "%s is missing; run build_lock.py" % release_name)
        release = json.loads(release_path.read_text(encoding="utf-8"))
        check(set(release) == {"id", "key"} and release["id"] == sem.id, "release.json fields")
        check(sc.b64d(release["key"]) == keys["students"], "release.json does not hold the students key")
        check(sc.open_envelope(sc.b64d(release["key"]), locked["students"], sem.aad("students"))
              == plain["students"], "release.json does not open the students envelope")
        check(rejected(lambda: sc.open_envelope(sc.b64d(release["key"]), locked["teacher"],
                                                sem.aad("teacher"))), "release.json opens the teacher envelope")
        if os.name == "posix":
            check(release_path.stat().st_mode & 0o777 == 0o600, "release.json must have mode 0600")
            check(release_path.parent.stat().st_mode & 0o777 == 0o700,
                  "%s must have mode 0700" % build_lock.rel(release_path.parent, build_lock.ROOT))

        deno = shutil.which("deno")
        if deno:
            out = run_deno(deno, sem.web, locked_path, release_path, password)
            for name in ("students", "teacher"):
                check(out["payloads"][name] == opened[name], "crypto.js opens %s to a different payload" % name)
                check(out["keys"][name] == hashlib.sha256(keys[name]).hexdigest(),
                      "crypto.js derives a different %s key" % name)
            check(out["cross"] is True, "crypto.js: a key opens the other envelope")
            check(out["wrong"] is True and out["wrongAad"] is True, "crypto.js accepts a wrong password or AAD")
            check(out.get("release") is True, "crypto.js cannot open the students envelope with release.json")
            deno_note = "crypto.js in deno ok"
        else:
            deno_note = "crypto.js in deno skipped (deno not found)"
    except Failure as err:
        print("roundtrip FAILED: %s" % err)
        return 1
    except (build_lock.BuildError, ValueError, OSError) as err:
        print("roundtrip FAILED: %s" % err)
        return 1

    print("roundtrip ok: students %d bytes with %d figure(s), teacher %d bytes; keys separate; release key opens "
          "students only; wrong password, wrong AAD and tampering rejected; %d test vectors (%s); %s"
          % (len(plain["students"]), len(s["figures"]), len(plain["teacher"]), vectors,
             "pure Python and cryptography" if sc.backend_available() else "pure Python", deno_note))
    return 0


if __name__ == "__main__":
    sys.exit(main())
