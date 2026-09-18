#!/bin/bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
#
# End-to-end scenarios of the deploy pipeline, run by run-tests.sh as root in ubuntu:22.04 with
# the repository mounted read-only at /repo. It builds a replica of the server (nginx with the
# production configuration and a local CA, sshd on port 2222, a mock SMTP server with implicit
# TLS, the old atlas and the old atlas-deploy), a "mac" user with a fixture course repository,
# installs the kit as on the server, and prints one PASS/FAIL line per scenario.

set -uo pipefail
export LC_ALL=C.UTF-8

SRC=/repo
HOST=optimization-methods.tarakan-tuc.ru
URL=https://$HOST
WEBROOT=/var/www/optimization-methods
DATA=/srv/course-deploy
REPO=$DATA/site.git
RELEASES=$DATA/releases/course
CONF=/etc/course-deploy/course-deploy.conf
KIT=/root/course-deploy-kit
MAC=/home/mac
COURSE=$MAC/course
HAND=/tmp/hand
WEB_REL="Seminars/Evgeny Baulin/web"
S02="$WEB_REL/02. Convexity, Constraints and Optimality Conditions"
S03="$WEB_REL/03. Gradient Descent and Automatic Differentiation"
VENDOR="$WEB_REL/vendor"
MAILDIR=/var/mail-test
LOGS=/tmp/e2e
OUT=$LOGS/last.out
MARKER=never-publish-marker
SSH_DEPLOY="ssh -i ~/.ssh/course_deploy -o IdentitiesOnly=yes"
PAST="2026-01-01 10:00"
FUTURE=$(TZ=Europe/Moscow date -d '+2 days' '+%Y-%m-%d %H:%M')
mkdir -p "$LOGS" "$MAILDIR"

# ---------------------------------------------------------------------------------- helpers

die() { echo "setup failed: $*" >&2; exit 2; }

as_mac() {
    runuser -u mac -- env -i HOME="$MAC" USER=mac LOGNAME=mac SHELL=/bin/bash LANG=C.UTF-8 \
        PATH=/usr/local/bin:/usr/bin:/bin "$@"
}

# put PATH < content: writes a file of the fixture as the mac user
# shellcheck disable=SC2016 # the inner script expands $1 itself
put() { as_mac bash -c 'mkdir -p "$(dirname "$1")" && cat > "$1"' _ "$1"; }

mgit() { as_mac git -C "$COURSE" "$@"; }
hgit() { as_mac git -C "$HAND" "$@"; }
srv_git() { git -c safe.directory="$REPO" --git-dir="$REPO" "$@"; }
tip() { srv_git rev-parse --verify -q refs/heads/site || true; }
live() { basename "$(readlink "$WEBROOT")"; }
mails() { find "$MAILDIR" -name '*.eml' | wc -l; }
last_mail() { find "$MAILDIR" -name '*.eml' | sort | tail -n 1; }
releases() { find "$RELEASES" -mindepth 1 -maxdepth 1 -type d ! -name '.*' -printf '%f\n' | sort; }
code_of() { curl -s -o /dev/null -w '%{http_code}' --max-time 10 --resolve "$HOST:443:127.0.0.1" "$URL$1"; }
body_of() { curl -sS --max-time 10 --resolve "$HOST:443:127.0.0.1" "$URL$1"; }
conf() { put "$COURSE/Deploy/publish.conf"; }
commit() { mgit add -A && mgit commit -q -m "$1"; }
marker() { as_mac sed -i "s|<p id=\"marker\">[^<]*</p>|<p id=\"marker\">$1</p>|" "$COURSE/Atlas/index.html"; }

# publish [args]: publish.py as the mac user; the output goes to $OUT and to the log
publish() {
    local code=0
    as_mac python3 "$COURSE/Deploy/publish.py" "$@" > "$OUT" 2>&1 || code=$?
    sed 's/^/    | /' "$OUT"
    return "$code"
}

# server [args]: course-deploy as root; the output goes to $OUT and to the log
server() {
    local code=0
    course-deploy "$@" > "$OUT" 2>&1 || code=$?
    sed 's/^/    | /' "$OUT"
    return "$code"
}

check() {
    local what=$1
    shift
    if "$@"; then
        echo "  ok: $what"
        return 0
    fi
    echo "  NOT OK: $what"
    return 1
}
has() { grep -qF -- "$1" "${2:-$OUT}"; }
has_re() { grep -qE -- "$1" "${2:-$OUT}"; }
lacks() { ! grep -qF -- "$1" "${2:-$OUT}"; }
eq() { [[ $1 == "$2" ]] || { echo "    got '$1', expected '$2'"; return 1; }; }
wait_port() {
    local i
    for i in $(seq 100); do
        if (exec 3<> "/dev/tcp/127.0.0.1/$1") 2> /dev/null; then return 0; fi
        sleep 0.1
    done
    return 1
}
wait_closed() {
    local i
    for i in $(seq 100); do
        if ! (exec 3<> "/dev/tcp/127.0.0.1/$1") 2> /dev/null; then return 0; fi
        sleep 0.1
    done
    return 1
}
mode_is() {
    local actual
    actual=$(stat -c '%U:%G %a' "$1")
    [[ $actual == "$2" ]] || { echo "    $1 is '$actual', expected '$2'"; return 1; }
}
# code NUMBER COMMAND...: runs COMMAND and compares its exit code
code() {
    local expected=$1 actual=0
    shift
    "$@" || actual=$?
    [[ $actual == "$expected" ]] || { echo "    exit code $actual, expected $expected"; return 1; }
}

declare -A RESULTS=()
run() {
    local n=$1 title=$2 fn=$3 status
    (set -e; "$fn") > "$LOGS/scenario-$n.log" 2>&1
    status=$?
    if (( status == 0 )); then
        RESULTS[$n]="PASS $title"
        printf 'PASS %2s  %s\n' "$n" "$title"
    else
        RESULTS[$n]="FAIL $title"
        printf 'FAIL %2s  %s\n' "$n" "$title"
        tail -n 80 "$LOGS/scenario-$n.log" | sed 's/^/        /'
    fi
}

# ------------------------------------------------------------------------------------ setup

setup_tls() {
    local d=/etc/ssl/course-test
    mkdir -p "$d"
    openssl req -x509 -newkey rsa:2048 -nodes -days 30 -subj "/CN=course-deploy test CA" \
        -keyout "$d/ca.key" -out "$d/ca.crt" 2> /dev/null
    openssl req -newkey rsa:2048 -nodes -subj "/CN=$HOST" -keyout "$d/privkey.pem" -out "$d/site.csr" 2> /dev/null
    printf 'subjectAltName=DNS:%s,DNS:localhost\n' "$HOST" > "$d/san.ext"
    openssl x509 -req -in "$d/site.csr" -CA "$d/ca.crt" -CAkey "$d/ca.key" -CAcreateserial -days 30 \
        -extfile "$d/san.ext" -out "$d/fullchain.pem" 2> /dev/null
    cp "$d/ca.crt" /usr/local/share/ca-certificates/course-test-ca.crt
    update-ca-certificates > /dev/null 2>&1
}

setup_nginx() {
    local live=/etc/letsencrypt/live/optimization-methods.tarakan-tuc.ru
    # the production configuration of Prompt.md 1.1, only the certificate paths differ
    cat > /etc/nginx/sites-available/optimization-methods.conf <<'EOF'
server {
    server_name optimization-methods.tarakan-tuc.ru;
    root  /var/www/optimization-methods;
    index index.html;
    charset utf-8;
    add_header Cache-Control "no-cache" always;

    location ^~ /.well-known/acme-challenge/ { default_type "text/plain"; }
    location / { try_files $uri $uri/ =404; }
    location ~ /\. { deny all; }
    location ~* \.(md|zip|tar\.gz)$ { deny all; }

    listen 443 ssl;
    ssl_certificate     /etc/letsencrypt/live/optimization-methods.tarakan-tuc.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/optimization-methods.tarakan-tuc.ru/privkey.pem;
}
server {
    if ($host = optimization-methods.tarakan-tuc.ru) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name optimization-methods.tarakan-tuc.ru;
    return 404;
}
EOF
    cat > /etc/nginx/sites-available/000-catch-all.conf <<'EOF'
server { listen 80 default_server; server_name _; return 444; }
server {
    listen 443 ssl default_server;
    server_name _;
    ssl_certificate     /etc/letsencrypt/live/optimization-methods.tarakan-tuc.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/optimization-methods.tarakan-tuc.ru/privkey.pem;
    return 444;
}
EOF
    sed -i -e "s|$live/fullchain.pem|/etc/ssl/course-test/fullchain.pem|" \
           -e "s|$live/privkey.pem|/etc/ssl/course-test/privkey.pem|" \
           /etc/nginx/sites-available/optimization-methods.conf /etc/nginx/sites-available/000-catch-all.conf
    rm -f /etc/nginx/sites-enabled/default
    ln -sf ../sites-available/optimization-methods.conf /etc/nginx/sites-enabled/optimization-methods.conf
    ln -sf ../sites-available/000-catch-all.conf /etc/nginx/sites-enabled/000-catch-all.conf
    nginx -t 2> "$LOGS/nginx-t.log" && nginx && wait_port 443
}

