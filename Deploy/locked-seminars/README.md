<!-- SPDX-License-Identifier: MIT -->
<!-- Copyright (c) 2026 Evgeny Baulin -->

# Locked seminars

The scripts that lock seminars 3–7 and release their keys. Each takes the seminar number and finds the rest
itself: the sources in `Seminars/Evgeny Baulin/theory/NN. <title>/` (`content/students.json`,
`content/teacher.json`, `figures/*.svg`), the page in `web/NN/`, the key in `release/NN/` of this folder.

## Build

From the repository root, seminar 3 here:

```zsh
setopt HIST_IGNORE_SPACE
 export SEMINAR_PASS='<password>'
python3 Deploy/locked-seminars/build_lock.py 3 && python3 Deploy/locked-seminars/roundtrip_test.py 3 && python3 Deploy/locked-seminars/check_public_leak.py 3; unset SEMINAR_PASS
```

The space before `export` keeps the password out of the shell history; `setopt HIST_IGNORE_SPACE` is needed once
per shell (or once in `~/.zshrc`). A rebuild without changes prints `unchanged` for every file. When
`locked.enc.js` changed, commit and publish it, and upload the new `release.json` to the server (below).
`build_lock.py 3 --fixture-only` rewrites only the self-test fixture and needs no password;
`check_public_leak.py 3 --no-git` skips the history, for a copy outside git. Once the class is over and its
`students.json` is committed, `check_public_leak.py` fails on it by design: it is a check for before the class.

| File | What it does |
| --- | --- |
| `build_lock.py` | encrypts `students.json` with the figures and `teacher.json` into `web/NN/js/locked.enc.js`, writes the raw students key to `release/NN/release.json` (folder 0700, file 0600) and the public test envelope `web/NN/selftest/fixture.js`. |
| `roundtrip_test.py` | opens `locked.enc.js` again with the password and the key, in Python and through `web/NN/js/crypto.js` in deno, and compares it with the sources. |
| `check_public_leak.py` | searches every shipped file and the git history for any locked sentence or number, and fails if a locked source or a key was ever committed. |
| `seminar_crypto.py` | PBKDF2-SHA256 and AES-256-GCM in plain Python, used by the other three. |
| `release.sh` | installed on the server as `/usr/local/sbin/seminar-03-release`. Before the unlock time it exits at once. Afterwards it checks the key file, copies it into `seminars/3/` of the release that `/var/www/optimization-methods` points to (owned by the nginx user, mode 0644, written under a hidden name and renamed in one step), fetches it back over HTTPS and prints one line per action. It prints nothing when the file is already there. `--check` reports and changes nothing; `--force` skips the time check. |
| `seminar-03-release.service` | runs the script once, as root. |
| `seminar-03-release.timer` | starts the service at 11:20:00 UTC on 28.09.2026 and every two minutes. Every publish, scheduled switch or rollback points the web root at a release folder without the key; the next run puts it back, so it is missing for two minutes at most. |
| `release/` | the keys, one folder per seminar. Never committed and never in a publish. |
| `README.md` | this page. |

## Releasing the seminar 3 key

At the end of the class, 28.09.2026 at 14:20 Moscow time (11:20 UTC), the server copies the students key
`release.json` to `/seminars/3/release.json`. The page finds it within one poll and opens hints, solutions
and the handout for everyone. The key reaches the server only by SFTP, into `/root/seminar-release/`; it is
not in git and not in any publish.

## Install once

In a Termius terminal on the server, as root:

```bash
install -d -m 700 /root/seminar-release /root/seminar-release/seminar-03 /root/seminar-release/deploy
```

In Termius SFTP, upload `Deploy/locked-seminars/release/03/release.json` from the Mac into
`/root/seminar-release/seminar-03/`, and `release.sh`, `seminar-03-release.service` and
`seminar-03-release.timer` from `Deploy/locked-seminars/` into `/root/seminar-release/deploy/`. Then, in the
terminal:

```bash
chmod 600 /root/seminar-release/seminar-03/release.json
cd /root/seminar-release/deploy
install -m 0755 release.sh /usr/local/sbin/seminar-03-release
install -m 0644 seminar-03-release.service seminar-03-release.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now seminar-03-release.timer
systemctl list-timers seminar-03-release.timer
```

`list-timers` shows the next even minute, not 14:20: the service runs every two minutes and exits at once
until the unlock time.

The key must come from the same `build_lock.py` run as the `locked.enc.js` on the site. After a run that
prints anything other than `locked.enc.js: unchanged`, publish and upload the new `release.json` to the same
place; once the unlock time has passed, the next run replaces the copy.

## Before the class

```bash
curl -sI "https://optimization-methods.tarakan-tuc.ru/seminars/3/release.json" | head -n 1
seminar-03-release --check
```

`curl` must show 404. `--check` should print:

