# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""The course-deploy commands.

Test hooks, for the test suite only: COURSE_DEPLOY_NOW=<epoch> replaces the current
time in scheduling decisions (publish times, the retry delay, countdowns; release
names keep the real clock so that their order stays the order of the builds), and
COURSE_DEPLOY_ROOT=<dir> prefixes every absolute path the tool uses and lifts the
root requirement. Both are ignored under sudo.
"""

from __future__ import annotations

import fcntl
import hashlib
import os
import re
import signal
import socket
import subprocess
import sys
import time
import traceback
from datetime import datetime
from typing import Callable, Dict, List, Optional, Sequence, Tuple
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from . import __version__, notify, release
from .manifest import (Entry, ManifestError, Site, countdown, current, parse_sites, parse_source_info, path_key,
                       time_key)
from .release import Bundle, Context, DeployError, Outcome

CONFIG = "/etc/course-deploy/course-deploy.conf"
SITES = "/etc/course-deploy/sites.conf"
DEFAULTS = {
    "SMTP_HOST": "",
    "SMTP_PORT": "465",
    "SMTP_USER": "",
    "SMTP_PASSWORD": "",
    "MAIL_TO": "",
    "KEEP_RELEASES": "5",
    "RETRY_AFTER": "900",
    "TIMEZONE": "Europe/Moscow",
    "DATA_DIR": "/srv/course-deploy",
}
LOCK_WAIT = 60
RESULT = "course-deploy:"
JOURNAL_HINT = "Details: journalctl -u course-deploy -n 50"

USAGE = """\
usage: course-deploy [hook | --force | --dry-run | status | schedule | rollback SITE | test-notify]

Publishes the course site from the bundle that Deploy/publish.py pushes from the Mac.

  course-deploy                timer run: publish what is due; prints nothing when nothing is
  course-deploy hook           run by post-receive after a push; always rebuilds, no e-mail
  course-deploy --force        run now, ignoring the "already deployed" cache and the retry delay
  course-deploy --dry-run      build and check the current bundle, print what would change
  course-deploy status         per site: what is live, scheduled lines, the last failure
  course-deploy schedule       every line of publish.conf with its publish time and state
  course-deploy rollback SITE  switch SITE to the release before the live one and check it
  course-deploy test-notify    send a test e-mail
  course-deploy --help         this text
  course-deploy --version      the version

