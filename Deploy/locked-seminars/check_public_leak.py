# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Fails when anything from the locked layers of a seminar is readable outside locked.enc.js.

The locked text is every string of content/students.json and content/teacher.json in the theory folder of the
seminar, theory/NN. <title> (data and content): whole strings of 12 or more characters, sentence and clause
pieces of 24 or more characters with the markup and the {{tokens}} split out, and the display strings of the
data. The locked numbers are the answer values and the long numbers of the data that content/public.json does not
also contain, in the forms they would be typed or printed. The public text is every string of public.json and of
the content files web/NN/js/content-*.js and web/shared/js/content-*.js. The locked figures are the SVG files of
figures/ in the theory folder that no "figure": {"src": name} object of the public content names.

Searched: every file under web/NN except js/locked.enc.js (text, comments, the content and data files, CSS and
file names, for text and numbers); web/shared, web/index.html and web/upcoming (text); the lines added in the git
history of Seminars/Evgeny Baulin (text, and numbers in web/NN) and every commit message (text). Also fails when
content/students.json, content/teacher.json, the figures folder or a .tex or .pdf file of the theory folder, the
checks notebook, the release folder of Deploy/locked-seminars or any release.json has ever been committed or is
tracked now. A number matches only where it is not part of a longer number, word, hex colour or base64 run, and
the display strings of the data, which are numbers written in TeX, are looked for only in the files of the
seminar. Text that also stands in the public text as a formula, or as a whole string or label of at most 48
characters, and text found only in the history of another seminar's files, is reported as a note, not as a leak.

    python3 Deploy/locked-seminars/check_public_leak.py 3            # from any folder
    python3 Deploy/locked-seminars/check_public_leak.py 3 --no-git   # a copy outside git
