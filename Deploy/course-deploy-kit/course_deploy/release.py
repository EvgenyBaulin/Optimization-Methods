# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Releases of a site: build from the bundle, validate, switch the web root, check it live,
roll back, keep the last few.

Nothing from the bundle is executed, imported or sourced: files are read and copied.
"""

from __future__ import annotations

import hashlib
import os
import re
import shutil
import subprocess
import tempfile
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Callable, Dict, FrozenSet, List, Optional, Sequence

from . import filters, pages, sitecheck
from .manifest import Entry, ManifestError, Site, parse_manifest, parse_source_info

RELEASE_NAME = re.compile(r"\d{8}T\d{6}Z-[0-9A-Za-z]+(?:-\d+)?\Z")
LEGACY = "00000000T000000Z-legacy"
BUILD_PREFIX = ".build-"
BUILD_MAX_AGE = 3600


class DeployError(Exception):
    """A failure that stops one site (or the run) with a message for the log and the Mac."""


@dataclass
class Context:
    prefix: str
    config: Dict[str, str]
    sites: List[Site]
    sites_text: str
    log: Callable[[str], None]
    clock: Callable[[], float]

    def path(self, absolute: str) -> str:
        """An absolute path of the tool, under COURSE_DEPLOY_ROOT when the tests set it."""
        return self.prefix + absolute

    @property
    def data_dir(self) -> str:
        return self.path(self.config["DATA_DIR"])

    @property
    def repo(self) -> str:
        return os.path.join(self.data_dir, "site.git")

    @property
    def releases(self) -> str:
        return os.path.join(self.data_dir, "releases")

    @property
    def state(self) -> str:
        return os.path.join(self.data_dir, "state")

    @property
    def work(self) -> str:
        return os.path.join(self.data_dir, "work")

    @property
    def lock(self) -> str:
        return os.path.join(self.data_dir, "lock")

    @property
    def timezone(self) -> str:
        return self.config["TIMEZONE"]

    def webroot(self, site: Site) -> str:
        return self.path(site.webroot)

    def site_dir(self, site: Site) -> str:
        return os.path.join(self.releases, site.name)


@dataclass
class Bundle:
    commit: str
    entries: List[Entry]
    exclude_text: str
    source: Dict[str, str]
    subject: str

    @property
    def main_subject(self) -> str:
        """The subject of the main commit, from 'Site build from <sha7>[ (dirty)]: <subject>'."""
        head, sep, rest = self.subject.partition(": ")
        return rest if sep and head.startswith("Site build from ") else self.subject


@dataclass
class Outcome:
    site: Site
    release: str
    paths: List[str]


def subprocess_env() -> Dict[str, str]:
    env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
    env["LC_ALL"] = "C.UTF-8"
    return env


def git_command(ctx: Context, *args: str) -> List[str]:
    return ["git", "-c", f"safe.directory={ctx.repo}", f"--git-dir={ctx.repo}", *args]


def git(ctx: Context, *args: str, check: bool = True) -> subprocess.CompletedProcess:
    result = subprocess.run(git_command(ctx, *args), stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            env=subprocess_env())
    if check and result.returncode != 0:
        message = result.stderr.decode("utf-8", "replace").strip()
        raise DeployError(f"git {args[0]} failed: {message}")
    return result


def tip(ctx: Context) -> Optional[str]:
    if not os.path.isdir(ctx.repo):
        raise DeployError(f"the repository {ctx.repo} does not exist; run install.sh")
    result = git(ctx, "rev-parse", "--verify", "--quiet", "refs/heads/site^{commit}", check=False)
    sha = result.stdout.decode().strip()
    return sha if result.returncode == 0 and sha else None


def read_blob(ctx: Context, commit: str, path: str) -> Optional[bytes]:
    result = git(ctx, "cat-file", "blob", f"{commit}:{path}", check=False)
    return result.stdout if result.returncode == 0 else None


def load_bundle(ctx: Context, commit: str) -> Bundle:
    """The bundle of a commit; DeployError if publish.conf or exclude.txt is missing or invalid."""
    raw = read_blob(ctx, commit, "publish.conf")
    if raw is None:
        raise DeployError(f"bundle {commit[:7]} has no publish.conf")
    exclude = read_blob(ctx, commit, "exclude.txt")
    if exclude is None:
        raise DeployError(f"bundle {commit[:7]} has no exclude.txt")
    try:
        entries = parse_manifest(raw.decode("utf-8"), bundle=True, known_sites=[s.name for s in ctx.sites],
                                 timezone=ctx.timezone)
    except UnicodeDecodeError:
        raise DeployError(f"bundle {commit[:7]}: publish.conf is not UTF-8") from None
    except ManifestError as error:
        raise DeployError(f"bundle {commit[:7]}: invalid publish.conf: " + "; ".join(error.problems)) from None
    source = read_blob(ctx, commit, "source.txt") or b""
    subject = git(ctx, "show", "-s", "--format=%s", commit).stdout.decode("utf-8", "replace").strip()
    return Bundle(commit, entries, exclude.decode("utf-8", "replace"),
                  parse_source_info(source.decode("utf-8", "replace")), subject)


def export_entry(ctx: Context, commit: str, slug: str, dest: str) -> None:
    """git archive of entries/<slug> unpacked into dest."""
    os.makedirs(dest)
    env = subprocess_env()
    with tempfile.TemporaryFile() as archive_err, tempfile.TemporaryFile() as tar_err:
        archive = subprocess.Popen(git_command(ctx, "archive", "--format=tar", f"{commit}:entries/{slug}"),
                                   stdout=subprocess.PIPE, stderr=archive_err, env=env)
        tar = subprocess.run(["tar", "-x", "--no-same-owner", "--no-same-permissions", "-C", dest, "-f", "-"],
                             stdin=archive.stdout, stderr=tar_err, env=env)
        archive.stdout.close()
        archive.wait()
        if archive.returncode != 0 or tar.returncode != 0:
            archive_err.seek(0)
            tar_err.seek(0)
            message = (archive_err.read() + tar_err.read()).decode("utf-8", "replace").strip()
            raise DeployError(f"cannot export entries/{slug} from {commit[:7]}: {message}")


def file_sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def site_files(root: str) -> List[str]:
    found = []
    for top, dirs, files in os.walk(root):
        for name in files:
            found.append(os.path.relpath(os.path.join(top, name), root).replace(os.sep, "/"))
    return sorted(found)


def tree_hash(root: str) -> str:
    """sha256 over the sorted (path, sha256 of content) pairs of every file but the root version.txt."""
    h = hashlib.sha256()
    for rel in site_files(root):
        if rel == "version.txt":
            continue
        digest = file_sha256(os.path.join(root, *rel.split("/")))
        h.update(rel.encode("utf-8", "surrogateescape") + b"\0" + digest.encode() + b"\n")
    return h.hexdigest()


def read_meta(ctx: Context, site: Site, name: str) -> Dict[str, str]:
    meta: Dict[str, str] = {}
    try:
        with open(os.path.join(ctx.site_dir(site), name + ".meta"), encoding="utf-8") as f:
            for line in f:
                key, sep, value = line.rstrip("\n").partition("=")
                if sep:
                    meta[key] = value
    except OSError:
        pass
    return meta


def list_releases(ctx: Context, site: Site) -> List[str]:
    try:
        names = os.listdir(ctx.site_dir(site))
    except FileNotFoundError:
        return []
    return sorted(n for n in names if RELEASE_NAME.match(n) and os.path.isdir(os.path.join(ctx.site_dir(site), n))
                  and not os.path.islink(os.path.join(ctx.site_dir(site), n)))


def live_release(ctx: Context, site: Site) -> Optional[str]:
    """The release the web root links to, if it is one of this site's releases."""
    webroot = ctx.webroot(site)
    if not os.path.islink(webroot):
        return None
    target = os.path.normpath(os.path.join(os.path.dirname(webroot), os.readlink(webroot)))
    if os.path.dirname(target) != os.path.normpath(ctx.site_dir(site)):
        return None
    name = os.path.basename(target)
    return name if RELEASE_NAME.match(name) else None


