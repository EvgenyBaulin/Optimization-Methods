# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Exclude rules: built-in patterns, rsync-style matching, license files, copy_tree, forbidden.txt coverage."""

from __future__ import annotations

import os
import shutil
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, "..", "course-deploy-kit")
if KIT not in sys.path:
    sys.path.insert(0, KIT)

from course_deploy import filters  # noqa: E402
from course_deploy.filters import Rule, Rules  # noqa: E402

DEPLOY = os.path.join(HERE, "..")

SPEC_EXCLUDE = ["*.md", "*.tex", "*.sty", "*.cls", "*.bib", "*.aux", "*.bbl", "*.blg", "*.fdb_latexmk", "*.fls",
                "*.log", "*.nav", "*.out", "*.snm", "*.synctex.gz", "*.toc", "*.vrb", "*.pdf", "*.ipynb",
                "Speech*", "Checks*"]
SPEC_FORBIDDEN = ["*.tex", "*.sty", "*.cls", "*.bib", "*.aux", "*.bbl", "*.blg", "*.fdb_latexmk", "*.fls", "*.log",
                  "*.nav", "*.out", "*.snm", "*.synctex.gz", "*.toc", "*.vrb", "*.ipynb"]


def read(path: str) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()


def shipped_rules() -> Rules:
    return Rules.with_builtin(read(os.path.join(DEPLOY, "exclude.txt")))


def forbidden_patterns():
    return filters.parse_patterns(read(os.path.join(KIT, "forbidden.txt")))


def sample_name(pattern: str) -> str:
    """A concrete file name matched by a basename glob: '*.tex' -> 'x.tex'."""
    return pattern.replace("*", "x").replace("?", "x")


class RuleTest(unittest.TestCase):
    def test_name_pattern_matches_at_any_depth(self):
        rule = Rule("*.md")
        for path in ("README.md", "a/README.md", "a/b/c/notes.md"):
            self.assertTrue(rule.matches(path, False), path)
        self.assertTrue(rule.matches("docs.md", True))
        self.assertFalse(rule.matches("a.mdx", False))
        self.assertFalse(rule.matches("md", False))
        self.assertFalse(rule.matches("a.md/b.txt", False))

    def test_star_stays_within_a_name(self):
        self.assertFalse(Rule("a*b").matches("a/b", False))
        self.assertTrue(Rule("a*b").matches("x/aXYb", False))

    def test_trailing_slash_matches_folders_only(self):
        rule = Rule("build/")
        self.assertTrue(rule.matches("build", True))
        self.assertTrue(rule.matches("a/build", True))
        self.assertFalse(rule.matches("build", False))
        self.assertFalse(rule.matches("a/build", False))
        self.assertTrue(rule.dir_only)

    def test_anchored(self):
        rule = Rule("/x")
        self.assertTrue(rule.matches("x", False))
        self.assertTrue(rule.matches("x", True))
        self.assertFalse(rule.matches("a/x", False))
        self.assertFalse(rule.matches("xx", False))
        rule = Rule("/docs/")
        self.assertTrue(rule.matches("docs", True))
        self.assertFalse(rule.matches("docs", False))
        self.assertFalse(rule.matches("a/docs", True))
        rule = Rule("/a/b.txt")
        self.assertTrue(rule.matches("a/b.txt", False))
        self.assertFalse(rule.matches("c/a/b.txt", False))

    def test_inner_slash_matches_the_end_of_the_path(self):
        rule = Rule("figures/*.pdf")
        self.assertTrue(rule.matches("figures/a.pdf", False))
        self.assertTrue(rule.matches("x/figures/a.pdf", False))
        self.assertFalse(rule.matches("figures/sub/a.pdf", False))
        self.assertFalse(rule.matches("a.pdf", False))
        self.assertFalse(rule.matches("myfigures/a.pdf", False))

    def test_double_star_crosses_folders(self):
        rule = Rule("docs/**")
        self.assertTrue(rule.matches("docs/a", False))
        self.assertTrue(rule.matches("docs/a/b/c.txt", False))
        self.assertTrue(rule.matches("x/docs/a/b", False))
        rule = Rule("/a/**/z.txt")
        self.assertTrue(rule.matches("a/b/z.txt", False))
        self.assertTrue(rule.matches("a/b/c/z.txt", False))
        self.assertFalse(rule.matches("q/a/b/z.txt", False))
        rule = Rule("**/tmp")
        self.assertTrue(rule.matches("a/b/tmp", True))

    def test_question_mark(self):
        rule = Rule("file?.txt")
        self.assertTrue(rule.matches("file1.txt", False))
        self.assertTrue(rule.matches("d/fileA.txt", False))
        self.assertFalse(rule.matches("file10.txt", False))
        self.assertFalse(rule.matches("file.txt", False))
        self.assertFalse(Rule("a?b").matches("a/b", False))

    def test_character_classes(self):
        self.assertTrue(Rule("[ab].js").matches("a.js", False))
        self.assertTrue(Rule("[ab].js").matches("x/b.js", False))
        self.assertFalse(Rule("[ab].js").matches("c.js", False))
        self.assertTrue(Rule("[!ab].js").matches("c.js", False))
        self.assertFalse(Rule("[!ab].js").matches("a.js", False))
        self.assertTrue(Rule("[^ab].js").matches("c.js", False))
        self.assertTrue(Rule("v[0-9].txt").matches("v7.txt", False))
        self.assertFalse(Rule("v[0-9].txt").matches("vx.txt", False))
        self.assertTrue(Rule("[]]x").matches("]x", False))
        self.assertTrue(Rule("a[b").matches("a[b", False))

    def test_regex_characters_are_literal(self):
        self.assertTrue(Rule("a+b(1).txt").matches("a+b(1).txt", False))
        self.assertFalse(Rule("a.txt").matches("abtxt", False))
        self.assertTrue(Rule("x\\*").matches("x*", False))
        self.assertFalse(Rule("x\\*").matches("xy", False))

    def test_case_sensitive(self):
        self.assertFalse(Rule("*.md").matches("README.MD", False))


