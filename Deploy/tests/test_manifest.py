# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""publish.conf (Mac and bundle formats), earlier.conf, the line a path shows, slugs, countdowns,
publish times and sites.conf."""

from __future__ import annotations

import os
import sys
import unittest
from datetime import datetime, timedelta, timezone

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, "..", "course-deploy-kit")
if KIT not in sys.path:
    sys.path.insert(0, KIT)

from course_deploy import manifest  # noqa: E402
from course_deploy.manifest import Entry, ManifestError, Site  # noqa: E402

DEPLOY = os.path.join(HERE, "..")
SITES = ["course"]


def mac(text: str, known=SITES, label: str = "publish.conf"):
    return manifest.parse_manifest(text, bundle=False, known_sites=known, label=label)


def bundle(text: str, known=SITES):
    return manifest.parse_manifest(text, bundle=True, known_sites=known)


def moscow(when: str) -> datetime:
    return manifest.parse_time(when, "Europe/Moscow")


def read(path: str) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()


class MacManifestTest(unittest.TestCase):
    def problems(self, text: str, known=SITES):
        with self.assertRaises(ManifestError) as caught:
            mac(text, known)
        return caught.exception.problems

    def assertOneProblem(self, text: str, line: int, *fragments: str) -> str:
        problems = self.problems(text)
        self.assertEqual(len(problems), 1, problems)
        self.assertIn(f"line {line}:", problems[0])
        for fragment in fragments:
            self.assertIn(fragment, problems[0])
        return problems[0]

    def test_four_fields(self):
        entries = mac("course | / | Atlas | now\n")
        self.assertEqual(entries, [Entry(1, "course", "/", "Atlas", "now", "")])

    def test_spaces_around_fields_ignored(self):
        (entry,) = mac("   course|/seminars/02/|  Seminars/Evgeny Baulin/web/02   |2026-09-20 12:00   \n")
        self.assertEqual(entry.site, "course")
        self.assertEqual(entry.path, "/seminars/02/")
        self.assertEqual(entry.folder, "Seminars/Evgeny Baulin/web/02")
        self.assertEqual(entry.when, "2026-09-20 12:00")

    def test_comments_and_blank_lines_ignored_but_counted(self):
        text = "# header\n\n   \n  # indented comment\ncourse | / | Atlas | now\n"
        (entry,) = mac(text)
        self.assertEqual(entry.line, 5)

    def test_crlf(self):
        text = "# header\r\ncourse | / | Atlas | now\r\ncourse | /seminars/02/ | Web/02 | 2026-09-20 12:00\r\n"
        entries = mac(text)
        self.assertEqual([e.line for e in entries], [2, 3])
        self.assertEqual(entries[1].when, "2026-09-20 12:00")
        self.assertEqual(entries[0].folder, "Atlas")

    def test_crlf_error_line_numbers(self):
        self.assertOneProblem("# a\r\n# b\r\ncourse | / | Atlas\r\n", 3, "expected 4 fields")

    def test_bom(self):
        entries = mac("\ufeffcourse | / | Atlas | now\n")
        self.assertEqual(entries[0].site, "course")
        entries = mac("\ufeff# comment\r\ncourse | / | Atlas | now\r\n")
        self.assertEqual(entries[0].line, 2)

    def test_empty_file(self):
        self.assertEqual(mac(""), [])
        self.assertEqual(mac("# only comments\n\n"), [])

    def test_wrong_field_count(self):
        self.assertOneProblem("course | / | Atlas\n", 1, "expected 4 fields", "found 3")
        self.assertOneProblem("\ncourse | / | Atlas | now | Title\n", 2, "expected 4 fields", "found 5")
        self.assertOneProblem("course / Atlas now\n", 1, "found 1")

    def test_unknown_site(self):
        message = self.assertOneProblem("course | / | Atlas | now\nother | /x/ | X | now\n", 2,
                                        "unknown site 'other'")
        self.assertIn("course", message)

    def test_no_known_sites(self):
        problems = self.problems("course | / | Atlas | now\n", known=[])
        self.assertIn("unknown site 'course'", problems[0])

    def test_any_valid_site_when_sites_are_not_given(self):
        entries = manifest.parse_manifest("seminars | / | X | now\n", bundle=False)
        self.assertEqual(entries[0].site, "seminars")

    def test_bad_site_name(self):
        for name in ("Course", "_course", "-course", "cour se", "курс", "c.o"):
            with self.subTest(name=name):
                with self.assertRaises(ManifestError) as caught:
                    manifest.parse_manifest(f"{name} | / | Atlas | now\n", bundle=False)
                self.assertIn("line 1:", caught.exception.problems[0])
                self.assertIn("not valid", caught.exception.problems[0])

    def test_valid_paths(self):
        for path in ("/", "/a/", "/seminars/02/", "/a.b/c_d/e-f/", "/A1/-x/_y/", "/a./"):
            with self.subTest(path=path):
                (entry,) = mac(f"course | {path} | Atlas | now\n")
                self.assertEqual(entry.path, path)

    def test_bad_paths(self):
        for path in ("/../", "/a", "a/", "/a//b/", "/.hidden/", "//", "/./", "/a/../b/", "", "a",
                     "/a b/", "/a|b/", "/ä/", "/a/.b/", "/*/", "/a?/"):
            with self.subTest(path=path):
                text = f"# first\ncourse | {path} | Atlas | now\n"
                if "|" in path:
                    self.assertOneProblem(text, 2, "expected 4 fields")
                else:
                    self.assertOneProblem(text, 2, "path")

    def test_folder_trailing_slash_ignored(self):
        self.assertEqual(mac("course | / | Atlas/ | now\n")[0].folder, "Atlas")
        self.assertEqual(mac("course | / | Seminars/Evgeny Baulin/web// | now\n")[0].folder,
                         "Seminars/Evgeny Baulin/web")

    def test_folder_spaces_commas_dots(self):
        folder = "Seminars/Evgeny Baulin/web/02. Convexity, Constraints and Optimality Conditions"
        (entry,) = mac(f"course | /seminars/02/ | {folder} | now\n")
        self.assertEqual(entry.folder, folder)
        (entry,) = mac("course | / | a  b/.c/d.e | now\n")
        self.assertEqual(entry.folder, "a  b/.c/d.e")

    def test_bad_folders(self):
        cases = {
            "/Atlas": "relative",
            "/": "relative",
            "./Atlas": "'.'",
            "Atlas/.": "'.'",
            "../Atlas": "'..'",
            "Seminars/../Atlas": "'..'",
            "Seminars//Atlas": "empty",
            "": "empty",
            "Atlas\tx": "control",
        }
        for folder, fragment in cases.items():
            with self.subTest(folder=folder):
                self.assertOneProblem(f"\n\ncourse | / | {folder} | now\n", 3, fragment)

    def test_now_and_valid_dates(self):
        for when in ("now", "2026-09-20 12:00", "2027-01-01 00:00", "2026-12-31 23:59", "2028-02-29 10:00"):
            with self.subTest(when=when):
                (entry,) = mac(f"course | / | Atlas | {when}\n")
                self.assertEqual(entry.when, when)

    def test_impossible_date(self):
        self.assertOneProblem("course | / | Atlas | 2026-02-30 10:00\n", 1, "2026-02-30 10:00")
        self.assertOneProblem("course | / | Atlas | 2027-02-29 10:00\n", 1, "2027-02-29")
        self.assertOneProblem("course | / | Atlas | 2026-09-20 24:00\n", 1, "24:00")
        self.assertOneProblem("course | / | Atlas | 2026-13-01 10:00\n", 1, "2026-13-01")
        self.assertOneProblem("course | / | Atlas | 2026-09-20 10:60\n", 1, "10:60")

    def test_malformed_times(self):
        for when in ("2026-09-20", "2026-09-20 10", "2026-9-20 10:00", "2026-09-20T10:00", "20.09.2026 10:00",
                     "2026-09-20 10:00:00", "2026-09-20  10:00", "Now", "NOW", "today", "tomorrow 10:00",
                     "10:00 2026-09-20", "2026-09-20 1:00", "", "2026/09/20 10:00"):
            with self.subTest(when=when):
                self.assertOneProblem(f"course | / | Atlas | {when}\n", 1, "publish time")

    def test_duplicate_path(self):
        text = "course | / | Atlas | now\ncourse | /x/ | X | now\n\ncourse | / | Other | now\n"
        message = self.assertOneProblem(text, 4, "already listed on line 1")
        self.assertIn("/", message)

    def test_several_lines_per_path_with_different_times(self):
        text = ("course | /seminars/2/ | Web/upcoming | now\n"
                "course | /seminars/2/ | Web/02 | 2026-09-21 13:00\n"
                "course | /seminars/2/ | Web/02-revised | 2026-10-01 10:00\n"
                "course | /seminars/3/ | Web/upcoming | now\n")
        entries = mac(text)
        self.assertEqual([(e.line, e.path, e.folder) for e in entries], [
            (1, "/seminars/2/", "Web/upcoming"), (2, "/seminars/2/", "Web/02"),
            (3, "/seminars/2/", "Web/02-revised"), (4, "/seminars/3/", "Web/upcoming")])

    def test_lines_of_a_path_in_any_order(self):
        text = "course | /s/ | B | 2026-09-21 13:00\ncourse | /s/ | A | now\n"
        self.assertEqual([e.folder for e in mac(text)], ["B", "A"])

    def test_same_time_twice_names_both_lines(self):
        text = "course | /s/ | A | now\n# comment\ncourse | /s/ | B | now\n"
        self.assertOneProblem(text, 3, "path /s/ of site course is already listed on line 1",
                              "same publish time now")
        text = "course | /s/ | A | 2026-09-21 13:00\ncourse | /s/ | B | now\ncourse | /s/ | A | 2026-09-21 13:00\n"
        self.assertOneProblem(text, 3, "already listed on line 1", "same publish time 2026-09-21 13:00")

    def test_same_time_on_other_paths_is_fine(self):
        text = "course | /a/ | A | 2026-09-21 13:00\ncourse | /b/ | A | 2026-09-21 13:00\n"
        self.assertEqual(len(mac(text)), 2)

    def test_lines_of_one_path_share_their_slug(self):
        text = "course | /a/b/ | X | now\ncourse | /a/b/ | Y | 2026-09-21 13:00\ncourse | /a--b/ | Z | now\n"
        self.assertOneProblem(text, 3, "a--b", "line 1")

    def test_slug_collision(self):
        text = "course | /a/b/ | X | now\ncourse | /a--b/ | Y | now\n"
        self.assertOneProblem(text, 2, "a--b", "line 1")
        text = "course | /a--b/ | Y | now\ncourse | /a/b/ | X | now\n"
        self.assertOneProblem(text, 2, "a--b", "line 1")

    def test_several_bad_lines_all_reported(self):
        text = "\n".join([
            "# publish.conf",
            "course | / | Atlas | now",
            "course | /../ | X | now",
            "course | /seminars/02/ | Web/02 | 2026-02-30 10:00",
            "nosuch | /x/ | X | now",
            "course | / | Other | now",
            "course | /ok/ | ok | now",
            "course | /x/ | X",
        ]) + "\n"
        with self.assertRaises(ManifestError) as caught:
            mac(text)
        problems = caught.exception.problems
        self.assertEqual(len(problems), 5, problems)
        for problem, line in zip(problems, (3, 4, 5, 6, 8)):
            self.assertIn(f"line {line}:", problem)
        self.assertEqual(str(caught.exception), "\n".join(problems))
        self.assertIsInstance(caught.exception, ValueError)

    def test_label_names_the_file(self):
        with self.assertRaises(ManifestError) as caught:
            mac("course | / | Atlas\n", label="Deploy/publish.conf")
        self.assertTrue(caught.exception.problems[0].startswith("Deploy/publish.conf line 1: "),
                        caught.exception.problems[0])
        with self.assertRaises(ManifestError) as caught:
            mac("course | / | Atlas\n")
        self.assertTrue(caught.exception.problems[0].startswith("publish.conf line 1: "))

    def test_shipped_publish_conf_is_valid(self):
        known = [s.name for s in manifest.parse_sites(read(os.path.join(KIT, "sites.conf")))]
        entries = mac(read(os.path.join(DEPLOY, "publish.conf")), known=known)
        paths = [e.path for e in entries]
        self.assertIn("/", paths)
        root = next(e for e in entries if e.path == "/")
        self.assertEqual((root.site, root.folder, root.when), ("course", "Atlas", "now"))
        for n in range(1, 15):
            self.assertIn(f"/seminars/{n}/", paths)
        for e in entries:
            self.assertFalse(e.folder.startswith(("Lecture", "Documents")), e.folder)
            self.assertNotIn("/theory", e.folder)
            self.assertNotIn("/checks", e.folder)
        # the coming-later page never replaces a seminar
        folders = manifest.bundle_folders(entries, "Europe/Moscow")
        for e in entries:
            if e.folder.endswith("/upcoming"):
                self.assertEqual(e.when, "now", e)
            if folders[e].startswith("earlier/"):
                self.assertTrue(e.folder.endswith("/upcoming"), e)


class BundleManifestTest(unittest.TestCase):
    def test_five_fields(self):
        text = ("# Generated\n"
                "course | / | entries/root | now | Atlas\n"
                "course | /seminars/02/ | entries/seminars--02 | 2026-09-20 12:00 | "
                "02. Convexity, Constraints and Optimality Conditions\n")
        entries = bundle(text)
        self.assertEqual(entries[0], Entry(2, "course", "/", "entries/root", "now", "Atlas"))
        self.assertEqual(entries[1].folder, "entries/seminars--02")
        self.assertEqual(entries[1].title, "02. Convexity, Constraints and Optimality Conditions")

    def test_four_fields_rejected_in_bundle(self):
        with self.assertRaises(ManifestError) as caught:
            bundle("course | / | entries/root | now\n")
        self.assertIn("line 1:", caught.exception.problems[0])
        self.assertIn("expected 5 fields", caught.exception.problems[0])

    def test_folder_must_be_entries_slug(self):
        for folder in ("Atlas", "entries/seminars-02", "entries/seminars/02", "entries", "entries/root/x"):
            with self.subTest(folder=folder):
                with self.assertRaises(ManifestError) as caught:
                    bundle(f"course | /seminars/02/ | {folder} | now | T\n")
                self.assertIn("line 1:", caught.exception.problems[0])
                self.assertIn("entries/seminars--02", caught.exception.problems[0])

    def test_folder_trailing_slash_ignored_in_bundle(self):
        (entry,) = bundle("course | / | entries/root/ | now | Atlas\n")
        self.assertEqual(entry.folder, "entries/root")

    def test_title_required(self):
        for line in ("course | / | entries/root | now |", "course | / | entries/root | now |   "):
            with self.subTest(line=line):
                with self.assertRaises(ManifestError) as caught:
                    bundle("\n" + line + "\n")
                self.assertIn("line 2:", caught.exception.problems[0])
                self.assertIn("title", caught.exception.problems[0])

    def test_bundle_errors_like_mac(self):
        with self.assertRaises(ManifestError) as caught:
            bundle("course | / | entries/root | 2026-02-30 10:00 | Atlas\n"
                   "other | /x/ | entries/x | now | X\n")
        self.assertEqual(len(caught.exception.problems), 2)

    def test_one_line_per_path_even_with_different_times(self):
        with self.assertRaises(ManifestError) as caught:
            bundle("course | /s/ | entries/s | now | A\ncourse | /s/ | entries/s | 2026-09-21 13:00 | B\n")
        self.assertEqual(len(caught.exception.problems), 1)
        self.assertIn("line 2: path /s/ of site course is already listed on line 1", caught.exception.problems[0])

    def test_render_round_trip(self):
        entries = [
            Entry(3, "course", "/", "Atlas", "now", "Atlas"),
            Entry(5, "course", "/seminars/02/", "Seminars/Evgeny Baulin/web/02", "2026-09-20 12:00",
                  "02. Convexity, Constraints and Optimality Conditions"),
        ]
        text = manifest.render_bundle_manifest(entries)
        self.assertTrue(text.endswith("\n"))
        parsed = bundle(text)
        self.assertEqual([(e.site, e.path, e.folder, e.when, e.title) for e in parsed], [
            ("course", "/", "entries/root", "now", "Atlas"),
            ("course", "/seminars/02/", "entries/seminars--02", "2026-09-20 12:00",
             "02. Convexity, Constraints and Optimality Conditions"),
        ])


LATEST = ("course | / | entries/root | now | Atlas\n"
          "course | /seminars/2/ | entries/seminars--2 | 2026-09-21 13:00 | 02\n"
          "course | /seminars/3/ | entries/seminars--3 | 2026-10-01 18:10 | 03\n")


class EarlierManifestTest(unittest.TestCase):
    def earlier(self, text: str, latest: str = LATEST, known=SITES):
        return manifest.parse_earlier(text, bundle(latest), known_sites=known)

    def problems(self, text: str, latest: str = LATEST):
        with self.assertRaises(ManifestError) as caught:
            self.earlier(text, latest)
        return caught.exception.problems

    def assertOneProblem(self, text: str, line: int, *fragments: str) -> str:
        problems = self.problems(text)
        self.assertEqual(len(problems), 1, problems)
        self.assertTrue(problems[0].startswith(f"earlier.conf line {line}: "), problems[0])
        for fragment in fragments:
            self.assertIn(fragment, problems[0])
        return problems[0]

    def test_lines(self):
        text = ("# Generated\n"
                "course | /seminars/2/ | earlier/seminars--2/1 | now | upcoming\n"
                "course | /seminars/3/ | earlier/seminars--3/1 | now | upcoming\n"
                "course | /seminars/3/ | earlier/seminars--3/2 | 2026-09-25 10:00 | 03-draft\n")
        entries = self.earlier(text)
        self.assertEqual(entries[0], Entry(2, "course", "/seminars/2/", "earlier/seminars--2/1", "now", "upcoming"))
        self.assertEqual([(e.path, e.folder, e.when) for e in entries[1:]], [
            ("/seminars/3/", "earlier/seminars--3/1", "now"),
            ("/seminars/3/", "earlier/seminars--3/2", "2026-09-25 10:00")])

    def test_empty(self):
        self.assertEqual(self.earlier(""), [])
        self.assertEqual(self.earlier("# nothing\n"), [])

    def test_crlf_and_bom(self):
        entries = self.earlier("\ufeff# x\r\ncourse | /seminars/2/ | earlier/seminars--2/1 | now | upcoming\r\n")
        self.assertEqual((entries[0].line, entries[0].title), (2, "upcoming"))

    def test_path_must_be_in_publish_conf(self):
        self.assertOneProblem("course | /seminars/4/ | earlier/seminars--4/1 | now | upcoming\n", 1,
                              "path /seminars/4/ of site course is not in publish.conf")

    def test_folder_rule(self):
        for folder in ("entries/seminars--2", "earlier/seminars--2/2", "earlier/seminars--2/0",
                       "earlier/seminars--2", "earlier/seminars--3/1", "earlier/seminars--2/01",
                       "Seminars/web/upcoming", "earlier/x/1"):
            with self.subTest(folder=folder):
                self.assertOneProblem(f"course | /seminars/2/ | {folder} | now | upcoming\n", 1,
                                      "folder must be earlier/seminars--2/1")

    def test_folders_numbered_in_file_order(self):
        text = ("course | /seminars/3/ | earlier/seminars--3/2 | 2026-09-25 10:00 | B\n"
                "course | /seminars/3/ | earlier/seminars--3/1 | now | A\n")
        problems = self.problems(text)
        self.assertIn("line 1: folder must be earlier/seminars--3/1", problems[0])

    def test_times_strictly_increasing_within_a_path(self):
        text = ("course | /seminars/3/ | earlier/seminars--3/1 | 2026-09-25 10:00 | A\n"
                "course | /seminars/3/ | earlier/seminars--3/2 | now | B\n")
        self.assertOneProblem(text, 2, "publish time now is not later than 2026-09-25 10:00 on line 1")
        text = ("course | /seminars/3/ | earlier/seminars--3/1 | now | A\n"
                "course | /seminars/3/ | earlier/seminars--3/2 | now | A\n")
        self.assertOneProblem(text, 2, "not later than now on line 1")

    def test_time_before_the_publish_conf_line(self):
        for when in ("2026-09-21 13:00", "2026-09-21 13:01", "2027-01-01 00:00"):
            with self.subTest(when=when):
                self.assertOneProblem(f"course | /seminars/2/ | earlier/seminars--2/1 | {when} | A\n", 1,
                                      f"publish time {when} is not earlier than 2026-09-21 13:00",
                                      "(line 2)")

    def test_a_now_path_cannot_have_earlier_lines(self):
        self.assertOneProblem("course | / | earlier/root/1 | now | Old atlas\n", 1, "not earlier than now")

    def test_other_problems(self):
        cases = {
            "course | /seminars/2/ | earlier/seminars--2/1 | now": "expected 5 fields",
            "course | /seminars/2/ | earlier/seminars--2/1 | now |": "title",
            "other | /seminars/2/ | earlier/seminars--2/1 | now | A": "unknown site 'other'",
            "course | /seminars/../ | earlier/seminars--2/1 | now | A": "path segment",
            "course | /seminars/2/ | earlier/../entries/root | now | A": "'..'",
            "course | /seminars/2/ | earlier/seminars--2/1 | 2026-02-30 10:00 | A": "no such date",
            "course | /seminars/2/ | earlier/seminars--2/1 | today | A": "publish time must be",
        }
        for line, fragment in cases.items():
            with self.subTest(line=line):
                self.assertOneProblem("# x\n" + line + "\n", 2, fragment)

    def test_every_bad_line_reported(self):
        text = ("course | /seminars/9/ | earlier/seminars--9/1 | now | A\n"
                "course | /seminars/2/ | earlier/seminars--2/1 | now | A\n"
                "course | /seminars/2/ | earlier/seminars--2/2 | now | A\n"
                "course | /seminars/3/ | earlier/seminars--3/1 | 2027-01-01 00:00 | A\n")
        problems = self.problems(text)
        self.assertEqual([p.split(":")[0] for p in problems],
                         ["earlier.conf line 1", "earlier.conf line 3", "earlier.conf line 4"])

    def test_render_round_trip(self):
        latest = bundle(LATEST)
        earlier = [Entry(0, "course", "/seminars/2/", "earlier/seminars--2/1", "now", "upcoming"),
                   Entry(0, "course", "/seminars/3/", "earlier/seminars--3/1", "now", "upcoming"),
                   Entry(0, "course", "/seminars/3/", "earlier/seminars--3/2", "2026-09-25 10:00", "03, draft")]
        text = manifest.render_earlier_manifest(earlier)
        self.assertTrue(text.startswith("# Generated by Deploy/publish.py"))
        parsed = manifest.parse_earlier(text, latest, known_sites=SITES)
        self.assertEqual([(e.path, e.folder, e.when, e.title) for e in parsed],
                         [(e.path, e.folder, e.when, e.title) for e in earlier])


class LinesOfAPathTest(unittest.TestCase):
    TEXT = ("course | / | Atlas | now\n"
            "course | /seminars/2/ | Web/02 | 2026-09-21 13:00\n"
            "course | /seminars/2/ | Web/upcoming | now\n"
            "course | /seminars/3/ | Web/03 | 2026-10-01 18:10\n"
            "course | /seminars/3/ | Web/03-draft | 2026-09-25 10:00\n"
            "course | /seminars/4/ | Web/04 | 2026-10-08 18:10\n")

    def shown(self, when: str):
        entries = mac(self.TEXT)
        return sorted((e.path, e.folder) for e in manifest.current(entries, moscow(when), "Europe/Moscow"))

    def test_current(self):
        self.assertEqual(self.shown("2026-09-18 12:00"), [
            ("/", "Atlas"), ("/seminars/2/", "Web/upcoming")])
        self.assertEqual(self.shown("2026-09-21 12:59"), [
            ("/", "Atlas"), ("/seminars/2/", "Web/upcoming")])
        self.assertEqual(self.shown("2026-09-21 13:00"), [
            ("/", "Atlas"), ("/seminars/2/", "Web/02")])
        self.assertEqual(self.shown("2026-09-25 10:00"), [
            ("/", "Atlas"), ("/seminars/2/", "Web/02"), ("/seminars/3/", "Web/03-draft")])
        self.assertEqual(self.shown("2026-12-31 23:59"), [
            ("/", "Atlas"), ("/seminars/2/", "Web/02"), ("/seminars/3/", "Web/03"), ("/seminars/4/", "Web/04")])

    def test_bundle_folders(self):
        entries = mac(self.TEXT)
        folders = manifest.bundle_folders(entries, "Europe/Moscow")
        self.assertEqual([folders[e] for e in entries], [
            "entries/root", "entries/seminars--2", "earlier/seminars--2/1", "entries/seminars--3",
            "earlier/seminars--3/1", "entries/seminars--4"])

    def test_bundle_folders_number_in_time_order(self):
        entries = mac("course | /s/ | C | 2026-10-01 10:00\ncourse | /s/ | A | now\n"
                      "course | /s/ | D | 2026-11-01 10:00\ncourse | /s/ | B | 2026-09-01 10:00\n")
        folders = manifest.bundle_folders(entries, "Europe/Moscow")
        self.assertEqual({e.folder: folders[e] for e in entries},
                         {"A": "earlier/s/1", "B": "earlier/s/2", "C": "earlier/s/3", "D": "entries/s"})

    def test_time_key(self):
        now = Entry(1, "course", "/", "A", "now")
        early = Entry(2, "course", "/", "A", "2026-01-01 00:00")
        late = Entry(3, "course", "/", "A", "2026-09-21 13:00")
        self.assertEqual(sorted([late, now, early], key=lambda e: manifest.time_key(e, "Europe/Moscow")),
                         [now, early, late])

    def test_path_key(self):
        paths = ["/seminars/shared/", "/seminars/10/", "/", "/seminars/2/", "/seminars/", "/seminars/1/",
                 "/atlas/", "/seminars/2/extra/"]
        self.assertEqual(sorted(paths, key=manifest.path_key), [
            "/", "/atlas/", "/seminars/", "/seminars/1/", "/seminars/2/", "/seminars/2/extra/", "/seminars/10/",
            "/seminars/shared/"])


class SlugTest(unittest.TestCase):
    def test_slug(self):
        self.assertEqual(manifest.slug("/"), "root")
        self.assertEqual(manifest.slug("/seminars/02/"), "seminars--02")
        self.assertEqual(manifest.slug("/a/"), "a")
        self.assertEqual(manifest.slug("/a/b/c/"), "a--b--c")
        self.assertEqual(manifest.slug("/a.b/c_d/"), "a.b--c_d")

    def test_entry_slug(self):
        self.assertEqual(Entry(1, "course", "/seminars/02/", "x", "now").slug, "seminars--02")
        self.assertEqual(Entry(1, "course", "/", "x", "now").slug, "root")

    def test_segments(self):
        self.assertEqual(manifest.segments("/"), [])
        self.assertEqual(manifest.segments("/seminars/02/"), ["seminars", "02"])


class CountdownTest(unittest.TestCase):
    def test_formats(self):
        self.assertEqual(manifest.countdown(2 * 86400 + 5 * 3600), "in 2d 5h")
        self.assertEqual(manifest.countdown(3 * 3600 + 10 * 60), "in 3h 10m")
        self.assertEqual(manifest.countdown(7 * 60), "in 7m")
        self.assertEqual(manifest.countdown(86400), "in 1d 0h")
        self.assertEqual(manifest.countdown(3600), "in 1h 0m")

    def test_rounds_up_to_whole_minutes(self):
        self.assertEqual(manifest.countdown(6 * 60 + 1), "in 7m")
        self.assertEqual(manifest.countdown(2 * 86400 + 5 * 3600 - 30), "in 2d 5h")
        self.assertEqual(manifest.countdown(3 * 3600 + 9 * 60 + 30), "in 3h 10m")

    def test_minimum_one_minute(self):
        for seconds in (0, 0.4, 1, 59, 60, -5, -3600):
            with self.subTest(seconds=seconds):
                self.assertEqual(manifest.countdown(seconds), "in 1m")


class PublishTimeTest(unittest.TestCase):
    def entry(self, when: str) -> Entry:
        return Entry(1, "course", "/seminars/02/", "entries/seminars--02", when, "02")

    def test_now_is_always_released(self):
        e = self.entry("now")
        self.assertIsNone(e.publish_time("Europe/Moscow"))
        self.assertTrue(e.released(datetime(2000, 1, 1, tzinfo=timezone.utc), "Europe/Moscow"))

    def test_moscow_time(self):
        e = self.entry("2026-09-20 12:00")
        at = e.publish_time("Europe/Moscow")
        self.assertEqual(at.utcoffset(), timedelta(hours=3))
        self.assertEqual(at.astimezone(timezone.utc), datetime(2026, 9, 20, 9, 0, tzinfo=timezone.utc))

    def test_released_boundary(self):
        e = self.entry("2026-09-20 12:00")
        moment = datetime(2026, 9, 20, 9, 0, tzinfo=timezone.utc)
        self.assertTrue(e.released(moment, "Europe/Moscow"))
        self.assertTrue(e.released(moment + timedelta(days=30), "Europe/Moscow"))
        self.assertFalse(e.released(moment - timedelta(seconds=1), "Europe/Moscow"))
        # 12:00 UTC is 15:00 in Moscow, so the entry is out by then
        self.assertTrue(e.released(datetime(2026, 9, 20, 12, 0, tzinfo=timezone.utc), "Europe/Moscow"))
        self.assertFalse(e.released(datetime(2026, 9, 20, 8, 59, tzinfo=timezone.utc), "Europe/Moscow"))

    def test_other_timezone(self):
        e = self.entry("2026-09-20 12:00")
        moment = datetime(2026, 9, 20, 11, 0, tzinfo=timezone.utc)
        self.assertTrue(e.released(moment, "Europe/Moscow"))
        self.assertFalse(e.released(moment, "UTC"))

    def test_parse_time(self):
        at = manifest.parse_time("2026-02-28 23:59", "Europe/Moscow")
        self.assertEqual((at.year, at.month, at.day, at.hour, at.minute), (2026, 2, 28, 23, 59))
        with self.assertRaises(ValueError):
            manifest.parse_time("2026-02-30 20:00", "Europe/Moscow")
        with self.assertRaises(ValueError):
            manifest.parse_time("2026-02-28", "Europe/Moscow")


class SitesTest(unittest.TestCase):
    def problems(self, text: str):
        with self.assertRaises(ManifestError) as caught:
            manifest.parse_sites(text)
        return caught.exception.problems

    def test_shipped_template(self):
        sites = manifest.parse_sites(read(os.path.join(KIT, "sites.conf")))
        self.assertEqual(sites, [Site("course", "/var/www/optimization-methods",
                                      "https://optimization-methods.tarakan-tuc.ru")])

    def test_comments_at_line_end_and_blank_lines(self):
        text = ("# header\n\n"
                "course  /var/www/optimization-methods  https://optimization-methods.tarakan-tuc.ru  # main\n"
                "\tseminars\t/var/www/seminars\thttps://seminars.example.org#no space\n"
                "   # indented comment\n")
        sites = manifest.parse_sites(text)
        self.assertEqual([s.name for s in sites], ["course", "seminars"])
        self.assertEqual(sites[1].url, "https://seminars.example.org")

    def test_crlf_and_bom(self):
        sites = manifest.parse_sites("\ufeffcourse /var/www/a https://a.example\r\n")
        self.assertEqual(sites[0].webroot, "/var/www/a")

    def test_properties(self):
        (site,) = manifest.parse_sites("course /var/www/a https://optimization-methods.tarakan-tuc.ru\n")
        self.assertEqual((site.scheme, site.host, site.port), ("https", "optimization-methods.tarakan-tuc.ru", 443))
        (site,) = manifest.parse_sites("course /var/www/a http://localhost\n")
        self.assertEqual((site.scheme, site.host, site.port), ("http", "localhost", 80))

    def test_url_with_port(self):
        (site,) = manifest.parse_sites("course /var/www/a https://localhost:8443\n")
        self.assertEqual((site.scheme, site.host, site.port), ("https", "localhost", 8443))
        self.assertEqual(site.url, "https://localhost:8443")
        (site,) = manifest.parse_sites("course /var/www/a http://127.0.0.1:8080/\n")
        self.assertEqual((site.host, site.port, site.url), ("127.0.0.1", 8080, "http://127.0.0.1:8080"))

    def test_port_out_of_range(self):
        for url in ("https://a.example:0", "https://a.example:65536", "https://a.example:99999"):
            with self.subTest(url=url):
                self.problems(f"course /var/www/a {url}\n")

    def test_trailing_slash_dropped(self):
        (site,) = manifest.parse_sites("course /var/www/a https://a.example/\n")
        self.assertEqual(site.url, "https://a.example")

    def test_bad_name(self):
        for name in ("Course", "_c", "-c", "c.d", "курс"):
            with self.subTest(name=name):
                problems = self.problems(f"{name} /var/www/a https://a.example\n")
                self.assertIn("line 1:", problems[0])
                self.assertIn("site name", problems[0])

    def test_bad_webroot(self):
        for webroot in ("/srv/www/a", "/var/www/.hidden", "/var/www/", "/var/www", "/var/www/a/b", "var/www/a",
                        "/var/www/../etc", "/var/www/a b"):
            with self.subTest(webroot=webroot):
                text = f"\ncourse {webroot} https://a.example\n"
                problems = self.problems(text)
                self.assertIn("line 2:", problems[0])
                if " " not in webroot:
                    self.assertIn("web root", problems[0])

    def test_bad_url(self):
        for url in ("ftp://a.example", "https://a.example/path", "https://", "https://a.example:port",
                    "a.example", "https://a.example/?q", "https://-a.example", "https://a.example:123456",
                    "HTTPS://a.example", "https://user@a.example"):
            with self.subTest(url=url):
                problems = self.problems(f"course /var/www/a {url}\n")
                self.assertIn("line 1:", problems[0])
                self.assertIn("URL", problems[0])

    def test_field_count(self):
        problems = self.problems("course /var/www/a\n")
        self.assertIn("line 1:", problems[0])
        problems = self.problems("course /var/www/a https://a.example extra\n")
        self.assertIn("found 4 fields", problems[0])

    def test_duplicate_names_and_webroots(self):
        problems = self.problems("course /var/www/a https://a.example\ncourse /var/www/b https://b.example\n")
        self.assertEqual(len(problems), 1)
        self.assertIn("line 2:", problems[0])
        self.assertIn("line 1", problems[0])
        problems = self.problems("a /var/www/x https://a.example\nb /var/www/x https://b.example\n")
        self.assertIn("line 2:", problems[0])

    def test_all_problems_reported(self):
        problems = self.problems("Bad /var/www/a https://a.example\nok /var/www/b https://b.example\n"
                                 "c /srv/c https://c.example\n")
        self.assertEqual(len(problems), 2)
        self.assertIn("line 1:", problems[0])
        self.assertIn("line 3:", problems[1])

    def test_empty(self):
        self.assertEqual(manifest.parse_sites("# nothing\n"), [])


class SourceInfoTest(unittest.TestCase):
    def test_parse_source_info(self):
        info = manifest.parse_source_info("commit: abc\ndirty: no\nbuilt: 2026-09-18T10:00:00Z\npublish.py: 1.0.0\n")
        self.assertEqual(info, {"commit": "abc", "dirty": "no", "built": "2026-09-18T10:00:00Z",
                                "publish.py": "1.0.0"})


if __name__ == "__main__":
    unittest.main()