def _chmod_tree(root: str) -> None:
    os.chmod(root, 0o755)
    for top, dirs, files in os.walk(root):
        for name in dirs:
            os.chmod(os.path.join(top, name), 0o755)
        for name in files:
            os.chmod(os.path.join(top, name), 0o644)


def _write_atomic(path: str, text: str, mode: int = 0o644) -> None:
    tmp = f"{path}.tmp-{os.getpid()}"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(text)
    os.chmod(tmp, mode)
    os.replace(tmp, path)


def _utc_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _free_name(site_dir: str, base: str) -> str:
    name, n = base, 0
    while os.path.lexists(os.path.join(site_dir, name)) or os.path.lexists(os.path.join(site_dir, name + ".meta")):
        n += 1
        name = f"{base}-{n}"
    return name


class Build:
    """A site assembled in <releases>/<site>/.build-<random>; removed unless finalised."""

    def __init__(self, ctx: Context, site: Site, bundle: Bundle, entries: Sequence[Entry]):
        self.ctx = ctx
        self.site = site
        self.bundle = bundle
        self.entries = sorted(entries, key=lambda e: e.path)
        self.paths = [e.path for e in self.entries]
        os.makedirs(ctx.site_dir(site), mode=0o755, exist_ok=True)
        os.makedirs(ctx.work, mode=0o700, exist_ok=True)
        self.dir: Optional[str] = tempfile.mkdtemp(prefix=BUILD_PREFIX, dir=ctx.site_dir(site))
        self.tree = ""
        self.files = 0
        self.version = ""

    def assemble(self) -> None:
        ctx, site = self.ctx, self.site
        rules = filters.Rules.with_builtin(self.bundle.exclude_text)
        work = tempfile.mkdtemp(prefix=f"export-{site.name}-", dir=ctx.work)
        try:
            def source_of(entry: Entry) -> str:
                dest = os.path.join(work, entry.slug)
                export_entry(ctx, self.bundle.commit, entry.slug, dest)
                return dest

            try:
                placed = pages.lay_out(self.dir, self.entries, source_of, rules)
            except (pages.LayoutError, filters.UnsafeFileError) as error:
                raise DeployError(f"{site.name}: {error}") from None
        finally:
            shutil.rmtree(work, ignore_errors=True)
        for entry, copied, excluded, page in placed:
            note = f", {len(excluded)} excluded" if excluded else ""
            count = f"{len(copied)} file" + ("" if len(copied) == 1 else "s")
            ctx.log(f"{site.name}: {entry.path} has {count}{note}; entry page from {page}.")
        self.validate(pages.copied_pages(placed))
        self.files = len(site_files(self.dir))
        self.tree = tree_hash(self.dir)

    def validate(self, copies: FrozenSet[str]) -> None:
        name = self.site.name
        links = sitecheck.symlinks(self.dir)
        if links:
            raise DeployError(f"{name}: symlinks are not published: " + ", ".join(links[:5]))
        pointers = sitecheck.lfs_pointers(self.dir)
        if pointers:
            raise DeployError(f"{name}: Git LFS pointer files instead of content: " + ", ".join(pointers[:5]))
        errors, warnings = sitecheck.check_links(self.dir, copies)
        for line in warnings:
            self.ctx.log(f"{name}: {line}")
        if errors:
            for line in errors:
                self.ctx.log(f"{name}: {line}")
            raise DeployError(f"{name}: {len(errors)} missing file(s), first: {errors[0]}")

    def finalise(self) -> str:
        """Write version.txt and the meta, fix modes, rename to the release name; returns the name."""
        site_dir = self.ctx.site_dir(self.site)
        stamp = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
        name = _free_name(site_dir, f"{stamp}-{self.bundle.commit[:7]}")
        built = _utc_iso()
        source = self.bundle.source.get("commit", "unknown")
        self.version = (f"release {name}\ncommit {self.bundle.commit}\nsource {source}\nbuilt {built}\n")
        with open(os.path.join(self.dir, "version.txt"), "w", encoding="utf-8") as f:
            f.write(self.version)
        _chmod_tree(self.dir)
        os.rename(self.dir, os.path.join(site_dir, name))
        self.dir = None
        _write_atomic(os.path.join(site_dir, name + ".meta"),
                      f"tree={self.tree}\ncommit={self.bundle.commit}\nsource={source}\nbuilt={built}\n"
                      f"paths={' '.join(self.paths)}\n")
        return name

    def discard(self) -> None:
        if self.dir:
            shutil.rmtree(self.dir, ignore_errors=True)
            self.dir = None


