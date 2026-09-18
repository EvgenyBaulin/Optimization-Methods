# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Link check, symlink and Git LFS pointer detection."""

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

from course_deploy import sitecheck  # noqa: E402

LFS_POINTER = (b"version https://git-lfs.github.com/spec/v1\n"
               b"oid sha256:4d7a214614ab2935c943f9e0ff69d22eadbb8f32b1258daaa5e2ca24d17e2393\n"
               b"size 12345\n")


class SiteTestCase(unittest.TestCase):
    def setUp(self):
        self.root = tempfile.mkdtemp(prefix="sitecheck-test-")
        self.addCleanup(shutil.rmtree, self.root, True)

    def put(self, rel: str, data="x") -> str:
        path = os.path.join(self.root, *rel.split("/"))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(data.encode("utf-8") if isinstance(data, str) else data)
        return path

    def page(self, rel: str, body: str) -> None:
        self.put(rel, f"<!doctype html><html><head><title>t</title></head><body>{body}</body></html>")

    def check(self):
        return sitecheck.check_links(self.root)


class ClassificationTest(SiteTestCase):
    def test_missing_asset_is_an_error(self):
        self.page("index.html", '<script src="app.js"></script>')
        errors, warnings = self.check()
        self.assertEqual(errors, ["ERROR missing file: /index.html -> app.js (no such file)"])
        self.assertEqual(warnings, [])

    def test_broken_anchor_is_a_warning(self):
        self.page("index.html", '<a href="nope.html">x</a>')
        errors, warnings = self.check()
        self.assertEqual(errors, [])
        self.assertEqual(warnings, ["warning broken link: /index.html -> nope.html (no such file)"])

    def test_every_asset_kind(self):
        body = ('<script src="s.js"></script><img src="i.png"><link rel="stylesheet" href="c.css">'
                '<video src="v.mp4"><source src="s.webm"><track src="t.vtt"></video><audio src="a.mp3"></audio>'
                '<iframe src="f.html"></iframe><embed src="e.swf"><object data="o.svg"></object>')
        self.page("index.html", body)
        errors, warnings = self.check()
        refs = sorted(e.split(" -> ")[1].split(" ")[0] for e in errors)
        self.assertEqual(refs, sorted(["s.js", "i.png", "c.css", "v.mp4", "s.webm", "t.vtt", "a.mp3", "f.html",
                                       "e.swf", "o.svg"]))
        self.assertEqual(warnings, [])
        for name in ("s.js", "i.png", "c.css", "v.mp4", "s.webm", "t.vtt", "a.mp3", "f.html", "e.swf", "o.svg"):
            self.put(name)
        self.assertEqual(self.check(), ([], []))

    def test_only_the_asset_attribute_counts(self):
        self.page("index.html", '<img src="i.png" data-src="lazy.png" alt="a.png"><script data="d.js"></script>'
                                '<a name="x" data-href="y.html">x</a><div href="z.html"></div>')
        self.put("i.png")
        self.assertEqual(self.check(), ([], []))

    def test_existing_targets_are_fine(self):
        self.page("index.html", '<script src="js/app.js"></script><a href="about.html">a</a>')
        self.put("js/app.js")
        self.page("about.html", '<a href="index.html">back</a>')
        self.assertEqual(self.check(), ([], []))

    def test_uppercase_tags_and_attributes(self):
        self.page("index.html", '<IMG SRC="Missing.png"><A HREF="nope.html">x</A>')
        errors, warnings = self.check()
        self.assertEqual(len(errors), 1)
        self.assertEqual(len(warnings), 1)

    def test_htm_pages_are_checked_and_other_files_are_not(self):
        self.put("old.htm", '<img src="gone.png">')
        self.put("data.js", '<img src="gone.png">')
        self.put("notes.txt", '<img src="gone.png">')
        errors, _ = self.check()
        self.assertEqual(errors, ["ERROR missing file: /old.htm -> gone.png (no such file)"])


class IgnoredContentTest(SiteTestCase):
    def test_script_contents_ignored(self):
        self.page("index.html", "<script>var s = '<img src=\"nope.png\">' + \"<a href='x.html'>\";"
                                "document.write('<script src=\"z.js\"></scr' + 'ipt>');</script>")
        self.assertEqual(self.check(), ([], []))

    def test_style_and_comments_ignored(self):
        self.page("index.html", '<style>a[href="x.html"] { color: red; }</style>'
                                '<!-- <img src="old.png"> <a href="old.html">old</a> -->')
        self.assertEqual(self.check(), ([], []))

    def test_skipped_values(self):
        refs = ["https://example.org/a.js", "http://example.org/", "mailto:a@b.c", "tel:+123", "javascript:void(0)",
                "data:image/png;base64,AAAA", "//cdn.example.org/x.js", "#top", "#", "", "   ", "HTTPS://X/",
                "blob:abc", "a+b.c-d:x"]
        body = "".join(f'<img src="{r}"><a href="{r}">x</a>' for r in refs)
        self.page("index.html", body)
        self.assertEqual(self.check(), ([], []))

    def test_attribute_without_value_ignored(self):
        self.page("index.html", "<a href>x</a><img src>")
        self.assertEqual(self.check(), ([], []))


