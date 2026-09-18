#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Publish the course site from this Mac.

Builds the bundle of the folders listed in Deploy/publish.conf (minus Deploy/exclude.txt),
checks it laid out as the site, commits it to refs/course-deploy/site without touching the
working tree, the index or any branch, and pushes it to refs/heads/site on the server,
which publishes it and answers with "course-deploy:" result lines.
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import unicodedata
from datetime import datetime, timezone
from typing import Dict, List, Optional, Sequence, Tuple

if sys.version_info < (3, 9):
    sys.exit("publish.py needs Python 3.9 or newer")

# keep __pycache__ out of the kit folder that is uploaded to the server
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, "course-deploy-kit")
sys.path.insert(0, KIT)

from course_deploy import __version__, filters, manifest, pages, sitecheck  # noqa: E402

DEFAULT_REMOTE = "deploy"
# the existing ssh host Main_server gives the address; the push goes as deploy with its own key
REMOTE_HINT = ("git remote add deploy deploy@Main_server:/srv/course-deploy/site.git\n"
               "  git config core.sshCommand \"ssh -i ~/.ssh/course_deploy -o IdentitiesOnly=yes\"")
SERVER_REF = "refs/heads/site"
LOCAL_REF = "refs/course-deploy/site"
TIMEZONE = manifest.DEFAULT_TIMEZONE
MAX_LISTED = 20
HASH_CHUNK = 200
ANSI = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")
SANITIZED = ("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY",
             "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_NAMESPACE", "GIT_PREFIX")


class Refusal(Exception):
    """publish.py stops without writing anything to git or the server."""


