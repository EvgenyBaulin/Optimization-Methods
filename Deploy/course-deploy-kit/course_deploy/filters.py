# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Exclude rules in rsync style, shared by the Mac (publish.py) and the server.

A pattern without '/' matches a file or folder name at any depth; a trailing '/'
matches folders only; a pattern with an inner '/' matches the end of the path, or
the whole path from the entry folder when it starts with '/'. '*' stays within
one name, '**' crosses folders, '?' is one character, '[...]' a class. Paths are
relative to the entry folder. License files are kept whatever the patterns say,
unless a folder above them is excluded. Runs on Python 3.9.
"""

from __future__ import annotations

import os
import re
import shutil
import stat
from fnmatch import fnmatchcase
from typing import Iterable, List, Tuple

BUILTIN = (".*", "__MACOSX/", "__pycache__/", "*.bak", "*.swp", "*~")
LICENSE_NAMES = ("LICENSE*", "COPYING*", "NOTICE*")


class UnsafeFileError(ValueError):
    """A symlink or special file where only regular files and folders may be."""


def _translate(pattern: str) -> str:
    out = []
    i, n = 0, len(pattern)
    while i < n:
        c = pattern[i]
        if c == "*":
            if pattern.startswith("**", i):
                out.append(".*")
                i += 2
                continue
            out.append("[^/]*")
        elif c == "?":
            out.append("[^/]")
        elif c == "[":
            j = i + 1
            if j < n and pattern[j] in "!^":
                j += 1
            if j < n and pattern[j] == "]":
                j += 1
            while j < n and pattern[j] != "]":
                j += 1
            if j >= n:
                out.append(re.escape(c))
            else:
                body = pattern[i + 1:j].replace("\\", "\\\\")
                if body[:1] in ("!", "^"):
                    body = "^" + body[1:]
                out.append(f"[{body}]")
                i = j
        elif c == "\\" and i + 1 < n:
            i += 1
            out.append(re.escape(pattern[i]))
        else:
            out.append(re.escape(c))
        i += 1
    return "".join(out)


class Rule:
    def __init__(self, pattern: str):
        self.pattern = pattern
        body = pattern
        self.dir_only = body.endswith("/")
        body = body.rstrip("/")
        self.anchored = body.startswith("/")
        body = body.lstrip("/")
        self.whole_path = self.anchored or "/" in body or "**" in body
        regex = _translate(body)
        if self.whole_path and not self.anchored:
            regex = "(?:.*/)?" + regex
        self.regex = re.compile(regex + r"\Z", re.DOTALL)

    def matches(self, relpath: str, is_dir: bool) -> bool:
        if self.dir_only and not is_dir:
            return False
        subject = relpath if self.whole_path else relpath.rsplit("/", 1)[-1]
        return self.regex.match(subject) is not None


class Rules:
    def __init__(self, patterns: Iterable[str]):
        self.patterns = list(patterns)
        self.rules = [Rule(p) for p in self.patterns]

    @classmethod
    def with_builtin(cls, exclude_text: str = "") -> "Rules":
        return cls(list(BUILTIN) + parse_patterns(exclude_text))

    def matches(self, relpath: str, is_dir: bool) -> bool:
        """The name itself matches a pattern (its folders are not looked at)."""
        return any(rule.matches(relpath, is_dir) for rule in self.rules)

    def keeps(self, relpath: str) -> bool:
        """A file at relpath is published: no folder above it and not the file itself is excluded."""
        parts = relpath.split("/")
        for k in range(1, len(parts)):
            if self.matches("/".join(parts[:k]), True):
                return False
        if is_license(parts[-1]):
            return True
        return not self.matches(relpath, False)

    def split(self, relpaths: Iterable[str]) -> Tuple[List[str], List[str]]:
        kept, dropped = [], []
        for p in relpaths:
            (kept if self.keeps(p) else dropped).append(p)
        return kept, dropped


def is_license(name: str) -> bool:
    return any(fnmatchcase(name, p) for p in LICENSE_NAMES)


def forbidden_match(name: str, patterns: Iterable[str]) -> str:
    """The forbidden.txt pattern that a file name matches, ignoring case as pre-receive does; '' if none."""
    lower = name.lower()
    return next((p for p in patterns if fnmatchcase(lower, p.lower())), "")


def parse_patterns(text: str) -> List[str]:
    """Patterns of an exclude.txt: one per line, '#' lines and blank lines ignored."""
    if text.startswith("\ufeff"):
        text = text[1:]
    patterns = []
    for raw in text.splitlines():
        line = raw.strip()
        if line and not line.startswith("#"):
            patterns.append(line)
    return patterns


def copy_tree(source: str, target: str, rules: Rules) -> Tuple[List[str], List[str]]:
    """Copy the files of source kept by the rules into target; (copied, excluded) relative paths.

    Refuses symlinks and special files instead of following them.
    """
    copied: List[str] = []
    excluded: List[str] = []
    os.makedirs(target, exist_ok=True)
    for top, dirs, files in os.walk(source):
        rel_top = os.path.relpath(top, source)
        rel_top = "" if rel_top == "." else rel_top.replace(os.sep, "/")
        kept_dirs = []
        for name in sorted(dirs):
            rel = f"{rel_top}/{name}" if rel_top else name
            mode = os.lstat(os.path.join(top, name)).st_mode
            if not stat.S_ISDIR(mode):
                raise UnsafeFileError(f"not a regular folder: {rel}")
            if rules.matches(rel, True):
                excluded.append(rel + "/")
            else:
                kept_dirs.append(name)
        dirs[:] = kept_dirs
        for name in sorted(files):
            rel = f"{rel_top}/{name}" if rel_top else name
            src = os.path.join(top, name)
            if not stat.S_ISREG(os.lstat(src).st_mode):
                raise UnsafeFileError(f"not a regular file: {rel}")
            if not is_license(name) and rules.matches(rel, False):
                excluded.append(rel)
                continue
            dst = os.path.join(target, *rel.split("/"))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copyfile(src, dst)
            copied.append(rel)
    return copied, excluded
