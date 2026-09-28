#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
# Puts the students key of a seminar, release.json, into the live release of the course site at the unlock time.
#
# seminar-03-release.timer runs it as root at the unlock time and every two minutes. Before the unlock time it
# exits at once. From then on it copies the key file into the seminar folder of the release that the web root
# points to, unless the same file is already there, and fetches it back over HTTPS. Every publish and every
# rollback points the web root at another release folder, one without the file, and the next run copies it
# again. It prints one line per thing it does and nothing when there is nothing to do.
#
# Usage: release.sh [--check] [--force] [--no-http]
#   --check     print the state of the key file, the live release and the URL; change nothing
#   --force     copy even before the unlock time: by hand, and only once the class is over
#   --no-http   do not fetch the URL after copying
#
# Settings come from the environment, with these defaults (for another seminar, see README.md):
#   SRC            /root/seminar-release/seminar-03/release.json   the key file, outside the web root
#   WEBROOT        /var/www/optimization-methods                   a symlink to the live release
#   SEMINAR_DIR    seminars/3                                      the seminar folder inside the release
#   SEMINAR_ID     seminar-03                                      the id the key file must carry
#   UNLOCK_AT      2026-09-28T11:20:00Z                            the end of the class, in UTC
#   WEB_USER       the user named in NGINX_CONF, else www-data     owner of the copy
#   WEB_GROUP      the group named there, else the group of WEB_USER
#   SITE_URL       https://optimization-methods.tarakan-tuc.ru
#   CHECK_ADDRESS  127.0.0.1    the address the URL check connects to, as course-deploy does; empty for DNS
#   NGINX_CONF     /etc/nginx/nginx.conf
#
# Exit status: 0 when the file is in place or it is too early, 1 on an error, 2 on a wrong argument.

set -euo pipefail
umask 022

SRC="${SRC:-/root/seminar-release/seminar-03/release.json}"
WEBROOT="${WEBROOT:-/var/www/optimization-methods}"
SEMINAR_DIR="${SEMINAR_DIR:-seminars/3}"
SEMINAR_ID="${SEMINAR_ID:-seminar-03}"
UNLOCK_AT="${UNLOCK_AT:-2026-09-28T11:20:00Z}"
WEB_USER="${WEB_USER:-}"
WEB_GROUP="${WEB_GROUP:-}"
SITE_URL="${SITE_URL:-https://optimization-methods.tarakan-tuc.ru}"
CHECK_ADDRESS="${CHECK_ADDRESS-127.0.0.1}"
NGINX_CONF="${NGINX_CONF:-/etc/nginx/nginx.conf}"

PROG="$(basename "$0")"
CHECK=0
FORCE=0
HTTP=1
WORK=""
TMP_FILE=""
HTTP_CODE=""
HTTP_ERROR=""

log() { printf '%s: %s\n' "$SEMINAR_ID" "$*"; }
fail() { printf '%s: error: %s\n' "$SEMINAR_ID" "$*" >&2; exit 1; }

usage() {
    cat <<EOF
Usage: $PROG [--check] [--force] [--no-http]

Copies $SRC
to $WEBROOT/$SEMINAR_DIR/release.json from $UNLOCK_AT on.

  --check     print the state of the key file, the live release and the URL; change nothing
  --force     copy even before the unlock time (only once the class is over)
  --no-http   do not fetch the URL after copying
EOF
}

cleanup() {
    if [ -n "$TMP_FILE" ]; then rm -f "$TMP_FILE"; fi
    if [ -n "$WORK" ]; then rm -rf "$WORK"; fi
}
trap cleanup EXIT

for arg in "$@"; do
    case "$arg" in
        --check) CHECK=1 ;;
        --force) FORCE=1 ;;
        --no-http) HTTP=0 ;;
        -h | --help) usage; exit 0 ;;
        *) printf '%s: unknown argument: %s\n\n' "$PROG" "$arg" >&2; usage >&2; exit 2 ;;
    esac
done