class ResolutionTest(SiteTestCase):
    def test_query_and_fragment_ignored(self):
        self.page("index.html", '<link rel="stylesheet" href="style.css?v=2"><a href="page.html#part">x</a>'
                                '<a href="page.html?a=1#b">y</a><script src="app.js?x=1#y"></script>')
        self.put("style.css")
        self.put("app.js")
        self.page("page.html", "")
        self.assertEqual(self.check(), ([], []))

    def test_query_does_not_hide_a_missing_file(self):
        self.page("index.html", '<link rel="stylesheet" href="style.css?v=2">')
        errors, _ = self.check()
        self.assertEqual(errors, ["ERROR missing file: /index.html -> style.css?v=2 (no such file)"])

    def test_percent_encoded_names_with_spaces(self):
        self.page("index.html", '<img src="My%20Figure,%201.svg"><a href="02.%20Convexity/main.html">x</a>'
                                '<a href="%D0%BA%D1%83%D1%80%D1%81.html">y</a>')
        self.put("My Figure, 1.svg")
        self.page("02. Convexity/main.html", "")
        self.page("курс.html", "")
        self.assertEqual(self.check(), ([], []))

    def test_raw_spaces_work_too(self):
        self.page("index.html", '<img src="My Figure.svg">')
        self.put("My Figure.svg")
        self.assertEqual(self.check(), ([], []))

    def test_relative_to_the_page_folder(self):
        self.page("seminars/02/index.html", '<script src="js/a.js"></script><script src="../shared/b.js"></script>'
                                            '<script src="./c.js"></script>')
        self.put("seminars/02/js/a.js")
        self.put("seminars/shared/b.js")
        self.put("seminars/02/c.js")
        self.assertEqual(self.check(), ([], []))

    def test_error_names_the_page_from_the_site_root(self):
        self.page("seminars/02/index.html", '<script src="../shared/missing.js"></script>')
        errors, _ = self.check()
        self.assertEqual(errors, ["ERROR missing file: /seminars/02/index.html -> ../shared/missing.js (no such file)"])

    def test_root_relative(self):
        self.page("a/b/page.html", '<link rel="stylesheet" href="/css/site.css"><a href="/">home</a>'
                                   '<a href="/a/">a</a>')
        self.put("css/site.css")
        self.page("index.html", "")
        self.page("a/index.html", "")
        self.assertEqual(self.check(), ([], []))
        os.unlink(os.path.join(self.root, "css", "site.css"))
        errors, _ = self.check()
        self.assertEqual(errors, ["ERROR missing file: /a/b/page.html -> /css/site.css (no such file)"])

    def test_outside_the_root_is_broken(self):
        self.page("index.html", '<img src="../secret.png"><a href="../../theory/01/Theory_en.pdf">pdf</a>')
        self.page("seminars/02/main.html", '<script src="../../../x.js"></script><a href="../../index.html">ok</a>')
        errors, warnings = self.check()
        self.assertEqual(sorted(errors), [
            "ERROR missing file: /index.html -> ../secret.png (outside the site)",
            "ERROR missing file: /seminars/02/main.html -> ../../../x.js (outside the site)",
        ])
        self.assertEqual(warnings, ["warning broken link: /index.html -> ../../theory/01/Theory_en.pdf "
                                    "(outside the site)"])

    def test_outside_even_when_the_file_exists_next_to_the_root(self):
        parent = os.path.dirname(self.root)
        name = os.path.basename(self.root)
        self.page("index.html", f'<img src="../{name}/x.png">')
        self.put("x.png")
        errors, _ = self.check()
        self.assertEqual(len(errors), 1)
        self.assertIn("(outside the site)", errors[0])
        self.assertTrue(os.path.isdir(parent))

    def test_directory_and_trailing_slash_mean_index_html(self):
        self.page("index.html", '<a href="seminars/02/">a</a><a href="seminars/02">b</a><a href="./">c</a>'
                                '<a href=".">d</a><iframe src="seminars/02/"></iframe>')
        self.page("seminars/02/index.html", "")
        self.assertEqual(self.check(), ([], []))

    def test_folder_without_index(self):
        self.page("index.html", '<a href="empty/">a</a><a href="empty">b</a><iframe src="empty/"></iframe>')
        self.put("empty/data.json")
        errors, warnings = self.check()
        self.assertEqual(errors, ["ERROR missing file: /index.html -> empty/ (folder without index.html)"])
        self.assertEqual(warnings, ["warning broken link: /index.html -> empty/ (folder without index.html)",
                                    "warning broken link: /index.html -> empty (folder without index.html)"])

    def test_no_such_folder(self):
        self.page("index.html", '<a href="missing/">a</a><a href="page.html/">b</a>')
        self.page("page.html", "")
        _, warnings = self.check()
        self.assertEqual(warnings, ["warning broken link: /index.html -> missing/ (no such folder)",
                                    "warning broken link: /index.html -> page.html/ (no such folder)"])

    def test_file_used_as_a_folder(self):
        self.page("index.html", '<img src="page.html/x.png">')
        self.page("page.html", "")
        errors, _ = self.check()
        self.assertEqual(errors, ["ERROR missing file: /index.html -> page.html/x.png (no such file)"])

    def test_case_sensitive_even_on_a_case_insensitive_disk(self):
        self.page("index.html", '<link rel="stylesheet" href="css/style.css"><img src="Img/a.png">'
                                '<a href="About.html">x</a>')
        self.put("css/Style.css")
        self.put("img/a.png")
        self.page("about.html", "")
        errors, warnings = self.check()
        self.assertEqual(errors, ["ERROR missing file: /index.html -> css/style.css (no such file)",
                                  "ERROR missing file: /index.html -> Img/a.png (no such file)"])
        self.assertEqual(warnings, ["warning broken link: /index.html -> About.html (no such file)"])

    def test_case_sensitive_folder_index(self):
        self.page("index.html", '<a href="Sub/">x</a>')
        self.page("sub/index.html", "")
        _, warnings = self.check()
        self.assertEqual(warnings, ["warning broken link: /index.html -> Sub/ (no such folder)"])

    def test_leading_and_trailing_whitespace_in_the_value(self):
        self.page("index.html", '<img src="  a.png \n">')
        self.put("a.png")
        self.assertEqual(self.check(), ([], []))

    def test_every_page_is_checked(self):
        self.page("b.html", '<img src="1.png">')
        self.page("a/index.html", '<img src="2.png">')
        self.page("index.html", '<img src="3.png">')
        errors, _ = self.check()
        self.assertEqual(sorted(e.split(" -> ")[0] for e in errors),
                         ["ERROR missing file: /a/index.html", "ERROR missing file: /b.html",
                          "ERROR missing file: /index.html"])

    def test_undecodable_page_does_not_crash(self):
        self.put("index.html", b'<img src="a.png">\xff\xfe<a href="b.html">')
        errors, warnings = self.check()
        self.assertEqual(len(errors), 1)
        self.assertEqual(len(warnings), 1)