def switch(ctx: Context, site: Site, release: Optional[str]) -> None:
    """Point the web root at a release with one rename(2); None removes the link."""
    webroot = ctx.webroot(site)
    if release is None:
        if os.path.islink(webroot):
            os.unlink(webroot)
        return
    tmp = os.path.join(os.path.dirname(webroot), f".{os.path.basename(webroot)}.course-deploy-new")
    if os.path.lexists(tmp):
        os.unlink(tmp)
    os.symlink(os.path.join(ctx.site_dir(site), release), tmp)
    os.replace(tmp, webroot)


def legacy_name(ctx: Context, site: Site) -> Optional[str]:
    """The release name for a plain web root folder that the first switch moves away; None if there is none."""
    webroot = ctx.webroot(site)
    if os.path.islink(webroot) or not os.path.lexists(webroot):
        return None
    if not os.path.isdir(webroot):
        raise DeployError(f"{site.name}: {webroot} is neither a folder nor a symlink; left as is")
    return _free_name(ctx.site_dir(site), LEGACY)


def _curl(site: Site, path: str, body: bool) -> subprocess.CompletedProcess:
    url = site.url + path
    command = ["curl", "-sS", "--fail", "--max-time", "10", "--noproxy", "*",
               "--resolve", f"{site.host}:{site.port}:127.0.0.1"]
    if not body:
        command += ["-o", "/dev/null", "-w", "%{http_code}"]
    return subprocess.run(command + [url], stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=subprocess_env())