SEMINAR_DIR="${SEMINAR_DIR%/}"
case "$SEMINAR_DIR" in
    '' | /* | .. | ../* | */.. | */../*) fail "SEMINAR_DIR must be a folder inside the release, not '$SEMINAR_DIR'" ;;
esac
URL="${SITE_URL%/}/$SEMINAR_DIR/release.json"

# Host and port of SITE_URL, for curl --resolve.
URL_HOST="${SITE_URL#*://}"
URL_HOST="${URL_HOST%%/*}"
URL_PORT=443
case "$SITE_URL" in http://*) URL_PORT=80 ;; esac
case "$URL_HOST" in *:*) URL_PORT="${URL_HOST##*:}"; URL_HOST="${URL_HOST%:*}" ;; esac

# Seconds until UNLOCK_AT, rounded up; zero or less once it has come.
is_integer() {
    case "$1" in
        '' | - | *[!0-9-]* | ?*-*) return 1 ;;
        *) return 0 ;;
    esac
}

seconds_to_unlock() {
    python3 - "$UNLOCK_AT" <<'PY'
import math
import sys
import time
from datetime import datetime

text = sys.argv[1].strip()
if text[-1:] in ("Z", "z"):
    text = text[:-1] + "+00:00"
try:
    moment = datetime.fromisoformat(text)
except ValueError:
    sys.exit("UNLOCK_AT is not an ISO 8601 time: " + sys.argv[1])
if moment.tzinfo is None:
    sys.exit("UNLOCK_AT needs a time zone, as in 2026-09-28T11:20:00Z")
print(math.ceil(moment.timestamp() - time.time()))
PY
}

# Checks the key file; prints why it is unusable and fails, without ever printing the key.
check_src() {
    if [ ! -e "$SRC" ]; then
        echo "there is no key file $SRC; upload release.json there (see README.md)"
        return 1
    fi
    python3 - "$SRC" "$SEMINAR_ID" <<'PY'
import base64
import binascii
import json
import sys

path, want = sys.argv[1], sys.argv[2]
try:
    with open(path, "rb") as f:
        doc = json.loads(f.read().decode("utf-8"))
except OSError as error:
    sys.exit(f"cannot read {path}: {error.strerror}")
except ValueError as error:
    sys.exit(f"{path} is not valid JSON: {error}")
if not isinstance(doc, dict):
    sys.exit(f"{path} is not a JSON object")
if doc.get("id") != want:
    sys.exit(f"{path} carries the id {doc.get('id')!r}, not {want!r}")
key = doc.get("key")
if not isinstance(key, str):
    sys.exit(f'{path} has no "key" string')
try:
    raw = base64.b64decode(key, validate=True)
except (binascii.Error, ValueError):
    sys.exit(f'the "key" of {path} is not base64')
if len(raw) != 32:
    sys.exit(f'the "key" of {path} is {len(raw)} bytes long, not 32')
PY
}

# Fills in WEB_USER and WEB_GROUP; fails when the user does not exist.
resolve_web_user() {
    local line="" conf_user="" conf_group="" rest=""
    if [ -z "$WEB_USER" ]; then
        if [ -r "$NGINX_CONF" ]; then
            line="$(awk '$1 == "user" { sub(/;.*/, ""); $1 = ""; print; exit }' "$NGINX_CONF")"
        fi
        read -r conf_user conf_group rest <<EOF || true
$line
EOF
        WEB_USER="${conf_user:-www-data}"
        if [ -z "$WEB_GROUP" ]; then WEB_GROUP="$conf_group"; fi
    fi
    id -u "$WEB_USER" >/dev/null 2>&1 || return 1
    if [ -z "$WEB_GROUP" ]; then WEB_GROUP="$(id -gn "$WEB_USER")"; fi
}

# The folder the web root leads to, or nothing.
live_release() {
    if [ ! -e "$WEBROOT" ]; then return 0; fi
    readlink -f "$WEBROOT" 2>/dev/null ||
        python3 -c 'import os, sys; print(os.path.realpath(sys.argv[1]))' "$WEBROOT"
}

# True when $1 is a plain file with the bytes of the key file, mode 0644, owned by the web user.
is_current() {
    [ -f "$1" ] && [ ! -L "$1" ] && cmp -s "$SRC" "$1" &&
        [ -n "$(find "$1" -maxdepth 0 -type f -perm 0644 -user "$WEB_USER" -group "$WEB_GROUP" -print)" ]
}