```text
key file      /root/seminar-release/seminar-03/release.json: valid, id seminar-03, mode 0600
unlock at     2026-09-28T11:20:00Z, in 3h 12m
web user      www-data:www-data
web root      /var/www/optimization-methods -> /srv/course-deploy/releases/course/<release>
release.json  not in the live release
URL           https://optimization-methods.tarakan-tuc.ru/seminars/3/release.json: HTTP 404, as it should be before the unlock time
```

Any other `key file` line, or `HTTP 200 before the unlock time`, has to be fixed before the class.

## At 14:20

```bash
journalctl -t seminar-03-release --no-pager
```

shows two lines within a second of 14:20:00, and the same two again after every later switch of the site:

```text
seminar-03: copied /root/seminar-release/seminar-03/release.json to /srv/course-deploy/releases/course/<release>/seminars/3/release.json (www-data:www-data, 0644)
seminar-03: https://optimization-methods.tarakan-tuc.ru/seminars/3/release.json answers 200 with the key file, id seminar-03
```

An error goes to the same log, and `systemctl status seminar-03-release.service` shows the last run.

## By hand

If the key is not on the site by 14:22 (timer not enabled, server down at 14:20):

```bash
seminar-03-release --force
```

`--force` skips only the time check. Never run it before 14:20: it would open the answers during the class.
After 14:20 plain `seminar-03-release` does the same, but prints nothing when the file is already in place.

## Another seminar

Each seminar gets its own key file, script copy and pair of units. Unlock times, from `Prompt.md` §6.5; they
must match `unlockAt` in that seminar's `config.js`:

| Seminar | Class, Moscow time | Unlock, Moscow time | `n` | `nn` | `day` | `utc` (unlock, UTC) |
| --- | --- | --- | --- | --- | --- | --- |
| 3 | 28.09.2026 13:00–14:20 | 14:20 | 3 | 03 | 2026-09-28 | 11:20 |
| 4 | 05.10.2026 13:00–14:20 | 14:20 | 4 | 04 | 2026-10-05 | 11:20 |
| 5 | 12.10.2026 13:00–14:20 | 14:20 | 5 | 05 | 2026-10-12 | 11:20 |
| 6 | 19.10.2026 11:10–12:30 | 12:30 | 6 | 06 | 2026-10-19 | 09:30 |
| 7 | 19.10.2026 12:40–14:00 | 14:00 | 7 | 07 | 2026-10-19 | 11:00 |

Moscow time is UTC+3 all year. On the Mac, `build_lock.py N` writes the key to
`Deploy/locked-seminars/release/NN/release.json`. With the seminar 3 files still in
`/root/seminar-release/deploy/`, put the four values of the row into the first line (seminar 4 here) and run
the block, uploading the key where the comment says:

```bash
n=4 nn=04 day=2026-10-05 utc=11:20
install -d -m 700 /root/seminar-release/seminar-$nn
# upload Deploy/locked-seminars/release/$nn/release.json into /root/seminar-release/seminar-$nn/ by SFTP, then:
chmod 600 /root/seminar-release/seminar-$nn/release.json
cd /root/seminar-release/deploy
s="s/seminar-03/seminar-$nn/g; s#seminars/3#seminars/$n#g; s/Seminar 3/Seminar $n/g"
s="$s; s/2026-09-28T11:20/${day}T$utc/g; s/2026-09-28 11:20/$day $utc/g"
sed "$s" release.sh > /usr/local/sbin/seminar-$nn-release
chmod 755 /usr/local/sbin/seminar-$nn-release
sed "$s" seminar-03-release.service > /etc/systemd/system/seminar-$nn-release.service
sed "$s" seminar-03-release.timer > /etc/systemd/system/seminar-$nn-release.timer
systemctl daemon-reload
systemctl enable --now seminar-$nn-release.timer
seminar-$nn-release --check
```

The substitutions change the key file, the folder, the id and the unlock time, which are the defaults at the
top of the script, and `OnCalendar` of the timer. Everything else stays as for seminar 3.

Keep every timer enabled for as long as its page should stay open: once a timer is off, the next publish
takes that key off the site. `systemctl disable --now seminar-03-release.timer` turns one off.

## nginx

nginx stays as it is. The page fetches `release.json` with `cache: "no-store"` and a query that changes on
every request, so no cache can keep an old answer, and no `Cache-Control` header is needed (the server sends
`Cache-Control: no-cache` with every answer anyway, see `Deploy/README.md`). Before the unlock time the file
is simply missing, so nginx answers 404; it lists no folders, and the seminar folder has its own
`index.html`. The hidden name the copy is written under first gets 403 from nginx, like every dot-file.

Only if nginx is changed one day, this goes into the `server` block of the site, followed by
`nginx -t && systemctl reload nginx`:

```nginx
location ~ ^/seminars/[0-9]+/release\.json$ {
    add_header Cache-Control "no-store" always;
}
```

An `add_header` inside a `location` drops the `add_header` lines of the `server` block for that location, so
any others the site needs have to be repeated there.
