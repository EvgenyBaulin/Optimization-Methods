# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Link, symlink and Git LFS checks of a site laid out on disk, shared by the Mac and the server.

Assets (scripts, images, stylesheets, media, frames, objects) must exist; a broken
<a href> is only a warning. Names are compared case-sensitively, as on the server,
even on a case-insensitive Mac disk. Runs on Python 3.9.
"""

from __future__ import annotations

import os
import posixpath
import re
from html.parser import HTMLParser
from typing import AbstractSet, Dict, List, Optional, Set, Tuple
from urllib.parse import unquote, urlsplit

ASSETS = {
    "script": "src",
    "img": "src",
    "link": "href",
    "source": "src",
    "video": "src",
    "audio": "src",
    "track": "src",
    "iframe": "src",
    "embed": "src",
    "object": "data",
}
SKIP = re.compile(r"([A-Za-z][A-Za-z0-9+.-]*:|//|#|\Z)")
LFS_PREFIXES = (b"version https://git-lfs.github.com/spec/", b"version https://hawser.github.com/spec/")
LFS_MAX_SIZE = 1024


def is_lfs_pointer(path: str) -> bool:
    """A Git LFS pointer file: a small text starting with the LFS spec line."""
    try:
        if os.path.getsize(path) >= LFS_MAX_SIZE:
            return False
        with open(path, "rb") as f:
            head = f.read(LFS_MAX_SIZE)
    except OSError:
        return False
    return head.startswith(LFS_PREFIXES)


def _walk(root: str):
    for top, dirs, files in os.walk(root):
        rel_top = os.path.relpath(top, root)
        rel_top = "" if rel_top == "." else rel_top.replace(os.sep, "/")
        dirs.sort()
        for name in sorted(dirs + files):
            yield (f"{rel_top}/{name}" if rel_top else name), os.path.join(top, name)


def symlinks(root: str) -> List[str]:
    return [rel for rel, full in _walk(root) if os.path.islink(full)]


def lfs_pointers(root: str) -> List[str]:
    return [rel for rel, full in _walk(root) if os.path.isfile(full) and not os.path.islink(full)
            and is_lfs_pointer(full)]


class _Refs(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs: List[Tuple[bool, str]] = []

    def handle_starttag(self, tag, attrs):
        wanted = ASSETS.get(tag)
        for name, value in attrs:
            if value is None:
                continue
            if name == wanted:
                self.refs.append((True, value))
            elif tag == "a" and name == "href":
                self.refs.append((False, value))


class _Tree:
    """Exact-case lookups under a root, with cached folder listings."""

    def __init__(self, root: str):
        self.root = root
        self.cache: Dict[str, Optional[Set[str]]] = {}

    def _listing(self, rel_dir: str) -> Optional[Set[str]]:
        if rel_dir not in self.cache:
            full = os.path.join(self.root, *rel_dir.split("/")) if rel_dir else self.root
            try:
                self.cache[rel_dir] = set(os.listdir(full))
            except OSError:
                self.cache[rel_dir] = None
        return self.cache[rel_dir]

    def kind(self, rel: str) -> Optional[str]:
        if rel == "":
            return "dir"
        parent, _, name = rel.rpartition("/")
        if parent and self.kind(parent) != "dir":
            return None
        listing = self._listing(parent)
        if listing is None or name not in listing:
            return None
        full = os.path.join(self.root, *rel.split("/"))
        if os.path.isdir(full):
            return "dir"
        return "file" if os.path.isfile(full) else None


def _problem(tree: _Tree, page: str, ref: str) -> Optional[str]:
    try:
        path = unquote(urlsplit(ref).path)
    except ValueError:
        return "malformed address"
    if not path:
        return None
    base = "" if path.startswith("/") else posixpath.dirname(page)
    joined = posixpath.normpath(posixpath.join(base, path.lstrip("/")))
    if joined == ".":
        joined = ""
    if joined == ".." or joined.startswith("../"):
        return "outside the site"
    kind = tree.kind(joined)
    if path.endswith("/") or kind == "dir":
        if kind != "dir":
            return "no such folder"
        index = f"{joined}/index.html" if joined else "index.html"
        return None if tree.kind(index) == "file" else "folder without index.html"
    return None if kind == "file" else "no such file"


def check_links(root: str, skip: AbstractSet[str] = frozenset()) -> Tuple[List[str], List[str]]:
    """(errors, warnings) for every HTML page under root, pages named from the site root.

    Pages in skip (site-relative, such as an index.html copied from main.html) are link
    targets but are not read, so a copy does not repeat the findings of its original.
    """
    tree = _Tree(root)
    errors: List[str] = []
    warnings: List[str] = []
    for rel, full in _walk(root):
        if not rel.lower().endswith((".html", ".htm")) or rel in skip or not os.path.isfile(full):
            continue
        parser = _Refs()
        with open(full, "rb") as f:
            parser.feed(f.read().decode("utf-8", errors="replace"))
        parser.close()
        for is_asset, raw in parser.refs:
            ref = raw.strip()
            if SKIP.match(ref):
                continue
            problem = _problem(tree, rel, ref)
            if problem is None:
                continue
            if is_asset:
                errors.append(f"ERROR missing file: /{rel} -> {ref} ({problem})")
            else:
                warnings.append(f"warning broken link: /{rel} -> {ref} ({problem})")
    return errors, warnings