# Copies the key file into the folder $1 under a hidden name, then renames it over release.json in one step.
install_key() {
    local target="$1/release.json"
    if [ -L "$target" ] || { [ -e "$target" ] && [ ! -f "$target" ]; }; then
        fail "$target exists and is not a plain file; remove it by hand"
    fi
    TMP_FILE="$1/.release.json.$$.tmp"
    install -m 0644 -o "$WEB_USER" -g "$WEB_GROUP" "$SRC" "$TMP_FILE" ||
        fail "cannot write $TMP_FILE"
    mv -f "$TMP_FILE" "$target" || fail "cannot rename $TMP_FILE to $target"
    TMP_FILE=""
}

# Fetches URL with a cache-busting query; sets HTTP_CODE (000 without an answer) and HTTP_ERROR.
fetch() {
    HTTP_CODE=""
    HTTP_ERROR=""
    if ! command -v curl >/dev/null 2>&1; then
        HTTP_CODE="000"
        HTTP_ERROR="curl is not installed"
        return 0
    fi
    if [ -z "$WORK" ]; then WORK="$(mktemp -d "${TMPDIR:-/tmp}/seminar-release.XXXXXX")"; fi
    set -- curl -sS --max-time 10 --noproxy '*' -o "$WORK/body" -w '%{http_code}'
    if [ -n "$CHECK_ADDRESS" ]; then set -- "$@" --resolve "$URL_HOST:$URL_PORT:$CHECK_ADDRESS"; fi
    if ! HTTP_CODE="$("$@" "$URL?t=$(date +%s)" 2>"$WORK/err")"; then
        HTTP_ERROR="$(head -n 1 "$WORK/err")"
    fi
    if [ -z "$HTTP_CODE" ]; then HTTP_CODE="000"; fi
}

# True when the fetched body is the key file itself; otherwise prints what differs.
served_is_key() {
    python3 - "$WORK/body" "$SRC" "$SEMINAR_ID" <<'PY'
import json
import sys

body_path, src_path, want = sys.argv[1:4]
with open(body_path, "rb") as f:
    body = f.read()
try:
    doc = json.loads(body.decode("utf-8"))
except ValueError:
    sys.exit("the answer is not JSON")
got = doc.get("id") if isinstance(doc, dict) else None
if got != want:
    sys.exit(f"the answer carries the id {got!r}, not {want!r}")
with open(src_path, "rb") as f:
    if f.read() != body:
        sys.exit(f"the answer carries the id {want} but is not the key file")
PY
}

duration() {
    local s="$1"
    if [ "$s" -ge 86400 ]; then
        printf '%dd %dh %dm' $((s / 86400)) $((s % 86400 / 3600)) $((s % 3600 / 60))
    elif [ "$s" -ge 3600 ]; then
        printf '%dh %dm' $((s / 3600)) $((s % 3600 / 60))
    else
        printf '%dm %ds' $((s / 60)) $((s % 60))
    fi
}

row() { printf '%-13s %s\n' "$1" "$2"; }

report() {
    local remaining="" note="" live="" dir="" target="" attrs="" mode=""

    if note="$(check_src 2>&1)"; then
        mode="$(python3 -c 'import os, sys; print("%04o" % (os.stat(sys.argv[1]).st_mode & 0o7777))' "$SRC")"
        note="$SRC: valid, id $SEMINAR_ID, mode $mode"
        case "$mode" in 0600 | 0400) ;; *) note="$note (readable by others: chmod 600 it)" ;; esac
    fi
    row "key file" "$note"

    if remaining="$(seconds_to_unlock)" && is_integer "$remaining"; then
        if [ "$remaining" -gt 0 ]; then
            row "unlock at" "$UNLOCK_AT, in $(duration "$remaining")"
        else
            row "unlock at" "$UNLOCK_AT, $(duration $((-remaining))) ago"
        fi
    else
        row "unlock at" "cannot read $UNLOCK_AT"
        remaining=""
    fi

    if resolve_web_user; then
        row "web user" "$WEB_USER:$WEB_GROUP"
    else
        row "web user" "$WEB_USER does not exist; set WEB_USER"
    fi

    live="$(live_release)"
    if [ -z "$live" ] || [ ! -d "$live" ]; then
        row "web root" "$WEBROOT does not lead to a folder"
    else
        row "web root" "$WEBROOT -> $live"
        dir="$live/$SEMINAR_DIR"
        target="$dir/release.json"
        if [ ! -d "$dir" ]; then
            row "seminar" "$SEMINAR_DIR is missing from the live release"
        elif [ ! -e "$target" ] && [ ! -L "$target" ]; then
            row "release.json" "not in the live release"
        else
            attrs="$(python3 - "$target" <<'PY'