Configuration: /etc/course-deploy/course-deploy.conf and /etc/course-deploy/sites.conf
Logs: journalctl -u course-deploy -n 50 --no-pager
Every command except --help and --version must be run as root."""


class UsageError(Exception):
    pass


class ConfigError(Exception):
    pass


class QuietStream:
    """stdout or stderr that falls silent once its reader is gone.

    In hook mode the reader is the git push on the Mac; when that connection drops, a
    BrokenPipeError must not stop a deploy between the switch and the live check.
    """

    def __init__(self, stream):
        self.stream = stream
        self.gone = False

    def write(self, text: str) -> int:
        if not self.gone:
            try:
                return self.stream.write(text)
            except BrokenPipeError:
                self._silence()
        return len(text)

    def flush(self) -> None:
        if not self.gone:
            try:
                self.stream.flush()
            except BrokenPipeError:
                self._silence()

    def _silence(self) -> None:
        self.gone = True
        devnull = os.open(os.devnull, os.O_WRONLY)
        os.dup2(devnull, self.stream.fileno())
        os.close(devnull)

    def __getattr__(self, name):
        return getattr(self.stream, name)


def _terminate(signum, frame) -> None:
    # SystemExit unwinds through the clean-up of a half-done switch, which a plain kill would skip
    raise SystemExit(128 + signum)


def parse_args(argv: Sequence[str]) -> Tuple[str, Optional[str]]:
    simple = {
        (): "timer",
        ("hook",): "hook",
        ("--force",): "force",
        ("--dry-run",): "dry-run",
        ("status",): "status",
        ("schedule",): "schedule",
        ("test-notify",): "test-notify",
        ("--help",): "help",
        ("-h",): "help",
        ("help",): "help",
        ("--version",): "version",
    }
    key = tuple(argv)
    if key in simple:
        return simple[key], None
    if len(argv) == 2 and argv[0] == "rollback":
        return "rollback", argv[1]
    if argv and argv[0] == "rollback":
        raise UsageError("rollback needs exactly one site name, e.g. course-deploy rollback course")
    raise UsageError(f"unknown arguments: {' '.join(argv)}")


def _unquote(value: str, label: str) -> str:
    if value[:1] == '"':
        if len(value) < 2 or not value.endswith('"'):
            raise ConfigError(f"{label}: unterminated double quote")
        out, i, body = [], 0, value[1:-1]
        while i < len(body):
            if body[i] == "\\" and i + 1 < len(body):
                i += 1
            elif body[i] == '"':
                raise ConfigError(f"{label}: a double quote inside the value must be written as \\\"")
            out.append(body[i])
            i += 1
        return "".join(out)
    if value[:1] == "'":
        if len(value) < 2 or not value.endswith("'") or "'" in value[1:-1]:
            raise ConfigError(f"{label}: unbalanced single quote")
        return value[1:-1]
    if any(c in value for c in " \t\"'"):
        raise ConfigError(f"{label}: put the value in double quotes")
    return value


def parse_config(text: str, label: str = "course-deploy.conf") -> Dict[str, str]:
    """KEY="value" lines; nothing in the file is ever executed."""
    config = dict(DEFAULTS)
    for number, raw in enumerate(text.splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        where = f"{label} line {number}"
        key, sep, value = line.partition("=")
        key = key.strip()
        if not sep or key not in DEFAULTS:
            raise ConfigError(f"{where}: expected one of {', '.join(DEFAULTS)} as KEY=\"value\"")
        config[key] = _unquote(value.strip(), where)
    for key, low, high in (("SMTP_PORT", 1, 65535), ("KEEP_RELEASES", 1, 1000), ("RETRY_AFTER", 0, 10 ** 7)):
        value = config[key]
        if not re.fullmatch(r"[0-9]+", value) or not low <= int(value) <= high:
            raise ConfigError(f"{label}: {key} must be a whole number from {low} to {high}, not '{value}'")
    try:
        ZoneInfo(config["TIMEZONE"])
    except (ZoneInfoNotFoundError, ValueError):
        raise ConfigError(f"{label}: unknown TIMEZONE '{config['TIMEZONE']}'") from None
    if not config["DATA_DIR"].startswith("/") or "\n" in config["DATA_DIR"]:
        raise ConfigError(f"{label}: DATA_DIR must be an absolute path")
    config["DATA_DIR"] = config["DATA_DIR"].rstrip("/") or "/"
    return config


def _read(path: str) -> str:
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        raise ConfigError(f"{path} is missing; run install.sh from the course-deploy kit") from None
    except (OSError, UnicodeDecodeError) as error:
        raise ConfigError(f"cannot read {path}: {error}") from None


def make_log(command: str, timezone: str) -> Callable[[str], None]:
    stamped = command in ("timer", "force", "dry-run") and not os.environ.get("JOURNAL_STREAM")

    def log(message: str) -> None:
        prefix = datetime.now(ZoneInfo(timezone)).strftime("%Y-%m-%d %H:%M:%S ") if stamped else ""
        print(prefix + message, flush=True)

    return log


def load_context(prefix: str, command: str, clock: Callable[[], float]) -> Context:
    config = parse_config(_read(prefix + CONFIG))
    sites_text = _read(prefix + SITES)
    try:
        sites = parse_sites(sites_text)
    except ManifestError as error:
        raise ConfigError(str(error)) from None
    if not sites:
        raise ConfigError(f"{prefix + SITES} defines no site")
    return Context(prefix, config, sites, sites_text, make_log(command, config["TIMEZONE"]), clock)


class Lock:
    """An exclusive flock on the lock file, waited for up to `wait` seconds."""

    def __init__(self, path: str, wait: float):
        self.path = path
        self.wait = wait
        self.fd: Optional[int] = None

    def __enter__(self) -> bool:
        try:
            self.fd = os.open(self.path, os.O_RDWR | os.O_CREAT, 0o600)
        except OSError as error:
            raise DeployError(f"cannot open the lock file {self.path}: {error}; run install.sh") from None
        deadline = time.monotonic() + self.wait
        while True:
            try:
                fcntl.flock(self.fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                return True
            except BlockingIOError:
                if time.monotonic() >= deadline:
                    return False
                time.sleep(0.2)

    def __exit__(self, *exc) -> None:
        if self.fd is not None:
            os.close(self.fd)
            self.fd = None


class State:
    """The last successful run key and the last failure, in <data>/state."""

    def __init__(self, ctx: Context):
        self.dir = ctx.state
        self.success = self._read("last-success").strip()
        first, _, self.failure_reason = self._read("last-failure").partition("\n")
        key, _, epoch = first.partition(" ")
        self.failure_key = key
        try:
            self.failure_epoch = float(epoch)
        except ValueError:
            self.failure_epoch = 0.0
        self.mailed_key = self._read("last-mailed-failure").strip()

    def _read(self, name: str) -> str:
        try:
            with open(os.path.join(self.dir, name), encoding="utf-8") as f:
                return f.read()
        except OSError:
            return ""

    def _write(self, name: str, text: str) -> None:
        os.makedirs(self.dir, mode=0o700, exist_ok=True)
        path = os.path.join(self.dir, name)
        tmp = f"{path}.tmp-{os.getpid()}"
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(text)
        os.replace(tmp, path)

    def _remove(self, name: str) -> None:
        try:
            os.unlink(os.path.join(self.dir, name))
        except FileNotFoundError:
            pass

    def skip(self, key: str, now: float, retry_after: int) -> bool:
        if key == self.success:
            return True
        return key == self.failure_key and now - self.failure_epoch < retry_after

    def record_success(self, key: str) -> None:
        self._write("last-success", key + "\n")
        self._remove("last-failure")
        self._remove("last-mailed-failure")

    def record_failure(self, key: str, now: float, reasons: Sequence[str], mailed_key: str) -> None:
        self._write("last-failure", f"{key} {int(now)}\n" + "\n".join(reasons) + "\n")
        if mailed_key:
            self._write("last-mailed-failure", mailed_key + "\n")


def zone_label(timezone: str) -> str:
    """'Moscow time' for Europe/Moscow."""
    return timezone.rsplit("/", 1)[-1].replace("_", " ") + " time"


def run_key(commit: str, sites_text: str, shown: Sequence[Entry]) -> str:
    """Changes with the bundle, the sites and the line each path shows (its folder)."""
    h = hashlib.sha256()
    for part in (__version__, commit, sites_text):
        h.update(part.encode("utf-8") + b"\0")
    for e in sorted(shown, key=lambda e: (e.site, e.path)):
        h.update(f"{e.site} {e.path} {e.folder}\n".encode("utf-8"))
    return h.hexdigest()


def in_order(entries: Sequence[Entry], timezone: str) -> List[Entry]:
    """By site, by path as read (/seminars/2/ before /seminars/10/), the lines of a path in time order."""
    return sorted(entries, key=lambda e: (e.site, path_key(e.path), time_key(e, timezone)))


def _mail(ctx: Context, subject: str, body: str) -> bool:
    """Send an alert if e-mail is configured; a failure is logged and never fails the run."""
    if not notify.configured(ctx.config):
        ctx.log("e-mail alerts are not configured; nothing sent.")
        return False
    try:
        notify.send(ctx.config, subject, body)
    except Exception as error:  # noqa: BLE001 - an alert must never break a deploy
        ctx.log(f"e-mail to {ctx.config['MAIL_TO']} failed: {notify.describe(error)}")
        return False
    ctx.log(f"e-mail sent to {ctx.config['MAIL_TO']}: {subject}")
    return True


def _fail(ctx: Context, command: str, state: State, key: str, commit: str, reasons: List[str]) -> int:
    mailed = state.mailed_key
    if command == "timer" and key != state.mailed_key:
        body = "\n".join(reasons[:10]) + "\n\n" + JOURNAL_HINT + "\n"
        if _mail(ctx, f"course-deploy: FAILED {commit[:7]}", body):
            mailed = key
    state.record_failure(key, ctx.clock(), reasons, mailed)
    if command in ("hook", "force"):
        for reason in reasons:
            print(f"{RESULT} FAILED {reason}", flush=True)
    return 1


def _ok_lines(outcomes: Sequence[Outcome]) -> List[str]:
    return [f"{RESULT} OK {o.site.name} -> {o.release} ({', '.join(o.paths)})" for o in outcomes]


def run(ctx: Context, command: str) -> int:
    with Lock(ctx.lock, 0 if command == "timer" else LOCK_WAIT) as held:
        if not held:
            if command == "timer":
                ctx.log("another run is in progress")
                return 0
            raise DeployError(f"another run still holds the lock after {LOCK_WAIT} s; "
                              "the timer publishes this bundle within a few minutes")
        return _run_locked(ctx, command)


def _run_locked(ctx: Context, command: str) -> int:
    commit = release.tip(ctx)
    if commit is None:
        if command != "timer":
            ctx.log("Nothing has been pushed from the Mac yet.")
        if command == "hook":
            print(f"{RESULT} OK nothing changed", flush=True)
        return 0
    state = State(ctx)
    retry_after = int(ctx.config["RETRY_AFTER"])
    now = ctx.clock()
    try:
        bundle = release.load_bundle(ctx, commit)
    except DeployError as error:
        key = hashlib.sha256((commit + "manifest").encode()).hexdigest()
        if command == "timer" and state.skip(key, now, retry_after):
            return 0
        ctx.log(str(error))
        if command == "dry-run":
            return 1
        return _fail(ctx, command, state, key, commit, [str(error)])

    moment = datetime.fromtimestamp(now, ZoneInfo(ctx.timezone))
    shown = current(bundle.entries, moment, ctx.timezone)
    pending = in_order([e for e in bundle.entries if not e.released(moment, ctx.timezone)], ctx.timezone)
    key = run_key(commit, ctx.sites_text, shown)
    if command == "timer" and state.skip(key, now, retry_after):
        return 0

    outcomes: List[Outcome] = []
    failures: List[str] = []
    for site in ctx.sites:
        entries = [e for e in shown if e.site == site.name]
        if not entries:
            ctx.log(f"{site.name}: nothing to publish, left as is.")
            continue
        try:
            outcome = release.deploy(ctx, site, bundle, entries, dry_run=command == "dry-run")
        except DeployError as error:
            failures.append(str(error))
            ctx.log(str(error))
            continue
        except Exception as error:  # noqa: BLE001 - one site must not stop the others
            message = f"{site.name}: unexpected error: {type(error).__name__}: {error}"
            traceback.print_exc(file=sys.stdout)
            failures.append(message)
            ctx.log(message)
            continue
        if outcome:
            outcomes.append(outcome)
    label = zone_label(ctx.timezone)
    for e in pending:
        wait = countdown(e.publish_time(ctx.timezone).timestamp() - now)
        ctx.log(f"{e.site}: {e.path} is scheduled for {e.when} {label} ({e.title}, {wait}).")

    if command == "dry-run":
        return 1 if failures else 0
    if command in ("hook", "force"):
        for line in _ok_lines(outcomes):
            print(line, flush=True)
    if failures:
        return _fail(ctx, command, state, key, commit, failures)
    state.record_success(key)
    if command == "timer" and outcomes:
        _mail(ctx, f"course-deploy: published {commit[:7]}", _success_body(bundle, outcomes))
    if command in ("hook", "force"):
        if not outcomes:
            print(f"{RESULT} OK nothing changed", flush=True)
        for e in pending:
            print(f"{RESULT} scheduled {e.path} at {e.when} {label} ({e.title})", flush=True)
    return 0


def _success_body(bundle: Bundle, outcomes: Sequence[Outcome]) -> str:
    lines = []
    for o in outcomes:
        lines.append(f"{o.site.name}: {o.release} ({', '.join(o.paths)})")
        lines.append(o.site.url)
    source = bundle.source.get("commit", "unknown")[:7]
    lines.append(f"Source: {source} {bundle.main_subject}")
    return "\n".join(lines) + "\n"


def _systemd_timer() -> Optional[str]:
    if not os.path.isdir("/run/systemd/system"):
        return None
    states = []
    for verb in ("is-enabled", "is-active"):
        r = subprocess.run(["systemctl", verb, "course-deploy.timer"], stdout=subprocess.PIPE,
                           stderr=subprocess.DEVNULL)
        states.append(r.stdout.decode().strip() or "unknown")
    return f"{states[0]}, {states[1]}"


def _bundle_or_note(ctx: Context) -> Tuple[Optional[Bundle], str]:
    commit = release.tip(ctx)
    if commit is None:
        return None, "Nothing has been pushed from the Mac yet."
    try:
        return release.load_bundle(ctx, commit), ""
    except DeployError as error:
        return None, f"The current bundle is invalid: {error}"


def status(ctx: Context) -> int:
    bundle, note = _bundle_or_note(ctx)
    now = ctx.clock()
    label = zone_label(ctx.timezone)
    for site in ctx.sites:
        print(f"{site.name}  {site.url}")
        live = release.live_release(ctx, site)
        webroot = ctx.webroot(site)
        if live is None:
            if os.path.islink(webroot):
                shown = f"a link to {os.readlink(webroot)}, not a release of this site"
            elif os.path.isdir(webroot):
                shown = "a plain folder, not published by course-deploy yet"
            else:
                shown = "missing"
            print(f"  web root       {webroot} is {shown}")
        else:
            meta = release.read_meta(ctx, site, live)
            print(f"  live release   {live}")
            if meta:
                print(f"  paths          {', '.join(meta.get('paths', '').split())}")
                info = {}
                raw = release.read_blob(ctx, meta.get("commit", ""), "source.txt") if meta.get("commit") else None
                if raw:
                    info = parse_source_info(raw.decode("utf-8", "replace"))
                source = info.get("commit", meta.get("source", "unknown"))
                print(f"  source         {source[:7]} (dirty: {info.get('dirty', 'unknown')}), "
                      f"bundle built {info.get('built', 'unknown')} by publish.py {info.get('publish.py', '?')}")
                print(f"  release built  {meta.get('built', 'unknown')}")
            else:
                print("  paths          (the web root folder from before course-deploy)")
        kept = release.list_releases(ctx, site)
        print(f"  releases kept  {', '.join(kept) if kept else 'none'}")
        if bundle:
            for e in in_order(bundle.entries, ctx.timezone):
                at = e.publish_time(ctx.timezone)
                if e.site == site.name and at is not None and at.timestamp() > now:
                    wait = countdown(at.timestamp() - now)
                    print(f"  scheduled      {e.path} at {e.when} {label} ({e.title}, {wait})")
    if note:
        print(note)
    state = State(ctx)
    if state.failure_key:
        when = datetime.fromtimestamp(state.failure_epoch, ZoneInfo(ctx.timezone)).strftime("%Y-%m-%d %H:%M")
        print(f"last failure: {when} {label}")
        for line in state.failure_reason.strip().splitlines():
            print(f"  {line}")
    else:
        print("last failure: none since the last successful run")
    timer = _systemd_timer()
    print(f"timer: {timer}" if timer else "timer: systemd is not running here")
    return 0


def live_folders(ctx: Context, site: Site) -> Dict[str, str]:
    """Path -> the bundle folder it was built from, for the live release of a site.

    The folder is '' for a release built before course-deploy 1.1, whose meta names no folders.
    """
    live = release.live_release(ctx, site)
    meta = release.read_meta(ctx, site, live) if live else {}
    paths = meta.get("paths", "").split()
    folders = meta.get("folders", "").split()
    if len(folders) != len(paths):
        folders = [""] * len(paths)
    return dict(zip(paths, folders))


def line_state(e: Entry, shown: Sequence[Entry], now: float, timezone: str, live: Dict[str, str]) -> str:
    """A countdown before its time; `replaced` once a later line of its path has come; otherwise
    `live` when the live release shows this line, `due` when it does not yet."""
    at = e.publish_time(timezone)
    if at is not None and at.timestamp() > now:
        return countdown(at.timestamp() - now)
    if e not in shown:
        return "replaced"
    folder = live.get(e.path)
    return "live" if folder is not None and folder in ("", e.folder) else "due"


def schedule(ctx: Context) -> int:
    bundle, note = _bundle_or_note(ctx)
    if bundle is None:
        print(note)
        return 0 if note.startswith("Nothing") else 1
    now = ctx.clock()
    shown = current(bundle.entries, datetime.fromtimestamp(now, ZoneInfo(ctx.timezone)), ctx.timezone)
    live = {site.name: live_folders(ctx, site) for site in ctx.sites}
    rows = [("site", "path", "publish time", "state", "title")]
    for e in in_order(bundle.entries, ctx.timezone):
        state = line_state(e, shown, now, ctx.timezone, live.get(e.site, {}))
        rows.append((e.site, e.path, e.when, state, e.title))
    widths = [max(len(r[i]) for r in rows) for i in range(4)]
    for r in rows:
        print("  ".join(r[i].ljust(widths[i]) for i in range(4)) + "  " + r[4])
    print(f"Times are {zone_label(ctx.timezone)}.")
    return 0


def rollback(ctx: Context, name: str) -> int:
    site = next((s for s in ctx.sites if s.name == name), None)
    if site is None:
        print(f"course-deploy: unknown site '{name}' (sites: {', '.join(s.name for s in ctx.sites)})",
              file=sys.stderr)
        return 2
    with Lock(ctx.lock, LOCK_WAIT) as held:
        if not held:
            raise DeployError(f"another run still holds the lock after {LOCK_WAIT} s; try again")
        before = release.live_release(ctx, site)
        target = release.rollback(ctx, site)
    print(f"{site.name}: rolled back from {before} to {target}; {target} is live.")
    print("It stays live until the next publish from the Mac or the next scheduled entry.")
    return 0


def test_notify(ctx: Context) -> int:
    if not notify.configured(ctx.config):
        print("e-mail: not configured (set SMTP_HOST, SMTP_USER, SMTP_PASSWORD and MAIL_TO in "
              f"{CONFIG})")
        return 1
    body = (f"This is a test message from course-deploy {__version__} on {socket.gethostname()}.\n"
            "E-mail alerts work.\n")
    try:
        notify.send(ctx.config, "course-deploy: test message", body)
    except Exception as error:  # noqa: BLE001 - reported to the user
        print(f"e-mail: {notify.describe(error)}")
        return 1
    print("e-mail: OK")
    return 0


def _clock(allowed: bool) -> Callable[[], float]:
    value = os.environ.get("COURSE_DEPLOY_NOW", "") if allowed else ""
    if not value:
        return time.time
    try:
        fixed = float(value)
    except ValueError:
        raise UsageError("COURSE_DEPLOY_NOW must be seconds since the epoch") from None
    return lambda: fixed


def main(argv: Optional[Sequence[str]] = None) -> int:
    sys.stdout.reconfigure(line_buffering=True)
    argv = list(sys.argv[1:] if argv is None else argv)
    try:
        command, argument = parse_args(argv)
    except UsageError as error:
        print(f"course-deploy: {error}\nTry 'course-deploy --help'.", file=sys.stderr)
        return 2
    if command == "help":
        print(USAGE)
        return 0
    if command == "version":
        print(f"course-deploy {__version__}")
        return 0

    hooks_allowed = not os.environ.get("SUDO_USER")
    prefix = os.environ.get("COURSE_DEPLOY_ROOT", "").rstrip("/") if hooks_allowed else ""
    if os.geteuid() != 0 and not prefix:
        print("course-deploy: this command must be run as root", file=sys.stderr)
        return 1
    sys.stdout = QuietStream(sys.stdout)
    sys.stderr = QuietStream(sys.stderr)
    signal.signal(signal.SIGTERM, _terminate)
    signal.signal(signal.SIGHUP, _terminate)

    def report(message: str) -> None:
        if command == "hook":
            print(f"{RESULT} FAILED {message}", flush=True)
        else:
            print(f"course-deploy: {message}", file=sys.stderr, flush=True)

    try:
        clock = _clock(hooks_allowed)
    except UsageError as error:
        print(f"course-deploy: {error}", file=sys.stderr)
        return 2
    try:
        ctx = load_context(prefix, command, clock)
        if command in ("timer", "hook", "force", "dry-run"):
            return run(ctx, command)
        if command == "status":
            return status(ctx)
        if command == "schedule":
            return schedule(ctx)
        if command == "rollback":
            return rollback(ctx, argument)
        return test_notify(ctx)
    except (ConfigError, DeployError) as error:
        report(str(error))
        return 1
    except Exception as error:  # noqa: BLE001 - the last line must say what failed
        traceback.print_exc(file=sys.stdout)
        report(f"unexpected error: {type(error).__name__}: {error}")
        return 1