"""

import argparse
import hashlib
import html
import json
import os
import re
import subprocess
import sys
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path, PurePosixPath

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))

import build_lock  # noqa: E402

WHOLE_MIN = 12
PIECE_MIN = 24
LABEL_MAX = 48
ANCHOR = WHOLE_MIN
SKIP_WEB = {"js/locked.enc.js"}

IDENTIFIER = re.compile(r"[\w.\-/]+")
NUMERIC = re.compile(r"[+-]?\d+(?:\.\d+)?")
TOKEN = re.compile(r"\{\{[^{}]*\}\}")
MARKUP = re.compile(r"(\$\$.+?\$\$|\$[^$]+?\$|`[^`]*`)", re.S)
CLAUSES = re.compile(r"(?<=[.;:!?])\s+|,\s+|\s+[\u2013\u2014-]\s+")
EDGE = " \t.,;:!?\u2013\u2014-"
# masked before the numbers are searched: base64 and other long runs, CSS colours, SVG geometry
MASKS = (
    re.compile(r"[A-Za-z0-9+/]{16,}={0,2}"),
    re.compile(r"(?:rgba?|hsla?)\([^)]*\)", re.I),
    re.compile(r"\b(?:d|points|viewBox|transform)\s*=\s*\"[^\"]*\""),
)
# comment markers at the start of a line, removed in a second view so that a sentence wrapped over comment
# lines is still found
COMMENT_LEAD = re.compile(r"(?m)^[ \t]*(?://+|#+|\*+|<!--|-->|%+)[ \t]?")


def collapse(text):
    return " ".join(text.split())


def load(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def load_marked(path):
    """The strict JSON between the markers of a content file."""
    match = build_lock.MARKERS.search(path.read_text(encoding="utf-8"))
    if not match:
        raise ValueError("%s has no JSON between the markers" % path)
    return json.loads(match.group(1))


def leaves(node, path=""):
    if isinstance(node, dict):
        for key, value in node.items():
            yield from leaves(value, "%s.%s" % (path, key) if path else str(key))
    elif isinstance(node, list):
        for i, value in enumerate(node):
            yield from leaves(value, "%s[%d]" % (path, i))
    else:
        yield path, node


def is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


# ---------------------------------------------------------------------------------------------- what is locked


class Locked:
    def __init__(self):
        self.text = {}  # fragment -> origin; 12 characters or more, searched everywhere
        self.short = {}  # display strings under 12 characters, searched in web/NN only
        self.display = set()  # the long display strings among self.text, searched in the seminar's files only
        self.numbers = {}  # value -> (origin, display forms)
        self.notes = []
        self.public_values = set()  # numbers of public.json: a rounded form equal to one of them says nothing

    def add(self, table, fragment, origin):
        if fragment and fragment not in table:
            table[fragment] = origin

    def add_number(self, value, origin, display=None):
        entry = self.numbers.setdefault(value, (origin, set()))
        if display:
            entry[1].add(display)


def pieces(text):
    """(kind, piece) for the prose runs, their sentences and clauses, and the formulas of a string."""
    out = []
    for i, part in enumerate(MARKUP.split(text)):
        if i % 2:  # $...$, $$...$$ or `...`
            inner = part.strip("$`")
            kind = "code" if part.startswith("`") else "math"
            for bit in TOKEN.split(inner):
                out.append((kind, collapse(bit)))
            continue
        for run in re.split(r"\*\*|\*", TOKEN.sub("\x00", part)):
            for bit in run.split("\x00"):
                bit = collapse(bit).strip(EDGE)
                out.append(("prose", bit))
                out.extend(("prose", c.strip(EDGE)) for c in CLAUSES.split(bit))
    return [(k, p) for k, p in out if len(p) >= PIECE_MIN]


def public_numbers(public):
    values = set()
    for _, value in leaves(public.get("data", {})):
        if is_number(value):
            values.add(float(value))
        elif isinstance(value, str):
            values.update(float(m) for m in NUMERIC.findall(value))
    return values


def in_public(value, public_values):
    return any(abs(abs(value) - abs(p)) <= 1e-12 * max(1.0, abs(value)) for p in public_values)


def significant(value):
    """Significant digits of a number, or of a display string as it is written ("0.7170" has four)."""
    text = value if isinstance(value, str) else repr(abs(value)) if isinstance(value, float) else str(abs(value))
    mantissa = text.lower().lstrip("+-").split("e")[0]
    integer = "." not in mantissa or float(value).is_integer() and not isinstance(value, str)
    mantissa = mantissa.replace(".", "").lstrip("0")
    return len(mantissa.rstrip("0") if integer else mantissa)


def figure_names(node):
    """The names in the "figure": {"src": name} objects of a content tree."""
    names = set()
    if isinstance(node, dict):
        figure = node.get("figure")
        if isinstance(figure, dict) and isinstance(figure.get("src"), str):
            names.add(PurePosixPath(figure["src"]).name.removesuffix(".svg"))
        for value in node.values():
            names |= figure_names(value)
    elif isinstance(node, list):
        for value in node:
            names |= figure_names(value)
    return names


def collect(sem):
    content = sem.content
    public = load(content / "public.json")
    public_strings = [collapse(v) for _, v in leaves(public) if isinstance(v, str)]
    public_figures = figure_names(public)
    content_files = sorted((sem.web / "js").glob("content-*.js"))
    content_files += sorted((sem.web.parent / "shared" / "js").glob("content-*.js"))
    for path in content_files:
        tree = load_marked(path)
        public_strings += [collapse(v) for _, v in leaves(tree) if isinstance(v, str)]
        public_figures |= figure_names(tree)
    public_set = set(public_strings)
    public_blob = "\n".join(public_strings)
    public_values = public_numbers(public)
    locked = Locked()
    locked.public_values = public_values
    shared = {}

    for name in ("students.json", "teacher.json"):
        source = load(content / name)
        for part in ("data", "content"):
            for path, value in leaves(source.get(part, {})):
                origin = "%s %s.%s" % (name, part, path)
                if is_number(value):
                    answer = part == "data" and path.startswith("answers.") and (
                        path.endswith(".value") or ".value[" in path)
                    if path.endswith(".tol"):
                        continue
                    if answer:
                        if float(value).is_integer() and abs(value) < 100:
                            continue
                    elif significant(value) < 4:
                        continue
                    if not in_public(float(value), public_values):
                        locked.add_number(abs(float(value)), origin)
                    continue
                if not isinstance(value, str):
                    continue
                text = collapse(value)
                if part == "data" and NUMERIC.fullmatch(text):
                    if significant(text) >= 4 and not in_public(float(text), public_values):
                        locked.add_number(abs(float(text)), origin, text.lstrip("+-"))
                    continue
                candidates = []
                if len(text) >= WHOLE_MIN and not IDENTIFIER.fullmatch(text):
                    candidates.append(("string", text))
                    if part == "data":
                        locked.display.add(text)
                elif part == "data" and re.search(r"\d", text) and text not in public_set:
                    locked.add(locked.short, text, origin)
                candidates.extend(pieces(value))
                for kind, frag in candidates:
                    if frag in public_blob:
                        benign = kind == "math" or (len(frag) <= LABEL_MAX and (kind == "string" or frag in public_set))
                        if benign:
                            shared.setdefault(frag, origin)
                            continue
                    locked.add(locked.text, frag, origin)
    for frag, origin in shared.items():
        if frag not in locked.text:
            locked.notes.append((frag, origin))
    figures = {}
    folder = sem.figures
    if folder.is_dir():
        for path in sorted(folder.glob("*.svg")):
            if path.stem not in public_figures:
                figures[path.stem] = hashlib.sha256(path.read_bytes()).hexdigest()
    return locked, figures


# ---------------------------------------------------------------------------------------------- matching


def variants(fragment):
    forms = {
        fragment,
        json.dumps(fragment, ensure_ascii=False)[1:-1],
        json.dumps(fragment)[1:-1],
        html.escape(fragment, quote=False),
        html.escape(fragment, quote=True),
        fragment.replace("\\", "\\\\").replace("'", "\\'"),
    }
    return {collapse(f) for f in forms if f}


def number_forms(value):
    a = abs(value)
    forms = set()
    if a.is_integer() and a < 1e15:
        forms.update({str(int(a)), repr(a), "%.6f" % a})
    else:
        forms.add(repr(a))
        forms.add(format(Decimal(repr(a)), "f"))
        forms.add("%.4g" % a)
        if a >= 1e-3:
            forms.add("%.6f" % a)
        # the fixed forms with trailing zeros cut, as the page prints numbers (JS toFixed rounds ties up)
        for d in range(3, 7):
            for q in ("%.*f" % (d, a), format(Decimal(repr(a)).quantize(Decimal(1).scaleb(-d), ROUND_HALF_UP), "f")):
                q = q.rstrip("0").rstrip(".")
                if significant(q) >= 3:
                    forms.add(q)
    out = set()
    for f in forms:
        for g in (f, re.sub(r"e([+-])0*(\d)", r"e\1\2", f)):
            try:
                v = float(g)
            except ValueError:
                continue
            if v.is_integer() and v < 100:
                continue
            out.add(g)
    return out


class Matcher:
    def __init__(self, locked):
        self.fragments = list(locked.text)
        self.display = {i for i, f in enumerate(self.fragments) if f in locked.display}
        self.origins = [locked.text[f] for f in self.fragments]
        self.index = {}
        for fid, frag in enumerate(self.fragments):
            for form in variants(frag):
                self.index.setdefault(form[:ANCHOR], []).append((form, fid))
        self.short = [(f, locked.short[f], variants(f)) for f in locked.short]
        self.numbers = []
        for value, (origin, display) in locked.numbers.items():
            forms = {f for f in number_forms(value) if not in_public(float(f), locked.public_values)} | display
            pattern = "|".join(re.escape(f) for f in sorted(forms, key=len, reverse=True))
            if pattern:
                rx = re.compile(r"(?<![0-9A-Za-z_.#])(?:%s)(?![0-9A-Za-z_])(?!\.[0-9])" % pattern)
                self.numbers.append((value, origin, rx))

    def text(self, *texts, prose_only=False):
        """(fragment, origin) of every long fragment in any of the texts; prose_only leaves out the display strings."""
        hits = set()
        get = self.index.get
        for text in texts:
            startswith = text.startswith
            for i in range(len(text) - ANCHOR + 1):
                found = get(text[i:i + ANCHOR])
                if found:
                    for form, fid in found:
                        if startswith(form, i):
                            hits.add(fid)
        if prose_only:
            hits -= self.display
        return [(self.fragments[f], self.origins[f]) for f in sorted(hits)]

    def short_text(self, *texts):
        return [(f, origin) for f, origin, forms in self.short if any(form in t for form in forms for t in texts)]

    def number_text(self, text):
        for rx in MASKS:
            text = rx.sub(" ", text)
        return [(m.group(0), origin) for value, origin, rx in self.numbers for m in [rx.search(text)] if m]


def views(raw):
    """The text with whitespace collapsed, and a second view without the comment markers that open lines."""
    plain = collapse(raw)
    bare = collapse(COMMENT_LEAD.sub(" ", raw))
    return [plain] if bare == plain else [plain, bare]


def read_text(path):
    try:
        return path.read_bytes().decode("utf-8")
    except UnicodeDecodeError:
        return None


# ---------------------------------------------------------------------------------------------- git


def git(root, *args):
    cmd = ["git", "-C", str(root), "-c", "core.quotepath=off"] + list(args)
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode:
        raise RuntimeError("%s: %s" % (" ".join(args[:2]), result.stderr.decode("utf-8", "replace").strip()))
    return result.stdout.decode("utf-8", "replace")


def git_chunks(root, pathspec):
    """(commit, path, views of the added text) for every file of every commit touching the pathspec, then
    (commit, None, text) for every commit message."""
    log = git(root, "log", "--all", "-p", "--no-color", "--no-ext-diff", "--no-textconv", "--format=%x00%h",
              "--", pathspec)
    chunks = {}
    commit, current = "?", None
    for line in log.split("\n"):
        if line.startswith("\x00"):
            commit, current = line[1:], None
        elif line.startswith("+++ "):
            name = line[4:].rstrip("\t")  # git ends a name that has spaces with a tab
            current = (commit, name[2:] if name.startswith("b/") else name)
        elif line.startswith("+") and current is not None:
            chunks.setdefault(current, []).append(line[1:])
        elif line.startswith("diff --git "):
            current = None
    out = [(commit, path, views("\n".join(lines))) for (commit, path), lines in chunks.items()]
    messages = git(root, "log", "--all", "--format=%x00%h%n%B")
    for block in messages.split("\x00")[1:]:
        head, _, body = block.partition("\n")
        out.append((head, None, [collapse(body)]))
    return out


def own_path(path, own, number):
    """A path of the seminar: web/NN, its theory folder, its notebook, or any folder or file named "NN. ..." or
    "N. ..."."""
    if path in own or path.startswith(tuple(p + "/" for p in own)):
        return True
    return any(re.match(r"0?%d(?:\.|\b)" % number, part) for part in path.split("/")[2:])


def forbidden_paths(root, theory_rel, notebook_rel):
    """Paths of the locked sources that have been committed at some point or are tracked now."""
    committed = set(git(root, "log", "--all", "--name-only", "--format=", "-m").split("\n"))
    tracked = set(git(root, "ls-files").split("\n"))
    releases = build_lock.RELEASES.relative_to(build_lock.ROOT).as_posix() + "/"
    exact = {theory_rel + "/content/students.json", theory_rel + "/content/teacher.json", notebook_rel}
    hits = []
    for where, paths in (("committed", committed), ("tracked", tracked)):
        for p in sorted(x for x in paths if x):
            if (p in exact or p.startswith((theory_rel + "/figures/", releases))
                    or p.startswith(theory_rel + "/") and p.lower().endswith((".tex", ".pdf"))
                    or p.split("/")[-1] == "release.json"):
                hits.append((where, p))
    return hits


# ---------------------------------------------------------------------------------------------- main


def files_under(folder):
    if folder.is_file():
        return [folder]
    if not folder.is_dir():
        return []
    return sorted(p for p in folder.rglob("*") if p.is_file() and p.name != ".DS_Store")


def shorten(text, n=140):
    return text if len(text) <= n else text[: n - 3] + "..."


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    build_lock.add_seminar_arguments(parser)
    parser.add_argument("--no-git", action="store_true", help="skip the git history (for a copy outside git)")
    args = parser.parse_args(argv)

    try:
        sem = build_lock.Seminar(args.seminar, args.theory, args.web)
        locked, figures = collect(sem)
    except (build_lock.BuildError, OSError, ValueError) as err:
        print("check_public_leak: cannot read the content: %s" % err, file=sys.stderr)
        return 2
    web_nn, web = sem.web, sem.web.parent
    matcher = Matcher(locked)
    leaks = []
    elsewhere = []
    scanned = 0

    for path in files_under(web_nn):
        rel = path.relative_to(web_nn).as_posix()
        if rel in SKIP_WEB:
            continue
        scanned += 1
        where = "web/%s/%s" % (sem.nn, rel)
        name = collapse(rel)
        found = matcher.text(name) + matcher.short_text(name) + matcher.number_text(name)
        found += [(path.name, "figures/%s.svg" % path.stem)] if path.stem in figures else []
        data = path.read_bytes()
        if hashlib.sha256(data).hexdigest() in figures.values():
            found.append(("the bytes of a locked figure", "figures"))
        raw = read_text(path)
        if raw is not None:
            texts = views(raw)
            found += matcher.text(*texts) + matcher.short_text(*texts) + matcher.number_text(texts[0])
        leaks += [(where, frag, origin) for frag, origin in found]

    for folder in (web / "shared", web / "index.html", web / "upcoming"):
        for path in files_under(folder):
            scanned += 1
            raw = read_text(path)
            where = path.relative_to(web).as_posix()
            found = matcher.text(collapse(where), prose_only=True)
            if raw is not None:
                found += matcher.text(*views(raw), prose_only=True)
            leaks += [("web/" + where, frag, origin) for frag, origin in found]

    history = "the git history"
    if args.no_git:
        history = "no git history (skipped)"
    else:
        try:
            root = Path(git(sem.theory, "rev-parse", "--show-toplevel").strip())

            def relative(path):
                return os.path.relpath(str(path), str(root)).replace(os.sep, "/")

            pathspec = relative(sem.author)
            theory_rel, notebook_rel = relative(sem.theory), relative(sem.notebook)
            own_web, web_rel = relative(web_nn), relative(web)
            own = (own_web, theory_rel, notebook_rel)
            for commit, path, texts in git_chunks(root, pathspec):
                if path is None:
                    leaks += [("git %s commit message" % commit, frag, origin)
                              for frag, origin in matcher.text(*texts, prose_only=True)]
                elif own_path(path, own, sem.n):
                    found = matcher.text(*texts)
                    if path.startswith(own_web + "/") and path[len(own_web) + 1:] not in SKIP_WEB:
                        found += matcher.short_text(*texts) + matcher.number_text(texts[0])
                    leaks += [("git %s %s" % (commit, path), frag, origin) for frag, origin in found]
                elif path.startswith((web_rel + "/shared/", web_rel + "/upcoming/")) or path == web_rel + "/index.html":
                    # the page loads these, so their history is as public as its own
                    leaks += [("git %s %s" % (commit, path), frag, origin)
                              for frag, origin in matcher.text(*texts, prose_only=True)]
                else:
                    elsewhere += [("git %s %s" % (commit, path), frag, origin)
                                  for frag, origin in matcher.text(*texts, prose_only=True)]
            for how, p in forbidden_paths(root, theory_rel, notebook_rel):
                leaks.append(("git (%s)" % how, p, "a locked source must never be committed"))
        except (OSError, RuntimeError) as err:
            print("check_public_leak: git failed (%s); run with --no-git outside a repository" % err,
                  file=sys.stderr)
            return 2

    for frag, origin in locked.notes:
        print("note: also in the public text, not counted: %r (%s)" % (shorten(frag), origin))
    for where, frag, origin in elsewhere:
        print("note: in another seminar's history, not counted: %s: %r (%s)" % (where, shorten(frag), origin))
    n_text = len(locked.text) + len(locked.short)
    if leaks:
        for where, frag, origin in leaks:
            print("LEAK %s: %r (%s)" % (where, shorten(frag), origin))
        print("%d leak(s): %d fragments and %d numbers checked in %d files and %s"
              % (len(leaks), n_text, len(locked.numbers), scanned, history))
        return 1
    print("no leaks: %d fragments and %d numbers checked in %d files and %s"
          % (n_text, len(locked.numbers), scanned, history))
    return 0


if __name__ == "__main__":
    sys.exit(main())