class RulesTest(unittest.TestCase):
    def test_builtin_patterns(self):
        self.assertEqual(filters.BUILTIN, (".*", "__MACOSX/", "__pycache__/", "*.bak", "*.swp", "*~"))
        rules = Rules.with_builtin("")
        for path in (".DS_Store", "a/.DS_Store", ".git/config", "a/.hidden/x.html", "__MACOSX/a.js",
                     "a/__pycache__/m.pyc", "x.bak", "a/x.swp", "notes.txt~", "a/.htaccess"):
            self.assertFalse(rules.keeps(path), path)
        for path in ("index.html", "a/b.js", "__MACOSX", "a/__pycache__", "x.bak.js", "a~b"):
            self.assertTrue(rules.keeps(path), path)

    def test_parse_patterns(self):
        text = "\ufeff# comment\n\n  *.md  \r\n# another\nbuild/\r\n\t/x\n"
        self.assertEqual(filters.parse_patterns(text), ["*.md", "build/", "/x"])

    def test_keeps_looks_at_every_folder_above(self):
        rules = Rules(["build/", "*.md"])
        self.assertFalse(rules.keeps("build/a.js"))
        self.assertFalse(rules.keeps("x/build/y/a.js"))
        self.assertTrue(rules.keeps("x/build.js"))
        self.assertFalse(rules.keeps("notes.md/a.js"))
        self.assertTrue(rules.keeps("a/b/c.js"))

    def test_license_files_kept(self):
        rules = Rules.with_builtin("*.md\n*.txt\nLICENSE\nCOPYING*\nNOTICE*\n")
        for path in ("LICENSE", "LICENSE.md", "LICENSE.txt", "vendor/katex/LICENSE", "vendor/COPYING.txt",
                     "NOTICE.md", "LICENSE-MIT.txt", "fonts/LICENSE.md"):
            self.assertTrue(rules.keeps(path), path)
        self.assertFalse(rules.keeps("README.md"))
        self.assertFalse(rules.keeps("vendor/VERSIONS.md"))
        self.assertFalse(rules.keeps("notes.txt"))
        self.assertFalse(rules.keeps("license.md"))

    def test_license_files_dropped_with_an_excluded_folder(self):
        rules = Rules.with_builtin("private/\n")
        self.assertFalse(rules.keeps("private/LICENSE"))
        self.assertFalse(rules.keeps("a/private/b/LICENSE.md"))
        self.assertFalse(rules.keeps(".git/LICENSE"))
        self.assertFalse(rules.keeps("__MACOSX/COPYING"))
        self.assertTrue(rules.keeps("public/LICENSE"))

    def test_split(self):
        rules = Rules.with_builtin("*.md\n*.pdf\n")
        kept, dropped = rules.split(["index.html", "README.md", "a/b.pdf", "a/LICENSE.md", ".DS_Store", "js/x.js"])
        self.assertEqual(kept, ["index.html", "a/LICENSE.md", "js/x.js"])
        self.assertEqual(dropped, ["README.md", "a/b.pdf", ".DS_Store"])

    def test_matches_ignores_folders_above(self):
        rules = Rules(["build/"])
        self.assertFalse(rules.matches("build/a.js", False))
        self.assertTrue(rules.matches("build", True))


