# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""Deploy/publish.py helpers that need no network: folder checks, times, file collection, the bundle,
the site check in every state, the plan and the plumbing commit in a throwaway repository."""

from __future__ import annotations

import contextlib
import importlib.util
import io
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from unittest import mock

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, "..", "course-deploy-kit")
if KIT not in sys.path:
    sys.path.insert(0, KIT)

from course_deploy import filters, manifest  # noqa: E402

PUBLISH_PY = os.path.join(HERE, "..", "publish.py")
HAVE_GIT = shutil.which("git") is not None
LFS_POINTER = (b"version https://git-lfs.github.com/spec/v1\n"
               b"oid sha256:4d7a214614ab2935c943f9e0ff69d22eadbb8f32b1258daaa5e2ca24d17e2393\n"
               b"size 12345\n")


def load_publish():
    spec = importlib.util.spec_from_file_location("publish_under_test", PUBLISH_PY)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


publish = load_publish()


def write(path: str, data=b"x") -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data.encode("utf-8") if isinstance(data, str) else data)


def entry(path: str, folder: str, when: str = "now", line: int = 1) -> manifest.Entry:
    return manifest.Entry(line, "course", path, folder, when, folder.rsplit("/", 1)[-1])


class FolderProblemTest(unittest.TestCase):
    def setUp(self):
        self.repo = tempfile.mkdtemp(prefix="publish-test-")
        self.addCleanup(shutil.rmtree, self.repo, True)
        os.makedirs(os.path.join(self.repo, "Atlas"))
        os.makedirs(os.path.join(self.repo, "Seminars", "Evgeny Baulin", "web", "02. Convexity, Constraints"))
        write(os.path.join(self.repo, "README.md"))

    def test_existing_folders(self):
        self.assertIsNone(publish.folder_problem(self.repo, "Atlas"))
        self.assertIsNone(publish.folder_problem(self.repo, "Seminars/Evgeny Baulin/web/02. Convexity, Constraints"))

    def test_exact_case(self):
        self.assertEqual(publish.folder_problem(self.repo, "atlas"),
                         "does not exist (check the letter case of 'atlas')")
        self.assertEqual(publish.folder_problem(self.repo, "Seminars/evgeny baulin/web"),
                         "does not exist (check the letter case of 'evgeny baulin')")
        self.assertEqual(publish.folder_problem(self.repo, "ATLAS"),
                         "does not exist (check the letter case of 'ATLAS')")

    def test_missing(self):
        self.assertEqual(publish.folder_problem(self.repo, "Missing"), "does not exist")
        self.assertEqual(publish.folder_problem(self.repo, "Seminars/Nobody"), "does not exist")
        self.assertEqual(publish.folder_problem(self.repo, "README.md/x"), "does not exist")

    def test_a_single_file_is_allowed(self):
        self.assertIsNone(publish.folder_problem(self.repo, "README.md"))

    def test_neither_folder_nor_file(self):
        os.mkfifo(os.path.join(self.repo, "pipe"))
        self.assertEqual(publish.folder_problem(self.repo, "pipe"), "is neither a folder nor a file")

    def test_symlink(self):
        os.symlink("Atlas", os.path.join(self.repo, "Link"))
        self.assertEqual(publish.folder_problem(self.repo, "Link"), "is a symlink")
        os.symlink(os.path.join("..", "Atlas"), os.path.join(self.repo, "Seminars", "atlas-link"))
        self.assertEqual(publish.folder_problem(self.repo, "Seminars/atlas-link"), "is a symlink")


class WhenTextTest(unittest.TestCase):
    NOW = datetime(2026, 9, 18, 7, 0, tzinfo=timezone.utc)  # 10:00 in Moscow

    def test_now(self):
        self.assertEqual(publish.when_text(entry("/", "Atlas"), self.NOW), "now")

    def test_past_and_present(self):
        self.assertEqual(publish.when_text(entry("/s/", "S", "2026-09-18 10:00"), self.NOW), "2026-09-18 10:00 (now)")
        self.assertEqual(publish.when_text(entry("/s/", "S", "2026-01-01 00:00"), self.NOW), "2026-01-01 00:00 (now)")

    def test_future(self):
        self.assertEqual(publish.when_text(entry("/s/", "S", "2026-09-20 15:00"), self.NOW),
                         "2026-09-20 15:00 (in 2d 5h)")
        self.assertEqual(publish.when_text(entry("/s/", "S", "2026-09-18 13:10"), self.NOW),
                         "2026-09-18 13:10 (in 3h 10m)")
        self.assertEqual(publish.when_text(entry("/s/", "S", "2026-09-18 10:07"), self.NOW),
                         "2026-09-18 10:07 (in 7m)")
        self.assertEqual(publish.when_text(entry("/s/", "S", "2026-09-18 10:01"), self.NOW),
                         "2026-09-18 10:01 (in 1m)")


class SmallHelpersTest(unittest.TestCase):
    def test_pathspec_is_literal(self):
        self.assertEqual(publish.pathspec("Seminars/Evgeny Baulin/web/0*"), ":(literal)Seminars/Evgeny Baulin/web/0*/")

    def test_listed(self):
        paths = [f"p{i}" for i in range(25)]
        lines = publish.listed(paths)
        self.assertEqual(len(lines), 21)
        self.assertEqual(lines[0], "  p0")
        self.assertEqual(lines[-1], "  ... and 5 more")
        self.assertEqual(publish.listed(paths[:20]), [f"  p{i}" for i in range(20)])

    def test_nul_split(self):
        self.assertEqual(publish.nul_split(b"a\0b c\0\0"), [b"a", b"b c"])

    def test_git_env_drops_repository_overrides(self):
        with mock.patch.dict(os.environ, {"GIT_DIR": "/x", "GIT_INDEX_FILE": "/y", "GIT_WORK_TREE": "/z"}):
            env = publish.git_env({"A": "1"})
        self.assertNotIn("GIT_DIR", env)
        self.assertNotIn("GIT_INDEX_FILE", env)
        self.assertNotIn("GIT_WORK_TREE", env)
        self.assertEqual(env["A"], "1")
        self.assertEqual(env["GIT_OPTIONAL_LOCKS"], "0")

    def test_constants(self):
        self.assertEqual(publish.REMOTE_HINT.splitlines(), [
            "git remote add deploy deploy@Main_server:/srv/course-deploy/site.git",
            '  git config core.sshCommand "ssh -i ~/.ssh/course_deploy -o IdentitiesOnly=yes"'])
        self.assertEqual(publish.SERVER_REF, "refs/heads/site")
        self.assertEqual(publish.LOCAL_REF, "refs/course-deploy/site")
        self.assertEqual(publish.DEFAULT_REMOTE, "deploy")


class ParseArgsTest(unittest.TestCase):
    def test_defaults_and_options(self):
        args = publish.parse_args([])
        self.assertEqual((args.dry_run, args.allow_dirty, args.remote), (False, False, "deploy"))
        args = publish.parse_args(["--dry-run", "--allow-dirty", "--remote", "test"])
        self.assertEqual((args.dry_run, args.allow_dirty, args.remote), (True, True, "test"))

    def test_usage_error_exits_2(self):
        for argv in (["--bogus"], ["extra"], ["--remote"]):
            with self.subTest(argv=argv):
                with contextlib.redirect_stderr(io.StringIO()):
                    with self.assertRaises(SystemExit) as caught:
                        publish.parse_args(argv)
                self.assertEqual(caught.exception.code, 2)

    def test_help_and_version(self):
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            with self.assertRaises(SystemExit) as caught:
                publish.parse_args(["--version"])
        self.assertEqual(caught.exception.code, 0)
        self.assertIn("publish.py", out.getvalue())
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            with self.assertRaises(SystemExit) as caught:
                publish.parse_args(["--help"])
        self.assertEqual(caught.exception.code, 0)
        for option in ("--dry-run", "--allow-dirty", "--remote", "--version"):
            self.assertIn(option, out.getvalue())


class CheckSiteTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="publish-test-")
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.bundle = os.path.join(self.tmp, "bundle")
        self.rules = filters.Rules.with_builtin("*.md\n")

    def plan(self, path: str, folder: str, files) -> "publish.Plan":
        plan = publish.Plan(entry(path, folder))
        for rel, data in files.items():
            write(os.path.join(self.bundle, "entries", plan.entry.slug, *rel.split("/")), data)
        plan.files = sorted(files)
        return plan

    def test_warnings_and_entry_pages(self):
        plans = [
            self.plan("/", "Atlas", {"index.html": '<a href="gone.html">x</a><a href="seminars/02/">s</a>'}),
            self.plan("/seminars/02/", "Web/02", {"main.html": '<script src="../shared/app.js"></script>'}),
            self.plan("/seminars/shared/", "Web/shared", {"app.js": "1"}),
        ]
        warnings = publish.check_site(self.bundle, os.path.join(self.tmp, "site"), plans, self.rules)
        self.assertEqual(warnings, ["course: warning broken link: /index.html -> gone.html (no such file)"])
        self.assertEqual([p.page for p in plans], ["index.html", "main.html", "file listing"])

    def test_missing_asset_refuses(self):
        plans = [self.plan("/seminars/02/", "Web/02", {"main.html": '<script src="../shared/app.js"></script>'})]
        with self.assertRaises(publish.Refusal) as caught:
            publish.check_site(self.bundle, os.path.join(self.tmp, "site"), plans, self.rules)
        message = str(caught.exception)
        self.assertTrue(message.startswith("Refusing to publish: pages refer to files that are not in the bundle:"))
        self.assertIn("course: ERROR missing file: /seminars/02/main.html -> ../shared/app.js (no such file)",
                      message)
        # the index.html copied from main.html is not reported a second time
        self.assertNotIn("/seminars/02/index.html ->", message)

    def test_collision_refuses(self):
        plans = [
            self.plan("/", "Atlas", {"index.html": "A", "seminars/02/x.html": "x"}),
            self.plan("/seminars/02/", "Web/02", {"main.html": "M"}),
        ]
        with self.assertRaises(publish.Refusal) as caught:
            publish.check_site(self.bundle, os.path.join(self.tmp, "site"), plans, self.rules)
        self.assertIn("/seminars/02/", str(caught.exception))
        self.assertTrue(str(caught.exception).startswith("Refusing to publish: "))

    def test_stage_bundle(self):
        repo = os.path.join(self.tmp, "repo")
        write(os.path.join(repo, "Atlas", "index.html"), "A")
        write(os.path.join(repo, "Web", "02. Convexity, Constraints", "main.html"), "M")
        write(os.path.join(repo, "Web", "02. Convexity, Constraints", "fig", "a b.svg"), "<svg/>")
        root = publish.Plan(entry("/", "Atlas"))
        root.files = ["index.html"]
        seminar = publish.Plan(entry("/seminars/02/", "Web/02. Convexity, Constraints", "2026-09-20 12:00"))
        seminar.files = ["fig/a b.svg", "main.html"]
        publish.stage_bundle(repo, self.bundle, [root, seminar], "*.md\n", "commit: abc\n")
        found = []
        for top, dirs, names in os.walk(self.bundle):
            for name in names:
                found.append(os.path.relpath(os.path.join(top, name), self.bundle).replace(os.sep, "/"))
        self.assertEqual(sorted(found), ["entries/root/index.html", "entries/seminars--02/fig/a b.svg",
                                         "entries/seminars--02/main.html", "exclude.txt", "publish.conf",
                                         "source.txt"])
        with open(os.path.join(self.bundle, "publish.conf"), encoding="utf-8") as f:
            entries = manifest.parse_manifest(f.read(), bundle=True, known_sites=["course"])
        self.assertEqual([(e.path, e.folder, e.when, e.title) for e in entries], [
            ("/", "entries/root", "now", "Atlas"),
            ("/seminars/02/", "entries/seminars--02", "2026-09-20 12:00", "02. Convexity, Constraints"),
        ])
        with open(os.path.join(self.bundle, "exclude.txt"), encoding="utf-8") as f:
            self.assertEqual(f.read(), "*.md\n")
        self.assertFalse(os.path.exists(os.path.join(self.bundle, "earlier.conf")))


NOW = datetime(2026, 9, 18, 7, 0, tzinfo=timezone.utc)  # 10:00 in Moscow


class StatesTest(unittest.TestCase):
    """A path listed on several lines: the bundle, the states of the site and the plan."""

    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="publish-test-")
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.bundle = os.path.join(self.tmp, "bundle")
        self.rules = filters.Rules.with_builtin("*.md\n")
        self.n = 0

    def plans(self, lines):
        """lines: (path, folder, when, files); files go to the bundle folder of the line."""
        entries = [entry(path, folder, when, line=i) for i, (path, folder, when, _) in enumerate(lines, 1)]
        folders = manifest.bundle_folders(entries, publish.TIMEZONE)
        plans = []
        for e, (_, _, _, files) in zip(entries, lines):
            plan = publish.Plan(e, folders[e])
            for rel, data in files.items():
                write(os.path.join(self.bundle, *plan.bundle_folder.split("/"), *rel.split("/")), data)
            plan.files = sorted(files)
            plans.append(plan)
        return plans

    def check(self, plans):
        self.n += 1
        states = publish.site_states(plans, NOW)
        return publish.check_site(self.bundle, os.path.join(self.tmp, f"site{self.n}"), plans, self.rules, states)

    def seminar_lines(self, later_page='<script src="../shared/app.js"></script>'):
        return [
            ("/", "Atlas", "now", {"index.html": '<a href="seminars/2/">2</a>'}),
            ("/seminars/2/", "Web/upcoming", "now", {"index.html": '<script src="../shared/app.js"></script>'}),
            ("/seminars/2/", "Web/02", "2026-09-21 13:00", {"index.html": later_page, "theory/index.html": "t"}),
            ("/seminars/3/", "Web/upcoming", "now", {"index.html": '<script src="../shared/app.js"></script>'}),
            ("/seminars/shared/", "Web/shared", "now", {"app.js": "1"}),
        ]

    def test_site_states(self):
        plans = self.plans(self.seminar_lines() + [
            ("/seminars/4/", "Web/04", "2026-10-01 18:10", {"index.html": "4"}),
            ("/seminars/1/", "Web/01", "2026-09-11 19:30", {"index.html": "1"}),
        ])
        states = publish.site_states(plans, NOW)
        self.assertEqual([label for label, _ in states], ["now", "2026-09-21 13:00", "2026-10-01 18:10"])
        shown = [sorted((p.entry.path, p.entry.folder) for p in state) for _, state in states]
        self.assertIn(("/seminars/2/", "Web/upcoming"), shown[0])
        self.assertIn(("/seminars/1/", "Web/01"), shown[0])
        self.assertNotIn("/seminars/4/", [path for path, _ in shown[0]])
        self.assertIn(("/seminars/2/", "Web/02"), shown[1])
        self.assertNotIn(("/seminars/2/", "Web/upcoming"), shown[1])
        self.assertIn(("/seminars/4/", "Web/04"), shown[2])
        self.assertEqual(len(shown[2]), 6)

    def test_one_state_without_future_times(self):
        plans = self.plans([("/", "Atlas", "now", {"index.html": "A"}),
                            ("/s/", "S", "2026-01-01 10:00", {"index.html": "S"})])
        self.assertEqual([label for label, _ in publish.site_states(plans, NOW)], ["now"])

    def test_every_state_is_checked(self):
        plans = self.plans(self.seminar_lines())
        self.assertEqual(self.check(plans), [])
        self.assertEqual([p.page for p in plans], ["index.html"] * 4 + ["file listing"])

    def test_missing_asset_in_a_later_state_refuses(self):
        plans = self.plans(self.seminar_lines('<script src="../shared/app.js"></script><img src="fig/a.svg">'))
        with self.assertRaises(publish.Refusal) as caught:
            self.check(plans)
        message = str(caught.exception)
        self.assertIn("course from 2026-09-21 13:00: ERROR missing file: /seminars/2/index.html -> fig/a.svg "
                      "(no such file)", message)
        self.assertNotIn("course: ERROR", message)

    def test_missing_asset_now_is_labelled_plainly(self):
        lines = self.seminar_lines()
        lines[4] = ("/seminars/shared/", "Web/shared", "2026-09-21 13:00", {"app.js": "1"})
        with self.assertRaises(publish.Refusal) as caught:
            self.check(self.plans(lines))
        message = str(caught.exception)
        self.assertIn("course: ERROR missing file: /seminars/2/index.html -> ../shared/app.js (no such file)",
                      message)
        self.assertIn("course: ERROR missing file: /seminars/3/index.html -> ../shared/app.js", message)
        # the same problem is not repeated for the later state
        self.assertNotIn("course from", message)

    def test_a_warning_of_several_states_is_listed_once(self):
        lines = self.seminar_lines()
        lines[0] = ("/", "Atlas", "now", {"index.html": '<a href="gone.html">x</a>'})
        warnings = self.check(self.plans(lines))
        self.assertEqual(warnings, ["course: warning broken link: /index.html -> gone.html (no such file)"])

    def test_a_line_replaced_before_now_is_not_checked(self):
        plans = self.plans([
            ("/", "Atlas", "now", {"index.html": "A"}),
            ("/s/", "Old", "now", {"index.html": '<script src="gone.js"></script>'}),
            ("/s/", "New", "2026-09-01 10:00", {"index.html": "N"}),
        ])
        self.assertEqual(self.check(plans), [])
        self.assertEqual(plans[1].page, "index.html")

    def test_stage_bundle(self):
        repo = os.path.join(self.tmp, "repo")
        for folder in ("Atlas", "Web/upcoming", "Web/02"):
            write(os.path.join(repo, *folder.split("/"), "index.html"), folder)
        entries = [entry("/", "Atlas"), entry("/seminars/3/", "Web/upcoming", line=2),
                   entry("/seminars/2/", "Web/02", "2026-09-21 13:00", line=3),
                   entry("/seminars/2/", "Web/upcoming", line=4)]
        folders = manifest.bundle_folders(entries, publish.TIMEZONE)
        plans = []
        for e in entries:
            plan = publish.Plan(e, folders[e])
            plan.files = ["index.html"]
            plans.append(plan)
        publish.stage_bundle(repo, self.bundle, plans, "", "commit: abc\n")
        found = []
        for top, dirs, names in os.walk(self.bundle):
            for name in names:
                found.append(os.path.relpath(os.path.join(top, name), self.bundle).replace(os.sep, "/"))
        self.assertEqual(sorted(found), [
            "earlier.conf", "earlier/seminars--2/1/index.html", "entries/root/index.html",
            "entries/seminars--2/index.html", "entries/seminars--3/index.html", "exclude.txt", "publish.conf",
            "source.txt"])
        with open(os.path.join(self.bundle, "earlier", "seminars--2", "1", "index.html"), encoding="utf-8") as f:
            self.assertEqual(f.read(), "Web/upcoming")
        with open(os.path.join(self.bundle, "publish.conf"), encoding="utf-8") as f:
            latest = manifest.parse_manifest(f.read(), bundle=True, known_sites=["course"])
        self.assertEqual([(e.path, e.folder, e.when, e.title) for e in latest], [
            ("/", "entries/root", "now", "Atlas"),
            ("/seminars/3/", "entries/seminars--3", "now", "upcoming"),
            ("/seminars/2/", "entries/seminars--2", "2026-09-21 13:00", "02"),
        ])
        with open(os.path.join(self.bundle, "earlier.conf"), encoding="utf-8") as f:
            earlier = manifest.parse_earlier(f.read(), latest, known_sites=["course"])
        self.assertEqual([(e.path, e.folder, e.when, e.title) for e in earlier], [
            ("/seminars/2/", "earlier/seminars--2/1", "now", "upcoming")])

    def test_print_plan(self):
        plans = self.plans([
            ("/seminars/10/", "Web/upcoming", "now", {"index.html": "U"}),
            ("/seminars/2/", "Web/02", "2026-09-21 13:00", {"index.html": "2", "a.js": "1"}),
            ("/", "Atlas", "now", {"index.html": "A"}),
            ("/seminars/2/", "Web/upcoming", "now", {"index.html": "U"}),
            ("/seminars/1/", "Web/upcoming", "now", {"index.html": "U"}),
            ("/seminars/1/", "Web/01", "2026-09-11 19:30", {"index.html": "1"}),
        ])
        states = publish.site_states(plans, NOW)
        self.check(plans)
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            publish.print_plan(plans, [], "abc1234def", "Subject", False, NOW, states)
        self.assertEqual(out.getvalue().splitlines(), [
            "Source: abc1234 (dirty: no) Subject",
            "Publish times are Europe/Moscow time.",
            "",
            "course  /              Atlas",
            "    now, 1 file, entry page: index.html",
            "course  /seminars/1/   Web/upcoming",
            "    now, until 2026-09-11 19:30 (already replaced), 1 file, entry page: index.html",
            "course  /seminars/1/   Web/01",
            "    2026-09-11 19:30 (now), 1 file, entry page: index.html",
            "course  /seminars/2/   Web/upcoming",
            "    now, until 2026-09-21 13:00, 1 file, entry page: index.html",
            "course  /seminars/2/   Web/02",
            "    2026-09-21 13:00 (in 3d 3h), 2 files, entry page: index.html",
            "course  /seminars/10/  Web/upcoming",
            "    now, 1 file, entry page: index.html",
            "",
            "Links checked for the site now and from 2026-09-21 13:00.",
            "Link warnings: none.",
        ])


class GitCase(unittest.TestCase):
    """A throwaway repository, isolated from the user's and the system's git configuration."""

    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="publish-git-test-")
        self.addCleanup(shutil.rmtree, self.tmp, True)
        home = os.path.join(self.tmp, "home")
        os.makedirs(os.path.join(home, "xdg"))
        empty = os.path.join(home, "gitconfig")
        write(empty, b"")
        env = {"HOME": home, "XDG_CONFIG_HOME": os.path.join(home, "xdg"), "GIT_CONFIG_GLOBAL": empty,
               "GIT_CONFIG_NOSYSTEM": "1", "GIT_TERMINAL_PROMPT": "0"}
        patcher = mock.patch.dict(os.environ, env)
        patcher.start()
        self.addCleanup(patcher.stop)
        for key in ("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY"):
            os.environ.pop(key, None)
        self.repo = os.path.join(self.tmp, "repo")
        os.makedirs(self.repo)
        self.git("init", "-q")
        self.git("config", "user.name", "Test User")
        self.git("config", "user.email", "test@example.org")
        self.git("config", "commit.gpgsign", "false")
        self.git("config", "core.autocrlf", "false")

    def git(self, *args: str, input=None) -> bytes:
        result = subprocess.run(["git", *args], cwd=self.repo, input=input, stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE)
        if result.returncode != 0:
            self.fail(f"git {' '.join(args)}: {result.stderr.decode()}")
        return result.stdout

    def put(self, rel: str, data=b"x") -> None:
        write(os.path.join(self.repo, *rel.split("/")), data)

    def commit(self, message: str = "commit") -> None:
        self.git("add", "-A")
        self.git("commit", "-q", "-m", message)


@unittest.skipUnless(HAVE_GIT, "git is not installed")
class BuildTreeTest(GitCase):
    def setUp(self):
        super().setUp()
        self.put(".gitignore", "*.log\nDocuments/\n")
        self.put(".gitattributes", "*.txt text\n*.svg filter=lfs diff=lfs merge=lfs -text\n")
        self.put("Atlas/index.html", "atlas")
        self.put("README.md", "readme")
        self.commit("Initial")
        self.git("branch", "other")
        # a dirty working tree and a staged change, both of which must survive
        self.put("Atlas/index.html", "changed")
        self.put("untracked.txt", "u")
        self.put("staged.txt", "s")
        self.git("add", "staged.txt")
        self.put("Documents/plan.log", "ignored")

    def bundle(self, name: str, files) -> str:
        root = os.path.join(self.tmp, name)
        for rel, data in files.items():
            write(os.path.join(root, *rel.split("/")), data)
        return root

    def scratch(self) -> str:
        path = tempfile.mkdtemp(prefix="scratch-", dir=self.tmp)
        return path

    def snapshot(self):
        gitdir = os.path.join(self.repo, ".git")
        with open(os.path.join(gitdir, "index"), "rb") as f:
            index = f.read()
        with open(os.path.join(gitdir, "HEAD"), "rb") as f:
            head_file = f.read()
        return index, head_file

    def state(self):
        return (self.git("rev-parse", "HEAD"), self.git("branch", "--list"), self.git("for-each-ref"),
                self.git("status", "--porcelain=v1", "-z", "--untracked-files=all", "--ignored"),
                self.git("ls-files", "-s"), self.git("stash", "list"), self.worktree())

    def worktree(self):
        found = []
        for top, dirs, names in os.walk(self.repo):
            if ".git" in dirs:
                dirs.remove(".git")
            for name in names:
                path = os.path.join(top, name)
                with open(path, "rb") as f:
                    found.append((os.path.relpath(path, self.repo), f.read()))
        return sorted(found)

    def tree_files(self, tree: str):
        out = {}
        for record in self.git("ls-tree", "-r", "-z", tree).split(b"\0"):
            if not record:
                continue
            meta, _, path = record.partition(b"\t")
            mode, kind, sha = meta.decode().split()
            out[path.decode("utf-8")] = (mode, kind, self.git("cat-file", "blob", sha))
        return out

    def test_leaves_index_worktree_head_and_branches_untouched(self):
        files = {
            "publish.conf": "course | / | entries/root | now | Atlas\n",
            "exclude.txt": "*.md\n",
            "source.txt": "commit: abc\n",
            "entries/root/index.html": "<p>site</p>",
            "entries/root/crlf.txt": b"a\r\nb\r\n",
            "entries/root/figure.svg": b"<svg>\r\n</svg>",
            "entries/root/debug.log": "ignored by the repository, published anyway",
            "entries/root/-dash.txt": "leading dash",
            "entries/seminars--02/a b, c.txt": "spaces and commas",
            "entries/seminars--02/тест.txt": "cyrillic",
        }
        for i in range(publish.HASH_CHUNK + 5):
            files[f"entries/many/f{i:03d}.js"] = f"// {i}\n"
        bundle = self.bundle("bundle", files)
        before_state = self.state()
        before_files = self.snapshot()
        scratch = self.scratch()

        tree = publish.build_tree(self.repo, bundle, scratch)

        self.assertEqual(self.snapshot(), before_files, "the real index or HEAD file changed")
        self.assertEqual(self.state(), before_state)
        self.assertRegex(tree, r"\A[0-9a-f]{40}([0-9a-f]{24})?\Z")
        self.assertTrue(os.path.exists(os.path.join(scratch, "index")), "the temporary index is not in scratch")
        stored = self.tree_files(tree)
        self.assertEqual(sorted(stored), sorted(files))
        for path, data in files.items():
            mode, kind, blob = stored[path]
            self.assertEqual((mode, kind), ("100644", "blob"), path)
            self.assertEqual(blob, data if isinstance(data, bytes) else data.encode("utf-8"), path)

    def test_executable_files_are_stored_as_100644(self):
        bundle = self.bundle("bundle", {"publish.conf": "x", "entries/root/run.sh": "#!/bin/sh\n"})
        os.chmod(os.path.join(bundle, "entries", "root", "run.sh"), 0o755)
        tree = publish.build_tree(self.repo, bundle, self.scratch())
        self.assertEqual(self.tree_files(tree)["entries/root/run.sh"][0], "100644")

    def test_comparable_ignores_source_txt(self):
        common = {"publish.conf": "course | / | entries/root | now | Atlas\n", "exclude.txt": "*.md\n",
                  "entries/root/index.html": "<p>site</p>"}
        a = self.bundle("a", dict(common, **{"source.txt": "commit: abc\nbuilt: 2026-09-18T10:00:00Z\n"}))
        b = self.bundle("b", dict(common, **{"source.txt": "commit: abc\nbuilt: 2026-09-18T11:30:00Z\n"}))
        c = self.bundle("c", dict(common, **{"source.txt": "commit: abc\nbuilt: 2026-09-18T10:00:00Z\n",
                                              "entries/root/index.html": "<p>changed</p>"}))
        d = self.bundle("d", dict(common, **{"source.txt": "commit: abc\n", "exclude.txt": "*.md\n*.pdf\n"}))
        ta, tb, tc, td = (publish.build_tree(self.repo, x, self.scratch()) for x in (a, b, c, d))
        self.assertNotEqual(ta, tb)
        self.assertEqual(publish.comparable(self.repo, ta), publish.comparable(self.repo, tb))
        self.assertNotEqual(publish.comparable(self.repo, ta), publish.comparable(self.repo, tc))
        self.assertNotEqual(publish.comparable(self.repo, ta), publish.comparable(self.repo, td))
        names = [r.split(b"\t", 1)[1] for r in publish.comparable(self.repo, ta)]
        self.assertEqual(names, [b"entries", b"exclude.txt", b"publish.conf"])

    def test_comparable_works_on_a_commit_tree(self):
        refs = self.git("for-each-ref")
        bundle = self.bundle("bundle", {"publish.conf": "x", "source.txt": "1", "entries/root/a.html": "a"})
        tree = publish.build_tree(self.repo, bundle, self.scratch())
        commit = self.git("commit-tree", tree, "-m", "Site build").decode().strip()
        self.assertEqual(publish.comparable(self.repo, f"{commit}^{{tree}}"), publish.comparable(self.repo, tree))
        self.assertEqual(self.git("for-each-ref"), refs)


@unittest.skipUnless(HAVE_GIT, "git is not installed")
class CollectTest(GitCase):
    FOLDER = "Seminars/Evgeny Baulin/web/02. Convexity, Constraints"

    def setUp(self):
        super().setUp()
        self.put(".gitignore", "*.log\n")
        self.put("Atlas/index.html", "atlas")
        self.put("Atlas/README.md", "readme")
        self.put("Atlas/LICENSE.md", "MIT")
        self.put(f"{self.FOLDER}/main.html", "main")
        self.put(f"{self.FOLDER}/Theory_en.tex", "tex")
        self.put(f"{self.FOLDER}/figures/a b.svg", "<svg/>")
        self.put("Lecture/slides.html", "never")
        self.commit("Initial")
        self.rules = filters.Rules.with_builtin("*.md\n*.tex\n")

    def collect(self, entries, allow_dirty=False):
        with open(os.path.join(KIT, "forbidden.txt"), encoding="utf-8") as f:
            forbidden = filters.parse_patterns(f.read())
        return publish.collect(self.repo, entries, self.rules, forbidden, allow_dirty)

    def test_clean_folders(self):
        plans, dirty = self.collect([entry("/", "Atlas"), entry("/seminars/02/", self.FOLDER)])
        self.assertFalse(dirty)
        self.assertEqual(plans[0].files, ["LICENSE.md", "index.html"])
        self.assertEqual(plans[0].excluded, ["README.md"])
        self.assertEqual(plans[1].files, ["figures/a b.svg", "main.html"])
        self.assertEqual(plans[1].excluded, ["Theory_en.tex"])

    def test_dirty_folder_refused(self):
        self.put("Atlas/index.html", "changed")
        self.put("Atlas/new.js", "new")
        self.put("Atlas/debug.log", "ignored")
        self.put("Lecture/other.html", "not published")
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/", "Atlas")])
        lines = str(caught.exception).splitlines()
        self.assertEqual(lines[0], "Refusing to publish: uncommitted changes in published folders:")
        self.assertEqual(lines[1:3], ["  Atlas/index.html", "  Atlas/new.js"])
        self.assertIn("git commit", lines[3])
        self.assertIn("--allow-dirty", lines[3])
        self.assertEqual(len(lines), 4)

    def test_staged_and_deleted_files_count_as_dirty(self):
        self.put("Atlas/staged.js", "s")
        self.git("add", "Atlas/staged.js")
        os.unlink(os.path.join(self.repo, "Atlas", "README.md"))
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/", "Atlas")])
        self.assertIn("  Atlas/staged.js", str(caught.exception))
        self.assertIn("  Atlas/README.md", str(caught.exception))

    def test_at_most_twenty_paths_listed(self):
        for i in range(25):
            self.put(f"Atlas/new{i:02d}.js", "n")
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/", "Atlas")])
        lines = str(caught.exception).splitlines()
        self.assertEqual(len([l for l in lines if l.startswith("  Atlas/")]), 20)
        self.assertIn("  ... and 5 more", lines)

    def test_allow_dirty(self):
        self.put("Atlas/index.html", "changed")
        self.put("Atlas/new.js", "new")
        self.put("Atlas/debug.log", "ignored")
        self.put("Atlas/sub/other.log", "ignored")
        plans, dirty = self.collect([entry("/", "Atlas")], allow_dirty=True)
        self.assertTrue(dirty)
        self.assertEqual(plans[0].files, ["LICENSE.md", "index.html", "new.js"])

    def test_forbidden_name_in_another_case_refused(self):
        # exclude.txt misses Notes.TEX (case-sensitive), pre-receive would reject it: refuse before the push
        self.put("Atlas/Notes.TEX", "tex")
        self.commit("Upper-case TeX")
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/", "Atlas")])
        self.assertIn("  Atlas/Notes.TEX matches *.tex of the server's forbidden.txt", str(caught.exception))

    def test_folder_with_spaces_and_commas_dirty_paths(self):
        self.put(f"{self.FOLDER}/new file, 2.js", "n")
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/seminars/02/", self.FOLDER)])
        self.assertIn(f"  {self.FOLDER}/new file, 2.js", str(caught.exception).splitlines())

    def test_other_folders_do_not_count(self):
        self.put("Lecture/new.html", "x")
        self.put("Atlas2/x.html", "x")
        plans, dirty = self.collect([entry("/", "Atlas")])
        self.assertFalse(dirty)

    def test_missing_folder(self):
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/x/", "Missing", line=7)])
        self.assertIn("Missing (line 7) does not exist", str(caught.exception))

    def test_wrong_case_folder(self):
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/", "atlas", line=3)])
        self.assertIn("atlas (line 3) does not exist (check the letter case of 'atlas')", str(caught.exception))

    def test_single_file_entry(self):
        # the landing page sits next to the seminar folders: its line names the file alone
        self.put("Seminars/Evgeny Baulin/web/index.html", "landing")
        self.put("Seminars/Evgeny Baulin/web/02/main.html", "not released yet")
        self.commit("Landing page")
        (plan,), dirty = self.collect([entry("/seminars/", "Seminars/Evgeny Baulin/web/index.html")])
        self.assertFalse(dirty)
        self.assertEqual(plan.files, ["index.html"])
        self.assertEqual(plan.base, "Seminars/Evgeny Baulin/web")
        bundle = os.path.join(self.tmp, "bundle")
        publish.stage_bundle(self.repo, bundle, [plan], "", "commit: x\n")
        self.assertEqual(sorted(os.listdir(os.path.join(bundle, "entries", "seminars"))), ["index.html"])

    def test_single_file_entry_dirty(self):
        self.put("Seminars/Evgeny Baulin/web/index.html", "landing")
        self.commit("Landing page")
        self.put("Seminars/Evgeny Baulin/web/index.html", "changed")
        self.put("Seminars/Evgeny Baulin/web/other.html", "untracked, not part of the entry")
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/seminars/", "Seminars/Evgeny Baulin/web/index.html")])
        self.assertIn("  Seminars/Evgeny Baulin/web/index.html", str(caught.exception))
        self.assertNotIn("other.html", str(caught.exception))

    def test_folder_name_in_nfd_on_disk(self):
        # the Finder writes decomposed names; publish.conf and git use the composed form
        import unicodedata
        nfd = unicodedata.normalize("NFD", "Семинар й")
        self.put(f"{nfd}/index.html", "i")
        self.commit("NFD folder")
        self.assertIsNone(publish.folder_problem(self.repo, unicodedata.normalize("NFC", "Семинар й")))

    def test_path_through_a_file_is_dirty_not_a_crash(self):
        self.put("Atlas/js/a.js", "a")
        self.commit("js")
        shutil.rmtree(os.path.join(self.repo, "Atlas", "js"))
        self.put("Atlas/js", "now a file")
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/", "Atlas")])
        self.assertIn("Refusing to publish: uncommitted changes in published folders:", str(caught.exception))
        self.assertIn("  Atlas/js/a.js", str(caught.exception))

    def test_nothing_left_after_excludes(self):
        self.put("Notes/a.md", "n")
        self.put("Notes/b.tex", "t")
        self.commit("notes")
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/notes/", "Notes", line=4)])
        self.assertIn("Notes (line 4) has no files left after Deploy/exclude.txt", str(caught.exception))

    def test_untracked_folder_has_no_committed_files(self):
        self.put("Fresh/a.html", "a")
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/fresh/", "Fresh")], allow_dirty=False)
        self.assertIn("uncommitted changes", str(caught.exception))
        os.unlink(os.path.join(self.repo, "Fresh", "a.html"))
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/fresh/", "Fresh")])
        self.assertIn("has no files committed to git", str(caught.exception))

    def test_committed_symlink_refused(self):
        os.symlink("index.html", os.path.join(self.repo, "Atlas", "link.html"))
        self.commit("symlink")
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/", "Atlas")])
        self.assertIn("Atlas/link.html is a symlink", str(caught.exception))

    def test_untracked_symlink_refused_with_allow_dirty(self):
        os.symlink("/etc/hosts", os.path.join(self.repo, "Atlas", "hosts"))
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/", "Atlas")], allow_dirty=True)
        self.assertIn("Atlas/hosts is a symlink", str(caught.exception))

    def test_lfs_pointer_refused(self):
        self.put("Atlas/figure.svg", LFS_POINTER)
        self.commit("pointer")
        with self.assertRaises(publish.Refusal) as caught:
            self.collect([entry("/", "Atlas")])
        self.assertIn("Atlas/figure.svg is a Git LFS pointer", str(caught.exception))

    def test_excluded_lfs_pointer_is_fine(self):
        self.put("Atlas/notes.md", LFS_POINTER)
        self.commit("pointer")
        plans, _ = self.collect([entry("/", "Atlas")])
        self.assertNotIn("notes.md", plans[0].files)

    def test_one_folder_on_several_lines(self):
        self.put("Web/upcoming/index.html", "soon")
        self.put("Web/upcoming/pointer.svg", LFS_POINTER)
        self.commit("Coming later")
        entries = [entry("/s/2/", "Web/upcoming", line=1), entry("/s/2/", "Atlas", "2026-09-21 13:00", line=2),
                   entry("/s/3/", "Web/upcoming", line=3)]
        with self.assertRaises(publish.Refusal) as caught:
            self.collect(entries)
        self.assertEqual(str(caught.exception).count("pointer.svg is a Git LFS pointer"), 1)
        os.unlink(os.path.join(self.repo, "Web", "upcoming", "pointer.svg"))
        self.commit("No pointer")
        plans, _ = self.collect(entries)
        self.assertEqual([(p.entry.line, p.bundle_folder, p.files) for p in plans], [
            (1, "earlier/s--2/1", ["index.html"]), (2, "entries/s--2", ["LICENSE.md", "index.html"]),
            (3, "entries/s--3", ["index.html"])])

    def test_collect_does_not_write_to_git(self):
        self.put("Atlas/new.js", "new")
        index = os.path.join(self.repo, ".git", "index")
        with open(index, "rb") as f:
            before = f.read()
        refs = self.git("for-each-ref")
        self.collect([entry("/", "Atlas")], allow_dirty=True)
        with open(index, "rb") as f:
            self.assertEqual(f.read(), before)
        self.assertEqual(self.git("for-each-ref"), refs)


if __name__ == "__main__":
    unittest.main()
