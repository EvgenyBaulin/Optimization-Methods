# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""publish.conf and sites.conf parsers, shared by the Mac (publish.py) and the server.

The Mac file has four fields, `site | path | folder | publish from`; the bundle
copy on the server has five, `site | path | entries/<slug> | publish from | title`.
Runs on Python 3.9.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Iterable, List, Optional
from zoneinfo import ZoneInfo

DEFAULT_TIMEZONE = "Europe/Moscow"
NOW = "now"
TIME_FORMAT = "%Y-%m-%d %H:%M"

SITE_NAME = re.compile(r"[a-z0-9][a-z0-9_-]*\Z")
SEGMENT = re.compile(r"[A-Za-z0-9_-][A-Za-z0-9._-]*\Z")
WHEN = re.compile(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2}\Z")
WEBROOT = re.compile(r"/var/www/[A-Za-z0-9_-][A-Za-z0-9._-]*\Z")
URL = re.compile(r"(https?)://([A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?)(?::([0-9]{1,5}))?/?\Z")
CONTROL = re.compile(r"[\x00-\x1f\x7f]")


class ManifestError(ValueError):
    """Every problem found in a file, one per line, each naming its line."""

    def __init__(self, problems: Iterable[str]):
        self.problems = list(problems)
        super().__init__("\n".join(self.problems))


@dataclass(frozen=True)
class Entry:
    line: int
    site: str
    path: str
    folder: str
    when: str
    title: str = ""

    @property
    def slug(self) -> str:
        return slug(self.path)

    def publish_time(self, timezone: str) -> Optional[datetime]:
        """None for `now`, otherwise an aware datetime in the given zone."""
        return None if self.when == NOW else parse_time(self.when, timezone)

    def released(self, now: datetime, timezone: str) -> bool:
        at = self.publish_time(timezone)
        return at is None or at <= now


@dataclass(frozen=True)
class Site:
    name: str
    webroot: str
    url: str

    @property
    def scheme(self) -> str:
        return self.url.split("://", 1)[0]

    @property
    def host(self) -> str:
        return URL.match(self.url).group(2)

    @property
    def port(self) -> int:
        port = URL.match(self.url).group(3)
        if port:
            return int(port)
        return 443 if self.scheme == "https" else 80


def slug(path: str) -> str:
    """`root` for `/`, otherwise the segments joined with `--`: /seminars/02/ -> seminars--02."""
    segments = [s for s in path.split("/") if s]
    return "--".join(segments) if segments else "root"


def segments(path: str) -> List[str]:
    return [s for s in path.split("/") if s]


def parse_time(when: str, timezone: str) -> datetime:
    """`YYYY-MM-DD HH:MM` in the zone; ValueError for a malformed or impossible time."""
    if not WHEN.match(when):
        raise ValueError(f"publish time must be 'now' or YYYY-MM-DD HH:MM, not '{when}'")
    try:
        naive = datetime.strptime(when, TIME_FORMAT)
    except ValueError:
        raise ValueError(f"no such date or time: '{when}'") from None
    return naive.replace(tzinfo=ZoneInfo(timezone))