def git_env(extra: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    env = {k: v for k, v in os.environ.items() if k not in SANITIZED}
    env["GIT_OPTIONAL_LOCKS"] = "0"
    if extra:
        env.update(extra)
    return env


def git(repo: str, *args: str, input: Optional[bytes] = None, env: Optional[Dict[str, str]] = None,
        cwd: Optional[str] = None, check: bool = True) -> subprocess.CompletedProcess:
    command = ["git", *args] if cwd else ["git", "-C", repo, *args]
    result = subprocess.run(command, input=input, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            env=env or git_env(), cwd=cwd)
    if check and result.returncode != 0:
        message = result.stderr.decode("utf-8", "replace").strip()
        raise Refusal(f"git {args[0]} failed: {message}")
    return result


def nul_split(data: bytes) -> List[bytes]:
    return [r for r in data.split(b"\0") if r]


def pathspec(folder: str) -> str:
    return f":(literal){folder}/"


def listed(paths: Sequence[str], indent: str = "  ") -> List[str]:
    lines = [indent + p for p in paths[:MAX_LISTED]]
    if len(paths) > MAX_LISTED:
        lines.append(f"{indent}... and {len(paths) - MAX_LISTED} more")
    return lines


def folder_problem(repo: str, folder: str) -> Optional[str]:
    """None when folder (a folder or a single file) exists in the repository with exactly this spelling.

    Names are compared in NFC, as git reports them, whatever form the Mac disk keeps them in.
    """
    current = repo
    for part in folder.split("/"):
        try:
            names = {unicodedata.normalize("NFC", n): n for n in os.listdir(current)}
        except OSError:
            return "does not exist"
        part = unicodedata.normalize("NFC", part)
        if part not in names:
            if part.lower() in {n.lower() for n in names}:
                return f"does not exist (check the letter case of '{part}')"
            return "does not exist"
        current = os.path.join(current, names[part])
        if os.path.islink(current):
            return "is a symlink"
    return None if os.path.isdir(current) or os.path.isfile(current) else "is neither a folder nor a file"


class Plan:
    """What one entry publishes: files relative to base (its folder, or the folder of its single file)."""

    def __init__(self, entry: manifest.Entry):
        self.entry = entry
        self.base = entry.folder
        self.files: List[str] = []
        self.excluded: List[str] = []
        self.page = ""


def collect(repo: str, entries: Sequence[manifest.Entry], rules: filters.Rules, forbidden: Sequence[str],
            allow_dirty: bool) -> Tuple[List[Plan], bool]:
    """The files of every entry and whether any published folder differs from HEAD."""
    dirty: List[str] = []
    problems: List[str] = []
    plans = []
    for entry in entries:
        problem = folder_problem(repo, entry.folder)
        if problem:
            problems.append(f"{entry.folder} (line {entry.line}) {problem}")
            continue
        # a line may name one file, such as the landing page next to the seminar folders
        single = os.path.isfile(os.path.join(repo, entry.folder))
        spec = f":(literal){entry.folder}" if single else pathspec(entry.folder)
        status = git(repo, "status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames",
                     "--", spec).stdout
        dirty += [os.fsdecode(r[3:]) for r in nul_split(status)]

        paths = []
        for record in nul_split(git(repo, "ls-files", "-z", "-s", "--", spec).stdout):
            meta, _, name = record.partition(b"\t")
            mode, _, stage = meta.decode().split(" ")
            path = os.fsdecode(name)
            if mode == "120000":
                problems.append(f"{path} is a symlink; publish the file itself")
            elif mode == "160000":
                problems.append(f"{path} is a git submodule; submodules are not published")
            elif stage != "0":
                problems.append(f"{path} has an unresolved merge conflict")
            else:
                paths.append(path)
        if allow_dirty:
            others = git(repo, "ls-files", "-z", "-o", "--exclude-standard", "--", spec).stdout
            paths += [os.fsdecode(r) for r in nul_split(others)]

        plan = Plan(entry)
        if single:
            plan.base = entry.folder.rpartition("/")[0]
        prefix = plan.base + "/" if plan.base else ""
        relative = []
        for path in sorted(set(paths)):
            full = os.path.join(repo, path)
            try:
                mode = os.lstat(full).st_mode
            except (FileNotFoundError, NotADirectoryError):
                continue  # deleted in the working tree: dirty, or skipped with --allow-dirty
            except OSError as error:
                problems.append(f"{path} cannot be read: {error.strerror}")
                continue
            if stat.S_ISLNK(mode):
                problems.append(f"{path} is a symlink; publish the file itself")
            elif not stat.S_ISREG(mode):
                problems.append(f"{path} is not a regular file")
            elif manifest.CONTROL.search(path):
                problems.append(f"{path!r} has a control character in its name")
            else:
                relative.append(path[len(prefix):])
        plan.files, plan.excluded = rules.split(relative)
        for rel in plan.files:
            pattern = filters.forbidden_match(rel.rsplit("/", 1)[-1], forbidden)
            if pattern:
                problems.append(f"{prefix + rel} matches {pattern} of the server's forbidden.txt (case does not "
                                "matter there); rename it or exclude it in Deploy/exclude.txt")
            elif sitecheck.is_lfs_pointer(os.path.join(repo, prefix + rel)):
                problems.append(f"{prefix + rel} is a Git LFS pointer, not the file itself; "
                                "run 'git lfs pull' and try again")
        if not plan.files and relative:
            problems.append(f"{entry.folder} (line {entry.line}) has no files left after Deploy/exclude.txt")
        elif not plan.files:
            problems.append(f"{entry.folder} (line {entry.line}) has no files committed to git")
        plans.append(plan)

    if dirty and not allow_dirty:
        lines = ["Refusing to publish: uncommitted changes in published folders:"]
        lines += listed(sorted(set(dirty)))
        lines.append("Commit them first (git add, git commit), or publish them as they are with --allow-dirty.")
        raise Refusal("\n".join(lines))
    if problems:
        raise Refusal("\n".join(["Refusing to publish:"] + listed(problems)))
    return plans, bool(dirty)


def stage_bundle(repo: str, bundle: str, plans: Sequence[Plan], exclude_text: str, source: str) -> None:
    for plan in plans:
        base = os.path.join(bundle, "entries", plan.entry.slug)
        for rel in plan.files:
            dst = os.path.join(base, *rel.split("/"))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copyfile(os.path.join(repo, plan.base, rel), dst)
    with open(os.path.join(bundle, "publish.conf"), "w", encoding="utf-8") as f:
        f.write(manifest.render_bundle_manifest(p.entry for p in plans))
    with open(os.path.join(bundle, "exclude.txt"), "w", encoding="utf-8") as f:
        f.write(exclude_text)
    with open(os.path.join(bundle, "source.txt"), "w", encoding="utf-8") as f:
        f.write(source)


def check_site(bundle: str, scratch: str, plans: Sequence[Plan], rules: filters.Rules) -> List[str]:
    """Lay the bundle out as each site, with every entry published; refuses on missing assets.

    Returns the link warnings.
    """
    warnings: List[str] = []
    errors: List[str] = []
    by_site: Dict[str, List[Plan]] = {}
    for plan in plans:
        by_site.setdefault(plan.entry.site, []).append(plan)
    for site, site_plans in by_site.items():
        root = os.path.join(scratch, site)
        os.makedirs(root)
        try:
            placed = pages.lay_out(root, [p.entry for p in site_plans],
                                   lambda e: os.path.join(bundle, "entries", e.slug), rules)
        except (pages.LayoutError, filters.UnsafeFileError) as error:
            raise Refusal(f"Refusing to publish: {error}") from None
        page_of = {e.path: page for e, _, _, page in placed}
        for plan in site_plans:
            plan.page = page_of[plan.entry.path]
        site_errors, site_warnings = sitecheck.check_links(root, pages.copied_pages(placed))
        errors += [f"{site}: {line}" for line in site_errors]
        warnings += [f"{site}: {line}" for line in site_warnings]
    if errors:
        raise Refusal("\n".join(["Refusing to publish: pages refer to files that are not in the bundle:"]
                                + listed(errors)))
    return warnings


def when_text(entry: manifest.Entry, now: datetime) -> str:
    at = entry.publish_time(TIMEZONE)
    if at is None:
        return "now"
    if at <= now:
        return f"{entry.when} (now)"
    return f"{entry.when} ({manifest.countdown((at - now).total_seconds())})"


def print_plan(plans: Sequence[Plan], warnings: Sequence[str], head: str, subject: str, dirty: bool) -> None:
    now = datetime.now(timezone.utc)
    print(f"Source: {head[:7]} (dirty: {'yes' if dirty else 'no'}) {subject}")
    print(f"Publish times are {TIMEZONE} time.")
    print()
    width = max(len(p.entry.path) for p in plans)
    for plan in sorted(plans, key=lambda p: (p.entry.site, p.entry.path)):
        e = plan.entry
        print(f"{e.site}  {e.path.ljust(width)}  {e.folder}")
        count = f"{len(plan.files)} file" + ("" if len(plan.files) == 1 else "s")
        print(f"    {when_text(e, now)}, {count}, entry page: {plan.page}")
        if plan.excluded:
            print(f"    excluded ({len(plan.excluded)}):")
            for line in listed(plan.excluded, indent="      "):
                print(line)
    print()
    if warnings:
        print(f"Link warnings ({len(warnings)}):")
        for line in warnings:
            print(f"  {line}")
    else:
        print("Link warnings: none.")


def build_tree(repo: str, bundle: str, scratch: str) -> str:
    """Write the bundle's blobs and tree with plumbing only (no working tree, no real index)."""
    gitdir = git(repo, "rev-parse", "--absolute-git-dir").stdout.decode().strip()
    paths = []
    for top, dirs, files in os.walk(bundle):
        dirs.sort()
        for name in files:
            paths.append(os.path.relpath(os.path.join(top, name), bundle).replace(os.sep, "/"))
    paths.sort()
    shas: List[str] = []
    for i in range(0, len(paths), HASH_CHUNK):
        chunk = paths[i:i + HASH_CHUNK]
        out = git(repo, f"--git-dir={gitdir}", "hash-object", "-w", "--no-filters", "--", *chunk, cwd=bundle).stdout
        shas += out.decode().split()
    if len(shas) != len(paths):
        raise Refusal("git hash-object returned an unexpected number of objects")
    records = b"".join(b"100644 " + sha.encode() + b"\t" + os.fsencode(path) + b"\0"
                       for sha, path in zip(shas, paths))
    # a path that does not exist yet: git refuses an empty index file
    index_env = git_env({"GIT_INDEX_FILE": os.path.join(scratch, "index")})
    git(repo, "update-index", "--add", "-z", "--index-info", input=records, env=index_env)
    return git(repo, "write-tree", env=index_env).stdout.decode().strip()


def comparable(repo: str, tree: str) -> List[bytes]:
    """The top-level entries of a bundle tree except source.txt, which changes with every build."""
    return [r for r in nul_split(git(repo, "ls-tree", "-z", tree).stdout) if not r.endswith(b"\tsource.txt")]


def fetch_tip(repo: str, remote: str) -> Optional[str]:
    """The server's site tip, fetched into refs/course-deploy/site; None if the branch is new."""
    probe = git(repo, "ls-remote", "--exit-code", remote, SERVER_REF, check=False)
    if probe.returncode == 2:
        if git(repo, "rev-parse", "--verify", "--quiet", LOCAL_REF, check=False).returncode == 0:
            git(repo, "update-ref", "-d", LOCAL_REF)
        return None
    if probe.returncode != 0:
        message = probe.stderr.decode("utf-8", "replace").strip()
        raise Refusal(f"Cannot reach the server through the remote '{remote}':\n{message}")
    git(repo, "fetch", "--quiet", "--no-tags", "--refmap=", remote, f"+{SERVER_REF}:{LOCAL_REF}")
    return git(repo, "rev-parse", "--verify", f"{LOCAL_REF}^{{commit}}").stdout.decode().strip()


def push(repo: str, remote: str, commit: str) -> Tuple[int, List[str]]:
    """git push, echoing its output as it comes; (exit code, result lines of the server)."""
    command = ["git", "-C", repo, "push", remote, f"{commit}:{SERVER_REF}"]
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=git_env())
    results = []
    assert process.stdout is not None
    for raw in iter(process.stdout.readline, b""):
        line = ANSI.sub("", raw.decode("utf-8", "replace")).rstrip()
        print(line, flush=True)
        text = line[len("remote:"):].strip() if line.startswith("remote:") else line.strip()
        if text.startswith("course-deploy: "):
            results.append(text)
    return process.wait(), results