import grp
import os
import pwd
import sys

st = os.lstat(sys.argv[1])


def name(lookup, number):
    try:
        return lookup(number)[0]
    except KeyError:
        return str(number)


print(f"{name(pwd.getpwuid, st.st_uid)}:{name(grp.getgrgid, st.st_gid)} {st.st_mode & 0o7777:04o}")
PY
)"
            if [ -f "$SRC" ] && cmp -s "$SRC" "$target"; then
                row "release.json" "in the live release, same as the key file, $attrs"
            else
                row "release.json" "in the live release, not the key file, $attrs"
            fi
        fi
    fi

    if [ "$HTTP" -eq 0 ]; then
        row "URL" "$URL: not fetched (--no-http)"
        return 0
    fi
    fetch
    if [ "$HTTP_CODE" = "000" ]; then
        note="no answer: ${HTTP_ERROR:-unknown error}"
    elif [ "$HTTP_CODE" = "200" ]; then
        if note="$(served_is_key 2>&1)"; then note="the key file"; fi
        if [ -n "$remaining" ] && [ "$remaining" -gt 0 ]; then
            note="HTTP 200 before the unlock time: $note"
        else
            note="HTTP 200, $note"
        fi
    elif [ "$HTTP_CODE" = "404" ] && [ -n "$remaining" ] && [ "$remaining" -gt 0 ]; then
        note="HTTP 404, as it should be before the unlock time"
    else
        note="HTTP $HTTP_CODE"
    fi
    row "URL" "$URL: $note"
}

release() {
    local remaining="" note="" live="" again="" dir="" attempt=0 copied=0

    # stderr stays out of the number, and only a clean "not in the future" lets the copy through
    remaining="$(seconds_to_unlock)" || fail "cannot read UNLOCK_AT '$UNLOCK_AT'"
    is_integer "$remaining" || fail "cannot read the time until UNLOCK_AT: '$remaining'"
    if [ "$FORCE" -eq 0 ] && ! [ "$remaining" -le 0 ]; then exit 0; fi

    if ! note="$(check_src 2>&1)"; then fail "$note"; fi
    resolve_web_user || fail "the web user $WEB_USER does not exist; set WEB_USER"

    while :; do
        attempt=$((attempt + 1))
        live="$(live_release)"
        if [ -z "$live" ] || [ ! -d "$live" ]; then fail "the web root $WEBROOT does not lead to a folder"; fi
        dir="$live/$SEMINAR_DIR"
        [ -d "$dir" ] || fail "the live release $live has no folder $SEMINAR_DIR; nothing copied"
        if ! is_current "$dir/release.json"; then
            install_key "$dir"
            copied=1
            log "copied $SRC to $dir/release.json ($WEB_USER:$WEB_GROUP, 0644)"
        fi
        again="$(live_release)"
        if [ "$again" = "$live" ]; then break; fi
        if [ "$attempt" -ge 3 ]; then fail "the web root keeps moving; the next run copies the file"; fi
        log "the web root moved to $again meanwhile; copying there as well"
    done

    if [ "$copied" -eq 0 ]; then
        if [ "$FORCE" -eq 0 ]; then exit 0; fi
        log "$dir/release.json is already in place"
    fi
    if [ "$HTTP" -eq 0 ]; then exit 0; fi

    fetch
    if [ "$HTTP_CODE" = "000" ]; then
        fail "no answer from $URL (${HTTP_ERROR:-unknown error}), although the file is in $dir"
    elif [ "$HTTP_CODE" != "200" ]; then
        fail "$URL answers HTTP $HTTP_CODE, although the file is in $dir"
    fi
    if ! note="$(served_is_key 2>&1)"; then fail "$URL: $note"; fi
    log "$URL answers 200 with the key file, id $SEMINAR_ID"
}

if [ "$CHECK" -eq 1 ]; then
    report
else
    release
fi