def live_check(site: Site, version: Optional[str], paths: Sequence[str]) -> Optional[str]:
    """None when /version.txt is the expected text and every path answers 200; else what failed."""
    if version is not None:
        r = _curl(site, "/version.txt", body=True)
        if r.returncode != 0:
            return f"{site.url}/version.txt: {r.stderr.decode('utf-8', 'replace').strip()}"
        if r.stdout.decode("utf-8", "replace") != version:
            return f"{site.url}/version.txt does not show the new release"
    for path in paths:
        r = _curl(site, path, body=False)
        code = r.stdout.decode().strip()
        if r.returncode != 0 or code != "200":
            detail = r.stderr.decode("utf-8", "replace").strip() or f"HTTP {code}"
            return f"{site.url}{path}: {detail}"
    return None


def remove_release(ctx: Context, site: Site, name: str) -> None:
    shutil.rmtree(os.path.join(ctx.site_dir(site), name), ignore_errors=True)
    try:
        os.unlink(os.path.join(ctx.site_dir(site), name + ".meta"))
    except FileNotFoundError:
        pass


def deploy(ctx: Context, site: Site, bundle: Bundle, entries: Sequence[Entry], dry_run: bool) -> Optional[Outcome]:
    """Build and publish one site; the Outcome when the web root was switched, else None."""
    build = Build(ctx, site, bundle, entries)
    try:
        ctx.log(f"{site.name}: building {', '.join(build.paths)} from {bundle.commit[:7]}.")
        build.assemble()
        live = live_release(ctx, site)
        same = bool(live) and read_meta(ctx, site, live).get("tree") == build.tree
        if dry_run:
            state = "same as live" if same else "differs from live"
            ctx.log(f"{site.name}: would publish {build.files} files at {', '.join(build.paths)} ({state})")
            return None
        if same:
            ctx.log(f"{site.name}: unchanged, {live} stays live.")
            return None
        name = build.finalise()
    finally:
        build.discard()

    # from here until the check has passed, any exit (an error, Ctrl-C, SIGTERM) restores the old state
    webroot = ctx.webroot(site)
    legacy = None
    try:
        legacy = legacy_name(ctx, site)
        if legacy:
            shutil.move(webroot, os.path.join(ctx.site_dir(site), legacy))
        switch(ctx, site, name)
    except BaseException as error:
        if legacy and not os.path.lexists(webroot) and os.path.isdir(os.path.join(ctx.site_dir(site), legacy)):
            shutil.move(os.path.join(ctx.site_dir(site), legacy), webroot)
        remove_release(ctx, site, name)
        if isinstance(error, (OSError, DeployError)):
            raise DeployError(f"{site.name}: cannot switch the web root: {error}") from None
        raise
    previous = legacy or live
    try:
        if legacy:
            ctx.log(f"{site.name}: moved the old web root folder {webroot} to the releases as {legacy}.")
        ctx.log(f"{site.name}: web root switched to {name}; checking it over {site.scheme.upper()}.")
        problem = live_check(site, build.version, build.paths)
    except BaseException:
        switch(ctx, site, previous)
        remove_release(ctx, site, name)
        raise
    if problem:
        switch(ctx, site, previous)
        remove_release(ctx, site, name)
        back = f"switched back to {previous}" if previous else "web root link removed"
        raise DeployError(f"{site.name}: live check failed, {back}: {problem}")
    ctx.log(f"{site.name}: {name} is live.")
    prune(ctx, site, name, previous)
    return Outcome(site, name, build.paths)


