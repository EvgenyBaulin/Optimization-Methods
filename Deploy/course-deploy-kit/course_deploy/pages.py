# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Site layout: entries in their folders, entry pages, generated listings and folder indexes.

The Mac (publish.py) lays out the bundle with the same code before its link check,
so it sees the site as the server will build it. Runs on Python 3.9.
"""

from __future__ import annotations

import html
import os
import shutil
from typing import Callable, FrozenSet, Iterable, List, Sequence, Tuple
from urllib.parse import quote

from . import filters
from .manifest import Entry, segments

FOOTER = "Copyright (c) 2026 Evgeny Baulin"
ROOT_HEADING = "Contents"

# The atlas font stack and colours (Atlas/styles.css), light and dark.
STYLE = """\
:root {
  color-scheme: light dark;
  --bg: #f4f6f8;
  --panel: #ffffff;
  --fg: #161d26;
  --muted: #6b7684;
  --line: #d8dee6;
  --accent: #2f6f9f;
  --font: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f1319;
    --panel: #171d26;
    --fg: #e6ebf2;
    --muted: #8b97a6;
    --line: #2a3441;
    --accent: #6fb3e0;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font);
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
main, footer { max-width: 760px; margin: 0 auto; padding: 0 16px; }
main { padding-top: 32px; padding-bottom: 24px; }
h1 { margin: 0 0 16px; font-size: 22px; font-weight: 620; letter-spacing: -0.01em; }
ul {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
}
li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 14px;
  border-top: 1px solid var(--line);
}
li:first-child { border-top: 0; }
a { color: var(--accent); text-decoration: none; overflow-wrap: anywhere; }
a:hover, a:focus-visible { text-decoration: underline; }
.size { color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
footer { padding-bottom: 32px; color: var(--muted); font-size: 13px; }
"""


class LayoutError(ValueError):
    """Entries that cannot be laid out: a collision or an entry left without files."""


def human_size(size: int) -> str:
    if size < 1024:
        return f"{size} B"
    if size < 1024 * 1024:
        return f"{size / 1024:.1f} KB"
    return f"{size / (1024 * 1024):.1f} MB"


def heading(segment: str) -> str:
    """A path segment in title case: 'seminars' -> 'Seminars', 'old-notes' -> 'Old Notes'."""
    words = segment.replace("_", " ").replace("-", " ").split()
    return " ".join(w[:1].upper() + w[1:] for w in words) or segment


def _page(title: str, items: Sequence[Tuple[str, str, str]]) -> str:
    """A page with a heading and one list row (href, label, note) per item; everything escaped."""
    rows = []
    for href, label, note in items:
        row = f'<li><a href="{html.escape(href)}">{html.escape(label)}</a>'
        if note:
            row += f'<span class="size">{html.escape(note)}</span>'
        rows.append(row + "</li>")
    t = html.escape(title)
    return (
        "<!doctype html>\n"
        '<html lang="en">\n'
        "<head>\n"
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        f"<title>{t}</title>\n"
        f"<style>\n{STYLE}</style>\n"
        "</head>\n"
        "<body>\n"
        "<main>\n"
        f"<h1>{t}</h1>\n"
        "<ul>\n" + "\n".join(rows) + "\n</ul>\n"
        "</main>\n"
        f"<footer>{html.escape(FOOTER)}</footer>\n"
        "</body>\n"
        "</html>\n"
    )


def _files(folder: str) -> List[Tuple[str, int]]:
    found = []
    for top, dirs, files in os.walk(folder):
        dirs.sort()
        for name in files:
            full = os.path.join(top, name)
            rel = os.path.relpath(full, folder).replace(os.sep, "/")
            found.append((rel, os.path.getsize(full)))
    return sorted(found)


def listing_page(title: str, folder: str) -> str:
    """Every file under folder, recursively, as a relative link with its size."""
    items = [(quote(rel), rel, human_size(size)) for rel, size in _files(folder)]
    return _page(title, items)


def directory_page(title: str, links: Iterable[Tuple[str, str]]) -> str:
    """One link per (relative folder, label); the links end in '/'."""
    items = [(quote(rel.strip("/")) + "/", label, "") for rel, label in links]
    return _page(title, items)


def _write(path: str, text: str) -> None:
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def add_entry_page(target: str, title: str) -> str:
    """Give an entry folder an index.html; returns where it came from."""
    index = os.path.join(target, "index.html")
    if os.path.isfile(index):
        return "index.html"
    main = os.path.join(target, "main.html")
    if os.path.isfile(main):
        shutil.copyfile(main, index)
        return "main.html"
    pages = [n for n in os.listdir(target) if n.endswith(".html") and os.path.isfile(os.path.join(target, n))]
    if len(pages) == 1:
        shutil.copyfile(os.path.join(target, pages[0]), index)
        return pages[0]
    text = listing_page(title, target)
    _write(index, text)
    return "file listing"


def add_directory_indexes(site_root: str, entries: Sequence[Entry]) -> List[str]:
    """An index of the entries below every folder between the site root and an entry that has none."""
    made = []
    folders = set()
    for entry in entries:
        parts = segments(entry.path)
        for k in range(len(parts)):
            folders.add(tuple(parts[:k]))
    for folder in sorted(folders):
        full = os.path.join(site_root, *folder)
        if os.path.isfile(os.path.join(full, "index.html")):
            continue
        prefix = "/" + "".join(p + "/" for p in folder)
        below = sorted((e for e in entries if e.path != prefix and e.path.startswith(prefix)),
                       key=lambda e: e.path)
        links = [(e.path[len(prefix):], e.title) for e in below]
        title = heading(folder[-1]) if folder else ROOT_HEADING
        _write(os.path.join(full, "index.html"), directory_page(title, links))
        made.append(prefix)
    return made


def copied_pages(placed: Sequence[Tuple[Entry, List[str], List[str], str]]) -> FrozenSet[str]:
    """Site-relative paths of the index.html files that lay_out copied from another page."""
    return frozenset("".join(p + "/" for p in segments(entry.path)) + "index.html"
                     for entry, _, _, page in placed if page not in ("index.html", "file listing"))


def target_of(site_root: str, entry: Entry) -> str:
    return os.path.join(site_root, *segments(entry.path))


def lay_out(site_root: str, entries: Sequence[Entry], source_of: Callable[[Entry], str],
            rules: filters.Rules) -> List[Tuple[Entry, List[str], List[str], str]]:
    """Copy the entries into site_root (parents first), add entry pages and folder indexes.

    Returns (entry, copied, excluded, entry page source) per entry.
    """
    placed = []
    for entry in sorted(entries, key=lambda e: e.path):
        target = target_of(site_root, entry)
        if entry.path != "/":
            probe = site_root
            for part in segments(entry.path):
                probe = os.path.join(probe, part)
                if os.path.lexists(probe) and not os.path.isdir(probe):
                    raise LayoutError(f"{entry.site} {entry.path} collides with a file published above it")
            if os.path.lexists(target):
                raise LayoutError(f"{entry.site} {entry.path} collides with content published above it")
        copied, excluded = filters.copy_tree(source_of(entry), target, rules)
        if not copied:
            raise LayoutError(f"{entry.site} {entry.path} has no files left after the exclude rules")
        placed.append((entry, copied, excluded, add_entry_page(target, entry.title)))
    add_directory_indexes(site_root, entries)
    return placed