def countdown(seconds: float) -> str:
    """'in 2d 5h', 'in 3h 10m' or 'in 7m' for a time that many seconds ahead."""
    minutes = max(1, -(-int(seconds) // 60))
    days, rest = divmod(minutes, 1440)
    hours, minutes = divmod(rest, 60)
    if days:
        return f"in {days}d {hours}h"
    if hours:
        return f"in {hours}h {minutes}m"
    return f"in {minutes}m"


def check_path(path: str) -> Optional[str]:
    if path == "/":
        return None
    if not (path.startswith("/") and path.endswith("/")):
        return f"path must be / or look like /a/b/ with slashes at both ends, not '{path}'"
    for segment in path[1:-1].split("/"):
        if not SEGMENT.match(segment):
            return (f"path segment '{segment}' in '{path}' is not allowed "
                    "(letters, digits, '.', '_', '-'; not starting with '.')")
    return None


def normalize_folder(folder: str) -> str:
    """The folder without trailing slashes; ValueError if it is not a plain relative path."""
    if CONTROL.search(folder):
        raise ValueError("folder contains a control character")
    if folder.startswith("/"):
        raise ValueError(f"folder must be relative to the repository root, not '{folder}'")
    folder = folder.rstrip("/")
    if not folder:
        raise ValueError("folder is empty")
    for part in folder.split("/"):
        if part in ("", ".", ".."):
            raise ValueError(f"folder '{folder}' has an empty, '.' or '..' segment")
    return folder


def _lines(text: str):
    if text.startswith("\ufeff"):
        text = text[1:]
    for number, raw in enumerate(text.splitlines(), 1):
        line = raw.strip()
        if line and not line.startswith("#"):
            yield number, line


def parse_manifest(text: str, *, bundle: bool, known_sites: Optional[Iterable[str]] = None,
                   timezone: str = DEFAULT_TIMEZONE, label: str = "publish.conf") -> List[Entry]:
    """Entries of a publish.conf; ManifestError naming every bad line.

    bundle=False reads the Mac file (four fields), bundle=True the server copy (five).
    """
    known = None if known_sites is None else list(known_sites)
    fields_expected = 5 if bundle else 4
    problems: List[str] = []
    entries: List[Entry] = []
    seen_paths: Dict[tuple, int] = {}
    seen_slugs: Dict[str, Entry] = {}

    for number, line in _lines(text):
        def bad(message: str) -> None:
            problems.append(f"{label} line {number}: {message}")

        fields = [f.strip() for f in line.split("|")]
        if len(fields) != fields_expected:
            bad(f"expected {fields_expected} fields separated by '|', found {len(fields)}")
            continue
        site, path, folder, when = fields[:4]
        title = fields[4] if bundle else ""

        if not SITE_NAME.match(site):
            bad(f"site name '{site}' is not valid (lower-case letters, digits, '_', '-')")
            continue
        if known is not None and site not in known:
            shown = ", ".join(known) if known else "none"
            bad(f"unknown site '{site}' (known sites: {shown})")
            continue
        problem = check_path(path)
        if problem:
            bad(problem)
            continue
        try:
            folder = normalize_folder(folder)
        except ValueError as error:
            bad(str(error))
            continue
        if bundle and folder != f"entries/{slug(path)}":
            bad(f"folder must be entries/{slug(path)}, not '{folder}'")
            continue
        if when != NOW:
            try:
                parse_time(when, timezone)
            except ValueError as error:
                bad(str(error))
                continue
        if bundle and (not title or CONTROL.search(title)):
            bad("title is empty or contains a control character")
            continue

        key = (site, path)
        if key in seen_paths:
            bad(f"path {path} of site {site} is already listed on line {seen_paths[key]}")
            continue
        entry = Entry(number, site, path, folder, when, title)
        other = seen_slugs.get(entry.slug)
        if other is not None:
            bad(f"path {path} has the same bundle folder name '{entry.slug}' as "
                f"{other.site} {other.path} on line {other.line}")
            continue
        seen_paths[key] = number
        seen_slugs[entry.slug] = entry
        entries.append(entry)

    if problems:
        raise ManifestError(problems)
    return entries


def render_bundle_manifest(entries: Iterable[Entry]) -> str:
    """The five-field publish.conf of the bundle."""
    lines = ["# Generated by Deploy/publish.py: site | path | folder | publish from | title"]
    for e in entries:
        lines.append(f"{e.site} | {e.path} | entries/{e.slug} | {e.when} | {e.title}")
    return "\n".join(lines) + "\n"


def parse_sites(text: str, label: str = "sites.conf") -> List[Site]:
    """Sites of a sites.conf: `name webroot url` per line, '#' starts a comment."""
    problems: List[str] = []
    sites: List[Site] = []
    names: Dict[str, int] = {}
    webroots: Dict[str, int] = {}
    if text.startswith("\ufeff"):
        text = text[1:]
    for number, raw in enumerate(text.splitlines(), 1):
        fields = raw.split("#", 1)[0].split()
        if not fields:
            continue

        def bad(message: str) -> None:
            problems.append(f"{label} line {number}: {message}")

        if len(fields) != 3:
            bad(f"expected 'name webroot url', found {len(fields)} fields")
            continue
        name, webroot, url = fields
        if not SITE_NAME.match(name):
            bad(f"site name '{name}' is not valid (lower-case letters, digits, '_', '-')")
        elif not WEBROOT.match(webroot):
            bad(f"web root must be /var/www/<folder>, not '{webroot}'")
        elif not URL.match(url) or not 1 <= int(URL.match(url).group(3) or 443) <= 65535:
            bad(f"URL must be http(s)://host[:port] without a path, not '{url}'")
        elif name in names:
            bad(f"site {name} is already defined on line {names[name]}")
        elif webroot in webroots:
            bad(f"web root {webroot} is already used on line {webroots[webroot]}")
        else:
            names[name] = number
            webroots[webroot] = number
            sites.append(Site(name, webroot, url.rstrip("/")))
    if problems:
        raise ManifestError(problems)
    return sites


def parse_source_info(text: str) -> Dict[str, str]:
    """source.txt of a bundle: `key: value` lines."""
    info: Dict[str, str] = {}
    for line in text.splitlines():
        key, sep, value = line.partition(":")
        if sep:
            info[key.strip()] = value.strip()
    return info
