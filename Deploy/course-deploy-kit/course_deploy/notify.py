# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
"""E-mail alerts over SMTP with implicit TLS (port 465), e.g. through Yandex."""

from __future__ import annotations

import smtplib
import socket
import ssl
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
from typing import Dict, List

REQUIRED = ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "MAIL_TO")


def configured(config: Dict[str, str]) -> bool:
    return all(config.get(key) for key in REQUIRED)


def recipients(config: Dict[str, str]) -> List[str]:
    return [r.strip() for r in config.get("MAIL_TO", "").split(",") if r.strip()]


def send(config: Dict[str, str], subject: str, body: str) -> None:
    """Send one message; raises OSError or smtplib.SMTPException on failure."""
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = config["SMTP_USER"]
    message["To"] = ", ".join(recipients(config))
    message["Date"] = formatdate(localtime=True)
    message["Message-ID"] = make_msgid(domain=socket.getfqdn() or "localhost")
    message.set_content(body, charset="utf-8")
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(config["SMTP_HOST"], int(config["SMTP_PORT"]), context=context, timeout=30) as smtp:
        smtp.login(config["SMTP_USER"], config["SMTP_PASSWORD"])
        smtp.send_message(message)


def describe(error: BaseException) -> str:
    """A one-line description of a sending error; it never contains the password."""
    if isinstance(error, UnicodeError):
        # the text would quote a character of the login or the password
        return "SMTP_USER or SMTP_PASSWORD contains characters other than ASCII"
    if isinstance(error, smtplib.SMTPResponseException):
        text = error.smtp_error.decode("utf-8", "replace") if isinstance(error.smtp_error, bytes) \
            else str(error.smtp_error)
        return f"{type(error).__name__}: {error.smtp_code} {text}".strip()
    return f"{type(error).__name__}: {error}"
