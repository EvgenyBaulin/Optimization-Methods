# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Entry pages, file listings, folder indexes and the site layout shared by the Mac and the server."""

from __future__ import annotations

import os
import re
import shutil
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, "..", "course-deploy-kit")
if KIT not in sys.path:
    sys.path.insert(0, KIT)

from course_deploy import filters, pages, sitecheck  # noqa: E402
from course_deploy.manifest import Entry  # noqa: E402

REPO = os.path.join(HERE, "..", "..")
FOOTER = "Copyright (c) 2026 Evgeny Baulin"
HREF = re.compile(r'href="([^"]*)"')


def case_insensitive(folder: str) -> bool:
    """True when the disk under folder ignores letter case, as a default Mac disk does."""
    probe = tempfile.mkdtemp(prefix="Case-", dir=folder)
    try:
        return os.path.isdir(os.path.join(folder, os.path.basename(probe).swapcase()))
    finally:
        os.rmdir(probe)


CASE_INSENSITIVE_TMP = case_insensitive(tempfile.gettempdir())


class TmpCase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="pages-test-")
        self.addCleanup(shutil.rmtree, self.tmp, True)

    def put(self, rel: str, data="x") -> str:
        path = os.path.join(self.tmp, *rel.split("/"))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(data.encode("utf-8") if isinstance(data, str) else data)
        return path

    def text(self, rel: str) -> str:
        with open(os.path.join(self.tmp, *rel.split("/")), encoding="utf-8") as f:
            return f.read()

    def assertGenerated(self, page: str) -> None:
        self.assertTrue(page.startswith("<!doctype html>"))
        self.assertIn('<html lang="en">', page)
        self.assertIn('<meta charset="utf-8">', page)
        self.assertIn('name="viewport"', page)
        self.assertIn(f"<footer>{FOOTER}</footer>", page)
        self.assertIn("prefers-color-scheme: dark", page)
        self.assertNotIn("<script", page.lower())
        self.assertNotIn("javascript:", page.lower())
        self.assertIsNone(re.search(r"https?://", page), "external URL in a generated page")
        self.assertIsNone(re.search(r"@import|url\(|<link|<img|<iframe", page), "external resource")
        self.assertIsNone(re.search(r"\son[a-z]+\s*=", page), "event handler attribute")


class HelpersTest(unittest.TestCase):
    def test_heading(self):
        self.assertEqual(pages.heading("seminars"), "Seminars")
        self.assertEqual(pages.heading("old-notes"), "Old Notes")
        self.assertEqual(pages.heading("old_notes"), "Old Notes")
        self.assertEqual(pages.heading("02"), "02")
        self.assertEqual(pages.heading("a.b"), "A.b")
        self.assertEqual(pages.heading("x--y"), "X Y")

    def test_human_size(self):
        self.assertEqual(pages.human_size(0), "0 B")
        self.assertEqual(pages.human_size(1023), "1023 B")
        self.assertEqual(pages.human_size(1024), "1.0 KB")
        self.assertEqual(pages.human_size(1536), "1.5 KB")
        self.assertEqual(pages.human_size(1024 * 1024), "1.0 MB")
        self.assertEqual(pages.human_size(5 * 1024 * 1024 + 512 * 1024), "5.5 MB")

    def test_style_is_the_atlas_palette(self):
        css = os.path.join(REPO, "Atlas", "styles.css")
        if not os.path.isfile(css):
            self.skipTest("Atlas/styles.css is not in this checkout")
        with open(css, encoding="utf-8") as f:
            atlas = f.read().lower()
        for colour in re.findall(r"#[0-9a-fA-F]{6}\b", pages.STYLE):
            self.assertIn(colour.lower(), atlas)
        font = re.search(r"--font:\s*([^;]+);", pages.STYLE).group(1).strip().lower()
        self.assertIn(f"--font: {font};", re.sub(r"--font:\s+", "--font: ", atlas))

    def test_footer_is_the_course_authorship_line(self):
        self.assertEqual(pages.FOOTER, FOOTER)