def prune(ctx: Context, site: Site, live: str, previous: Optional[str]) -> None:
    """Keep the newest KEEP_RELEASES by name, the live one and the one before it; drop old builds."""
    names = list_releases(ctx, site)
    keep = set(names[-int(ctx.config["KEEP_RELEASES"]):])
    keep.add(live)
    if previous:
        keep.add(previous)
    if live in names and names.index(live) > 0:
        keep.add(names[names.index(live) - 1])
    site_dir = ctx.site_dir(site)
    for name in names:
        if name not in keep:
            remove_release(ctx, site, name)
            ctx.log(f"{site.name}: removed old release {name}.")
    for entry in os.listdir(site_dir):
        full = os.path.join(site_dir, entry)
        if entry.endswith(".meta") and not os.path.isdir(full[:-len(".meta")]):
            os.unlink(full)
        elif entry.startswith(BUILD_PREFIX) and time.time() - os.lstat(full).st_mtime > BUILD_MAX_AGE:
            shutil.rmtree(full, ignore_errors=True)


def rollback(ctx: Context, site: Site) -> str:
    """Switch to the release just before the live one (by name) and check it; its name."""
    live = live_release(ctx, site)
    if live is None:
        raise DeployError(f"{site.name}: the web root {ctx.webroot(site)} is not a link to a release; "
                          "nothing to roll back")
    names = list_releases(ctx, site)
    index = names.index(live) if live in names else -1
    if index <= 0:
        raise DeployError(f"{site.name}: no release older than {live} to roll back to")
    target = names[index - 1]
    version_file = os.path.join(ctx.site_dir(site), target, "version.txt")
    version = None
    if os.path.isfile(version_file):
        with open(version_file, encoding="utf-8") as f:
            version = f.read()
    paths = read_meta(ctx, site, target).get("paths", "/").split()
    switch(ctx, site, target)
    try:
        problem = live_check(site, version, paths)
    except BaseException:
        switch(ctx, site, live)
        raise
    if problem:
        switch(ctx, site, live)
        raise DeployError(f"{site.name}: live check of {target} failed, {live} stays live: {problem}")
    return target