def parse_args(argv: Optional[Sequence[str]]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="publish.py",
        description="Publish the course site: build the bundle from Deploy/publish.conf, check it, "
                    "commit it and push it to the server.")
    parser.add_argument("--dry-run", action="store_true",
                        help="build and check only; print the plan; no git writes, no network")
    parser.add_argument("--allow-dirty", action="store_true",
                        help="also publish uncommitted and untracked (not ignored) files in the published folders")
    parser.add_argument("--remote", default=DEFAULT_REMOTE, metavar="NAME",
                        help=f"git remote to push to (default: {DEFAULT_REMOTE})")
    parser.add_argument("--version", action="version", version=f"publish.py {__version__}")
    return parser.parse_args(argv)


def read_text(path: str, what: str) -> str:
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except OSError as error:
        raise Refusal(f"Cannot read {what} ({path}): {error.strerror}") from None
    except UnicodeDecodeError:
        raise Refusal(f"{what} is not UTF-8 text: {path}") from None


def publish(args: argparse.Namespace) -> int:
    top = git(HERE, "rev-parse", "--show-toplevel", check=False)
    if top.returncode != 0:
        raise Refusal(f"{HERE} is not inside a git repository")
    repo = top.stdout.decode().strip()
    head = git(repo, "rev-parse", "--verify", "--quiet", "HEAD^{commit}", check=False).stdout.decode().strip()
    if not head:
        raise Refusal("The repository has no commit yet; commit the site first.")
    subject = git(repo, "log", "-1", "--format=%s", head).stdout.decode("utf-8", "replace").strip()

    if not args.dry_run and git(repo, "remote", "get-url", args.remote, check=False).returncode != 0:
        raise Refusal(f"There is no git remote '{args.remote}'. Add it once, in the repository, with:\n  {REMOTE_HINT}")

    known = [s.name for s in manifest.parse_sites(read_text(os.path.join(KIT, "sites.conf"),
                                                              "Deploy/course-deploy-kit/sites.conf"))]
    try:
        entries = manifest.parse_manifest(read_text(os.path.join(HERE, "publish.conf"), "Deploy/publish.conf"),
                                          bundle=False, known_sites=known, timezone=TIMEZONE,
                                          label="Deploy/publish.conf")
    except manifest.ManifestError as error:
        raise Refusal("Refusing to publish: Deploy/publish.conf is invalid:\n" + "\n".join(
            "  " + p for p in error.problems)) from None
    if not entries:
        raise Refusal("Deploy/publish.conf lists no folder; there is nothing to publish.")
    # git reports paths in NFC; the title is the last part of the folder name
    folders = [unicodedata.normalize("NFC", e.folder) for e in entries]
    entries = [manifest.Entry(e.line, e.site, e.path, f, e.when, f.rsplit("/", 1)[-1])
               for e, f in zip(entries, folders)]
    exclude_text = read_text(os.path.join(HERE, "exclude.txt"), "Deploy/exclude.txt")
    rules = filters.Rules.with_builtin(exclude_text)
    forbidden = filters.parse_patterns(read_text(os.path.join(KIT, "forbidden.txt"),
                                                 "Deploy/course-deploy-kit/forbidden.txt"))

    plans, dirty = collect(repo, entries, rules, forbidden, args.allow_dirty)
    built = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    source = (f"commit: {head}\ndirty: {'yes' if dirty else 'no'}\nbuilt: {built}\n"
              f"publish.py: {__version__}\n")

    scratch = tempfile.mkdtemp(prefix="course-deploy-")
    try:
        bundle = os.path.join(scratch, "bundle")
        os.makedirs(bundle)
        stage_bundle(repo, bundle, plans, exclude_text, source)
        warnings = check_site(bundle, os.path.join(scratch, "site"), plans, rules)
        print_plan(plans, warnings, head, subject, dirty)

        if args.dry_run:
            if git(repo, "remote", "get-url", args.remote, check=False).returncode != 0:
                print(f"\nNote: there is no git remote '{args.remote}' yet; add it with:\n  {REMOTE_HINT}")
            print("\nDry run: nothing was committed or pushed.")
            return 0

        print(f"\nAsking the server for its current build ({args.remote})...", flush=True)
        parent = fetch_tip(repo, args.remote)
        message = f"Site build from {head[:7]}{' (dirty)' if dirty else ''}: {subject}"
        tree = build_tree(repo, bundle, scratch)
        if parent and comparable(repo, tree) == comparable(repo, f"{parent}^{{tree}}"):
            print("Nothing to publish: the server already has this build.")
            return 0
        command = ["commit-tree", "--no-gpg-sign", tree, "-m", message] + (["-p", parent] if parent else [])
        commit = git(repo, *command).stdout.decode().strip()

        print(f"Pushing {commit[:7]} to {args.remote}...", flush=True)
        try:
            code, results = push(repo, args.remote, commit)
        except KeyboardInterrupt:
            print("\nInterrupted during the push: the server may already have this build. "
                  "Run 'course-deploy status' on the server, or publish again.", file=sys.stderr)
            return 1
        if code == 0:
            git(repo, "update-ref", LOCAL_REF, commit)
        failed = [r for r in results if r.startswith(("course-deploy: FAILED", "course-deploy: REJECTED"))]
        if failed:
            print("\nThe server did not publish this build; see the lines above and Deploy/README.md.")
            return 1
        if code != 0:
            print("\ngit push failed; see the lines above and the troubleshooting table in Deploy/README.md.")
            return 1
        if any(r.startswith("course-deploy: OK") for r in results):
            print("\nPublished.")
            return 0
        print("\nThe push arrived, but the server reported no result: check the lines above "
              "(e.g. 'sudo: a password is required') and run 'course-deploy status' on the server.")
        return 1
    finally:
        shutil.rmtree(scratch, ignore_errors=True)


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    try:
        return publish(args)
    except Refusal as refusal:
        print(str(refusal), file=sys.stderr)
        return 1
    except manifest.ManifestError as error:
        print(f"Refusing to publish:\n{error}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("Interrupted; nothing was pushed.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
