# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""course-deploy.conf parsing and the course-deploy command line."""

from __future__ import annotations

import io
import os
import sys
import unittest
from unittest import mock

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, "..", "course-deploy-kit")
if KIT not in sys.path:
    sys.path.insert(0, KIT)

from course_deploy import __version__, cli  # noqa: E402
from course_deploy.cli import ConfigError, UsageError, parse_args, parse_config  # noqa: E402

DEFAULTS = {
    "SMTP_HOST": "",
    "SMTP_PORT": "465",
    "SMTP_USER": "",
    "SMTP_PASSWORD": "",
    "MAIL_TO": "",
    "KEEP_RELEASES": "5",
    "RETRY_AFTER": "900",
    "TIMEZONE": "Europe/Moscow",
    "DATA_DIR": "/srv/course-deploy",
}


def read(path: str) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()


class ParseConfigTest(unittest.TestCase):
    def test_shipped_template_gives_the_defaults(self):
        self.assertEqual(parse_config(read(os.path.join(KIT, "course-deploy.conf"))), DEFAULTS)

    def test_template_lists_every_key(self):
        text = read(os.path.join(KIT, "course-deploy.conf"))
        for key in DEFAULTS:
            self.assertIn(f"{key}=", text)

    def test_empty_file_gives_the_defaults(self):
        self.assertEqual(parse_config(""), DEFAULTS)
        self.assertEqual(parse_config("# nothing\n\n   \n"), DEFAULTS)

    def test_values(self):
        config = parse_config('SMTP_HOST="smtp.yandex.ru"\nSMTP_PORT="465"\nSMTP_USER="me@yandex.ru"\n'
                              'SMTP_PASSWORD="app password"\nMAIL_TO="a@b.c, d@e.f"\nKEEP_RELEASES="2"\n'
                              'RETRY_AFTER="0"\nTIMEZONE="UTC"\nDATA_DIR="/tmp/cd/"\n')
        self.assertEqual(config["SMTP_HOST"], "smtp.yandex.ru")
        self.assertEqual(config["SMTP_PASSWORD"], "app password")
        self.assertEqual(config["MAIL_TO"], "a@b.c, d@e.f")
        self.assertEqual(config["KEEP_RELEASES"], "2")
        self.assertEqual(config["RETRY_AFTER"], "0")
        self.assertEqual(config["TIMEZONE"], "UTC")
        self.assertEqual(config["DATA_DIR"], "/tmp/cd")

    def test_spaces_around_key_and_value(self):
        config = parse_config('  SMTP_HOST = "h"  \r\nSMTP_USER=u\n')
        self.assertEqual(config["SMTP_HOST"], "h")
        self.assertEqual(config["SMTP_USER"], "u")

    def test_quotes_and_escapes(self):
        cases = {
            r'SMTP_PASSWORD="a\"b"': 'a"b',
            r'SMTP_PASSWORD="a\\b"': "a\\b",
            r'SMTP_PASSWORD="a\\"': "a\\",
            r'SMTP_PASSWORD="$(rm -rf /) `x` ${y}"': "$(rm -rf /) `x` ${y}",
            "SMTP_PASSWORD='single \"quoted\" $x'": 'single "quoted" $x',
            'SMTP_PASSWORD="it\'s"': "it's",
            'SMTP_PASSWORD="# not a comment"': "# not a comment",
            "SMTP_PASSWORD=plain": "plain",
            'SMTP_PASSWORD=""': "",
            "SMTP_PASSWORD=": "",
            'SMTP_PASSWORD="a=b"': "a=b",
        }
        for line, value in cases.items():
            with self.subTest(line=line):
                self.assertEqual(parse_config(line + "\n")["SMTP_PASSWORD"], value)

    def test_bad_quoting(self):
        for line in ('SMTP_PASSWORD="abc', "SMTP_PASSWORD='abc", 'SMTP_PASSWORD="a"b"', "SMTP_PASSWORD='a'b'",
                     "SMTP_PASSWORD=two words", 'SMTP_PASSWORD="x" # comment', "SMTP_PASSWORD=a\"b", '"'):
            with self.subTest(line=line):
                with self.assertRaises(ConfigError):
                    parse_config("# first\n" + line + "\n")

    def test_error_names_the_line(self):
        with self.assertRaises(ConfigError) as caught:
            parse_config('# first\n\nSMTP_PASSWORD="abc\n')
        self.assertIn("line 3", str(caught.exception))

    def test_unknown_keys_rejected(self):
        for line in ('SMTP_SERVER="x"', 'smtp_host="x"', 'export SMTP_HOST="x"', "SMTP_HOST", "rm -rf /",
                     'PATH="/tmp"'):
            with self.subTest(line=line):
                with self.assertRaises(ConfigError) as caught:
                    parse_config("\n" + line + "\n")
                self.assertIn("line 2", str(caught.exception))

    def test_bad_numbers_rejected(self):
        for line in ('SMTP_PORT="0"', 'SMTP_PORT="65536"', 'SMTP_PORT="abc"', 'SMTP_PORT=""', 'SMTP_PORT="-1"',
                     'KEEP_RELEASES="0"', 'KEEP_RELEASES="1.5"', 'KEEP_RELEASES="five"', 'KEEP_RELEASES=" 5"',
                     'RETRY_AFTER="-5"', 'RETRY_AFTER="1e3"', 'RETRY_AFTER="99999999"', 'RETRY_AFTER=""'):
            with self.subTest(line=line):
                with self.assertRaises(ConfigError) as caught:
                    parse_config(line + "\n")
                self.assertIn(line.split("=")[0], str(caught.exception))

    def test_non_ascii_digits_rejected_as_config_errors(self):
        for line in ('KEEP_RELEASES="²"', 'SMTP_PORT="⁴⁶⁵"', 'RETRY_AFTER="①"'):
            with self.subTest(line=line):
                with self.assertRaises(ConfigError):
                    parse_config(line + "\n")

    def test_number_bounds_accepted(self):
        config = parse_config('SMTP_PORT="65535"\nKEEP_RELEASES="1"\nRETRY_AFTER="0"\n')
        self.assertEqual((config["SMTP_PORT"], config["KEEP_RELEASES"], config["RETRY_AFTER"]), ("65535", "1", "0"))

    def test_bad_timezone_and_data_dir(self):
        for line in ('TIMEZONE="Mars/Olympus"', 'TIMEZONE=""', 'TIMEZONE="../etc/passwd"', 'DATA_DIR="srv/x"',
                     'DATA_DIR=""'):
            with self.subTest(line=line):
                with self.assertRaises(ConfigError):
                    parse_config(line + "\n")

    def test_data_dir_root(self):
        self.assertEqual(parse_config('DATA_DIR="/"\n')["DATA_DIR"], "/")

    def test_later_line_wins(self):
        self.assertEqual(parse_config('KEEP_RELEASES="3"\nKEEP_RELEASES="4"\n')["KEEP_RELEASES"], "4")


