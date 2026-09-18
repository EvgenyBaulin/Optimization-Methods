# Publishing the course site

The site <https://optimization-methods.tarakan-tuc.ru> is built on the Mac and published by the
server. `Deploy/publish.py` packs the folders listed in `Deploy/publish.conf`, checks them and pushes
the result over SSH. On the server, `course-deploy` turns the push into a release, points the site at
it, checks it over HTTPS and goes back to the previous release if the check fails. A seminar with a
future date waits on the server and goes live about a minute after its time.

## How it works

```text
Mac: python3 Deploy/publish.py
  reads Deploy/publish.conf, packs only the listed folders (excludes applied), checks links,
  commits the bundle to refs/course-deploy/site (plumbing, working tree untouched)
        │  git push over SSH as user "deploy" (git-shell)
        ▼
Server: /srv/course-deploy/site.git  (branch "site")
  pre-receive   rejects other refs, deletions, links, forbidden files, oversized blobs
  post-receive  sudo -n /usr/local/bin/course-deploy hook   → result printed on the Mac
  timer         course-deploy every minute (local only) → scheduled publications, retries
        │
        ▼
  build release → validate → switch web root symlink → HTTPS check → roll back on failure
  /var/www/optimization-methods → /srv/course-deploy/releases/course/<release>/
```

On the Mac, `publish.py` copies the listed folders into a temporary bundle, leaving out the excluded
files, and lays the bundle out as the site to check its links. It commits the bundle with git plumbing
to `refs/course-deploy/site`. That is not a branch: the working tree and the index stay as they are,
and `git push` to GitHub never sends it. Then it pushes the commit to the branch `site` on the server
and prints what the server answers.

On the server, `pre-receive` checks the push first; a rejected push leaves nothing on disk. Then
`post-receive` runs `course-deploy hook` through sudo. It builds the site from the bundle into a new
release folder, adds the entry pages and folder indexes, checks the links again, writes `version.txt`,
switches the web root symlink to the new release with one atomic rename and fetches `/version.txt`
and every published path over HTTPS. If that check fails, the symlink goes back to the previous
release and the new one is deleted. The five newest releases are kept, plus the live one and the one
before it.

The timer runs `course-deploy` every minute. It does nothing until something is due: a seminar whose
time has come, or a retry of a failed run after 15 minutes. The HTTPS check goes to the server itself;
the only outside connection is to the mail server, if alerts are configured.

The server never runs code from the bundle. It only reads and copies files.

### What never leaves the Mac

Only the folders listed in `Deploy/publish.conf` are packed, and from them only the files git tracks
(with `--allow-dirty`, also untracked files that are not ignored). These never reach the server:

- `Lecture/`;
- the colleagues' folders `Seminars/Andrey Ignatov/`, `Seminars/Anna Matveeva/`,
  `Seminars/Ilya Kasimov/`;
- `Seminars/Evgeny Baulin/theory/` and `Seminars/Evgeny Baulin/checks/`;
- `Documents/`;
- any folder or file without a line in `publish.conf`: of `Seminars/Evgeny Baulin/web/` only the
  landing page `index.html`, `shared/` and the released seminar folders go out;
- files matched by `Deploy/exclude.txt` or the built-in patterns, and files ignored by git.

The server has its own guard: `pre-receive` refuses LaTeX files, notebooks, hidden files, symlinks
and files over 50 MB whatever the Mac sends.

A seminar with a future date reaches the server with the next publish, but it stays in
`/srv/course-deploy/site.git`, which nginx does not serve, until its time.

### Where things are