class DirectoryPageTest(TmpCase):
    def test_links_end_in_slash_and_are_encoded(self):
        page = pages.directory_page("Seminars", [("01/", "01. Intro"), ("02", "02. Convexity, Constraints"),
                                                 ("a b/c/", "Spaced")])
        self.assertEqual(HREF.findall(page), ["01/", "02/", "a%20b/c/"])
        self.assertIn(">01. Intro</a>", page)
        self.assertIn(">02. Convexity, Constraints</a>", page)
        self.assertIn("<h1>Seminars</h1>", page)
        self.assertIn("<title>Seminars</title>", page)
        self.assertGenerated(page)

    def test_escaping(self):
        evil = '<script>alert("x")</script> & \'q\''
        page = pages.directory_page(evil, [('x"y/', evil)])
        self.assertNotIn("<script", page)
        self.assertNotIn('alert("x")', page)
        self.assertIn("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#x27;q&#x27;", page)
        self.assertEqual(HREF.findall(page), ["x%22y/"])
        self.assertGenerated(page)

    def test_empty(self):
        self.assertGenerated(pages.directory_page("Seminars", []))


class ListingPageTest(TmpCase):
    def test_every_file_recursively_sorted_with_sizes(self):
        self.put("entry/b.txt", "hello")
        self.put("entry/a b/c, d.pdf", b"x" * 2048)
        self.put("entry/z/deep/e.svg", b"x" * (3 * 1024 * 1024))
        self.put("entry/#1?.txt", "q")
        self.put("entry/курс.txt", "q")
        page = pages.listing_page("02. Convexity", os.path.join(self.tmp, "entry"))
        self.assertEqual(HREF.findall(page), ["%231%3F.txt", "a%20b/c%2C%20d.pdf", "b.txt", "z/deep/e.svg",
                                              "%D0%BA%D1%83%D1%80%D1%81.txt"])
        self.assertIn(">a b/c, d.pdf</a><span class=\"size\">2.0 KB</span>", page)
        self.assertIn(">b.txt</a><span class=\"size\">5 B</span>", page)
        self.assertIn("3.0 MB", page)
        self.assertIn("<h1>02. Convexity</h1>", page)
        self.assertGenerated(page)

    def test_escaping_names(self):
        self.put('entry/<script>alert("x")</script>.txt', "x")
        self.put("entry/it's & more.txt", "x")
        page = pages.listing_page('<b>"Title"</b>', os.path.join(self.tmp, "entry"))
        self.assertNotIn("<script", page)
        self.assertNotIn("<b>", page)
        self.assertIn("&lt;b&gt;&quot;Title&quot;&lt;/b&gt;", page)
        self.assertIn("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;.txt", page)
        self.assertIn("it&#x27;s &amp; more.txt", page)
        for href in HREF.findall(page):
            self.assertIsNone(re.search(r"[<>\"' &]", href), href)
        self.assertGenerated(page)

    def test_links_resolve(self):
        self.put("entry/a b/c.pdf")
        self.put("entry/x.svg")
        target = os.path.join(self.tmp, "entry")
        pages.add_entry_page(target, "Entry")
        self.assertEqual(sitecheck.check_links(target), ([], []))


class EntryPageTest(TmpCase):
    def target(self) -> str:
        return os.path.join(self.tmp, "entry")

    def test_index_html_kept(self):
        self.put("entry/index.html", "INDEX")
        self.put("entry/main.html", "MAIN")
        self.assertEqual(pages.add_entry_page(self.target(), "T"), "index.html")
        self.assertEqual(self.text("entry/index.html"), "INDEX")

    def test_main_html_copied(self):
        self.put("entry/main.html", "MAIN")
        self.put("entry/theory.html", "THEORY")
        self.put("entry/cheatsheet.html", "CHEAT")
        self.assertEqual(pages.add_entry_page(self.target(), "T"), "main.html")
        self.assertEqual(self.text("entry/index.html"), "MAIN")
        self.assertEqual(self.text("entry/main.html"), "MAIN")

    def test_single_top_level_page_copied(self):
        self.put("entry/theory.html", "THEORY")
        self.put("entry/sub/other.html", "OTHER")
        self.put("entry/data.js", "js")
        self.assertEqual(pages.add_entry_page(self.target(), "T"), "theory.html")
        self.assertEqual(self.text("entry/index.html"), "THEORY")

    def test_two_top_level_pages_give_a_listing(self):
        self.put("entry/a.html", "A")
        self.put("entry/b.html", "B")
        self.assertEqual(pages.add_entry_page(self.target(), "Two pages"), "file listing")
        page = self.text("entry/index.html")
        self.assertEqual(HREF.findall(page), ["a.html", "b.html"])
        self.assertIn("<h1>Two pages</h1>", page)

    def test_no_page_gives_a_listing(self):
        self.put("entry/Handout, part 1.svg", b"<svg/>")
        self.put("entry/data/values.json", "{}")
        self.put("entry/sub/page.html", "nested")
        self.assertEqual(pages.add_entry_page(self.target(), "03. Seminar"), "file listing")
        page = self.text("entry/index.html")
        self.assertEqual(HREF.findall(page), ["Handout%2C%20part%201.svg", "data/values.json", "sub/page.html"])
        self.assertNotIn("index.html", HREF.findall(page))
        self.assertGenerated(page)