class ParseArgsTest(unittest.TestCase):
    def test_commands(self):
        cases = {
            (): ("timer", None),
            ("hook",): ("hook", None),
            ("--force",): ("force", None),
            ("--dry-run",): ("dry-run", None),
            ("status",): ("status", None),
            ("schedule",): ("schedule", None),
            ("rollback", "course"): ("rollback", "course"),
            ("test-notify",): ("test-notify", None),
            ("--help",): ("help", None),
            ("--version",): ("version", None),
        }
        for argv, expected in cases.items():
            with self.subTest(argv=argv):
                self.assertEqual(parse_args(list(argv)), expected)

    def test_usage_errors(self):
        for argv in (["rollback"], ["rollback", "a", "b"], ["bogus"], ["hook", "extra"], ["--force", "--dry-run"],
                     ["status", "course"], ["--Force"], ["-f"], ["timer"], ["schedule", "--help"], [""]):
            with self.subTest(argv=argv):
                with self.assertRaises(UsageError):
                    parse_args(argv)

    def test_rollback_message(self):
        with self.assertRaises(UsageError) as caught:
            parse_args(["rollback"])
        self.assertIn("rollback", str(caught.exception))


class MainTest(unittest.TestCase):
    """--help, --version and usage errors need neither root nor a configuration."""

    def run_main(self, argv):
        out = io.TextIOWrapper(io.BytesIO(), encoding="utf-8")
        err = io.TextIOWrapper(io.BytesIO(), encoding="utf-8")
        with mock.patch.object(sys, "stdout", out), mock.patch.object(sys, "stderr", err):
            code = cli.main(argv)
            out.flush()
            err.flush()
        return code, out.buffer.getvalue().decode(), err.buffer.getvalue().decode()

    def test_help(self):
        code, out, err = self.run_main(["--help"])
        self.assertEqual(code, 0)
        for command in ("hook", "--force", "--dry-run", "status", "schedule", "rollback SITE", "test-notify",
                        "--version"):
            self.assertIn(command, out)
        self.assertEqual(err, "")

    def test_version(self):
        code, out, _ = self.run_main(["--version"])
        self.assertEqual(code, 0)
        self.assertEqual(out.strip(), f"course-deploy {__version__}")

    def test_usage_error_exit_code(self):
        code, out, err = self.run_main(["bogus"])
        self.assertEqual(code, 2)
        self.assertEqual(out, "")
        self.assertIn("course-deploy --help", err)
        code, _, err = self.run_main(["rollback"])
        self.assertEqual(code, 2)

    def test_root_required(self):
        if os.geteuid() == 0:
            self.skipTest("running as root")
        env = {k: v for k, v in os.environ.items() if k not in ("COURSE_DEPLOY_ROOT", "COURSE_DEPLOY_NOW")}
        with mock.patch.dict(os.environ, env, clear=True):
            code, _, err = self.run_main(["status"])
        self.assertEqual(code, 1)
        self.assertIn("root", err)


if __name__ == "__main__":
    unittest.main()