| In `Deploy/` | What it is |
| --- | --- |
| `publish.py` | run on the Mac: build, check, commit, push |
| `publish.conf` | what the site shows and from when; the only place that decides what goes live |
| `exclude.txt` | files the Mac never packs; the server applies the list again |
| `course-deploy-kit/` | the server side, uploaded once as `/root/course-deploy-kit` and installed by `install.sh` |
| `tests/` | the test suite (see [Tests](#tests)) |

| On the server | What it is |
| --- | --- |
| `/var/www/optimization-methods` | a symlink to the live release |
| `/srv/course-deploy/releases/course/` | one folder per release, each with a `.meta` file |
| `/srv/course-deploy/site.git` | the bundles pushed from the Mac, branch `site`, owned by `deploy` |
| `/srv/course-deploy/state/` | the last successful run and the last failure |
| `/etc/course-deploy/course-deploy.conf` | e-mail settings and advanced options (root only, 0600) |
| `/etc/course-deploy/sites.conf` | the sites: name, web root, URL |
| `/usr/local/bin/course-deploy`, `/usr/local/lib/course-deploy/` | the tool and `forbidden.txt` |
| `/etc/sudoers.d/course-deploy` | lets `deploy` run exactly `course-deploy hook` as root |
| `/etc/systemd/system/course-deploy.service`, `.timer` | the timer |
| `/usr/local/bin/atlas-deploy` | a stub that says how to publish now; the old script is `/root/atlas-deploy.old` |

## One-time setup

### 1. A key for the Mac

On the Mac:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/course_deploy -N "" -C "course-deploy mac"
```

The key has no passphrase, so publishing never asks for one. On the server it is restricted: it can
push to and fetch from the site repository and nothing else.

The address comes from the existing entry `Main_server` in `~/.ssh/config` (`HostName 89.191.229.171`,
`Port 22`, `User root`); nothing is added there. The push goes to that host as the user `deploy`, with
this key, which the repository sets up in step 3.

### 2. Install on the server

1. In Termius, open SFTP to the server and upload the folder `Deploy/course-deploy-kit` into `/root/`,
   so that it becomes `/root/course-deploy-kit`. Lost execute bits and stray `.DS_Store` files do not
   matter.
2. On the Mac, copy the public key: `pbcopy < ~/.ssh/course_deploy.pub`.
3. In a Termius terminal on the server, as root, paste it into:

   ```bash
   bash /root/course-deploy-kit/install.sh "<contents of ~/.ssh/course_deploy.pub>"
   ```

   The argument can also be the path of a `.pub` file on the server.

The installer adds only the packages that are missing, creates the `deploy` user with the shell
`git-shell`, the repository `/srv/course-deploy/site.git`, the configuration in `/etc/course-deploy/`,
the sudo rule and the systemd units. It moves the old `/usr/local/bin/atlas-deploy` to
`/root/atlas-deploy.old` and puts a stub in its place. It does not touch nginx or the site, and it does
not start the timer. It ends like this:

```text
Server is ready.

Host key fingerprints (compare them on the first connection from the Mac):
  256 SHA256:… root@… (ED25519)
  …

On the Mac:
  ssh -i ~/.ssh/course_deploy -o IdentitiesOnly=yes deploy@Main_server
                                         # expect "Interactive git shell is not enabled"
  python3 Deploy/publish.py --dry-run
  python3 Deploy/publish.py

Then on the server:
  systemctl enable --now course-deploy.timer
```

If it prints `Warning: sshd will refuse the deploy user because of 'AllowUsers …'`, add `deploy` to
that setting in `/etc/ssh/sshd_config` (or the file in `/etc/ssh/sshd_config.d/` that sets it) and run
`systemctl reload ssh`.

### 3. First connection

On the Mac:

```bash
ssh -i ~/.ssh/course_deploy -o IdentitiesOnly=yes deploy@Main_server
```

If ssh has not met the server before, it shows `ED25519 key fingerprint is SHA256:…`. Compare it with
the ED25519 line the installer printed and answer `yes` only if they are the same. The server then
answers `fatal: Interactive git shell is not enabled.` and closes the connection. That is the expected
result: the key works, and the account can do nothing but git.

Then, once, in the repository:

```bash
git remote add deploy deploy@Main_server:/srv/course-deploy/site.git
git config core.sshCommand "ssh -i ~/.ssh/course_deploy -o IdentitiesOnly=yes"
```

`deploy@` overrides the `User root` of `Main_server`, and `core.sshCommand` (stored in this
repository's `.git/config` only) makes git offer the deploy key; the `origin` remote on GitHub uses
HTTPS and is not affected. Never push the site as `root`: the repository belongs to `deploy`, and objects
written by root would lock it out.

### 4. First publish

`publish.py` publishes committed files, so commit `Atlas/` and `Seminars/Evgeny Baulin/web/` first (or
use `--allow-dirty`). Then:

```bash
python3 Deploy/publish.py --dry-run
python3 Deploy/publish.py
```

On this first run the server moves the old folder `/var/www/optimization-methods` to
`/srv/course-deploy/releases/course/00000000T000000Z-legacy` and puts the symlink in its place, so the
old atlas is one rollback away. The nginx configuration stays as it is: the web root keeps its path.
Open <https://optimization-methods.tarakan-tuc.ru/version.txt> to see the new release.

`/root/atlas-upload` is no longer used.

### 5. The timer

On the server:

```bash
systemctl enable --now course-deploy.timer
```

Without the timer, a scheduled seminar goes live only with the next publish from the Mac. The last line
of `course-deploy status` shows the timer state; `systemctl list-timers course-deploy.timer` shows the
next run.

E-mail alerts are optional; see [E-mail alerts](#e-mail-alerts).

## Daily use

### Publish

```bash
python3 Deploy/publish.py
```

It can be run from any folder: it finds the repository from its own location. Python 3.9 or newer is
enough; it needs nothing outside the standard library. It prints the plan, pushes and shows the
server's output as `remote:` lines. The result lines look like this:

```text
remote: course-deploy: OK course -> 20260918T071502Z-5d0c9e1 (/, /seminars/, /seminars/shared/)
remote: course-deploy: scheduled /seminars/02/ at 2026-09-25 18:10 Moscow time
```

and the last line is `Published.`

`course-deploy: OK nothing changed` means the server built the site and found it identical to the live
release. If the server already has this bundle (the same files and the same `publish.conf`),
`publish.py` does not push at all and prints `Nothing to publish: the server already has this build.`

Exit codes: 0 on success or nothing to publish; 1 on a refusal, a failed push, or a
`course-deploy: FAILED` or `course-deploy: REJECTED` line from the server; 2 on a usage error.

### publish.conf

One entry per line, four fields separated by `|`, spaces around them ignored:

```text
site | path | folder | publish from
```

| Field | Meaning |
| --- | --- |
| site | `course`; the names come from `Deploy/course-deploy-kit/sites.conf` |
| path | `/` or `/a/b/` with slashes at both ends; letters, digits, `.`, `_`, `-`, no part starting with `.` |
| folder | a folder of the repository, from its root, spelled exactly as on disk; spaces and commas are fine. It can also be a single file: the entry then holds that file alone |
| publish from | `now`, or `YYYY-MM-DD HH:MM` in Moscow time |

Lines starting with `#` and blank lines are ignored. A path may appear once per site. One bad line
makes the whole file invalid, and the error names the line.

The file now holds the atlas at `/`, the seminars' landing page `web/index.html` at `/seminars/` (a
line that names one file, so the seminar folders next to it stay out), the shared framework of the
seminar pages at `/seminars/shared/` (the pages load it as `../shared/`, so it has to sit next to the
seminar folders), and one commented line per seminar.

`publish.conf` is in `Deploy/` and does not have to be committed before a publish; the published
folders do.

### Schedule a seminar

To publish seminar 02 when its class ends, remove the `#` from its line and put the time in place of
`YYYY-MM-DD HH:MM`:

```text
course | /seminars/02/ | Seminars/Evgeny Baulin/web/02 | 2026-09-25 18:10
```

Publish once, at any time before the class. The server answers
`course-deploy: scheduled /seminars/02/ at 2026-09-25 18:10 Moscow time`, and `/seminars/02/` answers
404 until then. About a minute after 18:10 the timer publishes it with no further action, and an e-mail
arrives if alerts are set up. Changes to the seminar made before the class go out with the next publish
and stay hidden in the same way; the server publishes the last bundle it received.

A time in the past, or `now`, publishes the folder right away. Times are Moscow time whatever the Mac's
time zone is.

### Take something off the site

Delete its line, comment it out, or move its date into the future, then publish. Every release is built
from scratch, so the next one does not have it. A site is never published empty: if none of its entries
is released, the server leaves it as it is.

### Check before publishing

```bash
python3 Deploy/publish.py --dry-run
```

It builds and checks the bundle exactly as a publish does and prints the plan: for every entry its path
and folder, the publish time (`now`, or the date with a countdown such as `(in 2d 5h)`), the number of
files, where the entry page comes from, and the excluded files; then the link warnings. It writes
nothing to git and does not contact the server.

### publish.py

| Command | What it does |
| --- | --- |
| `python3 Deploy/publish.py` | build, check, commit, push; print the server output; exit 0 only if the server reports OK |
| `python3 Deploy/publish.py --dry-run` | build and check only; print the plan; no git writes, no network |
| `python3 Deploy/publish.py --allow-dirty` | also publish uncommitted and untracked (not ignored) files in the published folders; the build is marked `dirty: yes` |
| `python3 Deploy/publish.py --remote NAME` | push to the git remote `NAME` instead of `deploy` |
| `python3 Deploy/publish.py --help` | usage |
| `python3 Deploy/publish.py --version` | version |

`publish.py` never creates a branch, never touches the working tree or the index, and pushes nowhere
except `refs/heads/site` on the chosen remote.

### On the server

Every command except `--help` and `--version` needs root; the Termius session is root.

| Command | What it does |
| --- | --- |
| `course-deploy status` | per site: URL, live release, published paths, source commit and whether it was dirty, build times, kept releases, scheduled entries with a countdown; then the last failure and the timer state |
| `course-deploy schedule` | every entry of the current bundle: site, path, publish time, state (`live`, `in 2d 5h` or `due`), title |
| `course-deploy rollback course` | switch the site to the release before the live one and check it over HTTPS |
| `course-deploy --dry-run` | build and check the current bundle and print what would change; changes nothing |
| `course-deploy --force` | publish now, ignoring the "already deployed" record and the retry delay; prints the result lines |
| `course-deploy` | what the timer runs: publish what is due; prints nothing when there is nothing to do |
| `course-deploy hook` | what `post-receive` runs after a push; always rebuilds, prints progress and the result lines, sends no e-mail |
| `course-deploy test-notify` | send a test e-mail; prints `e-mail: OK` or the error |
| `course-deploy --help` | usage |
| `course-deploy --version` | version |

Exit codes: 0 on success or nothing to do, 1 on failure, 2 on a usage error (unknown arguments, an
unknown site for `rollback`).

`course-deploy status`:

```text
course  https://optimization-methods.tarakan-tuc.ru
  live release   20260918T071502Z-5d0c9e1
  paths          /, /seminars/, /seminars/shared/
  source         a9a55be (dirty: no), bundle built 2026-09-18T07:14:58Z by publish.py 1.0.0
  release built  2026-09-18T07:15:02Z
  releases kept  00000000T000000Z-legacy, 20260918T071502Z-5d0c9e1
  scheduled      /seminars/02/ at 2026-09-25 18:10 Moscow time (in 7d 8h)
last failure: none since the last successful run
timer: enabled, active
```

`course-deploy schedule`:

```text
site    path               publish time      state     title
course  /                  now               live      Atlas
course  /seminars/         now               live      index.html
course  /seminars/01/      2026-09-11 18:10  live      01
course  /seminars/02/      2026-09-25 18:10  in 7d 8h  02
course  /seminars/shared/  now               live      shared
Times are Moscow time.
```

`due` means the time has passed but the entry is not in the live release yet: the timer has not run, is
not enabled, or the last run failed (`course-deploy status` shows the failure).

### Roll back

```bash
course-deploy rollback course
```

switches to the release just before the live one (by name, which is by time) and checks it over
HTTPS; run it again to go further back. With no older release it says
`no release older than … to roll back to`. If the check of the older release fails, the live one stays.
Before the first publish the web root is still a plain folder, and rollback says
`… is not a link to a release; nothing to roll back`.

A rollback holds until the server builds again: the next publish from the Mac, the next scheduled entry
that becomes due, `course-deploy --force`, a change to `/etc/course-deploy/sites.conf`, or a new
version of the tool. Publishing the same files again from the Mac does not undo it, because
`publish.py` finds nothing to publish; `course-deploy --force` returns to the current bundle.

### Logs

```bash
journalctl -u course-deploy -n 50 --no-pager
```

shows the timer runs. A publish from the Mac is logged only in the Mac terminal, as the `remote:`
lines. `course-deploy status` shows the last failure from either.

## What is published

### Files

For each line of `publish.conf`, `publish.py` takes the files git tracks in that folder, read from the
working tree. Without `--allow-dirty` it refuses when any of them is modified or the folder has
untracked files, so what goes out is what is committed. With `--allow-dirty` it takes modified files as
they are and adds untracked files that are not ignored. Ignored files are never published. Symlinks,
submodules and Git LFS pointer files are refused, and so is an entry with no files left after the
exclude rules.

### Excluded files

Always excluded: `.*`, `__MACOSX/`, `__pycache__/`, `*.bak`, `*.swp`, `*~`.

`Deploy/exclude.txt` adds:

| Group | Patterns |
| --- | --- |
| Notes and READMEs | `*.md` |
| LaTeX sources and leftovers | `*.tex` `*.sty` `*.cls` `*.bib` `*.aux` `*.bbl` `*.blg` `*.fdb_latexmk` `*.fls` `*.log` `*.nav` `*.out` `*.snm` `*.synctex.gz` `*.toc` `*.vrb` `*.xdv` |
| Printable handouts and LaTeX figures | `*.pdf` |
| Notebooks and instructor-only material | `*.ipynb` `Speech*` `Checks*` |
| Slides of the colleagues' seminars | `*.pptx` |

The patterns work as in rsync. A pattern without `/` matches a file or folder name at any depth; a
trailing `/` matches folders only; a pattern with a `/` inside matches the end of the path, and one
starting with `/` matches from the published folder. `*` stays within one name, `**` crosses folders.
Lines starting with `#` are comments.

Licence files (`LICENSE*`, `COPYING*`, `NOTICE*`) are always kept, whatever the patterns say, unless a
folder above them is excluded. This keeps the KaTeX, math.js and PT Serif licences in `shared/vendor/`
on the site.

The bundle carries a copy of `exclude.txt`, and the server applies it again with the built-in patterns.

### Refused by the server

`forbidden.txt` is the server's own list, installed from the kit and checked by `pre-receive` on every
push; nothing on the Mac can change it:

```text
*.tex *.sty *.cls *.bib *.aux *.bbl *.blg *.fdb_latexmk *.fls *.log *.nav *.out *.snm *.synctex.gz *.toc *.vrb *.ipynb
```

The patterns are matched against file names, ignoring letter case. `pre-receive` also refuses any path
with a part starting with `.`, symlinks, submodules and files over 50 MB. Every pattern of
`forbidden.txt` is also in `exclude.txt`, and `publish.py` checks the names it packs against the kit's
copy of `forbidden.txt`, ignoring case as the server does, so a publish from the Mac never runs into
it: `Notes.TEX`, which the case-sensitive `*.tex` of `exclude.txt` lets through, is refused before the
push. Changing the list means editing the kit and running `install.sh` again.

### Publishing a PDF later

PDFs are excluded on the Mac only; `forbidden.txt` does not block them. Delete the `*.pdf` line from
`Deploy/exclude.txt` and publish. The line applies to every published folder, so check the `--dry-run`
plan for PDFs you did not mean to publish. To let some PDFs through and keep others out, replace
`*.pdf` with a narrower pattern, for example `figures/*.pdf`. The handout and cheat-sheet PDFs live in
`theory/`, which has no line in `publish.conf`; the PDF buttons of the seminar pages show only when the
pages are opened from the repository, so a PDF put on the site needs a link of its own.

## The pages on the site

### Entry pages

Every entry gets an `index.html`, so its path opens without a file name. The server takes, in this
order:

1. the entry's own `index.html`;
2. otherwise a copy of `main.html` (the seminars; `main.html` itself stays);
3. otherwise a copy of the only `.html` file at the top level of the entry, if there is exactly one;
4. otherwise a generated list of all the entry's files with their sizes, headed by the folder name.

The `--dry-run` plan shows which one applies (`entry page: main.html`, `entry page: file listing`, …).
`/seminars/shared/` has no page of its own and gets a file listing.

### Folder indexes

A folder between the site root and an entry that has no `index.html` of its own gets a generated one
listing the released entries below it, labelled with the last part of their folder names. With the
landing page published at `/seminars/`, no such folder is left on the site today; the index would
appear if the landing line were removed.

The generated pages use the atlas fonts and colours, follow the system dark theme, have no JavaScript
and end with `Copyright (c) 2026 Evgeny Baulin`.

### version.txt

The server writes `/version.txt` into the root of every release:

```text
release 20260918T071502Z-5d0c9e1
commit <sha of the bundle commit>
source <sha of the main commit on the Mac>
built 2026-09-18T07:15:02Z
```

The live check compares it with what nginx serves. A `version.txt` of your own at the site root would be
replaced.

### What the link check does not see

The check reads the HTML. A missing script, stylesheet, image or other asset stops the publish; a broken
`<a href>` is printed as a warning. Links that JavaScript builds while the page runs are not checked:

- The sidebar links to other seminars (`../02/main.html`) and the cards of the landing page answer
  404 until that seminar is released.
- The atlas Seminars button leads to `/seminars/`, the atlas link of the seminar pages to `/`.
- The PDF buttons (handout, cheat sheet, the landing cards) point to the `theory/` folder of the
  repository. The site has no PDFs, so the pages show these buttons only when they are opened from the
  repository; on the site they are not there.

The server keeps its present nginx configuration with the web root `/var/www/optimization-methods`.

### nginx behaviour

- `/seminars/02` without the slash answers 301 to `/seminars/02/`.
- A folder without `index.html` answers 403; nginx does not list folders.
- Dot-files and `*.md`, `*.zip`, `*.tar.gz` answer 403.
- Every answer carries `Cache-Control: no-cache`, so a new release shows on the next reload.

## E-mail alerts

Alerts are optional and go by e-mail only. Fill in `/etc/course-deploy/course-deploy.conf` on the
server as root, for example with `nano /etc/course-deploy/course-deploy.conf`:

```text
SMTP_HOST="smtp.yandex.ru"
SMTP_PORT="465"
SMTP_USER="name@yandex.ru"
SMTP_PASSWORD="the app password"
MAIL_TO="name@yandex.ru"
```

- `SMTP_USER` is the full address. It is also the sender, as Yandex requires.
- `SMTP_PASSWORD` is an app password for Mail created in Yandex ID, not the account password.
- `MAIL_TO` can hold several addresses separated by commas.
- The connection is SMTP over TLS on port 465 with certificate verification.

Then check it:

```bash
course-deploy test-notify
```

It prints `e-mail: OK`, or the error, such as `e-mail: SMTPAuthenticationError: 535 …` for a wrong
password, or `e-mail: SMTP_USER or SMTP_PASSWORD contains characters other than ASCII` (SMTP logins
are ASCII; app passwords always are). With an incomplete file it prints

```text
e-mail: not configured (set SMTP_HOST, SMTP_USER, SMTP_PASSWORD and MAIL_TO in /etc/course-deploy/course-deploy.conf)
```

It exits 1 unless the message went out.

The file is read as data and never executed. Each line is `KEY="value"`; lines starting with `#` are
comments. Inside double quotes write `\"` for a double quote and `\\` for a backslash. An unknown key
or a value with spaces outside quotes is an error, which the next run reports. Changes apply from the
next run. The advanced keys, commented out in the file with their defaults:

| Key | Default | Meaning |
| --- | --- | --- |
| `KEEP_RELEASES` | `5` | how many of the newest releases to keep, besides the live one and the one before it |
| `RETRY_AFTER` | `900` | seconds before the timer retries a failed run |
| `TIMEZONE` | `Europe/Moscow` | the zone of the publish times; leave it, `publish.py` always reads them as Moscow time |
| `DATA_DIR` | `/srv/course-deploy` | leave it; `install.sh` and the hooks use this path |

When e-mails are sent: only by timer runs, that is `course-deploy` without arguments.

- One per run that switched a site to a new release: usually a scheduled seminar going live, or a
  retry that succeeded. Subject `course-deploy: published <sha7>`; the body has the site, the release
  and its paths, the site URL, and `Source:` with the main commit and its subject.
- One per new failure. Subject `course-deploy: FAILED <sha7>`; the body has what failed and
  `Details: journalctl -u course-deploy -n 50`. The timer retries every `RETRY_AFTER` seconds, but the
  same failure is mailed only once. A different failure is mailed again; a success clears the record.

A publish from the Mac and `course-deploy --force` print their results instead of sending mail. A
failure of a publish from the Mac is retried by the timer after `RETRY_AFTER`; if it fails again, that
run sends the e-mail.

A failed e-mail never fails a publish; the log says `e-mail to … failed: …`. The password stays in the
0600 file: it never appears in logs, in the output or on a command line.

## Troubleshooting

After a failure, `publish.py` has already printed the server's lines. On the server,
`course-deploy status` shows the last failure and `journalctl -u course-deploy -n 50 --no-pager` the
timer runs.

When the server reports `FAILED`, or no result at all, the push itself has arrived: running
`publish.py` again with the same files prints `Nothing to publish: the server already has this build.`
Fix the cause on the server, then run `course-deploy --force` there, or wait for the timer, which
retries after `RETRY_AFTER` (15 minutes). A `REJECTED` push has not arrived; fix it on the Mac and
publish again.

### publish.py refuses

Nothing is committed or pushed in any of these cases.

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Refusing to publish: uncommitted changes in published folders:` and up to 20 paths | modified or untracked files in a listed folder | commit them, or publish them as they are with `--allow-dirty`; files that should never be published belong in `.gitignore` |
| `Refusing to publish: Deploy/publish.conf is invalid:` and `Deploy/publish.conf line N: …` | a bad line (see the next table) | fix the named line |
| `Deploy/publish.conf lists no folder; there is nothing to publish.` | every line is commented out | uncomment at least the atlas line |
| `Refusing to publish:` and `<folder> (line N) does not exist` | the folder is missing or spelled differently | spell it exactly as on disk, from the repository root; `(check the letter case of '…')` points at the part that differs |
| `<folder> (line N) is a symlink` or `is neither a folder nor a file` | the listed path is not a real folder or file | list the real one |
| `<path> is a symlink; publish the file itself` | a symlink inside a published folder | replace it with the file |
| `<path> is a Git LFS pointer, not the file itself; run 'git lfs pull' and try again` | the LFS content was not downloaded | `git lfs pull` |
| `<path> matches *.tex of the server's forbidden.txt (case does not matter there); rename it or exclude it in Deploy/exclude.txt` | a name such as `Notes.TEX` that `exclude.txt` (case-sensitive) lets through but the server refuses | rename the file, or add a pattern for it to `exclude.txt` |
| `<path> is a git submodule; submodules are not published` | a submodule in a published folder | copy the files in, or leave it out of the listed folder |
| `<path> has an unresolved merge conflict` | a merge in progress | finish the merge |
| `<path> is not a regular file`, `'<path>' has a control character in its name` | a special file, or a strange file name | remove or rename it |
| `<folder> (line N) has no files left after Deploy/exclude.txt` | every file is excluded | check the folder and `exclude.txt` |
| `<folder> (line N) has no files committed to git` | the folder is new | commit it, or use `--allow-dirty` |
| `Refusing to publish: course /seminars/02/ collides with content published above it` (or `with a file published above it`) | an entry higher up, such as the atlas at `/`, already has a folder or file with that name | rename one of them or pick another path |
| `Refusing to publish: pages refer to files that are not in the bundle:` and `course: ERROR missing file: /seminars/02/main.html -> ../shared/css/base.css (no such file)` | a page loads a file that is not in the bundle: not committed, excluded, in a folder that is not listed (such as the `shared` line), or spelled with a different letter case (the server's disk is case-sensitive) | add the file, list its folder or fix the reference; other reasons are `no such folder`, `folder without index.html`, `outside the site` and `malformed address` |
| `There is no git remote 'deploy'. Add it once, in the repository, with:` | the remote is missing | the two commands it prints: `git remote add deploy deploy@Main_server:/srv/course-deploy/site.git` and `git config core.sshCommand "ssh -i ~/.ssh/course_deploy -o IdentitiesOnly=yes"` |
| `Cannot reach the server through the remote 'deploy':` and an ssh message | SSH problem | see [SSH, sudo and git](#ssh-sudo-and-git) |
| `Cannot read Deploy/exclude.txt (…): No such file or directory` (also `publish.conf`, `course-deploy-kit/sites.conf`, `course-deploy-kit/forbidden.txt`) | the file is missing | restore it |
| `Deploy/publish.conf is not UTF-8 text: …` (or another of those files) | the file was saved in another encoding | save it as UTF-8 |
| `… is not inside a git repository` | `publish.py` was run from a copy of `Deploy/` outside the repository | run the one in the repository |
| `Refusing to publish:` and `sites.conf line N: …` | a typo in `Deploy/course-deploy-kit/sites.conf` | fix the line |
| `The repository has no commit yet; commit the site first.` | an empty repository | commit |
| `git <command> failed: …` | a git command failed | the rest of the line says why |
| `publish.py needs Python 3.9 or newer` | an old `python3` | use `/usr/bin/python3` or a newer Python |

The link check covers every entry as if it were already published, including the scheduled ones.
Warnings (`warning broken link: …`) do not stop a publish.

Messages about lines of `publish.conf`:

| Message | Fix |
| --- | --- |
| `expected 4 fields separated by '\|', found N` | four fields, three `\|` |
| `unknown site 'x' (known sites: course)` | use a name from `Deploy/course-deploy-kit/sites.conf` |
| `site name 'X' is not valid (lower-case letters, digits, '_', '-')` | lower-case name |
| `path must be / or look like /a/b/ with slashes at both ends, not '…'` | add the slashes |
| `path segment '..' in '/../' is not allowed (letters, digits, '.', '_', '-'; not starting with '.')` | plain names only; no spaces in paths |
| `folder must be relative to the repository root, not '/…'` | drop the leading `/` |
| `folder '…' has an empty, '.' or '..' segment` | write the folder out in full |
| `folder is empty`, `folder contains a control character` | an empty third field, or a stray tab or control character in it | write the folder name |
| `publish time must be 'now' or YYYY-MM-DD HH:MM, not '…'` | often the literal `YYYY-MM-DD HH:MM` left in place |
| `no such date or time: '2026-02-30 10:00'` | a real date |
| `path /seminars/02/ of site course is already listed on line N` | one line per path |
| `path /seminars--02/ has the same bundle folder name 'seminars--02' as course /seminars/02/ on line N` | two paths that turn into the same bundle folder; pick another path |

After the push, `publish.py` ends with one of these:

| Last line | Meaning |
| --- | --- |
| `Published.` | the server reported `course-deploy: OK` |
| `The server did not publish this build; see the lines above and Deploy/README.md.` | there is a `REJECTED` or `FAILED` line above; see the next two sections |
| `git push failed; see the lines above and the troubleshooting table in Deploy/README.md.` | SSH or git refused the push; see [SSH, sudo and git](#ssh-sudo-and-git) |
| `The push arrived, but the server reported no result: check the lines above (e.g. 'sudo: a password is required') and run 'course-deploy status' on the server.` | the hook did not run; usually sudo, see below |
| `Interrupted during the push: the server may already have this build. Run 'course-deploy status' on the server, or publish again.` | Ctrl-C while the push or the server's answer was running | `course-deploy status` shows whether the build went live; publishing again is safe |

### The server rejects a push (REJECTED)

A rejected push is refused as a whole and leaves none of its files on the server. It looks like this:

```text
remote: course-deploy: REJECTED forbidden file type *.tex: entries/seminars--02/notes.tex
remote: course-deploy: nothing from this push was stored on the server.
 ! [remote rejected] … -> site (pre-receive hook declined)
```

Paths in these lines are bundle paths: `entries/<slug>/…`, where the slug is the site path with `--`
between its parts (`root` for `/`). `entries/seminars--02/notes.tex` is `notes.tex` in the folder
published at `/seminars/02/`.

| Symptom | Cause | Fix |
| --- | --- | --- |
| `course-deploy: REJECTED forbidden file type *.tex: <path>` (or another pattern) | a push by hand, or a server whose `forbidden.txt` differs from the kit on the Mac | publish with `publish.py`; keep the kit and the server on one version |
| `course-deploy: REJECTED file larger than 50 MB (<object>): <path>` | a big file in a published folder; `publish.py` does not check sizes, so it was uploaded before the refusal | move it out of the folder or exclude it |
| `course-deploy: REJECTED only the site branch can be pushed: refs/heads/main` | a push by hand, such as `git push deploy main` or `git push --all deploy` | do not push to `deploy` by hand; `publish.py` pushes only the `site` branch |
| `course-deploy: REJECTED the site branch cannot be deleted: refs/heads/site` | `git push deploy --delete site` | deletions are refused on purpose; to change the site, publish; to go back, roll back |
| `course-deploy: REJECTED not a commit: <sha>` | a tag or another object pushed by hand | publish with `publish.py` |
| `course-deploy: REJECTED missing file: publish.conf` | a commit made by hand without `publish.conf` at its root | publish with `publish.py` |
| `course-deploy: REJECTED hidden files and folders are not accepted: <path>` | a path part starting with `.`; `publish.py` always leaves these out | publish with `publish.py` |
| `course-deploy: REJECTED symbolic links are not accepted: <path>`, `submodules are not accepted: <path>` | a push by hand; `publish.py` refuses these earlier | publish with `publish.py` |
| `course-deploy: REJECTED the server has no list of forbidden files; rerun install.sh: /usr/local/lib/course-deploy/forbidden.txt` | an incomplete installation | run `install.sh` again |
| `course-deploy: REJECTED cannot read the files of commit: <sha>`, `cannot list the new commits of: <ref>` | git on the server failed, often a full disk | `df -h`; free space and publish again |

### The server fails to publish (FAILED)

`course-deploy: FAILED <reason>` is printed on the Mac after a push and by `--force`; timer runs put it
in the journal and the failure e-mail. In every case below the live site stays as it was.

| Symptom | Cause | Fix |
| --- | --- | --- |
| `course: live check failed, switched back to <release>: https://…/version.txt: curl: (7) Failed to connect to … Connection refused` | nginx is not running | `nginx -t`, `systemctl start nginx`, then `course-deploy --force` |
| `course: live check failed, switched back to <release>: …: curl: (60) SSL certificate problem: certificate has expired` | the certificate was not renewed | see [The site](#the-site), then `course-deploy --force` |
| `course: live check failed, switched back to <release>: https://…/version.txt does not show the new release` | nginx serves a different folder from the web root in `/etc/course-deploy/sites.conf` | make the nginx `root` and the web root in `sites.conf` the same, then `course-deploy --force` |
| `course: live check failed, switched back to <release>: https://…/seminars/02/: curl: (22) The requested URL returned error: 404` | the same, or a changed nginx configuration | check the nginx site with `nginx -T`, then `course-deploy --force` |
| `course: live check failed, web root link removed: …` | the very first release of a site failed its check, with nothing to go back to | as above |
| `course: 1 missing file(s), first: ERROR missing file: …` | the bundle refers to a file it does not contain; `publish.py` refuses such a bundle, so it came from a push by hand or from a Mac and a server on different versions of the kit | update the server (see [Updating the tool](#updating-the-tool)) and publish from the Mac |
| `course: course /seminars/02/ collides with content published above it`, `course: course /… has no files left after the exclude rules` | as on the Mac | as on the Mac |
| `course: symlinks are not published: …`, `course: Git LFS pointer files instead of content: …` | a bundle made by hand | publish with `publish.py` |
| `bundle <sha7>: invalid publish.conf: publish.conf line N: unknown site 'x' (known sites: course)` | the site is in `Deploy/course-deploy-kit/sites.conf` on the Mac but not in `/etc/course-deploy/sites.conf` on the server | add the same line on the server, then `course-deploy --force` |
| `bundle <sha7>: invalid publish.conf: …` (other reasons), `bundle <sha7>: publish.conf is not UTF-8`, `bundle <sha7> has no exclude.txt`, `bundle <sha7> has no publish.conf` | a bundle made by hand | publish with `publish.py` |
| `another run still holds the lock after 60 s; the timer publishes this bundle within a few minutes` | a timer run or another command was busy | with the timer enabled, nothing; otherwise `course-deploy --force` a little later |
| `course: cannot switch the web root: course: /var/www/optimization-methods is neither a folder nor a symlink; left as is` | something else sits at the web root | look with `ls -l /var/www/`, move it away, then `course-deploy --force` |
| `course: cannot switch the web root: …` (other) | usually a full disk | `df -h` |
| `cannot export entries/<slug> from <sha7>: …` | git or tar failed, usually a full disk | `df -h` |
| `/etc/course-deploy/course-deploy.conf is missing; run install.sh from the course-deploy kit` (or `sites.conf`) | the configuration was deleted | run `install.sh` again; it creates missing files from the templates |
| `cannot read /etc/course-deploy/…: …` | the file is unreadable or not UTF-8 | `ls -l /etc/course-deploy/`; save the file as UTF-8 |
| `/etc/course-deploy/sites.conf defines no site` | every line of `sites.conf` is commented out | restore the `course` line |
| `cannot open the lock file /srv/course-deploy/lock: …; run install.sh` | the data folder is missing or read-only | run `install.sh` again; `df -h` |
| `git <command> failed: …` | git on the server failed: a full disk or a damaged repository | `df -h`; `git -c safe.directory=/srv/course-deploy/site.git --git-dir=/srv/course-deploy/site.git fsck` |
| `course-deploy.conf line N: put the value in double quotes`, `… unterminated double quote`, `… unbalanced single quote`, `… a double quote inside the value must be written as \"`, `… expected one of SMTP_HOST, … as KEY="value"`, `KEEP_RELEASES must be a whole number …`, `unknown TIMEZONE '…'`, `DATA_DIR must be an absolute path` | a typo in `course-deploy.conf` | fix the line |
| `sites.conf line N: …` | a typo in `/etc/course-deploy/sites.conf` | fix the line |
| `the repository /srv/course-deploy/site.git does not exist; run install.sh` | the repository is missing | run `install.sh` again, then publish |
| `unexpected error: …` or `course: unexpected error: …` | a bug | the traceback above it says where; roll back if the site is affected |

### SSH, sudo and git

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Permission denied (publickey)` | the server does not have this key, ssh offers another one, or the push goes as root | `git remote -v` must show `deploy@Main_server:…` and `git config core.sshCommand` the deploy key; run `install.sh` again with the contents of `~/.ssh/course_deploy.pub`; `ssh -v -i ~/.ssh/course_deploy -o IdentitiesOnly=yes deploy@Main_server` shows which key is offered; if `install.sh` warned about `AllowUsers`, fix `sshd_config` |
| `Host key verification failed` after `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!` | the server's host key differs from the one in `~/.ssh/known_hosts`: the server was reinstalled, or it is not the server | in Termius run `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the server; if it matches what ssh shows, run `ssh-keygen -R 89.191.229.171` on the Mac, then connect again as in [First connection](#3-first-connection) and accept; if not, stop |
| `ssh: connect to host 89.191.229.171 port 22: Operation timed out` (or `Connection timed out`, `Connection refused`) | the network, a VPN, or sshd is down | check that Termius connects; try another network or switch the VPN; nothing was sent, publish again later |
| `fatal: Interactive git shell is not enabled.` after `ssh … deploy@Main_server` | expected | nothing |
| `fatal: '/srv/course-deploy/site.git' does not appear to be a git repository` | `install.sh` has not run, or the remote points elsewhere | `git remote -v`; `git remote set-url deploy deploy@Main_server:/srv/course-deploy/site.git` |
| `remote: sudo: a password is required`, then `The push arrived, but the server reported no result` | the sudo rule for `deploy` is missing or broken | run `install.sh` again; `sudo -l -U deploy` must list `(root) NOPASSWD: /usr/local/bin/course-deploy hook`; then `course-deploy --force` |
| `! [rejected] … (fetch first)` or `(non-fast-forward)`, or `remote: error: denying non-fast-forward refs/heads/site` | the server's `site` branch moved after `publish.py` read it (another publish at the same time, or a push by hand) | run `publish.py` again: it fetches the server's tip first and builds on it; never force-push, the server refuses rewrites and deletions |
| `course-deploy: this command must be run as root` | `course-deploy` run by another user | run it as root |

### The site

| Symptom | Cause | Fix |
| --- | --- | --- |
| `/seminars/02/` answers 404 | not released: the line is commented out, its time is in the future, or it was not published after the change | `course-deploy schedule`: `in …` means wait; `due` means the timer is off or failing (`course-deploy status`); not listed means uncomment the line and publish |
| `/seminars/02` redirects | nginx answers 301 to `/seminars/02/` | nothing; link with the trailing slash |
| 403 on a folder such as `/seminars/02/figures/` | a folder without `index.html`; nginx does not list folders | link to the files |
| 403 on a `.md` file or a dot-file | nginx denies them; they are not published anyway | nothing |
| `/seminars/` shows a plain list instead of the topic cards | the landing line `course \| /seminars/ \| Seminars/Evgeny Baulin/web/index.html \| now` is missing | put it back and publish |
| no PDF buttons on the site | on purpose: the site has no PDFs, and the pages hide the buttons there | the PDFs stay in the repository's `theory/` folders |
| the browser warns about the certificate, or the live check fails with `curl: (60) SSL certificate problem: certificate has expired` | the Let's Encrypt certificate was not renewed | on the server: `certbot certificates` shows the expiry date; `certbot renew` renews it; `systemctl reload nginx` if the old one is still served; `systemctl list-timers \| grep certbot` shows whether automatic renewal is scheduled; then `course-deploy --force` |
| the live check fails with `curl: (51) … no alternative certificate subject name matches target host name` | the URL in `/etc/course-deploy/sites.conf` does not match the certificate | fix the URL, or get a certificate for that name |
| the old version still shows | the browser | reload; `/version.txt` names the live release |

## Updating the tool

1. On the server: `rm -rf /root/course-deploy-kit`.
2. Upload `Deploy/course-deploy-kit` again with Termius SFTP, as `/root/course-deploy-kit`.
3. Run `bash /root/course-deploy-kit/install.sh "<contents of ~/.ssh/course_deploy.pub>"` again.
4. Check with `course-deploy --version`.

A second run refreshes the code, the hooks, the units, the sudoers rule, the key line and the
`atlas-deploy` stub. It keeps `/etc/course-deploy/course-deploy.conf` and `sites.conf`, the
repository, the releases and the timer as they are; changes to those templates in the kit have to be
copied into `/etc/course-deploy/` by hand. A new version number makes the next timer run build the site
once; if the result is the same, the live release stays and no e-mail is sent.

The Mac uses the same `course_deploy` modules straight from `Deploy/course-deploy-kit/`, so keep the
two sides on one version: `python3 Deploy/publish.py --version` and `course-deploy --version` should
agree.

A new Mac key goes in the same way: run `install.sh` with it. The line of the same key is replaced and
other lines stay, so remove an old key from `/home/deploy/.ssh/authorized_keys` by hand.

## Emergency

- Never edit files under `/var/www/optimization-methods`. It is a link into a release folder. A hand
  edit disappears when a new release goes live. It can also survive a publish unnoticed: the server
  compares a new build with the recorded hash of the live release, not with the files on disk, and
  keeps the live release when the two agree.
- Something is wrong on the site: fix it on the Mac and publish. That takes about a minute.
- No time, or no Mac: `course-deploy rollback course` on the server goes back one release and checks
  it; run it again for older ones. `course-deploy status` lists the kept releases. The oldest,
  `00000000T000000Z-legacy`, is the site as it was before course-deploy, for as long as it is kept.
- A seminar went out too early: comment out its line (or correct the date) and publish. A rollback can
  bring back a release that still has it; `course-deploy status` shows the paths of the live release.
- Taking a file off the site does not remove it from `/srv/course-deploy/site.git`, which keeps every
  bundle ever pushed, or from the older releases until they are deleted. nginx serves neither.

## Tests

On the Mac, from the repository root, with Docker running:

```bash
bash Deploy/tests/run-tests.sh
```

It runs the unit tests, `publish.py --dry-run` against this repository (read-only, no network), the
unit tests and a dry run under Python 3.9 in `python:3.9-slim`, and the end-to-end scenarios in
`ubuntu:22.04` with the repository mounted read-only. There `in-container.sh` sets up a copy of the
server (nginx with test certificates, sshd, a mock mail server), runs `install.sh` and prints one
`PASS` or `FAIL` line per scenario. The suite never contacts the real server. Without Docker the two
container steps are skipped and the run says so.

Two environment variables exist for the tests only; never set them on the server:

- `COURSE_DEPLOY_NOW=<epoch>` makes `course-deploy` use this time for scheduling decisions: publish
  times, the retry delay, countdowns. Release names keep the real clock.
- `COURSE_DEPLOY_ROOT=<dir>` puts `<dir>` in front of every absolute path the tool uses (configuration,
  data, web roots, the library) and lifts the root requirement, so the tests can run parts of it
  without privileges.

Both are ignored when `course-deploy` runs through sudo, as it does after a push.