class LayOutTest(TmpCase):
    def setUp(self):
        super().setUp()
        self.site = os.path.join(self.tmp, "site")
        os.makedirs(self.site)
        self.rules = filters.Rules.with_builtin("*.md\n*.pdf\n*.tex\n")
        self.sources = {}

    def entry(self, path: str, title: str, files, line: int = 1) -> Entry:
        e = Entry(line, "course", path, f"entries/{path.strip('/').replace('/', '--') or 'root'}", "now", title)
        src = os.path.join(self.tmp, "src", e.slug)
        os.makedirs(src, exist_ok=True)
        for rel, data in files.items():
            self.put(f"src/{e.slug}/{rel}", data)
        self.sources[e.path] = src
        return e

    def lay_out(self, entries):
        return pages.lay_out(self.site, entries, lambda e: self.sources[e.path], self.rules)

    def site_text(self, rel: str) -> str:
        with open(os.path.join(self.site, *rel.split("/")), encoding="utf-8") as f:
            return f.read()

    def site_files(self):
        out = []
        for top, dirs, names in os.walk(self.site):
            for name in names:
                out.append(os.path.relpath(os.path.join(top, name), self.site).replace(os.sep, "/"))
        return sorted(out)

    def standard_entries(self):
        return [
            self.entry("/seminars/02/", "02. Convexity, Constraints and Optimality Conditions",
                       {"main.html": '<script src="../shared/js/app.js"></script>', "theory.html": "t",
                        "notes.md": "n", "figures/a.pdf": "p", "figures/a.svg": "<svg/>"}),
            self.entry("/", "Atlas", {"index.html": "ATLAS", "js/ui.js": "js", "README.md": "r"}),
            self.entry("/seminars/shared/", "shared", {"js/app.js": "js", "vendor/LICENSE": "MIT"}),
            self.entry("/seminars/01/", "01. Optimization", {"handout.svg": "<svg/>", "Theory_en.tex": "t"}),
        ]

    def test_parents_first_and_entry_pages(self):
        placed = self.lay_out(self.standard_entries())
        self.assertEqual([e.path for e, _, _, _ in placed], ["/", "/seminars/01/", "/seminars/02/",
                                                              "/seminars/shared/"])
        pages_of = {e.path: page for e, _, _, page in placed}
        self.assertEqual(pages_of, {"/": "index.html", "/seminars/01/": "file listing",
                                    "/seminars/02/": "main.html", "/seminars/shared/": "file listing"})
        excluded = {e.path: sorted(x) for e, _, x, _ in placed}
        self.assertEqual(excluded["/"], ["README.md"])
        self.assertEqual(excluded["/seminars/02/"], ["figures/a.pdf", "notes.md"])
        self.assertEqual(excluded["/seminars/01/"], ["Theory_en.tex"])
        self.assertEqual(self.site_files(), [
            "index.html", "js/ui.js",
            "seminars/01/handout.svg", "seminars/01/index.html",
            "seminars/02/figures/a.svg", "seminars/02/index.html", "seminars/02/main.html",
            "seminars/02/theory.html",
            "seminars/index.html",
            "seminars/shared/index.html", "seminars/shared/js/app.js", "seminars/shared/vendor/LICENSE",
        ])
        self.assertEqual(self.site_text("index.html"), "ATLAS")
        self.assertEqual(sitecheck.check_links(self.site)[0], [])

    def test_generated_folder_index(self):
        self.lay_out(self.standard_entries())
        page = self.site_text("seminars/index.html")
        self.assertEqual(HREF.findall(page), ["01/", "02/", "shared/"])
        self.assertIn(">02. Convexity, Constraints and Optimality Conditions</a>", page)
        self.assertIn(">01. Optimization</a>", page)
        self.assertIn("<h1>Seminars</h1>", page)
        self.assertGenerated(page)
        errors, warnings = sitecheck.check_links(self.site)
        self.assertEqual((errors, warnings), ([], []))

    def test_only_the_given_entries_are_listed(self):
        entries = self.standard_entries()
        released = [e for e in entries if e.path != "/seminars/02/"]
        self.lay_out(released)
        page = self.site_text("seminars/index.html")
        self.assertEqual(HREF.findall(page), ["01/", "shared/"])
        self.assertFalse(os.path.exists(os.path.join(self.site, "seminars", "02")))

    def test_root_index_without_a_root_entry(self):
        e = self.entry("/seminars/02/", "02", {"main.html": "M"})
        self.lay_out([e])
        root = self.site_text("index.html")
        self.assertEqual(HREF.findall(root), ["seminars/02/"])
        self.assertGenerated(root)
        self.assertEqual(HREF.findall(self.site_text("seminars/index.html")), ["02/"])

    def test_existing_folder_index_is_kept(self):
        root = self.entry("/", "Atlas", {"index.html": "A", "seminars/index.html": "OWN"})
        child = self.entry("/seminars/02/", "02", {"main.html": "M"})
        self.lay_out([root, child])
        self.assertEqual(self.site_text("seminars/index.html"), "OWN")

    def test_deeper_folders(self):
        e = self.entry("/courses/2026/seminars/02/", "02", {"main.html": "M"})
        self.lay_out([e])
        self.assertEqual(HREF.findall(self.site_text("courses/index.html")), ["2026/seminars/02/"])
        self.assertIn("<h1>Courses</h1>", self.site_text("courses/index.html"))
        self.assertEqual(HREF.findall(self.site_text("courses/2026/seminars/index.html")), ["02/"])

    def test_child_collides_with_parent_content(self):
        root = self.entry("/", "Atlas", {"index.html": "A", "seminars/02/old.html": "old"})
        child = self.entry("/seminars/02/", "02", {"main.html": "M"})
        with self.assertRaises(pages.LayoutError) as caught:
            self.lay_out([child, root])
        self.assertIn("/seminars/02/", str(caught.exception))

    def test_child_collides_with_a_parent_file(self):
        root = self.entry("/", "Atlas", {"index.html": "A", "seminars": "a file"})
        child = self.entry("/seminars/02/", "02", {"main.html": "M"})
        with self.assertRaises(pages.LayoutError):
            self.lay_out([root, child])

    def test_child_inside_a_parent_folder_is_fine(self):
        root = self.entry("/", "Atlas", {"index.html": "A", "seminars/other.html": "o"})
        child = self.entry("/seminars/02/", "02", {"main.html": "M"})
        self.lay_out([root, child])
        self.assertIn("seminars/other.html", self.site_files())
        self.assertEqual(HREF.findall(self.site_text("seminars/index.html")), ["02/"])

    def test_nested_entries(self):
        parent = self.entry("/seminars/02/", "02", {"main.html": "M"})
        child = self.entry("/seminars/02/extra/", "Extra", {"a.svg": "<svg/>"})
        self.lay_out([child, parent])
        self.assertEqual(self.site_text("seminars/02/index.html"), "M")
        self.assertIn("seminars/02/extra/index.html", self.site_files())

    def test_parent_collision_via_excluded_files_only(self):
        root = self.entry("/", "Atlas", {"index.html": "A", "seminars/02/notes.md": "n"})
        child = self.entry("/seminars/02/", "02", {"main.html": "M"})
        self.lay_out([root, child])
        self.assertEqual(self.site_text("seminars/02/index.html"), "M")

    def test_entry_without_files_left(self):
        e = self.entry("/seminars/02/", "02", {"notes.md": "n", "a.pdf": "p", ".DS_Store": "x"})
        with self.assertRaises(pages.LayoutError) as caught:
            self.lay_out([e])
        self.assertIn("/seminars/02/", str(caught.exception))
        self.assertIn("no files", str(caught.exception))

    def test_empty_entry(self):
        e = self.entry("/seminars/02/", "02", {})
        with self.assertRaises(pages.LayoutError):
            self.lay_out([e])

    def test_symlink_in_an_entry(self):
        e = self.entry("/", "Atlas", {"index.html": "A"})
        os.symlink("index.html", os.path.join(self.sources["/"], "link.html"))
        with self.assertRaises(filters.UnsafeFileError):
            self.lay_out([e])

    @unittest.skipIf(CASE_INSENSITIVE_TMP, "a case-insensitive disk cannot hold both names, so the Mac refuses the layout")
    def test_names_differing_only_in_case_are_different_folders(self):
        # nginx on the server tells Seminars/ from seminars/; the Mac lay-out must not merge them
        root = self.entry("/", "Atlas", {"index.html": "A", "Seminars/02/page.html": "P"})
        child = self.entry("/seminars/02/", "02", {"main.html": "M"})
        self.lay_out([root, child])
        self.assertEqual(self.site_text("seminars/02/index.html"), "M")



if __name__ == "__main__":
    unittest.main()