class SymlinkAndLfsTest(SiteTestCase):
    def test_symlinks(self):
        self.put("a.html")
        self.put("dir/b.js")
        os.symlink("a.html", os.path.join(self.root, "link.html"))
        os.symlink("dir", os.path.join(self.root, "dirlink"))
        os.symlink("missing", os.path.join(self.root, "dir", "dangling"))
        self.assertEqual(sorted(sitecheck.symlinks(self.root)), ["dir/dangling", "dirlink", "link.html"])

    def test_no_symlinks(self):
        self.put("a.html")
        self.put("dir/b.js")
        self.assertEqual(sitecheck.symlinks(self.root), [])

    def test_is_lfs_pointer(self):
        pointer = self.put("fig.svg", LFS_POINTER)
        self.assertTrue(sitecheck.is_lfs_pointer(pointer))
        old = self.put("old.bin", b"version https://hawser.github.com/spec/v1\noid sha256:00\nsize 1\n")
        self.assertTrue(sitecheck.is_lfs_pointer(old))
        real = self.put("real.svg", b"<svg xmlns='http://www.w3.org/2000/svg'></svg>")
        self.assertFalse(sitecheck.is_lfs_pointer(real))
        big = self.put("big.txt", LFS_POINTER + b"x" * 2000)
        self.assertFalse(sitecheck.is_lfs_pointer(big))
        empty = self.put("empty.txt", b"")
        self.assertFalse(sitecheck.is_lfs_pointer(empty))
        self.assertFalse(sitecheck.is_lfs_pointer(os.path.join(self.root, "missing")))
        mentions = self.put("doc.txt", b"see version https://git-lfs.github.com/spec/v1\n")
        self.assertFalse(sitecheck.is_lfs_pointer(mentions))

    def test_lfs_pointers(self):
        self.put("figures/a.svg", LFS_POINTER)
        self.put("figures/b.svg", b"<svg/>")
        self.put("c.pdf", LFS_POINTER)
        os.symlink("c.pdf", os.path.join(self.root, "link.pdf"))
        self.assertEqual(sorted(sitecheck.lfs_pointers(self.root)), ["c.pdf", "figures/a.svg"])


if __name__ == "__main__":
    unittest.main()
