# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Release helpers that need neither root nor a server: the tree hash, the bundle subject, the
clean-up of a switch that is interrupted before its live check has passed, and bundles whose paths
have several lines, read from a throwaway site.git."""

from __future__ import annotations

import contextlib
import io
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime
from zoneinfo import ZoneInfo

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, "..", "course-deploy-kit")
if KIT not in sys.path:
    sys.path.insert(0, KIT)

from unittest import mock  # noqa: E402

from course_deploy import cli, notify, release  # noqa: E402
from course_deploy.manifest import Entry, Site  # noqa: E402


class TreeHashTest(unittest.TestCase):
    def setUp(self):
        self.root = tempfile.mkdtemp(prefix="release-test-")
        self.addCleanup(shutil.rmtree, self.root, True)
        self.put("index.html", "<p>atlas</p>")
        self.put("js/app.js", "1")
        self.put("seminars/02/index.html", "M")
        self.put("seminars/02/version.txt", "not the root one")

    def put(self, rel: str, data: str) -> None:
        path = os.path.join(self.root, *rel.split("/"))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(data)

    def test_stable(self):
        self.assertEqual(release.tree_hash(self.root), release.tree_hash(self.root))
        self.assertRegex(release.tree_hash(self.root), r"\A[0-9a-f]{64}\Z")

    def test_root_version_txt_ignored(self):
        before = release.tree_hash(self.root)
        self.put("version.txt", "release 20260918T100000Z-abcdef0\n")
        self.assertEqual(release.tree_hash(self.root), before)
        self.put("version.txt", "release 20260919T100000Z-1234567\n")
        self.assertEqual(release.tree_hash(self.root), before)

    def test_nested_version_txt_counts(self):
        before = release.tree_hash(self.root)
        self.put("seminars/02/version.txt", "changed")
        self.assertNotEqual(release.tree_hash(self.root), before)

    def test_content_counts(self):
        before = release.tree_hash(self.root)
        self.put("js/app.js", "2")
        self.assertNotEqual(release.tree_hash(self.root), before)

    def test_names_count(self):
        before = release.tree_hash(self.root)
        os.rename(os.path.join(self.root, "js", "app.js"), os.path.join(self.root, "js", "App.js"))
        self.assertNotEqual(release.tree_hash(self.root), before)

    def test_new_file_counts(self):
        before = release.tree_hash(self.root)
        self.put("css/site.css", "")
        self.assertNotEqual(release.tree_hash(self.root), before)

    def test_same_files_elsewhere_give_the_same_hash(self):
        other = tempfile.mkdtemp(prefix="release-test-")
        self.addCleanup(shutil.rmtree, other, True)
        shutil.copytree(self.root, os.path.join(other, "copy"))
        self.assertEqual(release.tree_hash(os.path.join(other, "copy")), release.tree_hash(self.root))

    def test_empty_folders_do_not_count(self):
        before = release.tree_hash(self.root)
        os.makedirs(os.path.join(self.root, "empty"))
        self.assertEqual(release.tree_hash(self.root), before)


class BundleSubjectTest(unittest.TestCase):
    def bundle(self, subject: str) -> release.Bundle:
        return release.Bundle("0" * 40, [], "", {}, subject)

    def test_main_subject(self):
        self.assertEqual(self.bundle("Site build from abc1234: Add seminar 2").main_subject, "Add seminar 2")
        self.assertEqual(self.bundle("Site build from abc1234 (dirty): Fix: typo").main_subject, "Fix: typo")
        self.assertEqual(self.bundle("hand-made commit").main_subject, "hand-made commit")


NEW = "20260918T100000Z-1234567"
OLD = "20260917T100000Z-7654321"


class FakeBuild:
    """Stands in for release.Build: finalise() only creates the release folder and its meta."""

    def __init__(self, ctx, site, bundle, entries):
        self.ctx, self.site = ctx, site
        self.paths = ["/"]
        self.tree = "new-tree"
        self.files = 1
        self.version = f"release {NEW}\n"

    def assemble(self):
        pass

    def finalise(self):
        folder = os.path.join(self.ctx.site_dir(self.site), NEW)
        os.makedirs(folder)
        with open(os.path.join(folder, "version.txt"), "w", encoding="utf-8") as f:
            f.write(self.version)
        with open(folder + ".meta", "w", encoding="utf-8") as f:
            f.write("tree=new-tree\npaths=/\n")
        return NEW

    def discard(self):
        pass


class InterruptedSwitchTest(unittest.TestCase):
    """Whatever stops a deploy between the switch and a passed live check, the old state comes back."""

    def setUp(self):
        self.prefix = tempfile.mkdtemp(prefix="release-switch-")
        self.addCleanup(shutil.rmtree, self.prefix, True)
        config = dict(cli.DEFAULTS)
        self.site = Site("course", "/var/www/site", "https://example.org")
        self.log = []
        self.ctx = release.Context(self.prefix, config, [self.site], "", self.log.append, lambda: 0.0)
        self.webroot = self.ctx.webroot(self.site)
        os.makedirs(os.path.dirname(self.webroot))
        os.makedirs(self.ctx.site_dir(self.site))
        patcher = mock.patch.object(release, "Build", FakeBuild)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.bundle = release.Bundle("1234567abc", [Entry(1, "course", "/", "entries/root", "now", "Atlas")], "",
                                     {}, "Site build")

    def deploy(self):
        return release.deploy(self.ctx, self.site, self.bundle, self.bundle.entries, dry_run=False)

    def plain_webroot(self):
        os.makedirs(self.webroot)
        with open(os.path.join(self.webroot, "index.html"), "w", encoding="utf-8") as f:
            f.write("old atlas")

    def linked_webroot(self):
        os.makedirs(os.path.join(self.ctx.site_dir(self.site), OLD))
        os.symlink(os.path.join(self.ctx.site_dir(self.site), OLD), self.webroot)

    def assert_new_release_gone(self):
        self.assertFalse(os.path.exists(os.path.join(self.ctx.site_dir(self.site), NEW)))
        self.assertFalse(os.path.exists(os.path.join(self.ctx.site_dir(self.site), NEW + ".meta")))

    def test_interrupt_during_the_live_check_after_the_legacy_move(self):
        self.plain_webroot()
        with mock.patch.object(release, "live_check", side_effect=KeyboardInterrupt):
            with self.assertRaises(KeyboardInterrupt):
                self.deploy()
        self.assertEqual(release.live_release(self.ctx, self.site), release.LEGACY)
        with open(os.path.join(self.webroot, "index.html"), encoding="utf-8") as f:
            self.assertEqual(f.read(), "old atlas")
        self.assert_new_release_gone()

    def test_failed_switch_moves_the_legacy_folder_back(self):
        self.plain_webroot()
        with mock.patch.object(release, "switch", side_effect=OSError("disk full")):
            with self.assertRaises(release.DeployError) as caught:
                self.deploy()
        self.assertIn("cannot switch the web root: disk full", str(caught.exception))
        self.assertFalse(os.path.islink(self.webroot))
        self.assertTrue(os.path.isfile(os.path.join(self.webroot, "index.html")))
        self.assertFalse(os.path.exists(os.path.join(self.ctx.site_dir(self.site), release.LEGACY)))
        self.assert_new_release_gone()

    def test_broken_pipe_while_logging_switches_back(self):
        self.linked_webroot()

        def log(message):
            if "switched" in message:
                raise BrokenPipeError(32, "Broken pipe")

        self.ctx.log = log
        with mock.patch.object(release, "live_check", return_value=None) as check:
            with self.assertRaises(BrokenPipeError):
                self.deploy()
        check.assert_not_called()
        self.assertEqual(release.live_release(self.ctx, self.site), OLD)
        self.assert_new_release_gone()

    def test_failed_live_check_switches_back(self):
        self.linked_webroot()
        with mock.patch.object(release, "live_check", return_value="https://example.org/: HTTP 502"):
            with self.assertRaises(release.DeployError) as caught:
                self.deploy()
        self.assertIn(f"live check failed, switched back to {OLD}: https://example.org/: HTTP 502",
                      str(caught.exception))
        self.assertEqual(release.live_release(self.ctx, self.site), OLD)
        self.assert_new_release_gone()

    def test_passed_live_check_keeps_the_new_release(self):
        self.linked_webroot()
        with mock.patch.object(release, "live_check", return_value=None):
            outcome = self.deploy()
        self.assertEqual(outcome.release, NEW)
        self.assertEqual(release.live_release(self.ctx, self.site), NEW)

    def test_interrupted_rollback_keeps_the_live_release(self):
        self.linked_webroot()
        with mock.patch.object(release, "live_check", return_value=None):
            self.deploy()
        with mock.patch.object(release, "live_check", side_effect=KeyboardInterrupt):
            with self.assertRaises(KeyboardInterrupt):
                release.rollback(self.ctx, self.site)
        self.assertEqual(release.live_release(self.ctx, self.site), NEW)


MOSCOW = ZoneInfo("Europe/Moscow")
BEFORE = datetime(2026, 9, 18, 10, 0, tzinfo=MOSCOW).timestamp()
AFTER = datetime(2026, 9, 21, 13, 0, tzinfo=MOSCOW).timestamp()
PUBLISH_CONF = ("# Generated by Deploy/publish.py: site | path | folder | publish from | title\n"
                "course | / | entries/root | now | Atlas\n"
                "course | /seminars/2/ | entries/seminars--2 | 2026-09-21 13:00 | 02\n")
EARLIER_CONF = "course | /seminars/2/ | earlier/seminars--2/1 | now | upcoming\n"
BUNDLE = {
    "publish.conf": PUBLISH_CONF,
    "earlier.conf": EARLIER_CONF,
    "exclude.txt": "*.md\n",
    "source.txt": "commit: abc\n",
    "entries/root/index.html": '<a href="seminars/2/">2</a>',
    "entries/seminars--2/index.html": "<p>seminar 2</p>",
    "entries/seminars--2/figures/a.svg": "<svg/>",
    "earlier/seminars--2/1/index.html": "<p>coming later</p>",
    "earlier/seminars--2/1/notes.md": "excluded",
}


@unittest.skipUnless(shutil.which("git"), "git is not installed")
class SeveralLinesTest(unittest.TestCase):
    """A bundle whose /seminars/2/ shows the coming-later page until 2026-09-21 13:00, then the seminar."""

    def setUp(self):
        self.prefix = tempfile.mkdtemp(prefix="release-lines-")
        self.addCleanup(shutil.rmtree, self.prefix, True)
        home = os.path.join(self.prefix, "home")
        os.makedirs(home)
        patcher = mock.patch.dict(os.environ, {"HOME": home, "XDG_CONFIG_HOME": home, "GIT_CONFIG_NOSYSTEM": "1"})
        patcher.start()
        self.addCleanup(patcher.stop)
        self.site = Site("course", "/var/www/site", "https://example.org")
        self.log = []
        self.now = BEFORE
        sites_text = "course /var/www/site https://example.org\n"
        self.ctx = release.Context(self.prefix, dict(cli.DEFAULTS), [self.site], sites_text, self.log.append,
                                   lambda: self.now)
        os.makedirs(os.path.dirname(self.ctx.webroot(self.site)))
        subprocess.run(["git", "init", "-q", "--bare", self.ctx.repo], check=True)

    def commit(self, files) -> str:
        work = tempfile.mkdtemp(prefix="work-", dir=self.prefix)
        for rel, data in files.items():
            path = os.path.join(work, *rel.split("/"))
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "wb") as f:
                f.write(data if isinstance(data, bytes) else data.encode("utf-8"))
        env = dict(os.environ, GIT_DIR=self.ctx.repo, GIT_WORK_TREE=work, GIT_AUTHOR_NAME="T",
                   GIT_INDEX_FILE=os.path.join(work, ".index"), GIT_AUTHOR_EMAIL="t@example.org",
                   GIT_COMMITTER_NAME="T", GIT_COMMITTER_EMAIL="t@example.org")

        def git(*args: str) -> str:
            return subprocess.run(["git", *args], env=env, cwd=work, check=True,
                                  stdout=subprocess.PIPE).stdout.decode().strip()

        git("add", "-A", ".")
        commit = git("commit-tree", git("write-tree"), "-m", "Site build from abc1234: Test")
        git("update-ref", "refs/heads/site", commit)
        return commit

    def run_cli(self, function, *args):
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            code = function(self.ctx, *args)
        return code, out.getvalue()

    def test_bundle_of_publish_py_1_0(self):
        files = {k: v for k, v in BUNDLE.items() if not k.startswith("earlier")}
        bundle = release.load_bundle(self.ctx, self.commit(files))
        self.assertEqual([(e.path, e.folder) for e in bundle.entries],
                         [("/", "entries/root"), ("/seminars/2/", "entries/seminars--2")])

    def test_load_bundle_with_earlier_lines(self):
        bundle = release.load_bundle(self.ctx, self.commit(BUNDLE))
        self.assertEqual([(e.path, e.folder, e.when, e.title) for e in bundle.entries], [
            ("/", "entries/root", "now", "Atlas"),
            ("/seminars/2/", "entries/seminars--2", "2026-09-21 13:00", "02"),
            ("/seminars/2/", "earlier/seminars--2/1", "now", "upcoming"),
        ])

    def test_invalid_earlier_conf(self):
        cases = {
            "course | /seminars/3/ | earlier/seminars--3/1 | now | x\n": "path /seminars/3/ of site course is not",
            "course | /seminars/2/ | earlier/seminars--2/2 | now | x\n": "folder must be earlier/seminars--2/1",
            "course | /seminars/2/ | earlier/seminars--2/1 | 2026-09-22 10:00 | x\n": "is not earlier than",
            "course | /seminars/2/ | earlier/seminars--2/1 | now\n": "expected 5 fields",
        }
        for text, fragment in cases.items():
            with self.subTest(text=text):
                commit = self.commit(dict(BUNDLE, **{"earlier.conf": text}))
                with self.assertRaises(release.DeployError) as caught:
                    release.load_bundle(self.ctx, commit)
                message = str(caught.exception)
                self.assertIn(f"bundle {commit[:7]}: invalid earlier.conf: earlier.conf line 1: ", message)
                self.assertIn(fragment, message)
        commit = self.commit(dict(BUNDLE, **{"earlier.conf": b"\xff\xfe"}))
        with self.assertRaises(release.DeployError) as caught:
            release.load_bundle(self.ctx, commit)
        self.assertEqual(str(caught.exception), f"bundle {commit[:7]}: earlier.conf is not UTF-8")

    def test_the_path_switches_at_the_time_of_its_next_line(self):
        self.commit(BUNDLE)
        code, _ = self.run_cli(cli.run, "dry-run")
        self.assertEqual(code, 0)
        log = "\n".join(self.log)
        self.assertIn("course: /seminars/2/ shows upcoming: 1 file, 1 excluded; entry page from index.html.", log)
        self.assertIn("course: would publish 3 files at /, /seminars/2/ (differs from live)", log)
        self.assertIn("course: /seminars/2/ is scheduled for 2026-09-21 13:00 Moscow time (02, in 3d 3h).", log)
        self.log.clear()
        self.now = AFTER
        code, _ = self.run_cli(cli.run, "dry-run")
        self.assertEqual(code, 0)
        log = "\n".join(self.log)
        self.assertIn("course: /seminars/2/ shows 02: 2 files; entry page from index.html.", log)
        self.assertNotIn("upcoming", log)
        self.assertNotIn("scheduled", log)

    def test_the_build_takes_each_line_from_its_folder(self):
        bundle = release.load_bundle(self.ctx, self.commit(BUNDLE))
        for now, text in ((BEFORE, "<p>coming later</p>"), (AFTER, "<p>seminar 2</p>")):
            moment = datetime.fromtimestamp(now, MOSCOW)
            build = release.Build(self.ctx, self.site, bundle, cli.current(bundle.entries, moment, "Europe/Moscow"))
            try:
                build.assemble()
                with open(os.path.join(build.dir, "seminars", "2", "index.html"), encoding="utf-8") as f:
                    self.assertEqual(f.read(), text)
            finally:
                build.discard()

    def test_run_key_changes_with_the_line_shown(self):
        commit = self.commit(BUNDLE)
        bundle = release.load_bundle(self.ctx, commit)
        keys = []
        for now in (BEFORE, BEFORE + 60, AFTER, AFTER + 86400):
            moment = datetime.fromtimestamp(now, MOSCOW)
            shown = cli.current(bundle.entries, moment, "Europe/Moscow")
            keys.append(cli.run_key(commit, self.ctx.sites_text, shown))
        self.assertEqual(keys[0], keys[1])
        self.assertNotEqual(keys[1], keys[2])
        self.assertEqual(keys[2], keys[3])

    def live(self, paths: str, folders: str = "") -> None:
        name = "20260918T070000Z-abcdef0"
        os.makedirs(os.path.join(self.ctx.site_dir(self.site), name))
        with open(os.path.join(self.ctx.site_dir(self.site), name + ".meta"), "w", encoding="utf-8") as f:
            f.write(f"tree=x\npaths={paths}\n" + (f"folders={folders}\n" if folders else ""))
        os.symlink(os.path.join(self.ctx.site_dir(self.site), name), self.ctx.webroot(self.site))

    def schedule_rows(self):
        code, out = self.run_cli(cli.schedule)
        self.assertEqual(code, 0)
        return [line.split() for line in out.splitlines()]

    def test_schedule(self):
        self.commit(BUNDLE)
        self.live("/ /seminars/2/", "entries/root earlier/seminars--2/1")
        rows = self.schedule_rows()
        self.assertEqual(rows[0], ["site", "path", "publish", "time", "state", "title"])
        self.assertEqual(rows[1:4], [
            ["course", "/", "now", "live", "Atlas"],
            ["course", "/seminars/2/", "now", "live", "upcoming"],
            ["course", "/seminars/2/", "2026-09-21", "13:00", "in", "3d", "3h", "02"],
        ])
        self.now = AFTER
        self.assertEqual(self.schedule_rows()[2:4], [
            ["course", "/seminars/2/", "now", "replaced", "upcoming"],
            ["course", "/seminars/2/", "2026-09-21", "13:00", "due", "02"],
        ])

    def test_schedule_with_a_release_of_course_deploy_1_0(self):
        self.commit(BUNDLE)
        self.live("/")
        rows = self.schedule_rows()
        self.assertEqual(rows[1:3], [["course", "/", "now", "live", "Atlas"],
                                     ["course", "/seminars/2/", "now", "due", "upcoming"]])

    def test_a_line_added_after_the_shown_one_keeps_it_live(self):
        """The seminar line is added under the coming-later line: the site is built from the same
        files, the live release stays, and schedule still calls the coming-later line live."""
        alone = {k: v for k, v in BUNDLE.items() if not k.startswith(("earlier", "entries/seminars--2"))}
        alone.update({
            "publish.conf": PUBLISH_CONF.replace("entries/seminars--2 | 2026-09-21 13:00 | 02",
                                                 "entries/seminars--2 | now | upcoming"),
            "entries/seminars--2/index.html": "<p>coming later</p>",
        })
        with mock.patch.object(release, "live_check", return_value=None):
            self.commit(alone)
            self.assertEqual(self.run_cli(cli.run, "force")[0], 0)
            first = release.live_release(self.ctx, self.site)
            self.assertEqual(self.schedule_rows()[2], ["course", "/seminars/2/", "now", "live", "upcoming"])
            self.commit(BUNDLE)
            code, out = self.run_cli(cli.run, "force")
        self.assertEqual(code, 0)
        self.assertIn("course-deploy: OK nothing changed", out)
        self.assertEqual(release.live_release(self.ctx, self.site), first)
        meta = release.read_meta(self.ctx, self.site, first)
        self.assertEqual((meta["paths"], meta["folders"]), ("/ /seminars/2/", "entries/root earlier/seminars--2/1"))
        self.assertEqual(self.schedule_rows()[2:4], [
            ["course", "/seminars/2/", "now", "live", "upcoming"],
            ["course", "/seminars/2/", "2026-09-21", "13:00", "in", "3d", "3h", "02"],
        ])

    def test_status_lists_every_scheduled_line(self):
        draft = "course | /seminars/2/ | earlier/seminars--2/2 | 2026-09-20 10:00 | draft\n"
        self.commit(dict(BUNDLE, **{"earlier.conf": EARLIER_CONF + draft, "earlier/seminars--2/2/index.html": "d"}))
        with mock.patch.object(cli, "_systemd_timer", return_value=None):
            code, out = self.run_cli(cli.status)
        self.assertEqual(code, 0)
        self.assertIn("  scheduled      /seminars/2/ at 2026-09-20 10:00 Moscow time (draft, in 2d 0h)\n"
                      "  scheduled      /seminars/2/ at 2026-09-21 13:00 Moscow time (02, in 3d 3h)\n", out)


class QuietStreamTest(unittest.TestCase):
    def test_a_closed_reader_silences_the_stream(self):
        read_end, write_end = os.pipe()
        os.close(read_end)
        stream = os.fdopen(write_end, "w")
        self.addCleanup(stream.close)
        quiet = cli.QuietStream(stream)
        self.assertEqual(quiet.write("course: building\n"), len("course: building\n"))
        quiet.flush()
        self.assertTrue(quiet.gone)
        quiet.write("more\n")
        quiet.flush()


class NotifyDescribeTest(unittest.TestCase):
    def test_non_ascii_password_is_not_quoted(self):
        try:
            "\0robot\0abcdЖefgh".encode("ascii")
        except UnicodeEncodeError as error:
            text = notify.describe(error)
        self.assertNotIn("Ж", text)
        self.assertNotIn("position", text)
        self.assertIn("ASCII", text)


if __name__ == "__main__":
    unittest.main()
