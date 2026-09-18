# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Release helpers that need neither root nor a server: the tree hash, the bundle subject, and the
clean-up of a switch that is interrupted before its live check has passed."""

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