setup_old_site() {
    mkdir -p "$WEBROOT"
    printf '<!doctype html>\n<title>Old atlas</title>\n<p>old atlas</p>\n' > "$WEBROOT/index.html"
    printf 'body { color: black }\n' > "$WEBROOT/styles.css"
    chown -R www-data:www-data "$WEBROOT"
    cat > /usr/local/bin/atlas-deploy <<'EOF'
#!/bin/bash
# The old manual deploy: copy the SFTP upload into the web root, check, roll back.
set -e
cp -a /var/www/optimization-methods /var/www/optimization-methods.bak
cp -a /root/atlas-upload/. /var/www/optimization-methods/
code=$(curl -s -o /dev/null -w '%{http_code}' -H "Host: optimization-methods.tarakan-tuc.ru" http://127.0.0.1/)
if [ "$code" != 200 ]; then
    echo "health check failed ($code), rolling back"
    rm -rf /var/www/optimization-methods && mv /var/www/optimization-methods.bak /var/www/optimization-methods
    exit 1
fi
EOF
    chmod 0755 /usr/local/bin/atlas-deploy
    cp /usr/local/bin/atlas-deploy "$LOGS/atlas-deploy.orig"
}

setup_sshd() {
    ssh-keygen -A > /dev/null
    mkdir -p /run/sshd
    printf 'Port 2222\n' > /etc/ssh/sshd_config.d/10-port.conf
    /usr/sbin/sshd && wait_port 2222
}

setup_smtp() {
    cat > /usr/local/bin/mock-smtp <<'EOF'
#!/usr/bin/python3
"""A mock SMTP server with implicit TLS on localhost:465 that stores every message."""
import base64, itertools, os, socketserver, ssl

USER, PASSWORD, MAILDIR = "robot@localhost", "secret", "/var/mail-test"
COUNTER = itertools.count(1)
CONTEXT = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
CONTEXT.load_cert_chain("/etc/ssl/course-test/fullchain.pem", "/etc/ssl/course-test/privkey.pem")


class Handler(socketserver.StreamRequestHandler):
    def send(self, line):
        self.wfile.write((line + "\r\n").encode())
        self.wfile.flush()

    def read(self):
        return self.rfile.readline().decode("utf-8", "replace").rstrip("\r\n")

    def b64(self, text):
        return base64.b64decode(text).decode("utf-8", "replace")

    def handle(self):
        self.send("220 localhost mock ESMTP")
        authed, lines = False, None
        while True:
            raw = self.rfile.readline()
            if not raw:
                return
            line = raw.decode("utf-8", "replace").rstrip("\r\n")
            if lines is not None:
                if line == ".":
                    path = os.path.join(MAILDIR, "%03d.eml" % next(COUNTER))
                    with open(path, "w", encoding="utf-8") as f:
                        f.write("\n".join(lines) + "\n")
                    lines = None
                    self.send("250 OK stored")
                else:
                    lines.append(line[1:] if line.startswith("..") else line)
                continue
            words = line.split()
            verb = words[0].upper() if words else ""
            if verb in ("EHLO", "HELO"):
                self.send("250-localhost")
                self.send("250 AUTH PLAIN LOGIN")
            elif verb == "AUTH" and len(words) > 1 and words[1].upper() == "PLAIN":
                if len(words) > 2:
                    token = words[2]
                else:
                    self.send("334 ")
                    token = self.read()
                _, user, password = self.b64(token).split("\0")
                authed = user == USER and password == PASSWORD
                self.send("235 2.7.0 Authentication successful" if authed else "535 5.7.8 Authentication failed")
            elif verb == "AUTH" and len(words) > 1 and words[1].upper() == "LOGIN":
                if len(words) > 2:
                    user = self.b64(words[2])
                else:
                    self.send("334 VXNlcm5hbWU6")
                    user = self.b64(self.read())
                self.send("334 UGFzc3dvcmQ6")
                password = self.b64(self.read())
                authed = user == USER and password == PASSWORD
                self.send("235 2.7.0 Authentication successful" if authed else "535 5.7.8 Authentication failed")
            elif verb == "MAIL":
                self.send("250 OK" if authed else "530 5.7.0 Authentication required")
            elif verb in ("RCPT", "RSET", "NOOP"):
                self.send("250 OK")
            elif verb == "DATA":
                self.send("354 End data with <CR><LF>.<CR><LF>")
                lines = []
            elif verb == "QUIT":
                self.send("221 Bye")
                return
            else:
                self.send("502 Command not implemented")


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def get_request(self):
        sock, address = super().get_request()
        return CONTEXT.wrap_socket(sock, server_side=True), address


Server(("127.0.0.1", 465), Handler).serve_forever()
EOF
    chmod 0755 /usr/local/bin/mock-smtp
    /usr/local/bin/mock-smtp > "$LOGS/smtp.log" 2>&1 &
    wait_port 465
}

setup_mac() {
    useradd -m -s /bin/bash mac
    install -d -m 0700 -o mac -g mac "$MAC/.ssh"
    as_mac ssh-keygen -q -t ed25519 -f "$MAC/.ssh/course_deploy" -N "" -C "course-deploy mac"
    # as on the Mac: the existing root entry Main_server, whose key file is not there
    put "$MAC/.ssh/config" <<'EOF'
Host Main_server
  HostName 127.0.0.1
  User root
  Port 2222
  IdentityFile ~/.ssh/main_server
  BatchMode yes
  StrictHostKeyChecking yes
EOF
    local f
    for f in /etc/ssh/ssh_host_*_key.pub; do
        printf '[127.0.0.1]:2222 %s\n' "$(cut -d' ' -f1,2 "$f")"
    done | put "$MAC/.ssh/known_hosts"
    chmod 0600 "$MAC/.ssh/config"
    as_mac git config --global user.name "Evgeny Baulin"
    as_mac git config --global user.email "evgeny@example.org"
    as_mac git config --global init.defaultBranch main
    as_mac git lfs install --skip-repo > /dev/null
    as_mac git config --global lfs.locksverify false
}

svg() { printf '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><title>%s</title></svg>\n' "$1"; }

setup_fixture() {
    as_mac mkdir -p "$COURSE"
    put "$COURSE/.gitignore" <<'EOF'
Documents/
Prompt.md
CLAUDE.md
.DS_Store
private-notes.txt
*.log
__pycache__/
EOF
    put "$COURSE/.gitattributes" <<'EOF'
* text=auto eol=lf
*.svg filter=lfs diff=lfs merge=lfs -text
*.pdf binary
EOF
    echo "# Notes for the next session ($MARKER)" | put "$COURSE/CLAUDE.md"
    echo "# Course plan ($MARKER)" | put "$COURSE/Documents/Plan.md"
    echo "lecture ($MARKER)" | put "$COURSE/Lecture/01. Optimization as the Foundation of Machine Learning.pdf"
    echo "colleague ($MARKER)" | put "$COURSE/Seminars/Andrey Ignatov/02. Convexity, Constraints and Optimality Conditions.pdf"
    echo "colleague ($MARKER)" | put "$COURSE/Seminars/Andrey Ignatov/02. Convexity, Constraints and Optimality Conditions.ipynb"
    echo "colleague ($MARKER)" | put "$COURSE/Seminars/Anna Matveeva/01. Optimization as the Foundation of Machine Learning.pptx"
    echo "colleague ($MARKER)" | put "$COURSE/Seminars/Ilya Kasimov/01. Optimization as the Foundation of Machine Learning.pdf"
    local theory="$COURSE/Seminars/Evgeny Baulin/theory/02. Convexity, Constraints and Optimality Conditions"
    echo "\\documentclass{article} % $MARKER" | put "$theory/Theory_en.tex"
    echo "theory pdf ($MARKER)" | put "$theory/Theory_en.pdf"
    echo "\\def\\value{1} % $MARKER" | put "$theory/values.tex"
    echo "figure pdf ($MARKER)" | put "$theory/figures/fig_sets.pdf"
    echo "{\"cells\": [], \"note\": \"$MARKER\"}" | put "$COURSE/Seminars/Evgeny Baulin/checks/02. Convexity, Constraints and Optimality Conditions.ipynb"

    put "$COURSE/Atlas/index.html" <<'EOF'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Optimization Atlas</title>
<link rel="stylesheet" href="styles.css">
<link rel="canonical" href="https://optimization-methods.tarakan-tuc.ru/">
</head>
<body>
<p id="marker">atlas v1</p>
<a id="seminars-link" href="/seminars/">Seminars</a>
<script src="js/app.js"></script>
<script>var ignored = '<img src="only-inside-a-script-string.png">';</script>
</body>
</html>
EOF
    echo "body { margin: 0 }" | put "$COURSE/Atlas/styles.css"
    echo "console.log('atlas');" | put "$COURSE/Atlas/js/app.js"
    echo "# Atlas ($MARKER)" | put "$COURSE/Atlas/README.md"
    echo "MIT License" | put "$COURSE/Atlas/LICENSE.md"

    local s02="$COURSE/$S02" s03="$COURSE/$S03" vendor="$COURSE/$VENDOR"
    put "$s02/main.html" <<'EOF'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Seminar 02</title>
<link rel="stylesheet" href="../vendor/katex.min.css">
</head>
<body>
<p id="marker">seminar 02 main</p>
<img src="figures/fig_sets.svg" alt="Convex sets">
<a href="theory.html">Theory</a>
<a href="../../theory/02.pdf">PDF</a>
<script src="../vendor/katex.min.js"></script>
<script src="data/seminar02_data.js"></script>
</body>
</html>
EOF
    printf '<!doctype html>\n<title>Seminar 02 theory</title>\n<a href="main.html">Seminar</a>\n' | put "$s02/theory.html"
    echo "window.DATA = {n: 2};" | put "$s02/data/seminar02_data.js"
    svg "Convex sets" | put "$s02/figures/fig_sets.svg"
    echo "latex figure ($MARKER)" | put "$s02/figures/fig_sets.pdf"
    echo "\\section{Notes} % $MARKER" | put "$s02/handout.tex"
    echo "{\"cells\": [], \"note\": \"$MARKER\"}" | put "$s02/notes.ipynb"
    echo "# Seminar 02 ($MARKER)" | put "$s02/README.md"
    echo "What to say ($MARKER)" | put "$s02/Speech notes.txt"
    echo "Answers ($MARKER)" | put "$s02/Checks for class.txt"

    echo "x,y" | put "$s03/data.csv"
    echo "a figure with a space in its name" | put "$s03/sub/figure one.txt"
    echo "handout ($MARKER)" | put "$s03/notes.pdf"
    echo "MIT License" | put "$s03/LICENSE"

    echo "var katex = {};" | put "$vendor/katex.min.js"
    echo ".katex { font: inherit }" | put "$vendor/katex.min.css"
    echo "MIT License" | put "$vendor/LICENSE"
    echo "# Versions ($MARKER)" | put "$vendor/VERSIONS.md"
    printf '<!doctype html>\n<title>Seminars</title>\n<a href="02.%%20Convexity/main.html">02</a>\n' \
        | put "$COURSE/$WEB_REL/index.html"

    cp -r "$SRC/Deploy" "$COURSE/Deploy"
    chown -R mac:mac "$COURSE/Deploy"
    conf <<EOF
course | / | Atlas | now
course | /seminars/vendor/ | $VENDOR | now
EOF
    mgit init -q
    commit "Course materials"
    mgit remote add deploy deploy@Main_server:/srv/course-deploy/site.git
    mgit config core.sshCommand "$SSH_DEPLOY"
}

upload_kit() {
    # as Termius SFTP delivers it: no execute bits, a .DS_Store here and there
    cp -r "$SRC/Deploy/course-deploy-kit" "$KIT"
    find "$KIT" -type f -exec chmod 0644 {} +
    touch "$KIT/.DS_Store" "$KIT/course_deploy/.DS_Store"
}

setup_install() {
    bash "$KIT/install.sh" "$(cat "$MAC/.ssh/course_deploy.pub")" > "$LOGS/install-1.log" 2>&1 \
        || { cat "$LOGS/install-1.log"; return 1; }
    # the manual edits that the second run must keep
    sed -i -e 's/^SMTP_HOST=""/SMTP_HOST="localhost"/' -e 's/^SMTP_USER=""/SMTP_USER="robot@localhost"/' \
           -e 's/^SMTP_PASSWORD=""/SMTP_PASSWORD="secret"/' -e 's/^MAIL_TO=""/MAIL_TO="evgeny@localhost"/' "$CONF"
    echo "# edited by hand" >> /etc/course-deploy/sites.conf
    sha256sum "$CONF" /etc/course-deploy/sites.conf > "$LOGS/config.sha256"
    bash "$KIT/install.sh" "$MAC/.ssh/course_deploy.pub" > "$LOGS/install-2.log" 2>&1 \
        || { cat "$LOGS/install-2.log"; return 1; }
}

# -------------------------------------------------------------------------------- scenarios

s01() {
    local log1=$LOGS/install-1.log log2=$LOGS/install-2.log expected=$LOGS/final-block.txt f n
    sed 's/^/    | /' "$log2"
    {
        echo "Server is ready."
        echo
        echo "Host key fingerprints (compare them on the first connection from the Mac):"
        for f in /etc/ssh/ssh_host_*_key.pub; do echo "  $(ssh-keygen -lf "$f")"; done
        echo
        echo "On the Mac:"
        echo '  ssh -i ~/.ssh/course_deploy -o IdentitiesOnly=yes deploy@Main_server'
        echo '                                         # expect "Interactive git shell is not enabled"'
        echo "  python3 Deploy/publish.py --dry-run"
        echo "  python3 Deploy/publish.py"
        echo
        echo "Then on the server:"
        echo "  systemctl enable --now course-deploy.timer"
    } > "$expected"
    n=$(wc -l < "$expected")
    check "first run ends with the exact final block" diff "$expected" <(tail -n "$n" "$log1")
    check "second run ends with the exact final block" diff "$expected" <(tail -n "$n" "$log2")
    check "systemd note printed" has "systemd is not running here" "$log1"
    check "deploy user with git-shell" eq "$(getent passwd deploy | cut -d: -f6,7)" "/home/deploy:/usr/bin/git-shell"
    check ".ssh 0700" mode_is /home/deploy/.ssh "deploy:deploy 700"
    check "authorized_keys 0600" mode_is /home/deploy/.ssh/authorized_keys "deploy:deploy 600"
    check "one key line after two runs" eq "$(wc -l < /home/deploy/.ssh/authorized_keys)" 1
    check "repository owned by deploy" mode_is "$REPO" "deploy:deploy 755"
    check "objects owned by deploy" mode_is "$REPO/objects" "deploy:deploy 755"
    check "config owned by root" mode_is "$REPO/config" "root:root 644"
    check "hooks owned by root" mode_is "$REPO/hooks" "root:root 755"
    check "pre-receive" mode_is "$REPO/hooks/pre-receive" "root:root 755"
    check "post-receive" mode_is "$REPO/hooks/post-receive" "root:root 755"
    check "only two hooks" eq "$(find "$REPO/hooks" -type f | wc -l)" 2
    check "denyNonFastForwards" eq "$(srv_git config receive.denyNonFastForwards)" true
    check "denyDeletes" eq "$(srv_git config receive.denyDeletes)" true
    check "sudoers" mode_is /etc/sudoers.d/course-deploy "root:root 440"
    check "no temporary sudoers file" eq "$(find /etc/sudoers.d -name '.*' | wc -l)" 0
    check "launcher" mode_is /usr/local/bin/course-deploy "root:root 755"
    check "library" mode_is /usr/local/lib/course-deploy "root:root 755"
    check "package" mode_is /usr/local/lib/course-deploy/course_deploy/cli.py "root:root 644"
    check "no .DS_Store installed" eq "$(find /usr/local/lib/course-deploy -name '.DS_Store' | wc -l)" 0
    check "forbidden.txt" mode_is /usr/local/lib/course-deploy/forbidden.txt "root:root 644"
    check "/etc/course-deploy" mode_is /etc/course-deploy "root:root 700"
    check "course-deploy.conf" mode_is "$CONF" "root:root 600"
    check "sites.conf" mode_is /etc/course-deploy/sites.conf "root:root 644"
    check "service unit" mode_is /etc/systemd/system/course-deploy.service "root:root 644"
    check "timer unit" mode_is /etc/systemd/system/course-deploy.timer "root:root 644"
    check "releases" mode_is "$DATA/releases" "root:root 755"
    check "state" mode_is "$DATA/state" "root:root 700"
    check "work" mode_is "$DATA/work" "root:root 700"
    check "lock" mode_is "$DATA/lock" "root:root 600"
    check "deploy is a system user" test "$(id -u deploy)" -lt "$(awk '$1 == "UID_MIN" { print $2 }' /etc/login.defs)"
    check "with its own group" eq "$(id -gn deploy)" deploy
    check "timer not enabled" test ! -e /etc/systemd/system/timers.target.wants/course-deploy.timer
    check "manual config edits survive" sha256sum -c "$LOGS/config.sha256"
    check "old atlas-deploy kept" cmp "$LOGS/atlas-deploy.orig" /root/atlas-deploy.old
    check "stub installed" cmp "$KIT/atlas-deploy" /usr/local/bin/atlas-deploy
    check "stub executable" mode_is /usr/local/bin/atlas-deploy "root:root 755"

    local rc=0
    bash "$KIT/install.sh" "ssh-dss AAAAB3NzaC1kc3MAAACBAP" > "$OUT" 2>&1 || rc=$?
    sed 's/^/    | /' "$OUT"
    check "a DSA key is rejected" test "$rc" -ne 0
    check "with a reason" has "ssh-ed25519 or ssh-rsa"
    rc=0
    bash "$KIT/install.sh" "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBrokenKeyBrokenKeyBrokenKeyBrokenKey1" > "$OUT" 2>&1 || rc=$?
    sed 's/^/    | /' "$OUT"
    check "a corrupt key is rejected" test "$rc" -ne 0
    check "by ssh-keygen" has "ssh-keygen does not accept this key"
    check "key file unchanged" eq "$(wc -l < /home/deploy/.ssh/authorized_keys)" 1

    printf 'AllowUsers root\n' > /etc/ssh/sshd_config.d/99-allow.conf
    rc=0
    bash "$KIT/install.sh" "$MAC/.ssh/course_deploy.pub" > "$OUT" 2>&1 || rc=$?
    rm -f /etc/ssh/sshd_config.d/99-allow.conf
    grep -i warning "$OUT" | sed 's/^/    | /'
    check "third run succeeds" test "$rc" -eq 0
    check "AllowUsers warning" has "Warning: sshd will refuse the deploy user because of 'AllowUsers root'."
    check "manual config edits still there" sha256sum -c "$LOGS/config.sha256"
}

s02() {
    local rc=0
    as_mac ssh -n -i "$MAC/.ssh/course_deploy" -o IdentitiesOnly=yes deploy@Main_server > "$OUT" 2>&1 || rc=$?
    sed 's/^/    | /' "$OUT"
    check "git-shell refuses the login" has "fatal: Interactive git shell is not enabled."
    check "ssh fails" test "$rc" -ne 0
    # shellcheck disable=SC2024 # root runs sudo -l only to list the rules of deploy
    sudo -l -U deploy > "$OUT" 2>&1
    sed 's/^/    | /' "$OUT"
    check "the one command" eq "$(grep -cE '^ +\(root\) NOPASSWD: /usr/local/bin/course-deploy hook$' "$OUT")" 1
    check "nothing else" eq "$(grep -cE '^ +\(' "$OUT")" 1
    check "key line starts with restrict" grep -qE '^restrict ssh-ed25519 AAAA' /home/deploy/.ssh/authorized_keys
}

s03() {
    conf <<EOF
course | / | Atlas | now
course | /seminars/vendor/ | $VENDOR | now
course | /seminars/02/ | $S02 | $FUTURE
EOF
    printf '#!/bin/sh\ntouch /tmp/network-was-used\nexit 1\n' > /tmp/ssh-tripwire
    chmod 0755 /tmp/ssh-tripwire
    local before after
    before=$(mgit for-each-ref; find "$COURSE/.git/objects" -type f | wc -l; sha256sum "$COURSE/.git/index"; mgit status --porcelain)
    local rc=0
    as_mac env GIT_SSH_COMMAND=/tmp/ssh-tripwire python3 "$COURSE/Deploy/publish.py" --dry-run > "$OUT" 2>&1 || rc=$?
    sed 's/^/    | /' "$OUT"
    after=$(mgit for-each-ref; find "$COURSE/.git/objects" -type f | wc -l; sha256sum "$COURSE/.git/index"; mgit status --porcelain)
    check "exit 0" eq "$rc" 0
    check "plan printed" has "Dry run: nothing was committed or pushed."
    check "atlas entry" has_re "^course  /  +Atlas$"
    check "seminar entry with countdown" has_re "^    $FUTURE \(in (1d 23h|2d 0h)\), 4 files, entry page: main.html$"
    check "atlas excluded README.md" has "      README.md"
    check "seminar excluded files listed" has "      figures/fig_sets.pdf"
    check "vendor listing page" has "entry page: file listing"
    check "link warning for the PDF link" has "warning broken link: /seminars/02/main.html -> ../../theory/02.pdf"
    check "no refs, objects, index or status change" eq "$after" "$before"
    check "no network" test ! -e /tmp/network-was-used
    check "no server branch" eq "$(tip)" ""
}

s04() {
    conf <<EOF
course | / | Atlas | now
course | /seminars/vendor/ | $VENDOR | now
EOF
    check "publish exits 0" code 0 publish
    check "result line" has_re "^remote: course-deploy: OK course -> [0-9]{8}T[0-9]{6}Z-[0-9a-f]{7} \(/, /seminars/vendor/\)"
    check "web root is a symlink" test -L "$WEBROOT"
    local rel
    rel=$(live)
    check "into the releases" eq "$(readlink "$WEBROOT")" "$RELEASES/$rel"
    check "legacy folder moved" test -f "$RELEASES/00000000T000000Z-legacy/index.html"
    check "legacy content" grep -q "old atlas" "$RELEASES/00000000T000000Z-legacy/index.html"
    check "legacy ownership kept" mode_is "$RELEASES/00000000T000000Z-legacy/index.html" "www-data:www-data 644"
    check "move logged" has "moved the old web root folder"
    check "version.txt over HTTPS" cmp <(body_of /version.txt) "$RELEASES/$rel/version.txt"
    check "version.txt names the release" grep -qx "release $rel" "$RELEASES/$rel/version.txt"
    check "meta written" grep -q "^paths=/ /seminars/vendor/$" "$RELEASES/$rel.meta"
    check "atlas served" grep -q "atlas v1" <(body_of /)
    check "old HTTP check still gets 301" eq "$(curl -s -o /dev/null -w '%{http_code}' -H "Host: $HOST" http://127.0.0.1/)" 301
    check "vendor listing" eq "$(code_of /seminars/vendor/)" 200
    check "seminars index" eq "$(code_of /seminars/)" 200
    check "README.md not published" test ! -e "$RELEASES/$rel/README.md"
    check "LICENSE.md published" test -f "$RELEASES/$rel/LICENSE.md"
    check "VERSIONS.md not published" test ! -e "$RELEASES/$rel/seminars/vendor/VERSIONS.md"
    check "release modes" eq "$(find "$RELEASES/$rel" \( -type d ! -perm 755 \) -o \( -type f ! -perm 644 \) | wc -l)" 0
}

s06() {
    local before
    before=$(tip)
    check "publish exits 0" code 0 publish
    check "nothing to publish" has "Nothing to publish: the server already has this build."
    check "no push" lacks "Pushing"
    check "server branch unchanged" eq "$(tip)" "$before"
}

s07() {
    local before rel
    before=$(tip)
    echo "body { color: red }" | as_mac tee -a "$COURSE/Atlas/styles.css" > /dev/null
    echo "console.log('new');" | put "$COURSE/Atlas/new.js"
    echo "private ($MARKER)" | put "$COURSE/Atlas/private-notes.txt"
    check "refused" code 1 publish
    check "refusal text" has "Refusing to publish: uncommitted changes in published folders:"
    check "modified file listed" has "  Atlas/styles.css"
    check "untracked file listed" has "  Atlas/new.js"
    check "ignored file not listed" lacks "private-notes.txt"
    check "hint" has "--allow-dirty"
    check "nothing pushed" eq "$(tip)" "$before"
    check "--allow-dirty publishes" code 0 publish --allow-dirty
    check "result line" has "remote: course-deploy: OK course -> "
    rel=$(live)
    check "untracked file live" grep -q "console.log('new');" <(body_of /new.js)
    check "modified file live" grep -q "color: red" <(body_of /styles.css)
    check "ignored file never published" test ! -e "$RELEASES/$rel/private-notes.txt"
    check "ignored file 404" eq "$(code_of /private-notes.txt)" 404
    check "commit marked dirty" grep -q "(dirty)" <(srv_git log -1 --format=%s site)
    check "source.txt dirty" grep -qx "dirty: yes" <(srv_git show site:source.txt)
    commit "Atlas: new script"
}

s08() {
    local m0 old
    m0=$(mails)
    old=$(live)
    marker "atlas v2"
    commit "Atlas v2"
    check "publish exits 0" code 0 publish
    check "result line" has "remote: course-deploy: OK course -> "
    check "new release live" test "$(live)" != "$old"
    check "new content" grep -q "atlas v2" <(body_of /)
    check "no e-mail from a push" eq "$(mails)" "$m0"
}

s09() {
    local m0 later rel mail
    conf <<EOF
course | / | Atlas | now
course | /seminars/vendor/ | $VENDOR | now
course | /seminars/02/ | $S02 | $FUTURE
EOF
    check "publish exits 0" code 0 publish
    check "scheduled line" has "remote: course-deploy: scheduled /seminars/02/ at $FUTURE Moscow time"
    check "not on the site yet" eq "$(code_of /seminars/02/)" 404
    check "schedule shows the countdown" code 0 server schedule
    check "countdown" has_re "^course +/seminars/02/ +$FUTURE +in [0-9]+d [0-9]+h +02\. Convexity, Constraints and Optimality Conditions$"
    m0=$(mails)
    later=$(( $(date +%s) + 3 * 86400 ))
    COURSE_DEPLOY_NOW=$later course-deploy > "$OUT" 2>&1
    sed 's/^/    | /' "$OUT"
    rel=$(live)
    check "published by the timer" eq "$(code_of /seminars/02/)" 200
    check "index.html from main.html" cmp <(body_of /seminars/02/) "$COURSE/$S02/main.html"
    check "main.html kept" eq "$(code_of /seminars/02/main.html)" 200
    for f in figures/fig_sets.pdf handout.tex notes.ipynb README.md "Speech notes.txt" "Checks for class.txt"; do
        check "excluded: $f" test ! -e "$RELEASES/$rel/seminars/02/$f"
    done
    check "seminars index lists it" grep -qF '<a href="02/">02. Convexity, Constraints and Optimality Conditions</a>' <(body_of /seminars/)
    check "and the vendor folder" grep -qF '<a href="vendor/">vendor</a>' <(body_of /seminars/)
    check "exactly one e-mail" eq "$(mails)" "$(( m0 + 1 ))"
    mail=$(last_mail)
    sed 's/^/    > /' "$mail"
    check "subject" grep -qx "Subject: course-deploy: published $(tip | cut -c1-7)" "$mail"
    check "release line" grep -qx "course: $rel (/, /seminars/02/, /seminars/vendor/)" "$mail"
    check "site URL" grep -qx "$URL" "$mail"
    check "source line" grep -q "^Source: [0-9a-f]\{7\} " "$mail"
    COURSE_DEPLOY_NOW=$later course-deploy > "$OUT" 2>&1
    check "the next timer run is silent" test ! -s "$OUT"
    check "and sends nothing" eq "$(mails)" "$(( m0 + 1 ))"
}

s10() {
    conf <<EOF
course | / | Atlas | now
course | /seminars/vendor/ | $VENDOR | now
course | /seminars/02/ | $S02 | $PAST
course | /seminars/03/ | $S03 | now
EOF
    check "publish exits 0" code 0 publish
    check "result line" has_re "^remote: course-deploy: OK course -> .*/seminars/03/"
    check "listing served" eq "$(code_of /seminars/03/)" 200
    body_of /seminars/03/ > "$LOGS/listing.html"
    sed 's/^/    > /' "$LOGS/listing.html"
    check "heading is the title" grep -qF "<h1>03. Gradient Descent and Automatic Differentiation</h1>" "$LOGS/listing.html"
    check "encoded link" grep -qF 'href="sub/figure%20one.txt"' "$LOGS/listing.html"
    check "excluded PDF not listed" lacks "notes.pdf" "$LOGS/listing.html"
    local href n=0
    while read -r href; do
        n=$((n + 1))
        check "link $href works" eq "$(code_of "/seminars/03/$href")" 200
    done < <(grep -o 'href="[^"]*"' "$LOGS/listing.html" | cut -d'"' -f2)
    check "every file listed" eq "$n" 3
    check "seminar 02 still live" eq "$(code_of /seminars/02/)" 200
}

LFS_PATH="$S02/figures/fig_sets.svg"

s25() {
    local path=$LFS_PATH saved=$LOGS/fig_sets.svg
    cp "$COURSE/$path" "$saved"
    check "git stores an LFS pointer" grep -q "^version https://git-lfs" <(mgit cat-file blob "HEAD:$path")
    check "the working tree has the file" grep -q "<svg" "$COURSE/$path"
    check "published byte for byte" cmp <(body_of /seminars/02/figures/fig_sets.svg) "$saved"
    check "bundle blob is the content" cmp <(srv_git cat-file blob "site:entries/seminars--02/figures/fig_sets.svg") "$saved"
    # the real file comes back from the local LFS store however this scenario ends
    trap 'as_mac git -C "$COURSE" lfs checkout "$LFS_PATH" > /dev/null 2>&1' EXIT
    rm "$COURSE/$path"
    as_mac env GIT_LFS_SKIP_SMUDGE=1 git -C "$COURSE" checkout -- "$path"
    check "now a raw pointer" grep -q "^version https://git-lfs" "$COURSE/$path"
    check "git sees no change" eq "$(mgit status --porcelain -- "$S02")" ""
    local before
    before=$(tip)
    check "refused" code 1 publish
    check "clear message" has "$path is a Git LFS pointer, not the file itself; run 'git lfs pull' and try again"
    check "nothing pushed" eq "$(tip)" "$before"
    as_mac git -C "$COURSE" lfs checkout "$path"
    check "restored by git lfs checkout" cmp "$saved" "$COURSE/$path"
    check "and clean" eq "$(mgit status --porcelain -- "$S02")" ""
}

s11() {
    local main="$COURSE/$S02/main.html" saved=$LOGS/main.html before live0
    cp "$main" "$saved"
    as_mac sed -i 's|</body>|<script src="js/missing.js"></script>\n</body>|' "$main"
    commit "Seminar 02: a script that is not there"
    before=$(tip)
    live0=$(live)
    check "refused" code 1 publish
    check "missing asset named" has "ERROR missing file: /seminars/02/main.html -> js/missing.js (no such file)"
    check "no push" lacks "Pushing"
    check "nothing pushed" eq "$(tip)" "$before"

    local list0 meta0
    list0=$(releases)
    meta0=$(find "$RELEASES" -maxdepth 1 -name '*.meta' | sort)
    rm -rf "$HAND"
    as_mac git -c core.sshCommand="$SSH_DEPLOY" clone -q deploy@Main_server:/srv/course-deploy/site.git "$HAND"
    hgit config core.sshCommand "$SSH_DEPLOY"
    as_mac cp "$main" "$HAND/entries/seminars--02/main.html"
    hgit commit -q -am "By hand: the same bundle with the missing script"
    local rc=0
    hgit push origin HEAD:refs/heads/site > "$OUT" 2>&1 || rc=$?
    sed 's/^/    | /' "$OUT"
    check "the push itself succeeds" eq "$rc" 0
    check "server reports FAILED" has "remote: course-deploy: FAILED course: "
    check "for the missing file" has "js/missing.js"
    check "live release unchanged" eq "$(live)" "$live0"
    check "no release left behind" eq "$(releases)" "$list0"
    check "no meta left behind" eq "$(find "$RELEASES" -maxdepth 1 -name '*.meta' | sort)" "$meta0"
    check "no build folder left behind" eq "$(find "$RELEASES" -maxdepth 1 -name '.build-*' | wc -l)" 0

    as_mac cp "$saved" "$main"
    commit "Seminar 02: fixed"
    check "the next publish fast-forwards over the bad bundle" code 0 publish
    check "and reports OK" has "remote: course-deploy: OK"
}

# try_push DESCRIPTION EXPECTED-TEXT REFSPEC...: a rejected push stores nothing
try_push() {
    local what=$1 text=$2 before rc=0
    shift 2
    before=$(tip)
    hgit push origin "$@" > "$OUT" 2>&1 || rc=$?
    sed 's/^/    | /' "$OUT"
    check "$what: push fails" test "$rc" -ne 0
    check "$what: REJECTED" has "remote: course-deploy: REJECTED $text"
    check "$what: branch unchanged" eq "$(tip)" "$before"
}
absent() { ! srv_git cat-file -e "$1" 2> /dev/null; }
reset_hand() { hgit fetch -q origin && hgit reset -q --hard origin/site && hgit clean -qfdx; }

s12() {
    local blob objects_before
    objects_before=$(srv_git count-objects -v | grep -E '^(count|in-pack):')
    reset_hand

    echo "\\documentclass{article} % $MARKER" | put "$HAND/entries/root/x.tex"
    hgit add -A && hgit commit -q -m "tex"
    blob=$(hgit rev-parse HEAD:entries/root/x.tex)
    try_push ".tex" "forbidden file type *.tex: entries/root/x.tex" HEAD:refs/heads/site
    check ".tex blob not stored" absent "$blob"
    reset_hand

    as_mac ln -s index.html "$HAND/entries/root/link.html"
    hgit add -A && hgit commit -q -m "symlink"
    blob=$(hgit rev-parse HEAD:entries/root/link.html)
    try_push "symlink" "symbolic links are not accepted: entries/root/link.html" HEAD:refs/heads/site
    check "symlink blob not stored" absent "$blob"
    reset_hand

    echo "hidden ($MARKER)" | put "$HAND/entries/root/.hidden"
    hgit add -A && hgit commit -q -m "dot-file"
    blob=$(hgit rev-parse HEAD:entries/root/.hidden)
    try_push "dot-file" "hidden files and folders are not accepted: entries/root/.hidden" HEAD:refs/heads/site
    check "dot-file blob not stored" absent "$blob"
    reset_hand

    try_push "other ref" "only the site branch can be pushed: refs/heads/main" HEAD:refs/heads/main
    check "no main branch" absent refs/heads/main
    try_push "the site branch in capitals" "only the site branch can be pushed: refs/heads/SITE" HEAD:refs/heads/SITE
    check "no SITE branch" absent refs/heads/SITE
    try_push "a tag" "only the site branch can be pushed: refs/tags/v1" HEAD:refs/tags/v1
    try_push "deletion" "the site branch cannot be deleted: refs/heads/site" :refs/heads/site

    hgit rm -q publish.conf && hgit commit -q -m "no manifest"
    try_push "missing publish.conf" "missing file: publish.conf" HEAD:refs/heads/site
    reset_hand

    head -c 62914560 /dev/urandom | put "$HAND/entries/root/big.bin"
    hgit add -A && hgit commit -q -m "60 MB"
    blob=$(hgit rev-parse HEAD:entries/root/big.bin)
    try_push "60 MB blob" "file larger than 50 MB" HEAD:refs/heads/site
    check "big blob not stored" absent "$blob"
    reset_hand

    echo "\\section{x} % $MARKER" | put "$HAND/entries/root/Notes.TEX"
    hgit add -A && hgit commit -q -m "upper-case tex"
    blob=$(hgit rev-parse HEAD:entries/root/Notes.TEX)
    try_push "upper-case .TEX" "forbidden file type *.tex: entries/root/Notes.TEX" HEAD:refs/heads/site
    check "Notes.TEX blob not stored" absent "$blob"
    reset_hand

    echo "\\section{x} % $MARKER" | put "$HAND/entries/root/y.tex"
    hgit add -A && hgit commit -q -m "add tex"
    blob=$(hgit rev-parse HEAD:entries/root/y.tex)
    hgit rm -q entries/root/y.tex && hgit commit -q -m "remove tex"
    try_push "tex in an intermediate commit" "forbidden file type *.tex: entries/root/y.tex" HEAD:refs/heads/site
    check "intermediate blob not stored" absent "$blob"
    reset_hand

    check "object count unchanged" eq "$(srv_git count-objects -v | grep -E '^(count|in-pack):')" "$objects_before"
    check "no quarantine left" eq "$(find "$REPO/objects" -maxdepth 1 -name 'tmp_objdir*' | wc -l)" 0
}

s13() {
    local live0 list0 m0 t1 t2 rc
    nginx -s stop
    wait_closed 443
    marker "atlas v3"
    commit "Atlas v3"
    live0=$(live)
    list0=$(releases)
    m0=$(mails)
    check "publish fails" code 1 publish
    check "FAILED line" has "remote: course-deploy: FAILED course: live check failed, switched back to $live0: "
    check "live release unchanged" eq "$(live)" "$live0"
    check "the failed release is gone" eq "$(releases)" "$list0"
    check "no e-mail from a push" eq "$(mails)" "$m0"
    course-deploy > "$OUT" 2>&1
    check "timer: no retry right after the failure" test ! -s "$OUT"
    COURSE_DEPLOY_NOW=$(( $(date +%s) + 840 )) course-deploy > "$OUT" 2>&1
    check "timer: no retry 840 s later, before RETRY_AFTER (900 s)" test ! -s "$OUT"
    check "and no e-mail" eq "$(mails)" "$m0"
    t1=$(( $(date +%s) + 960 ))
    rc=0
    COURSE_DEPLOY_NOW=$t1 course-deploy > "$OUT" 2>&1 || rc=$?
    sed 's/^/    | /' "$OUT"
    check "timer retries after RETRY_AFTER and fails" eq "$rc" 1
    check "live check failed again" has "live check failed"
    check "one failure e-mail" eq "$(mails)" "$(( m0 + 1 ))"
    sed 's/^/    > /' "$(last_mail)"
    check "failure subject" grep -qx "Subject: course-deploy: FAILED $(tip | cut -c1-7)" "$(last_mail)"
    check "journal hint" grep -qx "Details: journalctl -u course-deploy -n 50" "$(last_mail)"
    t2=$(( t1 + 960 ))
    rc=0
    COURSE_DEPLOY_NOW=$t2 course-deploy > "$OUT" 2>&1 || rc=$?
    check "the same failure again" eq "$rc" 1
    check "no second e-mail" eq "$(mails)" "$(( m0 + 1 ))"
    nginx
    wait_port 443
    check "--force succeeds" code 0 server --force
    check "OK line" has "course-deploy: OK course -> "
    check "new content live" grep -q "atlas v3" <(body_of /)
    check "no e-mail from --force" eq "$(mails)" "$(( m0 + 1 ))"
}

# bad_conf LINE MESSAGE: publish.py refuses a publish.conf whose third line is LINE
bad_conf() {
    conf <<EOF
course | / | Atlas | now
course | /seminars/vendor/ | $VENDOR | now
$1
EOF
    echo "  case: $1"
    check "refused: $1" code 1 publish
    check "message: $2" has "$2"
}

s14() {
    local before
    before=$(tip)
    bad_conf "foo | /x/ | Atlas | now" "Deploy/publish.conf line 3: unknown site 'foo' (known sites: course)"
    bad_conf "course | /../ | Atlas | now" "Deploy/publish.conf line 3: path segment '..' in '/../' is not allowed"
    bad_conf "course | /x/ | No Such Folder | now" "No Such Folder (line 3) does not exist"
    bad_conf "course | /x/ | Atlas | 2026-02-30 10:00" \
        "Deploy/publish.conf line 3: no such date or time: '2026-02-30 10:00'"
    bad_conf "course | / | Lecture | now" "Deploy/publish.conf line 3: path / of site course is already listed on line 1"
    bad_conf "course | /x/ | Atlas | now | extra" \
        "Deploy/publish.conf line 3: expected 4 fields separated by '|', found 5"
    check "nothing pushed" eq "$(tip)" "$before"

    local live0
    live0=$(live)
    reset_hand
    as_mac sed -i -E 's/^(course \| \/ \| entries\/root \| now) \| .*$/\1/' "$HAND/publish.conf"
    hgit commit -q -am "By hand: four fields"
    hgit push origin HEAD:refs/heads/site > "$OUT" 2>&1
    sed 's/^/    | /' "$OUT"
    check "hand-made invalid bundle FAILED" has "remote: course-deploy: FAILED bundle "
    check "names the problem" has "expected 5 fields"
    check "live release unchanged" eq "$(live)" "$live0"
    conf <<EOF
course | / | Atlas | now
course | /seminars/vendor/ | $VENDOR | now
course | /seminars/02/ | $S02 | $PAST
course | /seminars/03/ | $S03 | now
EOF
    check "a valid publish recovers" code 0 publish
}

s15() {
    local before
    before=$(tip)
    conf <<EOF
course | / | Atlas | now
course | /js/ | $VENDOR | now
EOF
    check "parent/child collision refused" code 1 publish
    check "collision named" has "course /js/ collides with content published above it"
    conf <<EOF
course | /a--b/ | $VENDOR | now
course | /a/b/ | $S03 | now
EOF
    check "slug collision refused" code 1 publish
    check "slug named" has "line 2: path /a/b/ has the same bundle folder name 'a--b' as course /a--b/ on line 1"
    check "nothing pushed" eq "$(tip)" "$before"
}

s16() {
    conf <<EOF
course | / | Atlas | now
course | /seminars/vendor/ | $VENDOR | now
course | /seminars/02/ | $S02 | $PAST
EOF
    check "publish exits 0" code 0 publish
    check "result line without 03" has_re "^remote: course-deploy: OK course -> [^ ]+ \(/, /seminars/02/, /seminars/vendor/\)$"
    check "gone from the site" eq "$(code_of /seminars/03/)" 404
    check "gone from the release" test ! -e "$RELEASES/$(live)/seminars/03"
    check "gone from the index" lacks "03. Gradient" <(body_of /seminars/)
}

s17() {
    local names previous current i=0 rc
    while (( i < 12 )); do
        mapfile -t names < <(releases)
        current=$(live)
        rc=0
        server rollback course || rc=$?
        if (( rc != 0 )); then
            break
        fi
        i=$((i + 1))
        previous=""
        for n in "${names[@]}"; do
            [[ $n == "$current" ]] && break
            previous=$n
        done
        check "rollback $i goes to the release before $current" eq "$(live)" "$previous"
        if [[ -f $RELEASES/$previous/version.txt ]]; then
            check "rollback $i is served" cmp <(body_of /version.txt) "$RELEASES/$previous/version.txt"
        else
            check "rollback $i is served" eq "$(code_of /)" 200
        fi
    done
    check "rolled back at least twice" test "$i" -ge 2
    check "clear error at the end" has "no release older than $(live) to roll back to"
    check "exit 1 at the end" eq "$rc" 1
    check "--force brings the latest back" code 0 server --force
    check "latest is live" eq "$(live)" "$(releases | tail -n 1)"
}

s18() {
    flock "$DATA/lock" sleep 8 &
    local holder=$! start elapsed
    sleep 1
    marker "atlas v4"
    commit "Atlas v4"
    start=$(date +%s)
    check "publish waits and succeeds" code 0 publish
    elapsed=$(( $(date +%s) - start ))
    echo "  waited ${elapsed}s"
    check "it waited for the lock" test "$elapsed" -ge 5
    check "OK line" has "remote: course-deploy: OK course -> "
    check "new content" grep -q "atlas v4" <(body_of /)
    wait "$holder"
}

s19() {
    conf <<EOF
course | / | Atlas | now
course | /seminars/vendor/ | $VENDOR | now
course | /seminars/02/ | $S02 | $PAST
course | /seminars/03/ | $S03 | $FUTURE
EOF
    check "publish exits 0" code 0 publish
    check "03 scheduled" has "remote: course-deploy: scheduled /seminars/03/ at $FUTURE Moscow time"
    local before after later
    before=$(live; releases; find "$RELEASES" -maxdepth 1 | sort; sha256sum "$DATA"/state/*)
    later=$(( $(date +%s) + 3 * 86400 ))
    COURSE_DEPLOY_NOW=$later course-deploy --dry-run > "$OUT" 2>&1
    sed 's/^/    | /' "$OUT"
    check "would publish the pending change" has_re "course: would publish [0-9]+ files at /, /seminars/02/, /seminars/03/, /seminars/vendor/ \(differs from live\)"
    check "plain dry run: same as live" code 0 server --dry-run
    check "same" has_re "course: would publish [0-9]+ files at /, /seminars/02/, /seminars/vendor/ \(same as live\)"
    check "scheduled entry mentioned" has "course: /seminars/03/ is scheduled for $FUTURE Moscow time"
    after=$(live; releases; find "$RELEASES" -maxdepth 1 | sort; sha256sum "$DATA"/state/*)
    check "nothing changed" eq "$after" "$before"
    check "not on the site" eq "$(code_of /seminars/03/)" 404
}

s20() {
    sed -i 's/^# KEEP_RELEASES="5"$/KEEP_RELEASES="2"/' "$CONF"
    grep -qx 'KEEP_RELEASES="2"' "$CONF"
    local i count
    for i in 1 2 3 4 5; do
        marker "atlas r$i"
        commit "Atlas r$i"
        check "publish $i" code 0 publish
    done
    releases | sed 's/^/    /'
    count=$(releases | wc -l)
    check "at most two releases plus live and previous" test "$count" -le 4
    check "here exactly two: live and previous are the newest" eq "$count" 2
    check "the legacy release is gone" test ! -e "$RELEASES/00000000T000000Z-legacy"
    check "live is the newest" eq "$(live)" "$(releases | tail -n 1)"
    check "a meta for every release" eq "$(find "$RELEASES" -maxdepth 1 -name '*.meta' | wc -l)" "$count"
    sed -i 's/^KEEP_RELEASES="2"$/# KEEP_RELEASES="5"/' "$CONF"
}

s21() {
    local old
    old=$(tip)
    mgit update-ref -d refs/course-deploy/site
    marker "atlas v5"
    commit "Atlas v5"
    check "publish exits 0" code 0 publish
    check "fast-forward over the server tip" eq "$(srv_git rev-parse site^)" "$old"
    check "local ref restored" eq "$(mgit rev-parse refs/course-deploy/site)" "$(tip)"
}

s22() {
    local m0
    check "status" code 0 server status
    check "site line" has "course  $URL"
    check "live release" has_re "^  live release   [0-9]{8}T[0-9]{6}Z-[0-9a-f]{7}"
    check "paths" has "  paths          /, /seminars/02/, /seminars/vendor/"
    check "source" has_re "^  source         [0-9a-f]{7} \(dirty: no\), bundle built "
    check "kept releases" has "  releases kept  "
    check "scheduled entry" has_re "^  scheduled      /seminars/03/ at $FUTURE Moscow time \(in "
    check "last failure" has "last failure: "
    check "timer state" has "timer: systemd is not running here"
    check "schedule" code 0 server schedule
    check "schedule header" has_re "^site +path +publish time +state +title$"
    check "root live" has_re "^course +/ +now +live +Atlas$"
    check "03 counting down" has_re "^course +/seminars/03/ +$FUTURE +in "
    m0=$(mails)
    check "test-notify" code 0 server test-notify
    check "e-mail: OK" has "e-mail: OK"
    check "test message arrived" eq "$(mails)" "$(( m0 + 1 ))"
    check "its subject" grep -qx "Subject: course-deploy: test message" "$(last_mail)"
    sed -i 's/^SMTP_PASSWORD="secret"$/SMTP_PASSWORD="wrong-pass-xyz"/' "$CONF"
    check "wrong password fails" code 1 server test-notify
    check "authentication error" has "e-mail: SMTPAuthenticationError: 535"
    check "password not shown" lacks "wrong-pass-xyz"
    sed -i 's/^SMTP_PASSWORD="wrong-pass-xyz"$/SMTP_PASSWORD="secret"/' "$CONF"
    sed -i 's/^MAIL_TO="evgeny@localhost"$/MAIL_TO=""/' "$CONF"
    check "not configured fails" code 1 server test-notify
    check "says so" has "e-mail: not configured"
    sed -i 's/^MAIL_TO=""$/MAIL_TO="evgeny@localhost"/' "$CONF"
    check "--help" code 0 server --help
    check "usage" has "usage: course-deploy"
    check "--version" code 0 server --version
    check "version" has "course-deploy 1.0.0"
    check "unknown command" code 2 server bogus
    check "unknown site" code 2 server rollback nosuchsite
    check "root required" code 1 as_mac /usr/local/bin/course-deploy status
    check "--help without root" code 0 as_mac /usr/local/bin/course-deploy --help
    local rc=0
    /usr/local/bin/atlas-deploy > "$OUT" 2>&1 || rc=$?
    check "stub exits 1" eq "$rc" 1
    check "stub text" diff "$OUT" - <<'EOF'
atlas-deploy is retired. Publish from the Mac:
  python3 Deploy/publish.py
On the server:
  course-deploy status            what is live
  course-deploy rollback course   go back one release
The old script is kept at /root/atlas-deploy.old
EOF
    check "publish.py --help" code 0 publish --help
    check "publish.py usage" has "--allow-dirty"
    check "publish.py --version" code 0 publish --version
    check "publish.py version" has "publish.py 1.0.0"
    check "publish.py bad option" code 2 publish --bogus
    check "unknown remote" code 1 publish --remote nowhere
    check "remote hint" has "git remote add deploy deploy@Main_server:/srv/course-deploy/site.git"
    check "ssh command hint" has 'git config core.sshCommand "ssh -i ~/.ssh/course_deploy -o IdentitiesOnly=yes"'
}

s23() {
    rm -rf "${COURSE:?}/Atlas" "${COURSE:?}/$WEB_REL"
    cp -r "$SRC/Atlas" "$COURSE/Atlas"
    cp -r "$SRC/$WEB_REL" "$COURSE/$WEB_REL"
    chown -R mac:mac "$COURSE/Atlas" "$COURSE/Seminars"
    # first seminar 01 released and 02 still ahead: the landing page must not bring 02 along
    local released="2026-09-01 18:10"
    # every seminar line of the real publish.conf, commented or filled in, gets a released date
    sed -E "s/^(# )?(course \| \/seminars\/[0-9]{2}\/ \| [^|]*) \| .*\$/\2 | $released/" \
        "$SRC/Deploy/publish.conf" > "$LOGS/publish.conf"
    sed "/\/seminars\/02\//s/$released\$/$FUTURE/" "$LOGS/publish.conf" | conf
    grep -v '^#' "$COURSE/Deploy/publish.conf" | sed '/^$/d; s/^/    /'
    commit "Real content"
    check "publish with 02 ahead" code 0 publish
    check "02 scheduled" has "remote: course-deploy: scheduled /seminars/02/ at $FUTURE Moscow time"
    check "landing page at /seminars/" cmp <(body_of /seminars/) "$SRC/$WEB_REL/index.html"
    check "/seminars redirects to /seminars/" eq "$(code_of /seminars)" 301
    check "01 live" eq "$(code_of /seminars/01/)" 200
    check "02 not on the site" eq "$(code_of /seminars/02/main.html)" 404
    check "02 not in the release" test ! -e "$RELEASES/$(live)/seminars/02"
    check "only index.html from web/ itself" eq "$(find "$RELEASES/$(live)/seminars" -maxdepth 1 -type f -printf '%f\n')" index.html
    conf < "$LOGS/publish.conf"
    grep -v '^#' "$COURSE/Deploy/publish.conf" | sed '/^$/d; s/^/    /'
    check "publish exits 0" code 0 publish
    check "OK line" has "remote: course-deploy: OK course -> "
    grep 'warning broken link' "$OUT" | sed -E 's/^ *(remote: *)?//' | sort -u > "$LOGS/real-link-warnings.txt" || true
    echo "  link warnings (Mac and server):"
    sed 's/^/    /' "$LOGS/real-link-warnings.txt"
    local rel n
    rel=$(live)
    while read -r n; do
        check "seminar $n" eq "$(code_of "/seminars/$n/")" 200
        check "seminar $n theory" eq "$(code_of "/seminars/$n/theory.html")" 200
        check "seminar $n cheat sheet" eq "$(code_of "/seminars/$n/cheatsheet.html")" 200
        check "seminar $n entry page is main.html" cmp <(body_of "/seminars/$n/") "$SRC/$WEB_REL/$n/main.html"
    done < <(grep -oE '^course \| /seminars/[0-9]{2}/' "$COURSE/Deploy/publish.conf" | grep -oE '[0-9]{2}')
    check "landing page still at /seminars/" cmp <(body_of /seminars/) "$SRC/$WEB_REL/index.html"
    check "atlas links to /seminars/" grep -q 'id="seminars-link" href="/seminars/"' <(body_of /)
    check "no link warnings" test ! -s "$LOGS/real-link-warnings.txt"
    check "shared framework" eq "$(code_of /seminars/shared/js/core.js)" 200
    check "KaTeX" eq "$(code_of /seminars/shared/vendor/katex/katex.min.js)" 200
    check "atlas" grep -q "Optimization Atlas" <(body_of /)
    check "an SVG byte for byte" cmp <(body_of /seminars/02/figures/fig_sets.svg) "$SRC/$WEB_REL/02/figures/fig_sets.svg"
    check "VERSIONS.md not published" test ! -e "$RELEASES/$rel/seminars/shared/vendor/VERSIONS.md"
    check "README.md not published" test ! -e "$RELEASES/$rel/README.md"
    check "licenses published" test -f "$RELEASES/$rel/seminars/shared/vendor/katex/LICENSE"
    echo "  files in the release: $(find "$RELEASES/$rel" -type f | wc -l)"
}

s05() {
    local commit bad=0 top path base
    for commit in $(srv_git rev-list --all); do
        top=$(srv_git ls-tree --name-only "$commit" | sort | tr '\n' ' ')
        if [[ $top != "entries exclude.txt publish.conf source.txt " ]]; then
            echo "    $commit top level: $top"
            bad=1
        fi
        while IFS= read -r -d '' path; do
            base=${path##*/}
            case $path in
                *theory/* | *checks/* | *Lecture* | *Ignatov* | *Matveeva* | *Kasimov* | *Documents* | *CLAUDE.md*)
                    echo "    $commit: $path"; bad=1 ;;
            esac
            case $base in
                LICENSE* | COPYING* | NOTICE*) ;;
                *.tex | *.pdf | *.ipynb | *.md) echo "    $commit: $path"; bad=1 ;;
            esac
        done < <(srv_git ls-tree -r -z --name-only "$commit")
    done
    echo "  commits checked: $(srv_git rev-list --all | wc -l)"
    check "only the bundle files, nothing forbidden, in any commit" eq "$bad" 0
    check "no object holds never-published content" eq "$(srv_git cat-file --batch-all-objects --batch | grep -ac "$MARKER")" 0
    check "nothing never-published on disk" eq "$(grep -rlF "$MARKER" "$DATA" /var/www 2> /dev/null | wc -l)" 0
}

s24() {
    local py
    check "shellcheck" shellcheck "$SRC/Deploy/course-deploy-kit/install.sh" "$SRC/Deploy/course-deploy-kit/pre-receive" \
        "$SRC/Deploy/course-deploy-kit/post-receive" "$SRC/Deploy/course-deploy-kit/atlas-deploy" \
        "$SRC/Deploy/tests/run-tests.sh" "$SRC/Deploy/tests/in-container.sh"
    local sources
    mapfile -t sources < <(find "$SRC/Deploy" -name '*.py' | sort)
    py=$(mktemp -d)
    check "py_compile" python3 - "$py" "$SRC/Deploy/course-deploy-kit/course-deploy" "${sources[@]}" <<'EOF'
import os, py_compile, sys
out = sys.argv[1]
for i, path in enumerate(sys.argv[2:]):
    py_compile.compile(path, cfile=os.path.join(out, f"{i}.pyc"), doraise=True)
    print("    compiled", path)
EOF
    check "systemd-analyze verify" systemd-analyze verify /etc/systemd/system/course-deploy.service \
        /etc/systemd/system/course-deploy.timer
    check "visudo" visudo -cf "$SRC/Deploy/course-deploy-kit/sudoers"
    check "forbidden.txt covered by exclude.txt" python3 - <<'EOF'
import sys
sys.path.insert(0, "/repo/Deploy/course-deploy-kit")
from course_deploy import filters
exclude = open("/repo/Deploy/exclude.txt").read()
rules = filters.Rules.with_builtin(exclude)
listed = set(filters.parse_patterns(exclude))
ok = True
for pattern in filters.parse_patterns(open("/repo/Deploy/course-deploy-kit/forbidden.txt").read()):
    sample = pattern.replace("*", "x")
    if pattern not in listed or rules.keeps(sample) or rules.keeps("a/b/" + sample):
        print("    not covered:", pattern)
        ok = False
sys.exit(0 if ok else 1)
EOF
}

# ------------------------------------------------------------------------------------- main

echo "Setting up the server replica..."
setup_tls || die "certificates"
setup_nginx || die "nginx: $(cat "$LOGS/nginx-t.log")"
setup_old_site || die "old site"
setup_sshd || die "sshd"
setup_smtp || die "mock SMTP"
setup_mac || die "mac user"
setup_fixture || die "fixture repository"
upload_kit || die "kit upload"
setup_install || die "install.sh"
echo "Running the scenarios..."

run 1 "install.sh twice, invalid keys, AllowUsers warning" s01
run 2 "the deploy account" s02
run 3 "publish.py --dry-run" s03
run 4 "first publish" s04
run 6 "publish again, nothing changed" s06
run 7 "uncommitted and untracked files, --allow-dirty" s07
run 8 "atlas change" s08
run 9 "seminar with a future time, timer publication" s09
run 10 "seminar folder without HTML" s10
run 25 "LFS-tracked file: content published, pointer refused" s25
run 11 "missing asset" s11
run 12 "hand-made pushes rejected" s12
run 13 "nginx stopped during a publish" s13
run 14 "invalid publish.conf" s14
run 15 "parent/child and slug collisions" s15
run 16 "a seminar line removed" s16
run 17 "rollback" s17
run 18 "publish while a timer run holds the lock" s18
run 19 "course-deploy --dry-run with a pending change" s19
run 20 "KEEP_RELEASES=2, five publishes" s20
run 21 "local refs/course-deploy/site deleted" s21
run 22 "status, schedule, test-notify, --help, the stub" s22
run 23 "real content" s23
run 5 "contents of site.git, all commits" s05
run 24 "static checks" s24

echo
echo "Summary:"
failures=0
for n in $(printf '%s\n' "${!RESULTS[@]}" | sort -n); do
    printf '  %2s  %s\n' "$n" "${RESULTS[$n]}"
    [[ ${RESULTS[$n]} == PASS* ]] || failures=$((failures + 1))
done
if [[ -s $LOGS/real-link-warnings.txt ]]; then
    echo
    echo "Link warnings with the real content (scenario 23):"
    sed 's/^/  /' "$LOGS/real-link-warnings.txt"
fi
echo
if (( failures )); then
    echo "$failures scenario(s) failed."
    exit 1
fi
echo "All ${#RESULTS[@]} scenarios passed."