class ShippedListsTest(unittest.TestCase):
    def test_exclude_txt_has_the_required_patterns(self):
        patterns = filters.parse_patterns(read(os.path.join(DEPLOY, "exclude.txt")))
        for pattern in SPEC_EXCLUDE:
            self.assertIn(pattern, patterns)
        self.assertEqual(len(patterns), len(set(patterns)), "duplicate patterns")

    def test_forbidden_txt_is_the_required_list(self):
        self.assertEqual(sorted(forbidden_patterns()), sorted(SPEC_FORBIDDEN))
        self.assertNotIn("*.pdf", forbidden_patterns())

    def test_every_forbidden_pattern_is_literally_in_exclude_txt(self):
        exclude = filters.parse_patterns(read(os.path.join(DEPLOY, "exclude.txt")))
        missing = [p for p in forbidden_patterns() if p not in exclude]
        self.assertEqual(missing, [])

    def test_every_forbidden_pattern_is_excluded_on_the_mac(self):
        rules = shipped_rules()
        for pattern in forbidden_patterns():
            name = sample_name(pattern)
            with self.subTest(pattern=pattern, name=name):
                self.assertFalse(rules.keeps(name))
                self.assertFalse(rules.keeps("figures/deep/" + name))
                self.assertTrue(filters.Rule(pattern).matches(name, False))

    def test_forbidden_match_ignores_case_like_pre_receive(self):
        # exclude.txt is case-sensitive (rsync style); publish.py refuses what pre-receive would reject
        patterns = forbidden_patterns()
        for pattern in patterns:
            self.assertEqual(filters.forbidden_match(sample_name(pattern).upper(), patterns), pattern)
        self.assertEqual(filters.forbidden_match("main.html", patterns), "")
        self.assertEqual(filters.forbidden_match("fig.PDF", patterns), "")

    def test_shipped_rules_on_a_seminar_layout(self):
        rules = shipped_rules()
        kept, dropped = rules.split([
            "main.html", "theory.html", "css/main.css", "js/content-main.js", "data/seminar02_data.js",
            "figures/a.svg", "figures/a.pdf", "vendor/VERSIONS.md", "vendor/katex/LICENSE",
            "vendor/fonts/OFL.txt", "Theory_en.tex", "Theory_en.log", "checks.ipynb", "Speech notes.txt",
            "Checks/a.html", "README.md", ".DS_Store", "slides.pptx", "Theory_en.xdv",
        ])
        self.assertEqual(kept, ["main.html", "theory.html", "css/main.css", "js/content-main.js",
                                "data/seminar02_data.js", "figures/a.svg", "vendor/katex/LICENSE",
                                "vendor/fonts/OFL.txt"])
        self.assertIn("figures/a.pdf", dropped)


class CopyTreeTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="filters-test-")
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.src = os.path.join(self.tmp, "src")
        self.dst = os.path.join(self.tmp, "dst")

    def put(self, rel: str, data: bytes = b"x") -> None:
        path = os.path.join(self.src, *rel.split("/"))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(data)

    def files(self, root: str):
        out = []
        for top, dirs, names in os.walk(root):
            for name in names:
                out.append(os.path.relpath(os.path.join(top, name), root).replace(os.sep, "/"))
        return sorted(out)

    def test_copies_kept_files_and_reports_excluded(self):
        self.put("index.html", b"<p>hi</p>")
        self.put("a b/c, d.js", b"js")
        self.put("README.md")
        self.put("sub/notes.md")
        self.put("sub/LICENSE.md", b"MIT")
        self.put(".DS_Store")
        self.put("private/a.html")
        self.put("private/LICENSE")
        self.put("__pycache__/m.pyc")
        rules = Rules.with_builtin("*.md\nprivate/\n")
        copied, excluded = filters.copy_tree(self.src, self.dst, rules)
        self.assertEqual(sorted(copied), ["a b/c, d.js", "index.html", "sub/LICENSE.md"])
        self.assertEqual(sorted(excluded), [".DS_Store", "README.md", "__pycache__/", "private/", "sub/notes.md"])
        self.assertEqual(self.files(self.dst), sorted(copied))
        with open(os.path.join(self.dst, "index.html"), "rb") as f:
            self.assertEqual(f.read(), b"<p>hi</p>")
        self.assertFalse(os.path.exists(os.path.join(self.dst, "private")))
        self.assertFalse(os.path.exists(os.path.join(self.dst, "__pycache__")))

    def test_copy_agrees_with_split(self):
        names = ["index.html", "x.md", "d/LICENSE.txt", "d/e/f.pdf", "build/a.js", "g/build/h.js", "k/.x/y"]
        for name in names:
            self.put(name)
        rules = Rules.with_builtin("*.md\n*.pdf\n*.txt\nbuild/\n")
        copied, _ = filters.copy_tree(self.src, self.dst, rules)
        kept, _ = rules.split(names)
        self.assertEqual(sorted(copied), sorted(kept))

    def test_target_may_exist(self):
        self.put("a.html")
        os.makedirs(os.path.join(self.dst, "old"))
        copied, _ = filters.copy_tree(self.src, self.dst, Rules.with_builtin(""))
        self.assertEqual(copied, ["a.html"])
        self.assertTrue(os.path.isdir(os.path.join(self.dst, "old")))

    def test_refuses_file_symlink(self):
        self.put("a.html")
        os.symlink("a.html", os.path.join(self.src, "b.html"))
        with self.assertRaises(filters.UnsafeFileError) as caught:
            filters.copy_tree(self.src, self.dst, Rules.with_builtin(""))
        self.assertIn("b.html", str(caught.exception))

    def test_refuses_folder_symlink(self):
        self.put("real/a.html")
        os.symlink("real", os.path.join(self.src, "link"))
        with self.assertRaises(filters.UnsafeFileError) as caught:
            filters.copy_tree(self.src, self.dst, Rules.with_builtin(""))
        self.assertIn("link", str(caught.exception))

    def test_refuses_dangling_and_outside_symlinks(self):
        self.put("a.html")
        os.symlink("/etc/passwd", os.path.join(self.src, "passwd"))
        with self.assertRaises(filters.UnsafeFileError):
            filters.copy_tree(self.src, self.dst, Rules.with_builtin(""))
        self.assertFalse(os.path.exists(os.path.join(self.dst, "passwd")))
        os.unlink(os.path.join(self.src, "passwd"))
        os.symlink("missing", os.path.join(self.src, "dangling"))
        with self.assertRaises(filters.UnsafeFileError):
            filters.copy_tree(self.src, self.dst, Rules.with_builtin(""))

    def test_refuses_symlink_even_when_its_name_is_excluded(self):
        self.put("a.html")
        os.symlink("a.html", os.path.join(self.src, "notes.md"))
        with self.assertRaises(filters.UnsafeFileError):
            filters.copy_tree(self.src, self.dst, Rules.with_builtin("*.md\n"))

    def test_is_license(self):
        for name in ("LICENSE", "LICENSE.txt", "COPYING", "COPYING.LESSER", "NOTICE", "NOTICE.md"):
            self.assertTrue(filters.is_license(name), name)
        for name in ("license", "README", "MY-LICENSE", "Notice.txt"):
            self.assertFalse(filters.is_license(name), name)


if __name__ == "__main__":
    unittest.main()
